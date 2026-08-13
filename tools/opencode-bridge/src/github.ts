import type { AcceptedCommand, AcceptedRequest, CommandEnvelope, JsonValue, OutboxItem, StoredCommand, StoredRequest } from "./types.js";
import { githubApiVersion, type InstallationTokenProvider } from "./github-auth.js";
import {
  commandStatusComment,
  invalidCommandComment,
  invalidRequestComment,
  requestStatusComment,
  scanCommandEnvelopes,
  scanRequestEnvelopes,
} from "./protocol.js";
import { BridgeState } from "./state.js";
import { asJson, asRecord, backoff, errorMessage, isRecord, sha256, sleep } from "./util.js";

export interface GitHubClientOptions {
  owner: string;
  repository: string;
  tokens: InstallationTokenProvider;
  state: BridgeState;
  fetch?: typeof fetch;
  apiBaseUrl?: string;
  now?: () => number;
  timeoutMs?: number;
}

export interface GitHubIssue {
  number: number;
  body: string;
  author: string;
  authorAssociation: string;
  pullRequest: boolean;
}

export interface GitHubComment {
  id: number;
  body: string;
  author: string;
  authorAssociation: string;
}

export class GitHubHttpError extends Error {
  constructor(
    readonly status: number,
    readonly responseBody: string,
    readonly retryAt?: number,
  ) {
    super(`GitHub REST request failed with HTTP ${status}: ${responseBody.slice(0, 500)}`);
    this.name = "GitHubHttpError";
  }
}

function apiBase(value: string): URL {
  const url = new URL(value.endsWith("/") ? value : `${value}/`);
  if (url.protocol !== "https:" || url.username || url.password) throw new Error("GitHub API base URL must be credential-free HTTPS");
  return url;
}

function repositoryPart(value: string, label: string): string {
  if (!/^[A-Za-z0-9_.-]+$/.test(value)) throw new TypeError(`${label} is invalid`);
  return encodeURIComponent(value);
}

function retryTime(headers: Headers, now: number): number | undefined {
  const retryAfter = headers.get("retry-after");
  if (retryAfter) {
    const seconds = Number(retryAfter);
    if (Number.isFinite(seconds) && seconds >= 0) return now + seconds * 1_000;
    const date = Date.parse(retryAfter);
    if (Number.isFinite(date)) return date;
  }
  if (headers.get("x-ratelimit-remaining") === "0") {
    const reset = Number(headers.get("x-ratelimit-reset"));
    if (Number.isFinite(reset) && reset > 0) return reset * 1_000;
  }
  return undefined;
}

function nextLink(value: string | null): string | undefined {
  if (!value) return undefined;
  for (const part of value.split(",")) {
    const match = part.match(/^\s*<([^>]+)>\s*;\s*rel="([^"]+)"/);
    if (match?.[2]?.split(/\s+/).includes("next")) return match[1];
  }
  return undefined;
}

function actor(record: Record<string, unknown>): { author: string; authorAssociation: string } {
  const user = isRecord(record.user) ? record.user : undefined;
  return {
    author: typeof user?.login === "string" ? user.login : "",
    authorAssociation: typeof record.author_association === "string" ? record.author_association : "NONE",
  };
}

export class GitHubClient {
  readonly owner: string;
  readonly repository: string;
  readonly apiBaseUrl: URL;
  private readonly ownerPath: string;
  private readonly repositoryPath: string;
  private readonly tokens: InstallationTokenProvider;
  private readonly state: BridgeState;
  private readonly fetchImpl: typeof fetch;
  private readonly now: () => number;
  private readonly timeoutMs: number;

  constructor(options: GitHubClientOptions) {
    this.owner = options.owner;
    this.repository = options.repository;
    this.ownerPath = repositoryPart(options.owner, "GitHub owner");
    this.repositoryPath = repositoryPart(options.repository, "GitHub repository");
    this.tokens = options.tokens;
    this.state = options.state;
    this.fetchImpl = options.fetch ?? fetch;
    this.apiBaseUrl = apiBase(options.apiBaseUrl ?? "https://api.github.com");
    this.now = options.now ?? Date.now;
    this.timeoutMs = options.timeoutMs ?? 15_000;
  }

