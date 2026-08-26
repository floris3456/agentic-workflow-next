# Recovery and reconciliation

## Trigger

Use after a timeout, disconnect, unknown command result, failed or ambiguous
publication, uncertain developer session, Git synchronization problem, or any
external mutation whose effect is not trustworthy. Do not load for ordinary
successful work.

## No-replay rule

Never automatically repeat an uncertain mutation. An error, missing response, or
lost connection does not prove that the operation failed.

First reconcile the state that can reveal the effect:

1. the relevant current process or native developer session;
2. the local worktree, status, branch, HEAD, and operation state;
3. exact remote refs, commits, checks, and changed files;
4. the external target of any publication or service action; and
5. the canonical task-record and useful task-progress.

Continue or review the existing effect if it is active or completed. Retry or
replace it only when evidence shows the original did not occur or cannot
continue. If the evidence remains ambiguous, pause dependent mutation and state
what observation or human/operator action is needed. Safe independent research
may continue.

Do not replace this reasoning with sequence ledgers, retry windows, generalized
recovery phases, or another control-plane state machine.

## Route reconciliation

Identify the one mutating route that was selected and determine whether it
started, remains active, completed, failed before mutation, or has an unknown
effect. Do not launch a direct, `small`, `heavy`, or new Dual route over unresolved
mutation from another route.

For Dual, reconnect to and inspect the existing Lead and Spark work before making
a new route decision. `small` and `heavy` cannot stand in for Spark. If the Dual
session cannot continue, preserve exact evidence and have the web orchestrator
make a fresh task-based route decision only after duplicate effects are excluded.

## Git and publication recovery

After an uncertain commit or push, inspect local HEAD, working status, remote
branch tip, ancestry, and the expected changed tree before doing more Git
mutation. Continue from an existing commit when it already contains the intended
effect. Retry a push only when the intended commit exists locally and remote
readback proves the push did not land. Never force-push shared history as routine
recovery.

After an uncertain repository, issue, release, package, or other publication,
read the target for the exact intended effect. If present, absorb it and do not
republish. If definitely absent, retry only that publication when still needed;
do not repeat the underlying implementation mutation.

Stop on conflict, unexpected branch movement, duplicate effects, or mismatched
trees. Reconcile and re-review rather than improvising a merge or opportunistic
content change.

## Continuity

Update optional task-progress only when it improves resumability. Record the
current position, material observation, meaningful failed attempt or route
change, blocker or decision, checks already run, remaining work, and next action.
Do not copy the task plan, dump command history, or turn uncertainty into a scope
change. A material authorized outcome, scope, or constraint change belongs in the
canonical task-record.

Use no compaction or fallback summary. A resumed bounded session gets the last
5,000 raw chat tokens and must re-read the canonical task-record, useful
task-progress, relevant durable records, and exact Git state.

Leave recovery only when the prior effect is understood well enough to continue
safely, retry without duplication, replace through a fresh route decision, or
surface a genuine human/operator boundary.
