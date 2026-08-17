import { createHash } from "node:crypto";
import { execFile } from "node:child_process";
import { constants as fsConstants } from "node:fs";
import {
  access,
  lstat,
  mkdir,
  open,
  readdir,
  realpath,
  readlink,
  unlink,
  writeFile,
} from "node:fs/promises";
import { dirname, isAbsolute, join, relative, resolve, sep } from "node:path";

const MAX_FILE_BYTES = 1024 * 1024;
const MAX_OUTPUT_BYTES = 128 * 1024;
const MAX_RESULTS = 500;
const GIT = "/usr/bin/git";
const BWRAP = "/usr/bin/bwrap";
const SYSTEM_PATH = "/usr/bin:/bin";
const SANDBOX_PATH = "/runtime:/usr/bin:/bin";

function sha256(value) {
  return createHash("sha256").update(value).digest("hex");
}

function inside(root, candidate) {
  const value = relative(root, candidate);
  return value === "" || (!value.startsWith("..") && !isAbsolute(value));
}

function bounded(value, maximum = MAX_OUTPUT_BYTES) {
  const bytes = Buffer.from(value, "utf8");
  if (bytes.length <= maximum) return value;
  return `${bytes.subarray(0, maximum).toString("utf8")}\n[output truncated at ${maximum} bytes]`;
}

function utf8(bytes, label, allowNul = false) {
  if (!allowNul && bytes.includes(0)) throw new Error(`${label} is binary`);
  try {
    return new TextDecoder("utf-8", { fatal: true }).decode(bytes);
  } catch {
    throw new Error(`${label} is not valid UTF-8`);
  }
}

function safeEnvironment(extra = {}) {
  return {
    PATH: SYSTEM_PATH,
    HOME: "/nonexistent",
    LANG: "C.UTF-8",
    LC_ALL: "C.UTF-8",
    GIT_CONFIG_NOSYSTEM: "1",
    GIT_CONFIG_GLOBAL: "/dev/null",
    GIT_ATTR_NOSYSTEM: "1",
    GIT_TERMINAL_PROMPT: "0",
    GIT_NO_REPLACE_OBJECTS: "1",
    GIT_OPTIONAL_LOCKS: "0",
    ...extra,
  };
}

function redactLocalPaths(value, pathsToRedact) {
  let result = value;
  const candidates = [...new Set(pathsToRedact.filter(Boolean))].sort((left, right) => right.length - left.length);
  for (const candidate of candidates) {
    result = result.replaceAll(candidate, "[local-path]");
    result = result.replaceAll(candidate.split(sep).join("/"), "[local-path]");
  }
  return result;
}

