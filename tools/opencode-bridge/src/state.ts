import { chmodSync, existsSync, lstatSync } from "node:fs";
import { DatabaseSync } from "node:sqlite";
import type {
  AcceptedCommand,
  CommandEnvelope,
  CommandState,
  CompatibilityResult,
  JsonValue,
  OutboxItem,
  StoredCommand,
  TaskSession,
} from "./types.js";
import { asJson, ensureParent, now, stableJson } from "./util.js";

type Row = Record<string, unknown>;
const taskBoundAliasKinds = new Set(["session", "pty", "permission", "question", "message", "part", "event"]);

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
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL
      );
      CREATE TABLE IF NOT EXISTS issue_tasks (
        issue_number INTEGER PRIMARY KEY,
        task_id TEXT NOT NULL UNIQUE,
        updated_at INTEGER NOT NULL
      );
      CREATE TABLE IF NOT EXISTS aliases (
        alias TEXT PRIMARY KEY,
        kind TEXT NOT NULL,
        internal_id TEXT NOT NULL UNIQUE,
        task_id TEXT,
        created_at INTEGER NOT NULL
      );
      CREATE TABLE IF NOT EXISTS events (
        journal_id INTEGER PRIMARY KEY AUTOINCREMENT,
        event_key TEXT NOT NULL UNIQUE,
        source TEXT NOT NULL,
        event_type TEXT NOT NULL,
        task_id TEXT,
        session_id TEXT,
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
    `);
    this.setMeta("schema_version", "1");
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
      const sameSequence = this.db.prepare("SELECT * FROM commands WHERE task_id=? AND sequence=?").get(envelope.task_id, envelope.sequence) as Row | undefined;
      if (sameSequence) return { disposition: "conflict", command: commandFromRow(sameSequence) };
      const latest = this.db.prepare("SELECT last_sequence FROM task_sequences WHERE task_id=?").get(envelope.task_id) as Row | undefined;
      const timestamp = now();
      const stale = latest !== undefined && envelope.sequence <= Number(latest.last_sequence);
      const state: CommandState = stale ? "rejected" : "accepted";
      const error = stale ? `Stale sequence ${envelope.sequence}; latest is ${String(latest?.last_sequence)}` : null;
      this.db.prepare(`
        INSERT INTO commands(command_id, task_id, sequence, issue_number, kind, envelope_json, state, error, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(envelope.command_id, envelope.task_id, envelope.sequence, issueNumber, envelope.kind, serialized, state, error, timestamp, timestamp);
      if (!stale) {
        this.db.prepare(`
          INSERT INTO task_sequences(task_id, last_sequence, updated_at) VALUES (?, ?, ?)
          ON CONFLICT(task_id) DO UPDATE SET last_sequence=excluded.last_sequence, updated_at=excluded.updated_at
        `).run(envelope.task_id, envelope.sequence, timestamp);
      }
      const command = this.getCommand(envelope.command_id)!;
      return { disposition: stale ? "stale" : "new", command };
    });
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
      this.db.prepare(`
        INSERT INTO task_sessions(task_id, session_id, issue_number, agent, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?)
        ON CONFLICT(task_id) DO UPDATE SET session_id=excluded.session_id, issue_number=excluded.issue_number,
          agent=excluded.agent, updated_at=excluded.updated_at
      `).run(taskId, sessionId, issueNumber, agent, timestamp, timestamp);
      this.db.prepare(`
        INSERT INTO issue_tasks(issue_number, task_id, updated_at) VALUES (?, ?, ?)
        ON CONFLICT(task_id) DO UPDATE SET issue_number=excluded.issue_number, updated_at=excluded.updated_at
      `).run(issueNumber, taskId, timestamp);
    });
  }

  getTaskSession(taskId: string): TaskSession | undefined {
    const row = this.db.prepare("SELECT * FROM task_sessions WHERE task_id=?").get(taskId) as Row | undefined;
    if (!row) return undefined;
    return {
      taskId: String(row.task_id),
      sessionId: String(row.session_id),
      issueNumber: Number(row.issue_number),
      agent: String(row.agent),
      createdAt: Number(row.created_at),
      updatedAt: Number(row.updated_at),
    };
  }

  taskSessionForInternal(sessionId: string): TaskSession | undefined {
    const row = this.db.prepare("SELECT * FROM task_sessions WHERE session_id=?").get(sessionId) as Row | undefined;
    if (!row) return undefined;
    return {
      taskId: String(row.task_id),
      sessionId: String(row.session_id),
      issueNumber: Number(row.issue_number),
      agent: String(row.agent),
      createdAt: Number(row.created_at),
      updatedAt: Number(row.updated_at),
    };
  }

  taskForIssue(issueNumber: number): string | undefined {
    const row = this.db.prepare("SELECT task_id FROM issue_tasks WHERE issue_number=?").get(issueNumber) as Row | undefined;
    return row ? String(row.task_id) : undefined;
  }

  issueForTask(taskId: string): number | undefined {
    const row = this.db.prepare("SELECT issue_number FROM issue_tasks WHERE task_id=?").get(taskId) as Row | undefined;
    return row ? Number(row.issue_number) : undefined;
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
    return (this.db.prepare("SELECT * FROM task_sessions ORDER BY task_id").all() as Row[]).map((row) => ({
      taskId: String(row.task_id), sessionId: String(row.session_id), issueNumber: Number(row.issue_number),
      agent: String(row.agent), createdAt: Number(row.created_at), updatedAt: Number(row.updated_at),
    }));
  }

  listCommands(states?: CommandState[]): StoredCommand[] {
    if (!states || states.length === 0) {
      return (this.db.prepare("SELECT * FROM commands ORDER BY created_at, command_id").all() as Row[]).map(commandFromRow);
    }
    const placeholders = states.map(() => "?").join(",");
    return (this.db.prepare(`SELECT * FROM commands WHERE state IN (${placeholders}) ORDER BY created_at, command_id`).all(...states) as Row[]).map(commandFromRow);
  }

  updateTaskAgent(taskId: string, agent: string): void {
    this.db.prepare("UPDATE task_sessions SET agent=?, updated_at=? WHERE task_id=?").run(agent, now(), taskId);
  }

  ensureAlias(kind: string, internalId: string, taskId?: string): string {
    const existing = this.db.prepare("SELECT alias, task_id FROM aliases WHERE internal_id=?").get(internalId) as Row | undefined;
    if (existing) {
      if (taskId && taskBoundAliasKinds.has(kind) && existing.task_id === null) {
        this.db.prepare("UPDATE aliases SET task_id=? WHERE internal_id=? AND task_id IS NULL").run(taskId, internalId);
      }
      return String(existing.alias);
    }
    const count = this.db.prepare("SELECT COUNT(*) AS count FROM aliases WHERE kind=?").get(kind) as Row;
    const alias = `${kind}-${Number(count.count) + 1}`;
    this.db.prepare("INSERT INTO aliases(alias, kind, internal_id, task_id, created_at) VALUES (?, ?, ?, ?, ?)").run(alias, kind, internalId, taskId ?? null, now());
    return alias;
  }

  resolveAlias(alias: string, expectedKind?: string, taskId?: string): string {
    const row = this.db.prepare("SELECT kind, internal_id, task_id FROM aliases WHERE alias=?").get(alias) as Row | undefined;
    if (!row) throw new Error(`Unknown local alias ${alias}`);
    if (expectedKind && row.kind !== expectedKind) throw new Error(`${alias} is ${String(row.kind)}, not ${expectedKind}`);
    if (taskId && taskBoundAliasKinds.has(String(row.kind)) && row.task_id !== taskId) throw new Error(`${alias} is not available to task ${taskId}`);
    return String(row.internal_id);
  }

  aliasFor(internalId: string): string | undefined {
    const row = this.db.prepare("SELECT alias FROM aliases WHERE internal_id=?").get(internalId) as Row | undefined;
    return row ? String(row.alias) : undefined;
  }

  recordEvent(input: {
    eventKey: string; source: string; eventType: string; payload: JsonValue; taskId?: string; sessionId?: string;
    aggregateId?: string; durableSeq?: number;
  }): boolean {
    const result = this.db.prepare(`
      INSERT OR IGNORE INTO events(event_key, source, event_type, task_id, session_id, payload_json, aggregate_id, durable_seq, received_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(input.eventKey, input.source, input.eventType, input.taskId ?? null, input.sessionId ?? null, stableJson(input.payload), input.aggregateId ?? null, input.durableSeq ?? null, now());
    if (result.changes === 0) {
      this.db.prepare(`
        UPDATE events SET task_id=COALESCE(task_id, ?), session_id=COALESCE(session_id, ?),
          aggregate_id=COALESCE(aggregate_id, ?), durable_seq=COALESCE(durable_seq, ?)
        WHERE event_key=?
      `).run(input.taskId ?? null, input.sessionId ?? null, input.aggregateId ?? null, input.durableSeq ?? null, input.eventKey);
    }
    if (input.aggregateId && input.durableSeq !== undefined) this.setDurableCursor(input.source, input.aggregateId, input.durableSeq);
    return result.changes > 0;
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
      const existingAlias = this.aliasFor(ptyId);
      if (existingAlias !== undefined && existingAlias !== alias) throw new Error(`PTY ${ptyId} is already mapped as ${existingAlias}`);
      this.db.prepare("INSERT OR IGNORE INTO aliases(alias, kind, internal_id, task_id, created_at) VALUES (?, 'pty', ?, ?, ?)").run(alias, ptyId, taskId, timestamp);
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
