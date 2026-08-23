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

test("Dual exposes a review-only lead and one Spark subagent", () => {
  const lead = frontmatter(read(".opencode/agents/lead-developer.md"));
  const spark = frontmatter(read(".opencode/agents/spark-implementer.md"));

  assert.match(lead, /^mode: primary$/m);
  assert.match(lead, /^  edit: deny$/m);
  assert.match(lead, /^    spark-implementer: allow$/m);
  assert.match(spark, /^mode: subagent$/m);
  assert.match(spark, /^  task: deny$/m);
});

test("Dual is opt-in while the existing default route remains unchanged", () => {
  const config = JSON.parse(read("opencode.json"));
  assert.equal(config.default_agent, "small-developer");
  assert.equal(config.share, "disabled");
});
