import { createHash } from "node:crypto";
import { chmodSync, mkdirSync, realpathSync, statSync } from "node:fs";
import { dirname } from "node:path";
import type { JsonValue } from "./types.js";

export function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

export function asRecord(value: unknown, label: string): Record<string, unknown> {
  if (!isRecord(value)) throw new TypeError(`${label} must be an object`);
  return value;
}

export function asJson(value: unknown): JsonValue {
  if (value === null || typeof value === "string" || typeof value === "number" || typeof value === "boolean") return value;
  if (Array.isArray(value)) return value.map(asJson);
  if (isRecord(value)) return Object.fromEntries(Object.entries(value).map(([key, entry]) => [key, asJson(entry)]));
  throw new TypeError("Value is not JSON serializable");
}

export function stableJson(value: unknown): string {
  function sort(entry: unknown): unknown {
    if (Array.isArray(entry)) return entry.map(sort);
    if (!isRecord(entry)) return entry;
    return Object.fromEntries(Object.keys(entry).sort().map((key) => [key, sort(entry[key])]));
  }
  return JSON.stringify(sort(value));
}

export function sha256(input: string | Uint8Array): string {
  return createHash("sha256").update(input).digest("hex");
}

export function sleep(milliseconds: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(signal.reason);
      return;
    }
    const timeout = setTimeout(resolve, milliseconds);
    signal?.addEventListener("abort", () => {
      clearTimeout(timeout);
      reject(signal.reason);
    }, { once: true });
  });
}

export function backoff(attempt: number, base = 500, cap = 30_000, random = Math.random): number {
  const bounded = Math.min(cap, base * 2 ** Math.min(attempt, 16));
  return Math.max(base, Math.floor(bounded * (0.75 + random() * 0.5)));
}

export function ensurePrivateDirectory(path: string): void {
  mkdirSync(path, { recursive: true, mode: 0o700 });
  chmodSync(path, 0o700);
}

export function ensureParent(path: string): void {
  ensurePrivateDirectory(dirname(path));
}

export function assertPrivateFile(path: string, label: string): void {
  const mode = statSync(path).mode & 0o777;
  if ((mode & 0o077) !== 0) throw new Error(`${label} must not be accessible by group or other users: ${path}`);
}

export function canonicalPath(path: string): string {
  return realpathSync(path);
}

export function now(): number {
  return Date.now();
}

export function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

export function assertNever(value: never): never {
  throw new Error(`Unexpected value: ${String(value)}`);
}
