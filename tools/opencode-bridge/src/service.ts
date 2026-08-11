import { execFile } from "node:child_process";
import { closeSync, existsSync, openSync, readFileSync, unlinkSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { CommandExecutor, type GitState } from "./commands.js";
import type { BridgeConfig } from "./config.js";
import { GitHubAppAuth } from "./github-auth.js";
import { GitHubClient, GitHubCommandPoller, GitHubControlLoop, GitHubOutbox } from "./github.js";
import { Manifest } from "./manifest.js";
import { OpenCodeClient } from "./opencode.js";
import { OperationPolicy, PublicProjection } from "./projection.js";
import { RecoveryCoordinator, type PersistedOpenCodeEvent } from "./recovery.js";
import { BridgeState } from "./state.js";
import type { JsonValue, TaskSession } from "./types.js";
import { ensurePrivateDirectory, errorMessage, sleep } from "./util.js";

const labelDefinitions = [
  ["bridge-status:active", "fbca04", "Bridge command or task is active"],
  ["bridge-status:complete", "0e8a16", "Bridge command completed"],
  ["bridge-status:blocked", "b60205", "Bridge command failed or is indeterminate"],
] as const;

function configuredLabels(config: BridgeConfig): ReadonlyArray<readonly [string, string, string]> {
  return [[config.github.controlLabel, "5319e7", "Outbound OpenCode bridge control issue"], ...labelDefinitions];
}

function execute(command: string, args: string[], cwd: string, timeout = 60_000): Promise<{ stdout: string; stderr: string }> {
  return new Promise((resolve, reject) => {
    execFile(command, args, { cwd, timeout, maxBuffer: 2 * 1024 * 1024 }, (error, stdout, stderr) => {
      if (error) {
        const detail = String(stderr || stdout).trim();
        reject(new Error(detail ? `${error.message}: ${detail}` : error.message));
        return;
      }
      resolve({ stdout: String(stdout), stderr: String(stderr) });
    });
  });
}

async function gitOutput(repositoryRoot: string, args: string[]): Promise<string> {
  return (await execute("git", args, repositoryRoot)).stdout.trim();
}

export async function synchronizedGitState(config: BridgeConfig): Promise<GitState> {
  await execute("git", ["fetch", "--no-tags", "origin", "developer"], config.repositoryRoot);
  const [head, developerSha, ref, workingTree] = await Promise.all([
    gitOutput(config.repositoryRoot, ["rev-parse", "HEAD"]),
    gitOutput(config.repositoryRoot, ["rev-parse", "origin/developer"]),
    gitOutput(config.repositoryRoot, ["branch", "--show-current"]),
    gitOutput(config.repositoryRoot, ["status", "--porcelain"]),
  ]);
  if (head !== developerSha) throw new Error("Local HEAD and origin/developer are not synchronized");
  if (ref !== "developer") throw new Error("The OpenCode bridge must run from the developer checkout");
  return { developerSha, ref, clean: workingTree.length === 0 };
}

async function verifyRepositoryIdentity(config: BridgeConfig): Promise<void> {
  const [remote, head, developerSha, ref] = await Promise.all([
    gitOutput(config.repositoryRoot, ["remote", "get-url", "origin"]),
    gitOutput(config.repositoryRoot, ["rev-parse", "HEAD"]),
    gitOutput(config.repositoryRoot, ["rev-parse", "origin/developer"]),
    gitOutput(config.repositoryRoot, ["branch", "--show-current"]),
  ]);
  const normalized = remote.replace(/\.git$/, "").replace(/\\/g, "/");
  const expected = `/${config.github.owner}/${config.github.repository}`.toLowerCase();
  const sshExpected = `:${config.github.owner}/${config.github.repository}`.toLowerCase();
  if (!normalized.toLowerCase().endsWith(expected) && !normalized.toLowerCase().endsWith(sshExpected)) {
    throw new Error("Configured GitHub repository does not match the checkout origin");
  }
  if (ref !== "developer" || head !== developerSha) throw new Error("Checkout must be on synchronized developer for bridge bootstrap");
}

function promotion(config: BridgeConfig): (approvedSha: string) => Promise<JsonValue> {
  return async (approvedSha) => {
    const result = await execute(join(config.repositoryRoot, "scripts", "promote-developer-to-main.sh"), [approvedSha], config.repositoryRoot, 600_000);
    return { status: "promotion-command-completed", stdout: result.stdout, stderr: result.stderr };
  };
}

class ServiceLock {
  private readonly path: string;
  private readonly marker: string;
  private released = false;

  constructor(stateFile: string) {
    this.path = `${stateFile}.lock`;
    this.marker = `${process.pid}\n`;
    ensurePrivateDirectory(dirname(this.path));
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const descriptor = openSync(this.path, "wx", 0o600);
        try {
          writeFileSync(descriptor, this.marker);
        } finally {
          closeSync(descriptor);
        }
        return;
      } catch (error) {
        if (!existsSync(this.path)) throw error;
        const pid = Number(readFileSync(this.path, "utf8").trim());
        let alive = false;
        if (Number.isSafeInteger(pid) && pid > 0) {
          try {
            process.kill(pid, 0);
            alive = true;
          } catch (signalError) {
            alive = (signalError as NodeJS.ErrnoException).code === "EPERM";
          }
        }
        if (alive) throw new Error(`Bridge service is already running as process ${pid}`);
        unlinkSync(this.path);
      }
    }
    throw new Error("Could not acquire the bridge service lock");
  }

  release(): void {
    if (this.released) return;
    this.released = true;
    try {
      if (readFileSync(this.path, "utf8") === this.marker) unlinkSync(this.path);
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
    }
  }
}

