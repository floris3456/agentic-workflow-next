import { existsSync, lstatSync, readFileSync, statSync } from "node:fs";
import { homedir } from "node:os";
import { dirname, isAbsolute, join, relative, resolve } from "node:path";
import { asRecord, assertPrivateFile } from "./util.js";
import { githubRepositoryIdentity } from "./repository-identity.js";

export interface BridgeConfig {
  configFile: string;
  instanceId: string;
  repositoryRoot: string;
  manifestFile: string;
  stateFile: string;
  opencode: {
    baseUrl: string;
    scoutBaseUrl: string;
    username: string;
    password: string;
    passwordFile: string;
    scoutPassword: string;
    scoutPasswordFile: string;
    scoutRuntimeRoot: string;
    scoutPersistenceRoot: string;
    scoutProviderCredential:
      | { type: "api-key"; apiKey: string; file: string }
      | { type: "oauth"; auth: OpenAiOAuthCredential; file: string };
  };
  github: {
    appId: string;
    installationId: number;
    privateKey: string;
    privateKeyFile: string;
    owner: string;
    repository: string;
    allowedAuthors: string[];
    commentAuthor: string;
    controlLabel: string;
    apiBaseUrl: string;
    gitHost: string;
    activeIntervalMs: number;
    idleIntervalMs: number;
  };
  policy: {
    allowedMutations: string[];
    allowedLocalSecretOperations: string[];
    ptyEnabled: boolean;
    promotionEnabled: boolean;
    resolveSecret: (reference: string) => string;
  };
  privateRoots: string[];
}

export interface OpenAiOAuthCredential {
  type: "oauth";
  access: string;
  refresh: string;
  expires: number;
  accountId: string;
}

function only(record: Record<string, unknown>, allowed: string[], label: string): void {
  const unknown = Object.keys(record).filter((key) => !allowed.includes(key));
  if (unknown.length > 0) throw new TypeError(`${label} contains unknown field ${unknown[0]}`);
}

function requiredString(record: Record<string, unknown>, name: string, label: string): string {
  const value = record[name];
  if (typeof value !== "string" || value.length === 0) throw new TypeError(`${label}.${name} must be a non-empty string`);
  return value;
}

function optionalString(record: Record<string, unknown>, name: string, fallback: string): string {
  const value = record[name] ?? fallback;
  if (typeof value !== "string" || value.length === 0) throw new TypeError(`${name} must be a non-empty string`);
  return value;
}

function positiveInteger(record: Record<string, unknown>, name: string, fallback?: number): number {
  const value = record[name] ?? fallback;
  if (!Number.isSafeInteger(value) || Number(value) < 1) throw new TypeError(`${name} must be a positive integer`);
  return Number(value);
}

function stringArray(record: Record<string, unknown>, name: string): string[] {
  const value = record[name] ?? [];
  if (!Array.isArray(value) || value.some((entry) => typeof entry !== "string" || entry.length === 0)) throw new TypeError(`${name} must be an array of non-empty strings`);
  return [...new Set(value as string[])];
}

function localPath(value: string, base: string): string {
  const expanded = value === "~" || value.startsWith("~/") ? join(homedir(), value.slice(2)) : value;
  return resolve(base, expanded);
}

function privateText(path: string, label: string, maximum: number, rejectSymlink = false): string {
  if (!existsSync(path) || (rejectSymlink ? !lstatSync(path).isFile() : !statSync(path).isFile())) {
    throw new Error(`${label} is not a regular file: ${path}`);
  }
  assertPrivateFile(path, label);
  const value = readFileSync(path, "utf8");
  if (Buffer.byteLength(value, "utf8") > maximum || value.includes("\0")) throw new Error(`${label} is invalid`);
  const trimmed = value.replace(/[\r\n]+$/, "");
  if (trimmed.length === 0) throw new Error(`${label} is empty`);
  return trimmed;
}

