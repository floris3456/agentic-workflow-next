import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import test from "node:test";

test("developer OpenCode keeps in-worktree defaults and asks for genuine external paths", () => {
  const config = JSON.parse(readFileSync(resolve(import.meta.dirname, "../../../../opencode.json"), "utf8")) as {
    permission?: Record<string, unknown>;
  };
  assert.equal(config.permission?.external_directory, "ask");
  assert.equal(config.permission?.read, undefined);
  assert.equal(config.permission?.edit, undefined);
  assert.equal(config.permission?.bash, undefined);
  assert.notEqual(config.permission?.external_directory, "allow");
});

test("small developer guidance rejects parent-walk scope widening", () => {
  const prompt = readFileSync(resolve(import.meta.dirname, "../../../../.opencode/agents/small-developer.md"), "utf8");
  assert.match(prompt, /repository-relative paths/);
  assert.match(prompt, /exact current `cwd`\/repository root/);
  assert.match(prompt, /never reconstruct[\s\S]*retype the checkout basename/);
  assert.match(prompt, /parent or sibling directories/);
  assert.match(prompt, /widen the task/);
  assert.match(prompt, /external_directory[\s\S]*approval/);
  assert.doesNotMatch(prompt, /external_directory.*allow/);
});
