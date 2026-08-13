# Template-maintenance task progress

## Task ID

TEMPLATE-SMOKE-RESPONSE-001

## Status

In progress

## Task-start template-development SHA

08d7eb82ea13eca3285ad562f19106d84233471d

## Review-base template-development SHA

08d7eb82ea13eca3285ad562f19106d84233471d

## Original task brief

Immediately after implementing the new template-development workflow, identify
the problems in the web orchestrator's saved smoke-test response and fix them.
Use the operator-provided external response file, and start using the new branch
for this task. The host-local response path is intentionally not persisted.

## Current objective

Diagnose each concrete functional failure evidenced by the saved smoke response,
fix the reusable template on its authoritative source branch or branches, prove
the correction, and create a portable change package.

## Current position

The maintenance task is initialized before inspecting the saved response.

## Source ranges

- Ledger: `08d7eb82ea13eca3285ad562f19106d84233471d..HEAD`.
- Developer: base `ccfa12dc2783c7e8fc336abc503e083b69112a71`; candidate not started.
- Web-orchestration: base `04e111dd874c2f431805b52b3eb24c6b04de95b8`; candidate not started.
- Main baseline: `6127611113dfdb66f93a0cfd2d355359aa370833`.

## Observed

- The saved response has not yet been inspected.
- A separate smoke run still has open control issues, so source-branch mutation
  must not collide with its unresolved bridge activity.

## Interpretation

Use read-only diagnosis first. Resolve source-task boundaries only after exact
evidence identifies the defective layer.

## Attempts

None.

## Changed approach

None.

## Checks

- Template-development local and remote matched at task start.
- The ledger validation passed before this task started.

## Blockers / required decisions

None. Open smoke issues are a coordination constraint, not yet an implementation
blocker.

## Remaining work

- Inspect and classify the saved response.
- Reconcile the exact bridge/issue/runtime evidence needed to establish causes.
- Implement and validate the reusable corrections on authoritative branches.
- Create, validate, and record the portable change package.
- Reconcile ledger AS-BUILT, deviations, source lock, and task status.

## Next action

Read the saved response and map every claim to exact source/runtime evidence.

## Relevant durable records

- `docs/architecture/AS-BUILT.md`
- `docs/design/template-maintenance-workflow.md`
- `docs/deviations.md`

## Last handoff commit

None
