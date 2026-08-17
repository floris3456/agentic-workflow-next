import { OpenCodeClient } from "./opencode.js";
import { PtyConnection } from "./pty.js";
import { commandStatusComment } from "./protocol.js";
import { OperationPolicy, PublicProjection } from "./projection.js";
import { RecoveryCoordinator, type ContinuationReplyBaseline } from "./recovery.js";
import { BridgeState } from "./state.js";
import type { CommandEnvelope, InteractionKind, JsonValue, OperationArguments, StoredCommand } from "./types.js";
import { asJson, asRecord, errorMessage, isRecord } from "./util.js";

type AgentRoute = "luna" | "sol";

export interface GitState {
  developerSha: string;
  ref: string;
  clean: boolean;
}

export interface PtyManagerOptions {
  client: OpenCodeClient;
  state: BridgeState;
  signal: AbortSignal;
}

export class PtyManager {
  private readonly client: OpenCodeClient;
  private readonly state: BridgeState;
  private readonly signal: AbortSignal;
  private readonly connections = new Map<string, PtyConnection>();

  constructor(options: PtyManagerOptions) {
    this.client = options.client;
    this.state = options.state;
    this.signal = options.signal;
  }

  private attach(alias: string, ptyId: string, cursor: number): void {
    if (this.connections.has(alias) || this.signal.aborted) return;
    const connection = new PtyConnection({
      client: this.client,
      ptyId,
      cursor,
      onOutput: (text, start, end) => this.state.appendPtyOutput(alias, text, start, end),
      onCursor: (next) => this.state.updatePty(alias, "connected", next),
      onState: (status) => this.state.updatePty(alias, status),
    });
    this.connections.set(alias, connection);
    void connection.run(this.signal).catch(() => {
      this.state.updatePty(alias, "disconnected");
    }).finally(() => {
      if (this.connections.get(alias) === connection) this.connections.delete(alias);
    });
  }

  restore(): void {
    for (const pty of this.state.listPtys()) {
      if (pty.status !== "removed" && pty.status !== "closed") this.attach(pty.alias, pty.ptyId, pty.cursor);
    }
  }

  register(alias: string, ptyId: string): void {
    this.attach(alias, ptyId, 0);
  }

  input(alias: string, data: string): void {
    const connection = this.connections.get(alias);
    if (!connection) throw new Error(`${alias} is not connected`);
    connection.input(data);
  }

  close(alias: string): void {
    this.connections.get(alias)?.close();
    this.connections.delete(alias);
    this.state.updatePty(alias, "removed");
  }
}

export interface CommandExecutorOptions {
  client: OpenCodeClient;
  state: BridgeState;
  recovery: RecoveryCoordinator;
  projection: PublicProjection;
  operationPolicy: OperationPolicy;
  instanceId: string;
  signal: AbortSignal;
  agents?: { luna: string; sol: string };
  ptyEnabled?: boolean;
  currentGitState?: () => Promise<GitState>;
  runPromotion?: (approvedSha: string) => Promise<JsonValue>;
  onSessionStarted?: (taskId: string) => void;
  onSessionContinued?: (taskId: string, sessionId: string) => void;
  onApplying?: (command: StoredCommand) => void | Promise<void>;
}

class IndeterminateCommandError extends Error {
  constructor(message: string, readonly raw?: JsonValue) {
    super(message);
    this.name = "IndeterminateCommandError";
  }
}

function keys(input: Record<string, JsonValue>, allowed: string[]): void {
  const unknown = Object.keys(input).filter((key) => !allowed.includes(key));
  if (unknown.length > 0) throw new TypeError(`Command arguments contain unknown field ${unknown[0]}`);
}

function text(input: Record<string, JsonValue>, name: string, maximum = 65_536): string {
  const value = input[name];
  if (typeof value !== "string" || value.length === 0 || Buffer.byteLength(value, "utf8") > maximum) {
    throw new TypeError(`${name} must be a non-empty string no larger than ${maximum} bytes`);
  }
  return value;
}

function optionalText(input: Record<string, JsonValue>, name: string, maximum = 1_000): string | undefined {
  if (input[name] === undefined) return undefined;
  return text(input, name, maximum);
}

