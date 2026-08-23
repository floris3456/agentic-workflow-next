import assert from "node:assert/strict";
import { chmodSync, cpSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { spawnSync } from "node:child_process";
import test from "node:test";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const identity = {
  ...process.env,
  GIT_AUTHOR_NAME: "Template Test",
  GIT_AUTHOR_EMAIL: "template-test@example.invalid",
  GIT_COMMITTER_NAME: "Template Test",
  GIT_COMMITTER_EMAIL: "template-test@example.invalid",
  GIT_AUTHOR_DATE: "2026-01-01T00:00:00Z",
  GIT_COMMITTER_DATE: "2026-01-01T00:00:00Z",
};

function git(cwd, args, expected = 0, environment = identity) {
  const result = spawnSync("git", args, { cwd, env: environment, encoding: "utf8" });
  assert.equal(result.status, expected, `git ${args.join(" ")}\nstdout: ${result.stdout}\nstderr: ${result.stderr}`);
  return result.stdout.trim();
}

function copyExecutable(source, target) {
  mkdirSync(dirname(target), { recursive: true });
  cpSync(source, target);
  chmodSync(target, 0o755);
}

function populate(repository, marker) {
  mkdirSync(join(repository, "docs", "work", "current"), { recursive: true });
  mkdirSync(join(repository, "scripts"), { recursive: true });
  mkdirSync(join(repository, ".githooks"), { recursive: true });
  writeFileSync(join(repository, "AGENTS.md"), "# Test workflow\n");
  writeFileSync(join(repository, "opencode.json"), "{}\n");
  writeFileSync(join(repository, "docs", "work", "current", "README.md"), "# Current work\n");
  writeFileSync(join(repository, "tree-marker.txt"), `${marker}\n`);
  copyExecutable(join(root, "scripts", "bootstrap-agent-workflow.sh"), join(repository, "scripts", "bootstrap-agent-workflow.sh"));
  copyExecutable(join(root, "scripts", "initialize-template-branches.sh"), join(repository, "scripts", "initialize-template-branches.sh"));
  for (const hook of ["pre-commit", "pre-merge-commit", "pre-push"]) {
    copyExecutable(join(root, ".githooks", hook), join(repository, ".githooks", hook));
  }
}

function rootBranch(parent, remote, branch, marker, options = {}) {
  const repository = join(parent, `${branch}-source`);
  mkdirSync(repository);
  git(repository, ["init", "-b", branch]);
  populate(repository, marker);
  if (options.activeTask) writeFileSync(join(repository, "docs", "work", "current", "ACTIVE.md"), "# Active task\n");
  if (options.mismatchedTreeShape) writeFileSync(join(repository, "developer-only.txt"), "unexpected root shape\n");
  git(repository, ["add", "."]);
  const commitIdentity = options.mismatchedAuthorDate
    ? { ...identity, GIT_AUTHOR_DATE: "2026-01-02T00:00:00Z" }
    : identity;
  git(repository, ["commit", "-m", options.subject ?? "Initial commit"], 0, commitIdentity);
  if (options.established) {
    writeFileSync(join(repository, "established-work.txt"), "not fresh\n");
    git(repository, ["add", "."]);
    git(repository, ["commit", "-m", "established work"]);
  }
  git(repository, ["remote", "add", "origin", remote]);
  git(repository, ["push", "origin", `${branch}:refs/heads/${branch}`]);
  return git(repository, ["rev-parse", "HEAD"]);
}

function fixture(context, options = {}) {
  const directory = mkdtempSync(join(tmpdir(), "template-branch-test-"));
  context.after(() => rmSync(directory, { recursive: true, force: true }));
  const remote = join(directory, "remote.git");
  mkdirSync(remote);
  git(remote, ["init", "--bare"]);
  const main = rootBranch(directory, remote, "main", "main", { activeTask: options.activeTask });
  const developer = rootBranch(directory, remote, "developer", "developer", {
    established: options.establishedDeveloper,
    subject: options.mismatchedSubject ? "Different root" : "Initial commit",
    mismatchedAuthorDate: options.mismatchedAuthorDate,
    mismatchedTreeShape: options.mismatchedTreeShape,
    activeTask: options.activeTask,
  });
  const checkout = join(directory, "checkout");
  git(directory, ["clone", "--branch", "developer", ...(options.shallow ? ["--depth", "1", "--no-single-branch", pathToFileURL(remote).href] : [remote]), checkout]);
  if (!options.shallow) git(checkout, ["fetch", "origin", "main:refs/remotes/origin/main"]);
  git(checkout, ["config", "core.hooksPath", ".githooks"]);
  return { checkout, main, developer };
}

function sharedAncestryFixture(context) {
  const directory = mkdtempSync(join(tmpdir(), "template-branch-shared-test-"));
  context.after(() => rmSync(directory, { recursive: true, force: true }));
  const remote = join(directory, "remote.git");
  mkdirSync(remote);
  git(remote, ["init", "--bare"]);
  const source = join(directory, "source");
  mkdirSync(source);
  git(source, ["init", "-b", "developer"]);
  populate(source, "shared");
  git(source, ["add", "."]);
  git(source, ["commit", "-m", "Initial commit"]);
  const developer = git(source, ["rev-parse", "HEAD"]);
  git(source, ["checkout", "-b", "main"]);
  writeFileSync(join(source, "main-only.txt"), "main diverged\n");
  git(source, ["add", "."]);
  git(source, ["commit", "-m", "Main diverged"]);
  git(source, ["remote", "add", "origin", remote]);
  git(source, ["push", "origin", "main:refs/heads/main", "developer:refs/heads/developer"]);
  const checkout = join(directory, "checkout");
  git(directory, ["clone", "--branch", "developer", remote, checkout]);
  git(checkout, ["fetch", "origin", "main:refs/remotes/origin/main"]);
  git(checkout, ["config", "core.hooksPath", ".githooks"]);
  return { checkout, developer };
}

test("fresh unrelated template branches are repaired without changing the developer tree", (context) => {
  const { checkout, main, developer } = fixture(context);
  const oldTree = git(checkout, ["rev-parse", `${developer}^{tree}`]);
  const result = spawnSync("./scripts/initialize-template-branches.sh", [], { cwd: checkout, env: identity, encoding: "utf8" });
  assert.equal(result.status, 0, result.stderr);
  const repaired = git(checkout, ["rev-parse", "origin/developer"]);
  assert.notEqual(repaired, developer);
  assert.equal(git(checkout, ["rev-parse", `${repaired}^1`]), main);
  assert.equal(git(checkout, ["rev-parse", `${repaired}^{tree}`]), oldTree);
  assert.equal(git(checkout, ["rev-parse", `refs/agentic-workflow/backups/template-repair/${developer}`]), developer);
  assert.equal(git(checkout, ["status", "--porcelain"]), "");

  const second = spawnSync("./scripts/initialize-template-branches.sh", [], { cwd: checkout, env: identity, encoding: "utf8" });
  assert.equal(second.status, 0, second.stderr);
  assert.match(second.stdout, /no repair is needed/);
  assert.equal(git(checkout, ["rev-parse", "origin/developer"]), repaired);
});

test("unrelated established or shallow history is refused without rewriting remote state", (context) => {
  const { checkout, developer } = fixture(context, { establishedDeveloper: true });
  const result = spawnSync("./scripts/initialize-template-branches.sh", [], { cwd: checkout, env: identity, encoding: "utf8" });
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /not a one-commit fresh-template root/);
  git(checkout, ["fetch", "origin", "developer"]);
  assert.equal(git(checkout, ["rev-parse", "origin/developer"]), developer);

  const shallow = fixture(context, { shallow: true });
  const shallowResult = spawnSync("./scripts/initialize-template-branches.sh", [], { cwd: shallow.checkout, env: identity, encoding: "utf8" });
  assert.notEqual(shallowResult.status, 0);
  assert.match(shallowResult.stderr, /Fetch complete branch history/);
  assert.equal(git(shallow.checkout, ["rev-parse", "origin/developer"]), shallow.developer);
});