  private resolve(target: string): URL {
    const url = new URL(target, this.apiBaseUrl);
    if (url.origin !== this.apiBaseUrl.origin) throw new Error("GitHub pagination URL changed origin");
    return url;
  }

  private async send(
    method: string,
    target: string,
    body?: JsonValue,
    extraHeaders: Record<string, string> = {},
    retryUnauthorized = true,
  ): Promise<Response> {
    const token = await this.tokens.token();
    const response = await this.fetchImpl(this.resolve(target), {
      method,
      headers: {
        Accept: "application/vnd.github+json",
        Authorization: `Bearer ${token}`,
        "User-Agent": "agentic-workflow-opencode-bridge",
        "X-GitHub-Api-Version": githubApiVersion,
        ...(body === undefined ? {} : { "Content-Type": "application/json" }),
        ...extraHeaders,
      },
      ...(body === undefined ? {} : { body: JSON.stringify(body) }),
      signal: AbortSignal.timeout(this.timeoutMs),
    });
    if (response.status === 401 && retryUnauthorized) {
      this.tokens.invalidate();
      return this.send(method, target, body, extraHeaders, false);
    }
    if (!response.ok && response.status !== 304) {
      const text = await response.text();
      throw new GitHubHttpError(response.status, text, retryTime(response.headers, this.now()));
    }
    return response;
  }

  async getJson(target: string): Promise<JsonValue> {
    const response = await this.send("GET", target);
    return asJson(await response.json());
  }

  async postJson(target: string, body: JsonValue): Promise<JsonValue | undefined> {
    const response = await this.send("POST", target, body);
    return response.status === 204 ? undefined : asJson(await response.json());
  }

  async delete(target: string): Promise<void> {
    await this.send("DELETE", target);
  }

  async repositoryInfo(): Promise<JsonValue> {
    return this.getJson(`repos/${this.ownerPath}/${this.repositoryPath}`);
  }

  private async cachedPage(target: string): Promise<{ data: JsonValue[]; next?: string }> {
    const url = this.resolve(target);
    const key = `github-page:${url.toString()}`;
    const cached = this.state.cache(key);
    const response = await this.send("GET", url.toString(), undefined, cached?.etag ? { "If-None-Match": cached.etag } : {});
    if (response.status === 304) {
      if (cached?.value === undefined) throw new Error("GitHub returned 304 without a cached response");
      const value = asRecord(cached.value, "cached GitHub page");
      if (!Array.isArray(value.data)) throw new TypeError("Cached GitHub page is invalid");
      return { data: value.data.map(asJson), ...(typeof value.next === "string" ? { next: value.next } : {}) };
    }
    const value = await response.json();
    if (!Array.isArray(value)) throw new TypeError("GitHub paginated response is not an array");
    const data = value.map(asJson);
    const next = nextLink(response.headers.get("link"));
    this.state.setEtag(key, response.headers.get("etag") ?? undefined, { data, ...(next ? { next } : {}) });
    return { data, ...(next ? { next } : {}) };
  }

  private async paginate(target: string): Promise<JsonValue[]> {
    const output: JsonValue[] = [];
    let next: string | undefined = target;
    const visited = new Set<string>();
    while (next) {
      const url = this.resolve(next).toString();
      if (visited.has(url) || visited.size >= 100) throw new Error("GitHub pagination loop or page limit detected");
      visited.add(url);
      const page = await this.cachedPage(url);
      output.push(...page.data);
      next = page.next;
    }
    return output;
  }

  async listControlIssues(label: string): Promise<GitHubIssue[]> {
    const query = new URLSearchParams({ state: "open", labels: label, per_page: "100", sort: "updated", direction: "asc" });
    const values = await this.paginate(`repos/${this.ownerPath}/${this.repositoryPath}/issues?${query}`);
    return values.map((value) => {
      const record = asRecord(value, "GitHub issue");
      if (!Number.isSafeInteger(record.number) || Number(record.number) < 1) throw new TypeError("GitHub issue number is invalid");
      return {
        number: Number(record.number),
        body: typeof record.body === "string" ? record.body : "",
        ...actor(record),
        pullRequest: record.pull_request !== undefined,
      };
    }).filter((issue) => !issue.pullRequest);
  }

