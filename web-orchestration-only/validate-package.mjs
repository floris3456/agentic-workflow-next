#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.join(root, "chatgpt-project");
const protocol = "agentic-bridge/1";
const failures = [];

const skills = [
  "skill-mcp-on-workflow.md",
  "skill-mcp-on-scouting.md",
  "skill-mcp-on-recovery.md",
  "skill-mcp-on-finalization.md",
  "skill-mcp-on-promotion.md",
  "skill-mcp-off-workflow.md",
  "skill-mcp-off-scouting.md",
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
    }
  } catch (error) {
    fail(`Cannot inventory task-context: ${error.message}`);
  }
}

function exactKeys(value, keys) {
  return value && typeof value === "object" && !Array.isArray(value) &&
    JSON.stringify(Object.keys(value).sort()) === JSON.stringify([...keys].sort());
}

function markers(text, name) {
  const open = [...text.matchAll(new RegExp(`<!--\\s*${name}\\b`, "g"))].length;
  const complete = [...text.matchAll(new RegExp(`<!-- ${name}\\s*\\n([^\\n]+)\\n-->`, "g"))];
  if (open !== complete.length) fail(`${name} has ${open} opener(s) but ${complete.length} complete single-line marker(s)`);
  return complete.map((match) => {
    try {
      return JSON.parse(match[1]);
    } catch (error) {
      fail(`${name} example is invalid JSON: ${error.message}`);
      return null;
    }
  }).filter(Boolean);
}

exactInventory(root, rootEntries, "web-orchestration-only root");
exactInventory(projectRoot, projectFiles, "Project package");
taskContextInventory();
for (const file of projectFiles) readFile(path.join(projectRoot, file), `chatgpt-project/${file}`);

const instructions = texts.get("chatgpt-project/developer-instructions.md") ?? "";
for (const term of [
  "route that proves it",
  "MCP-ON/Sol",
  "MCP-OFF/Pro",
  "Remote GitHub is authoritative",
  "Proportional completion",
  "one repository-mutating developer task",
  "read-only Scouts",
  "Distinguish `UNKNOWN` from inference",
  "invalidates it",
  "One task ID has one canonical issue",
]) if (!instructions.includes(term)) fail(`Permanent instructions are missing a canonical boundary: ${term}`);
if (!/Promotion requires explicit\s+human approval of one exact reviewed `developer` SHA/.test(instructions)) {
  fail("Permanent instructions are missing the human exact-SHA approval boundary");
}
for (const detail of ["agentic-bridge-command", "agentic-bridge-request", "command.status", "task.status", "promotion.apply"]) {
  if (instructions.includes(detail)) fail(`Permanent instructions contain detailed procedure instead of routing it: ${detail}`);
}

const skillSet = new Set(skills);
const triggerRows = [...instructions.matchAll(/^\|[^|\n]+\|\s*`(skill-[^`]+\.md)`\s*\|\s*$/gm)].map((match) => match[1]);
for (const skill of skills) {
  const count = triggerRows.filter((entry) => entry === skill).length;
  if (count !== 1) fail(`Project Source must have exactly one trigger row: ${skill} (found ${count})`);
}
for (const source of triggerRows) if (!skillSet.has(source)) fail(`Trigger table references unknown Project Source: ${source}`);
if (triggerRows.length !== skills.length) fail(`Trigger tables must contain exactly ${skills.length} Source rows`);

for (const [heading, next, expected] of [
  ["## MCP-ON", "## MCP-OFF", skills.filter((file) => file.startsWith("skill-mcp-on-"))],
  ["## MCP-OFF", "At the start", skills.filter((file) => file.startsWith("skill-mcp-off-"))],
]) {
  const start = instructions.indexOf(`${heading}\n`);
  const end = instructions.indexOf(next, start + heading.length);
  if (start < 0 || end <= start) {
    fail(`Cannot resolve trigger group ${heading}`);
    continue;
  }
  const actual = [...instructions.slice(start, end).matchAll(/^\|[^|\n]+\|\s*`(skill-[^`]+\.md)`\s*\|\s*$/gm)]
    .map((match) => match[1]).sort();
  if (JSON.stringify(actual) !== JSON.stringify([...expected].sort())) fail(`${heading} has the wrong mode-specific Source set`);
}

for (const skill of skills) {
  const text = texts.get(`chatgpt-project/${skill}`) ?? "";
  if (!text.startsWith("# ")) fail(`${skill} must begin with one title`);
  if (!text.includes("## Trigger")) fail(`${skill} must declare an explicit Trigger`);
  const references = instructions.split(`\`${skill}\``).length - 1;
  if (references !== 1) fail(`Permanent router must reference ${skill} exactly once (found ${references})`);
}

const install = texts.get("chatgpt-project/README.md") ?? "";
if (!install.includes("seven rendered files") || !install.includes("exact seven-Source")) fail("Installation/upgrade material must require the exact seven-Source inventory");
if (!install.includes("Remove every superseded")) fail("Upgrade material must remove superseded Sources");
for (const skill of skills) {
  const count = install.split(`\`${skill}\``).length - 1;
  if (count !== 1) fail(`Installation inventory must name ${skill} exactly once (found ${count})`);
}

