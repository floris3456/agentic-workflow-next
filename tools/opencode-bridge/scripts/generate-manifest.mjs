#!/usr/bin/env node
import { createHash } from "node:crypto";
import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

function usage() {
  console.error("Usage: node scripts/generate-manifest.mjs --openapi <file> --output <file>");
  process.exit(2);
}

const args = new Map();
for (let index = 2; index < process.argv.length; index += 2) {
  const key = process.argv[index];
  const value = process.argv[index + 1];
  if (!key?.startsWith("--") || !value) usage();
  args.set(key.slice(2), value);
}
if (!args.has("openapi") || !args.has("output")) usage();

const source = readFileSync(resolve(args.get("openapi")));
const document = JSON.parse(source.toString("utf8"));
const methods = new Set(["get", "post", "put", "patch", "delete", "head", "options", "trace"]);
const localSecret = /^(auth\.set|config\.update|global\.config\.update|mcp\.add|mcp\.auth\.|provider\.oauth\.callback|v2\.credential\.update)/;
const blockedWeb = new Set(["session.share", "session.unshare"]);
const effectOverrides = new Map([["tui.control.next", "consume"]]);

function transport(operation, path) {
  if (operation["x-websocket"] === true || /^\/(?:api\/)?pty\/\{ptyID\}\/connect$/.test(path)) return "websocket";
  for (const response of Object.values(operation.responses ?? {})) {
    if (response?.content?.["text/event-stream"]) return "sse";
  }
  return "http";
}

function responseMediaTypes(operation) {
  return [...new Set(Object.values(operation.responses ?? {}).flatMap((response) => Object.keys(response?.content ?? {})))].sort();
}

const operations = [];
for (const [path, pathItem] of Object.entries(document.paths ?? {})) {
  for (const [method, operation] of Object.entries(pathItem)) {
    if (!methods.has(method)) continue;
    if (!operation.operationId) throw new Error(`${method.toUpperCase()} ${path} has no operationId`);
    const operationTransport = transport(operation, path);
    const effect = effectOverrides.get(operation.operationId)
      ?? (operationTransport === "sse" || operationTransport === "websocket" ? "subscribe" : method === "get" || method === "head" ? "read" : "mutation");
    const policy = blockedWeb.has(operation.operationId)
      ? "blocked-web"
      : localSecret.test(operation.operationId)
        ? "local-secret"
        : effect === "read" || effect === "subscribe"
          ? "read"
          : "expert";
    operations.push({
      operationId: operation.operationId,
      method: method.toUpperCase(),
      path,
      transport: operationTransport,
      effect,
      policy,
      tags: [...(operation.tags ?? [])].sort(),
      parameters: [...(pathItem.parameters ?? []), ...(operation.parameters ?? [])].map((parameter) => ({
        name: parameter.name,
        in: parameter.in,
        required: parameter.required === true,
        style: parameter.style ?? "form",
        explode: parameter.explode ?? true,
      })),
      requestMediaType: Object.keys(operation.requestBody?.content ?? {})[0] ?? null,
      responseMediaTypes: responseMediaTypes(operation),
    });
  }
}
operations.sort((left, right) => left.operationId < right.operationId ? -1 : left.operationId > right.operationId ? 1 : 0);
const ids = new Set(operations.map((operation) => operation.operationId));
if (ids.size !== operations.length) throw new Error("OpenAPI operation IDs are not unique");

const manifest = {
  schemaVersion: 1,
  source: {
    opencodeVersion: "1.18.16",
    sdkVersion: "1.18.16",
    sdkIntegrity: "sha512-UvaHyL93spLm7MttoprWTOBSYQN3aYWd7/3Ie5WNnG2pRAPq/U/d51qt0smYBTrkjxqlQmg+AJoGw8MEH6lGUg==",
    upstreamCommit: "a3647eb025c7615159d417dcc49fc39fdaeba65b",
    openapiSha256: createHash("sha256").update(source).digest("hex"),
  },
  operations,
};
writeFileSync(resolve(args.get("output")), `${JSON.stringify(manifest, null, 2)}\n`, { mode: 0o644 });
console.log(`Wrote ${operations.length} operations; OpenAPI SHA-256 ${manifest.source.openapiSha256}`);
