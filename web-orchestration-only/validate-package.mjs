#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.join(root, "chatgpt-project");
const taskContextRoot = path.join(root, "task-context");
const failures = [];
const texts = new Map();

const sources = [
  "skill-workflow.md",
  "skill-recovery.md",
  "skill-maintenance.md",
  "skill-promotion.md",
  "skill-prompt-creation.md",
];
const projectFiles = ["README.md", "developer-instructions.md", ...sources];
const rootEntries = [
  "AS-BUILT.md",
  "ORCHESTRATION-EVOLUTION.md",
  "README.md",
  "chatgpt-project",
  "task-context",
  "validate-package.mjs",
  "validate-package.test.mjs",
];
const taskRecordSections = [
  "Accepted outcome",
  "Material scope",
  "Constraints",
  "Required outputs",
  "Required checks",
  "Accepted design",
  "Explicit exceptions",
];

function fail(message) {
  failures.push(message);
}

function readTextFile(target, label) {
  try {
    const stat = fs.lstatSync(target);
    if (!stat.isFile()) {
      fail(`Required path is not a regular file: ${label}`);
      return "";
    }
    fs.accessSync(target, fs.constants.R_OK);
    const raw = fs.readFileSync(target);
    if (raw.includes(0)) fail(`File contains NUL bytes: ${label}`);
    const text = raw.toString("utf8");
    if (!Buffer.from(text, "utf8").equals(raw)) fail(`File is not valid UTF-8: ${label}`);
    if (!text.trim()) fail(`File is blank: ${label}`);
    texts.set(label, text);
    return text;
  } catch (error) {
    const prefix = error?.code === "ENOENT" ? "Missing" : "Cannot read";
    fail(`${prefix} ${label}${error?.code === "ENOENT" ? "" : `: ${error.message}`}`);
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

function requireDirectory(target, label) {
  try {
    if (!fs.lstatSync(target).isDirectory()) fail(`Required path is not a directory: ${label}`);
  } catch (error) {
    const prefix = error?.code === "ENOENT" ? "Missing" : "Cannot inspect";
    fail(`${prefix} ${label}${error?.code === "ENOENT" ? "" : `: ${error.message}`}`);
  }
}

function taskContextInventory() {
  const required = new Set(["README.md", "TEMPLATE.md"]);
  try {
    const entries = fs.readdirSync(taskContextRoot, { withFileTypes: true });
    for (const name of required) {
      const entry = entries.find((candidate) => candidate.name === name);
      if (!entry?.isFile()) fail(`task-context is missing required regular file: ${name}`);
    }
    for (const entry of entries) {
      const label = `task-context/${entry.name}`;
      if (!entry.isFile() || !/^[A-Za-z0-9][A-Za-z0-9._-]{0,127}\.md$/.test(entry.name)) {
        fail(`task-context contains an invalid Markdown entry: ${entry.name}`);
        continue;
      }
      readTextFile(path.join(taskContextRoot, entry.name), label);
    }
  } catch (error) {
    fail(`Cannot inventory task-context: ${error.message}`);
  }
}

function requireConcept(label, text, patterns) {
  if (!patterns.every((pattern) => pattern.test(text))) fail(label);
}

function hasPublicSafetyBoundary(text) {
  return [
    /(?:persist|publish|GitHub)[\s\S]{0,100}public/i,
    /(?:secret|credential)/i,
    /(?:private|personal)[\s\S]{0,50}(?:chat|conversation|data|context)/i,
    /host-local[\s\S]{0,30}(?:absolute )?path/i,
  ].every((pattern) => pattern.test(text));
}

exactInventory(root, rootEntries, "web-orchestration-only root");
requireDirectory(projectRoot, "chatgpt-project");
requireDirectory(taskContextRoot, "task-context");
exactInventory(projectRoot, projectFiles, "Project package");

for (const file of [
  "AS-BUILT.md",
  "ORCHESTRATION-EVOLUTION.md",
  "README.md",
  "validate-package.mjs",
  "validate-package.test.mjs",
]) readTextFile(path.join(root, file), file);
for (const file of projectFiles) readTextFile(path.join(projectRoot, file), `chatgpt-project/${file}`);
taskContextInventory();

const instructions = texts.get("chatgpt-project/developer-instructions.md") ?? "";
const workflow = texts.get("chatgpt-project/skill-workflow.md") ?? "";
const recovery = texts.get("chatgpt-project/skill-recovery.md") ?? "";
const maintenance = texts.get("chatgpt-project/skill-maintenance.md") ?? "";
const promotion = texts.get("chatgpt-project/skill-promotion.md") ?? "";
const promptCreation = texts.get("chatgpt-project/skill-prompt-creation.md") ?? "";
const install = texts.get("chatgpt-project/README.md") ?? "";
const rootReadme = texts.get("README.md") ?? "";
const evolution = texts.get("ORCHESTRATION-EVOLUTION.md") ?? "";
const asBuilt = texts.get("AS-BUILT.md") ?? "";
const taskTemplate = texts.get("task-context/TEMPLATE.md") ?? "";
const taskReadme = texts.get("task-context/README.md") ?? "";

const triggerRows = [...instructions.matchAll(/^\|[^|\n]+\|\s*`(skill-[^`]+\.md)`\s*\|\s*$/gm)].map((match) => match[1]);
for (const source of sources) {
  const count = triggerRows.filter((entry) => entry === source).length;
  if (count !== 1) fail(`Project Source must have exactly one trigger row: ${source} (found ${count})`);
}
if (triggerRows.length !== sources.length) fail(`Procedure router must contain exactly ${sources.length} Source rows`);
for (const source of triggerRows) if (!sources.includes(source)) fail(`Router references unknown Project Source: ${source}`);

for (const source of sources) {
  const text = texts.get(`chatgpt-project/${source}`) ?? "";
  if (!/^# [^\n]+\n/.test(text)) fail(`${source} must begin with a Markdown title`);
  if (!/^## Trigger\s*$/m.test(text)) fail(`${source} must declare a Trigger section`);
}

for (const source of sources) {
  const count = install.split(`\`${source}\``).length - 1;
  if (count !== 1) fail(`Installation inventory must name ${source} exactly once (found ${count})`);
}
for (const [label, text, placeholders] of [
  ["chatgpt-project/README.md", install, ["<owner>/<repository>", "https://github.com/<owner>/<repository>"]],
  ["chatgpt-project/developer-instructions.md", instructions, ["<owner>/<repository>"]],
]) {
  for (const placeholder of placeholders) {
    if (!text.includes(placeholder)) fail(`${label} is missing required render placeholder ${placeholder}`);
  }
}

