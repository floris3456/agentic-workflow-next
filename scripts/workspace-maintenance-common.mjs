import { createHash } from "node:crypto";
import { execFile } from "node:child_process";
import { constants as fsConstants } from "node:fs";
import { access, lstat, mkdir, open, readdir, realpath, readlink } from "node:fs/promises";
import { dirname, isAbsolute, relative, resolve, sep } from "node:path";

export const MAX_FILE_BYTES = 1024 * 1024;
export const MAX_OUTPUT_BYTES = 128 * 1024;
export const MAX_RESULTS = 500;
export const GIT = "/usr/bin/git";
export const BWRAP = "/usr/bin/bwrap";
export const SYSTEM_PATH = "/usr/bin:/bin";
export const SANDBOX_PATH = "/runtime:/usr/bin:/bin";
export const FALSE_PROGRAM = "/bin/false";
export { fsConstants };

export function inside(root, candidate) {
  const value = relative(root, candidate);
  return value === "" || (!value.startsWith("..") && !isAbsolute(value));
}

export function bounded(value, maximum = MAX_OUTPUT_BYTES) {
  const bytes = Buffer.from(value, "utf8");
  if (bytes.length <= maximum) return value;
  return `${bytes.subarray(0, maximum).toString("utf8")}\n[output truncated at ${maximum} bytes]`;
}

export function utf8(bytes, label, allowNul = false) {
  if (!allowNul && bytes.includes(0)) throw new Error(`${label} is binary`);
  try {
    return new TextDecoder("utf-8", { fatal: true }).decode(bytes);
  } catch {
    throw new Error(`${label} is not valid UTF-8`);
  }
}

export function sha256(value) {
  return createHash("sha256").update(value).digest("hex");
}

