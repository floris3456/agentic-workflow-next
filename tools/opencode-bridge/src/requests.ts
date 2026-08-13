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
}

export class RequestExecutor {
  private readonly state: BridgeState;
  private readonly projection: PublicProjection;

  constructor(options: RequestExecutorOptions) {
    this.state = options.state;
    this.projection = options.projection;
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

  private apply(request: StoredRequest): JsonValue {
    if (request.kind === "command.status") return this.commandStatus(request);
    if (request.kind === "task.status") return this.taskStatus(request);
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
      const message = "Bridge restarted while this read request was applying; submit a new read request if reconciliation is still needed";
      this.state.finishRequest(interrupted.requestId, "indeterminate", undefined, { error: message }, message);
    }
    for (const request of this.state.listRequests(["succeeded", "failed", "indeterminate"])) this.publish(request);
  }

  async execute(request: StoredRequest): Promise<StoredRequest> {
    this.state.beginRequest(request.requestId);
    try {
      const raw = this.apply(request);
      const completed = this.state.finishRequest(request.requestId, "succeeded", raw, raw);
      this.publish(completed);
      return completed;
    } catch (error) {
      const message = this.projection.safeText(errorMessage(error), request.taskId);
      const completed = this.state.finishRequest(request.requestId, "failed", undefined, { error: message }, message);
      this.publish(completed);
      return completed;
    }
  }

  async executeAll(requests: StoredRequest[]): Promise<void> {
    await Promise.all(requests.map((request) => this.execute(request)));
  }
}
