import assert from "node:assert/strict";
import { resolve } from "node:path";
import test from "node:test";
import { Manifest } from "../src/manifest.js";
import { OpenCodeClient } from "../src/opencode.js";
import { PtyConnection, type WebSocketLike } from "../src/pty.js";
import { parseSseChunk, subscribeSse } from "../src/sse.js";

const manifest = Manifest.load(resolve(import.meta.dirname, "../../../../contracts/opencode-bridge/operation-manifest.json"));

function asFetch(handler: (request: Request) => Response | Promise<Response>): typeof fetch {
  return (async (input: string | URL | Request, init?: RequestInit) => handler(new Request(input, init))) as typeof fetch;
}

function client(fetchImpl: typeof fetch): OpenCodeClient {
  return new OpenCodeClient({
    baseUrl: "http://127.0.0.1:4096",
    username: "bridge",
    password: "test-only-password",
    directory: "/work/project",
    manifest,
    fetch: fetchImpl,
  });
}

async function waitFor(predicate: () => boolean, timeoutMs = 2_000): Promise<void> {
  const deadline = Date.now() + timeoutMs;
  while (!predicate()) {
    if (Date.now() >= deadline) throw new Error("Timed out waiting for test condition");
    await new Promise((resolve) => setTimeout(resolve, 10));
  }
}

class FakeWebSocket extends EventTarget implements WebSocketLike {
  readyState = 0;
  binaryType = "blob";
  readonly sent: string[] = [];
  readonly url: string;

  constructor(url: string) {
    super();
    this.url = url;
  }

  open(): void {
    this.readyState = 1;
    this.dispatchEvent(new Event("open"));
  }

  message(data: string | ArrayBuffer | Uint8Array): void {
    this.dispatchEvent(new MessageEvent("message", { data }));
  }

  send(data: string): void {
    this.sent.push(data);
  }

  close(): void {
    if (this.readyState === 3) return;
    this.readyState = 3;
    this.dispatchEvent(new Event("close"));
  }
}

test("SSE parser handles comments, fields, multiline JSON, and plain text", () => {
  assert.deepEqual(parseSseChunk(": keepalive\nid: 42\nevent: update\nretry: 1500\ndata: {\"value\":\ndata: 1}"), {
    id: "42",
    event: "update",
    retry: 1500,
    data: { value: 1 },
  });
  assert.deepEqual(parseSseChunk("data: plain\ndata: text"), { data: "plain\ntext" });
  assert.equal(parseSseChunk(": heartbeat"), undefined);
});

test("SSE subscription streams framed events with auth, directory, and media negotiation", async () => {
  const encoder = new TextEncoder();
  const requests: Request[] = [];
  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      controller.enqueue(encoder.encode("data: {\"type\":\r"));
      controller.enqueue(encoder.encode("\ndata: \"server.connected\"}\r\n\r"));
      controller.enqueue(encoder.encode("\nid: durable-2\r\ndata: {\"type\":\"message.updated\"}\r\n\r"));
      controller.enqueue(encoder.encode("\n"));
      controller.close();
    },
  });
  const api = client(asFetch((request) => {
    requests.push(request);
    return new Response(stream, { headers: { "content-type": "text/event-stream" } });
  }));
  const events = [];
  for await (const event of subscribeSse(api, "event.subscribe", {}, new AbortController().signal)) events.push(event);

  assert.deepEqual(events, [
    { data: { type: "server.connected" } },
    { id: "durable-2", data: { type: "message.updated" } },
  ]);
  assert.equal(requests.length, 1);
  assert.equal(requests[0]?.headers.get("accept"), "text/event-stream");
  assert.match(requests[0]?.headers.get("authorization") ?? "", /^Basic /);
  assert.equal(new URL(requests[0]!.url).searchParams.get("directory"), "/work/project");
  await assert.rejects(api.raw("global.health"), /uses http, not sse/);
});

test("SSE subscription rejects a successful response with the wrong media type", async () => {
  const api = client(asFetch(() => Response.json({ type: "not-a-stream" })));
  const consume = async () => {
    for await (const _event of subscribeSse(api, "event.subscribe", {}, new AbortController().signal)) {
      // No event should be accepted from a non-SSE response.
    }
  };
  await assert.rejects(consume(), /returned a non-SSE response/);
});

