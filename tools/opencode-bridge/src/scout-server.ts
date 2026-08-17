import { execFile, spawn, type ChildProcess } from "node:child_process";
import { createHash } from "node:crypto";
import {
  chmodSync, cpSync, existsSync, lstatSync, mkdirSync, readFileSync, readdirSync,
  realpathSync, renameSync, rmSync, statSync, writeFileSync,
} from "node:fs";
import { basename, dirname, isAbsolute, join, relative, resolve } from "node:path";
import { readOpenAiOAuthCredential, type BridgeConfig } from "./config.js";
import { Manifest } from "./manifest.js";
import { OpenCodeClient } from "./opencode.js";
import { assertScoutAgentContract } from "./scout.js";
import { asRecord, ensurePrivateDirectory, sleep } from "./util.js";

export const scoutRuntimeVersion = "1.18.16";
const trustedFiles = ["package.json", "package-lock.json", "opencode.json", "plugins/scout-tools.mjs"] as const;

export interface ScoutRuntimeInstallOptions {
  installDependencies?: (configDirectory: string) => void | Promise<void>;
}

export interface ScoutRuntimePaths {
  runtimeRoot: string;
  configDirectory: string;
  homeDirectory: string;
  cacheDirectory: string;
  temporaryDirectory: string;
  persistenceRoot: string;
  dataDirectory: string;
  stateDirectory: string;
  authFile: string;
}

export function scoutRuntimePaths(config: BridgeConfig): ScoutRuntimePaths {
  const runtimeRoot = resolve(config.opencode.scoutRuntimeRoot);
  const persistenceRoot = resolve(config.opencode.scoutPersistenceRoot);
  return {
    runtimeRoot,
    configDirectory: join(runtimeRoot, "config"),
    homeDirectory: join(runtimeRoot, "home"),
    cacheDirectory: join(runtimeRoot, "cache"),
    temporaryDirectory: join(runtimeRoot, "tmp"),
    persistenceRoot,
    dataDirectory: join(persistenceRoot, "data"),
    stateDirectory: join(persistenceRoot, "state"),
    authFile: join(persistenceRoot, "data", "opencode", "auth.json"),
  };
}

function sourceRoot(repositoryRoot: string): string {
  return join(repositoryRoot, "tools", "opencode-bridge", "scout-runtime");
}

function digest(path: string): string {
  return createHash("sha256").update(readFileSync(path)).digest("hex");
}

function execute(command: string, args: string[], cwd: string, env?: NodeJS.ProcessEnv): Promise<string> {
  return new Promise((resolvePromise, reject) => {
    execFile(command, args, { cwd, env, timeout: 180_000, maxBuffer: 2 * 1024 * 1024 }, (error, stdout, stderr) => {
      if (error) {
        const detail = String(stderr || stdout).trim();
        reject(new Error(detail ? `${error.message}: ${detail}` : error.message));
      } else resolvePromise(String(stdout).trim());
    });
  });
}

function removeInstalled(path: string): void {
  if (!existsSync(path)) return;
  const visit = (current: string): void => {
    const stat = lstatSync(current);
    if (stat.isSymbolicLink()) return;
    if (stat.isDirectory()) {
      chmodSync(current, 0o700);
      for (const name of readdirSync(current)) visit(join(current, name));
    } else chmodSync(current, 0o600);
  };
  visit(path);
  rmSync(path, { recursive: true, force: true });
}

function lockReadOnly(path: string, root = path): void {
  const stat = lstatSync(path);
  if (stat.isSymbolicLink()) {
    const target = realpathSync(path);
    const fromRoot = relative(root, target);
    if (fromRoot.startsWith("..") || isAbsolute(fromRoot)) throw new Error(`Scout runtime installation symlink escapes its root: ${path}`);
    return;
  }
  if (stat.isDirectory()) {
    for (const name of readdirSync(path)) lockReadOnly(join(path, name), root);
    chmodSync(path, 0o555);
  } else chmodSync(path, (stat.mode & 0o111) === 0 ? 0o444 : 0o555);
}

