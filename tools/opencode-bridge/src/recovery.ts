import { OpenCodeClient, OpenCodeHttpError } from "./opencode.js";
import { subscribeSse } from "./sse.js";
import { BridgeState } from "./state.js";
import type { JsonValue, TaskSession } from "./types.js";
import { asJson, asRecord, backoff, isRecord, sleep } from "./util.js";

export interface PersistedOpenCodeEvent {
  eventId: string;
  source: "legacy-live" | "session-v2" | "sync-history";
  eventType: string;
  payload: JsonValue;
  taskId?: string;
  sessionId?: string;
  aggregateId?: string;
  sequence?: number;
}

export interface RecoveryCoordinatorOptions {
  client: OpenCodeClient;
  state: BridgeState;
  onPersistedEvent?: (event: PersistedOpenCodeEvent) => void | Promise<void>;
  onReconciled?: (snapshot: JsonValue) => void | Promise<void>;
  onError?: (error: unknown) => void | Promise<void>;
}

function stringField(record: Record<string, unknown>, name: string): string | undefined {
  return typeof record[name] === "string" ? record[name] : undefined;
}

function nestedRecord(record: Record<string, unknown>, name: string): Record<string, unknown> | undefined {
  return isRecord(record[name]) ? record[name] : undefined;
}

function sessionFromPayload(record: Record<string, unknown>): string | undefined {
  const body = nestedRecord(record, "data") ?? nestedRecord(record, "properties") ?? record;
  const direct = stringField(body, "sessionID") ?? stringField(body, "sessionId");
  if (direct) return direct;
  for (const name of ["session", "info"]) {
    const nested = nestedRecord(body, name);
    const value = nested && (stringField(nested, "sessionID") ?? stringField(nested, "sessionId") ?? stringField(nested, "id"));
    if (value) return value;
  }
  return undefined;
}

function requireIdentity(record: Record<string, unknown>): { eventId: string; eventType: string } {
  const eventId = stringField(record, "id");
  const eventType = stringField(record, "type");
  if (!eventId || !eventType) throw new TypeError("OpenCode event is missing id or type");
  return { eventId, eventType };
}

function requireSequence(value: unknown, label: string): number {
  if (!Number.isSafeInteger(value) || Number(value) < 0) throw new TypeError(`${label} has an invalid durable sequence`);
  return Number(value);
}

function normalizeLegacy(value: unknown): PersistedOpenCodeEvent {
  const record = asRecord(value, "legacy OpenCode event");
  const identity = requireIdentity(record);
  const sessionId = sessionFromPayload(record);
  return {
    ...identity,
    source: "legacy-live",
    payload: asJson(record),
    ...(sessionId ? { sessionId } : {}),
  };
}

function normalizeSession(value: unknown, session: TaskSession): PersistedOpenCodeEvent {
  const record = asRecord(value, "durable session event");
  const identity = requireIdentity(record);
  const durable = asRecord(record.durable, "durable session event metadata");
  const aggregateId = stringField(durable, "aggregateID");
  if (!aggregateId) throw new TypeError("Durable session event is missing aggregateID");
  const sequence = requireSequence(durable.seq, "Durable session event");
  if (aggregateId !== session.sessionId) throw new Error("Durable session event aggregate does not match the mapped session");
  return {
    ...identity,
    source: "session-v2",
    payload: asJson(record),
    taskId: session.taskId,
    sessionId: session.sessionId,
    aggregateId,
    sequence,
  };
}

function normalizeSync(value: unknown, state: BridgeState): PersistedOpenCodeEvent {
  const record = asRecord(value, "sync history event");
  const identity = requireIdentity(record);
  const aggregateId = stringField(record, "aggregate_id");
  if (!aggregateId) throw new TypeError("Sync history event is missing aggregate_id");
  const sequence = requireSequence(record.seq, "Sync history event");
  const session = state.taskSessionForInternal(aggregateId);
  return {
    ...identity,
    source: "sync-history",
    payload: asJson(record),
    aggregateId,
    sequence,
    ...(session ? { taskId: session.taskId, sessionId: session.sessionId } : {}),
  };
}

function historyPage(value: JsonValue | undefined): { events: unknown[]; hasMore: boolean } {
  const page = asRecord(value, "session history response");
  if (!Array.isArray(page.data) || typeof page.hasMore !== "boolean") throw new TypeError("Session history response is invalid");
  return { events: page.data, hasMore: page.hasMore };
}

export class RecoveryCoordinator {
  private readonly client: OpenCodeClient;
  private readonly state: BridgeState;
  private readonly onPersistedEvent?: RecoveryCoordinatorOptions["onPersistedEvent"];
  private readonly onReconciled?: RecoveryCoordinatorOptions["onReconciled"];
  private readonly onError?: RecoveryCoordinatorOptions["onError"];

  constructor(options: RecoveryCoordinatorOptions) {
    this.client = options.client;
    this.state = options.state;
    this.onPersistedEvent = options.onPersistedEvent;
    this.onReconciled = options.onReconciled;
    this.onError = options.onError;
  }

