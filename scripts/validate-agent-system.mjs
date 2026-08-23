#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const failures = [];
const resolve = (relative) => path.join(root, relative);
const read = (relative) => fs.readFileSync(resolve(relative), "utf8");
const exists = (relative) => fs.existsSync(resolve(relative));

function fail(message) {
  failures.push(message);
}

function assert(condition, message) {
  if (!condition) fail(message);
}

function isExecutable(relative) {
  return exists(relative) && (fs.statSync(resolve(relative)).mode & 0o111) !== 0;
}

function scalar(value) {
  const trimmed = value.trim();
  if (trimmed === "") return {};
  if (trimmed === "true") return true;
  if (trimmed === "false") return false;
  if (trimmed === "null") return null;
  if (/^-?\d+(?:\.\d+)?$/.test(trimmed)) return Number(trimmed);
  if ((trimmed.startsWith('"') && trimmed.endsWith('"'))
    || (trimmed.startsWith("'") && trimmed.endsWith("'"))) {
    return trimmed.slice(1, -1);
  }
  return trimmed;
}

function parseFrontmatter(relative) {
  const text = read(relative);
  const match = text.match(/^---\n([\s\S]*?)\n---(?:\n|$)/);
  if (!match) {
    fail(`${relative} must contain YAML frontmatter`);
    return {};
  }

  const document = {};
  const stack = [{ indent: -1, value: document }];
  for (const line of match[1].split("\n")) {
    if (!line.trim() || line.trimStart().startsWith("#")) continue;
    const parsed = line.match(/^(\s*)([^:]+):(?:\s*(.*))?$/);
    if (!parsed) {
      fail(`${relative} has unsupported frontmatter line: ${line.trim()}`);
      continue;
    }
    const indent = parsed[1].length;
    const key = parsed[2].trim().replace(/^(?:"([\s\S]*)"|'([\s\S]*)')$/, "$1$2");
    while (stack.at(-1).indent >= indent) stack.pop();
    const parent = stack.at(-1).value;
    const value = scalar(parsed[3] ?? "");
    parent[key] = value;
    if (value && typeof value === "object") stack.push({ indent, value });
  }
  return document;
}

function assertExactMap(actual, expected, label) {
  assert(actual && typeof actual === "object" && !Array.isArray(actual), `${label} must be a map`);
  if (!actual || typeof actual !== "object" || Array.isArray(actual)) return;
  const actualKeys = Object.keys(actual).sort();
  const expectedKeys = Object.keys(expected).sort();
  if (JSON.stringify(actualKeys) !== JSON.stringify(expectedKeys)
    || expectedKeys.some((key) => actual[key] !== expected[key])) {
    fail(`${label} must equal ${JSON.stringify(expected)}`);
  }
}

try {
  const config = JSON.parse(read("opencode.json"));
  assert(config.default_agent === "lead-developer", "opencode default_agent must be lead-developer");
  assert(config.share === "disabled", "opencode sharing must be disabled");
  assert(config.permission?.task === "deny", "global task permission must be deny");
  assert(config.permission?.external_directory === "ask", "global external_directory permission must be ask");
  assert(config.compaction?.auto === false, "compaction.auto must be false");
  assert(config.compaction?.prune === false, "compaction.prune must be false");
} catch (error) {
  fail(`opencode.json is invalid: ${error.message}`);
}

const agentFiles = {
  lead: ".opencode/agents/lead-developer.md",
  spark: ".opencode/agents/spark-implementer.md",
  small: ".opencode/agents/small-developer.md",
  heavy: ".opencode/agents/heavy-developer.md",
};
for (const relative of Object.values(agentFiles)) {
  assert(exists(relative), `Missing required agent file: ${relative}`);
}