function assertReadOnlyTree(path: string, root = path): void {
  const stat = lstatSync(path);
  if (stat.isSymbolicLink()) {
    const target = realpathSync(path);
    const fromRoot = relative(root, target);
    if (fromRoot.startsWith("..") || isAbsolute(fromRoot)) throw new Error(`Hardened Scout runtime symlink escapes config: ${path}`);
    return;
  }
  if ((stat.mode & 0o222) !== 0) throw new Error(`Hardened Scout runtime config tree is writable: ${path}`);
  if (stat.isDirectory()) for (const name of readdirSync(path)) assertReadOnlyTree(join(path, name), root);
}

function pathInside(parent: string, child: string): boolean {
  const fromParent = relative(parent, child);
  return fromParent === "" || (!fromParent.startsWith("..") && !isAbsolute(fromParent));
}

function privatePersistenceDirectory(path: string, label: string, create: boolean): void {
  if (!existsSync(path)) {
    if (!create) throw new Error(`${label} is absent: ${path}`);
    mkdirSync(path, { mode: 0o700 });
  }
  const stat = lstatSync(path);
  if (stat.isSymbolicLink() || !stat.isDirectory()) throw new Error(`${label} must be a regular non-symlink directory: ${path}`);
  if ((stat.mode & 0o077) !== 0) throw new Error(`${label} must not be accessible by group or other users: ${path}`);
}

function assertPersistenceTree(path: string): void {
  const stat = lstatSync(path);
  if (stat.isSymbolicLink()) throw new Error(`Scout persistence must not contain symlinks: ${path}`);
  if (stat.isDirectory()) {
    for (const name of readdirSync(path)) assertPersistenceTree(join(path, name));
    return;
  }
  if (!stat.isFile()) throw new Error(`Scout persistence contains an unsupported filesystem entry: ${path}`);
}

function assertScoutPersistence(config: BridgeConfig, create: boolean): ScoutRuntimePaths {
  const paths = scoutRuntimePaths(config);
  if (paths.persistenceRoot !== resolve(`${paths.runtimeRoot}-persistence`)) {
    throw new Error("Scout persistence root must be the derived runtime sibling");
  }
  const parent = dirname(paths.persistenceRoot);
  if (create) ensurePrivateDirectory(parent);
  if (!existsSync(parent)) throw new Error(`Scout persistence parent is absent: ${parent}`);
  const parentStat = lstatSync(parent);
  if (parentStat.isSymbolicLink() || !parentStat.isDirectory()) {
    throw new Error(`Scout persistence parent must be a regular non-symlink directory: ${parent}`);
  }
  const repository = realpathSync(config.repositoryRoot);
  const canonicalParent = realpathSync(parent);
  const intendedPersistence = join(canonicalParent, basename(paths.persistenceRoot));
  if (pathInside(repository, intendedPersistence)) throw new Error("Scout persistence resolves inside repository_root");
  if (pathInside(paths.runtimeRoot, paths.persistenceRoot) || pathInside(paths.persistenceRoot, paths.runtimeRoot)) {
    throw new Error("Scout runtime and persistence roots must not overlap");
  }
  const runtimeParent = dirname(paths.runtimeRoot);
  const intendedRuntime = existsSync(runtimeParent)
    ? join(realpathSync(runtimeParent), basename(paths.runtimeRoot))
    : paths.runtimeRoot;
  if (pathInside(intendedRuntime, intendedPersistence) || pathInside(intendedPersistence, intendedRuntime)) {
    throw new Error("Scout runtime and persistence roots resolve to overlapping paths");
  }
  privatePersistenceDirectory(paths.persistenceRoot, "Scout persistence root", create);
  privatePersistenceDirectory(paths.dataDirectory, "Scout persistence data directory", create);
  privatePersistenceDirectory(paths.stateDirectory, "Scout persistence state directory", create);
  assertPersistenceTree(paths.persistenceRoot);

  const persistence = realpathSync(paths.persistenceRoot);
  if (pathInside(repository, persistence)) throw new Error("Scout persistence resolves inside repository_root");
  if (existsSync(paths.runtimeRoot)) {
    const runtime = realpathSync(paths.runtimeRoot);
    if (pathInside(runtime, persistence) || pathInside(persistence, runtime)) {
      throw new Error("Scout runtime and persistence roots resolve to overlapping paths");
    }
  }
  if (!create) {
    if (config.opencode.scoutProviderCredential.type === "api-key") {
      if (existsSync(paths.authFile)) throw new Error("Scout persistent OAuth file must be absent in API-key mode");
    } else {
      readOpenAiOAuthCredential(paths.authFile);
    }
  }
  return paths;
}

