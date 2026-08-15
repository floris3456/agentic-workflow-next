#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const suppliedRoot = process.argv[2];
const failures = [];

function fail(message) {
  failures.push(message);
}

function read(target, label = target) {
  try {
    return fs.readFileSync(target, "utf8");
  } catch (error) {
    fail(`Cannot read ${label}: ${error.message}`);
    return "";
  }
}

function parse(target, label = target) {
  try {
    return JSON.parse(read(target, label));
  } catch (error) {
    fail(`Cannot parse ${label}: ${error.message}`);
    return {};
  }
}

function markerValues(text, markerName, label) {
  const openCount = [...text.matchAll(new RegExp(`<!--\\s*${markerName}\\b`, "g"))].length;
  const complete = [...text.matchAll(new RegExp(`<!-- ${markerName}\\s*\\n([^\\n]+)\\n-->`, "g"))];
  if (openCount !== complete.length) fail(`${label} has incomplete or multiline ${markerName} JSON`);
  return complete.flatMap((match) => {
    try {
      return [JSON.parse(match[1])];
    } catch (error) {
      fail(`${label} has invalid ${markerName} JSON: ${error.message}`);
      return [];
    }
  });
}

function sameMembers(actual, expected) {
  return JSON.stringify([...actual].sort()) === JSON.stringify([...expected].sort());
}

function validateObjectShape(value, schema, label) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    fail(`${label} is not an object`);
    return;
  }
  const keys = Object.keys(value);
  const allowed = Object.keys(schema.properties ?? {});
  const required = schema.required ?? [];
  if (schema.additionalProperties === false && keys.some((key) => !allowed.includes(key))) {
    fail(`${label} contains a field outside the developer schema`);
  }
  for (const key of required) if (!(key in value)) fail(`${label} is missing required field ${key}`);
}

if (!suppliedRoot) {
  console.error("Usage: node scripts/validate-web-orchestrator-integration.mjs <web-orchestration-only-directory>");
  process.exit(2);
}

const webRoot = path.resolve(suppliedRoot);
const projectRoot = path.join(webRoot, "chatgpt-project");
const workflowPath = path.join(projectRoot, "skill-mcp-on-workflow.md");
const scoutingPath = path.join(projectRoot, "skill-mcp-on-scouting.md");
const recoveryPath = path.join(projectRoot, "skill-mcp-on-recovery.md");
const workflow = read(workflowPath, "MCP-ON workflow Source");
const scouting = read(scoutingPath, "MCP-ON scouting Source");
const recovery = read(recoveryPath, "MCP-ON recovery Source");

try {
  execFileSync(process.execPath, [path.join(webRoot, "validate-package.mjs")], {
    cwd: path.dirname(webRoot),
    encoding: "utf8",
    stdio: "pipe",
  });
} catch (error) {
  fail(`Independent Project package validator failed: ${String(error.stderr || error.message).trim()}`);
}

const commandSchema = parse(
  path.join(repositoryRoot, "contracts/opencode-bridge/command.schema.json"),
  "developer command schema",
);
const requestSchema = parse(
  path.join(repositoryRoot, "contracts/opencode-bridge/request.schema.json"),
  "developer request schema",
);
const resultSchema = parse(
  path.join(repositoryRoot, "contracts/opencode-bridge/result.schema.json"),
  "developer result schema",
);
const protocol = commandSchema.properties?.protocol?.const;

const commands = markerValues(workflow, "agentic-bridge-command", "MCP-ON workflow Source");
if (commands.length !== 1) fail(`Project package must contain one canonical command example; found ${commands.length}`);
for (const command of commands) {
  validateObjectShape(command, commandSchema, "Project command example");
  if (command.protocol !== protocol || command.sequence !== 1 || command.kind !== "start") {
    fail("Project command example does not match developer protocol/start/sequence-1 semantics");
  }
  if (!(new RegExp(commandSchema.properties?.command_id?.pattern ?? "a^")).test(command.command_id ?? "")) {
    fail("Project command example command_id does not match the developer schema");
  }
  if (!(new RegExp(commandSchema.properties?.expected?.properties?.developer_sha?.pattern ?? "a^")).test(command.expected?.developer_sha ?? "")
    || command.expected?.ref !== "developer") {
    fail("Project start example does not carry the developer exact-SHA/ref guard");
  }
  if (!sameMembers(Object.keys(command.arguments ?? {}), ["brief", "agent"])
    || !["luna", "sol"].includes(command.arguments?.agent)) {
    fail("Project start example arguments differ from the developer start contract");
  }
}

