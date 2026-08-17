import { isAbsolute } from "node:path";
import { Manifest } from "./manifest.js";
import { BridgeState } from "./state.js";
import type { JsonValue, OperationArguments, OperationManifestEntry } from "./types.js";
import { asJson, isRecord } from "./util.js";

const privateIdPatterns: Array<[RegExp, string]> = [
  [/^ses[_-][A-Za-z0-9_-]+$/, "session"],
  [/^pty[_-][A-Za-z0-9_-]+$/, "pty"],
  [/^per[_-][A-Za-z0-9_-]+$/, "permission"],
  [/^que[_-][A-Za-z0-9_-]+$/, "question"],
  [/^msg[_-][A-Za-z0-9_-]+$/, "message"],
  [/^prt[_-][A-Za-z0-9_-]+$/, "part"],
  [/^wrk[_-][A-Za-z0-9_-]+$/, "workspace"],
  [/^evt[_-][A-Za-z0-9_-]+$/, "event"],
];
const embeddedPrivateIdPatterns: Array<[RegExp, string]> = [
  [/(^|[^A-Za-z0-9_-])(ses[_-][A-Za-z0-9_-]+)/g, "session"],
  [/(^|[^A-Za-z0-9_-])(pty[_-][A-Za-z0-9_-]+)/g, "pty"],
  [/(^|[^A-Za-z0-9_-])(per[_-][A-Za-z0-9_-]+)/g, "permission"],
  [/(^|[^A-Za-z0-9_-])(que[_-][A-Za-z0-9_-]+)/g, "question"],
  [/(^|[^A-Za-z0-9_-])(msg[_-][A-Za-z0-9_-]+)/g, "message"],
  [/(^|[^A-Za-z0-9_-])(prt[_-][A-Za-z0-9_-]+)/g, "part"],
  [/(^|[^A-Za-z0-9_-])(wrk[_-][A-Za-z0-9_-]+)/g, "workspace"],
  [/(^|[^A-Za-z0-9_-])(evt[_-][A-Za-z0-9_-]+)/g, "event"],
];
const sensitiveKey = /(authorization|cookie|credential|jwt|password|private.?key|secret|token|api.?key|^key$)/i;
const nonPublicKeys = new Set([
  "metadata",
  "providermetadata",
  "reasoning",
  "reasoningcontent",
  "reasoningencryptedcontent",
  "encryptedcontent",
  "thinking",
  "chainofthought",
]);
const semanticPrivateIdKinds = new Map([
  ["projectid", "project"],
]);
const secretText = [
  /-----BEGIN [A-Z ]*PRIVATE KEY-----[\s\S]*?-----END [A-Z ]*PRIVATE KEY-----/g,
  /\bgh(?:p|o|u|s|r)_[A-Za-z0-9_]{20,}\b/g,
  /\bgithub_pat_[A-Za-z0-9_]{20,}\b/g,
  /\bsk-[A-Za-z0-9_-]{16,}\b/g,
  /\bAKIA[0-9A-Z]{16}\b/g,
  /\bxox[baprs]-[A-Za-z0-9-]{10,}\b/g,
  /\b(?:Bearer|Basic)\s+[A-Za-z0-9._~+/=-]+/gi,
  /\beyJ[A-Za-z0-9_-]+\.eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\b/g,
  /\b(?:password|secret|token|api[_-]?key)\s*[:=]\s*[^\s,;]+/gi,
];

function privateIdKind(value: string): string | undefined {
  return privateIdPatterns.find(([pattern]) => pattern.test(value))?.[1];
}

function normalizedKey(value: string): string {
  return value.replace(/[^A-Za-z0-9]/g, "").toLowerCase();
}

function nonPublicMessagePart(value: Record<string, JsonValue>): boolean {
  const type = typeof value.type === "string" ? value.type.toLowerCase() : undefined;
  if (type === "reasoning" || type === "thinking" || type === "analysis") return true;
  const messagePart = Object.hasOwn(value, "messageID") || Object.hasOwn(value, "messageId") || Object.hasOwn(value, "message_id");
  return messagePart && type !== undefined && type !== "text";
}