  async listIssueComments(issueNumber: number): Promise<GitHubComment[]> {
    if (!Number.isSafeInteger(issueNumber) || issueNumber < 1) throw new TypeError("GitHub issue number is invalid");
    const values = await this.paginate(`repos/${this.ownerPath}/${this.repositoryPath}/issues/${issueNumber}/comments?per_page=100`);
    return values.map((value) => {
      const record = asRecord(value, "GitHub issue comment");
      if (!Number.isSafeInteger(record.id) || Number(record.id) < 1) throw new TypeError("GitHub comment ID is invalid");
      return {
        id: Number(record.id),
        body: typeof record.body === "string" ? record.body : "",
        ...actor(record),
      };
    });
  }

  async createComment(issueNumber: number, body: string): Promise<void> {
    if (Buffer.byteLength(body, "utf8") > 65_536) throw new TypeError("GitHub comment exceeds 65536 bytes");
    await this.postJson(`repos/${this.ownerPath}/${this.repositoryPath}/issues/${issueNumber}/comments`, { body });
  }

  async addLabels(issueNumber: number, labels: string[]): Promise<void> {
    if (labels.length === 0 || labels.some((label) => !label || label.length > 50)) throw new TypeError("GitHub labels are invalid");
    await this.postJson(`repos/${this.ownerPath}/${this.repositoryPath}/issues/${issueNumber}/labels`, { labels });
  }

  async removeLabel(issueNumber: number, label: string): Promise<void> {
    if (!Number.isSafeInteger(issueNumber) || issueNumber < 1 || !label || label.length > 50) throw new TypeError("GitHub label removal is invalid");
    try {
      await this.delete(`repos/${this.ownerPath}/${this.repositoryPath}/issues/${issueNumber}/labels/${encodeURIComponent(label)}`);
    } catch (error) {
      if (!(error instanceof GitHubHttpError) || error.status !== 404) throw error;
    }
  }

  async ensureLabel(label: string, color: string, description: string, checkOnly: boolean): Promise<boolean> {
    if (!label || label.length > 50 || !/^[0-9a-f]{6}$/i.test(color)) throw new TypeError("GitHub label definition is invalid");
    try {
      await this.getJson(`repos/${this.ownerPath}/${this.repositoryPath}/labels/${encodeURIComponent(label)}`);
      return true;
    } catch (error) {
      if (!(error instanceof GitHubHttpError) || error.status !== 404) throw error;
      if (checkOnly) return false;
      await this.postJson(`repos/${this.ownerPath}/${this.repositoryPath}/labels`, { name: label, color, description });
      return true;
    }
  }

  async hasCommentMarker(issueNumber: number, value: string, author: string): Promise<boolean> {
    const expected = author.toLowerCase();
    return (await this.listIssueComments(issueNumber)).some((comment) => comment.author.toLowerCase() === expected && comment.body.includes(value));
  }
}

export interface GitHubCommandPollerOptions {
  github: GitHubClient;
  state: BridgeState;
  allowedAuthors: string[];
  label?: string;
}

export interface PollResult {
  issueCount: number;
  sourceCount: number;
  commands: StoredCommand[];
  requests: StoredRequest[];
  rejected: number;
  unauthorized: number;
}

const trustedAssociations = new Set(["OWNER", "MEMBER", "COLLABORATOR"]);

export class GitHubCommandPoller {
  private readonly github: GitHubClient;
  private readonly state: BridgeState;
  private readonly allowedAuthors: Set<string>;
  private readonly label: string;

  constructor(options: GitHubCommandPollerOptions) {
    if (options.allowedAuthors.length === 0) throw new Error("At least one GitHub command author must be allowed");
    this.github = options.github;
    this.state = options.state;
    this.allowedAuthors = new Set(options.allowedAuthors.map((value) => value.toLowerCase()));
    this.label = options.label ?? "agentic-bridge";
  }

