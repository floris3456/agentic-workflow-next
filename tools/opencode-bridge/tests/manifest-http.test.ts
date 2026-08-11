import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { resolve } from "node:path";
import test from "node:test";
import { Manifest } from "../src/manifest.js";
import { OpenCodeClient, OpenCodeHttpError } from "../src/opencode.js";
import type { OperationArguments } from "../src/types.js";

const manifestPath = resolve(import.meta.dirname, "../../../../contracts/opencode-bridge/operation-manifest.json");
const manifest = Manifest.load(manifestPath);

function asFetch(handler: (request: Request) => Response | Promise<Response>): typeof fetch {
  return (async (input: string | URL | Request, init?: RequestInit) => handler(new Request(input, init))) as typeof fetch;
}

function client(fetchImpl: typeof fetch = asFetch(() => Response.json({ ok: true }))): OpenCodeClient {
  return new OpenCodeClient({
    baseUrl: "http://127.0.0.1:4096",
    username: "bridge",
    password: "test-only-password",
    directory: "/work/project",
    manifest,
    fetch: fetchImpl,
  });
}

test("pinned manifest classifies the complete released transport inventory", () => {
  assert.equal(manifest.document.source.opencodeVersion, "1.18.16");
  assert.equal(manifest.document.source.sdkVersion, "1.18.16");
  assert.equal(manifest.document.source.openapiSha256, "c3a9f94af0c3324d97b482b14c692e810ce7ccac3136319ba46334de972b4cf1");
  assert.equal(manifest.operations.size, 188);

  const http = manifest.document.operations.filter((operation) => operation.transport === "http");
  const sse = manifest.document.operations.filter((operation) => operation.transport === "sse");
  const websocket = manifest.document.operations.filter((operation) => operation.transport === "websocket");
  assert.equal(http.length, 182);
  assert.deepEqual(sse.map((operation) => operation.operationId), [
    "event.subscribe",
    "global.event",
    "v2.event.subscribe",
    "v2.session.events",
  ]);
  assert.deepEqual(websocket.map((operation) => operation.operationId), ["pty.connect", "v2.pty.connect"]);
  assert.deepEqual(manifest.document.operations.filter((operation) => operation.path.includes("*")).map((operation) => operation.operationId), ["v2.fs.read"]);
  assert.equal(manifest.document.operations.filter((operation) => operation.policy === "local-secret").length, 10);
  assert.equal(manifest.document.operations.filter((operation) => operation.policy === "blocked-web").length, 2);
});

test("manifest comparison reports additions, removals, and routing changes", () => {
  const document = structuredClone(manifest.document);
  document.operations = document.operations.filter((operation) => operation.operationId !== "global.health");
  const changed = document.operations.find((operation) => operation.operationId === "session.get");
  assert.ok(changed);
  changed.path = "/changed/{sessionID}";
  document.operations.push({ ...structuredClone(manifest.require("file.read")), operationId: "synthetic.added" });

  assert.deepEqual(manifest.compare(new Manifest(document)), {
    added: ["synthetic.added"],
    removed: ["global.health"],
    changed: ["session.get"],
  });
  assert.equal(manifest.diagnosticAllowed("session.get"), true);
  assert.equal(manifest.diagnosticAllowed("session.prompt"), false);
  assert.throws(() => manifest.require("missing.operation"), /Unsupported OpenCode operation ID/);
  assert.throws(() => manifest.require("event.subscribe", "http"), /uses sse, not http/);
});

test("generic HTTP preparation covers every classified HTTP operation", () => {
  const api = client();
  for (const operation of manifest.document.operations.filter((entry) => entry.transport === "http")) {
    const args: OperationArguments = { path: {}, query: {} };
    for (const parameter of operation.parameters) {
      if (!parameter.required) continue;
      if (parameter.in === "path") args.path![parameter.name] = "sample/id";
      if (parameter.in === "query") args.query![parameter.name] = parameter.style === "deepObject" ? { value: "sample" } : "sample";
    }
    if (operation.path.includes("*")) args.wildcard = "src/file name.ts";
    if (operation.requestMediaType === "application/json") args.body = {};

    const prepared = api.prepare(operation.operationId, args);
    assert.equal(prepared.operation.operationId, operation.operationId);
    assert.equal(prepared.init.method, operation.method);
    assert.equal(prepared.url.origin, "http://127.0.0.1:4096");
    assert.doesNotMatch(prepared.url.pathname, /[{}*]/);
  }
});

