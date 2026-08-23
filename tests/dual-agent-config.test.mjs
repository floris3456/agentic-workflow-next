import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (relative) => fs.readFileSync(path.join(root, relative), "utf8");

function frontmatter(text) {
  const match = text.match(/^---\n([\s\S]*?)\n---\n/);
  assert.ok(match, "agent definition must have frontmatter");
  return match[1];
}

function extractBlock(text, key) {
  const lines = text.split("\n");
  const index = lines.findIndex((line) => line.trim() === `${key}:`);
  assert.notEqual(index, -1, `missing key: ${key}`);
  const keyIndent = lines[index].match(/^\s*/)[0].length;
  const block = [];
  for (let i = index + 1; i < lines.length; i++) {
    const line = lines[i];
    if (!line.trim()) continue;
    const lineIndent = line.match(/^\s*/)[0].length;
    if (lineIndent <= keyIndent) break;
    block.push(line.trim());
  }
  return block.join("\n");
}

test("Dual exposes a review-only lead and one Spark subagent", () => {
  const lead = frontmatter(read(".opencode/agents/lead-developer.md"));
  const spark = frontmatter(read(".opencode/agents/spark-implementer.md"));

  assert.match(lead, /^mode: primary$/m);
  assert.match(lead, /^model: openai\/gpt-5\.6-sol$/m);
  assert.match(lead, /^  edit: deny$/m);
  assert.equal(extractBlock(lead, "task"), '"*": deny\nspark-implementer: allow');

  assert.match(spark, /^mode: subagent$/m);
  assert.match(spark, /^model: openai\/gpt-5\.3-codex-spark$/m);
  assert.match(spark, /^  edit: allow$/m);
  assert.match(spark, /^  task: deny$/m);
  assert.match(spark, /^  external_directory: deny$/m);
  assert.doesNotMatch(spark, /^  external_directory: ask$/m);
});

test("Dual is opt-in while the existing default route remains unchanged", () => {
  const config = JSON.parse(read("opencode.json"));
  assert.equal(config.default_agent, "small-developer");
  assert.equal(config.share, "disabled");
});
