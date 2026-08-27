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

function filePath(target, relative) {
  return path.join(target, ...relative.split("/"));
}

function replace(target, relative, from, to) {
  const file = filePath(target, relative);
  const text = fs.readFileSync(file, "utf8");
  assert.ok(text.includes(from), `${relative} fixture source not found: ${from}`);
  fs.writeFileSync(file, text.replace(from, to));
}

function expectFailure(mutator, pattern) {
  const result = withCopy(mutator);
  assert.notEqual(result.status, 0, `validator unexpectedly passed\nstdout: ${result.stdout}\nstderr: ${result.stderr}`);
  if (pattern) assert.match(result.stderr, pattern);
}

test("canonical package validates with simplified architecture checks", () => {
  const result = runValidator();
  assert.equal(result.status, 0, `stdout: ${result.stdout}\nstderr: ${result.stderr}`);
  assert.match(result.stdout, /exact package inventories/);
  assert.match(result.stdout, /5 routed Project Sources/);
  assert.match(result.stdout, /flexible public-safe task history/);
  assert.match(result.stdout, /no-replay\/human exact-SHA promotion guards/);
});

test("canonical push CI is read-only except exact-SHA status reporting", () => {
  const workflow = fs.readFileSync(path.join(root, "..", ".github", "workflows", "validate-orchestration.yml"), "utf8");
  assert.match(workflow, /push:\s*\n\s+branches:\s*\[orchestration\]/);
  assert.match(workflow, /permissions:\s*\n\s+contents:\s+read\s*\n\s+statuses:\s+write/);
  assert.match(workflow, /persist-credentials:\s*false/);
  assert.match(workflow, /run:\s+node validate-orchestration\.mjs/);
  assert.match(workflow, /run:\s+node --test\s*(?:\n|$)/);
  assert.match(workflow, /Publish exact-SHA validation status/);
  assert.match(workflow, /always\(\) && github\.event_name == 'push'/);
  assert.match(workflow, /agentic-template\/validate-orchestration/);
  assert.match(workflow, /statuses\/\$\{GITHUB_SHA\}/);
  assert.match(workflow, /Authorization: Bearer \$\{GH_STATUS_TOKEN\}/);
  assert.match(workflow, /actions\/runs\/\$\{\{ github\.run_id \}\}/);
  assert.doesNotMatch(workflow, /contents:\s*write/);
  assert.doesNotMatch(workflow, /\bsecrets\./);
});

test("rejects package inventory drift", () => {
  expectFailure((target) => {
    fs.writeFileSync(path.join(target, "unexpected.md"), "# Unexpected\n");
  }, /web-orchestration-only root inventory differs/);
});

test("rejects Project Source inventory drift", () => {
  expectFailure((target) => {
    fs.writeFileSync(path.join(target, "chatgpt-project", "skill-obsolete.md"), "# Obsolete\n\n## Trigger\n");
  }, /Project package inventory differs/);
});

test("rejects a non-regular required file", () => {
  expectFailure((target) => {
    const file = path.join(target, "chatgpt-project", "skill-recovery.md");
    fs.rmSync(file);
    fs.mkdirSync(file);
  }, /Required path is not a regular file/);
});

test("rejects NUL bytes", () => {
  expectFailure((target) => {
    fs.writeFileSync(path.join(target, "task-context", "NUL.md"), Buffer.from("# Broken\0\n"));
  }, /contains NUL bytes: task-context\/NUL\.md/);
});

test("rejects invalid UTF-8", () => {
  expectFailure((target) => {
    fs.writeFileSync(path.join(target, "task-context", "UTF8.md"), Buffer.from([0x23, 0x20, 0xc3, 0x28, 0x0a]));
  }, /is not valid UTF-8: task-context\/UTF8\.md/);
});

test("rejects blank text", () => {
  expectFailure((target) => {
    fs.writeFileSync(path.join(target, "task-context", "BLANK.md"), " \n\t\n");
  }, /is blank: task-context\/BLANK\.md/);
});

test("accepts historical task records without retired schema enforcement", () => {
  const result = withCopy((target) => {
    fs.writeFileSync(path.join(target, "task-context", "HISTORY-001.md"), "# Historical note\n\nThis record predates the current task template.\n");
  });
  assert.equal(result.status, 0, `stdout: ${result.stdout}\nstderr: ${result.stderr}`);
});

test("accepts a separate concise task-progress record", () => {
  const result = withCopy((target) => {
    fs.writeFileSync(path.join(target, "task-context", "TASK-001-progress.md"), "# Task progress: TASK-001\n\n## Current position\n\nImplementation is under review.\n");
  });
  assert.equal(result.status, 0, `stdout: ${result.stdout}\nstderr: ${result.stderr}`);
});

test("rejects invalid task-context entries", () => {
  expectFailure((target) => {
    fs.writeFileSync(path.join(target, "task-context", "not markdown.txt"), "not allowed\n");
  }, /invalid Markdown entry/);
});

