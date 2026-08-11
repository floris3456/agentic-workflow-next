import { OpenCodeClient } from "./opencode.js";
import type { JsonValue, OperationArguments } from "./types.js";
import { backoff, isRecord, sleep } from "./util.js";

export interface WebSocketLike extends EventTarget {
  readonly readyState: number;
  readonly binaryType: string;
  send(data: string): void;
  close(code?: number, reason?: string): void;
}

export interface PtyConnectionOptions {
  client: OpenCodeClient;
  ptyId: string;
  operationPrefix?: "pty" | "v2.pty";
  cursor?: number;
  webSocketFactory?: (url: string) => WebSocketLike;
  onOutput: (text: string, start: number, end: number) => void | Promise<void>;
  onCursor?: (cursor: number) => void | Promise<void>;
  onState?: (state: "connecting" | "connected" | "disconnected" | "closed") => void | Promise<void>;
}

async function frameBytes(data: unknown): Promise<Uint8Array | undefined> {
  if (data instanceof ArrayBuffer) return new Uint8Array(data);
  if (ArrayBuffer.isView(data)) return new Uint8Array(data.buffer, data.byteOffset, data.byteLength);
  if (typeof Blob !== "undefined" && data instanceof Blob) return new Uint8Array(await data.arrayBuffer());
  return undefined;
}

function ticket(result: JsonValue | undefined): string {
  const direct = isRecord(result) ? result : undefined;
  const nested = direct && isRecord(direct.data) ? direct.data : undefined;
  const value = nested?.ticket ?? direct?.ticket;
  if (typeof value !== "string" || value.length === 0) throw new Error("OpenCode PTY ticket response is invalid");
  return value;
}

export class PtyConnection {
  private readonly client: OpenCodeClient;
  private readonly ptyId: string;
  private readonly prefix: "pty" | "v2.pty";
  private readonly factory: (url: string) => WebSocketLike;
  private readonly onOutput: PtyConnectionOptions["onOutput"];
  private readonly onCursor?: PtyConnectionOptions["onCursor"];
  private readonly onState?: PtyConnectionOptions["onState"];
  private socket: WebSocketLike | undefined;
  private disconnected: Promise<void> | undefined;
  private stopped = false;
  private cursor: number;

  constructor(options: PtyConnectionOptions) {
    this.client = options.client;
    this.ptyId = options.ptyId;
    this.prefix = options.operationPrefix ?? "pty";
    this.cursor = options.cursor ?? 0;
    this.factory = options.webSocketFactory ?? ((url) => {
      const socket = new WebSocket(url);
      socket.binaryType = "arraybuffer";
      return socket;
    });
    this.onOutput = options.onOutput;
    this.onCursor = options.onCursor;
    this.onState = options.onState;
  }

  currentCursor(): number {
    return this.cursor;
  }

  async handleFrame(data: unknown): Promise<void> {
    if (typeof data === "string") {
      const start = this.cursor;
      const end = start + data.length;
      await this.onOutput(data, start, end);
      this.cursor = end;
      return;
    }
    const bytes = await frameBytes(data);
    if (!bytes) return;
    if (bytes[0] === 0) {
      const decoded = JSON.parse(new TextDecoder().decode(bytes.slice(1))) as unknown;
      if (!isRecord(decoded) || !Number.isSafeInteger(decoded.cursor) || Number(decoded.cursor) < 0) {
        throw new Error("Invalid OpenCode PTY cursor frame");
      }
      const cursor = Number(decoded.cursor);
      await this.onCursor?.(cursor);
      this.cursor = cursor;
      return;
    }
    const text = new TextDecoder().decode(bytes);
    const start = this.cursor;
    const end = start + text.length;
    await this.onOutput(text, start, end);
    this.cursor = end;
  }

