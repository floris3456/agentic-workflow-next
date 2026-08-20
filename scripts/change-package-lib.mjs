import { createHash } from "node:crypto";
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { basename, dirname, join, relative, resolve } from "node:path";

const exactSha = /^[0-9a-f]{40}$/;
const sourceLockTargets = ["developer", "web-orchestration"];
const packageTargetsV2 = ["developer", "web-orchestration"];
const packageTargetsV3 = ["template-development", ...packageTargetsV2];
const patchNames = {
  "template-development": "template-development.patch",
  developer: "developer.patch",
  "web-orchestration": "web-orchestration.patch",
};

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
  const expected = ["main", ...sourceLockTargets];
  if (Object.keys(lock.sources).sort().join("\0") !== [...expected].sort().join("\0")) {
    throw new Error("source-lock sources must contain exactly main, developer, and web-orchestration");
  }
  for (const branch of expected) {
    if (!exactSha.test(lock.sources[branch] ?? "")) throw new Error(`source-lock ${branch} must be an exact SHA`);
  }
  return identity;
}

function validateRange(entry, target, directory) {
  if (!entry || typeof entry !== "object" || Array.isArray(entry)) throw new Error(`${target} range is missing`);
  const expectedPatch = patchNames[target];
  if (!expectedPatch) throw new Error(`${target} is not a supported package target`);
  if (entry.patch !== expectedPatch) throw new Error(`${target} patch name is invalid`);
  if (!exactSha.test(entry.base ?? "") || !exactSha.test(entry.head ?? "")) throw new Error(`${target} range is invalid`);
  if (!Array.isArray(entry.changed_paths) || entry.changed_paths.some((path) => typeof path !== "string"
    || path.length === 0 || path.startsWith("/") || path.includes("\\") || path.includes("\0")
    || path.split("/").some((part) => part === "" || part === "." || part === ".."))) {
    throw new Error(`${target} changed paths are invalid`);
  }
  if (new Set(entry.changed_paths).size !== entry.changed_paths.length) throw new Error(`${target} changed paths must be unique`);
  if ([...entry.changed_paths].sort().join("\0") !== entry.changed_paths.join("\0")) throw new Error(`${target} changed paths must be sorted`);
  const patch = readFileSync(resolve(directory, expectedPatch));
  if (sha256(patch) !== entry.patch_sha256) throw new Error(`${target} patch digest is invalid`);
  return patch;
}

export function packageDigest(manifestWithoutDigest, patches, legacyWebPatch) {
  const targetOrder = manifestWithoutDigest.schema_version === 3 ? packageTargetsV3 : packageTargetsV2;
  const patchMap = Buffer.isBuffer(patches)
    ? { developer: patches, "web-orchestration": legacyWebPatch }
    : patches;
  const hash = createHash("sha256");
  hash.update(`agentic-workflow-template-change-package-v${manifestWithoutDigest.schema_version}\0`, "utf8");
  hash.update(stableJson(manifestWithoutDigest), "utf8");
  for (const target of targetOrder) {
    const patch = patchMap?.[target];
    if (!Buffer.isBuffer(patch)) throw new Error(`${target} package patch bytes are missing`);
    hash.update(`\0${target}\0${patch.length}\0`, "utf8");
    hash.update(patch);
  }
  return hash.digest("hex");
}

export function baseTaskId(identifier) {
  if (typeof identifier !== "string") return "";
  return identifier.replace(/(?:\.|\-)rev\d+$/i, "").replace(/(?:\.|\-)r\d+$/i, "");
}

export function isPackageStoragePath(path) {
  if (typeof path !== "string") return false;
  return path === "changes" || path.startsWith("changes/");
}

export function isTaskPackagePath(path, taskId) {
  if (typeof path !== "string" || typeof taskId !== "string" || !taskId) return false;
  const prefix = `changes/${taskId}`;
  if (path === prefix || path.startsWith(`${prefix}/`)) return true;
  const rest = path.slice(prefix.length);
  if (/^(?:[\.-](?:rev|r)\d+)(?:\/.*)?$/i.test(rest)) return true;
  return false;
}

