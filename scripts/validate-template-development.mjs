#!/usr/bin/env node
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { validateChangePackage, validatePackageSupersessionChain, validateSourceLock } from "./change-package-lib.mjs";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const failures = [];
const fail = (message) => failures.push(message);
const read = (path) => readFileSync(join(root, path), "utf8");
const required = [
  "README.md", "AGENTS.md", "source-lock.json", "opencode.json",
  ".github/workflows/validate-template-development.yml",
  ".opencode/agents/template-maintainer.md", ".opencode/skills/template-maintenance/SKILL.md",
  ".opencode/agents/small-workspace-maintainer.md", ".opencode/agents/workspace-maintainer.md",
  ".opencode/skills/workspace-maintenance/SKILL.md",
  ".opencode/plugins/workspace-maintenance.ts", ".opencode/.gitignore", ".opencode/package.json",
  "scripts/workspace-maintenance-lib.mjs",
  "docs/architecture/AS-BUILT.md", "docs/architecture/decisions/0001-template-development-ledger.md",
  "docs/design/template-maintenance-workflow.md", "docs/deviations.md",
  "docs/work/templates/task-progress-template.md",
  "scripts/change-package-lib.mjs", "scripts/create-change-package.mjs", "scripts/apply-change-package.mjs",
  "scripts/bootstrap-template-development.sh", "scripts/recover-template-development-sync.sh",
  "scripts/validate-template-development.sh", "tests/change-package.test.mjs",
  "scripts/validate-workspace-opencode-runtime.mjs", "tests/workspace-maintenance.test.mjs",
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
  validateSourceLock(JSON.parse(read("source-lock.json")));
} catch (error) {
  fail(`source-lock.json is invalid: ${error.message}`);
}

if (existsSync(join(root, ".github/workflows/validate-template-development.yml"))) {
  const workflow = read(".github/workflows/validate-template-development.yml");
  for (const term of [
    "branches: [template-development]",
    "sudo apt-get update && sudo apt-get install --yes bubblewrap",
    "sudo sysctl --write kernel.apparmor_restrict_unprivileged_userns=0",
    "./scripts/validate-template-development.sh",
  ]) if (!workflow.includes(term)) fail(`Template-development CI is missing ${term}`);
}

try {
  const config = JSON.parse(read("opencode.json"));
  if (config.default_agent !== "template-maintainer") fail("template-maintainer must remain the default agent");
  if (config.permission?.task !== "deny") fail("Template OpenCode must deny task/subagent launches");
  if (config.permission?.external_directory === "allow") fail("Template OpenCode must not broadly allow external directories");
} catch (error) {
  fail(`opencode.json is invalid: ${error.message}`);
}

try {
  const packageFile = JSON.parse(read(".opencode/package.json"));
  if (packageFile.dependencies?.["@opencode-ai/plugin"] !== "1.18.16") {
    fail("Workspace plugin dependency must remain pinned to @opencode-ai/plugin 1.18.16");
  }
  if (packageFile.dependencies?.["opencode-ai"] !== "1.18.16") {
    fail("Workspace runtime dependency must remain pinned to OpenCode 1.18.16");
  }
} catch (error) {
  fail(`.opencode/package.json is invalid: ${error.message}`);
}

const templateAgent = read(".opencode/agents/template-maintainer.md");
for (const term of [
  "mode: primary", "model: cliproxyapi/gemini-3.7-flash-high", "reasoningEffort: high",
  "task: deny", "question: allow",
]) if (!templateAgent.includes(term)) fail(`template-maintainer config is missing: ${term}`);

const workspaceAgentRoutes = [
  {
    path: ".opencode/agents/small-workspace-maintainer.md",
    configTerms: ["mode: primary", "model: cliproxyapi/gemini-3.7-flash-high", "reasoningEffort: high"],
  },
  {
    path: ".opencode/agents/workspace-maintainer.md",
    configTerms: ["mode: primary", "model: openai/gpt-5.6-sol", "reasoningEffort: max"],
  },
];
for (const route of workspaceAgentRoutes) {
  if (!existsSync(join(root, route.path))) continue;
  const agent = read(route.path);
  for (const term of [
    ...route.configTerms,
    '"*": deny', "task: deny", "bash: deny", "edit: deny", "question: allow", "external_directory: deny",
    "skill:\n    \"*\": deny\n    workspace-maintenance: allow",
    "workspace_list: allow", "workspace_inspect: allow", "workspace_read: allow",
    "workspace_write: allow", "workspace_delete: allow", "workspace_glob: allow",
    "workspace_grep: allow", "workspace_exec: allow", "workspace_publish: allow",
  ]) if (!agent.includes(term)) fail(`${route.path} config is missing: ${term}`);
}