if (!/^# Task record:\s*<task-id>\s*$/m.test(taskTemplate)) {
  fail("task-context/TEMPLATE.md must identify itself as a task record");
}
if (!/^- Task ID:\s*<task-id>\s*$/m.test(taskTemplate)) {
  fail("task-context/TEMPLATE.md must include the task identity field");
}
for (const section of taskRecordSections) {
  const escaped = section.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const count = [...taskTemplate.matchAll(new RegExp(`^## ${escaped}\\s*$`, "gm"))].length;
  if (count !== 1) fail(`task-context/TEMPLATE.md must contain exactly one ${section} section`);
}
if (/^## (?:Current position|Material observations|Meaningful failed attempts|Blockers and decisions|Checks run|Remaining work|Next action)\s*$/m.test(taskTemplate)) {
  fail("task-context/TEMPLATE.md must keep task-progress state separate");
}
requireConcept(
  "task-context/README.md must separate task progress from authority and preserve historical truth",
  taskReadme,
  [
    /(?:task-progress|progress)/i,
    /execution state/i,
    /(?:not|never)[\s\S]{0,80}authority/i,
    /historical[\s\S]{0,100}(?:truth|evidence|preserv)/i,
    /(?:do not|never)[\s\S]{0,100}(?:rewrite|retroactiv)/i,
  ],
);

