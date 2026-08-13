import { requestStatusComment } from "./protocol.js";
import { PublicProjection } from "./projection.js";
import { BridgeState } from "./state.js";
import type { JsonValue, StoredRequest } from "./types.js";
import { errorMessage } from "./util.js";

function keys(input: Record<string, JsonValue>, allowed: string[]): void {
  const unknown = Object.keys(input).filter((key) => !allowed.includes(key));
  if (unknown.length > 0) throw new TypeError(`Bridge request arguments contain unknown field ${unknown[0]}`);
}

function uuid(input: Record<string, JsonValue>, name: string): string {
  const value = input[name];
  if (typeof value !== "string" || !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value)) {
    throw new TypeError(`${name} must be a UUID`);
  }
  return value;
}

function outputPayload(request: StoredRequest): JsonValue {
  if (request.publicResult !== undefined) return request.publicResult;
  if (request.error) return { error: request.error };
  return { state: request.state };
}

export interface RequestExecutorOptions {
  state: BridgeState;
  projection: PublicProjection;
  scout?: {
    start(request: StoredRequest): Promise<JsonValue>;
  };
}

export class IndeterminateRequestError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "IndeterminateRequestError";
  }
}

export class RequestExecutor {
  private readonly state: BridgeState;
  private readonly projection: PublicProjection;
  private readonly scout: RequestExecutorOptions["scout"];

  constructor(options: RequestExecutorOptions) {
    this.state = options.state;
    this.projection = options.projection;
    this.scout = options.scout;
  }

  private commandStatus(request: StoredRequest): JsonValue {
    const input = request.envelope.arguments;
    keys(input, ["command_id"]);
    const commandId = uuid(input, "command_id");
    const command = this.state.getCommand(commandId);
    if (command && command.taskId === request.taskId) {
      const heartbeat = Number(this.state.getMeta("service.heartbeat_at")) || null;
      return {
        found: true,
        command_id: command.commandId,
        task_id: command.taskId,
        sequence: command.sequence,
        kind: command.kind,
        state: command.state,
        known_result: command.publicResult ?? null,
        error: command.error ? this.projection.safeText(command.error, request.taskId) : null,
        created_at: command.createdAt,
        updated_at: command.updatedAt,
        applying_for_ms: command.state === "applying" ? Math.max(0, Date.now() - command.updatedAt) : null,
        service_heartbeat_at: heartbeat,
      };
    }
    const rejection = this.state.commandRejection(commandId);
    if (rejection && rejection.taskId === request.taskId) {
      return {
        found: true,
        command_id: commandId,
        task_id: rejection.taskId,
        sequence: rejection.sequence,
        state: "pre-ledger-rejected",
        known_result: null,
        error: this.projection.safeText(rejection.reason, request.taskId),
        created_at: rejection.createdAt,
        updated_at: rejection.createdAt,
      };
    }
    return { found: false, command_id: commandId, task_id: request.taskId };
  }

  private taskStatus(request: StoredRequest): JsonValue {
    keys(request.envelope.arguments, []);
    const session = this.state.getTaskSession(request.taskId);
    if (!session) {
      return {
        task_id: request.taskId,
        mapped: false,
        session_state: "unmapped",
        latest_projected_developer_response: null,
      };
    }
    return {
      task_id: request.taskId,
      mapped: true,
      session: this.state.ensureAlias("session", session.sessionId, request.taskId),
      agent: session.agent,
      session_state: session.sessionState,
      latest_projected_developer_response: session.latestResponse ?? null,
      latest_event_id: session.latestEventId
        ? this.state.ensureAlias("event", session.latestEventId, request.taskId)
        : null,
      updated_at: session.updatedAt,
      service_heartbeat_at: Number(this.state.getMeta("service.heartbeat_at")) || null,
    };
  }

  private scoutStatus(request: StoredRequest): JsonValue {
    const input = request.envelope.arguments;
    keys(input, ["scout_request_id"]);
    const scoutRequestId = uuid(input, "scout_request_id");
    const start = this.state.getRequest(scoutRequestId);
    if (!start || start.taskId !== request.taskId || start.kind !== "scout.start") {
      return {
        found: false,
        task_id: request.taskId,
        scout_request_id: scoutRequestId,
      };
    }
    const session = this.state.getScoutSession(scoutRequestId);
    if (!session || session.taskId !== request.taskId) {
      return {
        found: true,
        task_id: request.taskId,
        scout_request_id: scoutRequestId,
        ref: start.envelope.arguments.ref ?? null,
        session: null,
        session_state: "not-mapped",
        start_request_state: start.state,
        error: start.error ?? null,
        latest_projected_scout_response: null,
        updated_at: start.updatedAt,
      };
    }
    return {
      found: true,
      task_id: request.taskId,
      scout_request_id: scoutRequestId,
      ref: session.refSha,
      session: this.state.ensureAlias("session", session.sessionId, request.taskId),
      session_state: session.sessionState,
      start_request_state: start.state,
      latest_projected_scout_response: session.latestResponse ?? null,
      latest_event_id: session.latestEventId
        ? this.state.ensureAlias("event", session.latestEventId, request.taskId)
        : null,
      updated_at: session.updatedAt,
      service_heartbeat_at: Number(this.state.getMeta("service.heartbeat_at")) || null,
    };
  }

  private async apply(request: StoredRequest): Promise<JsonValue> {
    if (request.kind === "command.status") return this.commandStatus(request);
    if (request.kind === "task.status") return this.taskStatus(request);
    if (request.kind === "scout.status") return this.scoutStatus(request);
    if (request.kind === "scout.start") {
      if (!this.scout) throw new Error("Repository Scout runtime is unavailable");
      return await this.scout.start(request);
    }
    throw new Error(`Unsupported bridge request kind ${request.kind}`);
  }

  private publish(request: StoredRequest): void {
    const detail = request.error ? this.projection.safeText(request.error, request.taskId) : undefined;
    const body = `${requestStatusComment(request, detail)}\n\n${this.projection.comment(outputPayload(request))}`;
    this.state.enqueue(
      `request-result:${request.requestId}:${request.state}`,
      "issue-comment",
      request.issueNumber,
      { body },
    );
  }

  requeueCompletedResults(): void {
    for (const interrupted of this.state.listRequests(["applying"])) {
      const message = "Bridge restarted while this request was applying; its outcome is indeterminate and no side effect was repeated";
      this.state.finishRequest(interrupted.requestId, "indeterminate", undefined, { error: message }, message);
    }
    for (const request of this.state.listRequests(["succeeded", "failed", "indeterminate"])) this.publish(request);
  }

  async execute(request: StoredRequest): Promise<StoredRequest> {
    this.state.beginRequest(request.requestId);
    try {
      const raw = await this.apply(request);
      const projected = this.projection.project(raw, request.taskId);
      const completed = this.state.finishRequest(request.requestId, "succeeded", raw, projected);
      this.publish(completed);
      return completed;
    } catch (error) {
      const message = this.projection.safeText(errorMessage(error), request.taskId);
      const state = error instanceof IndeterminateRequestError ? "indeterminate" : "failed";
      const completed = this.state.finishRequest(request.requestId, state, undefined, { error: message }, message);
      this.publish(completed);
      return completed;
    }
  }

  async executeAll(requests: StoredRequest[]): Promise<void> {
    await Promise.all(requests.map((request) => this.execute(request)));
  }
}