async function installDependencies(configDirectory: string): Promise<void> {
  await execute("npm", ["ci", "--omit=dev", "--no-audit", "--no-fund"], configDirectory, {
    PATH: process.env.PATH,
    HOME: process.env.HOME,
  });
  await execute(process.execPath, ["postinstall.mjs"], join(configDirectory, "node_modules", "opencode-ai"), {
    PATH: process.env.PATH,
    HOME: process.env.HOME,
  });
}

function persistProviderCredential(config: BridgeConfig, paths: ScoutRuntimePaths): void {
  const authDirectory = dirname(paths.authFile);
  if (existsSync(authDirectory)) privatePersistenceDirectory(authDirectory, "Scout persistence auth directory", false);
  else mkdirSync(authDirectory, { recursive: true, mode: 0o700 });
  if (existsSync(paths.authFile)) {
    const stat = lstatSync(paths.authFile);
    if (stat.isSymbolicLink() || !stat.isFile()) throw new Error(`Scout provider auth must be a regular non-symlink file: ${paths.authFile}`);
    if ((stat.mode & 0o077) !== 0) throw new Error(`Scout provider auth must not be accessible by group or other users: ${paths.authFile}`);
  }
  if (config.opencode.scoutProviderCredential.type === "api-key") {
    rmSync(paths.authFile, { force: true });
    return;
  }
  const temporary = `${paths.authFile}.installing-${process.pid}`;
  rmSync(temporary, { force: true });
  writeFileSync(temporary, `${JSON.stringify({ openai: config.opencode.scoutProviderCredential.auth })}\n`, { mode: 0o600 });
  renameSync(temporary, paths.authFile);
}

export async function installScoutRuntime(config: BridgeConfig, options: ScoutRuntimeInstallOptions = {}): Promise<void> {
  if (process.platform !== "linux" || process.getuid?.() === 0) throw new Error("Hardened Scout runtime installation supports non-root Linux operators only");
  const paths = assertScoutPersistence(config, true);
  const root = paths.runtimeRoot;
  const parent = dirname(root);
  ensurePrivateDirectory(parent);
  const temporary = `${root}.installing-${process.pid}`;
  removeInstalled(temporary);
  mkdirSync(temporary, { mode: 0o700 });
  const configDirectory = join(temporary, "config");
  cpSync(sourceRoot(config.repositoryRoot), configDirectory, { recursive: true, errorOnExist: true, force: false });
  await (options.installDependencies ?? installDependencies)(configDirectory);
  for (const name of ["home", "cache", "tmp"]) mkdirSync(join(temporary, name), { mode: 0o700 });
  persistProviderCredential(config, paths);
  assertScoutPersistence(config, false);
  lockReadOnly(configDirectory);
  removeInstalled(root);
  renameSync(temporary, root);
  assertScoutRuntimeInstallation(config);
}