function redactText(value: string, roots: readonly string[]): string {
  let output = value;
  for (const root of roots) {
    if (root.length > 1) output = output.split(root).join("[local-path]");
  }
  output = output
    .replace(/\bfile:\/\/(?:\/[A-Za-z0-9._~!$&'()*+,;=:@%-]+)+/g, "[local-url]")
    .replace(/(?:^|[\s"'(=])(?:\/(?!\/)[A-Za-z0-9._~!$&'()*+,;=:@%+-]+(?:\/[A-Za-z0-9._~!$&'()*+,;=:@%+-]+)+|[A-Za-z]:\\[^\s"']+)/g, (match) => `${match[0]?.match(/[\s"'(=]/) ? match[0] : ""}[local-path]`);
  for (const pattern of secretText) output = output.replace(pattern, "[redacted]");
  return output;
}

function escapedJson(value: JsonValue): string {
  return JSON.stringify(value, null, 2)
    .replaceAll("`", "\\u0060")
    .replaceAll("<", "\\u003c")
    .replaceAll(">", "\\u003e")
    .replaceAll("@", "\\u0040");
}

export interface PublicProjectionOptions {
  state: BridgeState;
  privateRoots?: string[];
  maxBytes?: number;
  maxStringLength?: number;
  maxCollectionEntries?: number;
  maxDepth?: number;
}

export class PublicProjection {
  private readonly state: BridgeState;
  private readonly roots: string[];
  private readonly maxBytes: number;
  private readonly maxStringLength: number;
  private readonly maxCollectionEntries: number;
  private readonly maxDepth: number;

  constructor(options: PublicProjectionOptions) {
    this.state = options.state;
    this.roots = [...new Set(options.privateRoots ?? [])].sort((left, right) => right.length - left.length);
    this.maxBytes = options.maxBytes ?? 24_000;
    this.maxStringLength = options.maxStringLength ?? 4_000;
    this.maxCollectionEntries = options.maxCollectionEntries ?? 50;
    this.maxDepth = options.maxDepth ?? 8;
  }

  private sanitize(value: JsonValue, taskId: string | undefined, depth: number): JsonValue | undefined {
    if (depth > this.maxDepth) return "[truncated-depth]";
    if (typeof value === "string") {
      const text = redactText(this.aliasPrivateIds(value, taskId), this.roots);
      return text.length > this.maxStringLength ? `${text.slice(0, this.maxStringLength)}[truncated]` : text;
    }
    if (value === null || typeof value !== "object") return value;
    if (Array.isArray(value)) {
      const projected = value.slice(0, this.maxCollectionEntries)
        .map((entry) => this.sanitize(entry, taskId, depth + 1))
        .filter((entry): entry is JsonValue => entry !== undefined);
      const truncated = value.length - Math.min(value.length, this.maxCollectionEntries);
      if (truncated > 0) projected.push({ truncated_items: truncated });
      return projected;
    }
    if (nonPublicMessagePart(value)) return undefined;
    const entries = Object.entries(value);
    const projected: Record<string, JsonValue> = {};
    for (const [key, entry] of entries.slice(0, this.maxCollectionEntries)) {
      const normalized = normalizedKey(key);
      if (nonPublicKeys.has(normalized)) continue;
      const kind = privateIdKind(key);
      const publicKey = kind ? this.state.ensureAlias(kind, key, taskId) : redactText(this.aliasPrivateIds(key, taskId), this.roots).slice(0, 200);
      if (sensitiveKey.test(key)) {
        projected[publicKey] = "[redacted]";
        continue;
      }
      const semanticKind = semanticPrivateIdKinds.get(normalized);
      if (semanticKind && typeof entry === "string" && entry.length > 0) {
        projected[publicKey] = this.state.ensureAlias(semanticKind, entry, taskId);
        continue;
      }
      const child = this.sanitize(entry, taskId, depth + 1);
      if (child !== undefined) projected[publicKey] = child;
    }
    if (entries.length > this.maxCollectionEntries) projected.truncated_fields = entries.length - this.maxCollectionEntries;
    return projected;
  }

  private aliasPrivateIds(value: string, taskId: string | undefined): string {
    let output = value;
    for (const [pattern, kind] of embeddedPrivateIdPatterns) {
      output = output.replace(pattern, (_match, prefix: string, internalId: string) => `${prefix}${this.state.ensureAlias(kind, internalId, taskId)}`);
    }
    return output;
  }

  project(value: JsonValue | undefined, taskId?: string): JsonValue {
    const projected = this.sanitize(value ?? null, taskId, 0) ?? { retained_locally: true, omitted: true, reason: "Result is not public projection content" };
    if (Buffer.byteLength(JSON.stringify(projected), "utf8") <= this.maxBytes) return projected;
    return { retained_locally: true, truncated: true, reason: "Projected result exceeds the GitHub publication limit" };
  }

  addPrivateRoot(root: string): void {
    if (root.length <= 1 || this.roots.includes(root)) return;
    this.roots.push(root);
    this.roots.sort((left, right) => right.length - left.length);
  }

  safeText(value: string, taskId?: string): string {
    return redactText(this.aliasPrivateIds(value, taskId), this.roots).replace(/[\r\n]+/g, " ").replace(/[@<>`]/g, "?").slice(0, 500);
  }

  comment(value: JsonValue): string {
    return `Public-safe result:\n\n\`\`\`json\n${escapedJson(value)}\n\`\`\``;
  }
}

export interface OperationPolicyOptions {
  manifest: Manifest;
  state: BridgeState;
  allowedMutations?: string[];
  allowedLocalSecretOperations?: string[];
  resolveSecret?: (reference: string) => string;
}

function assertPublicInput(value: JsonValue, key?: string): void {
  if (typeof value === "string") {
    if (privateIdKind(value)) throw new Error("Raw OpenCode identifiers are not accepted; use a local alias");
    if (isAbsolute(value) || /^[A-Za-z]:\\/.test(value)) throw new Error("Absolute local paths are not accepted from GitHub");
    if (sensitiveKey.test(key ?? "") || secretText.some((pattern) => {
      pattern.lastIndex = 0;
      return pattern.test(value);
    })) throw new Error("Literal secret-like values are not accepted from GitHub; use secret_ref");
    return;
  }
  if (value === null || typeof value !== "object") return;
  if (Array.isArray(value)) {
    value.forEach((entry) => assertPublicInput(entry, key));
    return;
  }
  if ("secret_ref" in value || "alias" in value) return;
  for (const [childKey, entry] of Object.entries(value)) assertPublicInput(entry, childKey);
}

function resolveReferences(
  value: JsonValue,
  state: BridgeState,
  resolveSecret: ((reference: string) => string) | undefined,
  taskId: string | undefined,
): JsonValue {
  if (value === null || typeof value !== "object") return value;
  if (Array.isArray(value)) return value.map((entry) => resolveReferences(entry, state, resolveSecret, taskId));
  if (Object.keys(value).length === 1 && typeof value.alias === "string") return state.resolveAlias(value.alias, undefined, taskId);
  if (Object.keys(value).length === 1 && typeof value.secret_ref === "string") {
    if (!resolveSecret) throw new Error("No local secret resolver is configured");
    return resolveSecret(value.secret_ref);
  }
  if ("alias" in value || "secret_ref" in value) throw new Error("alias and secret_ref objects cannot contain other fields");
  return Object.fromEntries(Object.entries(value).map(([key, entry]) => [key, resolveReferences(entry, state, resolveSecret, taskId)]));
}

function containsSecretReference(value: JsonValue): boolean {
  if (value === null || typeof value !== "object") return false;
  if (Array.isArray(value)) return value.some(containsSecretReference);
  return "secret_ref" in value || Object.values(value).some(containsSecretReference);
}

function assertLocalRouting(args: OperationArguments): void {
  if (!isRecord(args.query)) return;
  for (const name of ["directory", "workspace", "location"]) {
    if (Object.hasOwn(args.query, name)) throw new Error(`Generic request ${name} routing is controlled by the local bridge`);
  }
}

export class OperationPolicy {
  private readonly manifest: Manifest;
  private readonly state: BridgeState;
  private readonly allowedMutations: Set<string>;
  private readonly allowedLocalSecretOperations: Set<string>;
  private readonly resolveSecret: ((reference: string) => string) | undefined;

  constructor(options: OperationPolicyOptions) {
    this.manifest = options.manifest;
    this.state = options.state;
    this.allowedMutations = new Set(options.allowedMutations ?? []);
    this.allowedLocalSecretOperations = new Set(options.allowedLocalSecretOperations ?? []);
    this.resolveSecret = options.resolveSecret;
    for (const operationId of this.allowedMutations) {
      const operation = this.manifest.require(operationId, "http");
      if (operation.policy !== "expert" || operation.effect === "read" || operation.effect === "subscribe") throw new Error(`${operationId} is not an expert mutation`);
    }
    for (const operationId of this.allowedLocalSecretOperations) {
      if (this.manifest.require(operationId, "http").policy !== "local-secret") throw new Error(`${operationId} is not a local-secret operation`);
    }
  }

  prepare(operationId: string, args: OperationArguments, taskId?: string): { operation: OperationManifestEntry; args: OperationArguments } {
    const operation = this.manifest.require(operationId, "http");
    if (operation.policy === "blocked-web") throw new Error(`${operationId} is blocked from the GitHub transport`);
    if (operation.policy === "expert" && !this.allowedMutations.has(operationId)) throw new Error(`${operationId} is not in the configured web mutation allowlist`);
    if (operation.policy === "local-secret" && !this.allowedLocalSecretOperations.has(operationId)) {
      throw new Error(`${operationId} is not in the configured local-secret operation allowlist`);
    }
    const publicArgs = asJson(args) as OperationArguments;
    assertLocalRouting(publicArgs);
    assertPublicInput(publicArgs as JsonValue);
    if (operation.policy !== "local-secret" && containsSecretReference(publicArgs as JsonValue)) {
      throw new Error("secret_ref is accepted only for local-secret operations");
    }
    const resolved = resolveReferences(publicArgs as JsonValue, this.state, this.resolveSecret, taskId) as OperationArguments;
    return { operation, args: resolved };
  }
}
