import { OpenCodeClient } from "./opencode.js";
import { PublicProjection } from "./projection.js";
import type { PersistedOpenCodeEvent } from "./recovery.js";
import { BridgeState } from "./state.js";
import type { JsonValue, ResponseDelivery } from "./types.js";
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

export function queueDeveloperResponseEvent(
  state: BridgeState,
  event: PersistedOpenCodeEvent,
): ResponseDelivery | undefined {
  if (!event.taskId || !event.sessionId || !/session\.(?:idle|error)/i.test(event.eventType)) return undefined;
  const issueNumber = state.issueForTask(event.taskId);
  if (issueNumber === undefined) return undefined;
  state.queueResponseDelivery({
    eventId: event.eventId,
    taskId: event.taskId,
    sessionId: event.sessionId,
    issueNumber,
    eventType: event.eventType,
  });
  return state.pendingResponseDeliveries(100).find((delivery) => delivery.eventId === event.eventId);
}

export interface DeveloperResponseTransportOptions {
  client: OpenCodeClient;
  state: BridgeState;
  projection: PublicProjection;
  onError?: (error: string) => void;
}

export class DeveloperResponseTransport {
  private readonly client: OpenCodeClient;
  private readonly state: BridgeState;
  private readonly projection: PublicProjection;
  private readonly onError: ((error: string) => void) | undefined;

  constructor(options: DeveloperResponseTransportOptions) {
    this.client = options.client;
    this.state = options.state;
    this.projection = options.projection;
    this.onError = options.onError;
  }

  async deliver(delivery: ResponseDelivery | undefined): Promise<void> {
    if (!delivery) return;
    try {
      const messages = await this.client.request("session.messages", {
        path: { sessionID: delivery.sessionId },
        query: { limit: 20 },
      });
      const projected = this.projection.project(latestAssistantMessage(messages), delivery.taskId);
      this.state.updateTaskLatestResponse(delivery.taskId, projected, delivery.eventId);
      this.state.enqueue(`developer-response:${delivery.eventId}`, "issue-comment", delivery.issueNumber, {
        body: `OpenCode developer response:\n\n${this.projection.comment({
          task_id: delivery.taskId,
          session_state: delivery.eventType,
          latest_developer_response: projected,
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