function integer(input: Record<string, JsonValue>, name: string, fallback: number, maximum: number): number {
  const value = input[name] ?? fallback;
  if (!Number.isSafeInteger(value) || Number(value) < 0 || Number(value) > maximum) throw new TypeError(`${name} is invalid`);
  return Number(value);
}

function route(input: Record<string, JsonValue>, fallback: AgentRoute = "luna"): AgentRoute {
  const value = input.agent ?? fallback;
  if (value !== "luna" && value !== "sol") throw new TypeError("agent must be luna or sol");
  return value;
}

function idFromResult(value: JsonValue | undefined, label: string): string {
  const direct = isRecord(value) ? value : undefined;
  const nested = direct && isRecord(direct.data) ? direct.data : undefined;
  const id = nested?.id ?? direct?.id;
  if (typeof id !== "string" || id.length === 0) throw new Error(`${label} response did not contain an ID`);
  return id;
}

function requestArguments(value: JsonValue | undefined): OperationArguments {
  if (value === undefined) return {};
  const record = asRecord(value, "request arguments");
  const unknown = Object.keys(record).filter((key) => !["path", "query", "wildcard", "body"].includes(key));
  if (unknown.length > 0) throw new TypeError(`request contains unknown field ${unknown[0]}`);
  if (record.path !== undefined) asRecord(record.path, "request path");
  if (record.query !== undefined) asRecord(record.query, "request query");
  if (record.wildcard !== undefined && typeof record.wildcard !== "string") throw new TypeError("request wildcard must be a string");
  return asJson(record) as OperationArguments;
}

function outputPayload(command: StoredCommand): JsonValue {
  if (command.publicResult !== undefined) return command.publicResult;
  if (command.error) return { error: command.error };
  return { state: command.state };
}

export class CommandExecutor {
  private readonly client: OpenCodeClient;
  private readonly state: BridgeState;
  private readonly recovery: RecoveryCoordinator;
  private readonly projection: PublicProjection;
  private readonly operationPolicy: OperationPolicy;
  private readonly instanceId: string;
  private readonly agents: { luna: string; sol: string };
  private readonly ptyEnabled: boolean;
  private readonly currentGitState: (() => Promise<GitState>) | undefined;
  private readonly runPromotion: ((approvedSha: string) => Promise<JsonValue>) | undefined;
  private readonly onSessionStarted: ((taskId: string) => void) | undefined;
  private readonly onSessionContinued: ((taskId: string, sessionId: string) => void) | undefined;
  private readonly onApplying: ((command: StoredCommand) => void | Promise<void>) | undefined;
  readonly ptys: PtyManager;

  constructor(options: CommandExecutorOptions) {
    this.client = options.client;
    this.state = options.state;
    this.recovery = options.recovery;
    this.projection = options.projection;
    this.operationPolicy = options.operationPolicy;
    this.instanceId = options.instanceId;
    this.agents = options.agents ?? { luna: "small-developer", sol: "large-developer" };
    this.ptyEnabled = options.ptyEnabled === true;
    this.currentGitState = options.currentGitState;
    this.runPromotion = options.runPromotion;
    this.onSessionStarted = options.onSessionStarted;
    this.onSessionContinued = options.onSessionContinued;
    this.onApplying = options.onApplying;
    this.ptys = new PtyManager({ client: options.client, state: options.state, signal: options.signal });
  }

  private async guardExpected(envelope: CommandEnvelope, required: boolean): Promise<void> {
    if (required && (!envelope.expected?.developer_sha || !envelope.expected.ref)) {
      throw new Error(`${envelope.kind} requires top-level expected.developer_sha and expected.ref`);
    }
    if (required && envelope.expected?.ref !== "developer") throw new Error(`${envelope.kind} requires expected.ref developer`);
    if (!envelope.expected) return;
    if (!this.currentGitState) throw new Error("Git expected-state checking is unavailable");
    const actual = await this.currentGitState();
    if (envelope.expected.developer_sha && actual.developerSha !== envelope.expected.developer_sha) {
      throw new Error("Expected developer SHA does not match the synchronized local checkout");
    }
    if (envelope.expected.ref && actual.ref !== envelope.expected.ref) throw new Error("Expected Git ref does not match the local checkout");
    if (required && !actual.clean) throw new Error(`${envelope.kind} requires a clean synchronized checkout`);
  }

