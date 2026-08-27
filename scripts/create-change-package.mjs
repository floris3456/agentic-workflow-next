#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from "node:fs";
import { basename, dirname, join, relative, resolve } from "node:path";
import { tmpdir } from "node:os";
import { fileURLToPath } from "node:url";
import {
  assertPackagePublicSafe,
  assertRemoteMatchesCanonical,
  isPackageStoragePath,
  isTaskPackagePath,
  packageDigest,
  resolveSupersededPath,
  sha256,
  sourceLockDigest,
  validateChangePackage,
  validateSourceLock,
} from "./change-package-lib.mjs";

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
      fail("Usage: create-change-package.mjs --repository <path> --task-id <id> --template-base <sha> --template-head <sha> --developer-base <sha> --developer-head <sha> --web-base <sha> --web-head <sha> --output <empty-directory> [--revision <number>] [--supersedes <package-dir>]");
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

function runGit(repository, args, options = {}) {
  try {
    return execFileSync("git", ["-C", repository, ...args], {
      encoding: options.encoding ?? "utf8",
      stdio: ["ignore", "pipe", "pipe"],
      maxBuffer: 64 * 1024 * 1024,
      ...(options.env ? { env: options.env } : {}),
    });
  } catch (error) {
    const detail = error.stderr?.toString().trim() || error.message;
    fail(`git ${args.join(" ")} failed: ${detail}`);
  }
}

function exact(value, label) {
  if (!/^[0-9a-f]{40}$/.test(value)) fail(`${label} must be an exact lowercase 40-character commit`);
  return value;
}

function range(repository, base, head, label, env, filterFn) {
  const resolvedBase = runGit(repository, ["rev-parse", `${base}^{commit}`], { env }).trim();
  const resolvedHead = runGit(repository, ["rev-parse", `${head}^{commit}`], { env }).trim();
  if (resolvedBase !== base || resolvedHead !== head) fail(`${label} range did not resolve exactly from canonical fetch`);
  try {
    execFileSync("git", ["-C", repository, "merge-base", "--is-ancestor", base, head], {
      stdio: "ignore",
      ...(env ? { env } : {}),
    });
  } catch {
    fail(`${label} range base is not an ancestor of canonical head`);
  }
  const rawNames = runGit(repository, ["diff", "--no-renames", "--name-only", "-z", base, head, "--"], { encoding: "buffer", env });
  const allPaths = rawNames.toString("utf8").split("\0").filter(Boolean);
  const paths = filterFn ? allPaths.filter(filterFn).sort() : allPaths.sort();
  let patch = Buffer.alloc(0);
  if (paths.length > 0) {
    const pathspecs = paths.map((p) => `:(literal)${p}`);
    const rawPatch = runGit(repository, ["diff", "--binary", "--full-index", "--no-renames", base, head, "--", ...pathspecs], { encoding: "buffer", env });
    patch = Buffer.from(rawPatch);
  }
  return { patch, paths };
}

function sterileGitEnvironment(directory) {
  const home = join(directory, "home");
  const xdg = join(directory, "xdg");
  mkdirSync(home, { recursive: true, mode: 0o700 });
  mkdirSync(xdg, { recursive: true, mode: 0o700 });
  const globalConfig = join(directory, "empty-gitconfig");
  writeFileSync(globalConfig, "", { mode: 0o600 });
  return {
    PATH: process.env.PATH ?? "",
    HOME: home,
    XDG_CONFIG_HOME: xdg,
    GIT_CONFIG_NOSYSTEM: "1",
    GIT_CONFIG_GLOBAL: globalConfig,
    GIT_TERMINAL_PROMPT: "0",
    LC_ALL: "C",
  };
}

const values = argumentsMap(process.argv.slice(2));
const known = new Set([
  "--repository", "--task-id", "--workspace-base", "--workspace-head",
  "--template-base", "--template-head", "--developer-base", "--developer-head",
  "--orchestration-base", "--orchestration-head", "--web-base", "--web-head",
  "--output", "--revision", "--supersedes",
]);
for (const name of values.keys()) if (!known.has(name)) fail(`Unknown argument ${name}`);

const currentFlags = ["--workspace-base", "--workspace-head", "--orchestration-base", "--orchestration-head"];
const legacyFlags = ["--template-base", "--template-head", "--web-base", "--web-head"];
const currentMode = currentFlags.some((name) => values.has(name));
if (currentMode && legacyFlags.some((name) => values.has(name))) fail("Do not mix current workspace/orchestration flags with legacy template/web flags");
const profile = currentMode ? {
  schemaVersion: 4,
  sourceLockSchema: 2,
  maintenanceTarget: "workspace",
  maintenanceArg: "workspace",
  maintenancePatch: "workspace.patch",
  orchestrationTarget: "orchestration",
  orchestrationArg: "orchestration",
  orchestrationPatch: "orchestration.patch",
  provenanceMode: "canonical-remote-fetch-v3",
} : {
  schemaVersion: 3,
  sourceLockSchema: 1,
  maintenanceTarget: "template-development",
  maintenanceArg: "template",
  maintenancePatch: "template-development.patch",
  orchestrationTarget: "web-orchestration",
  orchestrationArg: "web",
  orchestrationPatch: "web-orchestration.patch",
  provenanceMode: "canonical-remote-fetch-v2",
};