if (Object.values(agentFiles).every(exists)) {
  const lead = parseFrontmatter(agentFiles.lead);
  assert(lead.mode === "primary", "lead-developer mode must be primary");
  assert(lead.model === "openai/gpt-5.6-sol", "lead-developer model must match current AS-BUILT configuration");
  assert(lead.permission?.edit === "deny", "lead-developer edit permission must be deny");
  assertExactMap(lead.permission?.task, { "*": "deny", "spark-implementer": "allow" }, "lead-developer task permission");
  assertExactMap(lead.permission?.bash, {
    "*": "deny",
    "pwd": "allow",
    "ls *": "allow",
    "find *": "allow",
    "cat *": "allow",
    "sed -n *": "allow",
    "grep *": "allow",
    "rg *": "allow",
    "git status*": "allow",
    "git diff*": "allow",
    "git log*": "allow",
    "git show*": "allow",
    "git rev-parse*": "allow",
    "git ls-files*": "allow",
    "git grep*": "allow",
    "git ls-tree*": "allow",
    "node --test*": "allow",
    "npm test*": "allow",
    "npm run *": "allow",
    "bash scripts/validate-repository.sh": "allow",
  }, "lead-developer bash permission");

  const spark = parseFrontmatter(agentFiles.spark);
  assert(spark.mode === "subagent", "spark-implementer mode must be subagent");
  assert(spark.model === "openai/gpt-5.6-sol", "spark-implementer model must match current AS-BUILT configuration");
  assert(spark.permission?.edit === "allow", "spark-implementer edit permission must be allow");
  assert(spark.permission?.task === "deny", "spark-implementer task permission must be deny");
  assert(spark.permission?.external_directory === "deny", "spark-implementer external_directory permission must be deny");
  assert(spark.permission?.question === "deny", "spark-implementer question permission must be deny");

  for (const [name, relative, model] of [
    ["small-developer", agentFiles.small, "cliproxyapi/gemini-3.7-flash-high"],
    ["heavy-developer", agentFiles.heavy, "openai/gpt-5.6-sol"],
  ]) {
    const agent = parseFrontmatter(relative);
    assert(agent.mode === "primary", `${name} mode must be primary`);
    assert(agent.model === model, `${name} model must match current AS-BUILT configuration`);
    assert(agent.permission?.task === "deny", `${name} task permission must be deny`);
    assert(agent.permission?.question === "deny", `${name} question permission must be deny`);
  }
}

assert(!exists(".opencode/agents/large-developer.md"), "active large-developer agent must be absent");

for (const retiredSkill of [
  "gate-workflow",
  "git-sync-and-handoff",
  "implementation-records",
  "prompt-authoring",
  "research-workflow",
  "task-workflow",
]) {
  assert(!exists(`.opencode/skills/${retiredSkill}/SKILL.md`), `Retired skill must be absent: ${retiredSkill}`);
}

for (const relative of [
  ".githooks/pre-commit",
  ".githooks/pre-merge-commit",
  ".githooks/pre-push",
  "scripts/bootstrap-agent-workflow.sh",
  "scripts/initialize-template-branches.sh",
  "scripts/promote-developer-to-main.sh",
  "scripts/validate-agent-system.mjs",
  "scripts/validate-preimplementation.mjs",
  "scripts/validate-repository.sh",
]) {
  assert(exists(relative), `Required executable is missing: ${relative}`);
  assert(isExecutable(relative), `Executable bit is missing: ${relative}`);
}

for (const retired of [
  ".githooks/post-commit",
  "scripts/recover-remote-sync.sh",
  "scripts/validate-web-orchestrator-integration.mjs",
  "docs/work/templates/developer-response-template.md",
]) {
  assert(!exists(retired), `Retired path must be absent: ${retired}`);
}

for (const activeReference of [
  ".github/copilot-instructions.md",
  ".opencode/agents/lead-developer.md",
  ".opencode/agents/spark-implementer.md",
  ".opencode/agents/small-developer.md",
  ".opencode/agents/heavy-developer.md",
  "AGENTS.md",
  "README.md",
  "CONTRIBUTING.md",
  "docs/architecture/agent-system.md",
  "docs/architecture/branch-workflow.md",
  "docs/architecture/design-record.md",
  "docs/architecture/dual-developer.md",
  "docs/architecture/implementation-records.md",
  "docs/architecture/repository-layout.md",
  "docs/work/README.md",
  "docs/work/current/README.md",
  "docs/work/archive/README.md",
  "docs/work/templates/task-template.md",
  "docs/work/templates/task-progress-template.md",
  "research/README.md",
  "research/templates/README.md",
  "research/templates/package-card.md",
  "research/templates/study/README.md",
]) {
  const text = read(activeReference);
  assert(!/\b(?:gate-workflow|git-sync-and-handoff|implementation-records|prompt-authoring|research-workflow|task-workflow)\b/.test(text),
    `${activeReference} references a retired skill`);
}

if (failures.length) {
  console.error(`Agent-system validation failed (${failures.length}):`);
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("Agent-system validation passed.");