  private authorized(author: string, association: string): boolean {
    return this.allowedAuthors.has(author.toLowerCase()) && trustedAssociations.has(association);
  }

  private enqueueComment(issueNumber: number, dedupeKey: string, body: string): void {
    this.state.enqueue(dedupeKey, "issue-comment", issueNumber, { body });
  }

  private rejectCommand(
    issueNumber: number,
    markerHash: string,
    envelope: CommandEnvelope,
    reason: string,
  ): void {
    const admission = this.state.rejectCommand(envelope, reason);
    const detail = admission.disposition === "rejected"
      ? admission.reason ?? reason
      : "Command UUID conflicts with an existing command";
    this.enqueueComment(
      issueNumber,
      `preledger-command:${envelope.command_id}`,
      invalidCommandComment(markerHash, detail),
    );
  }

  async pollOnce(): Promise<PollResult> {
    const issues = await this.github.listControlIssues(this.label);
    const openMutatingIssues = new Set(issues.filter((issue) => {
      const task = this.state.taskForIssue(issue.number);
      return task !== undefined && this.state.hasMutatingTask(task);
    }).map((issue) => issue.number));
    if (openMutatingIssues.size > 1) throw new Error("Multiple mutating bridge control issues are open; close all but the active mutating task issue");
    const commands: StoredCommand[] = [];
    const requests: StoredRequest[] = [];
    let sourceCount = 0;
    let rejected = 0;
    let unauthorized = 0;
    for (const issue of issues) {
      const comments = await this.github.listIssueComments(issue.number);
      const sources = [issue, ...comments];
      for (const source of sources) {
        sourceCount++;
        if (!this.authorized(source.author, source.authorAssociation)) {
          unauthorized += source.body.match(/<!--\s*agentic-bridge-command/g)?.length ?? 0;
          unauthorized += source.body.match(/<!--\s*agentic-bridge-request/g)?.length ?? 0;
          continue;
        }
        const scanned = scanCommandEnvelopes(source.body);
        for (const item of scanned) {
          if (!item.valid) {
            rejected++;
            this.enqueueComment(issue.number, `invalid-command:${issue.number}:${item.markerHash}`, invalidCommandComment(item.markerHash, item.error));
            continue;
          }
          const envelope = item.envelope;
          const bound = this.state.taskForIssue(issue.number);
          if (bound === undefined && envelope.kind !== "start") {
            rejected++;
            this.rejectCommand(issue.number, item.markerHash, envelope, "The first command for an issue must be start");
            continue;
          }
          if (bound !== undefined && bound !== envelope.task_id) {
            rejected++;
            this.rejectCommand(issue.number, item.markerHash, envelope, "Command task does not match the issue binding");
            continue;
          }
          if (bound !== undefined && !this.state.hasMutatingTask(bound) && envelope.kind !== "start") {
            rejected++;
            this.rejectCommand(issue.number, item.markerHash, envelope, "The first mutating-task command must be start");
            continue;
          }
          if (envelope.kind === "start" && !this.state.hasMutatingTask(envelope.task_id)
            && [...openMutatingIssues].some((number) => number !== issue.number)) {
            rejected++;
            this.rejectCommand(issue.number, item.markerHash, envelope, "Another mutating bridge task issue is already open for this repository");
            continue;
          }
          if (bound === undefined) {
            this.state.bindIssueTask(issue.number, envelope.task_id);
          }
          const accepted: AcceptedCommand = this.state.acceptCommand(envelope, issue.number);
          if (accepted.disposition === "new") {
            commands.push(accepted.command!);
            if (envelope.kind === "start") openMutatingIssues.add(issue.number);
            this.enqueueComment(issue.number, `command-ack:${envelope.command_id}`, commandStatusComment(accepted.command!));
          } else if (accepted.disposition === "stale") {
            rejected++;
            this.enqueueComment(issue.number, `stale-command:${envelope.command_id}`, commandStatusComment(accepted.command!, "sequence is stale"));
          } else if (accepted.disposition === "conflict") {
            rejected++;
            this.enqueueComment(issue.number, `conflict-command:${envelope.command_id}`, invalidCommandComment(item.markerHash, "Command UUID or task sequence conflicts with an existing command"));
          } else if (accepted.disposition === "rejected") {
            rejected++;
            this.enqueueComment(
              issue.number,
              `preledger-command:${envelope.command_id}`,
              invalidCommandComment(item.markerHash, accepted.reason ?? "Command admission was rejected"),
            );
          }
        }

        for (const item of scanRequestEnvelopes(source.body)) {
          if (!item.valid) {
            rejected++;
            this.enqueueComment(issue.number, `invalid-request:${issue.number}:${item.markerHash}`, invalidRequestComment(item.markerHash, item.error));
            continue;
          }
          const envelope = item.envelope;
          let bound = this.state.taskForIssue(issue.number);
          if (bound === undefined) {
            if (envelope.kind !== "scout.start") {
              rejected++;
              this.enqueueComment(
                issue.number,
                `unbound-request:${envelope.request_id}`,
                invalidRequestComment(item.markerHash, "Only scout.start may establish a read-only task issue binding"),
              );
              continue;
            }
            this.state.bindIssueTask(issue.number, envelope.task_id);
            bound = envelope.task_id;
          }
          if (bound !== envelope.task_id) {
            rejected++;
            this.enqueueComment(
              issue.number,
              `request-task-mismatch:${envelope.request_id}`,
              invalidRequestComment(item.markerHash, "Request task does not match the issue binding"),
            );
            continue;
          }
          const accepted: AcceptedRequest = this.state.acceptRequest(envelope, issue.number);
          if (accepted.disposition === "new") {
            requests.push(accepted.request);
            this.enqueueComment(
              issue.number,
              `request-ack:${envelope.request_id}`,
              requestStatusComment(accepted.request),
            );
          } else if (accepted.disposition === "conflict") {
            rejected++;
            this.enqueueComment(
              issue.number,
              `conflict-request:${envelope.request_id}`,
              invalidRequestComment(item.markerHash, "Request UUID conflicts with an existing request"),
            );
          }
        }
      }
    }
    return { issueCount: issues.length, sourceCount, commands, requests, rejected, unauthorized };
  }
}