const repository = resolve(required(values, "--repository"));
const taskId = required(values, "--task-id");
if (!/^[A-Za-z0-9][A-Za-z0-9._-]{0,127}$/.test(taskId)) fail("task-id is invalid");
runGit(repository, ["rev-parse", "--git-dir"]);

let targetRevision = values.has("--revision") ? Number(values.get("--revision")) : undefined;
if (targetRevision !== undefined && (!Number.isInteger(targetRevision) || targetRevision < 1)) fail("--revision must be a positive integer");

let supersedesEntry;
const supersedesInput = values.get("--supersedes");
if (supersedesInput) {
  const supersededResolved = resolve(supersedesInput);
  let checkedSuperseded;
  try {
    checkedSuperseded = validateChangePackage(supersededResolved, undefined, { strictPackageStorage: false });
  } catch (error) {
    fail(`Superseded package is invalid: ${error.message}`);
  }
  if (checkedSuperseded.manifest.task_id !== taskId) fail(`Superseded package task_id (${checkedSuperseded.manifest.task_id}) does not match current task-id (${taskId})`);
  const supersededRev = checkedSuperseded.manifest.revision ?? 1;
  if (targetRevision === undefined) targetRevision = supersededRev + 1;
  else if (targetRevision <= supersededRev) fail(`--revision (${targetRevision}) must be strictly greater than superseded package revision (${supersededRev})`);
  let relPath = relative(repository, checkedSuperseded.directory);
  if (relPath.startsWith("..") || !relPath) relPath = relative(root, checkedSuperseded.directory);
  if (relPath.startsWith("..") || !relPath) relPath = `changes/${basename(checkedSuperseded.directory)}`;
  const { normalizedPath } = resolveSupersededPath(relPath, resolve(repository, "changes"));
  supersedesEntry = { package_path: normalizedPath, package_sha256: checkedSuperseded.manifest.package_sha256, revision: supersededRev };
}

const lock = JSON.parse(readFileSync(resolve(root, "source-lock.json"), "utf8"));
try { validateSourceLock(lock); } catch (error) { fail(`source-lock.json is invalid: ${error.message}`); }
if (lock.schema_version !== profile.sourceLockSchema) fail(`This package mode requires source-lock schema ${profile.sourceLockSchema}`);
const remote = runGit(repository, ["remote", "get-url", "origin"]).trim();
try { assertRemoteMatchesCanonical(remote, lock.canonical_repository); } catch (error) { fail(error.message); }

const maintenanceBase = exact(required(values, `--${profile.maintenanceArg}-base`), `${profile.maintenanceArg}-base`);
const maintenanceHead = exact(required(values, `--${profile.maintenanceArg}-head`), `${profile.maintenanceArg}-head`);
const developerBase = exact(required(values, "--developer-base"), "developer-base");
const developerHead = exact(required(values, "--developer-head"), "developer-head");
const orchestrationBase = exact(required(values, `--${profile.orchestrationArg}-base`), `${profile.orchestrationArg}-base`);
const orchestrationHead = exact(required(values, `--${profile.orchestrationArg}-head`), `${profile.orchestrationArg}-head`);

const output = resolve(required(values, "--output"));
if (existsSync(output) && (!statSync(output).isDirectory() || readdirSync(output).length !== 0)) fail("output must be a missing or empty directory");

