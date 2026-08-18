import { isAbsolute, join, relative, resolve, sep } from "node:path";
import { lstat, readdir, writeFile } from "node:fs/promises";
import {
  FALSE_PROGRAM,
  SYSTEM_PATH,
  commonDirectory,
  git,
  gitDirectory,
  gitRaw,
  pathExists,
  run,
  safeEnvironment,
  utf8,
} from "./workspace-maintenance-common.mjs";

async function scopedConfigNames(worktree, scope, env) {
  const result = await git(worktree, ["config", scope, "--no-includes", "--name-only", "--list"], true, { env });
  if (result.exitCode !== 0) throw new Error(`Workspace publication could not inspect ${scope.slice(2)} Git configuration`);
  return result.stdout.split(/\r?\n/).filter(Boolean).map((name) => name.toLowerCase());
}

async function assertSafeGitMetadata(verified, publicationEnv) {
  const names = await scopedConfigNames(verified.worktree, "--local", publicationEnv);
  const worktreeConfig = await git(
    verified.worktree,
    ["config", "--local", "--no-includes", "--bool", "--get", "extensions.worktreeConfig"],
    true,
    { env: publicationEnv },
  );
  if (worktreeConfig.exitCode === 0 && worktreeConfig.stdout === "true") {
    names.push(...await scopedConfigNames(verified.worktree, "--worktree", publicationEnv));
  } else if (![0, 1].includes(worktreeConfig.exitCode)) {
    throw new Error("Workspace publication could not determine worktree Git configuration scope");
  }

  const unsafe = names.find((name) => name === "include.path" || name.startsWith("includeif.")
    || (name.startsWith("url.") && (name.endsWith(".insteadof") || name.endsWith(".pushinsteadof")))
    || (name.startsWith("remote.") && [".pushurl", ".receivepack", ".uploadpack", ".proxy"].some((suffix) => name.endsWith(suffix)))
    || name === "core.sshcommand" || name === "core.askpass"
    || name.startsWith("credential.") || name.startsWith("http."));
  if (unsafe) throw new Error("Workspace publication rejects Git configuration that can redirect transport or execute helpers");

  const common = await commonDirectory(verified.worktree);
  if (await pathExists(join(common, "objects", "info", "alternates"))) throw new Error("Workspace publication rejects alternate Git object directories");
  const replace = join(common, "refs", "replace");
  if (await pathExists(replace) && (await readdir(replace)).length > 0) throw new Error("Workspace publication rejects Git replace refs");
}

async function walkFiles(root) {
  const output = [];
  const visit = async (directory) => {
    for (const entry of await readdir(directory, { withFileTypes: true })) {
      if (directory === root && entry.name === ".git") continue;
      const absolute = resolve(directory, entry.name);
      const name = relative(root, absolute).split(sep).join("/");
      if (entry.isDirectory() && !entry.isSymbolicLink()) await visit(absolute);
      else output.push({ absolute, name, symlink: entry.isSymbolicLink() });
      if (output.length > 50_000) throw new Error("Workspace traversal exceeds the 50000-entry limit");
    }
  };
  await visit(root);
  return output;
}

