#!/usr/bin/env bash
set -euo pipefail

root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$root"
node scripts/validate-workspace.mjs
node scripts/validate-ci-status.mjs
node --test tests/*.test.mjs
node scripts/validate-maintenance-opencode-runtime.mjs
git diff --check
echo "Workspace full validation passed."
