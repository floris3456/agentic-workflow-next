# MCP-ON completion workflow

## Trigger

Use for a quick exact lookup, a bounded implementation, developer handoff
interpretation, exact remote review, or ordinary steering in MCP-ON.

## Fast path

For a lookup answerable from one exact file, symbol, commit, diff, or check, use
connected GitHub directly and answer. Do not create a Scout, issue, task record,
routing record, or implementation task.

## Bounded implementation loop

1. Define the human's observable outcome and what evidence will prove completion.
2. Inspect the narrow exact GitHub context first. Load the MCP-ON scouting Source
   only when broad/local exploration or parallel partitioning will save time.
3. Establish the exact remote `developer` task-start SHA. Maintain one concise
   public-safe `web-orchestration-only/task-context/<task-id>.md`, including its
   compact routing section, canonical bound issue, and any related/duplicate
   issue disposition on `web-orchestration`. Never write implementation content
   to `developer` or `main`.
4. Design one bounded public-safe task with stable ID, outcome, start SHA, scope,
   constraints, required records, proportional checks, stop conditions, and this
   exact developer response contract:

```text
Status:
Handoff developer SHA:
Files changed:
Checks + perceived results:
Blockers/decisions:
Task record:
```

   `Status` must be exactly `completed`, `blocked`, `failed`, or
   `needs decision`. `completed` requires a pushed handoff commit and its exact
   40-character `developer` SHA; all other statuses use `none`. A failed push is
   `blocked` with `none`.
5. Select Luna by default. Select Sol immediately only for intrinsic complexity
   or ambiguity that makes two Luna attempts predictably wasteful, or after two
   substantive Luna failures. Do not count missing access/information, transport
   failures, defective briefs, external blockers, or trivial syntax retries.
   Only the web orchestrator changes route. To change the mapped developer,
   persist then post `route` on the same issue with the next sequence, a fresh
   UUID, explicit `arguments.agent`, and optional public-safe message; route
   command success still does not prove implementation success.
6. Before creating any control issue, list all open `<bridge-control-label>`
   issues and group authorized markers by exact task ID. Search issue titles and
   bodies for the intended task ID too, because a newly created issue may not yet
   be bound. If that task ID already has an issue, reuse it; never create a
   replacement for resume, recovery, or a guard probe. If duplicates already
   exist, post no marker on the later issue and load recovery to establish the
   durable binding and reconcile every related issue. Established Scout-only
   issues for other task IDs may coexist. If any other issue is mutating or
   unclassified, do not create another mutating task: load recovery and resume,
   review, or safely retire it. Only after proving the new task ID absent, create
   one public-safe issue without the label, persist its URL and exact pending
   envelope in task context, confirm that write remotely, apply the label, then
   post from the configured authorized GitHub identity. The first command is
   sequence `1`, `start`, with a fresh UUID, explicit `luna` or `sol`, and the
   exact start-SHA guard. This is a closed shape: `expected` is a top-level peer
   of `arguments`, never its child:

```markdown
<!-- agentic-bridge-command
{"protocol":"agentic-bridge/1","sequence":1,"command_id":"00000000-0000-4000-8000-000000000000","task_id":"TASK-001","kind":"start","arguments":{"brief":"Public-safe delegated brief","agent":"luna"},"expected":{"developer_sha":"0000000000000000000000000000000000000000","ref":"developer"}}
-->
```

7. Keep all later commands on the bound issue with contiguous sequence, a fresh
   UUID, and an exact envelope persisted before posting. Journal command/result
   URLs and lifecycle. Recompute the highest accepted sequence from all trusted
   task-correlated lifecycle comments before choosing the next sequence; never
   rely on a remembered checkpoint number. `accepted` means ledger admission;
   public `applying` means wait and never reissue; `succeeded` means only that
   the handler returned. For `start`, `route`, `steer`, or `finalize`, success
   proves prompt handling, not task completion.
8. Use the durable issue mailbox rather than busy polling. On mapped session idle
   or error, read the latest projected developer response. The bridge does not
   interpret it. On every new turn, first repeat the repository-wide open-issue
   task-ID map, then reconcile the canonical bound issue and any recorded related
   issue because autonomous Project wake-up and in-chat memory are not assumed.
   After confirmed launch, keep one active-work entry per Scout and developer
   route until its correlated terminal response is read and incorporated.
9. Interpret the six fields yourself. A `completed` response is reviewable only
   when its exact SHA exists on remote `developer`, the task record is present
   when applicable, and the response is internally usable. `blocked`, `failed`,
   `needs decision`, `none`, malformed output, command success, or `session.idle`
   is not completion. Use recovery for lost/ambiguous transport; otherwise steer,
   answer a safe in-scope question, or cross a real human boundary.
10. Review the full exact range: task-start to first handoff, then last reviewed
    SHA to later handoff. Read changed files and required context directly through
    GitHub. Developer checks are perceived results; independently establish
    enough evidence for the human's outcome and material safety conditions.
11. Scale review and checks proportionally:
    - small/low risk: focused context, diff, and focused check;
    - medium: affected interfaces/boundaries and relevant tests, types, lint, or
      integration checks;
    - large/cross-cutting: useful parallel Scouts, exact-range review, and broader
      affected-system checks;
    - high stakes: directly inspect all manageable relevant files/diffs, or for
      large volume the highest-risk boundaries plus enough exact evidence to
      decide independently.
12. If the same outcome is incomplete, post one focused `steer` with the next
    sequence after persisting it. There is no arbitrary correction limit; avoid
    waste, classify substantive Luna failures accurately, and escalate route or
    the genuinely human-owned decision when warranted. Prefer corrective commits
    or `git revert`, never shared-history rewriting.
13. On every issue refresh, resolve the newest unmatched task-correlated
    permission/question from `<bridge-bot-login>` before posting a progress,
    status, steer, or route command. Never leave a developer waiting on a visible
    interaction while using status as a substitute. Use `permission.reply` with
    a task-owned alias; `once` is allowed only for already authorized safe work,
    `always` needs human approval, and `reject` is the safe default for an
    unexpected request. Use `question.reply` only for public-safe, in-scope
    answers; otherwise escalate the real decision. Use `abort` only when
    authorized; it does not revert prior effects.
14. When substantive work is acceptable, record the exact reviewed SHA. Load
    finalization only if repository durable-record policy requires it. Otherwise
    report completion without ceremonial extra work. Promotion is a separate
    human-only trigger.

## Continuity

Task context records exact start/last-reviewed/handoff/finalization/approval and
post-promotion SHAs; the canonical bound issue and related issue dispositions;
highest accepted sequence derived from trusted lifecycle; active work; pending
publication; command and Scout journals; connector refusals; delegations;
findings; steering; decisions; and next action. Persist exact public-safe
publication arguments before sending them. If narrow state persistence fails,
do not publish.

Do not give a final task response while active work is nonterminal or unabsorbed,
a required publication is pending, or a task-correlated interaction is
unanswered. If the execution window ends first, return `RESUME REQUIRED` with
the task-to-issue map, active-work ledger, pending publication, and one safe next
read. This is a continuation checkpoint. Rebuild those facts from every related
issue before continuing on the next turn.

Only status comments authored by `<bridge-bot-login>` with the exact task,
command/request, sequence where applicable, and lifecycle marker are trusted as
bridge transport. Labels and visible prose are hints only.