  private async requireCompatibility(): Promise<void> {
    const result = await this.client.compatibility();
    this.state.recordCompatibility(this.instanceId, result);
    if (!result.compatible) throw new Error("Consequential OpenCode command blocked by compatibility drift");
  }

  private task(command: StoredCommand) {
    const session = this.state.getTaskSession(command.taskId);
    if (!session) throw new Error(`Task ${command.taskId} has no mapped OpenCode session`);
    return session;
  }

  private async start(command: StoredCommand, markMutation: () => void): Promise<JsonValue> {
    const input = command.envelope.arguments;
    keys(input, ["brief", "agent", "title"]);
    if (this.state.getTaskSession(command.taskId)) throw new Error(`Task ${command.taskId} already has an OpenCode session`);
    const brief = text(input, "brief");
    const selected = route(input);
    const title = optionalText(input, "title", 200) ?? command.taskId;
    markMutation();
    const created = await this.client.request("session.create", { body: { title, agent: this.agents[selected] } });
    const sessionId = idFromResult(created, "OpenCode session creation");
    this.state.mapTaskSession(command.taskId, sessionId, command.issueNumber, this.agents[selected]);
    const alias = this.state.ensureAlias("session", sessionId, command.taskId);
    try {
      await this.client.request("session.prompt_async", {
        path: { sessionID: sessionId },
        body: { agent: this.agents[selected], parts: [{ type: "text", text: brief }] },
      });
    } catch (error) {
      throw new IndeterminateCommandError(`Session ${alias} was created, but initial prompt delivery was not proven: ${errorMessage(error)}`, created);
    }
    this.onSessionStarted?.(command.taskId);
    return { status: "started", session: sessionId, agent: selected, created: created ?? null };
  }

  private async status(command: StoredCommand): Promise<JsonValue> {
    keys(command.envelope.arguments, []);
    const session = this.state.getTaskSession(command.taskId);
    if (!session) return { task_id: command.taskId, session: null, state: command.state };
    const [status, messages] = await Promise.all([
      this.client.request("session.status"),
      this.client.request("session.messages", { path: { sessionID: session.sessionId }, query: { limit: 20 } }),
    ]);
    const taskStatus = isRecord(status) ? asJson(status[session.sessionId] ?? null) : status ?? null;
    return { task_id: command.taskId, session: session.sessionId, agent: session.agent, status: taskStatus, recent_messages: messages ?? null };
  }

  private async prompt(command: StoredCommand, kind: "steer" | "finalize", markMutation: () => void): Promise<JsonValue> {
    const input = command.envelope.arguments;
    keys(input, ["message"]);
    const message = text(input, "message");
    const session = this.task(command);
    markMutation();
    await this.client.request("session.prompt_async", {
      path: { sessionID: session.sessionId },
      body: { agent: session.agent, parts: [{ type: "text", text: message }] },
    });
    this.state.reactivateTaskSession(command.taskId, session.sessionId);
    this.onSessionContinued?.(command.taskId, session.sessionId);
    return { status: kind === "steer" ? "steering-delivered" : "finalization-delivered", session: session.sessionId };
  }

  private async changeRoute(command: StoredCommand, markMutation: () => void): Promise<JsonValue> {
    const input = command.envelope.arguments;
    keys(input, ["agent", "message"]);
    const selected = route(input);
    const session = this.task(command);
    const agent = this.agents[selected];
    const message = optionalText(input, "message", 65_536) ?? "Continue this task using the newly selected agent route.";
    markMutation();
    await this.client.request("session.prompt_async", {
      path: { sessionID: session.sessionId },
      body: { agent, parts: [{ type: "text", text: message }] },
    });
    this.state.reactivateTaskSession(command.taskId, session.sessionId, agent);
    this.onSessionContinued?.(command.taskId, session.sessionId);
    return { status: "route-changed", agent: selected, session: session.sessionId };
  }

