#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.join(root, "chatgpt-project");
const bridgeProtocolRevision = "agentic-bridge/1";
const failures = [];

const requiredProjectFiles = [
  "README.md",
  "developer-instructions.md",
  "skill-shared-evidence-and-authority.md",
  "skill-shared-human-decision-boundaries.md",
  "skill-shared-public-safe-persistence.md",
  "skill-shared-review-reasoning.md",
  "skill-shared-task-design.md",
  "skill-mcp-on-agent-routing-and-escalation.md",
  "skill-mcp-on-delegation-recovery.md",
  "skill-mcp-on-finalization-review.md",
  "skill-mcp-on-main-promotion.md",
  "skill-mcp-on-orchestration-state.md",
  "skill-mcp-on-remote-review.md",
  "skill-mcp-on-repository-scouting.md",
  "skill-mcp-on-synchronization-recovery.md",
  "skill-mcp-on-task-delegation.md",
  "skill-mcp-on-task-review-and-steering.md",
  "skill-mcp-off-public-github-navigation.md",
  "skill-mcp-off-remote-review.md",
  "skill-mcp-off-repository-scouting.md",
  "skill-mcp-off-task-design-without-delegation.md",
];

const requiredBranchFiles = [
  "README.md",
  "agent-routing/README.md",
  "agent-routing/TEMPLATE.md",
  "task-context/README.md",
  "task-context/TEMPLATE.md",
];

const requiredRootEntries = ["README.md", "agent-routing", "chatgpt-project", "task-context", "validate-package.mjs"];
const requiredDirectories = ["agent-routing", "chatgpt-project", "task-context"];

const texts = new Map();

function readRequiredFile(target, label) {
  let stat;
  try {
    stat = fs.lstatSync(target);
  } catch (error) {
    if (error?.code === "ENOENT") failures.push(`Missing ${label}`);
    else failures.push(`Cannot inspect ${label}: ${error.message}`);
    return null;
  }

  if (!stat.isFile()) {
    failures.push(`Required path is not a regular file: ${label}`);
    return null;
  }

  try {
    const raw = fs.readFileSync(target);
    const text = raw.toString("utf8");
    if (raw.includes(0)) failures.push(`Required file contains NUL bytes: ${label}`);
    if (!Buffer.from(text, "utf8").equals(raw)) failures.push(`Required file is not valid UTF-8: ${label}`);
    if (!text.trim()) failures.push(`Required file is blank: ${label}`);
    texts.set(label, text);
    return text;
  } catch (error) {
    failures.push(`Cannot read ${label}: ${error.message}`);
    return null;
  }
}

try {
  const entries = fs.readdirSync(root, { withFileTypes: true }).map((entry) => entry.name).sort();
  for (const expected of requiredRootEntries) {
    if (!entries.includes(expected)) failures.push(`Missing exact root entry: ${expected}`);
  }
  for (const entry of entries) {
    if (!requiredRootEntries.includes(entry)) failures.push(`Unexpected root entry: ${entry}`);
  }
} catch (error) {
  failures.push(`Cannot inventory package root: ${error.message}`);
}

for (const directory of requiredDirectories) {
  const target = path.join(root, directory);
  try {
    if (!fs.lstatSync(target).isDirectory()) failures.push(`Required path is not a directory: ${directory}`);
  } catch (error) {
    if (error?.code !== "ENOENT") failures.push(`Cannot inspect directory ${directory}: ${error.message}`);
  }
}

for (const [directory, expectedEntries] of [
  ["agent-routing", ["README.md", "TEMPLATE.md"]],
  ["task-context", ["README.md", "TEMPLATE.md"]],
]) {
  try {
    const entries = fs.readdirSync(path.join(root, directory)).sort();
    for (const expected of expectedEntries) {
      if (!entries.includes(expected)) failures.push(`Missing exact ${directory} entry: ${expected}`);
    }
  } catch (error) {
    if (error?.code !== "ENOENT") failures.push(`Cannot inventory ${directory}: ${error.message}`);
  }
}

for (const file of requiredBranchFiles) {
  readRequiredFile(path.join(root, file), file);
}

for (const file of requiredProjectFiles) {
  readRequiredFile(path.join(projectRoot, file), `chatgpt-project/${file}`);
}

