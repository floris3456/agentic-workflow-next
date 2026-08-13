#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");

function fail(message) {
  console.error(message);
  process.exit(1);
}

function argumentsMap(argv) {
  const result = new Map();
  for (let index = 0; index < argv.length; index += 2) {
    const name = argv[index];
    const value = argv[index + 1];
    if (!name?.startsWith("--") || value === undefined || value.startsWith("--")) {
      fail("Usage: create-change-package.mjs --repository <path> --task-id <id> --developer-base <sha> --developer-head <sha> --web-base <sha> --web-head <sha> --output <empty-directory>");
    }
    if (result.has(name)) fail(`Duplicate argument ${name}`);
    result.set(name, value);
  }
  return result;
}

function required(values, name) {
  const value = values.get(name);
  if (!value) fail(`Missing ${name}`);
  return value;
}

function git(repository, args, encoding = "utf8") {
  try {
    return execFileSync("git", ["-C", repository, ...args], {
      encoding,
      stdio: ["ignore", "pipe", "pipe"],
      maxBuffer: 64 * 1024 * 1024,
    });
  } catch (error) {
    const detail = error.stderr?.toString().trim() || error.message;
    fail(`git ${args.join(" ")} failed: ${detail}`);
  }
}

function exactCommit(repository, value, label) {
  if (!/^[0-9a-f]{40}$/.test(value)) fail(`${label} must be an exact lowercase 40-character commit`);
  const resolved = git(repository, ["rev-parse", `${value}^{commit}`]).trim();
  if (resolved !== value) fail(`${label} did not resolve exactly`);
  return value;
}

function range(repository, base, head, label) {
  try {
    execFileSync("git", ["-C", repository, "merge-base", "--is-ancestor", base, head], { stdio: "ignore" });
  } catch {
    fail(`${label} base is not an ancestor of its head`);
  }
  const patch = git(repository, ["diff", "--binary", "--full-index", "--no-renames", base, head, "--"]);
  const rawNames = git(repository, ["diff", "--name-only", "-z", base, head, "--"], "buffer");
  const paths = rawNames.toString("utf8").split("\0").filter(Boolean).sort();
  return { patch, paths };
}

const values = argumentsMap(process.argv.slice(2));
const known = new Set(["--repository", "--task-id", "--developer-base", "--developer-head", "--web-base", "--web-head", "--output"]);
for (const name of values.keys()) if (!known.has(name)) fail(`Unknown argument ${name}`);

const repository = resolve(required(values, "--repository"));
const taskId = required(values, "--task-id");
if (!/^[A-Za-z0-9][A-Za-z0-9._-]{0,127}$/.test(taskId)) fail("task-id is invalid");
git(repository, ["rev-parse", "--git-dir"]);

const developerBase = exactCommit(repository, required(values, "--developer-base"), "developer-base");
const developerHead = exactCommit(repository, required(values, "--developer-head"), "developer-head");
const webBase = exactCommit(repository, required(values, "--web-base"), "web-base");
const webHead = exactCommit(repository, required(values, "--web-head"), "web-head");
const output = resolve(required(values, "--output"));
if (existsSync(output)) {
  if (!statSync(output).isDirectory() || readdirSync(output).length !== 0) fail("output must be a missing or empty directory");
} else {
  mkdirSync(output, { recursive: true });
}

const developer = range(repository, developerBase, developerHead, "developer");
const web = range(repository, webBase, webHead, "web-orchestration");
const developerPatch = Buffer.from(developer.patch);
const webPatch = Buffer.from(web.patch);
writeFileSync(resolve(output, "developer.patch"), developerPatch);
writeFileSync(resolve(output, "web-orchestration.patch"), webPatch);

const lock = JSON.parse(readFileSync(resolve(root, "source-lock.json"), "utf8"));
const sourceDate = process.env.SOURCE_DATE_EPOCH;
const createdAt = sourceDate && /^\d+$/.test(sourceDate)
  ? new Date(Number(sourceDate) * 1000).toISOString()
  : new Date().toISOString();
const digest = (bytes) => createHash("sha256").update(bytes).digest("hex");
const manifest = {
  schema_version: 1,
  task_id: taskId,
  canonical_repository: lock.canonical_repository,
  created_at: createdAt,
  ranges: {
    developer: {
      base: developerBase,
      head: developerHead,
      changed_paths: developer.paths,
      patch: "developer.patch",
      patch_sha256: digest(developerPatch),
    },
    "web-orchestration": {
      base: webBase,
      head: webHead,
      changed_paths: web.paths,
      patch: "web-orchestration.patch",
      patch_sha256: digest(webPatch),
    },
  },
};
writeFileSync(resolve(output, "manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`);
console.log(`Created template change package ${taskId}: developer ${developer.paths.length} path(s), web-orchestration ${web.paths.length} path(s).`);
