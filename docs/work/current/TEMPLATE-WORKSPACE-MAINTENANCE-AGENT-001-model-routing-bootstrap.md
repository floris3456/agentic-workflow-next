# Task progress

## Task ID

`TEMPLATE-WORKSPACE-MAINTENANCE-AGENT-001`

## Status

Bootstrap bridge handoff in progress; not complete and not accepted.

## Task-start developer SHA

`be1ab74e6a6d32f010f34f3ca8827efba6dd2a20`

## Current objective

Enable the already-committed Gemini `small-workspace-maintainer` on `template-development` to become the bridge's default workspace implementation route, so that agent can complete the model-routing bootstrap across `developer` and `template-development`.

## Bounded bootstrap change

Change only the bridge service's configured workspace agent from the legacy `workspace-maintainer` name to `small-workspace-maintainer`.

This is a capability-unlock predecessor, not the completed routing architecture. The same task's Gemini Workspace Maintainer must immediately absorb it and update the durable bridge contract, tests, validators, protocol/docs/AS-BUILT, developer Luna replacement, and explicit small/heavy workspace routing as required.

## Exact model evidence

The current authoritative template-maintenance record proves the usable small route as `cliproxyapi/gemini-3.7-flash-high` with `reasoningEffort: high`; do not substitute Luna or Sol for the small/default route.

## Boundaries

- Keep `large-developer`/heavy implementation on Sol unless the same task deliberately changes that heavy-tier contract.
- Do not mutate or promote `main`.
- Do not modify `web-orchestration`.
- Do not package or resolve the existing same-task package-supersession problem in this bootstrap.
- This bootstrap must be absorbed and independently reviewed before completion is claimed.

## Checks

The tracked developer synchronization watcher must fast-forward the dedicated checkout, validate/reapply the bridge runtime, and restart it before any `workspace.start` is trusted to use the new default.

## Handoff

Pending. The Gemini Workspace Maintainer must finish the architecture and publish its exact source handoffs before this task can be reviewed as complete.
