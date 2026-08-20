#!/usr/bin/env node
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import {
  completePackageRequest,
  packagePathForRequest,
  validatePackageRequest,
} from "../scripts/package-request-lib.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const sha = "0123456789abcdef0123456789abcdef01234567";
const sha2 = "89abcdef0123456789abcdef0123456789abcdef";
const digest = "ab".repeat(32);

function request(overrides = {}) {
  return {
    schema_version: 1,
    request_id: "123e4567-e89b-42d3-a456-426614174000",
    status: "requested",
    task_id: "TASK-001",
    revision: 1,
    supersedes: null,
    ranges: {
      "template-development": { base: sha, head: sha2 },
      developer: { base: sha, head: sha2 },
      "web-orchestration": { base: sha, head: sha2 },
    },
    ...overrides,
  };
}

test("revision one request is strict and derives its package path", () => {
  const value = request();
  assert.equal(validatePackageRequest(value, { requestPath: "docs/work/package-requests/TASK-001.json" }), value);
  assert.equal(packagePathForRequest(value), "changes/TASK-001");
});

test("arbitrary command or output fields are rejected", () => {
  assert.throws(() => validatePackageRequest({ ...request(), command: "echo nope" }), /unexpected fields/);
  assert.throws(() => validatePackageRequest({ ...request(), output: "elsewhere" }), /unexpected fields/);
});

test("request path and exact lowercase commit fields are enforced", () => {
  assert.throws(() => validatePackageRequest(request(), { requestPath: "docs/work/package-requests/OTHER.json" }), /path must be/);
  const value = request();
  value.ranges.developer.head = "ABC";
  assert.throws(() => validatePackageRequest(value), /exact lowercase 40-character commit/);
});

test("revision one cannot supersede and later revisions must chain exactly", () => {
  assert.throws(() => validatePackageRequest(request({ supersedes: "changes/TASK-001-old" })), /revision 1/);
  const rev2 = request({ revision: 2, supersedes: "changes/TASK-001" });
  validatePackageRequest(rev2);
  assert.equal(packagePathForRequest(rev2), "changes/TASK-001.rev2");
  assert.throws(
    () => validatePackageRequest(request({ revision: 2, supersedes: "changes/OTHER" })),
    /must supersede changes\/TASK-001/,
  );
});

test("completed request binds request SHA and package digest to derived path", () => {
  const completed = completePackageRequest(request(), { requestSha: sha2, packageSha256: digest });
  assert.equal(completed.status, "completed");
  assert.equal(completed.result.package_path, "changes/TASK-001");
  validatePackageRequest(completed);
  assert.throws(
    () => validatePackageRequest({ ...completed, result: { ...completed.result, package_path: "changes/OTHER" } }),
    /package_path/,
  );
});

test("broker workflow is request-only and uses a non-persistent checkout credential", () => {
  const workflow = fs.readFileSync(path.join(root, ".github/workflows/generate-change-package.yml"), "utf8");
  assert.match(workflow, /branches:\s*\[template-development\]/);
  assert.match(workflow, /docs\/work\/package-requests\/\*\.json/);
  assert.match(workflow, /permissions:\s*\n\s+contents:\s+write/);
  assert.match(workflow, /persist-credentials:\s*false/);
  assert.match(workflow, /git diff-tree --no-commit-id --name-only -r/);
  assert.match(workflow, /refs\/remotes\/origin\/template-development/);
  assert.match(workflow, /refs\/heads\/template-development/);
  assert.doesNotMatch(workflow, /workflow_dispatch:/);
  assert.doesNotMatch(workflow, /pull_request:/);
  assert.doesNotMatch(workflow, /secrets\./);
});
