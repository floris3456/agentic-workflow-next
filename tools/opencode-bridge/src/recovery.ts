import { OpenCodeClient, OpenCodeHttpError } from "./opencode.js";
import { latestAssistantMessage, terminalResponseDelivery } from "./handoff.js";
import { subscribeSse } from "./sse.js";
import { BridgeState } from "./state.js";
import type {
  InteractionBinding,
  InteractionKind,
  JsonValue,
  ScoutSession,
  TaskSession,
} from "./types.js";
import { asJson, asRecord, backoff, isRecord, sha256, sleep, stableJson } from "./util.js";

export interface PersistedOpenCodeEvent {
  eventId: string;
  source: "legacy-live" | "session-v2" | "sync-history" | "canonical-recovery";
  eventType: string;
  payload: JsonValue;
  taskId?: string;
  sessionId?: string;
  requestId?: string;
  sessionKind?: "developer" | "scout";
  aggregateId?: string;
  sequence?: number;
  interaction?: InteractionBinding;
}

export interface RecoveryCoordinatorOptions {
  client: OpenCodeClient;
  state: BridgeState;
  onPersistedEvent?: (event: PersistedOpenCodeEvent) => void | Promise<void>;
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

function interactionEventId(
  eventType: string,
  payload: Record<string, unknown>,
  sessionId: string | undefined,
  fallbackId: string,
): string {
  if (!sessionId || !/^(?:permission|question)\./i.test(eventType)) return fallbackId;
  const body = nestedRecord(payload, "data") ?? nestedRecord(payload, "properties") ?? payload;
  const interactionId = stringField(body, "id");
  if (!interactionId) return fallbackId;
  return `interaction-${sha256(stableJson({ eventType, interactionId, sessionId }))}`;
}

function interactionBinding(eventType: string, payload: Record<string, unknown>, sessionId: string | undefined): InteractionBinding | undefined {
  if (!sessionId || !/^(?:permission|question)\.asked$/i.test(eventType)) return undefined;
  const body = nestedRecord(payload, "data") ?? nestedRecord(payload, "properties") ?? payload;
  const interactionId = stringField(body, "id");
  if (!interactionId) return undefined;
  return {
    interactionId,
    kind: /^permission\./i.test(eventType) ? "permission" : "question",
  };
}

function requireIdentity(record: Record<string, unknown>, fallbackId?: string): { eventId: string; eventType: string } {
  const eventId = stringField(record, "id") ?? fallbackId;
  const eventType = stringField(record, "type");
  if (!eventId || !eventType) throw new TypeError("OpenCode event is missing id or type");
  return { eventId, eventType };
}

function requireSequence(value: unknown, label: string): number {
  if (!Number.isSafeInteger(value) || Number(value) < 0) throw new TypeError(`${label} has an invalid durable sequence`);
  return Number(value);
}

function normalizeLegacy(value: unknown, streamId?: string): PersistedOpenCodeEvent {
  const record = asRecord(value, "legacy OpenCode event");
  const identity = requireIdentity(record, streamId);
  const sessionId = sessionFromPayload(record);
  const interaction = interactionBinding(identity.eventType, record, sessionId);
  return {
    eventId: interactionEventId(identity.eventType, record, sessionId, identity.eventId),
    eventType: identity.eventType,
    source: "legacy-live",
    payload: asJson(record),
    ...(sessionId ? { sessionId } : {}),
    ...(interaction ? { interaction } : {}),
  };
}

type RecoverableSession = TaskSession | ScoutSession;

function terminalSessionState(value: string): boolean {
  return /session\.(?:idle|error)/i.test(value);
}

function canonicalScoutTerminal(
  statusValue: JsonValue | undefined,
  messagesValue: JsonValue | undefined,
  session: ScoutSession,
): { eventType: "session.idle" | "session.error"; messageId: string; completedAt: number } | undefined {
  const status = asRecord(statusValue ?? {}, "OpenCode session status");
  const current = status[session.sessionId];
  if (current !== undefined) {
    const sessionStatus = asRecord(current, "OpenCode Scout session status");
    const type = stringField(sessionStatus, "type");
    if (type === "busy" || type === "retry") return undefined;
    if (type !== "idle") throw new TypeError("OpenCode Scout session status is invalid");
  }

  const latest = latestAssistantMessage(messagesValue);
  if (!isRecord(latest)) return undefined;
  const info = nestedRecord(latest, "info");
  if (!info || info.role !== "assistant" || stringField(info, "sessionID") !== session.sessionId) return undefined;
  const messageId = stringField(info, "id");
  const time = nestedRecord(info, "time");
  const completedAt = time?.completed;
  if (!messageId || typeof completedAt !== "number" || !Number.isSafeInteger(completedAt) || completedAt <= 0) return undefined;
  if (info.error !== undefined && info.error !== null) return { eventType: "session.error", messageId, completedAt };
  const finish = stringField(info, "finish");
  if (!finish || finish === "tool-calls") return undefined;
  return { eventType: "session.idle", messageId, completedAt };
}

function normalizeSession(value: unknown, session: RecoverableSession): PersistedOpenCodeEvent {
  const record = asRecord(value, "durable session event");
  const identity = requireIdentity(record);
  const durable = asRecord(record.durable, "durable session event metadata");
  const aggregateId = stringField(durable, "aggregateID");
  if (!aggregateId) throw new TypeError("Durable session event is missing aggregateID");
  const sequence = requireSequence(durable.seq, "Durable session event");
  if (aggregateId !== session.sessionId) throw new Error("Durable session event aggregate does not match the mapped session");
  const interaction = interactionBinding(identity.eventType, record, session.sessionId);
  return {
    eventId: interactionEventId(identity.eventType, record, session.sessionId, identity.eventId),
    eventType: identity.eventType,
    source: "session-v2",
    payload: asJson(record),
    taskId: session.taskId,
    sessionId: session.sessionId,
    sessionKind: "requestId" in session ? "scout" : "developer",
    ...("requestId" in session ? { requestId: session.requestId } : {}),
    aggregateId,
    sequence,
    ...(interaction ? { interaction } : {}),
  };
}

function normalizeSync(value: unknown, state: BridgeState): PersistedOpenCodeEvent {
  const record = asRecord(value, "sync history event");
  const identity = requireIdentity(record);
  const aggregateId = stringField(record, "aggregate_id");
  if (!aggregateId) throw new TypeError("Sync history event is missing aggregate_id");
  const sequence = requireSequence(record.seq, "Sync history event");
  const session = state.sessionBindingForInternal(aggregateId);
  const interaction = session ? interactionBinding(identity.eventType, record, session.sessionId) : undefined;
  return {
    ...identity,
    source: "sync-history",
    payload: asJson(record),
    aggregateId,
    sequence,
    ...(session ? {
      taskId: session.taskId,
      sessionId: session.sessionId,
      sessionKind: session.sessionKind,
      ...(session.requestId ? { requestId: session.requestId } : {}),
    } : {}),
    ...(interaction ? { interaction } : {}),
  };
}

function historyPage(value: JsonValue | undefined): { events: unknown[]; hasMore: boolean } {
  const page = asRecord(value, "session history response");
  if (!Array.isArray(page.data) || typeof page.hasMore !== "boolean") throw new TypeError("Session history response is invalid");
  return { events: page.data, hasMore: page.hasMore };
}

export type ContinuationRecoveryOutcome = "recovered" | "clean" | "blocked" | "already-recovered";

export interface ContinuationRecoveryResult {
  outcome: ContinuationRecoveryOutcome;
  reason: string;
}

const continuationNudge = "Continue the existing task in the current repository scope after the resolved interaction. Do not restart the task, create a new session, or widen the scope.";

function pendingInteractionResponse(value: JsonValue | undefined, kind: InteractionKind, sessionId: string): boolean {
  if (!Array.isArray(value)) throw new TypeError(`OpenCode ${kind}.list recovery response is not an array`);
  let pending = false;
  for (const entry of value) {
    const interaction = asRecord(entry, `OpenCode ${kind}.list recovery item`);
    const interactionId = stringField(interaction, "id");
    const currentSession = stringField(interaction, "sessionID");
    if (!interactionId || !currentSession) throw new TypeError(`OpenCode ${kind}.list recovery item is missing id or sessionID`);
    if (currentSession === sessionId) pending = true;
  }
  return pending;
}

function sessionStatusType(value: JsonValue | undefined, sessionId: string): string {
  const statuses = asRecord(value ?? {}, "OpenCode session status");
  const current = statuses[sessionId];
  if (current === undefined) throw new TypeError("OpenCode session status does not contain the mapped developer session");
  const status = asRecord(current, "OpenCode mapped developer session status");
  const type = stringField(status, "type");
  if (!type || !["busy", "idle", "retry"].includes(type)) throw new TypeError("OpenCode mapped developer session status is invalid");
  return type;
}

export class RecoveryCoordinator {
  private readonly client: OpenCodeClient;
  private readonly state: BridgeState;
  private readonly onPersistedEvent?: RecoveryCoordinatorOptions["onPersistedEvent"];
  private readonly onError?: RecoveryCoordinatorOptions["onError"];

