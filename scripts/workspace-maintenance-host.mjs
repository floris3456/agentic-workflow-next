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
        const defaultAdminSocket = join(dirname(stateFile), "admin.sock");
        const adminSocketFile = resolve(dirname(filePath), parsed.admin_socket_file ?? defaultAdminSocket);

        matchingConfigs.push({
          configFile: filePath,
          instanceId: parsed.instance_id,
          repositoryRoot: rootCanonical,
          stateFile,
          adminSocketFile,
          serviceUnit: parsed.service_unit,
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

    const uniqueInstances = new Set(matchingConfigs.map((c) => c.instanceId));
    if (uniqueInstances.size > 1) {
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
    const repoIdentity = parseOriginRepository(
      (await git(config.repositoryRoot, ["remote", "get-url", "origin"])).stdout,
    );
    const candidates = [
      ...(config.serviceUnit ? [config.serviceUnit] : []),
      `${repoIdentity.repository}-bridge.service`,
      `${config.instanceId}-bridge.service`,
      `${repoIdentity.owner}-${repoIdentity.repository}-bridge.service`,
    ];
    const uniqueCandidates = [...new Set(candidates)];

    const isAvailable = await this.systemdClient.isAvailable();
    if (!isAvailable) {
      return { available: false, unitName: uniqueCandidates[0], properties: null };
    }

    const matched = [];
    for (const name of uniqueCandidates) {
      try {
        const props = await this.systemdClient.showUnit(name);
        if (props.LoadState === "loaded") {
          if (props.WorkingDirectory) {
            try {
              const unitDir = await canonicalDirectory(props.WorkingDirectory, "Unit working directory");
              if (unitDir !== config.repositoryRoot) continue;
            } catch {
              continue;
            }
          }
          matched.push({ name, props });
        }
      } catch {
        // unit not found or failed
      }
    }

    if (matched.length > 1) {
      const distinctNames = new Set(matched.map((m) => m.name));
      if (distinctNames.size > 1) {
        throw new Error(`Ambiguous systemd service unit: multiple units match repository (${[...distinctNames].join(", ")})`);
      }
    }

    if (matched.length === 1) {
      return { available: true, unitName: matched[0].name, properties: matched[0].props };
    }

    return { available: true, unitName: uniqueCandidates[0], properties: null };
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

  async readStateFromDisk(stateFile) {
    const empty = {
      initialized: existsSync(stateFile),
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
    if (!existsSync(stateFile)) return empty;

    let db;
    try {
      const nodeSqlite = await import("node:sqlite").catch(() => null);
      if (nodeSqlite?.DatabaseSync) {
        const syncDb = new nodeSqlite.DatabaseSync(stateFile, { readOnly: true, open: true });
        db = {
          get: (sql, ...params) => syncDb.prepare(sql).get(...params),
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
            close: () => syncDb.close(),
          };
        }
      } catch {
        // ignore
      }
    }

    if (!db) return empty;

    try {
      const getMeta = (key) => {
        try {
          const row = db.get("SELECT value FROM meta WHERE key=?", key);
          return row?.value ?? null;
        } catch {
          return null;
        }
      };
      const count = (sql, ...params) => {
        try {
          const row = db.get(sql, ...params);
          return Number(row?.count ?? 0);
        } catch {
          return 0;
        }
      };

      const pid = Number(getMeta("service.pid"));
      const heartbeatAt = Number(getMeta("service.heartbeat_at"));
      const lastError = getMeta("service.last_error");

      const pendingCommands = count("SELECT COUNT(*) AS count FROM commands WHERE status IN ('accepted', 'applying')");
      const pendingRequests = count("SELECT COUNT(*) AS count FROM requests WHERE status IN ('accepted', 'applying')");
      const pendingDeliveries = count("SELECT COUNT(*) AS count FROM response_deliveries WHERE delivered_at IS NULL");
      const pendingOutbox = count("SELECT COUNT(*) AS count FROM outbox WHERE delivered_at IS NULL");
      const activeTaskSessions = count("SELECT COUNT(*) AS count FROM task_sessions WHERE session_state NOT IN ('completed', 'failed', 'cancelled', 'terminal')");
      const activeDeveloperSessions = count("SELECT COUNT(*) AS count FROM task_sessions WHERE session_kind='developer' AND session_state NOT IN ('completed', 'failed', 'cancelled', 'terminal')");
      const activeWorkspaceSessions = count("SELECT COUNT(*) AS count FROM task_sessions WHERE session_kind='workspace' AND session_state NOT IN ('completed', 'failed', 'cancelled', 'terminal')");
      const scoutSessions = count("SELECT COUNT(*) AS count FROM scout_sessions WHERE session_state NOT IN ('completed', 'failed', 'cancelled', 'terminal')");

      return {
        initialized: true,
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
    } catch {
      return empty;
    } finally {
      try { db?.close(); } catch { /* ignore */ }
    }
  }

  async checkStartingSafe(config, unit) {
    if (!unit.properties || unit.properties.LoadState !== "loaded") {
      return false;
    }
    try {
      const repoRoot = config.repositoryRoot;
      const branch = (await git(repoRoot, ["branch", "--show-current"], true)).stdout;
      if (branch !== "developer") return false;
      const statusRes = (await git(repoRoot, ["status", "--porcelain"], true)).stdout;
      if (statusRes.length > 0) return false;
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
            return false; // lock held by active process
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

    if (unit.properties) {
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
    } else {
      serviceState = existsSync(config.stateFile) ? "stopped" : "unknown";
      isRunning = false;
    }

    let statusData;
    if (adminLive) {
      try {
        statusData = await adminClient.status();
      } catch {
        statusData = await this.readStateFromDisk(config.stateFile);
      }
    } else {
      statusData = await this.readStateFromDisk(config.stateFile);
    }

    const opencodeHealthy = await this.probeOpenCodeHealth(config.opencode?.base_url);
    const heartbeatAt = typeof statusData?.heartbeat_at === "number" ? statusData.heartbeat_at : null;
    const heartbeatFresh = isRunning && heartbeatAt !== null && Date.now() - heartbeatAt < 30_000;

    const pendingCommands = Number(statusData?.pending_commands ?? 0);
    const pendingRequests = Number(statusData?.pending_requests ?? 0);
    const pendingDeliveries = Number(statusData?.pending_response_deliveries ?? 0);
    const pendingOutbox = Number(statusData?.pending_outbox ?? 0);
    const activeTaskSessions = Number(statusData?.active_task_sessions ?? 0);
    const activeDevSessions = Number(statusData?.active_developer_sessions ?? 0);
    const activeWorkSessions = Number(statusData?.active_workspace_sessions ?? 0);
    const scoutSessions = Number(statusData?.scout_sessions ?? 0);

    const canonicalRecoveryRequired =
      activeTaskSessions > 0 ||
      pendingCommands > 0 ||
      pendingRequests > 0 ||
      pendingDeliveries > 0 ||
      pendingOutbox > 0;

    const startingSafe = !isRunning && (await this.checkStartingSafe(config, unit));

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
    if (!unit.available || !unit.properties || unit.properties.LoadState !== "loaded") {
      throw new Error(`Cannot start bridge: systemd unit is not loaded or unavailable`);
    }

    if (unit.properties.ActiveState === "active") {
      const current = await this.inspect();
      return { status: "already-running", bridge: current };
    }

    const safeToStart = await this.checkStartingSafe(config, unit);
    if (!safeToStart) {
      throw new Error("Cannot start bridge: developer worktree is dirty/diverged or service lock is held");
    }

    await this.systemdClient.startUnit(unit.name ?? unit.unitName);

    let startedActive = false;
    for (let attempt = 0; attempt < 30; attempt++) {
      await new Promise((r) => setTimeout(r, 500));
      try {
        const props = await this.systemdClient.showUnit(unit.name ?? unit.unitName);
        if (props.ActiveState === "active") {
          startedActive = true;
          break;
        }
        if (props.ActiveState === "failed") {
          throw new Error(`Bridge service entered failed state after start`);
        }
      } catch (err) {
        if (err.message.includes("failed state")) throw err;
      }
    }

    if (!startedActive) {
      throw new Error("Bridge service start timed out waiting for active state");
    }

    const adminClient = this.adminClientFactory(config.adminSocketFile);
    for (let attempt = 0; attempt < 20; attempt++) {
      if (await adminClient.isAvailable(500)) break;
      await new Promise((r) => setTimeout(r, 500));
    }

    const after = await this.inspect();
    return { status: "started", bridge: after };
  }

  async reconcile() {
    const { config } = await this.resolveBridgeContext();
    const adminClient = this.adminClientFactory(config.adminSocketFile);
    const available = await adminClient.isAvailable(1000);
    if (!available) {
      throw new Error("Bridge service is not running or admin endpoint is unavailable; start the bridge before requesting reconciliation.");
    }

    const result = await adminClient.reconcile();
    const after = await this.inspect();
    return {
      reconciled: true,
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
