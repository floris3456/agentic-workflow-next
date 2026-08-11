import assert from "node:assert/strict";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import test from "node:test";
import { CommandExecutor } from "../src/commands.js";
import { Manifest } from "../src/manifest.js";
import { OpenCodeClient } from "../src/opencode.js";
import { OperationPolicy, PublicProjection } from "../src/projection.js";
import type { RecoveryCoordinator } from "../src/recovery.js";
import { BridgeState } from "../src/state.js";
import type { CommandEnvelope, CompatibilityResult, JsonValue, OperationArguments } from "../src/types.js";

const manifest = Manifest.load(resolve(import.meta.dirname, "../../../../contracts/opencode-bridge/operation-manifest.json"));
const compatible: CompatibilityResult = {
  compatible: true,
  runningVersion: "1.18.16",
  expectedVersion: "1.18.16",
  actualHash: manifest.document.source.openapiSha256,
  expectedHash: manifest.document.source.openapiSha256,
  added: [],
  removed: [],
  changed: [],
};

function fixture(context: test.TestContext): { state: BridgeState; projection: PublicProjection; directory: string } {
  const directory = mkdtempSync(join(tmpdir(), "bridge-projection-test-"));
  context.after(() => rmSync(directory, { recursive: true, force: true }));
  const state = new BridgeState(join(directory, "state", "bridge.sqlite"));
  context.after(() => state.close());
  return { state, projection: new PublicProjection({ state, privateRoots: ["/home/operator/project"] }), directory };
}

function envelope(sequence: number, kind: string, args: Record<string, JsonValue>, expected = false): CommandEnvelope {
  return {
    protocol: "agentic-bridge/1",
    sequence,
    command_id: `00000000-0000-4000-8000-${String(sequence).padStart(12, "0")}`,
    task_id: "TASK-1",
    kind,
    arguments: args,
    ...(expected ? { expected: { developer_sha: "a".repeat(40), ref: "developer" } } : {}),
  };
}

test("public projection aliases private IDs, redacts secrets and paths, and bounds output", (context) => {
  const { state, projection } = fixture(context);
  const result = projection.project({
    sessionID: "ses_private123",
    privateKey: "do-not-publish",
    key: "bare-secret-value",
    path: "/home/operator/project/src/private.ts",
    text: "notify @team <script>, session ses_private123, token=secret-value, and sk-abcdefghijklmnop",
    eventId: "evt_private123",
    otherPath: "/custom/work/repository/file.ts",
    ses_keyed123: { state: "idle" },
  }, "TASK-1");
  assert.deepEqual(result, {
    sessionID: "session-1",
    privateKey: "[redacted]",
    key: "[redacted]",
    path: "[local-path]/src/private.ts",
    text: "notify @team <script>, session session-1, [redacted], and [redacted]",
    eventId: "event-1",
    otherPath: "[local-path]",
    "session-2": { state: "idle" },
  });
  const comment = projection.comment(result);
  assert.doesNotMatch(comment, /ses_private|do-not-publish|\/home\/operator|@team|<script>/);
  assert.equal(projection.safeText("OpenCode rejected ses_private123"), "OpenCode rejected session-1");
  assert.equal(state.resolveAlias("session-1", "session"), "ses_private123");

  const bounded = new PublicProjection({ state, maxBytes: 50 }).project({ value: "x".repeat(200) });
  assert.deepEqual(bounded, { retained_locally: true, truncated: true, reason: "Projected result exceeds the GitHub publication limit" });
});

test("operation policy is fail-closed and resolves only explicit local references", (context) => {
  const { state } = fixture(context);
  const alias = state.ensureAlias("session", "ses_private123", "TASK-1");
  const otherAlias = state.ensureAlias("session", "ses_private456", "TASK-2");
  assert.equal(otherAlias, "session-2");
  const denied = new OperationPolicy({ manifest, state });
  assert.throws(() => denied.prepare("session.share", { path: { sessionID: { alias } } }), /blocked/);
  assert.throws(() => denied.prepare("session.prompt_async", { path: { sessionID: { alias } }, body: { parts: [] } }), /allowlist/);
  assert.throws(() => denied.prepare("session.get", { path: { sessionID: "ses_private123" } }), /Raw OpenCode identifiers/);
  assert.throws(() => denied.prepare("session.get", { path: { sessionID: { secret_ref: "token" } } }), /local-secret/);
  assert.throws(() => denied.prepare("file.read", { query: { directory: "..", path: "README.md" } }), /directory routing is controlled/);
  assert.throws(() => denied.prepare("v2.fs.read", { query: { location: { directory: ".." } }, wildcard: "README.md" }), /location routing is controlled/);
  assert.throws(() => denied.prepare("session.get", { path: { sessionID: { alias: otherAlias } } }, "TASK-1"), /not available to task TASK-1/);
  assert.equal(denied.prepare("session.get", { path: { sessionID: { alias } } }, "TASK-1").args.path?.sessionID, "ses_private123");

  const allowed = new OperationPolicy({
    manifest,
    state,
    allowedMutations: ["session.prompt_async"],
    allowedLocalSecretOperations: ["auth.set"],
    resolveSecret: (reference) => reference === "provider-token" ? "local-value" : (() => { throw new Error("missing secret"); })(),
  });
  const prompt = allowed.prepare("session.prompt_async", { path: { sessionID: { alias } }, body: { parts: [] } });
  assert.equal(prompt.args.path?.sessionID, "ses_private123");
  const secret = allowed.prepare("auth.set", { path: { providerID: "provider" }, body: { value: { secret_ref: "provider-token" } } });
  assert.deepEqual(secret.args.body, { value: "local-value" });
  assert.throws(() => allowed.prepare("auth.set", { path: { providerID: "provider" }, body: { password: "literal" } }), /Literal secret-like/);
  assert.throws(() => allowed.prepare("file.read", { query: { path: "/home/operator/file" } }), /Absolute local paths/);
});