export interface GitHubOutboxOptions {
  github: GitHubClient;
  state: BridgeState;
  commentAuthor: string;
  now?: () => number;
  random?: () => number;
  writeIntervalMs?: number;
}

export class GitHubOutbox {
  private readonly github: GitHubClient;
  private readonly state: BridgeState;
  private readonly commentAuthor: string;
  private readonly now: () => number;
  private readonly random: () => number;
  private readonly writeIntervalMs: number;
  private lastWriteAt = 0;

  constructor(options: GitHubOutboxOptions) {
    this.github = options.github;
    this.state = options.state;
    if (!options.commentAuthor.toLowerCase().endsWith("[bot]")) throw new TypeError("GitHub outbox comment author must be an App bot login");
    this.commentAuthor = options.commentAuthor;
    this.now = options.now ?? Date.now;
    this.random = options.random ?? Math.random;
    this.writeIntervalMs = options.writeIntervalMs ?? 1_000;
    if (!Number.isSafeInteger(this.writeIntervalMs) || this.writeIntervalMs < 0) throw new TypeError("GitHub write interval is invalid");
  }

  private async beforeWrite(): Promise<void> {
    const delay = this.lastWriteAt + this.writeIntervalMs - this.now();
    if (delay > 0) await sleep(delay);
    this.lastWriteAt = this.now();
  }

  private async deliver(item: OutboxItem): Promise<void> {
    const payload = asRecord(item.payload, "GitHub outbox payload");
    if (item.kind === "issue-comment") {
      if (typeof payload.body !== "string") throw new TypeError("GitHub comment outbox payload is invalid");
      const token = `agentic-bridge-outbox:${sha256(item.dedupeKey)}`;
      const marker = `<!-- ${token} -->`;
      if (await this.github.hasCommentMarker(item.issueNumber, token, this.commentAuthor)) return;
      await this.beforeWrite();
      await this.github.createComment(item.issueNumber, `${payload.body}\n${marker}`);
      return;
    }
    if (item.kind === "add-labels") {
      if (!Array.isArray(payload.labels) || payload.labels.some((label) => typeof label !== "string")) throw new TypeError("GitHub label outbox payload is invalid");
      await this.beforeWrite();
      await this.github.addLabels(item.issueNumber, payload.labels as string[]);
      return;
    }
    if (item.kind === "remove-label") {
      if (typeof payload.label !== "string") throw new TypeError("GitHub label-removal outbox payload is invalid");
      await this.beforeWrite();
      await this.github.removeLabel(item.issueNumber, payload.label);
      return;
    }
    throw new TypeError(`Unsupported GitHub outbox kind ${item.kind}`);
  }

