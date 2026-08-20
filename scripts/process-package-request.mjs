#!/usr/bin/env node
import { execFileSync, spawnSync } from "node:child_process";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { assertPackagePublicSafe, validateChangePackage } from "./change-package-lib.mjs";
import {
  completePackageRequest,
  packagePathForRequest,
  validatePackageRequest,
} from "./package-request-lib.mjs";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");

function fail(message) {
  console.error(message);
  process.exit(1);
}

function argsMap(argv) {
  if (argv.length !== 4) fail("Usage: process-package-request.mjs --request <repo-relative-json> --request-sha <sha>");
  const values = new Map();
  for (let i = 0; i < argv.length; i += 2) {
    if (!["--request", "--request-sha"].includes(argv[i]) || values.has(argv[i])) fail("Invalid package request arguments");
    values.set(argv[i], argv[i + 1]);
  }
  return values;
}

function git(args) {
  try {
    return execFileSync("git", ["-C", root, ...args], {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
      maxBuffer: 16 * 1024 * 1024,
    });
  } catch (error) {
    fail(error.stderr?.toString().trim() || error.message);
  }
}

function statusPaths() {
  const raw = git(["status", "--porcelain=v1", "-z", "--untracked-files=all"]);
  if (!raw) return [];
  const records = raw.split("\0").filter(Boolean);
  const paths = [];
  for (const record of records) {
    if (record.length < 4 || record[2] !== " ") fail("Unexpected Git status record while generating package");
    paths.push(record.slice(3));
  }
  return paths.sort();
}

const values = argsMap(process.argv.slice(2));
const requestRelative = values.get("--request");
const requestSha = values.get("--request-sha");
if (!/^[0-9a-f]{40}$/.test(requestSha ?? "")) fail("request-sha must be an exact lowercase 40-character commit");

const requestFile = resolve(root, requestRelative);
if (relative(root, requestFile).startsWith("..")) fail("request path escapes repository");
if (statusPaths().length !== 0) fail("package broker requires a clean checkout");
if (git(["rev-parse", "HEAD"]).trim() !== requestSha) fail("request-sha does not match checked-out HEAD");

let request;
try {
  request = JSON.parse(readFileSync(requestFile, "utf8"));
  validatePackageRequest(request, { requestPath: requestRelative });
} catch (error) {
  fail(`Invalid package request: ${error.message}`);
}
if (request.status !== "requested") fail("package request must have status requested");

const packageRelative = packagePathForRequest(request);
const packageDirectory = resolve(root, packageRelative);
if (existsSync(packageDirectory)) fail(`package output already exists: ${packageRelative}`);

const sourceDate = git(["show", "-s", "--format=%ct", requestSha]).trim();
const generatorArgs = [
  resolve(root, "scripts/create-change-package.mjs"),
  "--repository", root,
  "--task-id", request.task_id,
  "--template-base", request.ranges["template-development"].base,
  "--template-head", request.ranges["template-development"].head,
  "--developer-base", request.ranges.developer.base,
  "--developer-head", request.ranges.developer.head,
  "--web-base", request.ranges["web-orchestration"].base,
  "--web-head", request.ranges["web-orchestration"].head,
  "--output", packageDirectory,
  "--revision", String(request.revision),
];
if (request.supersedes !== null) {
  generatorArgs.push("--supersedes", resolve(root, request.supersedes));
}
const generated = spawnSync(process.execPath, generatorArgs, {
  cwd: root,
  encoding: "utf8",
  stdio: ["ignore", "pipe", "pipe"],
  env: { ...process.env, SOURCE_DATE_EPOCH: sourceDate },
  maxBuffer: 64 * 1024 * 1024,
});
if (generated.status !== 0) {
  fail(generated.stderr?.trim() || generated.stdout?.trim() || "package generator failed");
}

let checked;
try {
  checked = validateChangePackage(packageDirectory, request.task_id);
  if (!checked.provenanceVerified || checked.schemaVersion !== 3) {
    throw new Error("generated package is not provenance-verified schema 3");
  }
  assertPackagePublicSafe(checked);
} catch (error) {
  fail(`Generated package validation failed: ${error.message}`);
}

const completed = completePackageRequest(request, {
  requestSha,
  packageSha256: checked.manifest.package_sha256,
});
writeFileSync(requestFile, `${JSON.stringify(completed, null, 2)}\n`);

const expected = [
  requestRelative,
  `${packageRelative}/developer.patch`,
  `${packageRelative}/manifest.json`,
  `${packageRelative}/template-development.patch`,
  `${packageRelative}/web-orchestration.patch`,
].sort();
const actual = statusPaths();
if (JSON.stringify(actual) !== JSON.stringify(expected)) {
  fail(`package broker changed unexpected paths: ${actual.join(", ")}`);
}
console.log(JSON.stringify({
  task_id: request.task_id,
  request_sha: requestSha,
  package_path: packageRelative,
  package_sha256: checked.manifest.package_sha256,
}));