  private async permissionReply(command: StoredCommand, markMutation: () => void): Promise<JsonValue> {
    const input = command.envelope.arguments;
    keys(input, ["permission", "reply", "message"]);
    const alias = text(input, "permission", 200);
    const reply = input.reply;
    if (reply !== "once" && reply !== "always" && reply !== "reject") throw new TypeError("reply must be once, always, or reject");
    const message = optionalText(input, "message", 2_000);
    const requestId = this.state.resolveAlias(alias, "permission", command.taskId);
    const baseline = await this.captureContinuationBaseline(command.taskId, requestId, "permission");
    markMutation();
    await this.client.request("permission.reply", {
      path: { requestID: requestId },
      body: { reply, ...(message ? { message } : {}) },
    });
    const continuation = await this.recoverAfterInteraction(command.taskId, requestId, "permission", baseline);
    return { status: "permission-replied", permission: alias, reply, continuation_recovery: continuation };
  }

  private async questionReply(command: StoredCommand, markMutation: () => void): Promise<JsonValue> {
    const input = command.envelope.arguments;
    keys(input, ["question", "answers"]);
    const alias = text(input, "question", 200);
    if (!Array.isArray(input.answers) || input.answers.some((answer) => !Array.isArray(answer) || answer.some((entry) => typeof entry !== "string"))) {
      throw new TypeError("answers must be an array of string arrays");
    }
    const requestId = this.state.resolveAlias(alias, "question", command.taskId);
    const baseline = await this.captureContinuationBaseline(command.taskId, requestId, "question");
    markMutation();
    await this.client.request("question.reply", {
      path: { requestID: requestId },
      body: { answers: input.answers },
    });
    const continuation = await this.recoverAfterInteraction(command.taskId, requestId, "question", baseline);
    return { status: "question-replied", question: alias, continuation_recovery: continuation };
  }

  private async captureContinuationBaseline(
    taskId: string,
    interactionId: string,
    kind: InteractionKind,
  ): Promise<ContinuationReplyBaseline | null | undefined> {
    if (typeof this.recovery.captureContinuationBaseline !== "function") return undefined;
    try {
      return await this.recovery.captureContinuationBaseline(taskId, interactionId, kind);
    } catch {
      return null;
    }
  }

  private async recoverAfterInteraction(
    taskId: string,
    interactionId: string,
    kind: InteractionKind,
    baseline?: ContinuationReplyBaseline | null,
  ): Promise<JsonValue> {
    if (typeof this.recovery.continueAfterInteraction !== "function") {
      return { outcome: "blocked", reason: "continuation-recovery-unavailable" };
    }
    return asJson(await this.recovery.continueAfterInteraction(taskId, interactionId, kind, baseline));
  }

  private events(command: StoredCommand): JsonValue {
    const input = command.envelope.arguments;
    keys(input, ["after", "limit"]);
    const after = integer(input, "after", 0, Number.MAX_SAFE_INTEGER);
    const limit = integer(input, "limit", 50, 100);
    return { after, events: this.state.listEvents(command.taskId, after, limit) };
  }

  private async createPty(command: StoredCommand, markMutation: () => void): Promise<JsonValue> {
    if (!this.ptyEnabled) throw new Error("PTY commands are disabled by local policy");
    const input = command.envelope.arguments;
    keys(input, ["command", "args", "title"]);
    const executable = text(input, "command", 1_000);
    if (input.args !== undefined && (!Array.isArray(input.args) || input.args.some((entry) => typeof entry !== "string"))) {
      throw new TypeError("args must be an array of strings");
    }
    const title = optionalText(input, "title", 200);
    markMutation();
    const result = await this.client.request("pty.create", {
      body: { command: executable, args: input.args ?? [], ...(title ? { title } : {}) },
    });
    const ptyId = idFromResult(result, "OpenCode PTY creation");
    const alias = this.state.ensureAlias("pty", ptyId, command.taskId);
    this.state.mapPty(alias, ptyId, command.taskId);
    this.ptys.register(alias, ptyId);
    return { status: "pty-created", pty: ptyId };
  }

  private ptyInput(command: StoredCommand, markMutation: () => void): JsonValue {
    if (!this.ptyEnabled) throw new Error("PTY commands are disabled by local policy");
    const input = command.envelope.arguments;
    keys(input, ["pty", "data"]);
    const alias = text(input, "pty", 200);
    const data = text(input, "data", 16_384);
    const pty = this.state.pty(alias);
    if (!pty || pty.taskId !== command.taskId) throw new Error(`Unknown PTY alias ${alias} for this task`);
    markMutation();
    this.ptys.input(alias, data);
    return { status: "pty-input-delivered", pty: alias, bytes: Buffer.byteLength(data, "utf8") };
  }