export function assertScoutRuntimeInstallation(config: BridgeConfig): { ready: true; reason: string } {
  if (process.platform !== "linux" || process.getuid?.() === 0) throw new Error("Hardened Scout runtime supports non-root Linux operators only");
  const root = resolve(config.opencode.scoutRuntimeRoot);
  if (!existsSync(root)) throw new Error(`Hardened Scout runtime installation is absent: ${root}`);
  assertScoutPersistence(config, false);
  const repository = realpathSync(config.repositoryRoot);
  const installed = realpathSync(root);
  const fromRepository = relative(repository, installed);
  if (fromRepository === "" || (!fromRepository.startsWith("..") && !fromRepository.startsWith("/"))) {
    throw new Error("Hardened Scout runtime resolves inside repository_root");
  }
  const configDirectory = join(installed, "config");
  assertReadOnlyTree(configDirectory);
  for (const name of trustedFiles) {
    const source = join(sourceRoot(repository), name);
    const target = join(configDirectory, name);
    if (!existsSync(target) || digest(source) !== digest(target)) throw new Error(`Hardened Scout trusted file mismatch: ${name}`);
    if ((statSync(target).mode & 0o222) !== 0) throw new Error(`Hardened Scout trusted file is writable: ${name}`);
  }
  for (const packageName of ["@opencode-ai/plugin", "opencode-ai"]) {
    const document = asRecord(JSON.parse(readFileSync(join(configDirectory, "node_modules", ...packageName.split("/"), "package.json"), "utf8")), `${packageName} package`);
    if (document.version !== scoutRuntimeVersion) throw new Error(`${packageName} is not pinned to ${scoutRuntimeVersion}`);
  }
  const binary = join(configDirectory, "node_modules", ".bin", "opencode");
  if (!existsSync(binary) || (statSync(binary).mode & 0o111) === 0) throw new Error("Pinned Scout OpenCode executable is missing");
  const binaryTarget = realpathSync(binary);
  const fromConfig = relative(configDirectory, binaryTarget);
  if (fromConfig.startsWith("..") || isAbsolute(fromConfig)) throw new Error("Pinned Scout OpenCode executable escapes the installed runtime");
  return { ready: true, reason: `installed immutable OpenCode ${scoutRuntimeVersion} runtime, trusted tools, and private persistent state verified` };
}

function serverAddress(baseUrl: string): { hostname: string; port: string } {
  const url = new URL(baseUrl);
  return { hostname: url.hostname.replace(/^\[|\]$/g, ""), port: url.port };
}

export function scoutServerEnvironment(config: BridgeConfig, snapshots: string): NodeJS.ProcessEnv {
  const paths = assertScoutPersistence(config, false);
  const root = realpathSync(paths.runtimeRoot);
  const configDirectory = join(root, "config");
  const environment: NodeJS.ProcessEnv = {
    HOME: paths.homeDirectory,
    XDG_CONFIG_HOME: join(paths.homeDirectory, ".config"),
    XDG_DATA_HOME: paths.dataDirectory,
    XDG_CACHE_HOME: paths.cacheDirectory,
    XDG_STATE_HOME: paths.stateDirectory,
    TMPDIR: paths.temporaryDirectory,
    PATH: `${join(configDirectory, "node_modules", ".bin")}:/usr/bin:/bin`,
    LANG: "C.UTF-8",
    LC_ALL: "C.UTF-8",
    SHELL: "/bin/false",
    OPENCODE_SERVER_USERNAME: config.opencode.username,
    OPENCODE_SERVER_PASSWORD: config.opencode.scoutPassword,
    OPENCODE_CONFIG_DIR: configDirectory,
    OPENCODE_TEST_MANAGED_CONFIG_DIR: join(configDirectory, "managed-config-disabled"),
    OPENCODE_DISABLE_PROJECT_CONFIG: "1",
    OPENCODE_DISABLE_DEFAULT_PLUGINS: "1",
    OPENCODE_DISABLE_EXTERNAL_SKILLS: "1",
    OPENCODE_DISABLE_CLAUDE_CODE_SKILLS: "1",
    OPENCODE_DISABLE_WATCHER: "1",
    OPENCODE_DISABLE_AUTOCOMPACT: "1",
    OPENCODE_DISABLE_PRUNE: "1",
    SCOUT_SNAPSHOT_PARENT: realpathSync(snapshots),
  };
  if (config.opencode.scoutProviderCredential.type === "api-key") {
    environment.OPENAI_API_KEY = config.opencode.scoutProviderCredential.apiKey;
  }
  return environment;
}

