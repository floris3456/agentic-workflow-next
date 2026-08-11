#!/usr/bin/env bash
set -euo pipefail

usage() {
  echo "Usage: $0 [--check]" >&2
}

mode="apply"
if [[ "${1:-}" == "--check" ]]; then
  mode="check"
elif [[ $# -ne 0 ]]; then
  usage
  exit 2
fi

repo_root="$(git rev-parse --show-toplevel 2>/dev/null || true)"
if [[ -z "$repo_root" ]] || [[ ! -f "$repo_root/AGENTS.md" ]] || [[ ! -f "$repo_root/opencode.json" ]]; then
  echo "Run this command from an agentic workflow repository checkout." >&2
  exit 1
fi
cd "$repo_root"

required=(.githooks/pre-commit .githooks/pre-merge-commit .githooks/post-commit .githooks/pre-push)
for hook in "${required[@]}"; do
  [[ -f "$hook" ]] || { echo "Missing tracked hook: $hook" >&2; exit 1; }
done

if [[ "$mode" == "apply" ]]; then
  chmod +x "${required[@]}" scripts/*.sh
  git config --local core.hooksPath .githooks
fi

configured="$(git config --local --get core.hooksPath || true)"
[[ "$configured" == ".githooks" ]] || {
  echo "Tracked hooks are not active. Run ./scripts/bootstrap-agent-workflow.sh" >&2
  exit 1
}

for hook in "${required[@]}"; do
  [[ -x "$hook" ]] || { echo "Hook is not executable: $hook" >&2; exit 1; }
done

echo "Agentic workflow tracked Git hooks are active."
