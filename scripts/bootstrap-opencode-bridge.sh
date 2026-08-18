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

refresh_opencode_instances() {
  local config_file="$1"
  node "$package/dist/src/cli.js" refresh-instances --config "$config_file"
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
  [[ -z "$config" ]] || refresh_opencode_instances "$config"
fi
[[ "$mode" == "check" ]] && args+=(--check)
[[ -n "$config" ]] && args+=(--config "$config")
node "$package/dist/src/cli.js" "${args[@]}"