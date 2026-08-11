#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const failures = [];
const exists = (p) => fs.existsSync(path.join(root, p));
const read = (p) => fs.readFileSync(path.join(root, p), "utf8");
const fail = (m) => failures.push(m);
const assert = (condition, message) => { if (!condition) fail(message); };

function listSkillNames() {
  const dir = path.join(root, ".opencode/skills");
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true })
    .filter((e) => e.isDirectory() && fs.existsSync(path.join(dir, e.name, "SKILL.md")))
    .map((e) => e.name);
}

function frontmatter(text) {
  if (!text.startsWith("---\n")) return null;
  const end = text.indexOf("\n---\n", 4);
  if (end < 0) return null;
  const result = {};
  for (const line of text.slice(4, end).split("\n")) {
    const match = line.match(/^([A-Za-z][A-Za-z0-9_-]*):\s*(.*)$/);
    if (match) result[match[1]] = match[2].trim();
  }
  return result;
}

function allRepositoryFiles(directory) {
  const entries = fs.readdirSync(directory, { withFileTypes: true });
  return entries.flatMap((entry) => {
    if (entry.name === ".git" || entry.name === "node_modules") return [];
    const fullPath = path.join(directory, entry.name);
    return entry.isDirectory() ? allRepositoryFiles(fullPath) : [fullPath];
  });
}

// OpenCode config: validate current references, not an eternal agent count.
try {
  const config = JSON.parse(read("opencode.json"));
  assert(config.default_agent === "small-developer", "default_agent must be small-developer");
  assert(config.share === "disabled", "OpenCode sharing must be disabled");
  assert(config.permission?.task === "deny", "task/subagent launches must be denied");
  const defaultPath = `.opencode/agents/${config.default_agent}.md`;
  assert(exists(defaultPath), `Configured default agent does not exist: ${defaultPath}`);
  if (exists(defaultPath)) {
    const fm = frontmatter(read(defaultPath));
    assert(fm?.mode === "primary", "Configured default agent must be primary");
  }
} catch (error) {
  fail(`opencode.json is invalid: ${error.message}`);
}

for (const [file, model, effort] of [
  [".opencode/agents/small-developer.md", "openai/gpt-5.6-luna", "max"],
  [".opencode/agents/large-developer.md", "openai/gpt-5.6-sol", "high"],
]) {
  assert(exists(file), `Missing approved developer definition: ${file}`);
  if (!exists(file)) continue;
  const text = read(file);
  const fm = frontmatter(text);
  assert(fm?.mode === "primary", `${file} must be primary`);
  assert(fm?.model === model, `${file} model must be ${model}`);
  assert(fm?.reasoningEffort === effort, `${file} reasoningEffort must be ${effort}`);
  assert(/\n\s*task:\s*deny\s*\n/.test(text), `${file} must deny task launches`);
}

const skills = new Set(listSkillNames());
for (const requiredSkill of [
  "task-workflow", "implementation-records", "git-sync-and-handoff",
  "gate-workflow", "research-workflow", "prompt-authoring",
]) {
  assert(skills.has(requiredSkill), `Missing reusable skill: ${requiredSkill}`);
}
for (const name of skills) {
  const file = `.opencode/skills/${name}/SKILL.md`;
  const text = read(file);
  const fm = frontmatter(text);
  assert(fm !== null, `${file} needs YAML frontmatter`);
  assert(fm?.name === name, `${file} name must match its directory`);
  assert(typeof fm?.description === "string" && fm.description.length > 0, `${file} needs a description`);
  assert(/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(name), `Invalid skill name: ${name}`);
}

const agents = read("AGENTS.md");
const triggerSection = agents.split("## Skill triggers")[1]?.split("## Pointers")[0] ?? "";
for (const match of triggerSection.matchAll(/`([a-z0-9]+(?:-[a-z0-9]+)*)`/g)) {
  assert(skills.has(match[1]), `AGENTS.md references missing skill: ${match[1]}`);
}

const expectedResponse = [
  "Status:",
  "Files changed:",
  "Checks + perceived results:",
  "Blockers/decisions:",
  "Task record:",
].join("\n") + "\n";
assert(read("docs/work/templates/developer-response-template.md") === expectedResponse,
  "Developer response template must contain exactly the five canonical fields");
for (const file of [
  ".opencode/agents/small-developer.md",
  ".opencode/agents/large-developer.md",
  ".opencode/skills/git-sync-and-handoff/SKILL.md",
  "docs/work/README.md",
]) {
  assert(read(file).includes(expectedResponse.trim()), `${file} does not contain the canonical response fields`);
}

