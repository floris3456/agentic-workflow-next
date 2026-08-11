import { createHash } from "node:crypto";
import { createOpencodeClient } from "@opencode-ai/sdk/v2/client";
import { Manifest } from "./manifest.js";
import type { CompatibilityResult, JsonValue, OperationArguments, OperationManifestEntry } from "./types.js";
import { asJson, isRecord } from "./util.js";

export interface OpenCodeClientOptions {
  baseUrl: string;
  username: string;
  password: string;
  directory: string;
  manifest: Manifest;
  fetch?: typeof fetch;
  timeoutMs?: number;
}

function basic(username: string, password: string): string {
  return `Basic ${Buffer.from(`${username}:${password}`).toString("base64")}`;
}

function assertLoopback(url: URL): void {
  const host = url.hostname.replace(/^\[|\]$/g, "");
  if (url.protocol !== "http:" || !["127.0.0.1", "localhost", "::1"].includes(host)) {
    throw new Error(`OpenCode base URL must be loopback HTTP, received ${url.origin}`);
  }
  if (url.username || url.password) throw new Error("OpenCode credentials must not be embedded in the URL");
}

function withTimeout(fetchImpl: typeof fetch, timeoutMs: number): typeof fetch {
  return (async (input: string | URL | Request, init?: RequestInit) => {
    const timeout = AbortSignal.timeout(timeoutMs);
    const signal = init?.signal ? AbortSignal.any([init.signal, timeout]) : timeout;
    return fetchImpl(input, { ...init, signal });
  }) as typeof fetch;
}

function appendQuery(url: URL, name: string, value: JsonValue, style: string, explode: boolean): void {
  if (value === null) return;
  if (style === "deepObject") {
    if (!isRecord(value)) throw new TypeError(`${name} must be an object for deepObject serialization`);
    for (const [key, entry] of Object.entries(value)) appendQuery(url, `${name}[${key}]`, asJson(entry), "form", true);
    return;
  }
  if (Array.isArray(value)) {
    if (explode) value.forEach((entry) => url.searchParams.append(name, String(entry)));
    else url.searchParams.set(name, value.map(String).join(","));
    return;
  }
  if (isRecord(value)) {
    const entries = Object.entries(value);
    if (explode) entries.forEach(([key, entry]) => url.searchParams.append(key, String(entry)));
    else url.searchParams.set(name, entries.flatMap(([key, entry]) => [key, String(entry)]).join(","));
    return;
  }
  url.searchParams.set(name, String(value));
}

export interface PreparedRequest {
  operation: OperationManifestEntry;
  url: URL;
  init: RequestInit;
}

export class OpenCodeHttpError extends Error {
  constructor(
    readonly operationId: string,
    readonly status: number,
    readonly responseBody: string,
  ) {
    super(`OpenCode ${operationId} failed with HTTP ${status}: ${responseBody.slice(0, 500)}`);
    this.name = "OpenCodeHttpError";
  }
}

export class OpenCodeClient {
  readonly baseUrl: URL;
  readonly manifest: Manifest;
  readonly directory: string;
  readonly sdk: ReturnType<typeof createOpencodeClient>;
  private readonly fetchImpl: typeof fetch;
  private readonly authorization: string;
  private readonly timeoutMs: number;

  constructor(options: OpenCodeClientOptions) {
    this.baseUrl = new URL(options.baseUrl.endsWith("/") ? options.baseUrl : `${options.baseUrl}/`);
    assertLoopback(this.baseUrl);
    this.manifest = options.manifest;
    this.directory = options.directory;
    this.fetchImpl = options.fetch ?? fetch;
    this.authorization = basic(options.username, options.password);
    this.timeoutMs = options.timeoutMs ?? 30_000;
    this.sdk = createOpencodeClient({
      baseUrl: this.baseUrl.origin,
      directory: options.directory,
      headers: { Authorization: this.authorization },
      fetch: withTimeout(this.fetchImpl, this.timeoutMs),
    });
  }

  private prepareForTransport(
    operationId: string,
    transport: "http" | "sse",
    args: OperationArguments,
    internalHeaders: Record<string, string>,
  ): PreparedRequest {
    const operation = this.manifest.require(operationId, transport);
    const pathValues = args.path ?? {};
    const queryValues: Record<string, JsonValue> = { ...(args.query ?? {}) };
    const pathParameters = operation.parameters.filter((parameter) => parameter.in === "path");
    const queryParameters = operation.parameters.filter((parameter) => parameter.in === "query");
    const allowedPath = new Set(pathParameters.map((parameter) => parameter.name));
    const allowedQuery = new Set(queryParameters.map((parameter) => parameter.name));
    for (const key of Object.keys(pathValues)) if (!allowedPath.has(key)) throw new Error(`${operationId} has no path parameter ${key}`);
    for (const key of Object.keys(queryValues)) if (!allowedQuery.has(key)) throw new Error(`${operationId} has no query parameter ${key}`);

    if (allowedQuery.has("directory") && queryValues.directory === undefined) queryValues.directory = this.directory;
    if (allowedQuery.has("location") && queryValues.location === undefined) queryValues.location = { directory: this.directory };
    let path = operation.path;
    for (const parameter of pathParameters) {
      const value = pathValues[parameter.name];
      if (value === undefined && parameter.required) throw new Error(`${operationId} requires path parameter ${parameter.name}`);
      if (value !== undefined) path = path.replace(`{${parameter.name}}`, encodeURIComponent(String(value)));
    }
    if (/\{[^}]+\}/.test(path)) throw new Error(`${operationId} has unresolved path parameters`);
    if (path.includes("*")) {
      if (args.wildcard === undefined || args.wildcard.length === 0) throw new Error(`${operationId} requires a wildcard path`);
      path = path.replace("*", encodeURIComponent(args.wildcard));
    } else if (args.wildcard !== undefined) {
      throw new Error(`${operationId} has no wildcard path`);
    }

