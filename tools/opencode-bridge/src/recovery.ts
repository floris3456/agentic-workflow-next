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

function canonicalDeveloperTerminal(
  statusValue: JsonValue | undefined,
  messagesValue: JsonValue | undefined,
  session: TaskSession,
): { eventType: "session.idle" | "session.error"; messageId: string; completedAt: number } | undefined {
  const status = asRecord(statusValue, "OpenCode session status");
  const current = status[session.sessionId];
  if (current !== undefined) {
    const sessionStatus = asRecord(current, "OpenCode developer session status");
    const type = stringField(sessionStatus, "type");
    if (type === "busy" || type === "retry") return undefined;
    if (type !== "idle") throw new TypeError("OpenCode developer session status is invalid");
  }

  const latest = latestAssistantMessage(messagesValue);
  if (!isRecord(latest)) return undefined;
  const info = nestedRecord(latest, "info");
  if (!info || info.role !== "assistant" || stringField(info, "sessionID") !== session.sessionId) return undefined;
  const messageId = stringField(info, "id");
  const time = nestedRecord(info, "time");
  const completedAt = time?.completed;
  if (!messageId || typeof completedAt !== "number" || !Number.isSafeInteger(completedAt) || completedAt <= 0) return undefined;
  const finish = stringField(info, "finish");
  if (finish === "tool-calls") return undefined;
  if (info.error !== undefined && info.error !== null) {
    if (!isRecord(info.error)) return undefined;
    return { eventType: "session.error", messageId, completedAt };
  }
  if (!finish) return undefined;
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
const continuationGraceMs = 1_000;

export interface AssistantMessageProof {
  fingerprint: string;
  terminal: boolean;
}

export interface ContinuationReplyBaseline {
  sessionId: string;
  sessionActivity: number;
  assistantMessage: AssistantMessageProof;
}

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

function sessionStatusType(value: JsonValue | undefined, sessionId: string): "busy" | "idle" | "retry" | "inactive" {
  const statuses = asRecord(value ?? {}, "OpenCode session status");
  const current = statuses[sessionId];
  if (current === undefined) return "inactive";
  const status = asRecord(current, "OpenCode mapped developer session status");
  const type = stringField(status, "type");
  if (!type || !["busy", "idle", "retry"].includes(type)) throw new TypeError("OpenCode mapped developer session status is invalid");
  return type as "busy" | "idle" | "retry";
}

function sessionActivity(value: JsonValue | undefined, sessionId: string): number {
  const session = asRecord(value, "OpenCode mapped developer session");
  if (stringField(session, "id") !== sessionId) throw new TypeError("OpenCode mapped developer session identity is invalid");
  const time = asRecord(session.time, "OpenCode mapped developer session time");
  if (typeof time.updated !== "number" || !Number.isFinite(time.updated) || time.updated < 0) {
    throw new TypeError("OpenCode mapped developer session activity is invalid");
  }
  return time.updated;
}

function assistantMessageProof(value: JsonValue | undefined): AssistantMessageProof {
  if (!Array.isArray(value) && !(isRecord(value) && Array.isArray(value.items))) {
    throw new TypeError("OpenCode mapped developer session messages are invalid");
  }
  const latest = latestAssistantMessage(value);
  if (!isRecord(latest)) return { fingerprint: "none", terminal: false };
  const info = nestedRecord(latest, "info");
  if (!info || info.role !== "assistant") throw new TypeError("OpenCode latest developer message is invalid");
  const id = stringField(info, "id");
  if (!id) throw new TypeError("OpenCode latest developer message is missing an ID");

  let completed: number | undefined;
  if (info.time !== undefined) {
    const time = asRecord(info.time, "OpenCode latest developer message time");
    if (time.completed !== undefined) {
      if (typeof time.completed !== "number" || !Number.isSafeInteger(time.completed) || time.completed < 0) {
        throw new TypeError("OpenCode latest developer message completion time is invalid");
      }
      completed = time.completed;
    }
  }
  let finish: string | undefined;
  if (info.finish !== undefined) {
    if (typeof info.finish !== "string") throw new TypeError("OpenCode latest developer message finish is invalid");
    finish = info.finish;
  }
  const errored = info.error !== undefined && info.error !== null;
  return {
    fingerprint: sha256(stableJson({ id, completed: completed ?? null, finish: finish ?? null, errored })),
    terminal: completed !== undefined && completed > 0 && (errored || (finish !== undefined && finish !== "tool-calls")),
  };
}

interface ContinuationProof {
  permissionPending: boolean;
  questionPending: boolean;
  sessionStatus: "busy" | "idle" | "retry" | "inactive";
  sessionActivity: number;
  assistantMessage?: AssistantMessageProof;
}

function postReplyProgress(proof: ContinuationProof, baseline: ContinuationReplyBaseline): boolean {
  if (proof.sessionActivity !== baseline.sessionActivity) return true;
  return proof.assistantMessage?.terminal === true
    && proof.assistantMessage.fingerprint !== baseline.assistantMessage.fingerprint;
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

  private async proveContinuationState(sessionId: string, includeAssistantMessage = false): Promise<ContinuationProof> {
    const [permissions, questions, statuses, session] = await Promise.all([
      this.client.request("permission.list"),
      this.client.request("question.list"),
      this.client.request("session.status"),
      this.client.request("session.get", { path: { sessionID: sessionId } }),
    ]);
    const proof: ContinuationProof = {
      permissionPending: pendingInteractionResponse(permissions, "permission", sessionId),
      questionPending: pendingInteractionResponse(questions, "question", sessionId),
      sessionStatus: sessionStatusType(statuses, sessionId),
      sessionActivity: sessionActivity(session, sessionId),
    };
    if (includeAssistantMessage) {
      proof.assistantMessage = assistantMessageProof(await this.client.request("session.messages", {
        path: { sessionID: sessionId },
        query: { limit: 20 },
      }));
    }
    return proof;
  }

  async captureContinuationBaseline(
    taskId: string,
    interactionId: string,
    kind: InteractionKind,
  ): Promise<ContinuationReplyBaseline | null> {
    const session = this.state.getTaskSession(taskId);
    if (!session) return null;
    try {
      const interaction = this.state.interaction(interactionId, taskId, kind);
      if (!interaction || interaction.sessionId !== session.sessionId
        || interaction.state !== "pending" || interaction.nudgeState !== "not-attempted") return null;
      const [sessionValue, messages] = await Promise.all([
        this.client.request("session.get", { path: { sessionID: session.sessionId } }),
        this.client.request("session.messages", { path: { sessionID: session.sessionId }, query: { limit: 20 } }),
      ]);
      return {
        sessionId: session.sessionId,
        sessionActivity: sessionActivity(sessionValue, session.sessionId),
        assistantMessage: assistantMessageProof(messages),
      };
    } catch {
      await this.onError?.(new Error("Pre-reply continuation proof was unavailable"));
      return null;
    }
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
    baseline?: ContinuationReplyBaseline | null,
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
    if (baseline === null) {
      try {
        this.state.resolveInteraction(interactionId, kind, taskId);
      } catch {
        return { outcome: "blocked", reason: "inconsistent-interaction-state" };
      }
      return { outcome: "blocked", reason: "continuation-proof-unavailable" };
    }
    if (baseline && baseline.sessionId !== session.sessionId) {
      return { outcome: "blocked", reason: "inconsistent-interaction-state" };
    }

    let initialProof: ContinuationProof;
    try {
      initialProof = await this.proveContinuationState(session.sessionId, baseline !== undefined);
    } catch {
      await this.onError?.(new Error("Post-interaction continuation proof was unavailable"));
      return { outcome: "blocked", reason: "continuation-proof-unavailable" };
    }
    if (initialProof.permissionPending || initialProof.questionPending) {
      return { outcome: "blocked", reason: "outstanding-interaction" };
    }
    if (["busy", "retry"].includes(initialProof.sessionStatus)) return { outcome: "clean", reason: "session-progressing" };
    if (baseline && postReplyProgress(initialProof, baseline)) return { outcome: "clean", reason: "session-progressing" };

    // An immediate idle response can race the server's normal resumption after
    // a reply. Require a bounded second proof before claiming the one-shot nudge.
    await sleep(continuationGraceMs);
    let recheck: ContinuationProof;
    try {
      recheck = await this.proveContinuationState(session.sessionId, baseline !== undefined);
    } catch {
      await this.onError?.(new Error("Post-interaction continuation recheck was unavailable"));
      return { outcome: "blocked", reason: "continuation-proof-unavailable" };
    }
    if (recheck.permissionPending || recheck.questionPending) {
      return { outcome: "blocked", reason: "outstanding-interaction" };
    }
    if (["busy", "retry"].includes(recheck.sessionStatus)
      || recheck.sessionActivity !== initialProof.sessionActivity
      || (baseline && postReplyProgress(recheck, baseline))) {
      return { outcome: "clean", reason: "session-progressing" };
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

  async recoverDeveloperCanonical(session: TaskSession): Promise<boolean> {
    const current = this.state.getTaskSession(session.taskId);
    if (!current || current.taskId !== session.taskId || current.sessionId !== session.sessionId) {
      throw new Error("Developer recovery mapping is missing or inconsistent");
    }
    if (terminalSessionState(current.sessionState)) return false;

    let terminal: ReturnType<typeof canonicalDeveloperTerminal>;
    try {
      const [permissions, questions] = await Promise.all([
        this.client.request("permission.list"),
        this.client.request("question.list"),
      ]);
      if (pendingInteractionResponse(permissions, "permission", session.sessionId)
        || pendingInteractionResponse(questions, "question", session.sessionId)) return false;
      const [status, messages] = await Promise.all([
        this.client.request("session.status"),
        this.client.request("session.messages", {
          path: { sessionID: session.sessionId },
          query: { limit: 20 },
        }),
      ]);
      terminal = canonicalDeveloperTerminal(status, messages, session);
    } catch {
      await this.onError?.(new Error("Developer canonical terminal proof was unavailable"));
      return false;
    }
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
      sessionKind: "developer",
      payload: {
        id: eventId,
        type: terminal.eventType,
        properties: { sessionID: session.sessionId },
        recovery: { method: "permission.list+question.list+session.status+session.messages", completedAt: terminal.completedAt },
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
      await this.recoverDeveloperCanonical(session);
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
        if (!("requestId" in session)) {
          if (await this.recoverDeveloperCanonical(session)) return;
          const current = this.state.getTaskSession(session.taskId);
          if (!current || current.sessionId !== session.sessionId || terminalSessionState(current.sessionState)) return;
        }
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
