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

function replacePattern(target, relative, pattern, replacement) {
  const file = filePath(target, relative);
  const text = fs.readFileSync(file, "utf8");
  assert.match(text, pattern, `${relative} fixture source not found`);
  fs.writeFileSync(file, text.replace(pattern, replacement));
}

function expectFailure(mutator, pattern) {
  const result = withCopy(mutator);
  assert.notEqual(result.status, 0, `validator unexpectedly passed\nstdout: ${result.stdout}\nstderr: ${result.stderr}`);
  if (pattern) assert.match(result.stderr, pattern);
}

test("canonical package validates", () => {
  const result = runValidator();
  assert.equal(result.status, 0, `stdout: ${result.stdout}\nstderr: ${result.stderr}`);
  assert.match(result.stdout, /5 routed Sources/);
  assert.match(result.stdout, /unified maintenance routing/);
  assert.match(result.stdout, /future Web\/Local design/);
});

test("push CI is read-only except exact-SHA status reporting", () => {
  const workflow = fs.readFileSync(path.join(root, "..", ".github", "workflows", "validate-web-orchestration.yml"), "utf8");
  assert.match(workflow, /push:\s*\n\s+branches:\s*\[web-orchestration\]/);
  assert.match(workflow, /permissions:\s*\n\s+contents:\s+read\s*\n\s+statuses:\s+write/);
  assert.match(workflow, /persist-credentials:\s*false/);
  assert.match(workflow, /node web-orchestration-only\/validate-package\.mjs/);
  assert.match(workflow, /run:\s+node --test\s*(?:\n|$)/);
  assert.match(workflow, /statuses\/\$\{GITHUB_SHA\}/);
  assert.doesNotMatch(workflow, /contents:\s*write/);
  assert.doesNotMatch(workflow, /\bsecrets\./);
});

test("rejects root or Project Source inventory drift", () => {
  expectFailure((target) => {
    fs.writeFileSync(path.join(target, "unexpected.md"), "# Unexpected\n");
  }, /root inventory differs/);
  expectFailure((target) => {
    fs.writeFileSync(path.join(target, "chatgpt-project", "skill-obsolete.md"), "# Obsolete\n\n## Trigger\n");
  }, /Project package inventory differs/);
});

test("rejects non-regular, NUL, invalid UTF-8, and blank files", () => {
  expectFailure((target) => {
    const file = path.join(target, "chatgpt-project", "skill-recovery.md");
    fs.rmSync(file);
    fs.mkdirSync(file);
  }, /not a regular file/);
  expectFailure((target) => {
    fs.writeFileSync(path.join(target, "task-context", "NUL.md"), Buffer.from("# Broken\0\n"));
  }, /contains NUL bytes/);
  expectFailure((target) => {
    fs.writeFileSync(path.join(target, "task-context", "UTF8.md"), Buffer.from([0x23, 0x20, 0xc3, 0x28, 0x0a]));
  }, /not valid UTF-8/);
  expectFailure((target) => {
    fs.writeFileSync(path.join(target, "task-context", "BLANK.md"), " \n\t\n");
  }, /is blank/);
});

test("accepts preserved historical records and separate concise progress", () => {
  const historical = withCopy((target) => {
    fs.writeFileSync(path.join(target, "task-context", "HISTORY-001.md"), "# Historical note\n\nOld public evidence.\n");
  });
  assert.equal(historical.status, 0, historical.stderr);

  const progress = withCopy((target) => {
    fs.writeFileSync(
      path.join(target, "task-context", "TASK-001-progress.md"),
      "# Task progress: TASK-001\n\n## Current position\n\nImplementation is under review.\n",
    );
  });
  assert.equal(progress.status, 0, progress.stderr);
});

