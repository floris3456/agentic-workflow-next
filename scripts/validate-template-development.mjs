#!/usr/bin/env node
import { createHash } from "node:crypto";
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const failures = [];
const fail = (message) => failures.push(message);
const read = (path) => readFileSync(join(root, path), "utf8");
const required = [
  "README.md", "AGENTS.md", "source-lock.json", "opencode.json",
  ".opencode/agents/template-maintainer.md", ".opencode/skills/template-maintenance/SKILL.md",
  "docs/architecture/AS-BUILT.md", "docs/design/template-maintenance-workflow.md", "docs/deviations.md",
  "docs/work/templates/task-progress-template.md", "docs/work/templates/maintainer-response-template.md",
  "scripts/create-change-package.mjs", "scripts/apply-change-package.mjs",
  "scripts/bootstrap-template-development.sh", "scripts/recover-template-development-sync.sh",
  "scripts/validate-template-development.sh", "tests/change-package.test.mjs",
];
for (const path of required) if (!existsSync(join(root, path))) fail(`Missing required path: ${path}`);

const allowedTopLevel = new Set([
  ".gitattributes", ".githooks", ".github", ".gitignore", ".opencode",
  "AGENTS.md", "README.md", "changes", "docs", "opencode.json", "scripts",
  "source-lock.json", "tests",
]);
for (const entry of readdirSync(root, { withFileTypes: true })) {
  if (entry.name === ".git") continue;
  if (!allowedTopLevel.has(entry.name)) fail(`Unexpected top-level source-tree entry: ${entry.name}`);
}
for (const forbidden of ["web-orchestration-only", "contracts", "src", "tools", "research", "evidence", "raw-evidence"])
  if (existsSync(join(root, forbidden))) fail(`Source implementation must not be materialized here: ${forbidden}`);

try {
  const lock = JSON.parse(read("source-lock.json"));
  if (lock.schema_version !== 1) fail("source-lock schema_version must be 1");
  if (!/^https:\/\/github\.com\/[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+\.git$/.test(lock.canonical_repository ?? ""))
    fail("source-lock canonical_repository must be an HTTPS GitHub Git URL");
  for (const branch of ["main", "developer", "web-orchestration"])
    if (!/^[0-9a-f]{40}$/.test(lock.sources?.[branch] ?? "")) fail(`source-lock ${branch} must be an exact SHA`);
} catch (error) {
  fail(`source-lock.json is invalid: ${error.message}`);
}

const expectedResponse = [
  "Status:", "Handoff template-development SHA:", "Source handoffs:",
  "Change package:", "Checks + perceived results:", "Task record:", "",
].join("\n");
if (existsSync(join(root, "docs/work/templates/maintainer-response-template.md"))
  && read("docs/work/templates/maintainer-response-template.md") !== expectedResponse)
  fail("Maintainer response template must contain exactly the six canonical fields");

const headings = [
  "Task ID", "Status", "Task-start template-development SHA",
  "Review-base template-development SHA", "Original task brief", "Current objective",
  "Current position", "Source ranges", "Observed", "Interpretation", "Attempts",
  "Changed approach", "Checks", "Blockers / required decisions", "Remaining work",
  "Next action", "Relevant durable records", "Last handoff commit",
];
if (existsSync(join(root, "docs/work/templates/task-progress-template.md"))) {
  const template = read("docs/work/templates/task-progress-template.md");
  for (const heading of headings) if (!template.includes(`## ${heading}\n`)) fail(`Task template missing ${heading}`);
}

for (const directory of ["docs/work/current", "docs/work/archive"]) {
  if (!existsSync(join(root, directory))) continue;
  for (const name of readdirSync(join(root, directory))) {
    if (name === "README.md" || name === ".gitkeep") continue;
    if (!name.endsWith(".md")) fail(`${directory}/${name} must be Markdown`);
  }
}

if (existsSync(join(root, "changes"))) {
  for (const taskId of readdirSync(join(root, "changes"))) {
    if (taskId === "README.md") continue;
    const directory = join(root, "changes", taskId);
    if (!statSync(directory).isDirectory()) { fail(`Unexpected changes entry: ${taskId}`); continue; }
    try {
      const manifest = JSON.parse(readFileSync(join(directory, "manifest.json"), "utf8"));
      if (manifest.schema_version !== 1 || manifest.task_id !== taskId) fail(`Invalid manifest identity for ${taskId}`);
      for (const target of ["developer", "web-orchestration"]) {
        const entry = manifest.ranges?.[target];
        const expected = target === "developer" ? "developer.patch" : "web-orchestration.patch";
        if (entry?.patch !== expected) fail(`${taskId} ${target} patch name is invalid`);
        const bytes = readFileSync(join(directory, expected));
        const digest = createHash("sha256").update(bytes).digest("hex");
        if (digest !== entry?.patch_sha256) fail(`${taskId} ${target} patch digest is invalid`);
        if (!/^[0-9a-f]{40}$/.test(entry?.base ?? "") || !/^[0-9a-f]{40}$/.test(entry?.head ?? ""))
          fail(`${taskId} ${target} range is invalid`);
        if (!Array.isArray(entry?.changed_paths) || [...entry.changed_paths].sort().join("\0") !== entry.changed_paths.join("\0"))
          fail(`${taskId} ${target} changed paths must be sorted`);
      }
    } catch (error) {
      fail(`Invalid change package ${taskId}: ${error.message}`);
    }
  }
}

for (const path of [
  ".githooks/pre-commit", ".githooks/post-commit", ".githooks/pre-push",
  "scripts/create-change-package.mjs", "scripts/apply-change-package.mjs",
  "scripts/bootstrap-template-development.sh", "scripts/recover-template-development-sync.sh",
  "scripts/validate-template-development.mjs", "scripts/validate-template-development.sh",
]) {
  const full = join(root, path);
  if (existsSync(full) && (statSync(full).mode & 0o111) === 0) fail(`Executable bit missing: ${path}`);
}

function files(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    if (entry.name === ".git") return [];
    const full = join(directory, entry.name);
    return entry.isDirectory() ? files(full) : [full];
  });
}
for (const file of files(root)) {
  const bytes = readFileSync(file);
  if (bytes.includes(0)) continue;
  const path = relative(root, file);
  const text = bytes.toString("utf8");
  if (path.startsWith("docs/work/current/") || path.startsWith("docs/work/archive/")) continue;
  if (/\/home\/[A-Za-z0-9._-]+\//.test(text)) fail(`${path} contains a host-local absolute path`);
}

if (failures.length) {
  console.error(`Template-development validation failed (${failures.length}):`);
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}
console.log("Template-development validation passed.");
