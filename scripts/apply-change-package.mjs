#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

function fail(message) {
  console.error(message);
  process.exit(1);
}

function parse(argv) {
  const apply = argv.includes("--apply");
  const filtered = argv.filter((value) => value !== "--apply");
  const result = new Map();
  for (let index = 0; index < filtered.length; index += 2) {
    const name = filtered[index];
    const value = filtered[index + 1];
    if (!name?.startsWith("--") || !value || value.startsWith("--")) {
      fail("Usage: apply-change-package.mjs --package <directory> --repository <path> --target <developer|web-orchestration> [--apply]");
    }
    if (result.has(name)) fail(`Duplicate argument ${name}`);
    result.set(name, value);
  }
  for (const name of result.keys()) if (!["--package", "--repository", "--target"].includes(name)) fail(`Unknown argument ${name}`);
  return { apply, values: result };
}

function git(repository, args) {
  try {
    return execFileSync("git", ["-C", repository, ...args], { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] }).trim();
  } catch (error) {
    fail(error.stderr?.toString().trim() || error.message);
  }
}

const { apply, values } = parse(process.argv.slice(2));
const packageDirectory = resolve(values.get("--package") ?? fail("Missing --package"));
const repository = resolve(values.get("--repository") ?? fail("Missing --repository"));
const target = values.get("--target") ?? fail("Missing --target");
if (target !== "developer" && target !== "web-orchestration") fail("target must be developer or web-orchestration");

const manifest = JSON.parse(readFileSync(resolve(packageDirectory, "manifest.json"), "utf8"));
if (manifest.schema_version !== 1 || !manifest.ranges?.[target]) fail("Package manifest is incompatible or missing the selected target");
const entry = manifest.ranges[target];
const expectedPatch = target === "developer" ? "developer.patch" : "web-orchestration.patch";
if (entry.patch !== expectedPatch) fail("Package manifest names an unexpected patch");
const patchPath = resolve(packageDirectory, expectedPatch);
const patch = readFileSync(patchPath);
const digest = createHash("sha256").update(patch).digest("hex");
if (digest !== entry.patch_sha256) fail("Patch does not match its manifest digest");

git(repository, ["rev-parse", "--git-dir"]);
if (git(repository, ["branch", "--show-current"]) !== target) fail(`Checkout must be on ${target}`);
if (git(repository, ["status", "--porcelain"]) !== "") fail("Checkout must be clean before package application");

if (patch.length === 0) {
  console.log(`${target} patch is empty; no application is needed.`);
  process.exit(0);
}

git(repository, ["apply", "--check", "--binary", patchPath]);
if (!apply) {
  console.log(`${target} patch applies cleanly (dry run).`);
  process.exit(0);
}
git(repository, ["apply", "--binary", patchPath]);
console.log(`${target} patch applied to the working tree; inspect, test, commit, and push through the branch's normal workflow.`);