try {
  const stat = fs.lstatSync(projectRoot);
  if (!stat.isDirectory()) {
    failures.push("chatgpt-project is not a directory");
  } else {
    const expectedEntries = new Set(requiredProjectFiles);
    const entries = fs.readdirSync(projectRoot, { withFileTypes: true }).sort((left, right) => left.name.localeCompare(right.name));
    for (const entry of entries) {
      if (!expectedEntries.has(entry.name)) failures.push(`Unexpected chatgpt-project/${entry.name}`);
    }
  }
} catch (error) {
  if (error?.code !== "ENOENT") failures.push(`Cannot inventory chatgpt-project: ${error.message}`);
}

const skills = requiredProjectFiles.filter((file) => file.startsWith("skill-"));
const skillSet = new Set(skills);
const instructions = texts.get("chatgpt-project/developer-instructions.md");
if (instructions) {
  const triggerCounts = new Map(skills.map((skill) => [skill, 0]));
  for (const match of instructions.matchAll(/^\|[^|\n]+\|\s*`(skill-[^`]+\.md)`\s*\|\s*$/gm)) {
    if (!skillSet.has(match[1])) failures.push(`Trigger table references unknown Project Source: ${match[1]}`);
    else triggerCounts.set(match[1], triggerCounts.get(match[1]) + 1);
  }
  for (const [skill, count] of triggerCounts) {
    if (count !== 1) failures.push(`Project Source must have exactly one trigger-table row: ${skill} (found ${count})`);
  }

  const triggerGroups = [
    ["# MCP-ON", "# MCP-OFF", skills.filter((skill) => skill.startsWith("skill-mcp-on-"))],
    ["# MCP-OFF", "# Shared skill triggers", skills.filter((skill) => skill.startsWith("skill-mcp-off-"))],
    ["# Shared skill triggers", "# Continuously active boundaries", skills.filter((skill) => skill.startsWith("skill-shared-"))],
  ];
  for (const [heading, nextHeading, expectedSkills] of triggerGroups) {
    const start = instructions.indexOf(`${heading}\n`);
    const end = instructions.indexOf(`${nextHeading}\n`);
    if (start < 0 || end <= start) {
      failures.push(`Cannot resolve trigger-table section: ${heading}`);
      continue;
    }
    const section = instructions.slice(start, end);
    const actualSkills = [...section.matchAll(/^\|[^|\n]+\|\s*`(skill-[^`]+\.md)`\s*\|\s*$/gm)].map((match) => match[1]).sort();
    const expected = [...expectedSkills].sort();
    if (JSON.stringify(actualSkills) !== JSON.stringify(expected)) failures.push(`${heading} trigger table has the wrong Project Source set`);
  }

  for (const skill of skills) {
    const reference = `\`${skill}\``;
    const count = instructions.split(reference).length - 1;
    if (count !== 1) failures.push(`Project Source must be referenced exactly once: ${skill} (found ${count})`);
  }
}

for (const file of requiredProjectFiles) {
  const label = `chatgpt-project/${file}`;
  const text = texts.get(label);
  if (!text) continue;
  for (const match of text.matchAll(/skill-[A-Za-z0-9_.*\/-]+\.md/gi)) {
    const candidate = match[0];
    if (candidate === "skill-*.md") continue;
    if (!skillSet.has(candidate)) failures.push(`${label} has unresolved Project Source: ${candidate}`);
    const before = text[match.index - 1];
    const after = text[match.index + candidate.length];
    if (before !== "`" || after !== "`") failures.push(`${label} has an unquoted Project Source reference: ${candidate}`);
  }
}

const placeholderCoverage = new Map([
  ["README.md", new Map([["<owner>/<repository>", 2], ["https://github.com/<owner>/<repository>", 1], ["<bridge-control-label>", 1], ["<bridge-bot-login>", 1]])],
  ["developer-instructions.md", new Map([["<owner>/<repository>", 2], ["https://github.com/<owner>/<repository>", 1], ["<bridge-control-label>", 1], ["<bridge-bot-login>", 1]])],
  ["skill-mcp-off-public-github-navigation.md", new Map([["https://github.com/<owner>/<repository>", 1]])],
  ["skill-mcp-on-task-delegation.md", new Map([["<bridge-control-label>", 1], ["<bridge-bot-login>", 1]])],
  ["skill-mcp-on-delegation-recovery.md", new Map([["<bridge-control-label>", 1], ["<bridge-bot-login>", 1]])],
  ["skill-mcp-on-task-review-and-steering.md", new Map([["<bridge-bot-login>", 1]])],
]);