export function publicWorkspaceError(error) {
  const message = error instanceof Error ? error.message : "Workspace operation failed closed";
  if (message.length > 2048 || /(?:^|[\s'"`])(?:\/[A-Za-z0-9._-]|[A-Za-z]:[\\/])/.test(message)) {
    return "Workspace operation failed closed without exposing a host-local path";
  }
  return message;
}

function run(command, args, cwd, timeout = 60_000, env = safeEnvironment()) {
  return new Promise((resolvePromise, reject) => {
    execFile(command, args, {
      cwd,
      timeout,
      maxBuffer: 2 * 1024 * 1024,
      encoding: "buffer",
      env,
    }, (error, stdout, stderr) => {
      const output = Buffer.isBuffer(stdout) ? stdout : Buffer.from(stdout ?? "");
      const diagnostics = Buffer.isBuffer(stderr) ? stderr : Buffer.from(stderr ?? "");
      if (error && typeof error.code !== "number") {
        reject(new Error("Workspace command could not be executed"));
        return;
      }
      resolvePromise({
        exitCode: error && typeof error.code === "number" ? error.code : 0,
        stdout: output,
        stderr: diagnostics,
      });
    });
  });
}

function gitArguments(args, credentialHelpers = []) {
  return [
    "--no-replace-objects",
    "-c", "core.hooksPath=/dev/null",
    "-c", "core.fsmonitor=false",
    "-c", "core.attributesFile=/dev/null",
    "-c", "commit.gpgsign=false",
    "-c", "credential.helper=",
    ...credentialHelpers.flatMap((helper) => ["-c", `credential.helper=${helper}`]),
    "-c", "protocol.ext.allow=never",
    ...args,
  ];
}

async function gitRaw(cwd, args, allowFailure = false, options = {}) {
  const result = await run(
    GIT,
    gitArguments(args, options.credentialHelpers ?? []),
    cwd,
    options.timeout ?? 60_000,
    options.env ?? safeEnvironment(),
  );
  if (result.exitCode !== 0 && !allowFailure) {
    throw new Error(`Git verification failed for ${args[0] ?? "operation"}`);
  }
  return result;
}

async function git(cwd, args, allowFailure = false, options = {}) {
  const result = await gitRaw(cwd, args, allowFailure, options);
  return {
    exitCode: result.exitCode,
    stdout: utf8(result.stdout, "Git output").replace(/[\r\n]+$/, ""),
    stderr: utf8(result.stderr, "Git diagnostics").replace(/[\r\n]+$/, ""),
  };
}

async function pathExists(path) {
  try {
    await lstat(path);
    return true;
  } catch (error) {
    if (error?.code === "ENOENT") return false;
    throw error;
  }
}

export function parseWorktreePorcelain(value) {
  if (typeof value !== "string" || !value.includes("\0")) {
    throw new Error("Git worktree inventory is not NUL-delimited porcelain");
  }
  const worktrees = [];
  let current;
  const finish = () => {
    if (!current) return;
    if (!current.path || !current.head) throw new Error("Git worktree inventory entry is incomplete");
    worktrees.push(current);
    current = undefined;
  };
  for (const token of value.split("\0")) {
    if (token === "") {
      finish();
      continue;
    }
    const separator = token.indexOf(" ");
    const key = separator === -1 ? token : token.slice(0, separator);
    const field = separator === -1 ? "" : token.slice(separator + 1);
    if (key === "worktree") {
      finish();
      current = { path: field };
      continue;
    }
    if (!current) throw new Error("Git worktree inventory has data before a worktree path");
    if (key === "HEAD") current.head = field;
    else if (key === "branch") current.branch = field;
    else if (key === "detached") current.detached = true;
    else if (key === "bare") current.bare = true;
    else if (key === "locked") current.locked = field || true;
    else if (key === "prunable") current.prunable = field || true;
    else throw new Error(`Git worktree inventory contains unsupported field ${key}`);
  }
  finish();
  if (worktrees.length === 0) throw new Error("Git worktree inventory is empty");
  return worktrees;
}

function targetSyntax(value) {
  if (typeof value !== "string" || value.length === 0 || value.length > 255 || value.includes("\0") || isAbsolute(value) || /^[A-Za-z]:[\\/]/.test(value)) {
    throw new Error("Workspace target must be a branch name or exact commit SHA, never a filesystem path");
  }
  if (/^[0-9a-f]{40}$/.test(value)) return { type: "head", value };
  const branch = value.startsWith("refs/heads/") ? value : `refs/heads/${value}`;
  if (branch === "refs/heads/" || branch.includes("..") || branch.includes("@{") || branch.includes("//")
    || branch.endsWith("/") || branch.endsWith(".") || /[\x00-\x20\x7f~^:?*\[\\]/.test(branch)) {
    throw new Error("Workspace target branch is invalid");
  }
  return { type: "branch", value: branch };
}

function targetName(entry) {
  return entry.branch?.startsWith("refs/heads/") ? entry.branch.slice("refs/heads/".length) : entry.head;
}

function relativePath(value, allowRoot = false) {
  if (typeof value !== "string" || value.length === 0 || value.length > 4096 || value.includes("\0") || isAbsolute(value) || /^[A-Za-z]:[\\/]/.test(value)) {
    throw new Error("Workspace file path must be bounded and repository-relative");
  }
  const normalized = value.split(/[\\/]+/).filter((part) => part.length > 0 && part !== ".");
  if ((!allowRoot && normalized.length === 0) || normalized.includes("..") || normalized[0] === ".git") {
    throw new Error("Workspace file path escapes the tracked working tree");
  }
  return normalized.join(sep) || ".";
}

function globExpression(pattern) {
  if (typeof pattern !== "string" || pattern.length === 0 || pattern.length > 1024 || pattern.includes("\0") || isAbsolute(pattern)) {
    throw new Error("Workspace glob must be a bounded repository-relative pattern");
  }
  let result = "";
  for (let index = 0; index < pattern.length; index++) {
    const char = pattern[index];
    if (char === "*" && pattern[index + 1] === "*") {
      result += ".*";
      index++;
    } else if (char === "*") result += "[^/]*";
    else if (char === "?") result += "[^/]";
    else result += char.replace(/[.+^${}()|[\]\\]/g, "\\$&");
  }
  return new RegExp(`^${result}$`);
}

async function canonicalDirectory(value, label) {
  const lexical = resolve(value);
  let stat;
  try {
    stat = await lstat(lexical);
  } catch {
    throw new Error(`${label} is missing`);
  }
  if (!stat.isDirectory() || stat.isSymbolicLink()) throw new Error(`${label} must be a real directory, not a symlink`);
  const canonical = await realpath(lexical);
  if (canonical !== lexical) throw new Error(`${label} traverses a symlink`);
  return canonical;
}

async function commonDirectory(worktree) {
  const output = (await git(worktree, ["rev-parse", "--git-common-dir"])).stdout;
  return await realpath(resolve(worktree, output));
}

async function symbolicBranch(worktree) {
  const result = await git(worktree, ["symbolic-ref", "-q", "HEAD"], true);
  if (result.exitCode !== 0) return undefined;
  return result.stdout;
}

async function status(worktree) {
  const result = await gitRaw(worktree, ["status", "--porcelain=v1", "-z", "--untracked-files=all"]);
  if (result.exitCode !== 0) throw new Error("Git verification failed for status");
  const raw = result.stdout;
  const text = utf8(raw, "Git status", true).split("\0").filter(Boolean).join("\n");
  return { clean: raw.length === 0, digest: sha256(raw), entries: bounded(text, 32 * 1024) };
}

async function upstreamState(worktree) {
  const upstream = await git(worktree, ["rev-parse", "--abbrev-ref", "--symbolic-full-name", "@{upstream}"], true);
  if (upstream.exitCode !== 0 || !upstream.stdout) return { upstream: null, ahead: null, behind: null };
  const counts = await git(worktree, ["rev-list", "--left-right", "--count", "HEAD...@{upstream}"], true);
  if (counts.exitCode !== 0) return { upstream: upstream.stdout, ahead: null, behind: null };
  const [ahead, behind] = counts.stdout.trim().split(/\s+/).map(Number);
  if (!Number.isSafeInteger(ahead) || !Number.isSafeInteger(behind)) {
    throw new Error("Git upstream relationship is malformed");
  }
  return { upstream: upstream.stdout, ahead, behind };
}

async function paths(root) {
  const output = [];
  const visit = async (directory) => {
    for (const entry of await readdir(directory, { withFileTypes: true })) {
      if (directory === root && entry.name === ".git") continue;
      const absolute = resolve(directory, entry.name);
      const name = relative(root, absolute).split(sep).join("/");
      output.push({ absolute, name, symlink: entry.isSymbolicLink(), directory: entry.isDirectory() });
      if (output.length > 50_000) throw new Error("Workspace traversal exceeds the 50000-entry limit");
      if (entry.isDirectory() && !entry.isSymbolicLink()) await visit(absolute);
    }
  };
  await visit(root);
  return output;
}

async function secureParent(root, path, create) {
  const requested = relativePath(path);
  const parentParts = dirname(requested) === "." ? [] : dirname(requested).split(sep);
  let current = root;
  for (const part of parentParts) {
    current = resolve(current, part);
    try {
      const stat = await lstat(current);
      if (!stat.isDirectory() || stat.isSymbolicLink()) throw new Error("Workspace path traverses a symlink or non-directory");
    } catch (error) {
      if (error?.code !== "ENOENT" || !create) throw error;
      await mkdir(current, { mode: 0o755 });
      const stat = await lstat(current);
      if (!stat.isDirectory() || stat.isSymbolicLink()) throw new Error("Workspace path creation was not a real directory");
    }
    const canonical = await realpath(current);
    if (!inside(root, canonical)) throw new Error("Workspace path escapes through a symlink");
  }
  const candidate = resolve(root, requested);
  if (!inside(root, candidate)) throw new Error("Workspace path escapes the tracked working tree");
  return candidate;
}

async function openRegular(root, path, flags, mode) {
  const candidate = await secureParent(root, path, (flags & fsConstants.O_CREAT) !== 0);
  let handle;
  try {
    handle = await open(candidate, flags | fsConstants.O_NOFOLLOW, mode);
    const stat = await handle.stat();
    if (!stat.isFile()) throw new Error("Workspace file operation requires a regular file");
    return { handle, stat };
  } catch (error) {
    await handle?.close();
    if (error?.code === "ELOOP") throw new Error("Workspace tools do not follow symlinks");
    throw error;
  }
}

async function gitDirectory(worktree) {
  const output = (await git(worktree, ["rev-parse", "--absolute-git-dir"])).stdout;
  return await canonicalDirectory(output, "Registered worktree Git directory");
}

async function systemMountArguments() {
  if (process.platform !== "linux" || process.getuid?.() === 0) {
    throw new Error("Workspace command sandbox requires a non-root Linux operator");
  }
  try {
    await access(BWRAP, fsConstants.X_OK);
  } catch {
    throw new Error("Workspace command sandbox requires the fixed /usr/bin/bwrap runtime");
  }
  const result = [];
  for (const path of ["/usr", "/bin", "/lib", "/lib64"]) {
    let stat;
    try {
      stat = await lstat(path);
    } catch (error) {
      if (error?.code === "ENOENT") continue;
      throw error;
    }
    if (stat.isSymbolicLink()) result.push("--symlink", await readlink(path), path);
    else if (stat.isDirectory()) result.push("--ro-bind", path, path);
    else throw new Error("Workspace command sandbox system runtime layout is unsupported");
  }
  return result;
}

async function nodeRuntimeMountArguments() {
  const executable = await realpath(process.execPath);
  const stat = await lstat(executable);
  if (!stat.isFile()) throw new Error("Workspace command sandbox Node runtime is not a regular file");
  try {
    await access(executable, fsConstants.X_OK);
  } catch {
    throw new Error("Workspace command sandbox Node runtime is not executable");
  }
  return ["--dir", "/runtime", "--ro-bind", executable, "/runtime/node"];
}

async function sandboxCommand(verified, command, args, timeoutMs) {
  const common = await commonDirectory(verified.worktree);
  const worktreeGit = await gitDirectory(verified.worktree);
  const gitEntry = resolve(verified.worktree, ".git");
  const sandboxExecutable = command.includes("/") || command.includes("\\")
    ? `/workspace/${relativePath(command).split(sep).join("/")}`
    : command;
  const bwrap = [
    "--die-with-parent", "--new-session", "--unshare-all",
    ...await systemMountArguments(),
    ...await nodeRuntimeMountArguments(),
    "--proc", "/proc",
    "--dev", "/dev",
    "--tmpfs", "/tmp",
    "--dir", "/tmp/user",
    "--bind", verified.worktree, "/workspace",
    "--ro-bind", gitEntry, "/workspace/.git",
    "--ro-bind", common, "/repo.git",
    "--ro-bind", worktreeGit, "/worktree.git",
    "--chdir", "/workspace",
    "--setenv", "HOME", "/tmp/user",
    "--setenv", "XDG_CONFIG_HOME", "/tmp/config",
    "--setenv", "XDG_DATA_HOME", "/tmp/data",
    "--setenv", "XDG_CACHE_HOME", "/tmp/cache",
    "--setenv", "TMPDIR", "/tmp",
    "--setenv", "PATH", SANDBOX_PATH,
    "--setenv", "LANG", "C.UTF-8",
    "--setenv", "LC_ALL", "C.UTF-8",
    "--setenv", "SHELL", "/bin/false",
    "--setenv", "GIT_DIR", "/worktree.git",
    "--setenv", "GIT_COMMON_DIR", "/repo.git",
    "--setenv", "GIT_WORK_TREE", "/workspace",
    "--setenv", "GIT_CONFIG_NOSYSTEM", "1",
    "--setenv", "GIT_CONFIG_GLOBAL", "/dev/null",
    "--setenv", "GIT_ATTR_NOSYSTEM", "1",
    "--setenv", "GIT_TERMINAL_PROMPT", "0",
    "--setenv", "GIT_NO_REPLACE_OBJECTS", "1",
    "--setenv", "GIT_OPTIONAL_LOCKS", "0",
    "--", sandboxExecutable, ...args,
  ];
  return await run(BWRAP, bwrap, verified.worktree, timeoutMs);
}

async function assertSafeGitMetadata(verified) {
  const names = (await git(verified.worktree, ["config", "--local", "--name-only", "--list"], true)).stdout
    .split(/\r?\n/)
    .filter(Boolean)
    .map((name) => name.toLowerCase());
  const unsafe = names.find((name) => name === "include.path" || name.startsWith("includeif.")
    || (name.startsWith("url.") && name.endsWith(".insteadof"))
    || (name.startsWith("remote.") && [".pushurl", ".receivepack", ".uploadpack", ".proxy"].some((suffix) => name.endsWith(suffix)))
    || name === "core.sshcommand" || name.startsWith("credential.") || name.startsWith("http."));
  if (unsafe) throw new Error("Workspace publication rejects Git configuration that can redirect transport or execute helpers");
  const common = await commonDirectory(verified.worktree);
  if (await pathExists(join(common, "objects", "info", "alternates"))) {
    throw new Error("Workspace publication rejects alternate Git object directories");
  }
  const replace = join(common, "refs", "replace");
  if (await pathExists(replace) && (await readdir(replace)).length > 0) {
    throw new Error("Workspace publication rejects Git replace refs");
  }
}

async function assertNoGitFilters(verified) {
  const files = (await paths(verified.worktree)).filter((entry) => !entry.directory && !entry.symlink);
  for (let index = 0; index < files.length; index += 100) {
    const names = files.slice(index, index + 100).map((entry) => entry.name);
    const result = await gitRaw(verified.worktree, ["check-attr", "-z", "filter", "working-tree-encoding", "--", ...names]);
    const fields = utf8(result.stdout, "Git attribute output", true).split("\0");
    for (let field = 0; field + 2 < fields.length; field += 3) {
      const attribute = fields[field + 1];
      const value = fields[field + 2];
      if (["filter", "working-tree-encoding"].includes(attribute) && !["unspecified", "unset"].includes(value)) {
        throw new Error("Workspace publication rejects content filters and working-tree encodings");
      }
    }
  }
}

async function commitIdentity(verified) {
  const result = await gitRaw(verified.worktree, ["show", "-s", "--format=%an%x00%ae%x00%cn%x00%ce", "HEAD"]);
  const [authorName, authorEmail, committerName, committerEmail] = utf8(result.stdout, "Git identity", true)
    .replace(/[\r\n]+$/, "")
    .split("\0");
  for (const value of [authorName, authorEmail, committerName, committerEmail]) {
    if (!value || /[\r\n\0]/.test(value)) throw new Error("Workspace publication could not derive a bounded public Git identity");
  }
  return { authorName, authorEmail, committerName, committerEmail };
}

async function credentialHelpers(worktree) {
  if (typeof process.env.HOME !== "string" || process.env.HOME.length === 0) return [];
  const environment = {
    PATH: SYSTEM_PATH,
    HOME: process.env.HOME,
    LANG: "C.UTF-8",
    LC_ALL: "C.UTF-8",
    GIT_CONFIG_NOSYSTEM: "1",
    GIT_TERMINAL_PROMPT: "0",
  };
  const result = await run(GIT, ["config", "--global", "--get-all", "credential.helper"], worktree, 60_000, environment);
  if (result.exitCode !== 0) return [];
  const helpers = utf8(result.stdout, "Git credential helper configuration")
    .split(/\r?\n/)
    .filter(Boolean);
  const allowed = /^(?:store|cache|libsecret|manager|manager-core|osxkeychain|wincred)$/;
  if (helpers.some((helper) => !allowed.test(helper))) {
    throw new Error("Workspace publication rejects executable or parameterized credential helpers");
  }
  return helpers;
}

async function originForPublication(verified, fixtureOrigins) {
  const origin = (await git(verified.worktree, ["remote", "get-url", "--all", "origin"])).stdout
    .split(/\r?\n/)
    .filter(Boolean);
  if (origin.length !== 1) throw new Error("Workspace publication requires exactly one verified origin URL");
  if (/^https:\/\//i.test(origin[0])) {
    let url;
    try {
      url = new URL(origin[0]);
    } catch {
      throw new Error("Workspace publication origin is malformed");
    }
    if (url.username || url.password || url.search || url.hash) {
      throw new Error("Workspace publication origin must not embed credentials or query data");
    }
    if (url.protocol !== "https:" || url.hostname.toLowerCase() !== "github.com" || url.port
      || !/^\/[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+\.git$/.test(url.pathname)) {
      throw new Error("Workspace publication requires a canonical credential-free GitHub HTTPS origin");
    }
  } else {
    const fixture = isAbsolute(origin[0]) ? resolve(origin[0]) : undefined;
    if (!fixture || !fixtureOrigins.has(fixture)) {
      throw new Error("Workspace publication supports local origins only when the host explicitly registers an exact test fixture");
    }
  }
  return origin[0];
}

async function synchronizationMarker(verified, branch) {
  const directory = await gitDirectory(verified.worktree);
  const name = branch === "developer"
    ? "agent-workflow-sync-failed"
    : branch === "template-development"
      ? "template-development-sync-failed"
      : "workspace-maintenance-sync-failed";
  return join(directory, name);
}

export class WorkspaceMaintenanceGate {
  constructor(rootDirectory, options = {}) {
    this.rootDirectory = resolve(rootDirectory);
    this.fixtureOrigins = new Set((options.fixtureOrigins ?? []).map((origin) => resolve(origin)));
  }

  async inventory() {
    const root = await canonicalDirectory(this.rootDirectory, "Workspace-maintenance instruction root");
    const top = await canonicalDirectory((await git(root, ["rev-parse", "--show-toplevel"])).stdout, "Workspace-maintenance Git root");
    if (top !== root) throw new Error("Workspace-maintenance instruction root is not the Git worktree root");
    const common = await commonDirectory(root);
    const origin = (await git(root, ["remote", "get-url", "origin"])).stdout;
    if (!origin) throw new Error("Workspace-maintenance instruction root has no origin remote");
    const raw = (await gitRaw(root, ["worktree", "list", "--porcelain", "-z"])).stdout;
    const entries = parseWorktreePorcelain(utf8(raw, "Git worktree inventory", true));
    return { root, common, origin, entries };
  }

  async verifyEntry(inventory, entry) {
    if (entry.bare || entry.prunable) throw new Error("Registered worktree is stale or non-working");
    const worktree = await canonicalDirectory(entry.path, "Registered worktree");
    const top = await canonicalDirectory((await git(worktree, ["rev-parse", "--show-toplevel"])).stdout, "Registered Git root");
    if (top !== worktree) throw new Error("Registered worktree path is not its Git root");
    if (await commonDirectory(worktree) !== inventory.common) throw new Error("Target does not belong to the instruction root's exact Git repository");
    if ((await git(worktree, ["remote", "get-url", "origin"])).stdout !== inventory.origin) {
      throw new Error("Target repository identity does not match the instruction root");
    }
    const head = (await git(worktree, ["rev-parse", "HEAD"])).stdout;
    const branch = await symbolicBranch(worktree);
    if (head !== entry.head || branch !== entry.branch) throw new Error("Registered worktree inventory no longer matches its Git state");
    const treeStatus = await status(worktree);
    return {
      worktree,
      entry,
      public: {
        target: targetName(entry),
        branch: branch?.startsWith("refs/heads/") ? branch.slice("refs/heads/".length) : null,
        head,
        clean: treeStatus.clean,
        status_digest: treeStatus.digest,
        status: treeStatus.entries,
        ...await upstreamState(worktree),
      },
    };
  }

  async authority() {
    const inventory = await this.inventory();
    const entry = inventory.entries.find((candidate) => resolve(candidate.path) === inventory.root);
    if (!entry) throw new Error("Instruction root is not a registered worktree");
    const verified = await this.verifyEntry(inventory, entry);
    if (verified.entry.branch !== "refs/heads/template-development") {
      throw new Error("Workspace Maintenance Agent must remain rooted on template-development");
    }
    return { inventory, verified };
  }

  async list() {
    const { inventory } = await this.authority();
    const targets = [];
    let rejected = 0;
    for (const entry of inventory.entries) {
      try {
        targets.push((await this.verifyEntry(inventory, entry)).public);
      } catch {
        rejected++;
      }
    }
    return { instruction_root: "template-development", targets, rejected_registered_entries: rejected };
  }

  async target(target) {
    const selection = targetSyntax(target);
    const { inventory } = await this.authority();
    if (selection.type === "branch") {
      const checked = await git(inventory.root, ["check-ref-format", selection.value], true);
      if (checked.exitCode !== 0) throw new Error("Workspace target branch is invalid");
    }
    const matches = inventory.entries.filter((entry) => selection.type === "head"
      ? entry.detached && entry.head === selection.value
      : entry.branch === selection.value);
    if (matches.length !== 1) throw new Error(matches.length === 0
      ? "Workspace target is not a registered worktree of this repository"
      : "Workspace target is ambiguous across registered worktrees");
    return await this.verifyEntry(inventory, matches[0]);
  }

  async inspect(target) {
    return (await this.target(target)).public;
  }

  async preflight(target, expectedHead, expectedStatusDigest) {
    if (typeof expectedHead !== "string" || !/^[0-9a-f]{40}$/.test(expectedHead)) throw new Error("expected_head must be an exact lowercase commit SHA");
    if (typeof expectedStatusDigest !== "string" || !/^[0-9a-f]{64}$/.test(expectedStatusDigest)) throw new Error("expected_status_digest must be an exact inspection digest");
    const verified = await this.target(target);
    if (verified.public.head !== expectedHead || verified.public.status_digest !== expectedStatusDigest) {
      throw new Error("Workspace target changed since its inspected preflight state");
    }
    return verified;
  }

  async read(target, path, offset = 1, limit = 200) {
    const verified = await this.target(target);
    const candidate = await secureParent(verified.worktree, path, false);
    let link;
    try {
      const stat = await lstat(candidate);
      if (stat.isSymbolicLink()) link = await readlink(candidate);
    } catch {
      throw new Error("Workspace read target is unavailable");
    }
    if (link !== undefined) throw new Error("Workspace tools do not follow symlinks");
    const { handle, stat } = await openRegular(verified.worktree, path, fsConstants.O_RDONLY, 0o600);
    try {
      if (stat.size > MAX_FILE_BYTES) throw new Error("Workspace read file exceeds 1 MiB");
      const lines = utf8(await handle.readFile(), "Workspace file").split(/\r?\n/);
      const start = Number.isSafeInteger(offset) && offset > 0 ? offset : 1;
      const count = Number.isSafeInteger(limit) && limit > 0 && limit <= 500 ? limit : 200;
      return bounded(lines.slice(start - 1, start - 1 + count).map((line, index) => `${start + index}: ${line}`).join("\n"));
    } finally {
      await handle.close();
    }
  }

  async write(target, path, content, expectedHead, expectedStatusDigest) {
    const verified = await this.preflight(target, expectedHead, expectedStatusDigest);
    if (typeof content !== "string" || Buffer.byteLength(content, "utf8") > MAX_FILE_BYTES || content.includes("\0")) {
      throw new Error("Workspace write content must be bounded UTF-8 text no larger than 1 MiB");
    }
    const { handle } = await openRegular(
      verified.worktree,
      path,
      fsConstants.O_WRONLY | fsConstants.O_CREAT | fsConstants.O_TRUNC,
      0o644,
    );
    try {
      await handle.writeFile(content, "utf8");
      await handle.sync();
    } finally {
      await handle.close();
    }
    return await this.inspect(target);
  }

  async remove(target, path, expectedHead, expectedStatusDigest) {
    const verified = await this.preflight(target, expectedHead, expectedStatusDigest);
    const candidate = await secureParent(verified.worktree, path, false);
    const stat = await lstat(candidate);
    if (!stat.isFile() || stat.isSymbolicLink()) throw new Error("Workspace delete requires a regular non-symlink file");
    if (!inside(verified.worktree, await realpath(candidate))) throw new Error("Workspace delete path escapes the tracked working tree");
    await unlink(candidate);
    return await this.inspect(target);
  }

  async glob(target, pattern) {
    const verified = await this.target(target);
    const expression = globExpression(pattern);
    const matches = (await paths(verified.worktree)).filter((entry) => expression.test(entry.name)).slice(0, MAX_RESULTS);
    return bounded(matches.map((entry) => `${entry.name}${entry.directory ? "/" : entry.symlink ? " -> [symlink]" : ""}`).join("\n"));
  }

  async grep(target, query, pattern) {
    if (typeof query !== "string" || query.length === 0 || query.length > 1024 || query.includes("\0")) {
      throw new Error("Workspace grep query must be bounded literal text");
    }
    const verified = await this.target(target);
    const expression = pattern ? globExpression(pattern) : undefined;
    const results = [];
    for (const entry of await paths(verified.worktree)) {
      if (entry.directory || entry.symlink || (expression && !expression.test(entry.name))) continue;
      const stat = await lstat(entry.absolute);
      if (!stat.isFile() || stat.size > MAX_FILE_BYTES) continue;
      let lines;
      try {
        const { handle } = await openRegular(verified.worktree, entry.name, fsConstants.O_RDONLY, 0o600);
        try {
          lines = utf8(await handle.readFile(), entry.name).split(/\r?\n/);
        } finally {
          await handle.close();
        }
      } catch {
        continue;
      }
      for (let index = 0; index < lines.length; index++) {
        if (lines[index].includes(query)) results.push(`${entry.name}:${index + 1}: ${lines[index]}`);
        if (results.length >= MAX_RESULTS) return bounded(results.join("\n"));
      }
    }
    return bounded(results.join("\n"));
  }

  async execute(target, command, args, expectedHead, expectedStatusDigest, timeoutMs = 120_000) {
    const verified = await this.preflight(target, expectedHead, expectedStatusDigest);
    if (typeof command !== "string" || command.length === 0 || command.length > 1000 || command.includes("\0") || isAbsolute(command)) {
      throw new Error("Workspace command must be a bounded executable name or repository-relative executable");
    }
    if (!Array.isArray(args) || args.length > 200 || args.some((value) => typeof value !== "string" || value.length > 16_384 || value.includes("\0"))) {
      throw new Error("Workspace command arguments are invalid");
    }
    if (!Number.isSafeInteger(timeoutMs) || timeoutMs < 1 || timeoutMs > 600_000) throw new Error("Workspace command timeout is invalid");
    let executable = command;
    if (command.includes("/") || command.includes("\\")) {
      const path = relativePath(command);
      const candidate = await secureParent(verified.worktree, path, false);
      const stat = await lstat(candidate);
      if (!stat.isFile() || stat.isSymbolicLink() || !inside(verified.worktree, await realpath(candidate))) {
        throw new Error("Workspace executable is not a regular in-worktree file");
      }
      executable = candidate;
    } else if (!/^[A-Za-z0-9._+-]+$/.test(command)) {
      throw new Error("Workspace executable name is invalid");
    }
    const result = await sandboxCommand(verified, command, args, timeoutMs);
    const after = await this.inspect(target);
    const origin = (await git(verified.worktree, ["remote", "get-url", "origin"])).stdout;
    const privatePaths = [
      verified.worktree,
      this.rootDirectory,
      await commonDirectory(verified.worktree),
      origin,
      process.env.HOME,
      "/workspace",
      "/repo.git",
      "/worktree.git",
      ...args.filter((value) => isAbsolute(value)),
    ];
    return {
      command,
      containment: "bubblewrap-worktree-v1",
      network: "denied",
      git_metadata: "read-only",
      exit_code: result.exitCode,
      stdout: bounded(redactLocalPaths(utf8(result.stdout, "Workspace command output"), privatePaths)),
      stderr: bounded(redactLocalPaths(utf8(result.stderr, "Workspace command diagnostics"), privatePaths)),
      target_state: after,
    };
  }

  async publish(target, message, expectedHead, expectedStatusDigest) {
    const verified = await this.preflight(target, expectedHead, expectedStatusDigest);
    if (!verified.entry.branch?.startsWith("refs/heads/")) {
      throw new Error("Workspace publication requires an attached registered branch worktree");
    }
    const branch = verified.entry.branch.slice("refs/heads/".length);
    if (branch === "main") {
      throw new Error("Workspace publication mechanically denies main; exact-SHA human promotion remains separate");
    }
    if (typeof message !== "string" || message.length === 0 || message.length > 4_000 || message.includes("\0")) {
      throw new Error("Workspace publication commit message must be bounded text");
    }
    if (verified.public.clean) throw new Error("Workspace publication requires inspected working-tree changes");
    const marker = await synchronizationMarker(verified, branch);
    if (await pathExists(marker)) throw new Error("Workspace publication is blocked by unresolved synchronization state");
    if (verified.public.upstream !== `origin/${branch}` || verified.public.ahead !== 0 || verified.public.behind !== 0) {
      throw new Error("Workspace publication requires an exactly synchronized origin tracking branch");
    }
    await assertSafeGitMetadata(verified);
    await assertNoGitFilters(verified);
    const origin = await originForPublication(verified, this.fixtureOrigins);
    const helpers = /^https:\/\//i.test(origin) ? await credentialHelpers(verified.worktree) : [];
    const pushEnvironment = safeEnvironment({
      ...(typeof process.env.HOME === "string" ? { HOME: process.env.HOME } : {}),
    });
    const remoteRef = `refs/heads/${branch}`;
    const before = await git(
      verified.worktree,
      ["ls-remote", "--heads", "--", origin, remoteRef],
      false,
      { env: pushEnvironment, credentialHelpers: helpers },
    );
    const remoteBefore = before.stdout ? before.stdout.split(/\s+/)[0] : undefined;
    if (remoteBefore !== expectedHead) {
      throw new Error("Workspace publication refuses a missing, stale, or advanced canonical branch head");
    }
    const identity = await commitIdentity(verified);
    const commitEnvironment = safeEnvironment({
      GIT_AUTHOR_NAME: identity.authorName,
      GIT_AUTHOR_EMAIL: identity.authorEmail,
      GIT_COMMITTER_NAME: identity.committerName,
      GIT_COMMITTER_EMAIL: identity.committerEmail,
    });
    await git(verified.worktree, ["add", "--all", "--", "."], false, { env: commitEnvironment });
    const staged = await git(verified.worktree, ["diff", "--cached", "--quiet", "--exit-code"], true, { env: commitEnvironment });
    if (staged.exitCode === 0) throw new Error("Workspace publication found no staged content change");
    if (staged.exitCode !== 1) throw new Error("Workspace publication could not verify staged content");
    let committed;
    let commitCreated = false;
    try {
      await git(verified.worktree, ["commit", "--no-verify", "--no-gpg-sign", "-m", message], false, { env: commitEnvironment });
      commitCreated = true;
      committed = await this.inspect(target);
      if (committed.head === expectedHead || !committed.clean) {
        throw new Error("Workspace publication did not produce one clean branch commit");
      }
      const pushed = await git(
        verified.worktree,
        ["push", "--porcelain", "--no-verify", "--no-recurse-submodules", "--", origin, `${committed.head}:${remoteRef}`],
        true,
        { env: pushEnvironment, credentialHelpers: helpers, timeout: 180_000 },
      );
      if (pushed.exitCode !== 0) throw new Error("Workspace publication push failed");
      const after = await git(
        verified.worktree,
        ["ls-remote", "--heads", "--", origin, remoteRef],
        false,
        { env: pushEnvironment, credentialHelpers: helpers },
      );
      const remoteAfter = after.stdout ? after.stdout.split(/\s+/)[0] : undefined;
      if (remoteAfter !== committed.head) throw new Error("Workspace publication remote readback was ambiguous");
      const tracking = `refs/remotes/origin/${branch}`;
      const priorTracking = await git(verified.worktree, ["rev-parse", "--verify", tracking], true);
      if (priorTracking.exitCode === 0) {
        await git(verified.worktree, ["update-ref", tracking, committed.head, priorTracking.stdout]);
      }
    } catch {
      if (!commitCreated) throw new Error("Workspace publication failed before creating a commit; reinspect the target state");
      const commit = committed?.head ?? (await git(verified.worktree, ["rev-parse", "HEAD"])).stdout;
      await writeFile(marker, `${branch}\n${commit}\n${new Date().toISOString().replace(/\.\d{3}Z$/, "Z")}\n`, { mode: 0o600 });
      throw new Error(`Workspace publication failed after local commit ${commit}; synchronization recovery is required`);
    }
    return {
      target: branch,
      commit: committed.head,
      remote_ref: remoteRef,
      remote_verified: true,
      target_state: await this.inspect(target),
    };
  }
}
