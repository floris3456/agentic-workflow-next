import assert from "node:assert/strict";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import test, { type TestContext } from "node:test";
import { Manifest } from "../src/manifest.js";
import { OpenCodeClient } from "../src/opencode.js";
import { RecoveryCoordinator } from "../src/recovery.js";
import { BridgeState } from "../src/state.js";
import { asRecord } from "../src/util.js";

const manifest = Manifest.load(resolve(import.meta.dirname, "../../../../contracts/opencode-bridge/operation-manifest.json"));

function asFetch(handler: (request: Request) => Response | Promise<Response>): typeof fetch {
  return (async (input: string | URL | Request, init?: RequestInit) => handler(new Request(input, init))) as typeof fetch;
}

function client(fetchImpl: typeof fetch): OpenCodeClient {
  return new OpenCodeClient({
    baseUrl: "http://127.0.0.1:4096",
    username: "bridge",
    password: "test-only-password",
    directory: "/work/project",
    manifest,
    fetch: fetchImpl,
  });
}

function stateForTest(context: TestContext): BridgeState {
  const root = mkdtempSync(join(tmpdir(), "opencode-bridge-recovery-"));
  const state = new BridgeState(join(root, "private", "bridge.sqlite"));
  context.after(() => {
    state.close();
    rmSync(root, { recursive: true, force: true });
  });
  return state;
}

function durable(id: string, sessionId: string, sequence: number, type = "session.next.step.started") {
  return {
    id,
    type,
    durable: { aggregateID: sessionId, seq: sequence, version: 1 },
    data: { sessionID: sessionId },
  };
}

test("recovery combines sync/session history, deduplicates IDs, advances cursors, and reconciles canonical state", async (context) => {
  const state = stateForTest(context);
  state.mapTaskSession("TASK-1", "ses_private", 17, "luna");
  state.recordEvent({
    eventKey: "opencode:evt_duplicate",
    source: "legacy-live",
    eventType: "session.next.step.started",
    payload: { id: "evt_duplicate", type: "session.next.step.started" },
  });
  const persisted: string[] = [];
  let reconciliationCount = 0;
  let recoveryPass = 0;
  const api = client(asFetch(async (request) => {
    const url = new URL(request.url);
    if (url.pathname === "/sync/history") {
      const body = await request.json();
      if (recoveryPass === 0) {
        assert.deepEqual(body, {});
        return Response.json([
          { id: "evt_sync", aggregate_id: "workspace-private", seq: 0, type: "workspace.ready", data: {} },
          { id: "evt_duplicate", aggregate_id: "ses_private", seq: 1, type: "session.next.step.started", data: { sessionID: "ses_private" } },
        ]);
      }
      assert.deepEqual(body, { "workspace-private": 0, ses_private: 1 });
      return Response.json([]);
    }
    if (url.pathname === "/api/session/ses_private/history") {
      if (recoveryPass === 0) {
        assert.equal(url.searchParams.has("after"), false);
        return Response.json({ data: [durable("evt_duplicate", "ses_private", 1), durable("evt_session_2", "ses_private", 2)], hasMore: false });
      }
      assert.equal(url.searchParams.get("after"), "2");
      return Response.json({ data: [], hasMore: false });
    }
    if (url.pathname === "/session/status") return Response.json({ ses_private: { type: "idle" } });
    if (url.pathname === "/session/ses_private/message") return Response.json([{ info: { id: "msg_private" }, parts: [] }]);
    if (url.pathname === "/session") return Response.json([{ id: "ses_private", title: "Task" }]);
    if (url.pathname === "/permission" || url.pathname === "/question") return Response.json([]);
    return new Response("not found", { status: 404 });
  }));
  const recovery = new RecoveryCoordinator({
    client: api,
    state,
    onPersistedEvent: (event) => {
      persisted.push(event.eventId);
    },
    onReconciled: () => {
      reconciliationCount++;
    },
  });

  await recovery.recoverOnce();
  assert.deepEqual(persisted, ["evt_sync", "evt_session_2"]);
  assert.deepEqual(state.durableCursors("sync-history"), { "workspace-private": 0, ses_private: 1 });
  assert.deepEqual(state.durableCursors("session-v2"), { ses_private: 2 });
  assert.deepEqual(state.listEvents("TASK-1").map((event) => event.eventType), ["session.next.step.started", "session.next.step.started"]);
  const snapshot = state.reconciliation("canonical")?.value;
  assert.ok(snapshot && !Array.isArray(snapshot) && typeof snapshot === "object");
  assert.deepEqual(snapshot.taskMessages, { "TASK-1": [{ info: { id: "msg_private" }, parts: [] }] });

  recoveryPass = 1;
  await recovery.recoverOnce();
  assert.deepEqual(persisted, ["evt_sync", "evt_session_2"]);
  assert.equal(reconciliationCount, 2);
});