async function assertNoGitFilters(verified, publicationEnv) {
  const files = (await walkFiles(verified.worktree)).filter((entry) => !entry.symlink);
  for (let index = 0; index < files.length; index += 100) {
    const names = files.slice(index, index + 100).map((entry) => entry.name);
    if (names.length === 0) continue;
    const result = await gitRaw(verified.worktree, ["check-attr", "-z", "filter", "working-tree-encoding", "--", ...names], false, { env: publicationEnv });
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

async function commitIdentity(verified, publicationEnv) {
  const result = await gitRaw(verified.worktree, ["show", "-s", "--format=%an%x00%ae%x00%cn%x00%ce", "HEAD"], false, { env: publicationEnv });
  const [authorName, authorEmail, committerName, committerEmail] = utf8(result.stdout, "Git identity", true).replace(/[\r\n]+$/, "").split("\0");
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
    GIT_ASKPASS: FALSE_PROGRAM,
    SSH_ASKPASS: FALSE_PROGRAM,
  };
  const result = await run("/usr/bin/git", ["config", "--global", "--no-includes", "--get-all", "credential.helper"], worktree, 60_000, environment);
  if (result.exitCode !== 0) return [];
  const helpers = utf8(result.stdout, "Git credential helper configuration").split(/\r?\n/).filter(Boolean);
  const allowed = /^(?:store|cache|libsecret|manager|manager-core|osxkeychain|wincred)$/;
  if (helpers.some((helper) => !allowed.test(helper))) throw new Error("Workspace publication rejects executable or parameterized credential helpers");
  return helpers;
}

async function originForPublication(verified, fixtureOrigins, publicationEnv) {
  const origin = (await git(verified.worktree, ["remote", "get-url", "--all", "origin"], false, { env: publicationEnv })).stdout.split(/\r?\n/).filter(Boolean);
  if (origin.length !== 1) throw new Error("Workspace publication requires exactly one verified origin URL");
  if (/^https:\/\//i.test(origin[0])) {
    let url;
    try { url = new URL(origin[0]); } catch { throw new Error("Workspace publication origin is malformed"); }
    if (url.username || url.password || url.search || url.hash) throw new Error("Workspace publication origin must not embed credentials or query data");
    if (url.protocol !== "https:" || url.hostname.toLowerCase() !== "github.com" || url.port
      || !/^\/[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+\.git$/.test(url.pathname)) {
      throw new Error("Workspace publication requires a canonical credential-free GitHub HTTPS origin");
    }
  } else {
    const fixture = isAbsolute(origin[0]) ? resolve(origin[0]) : undefined;
    if (!fixture || !fixtureOrigins.has(fixture)) throw new Error("Workspace publication supports local origins only when the host explicitly registers an exact test fixture");
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

export async function publishWorkspace(gate, target, message, expectedHead, expectedStatusDigest) {
  const verified = await gate.preflight(target, expectedHead, expectedStatusDigest);
  if (!verified.entry.branch?.startsWith("refs/heads/")) throw new Error("Workspace publication requires an attached registered branch worktree");
  const branch = verified.entry.branch.slice("refs/heads/".length);
  if (branch === "main") throw new Error("Workspace publication mechanically denies main; exact-SHA human promotion remains separate");
  if (typeof message !== "string" || message.length === 0 || message.length > 4_000 || message.includes("\0")) throw new Error("Workspace publication commit message must be bounded text");
  if (verified.public.clean) throw new Error("Workspace publication requires inspected working-tree changes");
  const marker = await synchronizationMarker(verified, branch);
  if (await pathExists(marker)) throw new Error("Workspace publication is blocked by unresolved synchronization state");
  if (verified.public.upstream !== `origin/${branch}` || verified.public.ahead !== 0 || verified.public.behind !== 0) throw new Error("Workspace publication requires an exactly synchronized origin tracking branch");

  const publicationEnv = safeEnvironment({
    ...(typeof process.env.HOME === "string" ? { HOME: process.env.HOME } : {}),
    GIT_ASKPASS: FALSE_PROGRAM,
    SSH_ASKPASS: FALSE_PROGRAM,
  });
  await assertSafeGitMetadata(verified, publicationEnv);
  await assertNoGitFilters(verified, publicationEnv);
  const origin = await originForPublication(verified, gate.fixtureOrigins, publicationEnv);
  const helpers = /^https:\/\//i.test(origin) ? await credentialHelpers(verified.worktree) : [];
  const remoteRef = `refs/heads/${branch}`;
  const before = await git(verified.worktree, ["ls-remote", "--heads", "--", origin, remoteRef], false, { env: publicationEnv, credentialHelpers: helpers });
  const remoteBefore = before.stdout ? before.stdout.split(/\s+/)[0] : undefined;
  if (remoteBefore !== expectedHead) throw new Error("Workspace publication refuses a missing, stale, or advanced canonical branch head");

  const identity = await commitIdentity(verified, publicationEnv);
  const commitEnvironment = safeEnvironment({
    GIT_AUTHOR_NAME: identity.authorName,
    GIT_AUTHOR_EMAIL: identity.authorEmail,
    GIT_COMMITTER_NAME: identity.committerName,
    GIT_COMMITTER_EMAIL: identity.committerEmail,
    GIT_ASKPASS: FALSE_PROGRAM,
    SSH_ASKPASS: FALSE_PROGRAM,
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
    committed = await gate.inspect(target);
    if (committed.head === expectedHead || !committed.clean) throw new Error("Workspace publication did not produce one clean branch commit");
    const pushed = await git(
      verified.worktree,
      ["push", "--porcelain", "--no-verify", "--no-recurse-submodules", "--", origin, `${committed.head}:${remoteRef}`],
      true,
      { env: publicationEnv, credentialHelpers: helpers, timeout: 180_000 },
    );
    if (pushed.exitCode !== 0) throw new Error("Workspace publication push failed");
    const after = await git(verified.worktree, ["ls-remote", "--heads", "--", origin, remoteRef], false, { env: publicationEnv, credentialHelpers: helpers });
    const remoteAfter = after.stdout ? after.stdout.split(/\s+/)[0] : undefined;
    if (remoteAfter !== committed.head) throw new Error("Workspace publication remote readback was ambiguous");
    const tracking = `refs/remotes/origin/${branch}`;
    const priorTracking = await git(verified.worktree, ["rev-parse", "--verify", tracking], true);
    if (priorTracking.exitCode === 0) await git(verified.worktree, ["update-ref", tracking, committed.head, priorTracking.stdout]);
  } catch {
    if (!commitCreated) throw new Error("Workspace publication failed before creating a commit; reinspect the target state");
    const commit = committed?.head ?? (await git(verified.worktree, ["rev-parse", "HEAD"])).stdout;
    await writeFile(marker, `${branch}\n${commit}\n${new Date().toISOString().replace(/\.\d{3}Z$/, "Z")}\n`, { mode: 0o600 });
    throw new Error(`Workspace publication failed after local commit ${commit}; synchronization recovery is required`);
  }
  return { target: branch, commit: committed.head, remote_ref: remoteRef, remote_verified: true, target_state: await gate.inspect(target) };
}
