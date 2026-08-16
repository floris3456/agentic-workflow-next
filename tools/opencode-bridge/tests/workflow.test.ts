import assert from "node:assert/strict";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import test from "node:test";
import { CommandExecutor } from "../src/commands.js";
import { Manifest } from "../src/manifest.js";
import { OpenCodeClient } from "../src/opencode.js";
import { OperationPolicy, PublicProjection } from "../src/projection.js";
import { RecoveryCoordinator } from "../src/recovery.js";
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
    continueAfterInteraction: recoveryCoordinator.continueAfterInteraction.bind(recoveryCoordinator),
  } as unknown as RecoveryCoordinator;
  const promotions: string[] = [];
  const controller = new AbortController();
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
  });

  async function apply(sequence: number, kind: string, args: Record<string, JsonValue>, guarded = false) {
    const accepted = state.acceptCommand(command(sequence, kind, args, guarded), 42);
    assert.equal(accepted.disposition, "new");
    const result = await executor.execute(accepted.command!);
    assert.equal(result.state, "succeeded", `${kind}: ${result.error ?? "unknown error"}`);
    assert.doesNotMatch(JSON.stringify(result.publicResult), /ses_workflow_private|msg_workflow_private|\/private\/repository/);
    return result;
  }

  await apply(1, "start", { brief: "Implement the public-safe task", agent: "luna" }, true);
  const permission = projection.project("per_workflow_private", "WORKFLOW-1");
  const question = projection.project("que_workflow_private", "WORKFLOW-1");
  assert.equal(permission, "permission-1");
  assert.equal(question, "question-1");
  state.recordInteraction({ interactionId: "per_workflow_private", kind: "permission", taskId: "WORKFLOW-1", sessionId: "ses_workflow_private" });
  state.recordInteraction({ interactionId: "que_workflow_private", kind: "question", taskId: "WORKFLOW-1", sessionId: "ses_workflow_private" });
  state.recordEvent({ eventKey: "event-1", source: "test", eventType: "session.idle", taskId: "WORKFLOW-1", payload: { sessionID: "ses_workflow_private" } });

  await apply(2, "steer", { message: "Continue with the requested correction" });
  await apply(3, "route", { agent: "sol", message: "Handle the exceptional complex step" });
  assert.equal(state.getTaskSession("WORKFLOW-1")?.agent, "large-developer");
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
  await apply(9, "finalize", { message: "Create the required pushed handoff snapshot and return the canonical six fields" });
  await apply(10, "abort", {});
  await apply(11, "promotion.apply", { approved_sha: sha }, true);
  assert.deepEqual(promotions, [sha]);
  assert.ok(requests.some((entry) => entry.operationId === "session.prompt_async" && (entry.args.body as Record<string, JsonValue>).agent === "large-developer"));
  assert.equal(state.listCommands().length, 11);
  state.close();

  const reopened = new BridgeState(database);
  context.after(() => reopened.close());
  assert.equal(reopened.getTaskSession("WORKFLOW-1")?.sessionId, "ses_workflow_private");
  assert.equal(reopened.listCommands().every((entry) => entry.state === "succeeded"), true);
  assert.ok(reopened.pendingOutbox(Date.now() + 1_000, 100).length > 0);
  controller.abort();
});