test("rejects invalid task-context entries and task-template progress mixing", () => {
  expectFailure((target) => {
    fs.writeFileSync(path.join(target, "task-context", "not markdown.txt"), "not allowed\n");
  }, /invalid Markdown entry/);
  expectFailure((target) => {
    replacePattern(target, "task-context/TEMPLATE.md", /^## Required checks$/m, "## Verification");
  }, /exactly one Required checks section/);
  expectFailure((target) => {
    replacePattern(
      target,
      "task-context/TEMPLATE.md",
      /^## Explicit exceptions$/m,
      "## Current position\n\n<pending>\n\n## Explicit exceptions",
    );
  }, /keep task-progress state separate/);
});

test("rejects router and Source structure drift", () => {
  expectFailure((target) => {
    replacePattern(
      target,
      "chatgpt-project/developer-instructions.md",
      /^\| The human asks for a ready-to-use prompt[^\n]+\n/m,
      "",
    );
  }, /exactly one trigger row/);
  expectFailure((target) => {
    replacePattern(target, "chatgpt-project/skill-workflow.md", /^# Web orchestration workflow$/m, "Web orchestration workflow");
  }, /must begin with a Markdown title/);
  expectFailure((target) => {
    replacePattern(target, "chatgpt-project/skill-recovery.md", /^## Trigger$/m, "## Use");
  }, /must declare a Trigger section/);
});

test("rejects incomplete installation inventory or render placeholders", () => {
  expectFailure((target) => {
    replacePattern(target, "chatgpt-project/README.md", /^\s+- `skill-recovery\.md`\n/m, "");
  }, /Installation inventory must name skill-recovery\.md exactly once/);
  expectFailure((target) => {
    const file = path.join(target, "chatgpt-project", "README.md");
    const text = fs.readFileSync(file, "utf8");
    fs.writeFileSync(file, text.replaceAll("https://github.com/<owner>/<repository>", "https://github.com/example/rendered"));
  }, /missing required render placeholder/);
});

test("rejects loss of public persistence and unsafe dynamic context", () => {
  expectFailure((target) => {
    replacePattern(
      target,
      "chatgpt-project/developer-instructions.md",
      /Anything persisted to GitHub is public\.[\s\S]*?runtime\nidentifiers\./,
      "Repository content may be persisted as needed.",
    );
  }, /public-persistence safety boundary/);
  expectFailure((target) => {
    const hostPath = "/ho" + "me/alice/private-repository/";
    fs.writeFileSync(path.join(target, "task-context", "UNSAFE.md"), `# Note\n\nWorkspace: ${hostPath}\n`);
  }, /host-local absolute path/);
  expectFailure((target) => {
    fs.writeFileSync(path.join(target, "task-context", "TOKEN.md"), `# Note\n\nToken: ghp_${"a".repeat(24)}\n`);
  }, /credential-like token/);
});

test("rejects weakened one-route, context, or uncertain-mutation guards", () => {
  expectFailure((target) => {
    replacePattern(target, "chatgpt-project/developer-instructions.md", /Run one mutating route at a time\./, "Run any useful mutating routes.");
  }, /one-route, no-replay, and 5,000-token/);
  expectFailure((target) => {
    replacePattern(target, "chatgpt-project/developer-instructions.md", /5,000 raw chat tokens/, "an automatic summary");
  }, /one-route, no-replay, and 5,000-token/);
  expectFailure((target) => {
    replacePattern(target, "chatgpt-project/skill-recovery.md", /Do not repeat the operation/, "Repeat the operation");
  }, /prohibit replay/);
});

test("rejects obsolete split-maintenance or Dual handoff residue", () => {
  for (const residue of [
    "template-maintainer",
    "small-workspace-maintainer",
    "workspace-maintainer",
    "proposed-deviations.md",
    "full uncommitted diff",
    "MCP-ON",
    "MCP-OFF",
  ]) {
    expectFailure((target) => {
      fs.appendFileSync(path.join(target, "chatgpt-project", "skill-workflow.md"), `\nLegacy: ${residue}\n`);
    }, /obsolete workflow residue/);
  }
});

test("rejects weakened unified maintenance routing", () => {
  expectFailure((target) => {
    replacePattern(target, "chatgpt-project/skill-maintenance.md", /`heavy-maintainer`/g, "`separate-maintainer`");
  }, /one role at two capacities/);
  expectFailure((target) => {
    replacePattern(
      target,
      "chatgpt-project/skill-maintenance.md",
      /`main` is never a maintenance mutation target\./,
      "`main` may be maintained directly.",
    );
  }, /keep main outside maintenance mutation/);
});

test("rejects weakened Dual ownership and prompt evidence roles", () => {
  expectFailure((target) => {
    replacePattern(target, "chatgpt-project/skill-workflow.md", /Lead is the developer brain/, "Web is the developer brain");
  }, /rely on Lead as developer brain/);
  expectFailure((target) => {
    replacePattern(target, "chatgpt-project/skill-prompt-creation.md", /\*\*Interpretation:\*\*/, "**Conclusion:**");
  }, /preserve destination capabilities and evidence roles/);
});

test("rejects weakened human exact-SHA promotion", () => {
  expectFailure((target) => {
    replacePattern(
      target,
      "chatgpt-project/skill-promotion.md",
      /human explicitly approves one exact, fully reviewed final\n`developer` SHA/,
      "automation selects a reviewed developer revision",
    );
  }, /explicit human exact developer SHA trigger/);
  expectFailure((target) => {
    replacePattern(
      target,
      "chatgpt-project/skill-promotion.md",
      /Do not add cleanup,[\s\S]*?opportunistic content\./,
      "Add useful cleanup and opportunistic content.",
    );
  }, /prohibit opportunistic content and automatic replay/);
  expectFailure((target) => {
    replacePattern(target, "chatgpt-project/skill-promotion.md", /Never automatically replay promotion\./, "Automatically replay promotion.");
  }, /prohibit opportunistic content and automatic replay/);
});

test("future orchestration design remains explicit and non-runtime", () => {
  expectFailure((target) => {
    replacePattern(target, "ORCHESTRATION-EVOLUTION.md", /not implemented runtime architecture/, "the implemented runtime architecture");
  }, /remain non-runtime/);
  expectFailure((target) => {
    replacePattern(target, "ORCHESTRATION-EVOLUTION.md", /### Local/, "### Desktop");
  }, /Web\/Local capability profiles/);
});
