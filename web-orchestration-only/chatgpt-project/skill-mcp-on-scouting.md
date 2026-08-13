# MCP-ON direct inspection and scouting

## Trigger

Use only when broad/local exploration will materially save time, independent
areas can be searched concurrently, or symbol relationships need local
inspection. Do not load for a quick exact GitHub lookup.

## Choose the evidence route

- Use connected GitHub directly for exact files, commits, diffs, checks, narrow
  symbol lookups, and every quick answer.
- Use focused OpenCode Scouts for broad repository orientation or independent
  partitions that are faster locally.
- For high-stakes work with manageable relevant volume, directly inspect every
  relevant GitHub file and diff even if Scouts helped.
- For high-stakes large work, partition with Scouts but directly inspect the
  highest-risk boundaries and enough exact remote evidence to decide without
  trusting Scout synthesis.

## Launch

Scout requests use the sequence-free request lane, not mutating task commands.
They do not create developer task progress, routing, finalization, or promotion
state. Use the existing task-bound issue or create a public-safe Scout-only issue,
apply `<bridge-control-label>`, and post each request from the authorized identity
with a fresh UUID, stable task ID, exact lowercase remote `developer` SHA, one
focused question, bounded scope, and expected evidence:

```markdown
<!-- agentic-bridge-request
{"protocol":"agentic-bridge/1","request_id":"10000000-0000-4000-8000-000000000001","task_id":"TASK-001","kind":"scout.start","arguments":{"question":"Which symbols enforce command admission?","ref":"0000000000000000000000000000000000000000","scope":"tools/opencode-bridge/src and tests","expected_evidence":"Exact paths, symbols, relevant lines, and explicit unknowns"}}
-->
```

`scout.start` may establish an issue/task binding without making it a mutating
task. Multiple useful Scout requests and Scout-only issues may run concurrently,
including beside one mutating developer task. Runtime worktree preparation may
briefly queue for Git safety; impose no orchestration concurrency cap. Record
only the exact request envelope, task, issue, exact ref, focus, and disposition in
the task-context Scout journal before posting; do not create mutating developer
records for a Scout. If comment publication is ambiguous, replay only the
exact same UUID/envelope after readback, never a fresh Scout start.

## Results and recovery

The bridge verifies the exact ref in fetched `origin/developer`, creates an
isolated detached worktree, selects the Luna/high read-only Scout, and correlates
task, request, session, ref, and projected result. The Scout cannot mutate files
or Git/OpenCode state, use shell/web/MCP, delegate, steer, accept, or decide the
orchestration outcome.

On Scout idle/error, read the projected response from the bound issue. It should
contain concise facts, exact paths/symbols/lines where useful, and explicit
unknowns. Trust transport only when `<bridge-bot-login>` authored it and the
task/request/ref match. If the result was missed, use `scout.status` in a new
sequence-free read request on that same task issue; it never relaunches the Scout:

```markdown
<!-- agentic-bridge-request
{"protocol":"agentic-bridge/1","request_id":"20000000-0000-4000-8000-000000000001","task_id":"TASK-001","kind":"scout.status","arguments":{"scout_request_id":"10000000-0000-4000-8000-000000000001"}}
-->
```

Compare independent results, resolve disagreement with exact GitHub evidence,
state unknowns, and perform all synthesis/task design/review yourself. Scout
output is never post-change proof or acceptance.
