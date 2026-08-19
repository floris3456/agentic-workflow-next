import { createConnection } from "node:net";
import { existsSync, lstatSync, readFileSync, readdirSync, statSync } from "node:fs";
import { lstat, realpath } from "node:fs/promises";
import { basename, dirname, isAbsolute, join, resolve } from "node:path";
import { homedir } from "node:os";
import {
  canonicalDirectory,
  commonDirectory,
  git,
  publicWorkspaceError,
  redactLocalPaths,
  run,
  utf8,
} from "./workspace-maintenance-common.mjs";

const SYSTEMCTL = "/usr/bin/systemctl";

function decodeExecEscape(value, index) {
  const next = value[index + 1];
  if (next === undefined) return null;
  if (next === "x") {
    const hex = value.slice(index + 2, index + 4);
    if (!/^[0-9A-Fa-f]{2}$/.test(hex)) return null;
    return { value: String.fromCharCode(Number.parseInt(hex, 16)), next: index + 4 };
  }
  const escapes = {
    "\\": "\\",
    "\"": "\"",
    "'": "'",
    "s": " ",
    "t": "\t",
    "n": "\n",
    "r": "\r",
  };
  if (!(next in escapes)) return null;
  return { value: escapes[next], next: index + 2 };
}

function parseExecWords(value) {
  if (typeof value !== "string" || value.trim().length === 0) return null;
  let command = value.trim();
  const argvMarker = command.indexOf("argv[]=");
  if (argvMarker !== -1) {
    command = command.slice(argvMarker + "argv[]=".length);
    const propertyBoundary = command.search(/\s+;\s+(?:ignore_errors|start_time|stop_time|pid|code|status)=/);
    if (propertyBoundary !== -1) command = command.slice(0, propertyBoundary);
    command = command.replace(/\s*}\s*$/, "").trim();
  } else if (/^\{\s*path=/.test(command)) {
    return null;
  }

  const words = [];
  let current = "";
  let quote = null;
  let started = false;
  for (let index = 0; index < command.length;) {
    const char = command[index];
    if (char === "\\") {
      const decoded = decodeExecEscape(command, index);
      if (!decoded) return null;
      current += decoded.value;
      started = true;
      index = decoded.next;
      continue;
    }
    if (quote !== null) {
      if (char === quote) {
        quote = null;
      } else {
        current += char;
      }
      started = true;
      index++;
      continue;
    }
    if (char === "\"" || char === "'") {
      quote = char;
      started = true;
      index++;
      continue;
    }
    if (/\s/.test(char)) {
      if (started) {
        words.push(current);
        current = "";
        started = false;
      }
      index++;
      continue;
    }
    current += char;
    started = true;
    index++;
  }
  if (quote !== null) return null;
  if (started) words.push(current);
  return words.length > 0 ? words : null;
}

function execStartUsesExactConfig(execStart, configFile) {
  const argv = parseExecWords(execStart);
  if (!argv) return false;
  const indexes = [];
  for (let index = 0; index < argv.length; index++) {
    if (argv[index] === "--config") indexes.push(index);
  }
  return indexes.length === 1
    && indexes[0] + 1 < argv.length
    && argv[indexes[0] + 1] === configFile;
}

export class SystemdUserClient {
  constructor(options = {}) {
    this.systemctlBin = options.systemctlBin ?? SYSTEMCTL;
    this.env = options.env ?? process.env;
  }

  async isAvailable() {
    if (process.platform !== "linux") return false;
    try {
      const result = await run(this.systemctlBin, ["--user", "is-system-running"], process.cwd(), 5000, this.env);
      return result.exitCode === 0 || result.exitCode === 1;
    } catch {
      return false;
    }
  }

  async showUnit(unitName) {
    if (!/^[A-Za-z0-9_.-]+\.service$/.test(unitName)) {
      throw new Error(`Invalid systemd unit name: ${unitName}`);
    }
    const result = await run(
      this.systemctlBin,
      [
        "--user",
        "show",
        unitName,
        "--property=Id,ActiveState,SubState,UnitFileState,LoadState,ExecStart,WorkingDirectory,MainPID",
      ],
      process.cwd(),
      10_000,
      this.env,
    );
    if (result.exitCode !== 0) {
      throw new Error(`systemctl show failed for unit ${unitName}`);
    }
    const text = utf8(result.stdout, "systemctl output");
    const properties = {};
    for (const line of text.split("\n")) {
      const separator = line.indexOf("=");
      if (separator !== -1) {
        properties[line.slice(0, separator).trim()] = line.slice(separator + 1).trim();
      }
    }
    return properties;
  }