test("HTTP serializer handles path, query, deep-object, wildcard, body, and internal headers", () => {
  const api = client();
  const prompt = api.prepare("session.prompt", {
    path: { sessionID: "session/one" },
    body: { parts: [{ type: "text", text: "hello" }] },
  }, { "x-bridge-internal": "yes" });
  assert.equal(prompt.url.pathname, "/session/session%2Fone/message");
  assert.equal(prompt.url.searchParams.get("directory"), "/work/project");
  assert.equal(prompt.init.method, "POST");
  assert.equal(prompt.init.body, JSON.stringify({ parts: [{ type: "text", text: "hello" }] }));
  const promptHeaders = new Headers(prompt.init.headers);
  assert.equal(promptHeaders.get("authorization"), `Basic ${Buffer.from("bridge:test-only-password").toString("base64")}`);
  assert.equal(promptHeaders.get("content-type"), "application/json");
  assert.equal(promptHeaders.get("x-bridge-internal"), "yes");

  const provider = api.prepare("v2.provider.list");
  assert.equal(provider.url.searchParams.get("location[directory]"), "/work/project");
  const file = api.prepare("v2.fs.read", { wildcard: "src/file name.ts" });
  assert.equal(file.url.pathname, "/api/fs/read/src%2Ffile%20name.ts");

  assert.throws(() => api.prepare("session.get"), /requires path parameter sessionID/);
  assert.throws(() => api.prepare("global.health", { query: { unexpected: true } }), /has no query parameter unexpected/);
  assert.throws(() => api.prepare("v2.fs.read"), /requires a wildcard path/);
  assert.throws(() => api.prepare("global.health", { wildcard: "unexpected" }), /has no wildcard path/);
  assert.throws(() => api.prepare("session.get", { path: { sessionID: "one" }, body: {} }), /does not accept a JSON body/);
});

test("HTTP execution decodes JSON, text, binary, empty, and error responses", async () => {
  const responses = [
    Response.json({ healthy: true }),
    new Response("plain", { headers: { "content-type": "text/plain" } }),
    new Response(new Uint8Array([0, 1, 2]), { headers: { "content-type": "application/octet-stream" } }),
    new Response(null, { status: 204 }),
    new Response("denied", { status: 403 }),
  ];
  const requests: Request[] = [];
  const api = client(asFetch((request) => {
    requests.push(request);
    const response = responses.shift();
    assert.ok(response);
    return response;
  }));

  assert.deepEqual(await api.request("global.health"), { healthy: true });
  assert.equal(await api.request("global.health"), "plain");
  assert.deepEqual(await api.request("v2.fs.read", { wildcard: "file.bin" }), { encoding: "base64", data: "AAEC" });
  assert.equal(await api.request("global.health"), undefined);
  await assert.rejects(api.request("global.health"), (error: unknown) => {
    assert.ok(error instanceof OpenCodeHttpError);
    assert.equal(error.status, 403);
    assert.match(error.message, /denied/);
    return true;
  });
  assert.equal(requests.length, 5);
});

test("compatibility fails closed on contract hash drift", async () => {
  const contractBytes = new TextEncoder().encode("{\"openapi\":\"3.1.0\"}");
  const api = client(asFetch((request) => {
    const pathname = new URL(request.url).pathname;
    if (pathname === "/global/health") return Response.json({ healthy: true, version: "1.18.16" });
    if (pathname === "/doc") return new Response(contractBytes, { headers: { "content-type": "application/json" } });
    return new Response("not found", { status: 404 });
  }));

  const result = await api.compatibility(manifest);
  assert.equal(result.compatible, false);
  assert.equal(result.runningVersion, "1.18.16");
  assert.equal(result.actualHash, createHash("sha256").update(contractBytes).digest("hex"));
  assert.deepEqual(result.added, []);
  assert.deepEqual(result.removed, []);
  assert.deepEqual(result.changed, []);
});

test("client accepts only credential-free loopback HTTP URLs", () => {
  for (const baseUrl of ["https://127.0.0.1:4096", "http://0.0.0.0:4096", "http://example.test:4096", "http://user:pass@localhost:4096"]) {
    assert.throws(() => new OpenCodeClient({
      baseUrl,
      username: "bridge",
      password: "test",
      directory: "/work/project",
      manifest,
    }), /loopback HTTP|must not be embedded/);
  }
  assert.doesNotThrow(() => client());
});

test("SDK health requests inherit the configured timeout", async () => {
  let observedSignal: AbortSignal | undefined;
  const fetchImpl = (async (_input: string | URL | Request, init?: RequestInit) => {
    observedSignal = init?.signal ?? undefined;
    return new Promise<Response>((_resolve, reject) => {
      observedSignal?.addEventListener("abort", () => reject(observedSignal?.reason), { once: true });
    });
  }) as typeof fetch;
  const api = new OpenCodeClient({
    baseUrl: "http://127.0.0.1:4096",
    username: "bridge",
    password: "test",
    directory: "/work/project",
    manifest,
    fetch: fetchImpl,
    timeoutMs: 5,
  });
  const keepAlive = setInterval(() => undefined, 100);
  try {
    await assert.rejects(api.health(), /aborted|timeout/i);
    assert.equal(observedSignal?.aborted, true);
  } finally {
    clearInterval(keepAlive);
  }
});
