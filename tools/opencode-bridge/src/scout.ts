import { execFile } from "node:child_process";
import { existsSync, lstatSync, readdirSync, realpathSync, rmSync } from "node:fs";
import { dirname, isAbsolute, join, relative, resolve } from "node:path";
import type { JsonValue, StoredRequest } from "./types.js";
import { asRecord, ensurePrivateDirectory, isRecord } from "./util.js";

const scoutAgent = "repository-scout";
const exactSha = /^[0-9a-f]{40}$/;
const allowedTools = new Set(["read", "glob", "grep"]);
const deniedPermissions = [
  "edit", "bash", "task", "skill", "webfetch", "websearch", "question",
  "todowrite", "external_directory",
] as const;

const hardenedRuntimeUnavailable = "Hardened Scout runtime is unavailable: pinned OpenCode 1.18.16 built-in read attaches repository instructions and starts LSP warm-up, while configuration startup may install packages; a separate bridge-owned in-process evidence tool/runtime is required";

export function scoutRuntimeBoundary(): { ready: false; reason: string } {
  return { ready: false, reason: hardenedRuntimeUnavailable };
}

function safeGitEnvironment(): NodeJS.ProcessEnv {
  const env = { ...process.env };
  for (const name of Object.keys(env)) {
    if (name.startsWith("GIT_CONFIG_") || name === "GIT_DIR" || name === "GIT_WORK_TREE" || name === "GIT_INDEX_FILE"
      || name === "GIT_SSH" || name === "GIT_SSH_COMMAND" || name === "GIT_ASKPASS" || name === "SSH_ASKPASS") {
      delete env[name];
    }
  }
  return {
    ...env,
    GIT_CONFIG_NOSYSTEM: "1",
    GIT_CONFIG_GLOBAL: process.platform === "win32" ? "NUL" : "/dev/null",
    GIT_ATTR_NOSYSTEM: "1",
    GIT_TERMINAL_PROMPT: "0",
  };
}

function execute(command: string, args: string[], cwd: string): Promise<string> {
  const commandArgs = command === "git"
    ? [
        "-c", `core.hooksPath=${process.platform === "win32" ? "NUL" : "/dev/null"}`,
        "-c", "core.fsmonitor=false",
        "-c", "credential.helper=",
        "-c", "protocol.file.allow=never",
        ...args,
      ]
    : args;
  return new Promise((resolvePromise, reject) => {
    execFile(command, commandArgs, {
      cwd,
      env: safeGitEnvironment(),
      timeout: 60_000,
      maxBuffer: 2 * 1024 * 1024,
    }, (error, stdout, stderr) => {
      if (error) {
        const detail = String(stderr || stdout).trim();
        reject(new Error(detail ? `${error.message}: ${detail}` : error.message));
        return;
      }
      resolvePromise(String(stdout).trim());
    });
  });
}

function contained(root: string, candidate: string): boolean {
  const fromRoot = relative(root, candidate);
  return fromRoot === "" || (!fromRoot.startsWith("..") && !isAbsolute(fromRoot));
}

function assertRealpathContainment(workspace: string): void {
  const root = realpathSync(workspace);
  const visit = (directory: string): void => {
    for (const entry of readdirSync(directory, { withFileTypes: true })) {
      const path = join(directory, entry.name);
      const stat = lstatSync(path);
      if (stat.isSymbolicLink()) {
        let target: string;
        try {
          target = realpathSync(path);
        } catch {
          throw new Error(`Scout workspace contains an unresolved symlink: ${relative(root, path)}`);
        }
        if (!contained(root, target)) throw new Error(`Scout workspace symlink escapes the exact-ref root: ${relative(root, path)}`);
      } else if (stat.isDirectory()) {
        visit(path);
      }
    }
  };
  visit(root);
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
  private readonly fetchOrigin: boolean;
  private readonly pending = new Map<string, Promise<string>>();
  private management: Promise<void> = Promise.resolve();

  constructor(repositoryRoot: string, stateFile: string, options: { fetchOrigin?: boolean } = {}) {
    this.repositoryRoot = resolve(repositoryRoot);
    this.root = join(dirname(stateFile), "scout-worktrees");
    this.fetchOrigin = options.fetchOrigin !== false;
  }

  private async dispose(workspace: string): Promise<void> {
    try {
      await execute("git", ["worktree", "remove", "--force", workspace], this.repositoryRoot);
    } catch {
      rmSync(workspace, { recursive: true, force: true });
      try {
        await execute("git", ["worktree", "prune", "--expire", "now"], this.repositoryRoot);
      } catch {
        // A failed cleanup never makes a workspace reusable; the original
        // validation error remains the actionable boundary failure.
      }
    }
  }

  private async create(refSha: string): Promise<string> {
    if (!exactSha.test(refSha)) throw new TypeError("Scout ref must be an exact lowercase commit SHA");
    ensurePrivateDirectory(this.root);
    if (this.fetchOrigin) await execute("git", ["fetch", "--no-tags", "origin", "developer"], this.repositoryRoot);
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
    try {
      const canonicalRoot = realpathSync(this.root);
      const canonicalWorkspace = realpathSync(workspace);
      if (!contained(canonicalRoot, canonicalWorkspace)) throw new Error("Scout workspace realpath escapes the private workspace root");
      const [head, status, ref] = await Promise.all([
        execute("git", ["rev-parse", "HEAD"], workspace),
        execute("git", ["status", "--porcelain", "--untracked-files=all"], workspace),
        execute("git", ["branch", "--show-current"], workspace),
      ]);
      if (head !== refSha) throw new Error("Scout workspace does not match the requested exact ref");
      if (ref.length > 0) throw new Error("Scout workspace is not detached at the requested exact ref");
      if (status.length > 0) throw new Error("Scout workspace is not clean; it will not be reused");
      assertRealpathContainment(canonicalWorkspace);
      return canonicalWorkspace;
    } catch (error) {
      await this.dispose(workspace);
      throw error;
    }
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

export class ScoutRuntime {
  async start(_request: StoredRequest): Promise<JsonValue> {
    // OpenCode 1.18.16 cannot establish the required Scout boundary. Its
    // built-in read tool resolves nearby repository instructions and warms LSP,
    // and its config loader may run package installation. Do not fall back to
    // the normal developer server or the inspected ref's tracked agent.
    throw new Error(hardenedRuntimeUnavailable);
  }
}