export function scoutClient(config: BridgeConfig, manifest: Manifest, directory: string): OpenCodeClient {
  return new OpenCodeClient({
    baseUrl: config.opencode.scoutBaseUrl,
    username: config.opencode.username,
    password: config.opencode.scoutPassword,
    directory,
    manifest,
  });
}

export async function probeScoutServer(client: OpenCodeClient): Promise<{ compatible: true; version: string }> {
  const compatibility = await client.compatibility();
  if (!compatibility.compatible || compatibility.runningVersion !== scoutRuntimeVersion) {
    throw new Error(`Scout endpoint is not the pinned compatible OpenCode ${scoutRuntimeVersion} contract`);
  }
  const [agents, tools] = await Promise.all([
    client.request("app.agents"),
    client.request("tool.ids"),
  ]);
  assertScoutAgentContract(agents, tools);
  return { compatible: true, version: compatibility.runningVersion };
}

export class ScoutServerProcess {
  private child: ChildProcess | undefined;
  private pending: Promise<void> | undefined;
  private diagnostic = "";

  constructor(
    private readonly config: BridgeConfig,
    private readonly manifest: Manifest,
    private readonly snapshots: string,
  ) {}

  async start(): Promise<void> {
    if (this.pending) return await this.pending;
    this.pending = this.startOnce().finally(() => { this.pending = undefined; });
    return await this.pending;
  }

  private async startOnce(): Promise<void> {
    assertScoutRuntimeInstallation(this.config);
    const probe = scoutClient(this.config, this.manifest, this.config.opencode.scoutRuntimeRoot);
    try {
      await probeScoutServer(probe);
      return;
    } catch {
      // A missing endpoint is launched below. An occupied incompatible endpoint
      // remains fail-closed because the active probe never succeeds.
    }
    const root = realpathSync(this.config.opencode.scoutRuntimeRoot);
    const binary = join(root, "config", "node_modules", ".bin", "opencode");
    const address = serverAddress(this.config.opencode.scoutBaseUrl);
    this.child = spawn(binary, ["serve", "--hostname", address.hostname, "--port", address.port], {
      cwd: root,
      env: scoutServerEnvironment(this.config, this.snapshots),
      stdio: ["ignore", "ignore", "pipe"],
    });
    this.diagnostic = "";
    this.child.stderr?.on("data", (chunk: Buffer | string) => {
      this.diagnostic = `${this.diagnostic}${String(chunk)}`.slice(-4_096);
    });
    let last: unknown = new Error("Scout endpoint did not become ready");
    for (let attempt = 0; attempt < 60; attempt++) {
      if (this.child.exitCode !== null) {
        const detail = this.diagnostic.trim();
        throw new Error(`Hardened Scout server exited during startup with code ${this.child.exitCode}${detail ? `: ${detail}` : ""}`);
      }
      try {
        await probeScoutServer(probe);
        return;
      } catch (error) {
        last = error;
        await sleep(250);
      }
    }
    await this.stop();
    throw last;
  }

  async stop(): Promise<void> {
    const child = this.child;
    this.child = undefined;
    if (!child || child.exitCode !== null) return;
    child.kill("SIGTERM");
    await Promise.race([
      new Promise<void>((resolvePromise) => child.once("exit", () => resolvePromise())),
      sleep(5_000).then(() => { if (child.exitCode === null) child.kill("SIGKILL"); }),
    ]);
  }
}
