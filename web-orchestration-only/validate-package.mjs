#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.join(root, "chatgpt-project");
const taskContextRoot = path.join(root, "task-context");
const failures = [];
const texts = new Map();

const skills = [
  "skill-workflow.md",
  "skill-recovery.md",
  "skill-template-maintenance.md",
  "skill-promotion.md",
  "skill-prompt-creation.md",
];
const projectFiles = ["README.md", "developer-instructions.md", ...skills];
const rootEntries = [
  "AS-BUILT.md",
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

function labelFor(target) {
  return path.relative(root, target) || ".";
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
    for (const requiredName of required) {
      const entry = entries.find((candidate) => candidate.name === requiredName);
      if (!entry?.isFile()) fail(`task-context is missing required regular file: ${requiredName}`);
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
    fail(`Cannot inventory ${labelFor(taskContextRoot)}: ${error.message}`);
  }
}

function hasConcept(text, patterns) {
  return patterns.every((pattern) => pattern.test(text));
}

function hasPublicSafetyBoundary(text) {
  return hasConcept(text, [
    /(?:persist|publish|GitHub)[\s\S]{0,100}public/i,
    /(?:secret|credential)/i,
    /(?:private|personal)[\s\S]{0,40}(?:chat|conversation|data|context)/i,
    /host-local[\s\S]{0,30}(?:absolute )?path/i,
  ]);
}

exactInventory(root, rootEntries, "web-orchestration-only root");
requireDirectory(projectRoot, "chatgpt-project");
requireDirectory(taskContextRoot, "task-context");
exactInventory(projectRoot, projectFiles, "Project package");
readTextFile(path.join(root, "AS-BUILT.md"), "AS-BUILT.md");
readTextFile(path.join(root, "README.md"), "README.md");
readTextFile(path.join(root, "validate-package.mjs"), "validate-package.mjs");
readTextFile(path.join(root, "validate-package.test.mjs"), "validate-package.test.mjs");
for (const file of projectFiles) readTextFile(path.join(projectRoot, file), `chatgpt-project/${file}`);
taskContextInventory();

const instructions = texts.get("chatgpt-project/developer-instructions.md") ?? "";
const recovery = texts.get("chatgpt-project/skill-recovery.md") ?? "";
const promotion = texts.get("chatgpt-project/skill-promotion.md") ?? "";
const install = texts.get("chatgpt-project/README.md") ?? "";
const rootReadme = texts.get("README.md") ?? "";
const taskTemplate = texts.get("task-context/TEMPLATE.md") ?? "";
const taskReadme = texts.get("task-context/README.md") ?? "";

const triggerRows = [...instructions.matchAll(/^\|[^|\n]+\|\s*`(skill-[^`]+\.md)`\s*\|\s*$/gm)].map((match) => match[1]);
for (const skill of skills) {
  const count = triggerRows.filter((entry) => entry === skill).length;
  if (count !== 1) fail(`Project Source must have exactly one trigger row: ${skill} (found ${count})`);
}
if (triggerRows.length !== skills.length) fail(`Procedure router must contain exactly ${skills.length} Source rows`);
for (const source of triggerRows) if (!skills.includes(source)) fail(`Router references unknown Project Source: ${source}`);

for (const skill of skills) {
  const text = texts.get(`chatgpt-project/${skill}`) ?? "";
  if (!/^# [^\n]+\n/.test(text)) fail(`${skill} must begin with a Markdown title`);
  if (!/^## Trigger\s*$/m.test(text)) fail(`${skill} must declare a Trigger section`);
}

for (const skill of skills) {
  const count = install.split(`\`${skill}\``).length - 1;
  if (count !== 1) fail(`Installation inventory must name ${skill} exactly once (found ${count})`);
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
  const count = [...taskTemplate.matchAll(new RegExp(`^## ${section.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\s*$`, "gm"))].length;
  if (count !== 1) fail(`task-context/TEMPLATE.md must contain exactly one ${section} section`);
}
if (/^## (?:Current position|Material observations|Meaningful failed attempts|Blockers and decisions|Checks run|Remaining work|Next action)\s*$/m.test(taskTemplate)) {
  fail("task-context/TEMPLATE.md must keep task-progress state separate");
}
if (!hasConcept(taskReadme, [
  /(?:task-progress|progress)/i,
  /execution state/i,
  /(?:not|never)[\s\S]{0,80}authority/i,
  /historical[\s\S]{0,100}(?:truth|evidence|preserv)/i,
  /(?:do not|never)[\s\S]{0,100}(?:rewrite|retroactiv)/i,
])) {
  fail("task-context/README.md must separate task progress from authority and preserve historical truth");
}

if (!hasPublicSafetyBoundary(rootReadme)) {
  fail("README.md must retain the public-persistence safety boundary");
}
if (!hasPublicSafetyBoundary(instructions)) {
  fail("Permanent instructions must retain the public-persistence safety boundary");
}
if (!hasConcept(instructions, [/Only the human/i, /exact reviewed `developer` SHA/i, /promotion to `main`/i])) {
  fail("Permanent instructions must reserve developer-to-main promotion to human exact-SHA approval");
}
if (!hasConcept(recovery, [/Never automatically (?:repeat|replay)/i, /uncertain mutation/i, /reconcil/i])) {
  fail("Recovery Source must prohibit automatic replay of uncertain mutations and require reconciliation");
}
if (!hasConcept(promotion, [/human explicitly approves/i, /exact[^\n]*`developer` SHA/i])) {
  fail("Promotion Source must require an explicit human exact developer SHA trigger");
}
if (!hasConcept(promotion, [/Do not add[\s\S]{0,180}opportunistic content/i, /Never[\s\S]{0,120}automatically replay promotion/i])) {
  fail("Promotion Source must prohibit opportunistic content and automatic replay");
}

const publicUnsafePatterns = [
  [/(?:^|[\s`"'(=:\[])\/(?:Users|home)\/[A-Za-z0-9._-]+(?:\/|\b)/m, "host-local absolute path"],
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

console.log(`Orchestration package validation passed: exact package inventories, ${skills.length} routed Project Sources, flexible public-safe task history, current task-record structure, and concise no-replay/human exact-SHA promotion guards.`);
