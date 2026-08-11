import assert from "node:assert/strict";
import { mkdtempSync, rmSync, statSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
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
  assert.equal(state.getMeta("schema_version"), "1");
  state.setMeta("instance", "project-one");
  assert.equal(state.getMeta("instance"), "project-one");
});

test("command ledger is idempotent, monotonic, and fail-closed while applying", (context) => {
  const { state } = stateForTest(context);
  const first = envelope("11111111-1111-4111-8111-111111111111", 1);
  assert.equal(state.acceptCommand(first, 10).disposition, "new");
  assert.equal(state.acceptCommand(first, 10).disposition, "duplicate");
  assert.equal(state.acceptCommand({ ...first, kind: "abort" }, 10).disposition, "conflict");
  assert.equal(state.acceptCommand(envelope("22222222-2222-4222-8222-222222222222", 1), 10).disposition, "conflict");

  const second = envelope("33333333-3333-4333-8333-333333333333", 3);
  assert.equal(state.acceptCommand(second, 10).disposition, "new");
  const stale = state.acceptCommand(envelope("44444444-4444-4444-8444-444444444444", 2), 10);
  assert.equal(stale.disposition, "stale");
  assert.equal(stale.command.state, "rejected");
  assert.match(stale.command.error ?? "", /latest is 3/);

  assert.equal(state.beginCommand(first.command_id).state, "applying");
  assert.throws(() => state.beginCommand(first.command_id), /cannot begin from applying/);
  const complete = state.finishCommand(first.command_id, "succeeded", { internal: true }, { status: "ok" });
  assert.equal(complete.state, "succeeded");
  assert.deepEqual(complete.rawResult, { internal: true });
  assert.deepEqual(complete.publicResult, { status: "ok" });
  assert.throws(() => state.beginCommand(first.command_id), /cannot begin from succeeded/);
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
