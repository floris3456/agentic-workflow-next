import assert from "node:assert/strict";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import test, { type TestContext } from "node:test";
import { Manifest } from "../src/manifest.js";
import { OpenCodeClient } from "../src/opencode.js";
import { RecoveryCoordinator } from "../src/recovery.js";
import { BridgeState } from "../src/state.js";
import type { JsonValue } from "../src/types.js";
import { asRecord } from "../src/util.js";

const manifest = Manifest.load(resolve(import.meta.dirname, "../../../../contracts/opencode-bridge/operation-manifest.json"));

function asFetch(handler: (request: Request) => Response | Promise<Response>): typeof fetch {
  return (async (input: string | URL | Request, init?: RequestInit) => handler(new Request(input, init))) as typeof fetch;
}

function client(fetchImpl: typeof fetch, directory = "/work/project"): OpenCodeClient {
  return new OpenCodeClient({
    baseUrl: "http://127.0.0.1:4096",
    username: "bridge",
    password: "test-only-password",
    directory,
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

function liveSession(id: string, updated = 1) {
  return { id, time: { created: 0, updated } };
}

test("recovery combines sync/session history, deduplicates IDs, and advances cursors", async (context) => {
  const state = stateForTest(context);
  state.mapTaskSession("TASK-1", "ses_private", 17, "luna");
  state.recordEvent({
    eventKey: "opencode:evt_duplicate",
    source: "legacy-live",
    eventType: "session.next.step.started",
    payload: { id: "evt_duplicate", type: "session.next.step.started" },
  });
  const persisted: string[] = [];
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
    if (url.pathname === "/permission" || url.pathname === "/question") return Response.json([]);
    return new Response("not found", { status: 404 });
  }));
  const recovery = new RecoveryCoordinator({
    client: api,
    state,
    onPersistedEvent: (event) => {
      persisted.push(event.eventId);
    },
  });

  await recovery.recoverOnce();
  assert.deepEqual(persisted, ["evt_sync", "evt_session_2"]);
  assert.deepEqual(state.durableCursors("sync-history"), { "workspace-private": 0, ses_private: 1 });
  assert.deepEqual(state.durableCursors("session-v2"), { ses_private: 2 });
  assert.deepEqual(state.listEvents("TASK-1").map((event) => event.eventType), ["session.next.step.started", "session.next.step.started"]);

  recoveryPass = 1;
  await recovery.recoverOnce();
  assert.deepEqual(persisted, ["evt_sync", "evt_session_2"]);
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

test("canonical recovery republishes pending mapped interactions idempotently without materializing a snapshot", async (context) => {
  const state = stateForTest(context);
  state.mapTaskSession("TASK-1", "ses_pending", 17, "luna");
  const published: Array<{ eventId: string; eventType: string; taskId?: string }> = [];
  const paths: string[] = [];
  const api = client(asFetch((request) => {
    const path = new URL(request.url).pathname;
    paths.push(path);
    if (path === "/sync/history") return Response.json([]);
    if (path === "/api/session/ses_pending/history") return new Response("missing", { status: 404 });
    if (path === "/permission") {
      return Response.json([
        { id: "per_pending", sessionID: "ses_pending", permission: "external_directory", patterns: ["/outside"], metadata: {}, always: [] },
        { id: "per_unmapped", sessionID: "ses_unmapped", permission: "read", patterns: ["*"], metadata: {}, always: [] },
      ]);
    }
    if (path === "/question") {
      return Response.json([{ id: "que_pending", sessionID: "ses_pending", questions: [{ question: "Continue?", header: "Continue", options: [] }] }]);
    }
    return new Response("not found", { status: 404 });
  }));
  const recovery = new RecoveryCoordinator({
    client: api,
    state,
    onPersistedEvent: (event) => {
      published.push({
        eventId: event.eventId,
        eventType: event.eventType,
        ...(event.taskId ? { taskId: event.taskId } : {}),
      });
    },
  });
  await recovery.recoverOnce();
  const firstIds = published.map((event) => event.eventId);
  assert.equal(firstIds.every((id) => id.startsWith("interaction-")), true);
  assert.deepEqual(published.map((event) => [event.eventType, event.taskId]), [
    ["permission.asked", "TASK-1"],
    ["question.asked", "TASK-1"],
  ]);
  assert.deepEqual(state.listEvents("TASK-1").map((event) => event.eventType), ["permission.asked", "question.asked"]);
  assert.equal(state.reconciliation("canonical"), undefined);
  assert.equal(paths.includes("/session"), false);
  assert.equal(paths.includes("/session/status"), false);
  assert.equal(paths.some((path) => path.endsWith("/message")), false);

  await recovery.recoverOnce();
  assert.deepEqual(published.slice(2).map((event) => event.eventId), firstIds);
  assert.equal(state.listEvents("TASK-1").length, 2);
});

test("legacy and canonical lanes share one interaction identity", async (context) => {
  const state = stateForTest(context);
  state.mapTaskSession("TASK-INTERACTION", "ses_interaction", 18, "luna");
  const abort = new AbortController();
  const encoder = new TextEncoder();
  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      controller.enqueue(encoder.encode('data: {"id":"evt_permission","type":"permission.asked","properties":{"id":"per_shared","sessionID":"ses_interaction","permission":"external_directory","patterns":["/outside"],"metadata":{},"always":[]}}\n\n'));
      controller.close();
    },
  });
  let publications = 0;
  let pending = true;
  const api = client(asFetch((request) => {
    const path = new URL(request.url).pathname;
    if (path === "/sync/history") return Response.json([]);
    if (path === "/api/session/ses_interaction/history") return Response.json({ data: [], hasMore: false });
    if (path === "/permission") return Response.json(pending ? [{ id: "per_shared", sessionID: "ses_interaction", permission: "external_directory", patterns: ["/outside"], metadata: {}, always: [] }] : []);
    if (path === "/question") return Response.json([]);
    if (path === "/event") return new Response(stream, { headers: { "content-type": "text/event-stream" } });
    return new Response("not found", { status: 404 });
  }));
  const recovery = new RecoveryCoordinator({
    client: api,
    state,
    onPersistedEvent: () => {
      publications++;
    },
    onError: () => abort.abort(),
  });
  await recovery.recoverOnce();
  assert.equal(publications, 1);
  pending = false;
  await recovery.run(abort.signal, () => 0);
  assert.equal(state.listEvents("TASK-INTERACTION").length, 1);
  assert.equal(publications, 1);
});