export function publicWorkspaceError(error) {
  const message = error instanceof Error ? error.message : "Workspace operation failed closed";
  if (message.length > 2048 || /(?:^|[\s'"`])(?:\/[A-Za-z0-9._-]|[A-Za-z]:[\\/])/.test(message)) {
    return "Workspace operation failed closed without exposing a host-local path";
  }
  return message;
}

export function parseWorktreePorcelain(value) {
  if (typeof value !== "string" || !value.includes("\0")) throw new Error("Git worktree inventory is not NUL-delimited porcelain");
  const worktrees = [];
  let current;
  const finish = () => {
    if (!current) return;
    if (!current.path || !current.head) throw new Error("Git worktree inventory entry is incomplete");
    worktrees.push(current);
    current = undefined;
  };
  for (const token of value.split("\0")) {
    if (token === "") { finish(); continue; }
    const separator = token.indexOf(" ");
    const key = separator === -1 ? token : token.slice(0, separator);
    const field = separator === -1 ? "" : token.slice(separator + 1);
    if (key === "worktree") { finish(); current = { path: field }; continue; }
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

export function targetSyntax(value) {
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

export function targetName(entry) {
  return entry.branch?.startsWith("refs/heads/") ? entry.branch.slice("refs/heads/".length) : entry.head;
}

export function relativePath(value, allowRoot = false) {
  if (typeof value !== "string" || value.length === 0 || value.length > 4096 || value.includes("\0") || isAbsolute(value) || /^[A-Za-z]:[\\/]/.test(value)) {
    throw new Error("Workspace file path must be bounded and repository-relative");
  }
  const normalized = value.split(/[\\/]+/).filter((part) => part.length > 0 && part !== ".");
  if ((!allowRoot && normalized.length === 0) || normalized.includes("..") || normalized[0] === ".git") throw new Error("Workspace file path escapes the tracked working tree");
  return normalized.join(sep) || ".";
}

export function globExpression(pattern) {
  if (typeof pattern !== "string" || pattern.length === 0 || pattern.length > 1024 || pattern.includes("\0") || isAbsolute(pattern)) {
    throw new Error("Workspace glob must be a bounded repository-relative pattern");
  }
  let result = "";
  for (let index = 0; index < pattern.length; index++) {
    const char = pattern[index];
    if (char === "*" && pattern[index + 1] === "*") { result += ".*"; index++; }
    else if (char === "*") result += "[^/]*";
    else if (char === "?") result += "[^/]";
    else result += char.replace(/[.+^${}()|[\]\\]/g, "\\$&");
  }
  return new RegExp(`^${result}$`);
}

export function safeEnvironment(extra = {}) {
  return {
    PATH: SYSTEM_PATH,
    HOME: "/nonexistent",
    LANG: "C.UTF-8",
    LC_ALL: "C.UTF-8",
    GIT_CONFIG_NOSYSTEM: "1",
    GIT_CONFIG_GLOBAL: "/dev/null",
    GIT_ATTR_NOSYSTEM: "1",
    GIT_TERMINAL_PROMPT: "0",
    GIT_ASKPASS: FALSE_PROGRAM,
    SSH_ASKPASS: FALSE_PROGRAM,
    GIT_NO_REPLACE_OBJECTS: "1",
    GIT_OPTIONAL_LOCKS: "0",
    ...extra,
  };
}

export function redactLocalPaths(value, pathsToRedact) {
  let result = value;
  const candidates = [...new Set(pathsToRedact.filter(Boolean))].sort((left, right) => right.length - left.length);
  for (const candidate of candidates) {
    result = result.replaceAll(candidate, "[local-path]");
    result = result.replaceAll(candidate.split(sep).join("/"), "[local-path]");
  }
  return result;
}

export function run(command, args, cwd, timeout = 60_000, env = safeEnvironment()) {
  return new Promise((resolvePromise, reject) => {
    execFile(command, args, { cwd, timeout, maxBuffer: 2 * 1024 * 1024, encoding: "buffer", env }, (error, stdout, stderr) => {
      const output = Buffer.isBuffer(stdout) ? stdout : Buffer.from(stdout ?? "");
      const diagnostics = Buffer.isBuffer(stderr) ? stderr : Buffer.from(stderr ?? "");
      if (error && typeof error.code !== "number") { reject(new Error("Workspace command could not be executed")); return; }
      resolvePromise({ exitCode: error && typeof error.code === "number" ? error.code : 0, stdout: output, stderr: diagnostics });
    });
  });
}

export function gitArguments(args, credentialHelpers = []) {
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

export async function gitRaw(cwd, args, allowFailure = false, options = {}) {
  const result = await run(GIT, gitArguments(args, options.credentialHelpers ?? []), cwd, options.timeout ?? 60_000, options.env ?? safeEnvironment());
  if (result.exitCode !== 0 && !allowFailure) throw new Error(`Git verification failed for ${args[0] ?? "operation"}`);
  return result;
}

export async function git(cwd, args, allowFailure = false, options = {}) {
  const result = await gitRaw(cwd, args, allowFailure, options);
  return {
    exitCode: result.exitCode,
    stdout: utf8(result.stdout, "Git output").replace(/[\r\n]+$/, ""),
    stderr: utf8(result.stderr, "Git diagnostics").replace(/[\r\n]+$/, ""),
  };
}

export async function pathExists(path) {
  try { await lstat(path); return true; }
  catch (error) { if (error?.code === "ENOENT") return false; throw error; }
}

export async function canonicalDirectory(value, label) {
  const lexical = resolve(value);
  let stat;
  try { stat = await lstat(lexical); } catch { throw new Error(`${label} is missing`); }
  if (!stat.isDirectory() || stat.isSymbolicLink()) throw new Error(`${label} must be a real directory, not a symlink`);
  const canonical = await realpath(lexical);
  if (canonical !== lexical) throw new Error(`${label} traverses a symlink`);
  return canonical;
}

export async function commonDirectory(worktree) {
  const output = (await git(worktree, ["rev-parse", "--git-common-dir"])).stdout;
  return await realpath(resolve(worktree, output));
}

export async function gitDirectory(worktree) {
  const output = (await git(worktree, ["rev-parse", "--absolute-git-dir"])).stdout;
  return await canonicalDirectory(output, "Registered worktree Git directory");
}

export async function symbolicBranch(worktree) {
  const result = await git(worktree, ["symbolic-ref", "-q", "HEAD"], true);
  return result.exitCode === 0 ? result.stdout : undefined;
}

export async function status(worktree) {
  const result = await gitRaw(worktree, ["status", "--porcelain=v1", "-z", "--untracked-files=all"]);
  if (result.exitCode !== 0) throw new Error("Git verification failed for status");
  const raw = result.stdout;
  return { clean: raw.length === 0, digest: sha256(raw), entries: bounded(utf8(raw, "Git status", true).split("\0").filter(Boolean).join("\n"), 32 * 1024) };
}

export async function upstreamState(worktree) {
  const upstream = await git(worktree, ["rev-parse", "--abbrev-ref", "--symbolic-full-name", "@{upstream}"], true);
  if (upstream.exitCode !== 0 || !upstream.stdout) return { upstream: null, ahead: null, behind: null };
  const counts = await git(worktree, ["rev-list", "--left-right", "--count", "HEAD...@{upstream}"], true);
  if (counts.exitCode !== 0) return { upstream: upstream.stdout, ahead: null, behind: null };
  const [ahead, behind] = counts.stdout.trim().split(/\s+/).map(Number);
  if (!Number.isSafeInteger(ahead) || !Number.isSafeInteger(behind)) throw new Error("Git upstream relationship is malformed");
  return { upstream: upstream.stdout, ahead, behind };
}

export async function paths(root) {
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

export async function secureParent(root, path, create) {
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

export async function openRegular(root, path, flags, mode) {
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

export async function systemMountArguments() {
  if (process.platform !== "linux" || process.getuid?.() === 0) throw new Error("Workspace command sandbox requires a non-root Linux operator");
  try { await access(BWRAP, fsConstants.X_OK); } catch { throw new Error("Workspace command sandbox requires the fixed /usr/bin/bwrap runtime"); }
  const result = [];
  for (const path of ["/usr", "/bin", "/lib", "/lib64"]) {
    let stat;
    try { stat = await lstat(path); } catch (error) { if (error?.code === "ENOENT") continue; throw error; }
    if (stat.isSymbolicLink()) result.push("--symlink", await readlink(path), path);
    else if (stat.isDirectory()) result.push("--ro-bind", path, path);
    else throw new Error("Workspace command sandbox system runtime layout is unsupported");
  }
  return result;
}

export async function nodeRuntimeMountArguments() {
  const executable = await realpath(process.execPath);
  const stat = await lstat(executable);
  if (!stat.isFile()) throw new Error("Workspace command sandbox Node runtime is not a regular file");
  try { await access(executable, fsConstants.X_OK); } catch { throw new Error("Workspace command sandbox Node runtime is not executable"); }
  return ["--dir", "/runtime", "--ro-bind", executable, "/runtime/node"];
}
