export interface GitHubRepositoryIdentity {
  apiBaseUrl: URL;
  gitHost: string;
  owner: string;
  repository: string;
}

const repositoryPart = /^[A-Za-z0-9_.-]+$/;
const dnsLabel = /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/;

function canonicalHost(value: string, label: string): string {
  if (value.length === 0 || value !== value.toLowerCase() || /[@/?#\\\s]/.test(value)) {
    throw new Error(`${label} must be one lowercase DNS host with an optional port`);
  }
  let parsed: URL;
  try {
    parsed = new URL(`https://${value}`);
  } catch {
    throw new Error(`${label} is invalid`);
  }
  if (parsed.username || parsed.password || parsed.pathname !== "/" || parsed.search || parsed.hash || parsed.host !== value) {
    throw new Error(`${label} must be one lowercase DNS host with an optional port`);
  }
  if (parsed.hostname.split(".").some((part) => !dnsLabel.test(part))) throw new Error(`${label} is invalid`);
  if (parsed.port && (Number(parsed.port) < 1 || Number(parsed.port) > 65_535)) throw new Error(`${label} port is invalid`);
  return parsed.host;
}

export function parseGitHubApiBase(value: string): URL {
  if (value.includes("%") || value.includes("\\") || /(?:^|\/)\.\.?\//.test(value)) {
    throw new Error("GitHub API base URL path is malformed");
  }
  let url: URL;
  try {
    url = new URL(value.endsWith("/") ? value : `${value}/`);
  } catch {
    throw new Error("GitHub API base URL is invalid");
  }
  if (url.protocol !== "https:" || url.username || url.password || url.search || url.hash) {
    throw new Error("GitHub API base URL must be credential-free HTTPS without query or fragment");
  }
  if (url.hostname !== url.hostname.toLowerCase() || !url.hostname.split(".").every((part) => dnsLabel.test(part))) {
    throw new Error("GitHub API base URL host is invalid");
  }
  return url;
}

function derivedGitHost(api: URL): string | undefined {
  const path = api.pathname.replace(/\/+$/, "") || "/";
  if (api.hostname === "api.github.com" && !api.port && path === "/") return "github.com";
  if (path === "/api/v3") return api.host;
  return undefined;
}

export function githubRepositoryIdentity(options: {
  apiBaseUrl: string;
  gitHost?: string;
  owner: string;
  repository: string;
}): GitHubRepositoryIdentity {
  if (!repositoryPart.test(options.owner) || !repositoryPart.test(options.repository)) {
    throw new Error("GitHub owner or repository is invalid");
  }
  const apiBaseUrl = parseGitHubApiBase(options.apiBaseUrl);
  const derived = derivedGitHost(apiBaseUrl);
  const configured = options.gitHost === undefined ? undefined : canonicalHost(options.gitHost, "github.git_host");
  if (derived && configured && derived !== configured) {
    throw new Error(`github.git_host conflicts with the unambiguous GitHub API host ${derived}`);
  }
  const gitHost = derived ?? configured;
  if (!gitHost) {
    throw new Error("github.git_host is required because github.api_base_url does not unambiguously identify a Git host");
  }
  return { apiBaseUrl, gitHost, owner: options.owner, repository: options.repository };
}

interface ParsedRemote {
  host: string;
  owner: string;
  repository: string;
}

function pathIdentity(pathname: string): Pick<ParsedRemote, "owner" | "repository"> {
  if (pathname.includes("%") || pathname.includes("\\") || pathname.includes("//")) {
    throw new Error("Checkout origin path is malformed");
  }
  const path = pathname.replace(/^\//, "").replace(/\/$/, "");
  const parts = path.split("/");
  if (parts.length !== 2 || parts.some((part) => !repositoryPart.test(part))) {
    throw new Error("Checkout origin must contain exactly owner/repository");
  }
  const repository = parts[1]!.endsWith(".git") ? parts[1]!.slice(0, -4) : parts[1]!;
  if (repository.length === 0 || !repositoryPart.test(repository)) throw new Error("Checkout origin repository is invalid");
  return { owner: parts[0]!, repository };
}

export function parseSupportedGitRemote(remote: string): ParsedRemote {
  if (remote !== remote.trim() || remote.includes("\0") || remote.includes("\\")) {
    throw new Error("Checkout origin is malformed");
  }
  if (remote.startsWith("https://") || remote.startsWith("ssh://")) {
    if (/(?:^|\/)\.\.?\//.test(remote) || remote.includes("%")) throw new Error("Checkout origin path is malformed");
    let url: URL;
    try {
      url = new URL(remote);
    } catch {
      throw new Error("Checkout origin URL is invalid");
    }
    if (url.search || url.hash) throw new Error("Checkout origin must not contain query or fragment");
    if (url.protocol === "https:") {
      if (url.username || url.password) throw new Error("HTTPS checkout origin must not contain userinfo");
    } else if (url.protocol === "ssh:") {
      if (url.username !== "git" || url.password) throw new Error("SSH checkout origin must use the git user without credentials");
    } else {
      throw new Error("Checkout origin must use supported HTTPS or SSH syntax");
    }
    const remoteHost = url.protocol === "ssh:" && url.port === "22" ? url.hostname : url.host;
    const host = canonicalHost(remoteHost.toLowerCase(), "Checkout origin host");
    return { host, ...pathIdentity(url.pathname) };
  }

  const scp = remote.match(/^git@([a-z0-9](?:[a-z0-9.-]*[a-z0-9])?):([^:]+)$/);
  if (!scp) throw new Error("Checkout origin must use HTTPS, ssh://, or scp-style git@host syntax");
  return { host: canonicalHost(scp[1]!, "Checkout origin host"), ...pathIdentity(scp[2]!) };
}

export function assertRepositoryRemote(remote: string, identity: GitHubRepositoryIdentity): void {
  const parsed = parseSupportedGitRemote(remote);
  if (parsed.host !== identity.gitHost
    || parsed.owner.toLowerCase() !== identity.owner.toLowerCase()
    || parsed.repository.toLowerCase() !== identity.repository.toLowerCase()) {
    throw new Error("Configured GitHub host and owner/repository do not exactly match the checkout origin");
  }
}
