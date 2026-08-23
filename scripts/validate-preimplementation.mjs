#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const failures = [];
const required = [
  "README.md", "AGENTS.md", "CONTRIBUTING.md", "SECURITY.md", "opencode.json", ".jcodemunch.jsonc",
  "docs/architecture/agent-system.md", "docs/architecture/branch-workflow.md",
  "docs/architecture/implementation-records.md", "docs/architecture/repository-layout.md",
  "docs/architecture/AS-BUILT.md", "docs/architecture/deviations.md",
  "docs/work/README.md", "docs/work/current/README.md", "docs/work/archive/README.md",
  "docs/work/templates/task-template.md", "docs/work/templates/task-progress-template.md",
];
for (const file of required) if (!fs.existsSync(path.join(root, file))) failures.push(`Missing ${file}`);

function walk(target) {
  const relative = path.relative(root, target);
  const retiredHandoff = relative === "docs/work/handoffs" || relative.startsWith(`docs/work/handoffs${path.sep}`);
  const archivedSnapshot = relative.startsWith(`docs/work/archive${path.sep}`) && relative !== `docs/work/archive${path.sep}README.md`;
  if (relative.split(path.sep).includes("node_modules") || retiredHandoff || archivedSnapshot) return [];
  const stat = fs.statSync(target);
  if (stat.isFile()) return [target];
  return fs.readdirSync(target, { withFileTypes: true })
    .flatMap((entry) => walk(path.join(target, entry.name)));
}

// Historical snapshots are immutable; current link health must not require rewriting them.
// Research has its own parser-aware validator; avoid re-parsing immutable evidence with a generic Markdown regex.
const roots = ["README.md", "AGENTS.md", "CONTRIBUTING.md", "SECURITY.md", ".github", ".opencode", "docs"];
for (const relative of roots) {
  const start = path.join(root, relative);
  if (!fs.existsSync(start)) continue;
  for (const file of walk(start).filter((item) => item.endsWith(".md"))) {
    const text = fs.readFileSync(file, "utf8");
    for (const match of text.matchAll(/\[[^\]]*\]\(([^)]+)\)/g)) {
      const target = match[1].trim().replace(/^<|>$/g, "");
      if (/^(?:https?:|mailto:)/i.test(target)) continue;
      const [targetPath] = target.split("#");
      const resolved = targetPath ? path.resolve(path.dirname(file), targetPath) : file;
      if (!fs.existsSync(resolved)) failures.push(`${path.relative(root, file)} has unresolved link ${target}`);
    }
  }
}

if (failures.length) {
  console.error(`Pre-implementation validation failed (${failures.length}):`);
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}
console.log("Pre-implementation structure and link validation passed.");
