import assert from "node:assert/strict";
import { createVerify, generateKeyPairSync } from "node:crypto";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test, { type TestContext } from "node:test";
import { GitHubAppAuth, type InstallationTokenProvider } from "../src/github-auth.js";
import { GitHubClient, GitHubCommandPoller, GitHubOutbox } from "../src/github.js";
import {
  commandStatusComment,
  invalidCommandComment,
  parseCommandEnvelope,
  parseRequestEnvelope,
  scanCommandEnvelopes,
  scanRequestEnvelopes,
} from "../src/protocol.js";
import { BridgeState } from "../src/state.js";
import type { CommandEnvelope, RequestEnvelope } from "../src/types.js";
import { sha256 } from "../src/util.js";

function asFetch(handler: (request: Request) => Response | Promise<Response>): typeof fetch {
  return (async (input: string | URL | Request, init?: RequestInit) => handler(new Request(input, init))) as typeof fetch;
}

function stateForTest(context: TestContext): BridgeState {
  const root = mkdtempSync(join(tmpdir(), "opencode-bridge-github-"));
  const state = new BridgeState(join(root, "private", "bridge.sqlite"));
  context.after(() => {
    state.close();
    rmSync(root, { recursive: true, force: true });
  });
  return state;
}

class FakeTokens implements InstallationTokenProvider {
  calls = 0;
  invalidations = 0;

  async token(): Promise<string> {
    this.calls++;
    return `installation-${this.invalidations}`;
  }

  invalidate(): void {
    this.invalidations++;
  }
}

function envelope(commandId: string, sequence: number, kind = "status", task = "AGENTIC-BRIDGE-001"): CommandEnvelope {
  return {
    protocol: "agentic-bridge/1",
    sequence,
    command_id: commandId,
    task_id: task,
    kind,
    arguments: {},
    ...(kind === "start" ? { expected: { developer_sha: "a".repeat(40), ref: "developer" } } : {}),
  };
}

function commandMarker(command: CommandEnvelope): string {
  return `<!-- agentic-bridge-command\n${JSON.stringify(command)}\n-->`;
}

function requestMarker(request: RequestEnvelope): string {
  return `<!-- agentic-bridge-request\n${JSON.stringify(request)}\n-->`;
}

function actor(login: string, association: string) {
  return { user: { login }, author_association: association };
}

test("protocol scanner validates complete envelopes and isolates malformed markers", () => {
  const command = {
    ...envelope("11111111-1111-4111-8111-111111111111", 1, "start"),
    arguments: { prompt: "Implement the task" },
    expected: { developer_sha: "a".repeat(40), ref: "refs/heads/developer" },
  };
  assert.deepEqual(parseCommandEnvelope(command), command);
  const scanned = scanCommandEnvelopes([
    "Public-safe task text.",
    commandMarker(command),
    "<!-- agentic-bridge-command\n{not-json}\n-->",
  ].join("\n"));
  assert.equal(scanned.length, 2);
  assert.equal(scanned[0]?.valid, true);
  assert.equal(scanned[0]?.markerHash, sha256(`${JSON.stringify(command)}\n`));
  assert.equal(scanned[1]?.valid, false);
  assert.match(scanned[1]?.valid === false ? scanned[1].error : "", /JSON|property/i);

  assert.throws(() => parseCommandEnvelope({ ...command, sequence: 0 }), /positive safe integer/);
  assert.throws(() => parseCommandEnvelope({ ...command, kind: "shell.exec" }), /unsupported/);
  assert.throws(() => parseCommandEnvelope({ ...command, extra: true }), /unknown field/);
  assert.throws(() => parseCommandEnvelope({ ...command, expected: { developer_sha: "A".repeat(40) } }), /lowercase hexadecimal/);
  assert.throws(() => parseCommandEnvelope({ ...command, expected: { ref: "refs/heads/../main" } }), /ref is invalid/);
});

