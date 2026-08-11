import assert from "node:assert/strict";
import { chmodSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import test from "node:test";
import { loadBridgeConfig } from "../src/config.js";

function setup(context: test.TestContext): { root: string; configFile: string; document: Record<string, unknown> } {
  const root = mkdtempSync(join(tmpdir(), "bridge-config-test-"));
  context.after(() => rmSync(root, { recursive: true, force: true }));
  const repository = join(root, "repository");
  const privateDirectory = join(root, "private");
  mkdirSync(join(repository, ".git", "bridge"), { recursive: true, mode: 0o700 });
  mkdirSync(join(repository, "contracts", "opencode-bridge"), { recursive: true });
  mkdirSync(privateDirectory, { mode: 0o700 });
  writeFileSync(join(repository, "contracts", "opencode-bridge", "operation-manifest.json"), "{}\n");
  const passwordFile = join(privateDirectory, "opencode-password");
  const privateKeyFile = join(privateDirectory, "github.pem");
  const secretFile = join(privateDirectory, "provider-token");
  writeFileSync(passwordFile, "local-password\n", { mode: 0o600 });
  writeFileSync(privateKeyFile, "-----BEGIN PRIVATE KEY-----\ntest\n-----END PRIVATE KEY-----\n", { mode: 0o600 });
  writeFileSync(secretFile, "provider-value\n", { mode: 0o600 });
  const document = {
    schema_version: 1,
    instance_id: "example-repository",
    repository_root: repository,
    state_file: join(repository, ".git", "bridge", "state.sqlite"),
    opencode: { base_url: "http://127.0.0.1:44123", username: "opencode", password_file: passwordFile },
    github: {
      app_id: "123",
      installation_id: 456,
      private_key_file: privateKeyFile,
      owner: "example",
      repository: "repository",
      allowed_authors: ["orchestrator"],
      comment_author: "agentic-bridge[bot]",
    },
    policy: {
      allowed_mutations: ["session.prompt_async"],
      allowed_local_secret_operations: ["auth.set"],
      secret_refs: { provider: secretFile },
      pty_enabled: false,
      promotion_enabled: false,
    },
  };
  const configFile = join(privateDirectory, "bridge.json");
  writeFileSync(configFile, `${JSON.stringify(document)}\n`, { mode: 0o600 });
  return { root, configFile, document };
}

test("configuration loads local secrets without exposing them in tracked settings", (context) => {
  const { configFile } = setup(context);
  const config = loadBridgeConfig(configFile);
  assert.equal(config.instanceId, "example-repository");
  assert.equal(config.opencode.password, "local-password");
  assert.equal(config.github.privateKey.includes("PRIVATE KEY"), true);
  assert.deepEqual(config.policy.allowedMutations, ["session.prompt_async"]);
  assert.equal(config.policy.resolveSecret("provider"), "provider-value");
  assert.throws(() => config.policy.resolveSecret("missing"), /Unknown local secret_ref/);
  assert.equal(config.manifestFile, resolve(join(config.repositoryRoot, "contracts", "opencode-bridge", "operation-manifest.json")));
});

test("configuration rejects public permissions, tracked state, and unsafe polling", (context) => {
  const { configFile, document } = setup(context);
  chmodSync(configFile, 0o644);
  assert.throws(() => loadBridgeConfig(configFile), /must not be accessible/);
  chmodSync(configFile, 0o600);

  const repository = String(document.repository_root);
  document.state_file = join(repository, "bridge.sqlite");
  writeFileSync(configFile, `${JSON.stringify(document)}\n`, { mode: 0o600 });
  assert.throws(() => loadBridgeConfig(configFile), /outside the tracked working tree/);

  document.state_file = join(repository, ".git", "bridge", "state.sqlite");
  const github = document.github as Record<string, unknown>;
  github.active_interval_ms = 1_000;
  writeFileSync(configFile, `${JSON.stringify(document)}\n`, { mode: 0o600 });
  assert.throws(() => loadBridgeConfig(configFile), /at least 5000ms/);
});