function github(config: BridgeConfig, state: BridgeState): GitHubClient {
  const tokens = new GitHubAppAuth({
    appId: config.github.appId,
    installationId: config.github.installationId,
    repository: config.github.repository,
    privateKey: config.github.privateKey,
    apiBaseUrl: config.github.apiBaseUrl,
  });
  return new GitHubClient({
    owner: config.github.owner,
    repository: config.github.repository,
    tokens,
    state,
    apiBaseUrl: config.github.apiBaseUrl,
  });
}

function opencode(config: BridgeConfig, manifest: Manifest): OpenCodeClient {
  return new OpenCodeClient({
    baseUrl: config.opencode.baseUrl,
    username: config.opencode.username,
    password: config.opencode.password,
    directory: config.repositoryRoot,
    manifest,
  });
}

function visibleEvent(event: PersistedOpenCodeEvent): boolean {
  return /(?:permission|question)|session\.(?:idle|error)/i.test(event.eventType);
}

export class BridgeService {
  private readonly config: BridgeConfig;
  private readonly signal: AbortSignal;
  private readonly lock: ServiceLock;
  private readonly state: BridgeState;
  private readonly client: OpenCodeClient;
  private readonly projection: PublicProjection;
  private readonly recovery: RecoveryCoordinator;
  private readonly executor: CommandExecutor;
  private readonly control: GitHubControlLoop;
  private readonly sessionRuns = new Map<string, Promise<void>>();

  constructor(config: BridgeConfig, signal: AbortSignal) {
    this.config = config;
    this.signal = signal;
    this.lock = new ServiceLock(config.stateFile);
    this.state = new BridgeState(config.stateFile);
    const manifest = Manifest.load(config.manifestFile);
    this.client = opencode(config, manifest);
    this.projection = new PublicProjection({ state: this.state, privateRoots: config.privateRoots });
    const githubClient = github(config, this.state);
    this.recovery = new RecoveryCoordinator({
      client: this.client,
      state: this.state,
      onPersistedEvent: (event) => this.publishEvent(event),
      onError: (error) => this.state.setMeta("service.last_error", this.projection.safeText(errorMessage(error))),
    });
    this.executor = new CommandExecutor({
      client: this.client,
      state: this.state,
      recovery: this.recovery,
      projection: this.projection,
      operationPolicy: new OperationPolicy({
        manifest,
        state: this.state,
        allowedMutations: config.policy.allowedMutations,
        allowedLocalSecretOperations: config.policy.allowedLocalSecretOperations,
        resolveSecret: config.policy.resolveSecret,
      }),
      instanceId: config.instanceId,
      signal,
      ptyEnabled: config.policy.ptyEnabled,
      currentGitState: () => synchronizedGitState(config),
      ...(config.policy.promotionEnabled ? { runPromotion: promotion(config) } : {}),
      onSessionStarted: (taskId) => this.startSessionRecovery(taskId),
    });
    const poller = new GitHubCommandPoller({
      github: githubClient,
      state: this.state,
      allowedAuthors: config.github.allowedAuthors,
      label: config.github.controlLabel,
    });
    const outbox = new GitHubOutbox({ github: githubClient, state: this.state, commentAuthor: config.github.commentAuthor });
    this.control = new GitHubControlLoop({
      poller,
      outbox,
      state: this.state,
      activeIntervalMs: config.github.activeIntervalMs,
      idleIntervalMs: config.github.idleIntervalMs,
      onError: (error) => this.state.setMeta("service.last_error", this.projection.safeText(errorMessage(error))),
    });
  }

  private publishEvent(event: PersistedOpenCodeEvent): void {
    if (!event.taskId || !visibleEvent(event)) return;
    const issue = this.state.issueForTask(event.taskId);
    if (issue === undefined) return;
    const projected = this.projection.project({ type: event.eventType, event: event.payload }, event.taskId);
    this.state.enqueue(`opencode-event:${event.eventId}`, "issue-comment", issue, {
      body: `OpenCode task event:\n\n${this.projection.comment(projected)}`,
    });
  }