test("session history pagination advances exclusively and fails when a page makes no progress", async (context) => {
  const state = stateForTest(context);
  state.mapTaskSession("TASK-1", "ses_private", 17, "luna");
  const afterValues: Array<string | null> = [];
  const api = client(asFetch((request) => {
    const url = new URL(request.url);
    afterValues.push(url.searchParams.get("after"));
    if (afterValues.length === 1) {
      return Response.json({ data: [durable("evt_0", "ses_private", 0), durable("evt_1", "ses_private", 1)], hasMore: true });
    }
    return Response.json({ data: [durable("evt_2", "ses_private", 2)], hasMore: false });
  }));
  const recovery = new RecoveryCoordinator({ client: api, state });
  assert.equal(await recovery.recoverSessionHistory(state.getTaskSession("TASK-1")!), 3);
  assert.deepEqual(afterValues, [null, "1"]);
  assert.equal(state.durableCursor("session-v2", "ses_private"), 2);

  const stalled = new RecoveryCoordinator({
    client: client(asFetch(() => Response.json({ data: [], hasMore: true }))),
    state,
  });
  await assert.rejects(stalled.recoverSessionHistory(state.getTaskSession("TASK-1")!), /pagination made no progress/);
});

test("terminal event, durable cursor, and response delivery survive the callback crash window atomically", async (context) => {
  const root = mkdtempSync(join(tmpdir(), "opencode-bridge-terminal-atomic-"));
  const statePath = join(root, "private", "bridge.sqlite");
  context.after(() => rmSync(root, { recursive: true, force: true }));

  const initial = new BridgeState(statePath);
  initial.mapTaskSession("TASK-ATOMIC", "ses_atomic", 91, "luna");
  const api = client(asFetch((request) => {
    const url = new URL(request.url);
    assert.equal(url.pathname, "/api/session/ses_atomic/history");
    if (url.searchParams.get("after") === "7") return Response.json({ data: [], hasMore: false });
    return Response.json({
      data: [durable("evt_atomic_idle", "ses_atomic", 7, "session.idle")],
      hasMore: false,
    });
  }));
  const interrupted = new RecoveryCoordinator({
    client: api,
    state: initial,
    onPersistedEvent: () => {
      assert.equal(initial.pendingResponseDeliveries()[0]?.eventId, "evt_atomic_idle");
      throw new Error("simulated process stop after durable event commit");
    },
  });
  await assert.rejects(
    interrupted.recoverSessionHistory(initial.getTaskSession("TASK-ATOMIC")!),
    /simulated process stop/,
  );
  initial.close();

  const restarted = new BridgeState(statePath);
  context.after(() => restarted.close());
  assert.equal(restarted.durableCursor("session-v2", "ses_atomic"), 7);
  assert.equal(restarted.getTaskSession("TASK-ATOMIC")?.sessionState, "session.idle");
  assert.deepEqual(restarted.pendingResponseDeliveries().map((delivery) => delivery.eventId), ["evt_atomic_idle"]);

  const resumed = new RecoveryCoordinator({ client: api, state: restarted });
  assert.equal(await resumed.recoverSessionHistory(restarted.getTaskSession("TASK-ATOMIC")!), 0);
  assert.deepEqual(restarted.pendingResponseDeliveries().map((delivery) => delivery.eventId), ["evt_atomic_idle"]);
});

test("startup repair queues a terminal event persisted by an older bridge without replay", (context) => {
  const state = stateForTest(context);
  state.mapTaskSession("TASK-LEGACY", "ses_legacy", 92, "luna");
  state.recordEvent({
    eventKey: "opencode:evt_legacy_idle",
    source: "session-v2",
    eventType: "session.idle",
    taskId: "TASK-LEGACY",
    sessionId: "ses_legacy",
    sessionKind: "developer",
    aggregateId: "ses_legacy",
    durableSeq: 4,
    payload: durable("evt_legacy_idle", "ses_legacy", 4, "session.idle"),
  });
  assert.equal(state.pendingResponseDeliveries().length, 0);
  assert.equal(state.recoverTerminalResponseDeliveries(), 1);
  assert.equal(state.recoverTerminalResponseDeliveries(), 0);
  assert.deepEqual(state.pendingResponseDeliveries().map((delivery) => delivery.eventId), ["evt_legacy_idle"]);
  assert.equal(state.durableCursor("session-v2", "ses_legacy"), 4);
});

