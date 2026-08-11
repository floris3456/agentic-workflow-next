#!/usr/bin/env bash
set -euo pipefail

approved="${1:-}"
if [[ ! "$approved" =~ ^[0-9a-fA-F]{40}$ ]]; then
  echo "Usage: $0 <human-approved-developer-sha>" >&2
  exit 2
fi
approved="${approved,,}"

repo_root="$(git rev-parse --show-toplevel 2>/dev/null || true)"
[[ -n "$repo_root" ]] || { echo "Not in a Git repository." >&2; exit 1; }
cd "$repo_root"

./scripts/bootstrap-agent-workflow.sh --check >/dev/null
[[ -z "$(git status --porcelain)" ]] || { echo "Working tree must be clean." >&2; exit 1; }
git_dir="$(git rev-parse --git-dir)"
[[ ! -f "$git_dir/agent-workflow-sync-failed" ]] || { echo "Resolve synchronization failure before promotion." >&2; exit 1; }

authorization="$git_dir/agent-workflow-promotion-authorized"
pending="$git_dir/agent-workflow-promotion-sync-pending"
cleanup_authorization() { rm -f "$authorization"; }
trap cleanup_authorization EXIT

git fetch origin main developer
remote_main="$(git rev-parse origin/main)"
remote_developer="$(git rev-parse origin/developer)"

valid_promotion_merge() {
  local candidate="$1"
  local expected_main="$2"
  [[ "$(git cat-file -t "$candidate" 2>/dev/null || true)" == "commit" ]] || return 1
  [[ "$(git rev-list --parents -n 1 "$candidate" | wc -w)" -eq 3 ]] || return 1
  [[ "$(git rev-parse "$candidate^1")" == "$expected_main" ]] || return 1
  [[ "$(git rev-parse "$candidate^2")" == "$approved" ]] || return 1
  [[ "$(git rev-parse "$candidate^{tree}")" == "$(git rev-parse "$approved^{tree}")" ]] || return 1
}

verify_remote_state() {
  local merge_sha="$1"
  git fetch origin main developer
  [[ "$(git rev-parse origin/main)" == "$merge_sha" ]] || { echo "origin/main verification failed." >&2; return 1; }
  [[ "$(git rev-parse origin/developer)" == "$merge_sha" ]] || { echo "origin/developer synchronization verification failed." >&2; return 1; }
  rm -f "$pending"
  echo "Promoted approved developer $approved as main merge $merge_sha and synchronized developer."
}

# Resume only a promotion bound by this workflow before its main push began.
if [[ -f "$pending" ]]; then
  merge_sha=""
  pending_approved=""
  old_main=""
  extra=""
  read -r merge_sha pending_approved old_main extra < "$pending" || true
  [[ -z "${extra:-}" && "$pending_approved" == "$approved" \
    && "$merge_sha" =~ ^[0-9a-f]{40}$ && "$old_main" =~ ^[0-9a-f]{40}$ ]] || {
    echo "Pending promotion evidence does not match this exact approved promotion." >&2
    exit 1
  }
  valid_promotion_merge "$merge_sha" "$old_main" || {
    echo "Pending promotion evidence does not match this exact approved promotion." >&2
    exit 1
  }

  if [[ "$remote_main" == "$old_main" ]]; then
    [[ "$remote_developer" == "$approved" ]] || {
      echo "origin/developer moved before the pending main promotion was pushed." >&2
      exit 1
    }
    printf '%s %s %s\n' "$merge_sha" "$approved" "$old_main" > "$authorization"
    git push origin "$merge_sha:refs/heads/main"
    git fetch origin main developer
    remote_main="$(git rev-parse origin/main)"
    remote_developer="$(git rev-parse origin/developer)"
  fi

  [[ "$remote_main" == "$merge_sha" ]] || {
    echo "origin/main does not match the exact pending promotion." >&2
    exit 1
  }
  if [[ "$remote_developer" == "$merge_sha" ]]; then
    git checkout developer
    git merge --ff-only "$merge_sha" >/dev/null
    verify_remote_state "$merge_sha"
    exit 0
  fi
  [[ "$remote_developer" == "$approved" ]] || {
    echo "Existing promotion has unexpected origin/developer state $remote_developer." >&2
    exit 1
  }
  git checkout developer
  git merge --ff-only "$merge_sha"
  git push origin HEAD:refs/heads/developer
  verify_remote_state "$merge_sha"
  exit 0
fi

if valid_promotion_merge "$remote_main" "$(git rev-parse "$remote_main^1" 2>/dev/null || true)"; then
  echo "origin/main resembles a promotion merge but has no matching pending workflow evidence." >&2
  exit 1
fi

[[ "$remote_developer" == "$approved" ]] || {
  echo "Human approval was for $approved but origin/developer is $remote_developer. Stop and re-review." >&2
  exit 1
}
git merge-base --is-ancestor "$remote_main" "$approved" || {
  echo "origin/main is not an ancestor of the approved developer SHA; reconcile and re-review before promotion." >&2
  exit 1
}

git checkout developer
git merge --ff-only origin/developer
[[ "$(git rev-parse HEAD)" == "$approved" ]] || { echo "Local developer is not the approved SHA." >&2; exit 1; }

git checkout main
git merge --ff-only origin/main
old_main="$(git rev-parse HEAD)"

# The pre-merge hook recognizes only this sanctioned operation.
printf '%s %s %s\n' pending "$approved" "$old_main" > "$authorization"
if ! git merge --no-ff --no-edit "$approved"; then
  git merge --abort >/dev/null 2>&1 || true
  echo "Promotion merge conflicted or failed. It was aborted; reconcile on developer and obtain approval again." >&2
  exit 1
fi

merge_sha="$(git rev-parse HEAD)"
[[ "$(git rev-list --parents -n 1 "$merge_sha" | wc -w)" -eq 3 ]] || { echo "Promotion merge must have exactly two parents." >&2; exit 1; }
[[ "$(git rev-parse "$merge_sha^1")" == "$old_main" ]] || { echo "Unexpected first parent in promotion merge." >&2; exit 1; }
[[ "$(git rev-parse "$merge_sha^2")" == "$approved" ]] || { echo "Unexpected second parent in promotion merge." >&2; exit 1; }
[[ "$(git rev-parse "$merge_sha^{tree}")" == "$(git rev-parse "$approved^{tree}")" ]] || { echo "Promotion merge tree differs from the approved developer tree." >&2; exit 1; }
printf '%s %s %s\n' "$merge_sha" "$approved" "$old_main" > "$authorization"
printf '%s %s %s\n' "$merge_sha" "$approved" "$old_main" > "$pending"

if ! git push origin main; then
  rm -f "$authorization"
  if git fetch origin main developer >/dev/null 2>&1 \
    && [[ "$(git rev-parse origin/main)" == "$old_main" ]] \
    && [[ "$(git rev-parse origin/developer)" == "$approved" ]]; then
    rm -f "$pending"
    git checkout developer >/dev/null 2>&1 || true
    git branch -f main "$old_main" >/dev/null 2>&1 || true
    echo "Promotion main push failed; fresh remote verification proved it was not published, so the local merge was removed." >&2
  else
    echo "Promotion main push outcome could not be proven unpublished; exact pending and local merge evidence were retained." >&2
  fi
  exit 1
fi

rm -f "$authorization"

git checkout developer
git merge --ff-only "$merge_sha"
git push origin HEAD:refs/heads/developer
verify_remote_state "$merge_sha"