  async startUnit(unitName) {
    if (!/^[A-Za-z0-9_.-]+\.service$/.test(unitName)) {
      throw new Error(`Invalid systemd unit name: ${unitName}`);
    }
    const result = await run(
      this.systemctlBin,
      ["--user", "start", unitName],
      process.cwd(),
      30_000,
      this.env,
    );
    if (result.exitCode !== 0) {
      const diagnostics = utf8(result.stderr, "systemctl diagnostics");
      throw new Error(`systemctl start failed for ${unitName}: ${diagnostics}`);
    }
  }
}

export class HostBridgeAdminClient {
  constructor(socketPath) {
    this.socketPath = socketPath;
  }

  async isAvailable(timeoutMs = 1_000) {
    if (!existsSync(this.socketPath)) return false;
    try {
      await this.request({ command: "status" }, timeoutMs);
      return true;
    } catch {
      return false;
    }
  }

  async status(timeoutMs = 5_000) {
    return await this.request({ command: "status" }, timeoutMs);
  }

  async reconcile(timeoutMs = 30_000) {
    return await this.request({ command: "reconcile" }, timeoutMs);
  }

  request(payload, timeoutMs) {
    return new Promise((resolvePromise, reject) => {
      let buffer = "";
      const socket = createConnection(this.socketPath);
      socket.setEncoding("utf8");

      const timer = setTimeout(() => {
        socket.destroy(new Error("Bridge admin request timed out"));
      }, timeoutMs);

      socket.once("connect", () => {
        socket.write(`${JSON.stringify(payload)}\n`);
      });

      socket.on("data", (chunk) => {
        buffer += chunk;
        const newlineIndex = buffer.indexOf("\n");
        if (newlineIndex !== -1) {
          clearTimeout(timer);
          socket.end();
          const line = buffer.slice(0, newlineIndex).trim();
          try {
            const parsed = JSON.parse(line);
            if (!parsed.ok) {
              reject(new Error(parsed.error ?? "Admin request failed"));
              return;
            }
            resolvePromise(parsed.data ?? null);
          } catch (err) {
            reject(new Error(`Malformed admin response: ${err.message}`));
          }
        }
      });

      socket.once("error", (err) => {
        clearTimeout(timer);
        reject(err);
      });

      socket.once("close", (hadError) => {
        clearTimeout(timer);
        if (!hadError && !buffer.includes("\n")) {
          reject(new Error("Bridge admin connection closed unexpectedly"));
        }
      });
    });
  }
}

function parseOriginRepository(remote) {
  if (typeof remote !== "string" || remote.length === 0) {
    throw new Error("Repository origin remote is missing");
  }
  const trimmed = remote.trim();
  let pathname = "";
  let host = "";

  if (trimmed.startsWith("/") || /^[A-Za-z]:[\\/]/.test(trimmed) || trimmed.startsWith("file://")) {
    const rawPath = trimmed.startsWith("file://") ? new URL(trimmed).pathname : trimmed;
    const name = basename(rawPath);
    const repo = name.endsWith(".git") ? name.slice(0, -4) : name;
    return { host: "local", owner: "local", repository: repo };
  }

  if (trimmed.startsWith("https://") || trimmed.startsWith("ssh://")) {
    let url;
    try { url = new URL(trimmed); } catch { throw new Error("Invalid origin remote URL"); }
    host = url.hostname.toLowerCase();
    pathname = url.pathname;
  } else {
    const scp = trimmed.match(/^git@([a-z0-9](?:[a-z0-9.-]*[a-z0-9])?):([^:]+)$/);
    if (!scp) throw new Error("Unsupported Git origin remote format");
    host = scp[1].toLowerCase();
    pathname = scp[2];
  }

  const parts = pathname.replace(/^\/+|\/+$/g, "").split("/");
  if (parts.length !== 2) throw new Error("Git origin remote path must be owner/repository");
  const owner = parts[0];
  const repository = parts[1].endsWith(".git") ? parts[1].slice(0, -4) : parts[1];
  return { host, owner, repository };
}

