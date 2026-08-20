import { posix as pathPosix } from "node:path";

const TASK_ID = /^[A-Za-z0-9][A-Za-z0-9._-]{0,127}$/;
const SHA = /^[0-9a-f]{40}$/;
const DIGEST = /^[0-9a-f]{64}$/;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const RANGE_KEYS = ["template-development", "developer", "web-orchestration"];

function exactKeys(value, expected, label) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error(`${label} must be an object`);
  }
  const actual = Object.keys(value).sort();
  const wanted = [...expected].sort();
  if (JSON.stringify(actual) !== JSON.stringify(wanted)) {
    throw new Error(`${label} has unexpected fields`);
  }
}

function exactSha(value, label) {
  if (typeof value !== "string" || !SHA.test(value)) {
    throw new Error(`${label} must be an exact lowercase 40-character commit`);
  }
}

function expectedSupersedes(taskId, revision) {
  if (revision === 2) return `changes/${taskId}`;
  return `changes/${taskId}.rev${revision - 1}`;
}

export function packagePathForRequest(request) {
  return request.revision === 1
    ? `changes/${request.task_id}`
    : `changes/${request.task_id}.rev${request.revision}`;
}

export function requestPathForTask(taskId) {
  return `docs/work/package-requests/${taskId}.json`;
}

export function validatePackageRequest(request, options = {}) {
  const completed = request?.status === "completed";
  exactKeys(
    request,
    completed
      ? ["schema_version", "request_id", "status", "task_id", "revision", "supersedes", "ranges", "result"]
      : ["schema_version", "request_id", "status", "task_id", "revision", "supersedes", "ranges"],
    "package request",
  );
  if (request.schema_version !== 1) throw new Error("package request schema_version must be 1");
  if (!UUID.test(request.request_id)) throw new Error("package request request_id must be a UUID");
  if (!["requested", "completed"].includes(request.status)) throw new Error("package request status is invalid");
  if (!TASK_ID.test(request.task_id)) throw new Error("package request task_id is invalid");
  if (!Number.isInteger(request.revision) || request.revision < 1) {
    throw new Error("package request revision must be a positive integer");
  }

  exactKeys(request.ranges, RANGE_KEYS, "package request ranges");
  for (const branch of RANGE_KEYS) {
    const range = request.ranges[branch];
    exactKeys(range, ["base", "head"], `${branch} range`);
    exactSha(range.base, `${branch} base`);
    exactSha(range.head, `${branch} head`);
  }

  if (request.revision === 1) {
    if (request.supersedes !== null) throw new Error("revision 1 must not supersede another package");
  } else {
    const expected = expectedSupersedes(request.task_id, request.revision);
    if (request.supersedes !== expected) {
      throw new Error(`revision ${request.revision} must supersede ${expected}`);
    }
  }

  if (options.requestPath !== undefined) {
    const normalized = pathPosix.normalize(options.requestPath);
    const expected = requestPathForTask(request.task_id);
    if (normalized !== expected || normalized.startsWith("../")) {
      throw new Error(`package request path must be ${expected}`);
    }
  }

  if (completed) {
    exactKeys(request.result, ["request_sha", "package_path", "package_sha256"], "package request result");
    exactSha(request.result.request_sha, "package request result request_sha");
    const expectedPath = packagePathForRequest(request);
    if (request.result.package_path !== expectedPath) {
      throw new Error(`package request result package_path must be ${expectedPath}`);
    }
    if (typeof request.result.package_sha256 !== "string" || !DIGEST.test(request.result.package_sha256)) {
      throw new Error("package request result package_sha256 must be a lowercase SHA-256 digest");
    }
  }
  return request;
}

export function completePackageRequest(request, { requestSha, packageSha256 }) {
  validatePackageRequest(request);
  if (request.status !== "requested") throw new Error("only a requested package request can be completed");
  exactSha(requestSha, "request SHA");
  if (typeof packageSha256 !== "string" || !DIGEST.test(packageSha256)) {
    throw new Error("package SHA-256 is invalid");
  }
  const completed = {
    ...request,
    status: "completed",
    result: {
      request_sha: requestSha,
      package_path: packagePathForRequest(request),
      package_sha256: packageSha256,
    },
  };
  validatePackageRequest(completed);
  return completed;
}
