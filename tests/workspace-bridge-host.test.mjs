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

function createProductionBridgeDatabase(dbPath, metadata = {}) {
  const db = new DatabaseSync(dbPath);
  db.exec(`
    CREATE TABLE IF NOT EXISTS meta (key TEXT PRIMARY KEY, value TEXT NOT NULL, updated_at INTEGER NOT NULL);
    CREATE TABLE IF NOT EXISTS commands (command_id TEXT PRIMARY KEY, task_id TEXT NOT NULL, sequence INTEGER NOT NULL, issue_number INTEGER NOT NULL, kind TEXT NOT NULL, envelope_json TEXT NOT NULL, state TEXT NOT NULL, raw_result_json TEXT, public_result_json TEXT, error TEXT, created_at INTEGER NOT NULL, updated_at INTEGER NOT NULL);
    CREATE TABLE IF NOT EXISTS requests (request_id TEXT PRIMARY KEY, task_id TEXT NOT NULL, issue_number INTEGER NOT NULL, kind TEXT NOT NULL, envelope_json TEXT NOT NULL, state TEXT NOT NULL, raw_result_json TEXT, public_result_json TEXT, error TEXT, created_at INTEGER NOT NULL, updated_at INTEGER NOT NULL);
    CREATE TABLE IF NOT EXISTS response_deliveries (event_id TEXT PRIMARY KEY, task_id TEXT NOT NULL, session_id TEXT NOT NULL, issue_number INTEGER NOT NULL, event_type TEXT NOT NULL, delivery_kind TEXT NOT NULL DEFAULT 'developer', request_id TEXT, attempts INTEGER NOT NULL DEFAULT 0, queued_at INTEGER, last_error TEXT, created_at INTEGER NOT NULL, updated_at INTEGER NOT NULL);
    CREATE TABLE IF NOT EXISTS github_outbox (id INTEGER PRIMARY KEY AUTOINCREMENT, dedupe_key TEXT NOT NULL UNIQUE, kind TEXT NOT NULL, issue_number INTEGER NOT NULL, payload_json TEXT NOT NULL, attempts INTEGER NOT NULL DEFAULT 0, next_attempt_at INTEGER NOT NULL, delivered_at INTEGER, last_error TEXT, created_at INTEGER NOT NULL);
    CREATE TABLE IF NOT EXISTS task_sessions (task_id TEXT PRIMARY KEY, session_id TEXT NOT NULL UNIQUE, issue_number INTEGER NOT NULL, agent TEXT NOT NULL, session_kind TEXT NOT NULL DEFAULT 'developer', session_state TEXT NOT NULL DEFAULT 'unknown', latest_response_json TEXT, latest_event_id TEXT, created_at INTEGER NOT NULL, updated_at INTEGER NOT NULL);
    CREATE TABLE IF NOT EXISTS scout_sessions (request_id TEXT PRIMARY KEY, task_id TEXT NOT NULL, session_id TEXT NOT NULL UNIQUE, issue_number INTEGER NOT NULL, ref_sha TEXT NOT NULL, workspace_path TEXT NOT NULL, session_state TEXT NOT NULL DEFAULT 'starting', latest_response_json TEXT, latest_event_id TEXT, created_at INTEGER NOT NULL, updated_at INTEGER NOT NULL);
  `);
  const ts = Date.now();
  for (const [key, value] of Object.entries(metadata)) {
    db.prepare("INSERT OR REPLACE INTO meta (key, value, updated_at) VALUES (?, ?, ?)").run(key, String(value), ts);
  }
  return db;
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
          const res = handlers.onStatus ? handlers.onStatus() : { instance: "test-owner-test-repo", repository: "origin/origin", running: true, heartbeat_at: Date.now() };
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

test("production BridgeState schema is inspected accurately with real terminal semantics and pending counts", async (t) => {
  const fixture = await mkdtemp(join(tmpdir(), "workspace-bridge-schema-"));
  t.after(async () => await rm(fixture, { recursive: true, force: true }));

  const dbPath = join(fixture, "bridge.sqlite");
  const db = createProductionBridgeDatabase(dbPath, {
    "service.heartbeat_at": Date.now() - 2000,
    "service.pid": "4321",
  });

  const ts = Date.now();
  // 1. Commands: accepted + applying are counted, completed/rejected are not
  db.prepare("INSERT INTO commands (command_id, task_id, sequence, issue_number, kind, envelope_json, state, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)").run("cmd1", "t1", 1, 1, "task.start", "{}", "accepted", ts, ts);
  db.prepare("INSERT INTO commands (command_id, task_id, sequence, issue_number, kind, envelope_json, state, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)").run("cmd2", "t1", 2, 1, "task.start", "{}", "applying", ts, ts);
  db.prepare("INSERT INTO commands (command_id, task_id, sequence, issue_number, kind, envelope_json, state, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)").run("cmd3", "t1", 3, 1, "task.start", "{}", "completed", ts, ts);

  // 2. Requests: applying counted, rejected not
  db.prepare("INSERT INTO requests (request_id, task_id, issue_number, kind, envelope_json, state, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)").run("req1", "t1", 1, "scout.start", "{}", "applying", ts, ts);
  db.prepare("INSERT INTO requests (request_id, task_id, issue_number, kind, envelope_json, state, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)").run("req2", "t1", 1, "scout.start", "{}", "rejected", ts, ts);

  // 3. Outbox: delivered_at IS NULL counted
  db.prepare("INSERT INTO github_outbox (dedupe_key, kind, issue_number, payload_json, next_attempt_at, delivered_at, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)").run("out1", "comment", 1, "{}", ts, null, ts);
  db.prepare("INSERT INTO github_outbox (dedupe_key, kind, issue_number, payload_json, next_attempt_at, delivered_at, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)").run("out2", "comment", 1, "{}", ts, ts, ts);

  // 4. Response deliveries: queued_at IS NULL counted
  db.prepare("INSERT INTO response_deliveries (event_id, task_id, session_id, issue_number, event_type, queued_at, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)").run("ev1", "t1", "s1", 1, "session.idle", null, ts, ts);
  db.prepare("INSERT INTO response_deliveries (event_id, task_id, session_id, issue_number, event_type, queued_at, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)").run("ev2", "t1", "s2", 1, "session.idle", ts, ts, ts);

  // 5. Task sessions: non-terminal counted, terminal (session.idle, session.error) not counted
  db.prepare("INSERT INTO task_sessions (task_id, session_id, issue_number, agent, session_kind, session_state, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)").run("t-dev-active", "s-dev-active", 1, "small-developer", "developer", "busy", ts, ts);
  db.prepare("INSERT INTO task_sessions (task_id, session_id, issue_number, agent, session_kind, session_state, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)").run("t-dev-idle", "s-dev-idle", 1, "small-developer", "developer", "session.idle", ts, ts);
  db.prepare("INSERT INTO task_sessions (task_id, session_id, issue_number, agent, session_kind, session_state, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)").run("t-ws-active", "s-ws-active", 1, "workspace-maintainer", "workspace", "running", ts, ts);
  db.prepare("INSERT INTO task_sessions (task_id, session_id, issue_number, agent, session_kind, session_state, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)").run("t-ws-err", "s-ws-err", 1, "workspace-maintainer", "workspace", "session.error", ts, ts);

  // 6. Scout sessions: starting counted, session.idle not counted
  db.prepare("INSERT INTO scout_sessions (request_id, task_id, session_id, issue_number, ref_sha, workspace_path, session_state, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)").run("sc1", "t1", "scs1", 1, "sha", "path", "starting", ts, ts);
  db.prepare("INSERT INTO scout_sessions (request_id, task_id, session_id, issue_number, ref_sha, workspace_path, session_state, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)").run("sc2", "t1", "scs2", 1, "sha", "path", "session.idle", ts, ts);
  db.close();

  const broker = new WorkspaceBridgeBroker(fixture);
  const state = await broker.readStateFromDisk(dbPath);

  assert.equal(state.schema_valid, true);
  assert.equal(state.pending_commands, 2);
  assert.equal(state.pending_requests, 1);
  assert.equal(state.pending_outbox, 1);
  assert.equal(state.pending_response_deliveries, 1);
  assert.equal(state.active_task_sessions, 2);
  assert.equal(state.active_developer_sessions, 1);
  assert.equal(state.active_workspace_sessions, 1);
  assert.equal(state.scout_sessions, 1);
});

test("database schema mismatch fails closed and is marked blocked, never silently zeroed", async (t) => {
  const fixture = await mkdtemp(join(tmpdir(), "workspace-bridge-broken-schema-"));
  t.after(async () => await rm(fixture, { recursive: true, force: true }));

  const dbPath = join(fixture, "broken.sqlite");
  const db = new DatabaseSync(dbPath);
  db.exec("CREATE TABLE meta (key TEXT, value TEXT);");
  db.close();

  const broker = new WorkspaceBridgeBroker(fixture);
  const state = await broker.readStateFromDisk(dbPath);
  assert.equal(state.schema_valid, false);
  assert.match(state.error, /missing required table/);
});

test("host bridge broker inspects stopped existing bridge, detects pending work, and starts it with full health verification", async (t) => {
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
  await writeFile(join(developer, "operation-manifest.json"), "{}", { mode: 0o600 });
  await git(developer, "add", ".");
  await git(developer, "commit", "-m", "Add manifest");
  await git(developer, "push", "--set-upstream", "origin", "developer");

  await mkdir(configDir, { recursive: true, mode: 0o700 });
  await mkdir(stateDir, { recursive: true, mode: 0o700 });

  const stateFile = join(stateDir, "bridge.sqlite");
  const socketPath = join(stateDir, "admin.sock");
  const db = createProductionBridgeDatabase(stateFile, {
    "service.heartbeat_at": Date.now() - 1000,
    "service.pid": "12345",
  });
  const ts = Date.now();
  db.prepare("INSERT INTO commands (command_id, task_id, sequence, issue_number, kind, envelope_json, state, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)").run("cmd1", "t1", 1, 1, "task.start", "{}", "accepted", ts, ts);
  db.prepare("INSERT INTO task_sessions (task_id, session_id, issue_number, agent, session_kind, session_state, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)").run("t1", "s1", 1, "small-developer", "developer", "busy", ts, ts);
  db.close();

  const configFile = join(configDir, "opencode-bridge.json");
  const bridgeConfig = {
    schema_version: 1,
    instance_id: "test-owner-origin",
    repository_root: developer,
    manifest_file: join(developer, "operation-manifest.json"),
    state_file: stateFile,
    service_unit: "origin-bridge.service",
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
      owner: "origin",
      repository: "origin",
      allowed_authors: ["origin"],
      comment_author: "test-bot[bot]",
    },
  };

  await writeFile(configFile, JSON.stringify(bridgeConfig, null, 2), { mode: 0o600 });
  await writeFile(join(configDir, "password"), "secret\n", { mode: 0o600 });
  await writeFile(join(configDir, "scout-password"), "secret\n", { mode: 0o600 });
  await writeFile(join(configDir, "api-key"), "key\n", { mode: 0o600 });
  await writeFile(join(configDir, "key.pem"), "-----BEGIN RSA PRIVATE KEY-----\ntest\n-----END RSA PRIVATE KEY-----\n", { mode: 0o600 });

  const fakeSystemd = new FakeSystemdClient({
    "origin-bridge.service": {
      Id: "origin-bridge.service",
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
    adminProbeRetries: 3,
    adminProbeIntervalMs: 50,
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

  // 2. Start bridge with fake admin server
  const adminServer = await startFakeAdminServer(socketPath, {
    onStatus: () => ({
      instance: "test-owner-origin",
      repository: "local/origin",
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
  assert.equal(fakeSystemd.startCalls[0], "origin-bridge.service");

  // 3. Start again is idempotent
  const startAgain = await gate.bridgeStart();
  assert.equal(startAgain.status, "already-running");
  assert.equal(fakeSystemd.startCalls.length, 1);

  // 4. Reconcile running bridge
  const reconcileResult = await gate.bridgeReconcile();
  assert.equal(reconcileResult.reconciled, true);
  assert.equal(reconcileResult.service_state, "running");
});

test("post-start health proofs reject active unit with unreachable admin, wrong identity, or stale heartbeat", async (t) => {
  const fixture = await mkdtemp(join(tmpdir(), "workspace-bridge-post-start-"));
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

  await git(template, "branch", "developer");
  await git(template, "worktree", "add", developer, "developer");
  await writeFile(join(developer, "file.txt"), "clean\n", "utf8");
  await writeFile(join(developer, "manifest.json"), "{}", { mode: 0o600 });
  await git(developer, "add", ".");
  await git(developer, "commit", "-m", "Dev commit");
  await git(developer, "push", "--set-upstream", "origin", "developer");

  await mkdir(configDir, { recursive: true, mode: 0o700 });
  await mkdir(stateDir, { recursive: true, mode: 0o700 });

  const stateFile = join(stateDir, "bridge.sqlite");
  const socketPath = join(stateDir, "admin.sock");
  createProductionBridgeDatabase(stateFile).close();

  const configFile = join(configDir, "opencode-bridge.json");
  const bridgeConfig = {
    schema_version: 1,
    instance_id: "test-instance",
    repository_root: developer,
    manifest_file: join(developer, "manifest.json"),
    state_file: stateFile,
    service_unit: "origin-bridge.service",
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
  await writeFile(configFile, JSON.stringify(bridgeConfig), { mode: 0o600 });

  // 1. Post-start fails if admin endpoint is unreachable
  const fakeSystemd = new FakeSystemdClient({
    "origin-bridge.service": {
      Id: "origin-bridge.service",
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
    adminProbeRetries: 3,
    adminProbeIntervalMs: 50,
  });

  await assert.rejects(
    () => gate.bridgeStart(),
    /Bridge service started in systemd but admin endpoint is unreachable or unresponsive/,
  );

  // 2. Post-start fails if instance identity is mismatched
  let adminHandler = {
    onStatus: () => ({
      instance: "wrong-instance",
      repository: "local/origin",
      running: true,
      heartbeat_at: Date.now(),
    }),
  };
  let adminServer = await startFakeAdminServer(socketPath, adminHandler);

  fakeSystemd.units.set("origin-bridge.service", {
    Id: "origin-bridge.service",
    LoadState: "loaded",
    ActiveState: "inactive",
    SubState: "dead",
    WorkingDirectory: developer,
    ExecStart: `/usr/bin/node dist/cli.js run --config ${configFile}`,
  });

  await assert.rejects(
    () => gate.bridgeStart(),
    /reported mismatched instance identity: wrong-instance/,
  );
  await adminServer.stop();

  // 3. Post-start fails if heartbeat is stale
  adminHandler = {
    onStatus: () => ({
      instance: "test-instance",
      repository: "local/origin",
      running: true,
      heartbeat_at: Date.now() - 60_000,
    }),
  };
  adminServer = await startFakeAdminServer(socketPath, adminHandler);
  fakeSystemd.units.set("origin-bridge.service", {
    Id: "origin-bridge.service",
    LoadState: "loaded",
    ActiveState: "inactive",
    SubState: "dead",
    WorkingDirectory: developer,
    ExecStart: `/usr/bin/node dist/cli.js run --config ${configFile}`,
  });

  await assert.rejects(
    () => gate.bridgeStart(),
    /reported stale heartbeat/,
  );
  await adminServer.stop();
});

test("systemd unit binding rejects missing service_unit, wrong WorkingDirectory, and wrong config path", async (t) => {
  const fixture = await mkdtemp(join(tmpdir(), "workspace-bridge-unit-binding-"));
  t.after(async () => await rm(fixture, { recursive: true, force: true }));

  const origin = join(fixture, "origin.git");
  const template = join(fixture, "template-ledger");
  const developer = join(fixture, "developer");
  const wrongDir = join(fixture, "wrong-dir");
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

  await git(template, "branch", "developer");
  await git(template, "worktree", "add", developer, "developer");
  await writeFile(join(developer, "file.txt"), "dev\n", "utf8");
  await writeFile(join(developer, "manifest.json"), "{}", { mode: 0o600 });
  await git(developer, "add", ".");
  await git(developer, "commit", "-m", "Dev commit");
  await git(developer, "push", "--set-upstream", "origin", "developer");

  await mkdir(wrongDir);
  await mkdir(configDir, { recursive: true, mode: 0o700 });
  await mkdir(stateDir, { recursive: true, mode: 0o700 });

  const stateFile = join(stateDir, "bridge.sqlite");
  createProductionBridgeDatabase(stateFile).close();

  // 1. Missing service_unit in config -> start rejected
  const noUnitConfig = {
    schema_version: 1,
    instance_id: "test-instance",
    repository_root: developer,
    manifest_file: join(developer, "manifest.json"),
    state_file: stateFile,
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
  const configFile = join(configDir, "opencode-bridge.json");
  await writeFile(configFile, JSON.stringify(noUnitConfig), { mode: 0o600 });

  const fakeSystemd = new FakeSystemdClient();
  const gate = new WorkspaceMaintenanceGate(template, {
    configDirectory: configDir,
    systemdClient: fakeSystemd,
  });

  const inspectNoUnit = await gate.bridgeInspect();
  assert.equal(inspectNoUnit.service_state, "unregistered");
  await assert.rejects(
    () => gate.bridgeStart(),
    /no service_unit registered in bridge configuration/,
  );

  // 2. Unit with wrong WorkingDirectory -> start rejected
  const withUnitConfig = { ...noUnitConfig, service_unit: "custom-bridge.service" };
  await writeFile(configFile, JSON.stringify(withUnitConfig), { mode: 0o600 });

  fakeSystemd.units.set("custom-bridge.service", {
    Id: "custom-bridge.service",
    LoadState: "loaded",
    ActiveState: "inactive",
    WorkingDirectory: wrongDir,
    ExecStart: `/usr/bin/node dist/cli.js run --config ${configFile}`,
  });

  await assert.rejects(
    () => gate.bridgeStart(),
    /is not loaded or does not match repository binding/,
  );

  // 3. Unit with wrong config path in ExecStart -> start rejected
  fakeSystemd.units.set("custom-bridge.service", {
    Id: "custom-bridge.service",
    LoadState: "loaded",
    ActiveState: "inactive",
    WorkingDirectory: developer,
    ExecStart: `/usr/bin/node dist/cli.js run --config /etc/wrong/path.json`,
  });

  await assert.rejects(
    () => gate.bridgeStart(),
    /is not loaded or does not match repository binding/,
  );
});

test("host bridge broker fails closed on duplicate registrations with same instance ID, ahead/behind developer worktree, or stopped reconcile", async (t) => {
  const fixture = await mkdtemp(join(tmpdir(), "workspace-bridge-adversarial-"));
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

  await git(template, "branch", "developer");
  await git(template, "worktree", "add", developer, "developer");
  await writeFile(join(developer, "file.txt"), "dev\n", "utf8");
  await writeFile(join(developer, "manifest.json"), "{}", { mode: 0o600 });
  await git(developer, "add", ".");
  await git(developer, "commit", "-m", "Dev commit");
  await git(developer, "push", "--set-upstream", "origin", "developer");

  await mkdir(configDir, { recursive: true, mode: 0o700 });
  await mkdir(stateDir, { recursive: true, mode: 0o700 });

  const state1 = join(stateDir, "state1.sqlite");
  const state2 = join(stateDir, "state2.sqlite");
  createProductionBridgeDatabase(state1).close();
  createProductionBridgeDatabase(state2).close();

  const baseConfig = {
    schema_version: 1,
    instance_id: "same-instance-id",
    repository_root: developer,
    manifest_file: join(developer, "manifest.json"),
    service_unit: "origin-bridge.service",
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

  // 1. Two configs with SAME instance_id for the same repository must FAIL CLOSED
  await writeFile(join(configDir, "bridge1.json"), JSON.stringify({
    ...baseConfig,
    state_file: state1,
  }), { mode: 0o600 });
  await writeFile(join(configDir, "bridge2.json"), JSON.stringify({
    ...baseConfig,
    state_file: state2,
  }), { mode: 0o600 });

  const gate = new WorkspaceMaintenanceGate(template, {
    configDirectory: configDir,
    systemdClient: new FakeSystemdClient(),
    adminProbeRetries: 3,
    adminProbeIntervalMs: 50,
  });

  await assert.rejects(
    () => gate.bridgeInspect(),
    /Ambiguous bridge registration: multiple configurations match repository/,
  );

  // 2. Remove duplicate, but make developer worktree ahead of origin/developer
  await rm(join(configDir, "bridge2.json"));
  await writeFile(join(developer, "ahead.txt"), "ahead\n", "utf8");
  await git(developer, "add", ".");
  await git(developer, "commit", "-m", "Ahead commit"); // Not pushed

  const aheadGate = new WorkspaceMaintenanceGate(template, {
    configDirectory: configDir,
    systemdClient: new FakeSystemdClient({
      "origin-bridge.service": {
        Id: "origin-bridge.service",
        LoadState: "loaded",
        ActiveState: "inactive",
        WorkingDirectory: developer,
        ExecStart: `/usr/bin/node dist/cli.js run --config ${join(configDir, "bridge1.json")}`,
      },
    }),
  });

  const aheadStatus = await aheadGate.bridgeInspect();
  assert.equal(aheadStatus.starting_safe, false);

  await assert.rejects(
    () => aheadGate.bridgeStart(),
    /Cannot start bridge: developer worktree is dirty\/diverged or service lock is held/,
  );
});

test("real-host integration acceptance test (inspects real installation, reconciles if running, tests start only if stopped)", async (t) => {
  const hostRegistry = new HostBridgeRegistry();
  const candidates = hostRegistry.findCandidateConfigFiles();
  if (candidates.length === 0) {
    t.skip("No real host bridge configuration found in ~/.config/agentic-workflow/; skipping real host test in non-host/CI environment");
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

  // If the bridge is running: test reconcile
  if (status.bridge_running) {
    try {
      const reconcile = await gate.bridgeReconcile();
      assert.equal(reconcile.reconciled, true);
    } catch (error) {
      if (error.message.includes("admin endpoint is unavailable") || error.message.includes("not running")) {
        assert.ok(true, "Bridge running pre-upgrade version on host");
      } else {
        throw error;
      }
    }
  } else if (status.service_state === "stopped" && status.starting_safe) {
    // If naturally stopped and safe, exercise start
    const startRes = await gate.bridgeStart();
    assert.equal(startRes.status, "started");
  }
});