test("command executor starts a guarded session, persists aliases, and publishes a safe result", async (context) => {
  const { state, projection } = fixture(context);
  const requests: Array<{ operationId: string; args: OperationArguments }> = [];
  const client = new OpenCodeClient({
    baseUrl: "http://127.0.0.1:4096",
    username: "bridge",
    password: "test",
    directory: "/home/operator/project",
    manifest,
    fetch: (() => { throw new Error("unexpected fetch"); }) as typeof fetch,
  });
  client.compatibility = async () => compatible;
  client.request = async (operationId, args = {}) => {
    requests.push({ operationId, args });
    if (operationId === "session.create") return { id: "ses_private123", directory: "/home/operator/project" };
    if (operationId === "session.prompt_async") return undefined;
    throw new Error(`unexpected operation ${operationId}`);
  };
  const recovered: string[] = [];
  const recovery = { recoverOnce: async () => { recovered.push("once"); } } as unknown as RecoveryCoordinator;
  const controller = new AbortController();
  const executor = new CommandExecutor({
    client,
    state,
    recovery,
    projection,
    operationPolicy: new OperationPolicy({ manifest, state }),
    instanceId: "test",
    signal: controller.signal,
    currentGitState: async () => ({ developerSha: "a".repeat(40), ref: "developer", clean: true }),
  });
  const accepted = state.acceptCommand(envelope(1, "start", { brief: "Implement the task", agent: "luna" }, true), 7).command;
  const result = await executor.execute(accepted);
  assert.equal(result.state, "succeeded");
  assert.equal(state.getTaskSession("TASK-1")?.sessionId, "ses_private123");
  assert.equal(state.resolveAlias("session-1", "session"), "ses_private123");
  assert.doesNotMatch(JSON.stringify(result.publicResult), /ses_private|\/home\/operator/);
  assert.deepEqual(requests.map((request) => request.operationId), ["session.create", "session.prompt_async"]);
  assert.equal(state.pendingOutbox(Date.now() + 1_000).length, 4);
  executor.requeueCompletedResults();
  assert.equal(state.pendingOutbox(Date.now() + 1_000).length, 4);
  controller.abort();
});

test("command executor rejects invalid input before mutation and fails closed on compatibility drift", async (context) => {
  const { state, projection } = fixture(context);
  const client = new OpenCodeClient({
    baseUrl: "http://127.0.0.1:4096",
    username: "bridge",
    password: "test",
    directory: "/home/operator/project",
    manifest,
    fetch: (() => { throw new Error("unexpected fetch"); }) as typeof fetch,
  });
  let compatibleNow = true;
  client.compatibility = async () => ({ ...compatible, compatible: compatibleNow });
  client.request = async (operationId) => {
    if (operationId === "auth.set") throw new Error("upstream echoed local-value");
    throw new Error("mutation must not run");
  };
  const controller = new AbortController();
  const executor = new CommandExecutor({
    client,
    state,
    recovery: { recoverOnce: async () => undefined } as unknown as RecoveryCoordinator,
    projection,
    operationPolicy: new OperationPolicy({
      manifest,
      state,
      allowedLocalSecretOperations: ["auth.set"],
      resolveSecret: () => "local-value",
    }),
    instanceId: "test",
    signal: controller.signal,
    currentGitState: async () => ({ developerSha: "a".repeat(40), ref: "developer", clean: true }),
  });
  const invalid = state.acceptCommand(envelope(1, "start", { unexpected: true }, true), 7).command;
  assert.equal((await executor.execute(invalid)).state, "failed");

  const unknownRequest = state.acceptCommand(envelope(2, "opencode.request", {
    operation_id: "project.current",
    request: { headers: { authorization: "ignored" } },
  }), 7).command;
  const unknownResult = await executor.execute(unknownRequest);
  assert.equal(unknownResult.state, "failed");
  assert.match(unknownResult.error ?? "", /request contains unknown field headers/);

  const malformedRequest = state.acceptCommand(envelope(3, "opencode.request", {
    operation_id: "project.current",
    request: { query: [] },
  }), 7).command;
  const malformedResult = await executor.execute(malformedRequest);
  assert.equal(malformedResult.state, "failed");
  assert.match(malformedResult.error ?? "", /request query must be an object/);

  const localSecret = state.acceptCommand(envelope(4, "opencode.request", {
    operation_id: "auth.set",
    request: {
      path: { providerID: "provider" },
      body: { value: { secret_ref: "provider-token" } },
    },
  }), 7).command;
  const localSecretResult = await executor.execute(localSecret);
  assert.equal(localSecretResult.state, "indeterminate");
  assert.match(JSON.stringify(localSecretResult.rawResult), /upstream echoed local-value/);
  assert.doesNotMatch(JSON.stringify(localSecretResult.publicResult), /local-value/);
  assert.match(localSecretResult.error ?? "", /sensitive detail retained locally/);

  compatibleNow = false;
  const drifted = state.acceptCommand(envelope(5, "start", { brief: "safe" }, true), 7).command;
  const result = await executor.execute(drifted);
  assert.equal(result.state, "failed");
  assert.match(result.error ?? "", /compatibility drift/);
  controller.abort();
});
