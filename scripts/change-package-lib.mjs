import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const exactSha = /^[0-9a-f]{40}$/;
const targets = ["developer", "web-orchestration"];

export function sha256(input) {
  return createHash("sha256").update(input).digest("hex");
}

export function stableJson(value) {
  function sort(entry) {
    if (Array.isArray(entry)) return entry.map(sort);
    if (!entry || typeof entry !== "object") return entry;
    return Object.fromEntries(Object.keys(entry).sort().map((key) => [key, sort(entry[key])]));
  }
  return JSON.stringify(sort(value));
}

export function sourceLockDigest(lock) {
  return sha256(Buffer.from(`${stableJson(lock)}\n`, "utf8"));
}

function repoPath(pathname, label) {
  const segments = pathname.replace(/^\/+|\/+$/g, "").split("/").filter(Boolean);
  if (segments.length !== 2) throw new Error(`${label} must identify exactly owner/repository`);
  const owner = segments[0];
  const rawRepository = segments[1];
  if (!owner || !rawRepository) throw new Error(`${label} is missing owner or repository`);
  const repository = rawRepository.replace(/\.git$/i, "");
  if (!/^[A-Za-z0-9_.-]+$/.test(owner) || !/^[A-Za-z0-9_.-]+$/.test(repository)) {
    throw new Error(`${label} owner or repository is invalid`);
  }
  return { owner: owner.toLowerCase(), repository: repository.toLowerCase() };
}

export function canonicalRepositoryIdentity(value) {
  let url;
  try {
    url = new URL(value);
  } catch {
    throw new Error("canonical_repository must be a valid HTTPS Git URL");
  }
  if (url.protocol !== "https:" || url.hostname.toLowerCase() !== "github.com" || url.port || url.username || url.password || url.search || url.hash) {
    throw new Error("canonical_repository must be a credential-free https://github.com URL");
  }
  if (!url.pathname.endsWith(".git")) throw new Error("canonical_repository must end in .git");
  const repo = repoPath(url.pathname, "canonical_repository");
  return { host: "github.com", ...repo, url: `https://github.com/${repo.owner}/${repo.repository}.git` };
}

export function parseGitRemote(value) {
  if (typeof value !== "string" || value.trim() !== value || value.length === 0 || /[\r\n\0]/.test(value)) {
    throw new Error("Git remote URL is invalid");
  }
  const scp = value.match(/^(?:([A-Za-z0-9_.-]+)@)?([A-Za-z0-9.-]+):([^:]+)$/);
  if (scp && !value.includes("://")) {
    const host = scp[2]?.toLowerCase();
    const path = scp[3];
    if (!host || !path || path.startsWith("/") || path.includes("\\")) throw new Error("Git remote scp path is invalid");
    return { host, ...repoPath(path, "Git remote") };
  }
  let url;
  try {
    url = new URL(value);
  } catch {
    throw new Error("Git remote must use HTTPS, ssh://, or scp-style SSH");
  }
  if (!["https:", "ssh:"].includes(url.protocol) || url.password || url.search || url.hash) {
    throw new Error("Git remote must use a supported credential-free transport");
  }
  if (url.protocol === "https:" && url.username) throw new Error("HTTPS Git remote must not contain userinfo");
  if (url.protocol === "https:" && url.port) throw new Error("HTTPS Git remote must not use a custom port");
  if (url.protocol === "ssh:" && url.port && url.port !== "22") throw new Error("SSH Git remote must use the default port");
  return { host: url.hostname.toLowerCase(), ...repoPath(url.pathname, "Git remote") };
}

export function assertRemoteMatchesCanonical(remote, canonicalRepository) {
  const expected = canonicalRepositoryIdentity(canonicalRepository);
  const actual = parseGitRemote(remote);
  if (actual.host !== expected.host || actual.owner !== expected.owner || actual.repository !== expected.repository) {
    throw new Error("Supplied repository origin does not match source-lock canonical_repository");
  }
  return expected;
}

export function validateSourceLock(lock) {
  if (!lock || typeof lock !== "object" || Array.isArray(lock) || lock.schema_version !== 1) {
    throw new Error("source-lock schema_version must be 1");
  }
  const identity = canonicalRepositoryIdentity(lock.canonical_repository);
  if (!lock.sources || typeof lock.sources !== "object" || Array.isArray(lock.sources)) throw new Error("source-lock sources are missing");
  for (const branch of ["main", ...targets]) {
    if (!exactSha.test(lock.sources[branch] ?? "")) throw new Error(`source-lock ${branch} must be an exact SHA`);
  }
  return identity;
}

