#!/usr/bin/env bash
set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
node "$repo_root/scripts/validate-opencode-bridge.mjs"
npm --prefix "$repo_root/tools/opencode-bridge" test
node --test "$repo_root/tests/template-branches.test.mjs"
