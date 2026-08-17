#!/usr/bin/env node
import assert from "node:assert/strict";
import { chmodSync, existsSync, lstatSync, mkdtempSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { Manifest } from "../dist/src/manifest.js";
import { ScoutWorkspaceManager } from "../dist/src/scout.js";
import {
  installScoutRuntime, probeScoutServer, scoutClient, ScoutServerProcess,
} from "../dist/src/scout-server.js";

const packageRoot = resolve(import.meta.dirname, "..");
const repositoryRoot = resolve(packageRoot, "../..");
const temporary = mkdtempSync(join(tmpdir(), "hardened-scout-runtime-smoke-"));

function remove(path) {
  if (!existsSync(path)) return;
  const unlock = (candidate) => {
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

const config = {
  repositoryRoot,
  stateFile: join(temporary, "state", "bridge.sqlite"),
  manifestFile: join(repositoryRoot, "contracts", "opencode-bridge", "operation-manifest.json"),
  opencode: {
    baseUrl: "http://127.0.0.1:44990",
    scoutBaseUrl: "http://127.0.0.1:44991",
    username: "scout-smoke",
    password: "unused-developer-password",
    passwordFile: join(temporary, "unused"),
    scoutPassword: "scout-smoke-password",
    scoutPasswordFile: join(temporary, "unused-scout"),
    scoutRuntimeRoot: join(temporary, "runtime"),
    scoutPersistenceRoot: join(temporary, "runtime-persistence"),
    scoutProviderCredential: {
      type: "api-key",
      apiKey: "smoke-does-not-call-the-model",
      file: join(temporary, "unused-provider"),
    },
  },
};

const manifest = Manifest.load(config.manifestFile);
const workspaces = new ScoutWorkspaceManager(repositoryRoot, config.stateFile, { fetchOrigin: false });
const server = new ScoutServerProcess(config, manifest, workspaces.root);
try {
  await installScoutRuntime(config);
  await server.start();
  await server.start();
  const firstClient = scoutClient(config, manifest, config.opencode.scoutRuntimeRoot);
  const first = await probeScoutServer(firstClient);
  const created = await firstClient.request("session.create", {
    body: { title: "Scout persistent runtime smoke", agent: "scout" },
  });
  assert(created && typeof created === "object" && !Array.isArray(created), "real Scout session creation returned no record");
  const sessionId = created.id;
  assert(typeof sessionId === "string" && sessionId.length > 0, "real Scout session creation returned no session ID");
  const initialSession = await firstClient.request("session.get", { path: { sessionID: sessionId } });
  assert(initialSession && typeof initialSession === "object" && !Array.isArray(initialSession), "real Scout session was not retrievable before reinstall");
  assert.equal(initialSession.id, sessionId, "real Scout session retrieval changed its ID before reinstall");
  const initialMessages = await firstClient.request("session.messages", { path: { sessionID: sessionId } });
  assert(Array.isArray(initialMessages), "real Scout messages endpoint was unreadable before reinstall");
  assert.equal(initialMessages.length, 0, "no-model Scout smoke unexpectedly created a message before reinstall");
  await server.stop();
  const reinstallMarker = join(config.opencode.scoutRuntimeRoot, "must-be-removed-by-reinstall");
  writeFileSync(reinstallMarker, "replace this runtime\n", { mode: 0o600 });
  await installScoutRuntime(config);
  assert.equal(existsSync(reinstallMarker), false, "trusted Scout runtime was not replaced during reinstall");
  await server.start();
  await server.start();
  const reinstalledClient = scoutClient(config, manifest, config.opencode.scoutRuntimeRoot);
  const result = await probeScoutServer(reinstalledClient);
  const persistedSession = await reinstalledClient.request("session.get", { path: { sessionID: sessionId } });
  assert(persistedSession && typeof persistedSession === "object" && !Array.isArray(persistedSession), "real Scout session was not retrievable after reinstall");
  assert.equal(persistedSession.id, sessionId, "real Scout session ID did not survive reinstall");
  const persistedMessages = await reinstalledClient.request("session.messages", { path: { sessionID: sessionId } });
  assert(Array.isArray(persistedMessages), "real Scout messages endpoint was unreadable after reinstall");
  assert.equal(persistedMessages.length, 0, "no-model Scout smoke unexpectedly created a message after reinstall");
  process.stdout.write(`${JSON.stringify({
    runtime: "reinstalled-outside-repository",
    first: first.version,
    sessionId,
    persistentSession: true,
    messagesBefore: initialMessages.length,
    messagesAfter: persistedMessages.length,
    ...result,
  })}\n`);
} finally {
  await server.stop();
  remove(temporary);
}
