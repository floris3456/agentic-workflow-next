import assert from "node:assert/strict";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync, copyFileSync, chmodSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { spawnSync, execFileSync } from "node:child_process";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { validateChangePackage, sha256 } from "../scripts/change-package-lib.mjs";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const productionCreate = join(root, "scripts", "create-change-package.mjs");
const productionLib = join(root, "scripts", "change-package-lib.mjs");
const applyScript = join(root, "scripts", "apply-change-package.mjs");
const realGit = execFileSync("which", ["git"], { encoding: "utf8" }).trim();
const canonicalUrl = "https://github.com/floris3456/agentic-workflow-template.git";
const baseEnvironment = {
  ...process.env,
  SOURCE_DATE_EPOCH: "1767225600",
  GIT_AUTHOR_NAME: "Template Test",
  GIT_AUTHOR_EMAIL: "template-test@example.invalid",
  GIT_COMMITTER_NAME: "Template Test",
  GIT_COMMITTER_EMAIL: "template-test@example.invalid",
};

function run(command, args, cwd, expected = 0, env = baseEnvironment) {
  const result = spawnSync(command, args, { cwd, env, encoding: "utf8" });
  assert.equal(result.status, expected, `${command} ${args.join(" ")}\nstdout: ${result.stdout}\nstderr: ${result.stderr}`);
  return result;
}
function git(cwd, args) { return run(realGit, args, cwd).stdout.trim(); }
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
  const remote = join(directory, "canonical.git");
  const source = join(directory, "source");
  mkdirSync(source);
  git(directory, ["init", "--bare", remote]);
  git(source, ["init", "-b", "developer"]);
  const developerBase = commit(source, "shared.txt", "base\n", "developer base");
  const developerHead = commit(source, "developer-only.txt", "developer change\n", "developer change");
  const developerTip = commit(source, "later-unrelated.txt", "later unrelated canonical work\n", "later canonical work");
  git(source, ["remote", "add", "fixture", remote]);
  git(source, ["push", "fixture", "developer"]);
  git(source, ["checkout", "--orphan", "web-orchestration"]);
  git(source, ["rm", "-rf", "."]);
  const webBase = commit(source, "web-orchestration-only/base.md", "base\n", "web base");
  const webHead = commit(source, "web-orchestration-only/change.md", "web change\n", "web change");
  git(source, ["push", "fixture", "web-orchestration"]);
  git(source, ["remote", "remove", "fixture"]);
  git(source, ["remote", "add", "origin", canonicalUrl]);

  const template = join(directory, "template");
  mkdirSync(join(template, "scripts"), { recursive: true });
  copyFileSync(productionCreate, join(template, "scripts", "create-change-package.mjs"));
  copyFileSync(productionLib, join(template, "scripts", "change-package-lib.mjs"));
  const lock = {
    schema_version: 1,
    canonical_repository: canonicalUrl,
    recorded_at: "2026-01-01T00:00:00Z",
    sources: { main: "f".repeat(40), developer: developerBase, "web-orchestration": webBase },
    last_reconciled_task: "PREVIOUS",
    last_change_package: "changes/PREVIOUS/manifest.json",
  };
  writeFileSync(join(template, "source-lock.json"), `${JSON.stringify(lock, null, 2)}\n`);

  const wrapperDir = join(directory, "bin");
  mkdirSync(wrapperDir);
  const wrapper = join(wrapperDir, "git");
  writeFileSync(wrapper, `#!/usr/bin/env node\nimport { spawnSync } from "node:child_process";\nconst args=process.argv.slice(2).map((v)=>v===${JSON.stringify(canonicalUrl)}?${JSON.stringify(remote)}:v);\nconst r=spawnSync(${JSON.stringify(realGit)},args,{stdio:"inherit",env:process.env});\nprocess.exit(r.status ?? 1);\n`);
  chmodSync(wrapper, 0o755);
  const environment = { ...baseEnvironment, PATH: `${wrapperDir}:${baseEnvironment.PATH}` };
  return { directory, remote, source, template, lock, developerBase, developerHead, developerTip, webBase, webHead, environment };
}

function createPackage(input, output, overrides = {}, expected = 0) {
  const args = [
    join(input.template, "scripts", "create-change-package.mjs"),
    "--repository", input.source, "--task-id", overrides.taskId ?? "TASK-001",
    "--developer-base", overrides.developerBase ?? input.developerBase,
    "--developer-head", overrides.developerHead ?? input.developerHead,
    "--web-base", overrides.webBase ?? input.webBase,
    "--web-head", overrides.webHead ?? input.webHead,
    "--output", output,
  ];
  return run("node", args, root, expected, input.environment);
}

test("creates deterministic provenance schema 2 from canonical fetched branch tips", (context) => {
  const input = fixture(context);
  const output = join(input.directory, "package");
  const result = createPackage(input, output);
  assert.match(result.stdout, /provenance-verified/);
  const checked = validateChangePackage(output, "TASK-001");
  assert.equal(checked.schemaVersion, 2);
  assert.equal(checked.provenanceVerified, true);
  assert.equal(checked.manifest.provenance.source_lock.sources.developer, input.developerBase);
  assert.equal(checked.manifest.provenance.canonical_tips.developer, input.developerTip);
  assert.equal(checked.manifest.ranges.developer.head, input.developerHead);
  assert.equal(checked.manifest.provenance.head_relations.developer, "reviewed-head-ancestor-of-canonical-tip");
  assert.equal(checked.manifest.created_at, "2026-01-01T00:00:00.000Z");
  assert.deepEqual(checked.manifest.ranges.developer.changed_paths, ["developer-only.txt"]);
  assert.deepEqual(checked.manifest.ranges["web-orchestration"].changed_paths, ["web-orchestration-only/change.md"]);
  const second = join(input.directory, "package-two");
  createPackage(input, second);
  assert.equal(readFileSync(join(output, "manifest.json"), "utf8"), readFileSync(join(second, "manifest.json"), "utf8"));
  assert.equal(readFileSync(join(output, "developer.patch"), "utf8"), readFileSync(join(second, "developer.patch"), "utf8"));
});

