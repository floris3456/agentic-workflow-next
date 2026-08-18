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
  "tools/opencode-bridge/src/repository-identity.ts",
  "tools/opencode-bridge/src/scout-server.ts",
  "tools/opencode-bridge/scripts/smoke-workspace-runtime.mjs",
  "tools/opencode-bridge/scout-runtime/package-lock.json",
  "tools/opencode-bridge/scout-runtime/opencode.json",
  "tools/opencode-bridge/scout-runtime/plugins/scout-tools.mjs",
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
    JSON.stringify(request.properties?.kind?.enum) === JSON.stringify(["command.status", "task.status", "scout.start", "scout.status"]),
    "Sequence-free request schema inventory changed without validator update",
  );
  assert(!Object.hasOwn(request.properties ?? {}, "sequence"), "Read request schema must not consume command sequence");
  assert(Array.isArray(request.allOf) && request.allOf.length === 4, "Request schema must define four kind-specific argument contracts");
  const scoutStart = request.allOf?.find((entry) => entry.if?.properties?.kind?.const === "scout.start");
  assert(
    JSON.stringify(scoutStart?.then?.properties?.arguments?.required) === JSON.stringify(["question", "ref", "scope", "expected_evidence"]),
    "scout.start must require a focused question, exact ref, scope, and expected evidence",
  );
  assert(scoutStart?.then?.properties?.arguments?.properties?.ref?.pattern === "^[0-9a-f]{40}$", "Scout ref must be an exact lowercase SHA");
  assert(packageDocument.engines?.node === ">=22.13.0", "Bridge minimum Node version must be explicit");
  assert(
    packageDocument.scripts?.["test:workspace-runtime-smoke"]
      === "npm run build && node scripts/smoke-workspace-runtime.mjs",
    "Workspace real-runtime smoke command is missing",
  );
  assert(packageLock.packages?.[""]?.dependencies?.["@opencode-ai/sdk"] === "1.18.16", "Lockfile SDK version is not exact");
  assert(example.schema_version === 1 && example.policy?.pty_enabled === false && example.policy?.promotion_enabled === false, "Example config must default-deny PTY and promotion");
  assert(example.opencode?.scout_base_url && example.opencode.scout_base_url !== example.opencode.base_url, "Example config must use a distinct Scout endpoint");
  assert(!/-----BEGIN (?:[A-Z]+ )?PRIVATE KEY-----/.test(read("tools/opencode-bridge/config.example.json")), "Example config appears to contain a private key");
  const bridgeConfig = read("tools/opencode-bridge/src/config.ts");
  assert(bridgeConfig.includes("exactly one of scout_provider_api_key_file or scout_provider_oauth_file"), "Scout provider configuration must require exactly one credential mode");
  assert(bridgeConfig.includes('only(document, ["openai"]') && bridgeConfig.includes("scoutPersistenceRoot") && bridgeConfig.includes("data/opencode/auth.json"), "Scout OAuth configuration must remain OpenAI-only at the isolated persistent auth path");
  const scoutServer = read("tools/opencode-bridge/src/scout-server.ts");
  assert(scoutServer.includes("XDG_DATA_HOME: paths.dataDirectory") && scoutServer.includes("XDG_STATE_HOME: paths.stateDirectory"), "Scout persistent data/state routing is missing");
  assert(scoutServer.includes("OPENCODE_CONFIG_DIR: configDirectory") && scoutServer.includes("Scout persistence must not contain symlinks"), "Scout persistence must remain outside trusted config and fail closed on symlinks");
  const scout = read("tools/opencode-bridge/src/scout.ts");
  assert(scout.includes('allowedTools = new Set(["scout_read", "scout_glob", "scout_grep"])'), "Scout trusted read/search contract changed without review");
  assert(!scout.includes('"scout_read", "scout_glob", "scout_grep", "lsp"'), "Scout contract must not allow LSP");
  assert(scout.includes('"ls-tree", "-rz"') && scout.includes("reject gitlinks and submodules") && scout.includes("0o444"), "Scout exact-tree snapshot boundary is incomplete");
  assert(!fs.existsSync(path.join(root, ".opencode/agents/repository-scout.md")), "Scout trusted contract must not be ref-owned");
  const runtimePackage = parse("tools/opencode-bridge/scout-runtime/package.json");
  const runtimeLock = parse("tools/opencode-bridge/scout-runtime/package-lock.json");
  const runtimeConfig = parse("tools/opencode-bridge/scout-runtime/opencode.json");
  const tools = read("tools/opencode-bridge/scout-runtime/plugins/scout-tools.mjs");
  assert(runtimePackage.dependencies?.["opencode-ai"] === "1.18.16" && runtimePackage.dependencies?.["@opencode-ai/plugin"] === "1.18.16", "Scout runtime packages must be exactly pinned");
  assert(runtimeLock.packages?.[""]?.dependencies?.["opencode-ai"] === "1.18.16", "Scout runtime lock must pin OpenCode");
  assert(runtimeConfig.model === "openai/gpt-5.6-luna" && runtimeConfig.lsp === false && runtimeConfig.formatter === false, "Scout runtime model and process-adjacent features are not pinned");
  assert(runtimeConfig.agent?.["repository-scout"]?.options?.reasoningEffort === "high", "Scout runtime reasoning effort must be high");
  assert(!/node:child_process|node:(?:http|https|net)|\bfetch\s*\(|\bBun\./.test(tools), "Scout trusted tools must not expose process, package, or network primitives");
  const identity = read("tools/opencode-bridge/src/repository-identity.ts");
  for (const term of ["api.github.com", "/api/v3", "git_host", "ssh://", "git@host", "userinfo"]) {
    assert(identity.includes(term), `Repository identity boundary is missing ${term}`);
  }
  const workspaceSmoke = read("tools/opencode-bridge/scripts/smoke-workspace-runtime.mjs");
  for (const term of [
    "1.18.16",
    "CommandExecutor",
    "TemplateDevelopmentWorktreeResolver",
    '"workspace.start"',
    '"small-workspace-maintainer"',
    '"heavy-workspace-maintainer"',
    "cliproxyapi/gemini-3.7-flash-high",
    "openai/gpt-5.6-sol",
    '"workspace_list"',
    '"workspace_inspect"',
    '"workspace_read"',
    '"workspace_exec"',
    "recoverDeveloperCanonical",
    "DeveloperResponseTransport",
    '"provider.list"',
    '"small-developer"',
    "TARGET_INSTRUCTIONS_EVIDENCE_ONLY",
  ]) assert(workspaceSmoke.includes(term), `Workspace real-runtime smoke is missing ${term}`);
  assert(
    workspaceSmoke.includes('permissionAction(workspaceAgent.permission, tool)')
      && workspaceSmoke.includes('permissionAction(workspaceAgent.permission, "skill", skill.name)'),
    "Workspace real-runtime smoke must inspect effective tool and skill permissions",
  );
  assert(
    workspaceSmoke.includes("OPENCODE_DISABLE_EXTERNAL_SKILLS")
      && workspaceSmoke.includes("GIT_CONFIG_GLOBAL: \"/dev/null\"")
      && !workspaceSmoke.includes("...process.env"),
    "Workspace real-runtime smoke must launch with an explicit sterile environment",
  );
  const commandsSource = read("tools/opencode-bridge/src/commands.ts");
  assert(commandsSource.includes("developerAgents") && commandsSource.includes("workspaceAgents"), "Command executor must define distinct developerAgents and workspaceAgents");
  assert(!/\bworkspaceAgent\b/.test(commandsSource), "Legacy workspaceAgent compatibility option must be removed");
  assert(!commandsSource.includes('"luna"') && !commandsSource.includes('"sol"'), "Legacy luna/sol agent route names must be removed from command routing");
  assert(commandsSource.includes("agent must be small or heavy"), "Command executor must enforce closed agent must be small or heavy error");
  const protocolSource = read("tools/opencode-bridge/src/protocol.ts");
  assert(protocolSource.includes("agent must be small or heavy"), "Protocol envelope parser must enforce closed agent must be small or heavy error");
  const startSchema = command.allOf?.find((entry) => entry.then?.properties?.arguments?.properties?.agent && entry.if?.properties?.kind?.enum?.includes("start"));
  assert(JSON.stringify(startSchema?.then?.properties?.arguments?.properties?.agent?.enum) === JSON.stringify(["small", "heavy"]), "Start command schema must restrict agent to small|heavy");
  const routeSchema = command.allOf?.find((entry) => entry.if?.properties?.kind?.const === "route");
  assert(JSON.stringify(routeSchema?.then?.properties?.arguments?.properties?.agent?.enum) === JSON.stringify(["small", "heavy"]), "Route command schema must restrict agent to small|heavy");

  const serviceSource = read("tools/opencode-bridge/src/service.ts");
  assert(serviceSource.includes("refreshOpenCodeInstances") && serviceSource.includes("active_task_sessions"), "Service must implement refreshOpenCodeInstances and active_task_sessions status");
  const cliSource = read("tools/opencode-bridge/src/cli.ts");
  assert(cliSource.includes('"refresh-instances"'), "CLI must define refresh-instances command");
  const bootstrapSource = read("scripts/bootstrap-opencode-bridge.sh");
  assert(bootstrapSource.includes("refresh-instances"), "Bootstrap script must invoke CLI refresh-instances");
  const watcherSource = read("scripts/watch-developer-sync.sh");
  assert(watcherSource.includes("active_task_sessions"), "Developer sync watcher must check active_task_sessions");
} catch (error) {
  failures.push(`Bridge JSON validation failed: ${error.message}`);
}

if (failures.length > 0) {
  console.error(`OpenCode bridge validation failed (${failures.length}):`);
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}
console.log("OpenCode bridge contracts and package structure passed.");
