#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.join(root, "chatgpt-project");
const protocol = "agentic-bridge/1";
const failures = [];

const skills = [
  "skill-workflow.md",
  "skill-recovery.md",
  "skill-template-maintenance.md",
  "skill-promotion.md",
  "skill-prompt-creation.md",
];
const projectFiles = ["README.md", "developer-instructions.md", ...skills];
const rootEntries = [
  "README.md",
  "chatgpt-project",
  "task-context",
  "validate-package.mjs",
  "validate-package.test.mjs",
];
const texts = new Map();

function fail(message) {
  failures.push(message);
}

function readFile(target, label) {
  try {
    const stat = fs.lstatSync(target);
    if (!stat.isFile()) {
      fail(`Required path is not a regular file: ${label}`);
      return "";
    }
    const raw = fs.readFileSync(target);
    const text = raw.toString("utf8");
    if (raw.includes(0)) fail(`Required file contains NUL bytes: ${label}`);
    if (!Buffer.from(text, "utf8").equals(raw)) fail(`Required file is not valid UTF-8: ${label}`);
    if (!text.trim()) fail(`Required file is blank: ${label}`);
    texts.set(label, text);
    return text;
  } catch (error) {
    fail(`${error?.code === "ENOENT" ? "Missing" : "Cannot read"} ${label}${error?.code === "ENOENT" ? "" : `: ${error.message}`}`);
    return "";
  }
}

function exactInventory(directory, expected, label) {
  try {
    const entries = fs.readdirSync(directory, { withFileTypes: true }).map((entry) => entry.name).sort();
    const wanted = [...expected].sort();
    if (JSON.stringify(entries) !== JSON.stringify(wanted)) {
      fail(`${label} inventory differs: expected ${wanted.join(", ")}; found ${entries.join(", ")}`);
    }
  } catch (error) {
    fail(`Cannot inventory ${label}: ${error.message}`);
  }
}

function taskContextInventory() {
  const directory = path.join(root, "task-context");
  const required = new Set(["README.md", "TEMPLATE.md"]);
  try {
    const entries = fs.readdirSync(directory, { withFileTypes: true });
    for (const name of required) {
      const entry = entries.find((candidate) => candidate.name === name);
      if (!entry?.isFile()) fail(`task-context is missing required regular file: ${name}`);
    }
    for (const entry of entries) {
      const label = `task-context/${entry.name}`;
      if (required.has(entry.name)) {
        readFile(path.join(directory, entry.name), label);
        continue;
      }
      const match = /^([A-Za-z0-9][A-Za-z0-9._-]{0,127})\.md$/.exec(entry.name);
      if (!entry.isFile() || !match) {
        fail(`task-context contains an invalid task record entry: ${entry.name}`);
        continue;
      }
      const taskId = match[1];
      const text = readFile(path.join(directory, entry.name), label);
      if (!text.startsWith(`# Task context: ${taskId}\n`)) fail(`${label} has the wrong task heading`);
      if (!text.includes(`- Task ID: ${taskId}\n`)) fail(`${label} has the wrong task identity`);
      if (!text.includes("## Routing\n")) fail(`${label} lacks integrated routing continuity`);
      if (!/^- Selected developer: (?:none|Luna|Sol)$/m.test(text)) fail(`${label} lacks one concrete none/Luna/Sol route`);
      if (!text.includes("- Related control issues:")) fail(`${label} lacks related-issue continuity`);
      if (!text.includes("- Highest accepted bridge sequence:")) fail(`${label} lacks derived sequence continuity`);
      // Historical records may truthfully retain the retired mode field. New
      // architecture is enforced by TEMPLATE.md and permanent package sources.
    }
  } catch (error) {
    fail(`Cannot inventory ${labelFor(directory)}: ${error.message}`);
  }
}

function labelFor(value) {
  return path.relative(root, value) || ".";
}

function exactKeys(value, keys) {
  return value && typeof value === "object" && !Array.isArray(value) &&
    JSON.stringify(Object.keys(value).sort()) === JSON.stringify([...keys].sort());
}

