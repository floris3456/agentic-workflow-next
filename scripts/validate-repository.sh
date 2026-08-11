#!/usr/bin/env bash
set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$repo_root"

node scripts/validate-preimplementation.mjs
node scripts/validate-agent-system.mjs

if [[ -f scripts/validate-research.mjs ]]; then
  node scripts/validate-research.mjs
fi
if [[ -f scripts/generate-research-evidence-manifest.mjs ]]; then
  node scripts/generate-research-evidence-manifest.mjs --check
fi

./scripts/bootstrap-agent-workflow.sh --check

echo "Repository validation passed."
