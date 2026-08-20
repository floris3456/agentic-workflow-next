#!/usr/bin/env node
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import test from "node:test";

const root = path.dirname(fileURLToPath(import.meta.url));

function runValidator(target = root) {
  return spawnSync(process.execPath, [path.join(target, "validate-package.mjs")], {
    cwd: target,
    encoding: "utf8",
  });
}

function withCopy(mutator) {
  const temp = fs.mkdtempSync(path.join(os.tmpdir(), "orchestration-package-"));
  const target = path.join(temp, "web-orchestration-only");
  fs.cpSync(root, target, { recursive: true });
  try {
    mutator(target);
    return runValidator(target);
  } finally {
    fs.rmSync(temp, { recursive: true, force: true });
  }
}

function replace(target, relative, from, to) {
  const file = path.join(target, relative);
  const text = fs.readFileSync(file, "utf8");
  assert.ok(text.includes(from), `${relative} fixture source not found: ${from}`);
  fs.writeFileSync(file, text.replace(from, to));
}

function expectFailure(mutator) {
  const result = withCopy(mutator);
  assert.notEqual(result.status, 0, `validator unexpectedly passed\nstdout: ${result.stdout}\nstderr: ${result.stderr}`);
}

test("canonical package validates", () => {
  const result = runValidator();
  assert.equal(result.status, 0, `stdout: ${result.stdout}\nstderr: ${result.stderr}`);
  assert.match(result.stdout, /5 exact conditionally routed Project Sources/);
  assert.match(result.stdout, /capability-local workflow/);
  assert.match(result.stdout, /unified prompt creation\/craft/);
});

test("canonical push CI is read-only and reaches validator plus discovered Node tests", () => {
  const workflow = fs.readFileSync(path.join(root, "..", ".github", "workflows", "validate-web-orchestration.yml"), "utf8");
  assert.match(workflow, /push:\s*\n\s+branches:\s*\[web-orchestration\]/);
  assert.match(workflow, /permissions:\s*\n\s+contents:\s+read/);
  assert.match(workflow, /persist-credentials:\s+false/);
  assert.match(workflow, /run:\s+node web-orchestration-only\/validate-package\.mjs/);
  assert.match(workflow, /run:\s+node --test\s*(?:\n|$)/);
  assert.doesNotMatch(workflow, /\bwrite\b/);
  assert.doesNotMatch(workflow, /\bsecrets\./);
});

test("workflow requires orchestrator analysis before forwarding blocker handoffs", () => {
  const workflow = fs.readFileSync(path.join(root, "chatgpt-project", "skill-workflow.md"), "utf8");
  assert.match(workflow, /Treat every developer handoff as a claim to evaluate[\s\S]{0,900}`blocked` or `needs decision`[\s\S]{0,900}investigate the claimed blocker yourself before steering or escalating/i);
  assert.match(workflow, /consult relevant accepted architecture, design, and deviation[\s\S]{0,900}implementation misunderstanding[\s\S]{0,900}orchestration\/design\s+problem/i);
  assert.match(workflow, /Repeated or similar blockers raise the bar[\s\S]{0,700}deeper orchestrator analysis[\s\S]{0,900}human-owned decision[\s\S]{0,900}unavailable required capability/i);
});

test("permanent and template routes preserve claim-first blocker reasoning", () => {
  const instructions = fs.readFileSync(path.join(root, "chatgpt-project", "developer-instructions.md"), "utf8");
  const maintenance = fs.readFileSync(path.join(root, "chatgpt-project", "skill-template-maintenance.md"), "utf8");
  assert.match(instructions, /Treat every handoff as a claim to evaluate[\s\S]{0,700}nontrivial or repeated blocker[\s\S]{0,900}architecture\/design\/deviations/i);
  assert.match(maintenance, /reports `blocked` or `needs decision`[\s\S]{0,900}permanent claim-first rule[\s\S]{0,1200}Repeated or similar blockers require stronger\s+orchestrator analysis/i);
});