for (const file of [
  ".githooks/pre-commit", ".githooks/pre-merge-commit", ".githooks/post-commit", ".githooks/pre-push",
  "scripts/bootstrap-agent-workflow.sh", "scripts/recover-remote-sync.sh",
  "scripts/promote-developer-to-main.sh", "scripts/validate-repository.sh",
]) {
  assert(exists(file), `Missing required executable: ${file}`);
  if (exists(file) && process.platform !== "win32") {
    assert((fs.statSync(path.join(root, file)).mode & 0o111) !== 0, `Executable bit missing: ${file}`);
  }
}

try {
  const raw = read(".jcodemunch.jsonc");
  const parsed = JSON.parse(raw.replace(/^\s*\/\/.*$/gm, ""));
  for (const required of ["raw-evidence", "raw-evidence/**", "research/**", "evidence/**"]) {
    assert(parsed.extra_ignore_patterns?.includes(required), `.jcodemunch.jsonc missing relevance exclusion: ${required}`);
    assert(parsed.watch_extra_ignore?.includes(required), `.jcodemunch.jsonc missing watch exclusion: ${required}`);
  }
  assert(!/confidential|protected[- ]path|protected lane/i.test(raw), "jCodeMunch exclusions must not act as protected-path access control");
} catch (error) {
  fail(`.jcodemunch.jsonc is invalid: ${error.message}`);
}

for (const file of ["README.md", "SECURITY.md", "evidence/README.md", "docs/architecture/agent-system.md", "docs/architecture/design-record.md"]) {
  assert(!/repository (?:itself )?must remain private|keep the github repository private/i.test(read(file)),
    `${file} still requires private repository hosting`);
}

assert(!exists("docs/web-lane/developer-instructions.md"), "Repository must not duplicate web-orchestrator operating instructions");
assert(!exists("opencode.example.json"), "Obsolete opencode.example.json must be deleted");
assert(!exists("scripts/check-lane-boundaries.sh"), "Retired protected-lane validator remains");
assert(!exists("scripts/agent-system-deleted-paths.txt"), "Migration-only deleted-path inventory remains");
assert(!exists("scripts/generate-research-code-reference.sh"), "Project-specific code-reference generator remains");
assert(!exists("scripts/profile-detailed-application-catalogue.mjs"), "Project-specific catalogue profiler remains");
assert(!exists("scripts/profile-original-application-catalogue.mjs"), "Project-specific catalogue profiler remains");
assert(!exists(".github/workflows/validate-handover.yml"), "Project-specific handover workflow remains");

// Keep machine/load-bearing configuration free of paths that this template intentionally does not ship.
const machineSources = [
  "opencode.json", "AGENTS.md", ".github/copilot-instructions.md",
  ".github/workflows/validate-repository.yml",
  "scripts/validate-repository.sh", "scripts/validate-preimplementation.mjs",
];
for (const source of machineSources) {
  if (!exists(source)) continue;
  const text = read(source);
  assert(!text.includes(["U", "A", "M"].join("")), `${source} contains a residual source-project identifier`);
}

// Deliberately narrow residual scan: exact source names/identifiers only, not
// generic substrings that may legitimately occur in another project.
const sourceProjectTerms = [
  { value: ["User", "Activity", "Monitor"].join(" "), label: "source product name" },
  { value: ["u", "a", "m", "-modernization"].join(""), label: "source repository identifier" },
  { value: ["U", "A", "M", "-overdracht"].join(""), label: "source handover identifier" },
  { value: ["legacy", "_", "u", "a", "m"].join(""), label: "source legacy identifier" },
  { value: ["2026", "-07-23"].join(""), label: "source dated path" },
  { value: ["ADR", "-FS-"].join(""), label: "source ADR identifier" },
  { value: ["G0", "-001"].join(""), label: "source task identifier" },
  { value: ["U", "A", "M"].join(""), label: "source acronym" },
];
for (const file of allRepositoryFiles(root)) {
  const bytes = fs.readFileSync(file);
  if (bytes.includes(0)) continue;
  const relative = path.relative(root, file).split(path.sep).join("/");
  const text = bytes.toString("utf8");
  for (const term of sourceProjectTerms) {
    if (text.toLocaleLowerCase().includes(term.value.toLocaleLowerCase())) {
      fail(`${relative} contains ${term.label}`);
    }
  }
}

if (failures.length) {
  console.error(`Agent-system validation failed (${failures.length}):`);
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}
console.log("Agent-system validation passed.");