test("post-interaction continuation nudges one idle developer session once", async (context) => {
  const state = stateForTest(context);
  state.mapTaskSession("TASK-CONTINUE", "ses_continue", 21, "small-developer");
  state.recordInteraction({
    interactionId: "per_continue",
    kind: "permission",
    taskId: "TASK-CONTINUE",
    sessionId: "ses_continue",
  });
  const calls: string[] = [];
  let statusReads = 0;
  const api = client(asFetch(async (request) => {
    const path = new URL(request.url).pathname;
    calls.push(path);
    if (path === "/permission" || path === "/question") return Response.json([]);
    if (path === "/session/status") {
      statusReads++;
      return Response.json({ ses_continue: { type: "idle" } });
    }
    if (path === "/session/ses_continue") return Response.json(liveSession("ses_continue"));
    if (path === "/session/ses_continue/prompt_async") {
      const body = await request.json() as Record<string, JsonValue>;
      assert.deepEqual(body, {
        agent: "small-developer",
        parts: [{
          type: "text",
          text: "Continue the existing task in the current repository scope after the resolved interaction. Do not restart the task, create a new session, or widen the scope.",
        }],
      });
      return Response.json(null);
    }
    return new Response("not found", { status: 404 });
  }));
  const recovery = new RecoveryCoordinator({ client: api, state });

  assert.deepEqual(await recovery.continueAfterInteraction("TASK-CONTINUE", "per_continue", "permission"), {
    outcome: "recovered",
    reason: "same-session-continuation-nudge-sent",
  });
  const restarted = new RecoveryCoordinator({ client: api, state });
  assert.deepEqual(await restarted.continueAfterInteraction("TASK-CONTINUE", "per_continue", "permission"), {
    outcome: "already-recovered",
    reason: "continuation-already-attempted",
  });
  assert.equal(calls.filter((path) => path.endsWith("/prompt_async")).length, 1);
  assert.equal(statusReads, 2);
  assert.equal(calls.includes("/session"), false);
});

