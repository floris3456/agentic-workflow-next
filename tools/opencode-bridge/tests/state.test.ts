import assert from "node:assert/strict";
import { chmodSync, mkdtempSync, rmSync, statSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { DatabaseSync } from "node:sqlite";
import test, { type TestContext } from "node:test";
import { BridgeState } from "../src/state.js";
import type { CommandEnvelope, CompatibilityResult } from "../src/types.js";

function stateForTest(context: TestContext): { state: BridgeState; path: string } {
  const root = mkdtempSync(join(tmpdir(), "opencode-bridge-state-"));
  const path = join(root, "private", "bridge.sqlite");
  const state = new BridgeState(path);
  context.after(() => {
    state.close();
    rmSync(root, { recursive: true, force: true });
  });
  return { state, path };
}

function envelope(commandId: string, sequence: number, overrides: Partial<CommandEnvelope> = {}): CommandEnvelope {
  return {
    protocol: "agentic-bridge/1",
    sequence,
    command_id: commandId,
    task_id: "TASK-1",
    kind: "status",
    arguments: {},
    ...overrides,
  };
}

test("SQLite state creates private durable files and metadata", (context) => {
  const { state, path } = stateForTest(context);
  assert.equal(statSync(path).mode & 0o777, 0o600);
  assert.equal(statSync(join(path, "..")).mode & 0o777, 0o700);
  assert.equal(state.getMeta("schema_version"), "5");
  state.setMeta("instance", "project-one");
  assert.equal(state.getMeta("instance"), "project-one");
});

test("command ledger requires sequence one, contiguous progress, and one nonterminal command", (context) => {
  const { state } = stateForTest(context);
  const early = envelope("00000000-0000-4000-8000-000000000002", 2);
  assert.equal(state.acceptCommand(early, 10).disposition, "rejected");
  assert.match(state.commandRejection(early.command_id)?.reason ?? "", /exactly 1/);
  assert.equal(state.acceptCommand(early, 10).disposition, "rejected");

  const first = envelope("11111111-1111-4111-8111-111111111111", 1);
  assert.equal(state.acceptCommand(first, 10).disposition, "new");
  assert.equal(state.acceptCommand(first, 10).disposition, "duplicate");
  assert.equal(state.acceptCommand({ ...first, kind: "abort" }, 10).disposition, "conflict");
  assert.equal(state.acceptCommand(envelope("22222222-2222-4222-8222-222222222222", 1), 10).disposition, "conflict");

  const blocked = envelope("33333333-3333-4333-8333-333333333333", 2);
  assert.equal(state.acceptCommand(blocked, 10).disposition, "rejected");
  assert.match(state.commandRejection(blocked.command_id)?.reason ?? "", /nonterminal/);

  assert.equal(state.beginCommand(first.command_id).state, "applying");
  const blockedApplying = envelope("44444444-4444-4444-8444-444444444444", 2);
  assert.equal(state.acceptCommand(blockedApplying, 10).disposition, "rejected");
  assert.match(state.commandRejection(blockedApplying.command_id)?.reason ?? "", /applying/);
  assert.throws(() => state.beginCommand(first.command_id), /cannot begin from applying/);
  const complete = state.finishCommand(first.command_id, "succeeded", { internal: true }, { status: "ok" });
  assert.equal(complete.state, "succeeded");
  assert.deepEqual(complete.rawResult, { internal: true });
  assert.deepEqual(complete.publicResult, { status: "ok" });
  assert.throws(() => state.beginCommand(first.command_id), /cannot begin from succeeded/);

  const second = envelope("55555555-5555-4555-8555-555555555552", 2);
  assert.equal(state.acceptCommand(second, 10).disposition, "new");
  const gap = envelope("66666666-6666-4666-8666-666666666664", 4);
  assert.equal(state.acceptCommand(gap, 10).disposition, "rejected");
  assert.match(state.commandRejection(gap.command_id)?.reason ?? "", /exactly 3/);
  state.beginCommand(second.command_id);
  state.finishCommand(second.command_id, "failed", undefined, { error: "expected test failure" });
  assert.equal(state.acceptCommand(envelope("77777777-7777-4777-8777-777777777773", 3), 10).disposition, "new");
});

test("command ledger reconstructs the next sequence after reopen without trusting the legacy counter table", (context) => {
  const root = mkdtempSync(join(tmpdir(), "opencode-bridge-sequence-reopen-"));
  const path = join(root, "private", "bridge.sqlite");
  context.after(() => rmSync(root, { recursive: true, force: true }));

  const initial = new BridgeState(path);
  const first = envelope("81818181-8181-4181-8181-818181818181", 1);
  assert.equal(initial.acceptCommand(first, 10).disposition, "new");
  initial.beginCommand(first.command_id);
  initial.finishCommand(first.command_id, "succeeded", null, { status: "ok" });
  initial.close();

  const legacy = new DatabaseSync(path);
  legacy.prepare("INSERT OR REPLACE INTO task_sequences(task_id, last_sequence, updated_at) VALUES (?, ?, ?)")
    .run("TASK-1", 99, 0);
  legacy.close();

  const reopened = new BridgeState(path);
  context.after(() => reopened.close());
  assert.equal(
    reopened.acceptCommand(envelope("82828282-8282-4282-8282-828282828282", 2), 10).disposition,
    "new",
  );
});

test("mandatory Git guards reject durably before consuming sequence", (context) => {
  const { state } = stateForTest(context);
  const nested = envelope("18181818-1818-4181-8181-181818181818", 1, {
    kind: "start",
    arguments: {
      brief: "Malformed guarded start",
      expected: { developer_sha: "a".repeat(40), ref: "developer" },
    },
  });
  assert.equal(state.acceptCommand(nested, 10).disposition, "rejected");
  assert.match(state.commandRejection(nested.command_id)?.reason ?? "", /top-level expected/);

  const wrongRef = envelope("28282828-2828-4282-8282-282828282828", 1, {
    kind: "start",
    arguments: { brief: "Wrong-ref guarded start" },
    expected: { developer_sha: "a".repeat(40), ref: "refs/heads/developer" },
  });
  assert.equal(state.acceptCommand(wrongRef, 10).disposition, "rejected");
  assert.match(state.commandRejection(wrongRef.command_id)?.reason ?? "", /expected\.ref developer/);

  const valid = envelope("38383838-3838-4383-8383-383838383838", 1, {
    kind: "start",
    arguments: { brief: "Canonical guarded start" },
    expected: { developer_sha: "a".repeat(40), ref: "developer" },
  });
  assert.equal(state.acceptCommand(valid, 10).disposition, "new");
  state.beginCommand(valid.command_id);
  state.finishCommand(valid.command_id, "succeeded", undefined, { status: "ok" });

  const promotion = envelope("48484848-4848-4484-8484-484848484848", 2, {
    kind: "promotion.apply",
    arguments: { approved_sha: "a".repeat(40) },
  });
  assert.equal(state.acceptCommand(promotion, 10).disposition, "rejected");
  assert.match(state.commandRejection(promotion.command_id)?.reason ?? "", /top-level expected/);

  const wrongWorkspace = envelope("58585858-5858-4585-8585-585858585858", 1, {
    task_id: "TASK-WORKSPACE",
    kind: "workspace.start",
    arguments: { brief: "Wrong workspace guard" },
    expected: { developer_sha: "b".repeat(40), ref: "developer" },
  });
  assert.equal(state.acceptCommand(wrongWorkspace, 11).disposition, "rejected");
  assert.match(state.commandRejection(wrongWorkspace.command_id)?.reason ?? "", /template_development_sha/);

  const validWorkspace = envelope("68686868-6868-4686-8686-686868686868", 1, {
    task_id: "TASK-WORKSPACE",
    kind: "workspace.start",
    arguments: { brief: "Canonical workspace guard" },
    expected: { template_development_sha: "b".repeat(40), ref: "template-development" },
  });
  assert.equal(state.acceptCommand(validWorkspace, 11).disposition, "new");
  assert.equal(state.taskKind("TASK-WORKSPACE"), "workspace");
});

test("an interrupted applying command remains non-reissuable after restart", (context) => {
  const root = mkdtempSync(join(tmpdir(), "opencode-bridge-restart-"));
  const path = join(root, "private", "bridge.sqlite");
  const command = envelope("55555555-5555-4555-8555-555555555555", 1);
  const first = new BridgeState(path);
  first.acceptCommand(command, 11);
  first.beginCommand(command.command_id);
  first.close();

  const recovered = new BridgeState(path);
  context.after(() => {
    recovered.close();
    rmSync(root, { recursive: true, force: true });
  });
  assert.equal(recovered.getCommand(command.command_id)?.state, "applying");
  assert.throws(() => recovered.beginCommand(command.command_id), /cannot begin from applying/);
  assert.equal(recovered.finishCommand(command.command_id, "indeterminate", undefined, { status: "operator-review" }).state, "indeterminate");
});

test("task, alias, event, and durable cursor mappings survive projection needs", (context) => {
  const { state } = stateForTest(context);
  state.mapTaskSession("TASK-1", "ses_private", 17, "luna");
  assert.deepEqual(state.getTaskSession("TASK-1"), state.listTaskSessions()[0]);
  state.mapTaskSession("TASK-1", "ses_private", 18, "luna");
  assert.equal(state.getTaskSession("TASK-1")?.issueNumber, 18);
  state.updateTaskAgent("TASK-1", "sol");
  assert.equal(state.getTaskSession("TASK-1")?.agent, "sol");

  const alias = state.ensureAlias("session", "ses_private", "TASK-1");
  assert.equal(alias, "session-1");
  assert.equal(state.ensureAlias("session", "ses_private", "TASK-1"), alias);
  assert.equal(state.resolveAlias(alias, "session"), "ses_private");
  assert.equal(state.aliasFor("ses_private"), alias);
  assert.throws(() => state.resolveAlias(alias, "pty"), /not pty/);

  const workspaceOne = state.ensureAlias("workspace", "wrk_shared", "TASK-1");
  const workspaceTwo = state.ensureAlias("workspace", "wrk_shared", "TASK-2");
  assert.notEqual(workspaceOne, workspaceTwo);
  assert.equal(state.resolveAlias(workspaceOne, "workspace", "TASK-1"), "wrk_shared");
  assert.equal(state.resolveAlias(workspaceTwo, "workspace", "TASK-2"), "wrk_shared");
  assert.throws(() => state.resolveAlias(workspaceOne, "workspace", "TASK-2"), /not available/);

  const recorded = state.recordEvent({
    eventKey: "session:ses_private:1",
    source: "session-v2",
    eventType: "message.updated",
    taskId: "TASK-1",
    sessionId: "ses_private",
    aggregateId: "ses_private",
    durableSeq: 1,
    payload: { id: "raw-private-id" },
  });
  assert.equal(recorded, true);
  assert.equal(state.recordEvent({
    eventKey: "session:ses_private:1",
    source: "session-v2",
    eventType: "message.updated",
    payload: { id: "duplicate" },
  }), false);
  assert.deepEqual(state.durableCursors("session-v2"), { ses_private: 1 });
  assert.equal(state.listEvents("TASK-1")[0]?.eventType, "message.updated");
});

test("resolved interaction continuation is persisted and claimable only once", (context) => {
  const root = mkdtempSync(join(tmpdir(), "opencode-bridge-interaction-"));
  const path = join(root, "private", "bridge.sqlite");
  const state = new BridgeState(path);
  state.mapTaskSession("TASK-INTERACTION", "ses_interaction", 19, "small-developer");
  state.recordInteraction({
    interactionId: "per_interaction",
    kind: "permission",
    taskId: "TASK-INTERACTION",
    sessionId: "ses_interaction",
  });
  assert.equal(state.interaction("per_interaction", "TASK-INTERACTION", "permission")?.state, "pending");
  assert.equal(state.resolveInteraction("per_interaction", "permission", "TASK-INTERACTION")?.state, "resolved");
  assert.equal(state.claimInteractionContinuation({
    interactionId: "per_interaction",
    kind: "permission",
    taskId: "TASK-INTERACTION",
    sessionId: "ses_interaction",
  }), "claimed");
  state.markInteractionContinuationSent("per_interaction", "TASK-INTERACTION", "permission", "ses_interaction");
  assert.equal(state.claimInteractionContinuation({
    interactionId: "per_interaction",
    kind: "permission",
    taskId: "TASK-INTERACTION",
    sessionId: "ses_interaction",
  }), "already-attempted");
  state.close();

  const reopened = new BridgeState(path);
  context.after(() => {
    reopened.close();
    rmSync(root, { recursive: true, force: true });
  });
  const record = reopened.interaction("per_interaction", "TASK-INTERACTION", "permission");
  assert.equal(record?.state, "resolved");
  assert.equal(record?.nudgeState, "sent");
  assert.equal(reopened.claimInteractionContinuation({
    interactionId: "per_interaction",
    kind: "permission",
    taskId: "TASK-INTERACTION",
    sessionId: "ses_interaction",
  }), "already-attempted");
});

test("schema migration replaces global alias identity with task-bound scope", (context) => {
  const root = mkdtempSync(join(tmpdir(), "opencode-bridge-v1-"));
  const path = join(root, "bridge.sqlite");
  const legacy = new DatabaseSync(path);
  legacy.exec(`
    CREATE TABLE meta (key TEXT PRIMARY KEY, value TEXT NOT NULL, updated_at INTEGER NOT NULL);
    INSERT INTO meta(key, value, updated_at) VALUES ('schema_version', '1', 0);
    CREATE TABLE aliases (
      alias TEXT PRIMARY KEY,
      kind TEXT NOT NULL,
      internal_id TEXT NOT NULL UNIQUE,
      task_id TEXT,
      created_at INTEGER NOT NULL
    );
    INSERT INTO aliases(alias, kind, internal_id, task_id, created_at)
      VALUES ('workspace-1', 'workspace', 'wrk_shared', 'TASK-1', 0);
  `);
  legacy.close();
  chmodSync(path, 0o600);

  const migrated = new BridgeState(path);
  context.after(() => {
    migrated.close();
    rmSync(root, { recursive: true, force: true });
  });
  assert.equal(migrated.getMeta("schema_version"), "5");
  assert.equal(migrated.ensureAlias("workspace", "wrk_shared", "TASK-1"), "workspace-1");
  const second = migrated.ensureAlias("workspace", "wrk_shared", "TASK-2");
  assert.equal(second, "workspace-2");
  assert.throws(() => migrated.resolveAlias(second, "workspace", "TASK-1"), /not available/);
});

test("schema migration extends v2 events and response deliveries for Scout correlation", (context) => {
  const root = mkdtempSync(join(tmpdir(), "opencode-bridge-v2-"));
  const path = join(root, "bridge.sqlite");
  const legacy = new DatabaseSync(path);
  legacy.exec(`
    CREATE TABLE meta (key TEXT PRIMARY KEY, value TEXT NOT NULL, updated_at INTEGER NOT NULL);
    INSERT INTO meta(key, value, updated_at) VALUES ('schema_version', '2', 0);
    CREATE TABLE events (
      journal_id INTEGER PRIMARY KEY AUTOINCREMENT, event_key TEXT NOT NULL UNIQUE,
      source TEXT NOT NULL, event_type TEXT NOT NULL,
      task_id TEXT, session_id TEXT, payload_json TEXT NOT NULL,
      aggregate_id TEXT, durable_seq INTEGER, received_at INTEGER NOT NULL
    );
    CREATE TABLE response_deliveries (
      event_id TEXT PRIMARY KEY, task_id TEXT NOT NULL, session_id TEXT NOT NULL,
      issue_number INTEGER NOT NULL, event_type TEXT NOT NULL,
      attempts INTEGER NOT NULL DEFAULT 0, queued_at INTEGER, last_error TEXT,
      created_at INTEGER NOT NULL, updated_at INTEGER NOT NULL
    );
    INSERT INTO response_deliveries(
      event_id, task_id, session_id, issue_number, event_type, created_at, updated_at
    ) VALUES ('evt_legacy_idle', 'TASK-LEGACY', 'ses_legacy', 10, 'session.idle', 1, 1);
  `);
  legacy.close();
  chmodSync(path, 0o600);

  const migrated = new BridgeState(path);
  context.after(() => {
    migrated.close();
    rmSync(root, { recursive: true, force: true });
  });
  assert.equal(migrated.getMeta("schema_version"), "5");
  assert.equal(migrated.pendingResponseDeliveries()[0]?.deliveryKind, "developer");

  const requestId = "88888888-8888-4888-8888-888888888888";
  migrated.mapScoutSession({
    requestId,
    taskId: "TASK-SCOUT",
    sessionId: "ses_scout",
    issueNumber: 20,
    refSha: "a".repeat(40),
    workspacePath: "/private/scout",
  });
  assert.equal(migrated.recordEvent({
    eventKey: "opencode:evt_scout_idle",
    source: "session-v2",
    eventType: "session.idle",
    taskId: "TASK-SCOUT",
    sessionId: "ses_scout",
    requestId,
    sessionKind: "scout",
    payload: { type: "session.idle" },
  }), true);
  migrated.queueResponseDelivery({
    eventId: "evt_scout_idle",
    taskId: "TASK-SCOUT",
    sessionId: "ses_scout",
    issueNumber: 20,
    eventType: "session.idle",
    deliveryKind: "scout",
    requestId,
  });
  const scoutDelivery = migrated.pendingResponseDeliveries().find((entry) => entry.eventId === "evt_scout_idle");
  assert.equal(scoutDelivery?.deliveryKind, "scout");
  assert.equal(scoutDelivery?.requestId, requestId);
});


test("task-session kind migration is durable and rejects unknown stored runtimes", (context) => {
  const root = mkdtempSync(join(tmpdir(), "opencode-bridge-session-kind-"));
  const path = join(root, "bridge.sqlite");
  context.after(() => rmSync(root, { recursive: true, force: true }));

  const legacy = new DatabaseSync(path);
  legacy.exec(`
    CREATE TABLE meta (key TEXT PRIMARY KEY, value TEXT NOT NULL, updated_at INTEGER NOT NULL);
    INSERT INTO meta(key, value, updated_at) VALUES ('schema_version', '4', 0);
    CREATE TABLE task_sessions (
      task_id TEXT PRIMARY KEY, session_id TEXT NOT NULL UNIQUE,
      issue_number INTEGER NOT NULL, agent TEXT NOT NULL,
      session_state TEXT NOT NULL DEFAULT 'unknown',
      latest_response_json TEXT, latest_event_id TEXT,
      created_at INTEGER NOT NULL, updated_at INTEGER NOT NULL
    );
    INSERT INTO task_sessions(
      task_id, session_id, issue_number, agent, session_state, created_at, updated_at
    ) VALUES ('TASK-LEGACY', 'ses_legacy_task', 40, 'small-developer', 'starting', 1, 1);
  `);
  legacy.close();
  chmodSync(path, 0o600);

  const migrated = new BridgeState(path);
  assert.equal(migrated.getTaskSession("TASK-LEGACY")?.sessionKind, "developer");
  migrated.mapTaskSession("TASK-WORKSPACE", "ses_workspace_task", 41, "workspace-maintainer", "workspace");
  assert.equal(migrated.getTaskSession("TASK-WORKSPACE")?.sessionKind, "workspace");
  migrated.close();

  const reopened = new BridgeState(path);
  assert.equal(reopened.getTaskSession("TASK-WORKSPACE")?.sessionKind, "workspace");
  assert.equal(reopened.sessionBindingForInternal("ses_workspace_task")?.sessionKind, "workspace");
  reopened.close();

  const invalidPath = join(root, "invalid.sqlite");
  const invalid = new DatabaseSync(invalidPath);
  invalid.exec(`
    CREATE TABLE task_sessions (
      task_id TEXT PRIMARY KEY, session_id TEXT NOT NULL UNIQUE,
      issue_number INTEGER NOT NULL, agent TEXT NOT NULL, session_kind TEXT NOT NULL,
      session_state TEXT NOT NULL DEFAULT 'unknown',
      latest_response_json TEXT, latest_event_id TEXT,
      created_at INTEGER NOT NULL, updated_at INTEGER NOT NULL
    );
    INSERT INTO task_sessions(
      task_id, session_id, issue_number, agent, session_kind, session_state, created_at, updated_at
    ) VALUES ('TASK-INVALID', 'ses_invalid', 42, 'unknown', 'foreign', 'starting', 1, 1);
  `);
  invalid.close();
  chmodSync(invalidPath, 0o600);
  assert.throws(() => new BridgeState(invalidPath), /invalid task session kind/i);
});

test("outbox retries idempotently and compatibility records remain queryable", (context) => {
  const { state } = stateForTest(context);
  state.enqueue("result:TASK-1:1", "comment", 23, { body: "safe" });
  state.enqueue("result:TASK-1:1", "comment", 23, { body: "duplicate" });
  const first = state.pendingOutbox()[0];
  assert.ok(first);
  assert.equal(state.pendingOutbox().length, 1);
  state.retryOutbox(first.id, "temporary", 0);
  const retried = state.pendingOutbox()[0];
  assert.equal(retried?.attempts, 1);
  state.deliverOutbox(first.id);
  assert.equal(state.pendingOutbox().length, 0);

  const result: CompatibilityResult = {
    compatible: false,
    runningVersion: "1.18.17",
    expectedVersion: "1.18.16",
    actualHash: "actual",
    expectedHash: "expected",
    added: ["new.operation"],
    removed: [],
    changed: [],
  };
  state.recordCompatibility("project-one", result);
  assert.deepEqual(state.compatibility("project-one"), { ...result, checkedAt: state.compatibility("project-one")?.checkedAt });
  state.setReconciliation("TASK-1", { status: "idle" });
  state.setEtag("issues", "etag-one", { page: 1 });
  assert.equal(state.etag("issues"), "etag-one");
});

test("PTY output is durably cursor-addressed and bounded", (context) => {
  const { state } = stateForTest(context);
  state.mapPty("pty-1", "pty_private", "TASK-1");
  state.appendPtyOutput("pty-1", "hello", 0, 5);
  state.appendPtyOutput("pty-1", " world", 5, 11);
  assert.throws(() => state.appendPtyOutput("pty-1", "gap", 12, 15), /Non-contiguous PTY output/);
  assert.throws(() => state.appendPtyOutput("missing", "text", 0, 4), /Unknown PTY alias/);
  assert.deepEqual(state.pty("pty-1"), { ptyId: "pty_private", taskId: "TASK-1", cursor: 11, status: "connected" });
  assert.deepEqual(state.readPty("pty-1", 3, 4), { text: "lo w", cursor: 7, truncated: true });
  assert.deepEqual(state.readPty("pty-1", 7), { text: "orld", cursor: 11, truncated: false });
  state.updatePty("pty-1", "disconnected");
  assert.equal(state.pty("pty-1")?.status, "disconnected");
});
