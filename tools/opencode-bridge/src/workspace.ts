import { execFile } from "node:child_process";
import { lstat, realpath } from "node:fs/promises";
import { resolve } from "node:path";
import type { GitHubRepositoryIdentity } from "./repository-identity.js";
import { assertRepositoryRemote } from "./repository-identity.js";

interface WorktreeEntry {
  path: string;
  head: string;
  branch?: string;
  bare?: boolean;
  prunable?: boolean;
}

export interface TemplateDevelopmentGitState {
  templateDevelopmentSha: string;
  ref: "template-development";
  clean: boolean;
}

export interface ResolvedTemplateDevelopmentWorktree extends TemplateDevelopmentGitState {
  directory: string;
  remoteSha: string | null;
}

export interface TemplateDevelopmentWorktreeResolverOptions {
  repositoryRoot: string;
  identity: GitHubRepositoryIdentity;
  fetchRemote?: boolean;
}

function git(
  cwd: string,
  args: string[],
  label: string,
  allowFailure = false,
): Promise<string | undefined> {
  return new Promise((resolvePromise, reject) => {
    execFile("git", args, {
      cwd,
      encoding: "utf8",
      timeout: 60_000,
      maxBuffer: 2 * 1024 * 1024,
    }, (error, stdout) => {
      if (error) {
        if (allowFailure) {
          resolvePromise(undefined);
          return;
        }
        reject(new Error(label));
        return;
      }
      resolvePromise(String(stdout).replace(/[\r\n]+$/, ""));
    });
  });
}

async function canonicalDirectory(value: string, label: string): Promise<string> {
  const lexical = resolve(value);
  try {
    const stat = await lstat(lexical);
    if (!stat.isDirectory() || stat.isSymbolicLink()) throw new Error(label);
    const canonical = await realpath(lexical);
    if (canonical !== lexical) throw new Error(label);
    return canonical;
  } catch {
    throw new Error(label);
  }
}

async function commonDirectory(worktree: string): Promise<string> {
  const value = await git(worktree, ["rev-parse", "--git-common-dir"], "Git common-directory verification failed");
  return await realpath(resolve(worktree, value!));
}

export function parseWorktreeInventory(value: string): WorktreeEntry[] {
  if (typeof value !== "string" || !value.includes("\0")) {
    throw new Error("Git worktree inventory is not NUL-delimited porcelain");
  }
  const entries: WorktreeEntry[] = [];
  let current: Partial<WorktreeEntry> | undefined;
  const finish = () => {
    if (!current) return;
    if (!current.path || !current.head) throw new Error("Git worktree inventory is incomplete");
    entries.push(current as WorktreeEntry);
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
    if (!current) throw new Error("Git worktree inventory is malformed");
    if (key === "HEAD") current.head = field;
    else if (key === "branch") current.branch = field;
    else if (key === "bare") current.bare = true;
    else if (key === "prunable") current.prunable = true;
    else if (key === "detached" || key === "locked") continue;
    else throw new Error("Git worktree inventory contains an unsupported field");
  }
  finish();
  if (entries.length === 0) throw new Error("Git worktree inventory is empty");
  return entries;
}

export class TemplateDevelopmentWorktreeResolver {
  private readonly repositoryRoot: string;
  private readonly identity: GitHubRepositoryIdentity;
  private readonly fetchRemote: boolean;

  constructor(options: TemplateDevelopmentWorktreeResolverOptions) {
    this.repositoryRoot = options.repositoryRoot;
    this.identity = options.identity;
    this.fetchRemote = options.fetchRemote !== false;
  }