test("rejects loss of permanent claim-first blocker reasoning", () => {
  expectFailure((target) => {
    replace(target, "chatgpt-project/developer-instructions.md", "Treat every handoff as a claim to evaluate", "Forward every handoff as the next instruction");
  });
});

test("rejects loss of template-maintenance blocker reasoning", () => {
  expectFailure((target) => {
    replace(target, "chatgpt-project/skill-template-maintenance.md", "apply\nthe permanent claim-first rule", "forward\nthe maintainer's proposed next step");
  });
});

test("rejects a superseded MCP skill in the package inventory", () => {
  expectFailure((target) => {
    fs.writeFileSync(path.join(target, "chatgpt-project", "skill-mcp-on-workflow.md"), "# stale\n");
  });
});

test("rejects global MCP mode semantics in permanent instructions", () => {
  expectFailure((target) => {
    replace(target, "chatgpt-project/developer-instructions.md", "# Capability-local execution", "# Capability-local execution\n\nMCP-ON is the active mode.");
  });
});

test("rejects loss of capability-local permanent behavior", () => {
  expectFailure((target) => {
    replace(target, "chatgpt-project/developer-instructions.md", "Do not create global operating modes", "Create global operating modes");
  });
});

test("rejects a missing routed skill", () => {
  expectFailure((target) => {
    const file = path.join(target, "chatgpt-project", "developer-instructions.md");
    const text = fs.readFileSync(file, "utf8");
    fs.writeFileSync(file, text.replace(/^\| Human asks for a ready-to-use prompt.*\n/m, ""));
  });
});

test("rejects loss of the hardened Scout readiness boundary", () => {
  expectFailure((target) => {
    replace(target, "chatgpt-project/skill-workflow.md", "hardened Scout runtime ready", "Scout runtime ready");
  });
});

test("rejects loss of mutation no-replay recovery", () => {
  expectFailure((target) => {
    replace(target, "chatgpt-project/skill-recovery.md", "never by replaying an\nuncertain mutation", "by replaying an\nuncertain mutation");
  });
});

test("rejects loss of the exact-SHA human promotion trigger", () => {
  expectFailure((target) => {
    replace(target, "chatgpt-project/skill-promotion.md", "human explicitly approves one exact fully reviewed final\n`developer` SHA", "automation approves a reviewed final\n`developer` SHA");
  });
});

test("rejects loss of prompt context-transfer evidence roles", () => {
  expectFailure((target) => {
    replace(target, "chatgpt-project/skill-prompt-creation.md", "- **Interpretation:**", "- **Opinion:**");
  });
});

test("rejects loss of prompt craft technique coverage", () => {
  expectFailure((target) => {
    replace(target, "chatgpt-project/skill-prompt-creation.md", "### Exploration and anchoring control", "### Exploration");
  });
});

test("rejects loss of the prompt craft no-op option", () => {
  expectFailure((target) => {
    replace(target, "chatgpt-project/skill-prompt-creation.md", "Applying no extra craft technique is a valid and common result.", "Always apply an extra craft technique.");
  });
});

test("rejects malformed bridge start command shape", () => {
  expectFailure((target) => {
    replace(target, "chatgpt-project/skill-workflow.md", '"expected":{"developer_sha"', '"guard":{"developer_sha"');
  });
});

test("rejects retired mode metadata in the new task template", () => {
  expectFailure((target) => {
    replace(target, "task-context/TEMPLATE.md", "- Material capability limits: <task-relevant unavailable action/evidence or none>", "- Last orchestration mode: MCP-ON | MCP-OFF");
  });
});

test("rejects loss of historical-record migration semantics", () => {
  expectFailure((target) => {
    replace(target, "task-context/README.md", "Historical records remain truthful history.", "Historical records should be rewritten.");
  });
});

test("rejects an incomplete five-source installation inventory", () => {
  expectFailure((target) => {
    const file = path.join(target, "chatgpt-project", "README.md");
    const text = fs.readFileSync(file, "utf8");
    fs.writeFileSync(file, text.replace("   - `skill-recovery.md`\n", ""));
  });
});
