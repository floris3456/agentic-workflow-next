import type {
  CommandEnvelope,
  CommandState,
  JsonValue,
  RequestEnvelope,
  RequestState,
  StoredCommand,
  StoredRequest,
} from "./types.js";
import { asJson, asRecord, sha256 } from "./util.js";

const marker = /<!--\s*agentic-bridge-command\s*\n([\s\S]*?)-->/g;
const requestMarker = /<!--\s*agentic-bridge-request\s*\n([\s\S]*?)-->/g;
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const taskId = /^[A-Za-z0-9][A-Za-z0-9._-]{0,127}$/;
const allowedKinds = new Set([
  "start",
  "workspace.start",
  "status",
  "steer",
  "route",
  "permission.reply",
  "question.reply",
  "abort",
  "events.page",
  "pty.create",
  "pty.input",
  "pty.read",
  "pty.resize",
  "pty.remove",
  "finalize",
  "sync.recover",
  "promotion.apply",
  "opencode.request",
]);
const allowedRequestKinds = new Set(["command.status", "task.status", "scout.start", "scout.status"]);

export type ScannedCommand =
  | { valid: true; envelope: CommandEnvelope; markerHash: string }
  | { valid: false; error: string; markerHash: string };

export type ScannedRequest =
  | { valid: true; envelope: RequestEnvelope; markerHash: string }
  | { valid: false; error: string; markerHash: string };

export function isTaskStartKind(kind: string): boolean {
  return kind === "start" || kind === "workspace.start";
}

function rejectUnknownKeys(record: Record<string, unknown>, allowed: Set<string>, label: string): void {
  const unknown = Object.keys(record).filter((key) => !allowed.has(key));
  if (unknown.length > 0) throw new TypeError(`${label} contains unknown field ${unknown[0]}`);
}