const retiredSource = "skill-shared-safety-and-authority.md";
for (const [label, text] of texts) {
  for (const match of text.matchAll(/skill-[A-Za-z0-9_.*\/-]+\.md/gi)) {
    const source = match[0];
    const documentedRetirement = source === retiredSource && label === "chatgpt-project/README.md";
    if (source !== "skill-*.md" && !skillSet.has(source) && !documentedRetirement) {
      fail(`${label} has a stale/unknown Project Source reference: ${source}`);
    }
    const before = text[match.index - 1];
    const after = text[match.index + source.length];
    if (before !== "`" || after !== "`") fail(`${label} has an unquoted Project Source reference: ${source}`);
  }
}

for (const [file, placeholders] of [
  ["README.md", ["<owner>/<repository>", "https://github.com/<owner>/<repository>", "<bridge-control-label>", "<bridge-bot-login>"]],
  ["developer-instructions.md", ["<owner>/<repository>"]],
  ["skill-mcp-on-workflow.md", ["<bridge-control-label>", "<bridge-bot-login>"]],
  ["skill-mcp-on-scouting.md", ["<bridge-control-label>", "<bridge-bot-login>"]],
  ["skill-mcp-off-workflow.md", ["https://github.com/<owner>/<repository>"]],
]) {
  const text = texts.get(`chatgpt-project/${file}`) ?? "";
  for (const placeholder of placeholders) if (!text.includes(placeholder)) fail(`${file} is missing installation placeholder ${placeholder}`);
}

const responseContract = [
  "Status:",
  "Handoff developer SHA:",
  "Files changed:",
  "Checks + perceived results:",
  "Blockers/decisions:",
  "Task record:",
].join("\n");
const workflow = texts.get("chatgpt-project/skill-mcp-on-workflow.md") ?? "";
if (workflow.split(responseContract).length - 1 !== 1) fail("MCP-ON workflow must contain exactly one canonical six-field developer response block");
for (const rule of [
  [workflow, /lookup answerable[\s\S]{0,180}Do not create a Scout, issue, task record/i, "quick direct-GitHub path"],
  [workflow, /resolve the newest unmatched task-correlated[\s\S]{0,220}before posting[\s\S]{0,80}status/i, "interaction-before-status rule"],
  [texts.get("chatgpt-project/skill-mcp-on-scouting.md") ?? "", /high-stakes[\s\S]{0,220}directly inspect/i, "high-stakes direct-inspection rule"],
  [texts.get("chatgpt-project/skill-mcp-on-recovery.md") ?? "", /Never automatically retry/i, "uncertain-mutation no-replay rule"],
  [texts.get("chatgpt-project/skill-mcp-on-recovery.md") ?? "", /connector refusal is not a bridge disposition/i, "connector-refusal distinction"],
  [texts.get("chatgpt-project/skill-mcp-on-promotion.md") ?? "", /human explicitly approves[\s\S]{0,160}exact/i, "human exact-SHA promotion rule"],
]) if (!rule[1].test(rule[0])) fail(`Project package is missing canonical ${rule[2]}`);

const offText = ["skill-mcp-off-workflow.md", "skill-mcp-off-scouting.md"]
  .map((file) => texts.get(`chatgpt-project/${file}`) ?? "").join("\n");
for (const forbidden of ["agentic-bridge-command", "agentic-bridge-request", "scout.start", "command.status", "task.status", "promotion.apply"]) {
  if (offText.includes(forbidden)) fail(`MCP-OFF procedures contain unavailable MCP-ON mechanic: ${forbidden}`);
}

const commandExamples = markers(workflow, "agentic-bridge-command");
if (commandExamples.length !== 1) fail(`MCP-ON workflow must contain exactly one command example (found ${commandExamples.length})`);
for (const envelope of commandExamples) {
  if (!exactKeys(envelope, ["protocol", "sequence", "command_id", "task_id", "kind", "arguments", "expected"])) fail("Command example has incorrect top-level fields");
  if (envelope.protocol !== protocol || envelope.sequence !== 1 || envelope.kind !== "start") fail("Command example must be protocol start sequence 1");
  if (typeof envelope.command_id !== "string" || !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/.test(envelope.command_id)) fail("Command example has invalid UUID");
  if (!exactKeys(envelope.arguments, ["brief", "agent"]) || !["luna", "sol"].includes(envelope.arguments?.agent)) fail("Command example has invalid start arguments");
  if (!exactKeys(envelope.expected, ["developer_sha", "ref"]) || !/^[0-9a-f]{40}$/.test(envelope.expected?.developer_sha ?? "") || envelope.expected?.ref !== "developer") fail("Command example has invalid exact-SHA guard");
}

