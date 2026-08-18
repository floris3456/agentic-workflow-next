import assert from "node:assert/strict";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import test from "node:test";
import { CommandExecutor } from "../src/commands.js";
import { DeveloperResponseTransport } from "../src/handoff.js";
import { Manifest } from "../src/manifest.js";
import { OpenCodeClient } from "../src/opencode.js";
import { OperationPolicy, PublicProjection } from "../src/projection.js";
import { RecoveryCoordinator } from "../src/recovery.js";
import { RecoveryObserverRegistry } from "../src/recovery-observer.js";
import { BridgeState } from "../src/state.js";
import type { CommandEnvelope, CompatibilityResult, JsonValue, OperationArguments } from "../src/types.js";

const manifest = Manifest.load(resolve(import.meta.dirname, "../../../../contracts/opencode-bridge/operation-manifest.json"));
const sha = "a".repeat(40);

function command(sequence: number, kind: string, args: Record<string, JsonValue>, guarded = false): CommandEnvelope {
  return {
    protocol: "agentic-bridge/1",
    sequence,
    command_id: `10000000-0000-4000-8000-${String(sequence).padStart(12, "0")}`,
    task_id: "WORKFLOW-1",
    kind,
    arguments: args,
    ...(guarded ? { expected: { developer_sha: sha, ref: "developer" } } : {}),
  };
}

