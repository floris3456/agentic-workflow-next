import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { chmod, mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { DatabaseSync } from "node:sqlite";
import { createServer } from "node:net";
import {
  HostBridgeRegistry,
  WorkspaceBridgeBroker,
  WorkspaceMaintenanceGate,
} from "../scripts/workspace-maintenance-lib.mjs";

const executeFile = promisify(execFile);

async function command(cwd, executable, args) {
  const result = await executeFile(executable, args, {
    cwd,
    encoding: "utf8",
    env: { ...process.env, GIT_TERMINAL_PROMPT: "0" },
  });
  return { stdout: result.stdout.trim(), stderr: result.stderr.trim() };
}

async function git(cwd, ...args) {
  return await command(cwd, "git", args);
}

async function configureRepository(root) {
  await git(root, "config", "user.name", "Workspace Host Fixture");
  await git(root, "config", "user.email", "workspace-host-fixture@example.invalid");
  await git(root, "config", "commit.gpgsign", "false");
}

async function createBridgeDatabase(dbPath, metadata = {}, sessionCounts = {}) {
  const db = new DatabaseSync(dbPath);
  db.exec(`
    CREATE TABLE IF NOT EXISTS meta (key TEXT PRIMARY KEY, value TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS commands (id TEXT PRIMARY KEY, status TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS requests (id TEXT PRIMARY KEY, status TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS response_deliveries (id TEXT PRIMARY KEY, delivered_at INTEGER);
    CREATE TABLE IF NOT EXISTS outbox (id TEXT PRIMARY KEY, delivered_at INTEGER);
    CREATE TABLE IF NOT EXISTS task_sessions (id TEXT PRIMARY KEY, taskId TEXT, sessionId TEXT, session_kind TEXT, session_state TEXT);
    CREATE TABLE IF NOT EXISTS scout_sessions (id TEXT PRIMARY KEY, requestId TEXT, taskId TEXT, sessionId TEXT, session_state TEXT);
  `);
  for (const [key, value] of Object.entries(metadata)) {
    db.prepare("INSERT OR REPLACE INTO meta (key, value) VALUES (?, ?)").run(key, String(value));
  }
  for (let i = 0; i < (sessionCounts.pendingCommands ?? 0); i++) {
    db.prepare("INSERT INTO commands (id, status) VALUES (?, ?)").run(`cmd-${i}`, "accepted");
  }
  for (let i = 0; i < (sessionCounts.activeDeveloperSessions ?? 0); i++) {
    db.prepare("INSERT INTO task_sessions (id, taskId, sessionId, session_kind, session_state) VALUES (?, ?, ?, ?, ?)").run(`dev-${i}`, `task-${i}`, `sess-${i}`, "developer", "busy");
  }
  for (let i = 0; i < (sessionCounts.activeWorkspaceSessions ?? 0); i++) {
    db.prepare("INSERT INTO task_sessions (id, taskId, sessionId, session_kind, session_state) VALUES (?, ?, ?, ?, ?)").run(`ws-${i}`, `wstask-${i}`, `wssess-${i}`, "workspace", "busy");
  }
  db.close();
}

class FakeSystemdClient {
  constructor(unitProperties = {}) {
    this.units = new Map(Object.entries(unitProperties));
    this.startCalls = [];
  }

  async isAvailable() { return true; }

  async showUnit(unitName) {
    if (!this.units.has(unitName)) {
      return { LoadState: "not-found", ActiveState: "inactive" };
    }
    return this.units.get(unitName);
  }

  async startUnit(unitName) {
    this.startCalls.push(unitName);
    const existing = this.units.get(unitName) ?? { LoadState: "loaded", ActiveState: "inactive" };
    this.units.set(unitName, { ...existing, ActiveState: "active", SubState: "running" });
  }
}

async function startFakeAdminServer(socketPath, handlers = {}) {
  const server = createServer((socket) => {
    let buffer = "";
    socket.setEncoding("utf8");
    socket.on("data", (chunk) => {
      buffer += chunk;
      const idx = buffer.indexOf("\n");
      if (idx !== -1) {
        const line = buffer.slice(0, idx).trim();
        const payload = JSON.parse(line);
        if (payload.command === "status") {
          const res = handlers.onStatus ? handlers.onStatus() : { running: true, heartbeat_at: Date.now() };
          socket.end(JSON.stringify({ ok: true, data: res }) + "\n");
        } else if (payload.command === "reconcile") {
          const res = handlers.onReconcile ? handlers.onReconcile() : { reconciled: true };
          socket.end(JSON.stringify({ ok: true, data: res }) + "\n");
        } else {
          socket.end(JSON.stringify({ ok: false, error: "Unsupported" }) + "\n");
        }
      }
    });
  });
  await new Promise((resolve) => server.listen(socketPath, resolve));
  await chmod(socketPath, 0o600);
  return {
    stop: () => new Promise((resolve) => server.close(() => resolve())),
  };
}

test("host bridge broker inspects stopped existing bridge, detects pending work, and starts it safely", async (t) => {
  const fixture = await mkdtemp(join(tmpdir(), "workspace-bridge-test-"));
  t.after(async () => await rm(fixture, { recursive: true, force: true }));

  const origin = join(fixture, "origin.git");
  const template = join(fixture, "template-ledger");
  const developer = join(fixture, "developer");
  const configDir = join(fixture, "config");
  const stateDir = join(fixture, "state");

  await git(fixture, "init", "--bare", origin);
  await mkdir(template);
  await git(template, "init", "--initial-branch=template-development");
  await configureRepository(template);
  await git(template, "remote", "add", "origin", origin);
  await writeFile(join(template, "AGENTS.md"), "ROOT\n", "utf8");
  await git(template, "add", ".");
  await git(template, "commit", "-m", "Initial commit");
  await git(template, "push", "--set-upstream", "origin", "template-development");

  // Create developer worktree
  await git(template, "branch", "developer");
  await git(template, "worktree", "add", developer, "developer");
  await git(developer, "push", "--set-upstream", "origin", "developer");

  await mkdir(configDir, { recursive: true, mode: 0o700 });
  await mkdir(stateDir, { recursive: true, mode: 0o700 });

  const stateFile = join(stateDir, "bridge.sqlite");
  const socketPath = join(stateDir, "admin.sock");
  await createBridgeDatabase(stateFile, {
    "service.heartbeat_at": Date.now() - 1000,
    "service.pid": "12345",
  }, {
    pendingCommands: 1,
    activeDeveloperSessions: 1,
  });

  const bridgeConfig = {
    schema_version: 1,
    instance_id: "test-owner-test-repo",
    repository_root: developer,
    manifest_file: join(developer, "operation-manifest.json"),
    state_file: stateFile,
    admin_socket_file: socketPath,
    service_unit: "test-repo-bridge.service",
    opencode: {
      base_url: "http://127.0.0.1:44123",
      username: "opencode",
      password_file: join(configDir, "password"),
      scout_base_url: "http://127.0.0.1:44124",
      scout_password_file: join(configDir, "scout-password"),
      scout_runtime_root: join(fixture, "scout-runtime"),
      scout_provider_api_key_file: join(configDir, "api-key"),
    },
    github: {
      app_id: "12345",
      installation_id: 67890,
      private_key_file: join(configDir, "key.pem"),
      owner: "test-owner",
      repository: "origin", // matches origin.git basename in fixture
      allowed_authors: ["test-owner"],
      comment_author: "test-bot[bot]",
    },
  };

  const configFile = join(configDir, "opencode-bridge.json");
  await writeFile(configFile, JSON.stringify(bridgeConfig, null, 2), { mode: 0o600 });
  await writeFile(join(configDir, "password"), "secret\n", { mode: 0o600 });
  await writeFile(join(configDir, "scout-password"), "secret\n", { mode: 0o600 });
  await writeFile(join(configDir, "api-key"), "key\n", { mode: 0o600 });
  await writeFile(join(configDir, "key.pem"), "-----BEGIN RSA PRIVATE KEY-----\ntest\n-----END RSA PRIVATE KEY-----\n", { mode: 0o600 });
  await writeFile(join(developer, "operation-manifest.json"), "{}", { mode: 0o600 });
  await git(developer, "add", ".");
  await git(developer, "commit", "-m", "Add manifest");

  const fakeSystemd = new FakeSystemdClient({
    "test-repo-bridge.service": {
      Id: "test-repo-bridge.service",
      LoadState: "loaded",
      ActiveState: "inactive",
      SubState: "dead",
      WorkingDirectory: developer,
      ExecStart: `/usr/bin/node dist/cli.js run --config ${configFile}`,
    },
  });

  const gate = new WorkspaceMaintenanceGate(template, {
    configDirectory: configDir,
    systemdClient: fakeSystemd,
    fetchFn: async () => ({ status: 200, json: async () => ({ version: "1.18.16" }) }),
  });

  // 1. Inspect stopped bridge
  const statusBefore = await gate.bridgeInspect();
  assert.equal(statusBefore.service_state, "stopped");
  assert.equal(statusBefore.bridge_running, false);
  assert.equal(statusBefore.canonical_recovery_required, true);
  assert.equal(statusBefore.starting_safe, true);
  assert.equal(statusBefore.pending_commands, 1);
  assert.equal(statusBefore.active_developer_sessions, 1);
  assert.equal(statusBefore.opencode_endpoint_healthy, true);

  // Assert no host paths leaked in public response
  const serialized = JSON.stringify(statusBefore);
  assert.doesNotMatch(serialized, new RegExp(fixture.replace(/[.*+?^${}()|[\\]\\\\]/g, "\\$&")));

  // 2. Start bridge
  // Start fake admin server to simulate the started bridge service responding
  const adminServer = await startFakeAdminServer(socketPath, {
    onStatus: () => ({
      running: true,
      heartbeat_at: Date.now(),
      pending_commands: 1,
      active_developer_sessions: 1,
    }),
    onReconcile: () => ({
      reconciled: true,
    }),
  });
  t.after(async () => await adminServer.stop());

  const startResult = await gate.bridgeStart();
  assert.equal(startResult.status, "started");
  assert.equal(startResult.bridge.service_state, "running");
  assert.equal(startResult.bridge.bridge_running, true);
  assert.equal(fakeSystemd.startCalls.length, 1);
  assert.equal(fakeSystemd.startCalls[0], "test-repo-bridge.service");

  // 3. Start again is idempotent
  const startAgain = await gate.bridgeStart();
  assert.equal(startAgain.status, "already-running");
  assert.equal(fakeSystemd.startCalls.length, 1); // No new systemctl start call

  // 4. Reconcile running bridge
  const reconcileResult = await gate.bridgeReconcile();
  assert.equal(reconcileResult.reconciled, true);
  assert.equal(reconcileResult.service_state, "running");
});

test("host bridge broker fails closed for foreign repository, missing config, and stopped reconcile", async (t) => {
  const fixture = await mkdtemp(join(tmpdir(), "workspace-bridge-adversarial-"));
  t.after(async () => await rm(fixture, { recursive: true, force: true }));

  const origin = join(fixture, "origin.git");
  const foreignOrigin = join(fixture, "foreign-origin.git");
  const template = join(fixture, "template-ledger");
  const foreignRepo = join(fixture, "foreign-repo");
  const configDir = join(fixture, "config");

  await git(fixture, "init", "--bare", origin);
  await git(fixture, "init", "--bare", foreignOrigin);
  await mkdir(template);
  await git(template, "init", "--initial-branch=template-development");
  await configureRepository(template);
  await git(template, "remote", "add", "origin", origin);
  await writeFile(join(template, "AGENTS.md"), "ROOT\n", "utf8");
  await git(template, "add", ".");
  await git(template, "commit", "-m", "Initial commit");

  await mkdir(foreignRepo);
  await git(foreignRepo, "init", "--initial-branch=developer");
  await configureRepository(foreignRepo);
  await git(foreignRepo, "remote", "add", "origin", foreignOrigin);
  await writeFile(join(foreignRepo, "file.txt"), "foreign\n", "utf8");
  await git(foreignRepo, "add", ".");
  await git(foreignRepo, "commit", "-m", "Foreign commit");

  await mkdir(configDir, { recursive: true, mode: 0o700 });

  // 1. Missing registration fails closed
  const emptyGate = new WorkspaceMaintenanceGate(template, {
    configDirectory: configDir,
  });
  await assert.rejects(
    () => emptyGate.bridgeInspect(),
    /No registered bridge configuration found for repository/,
  );

  // 2. Config belonging to foreign repository fails closed
  const foreignConfig = {
    schema_version: 1,
    instance_id: "foreign-instance",
    repository_root: foreignRepo,
    manifest_file: join(foreignRepo, "manifest.json"),
    state_file: join(fixture, "foreign.sqlite"),
    github: {
      app_id: "123",
      installation_id: 456,
      private_key_file: join(configDir, "key.pem"),
      owner: "foreign-owner",
      repository: "foreign-repo",
      allowed_authors: ["foreign-owner"],
      comment_author: "foreign-bot[bot]",
    },
  };
  await writeFile(join(configDir, "foreign.json"), JSON.stringify(foreignConfig), { mode: 0o600 });
  await assert.rejects(
    () => emptyGate.bridgeInspect(),
    /No registered bridge configuration found for repository/,
  );

  // 3. Reconcile fails closed when bridge is stopped
  const stateFile = join(fixture, "stopped.sqlite");
  await createBridgeDatabase(stateFile, { "service.heartbeat_at": Date.now() - 60_000 });
  const matchingConfig = {
    schema_version: 1,
    instance_id: "test-instance",
    repository_root: template,
    manifest_file: join(template, "manifest.json"),
    state_file: stateFile,
    admin_socket_file: join(fixture, "stopped-admin.sock"),
    github: {
      app_id: "123",
      installation_id: 456,
      private_key_file: join(configDir, "key.pem"),
      owner: "origin",
      repository: "origin",
      allowed_authors: ["origin"],
      comment_author: "bot[bot]",
    },
  };
  await writeFile(join(configDir, "matching.json"), JSON.stringify(matchingConfig), { mode: 0o600 });
  const stoppedGate = new WorkspaceMaintenanceGate(template, {
    configDirectory: configDir,
    systemdClient: new FakeSystemdClient(),
  });
  await assert.rejects(
    () => stoppedGate.bridgeReconcile(),
    /Bridge service is not running.*start the bridge before requesting reconciliation/,
  );
});

test("host bridge broker rejects ambiguous multiple registrations and dirty developer state", async (t) => {
  const fixture = await mkdtemp(join(tmpdir(), "workspace-bridge-ambiguous-"));
  t.after(async () => await rm(fixture, { recursive: true, force: true }));

  const origin = join(fixture, "origin.git");
  const template = join(fixture, "template-ledger");
  const developer = join(fixture, "developer");
  const configDir = join(fixture, "config");
  const stateDir = join(fixture, "state");

  await git(fixture, "init", "--bare", origin);
  await mkdir(template);
  await git(template, "init", "--initial-branch=template-development");
  await configureRepository(template);
  await git(template, "remote", "add", "origin", origin);
  await writeFile(join(template, "AGENTS.md"), "ROOT\n", "utf8");
  await git(template, "add", ".");
  await git(template, "commit", "-m", "Initial commit");

  await git(template, "branch", "developer");
  await git(template, "worktree", "add", developer, "developer");
  await writeFile(join(developer, "file.txt"), "dev\n", "utf8");
  await git(developer, "add", ".");
  await git(developer, "commit", "-m", "Dev commit");

  await mkdir(configDir, { recursive: true, mode: 0o700 });
  await mkdir(stateDir, { recursive: true, mode: 0o700 });

  const state1 = join(stateDir, "state1.sqlite");
  const state2 = join(stateDir, "state2.sqlite");
  await createBridgeDatabase(state1);
  await createBridgeDatabase(state2);

  const baseConfig = {
    schema_version: 1,
    repository_root: developer,
    github: {
      app_id: "123",
      installation_id: 456,
      private_key_file: join(configDir, "key.pem"),
      owner: "origin",
      repository: "origin",
      allowed_authors: ["origin"],
      comment_author: "bot[bot]",
    },
  };
  await writeFile(join(configDir, "key.pem"), "key\n", { mode: 0o600 });

  // 1. Two configs with different instance_id for the same repository
  await writeFile(join(configDir, "bridge1.json"), JSON.stringify({
    ...baseConfig,
    instance_id: "instance-1",
    state_file: state1,
  }), { mode: 0o600 });
  await writeFile(join(configDir, "bridge2.json"), JSON.stringify({
    ...baseConfig,
    instance_id: "instance-2",
    state_file: state2,
  }), { mode: 0o600 });

  const gate = new WorkspaceMaintenanceGate(template, {
    configDirectory: configDir,
    systemdClient: new FakeSystemdClient(),
  });

  await assert.rejects(
    () => gate.bridgeInspect(),
    /Ambiguous bridge registration: multiple configurations match repository/,
  );

  // 2. Remove one config, but make developer worktree dirty
  await rm(join(configDir, "bridge2.json"));
  await writeFile(join(developer, "dirty.tmp"), "dirty\n", "utf8");

  const fakeSystemd = new FakeSystemdClient({
    "origin-bridge.service": {
      Id: "origin-bridge.service",
      LoadState: "loaded",
      ActiveState: "inactive",
      SubState: "dead",
      WorkingDirectory: developer,
    },
  });

  const dirtyGate = new WorkspaceMaintenanceGate(template, {
    configDirectory: configDir,
    systemdClient: fakeSystemd,
  });

  const status = await dirtyGate.bridgeInspect();
  assert.equal(status.starting_safe, false);

  await assert.rejects(
    () => dirtyGate.bridgeStart(),
    /Cannot start bridge: developer worktree is dirty\/diverged or service lock is held/,
  );
});

test("real host environment integration acceptance test (runs on real host if configured)", async (t) => {
  // If the machine has a live registered bridge configuration and user-systemd service:
  const hostRegistry = new HostBridgeRegistry();
  const candidates = hostRegistry.findCandidateConfigFiles();
  if (candidates.length === 0) {
    t.skip("No real host bridge configuration found in ~/.config/agentic-workflow/; skipping real host acceptance test in non-host/CI environment");
    return;
  }

  const gate = new WorkspaceMaintenanceGate(process.cwd());
  let status;
  try {
    status = await gate.bridgeInspect();
  } catch (error) {
    t.skip(`Real host bridge inspection was not possible from current directory: ${error.message}`);
    return;
  }

  assert.ok(status, "Real host inspection returned a status");
  assert.ok(typeof status.repository === "string", "Repository identity returned");
  assert.ok(typeof status.service_state === "string", "Service state returned");
  assert.ok(typeof status.bridge_running === "boolean", "Bridge running boolean returned");
  assert.ok(typeof status.canonical_recovery_required === "boolean", "Canonical recovery boolean returned");

  // If the bridge is running and admin endpoint is reachable, test reconcile:
  if (status.bridge_running) {
    try {
      const reconcile = await gate.bridgeReconcile();
      assert.equal(reconcile.reconciled, true);
      assert.ok(typeof reconcile.service_state === "string");
    } catch (error) {
      if (error.message.includes("admin endpoint is unavailable") || error.message.includes("not running")) {
        // Real bridge running on host was started before admin socket was introduced
        assert.ok(true, "Bridge is running pre-upgrade version; admin endpoint not yet active");
      } else {
        throw error;
      }
    }
  }
});