test("post-interaction continuation treats transient idle as natural resumption and does not nudge", async (context) => {
  const state = stateForTest(context);
  state.mapTaskSession("TASK-TRANSIENT-IDLE", "ses_transient_idle", 25, "small-developer");
  state.recordInteraction({
    interactionId: "per_transient_idle",
    kind: "permission",
    taskId: "TASK-TRANSIENT-IDLE",
    sessionId: "ses_transient_idle",
  });
  let statusReads = 0;
  let prompts = 0;
  const api = client(asFetch((request) => {
    const path = new URL(request.url).pathname;
    if (path === "/permission" || path === "/question") return Response.json([]);
    if (path === "/session/status") {
      statusReads++;
      return Response.json({ ses_transient_idle: { type: statusReads === 1 ? "idle" : "busy" } });
    }
    if (path === "/session/ses_transient_idle") return Response.json(liveSession("ses_transient_idle"));
    if (path.endsWith("/prompt_async")) {
      prompts++;
      return Response.json(null);
    }
    return new Response("not found", { status: 404 });
  }));
  const recovery = new RecoveryCoordinator({ client: api, state });

  assert.deepEqual(await recovery.continueAfterInteraction("TASK-TRANSIENT-IDLE", "per_transient_idle", "permission"), {
    outcome: "clean",
    reason: "session-progressing",
  });
  assert.equal(statusReads, 2);
  assert.equal(prompts, 0);
  assert.equal(state.interaction("per_transient_idle")?.nudgeState, "not-attempted");
});

test("post-interaction continuation treats live activity during an idle grace as natural progress", async (context) => {
  const state = stateForTest(context);
  state.mapTaskSession("TASK-IDLE-ACTIVITY", "ses_idle_activity", 26, "small-developer");
  state.recordInteraction({
    interactionId: "per_idle_activity",
    kind: "permission",
    taskId: "TASK-IDLE-ACTIVITY",
    sessionId: "ses_idle_activity",
  });
  let activityReads = 0;
  let prompts = 0;
  const api = client(asFetch((request) => {
    const path = new URL(request.url).pathname;
    if (path === "/permission" || path === "/question") return Response.json([]);
    if (path === "/session/status") return Response.json({ ses_idle_activity: { type: "idle" } });
    if (path === "/session/ses_idle_activity") {
      activityReads++;
      return Response.json(liveSession("ses_idle_activity", activityReads));
    }
    if (path.endsWith("/prompt_async")) {
      prompts++;
      return Response.json(null);
    }
    return new Response("not found", { status: 404 });
  }));
  const recovery = new RecoveryCoordinator({ client: api, state });

  assert.deepEqual(await recovery.continueAfterInteraction("TASK-IDLE-ACTIVITY", "per_idle_activity", "permission"), {
    outcome: "clean",
    reason: "session-progressing",
  });
  assert.equal(activityReads, 2);
  assert.equal(prompts, 0);
  assert.equal(state.interaction("per_idle_activity")?.nudgeState, "not-attempted");
});

test("post-interaction continuation accepts stable inactive status only with unchanged live session activity", async (context) => {
  const state = stateForTest(context);
  state.mapTaskSession("TASK-INACTIVE", "ses_inactive", 27, "small-developer");
  state.recordInteraction({
    interactionId: "per_inactive",
    kind: "permission",
    taskId: "TASK-INACTIVE",
    sessionId: "ses_inactive",
  });
  let prompts = 0;
  const api = client(asFetch((request) => {
    const path = new URL(request.url).pathname;
    if (path === "/permission" || path === "/question") return Response.json([]);
    if (path === "/session/status") return Response.json({});
    if (path === "/session/ses_inactive") return Response.json(liveSession("ses_inactive", 10));
    if (path.endsWith("/prompt_async")) {
      prompts++;
      return Response.json(null);
    }
    return new Response("not found", { status: 404 });
  }));
  const recovery = new RecoveryCoordinator({ client: api, state });

  assert.deepEqual(await recovery.continueAfterInteraction("TASK-INACTIVE", "per_inactive", "permission"), {
    outcome: "recovered",
    reason: "same-session-continuation-nudge-sent",
  });
  assert.equal(prompts, 1);
});

test("post-interaction continuation fails closed while an interaction remains outstanding", async (context) => {
  const state = stateForTest(context);
  state.mapTaskSession("TASK-PENDING", "ses_pending_continue", 22, "small-developer");
  state.recordInteraction({
    interactionId: "que_pending_continue",
    kind: "question",
    taskId: "TASK-PENDING",
    sessionId: "ses_pending_continue",
  });
  let prompts = 0;
  const api = client(asFetch((request) => {
    const path = new URL(request.url).pathname;
    if (path === "/permission") return Response.json([]);
    if (path === "/question") return Response.json([{ id: "que_other", sessionID: "ses_pending_continue", questions: [] }]);
    if (path === "/session/status") return Response.json({ ses_pending_continue: { type: "idle" } });
    if (path === "/session/ses_pending_continue") return Response.json(liveSession("ses_pending_continue"));
    if (path.endsWith("/prompt_async")) {
      prompts++;
      return Response.json(null);
    }
    return new Response("not found", { status: 404 });
  }));
  const recovery = new RecoveryCoordinator({ client: api, state });
  assert.deepEqual(await recovery.continueAfterInteraction("TASK-PENDING", "que_pending_continue", "question"), {
    outcome: "blocked",
    reason: "outstanding-interaction",
  });
  assert.equal(prompts, 0);
  assert.equal(state.interaction("que_pending_continue")?.nudgeState, "not-attempted");
});

