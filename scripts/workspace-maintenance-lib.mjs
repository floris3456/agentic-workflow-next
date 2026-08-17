import { createHash } from "node:crypto";
import { execFile } from "node:child_process";
import { constants as fsConstants } from "node:fs";
import {
  lstat,
  mkdir,
  open,
  readdir,
  realpath,
  readlink,
  unlink,
} from "node:fs/promises";
import { dirname, isAbsolute, relative, resolve, sep } from "node:path";

const MAX_FILE_BYTES = 1024 * 1024;
const MAX_OUTPUT_BYTES = 128 * 1024;
const MAX_RESULTS = 500;

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

function processEnvironment() {
  const environment = { GIT_TERMINAL_PROMPT: "0" };
  for (const name of [
    "HOME", "LANG", "LC_ALL", "LC_CTYPE", "LOGNAME", "PATH", "SHELL",
    "SSH_AGENT_PID", "SSH_AUTH_SOCK", "TERM", "TMPDIR", "USER", "XDG_CONFIG_HOME",
  ]) if (typeof process.env[name] === "string") environment[name] = process.env[name];
  return environment;
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

function run(command, args, cwd, timeout = 60_000) {
  return new Promise((resolvePromise, reject) => {
    execFile(command, args, {
      cwd,
      timeout,
      maxBuffer: 2 * 1024 * 1024,
      encoding: "buffer",
      env: processEnvironment(),
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

async function git(cwd, args, allowFailure = false) {
  const result = await run("git", args, cwd);
  if (result.exitCode !== 0 && !allowFailure) {
    throw new Error(`Git verification failed for ${args[0] ?? "operation"}`);
  }
  return {
    exitCode: result.exitCode,
    stdout: utf8(result.stdout, "Git output").replace(/[\r\n]+$/, ""),
    stderr: utf8(result.stderr, "Git diagnostics").replace(/[\r\n]+$/, ""),
  };
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
  const result = await run("git", ["status", "--porcelain=v1", "-z", "--untracked-files=all"], worktree);
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

export class WorkspaceMaintenanceGate {
  constructor(rootDirectory) {
    this.rootDirectory = resolve(rootDirectory);
  }

  async inventory() {
    const root = await canonicalDirectory(this.rootDirectory, "Workspace-maintenance instruction root");
    const top = await canonicalDirectory((await git(root, ["rev-parse", "--show-toplevel"])).stdout, "Workspace-maintenance Git root");
    if (top !== root) throw new Error("Workspace-maintenance instruction root is not the Git worktree root");
    const common = await commonDirectory(root);
    const origin = (await git(root, ["remote", "get-url", "origin"])).stdout;
    if (!origin) throw new Error("Workspace-maintenance instruction root has no origin remote");
    const raw = (await run("git", ["worktree", "list", "--porcelain", "-z"], root)).stdout;
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
    const result = await run(executable, args, verified.worktree, timeoutMs);
    const after = await this.inspect(target);
    const origin = (await git(verified.worktree, ["remote", "get-url", "origin"])).stdout;
    const privatePaths = [
      verified.worktree,
      this.rootDirectory,
      await commonDirectory(verified.worktree),
      origin,
      process.env.HOME,
    ];
    return {
      command,
      exit_code: result.exitCode,
      stdout: bounded(redactLocalPaths(utf8(result.stdout, "Workspace command output"), privatePaths)),
      stderr: bounded(redactLocalPaths(utf8(result.stderr, "Workspace command diagnostics"), privatePaths)),
      target_state: after,
    };
  }
}