function assertPrivateConfigFile(path) {
  let stat;
  try {
    stat = lstatSync(path);
  } catch {
    throw new Error(`Configuration file does not exist: ${path}`);
  }
  if (!stat.isFile() || stat.isSymbolicLink()) {
    throw new Error(`Configuration file must be a regular non-symlink file: ${path}`);
  }
  if (process.platform !== "win32") {
    const mode = stat.mode & 0o777;
    if ((mode & 0o077) !== 0) {
      throw new Error(`Configuration file has unsafe permissions (expected 0600, found 0${mode.toString(8)}): ${path}`);
    }
  }
}

export class HostBridgeRegistry {
  constructor(options = {}) {
    this.configDirectory = options.configDirectory ?? process.env.AGENTIC_WORKFLOW_CONFIG_DIR ?? join(homedir(), ".config", "agentic-workflow");
  }

  async resolveRegistration(callingRoot, callingOrigin, callingCommonDir) {
    const repoIdentity = parseOriginRepository(callingOrigin);
    const candidateFiles = this.findCandidateConfigFiles();

    const matchingConfigs = [];
    for (const filePath of candidateFiles) {
      try {
        assertPrivateConfigFile(filePath);
        const content = readFileSync(filePath, "utf8");
        const parsed = JSON.parse(content);
        if (parsed.schema_version !== 1 || !parsed.instance_id || !parsed.repository_root || !parsed.github) {
          continue;
        }
        const github = parsed.github;
        if (repoIdentity.host !== "local") {
          if (
            github.owner?.toLowerCase() !== repoIdentity.owner.toLowerCase() ||
            github.repository?.toLowerCase() !== repoIdentity.repository.toLowerCase()
          ) {
            continue;
          }
          if (github.git_host && github.git_host.toLowerCase() !== repoIdentity.host.toLowerCase()) {
            continue;
          }
        } else {
          if (github.repository?.toLowerCase() !== repoIdentity.repository.toLowerCase()) {
            continue;
          }
        }

        const repoRoot = resolve(dirname(filePath), parsed.repository_root);
        if (!existsSync(repoRoot) || !statSync(repoRoot).isDirectory()) {
          continue;
        }
        const rootCanonical = await canonicalDirectory(repoRoot, "Registered bridge repository");
        const commonDir = await commonDirectory(rootCanonical);
        if (commonDir !== callingCommonDir) {
          continue;
        }
        const remoteOutput = (await git(rootCanonical, ["remote", "get-url", "origin"], true)).stdout;
        if (!remoteOutput) continue;
        const remoteIdentity = parseOriginRepository(remoteOutput);
        if (repoIdentity.host !== "local") {
          if (
            remoteIdentity.owner.toLowerCase() !== repoIdentity.owner.toLowerCase() ||
            remoteIdentity.repository.toLowerCase() !== repoIdentity.repository.toLowerCase()
          ) {
            continue;
          }
        } else {
          if (remoteIdentity.repository.toLowerCase() !== repoIdentity.repository.toLowerCase()) {
            continue;
          }
        }

        const stateFile = resolve(dirname(filePath), parsed.state_file);
        const derivedAdminSocket = join(dirname(stateFile), "admin.sock");
        if (parsed.admin_socket_file !== undefined) {
          const configuredSocket = resolve(dirname(filePath), parsed.admin_socket_file);
          if (configuredSocket !== derivedAdminSocket) {
            continue; // invalid admin socket location
          }
        }

        let serviceUnit = undefined;
        if (parsed.service_unit !== undefined) {
          if (typeof parsed.service_unit === "string" && /^[A-Za-z0-9_.-]+\.service$/.test(parsed.service_unit)) {
            serviceUnit = parsed.service_unit;
          }
        }

        matchingConfigs.push({
          configFile: filePath,
          instanceId: parsed.instance_id,
          repositoryRoot: rootCanonical,
          stateFile,
          adminSocketFile: derivedAdminSocket,
          serviceUnit,
          opencode: parsed.opencode ?? {},
          github: parsed.github,
        });
      } catch {
        // ignore unreadable/invalid candidate files
      }
    }

    if (matchingConfigs.length === 0) {
      throw new Error(`No registered bridge configuration found for repository ${repoIdentity.owner}/${repoIdentity.repository}`);
    }

    if (matchingConfigs.length > 1) {
      throw new Error(`Ambiguous bridge registration: multiple configurations match repository ${repoIdentity.owner}/${repoIdentity.repository}`);
    }

    return matchingConfigs[0];
  }