test("deterministic workflow covers routing, interaction, recovery, finalization, promotion, and restart", async (context) => {
  const directory = mkdtempSync(join(tmpdir(), "bridge-workflow-test-"));
  context.after(() => rmSync(directory, { recursive: true, force: true }));
  const database = join(directory, "state", "bridge.sqlite");
  const state = new BridgeState(database);
  const projection = new PublicProjection({ state, privateRoots: ["/private/repository"] });
  const requests: Array<{ operationId: string; args: OperationArguments }> = [];
  const compatibility: CompatibilityResult = {
    compatible: true,
    runningVersion: "1.18.16",
    expectedVersion: "1.18.16",
    actualHash: manifest.document.source.openapiSha256,
    expectedHash: manifest.document.source.openapiSha256,
    added: [], removed: [], changed: [],
  };
  const client = new OpenCodeClient({
    baseUrl: "http://127.0.0.1:4096",
    username: "bridge",
    password: "test",
    directory: "/private/repository",
    manifest,
    fetch: (() => { throw new Error("unexpected fetch"); }) as typeof fetch,
  });
  client.compatibility = async () => compatibility;
  client.request = async (operationId, args = {}) => {
    requests.push({ operationId, args });
    if (operationId === "session.create") return { id: "ses_workflow_private", directory: "/private/repository" };
    if (operationId === "session.status") return {
      ses_workflow_private: { type: "idle" },
      ses_other_private: { type: "busy" },
    };
    if (operationId === "session.get") return {
      id: "ses_workflow_private",
      time: { created: 0, updated: 1 },
    };
    if (operationId === "session.messages") return [{ info: { id: "msg_workflow_private", sessionID: "ses_workflow_private" }, parts: [] }];
    if (operationId === "permission.reply") {
      permissionPending = false;
      return true;
    }
    if (operationId === "question.reply") {
      questionPending = false;
      return true;
    }
    if (operationId === "permission.list") return permissionPending ? [{ id: "per_workflow_private", sessionID: "ses_workflow_private" }] : [];
    if (operationId === "question.list") return questionPending ? [{ id: "que_workflow_private", sessionID: "ses_workflow_private" }] : [];
    if (operationId === "session.prompt_async") return undefined;
    if (operationId === "session.abort") return true;
    throw new Error(`unexpected operation ${operationId}`);
  };
  let permissionPending = true;
  let questionPending = true;
  let recoveries = 0;
  const recoveryCoordinator = new RecoveryCoordinator({ client, state });
  const recovery = {
    recoverOnce: async () => { recoveries++; },
    captureContinuationBaseline: recoveryCoordinator.captureContinuationBaseline.bind(recoveryCoordinator),
    continueAfterInteraction: recoveryCoordinator.continueAfterInteraction.bind(recoveryCoordinator),
  } as unknown as RecoveryCoordinator;
  const promotions: string[] = [];
  const controller = new AbortController();
  const continued: Array<[string, string]> = [];
  const executor = new CommandExecutor({
    client,
    state,
    recovery,
    projection,
    operationPolicy: new OperationPolicy({ manifest, state }),
    instanceId: "workflow-test",
    signal: controller.signal,
    currentGitState: async () => ({ developerSha: sha, ref: "developer", clean: true }),
    runPromotion: async (approved) => {
      promotions.push(approved);
      return { promoted: approved };
    },
    onSessionContinued: (taskId, sessionId) => { continued.push([taskId, sessionId]); },
  });

  async function apply(sequence: number, kind: string, args: Record<string, JsonValue>, guarded = false) {
    const accepted = state.acceptCommand(command(sequence, kind, args, guarded), 42);
    assert.equal(accepted.disposition, "new");
    const result = await executor.execute(accepted.command!);
    assert.equal(result.state, "succeeded", `${kind}: ${result.error ?? "unknown error"}`);
    assert.doesNotMatch(JSON.stringify(result.publicResult), /ses_workflow_private|msg_workflow_private|\/private\/repository/);
    return result;
  }

  await apply(1, "start", { brief: "Implement the public-safe task", agent: "small" }, true);
  const permission = projection.project("per_workflow_private", "WORKFLOW-1");
  const question = projection.project("que_workflow_private", "WORKFLOW-1");
  assert.equal(permission, "permission-1");
  assert.equal(question, "question-1");
  state.recordInteraction({ interactionId: "per_workflow_private", kind: "permission", taskId: "WORKFLOW-1", sessionId: "ses_workflow_private" });
  state.recordInteraction({ interactionId: "que_workflow_private", kind: "question", taskId: "WORKFLOW-1", sessionId: "ses_workflow_private" });
  state.recordEvent({ eventKey: "event-1", source: "test", eventType: "session.idle", taskId: "WORKFLOW-1", payload: { sessionID: "ses_workflow_private" } });

  state.updateTaskSessionState("WORKFLOW-1", "session.idle", "evt_first_terminal");
  await apply(2, "steer", { message: "Continue with the requested correction" });
  assert.equal(state.getTaskSession("WORKFLOW-1")?.sessionState, "starting");
  state.updateTaskSessionState("WORKFLOW-1", "session.idle", "evt_second_terminal");
  await apply(3, "route", { agent: "heavy", message: "Handle the exceptional complex step" });
  assert.equal(state.getTaskSession("WORKFLOW-1")?.agent, "large-developer");
  assert.equal(state.getTaskSession("WORKFLOW-1")?.sessionState, "starting");
  const permissionReply = await apply(4, "permission.reply", { permission: "permission-1", reply: "once" });
  assert.match(JSON.stringify(permissionReply.publicResult), /outcome[" ]+:[" ]+blocked/);
  const questionReply = await apply(5, "question.reply", { question: "question-1", answers: [["Option A"]] });
  assert.match(JSON.stringify(questionReply.publicResult), /outcome[" ]+:[" ]+recovered/);
  const status = await apply(6, "status", {});
  assert.match(JSON.stringify(status.publicResult), /session-1/);
  assert.doesNotMatch(JSON.stringify(status.rawResult), /ses_other_private/);
  await apply(7, "events.page", { after: 0, limit: 10 });
  await apply(8, "sync.recover", {});
  assert.equal(recoveries, 1);
  state.updateTaskSessionState("WORKFLOW-1", "session.idle", "evt_third_terminal");
  await apply(9, "finalize", { message: "Create the required pushed handoff snapshot and return the canonical six fields" });
  assert.equal(state.getTaskSession("WORKFLOW-1")?.sessionState, "starting");
  await apply(10, "abort", {});
  await apply(11, "promotion.apply", { approved_sha: sha }, true);
  assert.deepEqual(promotions, [sha]);
  assert.ok(requests.some((entry) => entry.operationId === "session.prompt_async" && (entry.args.body as Record<string, JsonValue>).agent === "large-developer"));
  assert.deepEqual(continued, [
    ["WORKFLOW-1", "ses_workflow_private"],
    ["WORKFLOW-1", "ses_workflow_private"],
    ["WORKFLOW-1", "ses_workflow_private"],
  ]);
  assert.equal(state.listCommands().length, 11);
  state.close();

  const reopened = new BridgeState(database);
  context.after(() => reopened.close());
  assert.equal(reopened.getTaskSession("WORKFLOW-1")?.sessionId, "ses_workflow_private");
  assert.equal(reopened.listCommands().every((entry) => entry.state === "succeeded"), true);
  assert.ok(reopened.pendingOutbox(Date.now() + 1_000, 100).length > 0);
  controller.abort();
});