for (const [file, placeholders] of placeholderCoverage) {
  const text = texts.get(`chatgpt-project/${file}`);
  if (!text) continue;
  for (const [placeholder, expectedCount] of placeholders) {
    const count = text.split(placeholder).length - 1;
    if (count !== expectedCount) failures.push(`chatgpt-project/${file} must contain placeholder ${placeholder} exactly ${expectedCount} time(s) (found ${count})`);
  }
}

const procedureTerms = new Map([
  ["skill-mcp-on-task-delegation.md", ["`start`", "expected", "<bridge-control-label>"]],
  ["skill-mcp-on-delegation-recovery.md", ["`status`", "`applying`", "`indeterminate`", "marker_hash"]],
  ["skill-mcp-on-task-review-and-steering.md", ["`steer`", "`permission.reply`", "`question.reply`", "`abort`"]],
  ["skill-mcp-on-agent-routing-and-escalation.md", ["`route`"]],
  ["skill-mcp-on-synchronization-recovery.md", ["`sync.recover`"]],
  ["skill-mcp-on-finalization-review.md", [
    "`finalize`",
    "substantive-approval SHA",
    "`docs/work/current/`",
    "`docs/work/archive/`",
    "same basename",
    "must not exist",
    "current path is absent",
    "identical Git blob OID",
    "immutable, non-authoritative benchmark history",
  ]],
  ["skill-mcp-on-main-promotion.md", ["`promotion.apply`"]],
]);

for (const [file, terms] of procedureTerms) {
  const text = texts.get(`chatgpt-project/${file}`);
  if (!text) continue;
  for (const term of terms) {
    if (!text.includes(term)) failures.push(`chatgpt-project/${file} is missing bridge procedure term: ${term}`);
  }
}

const templateTerms = new Map([
  ["task-context/TEMPLATE.md", [
    `Continuity schema: ${bridgeProtocolRevision}`,
    "Finalization handoff developer SHA:",
    "Human-approved promotion SHA:",
    "Human approval date/reference:",
    "Verified post-promotion main SHA:",
    "Verified post-promotion developer SHA:",
    "Bridge control issue state:",
    "## Pending bridge command",
    "State: none | prepared | posted | pre-ledger-rejected | terminal-unresolved | cancelled",
    "Prepared at:",
    "Command-comment ref:",
    "Result-comment ref:",
    "Exact one-line JSON envelope:",
    "## Bridge command journal",
  ]],
  ["agent-routing/TEMPLATE.md", ["Bridge route reference:", "## Route changes"]],
]);

for (const [file, terms] of templateTerms) {
  const text = texts.get(file);
  if (!text) continue;
  for (const term of terms) {
    if (!text.includes(term)) failures.push(`${file} is missing continuity field: ${term}`);
  }
}

function hasExactKeys(value, keys) {
  return value && typeof value === "object" && !Array.isArray(value) &&
    JSON.stringify(Object.keys(value).sort()) === JSON.stringify([...keys].sort());
}

if (instructions) {
  const markerOpenCount = [...instructions.matchAll(/<!--\s*agentic-bridge-command\b/g)].length;
  const markerMatches = [...instructions.matchAll(/<!-- agentic-bridge-command\s*\n([^\n]+)\n-->/g)];
  if (markerOpenCount !== 1 || markerMatches.length !== 1) {
    failures.push(`developer-instructions.md must contain exactly one complete single-line bridge command example (found ${markerOpenCount} opener(s), ${markerMatches.length} complete)`);
  } else {
    let envelope;
    try {
      envelope = JSON.parse(markerMatches[0][1]);
    } catch (error) {
      failures.push(`Bridge command example is not valid JSON: ${error.message}`);
    }
    if (!envelope || typeof envelope !== "object" || Array.isArray(envelope)) {
      failures.push("Bridge command example must be a JSON object");
    } else {
      if (!hasExactKeys(envelope, ["protocol", "sequence", "command_id", "task_id", "kind", "arguments", "expected"])) failures.push("Bridge command example has incorrect envelope fields");
      if (envelope.protocol !== bridgeProtocolRevision) failures.push("Bridge command example has an incorrect protocol");
      if (!Number.isSafeInteger(envelope.sequence) || envelope.sequence < 1) failures.push("Bridge command example has an invalid sequence");
      if (typeof envelope.command_id !== "string" || !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/.test(envelope.command_id)) failures.push("Bridge command example has an invalid command UUID");
      if (typeof envelope.task_id !== "string" || !/^[A-Za-z0-9][A-Za-z0-9._-]{0,127}$/.test(envelope.task_id)) failures.push("Bridge command example has an invalid task ID");
      if (envelope.kind !== "start") failures.push("Bridge command example must use start");
      if (!hasExactKeys(envelope.arguments, ["brief", "agent"]) || typeof envelope.arguments?.brief !== "string" || !envelope.arguments.brief || !["luna", "sol"].includes(envelope.arguments?.agent)) failures.push("Bridge command example has invalid start arguments");
      if (!hasExactKeys(envelope.expected, ["developer_sha", "ref"]) || typeof envelope.expected?.developer_sha !== "string" || !/^[0-9a-f]{40}$/.test(envelope.expected.developer_sha) || envelope.expected?.ref !== "developer") failures.push("Bridge command example has an invalid expected-state guard");
    }
  }
}