test("post-interaction continuation treats a progressing session as clean and does not create a session", async (context) => {
  const state = stateForTest(context);
  state.mapTaskSession("TASK-BUSY", "ses_busy_continue", 23, "small-developer");
  state.recordInteraction({
    interactionId: "per_busy_continue",
    kind: "permission",
    taskId: "TASK-BUSY",
    sessionId: "ses_busy_continue",
  });
  const calls: string[] = [];
  const api = client(asFetch((request) => {
    const path = new URL(request.url).pathname;
    calls.push(path);
    if (path === "/permission" || path === "/question") return Response.json([]);
    if (path === "/session/status") return Response.json({ ses_busy_continue: { type: "busy" } });
    if (path === "/session/ses_busy_continue") return Response.json(liveSession("ses_busy_continue"));
    return new Response("not found", { status: 404 });
  }));
  const recovery = new RecoveryCoordinator({ client: api, state });
  assert.deepEqual(await recovery.continueAfterInteraction("TASK-BUSY", "per_busy_continue", "permission"), {
    outcome: "clean",
    reason: "session-progressing",
  });
  assert.equal(calls.some((path) => path.endsWith("/prompt_async")), false);
  assert.equal(calls.some((path) => path === "/session"), false);
});

test("post-interaction continuation fails closed when mapped session status is not proven", async (context) => {
  const state = stateForTest(context);
  state.mapTaskSession("TASK-UNKNOWN-STATUS", "ses_unknown_status", 24, "small-developer");
  state.recordInteraction({
    interactionId: "per_unknown_status",
    kind: "permission",
    taskId: "TASK-UNKNOWN-STATUS",
    sessionId: "ses_unknown_status",
  });
  let prompts = 0;
  const api = client(asFetch((request) => {
    const path = new URL(request.url).pathname;
    if (path === "/permission" || path === "/question") return Response.json([]);
    if (path === "/session/status") return Response.json({});
    if (path === "/session/ses_unknown_status") return new Response("not found", { status: 404 });
    if (path.endsWith("/prompt_async")) prompts++;
    return new Response("not found", { status: 404 });
  }));
  const recovery = new RecoveryCoordinator({ client: api, state });
  assert.deepEqual(await recovery.continueAfterInteraction("TASK-UNKNOWN-STATUS", "per_unknown_status", "permission"), {
    outcome: "blocked",
    reason: "continuation-proof-unavailable",
  });
  assert.equal(prompts, 0);
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

test("canonical Scout recovery requires terminal lifecycle metadata and is idempotent", async (context) => {
  const state = stateForTest(context);
  const scouts = [
    ["11111111-1111-4111-8111-111111111111", "TASK-IDLE", "ses_idle"],
    ["22222222-2222-4222-8222-222222222222", "TASK-BUSY", "ses_busy"],
    ["33333333-3333-4333-8333-333333333333", "TASK-TOOLS", "ses_tools"],
    ["44444444-4444-4444-8444-444444444444", "TASK-ERROR", "ses_error"],
  ] as const;
  for (const [requestId, taskId, sessionId] of scouts) {
    state.mapScoutSession({
      requestId,
      taskId,
      sessionId,
      issueNumber: 100,
      refSha: "a".repeat(40),
      workspacePath: "/snapshot",
    });
  }
  let calls = 0;
  const api = client(asFetch((request) => {
    calls++;
    const path = new URL(request.url).pathname;
    if (path === "/session/status") {
      return Response.json({
        ses_busy: { type: "busy" },
        ses_tools: { type: "idle" },
        ses_error: { type: "idle" },
      });
    }
    const sessionId = path.match(/^\/session\/(.+)\/message$/)?.[1];
    if (!sessionId) return new Response("not found", { status: 404 });
    const terminal = sessionId === "ses_tools" ? "tool-calls" : "stop";
    return Response.json([{
      info: {
        id: `msg_${sessionId}`,
        role: "assistant",
        sessionID: sessionId,
        time: { created: 10, completed: 20 },
        finish: terminal,
        ...(sessionId === "ses_error" ? { error: { name: "UnknownError", data: { message: "failed" } } } : {}),
      },
      parts: [],
    }]);
  }));
  const recovery = new RecoveryCoordinator({ client: api, state });

  assert.equal(await recovery.recoverScoutCanonical(state.getScoutSession(scouts[0][0])!), true);
  assert.equal(state.getScoutSession(scouts[0][0])?.sessionState, "session.idle");
  const afterIdle = calls;
  assert.equal(await recovery.recoverScoutCanonical(state.getScoutSession(scouts[0][0])!), false);
  assert.equal(calls, afterIdle);

  assert.equal(await recovery.recoverScoutCanonical(state.getScoutSession(scouts[1][0])!), false);
  assert.equal(state.getScoutSession(scouts[1][0])?.sessionState, "starting");
  assert.equal(await recovery.recoverScoutCanonical(state.getScoutSession(scouts[2][0])!), false);
  assert.equal(state.getScoutSession(scouts[2][0])?.sessionState, "starting");
  assert.equal(await recovery.recoverScoutCanonical(state.getScoutSession(scouts[3][0])!), true);
  assert.equal(state.getScoutSession(scouts[3][0])?.sessionState, "session.error");
  assert.deepEqual(
    state.pendingResponseDeliveries().map((entry) => [entry.requestId, entry.eventType]).sort(),
    [[scouts[0][0], "session.idle"], [scouts[3][0], "session.error"]],
  );
});

test("workspace legacy Scout recovery filters exact sessions and synthesizes stable event identity", async (context) => {
  const state = stateForTest(context);
  const requestId = "55555555-5555-4555-8555-555555555555";
  state.mapScoutSession({
    requestId,
    taskId: "TASK-WORKSPACE",
    sessionId: "ses_workspace",
    issueNumber: 101,
    refSha: "b".repeat(40),
    workspacePath: "/snapshot/workspace",
  });
  const encoder = new TextEncoder();
  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      controller.enqueue(encoder.encode('data: {"type":"session.idle","properties":{"sessionID":"ses_other"}}\n\n'));
      controller.enqueue(encoder.encode('data: {"type":"session.idle","properties":{"sessionID":"ses_workspace"}}\n\n'));
      controller.close();
    },
  });
  const api = client(asFetch((request) => {
    const url = new URL(request.url);
    assert.equal(url.pathname, "/event");
    assert.equal(url.searchParams.get("directory"), "/snapshot/workspace");
    return new Response(stream, { headers: { "content-type": "text/event-stream" } });
  }), "/snapshot/workspace");
  const recovery = new RecoveryCoordinator({ client: api, state });
  await recovery.runLegacySession(state.getScoutSession(requestId)!, new AbortController().signal, () => 0);

  assert.deepEqual(state.listEvents("TASK-WORKSPACE").map((entry) => entry.eventType), ["session.idle"]);
  assert.equal(state.getScoutSession(requestId)?.sessionState, "session.idle");
  assert.equal(state.pendingResponseDeliveries().length, 1);
});

