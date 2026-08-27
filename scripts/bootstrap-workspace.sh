#!/usr/bin/env bash
set -euo pipefail

mode="apply"
if [[ "${1:-}" == "--check" ]]; then
  mode="check"
elif [[ $# -ne 0 ]]; then
  echo "Usage: $0 [--check]" >&2
  exit 2
fi

root="$(git rev-parse --show-toplevel 2>/dev/null || true)"
[[ -n "$root" && -f "$root/source-lock.json" && -f "$root/docs/architecture/AS-BUILT.md" ]] || {
  echo "Run this command from the workspace ledger checkout." >&2
  exit 1
}
cd "$root"
[[ "$(git branch --show-current)" == "workspace" ]] || { echo "Current branch must be workspace." >&2; exit 1; }

hooks=(.githooks/pre-commit .githooks/post-commit .githooks/pre-push)
for hook in "${hooks[@]}"; do [[ -f "$hook" ]] || { echo "Missing $hook" >&2; exit 1; }; done

if [[ "$mode" == "apply" ]]; then
  chmod +x "${hooks[@]}" scripts/*.sh scripts/*.mjs
  git config --local core.hooksPath .githooks
fi

[[ "$(git config --local --get core.hooksPath || true)" == ".githooks" ]] || {
  echo "Tracked ledger hooks are not active. Run ./scripts/bootstrap-workspace.sh" >&2
  exit 1
}
for hook in "${hooks[@]}"; do [[ -x "$hook" ]] || { echo "$hook is not executable" >&2; exit 1; }; done
echo "Workspace hooks are active."
