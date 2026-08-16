#!/usr/bin/env bash
set -uo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
config=""
bridge_unit=""
interval=7

usage() {
  echo "Usage: $0 --config <file> --bridge-unit <systemd-user-unit> [--interval <5-10>] [--once]" >&2
  exit 2
}

once=false
while [[ $# -gt 0 ]]; do
  case "$1" in
    --config) [[ -n "${2:-}" ]] || usage; config="$2"; shift 2 ;;
    --bridge-unit) [[ -n "${2:-}" ]] || usage; bridge_unit="$2"; shift 2 ;;
    --interval) [[ "${2:-}" =~ ^[0-9]+$ ]] || usage; interval="$2"; shift 2 ;;
    --once) once=true; shift ;;
    *) usage ;;
  esac
done
[[ -n "$config" && -n "$bridge_unit" ]] || usage
(( interval >= 5 && interval <= 10 )) || usage

git_dir="$(git -C "$repo_root" rev-parse --absolute-git-dir 2>/dev/null)" || {
  echo "Developer synchronization requires a Git worktree." >&2
  exit 1
}
state_dir="$git_dir/opencode-bridge/developer-sync"
mkdir -p "$state_dir"
chmod 700 "$state_dir"
status_file="$state_dir/status"
installed_sha_file="$state_dir/installed-sha"
lock_file="$state_dir/lock"
exec 9>"$lock_file"
chmod 600 "$lock_file"
flock -n 9 || {
  echo "Another developer synchronization watcher holds $lock_file." >&2
  exit 1
}

record_status() {
  local state="$1"
  local detail="$2"
  local head="unknown"
  local remote="unknown"
  head="$(git -C "$repo_root" rev-parse HEAD 2>/dev/null || true)"
  remote="$(git -C "$repo_root" rev-parse refs/remotes/origin/developer 2>/dev/null || true)"
  umask 077
  printf 'observed_at=%s\nstate=%s\ndetail=%s\nhead=%s\norigin_developer=%s\n' \
    "$(date --iso-8601=seconds)" "$state" "$detail" "$head" "$remote" > "$status_file"
}

bridge_pending() {
  local output
  output="$("$repo_root/scripts/opencode-bridge-status.sh" --config "$config" 2>/dev/null)" || return 2
  BRIDGE_STATUS="$output" node -e '
    const status = JSON.parse(process.env.BRIDGE_STATUS);
    const pending = Number(status.pending_commands || 0) + Number(status.pending_requests || 0);
    process.stdout.write(String(pending));
  '
}

safe_relation() {
  local branch dirty counts
  branch="$(git -C "$repo_root" branch --show-current 2>/dev/null)" || return 1
  [[ "$branch" == "developer" ]] || { record_status blocked "worktree is not on developer"; return 1; }
  dirty="$(git -C "$repo_root" status --porcelain --untracked-files=normal 2>/dev/null)" || return 1
  [[ -z "$dirty" ]] || { record_status blocked "worktree is dirty; synchronization deferred"; return 1; }
  counts="$(git -C "$repo_root" rev-list --left-right --count HEAD...refs/remotes/origin/developer 2>/dev/null)" || return 1
  read -r LOCAL_AHEAD REMOTE_AHEAD <<< "$counts"
  if (( LOCAL_AHEAD > 0 && REMOTE_AHEAD > 0 )); then
    record_status blocked "developer and origin/developer have diverged; synchronization deferred"
    return 1
  fi
  if (( LOCAL_AHEAD > 0 )); then
    record_status blocked "developer is locally ahead of origin/developer; synchronization deferred"
    return 1
  fi
  return 0
}

wait_active() {
  local attempt
  for attempt in {1..60}; do
    systemctl --user is-active --quiet "$bridge_unit" && return 0
    sleep 1
  done
  return 1
}

sync_once() {
  if ! git -C "$repo_root" fetch --quiet --no-tags origin developer; then
    record_status error "origin/developer fetch failed; no local state changed"
    return
  fi
  if ! safe_relation; then return; fi

  local head installed pending
  head="$(git -C "$repo_root" rev-parse HEAD)"
  if [[ -f "$installed_sha_file" ]]; then
    installed="$(<"$installed_sha_file")"
  else
    installed=""
  fi
  if (( REMOTE_AHEAD == 0 )) && [[ "$installed" == "$head" ]]; then
    if systemctl --user is-active --quiet "$bridge_unit"; then
      record_status synchronized "developer is current and bridge runtime matches HEAD"
    else
      record_status blocked "developer is current but bridge service is not active"
    fi
    return
  fi

  pending="$(bridge_pending)"
  case "$?" in
    0) ;;
    *) record_status blocked "bridge status is unavailable; refusing source replacement or restart"; return ;;
  esac
  if (( pending > 0 )); then
    record_status deferred "bridge has accepted or applying work; synchronization deferred"
    return
  fi

  record_status updating "draining bridge before synchronized runtime update"
  if ! systemctl --user stop "$bridge_unit"; then
    record_status error "bridge service did not stop cleanly"
    return
  fi
  if ! git -C "$repo_root" fetch --quiet --no-tags origin developer; then
    record_status error "second origin/developer fetch failed with bridge stopped"
    return
  fi
  if ! safe_relation; then return; fi
  pending="$(bridge_pending)" || {
    record_status blocked "bridge state cannot be inspected after stop"
    return
  }
  if (( pending > 0 )); then
    record_status blocked "bridge stopped with accepted or applying work still durable"
    return
  fi

  if (( REMOTE_AHEAD > 0 )); then
    if ! git -C "$repo_root" merge --ff-only refs/remotes/origin/developer; then
      record_status error "safe fast-forward failed; bridge remains stopped"
      return
    fi
  fi
  if [[ -n "$(git -C "$repo_root" status --porcelain --untracked-files=normal)" ]]; then
    record_status error "runtime update left a dirty worktree; bridge remains stopped"
    return
  fi
  head="$(git -C "$repo_root" rev-parse HEAD)"
  if ! "$repo_root/scripts/bootstrap-opencode-bridge.sh" --config "$config"; then
    record_status error "bridge apply bootstrap failed after source synchronization"
    return
  fi
  if ! "$repo_root/scripts/bootstrap-opencode-bridge.sh" --check --config "$config"; then
    record_status error "bridge check bootstrap failed after source synchronization"
    return
  fi
  if [[ -n "$(git -C "$repo_root" status --porcelain --untracked-files=normal)" ]]; then
    record_status error "bootstrap changed tracked worktree content; bridge remains stopped"
    return
  fi
  if ! systemctl --user start "$bridge_unit" || ! wait_active; then
    record_status error "updated bridge service failed to become active"
    return
  fi
  umask 077
  printf '%s\n' "$head" > "$installed_sha_file"
  record_status synchronized "developer, validated runtime, and active bridge match origin/developer"
}

while true; do
  sync_once
  $once && exit 0
  sleep "$interval"
done