  async flush(limit = 25): Promise<{ delivered: number; retried: number }> {
    let delivered = 0;
    let retried = 0;
    for (const item of this.state.orderedOutbox(this.now(), limit)) {
      try {
        await this.deliver(item);
        this.state.deliverOutbox(item.id);
        delivered++;
      } catch (error) {
        if (error instanceof TypeError) throw error;
        const retryAt = error instanceof GitHubHttpError && error.retryAt !== undefined
          ? Math.max(error.retryAt, this.now() + 1_000)
          : this.now() + backoff(item.attempts, 1_000, 300_000, this.random);
        this.state.retryOutbox(item.id, errorMessage(error), retryAt);
        retried++;
        break;
      }
    }
    return { delivered, retried };
  }
}

export interface GitHubControlLoopOptions {
  poller: GitHubCommandPoller;
  outbox: GitHubOutbox;
  state: BridgeState;
  activeIntervalMs?: number;
  idleIntervalMs?: number;
  now?: () => number;
  random?: () => number;
  onError?: (error: unknown) => void | Promise<void>;
}

export class GitHubControlLoop {
  private readonly poller: GitHubCommandPoller;
  private readonly outbox: GitHubOutbox;
  private readonly state: BridgeState;
  private readonly activeIntervalMs: number;
  private readonly idleIntervalMs: number;
  private readonly now: () => number;
  private readonly random: () => number;
  private readonly onError?: GitHubControlLoopOptions["onError"];

  constructor(options: GitHubControlLoopOptions) {
    this.poller = options.poller;
    this.outbox = options.outbox;
    this.state = options.state;
    this.activeIntervalMs = options.activeIntervalMs ?? 2_000;
    this.idleIntervalMs = options.idleIntervalMs ?? 15_000;
    this.now = options.now ?? Date.now;
    this.random = options.random ?? Math.random;
    this.onError = options.onError;
  }

  async run(
    signal: AbortSignal,
    applyCommands: (commands: StoredCommand[]) => void | Promise<void>,
    applyRequests: (requests: StoredRequest[]) => void | Promise<void>,
  ): Promise<void> {
    let failures = 0;
    let hasOpenControlIssues = false;
    while (!signal.aborted) {
      try {
        const recovered = this.state.listCommands(["accepted"]);
        if (recovered.length > 0) await applyCommands(recovered);
        const recoveredRequests = this.state.listRequests(["accepted"]);
        if (recoveredRequests.length > 0) await applyRequests(recoveredRequests);
        await this.outbox.flush();
        const result = await this.poller.pollOnce();
        hasOpenControlIssues = result.issueCount > 0;
        if (result.commands.length > 0) await applyCommands(result.commands);
        if (result.requests.length > 0) await applyRequests(result.requests);
        await this.outbox.flush();
        failures = 0;
        const active = hasOpenControlIssues || this.state.listCommands(["accepted", "applying"]).length > 0;
        await sleep(active ? this.activeIntervalMs : this.idleIntervalMs, signal);
      } catch (error) {
        if (signal.aborted) return;
        await this.onError?.(error);
        const retryAt = error instanceof GitHubHttpError ? error.retryAt : undefined;
        const delay = retryAt === undefined
          ? backoff(failures++, 1_000, 300_000, this.random)
          : Math.max(1_000, retryAt - this.now());
        try {
          await sleep(delay, signal);
        } catch (sleepError) {
          if (!signal.aborted) throw sleepError;
        }
      }
    }
  }
}
