import assert from "node:assert/strict";
import { chmodSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import test from "node:test";
import { loadBridgeConfig } from "../src/config.js";
import { bridgeStatus } from "../src/service.js";

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
  const scoutPasswordFile = join(privateDirectory, "scout-password");
  const privateKeyFile = join(privateDirectory, "github.pem");
  const secretFile = join(privateDirectory, "provider-token");
  writeFileSync(passwordFile, "local-password\n", { mode: 0o600 });
  writeFileSync(scoutPasswordFile, "scout-password\n", { mode: 0o600 });
  writeFileSync(privateKeyFile, "-----BEGIN PRIVATE KEY-----\ntest\n-----END PRIVATE KEY-----\n", { mode: 0o600 });
  writeFileSync(secretFile, "provider-value\n", { mode: 0o600 });
  const document = {
    schema_version: 1,
    instance_id: "example-repository",
    repository_root: repository,
    state_file: join(repository, ".git", "bridge", "state.sqlite"),
    opencode: {
      base_url: "http://127.0.0.1:44123",
      scout_base_url: "http://127.0.0.1:44124",
      username: "opencode",
      password_file: passwordFile,
      scout_password_file: scoutPasswordFile,
      scout_runtime_root: join(privateDirectory, "scout-runtime"),
      scout_provider_api_key_file: secretFile,
    },
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
  assert.equal(config.opencode.scoutPassword, "scout-password");
  assert.equal(config.opencode.scoutBaseUrl, "http://127.0.0.1:44124");
  assert.equal(config.opencode.scoutProviderCredential.type, "api-key");
  assert.equal(config.github.privateKey.includes("PRIVATE KEY"), true);
  assert.equal(config.github.apiBaseUrl, "https://api.github.com/");
  assert.equal(config.github.gitHost, "github.com");
  assert.deepEqual(config.policy.allowedMutations, ["session.prompt_async"]);
  assert.equal(config.policy.resolveSecret("provider"), "provider-value");
  assert.throws(() => config.policy.resolveSecret("missing"), /Unknown local secret_ref/);
  assert.equal(config.manifestFile, resolve(join(config.repositoryRoot, "contracts", "opencode-bridge", "operation-manifest.json")));
});

test("configuration accepts one isolated OpenAI OAuth credential without other providers", (context) => {
  const { configFile, document } = setup(context);
  const opencode = document.opencode as Record<string, unknown>;
  const runtime = String(opencode.scout_runtime_root);
  const oauthFile = join(runtime, "data", "opencode", "auth.json");
  mkdirSync(dirname(oauthFile), { recursive: true, mode: 0o700 });
  writeFileSync(oauthFile, `${JSON.stringify({
    openai: { type: "oauth", access: "access-token", refresh: "refresh-token", expires: 2_000_000_000_000, accountId: "account-id" },
  })}\n`, { mode: 0o600 });
  delete opencode.scout_provider_api_key_file;
  opencode.scout_provider_oauth_file = oauthFile;
  writeFileSync(configFile, `${JSON.stringify(document)}\n`, { mode: 0o600 });

  const config = loadBridgeConfig(configFile);
  assert.deepEqual(config.opencode.scoutProviderCredential, {
    type: "oauth",
    file: oauthFile,
    auth: { type: "oauth", access: "access-token", refresh: "refresh-token", expires: 2_000_000_000_000, accountId: "account-id" },
  });

  opencode.scout_provider_api_key_file = join(dirname(oauthFile), "api-key");
  writeFileSync(String(opencode.scout_provider_api_key_file), "api-key\n", { mode: 0o600 });
  writeFileSync(configFile, `${JSON.stringify(document)}\n`, { mode: 0o600 });
  assert.throws(() => loadBridgeConfig(configFile), /exactly one/);
});

test("configuration requires distinct explicit developer and Scout loopback origins", (context) => {
  const { configFile, document } = setup(context);
  const opencode = document.opencode as Record<string, unknown>;
  opencode.scout_base_url = opencode.base_url;
  writeFileSync(configFile, `${JSON.stringify(document)}\n`, { mode: 0o600 });
  assert.throws(() => loadBridgeConfig(configFile), /must be distinct/);
  opencode.scout_base_url = "https://127.0.0.1:44124";
  writeFileSync(configFile, `${JSON.stringify(document)}\n`, { mode: 0o600 });
  assert.throws(() => loadBridgeConfig(configFile), /loopback HTTP origin/);
});

test("configuration requires an unambiguous Git host for custom API bases", (context) => {
  const { configFile, document } = setup(context);
  const github = document.github as Record<string, unknown>;
  github.api_base_url = "https://api.enterprise.example/custom/";
  writeFileSync(configFile, `${JSON.stringify(document)}\n`, { mode: 0o600 });
  assert.throws(() => loadBridgeConfig(configFile), /git_host is required/);

  github.git_host = "git.enterprise.example";
  writeFileSync(configFile, `${JSON.stringify(document)}\n`, { mode: 0o600 });
  assert.equal(loadBridgeConfig(configFile).github.gitHost, "git.enterprise.example");

  github.api_base_url = "https://git.enterprise.example/api/v3";
  github.git_host = "other.enterprise.example";
  writeFileSync(configFile, `${JSON.stringify(document)}\n`, { mode: 0o600 });
  assert.throws(() => loadBridgeConfig(configFile), /conflicts/);
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

test("status reports the hardened Scout runtime blocker before state initialization", (context) => {
  const { configFile } = setup(context);
  const status = bridgeStatus(loadBridgeConfig(configFile)) as Record<string, unknown>;
  assert.equal(status.initialized, false);
  const boundary = status.scout_runtime as Record<string, unknown>;
  assert.equal(boundary.ready, false);
  assert.match(String(boundary.reason), /Hardened Scout runtime/);
});