export function readOpenAiOAuthCredential(path: string): OpenAiOAuthCredential {
  const document = asRecord(JSON.parse(privateText(path, "Scout provider OAuth file", 128_000, true)), "Scout provider OAuth file");
  only(document, ["openai"], "Scout provider OAuth file");
  const credential = asRecord(document.openai, "Scout provider OAuth credential");
  only(credential, ["type", "access", "refresh", "expires", "accountId"], "Scout provider OAuth credential");
  if (credential.type !== "oauth") throw new TypeError("Scout provider OAuth credential.type must be oauth");
  const access = requiredString(credential, "access", "Scout provider OAuth credential");
  const refresh = requiredString(credential, "refresh", "Scout provider OAuth credential");
  const accountId = requiredString(credential, "accountId", "Scout provider OAuth credential");
  const expires = positiveInteger(credential, "expires");
  return { type: "oauth", access, refresh, expires, accountId };
}

function absoluteRepository(path: string): string {
  if (!isAbsolute(path)) throw new Error("repository_root must be absolute");
  const root = resolve(path);
  if (!existsSync(root) || !statSync(root).isDirectory() || !existsSync(join(root, ".git"))) throw new Error(`repository_root is not a Git checkout: ${root}`);
  return root;
}

function stateOutsideTrackedTree(repositoryRoot: string, stateFile: string): void {
  const fromRoot = relative(repositoryRoot, stateFile);
  if (fromRoot === "" || (!fromRoot.startsWith("..") && !isAbsolute(fromRoot) && fromRoot !== ".git" && !fromRoot.startsWith(`.git${process.platform === "win32" ? "\\" : "/"}`))) {
    throw new Error("state_file must be outside the tracked working tree or beneath its Git directory");
  }
}

function loopbackOrigin(value: string, label: string): string {
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    throw new Error(`${label} must be a loopback HTTP URL`);
  }
  const hostname = url.hostname.replace(/^\[|\]$/g, "");
  if (url.protocol !== "http:" || !["127.0.0.1", "localhost", "::1"].includes(hostname)
    || url.username || url.password || url.pathname !== "/" || url.search || url.hash || !url.port) {
    throw new Error(`${label} must be a credential-free loopback HTTP origin with an explicit port`);
  }
  return url.origin;
}

function runtimeOutsideRepository(repositoryRoot: string, runtimeRoot: string): void {
  if (!isAbsolute(runtimeRoot)) throw new Error("opencode.scout_runtime_root must be absolute");
  const fromRepository = relative(repositoryRoot, runtimeRoot);
  if (fromRepository === "" || (!fromRepository.startsWith("..") && !isAbsolute(fromRepository))) {
    throw new Error("opencode.scout_runtime_root must be outside repository_root");
  }
}

export function defaultConfigPath(): string {
  return join(homedir(), ".config", "agentic-workflow", "opencode-bridge.json");
}

