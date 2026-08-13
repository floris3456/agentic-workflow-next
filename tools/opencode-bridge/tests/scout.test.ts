import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import test, { type TestContext } from "node:test";
import { queueScoutResponseEvent, ScoutResponseTransport } from "../src/handoff.js";
import { Manifest } from "../src/manifest.js";
import { OpenCodeClient } from "../src/opencode.js";
import { PublicProjection } from "../src/projection.js";
import { RequestExecutor } from "../src/requests.js";
import { assertScoutAgentContract, ScoutRuntime, ScoutWorkspaceManager } from "../src/scout.js";
import { BridgeState } from "../src/state.js";
import type { CommandEnvelope, JsonValue, RequestEnvelope, StoredRequest } from "../src/types.js";

const manifest = Manifest.load(resolve(import.meta.dirname, "../../../../contracts/opencode-bridge/operation-manifest.json"));
const refSha = "a".repeat(40);

function fixture(context: TestContext) {
  const root = mkdtempSync(join(tmpdir(), "bridge-scout-test-"));
  const state = new BridgeState(join(root, "private", "bridge.sqlite"));
  const projection = new PublicProjection({ state, privateRoots: [root, "/snapshot"] });
  context.after(() => {
    state.close();
    rmSync(root, { recursive: true, force: true });
  });
  return { root, state, projection };
}

function request(
  id: string,
  taskId: string,
  kind: RequestEnvelope["kind"],
  argumentsRecord: Record<string, JsonValue>,
): RequestEnvelope {
  return {
    protocol: "agentic-bridge/1",
    request_id: id,
    task_id: taskId,
    kind,
    arguments: argumentsRecord,
  };
}

function scoutStart(id: string, taskId = "TASK-SCOUT"): RequestEnvelope {
  return request(id, taskId, "scout.start", {
    question: "Where is command admission enforced?",
    ref: refSha,
    scope: "tools/opencode-bridge/src/state.ts",
    expected_evidence: "Exact path, symbol, and relevant line references",
  });
}

const agentContract: JsonValue = [{
  name: "repository-scout",
  mode: "primary",
  model: { providerID: "openai", modelID: "gpt-5.6-luna" },
  options: { reasoningEffort: "high" },
  tools: {
    read: true,
    glob: true,
    grep: true,
    lsp: true,
    bash: false,
    apply_patch: false,
    task: false,
    skill: false,
    webfetch: false,
  },
  permission: {
    "*": "deny",
    read: "allow",
    glob: "allow",
    grep: "allow",
    lsp: "allow",
    edit: "deny",
    bash: "deny",
    task: "deny",
    skill: "deny",
    webfetch: "deny",
    websearch: "deny",
    question: "deny",
    todowrite: "deny",
    external_directory: "deny",
  },
}];
const scoutTools: JsonValue = [
  "read", "glob", "grep", "lsp", "bash", "edit", "write",
  "apply_patch", "task", "skill", "webfetch", "websearch", "question",
  "todowrite", "mcp_mutate",
];