test("same-session follow-up reenrolls across an ending observer and captures a second canonical terminal once", async (context) => {
  const directory = mkdtempSync(join(tmpdir(), "bridge-second-terminal-test-"));
  context.after(() => rmSync(directory, { recursive: true, force: true }));
  const database = join(directory, "state", "bridge.sqlite");
  const state = new BridgeState(database);
  state.mapTaskSession("WORKFLOW-SECOND", "ses_second_terminal", 43, "small-developer");
  const projection = new PublicProjection({ state, privateRoots: [directory] });
  const calls: string[] = [];
  let messageNumber = 1;
  const api = new OpenCodeClient({
    baseUrl: "http://127.0.0.1:4096",
    username: "bridge",
    password: "test",
    directory,
    manifest,
    fetch: (() => { throw new Error("unexpected fetch"); }) as typeof fetch,
  });
  api.compatibility = async () => ({
    compatible: true,
    runningVersion: "1.18.16",
    expectedVersion: "1.18.16",
    actualHash: manifest.document.source.openapiSha256,
    expectedHash: manifest.document.source.openapiSha256,
    added: [], removed: [], changed: [],
  });
  api.request = async (operationId) => {
    calls.push(operationId);
    if (operationId === "permission.list" || operationId === "question.list") return [];
    if (operationId === "session.status") return {};
    if (operationId === "session.messages") return [{
      info: {
        id: `msg_second_terminal_${messageNumber}`,
        role: "assistant",
        sessionID: "ses_second_terminal",
        time: { created: messageNumber * 10, completed: messageNumber * 10 + 5 },
        finish: "stop",
      },
      parts: [{ id: `part_second_terminal_${messageNumber}`, type: "text", text: `Terminal response ${messageNumber}` }],
    }];
    if (operationId === "v2.session.history") return { data: [], hasMore: false };
    if (operationId === "sync.history.list") return [];
    if (operationId === "session.prompt_async") return undefined;
    throw new Error(`unexpected operation ${operationId}`);
  };

  const transport = new DeveloperResponseTransport({ client: api, state, projection });
  let resolveSecond!: () => void;
  const secondTerminal = new Promise<void>((resolve) => { resolveSecond = resolve; });
  const recovery = new RecoveryCoordinator({
    client: api,
    state,
    onPersistedEvent: async (event) => {
      const delivery = state.pendingResponseDeliveries().find((entry) => entry.eventId === event.eventId);
      if (delivery) await transport.deliver(delivery);
      if (state.listEvents("WORKFLOW-SECOND").length === 2) resolveSecond();
    },
  });
  assert.equal(await recovery.recoverDeveloperCanonical(state.getTaskSession("WORKFLOW-SECOND")!), true);
  assert.equal(state.getTaskSession("WORKFLOW-SECOND")?.sessionState, "session.idle");
  assert.match(JSON.stringify(state.getTaskSession("WORKFLOW-SECOND")?.latestResponse), /Terminal response 1/);

  const controller = new AbortController();
  const observers = new RecoveryObserverRegistry(controller.signal);
  let finishOld!: () => void;
  const oldRun = new Promise<void>((resolve) => { finishOld = resolve; });
  observers.start("developer:WORKFLOW-SECOND", () => oldRun);
  let reenrollments = 0;
  const executor = new CommandExecutor({
    client: api,
    state,
    recovery,
    projection,
    operationPolicy: new OperationPolicy({ manifest, state }),
    instanceId: "second-terminal-test",
    signal: controller.signal,
    onSessionContinued: (taskId, sessionId) => {
      reenrollments++;
      const factory = async () => {
        const current = state.getTaskSession(taskId);
        if (!current || current.sessionId !== sessionId || /session\.(?:idle|error)/i.test(current.sessionState)) return;
        await recovery.runSession(current, controller.signal);
      };
      observers.reenroll(`developer:${taskId}`, factory);
      observers.reenroll(`developer:${taskId}`, factory);
    },
  });
  const accepted = state.acceptCommand({
    protocol: "agentic-bridge/1",
    sequence: 1,
    command_id: "20000000-0000-4000-8000-000000000001",
    task_id: "WORKFLOW-SECOND",
    kind: "steer",
    arguments: { message: "Continue the exact mapped task and session" },
  }, 43);
  assert.equal(accepted.disposition, "new");
  assert.equal((await executor.execute(accepted.command!)).state, "succeeded");
  assert.equal(reenrollments, 1);
  assert.equal(state.getTaskSession("WORKFLOW-SECOND")?.sessionState, "starting");

  assert.equal(await recovery.recoverDeveloperCanonical(state.getTaskSession("WORKFLOW-SECOND")!), false);
  assert.equal(state.getTaskSession("WORKFLOW-SECOND")?.sessionState, "starting");
  assert.equal(state.listEvents("WORKFLOW-SECOND").length, 1);

  messageNumber = 2;
  finishOld();
  await secondTerminal;
  await Promise.allSettled(Array.from(observers.values()));
  assert.equal(state.getTaskSession("WORKFLOW-SECOND")?.sessionState, "session.idle");
  assert.match(JSON.stringify(state.getTaskSession("WORKFLOW-SECOND")?.latestResponse), /Terminal response 2/);
  assert.equal(state.listEvents("WORKFLOW-SECOND").length, 2);
  assert.equal(state.pendingResponseDeliveries().length, 0);
  assert.equal(calls.filter((operation) => operation === "session.prompt_async").length, 1);
  assert.equal(calls.includes("session.create"), false);

  await recovery.recoverOnce();
  assert.equal(state.listEvents("WORKFLOW-SECOND").length, 2);
  controller.abort();
  state.close();

  const restarted = new BridgeState(database);
  context.after(() => restarted.close());
  const afterRestart = new RecoveryCoordinator({ client: api, state: restarted });
  await afterRestart.recoverOnce();
  assert.equal(restarted.listEvents("WORKFLOW-SECOND").length, 2);
  assert.equal(restarted.pendingResponseDeliveries().length, 0);
  assert.equal(restarted.getTaskSession("WORKFLOW-SECOND")?.sessionState, "session.idle");
});

