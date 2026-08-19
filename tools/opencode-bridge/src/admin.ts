import { createConnection, createServer, type Server, type Socket } from "node:net";
import { existsSync, unlinkSync } from "node:fs";
import { chmod, unlink } from "node:fs/promises";
import type { JsonValue } from "./types.js";
import { errorMessage, isRecord } from "./util.js";

export interface BridgeAdminHandlers {
  onStatus: () => JsonValue | Promise<JsonValue>;
  onReconcile: () => JsonValue | Promise<JsonValue>;
}

export interface AdminRequestPayload {
  command: "status" | "reconcile";
}

export interface AdminResponsePayload {
  ok: boolean;
  data?: JsonValue;
  error?: string;
}

const MAX_PAYLOAD_BYTES = 64 * 1024;

export class BridgeAdminServer {
  private readonly socketPath: string;
  private readonly handlers: BridgeAdminHandlers;
  private server: Server | undefined;
  private started = false;

  constructor(socketPath: string, handlers: BridgeAdminHandlers) {
    this.socketPath = socketPath;
    this.handlers = handlers;
  }

  async start(): Promise<void> {
    if (this.started) return;
    this.cleanStaleSocket();
    this.server = createServer((socket: Socket) => this.handleConnection(socket));
    await new Promise<void>((resolve, reject) => {
      this.server!.once("error", reject);
      this.server!.listen(this.socketPath, () => {
        this.server!.removeListener("error", reject);
        resolve();
      });
    });
    try {
      await chmod(this.socketPath, 0o600);
    } catch (error) {
      await this.stop();
      throw new Error(`Failed to secure admin socket permissions: ${errorMessage(error)}`);
    }
    this.started = true;
  }

  private cleanStaleSocket(): void {
    if (!existsSync(this.socketPath)) return;
    try {
      unlinkSync(this.socketPath);
    } catch {
      // ignore
    }
  }

  private handleConnection(socket: Socket): void {
    let buffer = "";
    socket.setEncoding("utf8");

    const timer = setTimeout(() => {
      socket.destroy(new Error("Admin connection timeout"));
    }, 10_000);

    socket.on("data", (chunk: string) => {
      buffer += chunk;
      if (Buffer.byteLength(buffer, "utf8") > MAX_PAYLOAD_BYTES) {
        clearTimeout(timer);
        this.sendResponse(socket, { ok: false, error: "Request payload exceeds maximum size" });
        return;
      }
      const newlineIndex = buffer.indexOf("\n");
      if (newlineIndex !== -1) {
        clearTimeout(timer);
        const line = buffer.slice(0, newlineIndex).trim();
        void this.processRequest(socket, line);
      }
    });

    socket.on("error", () => {
      clearTimeout(timer);
    });
  }

  private async processRequest(socket: Socket, raw: string): Promise<void> {
    let parsed: unknown;
    try {
      parsed = JSON.parse(raw);
    } catch {
      this.sendResponse(socket, { ok: false, error: "Invalid JSON payload" });
      return;
    }

    if (!isRecord(parsed) || typeof parsed.command !== "string") {
      this.sendResponse(socket, { ok: false, error: "Admin request must include a command" });
      return;
    }

    try {
      if (parsed.command === "status") {
        const data = await this.handlers.onStatus();
        this.sendResponse(socket, { ok: true, data });
      } else if (parsed.command === "reconcile") {
        const data = await this.handlers.onReconcile();
        this.sendResponse(socket, { ok: true, data });
      } else {
        this.sendResponse(socket, { ok: false, error: `Unsupported admin command: ${parsed.command}` });
      }
    } catch (error) {
      this.sendResponse(socket, { ok: false, error: errorMessage(error) });
    }
  }

  private sendResponse(socket: Socket, response: AdminResponsePayload): void {
    if (!socket.writable) return;
    try {
      socket.end(`${JSON.stringify(response)}\n`);
    } catch {
      socket.destroy();
    }
  }

  async stop(): Promise<void> {
    if (this.server) {
      await new Promise<void>((resolve) => {
        this.server!.close(() => resolve());
      });
      this.server = undefined;
    }
    if (existsSync(this.socketPath)) {
      try {
        await unlink(this.socketPath);
      } catch {
        // ignore
      }
    }
    this.started = false;
  }
}

export class BridgeAdminClient {
  private readonly socketPath: string;

  constructor(socketPath: string) {
    this.socketPath = socketPath;
  }

  async isAvailable(timeoutMs = 1_000): Promise<boolean> {
    if (!existsSync(this.socketPath)) return false;
    try {
      await this.request({ command: "status" }, timeoutMs);
      return true;
    } catch {
      return false;
    }
  }

  async status(timeoutMs = 5_000): Promise<JsonValue> {
    return await this.request({ command: "status" }, timeoutMs);
  }

  async reconcile(timeoutMs = 30_000): Promise<JsonValue> {
    return await this.request({ command: "reconcile" }, timeoutMs);
  }

  private request(payload: AdminRequestPayload, timeoutMs: number): Promise<JsonValue> {
    return new Promise<JsonValue>((resolve, reject) => {
      let buffer = "";
      const socket = createConnection(this.socketPath);
      socket.setEncoding("utf8");

      const timer = setTimeout(() => {
        socket.destroy(new Error("Bridge admin request timed out"));
      }, timeoutMs);

      socket.once("connect", () => {
        socket.write(`${JSON.stringify(payload)}\n`);
      });

      socket.on("data", (chunk: string) => {
        buffer += chunk;
        const newlineIndex = buffer.indexOf("\n");
        if (newlineIndex !== -1) {
          clearTimeout(timer);
          socket.end();
          const line = buffer.slice(0, newlineIndex).trim();
          try {
            const parsed = JSON.parse(line) as AdminResponsePayload;
            if (!parsed.ok) {
              reject(new Error(parsed.error ?? "Admin request failed"));
              return;
            }
            resolve(parsed.data ?? null);
          } catch (err) {
            reject(new Error(`Malformed admin response: ${errorMessage(err)}`));
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
