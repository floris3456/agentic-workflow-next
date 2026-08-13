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

test("current seven-Source package passes structural and canonical safety validation", (context) => {
  const result = run(fixture(context));
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /7 exact Project Sources/);
  assert.match(result.stdout, /5 parsed bridge envelopes/);
  assert.match(result.stdout, /integrated task-context routing/);
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
  assert.deepEqual(readdirSync(project).filter((name) => name.startsWith("skill-")).sort(), [
    "skill-mcp-off-scouting.md",
    "skill-mcp-off-workflow.md",
    "skill-mcp-on-finalization.md",
    "skill-mcp-on-promotion.md",
    "skill-mcp-on-recovery.md",
    "skill-mcp-on-scouting.md",
    "skill-mcp-on-workflow.md",
  ]);
});

test("one task context carries routing continuity for a normal delegation", (context) => {
  const root = fixture(context);
  writeFileSync(path.join(root, "task-context", "TASK-001.md"), [
    "# Task context: TASK-001",
    "",
    "- Task ID: TASK-001",
    "- Related control issues: none",
    "- Highest accepted bridge sequence: none",
    "",
    "## Routing",
    "",
    "- Selected developer: Luna",
    "- Luna substantive-attempt count: 0",
    "- Selection route: default Luna",
    "- Reason: bounded implementation",
    "- Attempt classifications: none",
    "- Route changes: none",
    "- Result: pending",
    "- Retrospective: pending",
    "",
  ].join("\n"));
  const result = run(root);
  assert.equal(result.status, 0, result.stderr);
});

test("validator rejects non-task entries in continuity", (context) => {
  const root = fixture(context);
  writeFileSync(path.join(root, "task-context", "state.json"), "{}\n");
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

test("validator rejects explicit uncertain-mutation replay", (context) => {
  const root = fixture(context);
  replace(root, "chatgpt-project/skill-mcp-on-recovery.md", "Never automatically retry", "Automatically retry");
  const result = run(root);
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /no-replay rule/);
});

test("validator rejects connector refusal as bridge evidence", (context) => {
  const root = fixture(context);
  replace(
    root,
    "chatgpt-project/skill-mcp-on-recovery.md",
    "A ChatGPT/tool connector refusal is not a bridge disposition",
    "A connector refusal is a bridge rejection",
  );
  const result = run(root);
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /connector-refusal distinction|connector refusal as bridge evidence/);
});

test("validator rejects an extra command-envelope field regardless of prose", (context) => {
  const root = fixture(context);
  replace(
    root,
    "chatgpt-project/skill-mcp-on-workflow.md",
    ',"expected":{"developer_sha"',
    ',"extra":true,"expected":{"developer_sha"',
  );
  const result = run(root);
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /incorrect top-level fields/);
});

test("validator rejects an extra Scout SHA field in the actual marker", (context) => {
  const root = fixture(context);
  replace(
    root,
    "chatgpt-project/skill-mcp-on-scouting.md",
    ',"scope":"tools/opencode-bridge/src and tests"',
    ',"sha":"0000000000000000000000000000000000000000","scope":"tools/opencode-bridge/src and tests"',
  );
  const result = run(root);
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /scout.start example lacks focused exact-ref arguments/);
});

test("validator rejects unconditional blocking of every discovered control issue", (context) => {
  const root = fixture(context);
  const target = path.join(root, "chatgpt-project", "skill-mcp-on-recovery.md");
  writeFileSync(target, `${readFileSync(target, "utf8")}\nAny open control issue must always block new work.\n`);
  const result = run(root);
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /unconditional open-issue blocking/);
});

test("validator rejects loss of duplicate-task issue containment", (context) => {
  const root = fixture(context);
  replace(
    root,
    "chatgpt-project/skill-mcp-on-recovery.md",
    "One task ID has one canonical issue",
    "A task may use several replacement issues",
  );
  const result = run(root);
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /canonical duplicate-task issue containment/);
});

test("validator requires pending interactions to precede status commands", (context) => {
  const root = fixture(context);
  replace(
    root,
    "chatgpt-project/skill-mcp-on-workflow.md",
    "resolve the newest unmatched task-correlated",
    "ignore the newest unmatched task-correlated",
  );
  const result = run(root);
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /interaction-before-status rule/);
});

test("validator rejects high-stakes sample-only guidance", (context) => {
  const root = fixture(context);
  const target = path.join(root, "chatgpt-project", "skill-mcp-on-scouting.md");
  writeFileSync(target, `${readFileSync(target, "utf8")}\nFor high-stakes review, sample only.\n`);
  const result = run(root);
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /high-stakes evidence sampling/);
});

test("validator retains permanent human exact-SHA promotion authority", (context) => {
  const root = fixture(context);
  replace(
    root,
    "chatgpt-project/developer-instructions.md",
    "Promotion requires explicit",
    "Promotion does not require explicit",
  );
  const result = run(root);
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /human exact-SHA approval boundary/);
});

test("standalone validator is executable with the current Node runtime", () => {
  const output = execFileSync(process.execPath, [path.join(source, "validate-package.mjs")], {
    cwd: path.dirname(source),
    encoding: "utf8",
  });
  assert.match(output, /Orchestration package validation passed/);
});