test("Scout agent contract pins Luna high and rejects any mutating tool surface", () => {
  assert.doesNotThrow(() => assertScoutAgentContract(agentContract, scoutTools));

  const resolvedRuntime = structuredClone(agentContract) as JsonValue[];
  (resolvedRuntime[0] as Record<string, JsonValue>).permission = [
    { permission: "*", action: "allow", pattern: "*" },
    { permission: "external_directory", action: "allow", pattern: "/private/tool-output/*" },
    { permission: "*", action: "deny", pattern: "*" },
    { permission: "read", action: "allow", pattern: "*" },
    { permission: "read", action: "deny", pattern: "/private/tool-output/*" },
    { permission: "glob", action: "allow", pattern: "*" },
    { permission: "grep", action: "allow", pattern: "*" },
    { permission: "external_directory", action: "deny", pattern: "*" },
    { permission: "external_directory", action: "allow", pattern: "/private/tool-output/*" },
  ];
  assert.doesNotThrow(() => assertScoutAgentContract(resolvedRuntime, scoutTools));

  const unsafeTool = structuredClone(agentContract) as JsonValue[];
  (unsafeTool[0] as Record<string, JsonValue>).permission = {
    ...((unsafeTool[0] as Record<string, JsonValue>).permission as Record<string, JsonValue>),
    mcp_mutate: "allow",
  };
  assert.throws(() => assertScoutAgentContract(unsafeTool, scoutTools), /forbidden tool mcp_mutate/);

  const unsafePermission = structuredClone(agentContract) as JsonValue[];
  (unsafePermission[0] as Record<string, JsonValue>).permission = {
    ...((unsafePermission[0] as Record<string, JsonValue>).permission as Record<string, JsonValue>),
    bash: "allow",
  };
  assert.throws(() => assertScoutAgentContract(unsafePermission, scoutTools), /forbidden tool bash/);

  const noWildcard = structuredClone(agentContract) as JsonValue[];
  delete ((noWildcard[0] as Record<string, JsonValue>).permission as Record<string, JsonValue>)["*"];
  assert.throws(() => assertScoutAgentContract(noWildcard, ["read", "glob", "grep"]), /wildcard deny/);

  const exposedTruncation = structuredClone(agentContract) as JsonValue[];
  (exposedTruncation[0] as Record<string, JsonValue>).permission = [
    { permission: "*", action: "deny", pattern: "*" },
    { permission: "read", action: "allow", pattern: "*" },
    { permission: "glob", action: "allow", pattern: "*" },
    { permission: "grep", action: "allow", pattern: "*" },
    { permission: "external_directory", action: "deny", pattern: "*" },
    { permission: "external_directory", action: "allow", pattern: "/private/tool-output/*" },
  ];
  assert.throws(() => assertScoutAgentContract(exposedTruncation, ["read", "glob", "grep"]), /allowed external path/);
});

test("an interrupted Scout start becomes indeterminate and is never relaunched", (context) => {
  const { state, projection } = fixture(context);
  const start = state.acceptRequest(scoutStart("11111111-2222-4333-8444-555555555555"), 11).request;
  state.beginRequest(start.requestId);
  let launches = 0;
  const executor = new RequestExecutor({
    state,
    projection,
    scout: { start: async () => { launches++; return { unexpected: true }; } },
  });
  executor.requeueCompletedResults();
  assert.equal(state.getRequest(start.requestId)?.state, "indeterminate");
  assert.equal(launches, 0);
  assert.match(state.getRequest(start.requestId)?.error ?? "", /no side effect was repeated/);
});

test("interrupted local status reads are recomputed under the same UUID without launching a Scout", async (context) => {
  const { state, projection } = fixture(context);
  const reads = [
    request("11111111-2222-4333-8444-555555555551", "TASK-READ", "command.status", {
      command_id: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
    }),
    request("11111111-2222-4333-8444-555555555552", "TASK-READ", "task.status", {}),
    request("11111111-2222-4333-8444-555555555553", "TASK-READ", "scout.status", {
      scout_request_id: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb",
    }),
  ].map((envelope) => state.acceptRequest(envelope, 12).request);
  for (const read of reads) state.beginRequest(read.requestId);

  let launches = 0;
  const executor = new RequestExecutor({
    state,
    projection,
    scout: { start: async () => { launches++; return { unexpected: true }; } },
  });
  executor.requeueCompletedResults();
  assert.deepEqual(reads.map((read) => state.getRequest(read.requestId)?.state), ["accepted", "accepted", "accepted"]);

  await executor.executeAll(state.listRequests(["accepted"]));
  assert.deepEqual(reads.map((read) => state.getRequest(read.requestId)?.state), ["succeeded", "succeeded", "succeeded"]);
  assert.equal(launches, 0);
  assert.equal(state.listCommands().length, 0);
});

