#!/usr/bin/env bash
set -euo pipefail

repo_root="$(git rev-parse --show-toplevel 2>/dev/null || true)"
[[ -n "$repo_root" ]] || { echo "Not in a Git repository." >&2; exit 1; }
cd "$repo_root"

./scripts/bootstrap-agent-workflow.sh --check >/dev/null
[[ "$(git branch --show-current)" == "developer" ]] || { echo "Run template branch initialization from developer." >&2; exit 1; }
[[ -z "$(git status --porcelain)" ]] || { echo "Working tree must be clean." >&2; exit 1; }
[[ "$(git rev-parse --is-shallow-repository)" == "false" ]] || { echo "Fetch complete branch history before template branch initialization." >&2; exit 1; }
git_dir="$(git rev-parse --git-dir)"
[[ ! -f "$git_dir/agent-workflow-sync-failed" ]] || { echo "Resolve synchronization failure before branch initialization." >&2; exit 1; }

git fetch --no-tags origin main developer
main="$(git rev-parse origin/main)"
developer="$(git rev-parse origin/developer)"
[[ "$(git rev-parse HEAD)" == "$developer" ]] || { echo "Local developer must equal origin/developer." >&2; exit 1; }

if git merge-base --is-ancestor "$main" "$developer"; then
  echo "developer already descends from main; no repair is needed."
  exit 0
fi
if git merge-base "$main" "$developer" >/dev/null 2>&1; then
  echo "main and developer share ancestry but developer does not descend from main; refuse automatic repair." >&2
  exit 1
fi

root_commit() {
  [[ "$(git rev-list --count "$1")" -eq 1 && "$(git rev-list --parents -n 1 "$1" | wc -w)" -eq 1 ]]
}
root_commit "$main" || { echo "Unrelated main is not a one-commit fresh-template root; refuse history replacement." >&2; exit 1; }
root_commit "$developer" || { echo "Unrelated developer is not a one-commit fresh-template root; refuse history replacement." >&2; exit 1; }
main_fingerprint="$(git show -s --format='%an%x1f%ae%x1f%cn%x1f%ce%x1f%ct%x1f%s' "$main")"
developer_fingerprint="$(git show -s --format='%an%x1f%ae%x1f%cn%x1f%ce%x1f%ct%x1f%s' "$developer")"
[[ "$main_fingerprint" == "$developer_fingerprint" ]] || {
  echo "Unrelated roots do not share template-generation commit metadata; refuse history replacement." >&2
  exit 1
}

active_records="$(git ls-tree -r --name-only "$developer" -- docs/work/current | while IFS= read -r path; do [[ "$path" == "docs/work/current/README.md" ]] || printf '%s\n' "$path"; done)"
[[ -z "$active_records" ]] || { echo "Fresh-template repair is blocked by an active task record." >&2; exit 1; }

tree="$(git rev-parse "$developer^{tree}")"
new_developer="$(printf '%s\n' "Initialize developer ancestry from template main" | git commit-tree "$tree" -p "$main")"
[[ "$(git rev-parse "$new_developer^{tree}")" == "$tree" ]] || { echo "Reconstructed developer tree changed unexpectedly." >&2; exit 1; }
marker="$git_dir/agent-workflow-template-repair-authorized"
cleanup() { rm -f "$marker"; }
trap cleanup EXIT
printf '%s %s %s\n' "$developer" "$new_developer" "$main" > "$marker"

git push --force-with-lease="refs/heads/developer:$developer" origin "$new_developer:refs/heads/developer"
git fetch --no-tags origin developer
[[ "$(git rev-parse origin/developer)" == "$new_developer" ]] || { echo "Remote developer verification failed after template repair." >&2; exit 1; }
git update-ref refs/heads/developer "$new_developer" "$developer"
git reset --mixed HEAD >/dev/null
[[ -z "$(git status --porcelain)" ]] || { echo "Template repair did not preserve the developer working tree." >&2; exit 1; }
git merge-base --is-ancestor "$main" "$new_developer" || { echo "Repaired developer does not descend from main." >&2; exit 1; }

echo "Repaired fresh template developer ancestry: $developer -> $new_developer (parent $main)."
