import { execFile } from "node:child_process";
import { existsSync, lstatSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { OpenCodeClient } from "./opencode.js";
import { IndeterminateRequestError } from "./requests.js";
import { BridgeState } from "./state.js";
import type { JsonValue, StoredRequest } from "./types.js";
import { asRecord, ensurePrivateDirectory, errorMessage, isRecord } from "./util.js";

const scoutAgent = "repository-scout";
const exactSha = /^[0-9a-f]{40}$/;
const allowedTools = new Set(["read", "glob", "grep", "lsp"]);
const deniedMcpResourceTools = ["list_mcp_resources", "list_mcp_resource_templates", "read_mcp_resource"] as const;
const deniedPermissions = [
  "edit", "bash", "task", "skill", "webfetch", "websearch", "question",
  "todowrite", "external_directory",
] as const;

function execute(command: string, args: string[], cwd: string): Promise<string> {
  return new Promise((resolvePromise, reject) => {
    execFile(command, args, { cwd, timeout: 60_000, maxBuffer: 2 * 1024 * 1024 }, (error, stdout, stderr) => {
      if (error) {
        const detail = String(stderr || stdout).trim();
        reject(new Error(detail ? `${error.message}: ${detail}` : error.message));
        return;
      }
      resolvePromise(String(stdout).trim());
    });
  });
}

function wildcard(pattern: string, value: string): boolean {
  const escaped = pattern.replace(/[.+^${}()|[\]\\]/g, "\\$&").replaceAll("*", ".*").replaceAll("?", ".");
  return new RegExp(`^${escaped}$`).test(value);
}

function permissionAction(
  rules: JsonValue,
  permission: string,
  subject = "bridge-policy-probe",
): string | undefined {
  if (Array.isArray(rules)) {
    let action: string | undefined;
    for (const value of rules) {
      if (!isRecord(value)) continue;
      const name = typeof value.permission === "string" ? value.permission : "";
      const pattern = typeof value.pattern === "string" ? value.pattern : "*";
      if ((name === "*" || name === permission) && wildcard(pattern, subject) && typeof value.action === "string") {
        action = value.action;
      }
    }
    return action;
  }
  if (!isRecord(rules)) return undefined;
  const value = rules[permission] ?? rules["*"];
  if (typeof value === "string") return value;
  if (!isRecord(value)) return undefined;
  let action: string | undefined;
  for (const [pattern, candidate] of Object.entries(value)) {
    if (wildcard(pattern, subject) && typeof candidate === "string") action = candidate;
  }
  return action;
}

function agents(value: JsonValue | undefined): JsonValue[] {
  if (Array.isArray(value)) return value;
  if (isRecord(value) && Array.isArray(value.items)) return value.items;
  throw new TypeError("OpenCode agent inventory is not an array");
}

function toolIds(value: JsonValue | undefined): string[] {
  if (!Array.isArray(value) || value.some((entry) => typeof entry !== "string" || entry.length === 0)) {
    throw new TypeError("OpenCode tool inventory is not an array of names");
  }
  return value as string[];
}

function toolPermission(tool: string): string {
  if (["edit", "write", "apply_patch"].includes(tool)) return "edit";
  if (["list_mcp_resources", "list_mcp_resource_templates", "read_mcp_resource"].includes(tool)) return "read";
  return tool;
}

function toolDisabled(rules: JsonValue, tool: string): boolean {
  const permission = toolPermission(tool);
  if (Array.isArray(rules)) {
    let action: string | undefined;
    let pattern: string | undefined;
    for (const value of rules) {
      if (!isRecord(value) || typeof value.permission !== "string") continue;
      if (!wildcard(value.permission, permission)) continue;
      if (typeof value.action === "string") action = value.action;
      if (typeof value.pattern === "string") pattern = value.pattern;
    }
    return action === "deny" && pattern === "*";
  }
  return permissionAction(rules, permission) === "deny";
}

function representative(pattern: string): string {
  return pattern.replaceAll("*", "bridge-policy-probe").replaceAll("?", "x");
}

export function assertScoutAgentContract(agentValue: JsonValue | undefined, toolValue: JsonValue | undefined): void {
  const candidate = agents(agentValue).find((entry) => isRecord(entry) && entry.name === scoutAgent);
  if (!candidate || !isRecord(candidate)) throw new Error(`OpenCode agent ${scoutAgent} is unavailable in the exact-ref workspace`);
  if (candidate.mode !== "primary") throw new Error("Repository Scout must be a directly selectable primary agent");
  const model = asRecord(candidate.model, "Repository Scout model");
  if (model.providerID !== "openai" || model.modelID !== "gpt-5.6-luna") {
    throw new Error("Repository Scout model must resolve to openai/gpt-5.6-luna");
  }
  const options = asRecord(candidate.options, "Repository Scout options");
  if (options.reasoningEffort !== "high") throw new Error("Repository Scout reasoning effort must resolve to high");

  const permission = candidate.permission as JsonValue;
  if (permissionAction(permission, "*", "bridge-policy-probe") !== "deny") {
    throw new Error("Repository Scout must retain a wildcard deny for unlisted and dynamic tools");
  }
  const inventory = toolIds(toolValue);
  for (const name of inventory) {
    const disabled = toolDisabled(permission, name);
    if (!allowedTools.has(name) && !disabled) throw new Error(`Repository Scout exposes forbidden tool ${name}`);
  }
  for (const required of ["read", "glob", "grep"]) {
    if (!inventory.includes(required) || toolDisabled(permission, required)) {
      throw new Error(`Repository Scout must expose read-only tool ${required}`);
    }
  }
  for (const name of deniedPermissions) {
    const subject = name === "external_directory" ? "/outside/scout-workspace" : "bridge-policy-probe";
    const action = permissionAction(permission, name, subject);
    if (action !== undefined && action !== "deny") {
      throw new Error(`Repository Scout permission ${name} must resolve to deny`);
    }
    if (name === "external_directory" && action !== "deny") {
      throw new Error("Repository Scout external-directory permission must resolve to deny");
    }
  }
  if (Array.isArray(permission)) {
    for (const rule of permission) {
      if (!isRecord(rule) || rule.permission !== "external_directory" || rule.action !== "allow"
        || typeof rule.pattern !== "string") continue;
      const subject = representative(rule.pattern);
      if (permissionAction(permission, "external_directory", subject) === "allow"
        && permissionAction(permission, "read", subject) !== "deny") {
        throw new Error(`Repository Scout can read an allowed external path: ${rule.pattern}`);
      }
    }
  }
}

export class ScoutWorkspaceManager {
  readonly root: string;
  private readonly repositoryRoot: string;
  private readonly pending = new Map<string, Promise<string>>();
  private management: Promise<void> = Promise.resolve();

  constructor(repositoryRoot: string, stateFile: string) {
    this.repositoryRoot = resolve(repositoryRoot);
    this.root = join(dirname(stateFile), "scout-worktrees");
  }

  private async create(refSha: string): Promise<string> {
    if (!exactSha.test(refSha)) throw new TypeError("Scout ref must be an exact lowercase commit SHA");
    ensurePrivateDirectory(this.root);
    await execute("git", ["fetch", "--no-tags", "origin", "developer"], this.repositoryRoot);
    await execute("git", ["cat-file", "-e", `${refSha}^{commit}`], this.repositoryRoot);
    try {
      await execute("git", ["merge-base", "--is-ancestor", refSha, "refs/remotes/origin/developer"], this.repositoryRoot);
    } catch {
      throw new Error("Scout ref is not present in the locally synchronized origin/developer history");
    }
    const workspace = join(this.root, refSha);
    if (!existsSync(workspace)) {
      await execute("git", ["worktree", "add", "--detach", workspace, refSha], this.repositoryRoot);
    } else {
      const entry = lstatSync(workspace);
      if (!entry.isDirectory() || entry.isSymbolicLink()) throw new Error("Scout workspace path is not a regular directory");
    }
    const [head, status] = await Promise.all([
      execute("git", ["rev-parse", "HEAD"], workspace),
      execute("git", ["status", "--porcelain", "--untracked-files=all"], workspace),
    ]);
    if (head !== refSha) throw new Error("Scout workspace does not match the requested exact ref");
    if (status.length > 0) throw new Error("Scout workspace is not clean; it will not be reused");
    return workspace;
  }

  prepare(refSha: string): Promise<string> {
    const existing = this.pending.get(refSha);
    if (existing) return existing;
    const prepared = this.management.then(() => this.create(refSha));
    this.management = prepared.then(() => undefined, () => undefined);
    void prepared.then(() => this.pending.delete(refSha), () => this.pending.delete(refSha));
    this.pending.set(refSha, prepared);
    return prepared;
  }
}

export interface ScoutRuntimeOptions {
  state: BridgeState;
  workspaces: ScoutWorkspaceManager;
  clientFor: (workspace: string) => OpenCodeClient;
  onSessionStarted?: (requestId: string) => void;
}

function text(input: Record<string, JsonValue>, name: string): string {
  const value = input[name];
  if (typeof value !== "string" || value.trim().length === 0) throw new TypeError(`Scout ${name} is required`);
  return value.trim();
}

function sessionId(value: JsonValue | undefined): string {
  if (!isRecord(value) || typeof value.id !== "string" || value.id.length === 0) {
    throw new TypeError("OpenCode Scout session creation did not return an ID");
  }
  return value.id;
}

function prompt(request: StoredRequest, refSha: string): string {
  const input = request.envelope.arguments;
  return [
    `Scout request: ${request.requestId}`,
    `Task: ${request.taskId}`,
    `Exact ref: ${refSha}`,
    `Focused question: ${text(input, "question")}`,
    `Bounded scope: ${text(input, "scope")}`,
    `Expected evidence: ${text(input, "expected_evidence")}`,
    "",
    "Return only concise facts, exact paths/symbols/lines where useful, and explicit unknowns.",
    "Do not make an orchestration decision or implementation recommendation.",
  ].join("\n");
}

export class ScoutRuntime {
  private readonly state: BridgeState;
  private readonly workspaces: ScoutWorkspaceManager;
  private readonly clientFor: (workspace: string) => OpenCodeClient;
  private readonly onSessionStarted: ((requestId: string) => void) | undefined;

  constructor(options: ScoutRuntimeOptions) {
    this.state = options.state;
    this.workspaces = options.workspaces;
    this.clientFor = options.clientFor;
    this.onSessionStarted = options.onSessionStarted;
  }

  async start(request: StoredRequest): Promise<JsonValue> {
    const refSha = text(request.envelope.arguments, "ref");
    const workspace = await this.workspaces.prepare(refSha);
    const client = this.clientFor(workspace);
    const compatibility = await client.compatibility(client.manifest);
    if (!compatibility.compatible) throw new Error("OpenCode compatibility drift blocks Scout start");
    const [agentInventory, availableTools] = await Promise.all([
      client.request("app.agents"),
      client.request("tool.ids"),
    ]);
    assertScoutAgentContract(agentInventory, availableTools);

    const created = await client.request("session.create", {
      body: { title: `Repository Scout ${request.requestId}`, agent: scoutAgent },
    });
    const internalSessionId = sessionId(created);
    this.state.mapScoutSession({
      requestId: request.requestId,
      taskId: request.taskId,
      sessionId: internalSessionId,
      issueNumber: request.issueNumber,
      refSha,
      workspacePath: workspace,
    });
    try {
      await client.request("session.prompt_async", {
        path: { sessionID: internalSessionId },
        body: {
          agent: scoutAgent,
          tools: Object.fromEntries(deniedMcpResourceTools.map((name) => [name, false])),
          parts: [{ type: "text", text: prompt(request, refSha) }],
        },
      });
    } catch (error) {
      throw new IndeterminateRequestError(
        `Scout session was created, but prompt delivery was not proven: ${errorMessage(error)}`,
      );
    }
    this.onSessionStarted?.(request.requestId);
    return {
      status: "scout-started",
      scout_request_id: request.requestId,
      task_id: request.taskId,
      ref: refSha,
      session: internalSessionId,
    };
  }
}
