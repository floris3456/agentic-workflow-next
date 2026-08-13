#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const failures = [];
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");
const parse = (file) => JSON.parse(read(file));
const assert = (condition, message) => { if (!condition) failures.push(message); };

const required = [
  "contracts/opencode-bridge/compatibility.json",
  "contracts/opencode-bridge/operation-manifest.json",
  "contracts/opencode-bridge/command.schema.json",
  "contracts/opencode-bridge/request.schema.json",
  "contracts/opencode-bridge/result.schema.json",
  "contracts/opencode-bridge/protocol.md",
  "docs/architecture/opencode-bridge.md",
  "tools/opencode-bridge/package.json",
  "tools/opencode-bridge/package-lock.json",
  "tools/opencode-bridge/config.example.json",
  "tools/opencode-bridge/README.md",
  "tools/opencode-bridge/AS-BUILT.md",
];
for (const file of required) assert(fs.existsSync(path.join(root, file)), `Missing bridge file ${file}`);

try {
  const compatibility = parse("contracts/opencode-bridge/compatibility.json");
  const manifest = parse("contracts/opencode-bridge/operation-manifest.json");
  const command = parse("contracts/opencode-bridge/command.schema.json");
  const request = parse("contracts/opencode-bridge/request.schema.json");
  const result = parse("contracts/opencode-bridge/result.schema.json");
  const packageDocument = parse("tools/opencode-bridge/package.json");
  const packageLock = parse("tools/opencode-bridge/package-lock.json");
  const example = parse("tools/opencode-bridge/config.example.json");
  const operations = manifest.operations ?? [];

  assert(compatibility.bridgeProtocolVersion === "agentic-bridge/1", "Bridge protocol version is not pinned");
  assert(compatibility.testedOpenCodeVersion === "1.18.16", "Compatibility OpenCode version changed without conformance update");
  assert(compatibility.testedSdkVersion === packageDocument.dependencies?.["@opencode-ai/sdk"], "SDK package and compatibility versions differ");
  assert(compatibility.operationCount === operations.length && operations.length === 188, "Pinned operation count must be 188");
  assert(manifest.source?.openapiSha256 === compatibility.openapiSha256, "Manifest and compatibility OpenAPI hashes differ");
  assert(new Set(operations.map((operation) => operation.operationId)).size === operations.length, "Manifest operation IDs are not unique");
  assert(operations.filter((operation) => operation.transport === "http").length === 182, "HTTP operation count changed");
  assert(operations.filter((operation) => operation.transport === "sse").length === 4, "SSE operation count changed");
  assert(operations.filter((operation) => operation.transport === "websocket").length === 2, "WebSocket operation count changed");
  assert(command.properties?.protocol?.const === compatibility.bridgeProtocolVersion, "Command schema protocol differs");
  assert(request.properties?.protocol?.const === compatibility.bridgeProtocolVersion, "Request schema protocol differs");
  assert(result.properties?.protocol?.const === compatibility.bridgeProtocolVersion, "Result schema protocol differs");
  assert(Array.isArray(command.properties?.kind?.enum) && command.properties.kind.enum.includes("opencode.request"), "Command schema lacks generic operation support");
  assert(
    JSON.stringify(request.properties?.kind?.enum) === JSON.stringify(["command.status", "task.status"]),
    "Sequence-free request schema inventory changed without validator update",
  );
  assert(!Object.hasOwn(request.properties ?? {}, "sequence"), "Read request schema must not consume command sequence");
  assert(packageDocument.engines?.node === ">=22.13.0", "Bridge minimum Node version must be explicit");
  assert(packageLock.packages?.[""]?.dependencies?.["@opencode-ai/sdk"] === "1.18.16", "Lockfile SDK version is not exact");
  assert(example.schema_version === 1 && example.policy?.pty_enabled === false && example.policy?.promotion_enabled === false, "Example config must default-deny PTY and promotion");
  assert(!/-----BEGIN (?:[A-Z]+ )?PRIVATE KEY-----/.test(read("tools/opencode-bridge/config.example.json")), "Example config appears to contain a private key");
} catch (error) {
  failures.push(`Bridge JSON validation failed: ${error.message}`);
}

if (failures.length > 0) {
  console.error(`OpenCode bridge validation failed (${failures.length}):`);
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}
console.log("OpenCode bridge contracts and package structure passed.");
