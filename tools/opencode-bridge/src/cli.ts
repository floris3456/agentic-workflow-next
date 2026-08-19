#!/usr/bin/env node
import { spawn } from "node:child_process";
import { BridgeAdminClient } from "./admin.js";
import { loadBridgeConfig } from "./config.js";
import { BridgeService, bridgeStatus, checkBridge, reconcileBridge, refreshOpenCodeInstances, synchronizedGitState } from "./service.js";
import { installScoutRuntime } from "./scout-server.js";
import { errorMessage } from "./util.js";

function usage(): never {
  process.stderr.write("Usage: opencode-bridge <run|bootstrap|status|reconcile|attach|install-scout-runtime|refresh-instances> [--config <file>] [--check]\n       opencode-bridge app-registration-url --repository <owner/name> [--name <app-name>]\n");
  process.exit(2);
}

function option(args: string[], name: string): string | undefined {
  const index = args.indexOf(name);
  if (index === -1) return undefined;
  const value = args[index + 1];
  if (!value || value.startsWith("--")) usage();
  args.splice(index, 2);
  return value;
}

function flag(args: string[], name: string): boolean {
  const index = args.indexOf(name);
  if (index === -1) return false;
  args.splice(index, 1);
  return true;
}

function json(value: unknown): void {
  process.stdout.write(`${JSON.stringify(value, null, 2)}\n`);
}

function attach(config: ReturnType<typeof loadBridgeConfig>): Promise<number> {
  return new Promise((resolve, reject) => {
    const child = spawn("opencode", ["attach", config.opencode.baseUrl], {
      cwd: config.repositoryRoot,
      stdio: "inherit",
      env: {
        ...process.env,
        OPENCODE_SERVER_USERNAME: config.opencode.username,
        OPENCODE_SERVER_PASSWORD: config.opencode.password,
      },
    });
    child.once("error", reject);
    child.once("exit", (code, signal) => {
      if (signal) reject(new Error(`opencode attach exited from signal ${signal}`));
      else resolve(code ?? 1);
    });
  });
}

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const command = args.shift();
  if (!command) usage();
  const configPath = option(args, "--config");
  const checkOnly = flag(args, "--check");
  const major = Number(process.versions.node.split(".")[0]);
  const minor = Number(process.versions.node.split(".")[1]);
  if (major < 22 || (major === 22 && minor < 13)) throw new Error("OpenCode bridge requires Node 22.13.0 or newer");

  if (command === "app-registration-url") {
    const repositoryOption = option(args, "--repository");
    const nameOption = option(args, "--name");
    if (checkOnly || args.length > 0 || (!configPath && !repositoryOption)) usage();
    let owner: string;
    let repository: string;
    if (configPath) {
      const config = loadBridgeConfig(configPath);
      owner = config.github.owner;
      repository = config.github.repository;
    } else {
      const match = repositoryOption?.match(/^([A-Za-z0-9_.-]+)\/([A-Za-z0-9_.-]+)$/);
      if (!match) usage();
      owner = match[1]!;
      repository = match[2]!;
    }
    const appName = nameOption ?? `agentic-bridge-${owner}-${repository}`;
    if (!/^[A-Za-z0-9][A-Za-z0-9 _.-]{0,33}$/.test(appName)) throw new Error("GitHub App name must be 1-34 safe characters");
    const query = new URLSearchParams({
      name: appName,
      url: `https://github.com/${owner}/${repository}`,
      public: "false",
      webhook_active: "false",
      issues: "write",
      contents: "read",
    });
    process.stdout.write(`https://github.com/settings/apps/new?${query}\n`);
    return;
  }

  if (args.length > 0) usage();
  const config = loadBridgeConfig(configPath);
  if (command === "status") {
    if (checkOnly) usage();
    const adminClient = new BridgeAdminClient(config.adminSocketFile);
    if (await adminClient.isAvailable()) {
      try {
        json(await adminClient.status());
        return;
      } catch {
        // fall back to disk state
      }
    }
    json(bridgeStatus(config));
    return;
  }
  if (command === "reconcile") {
    if (checkOnly) usage();
    json(await reconcileBridge(config));
    return;
  }
  if (command === "install-scout-runtime") {
    if (checkOnly) usage();
    await installScoutRuntime(config);
    json({ installed: true, runtime: config.opencode.scoutRuntimeRoot, version: "1.18.16" });
    return;
  }
  if (command === "refresh-instances") {
    if (checkOnly) usage();
    json(await refreshOpenCodeInstances(config));
    return;
  }
  if (command === "bootstrap") {
    const result = await checkBridge(config, !checkOnly);
    json(result);
    if (!result.opencodeCompatible || !result.scoutRuntimeReady || Object.values(result.labels).includes("missing") || !result.stateReady) process.exitCode = 1;
    return;
  }
  if (command === "attach") {
    if (checkOnly) {
      json({ repository: config.repositoryRoot, server: config.opencode.baseUrl, credentials: "loaded locally at execution" });
      return;
    }
    process.exitCode = await attach(config);
    return;
  }
  if (command === "run") {
    if (checkOnly) usage();
    await synchronizedGitState(config);
    const controller = new AbortController();
    const service = new BridgeService(config, controller.signal);
    let stopping = false;
    const stop = () => {
      if (stopping) return;
      stopping = true;
      void service.drainControl()
        .catch(() => undefined)
        .finally(() => controller.abort(new Error("Bridge service stopping")));
    };
    process.once("SIGINT", stop);
    process.once("SIGTERM", stop);
    try {
      await service.run();
    } finally {
      process.removeListener("SIGINT", stop);
      process.removeListener("SIGTERM", stop);
    }
    return;
  }
  usage();
}

main().catch((error) => {
  process.stderr.write(`opencode-bridge: ${errorMessage(error)}\n`);
  process.exitCode = 1;
});