if (!hasPublicSafetyBoundary(rootReadme)) fail("README.md must retain the public-persistence safety boundary");
if (!hasPublicSafetyBoundary(instructions)) fail("Permanent instructions must retain the public-persistence safety boundary");
requireConcept(
  "Permanent instructions must reserve developer-to-main promotion to human exact-SHA approval",
  instructions,
  [/Only the human/i, /exact reviewed `developer` SHA/i, /promotion to `main`/i],
);
requireConcept(
  "Permanent instructions must retain one-route, no-replay, and 5,000-token context boundaries",
  instructions,
  [/one mutating route/i, /Never[\s\S]{0,30}replay/i, /5,000 raw chat tokens/i, /conversation-compaction fallback/i],
);
requireConcept(
  "Workflow Source must route current developer and unified maintenance roles",
  workflow,
  [/small-developer/i, /heavy-developer/i, /Dual developer/i, /small-maintainer/i, /heavy-maintainer/i],
);
requireConcept(
  "Workflow Source must rely on Lead as developer brain and keep independent final verification",
  workflow,
  [/Lead is the developer brain/i, /independent/i, /exact remote range/i],
);
requireConcept(
  "Maintenance Source must describe one role at two capacities on an explicit verified target",
  maintenance,
  [/small-maintainer/i, /heavy-maintainer/i, /capacity variants/i, /explicit verified target/i, /bounded outcome/i],
);
requireConcept(
  "Maintenance Source must keep main outside maintenance mutation",
  maintenance,
  [/`main` is never a maintenance mutation target/i, /exact-SHA/i],
);
requireConcept(
  "Recovery Source must prohibit replay and require evidence-based reconciliation",
  recovery,
  [/Do not repeat/i, /uncertain/i, /reconcil/i, /Retry only when evidence proves/i],
);
requireConcept(
  "Promotion Source must require an explicit human exact developer SHA trigger",
  promotion,
  [/human explicitly approves/i, /exact[\s\S]{0,80}`developer` SHA/i],
);
requireConcept(
  "Promotion Source must prohibit opportunistic content and automatic replay",
  promotion,
  [/Do not add[\s\S]{0,180}opportunistic content/i, /Never automatically replay promotion/i],
);
requireConcept(
  "Prompt Source must preserve destination capabilities and evidence roles",
  promptCreation,
  [/capabilities actually available/i, /\*\*Observed:\*\*/i, /\*\*Interpretation:\*\*/i, /\*\*Requested outcome:\*\*/i],
);
requireConcept(
  "Evolution design must remain non-runtime and define shared core plus Web/Local capability profiles",
  evolution,
  [/not implemented runtime architecture/i, /shared orchestrator core/i, /### Web/i, /### Local/i, /smallest next authorized change/i],
);

const activeProjectText = projectFiles.map((file) => texts.get(`chatgpt-project/${file}`) ?? "").join("\n");
for (const obsolete of [
  /\btemplate-maintainer\b/i,
  /\bsmall-workspace-maintainer\b/i,
  /\bworkspace-maintainer\b/i,
  /proposed-deviations\.md/i,
  /full uncommitted diff/i,
  /\bMCP-ON\b/i,
  /\bMCP-OFF\b/i,
]) if (obsolete.test(activeProjectText)) fail(`Active Project package contains obsolete workflow residue: ${obsolete}`);

for (const requiredName of [
  "developer-instructions.md",
  "skill-workflow.md",
  "skill-recovery.md",
  "skill-maintenance.md",
  "skill-promotion.md",
  "skill-prompt-creation.md",
  "validate-package.mjs",
  "validate-package.test.mjs",
]) {
  if (!asBuilt.includes(requiredName)) fail(`AS-BUILT.md is missing current file responsibility: ${requiredName}`);
}

const publicUnsafePatterns = [
  [/(?:^|[\s`"'(=:\[])\/*(?:Users|home)\/[A-Za-z0-9._-]+(?:\/|\b)/m, "host-local absolute path"],
  [/\b(?:sk-[A-Za-z0-9_-]{20,}|gh[pousr]_[A-Za-z0-9]{20,}|github_pat_[A-Za-z0-9_]{20,})\b/, "credential-like token"],
  [/-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/, "private key"],
];
for (const [label, text] of texts) {
  for (const [pattern, description] of publicUnsafePatterns) {
    if (pattern.test(text)) fail(`${label} contains a ${description}`);
  }
}

if (failures.length) {
  console.error(`Orchestration package validation failed (${failures.length}):`);
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(`Orchestration package validation passed: exact inventories, ${sources.length} routed Sources, unified maintenance routing, concise Dual ownership, future Web/Local design, and hard public/no-replay/human exact-SHA guards.`);
