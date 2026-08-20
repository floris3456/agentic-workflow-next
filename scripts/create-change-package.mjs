#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { tmpdir } from "node:os";
import { fileURLToPath } from "node:url";
import {
  assertRemoteMatchesCanonical,
  packageDigest,
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
      fail("Usage: create-change-package.mjs --repository <path> --task-id <id> --template-base <sha> --template-head <sha> --developer-base <sha> --developer-head <sha> --web-base <sha> --web-head <sha> --output <empty-directory>");
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

function range(repository, base, head, label, env, excludePrefix) {
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
  const pathspec = excludePrefix ? ["--", ".", `:(exclude)${excludePrefix}`] : ["--"];
  const patch = runGit(repository, ["diff", "--binary", "--full-index", "--no-renames", base, head, ...pathspec], { env });
  const rawNames = runGit(repository, ["diff", "--name-only", "-z", base, head, ...pathspec], { encoding: "buffer", env });
  const paths = rawNames.toString("utf8").split("\0").filter(Boolean).sort();
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
  "--repository", "--task-id", "--template-base", "--template-head",
  "--developer-base", "--developer-head", "--web-base", "--web-head", "--output",
]);
for (const name of values.keys()) if (!known.has(name)) fail(`Unknown argument ${name}`);

const repository = resolve(required(values, "--repository"));
const taskId = required(values, "--task-id");
if (!/^[A-Za-z0-9][A-Za-z0-9._-]{0,127}$/.test(taskId)) fail("task-id is invalid");
runGit(repository, ["rev-parse", "--git-dir"]);

const lock = JSON.parse(readFileSync(resolve(root, "source-lock.json"), "utf8"));
try {
  validateSourceLock(lock);
} catch (error) {
  fail(`source-lock.json is invalid: ${error.message}`);
}
const remote = runGit(repository, ["remote", "get-url", "origin"]).trim();
try {
  assertRemoteMatchesCanonical(remote, lock.canonical_repository);
} catch (error) {
  fail(error.message);
}

const templateBase = exact(required(values, "--template-base"), "template-base");
const templateHead = exact(required(values, "--template-head"), "template-head");
const developerBase = exact(required(values, "--developer-base"), "developer-base");
const developerHead = exact(required(values, "--developer-head"), "developer-head");
const webBase = exact(required(values, "--web-base"), "web-base");
const webHead = exact(required(values, "--web-head"), "web-head");

const output = resolve(required(values, "--output"));
if (existsSync(output) && (!statSync(output).isDirectory() || readdirSync(output).length !== 0)) {
  fail("output must be a missing or empty directory");
}

