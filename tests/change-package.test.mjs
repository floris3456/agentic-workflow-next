import assert from "node:assert/strict";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync, copyFileSync, chmodSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { spawnSync, execFileSync } from "node:child_process";
import test from "node:test";
import { fileURLToPath } from "node:url";
import {
  validateChangePackage,
  validatePackageSupersessionChain,
  resolveLatestChangePackage,
  packageDigest,
  sha256,
} from "../scripts/change-package-lib.mjs";

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
  git(source, ["checkout", "--orphan", "template-development"]);
  git(source, ["rm", "-rf", "."]);
  const templateBase = commit(source, "ledger-base.txt", "template base\n", "template base");
  const templateHead = commit(source, "workspace-runtime.txt", "workspace runtime\n", "template implementation");
  const templateTip = commit(source, "later-ledger.txt", "later package-independent ledger work\n", "later template ledger work");
  git(source, ["push", "fixture", "template-development"]);
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
    sources: { main: "f".repeat(40), developer: developerTip, "web-orchestration": webHead },
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
  return {
    directory, remote, source, template, lock,
    templateBase, templateHead, templateTip,
    developerBase, developerHead, developerTip, webBase, webHead, environment,
  };
}

function createPackage(input, output, overrides = {}, expected = 0) {
  const args = [
    join(input.template, "scripts", "create-change-package.mjs"),
    "--repository", input.source, "--task-id", overrides.taskId ?? "TASK-001",
    "--template-base", overrides.templateBase ?? input.templateBase,
    "--template-head", overrides.templateHead ?? input.templateHead,
    "--developer-base", overrides.developerBase ?? input.developerBase,
    "--developer-head", overrides.developerHead ?? input.developerHead,
    "--web-base", overrides.webBase ?? input.webBase,
    "--web-head", overrides.webHead ?? input.webHead,
    "--output", output,
    ...(overrides.revision !== undefined ? ["--revision", String(overrides.revision)] : []),
    ...(overrides.supersedes !== undefined ? ["--supersedes", overrides.supersedes] : []),
  ];
  return run("node", args, root, expected, input.environment);
}

test("creates deterministic provenance schema 3 with all reviewed ranges and a non-self-referential source snapshot", (context) => {
  const input = fixture(context);
  const output = join(input.directory, "package");
  assert.notEqual(input.lock.sources.developer, input.developerBase);
  const result = createPackage(input, output);
  assert.match(result.stdout, /provenance-verified/);
  const checked = validateChangePackage(output, "TASK-001");
  assert.equal(checked.schemaVersion, 3);
  assert.equal(checked.provenanceVerified, true);
  assert.equal(checked.manifest.provenance.source_lock.sources.developer, input.developerTip);
  assert.equal(checked.manifest.ranges.developer.base, input.developerBase);
  assert.equal(checked.manifest.provenance.canonical_tips.developer, input.developerTip);
  assert.equal(checked.manifest.ranges.developer.head, input.developerHead);
  assert.equal(checked.manifest.provenance.head_relations.developer, "reviewed-head-ancestor-of-canonical-tip");
  assert.equal(checked.manifest.provenance.source_lock.sources["template-development"], undefined);
  assert.equal(checked.manifest.ranges["template-development"].base, input.templateBase);
  assert.equal(checked.manifest.provenance.canonical_tips["template-development"], input.templateTip);
  assert.equal(checked.manifest.ranges["template-development"].head, input.templateHead);
  assert.equal(checked.manifest.provenance.head_relations["template-development"], "reviewed-head-ancestor-of-canonical-tip");
  assert.equal(checked.manifest.created_at, "2026-01-01T00:00:00.000Z");
  assert.deepEqual(checked.manifest.ranges["template-development"].changed_paths, ["workspace-runtime.txt"]);
  assert.deepEqual(checked.manifest.ranges.developer.changed_paths, ["developer-only.txt"]);
  assert.deepEqual(checked.manifest.ranges["web-orchestration"].changed_paths, ["web-orchestration-only/change.md"]);
  const second = join(input.directory, "package-two");
  createPackage(input, second);
  assert.equal(readFileSync(join(output, "manifest.json"), "utf8"), readFileSync(join(second, "manifest.json"), "utf8"));
  assert.equal(readFileSync(join(output, "template-development.patch"), "utf8"), readFileSync(join(second, "template-development.patch"), "utf8"));
  assert.equal(readFileSync(join(output, "developer.patch"), "utf8"), readFileSync(join(second, "developer.patch"), "utf8"));
});