test("rejects deceptive local origin, wrong review base, and forged local head", (context) => {
  const input = fixture(context);
  git(input.source, ["remote", "set-url", "origin", "https://github.com.evil.invalid/floris3456/agentic-workflow-template.git"]);
  let result = spawnSync("node", [join(input.template, "scripts", "create-change-package.mjs"), "--repository", input.source, "--task-id", "TASK-BAD", "--developer-base", input.developerBase, "--developer-head", input.developerHead, "--web-base", input.webBase, "--web-head", input.webHead, "--output", join(input.directory, "bad-origin")], { cwd: root, env: input.environment, encoding: "utf8" });
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /origin does not match/);
  git(input.source, ["remote", "set-url", "origin", canonicalUrl]);

  result = createPackage(input, join(input.directory, "bad-base"), { developerBase: input.developerHead }, 1);
  assert.match(result.stderr, /does not match source-lock review base/);

  git(input.source, ["checkout", "developer"]);
  const forged = commit(input.source, "forged.txt", "local only\n", "forged local head");
  result = createPackage(input, join(input.directory, "forged-head"), { developerHead: forged }, 1);
  assert.match(result.stderr, /did not resolve exactly from canonical fetch|not an ancestor of the current canonical tip/);
});

test("schema 2 validation detects source-lock, patch, and package-binding tampering", (context) => {
  const input = fixture(context);
  const output = join(input.directory, "package");
  createPackage(input, output);
  const manifestPath = join(output, "manifest.json");
  const originalManifest = readFileSync(manifestPath, "utf8");
  const manifest = JSON.parse(originalManifest);
  manifest.provenance.source_lock.sources.developer = "1".repeat(40);
  writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
  assert.throws(() => validateChangePackage(output), /source-lock digest|base does not match/);
  writeFileSync(manifestPath, originalManifest);
  writeFileSync(join(output, "developer.patch"), Buffer.concat([readFileSync(join(output, "developer.patch")), Buffer.from("tamper\n")]));
  assert.throws(() => validateChangePackage(output), /patch digest/);
  createPackage(input, join(input.directory, "package-fresh"));
  const fresh = join(input.directory, "package-fresh");
  const freshManifestPath = join(fresh, "manifest.json");
  const bound = JSON.parse(readFileSync(freshManifestPath, "utf8"));
  bound.created_at = "2030-01-01T00:00:00.000Z";
  writeFileSync(freshManifestPath, `${JSON.stringify(bound, null, 2)}\n`);
  assert.throws(() => validateChangePackage(fresh), /binding digest/);
});

test("legacy schema 1 packages remain integrity-compatible but are not provenance verified", (context) => {
  const directory = mkdtempSync(join(tmpdir(), "legacy-package-"));
  context.after(() => rmSync(directory, { recursive: true, force: true }));
  const developerPatch = Buffer.from("legacy developer\n");
  const webPatch = Buffer.from("legacy web\n");
  writeFileSync(join(directory, "developer.patch"), developerPatch);
  writeFileSync(join(directory, "web-orchestration.patch"), webPatch);
  writeFileSync(join(directory, "manifest.json"), `${JSON.stringify({
    schema_version: 1,
    task_id: "LEGACY",
    canonical_repository: canonicalUrl,
    created_at: "2026-01-01T00:00:00.000Z",
    ranges: {
      developer: { base: "1".repeat(40), head: "2".repeat(40), changed_paths: [], patch: "developer.patch", patch_sha256: sha256(developerPatch) },
      "web-orchestration": { base: "3".repeat(40), head: "4".repeat(40), changed_paths: [], patch: "web-orchestration.patch", patch_sha256: sha256(webPatch) },
    },
  }, null, 2)}\n`);
  const checked = validateChangePackage(directory, "LEGACY");
  assert.equal(checked.schemaVersion, 1);
  assert.equal(checked.provenanceVerified, false);
});

test("schema 2 package dry-run and apply preserve downstream branch and cleanliness boundaries", (context) => {
  const input = fixture(context);
  const output = join(input.directory, "package");
  createPackage(input, output);
  const target = join(input.directory, "target");
  mkdirSync(target);
  git(target, ["init", "-b", "developer"]);
  commit(target, "shared.txt", "base\n", "target base");
  const dry = run("node", [applyScript, "--package", output, "--repository", target, "--target", "developer"], root);
  assert.match(dry.stdout, /Provenance schema 2 verified/);
  assert.equal(existsSync(join(target, "developer-only.txt")), false);
  const applied = run("node", [applyScript, "--package", output, "--repository", target, "--target", "developer", "--apply"], root);
  assert.match(applied.stdout, /provenance schema 2 verified/);
  assert.equal(readFileSync(join(target, "developer-only.txt"), "utf8"), "developer change\n");
});
