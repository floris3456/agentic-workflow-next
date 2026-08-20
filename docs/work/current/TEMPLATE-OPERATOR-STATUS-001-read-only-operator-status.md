# Template-maintenance task progress

## Task ID

TEMPLATE-OPERATOR-STATUS-001

## Status

queued

## Task-start template-development SHA

7f72db339828f8afe4be0b624869c7861370b698

## Review-base template-development SHA

Not yet established. This task is queued and must establish a fresh exact remote
`template-development` review base immediately before activation and source
mutation.

## Public-safe task brief

Add a very lightweight read-only operator status view for the reusable workflow.
The purpose is to make common Workspace/OpenCode bridge problems easy to see
without exposing arbitrary host administration or private configuration.

The operator should be able to quickly see, in public-safe form:

- whether repository/worktree registration is healthy;
- whether the expected bridge/service is running and healthy;
- whether bridge identity and repository identity match;
- whether the heartbeat is fresh enough to trust the running state;
- whether a bridge start would currently be considered safe;
- the current bounded blocking reason when an operation cannot proceed; and
- enough branch/SHA context to understand which repository state is being
  inspected without exposing host-local paths.

This task is intentionally read-only. It must not add arbitrary `systemctl`, DBus,
host filesystem, SQLite, configuration, process-control, or generic command
access. It must not expose credentials, private configuration values, host-local
paths, raw private agent/session identifiers, or unrestricted logs.

The view should reuse already trusted inspection/proof paths where possible rather
than creating a second source of truth. In particular, current bounded bridge and
workspace inspection semantics should remain authoritative for repository
identity, worktree registration, service binding, running state, heartbeat
freshness, and start-safety proof.

This task does not attempt to solve the accepted fully-dead-bridge limitation.
If the chosen view depends on the bridge or Workspace Maintenance session being
reachable, that limitation remains explicit. Building a separate always-available
host supervisor/control plane is a different task.

## Current objective

When activated, design and implement the smallest useful read-only operator view
that explains current health and blocking state without widening host authority.

## Current position

Planning-only task record. No source mutation has been made for this task.

Exact refs at task creation:

- `main`: `6127611113dfdb66f93a0cfd2d355359aa370833`
- `developer`: `c6b747f00ad7509c1340fc11fca1466abb8eb1f9`
- `web-orchestration`: `64e9aacd0168053d5be5b4931d9d22cb5762edb7`
- `template-development`: `7f72db339828f8afe4be0b624869c7861370b698`

Relevant existing behavior:

- `workspace_bridge_inspect` already provides a bounded read-only bridge status
  path and performs repository/service/identity checks.
- Workspace Maintenance already has strict worktree registration and exact
  repository identity checks.
- Host Admin intentionally added only bounded bridge inspect/start/reconcile
  operations and deliberately avoided arbitrary host administration.
- TD-005 records that a completely dead bridge cannot be recovered by a remote
  orchestrator through that same bridge; a separate always-available supervisor
  would be required for that capability.

## Source ranges

No task source ranges have started. Establish exact bases at activation.

Planning refs only:

- `developer`: `c6b747f00ad7509c1340fc11fca1466abb8eb1f9`
- `web-orchestration`: `64e9aacd0168053d5be5b4931d9d22cb5762edb7`
- `template-development`: `7f72db339828f8afe4be0b624869c7861370b698`

## Observed

- The bounded host-administration work solved the underlying safe inspection and
  recovery primitives, but it did not create a compact operator-facing status
  surface.
- Important failure states can currently require reading detailed tool output or
  task history to understand whether the problem is worktree registration,
  service binding, identity, health, heartbeat freshness, start safety, or an
  accepted external limitation.
- A compact read-only status view would reduce diagnosis time and make it easier
  for the web orchestrator or local operator to distinguish a real blocker from a
  configuration/registration problem.
- The human previously identified this as a separate follow-up rather than part of
  Host Admin and has now requested that it receive its own task record.

## Interpretation

The task is an observability/usability improvement, not a new administration
capability.

The safest design is to summarize already-proven bounded state. It should not
create new privileged reads merely because a dashboard would be convenient.
Unknown or unprovable state should remain visibly unknown/blocked instead of being
converted into a guessed healthy value.

A useful output should answer two simple questions:

1. What is healthy or unhealthy right now?
2. If something is blocked, what is the first real reason?

## Attempts

1. The Host Admin work established bounded bridge inspection/start/reconcile and
   strict identity/service-binding checks.
2. During later review, a separate lightweight read-only operator dashboard/status
   view was identified as useful but deliberately left outside Host Admin scope.
3. The human has now asked for that follow-up to be recorded as its own task.

## Changed approach

None. This is a newly queued maintenance task.

## Checks

Planning-only evidence review completed.
No implementation checks have run because no source mutation has started.

## Blockers / required decisions

- No human design decision is currently required.
- This task must remain non-mutating until the currently active template-
  maintenance task is completed/finalized or the human explicitly reprioritizes
  the active task.
- If implementation would require a new always-available host service or broader
  host privilege, stop and treat that as a separate material scope/security
  decision rather than silently widening this task.

## Remaining work

1. Re-establish exact live refs and activate this task with a fresh review base.
2. Inventory the current bounded status fields from workspace and bridge
   inspection and identify the smallest useful operator-facing subset.
3. Choose the smallest existing surface that can present the status clearly
   without creating a new privileged control plane.
4. Define one public-safe status model covering repository/worktree registration,
   bridge/service state, identity/health, heartbeat freshness, start-safety state,
   and first blocking reason.
5. Ensure unknown/unavailable state fails closed and never appears healthy by
   default.
6. Add regressions for healthy state and representative blocked states, including
   registration mismatch, wrong service binding/identity, stale heartbeat, unsafe
   start, unavailable inspection, and privacy redaction.
7. Prove the view is read-only and cannot start/reconcile services or accept
   caller-supplied host paths/unit names/commands.
8. Update relevant AS-BUILT/design/deviation records only if the implemented
   architecture materially changes them.
9. Run authoritative checks, independently review exact source ranges, package the
   change, and complete normal maintenance handoff.

## Next action

Remain queued. On activation, start by mapping existing trusted inspection output
before designing any new interface.

## Relevant durable records

- `.opencode/skills/workspace-maintenance/SKILL.md`
- `.opencode/plugins/workspace-maintenance.ts`
- `docs/architecture/AS-BUILT.md`
- `docs/deviations.md`
- `docs/work/current/TEMPLATE-HOST-ADMIN-001-bounded-host-administration.md`
- `tools/opencode-bridge/AS-BUILT.md` on `developer`
- `docs/architecture/opencode-bridge.md` on `developer`

## Last handoff commit

None