  private startSessionRecovery(taskId: string): void {
    if (this.sessionRuns.has(taskId) || this.signal.aborted) return;
    const session = this.state.getTaskSession(taskId);
    if (!session) return;
    const run = this.recovery.runSession(session, this.signal).finally(() => this.sessionRuns.delete(taskId));
    this.sessionRuns.set(taskId, run);
  }

  async run(): Promise<void> {
    this.state.setMeta("service.pid", String(process.pid));
    this.state.setMeta("service.started_at", String(Date.now()));
    this.state.setMeta("service.instance", this.config.instanceId);
    const heartbeat = setInterval(() => this.state.setMeta("service.heartbeat_at", String(Date.now())), 5_000);
    try {
      try {
        const compatibility = await this.client.compatibility(this.client.manifest);
        this.state.recordCompatibility(this.config.instanceId, compatibility);
      } catch (error) {
        this.state.setMeta("service.last_error", this.projection.safeText(errorMessage(error)));
      }
      this.executor.requeueCompletedResults();
      this.executor.ptys.restore();
      for (const session of this.state.listTaskSessions()) this.startSessionRecovery(session.taskId);
      await Promise.all([
        this.recovery.run(this.signal),
        this.control.run(this.signal, (commands) => this.executor.executeAll(commands)),
      ]);
    } finally {
      clearInterval(heartbeat);
      this.state.setMeta("service.stopped_at", String(Date.now()));
      await Promise.allSettled(this.sessionRuns.values());
      this.state.close();
      this.lock.release();
    }
  }
}

export interface BridgeCheck {
  instance: string;
  repository: string;
  opencodeCompatible: boolean;
  opencodeVersion: string;
  githubAccessible: boolean;
  labels: Record<string, "present" | "created" | "missing">;
  stateReady: boolean;
}

export async function checkBridge(config: BridgeConfig, mutate: boolean): Promise<BridgeCheck> {
  await verifyRepositoryIdentity(config);
  const manifest = Manifest.load(config.manifestFile);
  const client = opencode(config, manifest);
  const compatibility = await client.compatibility(manifest);
  await client.request("project.current");

  const stateStub = {} as BridgeState;
  const githubClient = github(config, stateStub);
  await githubClient.repositoryInfo();
  const labels: BridgeCheck["labels"] = {};
  for (const [name, color, description] of configuredLabels(config)) {
    const present = await githubClient.ensureLabel(name, color, description, true);
    if (present) labels[name] = "present";
    else if (!mutate) labels[name] = "missing";
    else {
      await githubClient.ensureLabel(name, color, description, false);
      labels[name] = "created";
      await sleep(1_000);
    }
  }

  let stateReady = existsSync(config.stateFile);
  if (mutate) {
    const state = new BridgeState(config.stateFile);
    state.setMeta("instance", config.instanceId);
    state.close();
    stateReady = true;
  }
  return {
    instance: config.instanceId,
    repository: `${config.github.owner}/${config.github.repository}`,
    opencodeCompatible: compatibility.compatible,
    opencodeVersion: compatibility.runningVersion,
    githubAccessible: true,
    labels,
    stateReady,
  };
}

export function bridgeStatus(config: BridgeConfig): JsonValue {
  if (!existsSync(config.stateFile)) return { instance: config.instanceId, running: false, initialized: false };
  const state = new BridgeState(config.stateFile);
  try {
    const pid = Number(state.getMeta("service.pid"));
    let running = false;
    if (Number.isSafeInteger(pid) && pid > 0) {
      try {
        process.kill(pid, 0);
        running = true;
      } catch (error) {
        running = (error as NodeJS.ErrnoException).code === "EPERM";
      }
    }
    const compatibility = state.compatibility(config.instanceId);
    return {
      instance: config.instanceId,
      repository: `${config.github.owner}/${config.github.repository}`,
      initialized: true,
      running,
      pid: Number.isSafeInteger(pid) ? pid : null,
      heartbeat_at: Number(state.getMeta("service.heartbeat_at")) || null,
      compatibility: compatibility ? { compatible: compatibility.compatible, running_version: compatibility.runningVersion, checked_at: compatibility.checkedAt } : null,
      pending_commands: state.listCommands(["accepted", "applying"]).length,
      pending_outbox: state.pendingOutbox(Date.now() + 365 * 24 * 60 * 60 * 1_000, 10_000).length,
    };
  } finally {
    state.close();
  }
}

export function taskSession(config: BridgeConfig, taskId: string): TaskSession | undefined {
  if (!existsSync(config.stateFile)) return undefined;
  const state = new BridgeState(config.stateFile);
  try {
    return state.getTaskSession(taskId);
  } finally {
    state.close();
  }
}