test("one-commit unrelated roots without a matching generated fingerprint are refused", (context) => {
  for (const options of [
    { mismatchedSubject: true },
    { mismatchedAuthorDate: true },
    { mismatchedTreeShape: true },
  ]) {
    const { checkout, developer } = fixture(context, options);
    const result = spawnSync("./scripts/initialize-template-branches.sh", [], { cwd: checkout, env: identity, encoding: "utf8" });
    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /do not share template-generation commit metadata and tree shape/);
    git(checkout, ["fetch", "origin", "developer"]);
    assert.equal(git(checkout, ["rev-parse", "origin/developer"]), developer);
  }
});

test("local HEAD differing from origin/developer is refused", (context) => {
  const { checkout, developer } = fixture(context);
  writeFileSync(join(checkout, "local-only.txt"), "local commit\n");
  git(checkout, ["add", "."]);
  git(checkout, ["-c", "core.hooksPath=/dev/null", "commit", "-m", "Local only"]);
  const result = spawnSync("./scripts/initialize-template-branches.sh", [], { cwd: checkout, env: identity, encoding: "utf8" });
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /Local developer must equal origin\/developer/);
  assert.equal(git(checkout, ["rev-parse", "origin/developer"]), developer);
});

test("shared ancestry that does not descend from main is refused", (context) => {
  const { checkout, developer } = sharedAncestryFixture(context);
  const result = spawnSync("./scripts/initialize-template-branches.sh", [], { cwd: checkout, env: identity, encoding: "utf8" });
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /share ancestry/);
  assert.equal(git(checkout, ["rev-parse", "origin/developer"]), developer);
});

test("a dirty working tree is refused", (context) => {
  const { checkout, developer } = fixture(context);
  writeFileSync(join(checkout, "untracked.txt"), "dirty\n");
  const result = spawnSync("./scripts/initialize-template-branches.sh", [], { cwd: checkout, env: identity, encoding: "utf8" });
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /Working tree must be clean/);
  assert.equal(git(checkout, ["rev-parse", "origin/developer"]), developer);
});

test("an active task record is refused", (context) => {
  const { checkout, developer } = fixture(context, { activeTask: true });
  const result = spawnSync("./scripts/initialize-template-branches.sh", [], { cwd: checkout, env: identity, encoding: "utf8" });
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /blocked by an active task record/);
  assert.equal(git(checkout, ["rev-parse", "origin/developer"]), developer);
});
