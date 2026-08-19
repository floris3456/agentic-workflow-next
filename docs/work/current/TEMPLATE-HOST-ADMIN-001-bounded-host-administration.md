# Task progress

## Task ID

`TEMPLATE-HOST-ADMIN-001`

## Status

Developer corrections complete after review findings. Awaiting template-development package generation and independent orchestrator review.

## Task-start developer SHA

`784337f93f7b3042047c8fde898e1414dc8285b2`

## Review-base developer SHA

`784337f93f7b3042047c8fde898e1414dc8285b2`

## Previous rejected handoff

`bd287bca8b7b9861f91e2d5c9243c4c5165834f9`

## Public-safe task brief

Implement bridge-side administration IPC and reconciliation capability for the
reusable workflow:
1. Unix domain socket `admin.sock` derived strictly beneath the private state directory `dirname(state_file)/admin.sock` with `0600` permissions and `0700` parent check.
2. Safe endpoint unlinking: rejects existing regular files or symlinks without deleting them; only unlinks verified socket files.
3. Handlers for `status` and `reconcile`.
4. `reconcile` runs `recoverOnce()`, recovers terminal response deliveries, and flushes outbox without creating/prompting sessions.
5. CLI support for `opencode-bridge status` (using admin socket when available) and `opencode-bridge reconcile`.
6. Configuration schema supports `service_unit` (validated ending in `.service`) and derives `adminSocketFile`.
7. `scripts/watch-developer-sync.sh` reads `service_unit` from config or verifies equality if passed explicitly.
8. Updated setup documentation and example config.

## Checks

- TypeScript compilation and `npm test` on `tools/opencode-bridge` passed (123 tests).
- `./scripts/validate-repository.sh` passed.
- `git diff --check` passed cleanly.