test("canonical reconciliation records a missing mapped session without hiding other state", async (context) => {
  const state = stateForTest(context);
  state.mapTaskSession("TASK-1", "ses_missing", 17, "luna");
  const api = client(asFetch((request) => {
    const path = new URL(request.url).pathname;
    if (path === "/sync/history") return Response.json([]);
    if (path === "/api/session/ses_missing/history") return new Response("missing", { status: 404 });
    if (path === "/session/ses_missing/message") return new Response("missing", { status: 404 });
    if (path === "/session") return Response.json([]);
    if (path === "/session/status") return Response.json({});
    if (path === "/permission" || path === "/question") return Response.json([]);
    return new Response("not found", { status: 404 });
  }));
  const recovery = new RecoveryCoordinator({ client: api, state });
  await recovery.recoverOnce();
  const snapshot = state.reconciliation("canonical")?.value;
  const snapshotRecord = asRecord(snapshot, "canonical snapshot");
  assert.deepEqual(snapshot, {
    capturedAt: snapshotRecord.capturedAt,
    sessions: [],
    status: {},
    permissions: [],
    questions: [],
    taskMessages: { "TASK-1": { missing: true } },
  });
});

test("project SSE is persisted before notification and maps private sessions locally", async (context) => {
  const state = stateForTest(context);
  state.mapTaskSession("TASK-1", "ses_private", 17, "luna");
  const abort = new AbortController();
  const encoder = new TextEncoder();
  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      controller.enqueue(encoder.encode('data: {"id":"evt_live","type":"message.updated","properties":{"info":{"id":"msg_private","sessionID":"ses_private"}}}\n\n'));
    },
  });
  const api = client(asFetch((request) => {
    const path = new URL(request.url).pathname;
    if (path === "/sync/history") return Response.json([]);
    if (path === "/api/session/ses_private/history") return Response.json({ data: [], hasMore: false });
    if (path === "/event") return new Response(stream, { headers: { "content-type": "text/event-stream" } });
    if (path === "/session/ses_private/message") return Response.json([]);
    if (path === "/session/status") return Response.json({});
    if (path === "/session") return Response.json([]);
    if (path === "/permission" || path === "/question") return Response.json([]);
    return new Response("not found", { status: 404 });
  }));
  const recovery = new RecoveryCoordinator({
    client: api,
    state,
    onPersistedEvent: (event) => {
      assert.equal(state.listEvents("TASK-1").some((stored) => asRecord(stored.payload, "stored event").id === event.eventId), true);
      abort.abort();
    },
  });
  await recovery.run(abort.signal, () => 0);
  assert.equal(asRecord(state.listEvents("TASK-1")[0]?.payload, "stored event").id, "evt_live");
});

test("durable session SSE resumes from its stored cursor", async (context) => {
  const state = stateForTest(context);
  state.mapTaskSession("TASK-1", "ses_private", 17, "luna");
  state.setDurableCursor("session-v2", "ses_private", 2);
  const abort = new AbortController();
  const queries: string[] = [];
  const encoder = new TextEncoder();
  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      controller.enqueue(encoder.encode(`data: ${JSON.stringify(durable("evt_3", "ses_private", 3))}\n\n`));
    },
  });
  const api = client(asFetch((request) => {
    const url = new URL(request.url);
    queries.push(`${url.pathname}?${url.searchParams.toString()}`);
    if (url.pathname.endsWith("/history")) return Response.json({ data: [], hasMore: false });
    if (url.pathname.endsWith("/event")) return new Response(stream, { headers: { "content-type": "text/event-stream" } });
    return new Response("not found", { status: 404 });
  }));
  const recovery = new RecoveryCoordinator({
    client: api,
    state,
    onPersistedEvent: () => abort.abort(),
  });
  await recovery.runSession(state.getTaskSession("TASK-1")!, abort.signal, () => 0);
  assert.deepEqual(queries, [
    "/api/session/ses_private/history?limit=100&after=2",
    "/api/session/ses_private/event?after=2",
  ]);
  assert.equal(state.durableCursor("session-v2", "ses_private"), 3);
});