function validateRange(entry, target, directory) {
  if (!entry || typeof entry !== "object" || Array.isArray(entry)) throw new Error(`${target} range is missing`);
  const expectedPatch = target === "developer" ? "developer.patch" : "web-orchestration.patch";
  if (entry.patch !== expectedPatch) throw new Error(`${target} patch name is invalid`);
  if (!exactSha.test(entry.base ?? "") || !exactSha.test(entry.head ?? "")) throw new Error(`${target} range is invalid`);
  if (!Array.isArray(entry.changed_paths) || entry.changed_paths.some((path) => typeof path !== "string")) throw new Error(`${target} changed paths are invalid`);
  if ([...entry.changed_paths].sort().join("\0") !== entry.changed_paths.join("\0")) throw new Error(`${target} changed paths must be sorted`);
  const patch = readFileSync(resolve(directory, expectedPatch));
  if (sha256(patch) !== entry.patch_sha256) throw new Error(`${target} patch digest is invalid`);
  return patch;
}

export function packageDigest(manifestWithoutDigest, developerPatch, webPatch) {
  const hash = createHash("sha256");
  hash.update("agentic-workflow-template-change-package-v2\0", "utf8");
  hash.update(stableJson(manifestWithoutDigest), "utf8");
  for (const [target, patch] of [["developer", developerPatch], ["web-orchestration", webPatch]]) {
    hash.update(`\0${target}\0${patch.length}\0`, "utf8");
    hash.update(patch);
  }
  return hash.digest("hex");
}

export function validateChangePackage(directory, expectedTaskId) {
  const manifest = JSON.parse(readFileSync(resolve(directory, "manifest.json"), "utf8"));
  if (typeof manifest.task_id !== "string" || manifest.task_id.length === 0) throw new Error("Package task_id is invalid");
  if (expectedTaskId && manifest.task_id !== expectedTaskId) throw new Error("Package task_id does not match its directory");
  const developerPatch = validateRange(manifest.ranges?.developer, "developer", directory);
  const webPatch = validateRange(manifest.ranges?.["web-orchestration"], "web-orchestration", directory);

  if (manifest.schema_version === 1) {
    canonicalRepositoryIdentity(manifest.canonical_repository);
    return { manifest, schemaVersion: 1, provenanceVerified: false, developerPatch, webPatch };
  }
  if (manifest.schema_version !== 2) throw new Error("Unsupported package manifest schema_version");
  const canonical = canonicalRepositoryIdentity(manifest.canonical_repository);
  const provenance = manifest.provenance;
  if (!provenance || typeof provenance !== "object" || Array.isArray(provenance)) throw new Error("Package provenance is missing");
  if (provenance.mode !== "canonical-remote-fetch-v1") throw new Error("Package provenance mode is invalid");
  const lock = provenance.source_lock;
  const lockIdentity = validateSourceLock(lock);
  if (lockIdentity.url !== canonical.url) throw new Error("Package source-lock canonical repository does not match manifest");
  if (provenance.source_lock_sha256 !== sourceLockDigest(lock)) throw new Error("Package source-lock digest is invalid");
  for (const target of targets) {
    const entry = manifest.ranges[target];
    if (entry.base !== lock.sources[target]) throw new Error(`${target} base does not match embedded source-lock`);
    if (provenance.fetched_heads?.[target] !== entry.head) throw new Error(`${target} fetched head does not match package range`);
  }
  if (!exactSha.test(provenance.fetched_heads?.developer ?? "") || !exactSha.test(provenance.fetched_heads?.["web-orchestration"] ?? "")) {
    throw new Error("Package fetched heads are invalid");
  }
  if (!/^[0-9a-f]{64}$/.test(manifest.package_sha256 ?? "")) throw new Error("Package binding digest is invalid");
  const core = { ...manifest };
  delete core.package_sha256;
  const expected = packageDigest(core, developerPatch, webPatch);
  if (expected !== manifest.package_sha256) throw new Error("Package binding digest does not match manifest and patch bytes");
  return { manifest, schemaVersion: 2, provenanceVerified: true, developerPatch, webPatch };
}