test("composite Scout recovery completes from canonical state when v2 history is empty", async (context) => {
  const state = stateForTest(context);
  const requestId = "66666666-6666-4666-8666-666666666666";
  state.mapScoutSession({
    requestId,
    taskId: "TASK-COMPOSITE",
    sessionId: "ses_composite",
    issueNumber: 102,
    refSha: "c".repeat(40),
    workspacePath: "/snapshot/composite",
  });
  const paths: string[] = [];
  const api = client(asFetch((request) => {
    const url = new URL(request.url);
    paths.push(url.pathname);
    if (url.pathname === "/api/session/ses_composite/history") {
      return Response.json({ data: [], hasMore: false });
    }
    if (url.pathname === "/api/session/ses_composite/event" || url.pathname === "/event") {
      return new Response(new ReadableStream<Uint8Array>({ start(controller) { controller.close(); } }), {
        headers: { "content-type": "text/event-stream" },
      });
    }
    if (url.pathname === "/session/status") return Response.json({});
    if (url.pathname === "/session/ses_composite/message") {
      return Response.json([{
        info: {
          id: "msg_composite",
          role: "assistant",
          sessionID: "ses_composite",
          time: { created: 100, completed: 200 },
          finish: "stop",
        },
        parts: [],
      }]);
    }
    return new Response("not found", { status: 404 });
  }), "/snapshot/composite");
  const recovery = new RecoveryCoordinator({ client: api, state });
  await recovery.runScoutSession(state.getScoutSession(requestId)!, new AbortController().signal, () => 0);

  assert.equal(state.getScoutSession(requestId)?.sessionState, "session.idle");
  assert.equal(paths.includes("/api/session/ses_composite/history"), true);
  assert.equal(paths.includes("/event"), true);
  assert.equal(paths.includes("/session/status"), true);
  assert.equal(paths.includes("/session/ses_composite/message"), true);
  assert.equal(paths.some((path) => /prompt/i.test(path)), false);
});