const requests = [
  ...markerValues(scouting, "agentic-bridge-request", "MCP-ON scouting Source"),
  ...markerValues(recovery, "agentic-bridge-request", "MCP-ON recovery Source"),
];
const expectedRequestKinds = requestSchema.properties?.kind?.enum ?? [];
if (!sameMembers(requests.map((request) => request.kind), expectedRequestKinds)) {
  fail("Project request examples and developer request-kind inventory differ");
}
for (const request of requests) {
  validateObjectShape(request, requestSchema, `Project ${request.kind} example`);
  if (request.protocol !== protocol || "sequence" in request) {
    fail(`Project ${request.kind} example is not on the sequence-free developer lane`);
  }
  if (!(new RegExp(requestSchema.properties?.request_id?.pattern ?? "a^")).test(request.request_id ?? "")) {
    fail(`Project ${request.kind} request_id does not match the developer schema`);
  }
  const branch = requestSchema.allOf?.find((entry) => entry.if?.properties?.kind?.const === request.kind);
  const argumentSchema = branch?.then?.properties?.arguments;
  if (!argumentSchema) {
    fail(`Developer schema has no argument contract for Project request ${request.kind}`);
    continue;
  }
  validateObjectShape(request.arguments, argumentSchema, `Project ${request.kind} arguments`);
  if (request.kind === "scout.start"
    && !(new RegExp(argumentSchema.properties?.ref?.pattern ?? "a^")).test(request.arguments?.ref ?? "")) {
    fail("Project Scout example ref does not match the developer exact-SHA contract");
  }
}

const responseTemplate = read(
  path.join(repositoryRoot, "docs/work/templates/developer-response-template.md"),
  "developer response template",
).trim();
if (workflow.split(responseTemplate).length - 1 !== 1) {
  fail("Project workflow and developer runtime do not share one exact six-field response contract");
}
for (const file of ["small-developer.md", "large-developer.md"]) {
  const agent = read(path.join(repositoryRoot, ".opencode/agents", file), file);
  if (!agent.includes(responseTemplate)) fail(`${file} is missing the cross-branch response contract`);
  if (!/\n\s*question:\s*allow\s*\n/.test(agent)) {
    fail(`${file} cannot produce a structured question for Project question.reply`);
  }
  for (const status of ["completed", "blocked", "failed", "needs decision"]) {
    if (!agent.includes(status)) fail(`${file} is missing developer status ${status}`);
  }
}

if (fs.existsSync(path.join(repositoryRoot, ".opencode/agents/repository-scout.md"))) {
  fail("Developer Scout trust contract must not be owned by the inspected repository ref");
}
const scoutSource = read(
  path.join(repositoryRoot, "tools/opencode-bridge/src/scout.ts"),
  "developer Scout boundary",
);
for (const term of ["Hardened Scout runtime is unavailable", "repository instructions", "package"] ) {
  if (!scoutSource.includes(term)) fail(`Developer Scout fail-closed boundary is missing ${term}`);
}
if (!scoutSource.includes('allowedTools = new Set(["read", "glob", "grep"])')
  || scoutSource.includes('"read", "glob", "grep", "lsp"')) {
  fail("Developer Scout boundary must exclude LSP");
}

const bridgeProtocol = read(
  path.join(repositoryRoot, "contracts/opencode-bridge/protocol.md"),
  "developer protocol documentation",
);

if (!/One task ID binds to exactly one issue/i.test(bridgeProtocol)
  || !/One task ID has one canonical issue/i.test(recovery)
  || !/post nothing on any later issue/i.test(recovery)) {
  fail("Developer protocol and Project recovery disagree on duplicate task-issue containment");
}

const handoffSource = read(
  path.join(repositoryRoot, "tools/opencode-bridge/src/handoff.ts"),
  "developer handoff transport",
);
for (const semanticField of ["Handoff developer SHA:", "Blockers/decisions:", "needs decision"]) {
  if (handoffSource.includes(semanticField)) fail(`Bridge transport semantically recognizes handoff field ${semanticField}`);
}
if (!handoffSource.includes("latestAssistantMessage") || !handoffSource.includes("projection.project")) {
  fail("Bridge handoff transport does not expose structural latest-response public projection");
}

if (!resultSchema.properties?.state?.enum?.includes("applying")
  || !bridgeProtocol.includes("publish `applying`")
  || !workflow.includes("public `applying`")) {
  fail("Developer schema/protocol and Project workflow disagree on observable applying state");
}

if (failures.length > 0) {
  failures.sort((left, right) => left.localeCompare(right));
  console.error(`Web-orchestrator integration validation failed (${failures.length}):`);
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

let webRevision = "unknown";
try {
  webRevision = execFileSync("git", ["-C", webRoot, "rev-parse", "HEAD"], { encoding: "utf8" }).trim();
} catch {
  // The deterministic content checks above also support an exported package.
}
console.log(`Web-orchestrator integration validation passed: protocol ${protocol}, ${expectedRequestKinds.length} request kinds, exact six-field handoff, Scout/runtime boundaries, and Project revision ${webRevision}.`);