  findCandidateConfigFiles() {
    const results = [];
    if (!existsSync(this.configDirectory)) return results;

    const mainConfig = join(this.configDirectory, "opencode-bridge.json");
    if (existsSync(mainConfig)) results.push(mainConfig);

    try {
      const entries = readdirSync(this.configDirectory, { withFileTypes: true });
      for (const entry of entries) {
        if (entry.isFile() && entry.name.endsWith(".json") && entry.name !== "opencode-bridge.json") {
          results.push(join(this.configDirectory, entry.name));
        } else if (entry.isDirectory() && (entry.name === "bridges" || entry.name === "registry")) {
          const subEntries = readdirSync(join(this.configDirectory, entry.name), { withFileTypes: true });
          for (const sub of subEntries) {
            if (sub.isFile() && sub.name.endsWith(".json")) {
              results.push(join(this.configDirectory, entry.name, sub.name));
            }
          }
        }
      }
    } catch {
      // ignore
    }

    return [...new Set(results)];
  }
}

export class WorkspaceBridgeBroker {
  constructor(rootDirectory, options = {}) {
    this.rootDirectory = resolve(rootDirectory);
    this.registry = options.registry ?? new HostBridgeRegistry(options);
    this.systemdClient = options.systemdClient ?? new SystemdUserClient(options);
    this.adminClientFactory = options.adminClientFactory ?? ((socketPath) => new HostBridgeAdminClient(socketPath));
    this.fetchFn = options.fetchFn ?? globalThis.fetch;
    this.adminProbeRetries = options.adminProbeRetries ?? 30;
    this.adminProbeIntervalMs = options.adminProbeIntervalMs ?? 500;
  }

  async verifyInstructionRoot() {
    const root = await canonicalDirectory(this.rootDirectory, "Instruction root");
    const top = await canonicalDirectory((await git(root, ["rev-parse", "--show-toplevel"])).stdout, "Git root");
    if (top !== root) throw new Error("Instruction root is not the Git worktree root");
    const branch = (await git(root, ["branch", "--show-current"])).stdout;
    if (branch !== "template-development") {
      throw new Error("Workspace Maintenance Agent must remain rooted on template-development");
    }
    const origin = (await git(root, ["remote", "get-url", "origin"])).stdout;
    if (!origin) throw new Error("Instruction root has no origin remote");
    const common = await commonDirectory(root);
    return { root, origin, common, branch };
  }

  async resolveBridgeContext() {
    const auth = await this.verifyInstructionRoot();
    const config = await this.registry.resolveRegistration(auth.root, auth.origin, auth.common);
    const unit = await this.resolveSystemdUnit(config);
    return { auth, config, unit };
  }

  async resolveSystemdUnit(config) {
    if (!config.serviceUnit) {
      return { available: false, unitName: null, properties: null, registered: false };
    }

    const isAvailable = await this.systemdClient.isAvailable();
    if (!isAvailable) {
      return { available: false, unitName: config.serviceUnit, properties: null, registered: true };
    }

    let props;
    try {
      props = await this.systemdClient.showUnit(config.serviceUnit);
    } catch {
      return { available: false, unitName: config.serviceUnit, properties: null, registered: true };
    }

    if (props.LoadState !== "loaded") {
      return { available: true, unitName: config.serviceUnit, properties: props, registered: true, loaded: false };
    }

    if (props.WorkingDirectory) {
      try {
        const unitDir = await canonicalDirectory(props.WorkingDirectory, "Unit working directory");
        if (unitDir !== config.repositoryRoot) {
          return { available: false, unitName: config.serviceUnit, properties: null, registered: true, error: "working-directory-mismatch" };
        }
      } catch {
        return { available: false, unitName: config.serviceUnit, properties: null, registered: true, error: "working-directory-invalid" };
      }
    } else {
      return { available: false, unitName: config.serviceUnit, properties: null, registered: true, error: "working-directory-missing" };
    }

    if (!execStartUsesExactConfig(props.ExecStart, config.configFile)) {
      return { available: false, unitName: config.serviceUnit, properties: null, registered: true, error: "exec-start-config-mismatch" };
    }

    return { available: true, unitName: config.serviceUnit, properties: props, registered: true, loaded: true };
  }

