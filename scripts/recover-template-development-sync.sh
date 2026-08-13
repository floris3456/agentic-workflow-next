#!/usr/bin/env bash
set -euo pipefail

root="$(git rev-parse --show-toplevel 2>/dev/null || true)"
[[ -n "$root" ]] || { echo "Not in a Git repository." >&2; exit 1; }
cd "$root"
[[ "$(git branch --show-current)" == "template-development" ]] || { echo "Recovery requires template-development." >&2; exit 1; }
[[ -z "$(git status --porcelain)" ]] || { echo "Working tree must be clean before recovery." >&2; exit 1; }
./scripts/bootstrap-template-development.sh --check >/dev/null

git_dir="$(git rev-parse --git-dir)"
marker="$git_dir/template-development-sync-failed"
authorization="$git_dir/template-development-sync-recovery-authorized"
[[ -f "$marker" ]] || { echo "Recovery requires the failed-push marker." >&2; exit 1; }
mapfile -t fields < "$marker"
[[ "${#fields[@]}" -eq 3 && "${fields[0]}" == "template-development" && "${fields[1]}" =~ ^[0-9a-f]{40}$ ]] || {
  echo "Synchronization marker is invalid." >&2
  exit 1
}
failed="${fields[1]}"
[[ "$(git cat-file -t "$failed" 2>/dev/null || true)" == "commit" ]] || { echo "Recorded failed commit is unavailable." >&2; exit 1; }

cleanup() { rm -f "$authorization"; }
trap cleanup EXIT
git fetch --no-tags origin template-development
local_sha="$(git rev-parse HEAD)"
remote_sha="$(git rev-parse origin/template-development)"

verify() {
  git fetch --no-tags origin template-development
  local verified_local verified_remote
  verified_local="$(git rev-parse HEAD)"
  verified_remote="$(git rev-parse origin/template-development)"
  [[ "$verified_local" == "$verified_remote" ]] || { echo "Local and remote remain different." >&2; return 1; }
  git merge-base --is-ancestor "$failed" "$verified_remote" || { echo "Synchronized history does not preserve the failed commit." >&2; return 1; }
  rm -f "$marker"
  echo "Template-development synchronization recovered at $verified_remote"
}

if [[ "$local_sha" == "$remote_sha" ]]; then verify; exit 0; fi
if git merge-base --is-ancestor "$remote_sha" "$local_sha"; then
  git push origin HEAD:template-development
  verify
  exit 0
fi
if git merge-base --is-ancestor "$local_sha" "$remote_sha" && git merge-base --is-ancestor "$failed" "$remote_sha"; then
  git merge --ff-only origin/template-development
  verify
  exit 0
fi
[[ "$local_sha" == "$failed" ]] || { echo "Current HEAD does not match the failed commit; refuse ambiguous recovery." >&2; exit 1; }
printf '%s %s\n' "$local_sha" "$remote_sha" > "$authorization"
if ! git merge --no-ff --no-edit -m "Recover template-development synchronization" "$remote_sha"; then
  git merge --abort >/dev/null 2>&1 || true
  echo "Recovery merge conflicted; histories and marker were retained." >&2
  exit 1
fi
[[ "$(git rev-parse HEAD^1)" == "$local_sha" && "$(git rev-parse HEAD^2)" == "$remote_sha" ]] || {
  echo "Recovery merge parents are unexpected." >&2
  exit 1
}
git push origin HEAD:template-development
verify
