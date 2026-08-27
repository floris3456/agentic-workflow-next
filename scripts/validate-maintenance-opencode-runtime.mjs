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
const expectedVersion = "1.18.23";
const executable = resolve(process.env.OPENCODE_1_18_23_BIN
  ?? join(root, ".opencode", "node_modules", ".bin", "opencode"));

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
  const waitForExit = () => Promise.race([
    child.exitCode !== null ? Promise.resolve() : new Promise((resolvePromise) => child.once("exit", resolvePromise)),
    new Promise((resolvePromise) => setTimeout(resolvePromise, 3_000)),
  ]);
  if (child.exitCode === null) {
    child.kill("SIGTERM");
    await waitForExit();
  }
  if (child.exitCode === null) {
    child.kill("SIGKILL");
    await waitForExit();
  }
  child.stdout?.destroy();
  child.stderr?.destroy();
}

await access(executable, fsConstants.X_OK).catch(() => {
  throw new Error("Pinned OpenCode 1.18.23 executable is unavailable; install .opencode dependencies or set OPENCODE_1_18_23_BIN");
});

const temporary = await mkdtemp(join(tmpdir(), "workspace-opencode-inventory-"));
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

  const routeSpecs = [
    {
      name: "small-maintainer",
      model: { providerID: "cliproxyapi", modelID: "gemini-3.7-flash-high" },
      reasoningEffort: "high",
    },
    {
      name: "heavy-maintainer",
      model: { providerID: "openai", modelID: "gpt-5.6-sol" },
      reasoningEffort: "max",
    },
  ];
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
  const allowedSkills = new Set(["maintenance", "change-package"]);

  for (const spec of routeSpecs) {
    const agent = agents.find((candidate) => candidate.name === spec.name);
    assert(agent, `${spec.name} was not discovered from workspace`);
    assert.equal(agent.mode, "primary");
    assert.deepEqual(agent.model, spec.model);
    assert.equal(agent.options?.reasoningEffort, spec.reasoningEffort);
    assert(Array.isArray(agent.permission), `${spec.name} permission inventory is missing`);

    for (const tool of toolIds) {
      if (tool === "skill") continue;
      const expected = toolPermissions[tool] ?? "deny";
      assert.equal(permissionAction(agent.permission, tool), expected, `${spec.name}: ${tool} must resolve to ${expected}`);
    }
    for (const required of Object.keys(toolPermissions)) {
      assert(toolIds.includes(required), `${required} was not loaded by the real runtime`);
    }
    for (const skill of skills) {
      const expected = allowedSkills.has(skill.name) ? "allow" : "deny";
      assert.equal(
        permissionAction(agent.permission, "skill", skill.name),
        expected,
        `${spec.name}: ${skill.name} skill permission is incorrect`,
      );
    }
  }

  for (const [name, path] of [
    ["maintenance", join(root, ".opencode", "skills", "maintenance", "SKILL.md")],
    ["change-package", join(root, ".opencode", "skills", "change-package", "SKILL.md")],
  ]) {
    const skill = skills.find((candidate) => candidate.name === name);
    assert(skill, `${name} skill was not discovered`);
    assert.equal(resolve(skill.location), path);
  }
  for (const obsolete of ["template-maintainer", "small-workspace-maintainer", "workspace-maintainer"]) {
    assert(!agents.some((candidate) => candidate.name === obsolete), `${obsolete} must not remain registered`);
  }

  console.log(`Pinned OpenCode ${expectedVersion} unified maintenance agent, skill, tool, and permission inventory passed.`);
} finally {
  if (child) await stop(child);
  await rm(temporary, { recursive: true, force: true });
}
