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

function git(cwd, args, expected = 0) {
  const result = spawnSync("git", args, { cwd, env: identity, encoding: "utf8" });
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
  for (const hook of ["pre-commit", "pre-merge-commit", "post-commit", "pre-push"]) {
    copyExecutable(join(root, ".githooks", hook), join(repository, ".githooks", hook));
  }
}

function rootBranch(parent, remote, branch, marker, extraCommit = false, subject = "Initial commit") {
  const repository = join(parent, `${branch}-source`);
  mkdirSync(repository);
  git(repository, ["init", "-b", branch]);
  populate(repository, marker);
  git(repository, ["add", "."]);
  git(repository, ["commit", "-m", subject]);
  if (extraCommit) {
    writeFileSync(join(repository, "established-work.txt"), "not fresh\n");
    git(repository, ["add", "."]);
    git(repository, ["commit", "-m", "established work"]);
  }
  git(repository, ["remote", "add", "origin", remote]);
  git(repository, ["push", "origin", `${branch}:refs/heads/${branch}`]);
  return git(repository, ["rev-parse", "HEAD"]);
}

function fixture(context, establishedDeveloper = false, mismatchedMetadata = false, shallow = false) {
  const directory = mkdtempSync(join(tmpdir(), "template-branch-test-"));
  context.after(() => rmSync(directory, { recursive: true, force: true }));
  const remote = join(directory, "remote.git");
  mkdirSync(remote);
  git(remote, ["init", "--bare"]);
  const main = rootBranch(directory, remote, "main", "main");
  const developer = rootBranch(directory, remote, "developer", "developer", establishedDeveloper, mismatchedMetadata ? "Different root" : "Initial commit");
  const checkout = join(directory, "checkout");
  git(directory, ["clone", "--branch", "developer", ...(shallow ? ["--depth", "1", "--no-single-branch", pathToFileURL(remote).href] : [remote]), checkout]);
  if (!shallow) git(checkout, ["fetch", "origin", "main:refs/remotes/origin/main"]);
  git(checkout, ["config", "core.hooksPath", ".githooks"]);
  return { checkout, main, developer };
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
  assert.equal(git(checkout, ["status", "--porcelain"]), "");

  const second = spawnSync("./scripts/initialize-template-branches.sh", [], { cwd: checkout, env: identity, encoding: "utf8" });
  assert.equal(second.status, 0, second.stderr);
  assert.match(second.stdout, /no repair is needed/);
  assert.equal(git(checkout, ["rev-parse", "origin/developer"]), repaired);
});

test("unrelated established or shallow history is refused without rewriting remote state", (context) => {
  const { checkout, developer } = fixture(context, true);
  const result = spawnSync("./scripts/initialize-template-branches.sh", [], { cwd: checkout, env: identity, encoding: "utf8" });
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /not a one-commit fresh-template root/);
  git(checkout, ["fetch", "origin", "developer"]);
  assert.equal(git(checkout, ["rev-parse", "origin/developer"]), developer);

  const shallow = fixture(context, false, false, true);
  const shallowResult = spawnSync("./scripts/initialize-template-branches.sh", [], { cwd: shallow.checkout, env: identity, encoding: "utf8" });
  assert.notEqual(shallowResult.status, 0);
  assert.match(shallowResult.stderr, /Fetch complete branch history/);
  assert.equal(git(shallow.checkout, ["rev-parse", "origin/developer"]), shallow.developer);
});

test("one-commit unrelated roots without matching generated metadata are refused", (context) => {
  const { checkout, developer } = fixture(context, false, true);
  const result = spawnSync("./scripts/initialize-template-branches.sh", [], { cwd: checkout, env: identity, encoding: "utf8" });
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /do not share template-generation commit metadata/);
  git(checkout, ["fetch", "origin", "developer"]);
  assert.equal(git(checkout, ["rev-parse", "origin/developer"]), developer);
});
