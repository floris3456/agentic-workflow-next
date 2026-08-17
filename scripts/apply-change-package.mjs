#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import { resolve } from "node:path";
import { validateChangePackage } from "./change-package-lib.mjs";

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
      fail("Usage: apply-change-package.mjs --package <directory> --repository <path> --target <template-development|developer|web-orchestration> [--apply]");
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
if (!["template-development", "developer", "web-orchestration"].includes(target)) {
  fail("target must be template-development, developer, or web-orchestration");
}
let checked;
try {
  checked = validateChangePackage(packageDirectory);
} catch (error) {
  fail(`Package validation failed: ${error.message}`);
}
const entry = checked.manifest.ranges[target];
if (!entry) fail(`Package schema ${checked.schemaVersion} does not carry ${target}`);
const patchPath = resolve(packageDirectory, entry.patch);
const patch = checked.patches[target];

git(repository, ["rev-parse", "--git-dir"]);
if (git(repository, ["branch", "--show-current"]) !== target) fail(`Checkout must be on ${target}`);
if (git(repository, ["status", "--porcelain"]) !== "") fail("Checkout must be clean before package application");

if (patch.length === 0) {
  console.log(`${target} patch is empty; no application is needed.${checked.provenanceVerified ? ` Provenance schema ${checked.schemaVersion} verified.` : " Legacy schema 1 integrity verified only."}`);
  process.exit(0);
}

git(repository, ["apply", "--check", "--binary", patchPath]);
if (!apply) {
  console.log(`${target} patch applies cleanly (dry run). ${checked.provenanceVerified ? `Provenance schema ${checked.schemaVersion} verified.` : "Legacy schema 1 integrity verified only."}`);
  process.exit(0);
}
git(repository, ["apply", "--binary", patchPath]);
console.log(`${target} patch applied to the working tree; ${checked.provenanceVerified ? `provenance schema ${checked.schemaVersion} verified` : "legacy schema 1 integrity verified only"}; inspect, test, commit, and push through the branch's normal workflow.`);