function markers(text, name, label) {
  const open = [...text.matchAll(new RegExp(`<!--\\s*${name}\\b`, "g"))].length;
  const complete = [...text.matchAll(new RegExp(`<!-- ${name}\\s*\\n([^\\n]+)\\n-->`, "g"))];
  if (open !== complete.length) fail(`${label}: ${name} has ${open} opener(s) but ${complete.length} complete single-line marker(s)`);
  return complete.map((match) => {
    try {
      return JSON.parse(match[1]);
    } catch (error) {
      fail(`${label}: ${name} example is invalid JSON: ${error.message}`);
      return null;
    }
  }).filter(Boolean);
}

exactInventory(root, rootEntries, "web-orchestration-only root");
exactInventory(projectRoot, projectFiles, "Project package");
taskContextInventory();
for (const file of projectFiles) readFile(path.join(projectRoot, file), `chatgpt-project/${file}`);

const instructions = texts.get("chatgpt-project/developer-instructions.md") ?? "";
const workflow = texts.get("chatgpt-project/skill-workflow.md") ?? "";
const recovery = texts.get("chatgpt-project/skill-recovery.md") ?? "";
const templateMaintenance = texts.get("chatgpt-project/skill-template-maintenance.md") ?? "";
const promotion = texts.get("chatgpt-project/skill-promotion.md") ?? "";
const prompt = texts.get("chatgpt-project/skill-prompt-creation.md") ?? "";
const install = texts.get("chatgpt-project/README.md") ?? "";
const taskTemplate = texts.get("task-context/TEMPLATE.md") ?? "";
const taskReadme = texts.get("task-context/README.md") ?? "";

