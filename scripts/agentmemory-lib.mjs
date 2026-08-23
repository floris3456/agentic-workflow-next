export const ALLOWED_ROLES = [
  "lead-developer",
  "spark-implementer",
  "small-developer",
  "heavy-developer",
];

export const DEFAULT_SERVER_URL = process.env.AGENTMEMORY_URL || "http://127.0.0.1:3111";

export function getDefaultScopeForRole(role) {
  if (role === "spark-implementer") {
    return "own";
  }
  return "team";
}

function normalizeText(value) {
  return typeof value === "string" ? value.trim() : "";
}

/**
 * Validates memory input for safety, conciseness, and prohibited content.
 * Prohibits:
 * - reasoning / chain of thought
 * - secrets / credentials
 * - private runtime IDs / socket paths
 * - unnecessary absolute host paths
 * - raw logs / stack traces
 * - overly long content
 */
export function validateMemoryInput({ title, content, concepts, files } = {}) {
  if (!title || typeof title !== "string" || !title.trim()) {
    return { valid: false, reason: "title is required and cannot be empty" };
  }
  if (title.length > 200) {
    return { valid: false, reason: "title exceeds 200 characters (must be concise)" };
  }
  if (!content || typeof content !== "string" || !content.trim()) {
    return { valid: false, reason: "content is required and cannot be empty" };
  }
  if (content.length > 2000) {
    return { valid: false, reason: "content exceeds 2000 characters (must be concise)" };
  }
  if (title.length + content.length + 1 > 2000) {
    return { valid: false, reason: "title and content together exceed 2000 characters (must be concise)" };
  }
  const lines = content.split("\n");
  if (lines.length > 30) {
    return { valid: false, reason: "content exceeds 30 lines (must be concise)" };
  }

  if (concepts !== undefined && (!Array.isArray(concepts) || concepts.some((item) => typeof item !== "string"))) {
    return { valid: false, reason: "concepts must be an array of strings" };
  }
  if (files !== undefined && (!Array.isArray(files) || files.some((item) => typeof item !== "string"))) {
    return { valid: false, reason: "files must be an array of strings" };
  }
  if (Array.isArray(concepts) && concepts.some((item) => item.length > 100)) {
    return { valid: false, reason: "concept entries must be concise" };
  }
  if (Array.isArray(files) && files.some((item) => item.length > 300)) {
    return { valid: false, reason: "file entries must be concise" };
  }

  const combined = `${title}\n${content}\n${Array.isArray(concepts) ? concepts.join(" ") : ""}\n${Array.isArray(files) ? files.join(" ") : ""}`;

  // Reasoning / chain of thought patterns
  if (
    /^\s*(?:thought|reasoning|thinking|chain[- ]of[- ]thought)\s*:/im.test(combined) ||
    /<thought>/i.test(combined) ||
    /\bthinking process\b/i.test(combined)
  ) {
    return { valid: false, reason: "contains reasoning or internal thought trace" };
  }

  // Secrets / credentials patterns
  if (
    /\b(?:sk-[a-zA-Z0-9_-]{20,}|ghp_[a-zA-Z0-9]{20,}|gho_[a-zA-Z0-9]{20,}|github_pat_[a-zA-Z0-9_]{20,})\b/.test(combined) ||
    /\bbearer\s+[a-zA-Z0-9_\-\.]{20,}\b/i.test(combined) ||
    /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/.test(combined) ||
    /\b(?:password|passwd|secret|api[_-]?key|access[_-]?token|auth[_-]?token|private[_-]?key)\s*[:=]\s*(?:['"][^'"]{4,}['"]|\S+)/i.test(combined)
  ) {
    return { valid: false, reason: "contains suspected secrets or credentials" };
  }

  // Private runtime IDs / ephemeral socket paths
  if (
    /\bsession-[a-z0-9_-]{12,}\b/i.test(combined) ||
    /\bsession[_ -]?id\s*[:=]\s*[a-z0-9_-]{8,}\b/i.test(combined) ||
    /\b(?:run|request|trace|execution)[_-]?id\s*[:=]\s*[a-z0-9_-]{8,}\b/i.test(combined) ||
    /\/tmp\/[a-zA-Z0-9_-]+\.sock\b/.test(combined)
  ) {
    return { valid: false, reason: "contains private runtime IDs or ephemeral session descriptors" };
  }

  // Raw logs / stack traces
  if (
    /^\s*at\s+[\w\.<>_$/]+\s+\([^)]+:\d+:\d+\)/m.test(combined) ||
    /\b(?:TypeError|ReferenceError|SyntaxError|Error):\s+.*\n\s+at\s+/m.test(combined) ||
    /\b(?:raw\s+logs?|tool\s+output|stdout|stderr)\b/i.test(combined)
  ) {
    return { valid: false, reason: "contains raw log dumps or stack traces" };
  }

  // Absolute host paths (e.g. /home/user/..., /Users/..., C:\...)
  if (
    /(?:^|[\s("'`])(?:\/(?:[A-Za-z0-9._~-]+\/)+[A-Za-z0-9._~-]*|[a-zA-Z]:[\\/][^\s]+|\\\\[^\s]+)/.test(combined)
  ) {
    return { valid: false, reason: "contains absolute host paths; use repository-relative paths instead" };
  }

  if (Array.isArray(files)) {
    for (const file of files) {
      if (file.startsWith("/") || /^[a-zA-Z]:[\\/]/.test(file) || file.startsWith("\\\\") || file.split("/").includes("..")) {
        return { valid: false, reason: `file path "${file}" is absolute; use repository-relative paths instead` };
      }
    }
  }

  return { valid: true };
}

/**
 * Sends a remember request to the memory server.
 */
async function postRemember(serverUrl, payload, timeoutMs = 3000) {
  const normalized = serverUrl.replace(/\/$/, "");
  const endpoints = [`${normalized}/agentmemory/remember`];
  let lastErr = null;
  for (const endpoint of endpoints) {
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(timeoutMs),
      });
      if (res.ok) {
        return { ok: true, status: res.status, data: await res.json().catch(() => ({})) };
      }
      if (res.status === 404) {
        continue;
      }
      return { ok: false, error: `HTTP ${res.status}` };
    } catch (err) {
      lastErr = err;
    }
  }
  return { ok: false, error: lastErr ? (lastErr.message || String(lastErr)) : "Request failed" };
}

