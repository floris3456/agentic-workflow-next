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

export interface RequestEnvelope {
  protocol: "agentic-bridge/1";
  request_id: string;
  task_id: string;
  kind: "command.status" | "task.status" | "scout.start" | "scout.status";
  arguments: Record<string, JsonValue>;
}

export type RequestState = "accepted" | "applying" | "succeeded" | "failed" | "indeterminate";

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
  disposition: "new" | "duplicate" | "stale" | "conflict" | "rejected";
  command?: StoredCommand;
  reason?: string;
}

export interface StoredRequest {
  requestId: string;
  taskId: string;
  issueNumber: number;
  kind: RequestEnvelope["kind"];
  envelope: RequestEnvelope;
  state: RequestState;
  rawResult?: JsonValue;
  publicResult?: JsonValue;
  error?: string;
  createdAt: number;
  updatedAt: number;
}

export interface AcceptedRequest {
  disposition: "new" | "duplicate" | "conflict";
  request: StoredRequest;
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
  sessionState: string;
  latestResponse?: JsonValue;
  latestEventId?: string;
  createdAt: number;
  updatedAt: number;
}

export interface ScoutSession {
  requestId: string;
  taskId: string;
  sessionId: string;
  issueNumber: number;
  refSha: string;
  workspacePath: string;
  sessionState: string;
  latestResponse?: JsonValue;
  latestEventId?: string;
  createdAt: number;
  updatedAt: number;
}

export interface SessionBinding {
  taskId: string;
  sessionId: string;
  sessionKind: "developer" | "scout";
  requestId?: string;
}

export interface ResponseDelivery {
  eventId: string;
  taskId: string;
  sessionId: string;
  issueNumber: number;
  eventType: string;
  deliveryKind: "developer" | "scout";
  requestId?: string;
  attempts: number;
  createdAt: number;
  updatedAt: number;
}

export interface ResponseDeliveryInput {
  eventId: string;
  taskId: string;
  sessionId: string;
  issueNumber: number;
  eventType: string;
  deliveryKind?: "developer" | "scout";
  requestId?: string;
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
