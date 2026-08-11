import type { OperationArguments, SseEvent } from "./types.js";
import { OpenCodeClient } from "./opencode.js";

function parseChunk(chunk: string): SseEvent | undefined {
  const data: string[] = [];
  let id: string | undefined;
  let event: string | undefined;
  let retry: number | undefined;
  for (const line of chunk.split("\n")) {
    if (line.startsWith(":")) continue;
    const separator = line.indexOf(":");
    const field = separator === -1 ? line : line.slice(0, separator);
    const raw = separator === -1 ? "" : line.slice(separator + 1).replace(/^ /, "");
    if (field === "data") data.push(raw);
    else if (field === "id") id = raw;
    else if (field === "event") event = raw;
    else if (field === "retry" && /^\d+$/.test(raw)) retry = Number(raw);
  }
  if (data.length === 0) return undefined;
  const joined = data.join("\n");
  let decoded: unknown = joined;
  try {
    decoded = JSON.parse(joined);
  } catch {
    // Non-JSON SSE payloads are valid and remain strings.
  }
  return {
    data: decoded,
    ...(id === undefined ? {} : { id }),
    ...(event === undefined ? {} : { event }),
    ...(retry === undefined ? {} : { retry }),
  };
}

export async function* subscribeSse(
  client: OpenCodeClient,
  operationId: string,
  args: OperationArguments,
  signal: AbortSignal,
): AsyncGenerator<SseEvent> {
  const response = await client.raw(operationId, args, signal);
  if (!response.headers.get("content-type")?.toLowerCase().includes("text/event-stream")) {
    throw new Error(`${operationId} returned a non-SSE response`);
  }
  if (!response.body) throw new Error(`${operationId} returned no SSE body`);
  const reader = response.body.pipeThrough(new TextDecoderStream()).getReader();
  let buffer = "";
  try {
    while (!signal.aborted) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += value.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
      const chunks = buffer.split("\n\n");
      buffer = chunks.pop() ?? "";
      for (const chunk of chunks) {
        const event = parseChunk(chunk);
        if (event) yield event;
      }
    }
  } finally {
    await reader.cancel().catch(() => undefined);
    reader.releaseLock();
  }
}

export { parseChunk as parseSseChunk };
