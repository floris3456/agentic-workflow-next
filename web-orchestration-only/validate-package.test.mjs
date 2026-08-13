import assert from "node:assert/strict";
import { execFileSync, spawnSync } from "node:child_process";
import { cpSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const source = path.dirname(fileURLToPath(import.meta.url));

function fixture(context) {
  const parent = mkdtempSync(path.join(tmpdir(), "web-orchestrator-package-"));
  const root = path.join(parent, "web-orchestration-only");
  cpSync(source, root, { recursive: true });
  context.after(() => rmSync(parent, { recursive: true, force: true }));
  return root;
}

function run(root) {
  return spawnSync(process.execPath, [path.join(root, "validate-package.mjs")], {
    cwd: path.dirname(root),
    encoding: "utf8",
  });
}

function replace(root, relative, before, after) {
  const target = path.join(root, relative);
  const text = readFileSync(target, "utf8");
  assert.ok(text.includes(before), `fixture text missing in ${relative}: ${before}`);
  writeFileSync(target, text.replace(before, after));
}

test("current eight-Source package passes", (context) => {
  const root = fixture(context);
  const result = run(root);
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /8 exact Project Sources/);
  assert.match(result.stdout, /8 acceptance scenarios/);
});

test("documented installation rendering produces the exact Source inventory", (context) => {
  const root = fixture(context);
  const project = path.join(root, "chatgpt-project");
  const replacements = new Map([
    ["https://github.com/<owner>/<repository>", "https://github.com/example/example"],
    ["<owner>/<repository>", "example/example"],
    ["<bridge-control-label>", "agentic-bridge"],
    ["<bridge-bot-login>", "example-bridge[bot]"],
  ]);
  for (const file of readdirSync(project).filter((name) => name.endsWith(".md"))) {
    const target = path.join(project, file);
    let text = readFileSync(target, "utf8");
    for (const [before, after] of replacements) text = text.replaceAll(before, after);
    writeFileSync(target, text);
    assert.doesNotMatch(text, /<(?:owner\/repository|bridge-control-label|bridge-bot-login)>/);
  }
  const installed = readdirSync(project).filter((name) => name.startsWith("skill-")).sort();
  assert.deepEqual(installed, [
    "skill-mcp-off-scouting.md",
    "skill-mcp-off-workflow.md",
    "skill-mcp-on-finalization.md",
    "skill-mcp-on-promotion.md",
    "skill-mcp-on-recovery.md",
    "skill-mcp-on-scouting.md",
    "skill-mcp-on-workflow.md",
    "skill-shared-safety-and-authority.md",
  ]);
});

test("task-specific routing continuity remains valid after a normal delegation", (context) => {
  const root = fixture(context);
  writeFileSync(path.join(root, "agent-routing", "TASK-001.md"), [
    "# Agent routing: TASK-001",
    "",
    "- Task ID: TASK-001",
    "- Date: 2026-08-13",
    "- Relevant repository reference: developer 0000000000000000000000000000000000000000",
    "- Bridge route reference: pending",
    "- Selected developer: Luna",
    "- Luna substantive-attempt count: 0",
    "- Selection route: default Luna",
    "- Reason: bounded implementation",
    "",
    "## Result",
    "",
    "Pending.",
    "",
  ].join("\n"));
  const result = run(root);
  assert.equal(result.status, 0, result.stderr);
});

test("validator rejects non-task entries in routing continuity", (context) => {
  const root = fixture(context);
  writeFileSync(path.join(root, "agent-routing", "state.json"), "{}\n");
  const result = run(root);
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /invalid task record entry/);
});

test("validator rejects stale or additional Source inventory", (context) => {
  const root = fixture(context);
  writeFileSync(path.join(root, "chatgpt-project", "skill-mcp-on-obsolete.md"), "# Obsolete\n\n## Trigger\n\nNever.\n");
  const result = run(root);
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /Project package inventory differs/);
});

test("validator rejects MCP-ON mechanics in MCP-OFF procedure", (context) => {
  const root = fixture(context);
  const target = path.join(root, "chatgpt-project", "skill-mcp-off-scouting.md");
  writeFileSync(target, `${readFileSync(target, "utf8")}\nUse scout.start here.\n`);
  const result = run(root);
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /MCP-OFF procedures contain unavailable MCP-ON mechanic/);
});

test("validator rejects high-stakes direct-inspection drift", (context) => {
  const root = fixture(context);
  replace(
    root,
    "chatgpt-project/skill-mcp-on-scouting.md",
    "directly inspect every",
    "sample",
  );
  const result = run(root);
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /high-stakes compact task/);
});

test("validator rejects detailed bridge procedure in permanent router", (context) => {
  const root = fixture(context);
  const target = path.join(root, "chatgpt-project", "developer-instructions.md");
  writeFileSync(target, `${readFileSync(target, "utf8")}\nUse command.status for recovery.\n`);
  const result = run(root);
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /Permanent instructions contain detailed procedure/);
});

test("validator rejects stale Source references", (context) => {
  const root = fixture(context);
  const target = path.join(root, "chatgpt-project", "README.md");
  writeFileSync(target, `${readFileSync(target, "utf8")}\nLoad \`skill-mcp-on-old-review.md\`.\n`);
  const result = run(root);
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /stale\/unknown Project Source reference/);
});

test("validator rejects lost-result no-replay drift", (context) => {
  const root = fixture(context);
  replace(
    root,
    "chatgpt-project/skill-mcp-on-recovery.md",
    "Never automatically retry",
    "Automatically retry",
  );
  const result = run(root);
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /lost command result/);
});

test("validator rejects closed-envelope placement drift", (context) => {
  const root = fixture(context);
  replace(
    root,
    "chatgpt-project/skill-mcp-on-workflow.md",
    "top-level peer of `arguments`, never its child",
    "child of `arguments`",
  );
  const result = run(root);
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /top-level peer of `arguments`/);
});

test("validator rejects a separate Scout SHA field instruction", (context) => {
  const root = fixture(context);
  replace(
    root,
    "chatgpt-project/skill-mcp-on-scouting.md",
    "never add a separate `sha`",
    "add a separate `sha`",
  );
  const result = run(root);
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /never add a separate `sha`/);
});

test("validator rejects unconditional blocking of a discovered control issue", (context) => {
  const root = fixture(context);
  const target = path.join(root, "chatgpt-project", "skill-mcp-on-recovery.md");
  writeFileSync(target, `${readFileSync(target, "utf8")}\nAny open control issue must always block new work.\n`);
  const result = run(root);
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /unconditional open-issue blocking/);
});

test("standalone validator is executable with the current Node runtime", () => {
  const output = execFileSync(process.execPath, [path.join(source, "validate-package.mjs")], {
    cwd: path.dirname(source),
    encoding: "utf8",
  });
  assert.match(output, /Orchestration package validation passed/);
});