  async probeOpenCodeHealth(baseUrl) {
    if (!baseUrl) return false;
    try {
      const url = new URL("/global/health", baseUrl);
      const response = await this.fetchFn(url, { signal: AbortSignal.timeout(2_000) });
      if (response.status !== 200) return false;
      const json = await response.json();
      return json && typeof json === "object" && typeof json.version === "string";
    } catch {
      return false;
    }
  }

  async expectedRepository(config) {
    const remote = (await git(config.repositoryRoot, ["remote", "get-url", "origin"])).stdout;
    const identity = parseOriginRepository(remote);
    return `${identity.owner}/${identity.repository}`;
  }

  async assertAdminIdentity(config, status) {
    if (!status || typeof status !== "object") {
      throw new Error("Bridge admin endpoint returned invalid status data");
    }
    if (status.instance !== config.instanceId) {
      throw new Error("Bridge admin endpoint did not report the registered instance identity");
    }
    const expectedRepository = await this.expectedRepository(config);
    if (typeof status.repository !== "string" || status.repository.toLowerCase() !== expectedRepository.toLowerCase()) {
      throw new Error("Bridge admin endpoint did not report the registered repository identity");
    }
  }

  async assertAdminHealthy(config, status) {
    await this.assertAdminIdentity(config, status);
    if (status.running !== true) {
      throw new Error("Bridge admin endpoint reported running=false");
    }
    const heartbeatAt = typeof status.heartbeat_at === "number" ? status.heartbeat_at : null;
    if (heartbeatAt === null || Date.now() - heartbeatAt > 30_000) {
      throw new Error("Bridge admin endpoint reported a stale heartbeat");
    }
  }

  async readStateFromDisk(stateFile) {
    if (!existsSync(stateFile)) {
      return {
        initialized: false,
        schema_valid: true,
        running: false,
        pid: null,
        heartbeat_at: null,
        last_error: null,
        pending_commands: 0,
        pending_requests: 0,
        pending_response_deliveries: 0,
        pending_outbox: 0,
        active_task_sessions: 0,
        active_developer_sessions: 0,
        active_workspace_sessions: 0,
        scout_sessions: 0,
      };
    }

    let db;
    try {
      const nodeSqlite = await import("node:sqlite").catch(() => null);
      if (nodeSqlite?.DatabaseSync) {
        const syncDb = new nodeSqlite.DatabaseSync(stateFile, { readOnly: true, open: true });
        db = {
          get: (sql, ...params) => syncDb.prepare(sql).get(...params),
          all: (sql, ...params) => syncDb.prepare(sql).all(...params),
          close: () => syncDb.close(),
        };
      }
    } catch {
      // ignore
    }

    if (!db) {
      try {
        const bunSqlite = await import("bun:sqlite").catch(() => null);
        if (bunSqlite?.Database) {
          const syncDb = new bunSqlite.Database(stateFile, { readonly: true });
          db = {
            get: (sql, ...params) => syncDb.query(sql).get(...params),
            all: (sql, ...params) => syncDb.query(sql).all(...params),
            close: () => syncDb.close(),
          };
        }
      } catch {
        // ignore
      }
    }

    if (!db) {
      return {
        initialized: true,
        schema_valid: false,
        running: false,
        error: "SQLite driver unavailable for stopped state inspection",
      };
    }

    try {
      const requiredTables = [
        "meta",
        "commands",
        "requests",
        "github_outbox",
        "response_deliveries",
        "task_sessions",
        "scout_sessions",
      ];
      const foundTables = new Set(
        (db.all("SELECT name FROM sqlite_master WHERE type='table'") ?? []).map((row) => row.name),
      );
      for (const table of requiredTables) {
        if (!foundTables.has(table)) {
          return {
            initialized: true,
            schema_valid: false,
            running: false,
            error: `Bridge database missing required table: ${table}`,
          };
        }
      }

      const getMeta = (key) => {
        const row = db.get("SELECT value FROM meta WHERE key=?", key);
        return row?.value ?? null;
      };
      const count = (sql, ...params) => {
        const row = db.get(sql, ...params);
        return Number(row?.count ?? 0);
      };

      const pid = Number(getMeta("service.pid"));
      const heartbeatAt = Number(getMeta("service.heartbeat_at"));
      const lastError = getMeta("service.last_error");

      const pendingCommands = count("SELECT COUNT(*) AS count FROM commands WHERE state IN ('accepted', 'applying')");
      const pendingRequests = count("SELECT COUNT(*) AS count FROM requests WHERE state IN ('accepted', 'applying')");
      const pendingDeliveries = count("SELECT COUNT(*) AS count FROM response_deliveries WHERE queued_at IS NULL");
      const pendingOutbox = count("SELECT COUNT(*) AS count FROM github_outbox WHERE delivered_at IS NULL");

      const isNonTerminal = (state) => !/session\.(?:idle|error)/i.test(state) && !/^(?:terminal|completed|failed)$/i.test(state);

      const taskRows = db.all("SELECT session_kind, session_state FROM task_sessions") ?? [];
      let activeTaskSessions = 0;
      let activeDeveloperSessions = 0;
      let activeWorkspaceSessions = 0;
      for (const row of taskRows) {
        if (isNonTerminal(row.session_state)) {
          activeTaskSessions++;
          if (row.session_kind === "workspace") activeWorkspaceSessions++;
          else activeDeveloperSessions++;
        }
      }

      const scoutRows = db.all("SELECT session_state FROM scout_sessions") ?? [];
      let scoutSessions = 0;
      for (const row of scoutRows) {
        if (isNonTerminal(row.session_state)) {
          scoutSessions++;
        }
      }

      return {
        initialized: true,
        schema_valid: true,
        running: false,
        pid: Number.isSafeInteger(pid) ? pid : null,
        heartbeat_at: Number.isSafeInteger(heartbeatAt) && heartbeatAt > 0 ? heartbeatAt : null,
        last_error: lastError,
        pending_commands: pendingCommands,
        pending_requests: pendingRequests,
        pending_response_deliveries: pendingDeliveries,
        pending_outbox: pendingOutbox,
        active_task_sessions: activeTaskSessions,
        active_developer_sessions: activeDeveloperSessions,
        active_workspace_sessions: activeWorkspaceSessions,
        scout_sessions: scoutSessions,
      };
    } catch (error) {
      return {
        initialized: true,
        schema_valid: false,
        running: false,
        error: `Bridge database query failed: ${error.message}`,
      };
    } finally {
      try { db?.close(); } catch { /* ignore */ }
    }
  }