const temporary = mkdtempSync(join(tmpdir(), "template-package-canonical-"));
try {
  const canonicalRepo = join(temporary, "canonical.git");
  mkdirSync(canonicalRepo);
  const env = sterileGitEnvironment(temporary);
  runGit(canonicalRepo, ["init", "--bare"], { env });
  runGit(canonicalRepo, [
    "fetch", "--no-tags", "--force", lock.canonical_repository,
    "+refs/heads/template-development:refs/remotes/canonical/template-development",
    "+refs/heads/developer:refs/remotes/canonical/developer",
    "+refs/heads/web-orchestration:refs/remotes/canonical/web-orchestration",
  ], { env });
  const fetchedTemplate = runGit(canonicalRepo, ["rev-parse", "refs/remotes/canonical/template-development^{commit}"], { env }).trim();
  const fetchedDeveloper = runGit(canonicalRepo, ["rev-parse", "refs/remotes/canonical/developer^{commit}"], { env }).trim();
  const fetchedWeb = runGit(canonicalRepo, ["rev-parse", "refs/remotes/canonical/web-orchestration^{commit}"], { env }).trim();
  for (const [reviewedHead, canonicalTip, label] of [
    [templateHead, fetchedTemplate, "template-development"],
    [developerHead, fetchedDeveloper, "developer"],
    [webHead, fetchedWeb, "web-orchestration"],
  ]) {
    let resolved;
    try {
      resolved = execFileSync("git", ["-C", canonicalRepo, "rev-parse", `${reviewedHead}^{commit}`], {
        encoding: "utf8",
        stdio: ["ignore", "pipe", "pipe"],
        env,
      }).trim();
    } catch {
      fail(`${label} reviewed head did not resolve exactly from canonical fetch`);
    }
    if (resolved !== reviewedHead) fail(`${label} reviewed head did not resolve exactly from canonical fetch`);
    try {
      execFileSync("git", ["-C", canonicalRepo, "merge-base", "--is-ancestor", reviewedHead, canonicalTip], {
        stdio: "ignore",
        env,
      });
    } catch {
      fail(`${label} reviewed head is not an ancestor of the current canonical tip`);
    }
  }

  const packagePrefix = `changes/${taskId}/`;
  const template = range(canonicalRepo, templateBase, templateHead, "template-development", env, packagePrefix.slice(0, -1));
  if (template.paths.some((path) => path === packagePrefix.slice(0, -1) || path.startsWith(packagePrefix))) {
    fail("template-development range must end before its own generated package storage");
  }
  const developer = range(canonicalRepo, developerBase, developerHead, "developer", env);
  const web = range(canonicalRepo, webBase, webHead, "web-orchestration", env);
  const templatePatch = Buffer.from(template.patch);
  const developerPatch = Buffer.from(developer.patch);
  const webPatch = Buffer.from(web.patch);
  const sourceDate = process.env.SOURCE_DATE_EPOCH;
  const createdAt = sourceDate && /^\d+$/.test(sourceDate)
    ? new Date(Number(sourceDate) * 1000).toISOString()
    : new Date().toISOString();
  const core = {
    schema_version: 3,
    task_id: taskId,
    canonical_repository: lock.canonical_repository,
    created_at: createdAt,
    provenance: {
      mode: "canonical-remote-fetch-v2",
      source_lock: lock,
      source_lock_sha256: sourceLockDigest(lock),
      canonical_tips: {
        "template-development": fetchedTemplate,
        developer: fetchedDeveloper,
        "web-orchestration": fetchedWeb,
      },
      head_relations: {
        "template-development": "reviewed-head-ancestor-of-canonical-tip",
        developer: "reviewed-head-ancestor-of-canonical-tip",
        "web-orchestration": "reviewed-head-ancestor-of-canonical-tip",
      },
    },
    ranges: {
      "template-development": {
        base: templateBase,
        head: templateHead,
        changed_paths: template.paths,
        patch: "template-development.patch",
        patch_sha256: sha256(templatePatch),
      },
      developer: {
        base: developerBase,
        head: developerHead,
        changed_paths: developer.paths,
        patch: "developer.patch",
        patch_sha256: sha256(developerPatch),
      },
      "web-orchestration": {
        base: webBase,
        head: webHead,
        changed_paths: web.paths,
        patch: "web-orchestration.patch",
        patch_sha256: sha256(webPatch),
      },
    },
  };
  const patches = {
    "template-development": templatePatch,
    developer: developerPatch,
    "web-orchestration": webPatch,
  };
  const manifest = { ...core, package_sha256: packageDigest(core, patches) };
  if (!existsSync(output)) mkdirSync(output, { recursive: true });
  writeFileSync(resolve(output, "template-development.patch"), templatePatch);
  writeFileSync(resolve(output, "developer.patch"), developerPatch);
  writeFileSync(resolve(output, "web-orchestration.patch"), webPatch);
  writeFileSync(resolve(output, "manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`);
  const checked = validateChangePackage(output, taskId);
  if (!checked.provenanceVerified || checked.schemaVersion !== 3) fail("newly generated package did not validate as provenance schema 3");
  console.log(`Created provenance-verified template change package ${taskId}: template-development ${template.paths.length} path(s), developer ${developer.paths.length} path(s), web-orchestration ${web.paths.length} path(s).`);
} finally {
  rmSync(temporary, { recursive: true, force: true });
}
