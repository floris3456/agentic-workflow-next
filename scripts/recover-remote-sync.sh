#!/usr/bin/env bash
set -euo pipefail

repo_root="$(git rev-parse --show-toplevel 2>/dev/null || true)"
[[ -n "$repo_root" ]] || { echo "Not in a Git repository." >&2; exit 1; }
cd "$repo_root"

branch="$(git symbolic-ref --quiet --short HEAD || true)"
[[ "$branch" == "developer" ]] || { echo "Synchronization recovery is defined for developer only." >&2; exit 1; }
[[ -z "$(git status --porcelain)" ]] || { echo "Working tree must be clean before recovery." >&2; exit 1; }
./scripts/bootstrap-agent-workflow.sh --check >/dev/null

git fetch origin developer
local_sha="$(git rev-parse HEAD)"
remote_sha="$(git rev-parse origin/developer)"
marker="$(git rev-parse --git-dir)/agent-workflow-sync-failed"
recovery_authorized="$(git rev-parse --git-dir)/agent-workflow-sync-recovery-authorized"
cleanup_authorization() { rm -f "$recovery_authorized"; }
trap cleanup_authorization EXIT

[[ -f "$marker" ]] || { echo "Synchronization recovery requires the failed-push marker." >&2; exit 1; }
mapfile -t marker_fields < "$marker"
[[ "${#marker_fields[@]}" -eq 3 ]] || { echo "Synchronization marker has an unexpected format." >&2; exit 1; }
marker_branch="${marker_fields[0]}"
marker_sha="${marker_fields[1]}"
[[ "$marker_branch" == "developer" && "$marker_sha" =~ ^[0-9a-fA-F]{40}$ ]] || {
  echo "Synchronization marker does not identify a developer commit." >&2
  exit 1
}
[[ "$(git cat-file -t "$marker_sha" 2>/dev/null || true)" == "commit" ]] || {
  echo "The failed developer commit recorded by the synchronization marker is unavailable." >&2
  exit 1
}

if [[ "$local_sha" != "$marker_sha" ]]; then
  if git merge-base --is-ancestor "$local_sha" "$marker_sha"; then
    git merge --ff-only "$marker_sha"
    local_sha="$(git rev-parse HEAD)"
  elif [[ "$local_sha" == "$remote_sha" ]] && git merge-base --is-ancestor "$marker_sha" "$local_sha"; then
    : # The fetched synchronized tip already preserves the failed commit.
  elif git merge-base --is-ancestor "$marker_sha" "$local_sha" \
    && [[ "$(git rev-list --parents -n 1 "$local_sha" | wc -w)" -eq 3 ]] \
    && [[ "$(git rev-parse "$local_sha^1")" == "$marker_sha" ]] \
    && [[ "$(git rev-parse "$local_sha^2")" == "$remote_sha" ]]; then
    : # Resume the exact recovery merge if its previous push was interrupted.
  else
    echo "Current developer HEAD does not safely preserve the failed commit recorded by the synchronization marker." >&2
    exit 1
  fi
fi

verify_synchronized() {
  git fetch origin developer
  local verified_local verified_remote
  verified_local="$(git rev-parse HEAD)"
  verified_remote="$(git rev-parse origin/developer)"
  if [[ "$verified_local" != "$verified_remote" ]]; then
    echo "Synchronization is not yet confirmed: local $verified_local, remote $verified_remote" >&2
    return 1
  fi
  if ! git merge-base --is-ancestor "$marker_sha" "$verified_remote"; then
    echo "Synchronized history does not preserve the failed commit $marker_sha." >&2
    return 1
  fi
  rm -f "$marker"
  echo "Synchronization verified at $verified_local"
}

if [[ "$local_sha" == "$remote_sha" ]]; then
  verify_synchronized
  exit 0
fi

if git merge-base --is-ancestor "$remote_sha" "$local_sha"; then
  git push origin HEAD:developer
  verify_synchronized
  exit 0
fi

if git merge-base --is-ancestor "$local_sha" "$remote_sha"; then
  git merge --ff-only origin/developer
  verify_synchronized
  exit 0
fi

[[ "$marker_branch" == "developer" && "$marker_sha" == "$local_sha" ]] || {
  echo "Synchronization marker does not match the current developer head." >&2
  exit 1
}

printf '%s %s\n' "$local_sha" "$remote_sha" > "$recovery_authorized"
if ! git merge --no-ff --no-edit -m "Recover developer synchronization" "$remote_sha"; then
  git merge --abort >/dev/null 2>&1 || true
  echo "Divergent synchronization recovery conflicted or failed; both histories and the failure marker were retained." >&2
  exit 1
fi

merge_sha="$(git rev-parse HEAD)"
[[ "$(git rev-parse "$merge_sha^1")" == "$local_sha" ]] || { echo "Unexpected recovery first parent." >&2; exit 1; }
[[ "$(git rev-parse "$merge_sha^2")" == "$remote_sha" ]] || { echo "Unexpected recovery second parent." >&2; exit 1; }
git push origin HEAD:developer
verify_synchronized
