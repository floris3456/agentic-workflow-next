import assert from "node:assert/strict";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import test, { type TestContext } from "node:test";
import { DeveloperResponseTransport, queueDeveloperResponseEvent } from "../src/handoff.js";
import { Manifest } from "../src/manifest.js";
import { OpenCodeClient } from "../src/opencode.js";
import { PublicProjection } from "../src/projection.js";
import { RequestExecutor } from "../src/requests.js";
import { BridgeState } from "../src/state.js";
import type { CommandEnvelope, JsonValue, RequestEnvelope } from "../src/types.js";

const manifest = Manifest.load(resolve(import.meta.dirname, "../../../../contracts/opencode-bridge/operation-manifest.json"));

function fixture(context: TestContext) {
  const root = mkdtempSync(join(tmpdir(), "bridge-request-test-"));
  const state = new BridgeState(join(root, "private", "bridge.sqlite"));
  const projection = new PublicProjection({ state, privateRoots: ["/private/repository"] });
  context.after(() => {
    state.close();
    rmSync(root, { recursive: true, force: true });
  });
  return { state, projection };
}

function command(id: string, sequence: number): CommandEnvelope {
  return {
    protocol: "agentic-bridge/1",
    sequence,
    command_id: id,
    task_id: "TASK-READ",
    kind: "steer",
    arguments: { message: "continue" },
  };
}

function request(id: string, kind: RequestEnvelope["kind"], args: Record<string, JsonValue>): RequestEnvelope {
  return {
    protocol: "agentic-bridge/1",
    request_id: id,
    task_id: "TASK-READ",
    kind,
    arguments: args,
  };
}

test("sequence-free status requests read durable state without replay or sequence consumption", async (context) => {
  const { state, projection } = fixture(context);
  const commandId = "10000000-0000-4000-8000-000000000001";
  const accepted = state.acceptCommand(command(commandId, 1), 41);
  assert.equal(accepted.disposition, "new");
  state.beginCommand(commandId);
  state.finishCommand(commandId, "succeeded", { private: "local-only" }, { delivered: true });
  state.mapTaskSession("TASK-READ", "ses_private_read", 41, "small-developer");
  state.updateTaskSessionState("TASK-READ", "session.idle", "evt_private_idle");
  state.updateTaskLatestResponse("TASK-READ", { parts: [{ type: "text", text: "Status: completed" }] }, "evt_private_idle");

  const executor = new RequestExecutor({ state, projection });
  const commandRead = state.acceptRequest(request(
    "20000000-0000-4000-8000-000000000001",
    "command.status",
    { command_id: commandId },
  ), 41);
  assert.equal(commandRead.disposition, "new");
  const commandResult = await executor.execute(commandRead.request);
  assert.equal(commandResult.state, "succeeded");
  assert.deepEqual(commandResult.publicResult, {
    found: true,
    command_id: commandId,
    task_id: "TASK-READ",
    sequence: 1,
    kind: "steer",
    state: "succeeded",
    known_result: { delivered: true },
    error: null,
    created_at: state.getCommand(commandId)?.createdAt,
    updated_at: state.getCommand(commandId)?.updatedAt,
    applying_for_ms: null,
    service_heartbeat_at: null,
  });

  const taskRead = state.acceptRequest(request(
    "30000000-0000-4000-8000-000000000001",
    "task.status",
    {},
  ), 41);
  const taskResult = await executor.execute(taskRead.request);
  assert.equal(taskResult.state, "succeeded");
  assert.match(JSON.stringify(taskResult.publicResult), /Status: completed/);
  assert.match(JSON.stringify(taskResult.publicResult), /session-1/);
  assert.doesNotMatch(JSON.stringify(taskResult.publicResult), /ses_private_read|evt_private_idle/);

  const next = state.acceptCommand(command("40000000-0000-4000-8000-000000000002", 2), 41);
  assert.equal(next.disposition, "new");
  assert.equal(state.listCommands().length, 2);
  assert.equal(state.listRequests().length, 2);
});

