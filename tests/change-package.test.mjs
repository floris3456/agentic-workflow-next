import assert from "node:assert/strict";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { spawnSync } from "node:child_process";
import test from "node:test";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const createScript = join(root, "scripts", "create-change-package.mjs");
const applyScript = join(root, "scripts", "apply-change-package.mjs");
const environment = {
  ...process.env,
  SOURCE_DATE_EPOCH: "1767225600",
  GIT_AUTHOR_NAME: "Template Test",
  GIT_AUTHOR_EMAIL: "template-test@example.invalid",
  GIT_COMMITTER_NAME: "Template Test",
  GIT_COMMITTER_EMAIL: "template-test@example.invalid",
};

function run(command, args, cwd, expected = 0) {
  const result = spawnSync(command, args, { cwd, env: environment, encoding: "utf8" });
  assert.equal(result.status, expected, `${command} ${args.join(" ")}\nstdout: ${result.stdout}\nstderr: ${result.stderr}`);
  return result;
}

function git(cwd, args) {
  return run("git", args, cwd).stdout.trim();
}

function commit(repository, path, content, message) {
  const full = join(repository, path);
  mkdirSync(dirname(full), { recursive: true });
  writeFileSync(full, content);
  git(repository, ["add", path]);
  git(repository, ["commit", "-m", message]);
  return git(repository, ["rev-parse", "HEAD"]);
}

function fixture(context) {
  const directory = mkdtempSync(join(tmpdir(), "template-package-test-"));
  context.after(() => rmSync(directory, { recursive: true, force: true }));
  const source = join(directory, "source");
  mkdirSync(source);
  git(source, ["init", "-b", "developer"]);
  const developerBase = commit(source, "shared.txt", "base\n", "developer base");
  const developerHead = commit(source, "developer-only.txt", "developer change\n", "developer change");
  git(source, ["checkout", "--orphan", "web-orchestration"]);
  git(source, ["rm", "-rf", "."]);
  const webBase = commit(source, "web-orchestration-only/base.md", "base\n", "web base");
  const webHead = commit(source, "web-orchestration-only/change.md", "web change\n", "web change");
  return { directory, source, developerBase, developerHead, webBase, webHead };
}

function createPackage(input, output) {
  return run("node", [
    createScript, "--repository", input.source, "--task-id", "TASK-001",
    "--developer-base", input.developerBase, "--developer-head", input.developerHead,
    "--web-base", input.webBase, "--web-head", input.webHead, "--output", output,
  ], root);
}

test("creates deterministic exact-range patches and manifest", (context) => {
  const input = fixture(context);
  const output = join(input.directory, "package");
  const result = createPackage(input, output);
  assert.match(result.stdout, /developer 1 path\(s\), web-orchestration 1 path\(s\)/);
  const manifest = JSON.parse(readFileSync(join(output, "manifest.json"), "utf8"));
  assert.equal(manifest.task_id, "TASK-001");
  assert.equal(manifest.created_at, "2026-01-01T00:00:00.000Z");
  assert.deepEqual(manifest.ranges.developer.changed_paths, ["developer-only.txt"]);
  assert.deepEqual(manifest.ranges["web-orchestration"].changed_paths, ["web-orchestration-only/change.md"]);
  assert.match(readFileSync(join(output, "developer.patch"), "utf8"), /developer-only\.txt/);
  assert.match(readFileSync(join(output, "web-orchestration.patch"), "utf8"), /web-orchestration-only\/change\.md/);

  const second = join(input.directory, "package-two");
  createPackage(input, second);
  assert.equal(readFileSync(join(output, "manifest.json"), "utf8"), readFileSync(join(second, "manifest.json"), "utf8"));
});

test("refuses non-ancestor ranges and non-empty output", (context) => {
  const input = fixture(context);
  const output = join(input.directory, "not-empty");
  mkdirSync(output);
  writeFileSync(join(output, "keep"), "preserve\n");
  const occupied = spawnSync("node", [
    createScript, "--repository", input.source, "--task-id", "TASK-001",
    "--developer-base", input.developerBase, "--developer-head", input.developerHead,
    "--web-base", input.webBase, "--web-head", input.webHead, "--output", output,
  ], { cwd: root, env: environment, encoding: "utf8" });
  assert.notEqual(occupied.status, 0);
  assert.match(occupied.stderr, /empty directory/);
  assert.equal(readFileSync(join(output, "keep"), "utf8"), "preserve\n");

  const reversed = spawnSync("node", [
    createScript, "--repository", input.source, "--task-id", "TASK-002",
    "--developer-base", input.developerHead, "--developer-head", input.developerBase,
    "--web-base", input.webBase, "--web-head", input.webHead,
    "--output", join(input.directory, "reversed"),
  ], { cwd: root, env: environment, encoding: "utf8" });
  assert.notEqual(reversed.status, 0);
  assert.match(reversed.stderr, /not an ancestor/);
});

test("dry-run and explicit apply preserve branch and cleanliness boundaries", (context) => {
  const input = fixture(context);
  const output = join(input.directory, "package");
  createPackage(input, output);
  const target = join(input.directory, "target");
  mkdirSync(target);
  git(target, ["init", "-b", "developer"]);
  commit(target, "shared.txt", "base\n", "target base");

  const dry = run("node", [applyScript, "--package", output, "--repository", target, "--target", "developer"], root);
  assert.match(dry.stdout, /applies cleanly \(dry run\)/);
  assert.equal(existsSync(join(target, "developer-only.txt")), false);

  const applied = run("node", [applyScript, "--package", output, "--repository", target, "--target", "developer", "--apply"], root);
  assert.match(applied.stdout, /applied to the working tree/);
  assert.equal(readFileSync(join(target, "developer-only.txt"), "utf8"), "developer change\n");

  const dirty = spawnSync("node", [applyScript, "--package", output, "--repository", target, "--target", "developer"], {
    cwd: root, env: environment, encoding: "utf8",
  });
  assert.notEqual(dirty.status, 0);
  assert.match(dirty.stderr, /clean/);

  git(target, ["add", "."]);
  git(target, ["commit", "-m", "apply"]);
  git(target, ["checkout", "-b", "wrong-branch"]);
  const wrong = spawnSync("node", [applyScript, "--package", output, "--repository", target, "--target", "developer"], {
    cwd: root, env: environment, encoding: "utf8",
  });
  assert.notEqual(wrong.status, 0);
  assert.match(wrong.stderr, /must be on developer/);
});