const sourceTerms = [
  ["User", "Activity", "Monitor"].join(" "),
  ["u", "a", "m", "-modernization"].join(""),
  ["U", "A", "M", "-overdracht"].join(""),
  ["legacy", "_", "u", "a", "m"].join(""),
  ["ADR", "-FS-"].join(""),
];

const staleTransportPatterns = [
  [/\bopencode[\s._`*-]*mcp\b/i, "opencode-mcp"],
  [/\bjcode[\s._`*-]*munch\b/i, "jcodemunch"],
  [/\bcreate[\s_`*-]+or[\s_`*-]+continue[\s_`*-]+the[\s_`*-]+session\b/i, "create or continue the session"],
  [/\binspect[\s_`*-]+the[\s_`*-]+delegated[\s_`*-]+session[\s_`*-]+conversation\b/i, "inspect the delegated session conversation"],
];

const unsafePolicyInversions = [
  [/\b(?:bridge|opencode)\s+(?:reports?|output)\s+(?:is|are|becomes?)\s+authoritative\b/i, "bridge reports as authoritative evidence"],
  [/\bdeveloper\s+push\s+(?:is|means|constitutes)\s+(?:human\s+)?acceptance\b/i, "developer push as human acceptance"],
  [/\b(?:always|automatically|may|must|should)\s+retry\b[^.\n]{0,80}\bindeterminate\b/i, "automatic retry after indeterminate state"],
  [/\b(?:may|can|should|must|always)\s+(?:send|store|persist|publish)\s+(?:secrets|credentials)\b/i, "persistence of secrets or credentials"],
  [/\b(?:may|can|should|must|always)\s+promote\b[^.\n]{0,80}\bwithout\s+(?:explicit\s+)?human\s+approval\b/i, "promotion without human approval"],
  [/\b(?:may|can|should|must|always)\s+(?:post|place)\s+commands?\s+in\s+(?:the\s+)?issue\s+body\b/i, "issue-body command publication"],
];

const obsoleteFinalizationPatterns = [
  [/(?:\b(?:delete|remove)\w*\b[^.\n]{0,60}\btask-progress\b|\btask-progress\b[^.\n]{0,60}\b(?:delete|remove)\w*\b)/i, "task-progress removal"],
];

for (const [file, source] of texts) {
  for (const term of sourceTerms) {
    if (source.toLowerCase().includes(term.toLowerCase())) failures.push(`${file} contains a source-project identifier`);
  }
  for (const [pattern, label] of staleTransportPatterns) {
    if (pattern.test(source)) failures.push(`${file} contains stale direct-transport text: ${label}`);
  }
  for (const [pattern, label] of unsafePolicyInversions) {
    if (pattern.test(source)) failures.push(`${file} contains an unsafe policy inversion: ${label}`);
  }
  for (const [pattern, label] of obsoleteFinalizationPatterns) {
    if (pattern.test(source)) failures.push(`${file} contains obsolete finalization policy: ${label}`);
  }
}

if (failures.length) {
  failures.sort((left, right) => left.localeCompare(right));
  console.error(`Orchestration package validation failed (${failures.length}):`);
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(`Orchestration package validation passed: ${skills.length} Project Sources, package instructions, ${requiredBranchFiles.length} continuity files, bridge protocol ${bridgeProtocolRevision}.`);