/**
 * Fetches memories from the memory server.
 */
async function getMemories(serverUrl, agentIdParam, timeoutMs = 3000) {
  const normalized = serverUrl.replace(/\/$/, "");
  const queryParam = agentIdParam ? `?agentId=${encodeURIComponent(agentIdParam)}` : "";
  const endpoints = [`${normalized}/agentmemory/memories${queryParam}`];
  let lastErr = null;
  for (const endpoint of endpoints) {
    try {
      const res = await fetch(endpoint, {
        method: "GET",
        headers: { "Accept": "application/json" },
        signal: AbortSignal.timeout(timeoutMs),
      });
      if (res.ok) {
        const json = await res.json().catch(() => []);
        const memories = Array.isArray(json) ? json : (Array.isArray(json.memories) ? json.memories : []);
        return { ok: true, data: memories };
      }
      if (res.status === 404) {
        continue;
      }
      return { ok: false, error: `HTTP ${res.status}` };
    } catch (err) {
      lastErr = err;
    }
  }
  return { ok: false, error: lastErr ? (lastErr.message || String(lastErr)) : "Request failed" };
}

/**
 * Implementation of agentmemory_remember.
 */
export async function executeRemember(args, context, options = {}) {
  const author = context?.agent || options.author;
  if (!author || !ALLOWED_ROLES.includes(author)) {
    return `[agentmemory] Remember rejected: unauthorized or unknown agent role "${author}". Must be one of: ${ALLOWED_ROLES.join(", ")}.`;
  }

  const input = args || {};
  const validation = validateMemoryInput(input);
  if (!validation.valid) {
    return `[agentmemory] Remember rejected: ${validation.reason}.`;
  }

  const serverUrl = options.serverUrl || process.env.AGENTMEMORY_URL || DEFAULT_SERVER_URL;
  const timeoutMs = options.timeoutMs ?? 3000;

  const payload = {
    agentId: author,
    content: `${normalizeText(input.title)}\n${normalizeText(input.content)}`,
    concepts: Array.isArray(input.concepts) ? input.concepts.map(normalizeText).filter(Boolean) : [],
    files: Array.isArray(input.files) ? input.files.map(normalizeText).filter(Boolean) : [],
  };

  const result = await postRemember(serverUrl, payload, timeoutMs);
  if (!result.ok) {
    return `[agentmemory advisory] Server unavailable or remember request failed (${result.error}). Work may proceed without memory persistence.`;
  }

  return `[agentmemory] Remembered: "${normalizeText(input.title)}" by author ${author}.`;
}