const requestExamples = ["skill-mcp-on-scouting.md", "skill-mcp-on-recovery.md"]
  .flatMap((file) => markers(texts.get(`chatgpt-project/${file}`) ?? "", "agentic-bridge-request"));
const expectedRequestKinds = ["command.status", "scout.start", "scout.status", "task.status"];
if (JSON.stringify(requestExamples.map((entry) => entry.kind).sort()) !== JSON.stringify(expectedRequestKinds)) {
  fail(`Request examples must cover exactly ${expectedRequestKinds.join(", ")}`);
}
const requestIds = new Set();
for (const envelope of requestExamples) {
  if (!exactKeys(envelope, ["protocol", "request_id", "task_id", "kind", "arguments"])) fail(`${envelope.kind} request example has incorrect fields`);
  if (envelope.protocol !== protocol || "sequence" in envelope) fail(`${envelope.kind} must be sequence-free protocol ${protocol}`);
  if (typeof envelope.request_id !== "string" || !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/.test(envelope.request_id)) fail(`${envelope.kind} has invalid request UUID`);
  if (requestIds.has(envelope.request_id)) fail(`Duplicate request UUID example: ${envelope.request_id}`);
  requestIds.add(envelope.request_id);
  if (envelope.kind === "scout.start") {
    if (!exactKeys(envelope.arguments, ["question", "ref", "scope", "expected_evidence"]) || !/^[0-9a-f]{40}$/.test(envelope.arguments?.ref ?? "")) fail("scout.start example lacks focused exact-ref arguments");
  } else if (envelope.kind === "scout.status") {
    if (!exactKeys(envelope.arguments, ["scout_request_id"])) fail("scout.status example has incorrect arguments");
  } else if (envelope.kind === "command.status") {
    if (!exactKeys(envelope.arguments, ["command_id"])) fail("command.status example has incorrect arguments");
  } else if (envelope.kind === "task.status" && !exactKeys(envelope.arguments, [])) {
    fail("task.status example arguments must be empty");
  }
}

const template = texts.get("task-context/TEMPLATE.md") ?? "";
for (const term of [
  `Continuity schema: ${protocol}`,
  "Task-start developer SHA:",
  "Current handoff developer SHA:",
  "Human-approved promotion SHA:",
  "Related control issues:",
  "Highest accepted bridge sequence:",
  "## Routing",
  "Selected developer: none | Luna | Sol",
  "Attempt classifications:",
  "Route changes:",
  "## Pending bridge command",
  "Exact one-line JSON envelope:",
  "## Bridge command journal",
  "## Scout request journal",
]) if (!template.includes(term)) fail(`task-context/TEMPLATE.md is missing continuity field: ${term}`);

const recovery = texts.get("chatgpt-project/skill-mcp-on-recovery.md") ?? "";
if (!/One task ID has one canonical issue[\s\S]{0,500}post nothing on any later issue/i.test(recovery)) {
  fail("MCP-ON recovery is missing canonical duplicate-task issue containment");
}

const unsafePatterns = [
  [/\bopencode[\s._`*-]*mcp\b/i, "stale direct OpenCode transport"],
  [/\b(?:bridge|opencode)\s+(?:reports?|output)\s+(?:is|are|becomes?)\s+authoritative\b/i, "bridge output as authority"],
  [/\bdeveloper\s+push\s+(?:is|means|constitutes)\s+(?:human\s+)?acceptance\b/i, "developer push as acceptance"],
  [/\b(?:always|automatically|may|must|should)\s+retry\b[^.\n]{0,80}\bindeterminate\b/i, "retry of indeterminate mutation"],
  [/\bconnector refusal is a bridge rejection\b/i, "connector refusal as bridge evidence"],
  [/\b(?:may|can|should|must|always)\s+(?:send|store|persist|publish)\s+(?:secrets|credentials)\b/i, "secret persistence"],
  [/\b(?:may|can|should|must|always)\s+promote\b[^.\n]{0,80}\bwithout\s+(?:explicit\s+)?human\s+approval\b/i, "promotion without approval"],
  [/\bany open (?:bridge )?(?:control )?issue\b[^.\n]{0,80}\b(?:(?:must|should)(?:\s+always)?|always)\s+(?:block|stop)\b/i, "unconditional open-issue blocking"],
  [/\bhigh-stakes\b[^.\n]{0,120}\bsample only\b/i, "high-stakes evidence sampling"],
];
for (const [file, text] of texts) {
  for (const [pattern, label] of unsafePatterns) if (pattern.test(text)) fail(`${file} contains unsafe/stale policy text: ${label}`);
}

if (failures.length) {
  failures.sort((left, right) => left.localeCompare(right));
  console.error(`Orchestration package validation failed (${failures.length}):`);
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(`Orchestration package validation passed: ${skills.length} exact Project Sources, distinct MCP-ON/MCP-OFF procedures, ${commandExamples.length + requestExamples.length} parsed bridge envelopes, integrated task-context routing, and canonical safety boundaries.`);
