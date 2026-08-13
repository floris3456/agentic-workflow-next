# MCP-ON recovery and reconciliation

## Trigger

Use when an open control issue needs discovery or adoption; a command/result is
missing, delayed, stuck, rejected, failed, or indeterminate; a GitHub connector
action is refused before remote confirmation; or developer/remote synchronization
is inconsistent.

## Existing issue discovery

Before creating any control issue, list all open control-label issues and group
them by exact task ID from authorized command/request sources; also match the
intended task ID in titles and bodies so an unbound new issue is not overlooked.
An open control issue is a reconciliation target, not proof of active work and
not an automatic blocker. Authenticate its task binding from exact bridge-bot
markers and reconstruct missing task context from the complete public record.

One task ID has one canonical issue. Prefer the issue with trusted accepted or
terminal bridge lifecycle for that task; a duplicate-binding rejection naming
another issue resolves the binding directly. If more than one issue claims the
same task and the binding is still unclear, post nothing on any later issue and
use passive reads or local-operator inspection until the original is known.
Never create a replacement issue or new UUID to recover missing context. Record
every related issue and its disposition, reconcile the canonical issue's full
command/request journal and highest accepted sequence, then close a duplicate
only after proving it launched no unresolved work.

- For `accepted` or `applying`, keep the same issue and use bounded status
  recovery below; never replace the mutation.
- For a mapped active session with terminal command delivery, resume the existing
  task at its next justified action.
- For idle/error with a projected response, interpret and verify it under the
  normal workflow; session state alone proves nothing.
- When all mutations are terminal and the task is verifiably completed or
  superseded, record the disposition and close the issue. Close an orphan only
  after establishing that no valid start exists.
- Resolve `blocked`, `failed`, or `needs decision` under normal authority rules;
  do not discard them merely to release the issue.

If evidence conflicts or a last result is absent, make the status reads below.
Only unresolved ambiguity blocks a new mutation. Never use
`bridge-status:complete`, another label, or visible prose as task completion.
If multiple mapped mutating issues exist, command dispatch is frozen, but
task-bound sequence-free status requests and read-only Scout recovery remain
available; use those reads to reconcile rather than treating the control plane
as unavailable.

## Durable read requests

Status lookup is exceptional reconciliation, not mandatory polling. Post a
sequence-free UUID request on the existing task-bound issue from the authorized
identity. It does not consume command sequence or execute/repeat a mutation.
If a restart interrupts one of these local status reads, the bridge recomputes it
under the same request UUID; this does not authorize repeating `scout.start` or a
mutating command.

Exact command ledger or pre-ledger-rejection state:

```markdown
<!-- agentic-bridge-request
{"protocol":"agentic-bridge/1","request_id":"30000000-0000-4000-8000-000000000001","task_id":"TASK-001","kind":"command.status","arguments":{"command_id":"00000000-0000-4000-8000-000000000000"}}
-->
```

Mapped developer session state and latest projected response:

```markdown
<!-- agentic-bridge-request
{"protocol":"agentic-bridge/1","request_id":"40000000-0000-4000-8000-000000000001","task_id":"TASK-001","kind":"task.status","arguments":{}}
-->
```

## Connector-gated publication

A ChatGPT/tool connector refusal is not a bridge disposition. Immediately read
the issue and comments for the exact prepared UUID and marker. If present,
reconcile that posted envelope normally. If absent, make at most three total
connector attempts using the same UUID and byte-identical envelope, reading back
after each attempt. This retries only idempotent publication; never invent a
replacement UUID, alter the envelope to evade the gate, or repeat an accepted or
ambiguous underlying mutation.

Stop a redundant status request when equivalent trusted evidence arrives: an
exact terminal command marker can supersede `command.status`, a correlated
developer response can supersede `task.status`, and a correlated Scout response
can supersede `scout.status`. Record the definitely unpublished request as
cancelled and continue from that evidence. Before reporting `BLOCKED` or `RESUME
REQUIRED`, refresh the issue comments and relevant remote refs once more. If the
marker remains absent after the bounded attempts and no equivalent evidence can
resolve an indispensable fact, report the connector capability gap, not a bridge
rejection or failure.

## Procedure

1. Stop new commands. Reconcile task context, the same bound issue, exact UUID,
   every related issue, highest accepted sequence derived from trusted lifecycle,
   persisted envelope, authorized comment identity/association, bridge bot
   author, result marker, service heartbeat, and exact remote GitHub state. First
   resolve any unmatched task-correlated permission/question; a visible
   interaction is a wait condition, not a reason to post another status command.
2. If an eligible command comment exists, do not replace it because acknowledgement
   is delayed. For refused or ambiguous publication, follow the connector-gated
   readback and bounded identical-envelope rule above. Never change content while
   reusing a UUID.
3. Interpret lifecycle exactly: `accepted` means wait; `applying` means a side
   effect may be underway, so wait and never reissue; `succeeded` applies only
   command-specific semantics; `rejected` means no handler ran; `failed` needs
   diagnosis; `indeterminate` means an effect may have started and is terminal.
   A missing or misplaced mandatory top-level `expected` guard is durably
   rejected before the ledger and does not consume sequence; correct it with a
   fresh UUID at the still-expected sequence.
   A pre-ledger rejection has no command tuple: verify its `marker_hash` as the
   lowercase SHA-256 of the exact UTF-8 source-marker body bytes (including the
   canonical trailing newline), retain the rejected source, and do not treat it
   as an accepted command result.
4. For genuinely stuck `applying`, wait only the operation's bounded window, then
   use one `command.status` plus `task.status`. Compare applying age, heartbeat,
   projected response, and exact remote Git evidence. Never automatically retry.
   If still unresolved, require the local operator to inspect and stop/restart
   the bridge; startup converts interrupted applying work to `indeterminate` for
   evidence-based reconciliation.
5. A new action uses the next contiguous sequence and fresh UUID only after the
   prior state is terminal and duplicate effects have been excluded. Preserve
   pre-ledger rejected or terminal-unresolved envelopes until reconciled.
6. If session idle/error delivery was missed, `task.status` recovers the latest
   projected developer response. Interpret it under the normal workflow; neither
   idle nor the status result proves completion.
7. For a failed push or absent reported commit, stop ordinary implementation.
   Inspect remote branch, reported SHA, ancestry, and intervening commits. With a
   mapped session, send a focused `steer` requiring the repository's guarded Git
   synchronization recovery; without one, request local operator recovery. Never
   force-push normal `developer` history.
8. Use sequenced `sync.recover` with empty arguments only when OpenCode
   event/cursor/session recovery is needed. Its success does not inspect or fix
   Git synchronization.
9. Record canonical and related issue IDs, every command/request ID, refs,
   lifecycle, evidence, highest accepted sequence, and disposition in task
   context. Close or retain each issue only under the discovery rules above.
   Treat labels and prose as hints, never proof.

Routine delay is not a human decision. Escalate only an unresolved operator
state, consequential choice, sensitive permission, or risk the human owns.