test("rejects deceptive local origin, non-ancestor range base, and forged local head", (context) => {
  const input = fixture(context);
  git(input.source, ["remote", "set-url", "origin", "https://github.com.evil.invalid/floris3456/agentic-workflow-template.git"]);
  let result = spawnSync("node", [join(input.template, "scripts", "create-change-package.mjs"), "--repository", input.source, "--task-id", "TASK-BAD", "--template-base", input.templateBase, "--template-head", input.templateHead, "--developer-base", input.developerBase, "--developer-head", input.developerHead, "--web-base", input.webBase, "--web-head", input.webHead, "--output", join(input.directory, "bad-origin")], { cwd: root, env: input.environment, encoding: "utf8" });
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /origin does not match/);
  git(input.source, ["remote", "set-url", "origin", canonicalUrl]);

  result = createPackage(input, join(input.directory, "bad-base"), { developerBase: input.webBase }, 1);
  assert.match(result.stderr, /range base is not an ancestor of canonical head/);

  result = createPackage(input, join(input.directory, "bad-template-base"), { templateBase: input.webBase }, 1);
  assert.match(result.stderr, /template-development range base is not an ancestor/);

  git(input.source, ["checkout", "developer"]);
  const forged = commit(input.source, "forged.txt", "local only\n", "forged local head");
  result = createPackage(input, join(input.directory, "forged-head"), { developerHead: forged }, 1);
  assert.match(result.stderr, /did not resolve exactly from canonical fetch|not an ancestor of the current canonical tip/);
});

test("schema 3 validation detects source-snapshot, template patch, provenance, and package-binding tampering", (context) => {
  const input = fixture(context);
  const output = join(input.directory, "package");
  createPackage(input, output);
  const manifestPath = join(output, "manifest.json");
  const originalManifest = readFileSync(manifestPath, "utf8");
  const manifest = JSON.parse(originalManifest);
  manifest.provenance.source_lock.sources.developer = "1".repeat(40);
  writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
  assert.throws(() => validateChangePackage(output), /source-lock digest/);
  writeFileSync(manifestPath, originalManifest);
  writeFileSync(join(output, "template-development.patch"), Buffer.concat([readFileSync(join(output, "template-development.patch")), Buffer.from("tamper\n")]));
  assert.throws(() => validateChangePackage(output), /patch digest/);
  createPackage(input, join(input.directory, "package-fresh"));
  const fresh = join(input.directory, "package-fresh");
  const freshManifestPath = join(fresh, "manifest.json");
  const bound = JSON.parse(readFileSync(freshManifestPath, "utf8"));
  bound.provenance.canonical_tips["template-development"] = "2".repeat(40);
  writeFileSync(freshManifestPath, `${JSON.stringify(bound, null, 2)}\n`);
  assert.throws(() => validateChangePackage(fresh), /binding digest/);
  createPackage(input, join(input.directory, "package-bound"));
  const packageBound = join(input.directory, "package-bound");
  const packageBoundManifest = join(packageBound, "manifest.json");
  const createdAtTamper = JSON.parse(readFileSync(packageBoundManifest, "utf8"));
  createdAtTamper.created_at = "2030-01-01T00:00:00.000Z";
  writeFileSync(packageBoundManifest, `${JSON.stringify(createdAtTamper, null, 2)}\n`);
  assert.throws(() => validateChangePackage(packageBound), /binding digest/);

  const packageWithSelfStorage = join(input.directory, "package-self-storage");
  createPackage(input, packageWithSelfStorage);
  const selfStorageManifestPath = join(packageWithSelfStorage, "manifest.json");
  const selfStorageManifest = JSON.parse(readFileSync(selfStorageManifestPath, "utf8"));
  selfStorageManifest.ranges["template-development"].changed_paths.push("changes/TASK-001/foo.txt");
  selfStorageManifest.ranges["template-development"].changed_paths.sort();
  writeFileSync(selfStorageManifestPath, `${JSON.stringify(selfStorageManifest, null, 2)}\n`);
  assert.throws(() => validateChangePackage(packageWithSelfStorage), /must end before its own generated package storage/);
});