  private async persist(event: PersistedOpenCodeEvent): Promise<boolean> {
    const inserted = this.state.recordEvent({
      eventKey: `opencode:${event.eventId}`,
      source: event.source,
      eventType: event.eventType,
      payload: event.payload,
      ...(event.taskId ? { taskId: event.taskId } : {}),
      ...(event.sessionId ? { sessionId: event.sessionId } : {}),
      ...(event.aggregateId ? { aggregateId: event.aggregateId } : {}),
      ...(event.sequence === undefined ? {} : { durableSeq: event.sequence }),
    });
    if (inserted) await this.onPersistedEvent?.(event);
    return inserted;
  }

  async recoverSyncHistory(): Promise<number> {
    const response = await this.client.request("sync.history.list", { body: this.state.durableCursors("sync-history") });
    if (!Array.isArray(response)) throw new TypeError("Sync history response is not an array");
    let inserted = 0;
    for (const value of response) if (await this.persist(normalizeSync(value, this.state))) inserted++;
    return inserted;
  }

  async recoverSessionHistory(session: TaskSession): Promise<number> {
    let after = this.state.durableCursor("session-v2", session.sessionId);
    let inserted = 0;
    while (true) {
      const query = { limit: 100, ...(after === undefined ? {} : { after }) };
      const response = await this.client.request("v2.session.history", { path: { sessionID: session.sessionId }, query });
      const page = historyPage(response);
      let next = after;
      for (const value of page.events) {
        const event = normalizeSession(value, session);
        if (await this.persist(event)) inserted++;
        next = Math.max(next ?? -1, event.sequence!);
      }
      if (!page.hasMore) return inserted;
      if (next === after || page.events.length === 0) throw new Error("Session history pagination made no progress");
      after = next;
    }
  }

  async reconcileCanonical(): Promise<JsonValue> {
    const [sessions, status, permissions, questions] = await Promise.all([
      this.client.request("session.list"),
      this.client.request("session.status"),
      this.client.request("permission.list"),
      this.client.request("question.list"),
    ]);
    const messages: Record<string, JsonValue> = {};
    for (const session of this.state.listTaskSessions()) {
      try {
        messages[session.taskId] = (await this.client.request("session.messages", {
          path: { sessionID: session.sessionId },
          query: { limit: 100 },
        })) ?? null;
      } catch (error) {
        if (!(error instanceof OpenCodeHttpError) || error.status !== 404) throw error;
        messages[session.taskId] = { missing: true };
      }
    }
    const snapshot: JsonValue = {
      capturedAt: Date.now(),
      sessions: sessions ?? null,
      status: status ?? null,
      permissions: permissions ?? null,
      questions: questions ?? null,
      taskMessages: messages,
    };
    this.state.setReconciliation("canonical", snapshot);
    await this.onReconciled?.(snapshot);
    return snapshot;
  }

  async recoverOnce(): Promise<void> {
    await this.recoverSyncHistory();
    for (const session of this.state.listTaskSessions()) {
      try {
        await this.recoverSessionHistory(session);
      } catch (error) {
        if (!(error instanceof OpenCodeHttpError) || error.status !== 404) throw error;
      }
    }
    await this.reconcileCanonical();
  }

  private async retry(attempt: number, signal: AbortSignal, random: () => number): Promise<void> {
    try {
      await sleep(backoff(attempt, 500, 30_000, random), signal);
    } catch (error) {
      if (!signal.aborted) throw error;
    }
  }

  async run(signal: AbortSignal, random = Math.random): Promise<void> {
    let attempt = 0;
    while (!signal.aborted) {
      try {
        await this.recoverOnce();
        for await (const event of subscribeSse(this.client, "event.subscribe", {}, signal)) {
          attempt = 0;
          const normalized = normalizeLegacy(event.data);
          const session = normalized.sessionId ? this.state.taskSessionForInternal(normalized.sessionId) : undefined;
          await this.persist({ ...normalized, ...(session ? { taskId: session.taskId } : {}) });
        }
        if (!signal.aborted) throw new Error("OpenCode event stream ended");
      } catch (error) {
        if (signal.aborted) return;
        await this.onError?.(error);
        await this.retry(attempt++, signal, random);
      }
    }
  }

  async runSession(session: TaskSession, signal: AbortSignal, random = Math.random): Promise<void> {
    let attempt = 0;
    while (!signal.aborted) {
      try {
        await this.recoverSessionHistory(session);
        const cursor = this.state.durableCursor("session-v2", session.sessionId);
        const args = {
          path: { sessionID: session.sessionId },
          query: cursor === undefined ? {} : { after: cursor },
        };
        for await (const event of subscribeSse(this.client, "v2.session.events", args, signal)) {
          attempt = 0;
          await this.persist(normalizeSession(event.data, session));
        }
        if (!signal.aborted) throw new Error("OpenCode durable session stream ended");
      } catch (error) {
        if (signal.aborted) return;
        await this.onError?.(error);
        await this.retry(attempt++, signal, random);
      }
    }
  }
}