export function resolveSupersededPath(packagePath, changesDir) {
  if (typeof packagePath !== "string" || packagePath.length === 0) {
    throw new Error("Package supersedes.package_path is invalid");
  }
  if (/[\r\n\0\\]/.test(packagePath)) {
    throw new Error(`Package supersedes.package_path contains invalid characters: ${packagePath}`);
  }
  if (!packagePath.startsWith("changes/")) {
    throw new Error(`Package supersedes.package_path must have form 'changes/<package-directory>', got: ${packagePath}`);
  }
  const segments = packagePath.split("/");
  if (segments.length !== 2 || segments[0] !== "changes") {
    throw new Error(`Package supersedes.package_path must be a single direct child under changes, got: ${packagePath}`);
  }
  const dirName = segments[1];
  if (!dirName || dirName === "." || dirName === ".." || !/^[A-Za-z0-9][A-Za-z0-9._-]{0,127}$/.test(dirName)) {
    throw new Error(`Package supersedes.package_path contains invalid directory segment: ${packagePath}`);
  }
  const resolvedChanges = resolve(changesDir);
  const targetDir = resolve(resolvedChanges, dirName);
  if (!targetDir.startsWith(`${resolvedChanges}/`)) {
    throw new Error(`Package supersedes.package_path escapes changes directory: ${packagePath}`);
  }
  return { dirName, targetDir, normalizedPath: `changes/${dirName}` };
}

export function assertPackagePublicSafe(pkg) {
  const dir = pkg.directory;
  const manifestRaw = readFileSync(join(dir, "manifest.json"), "utf8");
  if (/\bses_[0-9A-Za-z]{16,}\b/.test(manifestRaw)) {
    throw new Error(`Package ${pkg.directoryName ?? basename(dir)} manifest contains a raw OpenCode session identifier`);
  }
  for (const [target, patch] of Object.entries(pkg.patches)) {
    if (patch && patch.length > 0) {
      const text = patch.toString("utf8");
      if (/\bses_[0-9A-Za-z]{16,}\b/.test(text)) {
        throw new Error(`Package ${pkg.directoryName ?? basename(dir)} ${target} patch contains a raw OpenCode session identifier`);
      }
    }
  }
}

