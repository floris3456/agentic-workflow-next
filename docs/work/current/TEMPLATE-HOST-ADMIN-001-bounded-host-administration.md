# Task progress

## Task ID

`TEMPLATE-HOST-ADMIN-001`

## Status

Developer source implementation and tests complete.

## Task-start developer SHA

`784337f93f7b3042047c8fde898e1414dc8285b2`

## Review-base developer SHA

`784337f93f7b3042047c8fde898e1414dc8285b2`

## Public-safe task brief

Implement bridge-side administration IPC and reconciliation capability for the
reusable workflow:
1. Unix domain socket `admin.sock` beneath the private git dir `opencode-bridge/<instance-id>/admin.sock` with `0600` permissions.
2. Handlers for `status` and `reconcile`.
3. `reconcile` runs `recoverOnce()`, recovers terminal response deliveries, and flushes outbox without creating/prompting sessions.
4. CLI support for `opencode-bridge status` (using admin socket when available) and `opencode-bridge reconcile`.
5. Configuration schema supports `admin_socket_file` and `service_unit`.

## Checks

- TypeScript compilation and `npm test` on `tools/opencode-bridge` passed (121 tests).
- `./scripts/validate-repository.sh` passed.