const temporary = mkdtempSync(join(tmpdir(), "workspace-package-canonical-"));
try {
  const canonicalRepo = join(temporary, "canonical.git");
  mkdirSync(canonicalRepo);
  const env = sterileGitEnvironment(temporary);
  runGit(canonicalRepo, ["init", "--bare"], { env });
  runGit(canonicalRepo, [
    "fetch", "--no-tags", "--force", lock.canonical_repository,
    `+refs/heads/${profile.maintenanceTarget}:refs/remotes/canonical/${profile.maintenanceTarget}`,
    "+refs/heads/developer:refs/remotes/canonical/developer",
    `+refs/heads/${profile.orchestrationTarget}:refs/remotes/canonical/${profile.orchestrationTarget}`,
  ], { env });
  const fetchedMaintenance = runGit(canonicalRepo, ["rev-parse", `refs/remotes/canonical/${profile.maintenanceTarget}^{commit}`], { env }).trim();
  const fetchedDeveloper = runGit(canonicalRepo, ["rev-parse", "refs/remotes/canonical/developer^{commit}"], { env }).trim();
  const fetchedOrchestration = runGit(canonicalRepo, ["rev-parse", `refs/remotes/canonical/${profile.orchestrationTarget}^{commit}`], { env }).trim();
  for (const [reviewedHead, canonicalTip, label] of [
    [maintenanceHead, fetchedMaintenance, profile.maintenanceTarget],
    [developerHead, fetchedDeveloper, "developer"],
    [orchestrationHead, fetchedOrchestration, profile.orchestrationTarget],
  ]) {
    let resolved;
    try {
      resolved = execFileSync("git", ["-C", canonicalRepo, "rev-parse", `${reviewedHead}^{commit}`], { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"], env }).trim();
    } catch { fail(`${label} reviewed head did not resolve exactly from canonical fetch`); }
    if (resolved !== reviewedHead) fail(`${label} reviewed head did not resolve exactly from canonical fetch`);
    try { execFileSync("git", ["-C", canonicalRepo, "merge-base", "--is-ancestor", reviewedHead, canonicalTip], { stdio: "ignore", env }); }
    catch { fail(`${label} reviewed head is not an ancestor of the current canonical tip`); }
  }

  const maintenance = range(canonicalRepo, maintenanceBase, maintenanceHead, profile.maintenanceTarget, env, (path) => !isPackageStoragePath(path));
  if (maintenance.paths.some(isPackageStoragePath)) fail(`${profile.maintenanceTarget} range must not contain package storage paths beneath changes/`);
  const developer = range(canonicalRepo, developerBase, developerHead, "developer", env);
  const orchestration = range(canonicalRepo, orchestrationBase, orchestrationHead, profile.orchestrationTarget, env);
  const maintenancePatch = maintenance.patch;
  const developerPatch = developer.patch;
  const orchestrationPatch = orchestration.patch;
  const sourceDate = process.env.SOURCE_DATE_EPOCH;
  const createdAt = sourceDate && /^\d+$/.test(sourceDate) ? new Date(Number(sourceDate) * 1000).toISOString() : new Date().toISOString();
  const canonicalTips = {
    [profile.maintenanceTarget]: fetchedMaintenance,
    developer: fetchedDeveloper,
    [profile.orchestrationTarget]: fetchedOrchestration,
  };
  const headRelations = Object.fromEntries(Object.keys(canonicalTips).map((target) => [target, "reviewed-head-ancestor-of-canonical-tip"]));
  const ranges = {
    [profile.maintenanceTarget]: { base: maintenanceBase, head: maintenanceHead, changed_paths: maintenance.paths, patch: profile.maintenancePatch, patch_sha256: sha256(maintenancePatch) },
    developer: { base: developerBase, head: developerHead, changed_paths: developer.paths, patch: "developer.patch", patch_sha256: sha256(developerPatch) },
    [profile.orchestrationTarget]: { base: orchestrationBase, head: orchestrationHead, changed_paths: orchestration.paths, patch: profile.orchestrationPatch, patch_sha256: sha256(orchestrationPatch) },
  };
  const core = {
    schema_version: profile.schemaVersion,
    task_id: taskId,
    ...(targetRevision !== undefined ? { revision: targetRevision } : {}),
    ...(supersedesEntry !== undefined ? { supersedes: supersedesEntry } : {}),
    canonical_repository: lock.canonical_repository,
    created_at: createdAt,
    provenance: { mode: profile.provenanceMode, source_lock: lock, source_lock_sha256: sourceLockDigest(lock), canonical_tips: canonicalTips, head_relations: headRelations },
    ranges,
  };
  const patches = { [profile.maintenanceTarget]: maintenancePatch, developer: developerPatch, [profile.orchestrationTarget]: orchestrationPatch };
  const manifest = { ...core, package_sha256: packageDigest(core, patches) };
  if (!existsSync(output)) mkdirSync(output, { recursive: true });
  writeFileSync(resolve(output, profile.maintenancePatch), maintenancePatch);
  writeFileSync(resolve(output, "developer.patch"), developerPatch);
  writeFileSync(resolve(output, profile.orchestrationPatch), orchestrationPatch);
  writeFileSync(resolve(output, "manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`);
  const checked = validateChangePackage(output, taskId);
  if (!checked.provenanceVerified || checked.schemaVersion !== profile.schemaVersion) fail(`newly generated package did not validate as provenance schema ${profile.schemaVersion}`);
  assertPackagePublicSafe(checked);
  console.log(`Created provenance-verified change package ${taskId}${targetRevision ? ` (rev ${targetRevision})` : ""}: ${profile.maintenanceTarget} ${maintenance.paths.length} path(s), developer ${developer.paths.length} path(s), ${profile.orchestrationTarget} ${orchestration.paths.length} path(s).`);
} finally {
  rmSync(temporary, { recursive: true, force: true });
}