function validateSkill(relativePath, expectedName) {
  if (!existsSync(join(root, relativePath))) return;
  const text = read(relativePath);
  const frontmatter = text.match(/^---\n([\s\S]*?)\n---(?:\n|$)/)?.[1] ?? "";
  if (!frontmatter) return fail(`${relativePath} must contain YAML frontmatter`);
  const name = frontmatter.match(/^name:\s*(.+)$/m)?.[1]?.trim();
  const description = frontmatter.match(/^description:\s*(.+)$/m)?.[1]?.trim();
  if (name !== expectedName) fail(`${relativePath} name must be ${expectedName}`);
  if (!description) fail(`${relativePath} must have a non-empty description`);
}
validateSkill(".opencode/skills/template-maintenance/SKILL.md", "template-maintenance");
validateSkill(".opencode/skills/workspace-maintenance/SKILL.md", "workspace-maintenance");

if (existsSync(join(root, ".opencode/plugins/workspace-maintenance.ts"))) {
  const plugin = read(".opencode/plugins/workspace-maintenance.ts");
  for (const name of [
    "workspace_list", "workspace_inspect", "workspace_read", "workspace_write",
    "workspace_delete", "workspace_glob", "workspace_grep", "workspace_exec", "workspace_publish",
  ]) if (!plugin.includes(`${name}: tool(`)) fail(`Workspace plugin is missing ${name}`);
}

if (existsSync(join(root, "docs/work/templates/task-progress-template.md"))) {
  const template = read("docs/work/templates/task-progress-template.md");
  if (!template.includes("Public-safe task brief")) fail("Task-progress template must retain a public-safe brief field");
  if (template.includes("Original task brief")) fail("Task-progress template must not request an original/private chat transcript");
}

for (const directory of ["docs/work/current", "docs/work/archive"]) {
  if (!existsSync(join(root, directory))) continue;
  for (const name of readdirSync(join(root, directory))) {
    if (name === "README.md" || name === ".gitkeep") continue;
    if (!name.endsWith(".md")) { fail(`${directory}/${name} must be Markdown`); continue; }
    const task = read(`${directory}/${name}`);
    if (task.includes("## Original task brief\n")) fail(`${directory}/${name} requests an original/private chat transcript`);
  }
}

if (existsSync(join(root, "changes"))) {
  try {
    validatePackageSupersessionChain(join(root, "changes"));
  } catch (error) {
    fail(`Change package validation failed: ${error.message}`);
  }
}

for (const path of [
  ".githooks/pre-commit", ".githooks/post-commit", ".githooks/pre-push",
  "scripts/create-change-package.mjs", "scripts/apply-change-package.mjs",
  "scripts/bootstrap-template-development.sh", "scripts/recover-template-development-sync.sh",
  "scripts/validate-template-development.mjs", "scripts/validate-template-development.sh",
  "scripts/validate-workspace-opencode-runtime.mjs",
]) {
  const full = join(root, path);
  if (existsSync(full) && (statSync(full).mode & 0o111) === 0) fail(`Executable bit missing: ${path}`);
}

function files(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    if (entry.name === ".git") return [];
    const full = join(directory, entry.name);
    if (relative(root, full) === join(".opencode", "node_modules")) return [];
    return entry.isDirectory() ? files(full) : [full];
  });
}
for (const file of files(root)) {
  const bytes = readFileSync(file);
  if (bytes.includes(0)) continue;
  const path = relative(root, file);
  const text = bytes.toString("utf8");
  if (/\/home\/[A-Za-z0-9._-]+\//.test(text)) fail(`${path} contains a host-local absolute path`);
  if (path.endsWith(".md") && /\bses_[0-9A-Za-z]{16,}\b/.test(text)) {
    fail(`${path} contains a raw OpenCode session identifier`);
  }
}

if (failures.length) {
  console.error(`Template-development validation failed (${failures.length}):`);
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}
console.log("Template-development validation passed.");
