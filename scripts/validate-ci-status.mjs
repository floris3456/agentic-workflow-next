#!/usr/bin/env node
import { readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const workflow = readFileSync(join(root, ".github/workflows/validate-repository.yml"), "utf8");
const failures = [];
const requireTerm = (term) => {
  if (!workflow.includes(term)) failures.push(`validate-repository workflow is missing: ${term}`);
};

for (const term of [
  "branches: [developer, main]",
  "contents: read",
  "statuses: write",
  "persist-credentials: false",
  "./scripts/validate-repository.sh",
  "Publish exact-SHA validation status",
  "always() && github.event_name == 'push'",
  "agentic-template/validate-repository",
  "statuses/${GITHUB_SHA}",
  "Authorization: Bearer ${GH_STATUS_TOKEN}",
  "actions/runs/${{ github.run_id }}",
]) requireTerm(term);

for (const forbidden of ["contents: write", "secrets."]) {
  if (workflow.includes(forbidden)) failures.push(`validate-repository workflow contains forbidden status-reporting surface: ${forbidden}`);
}

if (failures.length) {
  console.error(`CI status validation failed (${failures.length}):`);
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}
console.log("CI status validation passed.");
