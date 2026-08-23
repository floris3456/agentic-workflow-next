#!/usr/bin/env node
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { constants as fsConstants } from "node:fs";
import { access, mkdir, mkdtemp, rm } from "node:fs/promises";
import { createServer } from "node:net";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const expectedVersion = "1.18.16";
const executable = resolve(process.env.OPENCODE_1_18_16_BIN
  ?? join(root, ".opencode", "node_modules", ".bin", "opencode"));
const allowedTools = new Set([
  "question",
  "skill",
  "workspace_list",
  "workspace_inspect",
  "workspace_read",
  "workspace_write",
  "workspace_delete",
  "workspace_glob",
  "workspace_grep",
  "workspace_exec",
  "workspace_publish",
]);

function wildcard(pattern, value) {
  const expression = pattern.replace(/[.+^${}()|[\]\\]/g, "\\$&").replaceAll("*", ".*");
  return new RegExp(`^${expression}$`).test(value);
}

function permissionAction(rules, permission, pattern = "*") {
  let result;
  for (const rule of rules) {
    if ((rule.permission === "*" || rule.permission === permission) && wildcard(rule.pattern, pattern)) {
      result = rule.action;
    }
  }
  return result;
}

async function availablePort() {
  const server = createServer();
  await new Promise((resolvePromise, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", resolvePromise);
  });
  const address = server.address();
  const port = typeof address === "object" && address ? address.port : undefined;
  await new Promise((resolvePromise, reject) => server.close((error) => error ? reject(error) : resolvePromise()));
  assert(Number.isSafeInteger(port), "Could not reserve a loopback validation port");
  return port;
}

async function json(base, pathname, directory = false) {
  const url = new URL(pathname, base);
  if (directory) url.searchParams.set("directory", root);
  const response = await fetch(url, { signal: AbortSignal.timeout(20_000) });
  assert.equal(response.status, 200, `${pathname} did not return HTTP 200`);
  return await response.json();
}

async function stop(child) {
  if (child.exitCode !== null) return;
  child.kill("SIGTERM");
  await Promise.race([
    new Promise((resolvePromise) => child.once("exit", resolvePromise)),
    new Promise((resolvePromise) => setTimeout(resolvePromise, 3_000)),
  ]);
  if (child.exitCode === null) child.kill("SIGKILL");
}

await access(executable, fsConstants.X_OK).catch(() => {
  throw new Error("Pinned OpenCode 1.18.16 executable is unavailable; install .opencode dependencies or set OPENCODE_1_18_16_BIN");
});

const temporary = await mkdtemp(join(tmpdir(), "template-opencode-inventory-"));
let child;
try {
  const directories = Object.fromEntries(["home", "config", "cache", "data", "state", "tmp"]
    .map((name) => [name, join(temporary, name)]));
  await Promise.all(Object.values(directories).map((directory) => mkdir(directory, { recursive: true, mode: 0o700 })));
  const port = await availablePort();
  child = spawn(executable, ["serve", "--hostname", "127.0.0.1", "--port", String(port)], {
    cwd: root,
    stdio: ["ignore", "pipe", "pipe"],
    env: {
      PATH: "/usr/bin:/bin",
      HOME: directories.home,
      XDG_CONFIG_HOME: directories.config,
      XDG_CACHE_HOME: directories.cache,
      XDG_DATA_HOME: directories.data,
      XDG_STATE_HOME: directories.state,
      TMPDIR: directories.tmp,
      LANG: "C.UTF-8",
      LC_ALL: "C.UTF-8",
      NO_PROXY: "127.0.0.1,localhost",
      OPENCODE_DISABLE_DEFAULT_PLUGINS: "1",
      OPENCODE_DISABLE_EXTERNAL_SKILLS: "1",
      OPENCODE_DISABLE_CLAUDE_CODE_SKILLS: "1",
      OPENCODE_DISABLE_WATCHER: "1",
      OPENCODE_DISABLE_AUTOCOMPACT: "1",
      OPENCODE_DISABLE_PRUNE: "1",
      OPENCODE_TEST_MANAGED_CONFIG_DIR: join(temporary, "managed-config-disabled"),
    },
  });
  let diagnostics = "";
  for (const stream of [child.stdout, child.stderr]) {
    stream.on("data", (chunk) => {
      diagnostics = `${diagnostics}${chunk}`.slice(-16_384);
    });
  }
  const base = `http://127.0.0.1:${port}/`;
  let health;
  for (let attempt = 0; attempt < 100; attempt++) {
    if (child.exitCode !== null) throw new Error("Pinned OpenCode exited before inventory validation");
    try {
      health = await json(base, "/global/health");
      break;
    } catch {
      await new Promise((resolvePromise) => setTimeout(resolvePromise, 100));
    }
  }
  assert(health, `Pinned OpenCode did not become healthy: ${diagnostics.replaceAll(root, "[project-root]").replaceAll(temporary, "[temporary-root]")}`);
  assert.equal(health.version, expectedVersion, "Unexpected OpenCode runtime version");

  const [agents, skills, toolIds] = await Promise.all([
    json(base, "/agent", true),
    json(base, "/skill", true),
    json(base, "/experimental/tool/ids", true),
  ]);
  const agent = agents.find((candidate) => candidate.name === "workspace-maintainer");
  assert(agent, "workspace-maintainer was not discovered from template-development");
  assert.equal(agent.mode, "primary");
  assert.deepEqual(agent.model, { providerID: "openai", modelID: "gpt-5.6-sol" });
  assert.equal(agent.options?.reasoningEffort, "max");
  assert(Array.isArray(agent.permission), "workspace-maintainer permission inventory is missing");

  const toolPermissions = {
    question: "allow",
    workspace_list: "allow",
    workspace_inspect: "allow",
    workspace_read: "allow",
    workspace_write: "allow",
    workspace_delete: "allow",
    workspace_glob: "allow",
    workspace_grep: "allow",
    workspace_exec: "allow",
    workspace_publish: "allow",
  };

  for (const tool of toolIds) {
    if (tool === "skill") continue;
    const expected = toolPermissions[tool] ?? "deny";
    assert.equal(permissionAction(agent.permission, tool), expected, `${tool} must resolve to ${expected}`);
  }
  for (const required of Object.keys(toolPermissions)) assert(toolIds.includes(required), `${required} was not loaded by the real runtime`);
  for (const skill of skills) {
    assert.equal(
      permissionAction(agent.permission, "skill", skill.name),
      skill.name === "workspace-maintenance" ? "allow" : "deny",
      `${skill.name} skill permission is incorrect`,
    );
  }
  const workspaceSkill = skills.find((skill) => skill.name === "workspace-maintenance");
  assert(workspaceSkill, "workspace-maintenance skill was not discovered");
  assert.equal(resolve(workspaceSkill.location), join(root, ".opencode", "skills", "workspace-maintenance", "SKILL.md"));
  console.log(`Pinned OpenCode ${expectedVersion} workspace agent, plugin, tool, and skill inventory passed.`);
} finally {
  if (child) await stop(child);
  await rm(temporary, { recursive: true, force: true });
}
