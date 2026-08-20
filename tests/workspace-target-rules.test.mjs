import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (relative) => fs.readFileSync(path.join(root, relative), "utf8");

test("workspace authority keeps applicable target constraints without authority transfer", () => {
  const rootInstructions = read("AGENTS.md");
  const skill = read(".opencode/skills/workspace-maintenance/SKILL.md");
  const templateSkill = read(".opencode/skills/template-maintenance/SKILL.md");

  assert.match(rootInstructions, /Target-branch instructions are still important evidence[\s\S]{0,900}file placement\/format[\s\S]{0,900}validation\/check requirements/i);
  assert.match(rootInstructions, /does not transfer instruction authority[\s\S]{0,700}target task\s+lifecycle[\s\S]{0,700}target handoff shape/i);
  assert.match(skill, /target evidence and compatibility\/output\s+constraints[\s\S]{0,900}durable AS-BUILT\/deviation truth[\s\S]{0,900}validation\/check\s+requirements/i);
  assert.match(templateSkill, /When the selected route is Workspace Maintenance[\s\S]{0,900}do not inherit the target\s+branch's agent\/task\/handoff procedure/i);
  assert.doesNotMatch(templateSkill, /Follow each source branch's own agent instructions[\s\S]{0,200}regardless of execution\s+route/i);
});

test("workspace target-rule examples preserve missing-file compatibility and authorized rule changes", () => {
  const skill = read(".opencode/skills/workspace-maintenance/SKILL.md");
  const design = read("docs/design/template-maintenance-workflow.md");

  assert.match(skill, /Add a missing file[\s\S]{0,700}placement[\s\S]{0,700}validation requirements/i);
  assert.match(skill, /Change the rule that governs file creation[\s\S]{0,800}old rule[\s\S]{0,800}not authority to prohibit/i);
  assert.match(design, /Adding a missing file[\s\S]{0,700}placement[\s\S]{0,700}validation/i);
  assert.match(design, /Changing the rule for file creation[\s\S]{0,700}old rule is\s+evidence[\s\S]{0,700}not authority to block/i);
});

test("workspace publication has one workspace handoff and no inherited developer handoff", () => {
  const skill = read(".opencode/skills/workspace-maintenance/SKILL.md");
  const templateSkill = read(".opencode/skills/template-maintenance/SKILL.md");
  const smallAgent = read(".opencode/agents/small-workspace-maintainer.md");
  const heavyAgent = read(".opencode/agents/workspace-maintainer.md");

  assert.match(skill, /A Workspace handoff is the only agent handoff[\s\S]{0,700}does not require a second developer-agent\s+handoff/i);
  assert.match(templateSkill, /changing a target branch does not create a second\s+handoff obligation/i);
  for (const agent of [smallAgent, heavyAgent]) {
    assert.match(agent, /completion contract is owned by `workspace-maintenance`[\s\S]{0,400}do not inherit a\s+developer-specific handoff/i);
    assert.match(agent, /target task lifecycle[\s\S]{0,300}target handoff shape do not automatically\s+transfer/i);
  }
});
