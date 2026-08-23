#!/usr/bin/env bash
set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$repo_root"

node scripts/validate-preimplementation.mjs
node scripts/validate-agent-system.mjs
node scripts/validate-ci-status.mjs

node scripts/validate-research.mjs
node scripts/generate-research-evidence-manifest.mjs --check
node --test tests/research-evidence.test.mjs
node --test tests/agentmemory.test.mjs

./scripts/bootstrap-agent-workflow.sh --check
echo "Repository validation passed."