test("sequence-free request scanner validates durable read request envelopes", () => {
  const request: RequestEnvelope = {
    protocol: "agentic-bridge/1",
    request_id: "99999999-9999-4999-8999-999999999999",
    task_id: "TASK-1",
    kind: "command.status",
    arguments: { command_id: "11111111-1111-4111-8111-111111111111" },
  };
  assert.deepEqual(parseRequestEnvelope(request), request);
  const scanned = scanRequestEnvelopes(`${requestMarker(request)}\n<!-- agentic-bridge-request\n{}\n-->`);
  assert.equal(scanned.length, 2);
  assert.equal(scanned[0]?.valid, true);
  assert.equal(scanned[0]?.markerHash, sha256(`${JSON.stringify(request)}\n`));
  assert.equal(scanned[1]?.valid, false);
  assert.throws(() => parseRequestEnvelope({ ...request, kind: "command.retry" }), /unsupported/);
  assert.throws(() => parseRequestEnvelope({ ...request, sequence: 1 }), /unknown field/);
  const scout: RequestEnvelope = {
    ...request,
    request_id: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
    kind: "scout.start",
    arguments: {
      question: "Where is admission enforced?",
      ref: "a".repeat(40),
      scope: "tools/opencode-bridge/src/state.ts",
      expected_evidence: "path, symbol, and lines",
    },
  };
  assert.deepEqual(parseRequestEnvelope(scout), scout);
  assert.throws(
    () => parseRequestEnvelope({ ...scout, arguments: { ...scout.arguments, sha: "a".repeat(40) } }),
    /unknown field sha/,
  );
  assert.throws(() => parseRequestEnvelope({ ...scout, arguments: { ...scout.arguments, ref: "developer" } }), /exact.*commit SHA/);
  assert.throws(() => parseRequestEnvelope({ ...scout, arguments: { ...scout.arguments, question: "" } }), /question.*non-empty/);
});

test("poller durably rejects a nested start guard without consuming sequence one", async (context) => {
  const state = stateForTest(context);
  const invalid = {
    ...envelope("12121212-1212-4121-8121-121212121212", 1, "start"),
    arguments: {
      brief: "Do not execute this malformed probe",
      expected: { developer_sha: "a".repeat(40), ref: "developer" },
    },
    expected: undefined,
  } as unknown as CommandEnvelope;
  const valid = {
    ...envelope("34343434-3434-4343-8343-343434343434", 1, "start"),
    arguments: { brief: "Execute only the canonical guarded start" },
  };
  const github = new GitHubClient({
    owner: "acme",
    repository: "demo",
    tokens: new FakeTokens(),
    state,
    apiBaseUrl: "https://api.github.test",
    fetch: asFetch((request) => {
      const path = new URL(request.url).pathname;
      if (path === "/repos/acme/demo/issues") {
        return Response.json([{ number: 7, body: "Smoke probe", labels: [{ name: "agentic-bridge" }], ...actor("alice", "OWNER") }]);
      }
      if (path === "/repos/acme/demo/issues/7/comments") {
        return Response.json([
          { id: 1, body: commandMarker(invalid), ...actor("alice", "COLLABORATOR") },
          { id: 2, body: commandMarker(valid), ...actor("alice", "COLLABORATOR") },
        ]);
      }
      return new Response("not found", { status: 404 });
    }),
  });
  const poller = new GitHubCommandPoller({ github, state, allowedAuthors: ["alice"] });
  const result = await poller.pollOnce();
  assert.deepEqual(result.commands.map((command) => command.commandId), [valid.command_id]);
  assert.match(state.commandRejection(invalid.command_id)?.reason ?? "", /top-level expected/);
  assert.equal(state.getCommand(valid.command_id)?.sequence, 1);
});

test("status projection never includes command arguments and neutralizes active Markdown", () => {
  const body = commandStatusComment({
    commandId: "11111111-1111-4111-8111-111111111111",
    taskId: "TASK-1",
    sequence: 1,
    state: "rejected",
  }, "bad @mention <script> `code`");
  assert.match(body, /agentic-bridge-status/);
  assert.ok(body.startsWith(`<!-- agentic-bridge-status\n${JSON.stringify({
    protocol: "agentic-bridge/1",
    command_id: "11111111-1111-4111-8111-111111111111",
    task_id: "TASK-1",
    sequence: 1,
    state: "rejected",
  })}\n-->\n`));
  assert.doesNotMatch(body, /@mention|<script>|`code`/);
  assert.doesNotMatch(body, /prompt|arguments|secret/);
  const invalid = invalidCommandComment("f".repeat(64), "bad marker");
  assert.ok(invalid.startsWith(`<!-- agentic-bridge-status\n${JSON.stringify({
    protocol: "agentic-bridge/1",
    marker_hash: "f".repeat(64),
    state: "rejected",
  })}\n-->\n`));
});