  async checkStartingSafe(config, unit) {
    if (!config.serviceUnit || !unit.registered || !unit.properties || unit.properties.LoadState !== "loaded") {
      return false;
    }

    try {
      const repoRoot = config.repositoryRoot;
      const originRes = await git(repoRoot, ["remote", "get-url", "origin"], true);
      if (originRes.exitCode !== 0) return false;

      const branch = (await git(repoRoot, ["branch", "--show-current"], true)).stdout;
      if (branch !== "developer") return false;

      const statusRes = (await git(repoRoot, ["status", "--porcelain"], true)).stdout;
      if (statusRes.length > 0) return false;

      const upstream = await git(repoRoot, ["rev-parse", "--abbrev-ref", "--symbolic-full-name", "@{upstream}"], true);
      if (upstream.exitCode !== 0 || upstream.stdout !== "origin/developer") {
        return false;
      }

      const countRes = await git(repoRoot, ["rev-list", "--left-right", "--count", "HEAD...@{upstream}"], true);
      if (countRes.exitCode !== 0) return false;
      const [ahead, behind] = countRes.stdout.trim().split(/\s+/).map(Number);
      if (ahead !== 0 || behind !== 0) return false;

      const headRes = await git(repoRoot, ["rev-parse", "HEAD"], true);
      if (headRes.exitCode !== 0 || !/^[0-9a-f]{40}$/.test(headRes.stdout)) return false;
      const remoteRes = await git(
        repoRoot,
        ["ls-remote", "--exit-code", "origin", "refs/heads/developer"],
        true,
        { timeout: 10_000 },
      );
      if (remoteRes.exitCode !== 0) return false;
      const lines = remoteRes.stdout.split("\n").filter(Boolean);
      if (lines.length !== 1) return false;
      const fields = lines[0].trim().split(/\s+/);
      if (fields.length !== 2 || fields[1] !== "refs/heads/developer" || fields[0] !== headRes.stdout) return false;
    } catch {
      return false;
    }

    const lockPath = `${config.stateFile}.lock`;
    if (existsSync(lockPath)) {
      try {
        const pid = Number(readFileSync(lockPath, "utf8").trim());
        if (Number.isSafeInteger(pid) && pid > 0) {
          try {
            process.kill(pid, 0);
            return false;
          } catch {
            // process is dead
          }
        }
      } catch {
        // ignore
      }
    }
    return true;
  }