  private async resolve(
    requireSynchronized: boolean,
    expectedDirectory?: string,
  ): Promise<ResolvedTemplateDevelopmentWorktree> {
    const root = await canonicalDirectory(this.repositoryRoot, "Bridge repository root verification failed");
    const top = await canonicalDirectory(
      (await git(root, ["rev-parse", "--show-toplevel"], "Bridge Git root verification failed"))!,
      "Bridge Git root verification failed",
    );
    if (top !== root) throw new Error("Bridge repository root verification failed");

    const rootOrigin = (await git(root, ["remote", "get-url", "origin"], "Bridge origin verification failed"))!;
    assertRepositoryRemote(rootOrigin, this.identity);
    if (requireSynchronized && this.fetchRemote) {
      await git(
        root,
        ["fetch", "--no-tags", "origin", "refs/heads/template-development:refs/remotes/origin/template-development"],
        "Template-development remote synchronization failed",
      );
    }

    const inventory = parseWorktreeInventory(
      (await git(root, ["worktree", "list", "--porcelain", "-z"], "Git worktree inventory failed"))!,
    );
    const candidates = inventory.filter((entry) => entry.branch === "refs/heads/template-development");
    if (candidates.length !== 1) {
      throw new Error(candidates.length === 0
        ? "Registered template-development worktree is missing"
        : "Registered template-development worktree is ambiguous");
    }
    const entry = candidates[0]!;
    if (entry.bare || entry.prunable) throw new Error("Registered template-development worktree is stale");

    const directory = await canonicalDirectory(
      entry.path,
      "Registered template-development worktree must be a real non-symlink directory",
    );
    if (expectedDirectory !== undefined && directory !== resolve(expectedDirectory)) {
      throw new Error("Registered template-development worktree changed during the mapped session");
    }
    const targetTop = await canonicalDirectory(
      (await git(directory, ["rev-parse", "--show-toplevel"], "Template-development Git root verification failed"))!,
      "Template-development Git root verification failed",
    );
    if (targetTop !== directory) throw new Error("Template-development Git root verification failed");
    if (await commonDirectory(directory) !== await commonDirectory(root)) {
      throw new Error("Template-development worktree does not belong to the bridge repository");
    }

    const targetOrigin = (await git(directory, ["remote", "get-url", "origin"], "Template-development origin verification failed"))!;
    assertRepositoryRemote(targetOrigin, this.identity);
    if (targetOrigin !== rootOrigin) throw new Error("Template-development origin differs from the bridge repository");

    const [head, branch, status, upstream] = await Promise.all([
      git(directory, ["rev-parse", "HEAD"], "Template-development HEAD verification failed"),
      git(directory, ["symbolic-ref", "-q", "HEAD"], "Template-development branch verification failed"),
      git(directory, ["status", "--porcelain=v1", "-z", "--untracked-files=all"], "Template-development status verification failed"),
      git(directory, ["rev-parse", "--abbrev-ref", "--symbolic-full-name", "@{upstream}"], "Template-development upstream verification failed", true),
    ]);
    if (head !== entry.head || branch !== "refs/heads/template-development") {
      throw new Error("Registered template-development worktree changed during verification");
    }
    if (upstream !== undefined && upstream !== "origin/template-development") {
      throw new Error("Template-development upstream is not origin/template-development");
    }

    const remoteSha = await git(
      root,
      ["rev-parse", "refs/remotes/origin/template-development"],
      "Template-development remote ref verification failed",
      !requireSynchronized,
    );
    const clean = status === "";
    if (requireSynchronized && (remoteSha === undefined || head !== remoteSha || !clean)) {
      throw new Error("Template-development must be clean and synchronized to origin/template-development");
    }
    return {
      directory,
      templateDevelopmentSha: head!,
      ref: "template-development",
      clean,
      remoteSha: remoteSha ?? null,
    };
  }

  async resolveRuntime(expectedDirectory?: string): Promise<ResolvedTemplateDevelopmentWorktree> {
    return await this.resolve(false, expectedDirectory);
  }

  async synchronizedState(expectedDirectory?: string): Promise<TemplateDevelopmentGitState> {
    const resolved = await this.resolve(true, expectedDirectory);
    return {
      templateDevelopmentSha: resolved.templateDevelopmentSha,
      ref: resolved.ref,
      clean: resolved.clean,
    };
  }
}