test("GitHub App auth signs JWTs, downscopes tokens, caches, and refreshes near expiry", async () => {
  const { privateKey, publicKey } = generateKeyPairSync("rsa", { modulusLength: 2048 });
  const privatePem = privateKey.export({ type: "pkcs8", format: "pem" }).toString();
  let clock = Date.parse("2026-08-11T12:00:00Z");
  let calls = 0;
  const auth = new GitHubAppAuth({
    appId: 12345,
    installationId: 67890,
    repository: "demo",
    privateKey: privatePem,
    apiBaseUrl: "https://api.github.test",
    now: () => clock,
    fetch: asFetch(async (request) => {
      calls++;
      assert.equal(new URL(request.url).pathname, "/app/installations/67890/access_tokens");
      assert.equal(request.headers.get("x-github-api-version"), "2026-03-10");
      assert.deepEqual(await request.json(), { repositories: ["demo"], permissions: { issues: "write", contents: "read" } });
      const jwt = request.headers.get("authorization")?.replace(/^Bearer /, "") ?? "";
      const parts = jwt.split(".");
      assert.equal(parts.length, 3);
      const payload = JSON.parse(Buffer.from(parts[1]!, "base64url").toString("utf8")) as Record<string, unknown>;
      assert.equal(payload.iss, "12345");
      assert.equal(Number(payload.exp) - Number(payload.iat), 600);
      const verifier = createVerify("RSA-SHA256").update(`${parts[0]}.${parts[1]}`).end();
      assert.equal(verifier.verify(publicKey, Buffer.from(parts[2]!, "base64url")), true);
      return Response.json({
        token: `token-${calls}`,
        expires_at: new Date(clock + 3_600_000).toISOString(),
        permissions: { issues: "write", contents: "read", metadata: "read" },
      });
    }),
  });

  assert.equal(await auth.token(), "token-1");
  assert.equal(await auth.token(), "token-1");
  assert.equal(calls, 1);
  clock += 3_550_000;
  assert.equal(await auth.token(), "token-2");
  assert.equal(calls, 2);
});

test("GitHub App auth rejects broader or insufficient installation permissions", async () => {
  const { privateKey } = generateKeyPairSync("rsa", { modulusLength: 2048 });
  const auth = new GitHubAppAuth({
    appId: 1,
    installationId: 2,
    repository: "demo",
    privateKey: privateKey.export({ type: "pkcs8", format: "pem" }).toString(),
    apiBaseUrl: "https://api.github.test",
    fetch: asFetch(() => Response.json({
      token: "unsafe",
      expires_at: new Date(Date.now() + 3_600_000).toISOString(),
      permissions: { issues: "write", contents: "write", actions: "write" },
    })),
  });
  await assert.rejects(auth.token(), /required Issues write and Contents read permissions/);
});

test("GitHub client paginates, filters pull requests, and reuses ETag-cached 304 pages", async (context) => {
  const state = stateForTest(context);
  const tokens = new FakeTokens();
  const calls = new Map<string, number>();
  const fetchImpl = asFetch((request) => {
    const url = new URL(request.url);
    const page = url.searchParams.get("page") ?? "1";
    calls.set(page, (calls.get(page) ?? 0) + 1);
    assert.match(request.headers.get("authorization") ?? "", /^Bearer installation-/);
    assert.equal(request.headers.get("x-github-api-version"), "2026-03-10");
    const etag = `"page-${page}"`;
    if (request.headers.get("if-none-match") === etag) return new Response(null, { status: 304, headers: { etag } });
    if (page === "1") {
      return Response.json([
        { number: 7, body: "one", ...actor("alice", "OWNER") },
      ], {
        headers: {
          etag,
          link: '<https://api.github.test/repos/acme/demo/issues?state=open&labels=agentic-bridge&per_page=100&page=2>; rel="next"',
        },
      });
    }
    return Response.json([
      { number: 8, body: "pull", pull_request: { url: "private" }, ...actor("alice", "OWNER") },
      { number: 9, body: "two", ...actor("alice", "MEMBER") },
    ], { headers: { etag } });
  });
  const github = new GitHubClient({
    owner: "acme",
    repository: "demo",
    tokens,
    state,
    fetch: fetchImpl,
    apiBaseUrl: "https://api.github.test",
  });

  assert.deepEqual((await github.listControlIssues("agentic-bridge")).map((issue) => issue.number), [7, 9]);
  assert.deepEqual((await github.listControlIssues("agentic-bridge")).map((issue) => issue.number), [7, 9]);
  assert.deepEqual(Object.fromEntries(calls), { "1": 2, "2": 2 });
});

