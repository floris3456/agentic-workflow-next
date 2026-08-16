import { chmodSync, existsSync, lstatSync } from "node:fs";
import { DatabaseSync } from "node:sqlite";
import type {
  AcceptedCommand,
  AcceptedRequest,
  CommandEnvelope,
  CommandState,
  CompatibilityResult,
  InteractionBinding,
  InteractionKind,
  InteractionRecord,
  InteractionNudgeState,
  JsonValue,
  OutboxItem,
  RequestEnvelope,
  RequestState,
  ResponseDelivery,
  ResponseDeliveryInput,
  ScoutSession,
  SessionBinding,
  StoredCommand,
  StoredRequest,
  TaskSession,
} from "./types.js";
import { asJson, ensureParent, now, stableJson } from "./util.js";

type Row = Record<string, unknown>;
const taskBoundAliasKinds = new Set(["session", "pty", "permission", "question", "message", "part", "workspace", "event", "project"]);

function parseJson(value: unknown): JsonValue {
  return asJson(JSON.parse(String(value)));
}

function commandFromRow(row: Row): StoredCommand {
  return {
    commandId: String(row.command_id),
    taskId: String(row.task_id),
    sequence: Number(row.sequence),
    issueNumber: Number(row.issue_number),
    kind: String(row.kind),
    envelope: JSON.parse(String(row.envelope_json)) as CommandEnvelope,
    state: String(row.state) as CommandState,
    ...(row.raw_result_json === null ? {} : { rawResult: parseJson(row.raw_result_json) }),
    ...(row.public_result_json === null ? {} : { publicResult: parseJson(row.public_result_json) }),
    ...(row.error === null ? {} : { error: String(row.error) }),
    createdAt: Number(row.created_at),
    updatedAt: Number(row.updated_at),
  };
}

function requestFromRow(row: Row): StoredRequest {
  return {
    requestId: String(row.request_id),
    taskId: String(row.task_id),
    issueNumber: Number(row.issue_number),
    kind: String(row.kind) as RequestEnvelope["kind"],
    envelope: JSON.parse(String(row.envelope_json)) as RequestEnvelope,
    state: String(row.state) as RequestState,
    ...(row.raw_result_json === null ? {} : { rawResult: parseJson(row.raw_result_json) }),
    ...(row.public_result_json === null ? {} : { publicResult: parseJson(row.public_result_json) }),
    ...(row.error === null ? {} : { error: String(row.error) }),
    createdAt: Number(row.created_at),
    updatedAt: Number(row.updated_at),
  };
}

function taskSessionFromRow(row: Row): TaskSession {
  return {
    taskId: String(row.task_id),
    sessionId: String(row.session_id),
    issueNumber: Number(row.issue_number),
    agent: String(row.agent),
    sessionState: String(row.session_state ?? "unknown"),
    ...(row.latest_response_json === null || row.latest_response_json === undefined
      ? {}
      : { latestResponse: parseJson(row.latest_response_json) }),
    ...(row.latest_event_id === null || row.latest_event_id === undefined
      ? {}
      : { latestEventId: String(row.latest_event_id) }),
    createdAt: Number(row.created_at),
    updatedAt: Number(row.updated_at),
  };
}

function scoutSessionFromRow(row: Row): ScoutSession {
  return {
    requestId: String(row.request_id),
    taskId: String(row.task_id),
    sessionId: String(row.session_id),
    issueNumber: Number(row.issue_number),
    refSha: String(row.ref_sha),
    workspacePath: String(row.workspace_path),
    sessionState: String(row.session_state ?? "unknown"),
    ...(row.latest_response_json === null || row.latest_response_json === undefined
      ? {}
      : { latestResponse: parseJson(row.latest_response_json) }),
    ...(row.latest_event_id === null || row.latest_event_id === undefined
      ? {}
      : { latestEventId: String(row.latest_event_id) }),
    createdAt: Number(row.created_at),
    updatedAt: Number(row.updated_at),
  };
}

function interactionFromRow(row: Row): InteractionRecord {
  return {
    interactionId: String(row.interaction_id),
    kind: String(row.kind) as InteractionKind,
    taskId: String(row.task_id),
    sessionId: String(row.session_id),
    state: String(row.state) as InteractionRecord["state"],
    nudgeState: String(row.nudge_state) as InteractionNudgeState,
    createdAt: Number(row.created_at),
    updatedAt: Number(row.updated_at),
    ...(row.resolved_at === null || row.resolved_at === undefined ? {} : { resolvedAt: Number(row.resolved_at) }),
    ...(row.nudged_at === null || row.nudged_at === undefined ? {} : { nudgedAt: Number(row.nudged_at) }),
  };
}

export class BridgeState {
  readonly path: string;
  private readonly db: DatabaseSync;

  constructor(path: string) {
    this.path = path;
    ensureParent(path);
    if (existsSync(path)) {
      const existing = lstatSync(path);
      if (existing.isSymbolicLink() || !existing.isFile()) throw new Error(`Bridge state must be a regular non-symlink file: ${path}`);
      if ((existing.mode & 0o077) !== 0) throw new Error(`Bridge state must not be accessible by group or other users: ${path}`);
    }
    this.db = new DatabaseSync(path);
    chmodSync(path, 0o600);
    this.db.exec("PRAGMA journal_mode=WAL; PRAGMA synchronous=FULL; PRAGMA foreign_keys=ON; PRAGMA busy_timeout=5000;");
    this.migrate();
  }

