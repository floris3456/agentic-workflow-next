#!/usr/bin/env node
import { chmodSync, existsSync, lstatSync, mkdtempSync, readdirSync, rmSync } from "node:fs";
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
  const result = await probeScoutServer(scoutClient(config, manifest, config.opencode.scoutRuntimeRoot));
  process.stdout.write(`${JSON.stringify({ runtime: "installed-outside-repository", ...result })}\n`);
} finally {
  await server.stop();
  remove(temporary);
}