    const url = new URL(path.replace(/^\//, ""), this.baseUrl);
    for (const parameter of queryParameters) {
      const value = queryValues[parameter.name];
      if (value === undefined && parameter.required) throw new Error(`${operationId} requires query parameter ${parameter.name}`);
      if (value !== undefined) appendQuery(url, parameter.name, value, parameter.style, parameter.explode);
    }
    const headers = new Headers({ Authorization: this.authorization, Accept: "application/json, text/plain, application/octet-stream" });
    for (const [key, value] of Object.entries(internalHeaders)) headers.set(key, value);
    let body: string | undefined;
    if (args.body !== undefined) {
      if (operation.requestMediaType !== "application/json") throw new Error(`${operationId} does not accept a JSON body`);
      headers.set("Content-Type", "application/json");
      body = JSON.stringify(args.body);
    }
    return { operation, url, init: { method: operation.method, headers, ...(body === undefined ? {} : { body }) } };
  }

  prepare(operationId: string, args: OperationArguments = {}, internalHeaders: Record<string, string> = {}): PreparedRequest {
    return this.prepareForTransport(operationId, "http", args, internalHeaders);
  }

  async request(operationId: string, args: OperationArguments = {}, internalHeaders: Record<string, string> = {}): Promise<JsonValue | undefined> {
    const prepared = this.prepare(operationId, args, internalHeaders);
    const response = await this.fetchImpl(prepared.url, {
      ...prepared.init,
      signal: AbortSignal.timeout(this.timeoutMs),
    });
    if (!response.ok) throw new OpenCodeHttpError(operationId, response.status, await response.text());
    if (response.status === 204) return undefined;
    const contentType = response.headers.get("content-type")?.toLowerCase() ?? "";
    if (contentType.includes("application/json")) return asJson(await response.json());
    if (contentType.includes("application/octet-stream")) {
      return { encoding: "base64", data: Buffer.from(await response.arrayBuffer()).toString("base64") };
    }
    return await response.text();
  }

  async raw(operationId: string, args: OperationArguments = {}, signal?: AbortSignal): Promise<Response> {
    const prepared = this.prepareForTransport(operationId, "sse", args, { Accept: "text/event-stream" });
    const response = await this.fetchImpl(prepared.url, { ...prepared.init, ...(signal ? { signal } : {}) });
    if (!response.ok) throw new OpenCodeHttpError(operationId, response.status, await response.text());
    return response;
  }

  async health(): Promise<{ healthy: boolean; version: string }> {
    const response = await this.sdk.global.health({ throwOnError: true });
    const data = response.data;
    if (!data || typeof data.version !== "string") throw new Error("OpenCode SDK health response is invalid");
    return { healthy: data.healthy === true, version: data.version };
  }

  async contract(): Promise<{ bytes: Uint8Array; hash: string }> {
    const response = await this.fetchImpl(new URL("doc", this.baseUrl), {
      headers: { Authorization: this.authorization },
      signal: AbortSignal.timeout(this.timeoutMs),
    });
    if (!response.ok) throw new OpenCodeHttpError("openapi.doc", response.status, await response.text());
    const bytes = new Uint8Array(await response.arrayBuffer());
    return { bytes, hash: createHash("sha256").update(bytes).digest("hex") };
  }

  async compatibility(candidateManifest: Manifest): Promise<CompatibilityResult> {
    const [health, contract] = await Promise.all([this.health(), this.contract()]);
    const inventory = this.manifest.compare(candidateManifest);
    const expectedVersion = this.manifest.document.source.opencodeVersion;
    const expectedHash = this.manifest.document.source.openapiSha256;
    return {
      compatible:
        health.healthy &&
        health.version === expectedVersion &&
        contract.hash === expectedHash &&
        inventory.added.length === 0 &&
        inventory.removed.length === 0 &&
        inventory.changed.length === 0,
      runningVersion: health.version,
      expectedVersion,
      actualHash: contract.hash,
      expectedHash,
      ...inventory,
    };
  }
}