  async inspect() {
    const { config, unit } = await this.resolveBridgeContext();
    const adminClient = this.adminClientFactory(config.adminSocketFile);
    const adminLive = await adminClient.isAvailable();

    let serviceState = "unknown";
    let isRunning = false;
    let installedDeveloperSha = null;

    try {
      const head = (await git(config.repositoryRoot, ["rev-parse", "HEAD"], true)).stdout;
      if (/^[0-9a-f]{40}$/.test(head)) installedDeveloperSha = head;
    } catch {
      // ignore
    }

    if (unit.registered && unit.properties) {
      const activeState = unit.properties.ActiveState;
      if (activeState === "active") serviceState = "running";
      else if (activeState === "inactive") serviceState = "stopped";
      else if (activeState === "failed") serviceState = "failed";
      else if (activeState === "activating") serviceState = "activating";
      else if (activeState === "deactivating") serviceState = "deactivating";
      else serviceState = activeState || "unknown";
      isRunning = activeState === "active";
    } else if (adminLive) {
      serviceState = "running";
      isRunning = true;
    } else if (!unit.registered) {
      serviceState = "unregistered";
      isRunning = false;
    } else {
      serviceState = existsSync(config.stateFile) ? "stopped" : "unknown";
      isRunning = false;
    }

    let statusData;
    let adminIdentityTrusted = null;
    if (adminLive) {
      try {
        const liveStatus = await adminClient.status();
        await this.assertAdminIdentity(config, liveStatus);
        statusData = liveStatus;
        adminIdentityTrusted = true;
      } catch {
        statusData = await this.readStateFromDisk(config.stateFile);
        adminIdentityTrusted = false;
      }
    } else {
      statusData = await this.readStateFromDisk(config.stateFile);
    }

    if (statusData?.schema_valid === false || adminIdentityTrusted === false) {
      serviceState = "blocked";
    }

    const opencodeHealthy = await this.probeOpenCodeHealth(config.opencode?.base_url);
    const heartbeatAt = typeof statusData?.heartbeat_at === "number" ? statusData.heartbeat_at : null;
    const heartbeatFresh = isRunning && adminIdentityTrusted !== false && heartbeatAt !== null && Date.now() - heartbeatAt < 30_000;

    const pendingCommands = Number(statusData?.pending_commands ?? 0);
    const pendingRequests = Number(statusData?.pending_requests ?? 0);
    const pendingDeliveries = Number(statusData?.pending_response_deliveries ?? 0);
    const pendingOutbox = Number(statusData?.pending_outbox ?? 0);
    const activeTaskSessions = Number(statusData?.active_task_sessions ?? 0);
    const activeDevSessions = Number(statusData?.active_developer_sessions ?? 0);
    const activeWorkSessions = Number(statusData?.active_workspace_sessions ?? 0);
    const scoutSessions = Number(statusData?.scout_sessions ?? 0);

    const canonicalRecoveryRequired =
      statusData?.schema_valid === false ||
      adminIdentityTrusted === false ||
      activeTaskSessions > 0 ||
      pendingCommands > 0 ||
      pendingRequests > 0 ||
      pendingDeliveries > 0 ||
      pendingOutbox > 0;

    const startingSafe = !isRunning
      && adminIdentityTrusted !== false
      && statusData?.schema_valid !== false
      && (await this.checkStartingSafe(config, unit));

    const repoIdentity = parseOriginRepository(
      (await git(config.repositoryRoot, ["remote", "get-url", "origin"])).stdout,
    );

    return {
      repository: `${repoIdentity.owner}/${repoIdentity.repository}`,
      service_state: serviceState,
      bridge_running: isRunning,
      installed_developer_sha: installedDeveloperSha,
      heartbeat_fresh: heartbeatFresh,
      last_heartbeat_at: heartbeatAt,
      pending_commands: pendingCommands,
      pending_requests: pendingRequests,
      pending_response_deliveries: pendingDeliveries,
      pending_outbox: pendingOutbox,
      active_task_sessions: activeTaskSessions,
      active_developer_sessions: activeDevSessions,
      active_workspace_sessions: activeWorkSessions,
      scout_sessions: scoutSessions,
      opencode_endpoint_healthy: opencodeHealthy,
      canonical_recovery_required: canonicalRecoveryRequired,
      starting_safe: startingSafe,
    };
  }

