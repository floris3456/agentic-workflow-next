#!/usr/bin/env node
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { validateChangePackage } from "./change-package-lib.mjs";
import {
  packagePathForRequest,
  validatePackageRequest,
} from "./package-request-lib.mjs";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const failures = [];
const fail = (message) => failures.push(message);
const read = (path) => readFileSync(join(root, path), "utf8");

for (const path of [
  ".github/workflows/generate-change-package.yml",
  "scripts/package-request-lib.mjs",
  "scripts/process-package-request.mjs",
  "scripts/validate-package-broker.mjs",
  "tests/package-request.test.mjs",
  "docs/work/package-requests/README.md",
  "docs/architecture/package-generation-broker.md",
]) {
  if (!existsSync(join(root, path))) fail(`Missing package broker path: ${path}`);
}

if (existsSync(join(root, ".github/workflows/generate-change-package.yml"))) {
  const workflow = read(".github/workflows/generate-change-package.yml");
  const required = [
    "branches: [template-development]",
    '\"docs/work/package-requests/*.json\"',
    "contents: write",
    "persist-credentials: false",
    "fetch-depth: 2",
    "process-package-request.mjs",
    "validate-package-broker.mjs",
    "refs/remotes/origin/template-development",
    "refs/heads/template-development",
  ];
  for (const term of required) if (!workflow.includes(term)) fail(`Package broker workflow is missing: ${term}`);
  for (const forbidden of ["pull_request:", "workflow_dispatch:", "repository_dispatch:", "schedule:", "secrets."]) {
    if (workflow.includes(forbidden)) fail(`Package broker workflow contains forbidden trigger/secret surface: ${forbidden}`);
  }
}

if (existsSync(join(root, ".opencode/skills/template-maintenance/SKILL.md"))) {
  const skill = read(".opencode/skills/template-maintenance/SKILL.md");
  for (const term of [
    "fixed-operation package\nbroker",
    "docs/work/package-requests/<task-id>.json",
    "The request commit is the trigger",
    "never replay an uncertain publication",
  ]) if (!skill.includes(term)) fail(`Template-maintenance skill is missing package broker boundary: ${term}`);
}

if (existsSync(join(root, "docs/architecture/package-generation-broker.md"))) {
  const architecture = read("docs/architecture/package-generation-broker.md");
  for (const term of [
    "one bounded networked\nexecution surface",
    "no command, repository URL, output path, credential, environment",
    "remote tip to equal the original request SHA",
    "never replayed\nautomatically",
  ]) if (!architecture.includes(term)) fail(`Package broker AS-BUILT is missing boundary: ${term}`);
}

const requestDirectory = join(root, "docs/work/package-requests");
if (existsSync(requestDirectory)) {
  for (const name of readdirSync(requestDirectory)) {
    if (name === "README.md") continue;
    if (!name.endsWith(".json")) {
      fail(`Unexpected package-request entry: ${name}`);
      continue;
    }
    const relativePath = `docs/work/package-requests/${name}`;
    try {
      const request = JSON.parse(read(relativePath));
      validatePackageRequest(request, { requestPath: relativePath });
      const packagePath = packagePathForRequest(request);
      if (request.status === "requested") {
        if (existsSync(join(root, packagePath))) fail(`${relativePath} is requested but package already exists`);
      } else {
        if (!existsSync(join(root, packagePath))) {
          fail(`${relativePath} is completed but package is missing`);
          continue;
        }
        const checked = validateChangePackage(join(root, packagePath), request.task_id);
        if (checked.manifest.package_sha256 !== request.result.package_sha256) {
          fail(`${relativePath} result digest does not match package manifest`);
        }
      }
    } catch (error) {
      fail(`${relativePath} is invalid: ${error.message}`);
    }
  }
}

if (failures.length) {
  console.error(`Package broker validation failed (${failures.length}):`);
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}
console.log("Package broker validation passed.");
