#!/usr/bin/env bash
set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$repo_root"

node scripts/validate-preimplementation.mjs
node scripts/validate-agent-system.mjs

node scripts/validate-research.mjs
node scripts/generate-research-evidence-manifest.mjs --check

./scripts/bootstrap-agent-workflow.sh --check
./scripts/validate-opencode-bridge.sh

if [[ -n "${WOR_WEB_ORCHESTRATION_ROOT:-}" ]]; then
  node scripts/validate-web-orchestrator-integration.mjs "$WOR_WEB_ORCHESTRATION_ROOT"
fi

echo "Repository validation passed."
