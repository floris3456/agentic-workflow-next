import assert from "node:assert/strict";
import {
  chmodSync, existsSync, lstatSync, mkdirSync, mkdtempSync, readFileSync, readdirSync,
  rmSync, symlinkSync, writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import test, { type TestContext } from "node:test";
import type { BridgeConfig } from "../src/config.js";
import { ScoutResponseTransport } from "../src/handoff.js";
import { PublicProjection } from "../src/projection.js";
import { RecoveryCoordinator } from "../src/recovery.js";
import {
  installScoutRuntime, scoutRuntimePaths, scoutServerEnvironment,
} from "../src/scout-server.js";
import { BridgeState } from "../src/state.js";
import type { OpenCodeClient } from "../src/opencode.js";

const repositoryRoot = resolve(import.meta.dirname, "../../../..");
function removeFixture(path: string): void {
  if (!existsSync(path)) return;
  const unlock = (candidate: string): void => {
    const stat = lstatSync(candidate);
    if (stat.isSymbolicLink()) return;
    if (stat.isDirectory()) {
      chmodSync(candidate, 0o700);
      for (const name of readdirSync(candidate)) unlock(join(candidate, name));
    } else chmodSync(candidate, 0o600);
  };
  unlock(path);
  rmSync(path, { recursive: true, force: true });
}

function fixture(context: TestContext): { root: string; config: BridgeConfig } {
  const root = mkdtempSync(join(tmpdir(), "bridge-scout-server-test-"));
  context.after(() => removeFixture(root));
  const runtimeRoot = join(root, "runtime");
  return {
    root,
    config: {
      repositoryRoot,
      stateFile: join(root, "bridge.sqlite"),
      manifestFile: join(repositoryRoot, "contracts", "opencode-bridge", "operation-manifest.json"),
      opencode: {
        baseUrl: "http://127.0.0.1:44980",
        scoutBaseUrl: "http://127.0.0.1:44981",
        username: "scout-test",
        password: "unused",
        passwordFile: join(root, "unused-password"),
        scoutPassword: "scout-test-password",
        scoutPasswordFile: join(root, "unused-scout-password"),
        scoutRuntimeRoot: runtimeRoot,
        scoutPersistenceRoot: `${runtimeRoot}-persistence`,
        scoutProviderCredential: { type: "api-key", apiKey: "test-key", file: join(root, "unused-provider") },
      },
    } as BridgeConfig,
  };
}

async function fakeDependencies(configDirectory: string): Promise<void> {
  const plugin = join(configDirectory, "node_modules", "@opencode-ai", "plugin");
  const opencode = join(configDirectory, "node_modules", "opencode-ai");
  const bin = join(configDirectory, "node_modules", ".bin");
  mkdirSync(plugin, { recursive: true, mode: 0o700 });
  mkdirSync(opencode, { recursive: true, mode: 0o700 });
  mkdirSync(bin, { recursive: true, mode: 0o700 });
  writeFileSync(join(plugin, "package.json"), JSON.stringify({ name: "@opencode-ai/plugin", version: "1.18.16" }));
  writeFileSync(join(opencode, "package.json"), JSON.stringify({ name: "opencode-ai", version: "1.18.16" }));
  writeFileSync(join(bin, "opencode"), "#!/bin/sh\nexit 0\n", { mode: 0o700 });
}

test("Scout reinstall preserves private session data while replacing trusted runtime and recovering once", async (context) => {
  const { root, config } = fixture(context);
  const paths = scoutRuntimePaths(config);
  const install = () => installScoutRuntime(config, { installDependencies: fakeDependencies });
  await install();

  const snapshots = join(root, "snapshots");
  const workspace = join(snapshots, "a".repeat(40));
  mkdirSync(workspace, { recursive: true, mode: 0o700 });
  const environment = scoutServerEnvironment(config, snapshots);
  assert.equal(environment.XDG_DATA_HOME, paths.dataDirectory);
  assert.equal(environment.XDG_STATE_HOME, paths.stateDirectory);
  for (const name of ["HOME", "XDG_CONFIG_HOME", "XDG_CACHE_HOME", "TMPDIR", "OPENCODE_CONFIG_DIR", "PATH"] as const) {
    assert.doesNotMatch(String(environment[name]), new RegExp(paths.persistenceRoot.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  }
  assert.equal(environment.OPENCODE_CONFIG_DIR, paths.configDirectory);

  const requestId = "81000000-0000-4000-8000-000000000001";
  const state = new BridgeState(config.stateFile);
  state.mapScoutSession({
    requestId,
    taskId: "TASK-SCOUT-PERSISTENCE",
    sessionId: "ses_persisted_scout",
    issueNumber: 81,
    refSha: "a".repeat(40),
    workspacePath: workspace,
  });
  state.close();

  const persistedMessage = join(paths.dataDirectory, "opencode", "persisted-terminal.json");
  writeFileSync(persistedMessage, `${JSON.stringify([{
    info: {
      id: "msg_persisted_scout",
      role: "assistant",
      sessionID: "ses_persisted_scout",
      time: { created: 10, completed: 20 },
      finish: "stop",
    },
    parts: [{ id: "part_persisted_scout", type: "text", text: "Persisted Scout terminal response" }],
  }])}\n`, { mode: 0o600 });
  const ignoredConfig = join(paths.persistenceRoot, "config", "plugins");
  mkdirSync(ignoredConfig, { recursive: true, mode: 0o700 });
  writeFileSync(join(ignoredConfig, "untrusted.mjs"), "throw new Error('must not load');\n", { mode: 0o600 });

  const trustedPackage = join(paths.configDirectory, "package.json");
  const trustedBinary = join(paths.configDirectory, "node_modules", ".bin", "opencode");
  chmodSync(trustedPackage, 0o600);
  writeFileSync(trustedPackage, "{\"tampered\":true}\n");
  chmodSync(trustedBinary, 0o700);
  writeFileSync(trustedBinary, "#!/bin/sh\nexit 99\n", { mode: 0o700 });
  writeFileSync(join(paths.runtimeRoot, "obsolete-runtime-marker"), "obsolete\n");
  await install();

  assert.equal(existsSync(persistedMessage), true);
  assert.equal(existsSync(join(paths.persistenceRoot, "config", "plugins", "untrusted.mjs")), true);
  assert.equal(existsSync(join(paths.runtimeRoot, "obsolete-runtime-marker")), false);
  assert.equal(
    readFileSync(trustedPackage, "utf8"),
    readFileSync(join(repositoryRoot, "tools", "opencode-bridge", "scout-runtime", "package.json"), "utf8"),
  );
  assert.equal(readFileSync(trustedBinary, "utf8"), "#!/bin/sh\nexit 0\n");
  assert.equal(lstatSync(paths.configDirectory).mode & 0o222, 0);

  const recoveredState = new BridgeState(config.stateFile);
  const projection = new PublicProjection({ state: recoveredState, privateRoots: [root] });
  let messageReads = 0;
  const client = {
    request: async (operation: string) => {
      if (operation === "session.status") return {};
      if (operation === "session.messages") {
        messageReads++;
        return JSON.parse(readFileSync(persistedMessage, "utf8"));
      }
      throw new Error(`unexpected operation ${operation}`);
    },
  } as unknown as OpenCodeClient;
  const recovery = new RecoveryCoordinator({ client, state: recoveredState });
  assert.equal(await recovery.recoverScoutCanonical(recoveredState.getScoutSession(requestId)!), true);
  const delivery = recoveredState.pendingResponseDeliveries()[0];
  assert.ok(delivery);
  await new ScoutResponseTransport({ clientFor: () => client, state: recoveredState, projection }).deliver(delivery);
  assert.match(JSON.stringify(recoveredState.getScoutSession(requestId)?.latestResponse), /Persisted Scout terminal response/);
  assert.equal(recoveredState.listEvents("TASK-SCOUT-PERSISTENCE").length, 1);
  assert.equal(await recovery.recoverScoutCanonical(recoveredState.getScoutSession(requestId)!), false);
  assert.equal(messageReads, 2);
  recoveredState.close();

  const restarted = new BridgeState(config.stateFile);
  const restartedRecovery = new RecoveryCoordinator({ client, state: restarted });
  assert.equal(await restartedRecovery.recoverScoutCanonical(restarted.getScoutSession(requestId)!), false);
  assert.equal(restarted.listEvents("TASK-SCOUT-PERSISTENCE").length, 1);
  assert.equal(restarted.pendingResponseDeliveries().length, 0);
  assert.equal(restarted.pendingOutbox(Date.now() + 1_000, 100).filter((entry) => entry.dedupeKey.startsWith("scout-response:")).length, 1);
  assert.equal(messageReads, 2);
  restarted.close();
});

test("Scout installation fails closed for unsafe persistence symlinks and structural corruption", async (context) => {
  const { root, config } = fixture(context);
  const paths = scoutRuntimePaths(config);
  const outside = join(root, "outside");
  mkdirSync(outside, { mode: 0o700 });
  symlinkSync(outside, paths.persistenceRoot, "dir");
  await assert.rejects(
    installScoutRuntime(config, { installDependencies: fakeDependencies }),
    /non-symlink directory/,
  );
  rmSync(paths.persistenceRoot);

  mkdirSync(paths.persistenceRoot, { mode: 0o700 });
  mkdirSync(paths.stateDirectory, { mode: 0o700 });
  symlinkSync(outside, paths.dataDirectory, "dir");
  await assert.rejects(
    installScoutRuntime(config, { installDependencies: fakeDependencies }),
    /non-symlink directory/,
  );
  rmSync(paths.persistenceRoot, { recursive: true, force: true });

  mkdirSync(paths.persistenceRoot, { mode: 0o700 });
  writeFileSync(paths.dataDirectory, "not a directory\n", { mode: 0o600 });
  mkdirSync(paths.stateDirectory, { mode: 0o700 });
  await assert.rejects(
    installScoutRuntime(config, { installDependencies: fakeDependencies }),
    /non-symlink directory/,
  );

  rmSync(paths.persistenceRoot, { recursive: true, force: true });
  mkdirSync(paths.persistenceRoot, { mode: 0o700 });
  chmodSync(paths.persistenceRoot, 0o755);
  await assert.rejects(
    installScoutRuntime(config, { installDependencies: fakeDependencies }),
    /must not be accessible by group or other users/,
  );

  rmSync(paths.persistenceRoot, { recursive: true, force: true });
  await installScoutRuntime(config, { installDependencies: fakeDependencies });
  mkdirSync(join(paths.dataDirectory, "opencode"), { recursive: true, mode: 0o700 });
  writeFileSync(paths.authFile, "{}\n", { mode: 0o600 });
  assert.throws(
    () => scoutServerEnvironment(config, join(root, "snapshots")),
    /must be absent in API-key mode/,
  );

  rmSync(paths.authFile);
  config.opencode.scoutProviderCredential = {
    type: "oauth",
    file: paths.authFile,
    auth: { type: "oauth", access: "access", refresh: "refresh", expires: 2_000_000_000_000, accountId: "account" },
  };
  await installScoutRuntime(config, { installDependencies: fakeDependencies });
  chmodSync(paths.authFile, 0o644);
  assert.throws(
    () => scoutServerEnvironment(config, join(root, "snapshots")),
    /must not be accessible by group or other users/,
  );
});