for (const term of [
  "shortest\nroute that proves it",
  "Remote GitHub is authoritative",
  "capabilities actually available",
  "Do not create global operating modes",
  "one mutating developer route",
  "Anything persisted to GitHub is public",
  "Never automatically replay an ambiguous",
  "terminal and absorbed",
]) {
  const pattern = new RegExp(term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&").replace("\\n", "\\s+"), "i");
  if (!pattern.test(instructions)) fail(`Permanent instructions are missing a canonical boundary: ${term}`);
}
if (!/Only the human accepts one exact reviewed `developer` SHA into\s+`main`/i.test(instructions)) {
  fail("Permanent instructions are missing the human exact-SHA acceptance boundary");
}
if (!/Repository file writes and GitHub Issue control\s+are distinct/i.test(instructions)) {
  fail("Permanent instructions are missing the file-write versus issue-control boundary");
}
if (!/Before emitting a final response[\s\S]{0,500}every route you launched must be\s+terminal and absorbed[\s\S]{0,500}active, unknown, indeterminate, or otherwise unresolved[\s\S]{0,500}continue reconciliation instead of ending[\s\S]{0,500}Elapsed time[\s\S]{0,300}never blockers or completion conditions/i.test(instructions)) {
  fail("Permanent instructions are missing the hard final-response reconciliation gate");
}
for (const stale of ["MCP-ON", "MCP-OFF", "MCP-ON/Sol", "MCP-OFF/Pro", "skill-mcp-"]) {
  if (instructions.includes(stale)) fail(`Permanent instructions retain stale mode architecture: ${stale}`);
}
for (const detail of ["agentic-bridge-command", "agentic-bridge-request", "command.status", "task.status", "promotion.apply"]) {
  if (instructions.includes(detail)) fail(`Permanent instructions contain routed procedure detail: ${detail}`);
}

const triggerRows = [...instructions.matchAll(/^\|[^|\n]+\|\s*`(skill-[^`]+\.md)`\s*\|\s*$/gm)].map((match) => match[1]);
for (const skill of skills) {
  const count = triggerRows.filter((entry) => entry === skill).length;
  if (count !== 1) fail(`Project Source must have exactly one trigger row: ${skill} (found ${count})`);
}
if (triggerRows.length !== skills.length) fail(`Procedure router must contain exactly ${skills.length} Source rows`);
for (const source of triggerRows) if (!skills.includes(source)) fail(`Router references unknown Project Source: ${source}`);

for (const skill of skills) {
  const text = texts.get(`chatgpt-project/${skill}`) ?? "";
  if (!text.startsWith("# ")) fail(`${skill} must begin with one title`);
  if (!text.includes("## Trigger")) fail(`${skill} must declare an explicit Trigger`);
}

for (const [text, pattern, label] of [
  [workflow, /Capabilities constrain the action that needs them[\s\S]{0,220}do not define a global\s+mode/i, "capability-local workflow rule"],
  [workflow, /lookup answerable[\s\S]{0,220}Do not create a Scout, control\s+issue, task record/i, "quick fast path"],
  [workflow, /hardened Scout runtime ready[\s\S]{0,1200}never fall back to\s+ordinary developer OpenCode/i, "hardened Scout readiness boundary"],
  [workflow, /Direct GitHub:[\s\S]{0,900}Delegated developer:/i, "direct-versus-delegated implementation routes"],
  [workflow, /Conditional finalization[\s\S]{0,1400}Git blob OID/i, "conditional finalization proof"],
  [recovery, /never by replaying an\s+uncertain mutation/i, "uncertain-mutation no-replay"],
  [recovery, /command\.status[\s\S]{0,1200}task\.status/i, "durable status recovery"],
  [recovery, /connector-delivery-pending[\s\S]{0,500}continue meaningful independent work/i, "connector scheduling recovery"],
  [templateMaintenance, /docs\/work\/current\/<task-id>-<slug>\.md[\s\S]{0,600}replaces ordinary/i, "canonical template-maintenance continuity"],
  [templateMaintenance, /source-lock\.json[\s\S]{0,1600}do not silently\s+reconcile/i, "source-lock provenance boundary"],
  [templateMaintenance, /Never hand-build a\s+change package/i, "tracked package-generation boundary"],
  [promotion, /human explicitly approves one exact fully reviewed final\s+`developer` SHA/i, "promotion trigger"],
  [promotion, /Any later `developer` commit invalidates approval/i, "approval invalidation"],
  [prompt, /context transfer across an execution boundary/i, "prompt context-transfer model"],
  [prompt, /Observed:[\s\S]{0,240}Interpretation:[\s\S]{0,240}Requested outcome:/i, "prompt evidence roles"],
  [prompt, /### Fresh web orchestrator[\s\S]*### Direct OpenCode/i, "prompt destination profiles"],
  [prompt, /### Investigation \/ research[\s\S]*### Review[\s\S]*### Implementation \/ change[\s\S]*### Reproduce \/ test[\s\S]*### Continue \/ recover[\s\S]*### Template-maintenance transfer/i, "prompt mission set"],
  [prompt, /material failure mode[\s\S]{0,600}smallest.*technique/i, "prompt craft proportional selection"],
  [prompt, /Applying no extra craft technique is a valid and common result/i, "prompt craft no-op"],
  [prompt, /### Context and evidence organization[\s\S]*### Adaptive decomposition and planning[\s\S]*### Exploration and anchoring control[\s\S]*### Examples and demonstrations[\s\S]*### Verification and uncertainty[\s\S]*### Tool and action framing[\s\S]*### Output and interface shaping[\s\S]*### Evaluation-driven optimization/i, "prompt craft technique set"],
  [prompt, /never request private chain-of-thought[\s\S]{0,100}hidden scratch work/i, "prompt hidden-reasoning prohibition"],
]) if (!pattern.test(text)) fail(`Project package is missing canonical ${label}`);

const responseContract = [
  "Status:",
  "Handoff developer SHA:",
  "Files changed:",
  "Checks + perceived results:",
  "Blockers/decisions:",
  "Task record:",
].join("\n");
if (workflow.split(responseContract).length - 1 !== 1) fail("Workflow must contain exactly one canonical six-field developer response block");

const commandExamples = markers(workflow, "agentic-bridge-command", "workflow");
if (commandExamples.length !== 1) fail(`Workflow must contain exactly one command example (found ${commandExamples.length})`);
for (const envelope of commandExamples) {
  if (!exactKeys(envelope, ["protocol", "sequence", "command_id", "task_id", "kind", "arguments", "expected"])) fail("Command example has incorrect top-level fields");
  if (envelope.protocol !== protocol || envelope.sequence !== 1 || envelope.kind !== "start") fail("Command example must be protocol start sequence 1");
  if (!exactKeys(envelope.arguments, ["brief", "agent"]) || !["luna", "sol"].includes(envelope.arguments?.agent)) fail("Command example has invalid start arguments");
  if (!exactKeys(envelope.expected, ["developer_sha", "ref"]) || envelope.expected?.ref !== "developer" || !/^[0-9a-f]{40}$/.test(envelope.expected?.developer_sha ?? "")) fail("Command example has invalid expected guard");
}

const workflowRequests = markers(workflow, "agentic-bridge-request", "workflow");
if (workflowRequests.length !== 1 || workflowRequests[0]?.kind !== "scout.start") fail("Workflow must contain exactly one scout.start request example");
const recoveryRequests = markers(recovery, "agentic-bridge-request", "recovery");
const recoveryKinds = recoveryRequests.map((request) => request.kind).sort();
if (JSON.stringify(recoveryKinds) !== JSON.stringify(["command.status", "task.status"])) fail("Recovery must contain exact command.status and task.status request examples");
for (const envelope of [...workflowRequests, ...recoveryRequests]) {
  if (envelope.protocol !== protocol || typeof envelope.request_id !== "string" || typeof envelope.task_id !== "string") fail("Request example lacks protocol/request/task identity");
}

if (!install.includes("these five rendered files") || !install.includes("exact five-Source")) fail("Installation/upgrade material must require the exact five-Source inventory");
for (const skill of skills) {
  const count = install.split(`\`${skill}\``).length - 1;
  if (count !== 1) fail(`Installation inventory must name ${skill} exactly once (found ${count})`);
}
for (const stale of ["skill-mcp-on-", "skill-mcp-off-", "skill-prompt-destinations.md", "skill-prompt-missions.md", "skill-prompt-craft.md"]) {
  for (const [label, text] of texts) {
    if (text.includes(stale)) fail(`${label} retains superseded Project Source reference: ${stale}`);
  }
}

