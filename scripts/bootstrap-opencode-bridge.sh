#!/usr/bin/env bash
set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
package="$repo_root/tools/opencode-bridge"
mode="apply"
config=""
while [[ $# -gt 0 ]]; do
  case "$1" in
    --check) mode="check"; shift ;;
    --config) [[ -n "${2:-}" ]] || { echo "--config requires a file." >&2; exit 2; }; config="$2"; shift 2 ;;
    *) echo "Usage: $0 [--check] [--config <file>]" >&2; exit 2 ;;
  esac
done

version="$(node -p 'process.versions.node')"
node -e 'const [major, minor] = process.versions.node.split(".").map(Number); if (major < 22 || (major === 22 && minor < 13)) process.exit(1)' \
  || { echo "Node 22.13.0 or newer is required; found $version." >&2; exit 1; }

refresh_opencode_instance() {
  local config_file="$1"
  BRIDGE_CONFIG="$config_file" node --input-type=module <<'NODE'
import fs from "node:fs";

const configPath = process.env.BRIDGE_CONFIG;
if (!configPath) throw new Error("BRIDGE_CONFIG is required");
const config = JSON.parse(fs.readFileSync(configPath, "utf8"));
const baseUrl = config.opencode?.base_url;
const username = config.opencode?.username;
const passwordFile = config.opencode?.password_file;
const repositoryRoot = config.repository_root;
for (const [name, value] of Object.entries({ baseUrl, username, passwordFile, repositoryRoot })) {
  if (typeof value !== "string" || value.length === 0) throw new Error(`Bridge config is missing ${name}`);
}
const password = fs.readFileSync(passwordFile, "utf8").trimEnd();
const endpoint = new URL("/instance/dispose", baseUrl);
endpoint.searchParams.set("directory", repositoryRoot);
const authorization = Buffer.from(`${username}:${password}`).toString("base64");
const response = await fetch(endpoint, {
  method: "POST",
  headers: { authorization: `Basic ${authorization}` },
});
if (!response.ok) {
  throw new Error(`OpenCode instance refresh failed with HTTP ${response.status}`);
}
const result = await response.json();
if (result !== true) throw new Error("OpenCode instance refresh did not return true");
NODE
}

if [[ "$mode" == "apply" ]]; then
  npm ci --prefix "$package"
  npm --prefix "$package" run build
else
  [[ -x "$package/node_modules/.bin/tsc" && -f "$package/dist/src/cli.js" ]] || {
    echo "Bridge dependencies/build are absent. Run $0 without --check first." >&2
    exit 1
  }
  "$package/node_modules/.bin/tsc" -p "$package/tsconfig.json" --noEmit
fi

args=(bootstrap)
if [[ "$mode" == "apply" ]]; then
  install_args=(install-scout-runtime)
  [[ -n "$config" ]] && install_args+=(--config "$config")
  node "$package/dist/src/cli.js" "${install_args[@]}"
  [[ -z "$config" ]] || refresh_opencode_instance "$config"
fi
[[ "$mode" == "check" ]] && args+=(--check)
[[ -n "$config" ]] && args+=(--config "$config")
node "$package/dist/src/cli.js" "${args[@]}"