test("independent Scout starts execute concurrently while one mutating command is nonterminal", async (context) => {
  const { state, projection } = fixture(context);
  const mutation: CommandEnvelope = {
    protocol: "agentic-bridge/1",
    command_id: "10000000-0000-4000-8000-000000000001",
    task_id: "TASK-MUTATING",
    sequence: 1,
    kind: "start",
    arguments: { brief: "Implement bounded work" },
    expected: { developer_sha: "a".repeat(40), ref: "developer" },
  };
  assert.equal(state.acceptCommand(mutation, 10).disposition, "new");

  const starts = [
    state.acceptRequest(scoutStart("20000000-0000-4000-8000-000000000001", "TASK-A"), 20).request,
    state.acceptRequest(scoutStart("30000000-0000-4000-8000-000000000001", "TASK-B"), 30).request,
    state.acceptRequest(scoutStart("40000000-0000-4000-8000-000000000001", "TASK-MUTATING"), 10).request,
  ];
  let active = 0;
  let maximum = 0;
  let release!: () => void;
  const gate = new Promise<void>((resolvePromise) => { release = resolvePromise; });
  let entered = 0;
  let allEnteredResolve!: () => void;
  const allEntered = new Promise<void>((resolvePromise) => { allEnteredResolve = resolvePromise; });
  const scout = {
    start: async (stored: StoredRequest): Promise<JsonValue> => {
      active++;
      entered++;
      maximum = Math.max(maximum, active);
      if (entered === starts.length) allEnteredResolve();
      await gate;
      active--;
      return { status: "scout-started", scout_request_id: stored.requestId };
    },
  };
  const executor = new RequestExecutor({ state, projection, scout });
  const run = executor.executeAll(starts);
  await allEntered;
  assert.equal(maximum, 3);
  assert.equal(state.getCommand(mutation.command_id)?.state, "accepted");
  assert.equal(state.listCommands().length, 1);
  release();
  await run;
  assert.deepEqual(state.listRequests().map((entry) => entry.state), ["succeeded", "succeeded", "succeeded"]);
});

test("Scout runtime selects the enforced agent and correlates an exact-ref session", async (context) => {
  const { root, state, projection } = fixture(context);
  const workspaces = new ScoutWorkspaceManager(root, join(root, "private", "bridge.sqlite"));
  workspaces.prepare = async (sha) => {
    assert.equal(sha, refSha);
    return "/snapshot";
  };
  const calls: Array<{ operation: string; arguments?: JsonValue }> = [];
  const client = new OpenCodeClient({
    baseUrl: "http://127.0.0.1:4096",
    username: "bridge",
    password: "test",
    directory: "/snapshot",
    manifest,
    fetch: (() => { throw new Error("unexpected fetch"); }) as typeof fetch,
  });
  client.compatibility = async () => ({
    compatible: true,
    runningVersion: "1.18.16",
    expectedVersion: "1.18.16",
    actualHash: "same",
    expectedHash: "same",
    added: [],
    removed: [],
    changed: [],
  });
  client.request = async (operation, args) => {
    calls.push({ operation, ...(args === undefined ? {} : { arguments: args as JsonValue }) });
    if (operation === "app.agents") return agentContract;
    if (operation === "tool.ids") return scoutTools;
    if (operation === "session.create") return { id: "ses_scout_private" };
    if (operation === "session.prompt_async") return undefined;
    throw new Error(`unexpected operation ${operation}`);
  };
  const started: string[] = [];
  const scout = new ScoutRuntime({
    state,
    workspaces,
    clientFor: (workspace) => {
      assert.equal(workspace, "/snapshot");
      return client;
    },
    onSessionStarted: (requestId) => started.push(requestId),
  });
  const accepted = state.acceptRequest(scoutStart("50000000-0000-4000-8000-000000000001"), 50).request;
  const result = await new RequestExecutor({ state, projection, scout }).execute(accepted);
  assert.equal(result.state, "succeeded");
  assert.deepEqual(started, [accepted.requestId]);
  assert.deepEqual(calls.map((entry) => entry.operation), ["app.agents", "tool.ids", "session.create", "session.prompt_async"]);
  assert.equal(state.getScoutSession(accepted.requestId)?.refSha, refSha);
  assert.equal(state.getScoutSession(accepted.requestId)?.workspacePath, "/snapshot");
  const promptCall = JSON.stringify(calls[3]?.arguments);
  assert.match(promptCall, /Focused question/);
  assert.match(promptCall, /Expected evidence/);
  assert.match(promptCall, /"list_mcp_resources":false/);
  assert.match(promptCall, /"list_mcp_resource_templates":false/);
  assert.match(promptCall, /"read_mcp_resource":false/);
  assert.doesNotMatch(JSON.stringify(result.publicResult), /ses_scout_private|\/snapshot/);
});

