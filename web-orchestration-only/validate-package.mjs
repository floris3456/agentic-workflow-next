#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.join(root, "chatgpt-project");
const failures = [];

const required = [
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

for (const file of required) {
  if (!fs.existsSync(path.join(projectRoot, file))) failures.push(`Missing chatgpt-project/${file}`);
}

const instructionsPath = path.join(projectRoot, "developer-instructions.md");
if (fs.existsSync(instructionsPath)) {
  const instructions = fs.readFileSync(instructionsPath, "utf8");
  for (const match of instructions.matchAll(/`(skill-[a-z0-9-]+\.md)`/g)) {
    if (!fs.existsSync(path.join(projectRoot, match[1]))) failures.push(`Unresolved Project Source: ${match[1]}`);
  }
  if (!instructions.includes("<owner>/<repository>")) failures.push("Repository identity placeholder is missing");
}

const sourceTerms = [
  ["User", "Activity", "Monitor"].join(" "),
  ["u", "a", "m", "-modernization"].join(""),
  ["U", "A", "M", "-overdracht"].join(""),
  ["legacy", "_", "u", "a", "m"].join(""),
  ["ADR", "-FS-"].join(""),
];

for (const file of fs.readdirSync(projectRoot).filter((name) => name.endsWith(".md"))) {
  const text = fs.readFileSync(path.join(projectRoot, file), "utf8").toLowerCase();
  for (const term of sourceTerms) {
    if (text.includes(term.toLowerCase())) failures.push(`chatgpt-project/${file} contains a source-project identifier`);
  }
}

if (failures.length) {
  console.error(`Orchestration package validation failed (${failures.length}):`);
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(`Orchestration package validation passed: ${required.length} Project files.`);