  private ptyRead(command: StoredCommand): JsonValue {
    const input = command.envelope.arguments;
    keys(input, ["pty", "after", "limit"]);
    const alias = text(input, "pty", 200);
    const pty = this.state.pty(alias);
    if (!pty || pty.taskId !== command.taskId) throw new Error(`Unknown PTY alias ${alias} for this task`);
    return { pty: alias, ...this.state.readPty(alias, integer(input, "after", 0, Number.MAX_SAFE_INTEGER), integer(input, "limit", 32_768, 131_072)) };
  }

  private async resizePty(command: StoredCommand, markMutation: () => void): Promise<JsonValue> {
    if (!this.ptyEnabled) throw new Error("PTY commands are disabled by local policy");
    const input = command.envelope.arguments;
    keys(input, ["pty", "rows", "cols"]);
    const alias = text(input, "pty", 200);
    const pty = this.state.pty(alias);
    if (!pty || pty.taskId !== command.taskId) throw new Error(`Unknown PTY alias ${alias} for this task`);
    const rows = integer(input, "rows", 0, 10_000);
    const cols = integer(input, "cols", 0, 10_000);
    if (rows === 0 || cols === 0) throw new TypeError("rows and cols must be positive");
    markMutation();
    await this.client.request("pty.update", { path: { ptyID: pty.ptyId }, body: { size: { rows, cols } } });
    return { status: "pty-resized", pty: alias, rows, cols };
  }

  private async removePty(command: StoredCommand, markMutation: () => void): Promise<JsonValue> {
    if (!this.ptyEnabled) throw new Error("PTY commands are disabled by local policy");
    const input = command.envelope.arguments;
    keys(input, ["pty"]);
    const alias = text(input, "pty", 200);
    const pty = this.state.pty(alias);
    if (!pty || pty.taskId !== command.taskId) throw new Error(`Unknown PTY alias ${alias} for this task`);
    markMutation();
    await this.client.request("pty.remove", { path: { ptyID: pty.ptyId } });
    this.ptys.close(alias);
    return { status: "pty-removed", pty: alias };
  }

  private async generic(command: StoredCommand, markMutation: () => void): Promise<{ raw: JsonValue; localSecret: boolean }> {
    const input = command.envelope.arguments;
    keys(input, ["operation_id", "request"]);
    const operationId = text(input, "operation_id", 300);
    const prepared = this.operationPolicy.prepare(operationId, requestArguments(input.request), command.taskId);
    if (prepared.operation.effect !== "read" && prepared.operation.effect !== "subscribe") {
      await this.requireCompatibility();
      markMutation();
    }
    let result: JsonValue | undefined;
    try {
      result = await this.client.request(operationId, prepared.args);
    } catch (error) {
      if (prepared.operation.policy === "local-secret") {
        throw new IndeterminateCommandError(`${operationId} failed; sensitive detail retained locally`, { error: errorMessage(error) });
      }
      throw error;
    }
    return {
      raw: result ?? null,
      localSecret: prepared.operation.policy === "local-secret",
    };
  }

