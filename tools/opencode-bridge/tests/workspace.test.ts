import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import {
  mkdtempSync,
  mkdirSync,
  renameSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { execFileSync } from "node:child_process";
import test, { type TestContext } from "node:test";
import { CommandExecutor } from "../src/commands.js";
import { loadBridgeConfig, type BridgeConfig } from "../src/config.js";
import { DeveloperResponseTransport, terminalResponseDelivery } from "../src/handoff.js";
import { Manifest } from "../src/manifest.js";
import { OpenCodeClient } from "../src/opencode.js";
import { OperationPolicy, PublicProjection } from "../src/projection.js";
import { RecoveryCoordinator } from "../src/recovery.js";
import { githubRepositoryIdentity } from "../src/repository-identity.js";
import { bridgeStatus, refreshOpenCodeInstances } from "../src/service.js";
import { BridgeState } from "../src/state.js";
import type {
  CommandEnvelope,
  CompatibilityResult,
  JsonValue,
  OperationArguments,
} from "../src/types.js";
import {
  parseWorktreeInventory,
  TemplateDevelopmentWorktreeResolver,
} from "../src/workspace.js";

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

function git(cwd: string, args: string[]): string {
  return execFileSync("git", args, { cwd, encoding: "utf8" }).trim();
}

interface RepositoryFixture {
  root: string;
  developer: string;
  template: string;
  head: string;
  resolver: TemplateDevelopmentWorktreeResolver;
}

function repositoryFixture(context: TestContext): RepositoryFixture {
  const root = mkdtempSync(join(tmpdir(), "bridge-workspace-route-"));
  const developer = join(root, "developer");
  const template = join(root, "template");
  mkdirSync(developer);
  git(developer, ["init", "--initial-branch=developer"]);
  git(developer, ["config", "user.name", "Workspace Fixture"]);
  git(developer, ["config", "user.email", "workspace-fixture@example.invalid"]);
  writeFileSync(join(developer, "README.md"), "fixture\n", "utf8");
  git(developer, ["add", "README.md"]);
  git(developer, ["commit", "-m", "fixture"]);
  git(developer, ["remote", "add", "origin", "https://github.com/floris3456/agentic-workflow-template.git"]);
  const head = git(developer, ["rev-parse", "HEAD"]);
  git(developer, ["update-ref", "refs/remotes/origin/developer", head]);
  git(developer, ["branch", "template-development", head]);
  git(developer, ["update-ref", "refs/remotes/origin/template-development", head]);
  git(developer, ["worktree", "add", template, "template-development"]);
  git(template, ["branch", "--set-upstream-to=origin/template-development", "template-development"]);
  context.after(() => rmSync(root, { recursive: true, force: true }));

  const resolver = new TemplateDevelopmentWorktreeResolver({
    repositoryRoot: developer,
    identity: githubRepositoryIdentity({
      apiBaseUrl: "https://api.github.com",
      owner: "floris3456",
      repository: "agentic-workflow-template",
    }),
    fetchRemote: false,
  });
  return { root, developer, template, head, resolver };
}

function stateFixture(context: TestContext): {
  state: BridgeState;
  projection: PublicProjection;
  root: string;
} {
  const root = mkdtempSync(join(tmpdir(), "bridge-workspace-state-"));
  const state = new BridgeState(join(root, "state", "bridge.sqlite"));
  context.after(() => {
    state.close();
    rmSync(root, { recursive: true, force: true });
  });
  return { state, projection: new PublicProjection({ state }), root };
}

function fakeClient(
  directory: string,
  sessionId: string,
  requests: Array<{ operationId: string; args: OperationArguments }>,
): OpenCodeClient {
  let createdCount = 0;
  const client = new OpenCodeClient({
    baseUrl: "http://127.0.0.1:4096",
    username: "bridge",
    password: "test",
    directory,
    manifest,
    fetch: (() => { throw new Error("unexpected fetch"); }) as typeof fetch,
  });
  client.compatibility = async () => compatible;
  client.request = async (operationId, args = {}) => {
    requests.push({ operationId, args });
    if (operationId === "session.create") {
      createdCount++;
      return { id: createdCount === 1 ? sessionId : `${sessionId}_${createdCount}`, directory };
    }
    if (operationId === "session.prompt_async") return undefined;
    if (operationId === "session.status") return {};
    if (operationId === "session.messages") return [];
    if (operationId === "question.reply" || operationId === "permission.reply") return undefined;
    if (operationId === "session.abort") return { aborted: true };
    throw new Error(`unexpected operation ${operationId}`);
  };
  return client;
}

function command(
  taskId: string,
  sequence: number,
  kind: string,
  argumentsValue: Record<string, JsonValue>,
  expected?: CommandEnvelope["expected"],
): CommandEnvelope {
  return {
    protocol: "agentic-bridge/1",
    sequence,
    command_id: `${String(sequence).padStart(8, "0")}-1111-4111-8111-${createHash("sha256").update(taskId).digest("hex").slice(0, 12)}`,
    task_id: taskId,
    kind,
    arguments: argumentsValue,
    ...(expected ? { expected } : {}),
  };
}

test("template worktree resolver proves the registered exact repository and never publishes its path", async (context) => {
  const fixture = repositoryFixture(context);
  const resolved = await fixture.resolver.resolveRuntime();
  assert.equal(resolved.directory, fixture.template);
  assert.equal(resolved.templateDevelopmentSha, fixture.head);
  assert.equal(resolved.ref, "template-development");
  assert.equal(resolved.clean, true);
  assert.deepEqual(await fixture.resolver.synchronizedState(), {
    templateDevelopmentSha: fixture.head,
    ref: "template-development",
    clean: true,
  });

  const stateRoot = mkdtempSync(join(tmpdir(), "bridge-workspace-projection-"));
  const state = new BridgeState(join(stateRoot, "bridge.sqlite"));
  context.after(() => {
    state.close();
    rmSync(stateRoot, { recursive: true, force: true });
  });
  const projection = new PublicProjection({ state });
  projection.addPrivateRoot(resolved.directory);
  assert.deepEqual(projection.project({ directory: join(resolved.directory, "src") }), {
    directory: "[local-path]/src",
  });

  writeFileSync(join(fixture.template, "dirty.txt"), "dirty\n", "utf8");
  assert.equal((await fixture.resolver.resolveRuntime()).clean, false);
  await assert.rejects(
    fixture.resolver.synchronizedState(),
    /clean and synchronized/,
  );
});

test("template worktree resolver rejects missing, stale, foreign-looking, and symlinked registrations without path leakage", async (context) => {
  const symlinked = repositoryFixture(context);
  const realTemplate = join(symlinked.root, "template-real");
  renameSync(symlinked.template, realTemplate);
  symlinkSync(realTemplate, symlinked.template, "dir");
  await assert.rejects(symlinked.resolver.resolveRuntime(), (error: unknown) => {
    assert.match(String(error), /non-symlink/);
    assert.equal(String(error).includes(symlinked.root), false);
    return true;
  });

  const missing = repositoryFixture(context);
  git(missing.developer, ["worktree", "remove", missing.template]);
  const foreign = join(missing.root, "agentic-workflow-template-template-development");
  mkdirSync(foreign);
  git(foreign, ["init", "--initial-branch=template-development"]);
  await assert.rejects(missing.resolver.resolveRuntime(), /registered template-development worktree is missing/i);

  const stale = repositoryFixture(context);
  rmSync(stale.template, { recursive: true, force: true });
  await assert.rejects(stale.resolver.resolveRuntime(), /stale|non-symlink/i);
});

test("NUL-delimited inventory keeps duplicate template registrations explicit for fail-closed selection", () => {
  const sha = "a".repeat(40);
  const entries = parseWorktreeInventory([
    "worktree /one",
    `HEAD ${sha}`,
    "branch refs/heads/template-development",
    "",
    "worktree /two",
    `HEAD ${sha}`,
    "branch refs/heads/template-development",
    "",
  ].join("\0"));
  assert.equal(entries.filter((entry) => entry.branch === "refs/heads/template-development").length, 2);
});

test("workspace.start and every same-task interaction stay on the fixed template runtime while developer starts remain unchanged", async (context) => {
  const { state, projection } = stateFixture(context);
  const developerRequests: Array<{ operationId: string; args: OperationArguments }> = [];
  const workspaceRequests: Array<{ operationId: string; args: OperationArguments }> = [];
  const developerDirectory = "/private/developer";
  const templateDirectory = "/private/template-development";
  projection.addPrivateRoot(developerDirectory);
  projection.addPrivateRoot(templateDirectory);
  const developer = fakeClient(developerDirectory, "ses_developer_private", developerRequests);
  const workspace = fakeClient(templateDirectory, "ses_workspace_private", workspaceRequests);
  const developerRecovery = {
    recoverOnce: async () => undefined,
  } as unknown as RecoveryCoordinator;
  const workspaceRecovery = {
    recoverOnce: async () => undefined,
    captureContinuationBaseline: async () => undefined,
    continueAfterInteraction: async () => ({ outcome: "clean", reason: "session-progressing" }),
  } as unknown as RecoveryCoordinator;
  const controller = new AbortController();
  const executor = new CommandExecutor({
    client: developer,
    state,
    recovery: developerRecovery,
    projection,
    operationPolicy: new OperationPolicy({ manifest, state }),
    instanceId: "test",
    signal: controller.signal,
    currentGitState: async () => ({ developerSha: "d".repeat(40), ref: "developer", clean: true }),
    workspaceRuntime: async () => ({
      client: workspace,
      recovery: workspaceRecovery,
      currentGitState: async () => ({
        templateDevelopmentSha: "t".repeat(40),
        ref: "template-development",
        clean: true,
      }),
    }),
  });

  const workspaceStart = state.acceptCommand(command(
    "TASK-WORKSPACE",
    1,
    "workspace.start",
    { brief: "Maintain developer without changing the OpenCode instruction root" },
    { template_development_sha: "t".repeat(40), ref: "template-development" },
  ), 70).command!;
  const started = await executor.execute(workspaceStart);
  assert.equal(started.state, "succeeded");
  assert.equal(state.getTaskSession("TASK-WORKSPACE")?.sessionKind, "workspace");
  assert.equal(state.getTaskSession("TASK-WORKSPACE")?.agent, "small-workspace-maintainer");
  assert.equal(workspace.directory, templateDirectory);
  assert.equal(developerRequests.length, 0);
  assert.deepEqual(workspaceRequests.map((entry) => entry.operationId), ["session.create", "session.prompt_async"]);
  assert.equal((workspaceRequests[0]?.args.body as Record<string, JsonValue>)?.agent, "small-workspace-maintainer");
  assert.doesNotMatch(JSON.stringify(started.publicResult), /private|ses_workspace/);

  const questionAlias = state.ensureAlias("question", "que_workspace_private", "TASK-WORKSPACE");
  const reply = state.acceptCommand(command(
    "TASK-WORKSPACE",
    2,
    "question.reply",
    { question: questionAlias, answers: [["Continue"]] },
  ), 70).command!;
  assert.equal((await executor.execute(reply)).state, "succeeded");
  assert.equal(workspaceRequests.at(-1)?.operationId, "question.reply");

  const steer = state.acceptCommand(command(
    "TASK-WORKSPACE",
    3,
    "steer",
    { message: "Continue the same mapped session" },
  ), 70).command!;
  assert.equal((await executor.execute(steer)).state, "succeeded");
  assert.equal(workspaceRequests.at(-1)?.operationId, "session.prompt_async");

  const route = state.acceptCommand(command(
    "TASK-WORKSPACE",
    4,
    "route",
    { agent: "heavy" },
  ), 70).command!;
  assert.equal((await executor.execute(route)).state, "failed");
  assert.match(state.getCommand(route.commandId)?.error ?? "", /fixed workspace route/);

  const pty = state.acceptCommand(command(
    "TASK-WORKSPACE",
    5,
    "pty.create",
    { command: "bash" },
  ), 70).command!;
  assert.equal((await executor.execute(pty)).state, "failed");
  assert.match(state.getCommand(pty.commandId)?.error ?? "", /do not expose bridge PTYs/);

  const developerStart = state.acceptCommand(command(
    "TASK-DEVELOPER",
    1,
    "start",
    { brief: "Keep the normal developer route", agent: "small" },
    { developer_sha: "d".repeat(40), ref: "developer" },
  ), 71).command!;
  assert.equal((await executor.execute(developerStart)).state, "succeeded");
  assert.equal(state.getTaskSession("TASK-DEVELOPER")?.sessionKind, "developer");
  assert.deepEqual(developerRequests.map((entry) => entry.operationId), ["session.create", "session.prompt_async"]);
  assert.equal((developerRequests[0]?.args.body as Record<string, JsonValue>)?.agent, "small-developer");
  controller.abort();
});


test("workspace.start supports model-agnostic small and heavy routes and rejects invalid selectors or runtime switches", async (context) => {
  const { state, projection } = stateFixture(context);
  const developerRequests: Array<{ operationId: string; args: OperationArguments }> = [];
  const workspaceRequests: Array<{ operationId: string; args: OperationArguments }> = [];
  const developer = fakeClient("/private/developer", "ses_developer_switch", developerRequests);
  const workspace = fakeClient("/private/template-development", "ses_workspace_switch", workspaceRequests);
  const controller = new AbortController();
  const executor = new CommandExecutor({
    client: developer,
    state,
    recovery: { recoverOnce: async () => undefined } as unknown as RecoveryCoordinator,
    projection,
    operationPolicy: new OperationPolicy({ manifest, state }),
    instanceId: "test",
    signal: controller.signal,
    currentGitState: async () => ({ developerSha: "d".repeat(40), ref: "developer", clean: true }),
    workspaceRuntime: async () => ({
      client: workspace,
      recovery: { recoverOnce: async () => undefined } as unknown as RecoveryCoordinator,
      currentGitState: async () => ({
        templateDevelopmentSha: "e".repeat(40),
        ref: "template-development",
        clean: true,
      }),
    }),
  });

  const legacyModel = state.acceptCommand(command(
    "TASK-WORKSPACE",
    1,
    "workspace.start",
    { brief: "Reject legacy model selector", agent: "sol" },
    { template_development_sha: "e".repeat(40), ref: "template-development" },
  ), 75).command!;
  assert.equal((await executor.execute(legacyModel)).state, "failed");
  assert.match(state.getCommand(legacyModel.commandId)?.error ?? "", /agent must be small or heavy/);
  assert.equal(state.getTaskSession("TASK-WORKSPACE"), undefined);
  assert.equal(workspaceRequests.length, 0);

  const unknownField = state.acceptCommand(command(
    "TASK-WORKSPACE",
    2,
    "workspace.start",
    { brief: "Reject unknown argument field", unexpected: true },
    { template_development_sha: "e".repeat(40), ref: "template-development" },
  ), 75).command!;
  assert.equal((await executor.execute(unknownField)).state, "failed");
  assert.match(state.getCommand(unknownField.commandId)?.error ?? "", /unknown field unexpected/);
  assert.equal(state.getTaskSession("TASK-WORKSPACE"), undefined);
  assert.equal(workspaceRequests.length, 0);

  const switchRoute = state.acceptCommand(command(
    "TASK-WORKSPACE",
    3,
    "start",
    { brief: "Do not switch this task to developer" },
    { developer_sha: "d".repeat(40), ref: "developer" },
  ), 75).command!;
  assert.equal((await executor.execute(switchRoute)).state, "failed");
  assert.match(state.getCommand(switchRoute.commandId)?.error ?? "", /cannot change from workspace to developer/);
  assert.equal(developerRequests.length, 0);

  const heavyStart = state.acceptCommand(command(
    "TASK-WORKSPACE-HEAVY",
    1,
    "workspace.start",
    { brief: "Start heavy workspace maintainer", agent: "heavy" },
    { template_development_sha: "e".repeat(40), ref: "template-development" },
  ), 76).command!;
  assert.equal((await executor.execute(heavyStart)).state, "succeeded");
  assert.equal(state.getTaskSession("TASK-WORKSPACE-HEAVY")?.agent, "heavy-workspace-maintainer");
  assert.equal((workspaceRequests[0]?.args.body as Record<string, JsonValue>)?.agent, "heavy-workspace-maintainer");

  const smallStart = state.acceptCommand(command(
    "TASK-WORKSPACE-SMALL",
    1,
    "workspace.start",
    { brief: "Start default small workspace maintainer" },
    { template_development_sha: "e".repeat(40), ref: "template-development" },
  ), 77).command!;
  assert.equal((await executor.execute(smallStart)).state, "succeeded");
  assert.equal(state.getTaskSession("TASK-WORKSPACE-SMALL")?.agent, "small-workspace-maintainer");
  assert.equal((workspaceRequests[2]?.args.body as Record<string, JsonValue>)?.agent, "small-workspace-maintainer");
  controller.abort();
});


test("global recovery is filtered by durable task-session kind", async (context) => {
  const { state } = stateFixture(context);
  state.mapTaskSession("TASK-DEVELOPER", "ses_developer_filter", 73, "small-developer");
  state.mapTaskSession("TASK-WORKSPACE", "ses_workspace_filter", 74, "workspace-maintainer", "workspace");
  const histories: string[] = [];
  const client = fakeClient("/private/template-development", "unused", []);
  client.request = async (operationId, args = {}) => {
    if (operationId === "sync.history.list") return [];
    if (operationId === "v2.session.history") {
      histories.push(String(args.path?.sessionID));
      return { data: [], hasMore: false };
    }
    if (operationId === "permission.list" || operationId === "question.list") return [];
    if (operationId === "session.status") return {};
    if (operationId === "session.messages") return [];
    throw new Error(`unexpected operation ${operationId}`);
  };

  const workspaceRecovery = new RecoveryCoordinator({
    client,
    state,
    taskSessionKind: "workspace",
  });
  await workspaceRecovery.recoverOnce();
  assert.deepEqual(histories, ["ses_workspace_filter"]);

  histories.length = 0;
  const developerRecovery = new RecoveryCoordinator({
    client,
    state,
    taskSessionKind: "developer",
  });
  await developerRecovery.recoverOnce();
  assert.deepEqual(histories, ["ses_developer_filter"]);
});

test("workspace recovery and terminal delivery retain session kind, client, correlation, and redaction", async (context) => {
  const { state, projection } = stateFixture(context);
  const templateDirectory = "/private/template-development";
  projection.addPrivateRoot(templateDirectory);
  state.mapTaskSession(
    "TASK-WORKSPACE",
    "ses_workspace_terminal",
    72,
    "workspace-maintainer",
    "workspace",
  );
  const requests: string[] = [];
  const client = fakeClient(templateDirectory, "unused", []);
  client.request = async (operationId) => {
    requests.push(operationId);
    if (operationId === "permission.list" || operationId === "question.list") return [];
    if (operationId === "session.status") return {};
    if (operationId === "session.messages") {
      return [{
        info: {
          id: "msg_workspace_terminal",
          sessionID: "ses_workspace_terminal",
          role: "assistant",
          finish: "stop",
          time: { completed: 123 },
        },
        parts: [{ type: "text", text: `Completed in ${templateDirectory}/src` }],
      }];
    }
    throw new Error(`unexpected operation ${operationId}`);
  };
  const recovery = new RecoveryCoordinator({
    client,
    state,
    taskSessionKind: "workspace",
  });
  const session = state.getTaskSession("TASK-WORKSPACE")!;
  assert.equal(await recovery.recoverDeveloperCanonical(session), true);
  const delivery = state.pendingResponseDeliveries()[0];
  assert.equal(delivery?.deliveryKind, "workspace");
  assert.equal(terminalResponseDelivery(state, {
    eventId: "evt_workspace",
    source: "canonical-recovery",
    eventType: "session.idle",
    payload: {},
    taskId: "TASK-WORKSPACE",
    sessionId: "ses_workspace_terminal",
    sessionKind: "workspace",
  })?.deliveryKind, "workspace");

  const transport = new DeveloperResponseTransport({
    client,
    state,
    projection,
    deliveryKind: "workspace",
  });
  await transport.deliver(delivery);
  assert.equal(state.pendingResponseDeliveries().length, 0);
  const comments = state.pendingOutbox(Date.now() + 1_000)
    .map((item) => JSON.stringify(item.payload))
    .join("\n");
  assert.match(comments, /latest_workspace_response/);
  assert.doesNotMatch(comments, /\/private\/template-development/);
  assert.deepEqual(requests.slice(0, 4), [
    "permission.list",
    "question.list",
    "session.status",
    "session.messages",
  ]);
});

function bridgeConfigFixture(context: TestContext, repo: RepositoryFixture): { config: BridgeConfig; configFile: string; state: BridgeState } {
  const privateDirectory = join(repo.root, "private");
  mkdirSync(privateDirectory, { mode: 0o700 });
  const stateFile = join(repo.developer, ".git", "bridge", "state.sqlite");
  mkdirSync(join(repo.developer, ".git", "bridge"), { recursive: true, mode: 0o700 });
  const passwordFile = join(privateDirectory, "opencode-password");
  const scoutPasswordFile = join(privateDirectory, "scout-password");
  const privateKeyFile = join(privateDirectory, "github.pem");
  const secretFile = join(privateDirectory, "provider-token");
  writeFileSync(passwordFile, "local-password\n", { mode: 0o600 });
  writeFileSync(scoutPasswordFile, "scout-password\n", { mode: 0o600 });
  writeFileSync(privateKeyFile, "-----BEGIN PRIVATE KEY-----\ntest\n-----END PRIVATE KEY-----\n", { mode: 0o600 });
  writeFileSync(secretFile, "provider-value\n", { mode: 0o600 });
  const manifestFile = resolve(import.meta.dirname, "../../../../contracts/opencode-bridge/operation-manifest.json");

  const document = {
    schema_version: 1,
    instance_id: "test-instance",
    repository_root: repo.developer,
    manifest_file: manifestFile,
    state_file: stateFile,
    opencode: {
      base_url: "http://127.0.0.1:44123",
      scout_base_url: "http://127.0.0.1:44124",
      username: "opencode",
      password_file: passwordFile,
      scout_password_file: scoutPasswordFile,
      scout_runtime_root: join(privateDirectory, "scout-runtime"),
      scout_provider_api_key_file: secretFile,
    },
    github: {
      app_id: "12345",
      installation_id: 67890,
      private_key_file: privateKeyFile,
      owner: "floris3456",
      repository: "agentic-workflow-template",
      control_label: "agentic-bridge",
      allowed_authors: ["floris3456"],
      comment_author: "test-app[bot]",
      active_interval_ms: 5000,
      idle_interval_ms: 15000,
    },
    policy: {
      pty_enabled: false,
      promotion_enabled: false,
    },
  };
  const configFile = join(privateDirectory, "bridge-config.json");
  writeFileSync(configFile, `${JSON.stringify(document, null, 2)}\n`, { mode: 0o600 });
  const config = loadBridgeConfig(configFile);
  const state = new BridgeState(stateFile);
  context.after(() => {
    state.close();
  });
  return { config, configFile, state };
}

test("refreshOpenCodeInstances fails closed when a developer or workspace task session is nonterminal even if command queue is empty", async (context) => {
  const repo = repositoryFixture(context);
  const { config, state } = bridgeConfigFixture(context, repo);

  // Map a developer session that is currently starting (nonterminal)
  state.mapTaskSession("TASK-DEV", "ses_dev_busy", 80, "small-developer", "developer");

  const originalFetch = globalThis.fetch;
  const disposeCalls: string[] = [];
  globalThis.fetch = (async (input: string | URL | Request, init?: RequestInit) => {
    const url = new URL(typeof input === "string" ? input : input instanceof Request ? input.url : input.toString());
    if (url.pathname === "/session/status") {
      return Response.json({});
    }
    if (url.pathname === "/instance/dispose") {
      disposeCalls.push(url.searchParams.get("directory") ?? "");
      return Response.json(true);
    }
    return originalFetch(input, init);
  }) as typeof fetch;
  context.after(() => {
    globalThis.fetch = originalFetch;
  });

  // Verify bridgeStatus reports 1 active task session, 0 pending commands, 0 pending requests
  const status = bridgeStatus(config) as Record<string, unknown>;
  assert.equal(status.pending_commands, 0);
  assert.equal(status.pending_requests, 0);
  assert.equal(status.active_task_sessions, 1);
  assert.equal(status.active_developer_sessions, 1);
  assert.equal(status.active_workspace_sessions, 0);

  // refreshOpenCodeInstances must fail closed and NOT call /instance/dispose
  await assert.rejects(
    () => refreshOpenCodeInstances(config),
    /Cannot refresh OpenCode instance for developer: active nonterminal session\(s\) present: TASK-DEV/,
  );
  assert.equal(disposeCalls.length, 0);

  // Now mark developer session terminal (session.idle), and map a workspace session that is starting
  state.queueResponseDelivery({
    eventId: "evt-dev-idle",
    taskId: "TASK-DEV",
    sessionId: "ses_dev_busy",
    issueNumber: 80,
    eventType: "session.idle",
    deliveryKind: "developer",
  });
  state.completeResponseDelivery("evt-dev-idle");
  state.mapTaskSession("TASK-WS", "ses_ws_busy", 81, "small-workspace-maintainer", "workspace");

  const statusWs = bridgeStatus(config) as Record<string, unknown>;
  assert.equal(statusWs.pending_commands, 0);
  assert.equal(statusWs.active_task_sessions, 1);
  assert.equal(statusWs.active_developer_sessions, 0);
  assert.equal(statusWs.active_workspace_sessions, 1);

  await assert.rejects(
    () => refreshOpenCodeInstances(config),
    /Cannot refresh OpenCode instance for workspace: active nonterminal session\(s\) present: TASK-WS/,
  );
  assert.equal(disposeCalls.length, 0);
});

test("refreshOpenCodeInstances fails closed when OpenCode session.status is busy even if not in BridgeState", async (context) => {
  const repo = repositoryFixture(context);
  const { config } = bridgeConfigFixture(context, repo);

  const originalFetch = globalThis.fetch;
  const disposeCalls: string[] = [];
  globalThis.fetch = (async (input: string | URL | Request, init?: RequestInit) => {
    const url = new URL(typeof input === "string" ? input : input instanceof Request ? input.url : input.toString());
    if (url.pathname === "/session/status") {
      return Response.json({ ses_external_busy: { type: "busy" } });
    }
    if (url.pathname === "/instance/dispose") {
      disposeCalls.push(url.searchParams.get("directory") ?? "");
      return Response.json(true);
    }
    return originalFetch(input, init);
  }) as typeof fetch;
  context.after(() => {
    globalThis.fetch = originalFetch;
  });

  await assert.rejects(
    () => refreshOpenCodeInstances(config),
    /Cannot refresh OpenCode instance: OpenCode session ses_external_busy is currently busy/,
  );
  assert.equal(disposeCalls.length, 0);
});

test("refreshOpenCodeInstances succeeds and disposes registered worktrees for truly quiescent instances", async (context) => {
  const repo = repositoryFixture(context);
  const { config, state } = bridgeConfigFixture(context, repo);

  // Map developer and workspace sessions that are terminal
  state.mapTaskSession("TASK-DEV", "ses_dev_done", 80, "small-developer", "developer");
  state.queueResponseDelivery({
    eventId: "evt-dev-idle",
    taskId: "TASK-DEV",
    sessionId: "ses_dev_done",
    issueNumber: 80,
    eventType: "session.idle",
    deliveryKind: "developer",
  });
  state.mapTaskSession("TASK-WS", "ses_ws_done", 81, "small-workspace-maintainer", "workspace");
  state.queueResponseDelivery({
    eventId: "evt-ws-idle",
    taskId: "TASK-WS",
    sessionId: "ses_ws_done",
    issueNumber: 81,
    eventType: "session.idle",
    deliveryKind: "workspace",
  });
  state.completeResponseDelivery("evt-dev-idle");
  state.completeResponseDelivery("evt-ws-idle");

  const originalFetch = globalThis.fetch;
  const disposeCalls: string[] = [];
  globalThis.fetch = (async (input: string | URL | Request, init?: RequestInit) => {
    const url = new URL(typeof input === "string" ? input : input instanceof Request ? input.url : input.toString());
    if (url.pathname === "/session/status") {
      return Response.json({
        ses_dev_done: { type: "idle" },
        ses_ws_done: { type: "idle" },
      });
    }
    if (url.pathname === "/instance/dispose") {
      disposeCalls.push(url.searchParams.get("directory") ?? "");
      return Response.json(true);
    }
    return originalFetch(input, init);
  }) as typeof fetch;
  context.after(() => {
    globalThis.fetch = originalFetch;
  });

  const status = bridgeStatus(config) as Record<string, unknown>;
  assert.equal(status.active_task_sessions, 0);
  assert.equal(status.active_developer_sessions, 0);
  assert.equal(status.active_workspace_sessions, 0);

  const result = await refreshOpenCodeInstances(config);
  assert.deepEqual(result.disposed, [repo.developer, repo.template]);
  assert.deepEqual(disposeCalls, [repo.developer, repo.template]);
});
