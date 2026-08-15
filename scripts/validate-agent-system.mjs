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

assert(!exists(".opencode/agents/repository-scout.md"),
  "repository-scout must not be ref-owned; the bridge must fail closed until a hardened runtime exists");
const scoutSource = read("tools/opencode-bridge/src/scout.ts");
assert(scoutSource.includes("allowedTools = new Set([\"read\", \"glob\", \"grep\"])") && !scoutSource.includes("\"read\", \"glob\", \"grep\", \"lsp\""),
  "Scout contract must exclude LSP");
assert(scoutSource.includes("Hardened Scout runtime is unavailable") && scoutSource.includes("repository instructions") && scoutSource.includes("package"),
  "Scout start must expose the pinned-runtime isolation blocker");

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
  "Handoff developer SHA:",
  "Files changed:",
  "Checks + perceived results:",
  "Blockers/decisions:",
  "Task record:",
].join("\n") + "\n";
assert(read("docs/work/templates/developer-response-template.md") === expectedResponse,
  "Developer response template must contain exactly the six canonical fields");
const handoffSkill = read(".opencode/skills/git-sync-and-handoff/SKILL.md");
assert(handoffSkill.includes("report the resulting current handoff SHA in `Handoff developer SHA`"),
  "git-sync-and-handoff must assign the handoff SHA to its dedicated field");
assert(!handoffSkill.includes("handoff SHA in `Status`"),
  "git-sync-and-handoff must not assign the handoff SHA to Status");
for (const file of [
  ".opencode/agents/small-developer.md",
  ".opencode/agents/large-developer.md",
]) {
  assert(read(file).includes(expectedResponse.trim()), `${file} does not contain the canonical response fields`);
}
for (const file of [".opencode/agents/small-developer.md", ".opencode/agents/large-developer.md"]) {
  const agent = read(file);
  assert(/\n\s*question:\s*allow\s*\n/.test(agent), `${file} must allow structured question interactions`);
  assert(agent.includes("Do not substitute ordinary") && agent.includes("question-tool interaction"),
    `${file} must require the structured question pathway when a human answer is needed`);
  for (const status of ["completed", "blocked", "failed", "needs decision"]) {
    assert(agent.includes(status), `${file} is missing developer status ${status}`);
  }
  assert(/completed[\s\S]{0,180}pushed/i.test(agent) && /failed\s+push[\s\S]{0,100}blocked[\s\S]{0,50}none/i.test(agent),
    `${file} is missing pushed-completion/failed-push semantics`);
  assert(/successful snapshot push[\s\S]{0,180}(?:last tool action|do not edit, run another tool)/i.test(agent),
    `${file} must make the pushed handoff snapshot terminal for its working cycle`);
}
assert(handoffSkill.includes("immediately return the limited response") && handoffSkill.includes("only at the start of a later working cycle"),
  "git-sync-and-handoff must not create a same-cycle post-handoff commit");

const finalizationPolicyFiles = [
  "README.md",
  "CONTRIBUTING.md",
  ".opencode/skills/task-workflow/SKILL.md",
  ".opencode/skills/git-sync-and-handoff/SKILL.md",
  ".opencode/skills/implementation-records/SKILL.md",
  "docs/work/README.md",
  "docs/work/current/README.md",
  "docs/work/archive/README.md",
  "docs/architecture/implementation-records.md",
  "docs/architecture/repository-layout.md",
  "docs/architecture/agent-system.md",
  "docs/architecture/AS-BUILT.md",
];
const obsoleteTaskRemoval = /(?:(?:delet|remov)\w*\s+(?:the\s+)?task(?:-progress|\s+record)|task(?:-progress|\s+record)[^\n.]{0,80}\b(?:delet|remov)\w*)/i;
for (const file of finalizationPolicyFiles) {
  const text = read(file);
  assert(!obsoleteTaskRemoval.test(text), `${file} still prescribes task-record removal`);
}

const taskFinalization = read(".opencode/skills/task-workflow/SKILL.md").split("## Finalization")[1] ?? "";
for (const term of ["substantive-approval SHA", "exact approved Git blob", "same basename", "already exists", "`git mv`", "hashes to the approved blob", "non-authoritative benchmark history"]) {
  assert(taskFinalization.includes(term), `task-workflow finalization is missing archive guard: ${term}`);
}
const finalizationResponse = read(".opencode/skills/git-sync-and-handoff/SKILL.md").split("## Finalization response")[1]?.split("## Promotion")[0] ?? "";
for (const term of ["docs/work/archive/<task>.md", "archived unchanged", "substantive-approval SHA", "immutable", "non-authoritative"]) {
  assert(finalizationResponse.includes(term), `git-sync finalization response is missing archive contract: ${term}`);
}
const archivePolicy = read("docs/work/archive/README.md");
for (const term of ["immutable", "benchmark", "exact substantively approved blob", "same basename", "non-authoritative", "excluded from active-task discovery", "Do not edit, replace, or reuse"]) {
  assert(archivePolicy.includes(term), `Work archive policy is missing: ${term}`);
}

for (const file of [
  ".githooks/pre-commit", ".githooks/pre-merge-commit", ".githooks/post-commit", ".githooks/pre-push",
  "scripts/bootstrap-agent-workflow.sh", "scripts/recover-remote-sync.sh",
  "scripts/promote-developer-to-main.sh", "scripts/initialize-template-branches.sh",
  "scripts/bootstrap-opencode-bridge.sh", "scripts/opencode-bridge-status.sh",
  "scripts/opencode-attach.sh", "scripts/validate-opencode-bridge.sh",
  "scripts/validate-web-orchestrator-integration.mjs", "scripts/validate-repository.sh",
]) {
  assert(exists(file), `Missing required executable: ${file}`);
  if (exists(file) && process.platform !== "win32") {
    assert((fs.statSync(path.join(root, file)).mode & 0o111) !== 0, `Executable bit missing: ${file}`);
  }
}

try {
  const raw = read(".jcodemunch.jsonc");
  const parsed = JSON.parse(raw.replace(/^\s*\/\/.*$/gm, ""));
  for (const required of ["raw-evidence", "raw-evidence/**", "research/**", "evidence/**", "docs/work/archive/**"]) {
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
  if (relative.startsWith("docs/work/archive/")) continue;
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
