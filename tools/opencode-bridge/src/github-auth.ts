import { createSign } from "node:crypto";
import { asRecord } from "./util.js";

const githubApiVersion = "2026-03-10";

export interface InstallationTokenProvider {
  token(): Promise<string>;
  invalidate(): void;
}

export interface GitHubAppAuthOptions {
  appId: string | number;
  installationId: number;
  repository: string;
  privateKey: string;
  fetch?: typeof fetch;
  apiBaseUrl?: string;
  now?: () => number;
  timeoutMs?: number;
}

interface CachedToken {
  value: string;
  expiresAt: number;
}

function base64url(value: string | Uint8Array): string {
  return Buffer.from(value).toString("base64url");
}

function assertApiBaseUrl(value: string): URL {
  const url = new URL(value.endsWith("/") ? value : `${value}/`);
  if (url.protocol !== "https:") throw new Error("GitHub API base URL must use HTTPS");
  if (url.username || url.password) throw new Error("GitHub credentials must not be embedded in the API URL");
  return url;
}

export class GitHubAppAuth implements InstallationTokenProvider {
  readonly apiBaseUrl: URL;
  private readonly appId: string;
  private readonly installationId: number;
  private readonly repository: string;
  private readonly privateKey: string;
  private readonly fetchImpl: typeof fetch;
  private readonly now: () => number;
  private readonly timeoutMs: number;
  private cached: CachedToken | undefined;
  private refreshing: Promise<string> | undefined;

  constructor(options: GitHubAppAuthOptions) {
    this.appId = String(options.appId);
    if (!/^\d+$/.test(this.appId)) throw new TypeError("GitHub App ID must be numeric");
    if (!Number.isSafeInteger(options.installationId) || options.installationId < 1) throw new TypeError("GitHub installation ID must be a positive integer");
    if (!/^[A-Za-z0-9_.-]+$/.test(options.repository)) throw new TypeError("GitHub repository name is invalid");
    if (!options.privateKey.includes("PRIVATE KEY")) throw new TypeError("GitHub App private key is invalid");
    this.installationId = options.installationId;
    this.repository = options.repository;
    this.privateKey = options.privateKey;
    this.fetchImpl = options.fetch ?? fetch;
    this.apiBaseUrl = assertApiBaseUrl(options.apiBaseUrl ?? "https://api.github.com");
    this.now = options.now ?? Date.now;
    this.timeoutMs = options.timeoutMs ?? 15_000;
  }

  private appJwt(): string {
    const issuedAt = Math.floor(this.now() / 1_000) - 60;
    const header = base64url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
    const payload = base64url(JSON.stringify({ iat: issuedAt, exp: issuedAt + 600, iss: this.appId }));
    const unsigned = `${header}.${payload}`;
    const signature = createSign("RSA-SHA256").update(unsigned).end().sign(this.privateKey);
    return `${unsigned}.${base64url(signature)}`;
  }

  private async refresh(): Promise<string> {
    const url = new URL(`app/installations/${this.installationId}/access_tokens`, this.apiBaseUrl);
    const response = await this.fetchImpl(url, {
      method: "POST",
      headers: {
        Accept: "application/vnd.github+json",
        Authorization: `Bearer ${this.appJwt()}`,
        "Content-Type": "application/json",
        "User-Agent": "agentic-workflow-opencode-bridge",
        "X-GitHub-Api-Version": githubApiVersion,
      },
      body: JSON.stringify({
        repositories: [this.repository],
        permissions: { issues: "write", contents: "read" },
      }),
      signal: AbortSignal.timeout(this.timeoutMs),
    });
    if (!response.ok) throw new Error(`GitHub App installation-token request failed with HTTP ${response.status}: ${(await response.text()).slice(0, 500)}`);
    const body = asRecord(await response.json(), "GitHub installation-token response");
    const permissions = asRecord(body.permissions, "GitHub installation-token permissions");
    if (permissions.issues !== "write" || permissions.contents !== "read") {
      throw new Error("GitHub installation token does not have exactly the required Issues write and Contents read permissions");
    }
    for (const [name, level] of Object.entries(permissions)) {
      if (!["issues", "contents", "metadata"].includes(name) && level !== "none") throw new Error(`GitHub installation token has unexpected ${name} permission`);
    }
    const value = typeof body.token === "string" ? body.token : "";
    const expiresAt = typeof body.expires_at === "string" ? Date.parse(body.expires_at) : Number.NaN;
    if (!value || !Number.isFinite(expiresAt) || expiresAt <= this.now() + 60_000) throw new Error("GitHub installation-token response is invalid or already expiring");
    this.cached = { value, expiresAt };
    return value;
  }

  async token(): Promise<string> {
    if (this.cached && this.cached.expiresAt > this.now() + 60_000) return this.cached.value;
    if (this.refreshing) return this.refreshing;
    this.refreshing = this.refresh();
    try {
      return await this.refreshing;
    } finally {
      this.refreshing = undefined;
    }
  }

  invalidate(): void {
    this.cached = undefined;
  }
}

export { githubApiVersion };