  constructor(options: RecoveryCoordinatorOptions) {
    this.client = options.client;
    this.state = options.state;
    this.onPersistedEvent = options.onPersistedEvent;
    this.onError = options.onError;
  }

  private async persist(event: PersistedOpenCodeEvent, notifyExisting = false): Promise<boolean> {
    const inserted = this.state.recordEvent({
      eventKey: `opencode:${event.eventId}`,
      source: event.source,
      eventType: event.eventType,
      payload: event.payload,
      ...(event.taskId ? { taskId: event.taskId } : {}),
      ...(event.sessionId ? { sessionId: event.sessionId } : {}),
      ...(event.requestId ? { requestId: event.requestId } : {}),
      ...(event.sessionKind ? { sessionKind: event.sessionKind } : {}),
      ...(event.aggregateId ? { aggregateId: event.aggregateId } : {}),
      ...(event.sequence === undefined ? {} : { durableSeq: event.sequence }),
      ...(event.interaction ? { interaction: event.interaction } : {}),
    }, terminalResponseDelivery(this.state, event));
    if (inserted || notifyExisting) await this.onPersistedEvent?.(event);
    return inserted;
  }

  async continueAfterInteraction(
    taskId: string,
    interactionId: string,
    kind: InteractionKind,
  ): Promise<ContinuationRecoveryResult> {
    const session = this.state.getTaskSession(taskId);
    if (!session) return { outcome: "blocked", reason: "missing-session-state" };

    let interaction;
    try {
      interaction = this.state.resolveInteraction(interactionId, kind, taskId);
    } catch {
      return { outcome: "blocked", reason: "inconsistent-interaction-state" };
    }
    if (!interaction || interaction.sessionId !== session.sessionId) {
      return { outcome: "blocked", reason: "missing-interaction-state" };
    }
    if (interaction.nudgeState === "sent") {
      return { outcome: "already-recovered", reason: "continuation-already-attempted" };
    }
    if (interaction.nudgeState === "claimed") {
      return { outcome: "blocked", reason: "continuation-delivery-unproven" };
    }
    if (interaction.nudgeState !== "not-attempted") {
      return { outcome: "blocked", reason: "inconsistent-interaction-state" };
    }

    let permissions: JsonValue | undefined;
    let questions: JsonValue | undefined;
    let statuses: JsonValue | undefined;
    try {
      [permissions, questions, statuses] = await Promise.all([
        this.client.request("permission.list"),
        this.client.request("question.list"),
        this.client.request("session.status"),
      ]);
      const permissionPending = pendingInteractionResponse(permissions, "permission", session.sessionId);
      const questionPending = pendingInteractionResponse(questions, "question", session.sessionId);
      if (permissionPending || questionPending) return { outcome: "blocked", reason: "outstanding-interaction" };
      const type = sessionStatusType(statuses, session.sessionId);
      if (type !== "idle") return { outcome: "clean", reason: "session-progressing" };
    } catch {
      await this.onError?.(new Error("Post-interaction continuation proof was unavailable"));
      return { outcome: "blocked", reason: "continuation-proof-unavailable" };
    }

    let claim: ReturnType<BridgeState["claimInteractionContinuation"]>;
    try {
      claim = this.state.claimInteractionContinuation({
        interactionId,
        kind,
        taskId,
        sessionId: session.sessionId,
      });
    } catch {
      return { outcome: "blocked", reason: "continuation-state-unavailable" };
    }
    if (claim === "already-attempted") return { outcome: "already-recovered", reason: "continuation-already-attempted" };
    if (claim !== "claimed") return { outcome: "blocked", reason: "continuation-state-unavailable" };

    try {
      await this.client.request("session.prompt_async", {
        path: { sessionID: session.sessionId },
        body: { agent: session.agent, parts: [{ type: "text", text: continuationNudge }] },
      });
      this.state.markInteractionContinuationSent(interactionId, taskId, kind, session.sessionId);
      return { outcome: "recovered", reason: "same-session-continuation-nudge-sent" };
    } catch {
      await this.onError?.(new Error("Post-interaction continuation delivery was not proven"));
      return { outcome: "blocked", reason: "continuation-delivery-unproven" };
    }
  }