test("schema 3 persisted package supersession lifecycle, relations, downstream selection, and fail-closed validation", (context) => {
  const input = fixture(context);
  const changesDir = join(input.directory, "changes");
  mkdirSync(changesDir, { recursive: true });

  git(input.source, ["checkout", "-B", "template-development", input.templateBase]);
  const initialTemplateHead = commit(input.source, "workspace-runtime.txt", "workspace runtime\n", "Initial template change");
  git(input.source, ["remote", "add", "fixture", input.remote]);
  git(input.source, ["push", "--force", "fixture", "template-development"]);
  git(input.source, ["remote", "remove", "fixture"]);

  git(input.source, ["checkout", "-B", "developer", input.developerBase]);
  const initialDeveloperHead = commit(input.source, "developer-only.txt", "developer change\n", "Initial developer change");
  git(input.source, ["remote", "add", "fixture", input.remote]);
  git(input.source, ["push", "--force", "fixture", "developer"]);
  git(input.source, ["remote", "remove", "fixture"]);

  const v1PackageDir = join(changesDir, "TASK-SUPER");
  createPackage(input, v1PackageDir, {
    taskId: "TASK-SUPER",
    templateHead: initialTemplateHead,
    developerHead: initialDeveloperHead,
  });
  const v1Checked = validateChangePackage(v1PackageDir, "TASK-SUPER");
  assert.equal(v1Checked.provenanceVerified, true);
  assert.equal(v1Checked.manifest.revision ?? 1, 1);
  const v1ManifestBytes = readFileSync(join(v1PackageDir, "manifest.json"), "utf8");
  const v1TemplatePatchBytes = readFileSync(join(v1PackageDir, "template-development.patch"), "utf8");

  // Commit historical package v1 to template-development history
  git(input.source, ["checkout", "template-development"]);
  commit(input.source, "changes/TASK-SUPER/manifest.json", v1ManifestBytes, "Package TASK-SUPER v1 manifest");
  commit(input.source, "changes/TASK-SUPER/template-development.patch", v1TemplatePatchBytes, "Package TASK-SUPER v1 template patch");
  commit(input.source, "changes/TASK-SUPER/developer.patch", readFileSync(join(v1PackageDir, "developer.patch"), "utf8"), "Package TASK-SUPER v1 dev patch");
  commit(input.source, "changes/TASK-SUPER/web-orchestration.patch", readFileSync(join(v1PackageDir, "web-orchestration.patch"), "utf8"), "Package TASK-SUPER v1 web patch");

  // Subsequent corrections
  const supersededTemplateHead = commit(
    input.source,
    "workspace-fix.txt",
    "corrected workspace fix\n",
    "Fix review issue on template-development",
  );
  git(input.source, ["remote", "add", "fixture", input.remote]);
  git(input.source, ["push", "fixture", "template-development"]);
  git(input.source, ["remote", "remove", "fixture"]);

  git(input.source, ["checkout", "developer"]);
  const supersededDeveloperHead = commit(
    input.source,
    "developer-fix.txt",
    "corrected developer fix\n",
    "Fix review issue on developer",
  );
  git(input.source, ["remote", "add", "fixture", input.remote]);
  git(input.source, ["push", "fixture", "developer"]);
  git(input.source, ["remote", "remove", "fixture"]);

  // Create distinct superseding package v2 in changes/TASK-SUPER.rev2
  const v2PackageDir = join(changesDir, "TASK-SUPER.rev2");
  const result = createPackage(input, v2PackageDir, {
    taskId: "TASK-SUPER",
    templateHead: supersededTemplateHead,
    developerHead: supersededDeveloperHead,
    supersedes: v1PackageDir,
  });
  assert.match(result.stdout, /provenance-verified/);

  // Prove historical v1 package remains 100% byte-identical
  assert.equal(readFileSync(join(v1PackageDir, "manifest.json"), "utf8"), v1ManifestBytes);
  assert.equal(readFileSync(join(v1PackageDir, "template-development.patch"), "utf8"), v1TemplatePatchBytes);

  // Validate both packages
  const v1Recheck = validateChangePackage(v1PackageDir, "TASK-SUPER");
  const v2Checked = validateChangePackage(v2PackageDir, "TASK-SUPER");
  assert.equal(v1Recheck.provenanceVerified, true);
  assert.equal(v2Checked.provenanceVerified, true);

  // Prove supersession relation
  assert.equal(v2Checked.manifest.revision, 2);
  assert.equal(v2Checked.manifest.supersedes.package_sha256, v1Checked.manifest.package_sha256);
  assert.equal(v2Checked.manifest.supersedes.revision, 1);
  assert.deepEqual(
    v2Checked.manifest.ranges["template-development"].changed_paths,
    ["workspace-fix.txt", "workspace-runtime.txt"],
  );

  const v2ManifestBytes = readFileSync(join(v2PackageDir, "manifest.json"), "utf8");
  const v2TemplatePatchBytes = readFileSync(join(v2PackageDir, "template-development.patch"), "utf8");

  // Commit package v2 to template-development history
  git(input.source, ["checkout", "template-development"]);
  commit(input.source, "changes/TASK-SUPER.rev2/manifest.json", v2ManifestBytes, "Package TASK-SUPER v2 manifest");
  commit(input.source, "changes/TASK-SUPER.rev2/template-development.patch", v2TemplatePatchBytes, "Package TASK-SUPER v2 template patch");
  commit(input.source, "changes/TASK-SUPER.rev2/developer.patch", readFileSync(join(v2PackageDir, "developer.patch"), "utf8"), "Package TASK-SUPER v2 dev patch");
  commit(input.source, "changes/TASK-SUPER.rev2/web-orchestration.patch", readFileSync(join(v2PackageDir, "web-orchestration.patch"), "utf8"), "Package TASK-SUPER v2 web patch");

  // Second correction cycle: add another fix
  const supersededTemplateHead3 = commit(
    input.source,
    "workspace-fix-2.txt",
    "second workspace fix\n",
    "Second fix on template-development",
  );
  git(input.source, ["remote", "add", "fixture", input.remote]);
  git(input.source, ["push", "fixture", "template-development"]);
  git(input.source, ["remote", "remove", "fixture"]);

  git(input.source, ["checkout", "developer"]);
  const supersededDeveloperHead3 = commit(
    input.source,
    "developer-fix-2.txt",
    "second developer fix\n",
    "Second fix on developer",
  );
  git(input.source, ["remote", "add", "fixture", input.remote]);
  git(input.source, ["push", "fixture", "developer"]);
  git(input.source, ["remote", "remove", "fixture"]);

  // Create distinct superseding package v3 in changes/TASK-SUPER.rev3
  const v3PackageDir = join(changesDir, "TASK-SUPER.rev3");
  const result3 = createPackage(input, v3PackageDir, {
    taskId: "TASK-SUPER",
    templateHead: supersededTemplateHead3,
    developerHead: supersededDeveloperHead3,
    supersedes: v2PackageDir,
  });
  assert.match(result3.stdout, /provenance-verified/);

  // Prove historical v1 and v2 packages remain 100% byte-identical
  assert.equal(readFileSync(join(v1PackageDir, "manifest.json"), "utf8"), v1ManifestBytes);
  assert.equal(readFileSync(join(v1PackageDir, "template-development.patch"), "utf8"), v1TemplatePatchBytes);
  assert.equal(readFileSync(join(v2PackageDir, "manifest.json"), "utf8"), v2ManifestBytes);
  assert.equal(readFileSync(join(v2PackageDir, "template-development.patch"), "utf8"), v2TemplatePatchBytes);

  // Validate all three packages
  const v3Checked = validateChangePackage(v3PackageDir, "TASK-SUPER");
  assert.equal(v3Checked.provenanceVerified, true);
  assert.equal(v3Checked.manifest.revision, 3);
  assert.equal(v3Checked.manifest.supersedes.package_sha256, v2Checked.manifest.package_sha256);
  assert.equal(v3Checked.manifest.supersedes.revision, 2);
  assert.deepEqual(
    v3Checked.manifest.ranges["template-development"].changed_paths,
    ["workspace-fix-2.txt", "workspace-fix.txt", "workspace-runtime.txt"],
  );
  assert.deepEqual(
    v3Checked.manifest.ranges.developer.changed_paths,
    ["developer-fix-2.txt", "developer-fix.txt", "developer-only.txt"],
  );

  // Prove supersession chain validation and active package resolution returns rev3
  const chain = validatePackageSupersessionChain(changesDir);
  assert.equal(chain.packages.length, 3);
  const resolved = resolveLatestChangePackage(changesDir, "TASK-SUPER");
  assert.equal(resolved.directory, v3PackageDir);
  assert.equal(resolved.manifest.revision, 3);

  // Downstream application uses the corrected package rev3
  const target = join(input.directory, "superseded-target");
  mkdirSync(target);
  git(target, ["init", "-b", "template-development"]);
  commit(target, "ledger-base.txt", "template base\n", "target template base");
  const applied = run("node", [applyScript, "--task-id", "TASK-SUPER", "--changes-dir", changesDir, "--repository", target, "--target", "template-development", "--apply"], root);
  assert.match(applied.stdout, /provenance schema 3 verified/);
  assert.equal(readFileSync(join(target, "workspace-runtime.txt"), "utf8"), "workspace runtime\n");
  assert.equal(readFileSync(join(target, "workspace-fix.txt"), "utf8"), "corrected workspace fix\n");
  assert.equal(readFileSync(join(target, "workspace-fix-2.txt"), "utf8"), "second workspace fix\n");

  // Negative tests: Tampered historical package fails closed
  const tamperedChangesDir = join(input.directory, "tampered-changes");
  mkdirSync(tamperedChangesDir, { recursive: true });
  const tamperedV1 = join(tamperedChangesDir, "TASK-SUPER");
  const tamperedV2 = join(tamperedChangesDir, "TASK-SUPER.rev2");
  spawnSync("cp", ["-r", v1PackageDir, tamperedV1]);
  spawnSync("cp", ["-r", v2PackageDir, tamperedV2]);
  writeFileSync(join(tamperedV1, "template-development.patch"), "tampered patch bytes\n");
  assert.throws(() => validatePackageSupersessionChain(tamperedChangesDir), /patch digest|digest mismatch/);

  // Negative tests: Wrong package_path with correct digest fails closed
  const wrongPathChangesDir = join(input.directory, "wrong-path-changes");
  mkdirSync(wrongPathChangesDir, { recursive: true });
  spawnSync("cp", ["-r", v1PackageDir, join(wrongPathChangesDir, "TASK-SUPER")]);
  spawnSync("cp", ["-r", v2PackageDir, join(wrongPathChangesDir, "TASK-SUPER.rev2")]);
  const wrongPathManifest = JSON.parse(readFileSync(join(wrongPathChangesDir, "TASK-SUPER.rev2", "manifest.json"), "utf8"));
  wrongPathManifest.supersedes.package_path = "changes/NONEXISTENT-PATH";
  const wrongPathCore = { ...wrongPathManifest };
  delete wrongPathCore.package_sha256;
  const patchesV2 = {
    "template-development": readFileSync(join(v2PackageDir, "template-development.patch")),
    developer: readFileSync(join(v2PackageDir, "developer.patch")),
    "web-orchestration": readFileSync(join(v2PackageDir, "web-orchestration.patch")),
  };
  wrongPathManifest.package_sha256 = packageDigest(wrongPathCore, patchesV2);
  writeFileSync(join(wrongPathChangesDir, "TASK-SUPER.rev2", "manifest.json"), `${JSON.stringify(wrongPathManifest, null, 2)}\n`);
  assert.throws(() => validatePackageSupersessionChain(wrongPathChangesDir), /supersedes missing package/);

  // Negative tests: Traversal (../) in package_path fails closed
  const traversalChangesDir = join(input.directory, "traversal-changes");
  mkdirSync(traversalChangesDir, { recursive: true });
  spawnSync("cp", ["-r", v1PackageDir, join(traversalChangesDir, "TASK-SUPER")]);
  spawnSync("cp", ["-r", v2PackageDir, join(traversalChangesDir, "TASK-SUPER.rev2")]);
  const traversalManifest = JSON.parse(readFileSync(join(traversalChangesDir, "TASK-SUPER.rev2", "manifest.json"), "utf8"));
  traversalManifest.supersedes.package_path = "../TASK-SUPER";
  const traversalCore = { ...traversalManifest };
  delete traversalCore.package_sha256;
  traversalManifest.package_sha256 = packageDigest(traversalCore, patchesV2);
  writeFileSync(join(traversalChangesDir, "TASK-SUPER.rev2", "manifest.json"), `${JSON.stringify(traversalManifest, null, 2)}\n`);
  assert.throws(() => validatePackageSupersessionChain(traversalChangesDir), /traversal segments|invalid/);

  // Negative tests: Absolute path in package_path fails closed
  const absPathChangesDir = join(input.directory, "abs-path-changes");
  mkdirSync(absPathChangesDir, { recursive: true });
  spawnSync("cp", ["-r", v1PackageDir, join(absPathChangesDir, "TASK-SUPER")]);
  spawnSync("cp", ["-r", v2PackageDir, join(absPathChangesDir, "TASK-SUPER.rev2")]);
  const absPathManifest = JSON.parse(readFileSync(join(absPathChangesDir, "TASK-SUPER.rev2", "manifest.json"), "utf8"));
  absPathManifest.supersedes.package_path = "/etc/passwd";
  const absPathCore = { ...absPathManifest };
  delete absPathCore.package_sha256;
  absPathManifest.package_sha256 = packageDigest(absPathCore, patchesV2);
  writeFileSync(join(absPathChangesDir, "TASK-SUPER.rev2", "manifest.json"), `${JSON.stringify(absPathManifest, null, 2)}\n`);
  assert.throws(() => validatePackageSupersessionChain(absPathChangesDir), /must be repository-relative|invalid/);

  // Negative tests: Escaping changes directory in package_path fails closed
  const escapeChangesDir = join(input.directory, "escape-changes");
  mkdirSync(escapeChangesDir, { recursive: true });
  spawnSync("cp", ["-r", v1PackageDir, join(escapeChangesDir, "TASK-SUPER")]);
  spawnSync("cp", ["-r", v2PackageDir, join(escapeChangesDir, "TASK-SUPER.rev2")]);
  const escapeManifest = JSON.parse(readFileSync(join(escapeChangesDir, "TASK-SUPER.rev2", "manifest.json"), "utf8"));
  escapeManifest.supersedes.package_path = "docs/TASK-SUPER";
  const escapeCore = { ...escapeManifest };
  delete escapeCore.package_sha256;
  escapeManifest.package_sha256 = packageDigest(escapeCore, patchesV2);
  writeFileSync(join(escapeChangesDir, "TASK-SUPER.rev2", "manifest.json"), `${JSON.stringify(escapeManifest, null, 2)}\n`);
  assert.throws(() => validatePackageSupersessionChain(escapeChangesDir), /must point directly beneath changes directory/);

  // Negative tests: Ambiguous duplicate revisions fail closed
  const ambiguousChangesDir = join(input.directory, "ambiguous-changes");
  mkdirSync(ambiguousChangesDir, { recursive: true });
  spawnSync("cp", ["-r", v1PackageDir, join(ambiguousChangesDir, "TASK-SUPER")]);
  spawnSync("cp", ["-r", v2PackageDir, join(ambiguousChangesDir, "TASK-SUPER.rev2")]);
  const dupV2 = join(ambiguousChangesDir, "TASK-SUPER-rev2");
  spawnSync("cp", ["-r", v2PackageDir, dupV2]);
  assert.throws(() => validatePackageSupersessionChain(ambiguousChangesDir), /Ambiguous package revision/);

  // Negative tests: Cyclic supersession fails closed
  const cyclicChangesDir = join(input.directory, "cyclic-changes");
  mkdirSync(cyclicChangesDir, { recursive: true });
  const cycA = join(cyclicChangesDir, "TASK-CYC.rev1");
  const cycB = join(cyclicChangesDir, "TASK-CYC.rev2");
  spawnSync("cp", ["-r", v1PackageDir, cycA]);
  spawnSync("cp", ["-r", v2PackageDir, cycB]);
  const cycAManifest = JSON.parse(readFileSync(join(cycA, "manifest.json"), "utf8"));
  const cycBManifest = JSON.parse(readFileSync(join(cycB, "manifest.json"), "utf8"));
  const patchesA = {
    "template-development": readFileSync(join(cycA, "template-development.patch")),
    developer: readFileSync(join(cycA, "developer.patch")),
    "web-orchestration": readFileSync(join(cycA, "web-orchestration.patch")),
  };
  const patchesB = {
    "template-development": readFileSync(join(cycB, "template-development.patch")),
    developer: readFileSync(join(cycB, "developer.patch")),
    "web-orchestration": readFileSync(join(cycB, "web-orchestration.patch")),
  };
  cycAManifest.task_id = "TASK-CYC";
  cycBManifest.task_id = "TASK-CYC";
  cycBManifest.supersedes = { package_path: "changes/TASK-CYC.rev1", package_sha256: "0".repeat(64), revision: 1 };
  cycBManifest.revision = 2;
  const coreB = { ...cycBManifest };
  delete coreB.package_sha256;
  cycBManifest.package_sha256 = packageDigest(coreB, patchesB);
  writeFileSync(join(cycB, "manifest.json"), `${JSON.stringify(cycBManifest, null, 2)}\n`);

  cycAManifest.supersedes = { package_path: "changes/TASK-CYC.rev2", package_sha256: cycBManifest.package_sha256, revision: 2 };
  cycAManifest.revision = 3;
  const coreA = { ...cycAManifest };
  delete coreA.package_sha256;
  cycAManifest.package_sha256 = packageDigest(coreA, patchesA);
  writeFileSync(join(cycA, "manifest.json"), `${JSON.stringify(cycAManifest, null, 2)}\n`);

  cycBManifest.supersedes.package_sha256 = cycAManifest.package_sha256;
  const coreB2 = { ...cycBManifest };
  delete coreB2.package_sha256;
  cycBManifest.package_sha256 = packageDigest(coreB2, patchesB);
  writeFileSync(join(cycB, "manifest.json"), `${JSON.stringify(cycBManifest, null, 2)}\n`);
  assert.throws(() => validatePackageSupersessionChain(cyclicChangesDir), /Package supersession cycle detected|supersedes tampered package/);

  // Negative tests: Non-increasing revision fails closed
  const lowerRevDir = join(input.directory, "lower-rev-changes");
  mkdirSync(lowerRevDir, { recursive: true });
  spawnSync("cp", ["-r", v1PackageDir, join(lowerRevDir, "TASK-SUPER")]);
  spawnSync("cp", ["-r", v2PackageDir, join(lowerRevDir, "TASK-SUPER.rev2")]);
  const v1Modified = JSON.parse(readFileSync(join(lowerRevDir, "TASK-SUPER", "manifest.json"), "utf8"));
  v1Modified.revision = 3;
  const v1Core = { ...v1Modified };
  delete v1Core.package_sha256;
  v1Modified.package_sha256 = packageDigest(v1Core, patchesA);
  writeFileSync(join(lowerRevDir, "TASK-SUPER", "manifest.json"), `${JSON.stringify(v1Modified, null, 2)}\n`);

  const lowerManifest = JSON.parse(readFileSync(join(lowerRevDir, "TASK-SUPER.rev2", "manifest.json"), "utf8"));
  lowerManifest.revision = 2;
  lowerManifest.supersedes.package_sha256 = v1Modified.package_sha256;
  lowerManifest.supersedes.revision = 3;
  const lowerCore = { ...lowerManifest };
  delete lowerCore.package_sha256;
  lowerManifest.package_sha256 = packageDigest(lowerCore, patchesB);
  writeFileSync(join(lowerRevDir, "TASK-SUPER.rev2", "manifest.json"), `${JSON.stringify(lowerManifest, null, 2)}\n`);
  assert.throws(() => validatePackageSupersessionChain(lowerRevDir), /must be strictly greater than superseded revision/);

  // Negative tests: Cross-task supersession fails closed
  const crossTaskDir = join(input.directory, "cross-task-changes");
  mkdirSync(crossTaskDir, { recursive: true });
  spawnSync("cp", ["-r", v1PackageDir, join(crossTaskDir, "TASK-SUPER")]);
  spawnSync("cp", ["-r", v2PackageDir, join(crossTaskDir, "TASK-OTHER.rev2")]);
  const crossManifest = JSON.parse(readFileSync(join(crossTaskDir, "TASK-OTHER.rev2", "manifest.json"), "utf8"));
  crossManifest.task_id = "TASK-OTHER";
  const crossCore = { ...crossManifest };
  delete crossCore.package_sha256;
  crossManifest.package_sha256 = packageDigest(crossCore, patchesB);
  writeFileSync(join(crossTaskDir, "TASK-OTHER.rev2", "manifest.json"), `${JSON.stringify(crossManifest, null, 2)}\n`);
  assert.throws(() => validatePackageSupersessionChain(crossTaskDir), /cannot supersede package from different task/);
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

test("schema 3 package dry-run and apply cover template-development and preserve branch and wrong-base boundaries", (context) => {
  const input = fixture(context);
  const output = join(input.directory, "package");
  createPackage(input, output);
  const templateTarget = join(input.directory, "template-target");
  mkdirSync(templateTarget);
  git(templateTarget, ["init", "-b", "template-development"]);
  commit(templateTarget, "ledger-base.txt", "template base\n", "target template base");
  const templateDry = run("node", [applyScript, "--package", output, "--repository", templateTarget, "--target", "template-development"], root);
  assert.match(templateDry.stdout, /Provenance schema 3 verified/);
  assert.equal(existsSync(join(templateTarget, "workspace-runtime.txt")), false);
  const templateApplied = run("node", [applyScript, "--package", output, "--repository", templateTarget, "--target", "template-development", "--apply"], root);
  assert.match(templateApplied.stdout, /provenance schema 3 verified/);
  assert.equal(readFileSync(join(templateTarget, "workspace-runtime.txt"), "utf8"), "workspace runtime\n");

  const wrongBase = join(input.directory, "template-wrong-base");
  mkdirSync(wrongBase);
  git(wrongBase, ["init", "-b", "template-development"]);
  commit(wrongBase, "ledger-base.txt", "incompatible base\n", "wrong template base");
  commit(wrongBase, "workspace-runtime.txt", "conflicting runtime\n", "conflicting runtime");
  const wrong = run("node", [applyScript, "--package", output, "--repository", wrongBase, "--target", "template-development"], root, 1);
  assert.match(wrong.stderr, /patch failed|already exists in working directory/);

  const target = join(input.directory, "target");
  mkdirSync(target);
  git(target, ["init", "-b", "developer"]);
  commit(target, "shared.txt", "base\n", "target base");
  const dry = run("node", [applyScript, "--package", output, "--repository", target, "--target", "developer"], root);
  assert.match(dry.stdout, /Provenance schema 3 verified/);
  assert.equal(existsSync(join(target, "developer-only.txt")), false);
  const applied = run("node", [applyScript, "--package", output, "--repository", target, "--target", "developer", "--apply"], root);
  assert.match(applied.stdout, /provenance schema 3 verified/);
  assert.equal(readFileSync(join(target, "developer-only.txt"), "utf8"), "developer change\n");
});