export function validateChangePackage(directory, expectedTaskId, options = {}) {
  const manifest = JSON.parse(readFileSync(resolve(directory, "manifest.json"), "utf8"));
  if (typeof manifest.task_id !== "string" || manifest.task_id.length === 0) throw new Error("Package task_id is invalid");
  if (expectedTaskId) {
    const expectedBase = baseTaskId(expectedTaskId);
    if (manifest.task_id !== expectedTaskId && manifest.task_id !== expectedBase) {
      throw new Error("Package task_id does not match its directory");
    }
  }
  if (manifest.revision !== undefined) {
    if (typeof manifest.revision !== "number" || !Number.isInteger(manifest.revision) || manifest.revision < 1) {
      throw new Error("Package revision must be a positive integer");
    }
  }
  if (manifest.supersedes !== undefined) {
    if (!manifest.supersedes || typeof manifest.supersedes !== "object" || Array.isArray(manifest.supersedes)) {
      throw new Error("Package supersedes must be an object");
    }
    const { package_path, package_sha256, revision } = manifest.supersedes;
    if (typeof package_path !== "string" || !package_path.startsWith("changes/")) {
      throw new Error(`Package supersedes.package_path must have form 'changes/<package-directory>', got: ${package_path}`);
    }
    const segments = package_path.split("/");
    if (segments.length !== 2 || segments[0] !== "changes" || !/^[A-Za-z0-9][A-Za-z0-9._-]{0,127}$/.test(segments[1])) {
      throw new Error(`Package supersedes.package_path must be a direct child under changes: ${package_path}`);
    }
    if (!/^[0-9a-f]{64}$/.test(package_sha256 ?? "")) {
      throw new Error("Package supersedes.package_sha256 must be an exact 64-character SHA-256");
    }
    if (revision === undefined || typeof revision !== "number" || !Number.isInteger(revision) || revision < 1) {
      throw new Error("Package supersedes.revision must be a positive integer");
    }
  }
  if (![1, 2, 3].includes(manifest.schema_version)) throw new Error("Unsupported package manifest schema_version");
  const targets = manifest.schema_version === 3 ? packageTargetsV3 : packageTargetsV2;
  if (!manifest.ranges || typeof manifest.ranges !== "object" || Array.isArray(manifest.ranges)
    || Object.keys(manifest.ranges).sort().join("\0") !== [...targets].sort().join("\0")) {
    throw new Error("Package ranges do not match the manifest schema target inventory");
  }
  const patches = Object.fromEntries(targets.map((target) => [target, validateRange(manifest.ranges?.[target], target, directory)]));
  const developerPatch = patches.developer;
  const webPatch = patches["web-orchestration"];

  if (manifest.schema_version === 1) {
    canonicalRepositoryIdentity(manifest.canonical_repository);
    return { manifest, schemaVersion: 1, provenanceVerified: false, patches, developerPatch, webPatch, directory: resolve(directory) };
  }
  const canonical = canonicalRepositoryIdentity(manifest.canonical_repository);
  const provenance = manifest.provenance;
  if (!provenance || typeof provenance !== "object" || Array.isArray(provenance)) throw new Error("Package provenance is missing");
  const expectedMode = manifest.schema_version === 3 ? "canonical-remote-fetch-v2" : "canonical-remote-fetch-v1";
  if (provenance.mode !== expectedMode) throw new Error("Package provenance mode is invalid");
  const lock = provenance.source_lock;
  const lockIdentity = validateSourceLock(lock);
  if (lockIdentity.url !== canonical.url) throw new Error("Package source-lock canonical repository does not match manifest");
  if (provenance.source_lock_sha256 !== sourceLockDigest(lock)) throw new Error("Package source-lock digest is invalid");
  for (const field of ["canonical_tips", "head_relations"]) {
    if (!provenance[field] || typeof provenance[field] !== "object" || Array.isArray(provenance[field])
      || Object.keys(provenance[field]).sort().join("\0") !== [...targets].sort().join("\0")) {
      throw new Error(`Package provenance ${field} does not match the target inventory`);
    }
  }
  for (const target of targets) {
    if (!exactSha.test(provenance.canonical_tips?.[target] ?? "")) throw new Error(`${target} canonical tip is invalid`);
    if (provenance.head_relations?.[target] !== "reviewed-head-ancestor-of-canonical-tip") {
      throw new Error(`${target} reviewed-head relation is invalid`);
    }
  }
  if (manifest.schema_version === 3) {
    const files = readdirSync(resolve(directory)).sort();
    const expectedFiles = ["manifest.json", ...targets.map((target) => patchNames[target])].sort();
    if (files.join("\0") !== expectedFiles.join("\0")) throw new Error("Schema 3 package file inventory is invalid");
    if (options.strictPackageStorage !== false && manifest.ranges["template-development"].changed_paths.some(isPackageStoragePath)) {
      throw new Error("template-development range must not contain package storage paths beneath changes/");
    }
  }
  if (!/^[0-9a-f]{64}$/.test(manifest.package_sha256 ?? "")) throw new Error("Package binding digest is invalid");
  const core = { ...manifest };
  delete core.package_sha256;
  const expected = packageDigest(core, patches);
  if (expected !== manifest.package_sha256) throw new Error("Package binding digest does not match manifest and patch bytes");
  return {
    manifest,
    schemaVersion: manifest.schema_version,
    provenanceVerified: true,
    patches,
    templateDevelopmentPatch: patches["template-development"],
    developerPatch,
    webPatch,
    directory: resolve(directory),
  };
}