test("failed follow-up prompt leaves the exact mapped terminal session unchanged", async (context) => {
  const directory = mkdtempSync(join(tmpdir(), "bridge-follow-up-failure-test-"));
  context.after(() => rmSync(directory, { recursive: true, force: true }));
  const state = new BridgeState(join(directory, "state", "bridge.sqlite"));
  context.after(() => state.close());
  state.mapTaskSession("WORKFLOW-FAILED-FOLLOW-UP", "ses_failed_follow_up", 44, "small-developer");
  state.updateTaskSessionState("WORKFLOW-FAILED-FOLLOW-UP", "session.idle", "evt_failed_follow_up_first");
  const api = new OpenCodeClient({
    baseUrl: "http://127.0.0.1:4096",
    username: "bridge",
    password: "test",
    directory,
    manifest,
    fetch: (() => { throw new Error("unexpected fetch"); }) as typeof fetch,
  });
  api.compatibility = async () => ({
    compatible: true,
    runningVersion: "1.18.16",
    expectedVersion: "1.18.16",
    actualHash: manifest.document.source.openapiSha256,
    expectedHash: manifest.document.source.openapiSha256,
    added: [], removed: [], changed: [],
  });
  api.request = async (operationId) => {
    if (operationId === "session.prompt_async") throw new Error("prompt delivery unavailable");
    throw new Error(`unexpected operation ${operationId}`);
  };
  let reenrollments = 0;
  const controller = new AbortController();
  const executor = new CommandExecutor({
    client: api,
    state,
    recovery: new RecoveryCoordinator({ client: api, state }),
    projection: new PublicProjection({ state, privateRoots: [directory] }),
    operationPolicy: new OperationPolicy({ manifest, state }),
    instanceId: "failed-follow-up-test",
    signal: controller.signal,
    onSessionContinued: () => { reenrollments++; },
  });
  const accepted = state.acceptCommand({
    protocol: "agentic-bridge/1",
    sequence: 1,
    command_id: "30000000-0000-4000-8000-000000000001",
    task_id: "WORKFLOW-FAILED-FOLLOW-UP",
    kind: "finalize",
    arguments: { message: "Finish without replacing the mapped session" },
  }, 44);
  assert.equal(accepted.disposition, "new");
  assert.equal((await executor.execute(accepted.command!)).state, "indeterminate");
  assert.equal(state.getTaskSession("WORKFLOW-FAILED-FOLLOW-UP")?.sessionState, "session.idle");
  assert.equal(state.getTaskSession("WORKFLOW-FAILED-FOLLOW-UP")?.agent, "small-developer");
  assert.equal(reenrollments, 0);
  controller.abort();
});