test("GitHub client invalidates and retries one unauthorized installation token", async (context) => {
  const state = stateForTest(context);
  const tokens = new FakeTokens();
  let calls = 0;
  const github = new GitHubClient({
    owner: "acme",
    repository: "demo",
    tokens,
    state,
    apiBaseUrl: "https://api.github.test",
    fetch: asFetch((request) => {
      calls++;
      if (calls === 1) {
        assert.equal(request.headers.get("authorization"), "Bearer installation-0");
        return new Response("expired", { status: 401 });
      }
      assert.equal(request.headers.get("authorization"), "Bearer installation-1");
      return Response.json({ ok: true });
    }),
  });
  assert.deepEqual(await github.getJson("repos/acme/demo"), { ok: true });
  assert.equal(tokens.invalidations, 1);
  assert.equal(calls, 2);
});

test("poller accepts only authorized issue-bound commands and persists sequence outcomes", async (context) => {
  const state = stateForTest(context);
  const start = envelope("11111111-1111-4111-8111-111111111111", 1, "start");
  const status = envelope("33333333-3333-4333-8333-333333333333", 3);
  const stale = envelope("22222222-2222-4222-8222-222222222222", 2, "steer");
  const mismatch = envelope("44444444-4444-4444-8444-444444444444", 4, "status", "OTHER-TASK");
  const unauthorized = envelope("55555555-5555-4555-8555-555555555555", 4);
  const readRequest: RequestEnvelope = {
    protocol: "agentic-bridge/1",
    request_id: "88888888-8888-4888-8888-888888888888",
    task_id: "AGENTIC-BRIDGE-001",
    kind: "task.status",
    arguments: {},
  };
  const github = new GitHubClient({
    owner: "acme",
    repository: "demo",
    tokens: new FakeTokens(),
    state,
    apiBaseUrl: "https://api.github.test",
    fetch: asFetch((request) => {
      const path = new URL(request.url).pathname;
      if (path === "/repos/acme/demo/issues") {
        return Response.json([{ number: 7, body: commandMarker(start), ...actor("alice", "OWNER") }]);
      }
      if (path === "/repos/acme/demo/issues/7/comments") {
        return Response.json([
          { id: 1, body: requestMarker(readRequest), ...actor("alice", "COLLABORATOR") },
          { id: 2, body: commandMarker(status), ...actor("alice", "COLLABORATOR") },
          { id: 3, body: commandMarker(stale), ...actor("alice", "COLLABORATOR") },
          { id: 4, body: commandMarker(mismatch), ...actor("alice", "COLLABORATOR") },
          { id: 5, body: "<!-- agentic-bridge-command\n{\"kind\":\"shell.exec\"}\n-->", ...actor("alice", "COLLABORATOR") },
          { id: 6, body: commandMarker(unauthorized), ...actor("mallory", "COLLABORATOR") },
        ]);
      }
      return new Response("not found", { status: 404 });
    }),
  });
  const poller = new GitHubCommandPoller({ github, state, allowedAuthors: ["alice"] });
  const first = await poller.pollOnce();
  assert.equal(first.issueCount, 1);
  assert.equal(first.sourceCount, 7);
  assert.deepEqual(first.commands.map((command) => command.commandId), [start.command_id]);
  assert.deepEqual(first.requests.map((request) => request.requestId), [readRequest.request_id]);
  assert.equal(first.rejected, 4);
  assert.equal(first.unauthorized, 1);
  assert.equal(state.taskForIssue(7), "AGENTIC-BRIDGE-001");
  assert.equal(state.issueForTask("AGENTIC-BRIDGE-001"), 7);
  assert.deepEqual(state.listCommands(["accepted"]).map((command) => command.sequence), [1]);
  assert.match(state.commandRejection(status.command_id)?.reason ?? "", /exactly 2/);
  assert.match(state.commandRejection(stale.command_id)?.reason ?? "", /nonterminal/);
  assert.equal(state.pendingOutbox(Date.now() + 1_000).length, 6);

  const second = await poller.pollOnce();
  assert.equal(second.commands.length, 0);
  assert.equal(second.rejected, 4);
  assert.equal(state.pendingOutbox(Date.now() + 1_000).length, 6);
});