function validRef(value: string): boolean {
  if (value.length === 0 || value.length > 255 || value === "@" || value.startsWith("/") || value.endsWith("/") || value.endsWith(".")) return false;
  if (value.includes("..") || value.includes("@{") || value.includes("//") || /[\x00-\x20\x7f~^:?*\[\\]/.test(value)) return false;
  return value.split("/").every((part) => part.length > 0 && !part.startsWith(".") && !part.endsWith(".lock"));
}

function safePublicText(value: string): string {
  return value.replace(/[\r\n]+/g, " ").replace(/[@<>`]/g, "?").slice(0, 500);
}

export function parseCommandEnvelope(value: unknown): CommandEnvelope {
  const input = asRecord(value, "command envelope");
  rejectUnknownKeys(input, new Set(["protocol", "sequence", "command_id", "task_id", "kind", "arguments", "expected"]), "Command envelope");
  if (input.protocol !== "agentic-bridge/1") throw new TypeError("Unsupported bridge protocol");
  if (!Number.isSafeInteger(input.sequence) || Number(input.sequence) < 1) throw new TypeError("Command sequence must be a positive safe integer");
  if (typeof input.command_id !== "string" || !uuid.test(input.command_id)) throw new TypeError("Command ID must be a UUID");
  if (typeof input.task_id !== "string" || !taskId.test(input.task_id)) throw new TypeError("Task ID is invalid");
  if (typeof input.kind !== "string" || !allowedKinds.has(input.kind)) throw new TypeError("Command kind is unsupported");
  const argumentsRecord = asRecord(input.arguments, "command arguments");
  let expected: CommandEnvelope["expected"];
  if (input.expected !== undefined) {
    const candidate = asRecord(input.expected, "command expected guard");
    rejectUnknownKeys(candidate, new Set(["developer_sha", "template_development_sha", "ref"]), "Command expected guard");
    if (candidate.developer_sha !== undefined && (typeof candidate.developer_sha !== "string" || !/^[0-9a-f]{40}$/.test(candidate.developer_sha))) {
      throw new TypeError("Expected developer SHA must be 40 lowercase hexadecimal characters");
    }
    if (candidate.template_development_sha !== undefined
      && (typeof candidate.template_development_sha !== "string" || !/^[0-9a-f]{40}$/.test(candidate.template_development_sha))) {
      throw new TypeError("Expected template-development SHA must be 40 lowercase hexadecimal characters");
    }
    if (candidate.ref !== undefined && (typeof candidate.ref !== "string" || !validRef(candidate.ref))) {
      throw new TypeError("Expected ref is invalid");
    }
    expected = {
      ...(candidate.developer_sha === undefined ? {} : { developer_sha: candidate.developer_sha as string }),
      ...(candidate.template_development_sha === undefined
        ? {}
        : { template_development_sha: candidate.template_development_sha as string }),
      ...(candidate.ref === undefined ? {} : { ref: candidate.ref as string }),
    };
  }
  return {
    protocol: "agentic-bridge/1",
    sequence: Number(input.sequence),
    command_id: input.command_id,
    task_id: input.task_id,
    kind: input.kind,
    arguments: asJson(argumentsRecord) as Record<string, JsonValue>,
    ...(expected === undefined ? {} : { expected }),
  };
}

export function parseRequestEnvelope(value: unknown): RequestEnvelope {
  const input = asRecord(value, "bridge request envelope");
  rejectUnknownKeys(input, new Set(["protocol", "request_id", "task_id", "kind", "arguments"]), "Bridge request envelope");
  if (input.protocol !== "agentic-bridge/1") throw new TypeError("Unsupported bridge protocol");
  if (typeof input.request_id !== "string" || !uuid.test(input.request_id)) throw new TypeError("Request ID must be a UUID");
  if (typeof input.task_id !== "string" || !taskId.test(input.task_id)) throw new TypeError("Task ID is invalid");
  if (typeof input.kind !== "string" || !allowedRequestKinds.has(input.kind)) throw new TypeError("Bridge request kind is unsupported");
  const argumentsRecord = asRecord(input.arguments, "bridge request arguments");
  if (input.kind === "command.status") {
    rejectUnknownKeys(argumentsRecord, new Set(["command_id"]), "command.status arguments");
    if (typeof argumentsRecord.command_id !== "string" || !uuid.test(argumentsRecord.command_id)) {
      throw new TypeError("command.status command_id must be a UUID");
    }
  } else if (input.kind === "task.status") {
    rejectUnknownKeys(argumentsRecord, new Set(), "task.status arguments");
  } else if (input.kind === "scout.start") {
    rejectUnknownKeys(argumentsRecord, new Set(["question", "ref", "scope", "expected_evidence"]), "scout.start arguments");
    for (const [name, maximum] of [["question", 4_000], ["scope", 2_000], ["expected_evidence", 2_000]] as const) {
      const text = argumentsRecord[name];
      if (typeof text !== "string" || text.trim().length === 0 || text.length > maximum) {
        throw new TypeError(`scout.start ${name} must be a non-empty string of at most ${maximum} characters`);
      }
    }
    if (typeof argumentsRecord.ref !== "string" || !/^[0-9a-f]{40}$/.test(argumentsRecord.ref)) {
      throw new TypeError("scout.start ref must be an exact 40-character lowercase commit SHA");
    }
  } else {
    rejectUnknownKeys(argumentsRecord, new Set(["scout_request_id"]), "scout.status arguments");
    if (typeof argumentsRecord.scout_request_id !== "string" || !uuid.test(argumentsRecord.scout_request_id)) {
      throw new TypeError("scout.status scout_request_id must be a UUID");
    }
  }
  return {
    protocol: "agentic-bridge/1",
    request_id: input.request_id,
    task_id: input.task_id,
    kind: input.kind as RequestEnvelope["kind"],
    arguments: asJson(argumentsRecord) as Record<string, JsonValue>,
  };
}

export function scanCommandEnvelopes(markdown: string): ScannedCommand[] {
  if (Buffer.byteLength(markdown, "utf8") > 1_000_000) throw new Error("GitHub command source exceeds the bridge scan limit");
  const results: ScannedCommand[] = [];
  for (const match of markdown.matchAll(marker)) {
    const raw = match[1] ?? "";
    const markerHash = sha256(raw);
    if (Buffer.byteLength(raw, "utf8") > 65_536) {
      results.push({ valid: false, error: "Command envelope exceeds 65536 bytes", markerHash });
      continue;
    }
    try {
      results.push({ valid: true, envelope: parseCommandEnvelope(JSON.parse(raw) as unknown), markerHash });
    } catch (error) {
      results.push({ valid: false, error: error instanceof Error ? error.message : "Invalid command envelope", markerHash });
    }
  }
  return results;
}

export function scanRequestEnvelopes(markdown: string): ScannedRequest[] {
  if (Buffer.byteLength(markdown, "utf8") > 1_000_000) throw new Error("GitHub request source exceeds the bridge scan limit");
  const results: ScannedRequest[] = [];
  for (const match of markdown.matchAll(requestMarker)) {
    const raw = match[1] ?? "";
    const markerHash = sha256(raw);
    if (Buffer.byteLength(raw, "utf8") > 65_536) {
      results.push({ valid: false, error: "Bridge request envelope exceeds 65536 bytes", markerHash });
      continue;
    }
    try {
      results.push({ valid: true, envelope: parseRequestEnvelope(JSON.parse(raw) as unknown), markerHash });
    } catch (error) {
      results.push({ valid: false, error: error instanceof Error ? error.message : "Invalid bridge request envelope", markerHash });
    }
  }
  return results;
}

export function commandStatusComment(command: Pick<StoredCommand, "commandId" | "taskId" | "sequence" | "state">, detail?: string): string {
  const state: CommandState = command.state;
  const machine = {
    protocol: "agentic-bridge/1",
    command_id: command.commandId,
    task_id: command.taskId,
    sequence: command.sequence,
    state,
  };
  const safeDetail = detail ? safePublicText(detail) : undefined;
  return `<!-- agentic-bridge-status\n${JSON.stringify(machine)}\n-->\nBridge command \`${command.commandId}\` is **${state}**${safeDetail ? `: ${safeDetail}` : "."}`;
}

export function invalidCommandComment(markerHash: string, detail: string): string {
  const machine = { protocol: "agentic-bridge/1", marker_hash: markerHash, state: "rejected" };
  const safeDetail = safePublicText(detail);
  return `<!-- agentic-bridge-status\n${JSON.stringify(machine)}\n-->\nBridge command was **rejected**: ${safeDetail}`;
}

export function requestStatusComment(
  request: Pick<StoredRequest, "requestId" | "taskId" | "kind" | "state">,
  detail?: string,
): string {
  const state: RequestState = request.state;
  const machine = {
    protocol: "agentic-bridge/1",
    request_id: request.requestId,
    task_id: request.taskId,
    kind: request.kind,
    state,
  };
  const safeDetail = detail ? safePublicText(detail) : undefined;
  return `<!-- agentic-bridge-request-status\n${JSON.stringify(machine)}\n-->\nBridge request \`${request.requestId}\` is **${state}**${safeDetail ? `: ${safeDetail}` : "."}`;
}

export function invalidRequestComment(markerHash: string, detail: string): string {
  const machine = { protocol: "agentic-bridge/1", marker_hash: markerHash, state: "rejected" };
  return `<!-- agentic-bridge-request-status\n${JSON.stringify(machine)}\n-->\nBridge request was **rejected**: ${safePublicText(detail)}`;
}