test("rejects a missing routed Source and an unknown routed Source", () => {
  expectFailure((target) => {
    replace(target, "chatgpt-project/developer-instructions.md", "| Human asks for a ready-to-use prompt or prompt package for another execution context | `skill-prompt-creation.md` |\n", "");
  }, /exactly one trigger row/);
  expectFailure((target) => {
    replace(target, "chatgpt-project/developer-instructions.md", "`skill-prompt-creation.md`", "`skill-unknown.md`");
  }, /(?:unknown Project Source|exactly one trigger row)/);
});

test("rejects a skill without basic title or Trigger structure", () => {
  expectFailure((target) => {
    replace(target, "chatgpt-project/skill-workflow.md", "# Web orchestration workflow", "Web orchestration workflow");
  }, /must begin with a Markdown title/);
  expectFailure((target) => {
    replace(target, "chatgpt-project/skill-recovery.md", "## Trigger", "## Use");
  }, /must declare a Trigger section/);
});

test("rejects an incomplete installation Source inventory", () => {
  expectFailure((target) => {
    replace(target, "chatgpt-project/README.md", "   - `skill-recovery.md`\n", "");
  }, /Installation inventory must name skill-recovery\.md exactly once/);
});

test("rejects missing deterministic rendering placeholders", () => {
  expectFailure((target) => {
    const file = path.join(target, "chatgpt-project", "README.md");
    const text = fs.readFileSync(file, "utf8");
    fs.writeFileSync(file, text.replaceAll("https://github.com/<owner>/<repository>", "https://github.com/example/rendered-repository"));
  }, /chatgpt-project\/README\.md is missing required render placeholder/);
  expectFailure((target) => {
    replace(target, "chatgpt-project/developer-instructions.md", "<owner>/<repository>", "example/rendered-repository");
  }, /chatgpt-project\/developer-instructions\.md is missing required render placeholder/);
});

test("rejects current task template section loss and progress mixing", () => {
  expectFailure((target) => {
    replace(target, "task-context/TEMPLATE.md", "## Required checks", "## Verification");
  }, /exactly one Required checks section/);
  expectFailure((target) => {
    replace(target, "task-context/TEMPLATE.md", "## Explicit exceptions", "## Current position\n\n<pending>\n\n## Explicit exceptions");
  }, /keep task-progress state separate/);
});

test("rejects loss of historical truth and task-progress separation", () => {
  expectFailure((target) => {
    const file = path.join(target, "task-context", "README.md");
    const text = fs.readFileSync(file, "utf8");
    fs.writeFileSync(file, text.replace(/\nHistorical records[\s\S]*$/, "\nHistorical files should be normalized to the current schema.\n"));
  }, /separate task progress from authority and preserve historical truth/);
});

test("rejects loss of the public-persistence safety boundary", () => {
  expectFailure((target) => {
    const file = path.join(target, "chatgpt-project", "developer-instructions.md");
    const text = fs.readFileSync(file, "utf8");
    fs.writeFileSync(file, text.replace(/Anything persisted to GitHub is public\.[\s\S]*?host-local absolute paths\.\n/, "Repository content may be persisted as needed.\n"));
  }, /Permanent instructions must retain the public-persistence safety boundary/);
});

test("rejects public-unsafe content in dynamic task context", () => {
  expectFailure((target) => {
    const hostPath = "/ho" + "me/alice/private-repository/";
    fs.writeFileSync(path.join(target, "task-context", "UNSAFE-001.md"), `# Note\n\nWorkspace: ${hostPath}\n`);
  }, /task-context\/UNSAFE-001\.md contains a host-local absolute path/);
  expectFailure((target) => {
    fs.writeFileSync(path.join(target, "task-context", "TOKEN-001.md"), `# Note\n\nToken: ghp_${"a".repeat(24)}\n`);
  }, /task-context\/TOKEN-001\.md contains a credential-like token/);
});

test("rejects loss of uncertain-mutation no-replay", () => {
  expectFailure((target) => {
    replace(target, "chatgpt-project/skill-recovery.md", "Never automatically replay an uncertain mutation.", "Automatically replay an uncertain mutation.");
  }, /prohibit automatic replay of uncertain mutations/);
});

test("rejects loss of human exact-SHA permanent authority", () => {
  expectFailure((target) => {
    replace(target, "chatgpt-project/developer-instructions.md", "Only the human may approve one exact reviewed `developer` SHA", "Automation may approve one reviewed `developer` SHA");
  }, /human exact-SHA approval/);
});

test("rejects weakened promotion trigger, opportunistic content, or replay safety", () => {
  expectFailure((target) => {
    replace(target, "chatgpt-project/skill-promotion.md", "human explicitly approves one exact `developer` SHA that has\nbeen fully reviewed", "automation selects a reviewed `developer` SHA");
  }, /explicit human exact developer SHA trigger/);
  expectFailure((target) => {
    replace(target, "chatgpt-project/skill-promotion.md", "Do not add opportunistic content.\nDo not add cleanup, formatting, refactoring, fixes, or generated changes.", "Add useful cleanup and opportunistic content.");
  }, /prohibit opportunistic content and automatic replay/);
  expectFailure((target) => {
    replace(target, "chatgpt-project/skill-promotion.md", "Never automatically replay promotion.", "Automatically replay promotion after a failure.");
  }, /prohibit opportunistic content and automatic replay/);
});
