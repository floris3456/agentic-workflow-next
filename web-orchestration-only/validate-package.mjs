#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.join(root, "chatgpt-project");
const protocol = "agentic-bridge/1";
const failures = [];

const skills = [
  "skill-shared-safety-and-authority.md",
  "skill-mcp-on-workflow.md",
  "skill-mcp-on-scouting.md",
  "skill-mcp-on-recovery.md",
  "skill-mcp-on-finalization.md",
  "skill-mcp-on-promotion.md",
  "skill-mcp-off-workflow.md",
  "skill-mcp-off-scouting.md",
];
const projectFiles = ["README.md", "developer-instructions.md", ...skills];
const branchFiles = [
  "README.md",
  "agent-routing/README.md",
  "agent-routing/TEMPLATE.md",
  "task-context/README.md",
  "task-context/TEMPLATE.md",
];
const rootEntries = [
  "README.md",
  "agent-routing",
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

function inventory(directory, expected, label) {
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

function routingInventory(directory) {
  const required = new Set(["README.md", "TEMPLATE.md"]);
  try {
    const entries = fs.readdirSync(directory, { withFileTypes: true });
    for (const name of required) {
      const entry = entries.find((candidate) => candidate.name === name);
      if (!entry?.isFile()) fail(`agent-routing is missing required regular file: ${name}`);
    }
    for (const entry of entries) {
      if (required.has(entry.name)) continue;
      const match = /^([A-Za-z0-9][A-Za-z0-9._-]{0,127})\.md$/.exec(entry.name);
      if (!entry.isFile() || !match) {
        fail(`agent-routing contains an invalid task record entry: ${entry.name}`);
        continue;
      }
      const taskId = match[1];
      const label = `agent-routing/${entry.name}`;
      const text = readFile(path.join(directory, entry.name), label);
      if (!text.startsWith(`# Agent routing: ${taskId}\n`)) fail(`${label} has the wrong task heading`);
      if (!text.includes(`- Task ID: ${taskId}\n`)) fail(`${label} has the wrong task identity`);
      if (!/^- Selected developer: (?:Luna|Sol)$/m.test(text)) fail(`${label} lacks one concrete Luna/Sol route`);
    }
  } catch (error) {
    fail(`Cannot inventory agent-routing: ${error.message}`);
  }
}

function requireTerms(file, terms) {
  const text = texts.get(`chatgpt-project/${file}`) ?? "";
  for (const term of terms) if (!text.includes(term)) fail(`chatgpt-project/${file} is missing required contract text: ${term}`);
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

inventory(root, rootEntries, "web-orchestration-only root");
inventory(projectRoot, projectFiles, "Project package");
routingInventory(path.join(root, "agent-routing"));

for (const file of branchFiles) readFile(path.join(root, file), file);
for (const file of projectFiles) readFile(path.join(projectRoot, file), `chatgpt-project/${file}`);

const instructions = texts.get("chatgpt-project/developer-instructions.md") ?? "";
if (instructions.split(/\r?\n/).length > 90) fail("Permanent Project instructions must remain a router of at most 90 lines");
for (const term of [
  "route that proves it",
  "MCP-ON/Sol",
  "MCP-OFF/Pro",
  "Remote GitHub is authoritative",
  "Proportional completion",
  "one repository-mutating developer task",
  "read-only Scouts",
  "exact reviewed SHA",
  "reconcile its durable",
]) if (!instructions.includes(term)) fail(`Permanent instructions are missing router boundary: ${term}`);
for (const detail of ["agentic-bridge-command", "agentic-bridge-request", "command.status", "task.status", "promotion.apply"]) {
  if (instructions.includes(detail)) fail(`Permanent instructions contain detailed procedure instead of routing it: ${detail}`);
}

const responseContract = [
  "Status:",
  "Handoff developer SHA:",
  "Files changed:",
  "Checks + perceived results:",
  "Blockers/decisions:",
  "Task record:",
].join("\n");
const workflowText = texts.get("chatgpt-project/skill-mcp-on-workflow.md") ?? "";
if (workflowText.split(responseContract).length - 1 !== 1) fail("MCP-ON workflow must contain exactly one canonical six-field developer response block");

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
  ["## MCP-OFF", "## Shared", skills.filter((file) => file.startsWith("skill-mcp-off-"))],
  ["## Shared", "At the start", skills.filter((file) => file.startsWith("skill-shared-"))],
]) {
  const start = instructions.indexOf(`${heading}\n`);
  const end = instructions.indexOf(`${next}`);
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
if (!install.includes("eight rendered files") || !install.includes("exact eight-Source")) fail("Installation/upgrade material must require the exact eight-Source inventory");
if (!install.includes("Remove every superseded")) fail("Upgrade material must remove superseded Sources");
for (const skill of skills) {
  const count = install.split(`\`${skill}\``).length - 1;
  if (count !== 1) fail(`Installation inventory must name ${skill} exactly once (found ${count})`);
}

for (const [label, text] of texts) {
  for (const match of text.matchAll(/skill-[A-Za-z0-9_.*\/-]+\.md/gi)) {
    const source = match[0];
    if (source !== "skill-*.md" && !skillSet.has(source)) fail(`${label} has a stale/unknown Project Source reference: ${source}`);
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

requireTerms("skill-shared-safety-and-authority.md", [
  "remote GitHub files",
  "public disclosure",
  "Routine in-scope inspection",
  "sensitive access",
  "Promotion always requires explicit approval",
  "developer, Scout, bridge, CI, or orchestrator approval",
]);
requireTerms("skill-mcp-on-workflow.md", [
  "For a lookup answerable from one exact file",
  "Do not create a Scout, issue, task record",
  "Status:",
  "Handoff developer SHA:",
  "completed`, `blocked`, `failed`, or",
  "failed push is",
  "sequence `1`",
  "Luna by default",
  "substantive Luna failures",
  "`accepted`",
  "public `applying`",
  "`session.idle`",
  "malformed output",
  "full exact range",
  "small/low risk",
  "large/cross-cutting",
  "high stakes",
  "`steer`",
  "`permission.reply`",
  "`question.reply`",
  "`abort`",
  "`route`",
]);
requireTerms("skill-mcp-on-scouting.md", [
  "Use connected GitHub directly",
  "Do not load for a quick exact GitHub lookup",
  "high-stakes work with manageable",
  "highest-risk boundaries",
  "`scout.start`",
  "no orchestration concurrency cap",
  "exact same UUID/envelope",
  "Luna/high read-only Scout",
  "task/request/ref match",
  "`scout.status`",
  "never relaunches the Scout",
  "perform all synthesis",
]);
requireTerms("skill-mcp-on-recovery.md", [
  "`command.status`",
  "`task.status`",
  "does not consume command sequence",
  "`applying`",
  "Never automatically retry",
  "stop/restart",
  "`indeterminate`",
  "`marker_hash`",
  "failed push",
  "`sync.recover`",
  "force-push normal",
]);
requireTerms("skill-mcp-on-finalization.md", [
  "`finalize`",
  "substantive-approval SHA",
  "`docs/work/current/<task>.md`",
  "`docs/work/archive/`",
  "must not exist",
  "identical Git blob OID",
  "immutable, non-authoritative benchmark history",
]);
requireTerms("skill-mcp-on-promotion.md", [
  "human explicitly approves",
  "`promotion.apply`",
  "same approved SHA",
  "no-content-change",
  "never automatically retried",
  "Directly verify exact",
]);
requireTerms("skill-mcp-off-workflow.md", [
  "public web",
  "exact base/head",
  "Scale review proportionally",
  "high-stakes work",
  "Do not claim it was sent or started",
  "Do not create/control a bridge issue",
  "write task/routing state",
]);
requireTerms("skill-mcp-off-scouting.md", [
  "public GitHub tree",
  "exact branch/ref",
  "Do not invoke, imply, or fabricate an OpenCode Scout",
]);

const offText = ["skill-mcp-off-workflow.md", "skill-mcp-off-scouting.md"]
  .map((file) => texts.get(`chatgpt-project/${file}`) ?? "").join("\n");
for (const forbidden of ["agentic-bridge-command", "agentic-bridge-request", "scout.start", "command.status", "task.status", "promotion.apply"]) {
  if (offText.includes(forbidden)) fail(`MCP-OFF procedures contain unavailable MCP-ON mechanic: ${forbidden}`);
}

const commandExamples = markers(texts.get("chatgpt-project/skill-mcp-on-workflow.md") ?? "", "agentic-bridge-command");
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

for (const [file, terms] of [
  ["task-context/TEMPLATE.md", [
    `Continuity schema: ${protocol}`,
    "Task-start developer SHA:",
    "Last reviewed developer SHA:",
    "Current handoff developer SHA:",
    "Finalization handoff developer SHA:",
    "Human-approved promotion SHA:",
    "Human approval date/reference:",
    "Verified post-promotion main SHA:",
    "Verified post-promotion developer SHA:",
    "Bridge control issue state:",
    "## Pending bridge command",
    "State: none | prepared | posted | pre-ledger-rejected | terminal-unresolved | cancelled",
    "Exact one-line JSON envelope:",
    "## Bridge command journal",
    "## Scout request journal",
  ]],
  ["agent-routing/TEMPLATE.md", ["Bridge route reference:", "## Route changes"]],
]) {
  const text = texts.get(file) ?? "";
  for (const term of terms) if (!text.includes(term)) fail(`${file} is missing continuity field: ${term}`);
}

const scenarioChecks = [
  ["quick lookup", "skill-mcp-on-workflow.md", ["For a lookup answerable", "Do not create a Scout, issue, task record"]],
  ["small task", "skill-mcp-on-workflow.md", ["small/low risk", "focused context, diff, and focused check"]],
  ["large task", "skill-mcp-on-scouting.md", ["Multiple useful Scout requests", "may run concurrently"]],
  ["high-stakes compact task", "skill-mcp-on-scouting.md", ["directly inspect every", "relevant GitHub file and diff"]],
  ["MCP-OFF analysis", "skill-mcp-off-workflow.md", ["public GitHub lookup", "Do not claim it was sent or started"]],
  ["lost command result", "skill-mcp-on-recovery.md", ["`command.status`", "`task.status`", "Never automatically retry"]],
  ["human decision", "skill-shared-safety-and-authority.md", ["Routine in-scope inspection", "Promotion always requires explicit approval"]],
];
for (const [scenario, file, terms] of scenarioChecks) {
  const text = texts.get(`chatgpt-project/${file}`) ?? "";
  for (const term of terms) if (!text.includes(term)) fail(`Acceptance scenario ${scenario} is not encoded in ${file}: ${term}`);
}

const retiredIdentifiers = [
  ["User", "Activity", "Monitor"].join(" "),
  ["u", "a", "m", "-modernization"].join(""),
  ["U", "A", "M", "-overdracht"].join(""),
  ["legacy", "_", "u", "a", "m"].join(""),
  ["ADR", "-FS-"].join(""),
];
const unsafePatterns = [
  [/\bopencode[\s._`*-]*mcp\b/i, "stale direct OpenCode transport"],
  [/\bjcode[\s._`*-]*munch\b/i, "retired symbol-scouter name"],
  [/\b(?:bridge|opencode)\s+(?:reports?|output)\s+(?:is|are|becomes?)\s+authoritative\b/i, "bridge output as authority"],
  [/\bdeveloper\s+push\s+(?:is|means|constitutes)\s+(?:human\s+)?acceptance\b/i, "developer push as acceptance"],
  [/\b(?:always|automatically|may|must|should)\s+retry\b[^.\n]{0,80}\bindeterminate\b/i, "retry of indeterminate mutation"],
  [/\b(?:may|can|should|must|always)\s+(?:send|store|persist|publish)\s+(?:secrets|credentials)\b/i, "secret persistence"],
  [/\b(?:may|can|should|must|always)\s+promote\b[^.\n]{0,80}\bwithout\s+(?:explicit\s+)?human\s+approval\b/i, "promotion without approval"],
];
for (const [file, text] of texts) {
  for (const identifier of retiredIdentifiers) if (text.toLowerCase().includes(identifier.toLowerCase())) fail(`${file} contains a source-project identifier`);
  for (const [pattern, label] of unsafePatterns) if (pattern.test(text)) fail(`${file} contains unsafe/stale policy text: ${label}`);
}

if (failures.length) {
  failures.sort((left, right) => left.localeCompare(right));
  console.error(`Orchestration package validation failed (${failures.length}):`);
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(`Orchestration package validation passed: ${skills.length} exact Project Sources, distinct MCP-ON/MCP-OFF workflows and scouting, ${scenarioChecks.length} acceptance scenarios, ${branchFiles.length} static continuity definitions plus validated task-routing records, bridge protocol ${protocol}.`);