test("Scout recovery starts from the durable mapping before prompt delivery can become ambiguous", async (context) => {
  const { root, state } = fixture(context);
  const workspaces = new ScoutWorkspaceManager(root, join(root, "private", "bridge.sqlite"));
  workspaces.prepare = async () => "/snapshot";
  const client = new OpenCodeClient({
    baseUrl: "http://127.0.0.1:4096",
    username: "bridge",
    password: "test",
    directory: "/snapshot",
    manifest,
    fetch: (() => { throw new Error("unexpected fetch"); }) as typeof fetch,
  });
  client.compatibility = async () => ({
    compatible: true,
    runningVersion: "1.18.16",
    expectedVersion: "1.18.16",
    actualHash: "same",
    expectedHash: "same",
    added: [],
    removed: [],
    changed: [],
  });
  client.request = async (operation) => {
    if (operation === "app.agents") return agentContract;
    if (operation === "tool.ids") return scoutTools;
    if (operation === "session.create") return { id: "ses_ambiguous" };
    if (operation === "session.prompt_async") throw new Error("response timed out after acceptance");
    throw new Error(`unexpected operation ${operation}`);
  };
  const started: string[] = [];
  const scout = new ScoutRuntime({
    state,
    workspaces,
    clientFor: () => client,
    onSessionStarted: (requestId) => {
      assert.equal(state.getScoutSession(requestId)?.sessionId, "ses_ambiguous");
      started.push(requestId);
    },
  });
  const accepted = state.acceptRequest(scoutStart("51000000-0000-4000-8000-000000000001"), 51).request;
  await assert.rejects(scout.start(accepted), /prompt delivery was not proven/);
  assert.deepEqual(started, [accepted.requestId]);
  assert.equal(state.getScoutSession(accepted.requestId)?.sessionState, "starting");
});

test("Scout results and status stay task and request correlated without leakage", async (context) => {
  const { state, projection } = fixture(context);
  const firstId = "60000000-0000-4000-8000-000000000001";
  const secondId = "70000000-0000-4000-8000-000000000001";
  state.acceptRequest(scoutStart(firstId, "TASK-A"), 60);
  state.acceptRequest(scoutStart(secondId, "TASK-B"), 70);
  state.mapScoutSession({ requestId: firstId, taskId: "TASK-A", sessionId: "ses_scout_a", issueNumber: 60, refSha, workspacePath: "/snapshot/a" });
  state.mapScoutSession({ requestId: secondId, taskId: "TASK-B", sessionId: "ses_scout_b", issueNumber: 70, refSha, workspacePath: "/snapshot/b" });
  assert.throws(() => state.mapScoutSession({
    requestId: "80000000-0000-4000-8000-000000000001",
    taskId: "TASK-B",
    sessionId: "ses_scout_a",
    issueNumber: 70,
    refSha,
    workspacePath: "/snapshot/b",
  }), /conflicts with request/);
  assert.throws(
    () => state.mapTaskSession("TASK-C", "ses_scout_a", 80, "small-developer"),
    /conflicts with Scout request/,
  );

  const delivery = queueScoutResponseEvent(state, {
    eventId: "evt_scout_a_idle",
    source: "session-v2",
    eventType: "session.idle",
    taskId: "TASK-A",
    sessionId: "ses_scout_a",
    sessionKind: "scout",
    requestId: firstId,
    payload: { sessionID: "ses_scout_a" },
  });
  assert.ok(delivery);
  const client = new OpenCodeClient({
    baseUrl: "http://127.0.0.1:4096",
    username: "bridge",
    password: "test",
    directory: "/snapshot/a",
    manifest,
    fetch: (() => { throw new Error("unexpected fetch"); }) as typeof fetch,
  });
  client.request = async () => [{
    info: { id: "msg_scout_a", role: "assistant", sessionID: "ses_scout_a" },
    parts: [{ id: "prt_scout_a", messageID: "msg_scout_a", type: "text", text: "Fact: admission is in state.ts. Unknown: caller ordering." }],
  }];
  const transport = new ScoutResponseTransport({ clientFor: (workspace) => {
    assert.equal(workspace, "/snapshot/a");
    return client;
  }, state, projection });
  await transport.deliver(delivery);
  assert.match(JSON.stringify(state.getScoutSession(firstId)?.latestResponse), /admission is in state\.ts/);
  assert.equal(state.getScoutSession(secondId)?.latestResponse, undefined);

  const wrongTaskStatus = state.acceptRequest(request(
    "90000000-0000-4000-8000-000000000001",
    "TASK-B",
    "scout.status",
    { scout_request_id: firstId },
  ), 70).request;
  const wrong = await new RequestExecutor({ state, projection }).execute(wrongTaskStatus);
  assert.deepEqual(wrong.publicResult, { found: false, task_id: "TASK-B", scout_request_id: firstId });

  const correctStatus = state.acceptRequest(request(
    "a0000000-0000-4000-8000-000000000001",
    "TASK-A",
    "scout.status",
    { scout_request_id: firstId },
  ), 60).request;
  const correct = await new RequestExecutor({ state, projection }).execute(correctStatus);
  assert.match(JSON.stringify(correct.publicResult), /admission is in state\.ts/);
  assert.doesNotMatch(JSON.stringify(correct.publicResult), /ses_scout_a|msg_scout_a|prt_scout_a|\/snapshot/);
});