  async connect(signal?: AbortSignal): Promise<void> {
    if (this.socket) throw new Error("PTY is already connected or connecting");
    this.stopped = false;
    await this.onState?.("connecting");
    signal?.throwIfAborted();
    const args: OperationArguments = { path: { ptyID: this.ptyId } };
    const result = await this.client.request(`${this.prefix}.connectToken`, args, { "x-opencode-ticket": "1" });
    const operation = this.client.manifest.require(`${this.prefix}.connect`, "websocket");
    const url = new URL(operation.path.replace("{ptyID}", encodeURIComponent(this.ptyId)), this.client.baseUrl);
    url.protocol = url.protocol === "https:" ? "wss:" : "ws:";
    if (operation.parameters.some((parameter) => parameter.name === "directory")) url.searchParams.set("directory", this.client.directory);
    if (operation.parameters.some((parameter) => parameter.name === "location[directory]")) url.searchParams.set("location[directory]", this.client.directory);
    url.searchParams.set("cursor", String(this.cursor));
    url.searchParams.set("ticket", ticket(result));
    const socket = this.factory(url.toString());
    this.socket = socket;
    let finishDisconnect: (() => void) | undefined;
    this.disconnected = new Promise((resolve) => {
      finishDisconnect = resolve;
    });
    let frames = Promise.resolve();
    socket.addEventListener("message", (event) => {
      const data = (event as MessageEvent).data;
      frames = frames.then(() => this.handleFrame(data)).catch(() => {
        socket.close(1002, "invalid PTY frame");
      });
    });
    await new Promise<void>((resolve, reject) => {
      let opened = false;
      const cleanupHandshake = () => {
        socket.removeEventListener("open", onOpen);
        socket.removeEventListener("error", onError);
      };
      const onAbort = () => {
        socket.close(1000, "aborted");
        reject(signal?.reason ?? new Error("PTY connection aborted"));
      };
      const onOpen = () => {
        opened = true;
        cleanupHandshake();
        void this.onState?.("connected");
        resolve();
      };
      const onError = () => {
        if (!opened) reject(new Error("OpenCode PTY WebSocket connection failed"));
        socket.close(1011, "PTY WebSocket error");
      };
      socket.addEventListener("open", onOpen, { once: true });
      socket.addEventListener("error", onError, { once: true });
      socket.addEventListener("close", () => {
        cleanupHandshake();
        signal?.removeEventListener("abort", onAbort);
        if (!opened) reject(new Error("OpenCode PTY WebSocket closed before connecting"));
        if (this.socket === socket) this.socket = undefined;
        void this.onState?.(this.stopped ? "closed" : "disconnected");
        void frames.then(() => finishDisconnect?.());
      }, { once: true });
      signal?.addEventListener("abort", onAbort, { once: true });
      if (signal?.aborted) onAbort();
    });
  }

  async connectWithRetry(signal: AbortSignal, random = Math.random): Promise<void> {
    let attempt = 0;
    while (!signal.aborted && !this.stopped) {
      try {
        await this.connect(signal);
        return;
      } catch (error) {
        if (signal.aborted || this.stopped) throw error;
        await sleep(backoff(attempt++, 500, 30_000, random), signal);
      }
    }
  }

  async run(signal: AbortSignal, random = Math.random): Promise<void> {
    this.stopped = false;
    let attempt = 0;
    while (!signal.aborted && !this.stopped) {
      try {
        await this.connect(signal);
        attempt = 0;
        await this.disconnected;
      } catch (error) {
        if (signal.aborted) throw signal.reason ?? error;
        if (this.stopped) return;
      }
      if (!signal.aborted && !this.stopped) await sleep(backoff(attempt++, 500, 30_000, random), signal);
    }
  }

  input(data: string): void {
    if (!this.socket || this.socket.readyState !== 1) throw new Error("PTY is not connected");
    this.socket.send(data);
  }

  disconnect(): void {
    this.socket?.close(1000, "bridge disconnect");
    this.socket = undefined;
  }

  close(): void {
    this.stopped = true;
    this.disconnect();
  }
}
