import assert from "node:assert/strict";
import { statSync } from "node:fs";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { BridgeAdminClient, BridgeAdminServer } from "../src/admin.js";
import { reconcileBridge } from "../src/service.js";
import type { BridgeConfig } from "../src/config.js";

test("admin server starts with 0600 permissions, handles status and reconcile, and cleans up on stop", async (t) => {
  const dir = await mkdtemp(join(tmpdir(), "bridge-admin-test-"));
  t.after(async () => await rm(dir, { recursive: true, force: true }));

  const socketPath = join(dir, "admin.sock");
  let statusCount = 0;
  let reconcileCount = 0;

  const server = new BridgeAdminServer(socketPath, {
    onStatus: () => {
      statusCount++;
      return { instance: "test-instance", running: true, active_sessions: 2 };
    },
    onReconcile: () => {
      reconcileCount++;
      return { reconciled: true, status: { instance: "test-instance", running: true } };
    },
  });

  const client = new BridgeAdminClient(socketPath);
  assert.equal(await client.isAvailable(), false);

  await server.start();
  t.after(async () => await server.stop());

  const stat = statSync(socketPath);
  assert.ok(stat.isSocket());
  if (process.platform !== "win32") {
    assert.equal(stat.mode & 0o777, 0o600);
  }

  assert.equal(await client.isAvailable(), true);

  const status = await client.status() as Record<string, unknown>;
  assert.equal(statusCount, 2);
  assert.equal(status.instance, "test-instance");
  assert.equal(status.running, true);
  assert.equal(status.active_sessions, 2);

  const reconcile = await client.reconcile() as Record<string, unknown>;
  assert.equal(reconcileCount, 1);
  assert.equal(reconcile.reconciled, true);

  await server.stop();
  assert.equal(await client.isAvailable(), false);
  await assert.rejects(() => client.status(), /ENOENT|connect|failed/);
});

test("admin server cleans up stale socket and rejects unsupported commands or malformed payloads", async (t) => {
  const dir = await mkdtemp(join(tmpdir(), "bridge-admin-test-"));
  t.after(async () => await rm(dir, { recursive: true, force: true }));

  const socketPath = join(dir, "admin.sock");
  const server = new BridgeAdminServer(socketPath, {
    onStatus: () => ({ running: true }),
    onReconcile: () => ({ reconciled: true }),
  });

  await server.start();

  // Send raw malformed payload via custom request
  const net = await import("node:net");
  const response = await new Promise<string>((resolve, reject) => {
    const sock = net.createConnection(socketPath);
    sock.setEncoding("utf8");
    let received = "";
    sock.on("connect", () => {
      sock.write(JSON.stringify({ command: "unknown_command" }) + "\n");
    });
    sock.on("data", (chunk) => { received += chunk; });
    sock.on("end", () => resolve(received));
    sock.on("error", reject);
  });

  const parsed = JSON.parse(response.trim());
  assert.equal(parsed.ok, false);
  assert.match(parsed.error, /Unsupported admin command/);

  await server.stop();
});

test("reconcileBridge fails closed when bridge is stopped", async () => {
  const config = {
    adminSocketFile: join(tmpdir(), "nonexistent-bridge-admin.sock"),
  } as BridgeConfig;

  await assert.rejects(
    () => reconcileBridge(config),
    /Bridge service is not running; start the bridge before requesting reconciliation\./,
  );
});
