import { OpenCodeClient } from "./opencode.js";
import { PublicProjection } from "./projection.js";
import type { PersistedOpenCodeEvent } from "./recovery.js";
import { BridgeState } from "./state.js";
import type { JsonValue, ResponseDelivery, ResponseDeliveryInput, TaskSessionKind } from "./types.js";
import { asJson, errorMessage, isRecord } from "./util.js";

export function latestAssistantMessage(value: JsonValue | undefined): JsonValue {
  const items = Array.isArray(value)
    ? value
    : isRecord(value) && Array.isArray(value.items)
      ? value.items
      : [];
  let latest: JsonValue | undefined;
  for (const item of items) {
    if (!isRecord(item) || !isRecord(item.info) || item.info.role !== "assistant") continue;
    latest = asJson(item);
  }
  return latest ?? null;
}

export function terminalResponseDelivery(
  state: BridgeState,
  event: PersistedOpenCodeEvent,
): ResponseDeliveryInput | undefined {
  if (!event.taskId || !event.sessionId || !/session\.(?:idle|error)/i.test(event.eventType)) return undefined;
  if (event.requestId) {
    const scout = state.getScoutSession(event.requestId);
    if (!scout || scout.taskId !== event.taskId || scout.sessionId !== event.sessionId) return undefined;
    return {
      eventId: event.eventId,
      taskId: event.taskId,
      sessionId: event.sessionId,
      issueNumber: scout.issueNumber,
      eventType: event.eventType,
      deliveryKind: "scout",
      requestId: event.requestId,
    };
  }
  const issueNumber = state.issueForTask(event.taskId);
  const session = state.getTaskSession(event.taskId);
  if (issueNumber === undefined || !session || session.sessionId !== event.sessionId) return undefined;
  if (event.sessionKind && event.sessionKind !== session.sessionKind) return undefined;
  return {
    eventId: event.eventId,
    taskId: event.taskId,
    sessionId: event.sessionId,
    issueNumber,
    eventType: event.eventType,
    deliveryKind: session.sessionKind,
  };
}

export function queueDeveloperResponseEvent(
  state: BridgeState,
  event: PersistedOpenCodeEvent,
): ResponseDelivery | undefined {
  const delivery = terminalResponseDelivery(state, event);
  if (!delivery || delivery.deliveryKind !== "developer") return undefined;
  state.queueResponseDelivery(delivery);
  return state.pendingResponseDeliveries(100).find((delivery) => delivery.eventId === event.eventId);
}

export function queueWorkspaceResponseEvent(
  state: BridgeState,
  event: PersistedOpenCodeEvent,
): ResponseDelivery | undefined {
  const delivery = terminalResponseDelivery(state, event);
  if (!delivery || delivery.deliveryKind !== "workspace") return undefined;
  state.queueResponseDelivery(delivery);
  return state.pendingResponseDeliveries(100).find((entry) => entry.eventId === event.eventId);
}

export function queueScoutResponseEvent(
  state: BridgeState,
  event: PersistedOpenCodeEvent,
): ResponseDelivery | undefined {
  const delivery = terminalResponseDelivery(state, event);
  if (!delivery || delivery.deliveryKind !== "scout") return undefined;
  state.queueResponseDelivery(delivery);
  return state.pendingResponseDeliveries(100).find((delivery) => delivery.eventId === event.eventId);
}

export interface DeveloperResponseTransportOptions {
  client: OpenCodeClient;
  state: BridgeState;
  projection: PublicProjection;
  onError?: (error: string) => void;
  deliveryKind?: TaskSessionKind;
}

export class DeveloperResponseTransport {
  private readonly client: OpenCodeClient;
  private readonly state: BridgeState;
  private readonly projection: PublicProjection;
  private readonly onError: ((error: string) => void) | undefined;
  private readonly deliveryKind: TaskSessionKind;

  constructor(options: DeveloperResponseTransportOptions) {
    this.client = options.client;
    this.state = options.state;
    this.projection = options.projection;
    this.onError = options.onError;
    this.deliveryKind = options.deliveryKind ?? "developer";
  }

  async deliver(delivery: ResponseDelivery | undefined): Promise<void> {
    if (!delivery) return;
    if (delivery.deliveryKind !== this.deliveryKind) {
      throw new Error("Task response transport received a delivery for a different runtime");
    }
    try {
      const messages = await this.client.request("session.messages", {
        path: { sessionID: delivery.sessionId },
        query: { limit: 20 },
      });
      const projected = this.projection.project(latestAssistantMessage(messages), delivery.taskId);
      this.state.updateTaskLatestResponse(delivery.taskId, projected, delivery.eventId);
      const response = this.deliveryKind === "developer"
        ? {
            task_id: delivery.taskId,
            session_kind: this.deliveryKind,
            session_state: delivery.eventType,
            latest_developer_response: projected,
          }
        : {
            task_id: delivery.taskId,
            session_kind: this.deliveryKind,
            session_state: delivery.eventType,
            latest_workspace_response: projected,
          };
      this.state.enqueue(`${this.deliveryKind}-response:${delivery.eventId}`, "issue-comment", delivery.issueNumber, {
        body: `OpenCode ${this.deliveryKind} response:\n\n${this.projection.comment(response)}`,
      });
      this.state.completeResponseDelivery(delivery.eventId);
    } catch (error) {
      const message = this.projection.safeText(errorMessage(error), delivery.taskId);
      this.state.retryResponseDelivery(delivery.eventId, message);
      this.onError?.(message);
    }
  }
}

export interface ScoutResponseTransportOptions {
  clientFor: (workspace: string) => OpenCodeClient;
  state: BridgeState;
  projection: PublicProjection;
  onError?: (error: string) => void;
}

export class ScoutResponseTransport {
  private readonly clientFor: (workspace: string) => OpenCodeClient;
  private readonly state: BridgeState;
  private readonly projection: PublicProjection;
  private readonly onError: ((error: string) => void) | undefined;

  constructor(options: ScoutResponseTransportOptions) {
    this.clientFor = options.clientFor;
    this.state = options.state;
    this.projection = options.projection;
    this.onError = options.onError;
  }

  async deliver(delivery: ResponseDelivery | undefined): Promise<void> {
    if (!delivery) return;
    if (delivery.deliveryKind !== "scout" || !delivery.requestId) {
      throw new Error("Scout response transport received an uncorrelated delivery");
    }
    try {
      const scout = this.state.getScoutSession(delivery.requestId);
      if (!scout || scout.taskId !== delivery.taskId || scout.sessionId !== delivery.sessionId) {
        throw new Error("Scout response delivery mapping is missing or inconsistent");
      }
      const messages = await this.clientFor(scout.workspacePath).request("session.messages", {
        path: { sessionID: delivery.sessionId },
        query: { limit: 20 },
      });
      const projected = this.projection.project(latestAssistantMessage(messages), delivery.taskId);
      this.state.updateScoutLatestResponse(delivery.requestId, projected, delivery.eventId);
      this.state.enqueue(`scout-response:${delivery.eventId}`, "issue-comment", delivery.issueNumber, {
        body: `OpenCode Scout response:\n\n${this.projection.comment({
          task_id: delivery.taskId,
          scout_request_id: delivery.requestId,
          ref: scout.refSha,
          session_state: delivery.eventType,
          latest_scout_response: projected,
        })}`,
      });
      this.state.completeResponseDelivery(delivery.eventId);
    } catch (error) {
      const message = this.projection.safeText(errorMessage(error), delivery.taskId);
      this.state.retryResponseDelivery(delivery.eventId, message);
      this.onError?.(message);
    }
  }
}