export function loadBridgeConfig(inputPath = defaultConfigPath()): BridgeConfig {
  const configFile = resolve(inputPath);
  assertPrivateFile(configFile, "Bridge configuration");
  const root = asRecord(JSON.parse(readFileSync(configFile, "utf8")) as unknown, "bridge configuration");
  only(root, ["schema_version", "instance_id", "repository_root", "manifest_file", "state_file", "opencode", "github", "policy"], "Bridge configuration");
  if (root.schema_version !== 1) throw new TypeError("Unsupported bridge configuration schema_version");
  const instanceId = requiredString(root, "instance_id", "Bridge configuration");
  if (!/^[A-Za-z0-9][A-Za-z0-9._-]{0,63}$/.test(instanceId)) throw new TypeError("instance_id is invalid");
  const base = dirname(configFile);
  const repositoryRoot = absoluteRepository(requiredString(root, "repository_root", "Bridge configuration"));
  const manifestFile = localPath(optionalString(root, "manifest_file", join(repositoryRoot, "contracts", "opencode-bridge", "operation-manifest.json")), base);
  if (!existsSync(manifestFile) || !statSync(manifestFile).isFile()) throw new Error(`Operation manifest does not exist: ${manifestFile}`);
  const stateFile = localPath(requiredString(root, "state_file", "Bridge configuration"), base);
  stateOutsideTrackedTree(repositoryRoot, stateFile);

  const opencode = asRecord(root.opencode, "opencode configuration");
  only(opencode, ["base_url", "scout_base_url", "username", "password_file", "scout_password_file", "scout_runtime_root", "scout_provider_api_key_file", "scout_provider_oauth_file"], "opencode configuration");
  const passwordFile = localPath(requiredString(opencode, "password_file", "opencode configuration"), base);
  const password = privateText(passwordFile, "OpenCode password file", 16_384);
  const scoutPasswordFile = localPath(requiredString(opencode, "scout_password_file", "opencode configuration"), base);
  const scoutPassword = privateText(scoutPasswordFile, "Scout OpenCode password file", 16_384);
  const scoutRuntimeRoot = localPath(requiredString(opencode, "scout_runtime_root", "opencode configuration"), base);
  runtimeOutsideRepository(repositoryRoot, scoutRuntimeRoot);
  const scoutPersistenceRoot = `${scoutRuntimeRoot}-persistence`;
  runtimeOutsideRepository(repositoryRoot, scoutPersistenceRoot);
  const apiKeySetting = opencode.scout_provider_api_key_file;
  const oauthSetting = opencode.scout_provider_oauth_file;
  if ((apiKeySetting === undefined) === (oauthSetting === undefined)) {
    throw new Error("opencode requires exactly one of scout_provider_api_key_file or scout_provider_oauth_file");
  }
  let scoutProviderCredential: BridgeConfig["opencode"]["scoutProviderCredential"];
  if (apiKeySetting !== undefined) {
    const file = localPath(requiredString(opencode, "scout_provider_api_key_file", "opencode configuration"), base);
    scoutProviderCredential = { type: "api-key", apiKey: privateText(file, "Scout provider API key file", 16_384), file };
  } else {
    const configuredFile = localPath(requiredString(opencode, "scout_provider_oauth_file", "opencode configuration"), base);
    const persistentFile = join(scoutPersistenceRoot, "data", "opencode", "auth.json");
    const legacyFile = join(scoutRuntimeRoot, "data", "opencode", "auth.json");
    if (configuredFile !== persistentFile && configuredFile !== legacyFile) {
      throw new Error("opencode.scout_provider_oauth_file must be the Scout persistence root's isolated data/opencode/auth.json");
    }
    const sourceFile = existsSync(persistentFile) ? persistentFile : configuredFile;
    scoutProviderCredential = { type: "oauth", auth: readOpenAiOAuthCredential(sourceFile), file: persistentFile };
  }
  const baseUrl = loopbackOrigin(requiredString(opencode, "base_url", "opencode configuration"), "opencode.base_url");
  const scoutBaseUrl = loopbackOrigin(requiredString(opencode, "scout_base_url", "opencode configuration"), "opencode.scout_base_url");
  if (baseUrl === scoutBaseUrl) throw new Error("opencode.scout_base_url must be distinct from opencode.base_url");
  const username = optionalString(opencode, "username", "opencode");
  if (/[\r\n:]/.test(username)) throw new TypeError("OpenCode username is invalid");

  const github = asRecord(root.github, "github configuration");
  only(github, ["app_id", "installation_id", "private_key_file", "owner", "repository", "allowed_authors", "comment_author", "control_label", "api_base_url", "git_host", "active_interval_ms", "idle_interval_ms"], "github configuration");
  const rawAppId = github.app_id;
  const appId = typeof rawAppId === "number" || typeof rawAppId === "string" ? String(rawAppId) : "";
  if (!/^\d+$/.test(appId)) throw new TypeError("github.app_id must be numeric");
  const privateKeyFile = localPath(requiredString(github, "private_key_file", "github configuration"), base);
  const privateKey = privateText(privateKeyFile, "GitHub App private key", 128_000);
  if (!privateKey.includes("PRIVATE KEY")) throw new Error("GitHub App private key is invalid");
  const owner = requiredString(github, "owner", "github configuration");
  const repository = requiredString(github, "repository", "github configuration");
  if (!/^[A-Za-z0-9_.-]+$/.test(owner) || !/^[A-Za-z0-9_.-]+$/.test(repository)) throw new TypeError("GitHub owner or repository is invalid");
  const apiBaseUrl = optionalString(github, "api_base_url", "https://api.github.com");
  const identity = githubRepositoryIdentity({
    apiBaseUrl,
    owner,
    repository,
    ...(github.git_host === undefined ? {} : { gitHost: requiredString(github, "git_host", "github configuration") }),
  });
  const allowedAuthors = stringArray(github, "allowed_authors");
  if (allowedAuthors.length === 0) throw new Error("github.allowed_authors must not be empty");
  const commentAuthor = requiredString(github, "comment_author", "github configuration");
  if (!commentAuthor.toLowerCase().endsWith("[bot]")) throw new TypeError("github.comment_author must be the GitHub App bot login");
  const activeIntervalMs = positiveInteger(github, "active_interval_ms", 5_000);
  const idleIntervalMs = positiveInteger(github, "idle_interval_ms", 30_000);
  if (activeIntervalMs < 5_000 || idleIntervalMs < activeIntervalMs) throw new Error("GitHub polling intervals must be at least 5000ms and idle must not be faster than active");

  const policy = root.policy === undefined ? {} : asRecord(root.policy, "policy configuration");
  only(policy, ["allowed_mutations", "allowed_local_secret_operations", "secret_refs", "pty_enabled", "promotion_enabled"], "policy configuration");
  if (policy.pty_enabled !== undefined && typeof policy.pty_enabled !== "boolean") throw new TypeError("policy.pty_enabled must be boolean");
  if (policy.promotion_enabled !== undefined && typeof policy.promotion_enabled !== "boolean") throw new TypeError("policy.promotion_enabled must be boolean");
  const secretRefs = policy.secret_refs === undefined ? {} : asRecord(policy.secret_refs, "policy.secret_refs");
  const secretFiles = new Map<string, string>();
  for (const [reference, value] of Object.entries(secretRefs)) {
    if (!/^[A-Za-z0-9][A-Za-z0-9._-]{0,63}$/.test(reference) || typeof value !== "string") throw new TypeError("policy.secret_refs is invalid");
    secretFiles.set(reference, localPath(value, base));
  }

  return {
    configFile,
    instanceId,
    repositoryRoot,
    manifestFile,
    stateFile,
    opencode: {
      baseUrl,
      scoutBaseUrl,
      username,
      password,
      passwordFile,
      scoutPassword,
      scoutPasswordFile,
      scoutRuntimeRoot,
      scoutPersistenceRoot,
      scoutProviderCredential,
    },
    github: {
      appId,
      installationId: positiveInteger(github, "installation_id"),
      privateKey,
      privateKeyFile,
      owner,
      repository,
      allowedAuthors,
      commentAuthor,
      controlLabel: optionalString(github, "control_label", "agentic-bridge"),
      apiBaseUrl: identity.apiBaseUrl.href,
      gitHost: identity.gitHost,
      activeIntervalMs,
      idleIntervalMs,
    },
    policy: {
      allowedMutations: stringArray(policy, "allowed_mutations"),
      allowedLocalSecretOperations: stringArray(policy, "allowed_local_secret_operations"),
      ptyEnabled: policy.pty_enabled === true,
      promotionEnabled: policy.promotion_enabled === true,
      resolveSecret: (reference) => {
        const file = secretFiles.get(reference);
        if (!file) throw new Error(`Unknown local secret_ref ${reference}`);
        return privateText(file, `Secret reference ${reference}`, 1_000_000);
      },
    },
    privateRoots: [...new Set([repositoryRoot, scoutRuntimeRoot, scoutPersistenceRoot, base, homedir()])],
  };
}
