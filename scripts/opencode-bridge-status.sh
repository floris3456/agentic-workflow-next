#!/usr/bin/env bash
set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cli="$repo_root/tools/opencode-bridge/dist/src/cli.js"
[[ -f "$cli" ]] || { echo "Bridge is not built. Run ./scripts/bootstrap-opencode-bridge.sh first." >&2; exit 1; }
exec node "$cli" status "$@"
