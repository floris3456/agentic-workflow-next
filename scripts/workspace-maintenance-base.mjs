import { constants as fsConstants } from "node:fs";
import { lstat, readlink, realpath, unlink } from "node:fs/promises";
import { resolve } from "node:path";
import {
  MAX_FILE_BYTES,
  MAX_RESULTS,
  bounded,
  canonicalDirectory,
  commonDirectory,
  git,
  gitRaw,
  globExpression,
  inside,
  openRegular,
  parseWorktreePorcelain,
  paths,
  secureParent,
  status,
  symbolicBranch,
  targetName,
  targetSyntax,
  upstreamState,
  utf8,
} from "./workspace-maintenance-common.mjs";

export class WorkspaceMaintenanceBase {
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
    return { root, common, origin, entries: parseWorktreePorcelain(utf8(raw, "Git worktree inventory", true)) };
  }

  async verifyEntry(inventory, entry) {
    if (entry.bare || entry.prunable) throw new Error("Registered worktree is stale or non-working");
    const worktree = await canonicalDirectory(entry.path, "Registered worktree");
    const top = await canonicalDirectory((await git(worktree, ["rev-parse", "--show-toplevel"])).stdout, "Registered Git root");
    if (top !== worktree) throw new Error("Registered worktree path is not its Git root");
    if (await commonDirectory(worktree) !== inventory.common) throw new Error("Target does not belong to the instruction root's exact Git repository");
    if ((await git(worktree, ["remote", "get-url", "origin"])).stdout !== inventory.origin) throw new Error("Target repository identity does not match the instruction root");
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
    if (verified.entry.branch !== "refs/heads/template-development") throw new Error("Workspace Maintenance Agent must remain rooted on template-development");
    return { inventory, verified };
  }

  async list() {
    const { inventory } = await this.authority();
    const targets = [];
    let rejected = 0;
    for (const entry of inventory.entries) {
      try { targets.push((await this.verifyEntry(inventory, entry)).public); } catch { rejected++; }
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
    const matches = inventory.entries.filter((entry) => selection.type === "head" ? entry.detached && entry.head === selection.value : entry.branch === selection.value);
    if (matches.length !== 1) throw new Error(matches.length === 0
      ? "Workspace target is not a registered worktree of this repository"
      : "Workspace target is ambiguous across registered worktrees");
    return await this.verifyEntry(inventory, matches[0]);
  }

  async inspect(target) { return (await this.target(target)).public; }

  async preflight(target, expectedHead, expectedStatusDigest) {
    if (typeof expectedHead !== "string" || !/^[0-9a-f]{40}$/.test(expectedHead)) throw new Error("expected_head must be an exact lowercase commit SHA");
    if (typeof expectedStatusDigest !== "string" || !/^[0-9a-f]{64}$/.test(expectedStatusDigest)) throw new Error("expected_status_digest must be an exact inspection digest");
    const verified = await this.target(target);
    if (verified.public.head !== expectedHead || verified.public.status_digest !== expectedStatusDigest) throw new Error("Workspace target changed since its inspected preflight state");
    return verified;
  }

  async read(target, path, offset = 1, limit = 200) {
    const verified = await this.target(target);
    const candidate = await secureParent(verified.worktree, path, false);
    try {
      const stat = await lstat(candidate);
      if (stat.isSymbolicLink()) { await readlink(candidate); throw new Error("Workspace tools do not follow symlinks"); }
    } catch (error) {
      if (error?.message === "Workspace tools do not follow symlinks") throw error;
      throw new Error("Workspace read target is unavailable");
    }
    const { handle, stat } = await openRegular(verified.worktree, path, fsConstants.O_RDONLY, 0o600);
    try {
      if (stat.size > MAX_FILE_BYTES) throw new Error("Workspace read file exceeds 1 MiB");
      const lines = utf8(await handle.readFile(), "Workspace file").split(/\r?\n/);
      const start = Number.isSafeInteger(offset) && offset > 0 ? offset : 1;
      const count = Number.isSafeInteger(limit) && limit > 0 && limit <= 500 ? limit : 200;
      return bounded(lines.slice(start - 1, start - 1 + count).map((line, index) => `${start + index}: ${line}`).join("\n"));
    } finally { await handle.close(); }
  }

  async write(target, path, content, expectedHead, expectedStatusDigest) {
    const verified = await this.preflight(target, expectedHead, expectedStatusDigest);
    if (typeof content !== "string" || Buffer.byteLength(content, "utf8") > MAX_FILE_BYTES || content.includes("\0")) throw new Error("Workspace write content must be bounded UTF-8 text no larger than 1 MiB");
    const { handle } = await openRegular(verified.worktree, path, fsConstants.O_WRONLY | fsConstants.O_CREAT | fsConstants.O_TRUNC, 0o644);
    try { await handle.writeFile(content, "utf8"); await handle.sync(); } finally { await handle.close(); }
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
    if (typeof query !== "string" || query.length === 0 || query.length > 1024 || query.includes("\0")) throw new Error("Workspace grep query must be bounded literal text");
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
        try { lines = utf8(await handle.readFile(), entry.name).split(/\r?\n/); } finally { await handle.close(); }
      } catch { continue; }
      for (let index = 0; index < lines.length; index++) {
        if (lines[index].includes(query)) results.push(`${entry.name}:${index + 1}: ${lines[index]}`);
        if (results.length >= MAX_RESULTS) return bounded(results.join("\n"));
      }
    }
    return bounded(results.join("\n"));
  }
}
