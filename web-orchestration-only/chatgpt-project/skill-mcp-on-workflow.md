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
   public-safe `web-orchestration-only/task-context/<task-id>.md` and, when an
   implementation route is selected, one
   `web-orchestration-only/agent-routing/<task-id>.md` on `web-orchestration`.
   Never write implementation content to `developer` or `main`.
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
6. Ensure no other repository-mutating task issue is open. Create one public-safe
   issue without `<bridge-control-label>`, persist its URL and the exact pending
   command envelope in task context, confirm that write remotely, apply the
   control label, then post the command as a fresh comment from the configured
   authorized GitHub identity. The first command is sequence `1`, `start`, with a
   fresh UUID, explicit `luna` or `sol`, and the exact start-SHA guard:

```markdown
<!-- agentic-bridge-command
{"protocol":"agentic-bridge/1","sequence":1,"command_id":"00000000-0000-4000-8000-000000000000","task_id":"TASK-001","kind":"start","arguments":{"brief":"Public-safe delegated brief","agent":"luna"},"expected":{"developer_sha":"0000000000000000000000000000000000000000","ref":"developer"}}
-->
```

7. Keep all later commands on the bound issue with contiguous sequence, a fresh
   UUID, and an exact envelope persisted before posting. Journal command/result
   URLs and lifecycle. `accepted` means ledger admission; public `applying` means
   wait and never reissue; `succeeded` means only that the handler returned. For
   `start`, `route`, `steer`, or `finalize`, success proves prompt handling, not
   task completion.
8. Use the durable issue mailbox rather than busy polling. On mapped session idle
   or error, read the latest projected developer response. The bridge does not
   interpret it. On every new turn, reconcile the bound issue first because
   autonomous Project wake-up is not assumed.
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
13. For a projected permission/question from `<bridge-bot-login>`, verify task
    correlation and load the shared safety Source. Use `permission.reply` with a
    task-owned alias; `once` is allowed only for already authorized safe work,
    `always` needs human approval, and `reject` is the safe default. Use
    `question.reply` only for public-safe, in-scope answers. Use `abort` only when
    authorized; it does not revert prior effects.
14. When substantive work is acceptable, record the exact reviewed SHA. Load
    finalization only if repository durable-record policy requires it. Otherwise
    report completion without ceremonial extra work. Promotion is a separate
    human-only trigger.

## Continuity

Task context records exact start/last-reviewed/handoff/finalization/approval and
post-promotion SHAs; issue state; pending command; command journal; delegations;
Scout request journal; findings; steering; decisions; and next action. Persist an
envelope before posting it. If narrow state persistence fails, do not send the
command.

Only status comments authored by `<bridge-bot-login>` with the exact task,
command/request, sequence where applicable, and lifecycle marker are trusted as
bridge transport. Labels and visible prose are hints only.