export function validatePackageSupersessionChain(changesDir) {
  const resolvedChanges = resolve(changesDir);
  const entries = readdirSync(resolvedChanges, { withFileTypes: true });
  const packages = [];
  const byDirectoryName = new Map();
  const byTaskId = new Map();

  for (const entry of entries) {
    if (entry.isSymbolicLink()) {
      throw new Error(`Symlink entry is forbidden in change package directory: ${entry.name}`);
    }
    if (entry.name === "README.md" || entry.name === ".gitkeep" || entry.name.startsWith(".")) continue;
    if (!entry.isDirectory()) {
      throw new Error(`Unexpected non-directory file in changes: ${entry.name}`);
    }
    const pkgDir = resolve(resolvedChanges, entry.name);
    try {
      const checked = validateChangePackage(pkgDir, entry.name, { strictPackageStorage: false });
      const pkgRecord = { ...checked, directoryName: entry.name };
      packages.push(pkgRecord);
      byDirectoryName.set(entry.name, pkgRecord);
      const taskId = checked.manifest.task_id;
      if (!byTaskId.has(taskId)) byTaskId.set(taskId, []);
      byTaskId.get(taskId).push(pkgRecord);
    } catch (error) {
      throw new Error(`Invalid change package ${entry.name}: ${error.message}`);
    }
  }

  const activePackages = new Map();

  for (const [taskId, taskPkgs] of byTaskId.entries()) {
    const revisionMap = new Map();
    const supersededSet = new Set();

    for (const pkg of taskPkgs) {
      const rev = pkg.manifest.revision ?? 1;
      if (revisionMap.has(rev)) {
        throw new Error(`Ambiguous package revision for task ${taskId}: multiple packages at revision ${rev}`);
      }
      revisionMap.set(rev, pkg);
    }

    for (const pkg of taskPkgs) {
      if (pkg.manifest.supersedes) {
        const { package_path, package_sha256, revision: targetRev } = pkg.manifest.supersedes;
        const { dirName } = resolveSupersededPath(package_path, resolvedChanges);
        const superseded = byDirectoryName.get(dirName);
        if (!superseded) {
          throw new Error(`Package ${pkg.directoryName} supersedes missing package ${package_path}`);
        }
        if (superseded.manifest.task_id !== taskId) {
          throw new Error(`Package ${pkg.directoryName} for task ${taskId} cannot supersede package from different task ${superseded.manifest.task_id}`);
        }
        if (superseded.manifest.package_sha256 !== package_sha256) {
          throw new Error(`Package ${pkg.directoryName} supersedes tampered package ${package_path}: digest mismatch`);
        }
        const supersededRev = superseded.manifest.revision ?? 1;
        if (targetRev !== supersededRev) {
          throw new Error(`Package ${pkg.directoryName} supersedes revision ${targetRev} but target package is revision ${supersededRev}`);
        }
        const pkgRev = pkg.manifest.revision ?? 1;
        if (pkgRev <= supersededRev) {
          throw new Error(`Package ${pkg.directoryName} revision (${pkgRev}) must be strictly greater than superseded revision (${supersededRev})`);
        }
        supersededSet.add(superseded.manifest.package_sha256);
      }
    }

    // Verify acyclic chain
    for (const pkg of taskPkgs) {
      const visited = new Set();
      let current = pkg;
      while (current?.manifest.supersedes) {
        if (visited.has(current.manifest.package_sha256)) {
          throw new Error(`Package supersession cycle detected for task ${taskId}`);
        }
        visited.add(current.manifest.package_sha256);
        const { dirName } = resolveSupersededPath(current.manifest.supersedes.package_path, resolvedChanges);
        current = byDirectoryName.get(dirName);
      }
    }

    const activeList = taskPkgs.filter((pkg) => !supersededSet.has(pkg.manifest.package_sha256));
    if (activeList.length === 0 && taskPkgs.length > 0) {
      throw new Error(`Package supersession cycle detected for task ${taskId}: no active package`);
    }
    if (activeList.length > 1) {
      throw new Error(`Ambiguous package supersession for task ${taskId}: multiple active packages`);
    }
    const active = activeList[0];
    if (active.manifest.schema_version === 3 && active.manifest.ranges["template-development"]?.changed_paths.some((p) => p.startsWith("changes/") && p !== "changes/README.md")) {
      throw new Error(`Active package ${active.directoryName} template-development range contains package storage paths beneath changes/`);
    }
    assertPackagePublicSafe(active);
    activePackages.set(taskId, active);
  }

  return { packages, byTaskId, activePackages };
}

export function resolveLatestChangePackage(changesDir, taskId) {
  const { activePackages } = validatePackageSupersessionChain(changesDir);
  const active = activePackages.get(taskId);
  if (!active) throw new Error(`No change package found for task ${taskId}`);
  return active;
}