  private async apply(command: StoredCommand, markMutation: () => void): Promise<{ raw: JsonValue; publicOverride?: JsonValue }> {
    const kind = command.kind;
    await this.guardExpected(command.envelope, kind === "start" || kind === "promotion.apply");
    if (kind === "status") return { raw: await this.status(command) };
    if (kind === "events.page") return { raw: this.events(command) };
    if (kind === "pty.read") return { raw: this.ptyRead(command) };
    if (kind === "sync.recover") {
      keys(command.envelope.arguments, []);
      await this.recovery.recoverOnce();
      return { raw: { status: "recovered" } };
    }
    if (kind === "opencode.request") {
      const operationId = command.envelope.arguments.operation_id;
      if (typeof operationId !== "string") throw new TypeError("operation_id must be a string");
      this.client.manifest.require(operationId, "http");
      const result = await this.generic(command, markMutation);
      return {
        raw: result.raw,
        ...(result.localSecret ? { publicOverride: { operator_action: "Complete any required authorization through the local OpenCode TUI; sensitive result retained locally" } } : {}),
      };
    }

    if (kind === "promotion.apply") {
      const input = command.envelope.arguments;
      keys(input, ["approved_sha"]);
      const approved = text(input, "approved_sha", 40);
      if (!/^[0-9a-f]{40}$/.test(approved) || command.envelope.expected?.developer_sha !== approved || command.envelope.expected.ref !== "developer") {
        throw new Error("Promotion requires one exact lowercase approved developer SHA in arguments and expected guard");
      }
      if (!this.runPromotion) throw new Error("Mechanical promotion is disabled by local policy");
      markMutation();
      return { raw: await this.runPromotion(approved) };
    }

    await this.requireCompatibility();
    if (kind === "start") return { raw: await this.start(command, markMutation) };
    if (kind === "steer" || kind === "finalize") return { raw: await this.prompt(command, kind, markMutation) };
    if (kind === "route") return { raw: await this.changeRoute(command, markMutation) };
    if (kind === "permission.reply") return { raw: await this.permissionReply(command, markMutation) };
    if (kind === "question.reply") return { raw: await this.questionReply(command, markMutation) };
    if (kind === "abort") {
      keys(command.envelope.arguments, []);
      const session = this.task(command);
      markMutation();
      const result = await this.client.request("session.abort", { path: { sessionID: session.sessionId } });
      return { raw: { status: "aborted", session: session.sessionId, result: result ?? null } };
    }
    if (kind === "pty.create") return { raw: await this.createPty(command, markMutation) };
    if (kind === "pty.input") return { raw: this.ptyInput(command, markMutation) };
    if (kind === "pty.resize") return { raw: await this.resizePty(command, markMutation) };
    if (kind === "pty.remove") return { raw: await this.removePty(command, markMutation) };
    throw new Error(`Unsupported command kind ${kind}`);
  }

  private publish(command: StoredCommand): void {
    const detail = command.error ? this.projection.safeText(command.error, command.taskId) : undefined;
    const body = `${commandStatusComment(command, detail)}\n\n${this.projection.comment(outputPayload(command))}`;
    this.state.enqueue(`command-result:${command.commandId}:${command.state}`, "issue-comment", command.issueNumber, { body });
    const label = command.state === "succeeded" ? "bridge-status:complete" : command.state === "failed" || command.state === "indeterminate" ? "bridge-status:blocked" : "bridge-status:active";
    for (const stale of ["bridge-status:active", "bridge-status:complete", "bridge-status:blocked"]) {
      if (stale !== label) this.state.enqueue(`command-label-remove:${command.commandId}:${stale}`, "remove-label", command.issueNumber, { label: stale });
    }
    this.state.enqueue(`command-label:${command.commandId}:${label}`, "add-labels", command.issueNumber, { labels: [label] });
  }

  requeueCompletedResults(): void {
    for (const interrupted of this.state.listCommands(["applying"])) {
      const message = "Bridge restarted while this command was applying; the side-effect outcome is indeterminate and was not reissued";
      this.state.finishCommand(interrupted.commandId, "indeterminate", undefined, { error: message }, message);
    }
    for (const command of this.state.listCommands(["succeeded", "failed", "indeterminate"])) this.publish(command);
  }

  async execute(command: StoredCommand): Promise<StoredCommand> {
    const applying = this.state.beginCommand(command.commandId);
    this.publish(applying);
    await this.onApplying?.(applying);
    let mutationStarted = false;
    try {
      const result = await this.apply(command, () => {
        mutationStarted = true;
      });
      const projected = result.publicOverride ?? this.projection.project(result.raw, command.taskId);
      const completed = this.state.finishCommand(command.commandId, "succeeded", result.raw, projected);
      this.publish(completed);
      return completed;
    } catch (error) {
      const indeterminate = error instanceof IndeterminateCommandError || mutationStarted;
      const message = this.projection.safeText(errorMessage(error), command.taskId);
      const raw = error instanceof IndeterminateCommandError ? error.raw : undefined;
      const completed = this.state.finishCommand(command.commandId, indeterminate ? "indeterminate" : "failed", raw, { error: message }, message);
      this.publish(completed);
      return completed;
    }
  }

  async executeAll(commands: StoredCommand[]): Promise<void> {
    for (const command of commands) await this.execute(command);
  }
}
