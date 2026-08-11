export type JsonPrimitive = string | number | boolean | null;
export type JsonValue = JsonPrimitive | JsonValue[] | { [key: string]: JsonValue };

export type OperationTransport = "http" | "sse" | "websocket";
export type OperationEffect = "read" | "mutation" | "subscribe" | "consume";
export type OperationPolicy = "read" | "expert" | "local-secret" | "blocked-web";

export interface OperationParameter {
  name: string;
  in: "path" | "query" | "header";
  required: boolean;
  style: string;
  explode: boolean;
}

export interface OperationManifestEntry {
  operationId: string;
  method: string;
  path: string;
  transport: OperationTransport;
  effect: OperationEffect;
  policy: OperationPolicy;
  tags: string[];
  parameters: OperationParameter[];
  requestMediaType: string | null;
  responseMediaTypes: string[];
}

export interface OperationManifest {
  schemaVersion: number;
  source: {
    opencodeVersion: string;
    sdkVersion: string;
    sdkIntegrity: string;
    upstreamCommit: string;
    openapiSha256: string;
  };
  operations: OperationManifestEntry[];
}

export interface OperationArguments {
  path?: Record<string, JsonValue>;
  query?: Record<string, JsonValue>;
  wildcard?: string;
  body?: JsonValue;
}

export interface CommandEnvelope {
  protocol: "agentic-bridge/1";
  sequence: number;
  command_id: string;
  task_id: string;
  kind: string;
  arguments: Record<string, JsonValue>;
  expected?: {
    developer_sha?: string;
    ref?: string;
  };
}

export type CommandState = "accepted" | "applying" | "succeeded" | "failed" | "rejected" | "indeterminate";

export interface StoredCommand {
  commandId: string;
  taskId: string;
  sequence: number;
  issueNumber: number;
  kind: string;
  envelope: CommandEnvelope;
  state: CommandState;
  rawResult?: JsonValue;
  publicResult?: JsonValue;
  error?: string;
  createdAt: number;
  updatedAt: number;
}

export interface AcceptedCommand {
  disposition: "new" | "duplicate" | "stale" | "conflict";
  command: StoredCommand;
}

export interface SseEvent {
  id?: string;
  event?: string;
  data: unknown;
  retry?: number;
}

export interface CompatibilityResult {
  compatible: boolean;
  runningVersion: string;
  expectedVersion: string;
  actualHash: string;
  expectedHash: string;
  added: string[];
  removed: string[];
  changed: string[];
}

export interface TaskSession {
  taskId: string;
  sessionId: string;
  issueNumber: number;
  agent: string;
  createdAt: number;
  updatedAt: number;
}

export interface OutboxItem {
  id: number;
  dedupeKey: string;
  kind: string;
  issueNumber: number;
  payload: JsonValue;
  attempts: number;
  nextAttemptAt: number;
}