if (!taskTemplate.includes("- Material capability limits:")) fail("task-context/TEMPLATE.md must record only material capability limits");
if (taskTemplate.includes("Last orchestration mode") || /MCP-ON\s*\|\s*MCP-OFF/.test(taskTemplate)) fail("task-context/TEMPLATE.md retains mode metadata");
if (!/Historical records remain truthful history/i.test(taskReadme)) fail("task-context README must preserve historical-record truth");
if (!/do not snapshot the Project's transient tool\s+surface or create mode metadata/i.test(taskReadme)) fail("task-context README lacks transient-capability boundary");

for (const [file, placeholders] of [
  ["README.md", ["<owner>/<repository>", "https://github.com/<owner>/<repository>", "<bridge-control-label>", "<bridge-bot-login>"]],
  ["developer-instructions.md", ["<owner>/<repository>"]],
  ["skill-workflow.md", ["<bridge-control-label>", "<bridge-bot-login>"]],
]) {
  const text = texts.get(`chatgpt-project/${file}`) ?? "";
  for (const placeholder of placeholders) if (!text.includes(placeholder)) fail(`${file} is missing required render placeholder ${placeholder}`);
}

const publicUnsafePatterns = [
  [/\/(?:Users|home)\/[A-Za-z0-9._-]+\//, "host-local absolute path"],
  [/\b(?:sk-[A-Za-z0-9_-]{20,}|gh[pousr]_[A-Za-z0-9]{20,})\b/, "credential-like value"],
];
for (const [label, text] of texts) {
  for (const [pattern, description] of publicUnsafePatterns) if (pattern.test(text)) fail(`${label} contains a ${description}`);
}

if (failures.length) {
  console.error(`Orchestration package validation failed (${failures.length}):`);
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(`Orchestration package validation passed: ${skills.length} exact conditionally routed Project Sources, capability-local workflow, unified prompt creation/craft, integrated task continuity, and canonical evidence/safety/promotion boundaries.`);
