# Task records and progress

Use `TEMPLATE.md` as the canonical ordinary task-record template when
consequential work benefits from durable instruction authority. Tiny one-turn
work may skip a durable record when continuity and audit value are negligible.

Keep exactly one canonical task-record. It contains the accepted outcome,
material scope, constraints, required outputs and checks, accepted design, and
explicit exceptions. Do not duplicate that plan elsewhere. A material authorized
change to outcome, scope, or constraints updates the task-record.

Create a separate `<task-id>-progress.md` only when it materially helps another
session resume. Use this concise shape:

```markdown
# Task progress: <task-id>

- Task ID: <task-id>

## Current position
## Material observations
## Meaningful failed attempts and route changes
## Blockers and decisions
## Checks run
## Remaining work
## Next action
```

Progress is execution state, not authority. Include only decision-relevant
position, observations, failed attempts or route changes, blockers and decisions,
checks already run, remaining work, and one next action. Do not duplicate the
task plan, dump commands or private reasoning, or silently change scope.

Explicit reusable-template maintenance uses its canonical accepted task record on
`template-development`; do not create a competing ordinary record here.

Historical records remain truthful history. They may retain old schemas, routing,
bridge, mode, finalization, or other retired terminology. Do not rewrite them
merely to match the current workflow. The validator accepts them as historical
public-safe Markdown rather than imposing the current template retroactively.