  private migrate(): void {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS meta (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL,
        updated_at INTEGER NOT NULL
      );
      CREATE TABLE IF NOT EXISTS commands (
        command_id TEXT PRIMARY KEY,
        task_id TEXT NOT NULL,
        sequence INTEGER NOT NULL,
        issue_number INTEGER NOT NULL,
        kind TEXT NOT NULL,
        envelope_json TEXT NOT NULL,
        state TEXT NOT NULL,
        raw_result_json TEXT,
        public_result_json TEXT,
        error TEXT,
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL
      );
      CREATE UNIQUE INDEX IF NOT EXISTS commands_task_sequence ON commands(task_id, sequence);
      CREATE TABLE IF NOT EXISTS command_rejections (
        command_id TEXT PRIMARY KEY,
        task_id TEXT NOT NULL,
        sequence INTEGER NOT NULL,
        envelope_json TEXT NOT NULL,
        reason TEXT NOT NULL,
        created_at INTEGER NOT NULL
      );
      CREATE TABLE IF NOT EXISTS task_sequences (
        task_id TEXT PRIMARY KEY,
        last_sequence INTEGER NOT NULL,
        updated_at INTEGER NOT NULL
      );
      CREATE TABLE IF NOT EXISTS task_sessions (
        task_id TEXT PRIMARY KEY,
        session_id TEXT NOT NULL UNIQUE,
        issue_number INTEGER NOT NULL,
        agent TEXT NOT NULL,
        session_state TEXT NOT NULL DEFAULT 'unknown',
        latest_response_json TEXT,
        latest_event_id TEXT,
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL
      );
      CREATE TABLE IF NOT EXISTS interactions (
        interaction_id TEXT PRIMARY KEY,
        kind TEXT NOT NULL,
        task_id TEXT NOT NULL,
        session_id TEXT NOT NULL,
        state TEXT NOT NULL DEFAULT 'pending',
        nudge_state TEXT NOT NULL DEFAULT 'not-attempted',
        resolved_at INTEGER,
        nudged_at INTEGER,
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL
      );
      CREATE INDEX IF NOT EXISTS interactions_task_session ON interactions(task_id, session_id, created_at);
      CREATE TABLE IF NOT EXISTS issue_tasks (
        issue_number INTEGER PRIMARY KEY,
        task_id TEXT NOT NULL UNIQUE,
        updated_at INTEGER NOT NULL
      );
      CREATE TABLE IF NOT EXISTS scout_sessions (
        request_id TEXT PRIMARY KEY,
        task_id TEXT NOT NULL,
        session_id TEXT NOT NULL UNIQUE,
        issue_number INTEGER NOT NULL,
        ref_sha TEXT NOT NULL,
        workspace_path TEXT NOT NULL,
        session_state TEXT NOT NULL DEFAULT 'starting',
        latest_response_json TEXT,
        latest_event_id TEXT,
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL
      );
      CREATE INDEX IF NOT EXISTS scout_sessions_task ON scout_sessions(task_id, created_at);
      CREATE TABLE IF NOT EXISTS aliases (
        alias TEXT PRIMARY KEY,
        kind TEXT NOT NULL,
        internal_id TEXT NOT NULL,
        task_id TEXT,
        scope TEXT NOT NULL,
        created_at INTEGER NOT NULL
      );
      CREATE TABLE IF NOT EXISTS requests (
        request_id TEXT PRIMARY KEY,
        task_id TEXT NOT NULL,
        issue_number INTEGER NOT NULL,
        kind TEXT NOT NULL,
        envelope_json TEXT NOT NULL,
        state TEXT NOT NULL,
        raw_result_json TEXT,
        public_result_json TEXT,
        error TEXT,
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL
      );
      CREATE TABLE IF NOT EXISTS events (
        journal_id INTEGER PRIMARY KEY AUTOINCREMENT,
        event_key TEXT NOT NULL UNIQUE,
        source TEXT NOT NULL,
        event_type TEXT NOT NULL,
        task_id TEXT,
        session_id TEXT,
        request_id TEXT,
        session_kind TEXT,
        payload_json TEXT NOT NULL,
        aggregate_id TEXT,
        durable_seq INTEGER,
        received_at INTEGER NOT NULL
      );
      CREATE INDEX IF NOT EXISTS events_task_journal ON events(task_id, journal_id);
      CREATE TABLE IF NOT EXISTS durable_cursors (
        source TEXT NOT NULL,
        aggregate_id TEXT NOT NULL,
        sequence INTEGER NOT NULL,
        updated_at INTEGER NOT NULL,
        PRIMARY KEY(source, aggregate_id)
      );
      CREATE TABLE IF NOT EXISTS github_outbox (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        dedupe_key TEXT NOT NULL UNIQUE,
        kind TEXT NOT NULL,
        issue_number INTEGER NOT NULL,
        payload_json TEXT NOT NULL,
        attempts INTEGER NOT NULL DEFAULT 0,
        next_attempt_at INTEGER NOT NULL,
        delivered_at INTEGER,
        last_error TEXT,
        created_at INTEGER NOT NULL
      );
      CREATE TABLE IF NOT EXISTS compatibility (
        instance_id TEXT PRIMARY KEY,
        compatible INTEGER NOT NULL,
        running_version TEXT NOT NULL,
        expected_version TEXT NOT NULL,
        actual_hash TEXT NOT NULL,
        expected_hash TEXT NOT NULL,
        detail_json TEXT NOT NULL,
        checked_at INTEGER NOT NULL
      );
      CREATE TABLE IF NOT EXISTS reconciliation (
        key TEXT PRIMARY KEY,
        value_json TEXT NOT NULL,
        reconciled_at INTEGER NOT NULL
      );
      CREATE TABLE IF NOT EXISTS github_cache (
        key TEXT PRIMARY KEY,
        etag TEXT,
        value_json TEXT,
        updated_at INTEGER NOT NULL
      );
      CREATE TABLE IF NOT EXISTS pty_sessions (
        alias TEXT PRIMARY KEY,
        pty_id TEXT NOT NULL UNIQUE,
        task_id TEXT NOT NULL,
        cursor INTEGER NOT NULL DEFAULT 0,
        status TEXT NOT NULL,
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL
      );
      CREATE TABLE IF NOT EXISTS pty_output (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        alias TEXT NOT NULL REFERENCES pty_sessions(alias) ON DELETE CASCADE,
        cursor_start INTEGER NOT NULL,
        cursor_end INTEGER NOT NULL,
        text TEXT NOT NULL,
        received_at INTEGER NOT NULL
      );
      CREATE TABLE IF NOT EXISTS response_deliveries (
        event_id TEXT PRIMARY KEY,
        task_id TEXT NOT NULL,
        session_id TEXT NOT NULL,
        issue_number INTEGER NOT NULL,
        event_type TEXT NOT NULL,
        delivery_kind TEXT NOT NULL DEFAULT 'developer',
        request_id TEXT,
        attempts INTEGER NOT NULL DEFAULT 0,
        queued_at INTEGER,
        last_error TEXT,
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL
      );
    `);
    const taskColumns = new Set((this.db.prepare("PRAGMA table_info(task_sessions)").all() as Row[]).map((row) => String(row.name)));
    if (!taskColumns.has("session_state")) this.db.exec("ALTER TABLE task_sessions ADD COLUMN session_state TEXT NOT NULL DEFAULT 'unknown'");
    if (!taskColumns.has("latest_response_json")) this.db.exec("ALTER TABLE task_sessions ADD COLUMN latest_response_json TEXT");
    if (!taskColumns.has("latest_event_id")) this.db.exec("ALTER TABLE task_sessions ADD COLUMN latest_event_id TEXT");

    const eventColumns = new Set((this.db.prepare("PRAGMA table_info(events)").all() as Row[]).map((row) => String(row.name)));
    if (!eventColumns.has("request_id")) this.db.exec("ALTER TABLE events ADD COLUMN request_id TEXT");
    if (!eventColumns.has("session_kind")) this.db.exec("ALTER TABLE events ADD COLUMN session_kind TEXT");

    const deliveryColumns = new Set((this.db.prepare("PRAGMA table_info(response_deliveries)").all() as Row[]).map((row) => String(row.name)));
    if (!deliveryColumns.has("delivery_kind")) this.db.exec("ALTER TABLE response_deliveries ADD COLUMN delivery_kind TEXT NOT NULL DEFAULT 'developer'");
    if (!deliveryColumns.has("request_id")) this.db.exec("ALTER TABLE response_deliveries ADD COLUMN request_id TEXT");

    const aliasColumns = new Set((this.db.prepare("PRAGMA table_info(aliases)").all() as Row[]).map((row) => String(row.name)));
    if (!aliasColumns.has("scope")) {
      this.db.exec(`
        ALTER TABLE aliases RENAME TO aliases_v1;
        CREATE TABLE aliases (
          alias TEXT PRIMARY KEY,
          kind TEXT NOT NULL,
          internal_id TEXT NOT NULL,
          task_id TEXT,
          scope TEXT NOT NULL,
          created_at INTEGER NOT NULL
        );
        INSERT INTO aliases(alias, kind, internal_id, task_id, scope, created_at)
          SELECT alias, kind, internal_id, task_id, COALESCE(task_id, ''), created_at FROM aliases_v1;
        DROP TABLE aliases_v1;
        CREATE UNIQUE INDEX aliases_kind_internal_scope ON aliases(kind, internal_id, scope);
      `);
    }
    this.db.exec("CREATE UNIQUE INDEX IF NOT EXISTS aliases_kind_internal_scope ON aliases(kind, internal_id, scope)");
    this.setMeta("schema_version", "4");
  }

  private transaction<T>(operation: () => T): T {
    this.db.exec("BEGIN IMMEDIATE");
    try {
      const result = operation();
      this.db.exec("COMMIT");
      return result;
    } catch (error) {
      this.db.exec("ROLLBACK");
      throw error;
    }
  }

  close(): void {
    this.db.close();
  }

  setMeta(key: string, value: string): void {
    this.db.prepare(`
      INSERT INTO meta(key, value, updated_at) VALUES (?, ?, ?)
      ON CONFLICT(key) DO UPDATE SET value=excluded.value, updated_at=excluded.updated_at
    `).run(key, value, now());
  }

  getMeta(key: string): string | undefined {
    const row = this.db.prepare("SELECT value FROM meta WHERE key=?").get(key) as Row | undefined;
    return row ? String(row.value) : undefined;
  }

  acceptCommand(envelope: CommandEnvelope, issueNumber: number): AcceptedCommand {
    return this.transaction(() => {
      const existing = this.getCommand(envelope.command_id);
      const serialized = stableJson(envelope);
      if (existing) {
        const disposition = stableJson(existing.envelope) === serialized ? "duplicate" : "conflict";
        return { disposition, command: existing };
      }
      const priorRejection = this.db.prepare("SELECT envelope_json, reason FROM command_rejections WHERE command_id=?")
        .get(envelope.command_id) as Row | undefined;
      if (priorRejection) {
        return {
          disposition: "rejected",
          reason: stableJson(JSON.parse(String(priorRejection.envelope_json))) === serialized
            ? String(priorRejection.reason)
            : "Command UUID conflicts with a previously rejected command",
        };
      }
      const sameSequence = this.db.prepare("SELECT * FROM commands WHERE task_id=? AND sequence=?").get(envelope.task_id, envelope.sequence) as Row | undefined;
      if (sameSequence) return { disposition: "conflict", command: commandFromRow(sameSequence) };
      const latest = this.db.prepare("SELECT MAX(sequence) AS last_sequence FROM commands WHERE task_id=?")
        .get(envelope.task_id) as Row;
      const timestamp = now();
      const expected = latest.last_sequence === null ? 1 : Number(latest.last_sequence) + 1;
      const nonterminal = this.db.prepare(
        "SELECT command_id, state FROM commands WHERE task_id=? AND state IN ('accepted','applying') ORDER BY created_at LIMIT 1",
      ).get(envelope.task_id) as Row | undefined;
      let rejection: string | undefined;
      if (envelope.sequence !== expected) {
        rejection = `Command sequence must be exactly ${expected}; received ${envelope.sequence}`;
      } else if (nonterminal) {
        rejection = `Task already has nonterminal command ${String(nonterminal.command_id)} in state ${String(nonterminal.state)}`;
      } else if ((envelope.kind === "start" || envelope.kind === "promotion.apply")
        && (!envelope.expected?.developer_sha || !envelope.expected.ref)) {
        rejection = `${envelope.kind} requires top-level expected.developer_sha and expected.ref`;
      } else if ((envelope.kind === "start" || envelope.kind === "promotion.apply") && envelope.expected?.ref !== "developer") {
        rejection = `${envelope.kind} requires expected.ref developer`;
      }
      if (rejection) {
        this.db.prepare(`
          INSERT INTO command_rejections(command_id, task_id, sequence, envelope_json, reason, created_at)
          VALUES (?, ?, ?, ?, ?, ?)
        `).run(envelope.command_id, envelope.task_id, envelope.sequence, serialized, rejection, timestamp);
        return { disposition: "rejected", reason: rejection };
      }
      this.db.prepare(`
        INSERT INTO commands(command_id, task_id, sequence, issue_number, kind, envelope_json, state, error, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(envelope.command_id, envelope.task_id, envelope.sequence, issueNumber, envelope.kind, serialized, "accepted", null, timestamp, timestamp);
      const command = this.getCommand(envelope.command_id)!;
      return { disposition: "new", command };
    });
  }

  rejectCommand(envelope: CommandEnvelope, reason: string): AcceptedCommand {
    return this.transaction(() => {
      const serialized = stableJson(envelope);
      const existing = this.getCommand(envelope.command_id);
      if (existing) {
        return {
          disposition: stableJson(existing.envelope) === serialized ? "duplicate" : "conflict",
          command: existing,
        };
      }
      const prior = this.db.prepare("SELECT envelope_json, reason FROM command_rejections WHERE command_id=?")
        .get(envelope.command_id) as Row | undefined;
      if (prior) {
        return {
          disposition: "rejected",
          reason: stableJson(JSON.parse(String(prior.envelope_json))) === serialized
            ? String(prior.reason)
            : "Command UUID conflicts with a previously rejected command",
        };
      }
      this.db.prepare(`
        INSERT INTO command_rejections(command_id, task_id, sequence, envelope_json, reason, created_at)
        VALUES (?, ?, ?, ?, ?, ?)
      `).run(envelope.command_id, envelope.task_id, envelope.sequence, serialized, reason, now());
      return { disposition: "rejected", reason };
    });
  }

  commandRejection(commandId: string): { taskId: string; sequence: number; reason: string; createdAt: number } | undefined {
    const row = this.db.prepare("SELECT task_id, sequence, reason, created_at FROM command_rejections WHERE command_id=?")
      .get(commandId) as Row | undefined;
    return row ? {
      taskId: String(row.task_id),
      sequence: Number(row.sequence),
      reason: String(row.reason),
      createdAt: Number(row.created_at),
    } : undefined;
  }

  getCommand(commandId: string): StoredCommand | undefined {
    const row = this.db.prepare("SELECT * FROM commands WHERE command_id=?").get(commandId) as Row | undefined;
    return row ? commandFromRow(row) : undefined;
  }

  beginCommand(commandId: string): StoredCommand {
    const timestamp = now();
    const result = this.db.prepare("UPDATE commands SET state='applying', updated_at=? WHERE command_id=? AND state='accepted'").run(timestamp, commandId);
    const command = this.getCommand(commandId);
    if (!command) throw new Error(`Unknown command ${commandId}`);
    if (result.changes === 0) throw new Error(`Command ${commandId} cannot begin from ${command.state}`);
    return this.getCommand(commandId)!;
  }

  finishCommand(commandId: string, state: Extract<CommandState, "succeeded" | "failed" | "indeterminate">, raw?: JsonValue, projected?: JsonValue, error?: string): StoredCommand {
    this.db.prepare(`
      UPDATE commands SET state=?, raw_result_json=?, public_result_json=?, error=?, updated_at=?
      WHERE command_id=? AND state IN ('accepted','applying')
    `).run(state, raw === undefined ? null : stableJson(raw), projected === undefined ? null : stableJson(projected), error ?? null, now(), commandId);
    const command = this.getCommand(commandId);
    if (!command) throw new Error(`Unknown command ${commandId}`);
    return command;
  }

  mapTaskSession(taskId: string, sessionId: string, issueNumber: number, agent: string): void {
    const timestamp = now();
    this.transaction(() => {
      const scout = this.scoutSessionForInternal(sessionId);
      if (scout) throw new Error(`Developer session ID conflicts with Scout request ${scout.requestId}`);
      this.db.prepare(`
        INSERT INTO task_sessions(task_id, session_id, issue_number, agent, session_state, created_at, updated_at)
        VALUES (?, ?, ?, ?, 'starting', ?, ?)
        ON CONFLICT(task_id) DO UPDATE SET session_id=excluded.session_id, issue_number=excluded.issue_number,
          agent=excluded.agent, session_state=excluded.session_state, updated_at=excluded.updated_at
      `).run(taskId, sessionId, issueNumber, agent, timestamp, timestamp);
      this.db.prepare(`
        INSERT INTO issue_tasks(issue_number, task_id, updated_at) VALUES (?, ?, ?)
        ON CONFLICT(task_id) DO UPDATE SET issue_number=excluded.issue_number, updated_at=excluded.updated_at
      `).run(issueNumber, taskId, timestamp);
    });
  }

  getTaskSession(taskId: string): TaskSession | undefined {
    const row = this.db.prepare("SELECT * FROM task_sessions WHERE task_id=?").get(taskId) as Row | undefined;
    return row ? taskSessionFromRow(row) : undefined;
  }

  taskSessionForInternal(sessionId: string): TaskSession | undefined {
    const row = this.db.prepare("SELECT * FROM task_sessions WHERE session_id=?").get(sessionId) as Row | undefined;
    return row ? taskSessionFromRow(row) : undefined;
  }

  mapScoutSession(input: {
    requestId: string;
    taskId: string;
    sessionId: string;
    issueNumber: number;
    refSha: string;
    workspacePath: string;
  }): void {
    const timestamp = now();
    this.transaction(() => {
      const developer = this.taskSessionForInternal(input.sessionId);
      if (developer) throw new Error(`Scout session ID conflicts with developer task ${developer.taskId}`);
      const existing = this.scoutSessionForInternal(input.sessionId);
      if (existing && existing.requestId !== input.requestId) {
        throw new Error(`Scout session ID conflicts with request ${existing.requestId}`);
      }
      this.db.prepare(`
        INSERT INTO scout_sessions(
          request_id, task_id, session_id, issue_number, ref_sha, workspace_path,
          session_state, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, 'starting', ?, ?)
        ON CONFLICT(request_id) DO UPDATE SET
          session_id=excluded.session_id, issue_number=excluded.issue_number,
          ref_sha=excluded.ref_sha, workspace_path=excluded.workspace_path,
          session_state=excluded.session_state, updated_at=excluded.updated_at
      `).run(
        input.requestId, input.taskId, input.sessionId, input.issueNumber,
        input.refSha, input.workspacePath, timestamp, timestamp,
      );
    });
  }

  getScoutSession(requestId: string): ScoutSession | undefined {
    const row = this.db.prepare("SELECT * FROM scout_sessions WHERE request_id=?").get(requestId) as Row | undefined;
    return row ? scoutSessionFromRow(row) : undefined;
  }

  scoutSessionForInternal(sessionId: string): ScoutSession | undefined {
    const row = this.db.prepare("SELECT * FROM scout_sessions WHERE session_id=?").get(sessionId) as Row | undefined;
    return row ? scoutSessionFromRow(row) : undefined;
  }

  listScoutSessions(taskId?: string): ScoutSession[] {
    const rows = taskId === undefined
      ? this.db.prepare("SELECT * FROM scout_sessions ORDER BY created_at, request_id").all() as Row[]
      : this.db.prepare("SELECT * FROM scout_sessions WHERE task_id=? ORDER BY created_at, request_id").all(taskId) as Row[];
    return rows.map(scoutSessionFromRow);
  }

  sessionBindingForInternal(sessionId: string): SessionBinding | undefined {
    const developer = this.taskSessionForInternal(sessionId);
    if (developer) return { taskId: developer.taskId, sessionId, sessionKind: "developer" };
    const scout = this.scoutSessionForInternal(sessionId);
    return scout
      ? { taskId: scout.taskId, sessionId, sessionKind: "scout", requestId: scout.requestId }
      : undefined;
  }

  taskForIssue(issueNumber: number): string | undefined {
    const row = this.db.prepare("SELECT task_id FROM issue_tasks WHERE issue_number=?").get(issueNumber) as Row | undefined;
    return row ? String(row.task_id) : undefined;
  }

  issueForTask(taskId: string): number | undefined {
    const row = this.db.prepare("SELECT issue_number FROM issue_tasks WHERE task_id=?").get(taskId) as Row | undefined;
    return row ? Number(row.issue_number) : undefined;
  }

  hasMutatingTask(taskId: string): boolean {
    if (this.getTaskSession(taskId)) return true;
    return this.db.prepare("SELECT 1 AS present FROM commands WHERE task_id=? LIMIT 1").get(taskId) !== undefined;
  }

  bindIssueTask(issueNumber: number, taskId: string): void {
    const timestamp = now();
    const byIssue = this.taskForIssue(issueNumber);
    const byTask = this.issueForTask(taskId);
    if (byIssue && byIssue !== taskId) throw new Error(`Issue ${issueNumber} is already bound to ${byIssue}`);
    if (byTask !== undefined && byTask !== issueNumber) throw new Error(`Task ${taskId} is already bound to issue ${byTask}`);
    this.db.prepare(`
      INSERT INTO issue_tasks(issue_number, task_id, updated_at) VALUES (?, ?, ?)
      ON CONFLICT(issue_number) DO UPDATE SET updated_at=excluded.updated_at
    `).run(issueNumber, taskId, timestamp);
  }

  listTaskSessions(): TaskSession[] {
    return (this.db.prepare("SELECT * FROM task_sessions ORDER BY task_id").all() as Row[]).map(taskSessionFromRow);
  }

  private upsertInteraction(input: {
    interactionId: string;
    kind: InteractionKind;
    taskId: string;
    sessionId: string;
  }): void {
    const existing = this.db.prepare("SELECT * FROM interactions WHERE interaction_id=?").get(input.interactionId) as Row | undefined;
    if (existing) {
      if (String(existing.kind) !== input.kind || String(existing.task_id) !== input.taskId || String(existing.session_id) !== input.sessionId) {
        throw new Error(`Interaction ${input.interactionId} has inconsistent task, session, or kind mapping`);
      }
      return;
    }
    const timestamp = now();
    this.db.prepare(`
      INSERT INTO interactions(
        interaction_id, kind, task_id, session_id, state, nudge_state,
        resolved_at, nudged_at, created_at, updated_at
      ) VALUES (?, ?, ?, ?, 'pending', 'not-attempted', NULL, NULL, ?, ?)
    `).run(input.interactionId, input.kind, input.taskId, input.sessionId, timestamp, timestamp);
  }

  recordInteraction(input: {
    interactionId: string;
    kind: InteractionKind;
    taskId: string;
    sessionId: string;
  }): void {
    this.transaction(() => this.upsertInteraction(input));
  }

  interaction(interactionId: string, taskId?: string, kind?: InteractionKind): InteractionRecord | undefined {
    const row = this.db.prepare("SELECT * FROM interactions WHERE interaction_id=?").get(interactionId) as Row | undefined;
    if (!row) return undefined;
    const record = interactionFromRow(row);
    if (taskId !== undefined && record.taskId !== taskId) throw new Error(`Interaction ${interactionId} is not available to task ${taskId}`);
    if (kind !== undefined && record.kind !== kind) throw new Error(`Interaction ${interactionId} is ${record.kind}, not ${kind}`);
    return record;
  }

  resolveInteraction(interactionId: string, kind: InteractionKind, taskId: string): InteractionRecord | undefined {
    return this.transaction(() => {
      const record = this.interaction(interactionId, taskId, kind);
      if (!record) return undefined;
      if (record.state === "pending") {
        this.db.prepare(
          "UPDATE interactions SET state='resolved', resolved_at=?, updated_at=? WHERE interaction_id=? AND state='pending'",
        ).run(now(), now(), interactionId);
      }
      return this.interaction(interactionId, taskId, kind);
    });
  }

  claimInteractionContinuation(input: {
    interactionId: string;
    kind: InteractionKind;
    taskId: string;
    sessionId: string;
  }): "claimed" | "already-attempted" | "not-resolved" | "missing" {
    return this.transaction(() => {
      const record = this.interaction(input.interactionId, input.taskId, input.kind);
      if (!record || record.sessionId !== input.sessionId) return "missing";
      if (record.state !== "resolved") return "not-resolved";
      if (record.nudgeState !== "not-attempted") return "already-attempted";
      const timestamp = now();
      const result = this.db.prepare(
        "UPDATE interactions SET nudge_state='claimed', nudged_at=?, updated_at=? WHERE interaction_id=? AND nudge_state='not-attempted'",
      ).run(timestamp, timestamp, input.interactionId);
      return result.changes === 1 ? "claimed" : "already-attempted";
    });
  }

  markInteractionContinuationSent(interactionId: string, taskId: string, kind: InteractionKind, sessionId: string): void {
    const record = this.interaction(interactionId, taskId, kind);
    if (!record || record.sessionId !== sessionId || record.state !== "resolved" || record.nudgeState !== "claimed") {
      throw new Error(`Interaction ${interactionId} continuation is not in the claimed state`);
    }
    this.db.prepare(
      "UPDATE interactions SET nudge_state='sent', updated_at=? WHERE interaction_id=? AND nudge_state='claimed'",
    ).run(now(), interactionId);
  }

  listCommands(states?: CommandState[]): StoredCommand[] {
    if (!states || states.length === 0) {
      return (this.db.prepare("SELECT * FROM commands ORDER BY created_at, command_id").all() as Row[]).map(commandFromRow);
    }
    const placeholders = states.map(() => "?").join(",");
    return (this.db.prepare(`SELECT * FROM commands WHERE state IN (${placeholders}) ORDER BY created_at, command_id`).all(...states) as Row[]).map(commandFromRow);
  }

  acceptRequest(envelope: RequestEnvelope, issueNumber: number): AcceptedRequest {
    return this.transaction(() => {
      const existing = this.getRequest(envelope.request_id);
      const serialized = stableJson(envelope);
      if (existing) {
        return {
          disposition: stableJson(existing.envelope) === serialized ? "duplicate" : "conflict",
          request: existing,
        };
      }
      const timestamp = now();
      this.db.prepare(`
        INSERT INTO requests(request_id, task_id, issue_number, kind, envelope_json, state, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, 'accepted', ?, ?)
      `).run(envelope.request_id, envelope.task_id, issueNumber, envelope.kind, serialized, timestamp, timestamp);
      return { disposition: "new", request: this.getRequest(envelope.request_id)! };
    });
  }

  getRequest(requestId: string): StoredRequest | undefined {
    const row = this.db.prepare("SELECT * FROM requests WHERE request_id=?").get(requestId) as Row | undefined;
    return row ? requestFromRow(row) : undefined;
  }

  beginRequest(requestId: string): StoredRequest {
    const result = this.db.prepare(
      "UPDATE requests SET state='applying', updated_at=? WHERE request_id=? AND state='accepted'",
    ).run(now(), requestId);
    const request = this.getRequest(requestId);
    if (!request) throw new Error(`Unknown bridge request ${requestId}`);
    if (result.changes === 0) throw new Error(`Bridge request ${requestId} cannot begin from ${request.state}`);
    return this.getRequest(requestId)!;
  }

  requeueApplyingStatusRequest(requestId: string): StoredRequest {
    const request = this.getRequest(requestId);
    if (!request) throw new Error(`Unknown bridge request ${requestId}`);
    if (!new Set(["command.status", "task.status", "scout.status"]).has(request.kind)) {
      throw new Error(`Bridge request ${requestId} is not a repeatable status read`);
    }
    const result = this.db.prepare(
      "UPDATE requests SET state='accepted', raw_result_json=NULL, public_result_json=NULL, error=NULL, updated_at=? WHERE request_id=? AND state='applying'",
    ).run(now(), requestId);
    if (result.changes === 0) throw new Error(`Bridge request ${requestId} cannot requeue from ${request.state}`);
    return this.getRequest(requestId)!;
  }

  finishRequest(
    requestId: string,
    state: Extract<RequestState, "succeeded" | "failed" | "indeterminate">,
    raw?: JsonValue,
    projected?: JsonValue,
    error?: string,
  ): StoredRequest {
    this.db.prepare(`
      UPDATE requests SET state=?, raw_result_json=?, public_result_json=?, error=?, updated_at=?
      WHERE request_id=? AND state IN ('accepted','applying')
    `).run(state, raw === undefined ? null : stableJson(raw), projected === undefined ? null : stableJson(projected), error ?? null, now(), requestId);
    const request = this.getRequest(requestId);
    if (!request) throw new Error(`Unknown bridge request ${requestId}`);
    return request;
  }

  listRequests(states?: RequestState[]): StoredRequest[] {
    if (!states || states.length === 0) {
      return (this.db.prepare("SELECT * FROM requests ORDER BY created_at, request_id").all() as Row[]).map(requestFromRow);
    }
    const placeholders = states.map(() => "?").join(",");
    return (this.db.prepare(`SELECT * FROM requests WHERE state IN (${placeholders}) ORDER BY created_at, request_id`).all(...states) as Row[])
      .map(requestFromRow);
  }

  updateTaskAgent(taskId: string, agent: string): void {
    this.db.prepare("UPDATE task_sessions SET agent=?, updated_at=? WHERE task_id=?").run(agent, now(), taskId);
  }

  updateTaskSessionState(taskId: string, sessionState: string, eventId: string): void {
    this.db.prepare(
      "UPDATE task_sessions SET session_state=?, latest_event_id=?, updated_at=? WHERE task_id=?",
    ).run(sessionState, eventId, now(), taskId);
  }

  updateTaskLatestResponse(taskId: string, response: JsonValue, eventId: string): void {
    this.db.prepare(
      "UPDATE task_sessions SET latest_response_json=?, latest_event_id=?, updated_at=? WHERE task_id=?",
    ).run(stableJson(response), eventId, now(), taskId);
  }

  updateScoutSessionState(requestId: string, sessionState: string, eventId: string): void {
    this.db.prepare(
      "UPDATE scout_sessions SET session_state=?, latest_event_id=?, updated_at=? WHERE request_id=?",
    ).run(sessionState, eventId, now(), requestId);
  }

  updateScoutLatestResponse(requestId: string, response: JsonValue, eventId: string): void {
    this.db.prepare(
      "UPDATE scout_sessions SET latest_response_json=?, latest_event_id=?, updated_at=? WHERE request_id=?",
    ).run(stableJson(response), eventId, now(), requestId);
  }

  ensureAlias(kind: string, internalId: string, taskId?: string): string {
    const bound = taskBoundAliasKinds.has(kind);
    const scope = bound ? taskId ?? "" : "";
    const existing = this.db.prepare("SELECT alias FROM aliases WHERE kind=? AND internal_id=? AND scope=?")
      .get(kind, internalId, scope) as Row | undefined;
    if (existing) return String(existing.alias);
    const count = this.db.prepare("SELECT COUNT(*) AS count FROM aliases WHERE kind=?").get(kind) as Row;
    const alias = `${kind}-${Number(count.count) + 1}`;
    this.db.prepare("INSERT INTO aliases(alias, kind, internal_id, task_id, scope, created_at) VALUES (?, ?, ?, ?, ?, ?)")
      .run(alias, kind, internalId, bound ? taskId ?? null : null, scope, now());
    return alias;
  }

  resolveAlias(alias: string, expectedKind?: string, taskId?: string): string {
    const row = this.db.prepare("SELECT kind, internal_id, task_id FROM aliases WHERE alias=?").get(alias) as Row | undefined;
    if (!row) throw new Error(`Unknown local alias ${alias}`);
    if (expectedKind && row.kind !== expectedKind) throw new Error(`${alias} is ${String(row.kind)}, not ${expectedKind}`);
    if (taskId && taskBoundAliasKinds.has(String(row.kind)) && row.task_id !== taskId) throw new Error(`${alias} is not available to task ${taskId}`);
    return String(row.internal_id);
  }

  aliasFor(internalId: string, kind?: string, taskId?: string): string | undefined {
    const row = kind === undefined
      ? this.db.prepare("SELECT alias FROM aliases WHERE internal_id=? ORDER BY created_at LIMIT 1").get(internalId) as Row | undefined
      : this.db.prepare("SELECT alias FROM aliases WHERE kind=? AND internal_id=? AND scope=?")
        .get(kind, internalId, taskBoundAliasKinds.has(kind) ? taskId ?? "" : "") as Row | undefined;
    return row ? String(row.alias) : undefined;
  }

  recordEvent(input: {
    eventKey: string; source: string; eventType: string; payload: JsonValue; taskId?: string; sessionId?: string;
    requestId?: string; sessionKind?: "developer" | "scout"; aggregateId?: string; durableSeq?: number;
    interaction?: InteractionBinding;
  }, responseDelivery?: ResponseDeliveryInput): boolean {
    return this.transaction(() => {
      const result = this.db.prepare(`
        INSERT OR IGNORE INTO events(
          event_key, source, event_type, task_id, session_id, request_id,
          session_kind, payload_json, aggregate_id, durable_seq, received_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        input.eventKey, input.source, input.eventType, input.taskId ?? null,
        input.sessionId ?? null, input.requestId ?? null, input.sessionKind ?? null,
        stableJson(input.payload), input.aggregateId ?? null,
        input.durableSeq ?? null, now(),
      );
      if (result.changes === 0) {
        this.db.prepare(`
          UPDATE events SET task_id=COALESCE(task_id, ?), session_id=COALESCE(session_id, ?),
            request_id=COALESCE(request_id, ?), session_kind=COALESCE(session_kind, ?),
            aggregate_id=COALESCE(aggregate_id, ?), durable_seq=COALESCE(durable_seq, ?)
          WHERE event_key=?
        `).run(
          input.taskId ?? null, input.sessionId ?? null, input.requestId ?? null,
          input.sessionKind ?? null, input.aggregateId ?? null,
          input.durableSeq ?? null, input.eventKey,
        );
      }
      if (input.aggregateId && input.durableSeq !== undefined) this.setDurableCursor(input.source, input.aggregateId, input.durableSeq);
      if (input.interaction) {
        if (!input.taskId || !input.sessionId) throw new Error("Interaction event is missing task or session mapping");
        this.upsertInteraction({
          interactionId: input.interaction.interactionId,
          kind: input.interaction.kind,
          taskId: input.taskId,
          sessionId: input.sessionId,
        });
      }
      if (responseDelivery) this.queueResponseDeliveryRecord(responseDelivery);
      return result.changes > 0;
    });
  }

  listEvents(taskId: string, after = 0, limit = 50): Array<{ journalId: number; eventType: string; payload: JsonValue; receivedAt: number }> {
    const bounded = Math.max(1, Math.min(100, limit));
    return (this.db.prepare(`
      SELECT journal_id, event_type, payload_json, received_at FROM events
      WHERE task_id=? AND journal_id>? ORDER BY journal_id LIMIT ?
    `).all(taskId, after, bounded) as Row[]).map((row) => ({
      journalId: Number(row.journal_id), eventType: String(row.event_type), payload: parseJson(row.payload_json), receivedAt: Number(row.received_at),
    }));
  }

  private queueResponseDeliveryRecord(input: ResponseDeliveryInput): boolean {
    const timestamp = now();
    const result = this.db.prepare(`
      INSERT OR IGNORE INTO response_deliveries(
        event_id, task_id, session_id, issue_number, event_type, delivery_kind,
        request_id, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      input.eventId, input.taskId, input.sessionId, input.issueNumber,
      input.eventType, input.deliveryKind ?? "developer", input.requestId ?? null,
      timestamp, timestamp,
    );
    if (input.deliveryKind === "scout") {
      if (!input.requestId) throw new Error("Scout response delivery requires request correlation");
      this.updateScoutSessionState(input.requestId, input.eventType, input.eventId);
    } else {
      this.updateTaskSessionState(input.taskId, input.eventType, input.eventId);
    }
    return result.changes > 0;
  }

  queueResponseDelivery(input: ResponseDeliveryInput): void {
    this.transaction(() => this.queueResponseDeliveryRecord(input));
  }

  recoverTerminalResponseDeliveries(): number {
    return this.transaction(() => {
      const rows = this.db.prepare(`
        SELECT event_key, event_type, task_id, session_id, request_id
        FROM events
        WHERE lower(event_type) IN ('session.idle', 'session.error')
          AND task_id IS NOT NULL AND session_id IS NOT NULL
        ORDER BY journal_id
      `).all() as Row[];
      let recovered = 0;
      for (const row of rows) {
        const eventKey = String(row.event_key);
        if (!eventKey.startsWith("opencode:")) continue;
        const eventId = eventKey.slice("opencode:".length);
        const taskId = String(row.task_id);
        const sessionId = String(row.session_id);
        const eventType = String(row.event_type);
        if (row.request_id !== null && row.request_id !== undefined) {
          const requestId = String(row.request_id);
          const scout = this.getScoutSession(requestId);
          if (!scout || scout.taskId !== taskId || scout.sessionId !== sessionId) continue;
          if (this.queueResponseDeliveryRecord({
            eventId, taskId, sessionId, eventType,
            issueNumber: scout.issueNumber,
            deliveryKind: "scout",
            requestId,
          })) recovered++;
          continue;
        }
        const issueNumber = this.issueForTask(taskId);
        const session = this.getTaskSession(taskId);
        if (issueNumber === undefined || !session || session.sessionId !== sessionId) continue;
        if (this.queueResponseDeliveryRecord({
          eventId, taskId, sessionId, eventType, issueNumber, deliveryKind: "developer",
        })) recovered++;
      }
      return recovered;
    });
  }

  pendingResponseDeliveries(limit = 25): ResponseDelivery[] {
    return (this.db.prepare(`
      SELECT * FROM response_deliveries WHERE queued_at IS NULL ORDER BY created_at, event_id LIMIT ?
    `).all(Math.max(1, Math.min(100, limit))) as Row[]).map((row) => ({
      eventId: String(row.event_id),
      taskId: String(row.task_id),
      sessionId: String(row.session_id),
      issueNumber: Number(row.issue_number),
      eventType: String(row.event_type),
      deliveryKind: String(row.delivery_kind) as ResponseDelivery["deliveryKind"],
      ...(row.request_id === null || row.request_id === undefined ? {} : { requestId: String(row.request_id) }),
      attempts: Number(row.attempts),
      createdAt: Number(row.created_at),
      updatedAt: Number(row.updated_at),
    }));
  }

  completeResponseDelivery(eventId: string): void {
    this.db.prepare(
      "UPDATE response_deliveries SET queued_at=?, last_error=NULL, updated_at=? WHERE event_id=?",
    ).run(now(), now(), eventId);
  }

  retryResponseDelivery(eventId: string, error: string): void {
    this.db.prepare(
      "UPDATE response_deliveries SET attempts=attempts+1, last_error=?, updated_at=? WHERE event_id=?",
    ).run(error.slice(0, 1_000), now(), eventId);
  }

  setDurableCursor(source: string, aggregateId: string, sequence: number): void {
    this.db.prepare(`
      INSERT INTO durable_cursors(source, aggregate_id, sequence, updated_at) VALUES (?, ?, ?, ?)
      ON CONFLICT(source, aggregate_id) DO UPDATE SET sequence=MAX(sequence, excluded.sequence), updated_at=excluded.updated_at
    `).run(source, aggregateId, sequence, now());
  }

  durableCursors(source: string): Record<string, number> {
    return Object.fromEntries((this.db.prepare("SELECT aggregate_id, sequence FROM durable_cursors WHERE source=?").all(source) as Row[])
      .map((row) => [String(row.aggregate_id), Number(row.sequence)]));
  }

  durableCursor(source: string, aggregateId: string): number | undefined {
    const row = this.db.prepare("SELECT sequence FROM durable_cursors WHERE source=? AND aggregate_id=?").get(source, aggregateId) as Row | undefined;
    return row ? Number(row.sequence) : undefined;
  }

  enqueue(dedupeKey: string, kind: string, issueNumber: number, payload: JsonValue): void {
    const timestamp = now();
    this.db.prepare(`
      INSERT OR IGNORE INTO github_outbox(dedupe_key, kind, issue_number, payload_json, next_attempt_at, created_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(dedupeKey, kind, issueNumber, stableJson(payload), timestamp, timestamp);
  }

  pendingOutbox(timestamp = now(), limit = 25): OutboxItem[] {
    return (this.db.prepare(`
      SELECT * FROM github_outbox WHERE delivered_at IS NULL AND next_attempt_at<=? ORDER BY id LIMIT ?
    `).all(timestamp, limit) as Row[]).map((row) => ({
      id: Number(row.id), dedupeKey: String(row.dedupe_key), kind: String(row.kind), issueNumber: Number(row.issue_number),
      payload: parseJson(row.payload_json), attempts: Number(row.attempts), nextAttemptAt: Number(row.next_attempt_at),
    }));
  }

  orderedOutbox(timestamp = now(), limit = 25): OutboxItem[] {
    const rows = this.db.prepare(`
      SELECT * FROM github_outbox WHERE delivered_at IS NULL ORDER BY id LIMIT ?
    `).all(limit) as Row[];
    const ready: OutboxItem[] = [];
    for (const row of rows) {
      if (Number(row.next_attempt_at) > timestamp) break;
      ready.push({
        id: Number(row.id), dedupeKey: String(row.dedupe_key), kind: String(row.kind), issueNumber: Number(row.issue_number),
        payload: parseJson(row.payload_json), attempts: Number(row.attempts), nextAttemptAt: Number(row.next_attempt_at),
      });
    }
    return ready;
  }

  deliverOutbox(id: number): void {
    this.db.prepare("UPDATE github_outbox SET delivered_at=?, last_error=NULL WHERE id=?").run(now(), id);
  }

  retryOutbox(id: number, error: string, nextAttemptAt: number): void {
    this.db.prepare("UPDATE github_outbox SET attempts=attempts+1, last_error=?, next_attempt_at=? WHERE id=?").run(error.slice(0, 1000), nextAttemptAt, id);
  }

  recordCompatibility(instanceId: string, result: CompatibilityResult): void {
    this.db.prepare(`
      INSERT INTO compatibility(instance_id, compatible, running_version, expected_version, actual_hash, expected_hash, detail_json, checked_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(instance_id) DO UPDATE SET compatible=excluded.compatible, running_version=excluded.running_version,
        expected_version=excluded.expected_version, actual_hash=excluded.actual_hash, expected_hash=excluded.expected_hash,
        detail_json=excluded.detail_json, checked_at=excluded.checked_at
    `).run(instanceId, result.compatible ? 1 : 0, result.runningVersion, result.expectedVersion, result.actualHash,
      result.expectedHash, stableJson({ added: result.added, removed: result.removed, changed: result.changed }), now());
  }

  compatibility(instanceId: string): (CompatibilityResult & { checkedAt: number }) | undefined {
    const row = this.db.prepare("SELECT * FROM compatibility WHERE instance_id=?").get(instanceId) as Row | undefined;
    if (!row) return undefined;
    const detail = JSON.parse(String(row.detail_json)) as { added: string[]; removed: string[]; changed: string[] };
    return {
      compatible: Number(row.compatible) === 1, runningVersion: String(row.running_version), expectedVersion: String(row.expected_version),
      actualHash: String(row.actual_hash), expectedHash: String(row.expected_hash), ...detail, checkedAt: Number(row.checked_at),
    };
  }

  setReconciliation(key: string, value: JsonValue): void {
    this.db.prepare(`
      INSERT INTO reconciliation(key, value_json, reconciled_at) VALUES (?, ?, ?)
      ON CONFLICT(key) DO UPDATE SET value_json=excluded.value_json, reconciled_at=excluded.reconciled_at
    `).run(key, stableJson(value), now());
  }

  reconciliation(key: string): { value: JsonValue; reconciledAt: number } | undefined {
    const row = this.db.prepare("SELECT value_json, reconciled_at FROM reconciliation WHERE key=?").get(key) as Row | undefined;
    return row ? { value: parseJson(row.value_json), reconciledAt: Number(row.reconciled_at) } : undefined;
  }

  setEtag(key: string, etag: string | undefined, value?: JsonValue): void {
    this.db.prepare(`
      INSERT INTO github_cache(key, etag, value_json, updated_at) VALUES (?, ?, ?, ?)
      ON CONFLICT(key) DO UPDATE SET etag=excluded.etag, value_json=COALESCE(excluded.value_json, github_cache.value_json), updated_at=excluded.updated_at
    `).run(key, etag ?? null, value === undefined ? null : stableJson(value), now());
  }

  etag(key: string): string | undefined {
    const row = this.db.prepare("SELECT etag FROM github_cache WHERE key=?").get(key) as Row | undefined;
    return row?.etag === null || row?.etag === undefined ? undefined : String(row.etag);
  }

  cache(key: string): { etag?: string; value?: JsonValue; updatedAt: number } | undefined {
    const row = this.db.prepare("SELECT etag, value_json, updated_at FROM github_cache WHERE key=?").get(key) as Row | undefined;
    if (!row) return undefined;
    return {
      ...(row.etag === null ? {} : { etag: String(row.etag) }),
      ...(row.value_json === null ? {} : { value: parseJson(row.value_json) }),
      updatedAt: Number(row.updated_at),
    };
  }

  mapPty(alias: string, ptyId: string, taskId: string): void {
    const timestamp = now();
    this.transaction(() => {
      const existingAlias = this.aliasFor(ptyId, "pty", taskId);
      if (existingAlias !== undefined && existingAlias !== alias) throw new Error(`PTY ${ptyId} is already mapped as ${existingAlias}`);
      this.db.prepare("INSERT OR IGNORE INTO aliases(alias, kind, internal_id, task_id, scope, created_at) VALUES (?, 'pty', ?, ?, ?, ?)")
        .run(alias, ptyId, taskId, taskId, timestamp);
      this.db.prepare("INSERT INTO pty_sessions(alias, pty_id, task_id, cursor, status, created_at, updated_at) VALUES (?, ?, ?, 0, 'created', ?, ?)")
        .run(alias, ptyId, taskId, timestamp, timestamp);
    });
  }

  listPtys(): Array<{ alias: string; ptyId: string; taskId: string; cursor: number; status: string }> {
    return (this.db.prepare("SELECT * FROM pty_sessions ORDER BY alias").all() as Row[]).map((row) => ({
      alias: String(row.alias), ptyId: String(row.pty_id), taskId: String(row.task_id),
      cursor: Number(row.cursor), status: String(row.status),
    }));
  }

  pty(alias: string): { ptyId: string; taskId: string; cursor: number; status: string } | undefined {
    const row = this.db.prepare("SELECT * FROM pty_sessions WHERE alias=?").get(alias) as Row | undefined;
    return row ? { ptyId: String(row.pty_id), taskId: String(row.task_id), cursor: Number(row.cursor), status: String(row.status) } : undefined;
  }

  updatePty(alias: string, status: string, cursor?: number): void {
    this.db.prepare("UPDATE pty_sessions SET status=?, cursor=COALESCE(?, cursor), updated_at=? WHERE alias=?")
      .run(status, cursor ?? null, now(), alias);
  }

  appendPtyOutput(alias: string, text: string, start: number, end: number): void {
    this.transaction(() => {
      const session = this.pty(alias);
      if (!session) throw new Error(`Unknown PTY alias ${alias}`);
      if (start !== session.cursor || end !== start + text.length) throw new Error(`Non-contiguous PTY output for ${alias}`);
      this.db.prepare("INSERT INTO pty_output(alias, cursor_start, cursor_end, text, received_at) VALUES (?, ?, ?, ?, ?)")
        .run(alias, start, end, text, now());
      this.updatePty(alias, "connected", end);
    });
  }

  readPty(alias: string, after: number, limit = 32_768): { text: string; cursor: number; truncated: boolean } {
    const bounded = Math.max(1, Math.min(131_072, limit));
    const rows = this.db.prepare("SELECT cursor_start, cursor_end, text FROM pty_output WHERE alias=? AND cursor_end>? ORDER BY id").all(alias, after) as Row[];
    let text = "";
    let cursor = after;
    let truncated = false;
    for (const row of rows) {
      const chunk = String(row.text);
      const start = Number(row.cursor_start);
      const offset = Math.max(0, after - start);
      const remaining = chunk.slice(offset);
      if (text.length + remaining.length > bounded) {
        const accepted = remaining.slice(0, bounded - text.length);
        text += accepted;
        cursor = Math.max(cursor, start + offset + accepted.length);
        truncated = true;
        break;
      }
      text += remaining;
      cursor = Math.max(cursor, Number(row.cursor_end));
    }
    return { text, cursor, truncated };
  }
}
