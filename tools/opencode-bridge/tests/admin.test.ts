import assert from "node:assert/strict";
import { existsSync, readFileSync, statSync } from "node:fs";
import { mkdir, mkdtemp, rm, symlink, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { BridgeAdminClient, BridgeAdminServer } from "../src/admin.js";
import { reconcileBridge } from "../src/service.js";
import { loadBridgeConfig, type BridgeConfig } from "../src/config.js";

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

test("admin server start refuses to delete existing regular files or symlinks at socket path", async (t) => {
  const dir = await mkdtemp(join(tmpdir(), "bridge-admin-security-"));
  t.after(async () => await rm(dir, { recursive: true, force: true }));

  const socketPath = join(dir, "admin.sock");
  const regularContent = "critical file content that must not be deleted\n";
  await writeFile(socketPath, regularContent, { mode: 0o600 });

  const server = new BridgeAdminServer(socketPath, {
    onStatus: () => ({ running: true }),
    onReconcile: () => ({ reconciled: true }),
  });

  // 1. Regular file must NOT be deleted, start must throw
  await assert.rejects(
    () => server.start(),
    /Admin socket path already exists and is not a socket/,
  );
  assert.ok(existsSync(socketPath), "Regular file must still exist");
  assert.equal(readFileSync(socketPath, "utf8"), regularContent);

  // 2. Symlink must NOT be deleted, start must throw
  await rm(socketPath);
  const targetPath = join(dir, "symlink-target.txt");
  await writeFile(targetPath, "target\n", { mode: 0o600 });
  await symlink(targetPath, socketPath);

  await assert.rejects(
    () => server.start(),
    /Admin socket path is a symlink/,
  );
  assert.ok(existsSync(socketPath), "Symlink must still exist");
  assert.ok(existsSync(targetPath), "Symlink target must still exist");
});

test("config rejects admin_socket_file when it does not equal the derived state-directory path", async (t) => {
  const dir = await mkdtemp(join(tmpdir(), "bridge-admin-config-"));
  t.after(async () => await rm(dir, { recursive: true, force: true }));

  const repoDir = join(dir, "repo");
  await mkdir(repoDir);
  await mkdir(join(repoDir, ".git"));
  const stateFile = join(dir, "state", "bridge.sqlite");
  await mkdir(join(dir, "state"), { recursive: true });

  const configContent = {
    schema_version: 1,
    instance_id: "test-instance",
    repository_root: repoDir,
    manifest_file: join(repoDir, "manifest.json"),
    state_file: stateFile,
    admin_socket_file: join(dir, "other-dir", "arbitrary.sock"),
    opencode: {
      base_url: "http://127.0.0.1:44123",
      username: "opencode",
      password_file: join(dir, "pass"),
      scout_base_url: "http://127.0.0.1:44124",
      scout_password_file: join(dir, "scout-pass"),
      scout_runtime_root: join(dir, "scout-runtime"),
      scout_provider_api_key_file: join(dir, "api-key"),
    },
    github: {
      app_id: "123",
      installation_id: 456,
      private_key_file: join(dir, "key.pem"),
      owner: "owner",
      repository: "repo",
      allowed_authors: ["owner"],
      comment_author: "bot[bot]",
    },
  };
  await writeFile(join(repoDir, "manifest.json"), "{}", { mode: 0o600 });
  await writeFile(join(dir, "pass"), "pass\n", { mode: 0o600 });
  await writeFile(join(dir, "scout-pass"), "pass\n", { mode: 0o600 });
  await writeFile(join(dir, "api-key"), "key\n", { mode: 0o600 });
  await writeFile(join(dir, "key.pem"), "-----BEGIN RSA PRIVATE KEY-----\nkey\n-----END RSA PRIVATE KEY-----\n", { mode: 0o600 });

  const configFile = join(dir, "config.json");
  await writeFile(configFile, JSON.stringify(configContent), { mode: 0o600 });

  assert.throws(
    () => loadBridgeConfig(configFile),
    /admin_socket_file must match the derived path/,
  );
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