test("command status recovers a mandatory-guard pre-ledger rejection", async (context) => {
  const { state, projection } = fixture(context);
  const rejectedId = "15151515-1515-4151-8151-151515151515";
  const rejected: CommandEnvelope = {
    protocol: "agentic-bridge/1",
    sequence: 1,
    command_id: rejectedId,
    task_id: "TASK-READ",
    kind: "start",
    arguments: {
      brief: "Malformed guarded start",
      expected: { developer_sha: "a".repeat(40), ref: "developer" },
    },
  };
  assert.equal(state.acceptCommand(rejected, 41).disposition, "rejected");

  const executor = new RequestExecutor({ state, projection });
  const status = state.acceptRequest(request(
    "25252525-2525-4252-8252-252525252525",
    "command.status",
    { command_id: rejectedId },
  ), 41).request;
  const result = await executor.execute(status);
  assert.equal(result.state, "succeeded");
  assert.match(JSON.stringify(result.publicResult), /pre-ledger-rejected/);
  assert.match(JSON.stringify(result.publicResult), /top-level expected/);
  assert.equal(state.listCommands().length, 0);
  assert.equal(state.acceptCommand(command("35353535-3535-4353-8353-353535353535", 1), 41).disposition, "new");
});

test("idle and error delivery transports the latest projected assistant response without interpreting it", async (context) => {
  const { state, projection } = fixture(context);
  state.mapTaskSession("TASK-READ", "ses_private_read", 41, "small-developer");
  const delivery = queueDeveloperResponseEvent(state, {
    eventId: "evt_private_idle",
    source: "session-v2",
    taskId: "TASK-READ",
    sessionId: "ses_private_read",
    eventType: "session.idle",
    payload: { sessionID: "ses_private_read" },
  });
  assert.ok(delivery);

  const client = new OpenCodeClient({
    baseUrl: "http://127.0.0.1:4096",
    username: "bridge",
    password: "test",
    directory: "/private/repository",
    manifest,
    fetch: (() => { throw new Error("unexpected fetch"); }) as typeof fetch,
  });
  client.request = async (operationId) => {
    assert.equal(operationId, "session.messages");
    return [
      { info: { id: "msg_user", role: "user", sessionID: "ses_private_read" }, parts: [{ type: "text", text: "prompt" }] },
      { info: { id: "msg_old", role: "assistant", sessionID: "ses_private_read" }, parts: [{ type: "text", text: "old" }] },
      {
        info: { id: "msg_latest", role: "assistant", sessionID: "ses_private_read" },
        parts: [
          { id: "prt_reasoning", messageID: "msg_latest", type: "reasoning", text: "private reasoning" },
          { id: "prt_text", messageID: "msg_latest", type: "text", text: "unstructured response without required fields" },
        ],
      },
    ];
  };
  const transport = new DeveloperResponseTransport({ client, state, projection });
  await transport.deliver(delivery);

  assert.equal(state.pendingResponseDeliveries().length, 0);
  const session = state.getTaskSession("TASK-READ");
  assert.equal(session?.sessionState, "session.idle");
  assert.match(JSON.stringify(session?.latestResponse), /unstructured response without required fields/);
  assert.doesNotMatch(JSON.stringify(session?.latestResponse), /private reasoning|ses_private|msg_latest|prt_/);
  const item = state.pendingOutbox()[0];
  assert.ok(item);
  assert.match(JSON.stringify(item.payload), /latest_developer_response/);
  assert.match(JSON.stringify(item.payload), /unstructured response without required fields/);
});

test("failed response retrieval remains durably pending and retries without replaying a command", async (context) => {
  const { state, projection } = fixture(context);
  state.mapTaskSession("TASK-READ", "ses_private_read", 41, "small-developer");
  const delivery = queueDeveloperResponseEvent(state, {
    eventId: "evt_private_error",
    source: "session-v2",
    taskId: "TASK-READ",
    sessionId: "ses_private_read",
    eventType: "session.error",
    payload: { sessionID: "ses_private_read" },
  });
  assert.ok(delivery);
  const client = new OpenCodeClient({
    baseUrl: "http://127.0.0.1:4096",
    username: "bridge",
    password: "test",
    directory: "/private/repository",
    manifest,
    fetch: (() => { throw new Error("unexpected fetch"); }) as typeof fetch,
  });
  let attempts = 0;
  client.request = async () => {
    attempts++;
    if (attempts === 1) throw new Error("temporary message read failure");
    return [{
      info: { id: "msg_latest", role: "assistant", sessionID: "ses_private_read" },
      parts: [{ id: "prt_text", messageID: "msg_latest", type: "text", text: "Status: failed" }],
    }];
  };
  const transport = new DeveloperResponseTransport({ client, state, projection });
  await transport.deliver(delivery);
  assert.equal(state.pendingResponseDeliveries()[0]?.attempts, 1);
  assert.equal(state.listCommands().length, 0);
  await transport.deliver(state.pendingResponseDeliveries()[0]);
  assert.equal(state.pendingResponseDeliveries().length, 0);
  assert.equal(attempts, 2);
  assert.match(JSON.stringify(state.getTaskSession("TASK-READ")?.latestResponse), /Status: failed/);
});