/**
 * Implementation of agentmemory_recall.
 */
export async function executeRecall(args, context, options = {}) {
  const caller = context?.agent || options.author;
  if (!caller || !ALLOWED_ROLES.includes(caller)) {
    return `[agentmemory] Recall rejected: unauthorized or unknown agent role "${caller}". Must be one of: ${ALLOWED_ROLES.join(", ")}.`;
  }
  const scope = args?.scope || getDefaultScopeForRole(caller);
  if (scope !== "own" && scope !== "team") {
    return `[agentmemory] Recall rejected: scope must be "own" or "team".`;
  }
  const serverUrl = options.serverUrl || process.env.AGENTMEMORY_URL || DEFAULT_SERVER_URL;
  const timeoutMs = options.timeoutMs ?? 3000;
  const limit = Number.isInteger(args?.limit) && args.limit > 0 ? Math.min(args.limit, 50) : 5;
  const query = typeof args?.query === "string" ? args.query.trim() : "";

  const agentIdParam = scope === "team" ? "*" : caller;

  const result = await getMemories(serverUrl, agentIdParam, timeoutMs);
  if (!result.ok) {
    return `[agentmemory advisory] Server unavailable (${result.error}). Proceeding without advisory memory.`;
  }

  // Filter unrecognized authors and apply scope isolation
  let memories = result.data.filter((item) => {
    const author = item.agentId || item.author;
    if (!ALLOWED_ROLES.includes(author) || typeof item.title !== "string" || typeof item.content !== "string") return false;
    if (scope === "own" && author !== caller) return false;
    return true;
  });

  // Local query ranking over title, concepts, files, content
  if (query) {
    const tokens = query.toLowerCase().split(/\s+/).filter(Boolean);
    const scored = [];
    for (const item of memories) {
      let score = 0;
      const titleLower = (item.title || "").toLowerCase();
      const contentLower = (item.content || "").toLowerCase();
      const conceptsLower = (Array.isArray(item.concepts) ? item.concepts.join(" ") : (item.concepts || "")).toLowerCase();
      const filesLower = (Array.isArray(item.files) ? item.files.join(" ") : (item.files || "")).toLowerCase();

      for (const token of tokens) {
        if (titleLower.includes(token)) score += 3;
        if (conceptsLower.includes(token)) score += 2;
        if (filesLower.includes(token)) score += 2;
        if (contentLower.includes(token)) score += 1;
      }
      if (score > 0) {
        scored.push({ item, score });
      }
    }
    scored.sort((a, b) => b.score - a.score);
    memories = scored.map((s) => s.item);
  }

  memories = memories.slice(0, limit);

  if (memories.length === 0) {
    return `[agentmemory] No advisory memories found (scope: ${scope}${query ? `, query: "${query}"` : ""}).`;
  }

  const lines = [
    `Advisory agent memory (scope: ${scope}, caller: ${caller}; advisory only, durable repository truth supersedes memory):`,
  ];
  for (const m of memories) {
    const author = m.agentId || m.author;
    const conceptsStr = Array.isArray(m.concepts) && m.concepts.length ? ` [concepts: ${m.concepts.join(", ")}]` : "";
    const filesStr = Array.isArray(m.files) && m.files.length ? ` [files: ${m.files.join(", ")}]` : "";
    lines.push(`- [Author: ${author}] "${m.title}": ${m.content}${conceptsStr}${filesStr}`);
  }

  return lines.join("\n");
}