  async recoverSyncHistory(): Promise<number> {
    const response = await this.client.request("sync.history.list", { body: this.state.durableCursors("sync-history") });
    if (!Array.isArray(response)) throw new TypeError("Sync history response is not an array");
    let inserted = 0;
    for (const value of response) if (await this.persist(normalizeSync(value, this.state))) inserted++;
    return inserted;
  }

  async recoverSessionHistory(session: RecoverableSession): Promise<number> {
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

  async recoverScoutCanonical(session: ScoutSession): Promise<boolean> {
    const current = this.state.getScoutSession(session.requestId);
    if (!current || current.taskId !== session.taskId || current.sessionId !== session.sessionId) {
      throw new Error("Scout recovery mapping is missing or inconsistent");
    }
    if (terminalSessionState(current.sessionState)) return false;
    const [status, messages] = await Promise.all([
      this.client.request("session.status"),
      this.client.request("session.messages", {
        path: { sessionID: session.sessionId },
        query: { limit: 20 },
      }),
    ]);
    const terminal = canonicalScoutTerminal(status, messages, session);
    if (!terminal) return false;
    const eventId = `canonical-${sha256(stableJson({
      sessionId: session.sessionId,
      messageId: terminal.messageId,
      completedAt: terminal.completedAt,
      eventType: terminal.eventType,
    }))}`;
    return await this.persist({
      eventId,
      source: "canonical-recovery",
      eventType: terminal.eventType,
      taskId: session.taskId,
      sessionId: session.sessionId,
      requestId: session.requestId,
      sessionKind: "scout",
      payload: {
        id: eventId,
        type: terminal.eventType,
        properties: { sessionID: session.sessionId },
        recovery: { method: "session.status+session.messages", completedAt: terminal.completedAt },
      },
    });
  }

  async recoverCanonicalInteractions(): Promise<number> {
    const [permissions, questions] = await Promise.all([
      this.client.request("permission.list"),
      this.client.request("question.list"),
    ]);
    const groups = [
      { value: permissions, eventType: "permission.asked" },
      { value: questions, eventType: "question.asked" },
    ] as const;
    let inserted = 0;
    for (const group of groups) {
      if (!Array.isArray(group.value)) throw new TypeError(`OpenCode ${group.eventType} recovery response is not an array`);
      for (const value of group.value) {
        const interaction = asRecord(value, `OpenCode ${group.eventType} recovery item`);
        const interactionId = stringField(interaction, "id");
        const sessionId = stringField(interaction, "sessionID");
        if (!interactionId || !sessionId) throw new TypeError(`OpenCode ${group.eventType} recovery item is missing id or sessionID`);
        const binding = this.state.sessionBindingForInternal(sessionId);
        if (!binding) continue;
        const eventId = interactionEventId(group.eventType, interaction, sessionId, interactionId);
        if (await this.persist({
          eventId,
          source: "canonical-recovery",
          eventType: group.eventType,
          taskId: binding.taskId,
          sessionId,
          sessionKind: binding.sessionKind,
          ...(binding.requestId ? { requestId: binding.requestId } : {}),
          interaction: { interactionId, kind: group.eventType === "permission.asked" ? "permission" : "question" },
          payload: {
            id: eventId,
            type: group.eventType,
            properties: asJson(interaction),
            recovery: { method: `${group.eventType === "permission.asked" ? "permission" : "question"}.list` },
          },
        }, true)) inserted++;
      }
    }
    return inserted;
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
    await this.recoverCanonicalInteractions();
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
          const normalized = normalizeLegacy(event.data, event.id);
          const session = normalized.sessionId ? this.state.sessionBindingForInternal(normalized.sessionId) : undefined;
          await this.persist({
            ...normalized,
            ...(session ? {
              taskId: session.taskId,
              sessionKind: session.sessionKind,
              ...(session.requestId ? { requestId: session.requestId } : {}),
            } : {}),
          });
        }
        if (!signal.aborted) throw new Error("OpenCode event stream ended");
      } catch (error) {
        if (signal.aborted) return;
        await this.onError?.(error);
        await this.retry(attempt++, signal, random);
      }
    }
  }

  async runSession(session: RecoverableSession, signal: AbortSignal, random = Math.random): Promise<void> {
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

  async runLegacySession(session: ScoutSession, signal: AbortSignal, random = Math.random): Promise<void> {
    let attempt = 0;
    while (!signal.aborted) {
      try {
        for await (const event of subscribeSse(this.client, "event.subscribe", {}, signal)) {
          const record = asRecord(event.data, "legacy OpenCode event");
          if (sessionFromPayload(record) !== session.sessionId) continue;
          attempt = 0;
          const syntheticId = `legacy-${sha256(stableJson(record))}`;
          const normalized = normalizeLegacy(record, event.id ?? syntheticId);
          await this.persist({
            ...normalized,
            taskId: session.taskId,
            sessionId: session.sessionId,
            sessionKind: "scout",
            requestId: session.requestId,
          });
          if (terminalSessionState(this.state.getScoutSession(session.requestId)?.sessionState ?? "")) return;
        }
        if (!signal.aborted) throw new Error("OpenCode workspace event stream ended");
      } catch (error) {
        if (signal.aborted) return;
        await this.onError?.(error);
        await this.retry(attempt++, signal, random);
      }
    }
  }

  private async runScoutCanonical(session: ScoutSession, signal: AbortSignal, random: () => number): Promise<void> {
    let attempt = 0;
    while (!signal.aborted) {
      try {
        if (await this.recoverScoutCanonical(session)) return;
        attempt = 0;
        await sleep(1_000, signal);
      } catch (error) {
        if (signal.aborted) return;
        await this.onError?.(error);
        await this.retry(attempt++, signal, random);
      }
    }
  }

  async runScoutSession(session: ScoutSession, signal: AbortSignal, random = Math.random): Promise<void> {
    if (terminalSessionState(this.state.getScoutSession(session.requestId)?.sessionState ?? "")) return;
    const child = new AbortController();
    const stop = () => child.abort(signal.reason);
    if (signal.aborted) stop();
    else signal.addEventListener("abort", stop, { once: true });
    const watchTerminal = async (): Promise<void> => {
      while (!child.signal.aborted) {
        if (terminalSessionState(this.state.getScoutSession(session.requestId)?.sessionState ?? "")) {
          child.abort();
          return;
        }
        try {
          await sleep(100, child.signal);
        } catch {
          return;
        }
      }
    };
    try {
      await Promise.all([
        this.runSession(session, child.signal, random),
        this.runLegacySession(session, child.signal, random),
        this.runScoutCanonical(session, child.signal, random),
        watchTerminal(),
      ]);
    } finally {
      signal.removeEventListener("abort", stop);
      child.abort();
    }
  }
}
