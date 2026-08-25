import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const resolve = (relative) => path.join(root, relative);
const read = (relative) => fs.readFileSync(resolve(relative), "utf8");

function scalar(value) {
  const trimmed = value.trim();
  if (trimmed === "") return {};
  if (trimmed === "true") return true;
  if (trimmed === "false") return false;
  if (trimmed === "null") return null;
  if (/^-?\d+(?:\.\d+)?$/.test(trimmed)) return Number(trimmed);
  if ((trimmed.startsWith('"') && trimmed.endsWith('"'))
    || (trimmed.startsWith("'") && trimmed.endsWith("'"))) {
    return trimmed.slice(1, -1);
  }
  return trimmed;
}

function frontmatter(relative) {
  const match = read(relative).match(/^---\n([\s\S]*?)\n---(?:\n|$)/);
  assert.ok(match, `${relative} must have frontmatter`);

  const document = {};
  const stack = [{ indent: -1, value: document }];
  for (const line of match[1].split("\n")) {
    if (!line.trim() || line.trimStart().startsWith("#")) continue;
    const parsed = line.match(/^(\s*)([^:]+):(?:\s*(.*))?$/);
    assert.ok(parsed, `${relative} has unsupported frontmatter line: ${line.trim()}`);
    const indent = parsed[1].length;
    const key = parsed[2].trim().replace(/^(?:"([\s\S]*)"|'([\s\S]*)')$/, "$1$2");
    while (stack.at(-1).indent >= indent) stack.pop();
    const parent = stack.at(-1).value;
    const value = scalar(parsed[3] ?? "");
    parent[key] = value;
    if (value && typeof value === "object") stack.push({ indent, value });
  }
  return document;
}

test("Dual permissions preserve lead review and Spark-only implementation boundaries", () => {
  const lead = frontmatter(".opencode/agents/lead-developer.md");
  assert.equal(lead.mode, "primary");
  assert.equal(lead.model, "cliproxyapi/claude-opus-5#max");
  assert.equal(lead.permission.edit, "deny");
  assert.deepEqual(lead.permission.task, { "*": "deny", "spark-implementer": "allow" });
  assert.deepEqual(lead.permission.bash, {
    "*": "deny",
    "pwd": "allow",
    "ls *": "allow",
    "find *": "allow",
    "cat *": "allow",
    "sed -n *": "allow",
    "grep *": "allow",
    "rg *": "allow",
    "git status*": "allow",
    "git diff*": "allow",
    "git log*": "allow",
    "git show*": "allow",
    "git rev-parse*": "allow",
    "git ls-files*": "allow",
    "git grep*": "allow",
    "git ls-tree*": "allow",
    "node --test*": "allow",
    "npm test*": "allow",
    "npm run *": "allow",
    "bash scripts/validate-repository.sh": "allow",
  });

  const spark = frontmatter(".opencode/agents/spark-implementer.md");
  assert.equal(spark.mode, "subagent");
  assert.equal(spark.model, "openai/gpt-5.6-sol");
  assert.equal(spark.permission.edit, "allow");
  assert.equal(spark.permission.task, "deny");
  assert.equal(spark.permission.external_directory, "deny");
  assert.equal(spark.permission.question, "deny");
});

test("bounded primary routes are present and cannot delegate", () => {
  for (const [agentName, model] of [
    ["small-developer", "cliproxyapi/gemini-3.7-flash-high"],
    ["heavy-developer", "openai/gpt-5.6-sol"],
  ]) {
    const agent = frontmatter(`.opencode/agents/${agentName}.md`);
    assert.equal(agent.mode, "primary");
    assert.equal(agent.model, model);
    assert.equal(agent.permission.task, "deny");
    assert.equal(agent.permission.question, "deny");
  }
  assert.equal(fs.existsSync(resolve(".opencode/agents/large-developer.md")), false);
});

test("OpenCode defaults to Dual and disables sharing and compaction", () => {
  const config = JSON.parse(read("opencode.json"));
  assert.equal(config.default_agent, "lead-developer");
  assert.equal(config.share, "disabled");
  assert.deepEqual(config.permission, { task: "deny", external_directory: "ask" });
  assert.deepEqual(config.compaction, { auto: false, prune: false });
});
