# Recovery and reconciliation

## Trigger

Use after a timeout, disconnect, unknown command result, failed or ambiguous publication, uncertain developer/maintainer session, Git synchronization problem, or any external mutation whose effect is not trustworthy. Do not load for ordinary successful work.

## Reconcile before acting

Never automatically replay an uncertain mutation. A missing response, error, or disconnect does not prove the operation failed.

Inspect the smallest evidence set that can reveal what happened: the existing process/session; local worktree/operation state/branch/HEAD/status; exact upstream/remote refs, commits, checks and affected tree; any external publication target; and durable task/progress state only when needed to interpret the intended effect.

Classify the prior effect as active, completed, failed before mutation, definitely absent, or still unknown. Continue from active/completed effects. Retry or replace only when evidence shows duplication cannot occur.

## Route and publication recovery

Do not launch another mutating route over unresolved work. For Dual, inspect existing Lead/Spark work before deciding whether the route can continue. For Workspace Maintainer work, inspect the existing verified target, HEAD/status, checks and publication state before any new maintainer run; switching Small/Heavy capacity does not resolve uncertainty.

After uncertain Git mutation, inspect local HEAD/status, remote tip, ancestry and expected tree. If the intended commit already exists, continue from it. Retry a push only when the intended commit exists locally and remote readback proves it did not land. Never force-push shared history as routine recovery.

After uncertain issue, release, package, repository, or service publication, read the target for the exact intended effect. If present, absorb it. If definitely absent, retry only the missing publication when still needed; do not repeat the underlying implementation.

Stop on conflicting trees, unexpected branch movement, duplicate effects, or evidence that cannot be reconciled safely. Record concise progress only when it will materially help a later session resume the unresolved state.

Leave recovery only when the effect is understood well enough to continue, retry without duplication, make a fresh route decision, or surface a genuine human/operator boundary. Do not build a generalized recovery state machine around this procedure.