test("PTY obtains a one-use ticket, resumes by cursor, and handles output/control/input frames", async () => {
  const requests: Request[] = [];
  const api = client(asFetch((request) => {
    requests.push(request);
    return Response.json({ ticket: "single-use-ticket" });
  }));
  let socket: FakeWebSocket | undefined;
  const output: Array<{ text: string; start: number; end: number }> = [];
  const cursors: number[] = [];
  const states: string[] = [];
  const connection = new PtyConnection({
    client: api,
    ptyId: "pty/one",
    cursor: 7,
    webSocketFactory: (url) => {
      socket = new FakeWebSocket(url);
      queueMicrotask(() => socket?.open());
      return socket;
    },
    onOutput: (text, start, end) => {
      output.push({ text, start, end });
    },
    onCursor: (cursor) => {
      cursors.push(cursor);
    },
    onState: (state) => {
      states.push(state);
    },
  });

  await connection.connect();
  assert.ok(socket);
  assert.equal(requests.length, 1);
  assert.equal(requests[0]?.method, "POST");
  assert.equal(requests[0]?.headers.get("x-opencode-ticket"), "1");
  assert.equal(new URL(requests[0]!.url).pathname, "/pty/pty%2Fone/connect-token");
  const socketUrl = new URL(socket.url);
  assert.equal(socketUrl.protocol, "ws:");
  assert.equal(socketUrl.pathname, "/pty/pty%2Fone/connect");
  assert.equal(socketUrl.searchParams.get("cursor"), "7");
  assert.equal(socketUrl.searchParams.get("ticket"), "single-use-ticket");
  assert.equal(socketUrl.searchParams.get("directory"), "/work/project");
  assert.deepEqual(states, ["connecting", "connected"]);

  await connection.handleFrame("hello");
  const control = new TextEncoder().encode(JSON.stringify({ cursor: 12 }));
  const frame = new Uint8Array(control.length + 1);
  frame.set(control, 1);
  await connection.handleFrame(frame);
  await connection.handleFrame("!");
  assert.deepEqual(output, [
    { text: "hello", start: 7, end: 12 },
    { text: "!", start: 12, end: 13 },
  ]);
  assert.deepEqual(cursors, [12]);
  assert.equal(connection.currentCursor(), 13);
  connection.input("ls\n");
  assert.deepEqual(socket.sent, ["ls\n"]);
  connection.close();
  assert.equal(socket.readyState, 3);
});

test("PTY rejects malformed cursor frames and supports v2 location scoping", async () => {
  let socket: FakeWebSocket | undefined;
  const api = client(asFetch(() => Response.json({ data: { ticket: "v2-ticket" } })));
  const connection = new PtyConnection({
    client: api,
    ptyId: "pty-two",
    operationPrefix: "v2.pty",
    webSocketFactory: (url) => {
      socket = new FakeWebSocket(url);
      queueMicrotask(() => socket?.open());
      return socket;
    },
    onOutput: () => undefined,
  });
  await connection.connect();
  assert.ok(socket);
  const url = new URL(socket.url);
  assert.equal(url.pathname, "/api/pty/pty-two/connect");
  assert.equal(url.searchParams.get("location[directory]"), "/work/project");

  const malformed = new Uint8Array([0, ...new TextEncoder().encode("{\"cursor\":-2}")]);
  await assert.rejects(connection.handleFrame(malformed), /Invalid OpenCode PTY cursor frame/);
  connection.close();
});

test("PTY run loop reconnects with a fresh ticket and persisted cursor", async () => {
  let ticket = 0;
  const sockets: FakeWebSocket[] = [];
  const api = client(asFetch(() => Response.json({ ticket: `ticket-${++ticket}` })));
  const connection = new PtyConnection({
    client: api,
    ptyId: "pty-reconnect",
    webSocketFactory: (url) => {
      const socket = new FakeWebSocket(url);
      sockets.push(socket);
      queueMicrotask(() => socket.open());
      return socket;
    },
    onOutput: () => undefined,
  });

  const running = connection.run(new AbortController().signal, () => 0);
  await waitFor(() => sockets.length === 1);
  await connection.handleFrame("abc");
  sockets[0]!.close();
  await waitFor(() => sockets.length === 2);
  const reconnectUrl = new URL(sockets[1]!.url);
  assert.equal(reconnectUrl.searchParams.get("cursor"), "3");
  assert.equal(reconnectUrl.searchParams.get("ticket"), "ticket-2");
  connection.close();
  await running;
  assert.equal(ticket, 2);
});

test("PTY retains its prior cursor when durable output persistence fails", async () => {
  const api = client(asFetch(() => Response.json({ ticket: "unused" })));
  const connection = new PtyConnection({
    client: api,
    ptyId: "pty-failure",
    cursor: 4,
    webSocketFactory: () => new FakeWebSocket("ws://127.0.0.1/unused"),
    onOutput: () => {
      throw new Error("database unavailable");
    },
    onCursor: () => {
      throw new Error("database unavailable");
    },
  });
  await assert.rejects(connection.handleFrame("lost"), /database unavailable/);
  assert.equal(connection.currentCursor(), 4);
  const control = new Uint8Array([0, ...new TextEncoder().encode("{\"cursor\":9}")]);
  await assert.rejects(connection.handleFrame(control), /database unavailable/);
  assert.equal(connection.currentCursor(), 4);
});