test("Scout workspace is a clean detached exact-origin snapshot independent of active changes", async (context) => {
  const root = mkdtempSync(join(tmpdir(), "bridge-scout-worktree-"));
  const bare = join(root, "remote.git");
  const repository = join(root, "repository");
  context.after(() => rmSync(root, { recursive: true, force: true }));
  execFileSync("git", ["init", "--bare", bare]);
  execFileSync("git", ["init", repository]);
  execFileSync("git", ["config", "user.name", "Scout Test"], { cwd: repository });
  execFileSync("git", ["config", "user.email", "scout@example.invalid"], { cwd: repository });
  execFileSync("git", ["remote", "add", "origin", bare], { cwd: repository });
  writeFileSync(join(repository, "fact.txt"), "remote fact\n");
  execFileSync("git", ["add", "fact.txt"], { cwd: repository });
  execFileSync("git", ["commit", "-m", "initial"], { cwd: repository });
  execFileSync("git", ["branch", "-M", "developer"], { cwd: repository });
  execFileSync("git", ["push", "-u", "origin", "developer"], { cwd: repository });
  const remoteSha = execFileSync("git", ["rev-parse", "HEAD"], { cwd: repository, encoding: "utf8" }).trim();

  writeFileSync(join(repository, "fact.txt"), "active uncommitted change\n");
  writeFileSync(join(repository, "untracked.txt"), "active only\n");
  const manager = new ScoutWorkspaceManager(repository, join(root, "private", "bridge.sqlite"));
  const [first, second] = await Promise.all([manager.prepare(remoteSha), manager.prepare(remoteSha)]);
  assert.equal(first, second);
  assert.equal(execFileSync("git", ["rev-parse", "HEAD"], { cwd: first, encoding: "utf8" }).trim(), remoteSha);
  assert.equal(execFileSync("git", ["branch", "--show-current"], { cwd: first, encoding: "utf8" }).trim(), "");
  assert.equal(execFileSync("git", ["status", "--porcelain", "--untracked-files=all"], { cwd: first, encoding: "utf8" }).trim(), "");
  assert.equal(readFileSync(join(first, "fact.txt"), "utf8"), "remote fact\n");
  assert.equal(readFileSync(join(repository, "fact.txt"), "utf8"), "active uncommitted change\n");

  execFileSync("git", ["add", "fact.txt", "untracked.txt"], { cwd: repository });
  execFileSync("git", ["commit", "-m", "local only"], { cwd: repository });
  const localOnly = execFileSync("git", ["rev-parse", "HEAD"], { cwd: repository, encoding: "utf8" }).trim();
  await assert.rejects(manager.prepare(localOnly), /not present in the locally synchronized origin\/developer history/);
});