test("poller serializes repository work to one open control issue", async (context) => {
  const state = stateForTest(context);
  const firstStart = envelope("66666666-6666-4666-8666-666666666666", 1, "start", "TASK-ONE");
  const secondStart = envelope("77777777-7777-4777-8777-777777777777", 1, "start", "TASK-TWO");
  const replacementStart = envelope("88888888-8888-4888-8888-888888888888", 1, "start", "TASK-TWO");
  let polls = 0;
  const github = new GitHubClient({
    owner: "acme",
    repository: "demo",
    tokens: new FakeTokens(),
    state,
    apiBaseUrl: "https://api.github.test",
    fetch: asFetch((request) => {
      const path = new URL(request.url).pathname;
      if (path === "/repos/acme/demo/issues") {
        polls++;
        return Response.json(polls === 1 ? [
          { number: 10, body: commandMarker(firstStart), ...actor("alice", "OWNER") },
          { number: 11, body: commandMarker(secondStart), ...actor("alice", "OWNER") },
        ] : [
          { number: 11, body: commandMarker(secondStart), ...actor("alice", "OWNER") },
        ]);
      }
      if (path === "/repos/acme/demo/issues/10/comments") return Response.json([]);
      if (path === "/repos/acme/demo/issues/11/comments") {
        return Response.json(polls === 1 ? [] : [
          { id: 1, body: commandMarker(replacementStart), ...actor("alice", "COLLABORATOR") },
        ]);
      }
      return new Response("not found", { status: 404 });
    }),
  });
  const poller = new GitHubCommandPoller({ github, state, allowedAuthors: ["alice"] });
  const result = await poller.pollOnce();
  assert.deepEqual(result.commands.map((entry) => entry.commandId), [firstStart.command_id]);
  assert.equal(result.rejected, 1);
  assert.equal(state.taskForIssue(10), "TASK-ONE");
  assert.equal(state.taskForIssue(11), undefined);
  assert.match(state.commandRejection(secondStart.command_id)?.reason ?? "", /another mutating bridge task issue/i);

  const recovered = await poller.pollOnce();
  assert.deepEqual(recovered.commands.map((entry) => entry.commandId), [replacementStart.command_id]);
  assert.equal(recovered.rejected, 1);
  assert.equal(state.getCommand(secondStart.command_id), undefined);
  assert.equal(state.getCommand(replacementStart.command_id)?.sequence, 1);
  assert.equal(state.taskForIssue(11), "TASK-TWO");
});

test("poller admits multiple Scout-only issues alongside one mutating task issue", async (context) => {
  const state = stateForTest(context);
  const mutating = envelope("aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1", 1, "start", "TASK-MUTATING");
  const scout = (id: string, task: string): RequestEnvelope => ({
    protocol: "agentic-bridge/1",
    request_id: id,
    task_id: task,
    kind: "scout.start",
    arguments: {
      question: "Find the exact implementation boundary",
      ref: "a".repeat(40),
      scope: "tools/opencode-bridge/src",
      expected_evidence: "paths and symbols",
    },
  });
  const scoutOne = scout("bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb1", "TASK-SCOUT-ONE");
  const scoutTwo = scout("cccccccc-cccc-4ccc-8ccc-ccccccccccc1", "TASK-SCOUT-TWO");
  const github = new GitHubClient({
    owner: "acme",
    repository: "demo",
    tokens: new FakeTokens(),
    state,
    apiBaseUrl: "https://api.github.test",
    fetch: asFetch((request) => {
      const path = new URL(request.url).pathname;
      if (path === "/repos/acme/demo/issues") {
        return Response.json([
          { number: 20, body: requestMarker(scoutOne), ...actor("alice", "OWNER") },
          { number: 30, body: requestMarker(scoutTwo), ...actor("alice", "OWNER") },
          { number: 10, body: commandMarker(mutating), ...actor("alice", "OWNER") },
        ]);
      }
      if (path.match(/\/issues\/(10|20|30)\/comments$/)) return Response.json([]);
      return new Response("not found", { status: 404 });
    }),
  });
  const poller = new GitHubCommandPoller({ github, state, allowedAuthors: ["alice"] });
  const first = await poller.pollOnce();
  assert.deepEqual(first.commands.map((entry) => entry.taskId), ["TASK-MUTATING"]);
  assert.deepEqual(first.requests.map((entry) => entry.taskId), ["TASK-SCOUT-ONE", "TASK-SCOUT-TWO"]);
  assert.equal(first.rejected, 0);
  assert.equal(state.taskForIssue(20), "TASK-SCOUT-ONE");
  assert.equal(state.taskForIssue(30), "TASK-SCOUT-TWO");
  assert.equal(state.taskForIssue(10), "TASK-MUTATING");

  const second = await poller.pollOnce();
  assert.equal(second.commands.length, 0);
  assert.equal(second.requests.length, 0);
  assert.equal(second.rejected, 0);
});