  async start() {
    const { config, unit } = await this.resolveBridgeContext();
    if (!config.serviceUnit) {
      throw new Error("Cannot start bridge: no service_unit registered in bridge configuration");
    }
    if (!unit.available || !unit.properties || unit.properties.LoadState !== "loaded") {
      throw new Error(`Cannot start bridge: registered systemd unit ${config.serviceUnit} is not loaded or does not match repository binding`);
    }

    if (unit.properties.ActiveState === "active") {
      const adminClient = this.adminClientFactory(config.adminSocketFile);
      let liveStatus;
      try {
        liveStatus = await adminClient.status(2_000);
        await this.assertAdminHealthy(config, liveStatus);
      } catch {
        throw new Error("Cannot use already-active bridge: admin endpoint identity or health verification failed");
      }
      const current = await this.inspect();
      if (current.service_state === "blocked" || !current.heartbeat_fresh) {
        throw new Error("Cannot use already-active bridge: verified status could not be reproduced");
      }
      return { status: "already-running", bridge: current };
    }

    const safeToStart = await this.checkStartingSafe(config, unit);
    if (!safeToStart) {
      throw new Error("Cannot start bridge: developer worktree is dirty/diverged, not at live origin/developer, or service lock is held");
    }

    await this.systemdClient.startUnit(config.serviceUnit);

    let startedActive = false;
    for (let attempt = 0; attempt < 30; attempt++) {
      await new Promise((r) => setTimeout(r, 500));
      try {
        const props = await this.systemdClient.showUnit(config.serviceUnit);
        if (props.ActiveState === "active") {
          startedActive = true;
          break;
        }
        if (props.ActiveState === "failed") {
          throw new Error("Bridge service entered failed state after start");
        }
      } catch (err) {
        if (err.message.includes("failed state")) throw err;
      }
    }

    if (!startedActive) {
      throw new Error("Bridge service start timed out waiting for active state");
    }

    const adminClient = this.adminClientFactory(config.adminSocketFile);
    let liveStatus = null;
    for (let attempt = 0; attempt < this.adminProbeRetries; attempt++) {
      if (await adminClient.isAvailable(500)) {
        try {
          liveStatus = await adminClient.status(2_000);
          if (liveStatus && typeof liveStatus === "object") break;
        } catch {
          liveStatus = null;
        }
      }
      await new Promise((r) => setTimeout(r, this.adminProbeIntervalMs));
    }

    if (!liveStatus) {
      throw new Error("Bridge service started in systemd but admin endpoint is unreachable or unresponsive");
    }
    try {
      await this.assertAdminHealthy(config, liveStatus);
    } catch {
      throw new Error("Bridge service started but admin endpoint identity or health verification failed");
    }

    const after = await this.inspect();
    if (after.service_state === "blocked" || !after.heartbeat_fresh) {
      throw new Error("Bridge service started but verified status could not be reproduced");
    }
    return { status: "started", bridge: after };
  }

  async reconcile() {
    const { config } = await this.resolveBridgeContext();
    const adminClient = this.adminClientFactory(config.adminSocketFile);
    let status;
    try {
      status = await adminClient.status(2_000);
      await this.assertAdminHealthy(config, status);
    } catch {
      throw new Error("Bridge service is unavailable or its admin endpoint identity/health cannot be verified; refusing reconciliation.");
    }

    const result = await adminClient.reconcile();
    const after = await this.inspect();
    if (after.service_state === "blocked") {
      throw new Error("Bridge reconciliation completed but post-reconcile identity verification failed");
    }
    return {
      reconciled: result?.reconciled === true,
      service_state: after.service_state,
      pending_response_deliveries: after.pending_response_deliveries,
      pending_outbox: after.pending_outbox,
      active_task_sessions: after.active_task_sessions,
      active_developer_sessions: after.active_developer_sessions,
      active_workspace_sessions: after.active_workspace_sessions,
      scout_sessions: after.scout_sessions,
      bridge: after,
    };
  }
}
