import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

function runScript(scriptRelativePath, args = []) {
  return spawnSync(process.execPath, [path.join(root, scriptRelativePath), ...args], {
    cwd: root,
    encoding: "utf8",
  });
}

test("research validator and manifest generator reject symlinked file entries beneath research tree", (context) => {
  const tempDir = fs.mkdtempSync(path.join(tmpdir(), "research-symlink-file-test-"));
  const outsideTarget = path.join(tempDir, "outside-target.md");
  const secretContent = "# Outside Heading\n" + "OUTSIDE_EVIDENCE_SECRET_CONTENT_12345\n".repeat(5);
  fs.writeFileSync(outsideTarget, secretContent, "utf8");

  const symlinkPath = path.join(root, "research", "implementation", "batches", "temp-symlink-result.md");
  fs.symlinkSync(outsideTarget, symlinkPath);

  const linkingFilePath = path.join(root, "research", "implementation", "temp-link-file.md");
  fs.writeFileSync(linkingFilePath, "# Temporary Link File\n[outside link](./batches/temp-symlink-result.md#outside-heading)\n", "utf8");

  context.after(() => {
    try {
      fs.unlinkSync(linkingFilePath);
    } catch {}
    try {
      fs.unlinkSync(symlinkPath);
    } catch {}
    fs.rmSync(tempDir, { recursive: true, force: true });
  });

  const relativeSymlink = "research/implementation/batches/temp-symlink-result.md";

  // Validate research must fail with a clear stable message naming the repo-relative path and stop before post-walk link resolution
  const valResult = runScript("scripts/validate-research.mjs");
  assert.notEqual(valResult.status, 0, "validate-research.mjs should fail on symlinked file");
  assert.match(valResult.stderr, new RegExp(`Research tree contains symlink: ${relativeSymlink}`));
  assert.equal(valResult.stdout.includes(tempDir), false, "must not leak external path to stdout");
  assert.equal(valResult.stderr.includes(tempDir), false, "must not leak external path to stderr");
  assert.equal(valResult.stdout.includes(secretContent), false, "must not read external content into stdout");
  assert.equal(valResult.stderr.includes(secretContent), false, "must not read external content into stderr");

  // Manifest generator check mode must fail nonzero naming the repo-relative path
  const genCheckResult = runScript("scripts/generate-research-evidence-manifest.mjs", ["--check"]);
  assert.notEqual(genCheckResult.status, 0, "generate-research-evidence-manifest --check should fail on symlink");
  assert.match(genCheckResult.stderr, new RegExp(`Research tree contains symlink: ${relativeSymlink}`));
  assert.equal(genCheckResult.stdout.includes(tempDir), false, "must not leak external path to stdout");
  assert.equal(genCheckResult.stderr.includes(tempDir), false, "must not leak external path to stderr");
  assert.equal(genCheckResult.stdout.includes(secretContent), false, "must not read external content into stdout");
  assert.equal(genCheckResult.stderr.includes(secretContent), false, "must not read external content into stderr");

  // Manifest generator write mode must fail without modifying manifest
  const manifestPath = path.join(root, "evidence", "manifests", "research-evidence.json");
  const manifestBefore = fs.readFileSync(manifestPath, "utf8");
  const genWriteResult = runScript("scripts/generate-research-evidence-manifest.mjs");
  assert.notEqual(genWriteResult.status, 0, "generate-research-evidence-manifest should fail on symlink");
  assert.match(genWriteResult.stderr, new RegExp(`Research tree contains symlink: ${relativeSymlink}`));
  const manifestAfter = fs.readFileSync(manifestPath, "utf8");
  assert.equal(manifestAfter, manifestBefore, "manifest must remain unmodified");
});

test("research validator and manifest generator reject symlinked directory entries beneath research tree", (context) => {
  const tempDir = fs.mkdtempSync(path.join(tmpdir(), "research-symlink-dir-test-"));
  const outsideSubdir = path.join(tempDir, "outside-study");
  fs.mkdirSync(outsideSubdir, { recursive: true });
  const outsidePrompt = path.join(outsideSubdir, "prompt.md");
  const outsideResult = path.join(outsideSubdir, "result-outside.md");
  fs.writeFileSync(outsidePrompt, "# Outside Prompt\n## Expert role\n## Result target\n## Research questions\n## Required output\n## Human decisions\n## CLI evidence and experiments\n## Residual risk\n", "utf8");
  fs.writeFileSync(outsideResult, "# Outside Result\n".repeat(10), "utf8");

  const symlinkDirPath = path.join(root, "research", "implementation", "temp-symlink-pkg");
  fs.symlinkSync(outsideSubdir, symlinkDirPath);

  context.after(() => {
    try {
      fs.unlinkSync(symlinkDirPath);
    } catch {}
    fs.rmSync(tempDir, { recursive: true, force: true });
  });

  const relativeSymlink = "research/implementation/temp-symlink-pkg";

  // Validate research must fail with a clear stable message naming the repo-relative path
  const valResult = runScript("scripts/validate-research.mjs");
  assert.notEqual(valResult.status, 0, "validate-research.mjs should fail on symlinked directory");
  assert.match(valResult.stderr, new RegExp(`Research tree contains symlink: ${relativeSymlink}`));
  assert.equal(valResult.stdout.includes(tempDir), false, "must not leak external path to stdout");
  assert.equal(valResult.stderr.includes(tempDir), false, "must not leak external path to stderr");

  // Manifest generator check mode must fail nonzero naming the repo-relative path
  const genCheckResult = runScript("scripts/generate-research-evidence-manifest.mjs", ["--check"]);
  assert.notEqual(genCheckResult.status, 0, "generate-research-evidence-manifest --check should fail on symlink directory");
  assert.match(genCheckResult.stderr, new RegExp(`Research tree contains symlink: ${relativeSymlink}`));
  assert.equal(genCheckResult.stdout.includes(tempDir), false, "must not leak external path to stdout");
  assert.equal(genCheckResult.stderr.includes(tempDir), false, "must not leak external path to stderr");

  // Manifest generator write mode must fail without modifying manifest
  const manifestPath = path.join(root, "evidence", "manifests", "research-evidence.json");
  const manifestBefore = fs.readFileSync(manifestPath, "utf8");
  const genWriteResult = runScript("scripts/generate-research-evidence-manifest.mjs");
  assert.notEqual(genWriteResult.status, 0, "generate-research-evidence-manifest should fail on symlink directory");
  assert.match(genWriteResult.stderr, new RegExp(`Research tree contains symlink: ${relativeSymlink}`));
  const manifestAfter = fs.readFileSync(manifestPath, "utf8");
  assert.equal(manifestAfter, manifestBefore, "manifest must remain unmodified");
});