test("outbox detects prior comments, appends dedupe markers, delivers labels, and honors retry-after", async (context) => {
  const state = stateForTest(context);
  state.enqueue("existing-comment", "issue-comment", 7, { body: "already delivered" });
  state.enqueue("new-comment", "issue-comment", 8, { body: "new result" });
  state.enqueue("labels", "add-labels", 8, { labels: ["bridge-status:active"] });
  state.enqueue("remove-label", "remove-label", 8, { label: "bridge-status:blocked" });
  let rateLimited = false;
  let clock = Date.now() + 1_000;
  const posted: Array<{ path: string; body: unknown }> = [];
  const github = new GitHubClient({
    owner: "acme",
    repository: "demo",
    tokens: new FakeTokens(),
    state,
    apiBaseUrl: "https://api.github.test",
    now: () => clock,
    fetch: asFetch(async (request) => {
      const url = new URL(request.url);
      if (request.method === "GET" && url.pathname.endsWith("/issues/7/comments")) {
        return Response.json([{ id: 1, body: `<!-- agentic-bridge-outbox:${sha256("existing-comment")} -->`, ...actor("bridge[bot]", "NONE") }]);
      }
      if (request.method === "GET" && url.pathname.endsWith("/issues/8/comments")) {
        return Response.json([{ id: 2, body: `<!-- agentic-bridge-outbox:${sha256("new-comment")} -->`, ...actor("untrusted-user", "OWNER") }]);
      }
      if (request.method === "GET" && url.pathname.endsWith("/issues/9/comments")) return Response.json([]);
      if (request.method === "POST") {
        const body = await request.json();
        posted.push({ path: url.pathname, body });
        if (url.pathname.endsWith("/issues/9/comments") && rateLimited) {
          return new Response("rate limited", { status: 403, headers: { "retry-after": "10" } });
        }
        return Response.json({ id: posted.length, ...body });
      }
      return new Response("not found", { status: 404 });
    }),
  });
  const outbox = new GitHubOutbox({ github, state, commentAuthor: "bridge[bot]", now: () => clock, random: () => 0, writeIntervalMs: 0 });
  assert.deepEqual(await outbox.flush(), { delivered: 4, retried: 0 });
  assert.equal(posted.length, 2);
  const comment = posted.find((entry) => entry.path.endsWith("/issues/8/comments"));
  assert.ok(comment && typeof comment.body === "object" && comment.body !== null);
  assert.match(String((comment.body as Record<string, unknown>).body), new RegExp(`agentic-bridge-outbox:${sha256("new-comment")}`));

  state.enqueue("rate-comment", "issue-comment", 9, { body: "later" });
  state.enqueue("after-rate-label", "add-labels", 9, { labels: ["bridge-status:blocked"] });
  rateLimited = true;
  assert.deepEqual(await outbox.flush(), { delivered: 0, retried: 1 });
  assert.equal(state.orderedOutbox(clock + 9_999).length, 0);
  assert.equal(state.orderedOutbox(clock + 10_000).length, 2);
  rateLimited = false;
  clock += 10_000;
  assert.deepEqual(await outbox.flush(), { delivered: 2, retried: 0 });
});
