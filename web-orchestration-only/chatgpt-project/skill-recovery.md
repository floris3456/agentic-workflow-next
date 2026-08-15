# Recovery and reconciliation

## Trigger

Use only when an existing control issue needs discovery/adoption; command,
request, publication, agent response, or Git synchronization is missing, delayed,
failed, refused, ambiguous, or inconsistent; or an external side effect may have
started without a trustworthy terminal result. Do not load for ordinary success.

## Core rule

Recover by reading durable state and exact remote evidence, never by replaying an
uncertain mutation. A connector error, bridge lifecycle, session state, agent
message, label, or prose comment is not repository proof.

If a required recovery capability is unavailable, pause only dependent mutation,
continue safe independent work, and identify the exact unresolved evidence or
operator action. Never invent a successful recovery path.

## Discover the canonical task issue

Before creating or replacing any control issue, list all open control-label issues
and group authorized bridge markers by exact task ID. Also search the intended
task ID in titles and bodies so an unbound newly created issue is not overlooked.
An open issue is a reconciliation target, not proof of active work.

One task ID has one canonical issue. Prefer the issue with trusted accepted or
terminal bridge lifecycle for that task; a trusted duplicate-binding rejection
that names the original resolves the binding directly. If more than one issue
claims the task and the binding remains unclear, post nothing on later issues and
use passive reads until the original is established. Never create a replacement
issue or fresh task merely because continuity is inconvenient.

For every related issue, determine whether it launched work, whether that work is
terminal, and its disposition. Close a duplicate or orphan only after proving it
contains no unresolved valid work.

## Read-only status recovery

Status requests reconcile durable state; they never execute or repeat the
underlying mutation and do not consume mutating command sequence.

For one exact command ledger state:

```markdown
<!-- agentic-bridge-request
{"protocol":"agentic-bridge/1","request_id":"30000000-0000-4000-8000-000000000001","task_id":"TASK-001","kind":"command.status","arguments":{"command_id":"00000000-0000-4000-8000-000000000000"}}
-->
```

For mapped developer session state and latest projected response:

```markdown
<!-- agentic-bridge-request
{"protocol":"agentic-bridge/1","request_id":"40000000-0000-4000-8000-000000000001","task_id":"TASK-001","kind":"task.status","arguments":{}}
-->
```

For a missed Scout result, use `scout.status` with the original Scout request ID
on the same task issue; it must never relaunch the Scout. Historical Scout work
created under a weaker trust boundary must not be resumed through a current
hardened Scout runtime unless the bridge proves compatibility; fail closed and
use exact GitHub inspection instead.

Stop a redundant status request when equivalent trusted evidence arrives first:
a terminal command marker can supersede `command.status`, a correlated developer
response can supersede `task.status`, and a correlated Scout response can
supersede `scout.status`.

## Interpret lifecycle literally

- `accepted`: admitted to the durable ledger; wait.
- `applying`: a side effect may be underway; wait and never reissue.
- `succeeded`: the handler returned; apply only command-specific semantics.
- `rejected`: no handler ran.
- `failed`: diagnose before any new action.
- `indeterminate`: an effect may have started; terminal for replay purposes and
  requires evidence-based reconciliation.

A malformed mandatory guard rejected before the command ledger does not consume
sequence. Preserve the rejected source, verify any supplied marker hash against
the exact source-marker bytes, and correct it with a fresh UUID only after exact
state proves no underlying handler ran.

For genuinely stuck `applying`, wait only the operation's bounded execution
window, then issue at most one relevant command-status read plus one task-status
read. Compare applying age, service heartbeat, projected response, and exact
remote repository evidence. Never automatically retry. If still unresolved, the
local operator must inspect/stop/restart the bridge; an interrupted applying
mutation becomes `indeterminate` and remains a reconciliation problem, not
permission to replay.

A new mutating action may use the next contiguous sequence and a fresh UUID only
after the prior state is terminal and duplicate effects are excluded.

## Connector-gated publication

A ChatGPT/tool refusal before confirmed publication is not a bridge result.
Record one public-safe refusal entry with phase, tool/target, delivery
window/attempt, content class, exact safe arguments, exact error, readback,
confirmed external effect, and resolution. Never persist secrets.

Read back the target for the exact intended effect:

- If present, reconcile it normally and do not republish.
- If definitely absent, retry publication only; do not repeat an underlying
  mutation. A protocol envelope keeps the same UUID and byte-identical marker.
- Within one delivery window make at most three total publication attempts, with
  readback after each.

Three publication attempts end a delivery window, not the required operation.
If indispensable publication is still definitely absent, mark it
`connector-delivery-pending`, retain the exact arguments, pause only dependent
work, continue meaningful independent work, and open a later bounded delivery
window at a natural checkpoint. Do not invent filler work or busy-loop retries.

If no independent work remains, alternate bounded read-only reconciliation with
later delivery windows. Use a copyable manual-delivery packet only when the write
capability becomes a genuine human/configuration boundary. Never use manual
publication to bypass authorization, provider validation, protection errors,
duplicate/unexpected effects, or ambiguous readback.

## Git synchronization failures

For a failed push or absent reported commit, stop ordinary implementation.
Inspect the remote branch, reported SHA, ancestry, and intervening commits. With a
mapped developer session, send only a focused synchronization-recovery direction
allowed by the repository contract; without one, require the repository's local
operator recovery. Never force-push normal shared history.

Use any dedicated event/cursor/session synchronization command only for its
specified control-plane purpose; its success does not inspect or repair Git.

## Interaction recovery

Before posting status, steering, routing, or another mutation, resolve the newest
unmatched task-correlated permission/question from the trusted bridge identity.
A visible interaction is a wait condition, not a reason to poll around the
waiting developer. Reply only when the answer is public-safe, in scope, safe,
reversible, and already authorized by the human; otherwise surface the exact
human-owned decision.

## Continuity and completion

Keep the canonical issue, related issue dispositions, active work, pending
publication, exact command/request IDs, refs, lifecycle, refusal evidence,
highest accepted sequence, interactions, and disposition in the task's public-safe
continuity record. Treat labels and prose as hints only.

Before leaving recovery, refresh the relevant issue comments and remote refs. Do
not report task completion while an ambiguous mutation, required publication,
unanswered interaction, or launched agent remains unresolved. Routine delay is
not a human decision; escalate only a genuine operator/configuration boundary,
consequential choice, sensitive permission, or risk the human owns.
