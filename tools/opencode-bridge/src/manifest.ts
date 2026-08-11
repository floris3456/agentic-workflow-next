import { readFileSync } from "node:fs";
import type {
  CompatibilityResult,
  OperationManifest,
  OperationManifestEntry,
  OperationParameter,
  OperationPolicy,
} from "./types.js";
import { asRecord } from "./util.js";

const transports = new Set(["http", "sse", "websocket"]);
const effects = new Set(["read", "mutation", "subscribe", "consume"]);
const policies = new Set<OperationPolicy>(["read", "expert", "local-secret", "blocked-web"]);

function parseParameter(value: unknown): OperationParameter {
  const input = asRecord(value, "operation parameter");
  if (typeof input.name !== "string" || !["path", "query", "header"].includes(String(input.in))) {
    throw new TypeError("Invalid operation parameter");
  }
  return {
    name: input.name,
    in: input.in as OperationParameter["in"],
    required: input.required === true,
    style: typeof input.style === "string" ? input.style : "form",
    explode: input.explode !== false,
  };
}

function parseEntry(value: unknown): OperationManifestEntry {
  const input = asRecord(value, "manifest operation");
  if (
    typeof input.operationId !== "string" ||
    typeof input.method !== "string" ||
    typeof input.path !== "string" ||
    !transports.has(String(input.transport)) ||
    !effects.has(String(input.effect)) ||
    !policies.has(input.policy as OperationPolicy) ||
    !Array.isArray(input.parameters) ||
    !Array.isArray(input.tags) ||
    !Array.isArray(input.responseMediaTypes)
  ) throw new TypeError(`Invalid manifest operation: ${String(input.operationId)}`);
  return {
    operationId: input.operationId,
    method: input.method,
    path: input.path,
    transport: input.transport as OperationManifestEntry["transport"],
    effect: input.effect as OperationManifestEntry["effect"],
    policy: input.policy as OperationPolicy,
    tags: input.tags.map(String),
    parameters: input.parameters.map(parseParameter),
    requestMediaType: input.requestMediaType === null ? null : String(input.requestMediaType),
    responseMediaTypes: input.responseMediaTypes.map(String),
  };
}

export class Manifest {
  readonly document: OperationManifest;
  readonly operations: ReadonlyMap<string, OperationManifestEntry>;

  constructor(document: OperationManifest) {
    if (document.schemaVersion !== 1 || !Array.isArray(document.operations)) throw new TypeError("Unsupported operation manifest");
    const parsed = document.operations.map(parseEntry);
    const operations = new Map(parsed.map((entry) => [entry.operationId, entry]));
    if (operations.size !== parsed.length) throw new TypeError("Duplicate operation ID in manifest");
    this.document = { ...document, operations: parsed };
    this.operations = operations;
  }

  static load(path: string): Manifest {
    return new Manifest(JSON.parse(readFileSync(path, "utf8")) as OperationManifest);
  }

  require(operationId: string, transport?: OperationManifestEntry["transport"]): OperationManifestEntry {
    const operation = this.operations.get(operationId);
    if (!operation) throw new Error(`Unsupported OpenCode operation ID: ${operationId}`);
    if (transport && operation.transport !== transport) {
      throw new Error(`${operationId} uses ${operation.transport}, not ${transport}`);
    }
    return operation;
  }

  diagnosticAllowed(operationId: string): boolean {
    const operation = this.require(operationId);
    return operation.effect === "read" || operation.effect === "subscribe";
  }

  compare(candidate: Manifest): Pick<CompatibilityResult, "added" | "removed" | "changed"> {
    const added = [...candidate.operations.keys()].filter((id) => !this.operations.has(id)).sort();
    const removed = [...this.operations.keys()].filter((id) => !candidate.operations.has(id)).sort();
    const changed = [...this.operations.keys()].filter((id) => {
      const next = candidate.operations.get(id);
      if (!next) return false;
      const current = this.operations.get(id)!;
      return current.method !== next.method || current.path !== next.path || current.transport !== next.transport;
    }).sort();
    return { added, removed, changed };
  }
}
