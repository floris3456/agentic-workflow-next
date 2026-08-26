# Web orchestration workflow

## Trigger

Use for ordinary repository research, task and outcome design, developer-route
selection, implementation orchestration, review, steering, and completion.

## Establish the outcome

Clarify the human's requested outcome, success evidence, material scope,
constraints, and human-owned decisions. Inspect exact remote repository evidence
and relevant public sources. Research specific architecture components deeply
enough to design a useful task, but for Dual work leave detailed current-state
implementation analysis and concrete implementation architecture to the Lead.

Use the smallest evidence set that can support a sound decision. A quick lookup
or tiny one-turn change does not need ceremony, a durable record, or delegated
research merely to satisfy a workflow shape.

For consequential work where durable instruction authority is useful, create or
resume exactly one canonical task-record. It contains the accepted outcome,
material scope, constraints, required outputs and checks, accepted design, and
explicit exceptions. Do not create a competing plan. A material authorized
change to outcome, scope, or constraints updates that record.

Create a separate task-progress artifact only when it materially helps another
session resume. Keep only current position, material observations, meaningful
failed attempts or route changes, blockers and decisions, checks run, remaining
work, and next action. Never use progress to silently change scope, duplicate the
task plan, dump commands, or preserve private reasoning.

## Select one implementation route

Choose from the task itself:

- **Direct web/GitHub:** tiny, exact, low-risk changes whose paths and edits are
  already known and whose remote result can be checked simply.
- **`small`:** very simple bounded local work where Dual overhead would be
  wasteful, normally with no tests or only trivial tests.
- **`heavy`:** difficult, important, subtle, or risky work that remains small and
  bounded enough for one capable developer.
- **`dual`:** the default for substantive development involving interacting
  edits, nontrivial implementation, meaningful tests, deeper current-state
  reasoning, or developer-side review.

These routes are independent choices, not retries or escalation levels. Never
replace Spark with `small` or `heavy` during Dual. If either Dual role is
unavailable, Dual is unavailable; reconcile any existing work and make a fresh
route decision. Only one mutating route may run at a time. Safe read-only research
may overlap when useful.

Before mutation, establish the exact target branch and start SHA and read the
branch's applicable instructions, task records, AS-BUILT, deviations,
architecture, actionable docs, and Git state.

## Direct, small, and heavy execution

For direct work, re-read the exact remote ref immediately before writing. Keep
the edit within the known tiny scope and read back the resulting remote files,
ref, and changed range. Stop and reconcile if the ref moves unexpectedly or the
write result is ambiguous.

For `small` or `heavy`, give the selected developer one bounded outcome, exact
useful start state, material constraints, applicable durable-truth obligations,
required checks, and expected observable handoff evidence. The developer owns
its implementation within that bounded route. Review the resulting exact remote
range directly and proportionally because there is no separate Lead reviewer.

## Dual execution

Give the Lead the canonical task-record, useful progress, exact Git start state,
and relevant durable records. The Lead must:

1. deeply inspect current repository reality;
2. choose the concrete implementation architecture;
3. give Spark detailed execution instructions;
4. remain non-editing for implementation source, tests, and generated outputs;
5. inspect Spark's full uncommitted diff and exact check output;
6. steer corrections until the developer-side result is satisfactory; and
7. return developer-reviewed completion with no unresolved proposal.

Spark alone performs implementation edits and commands. On every return to the
Lead, Spark reports files changed, the full uncommitted diff, commands and exact
outcomes, unresolved questions, and proposed-deviation status. Spark does not
delegate or silently redesign the task.

If a material Lead instruction or assumption appears wrong, unsafe, impossible,
or meaningfully inferior, Spark creates or updates exactly one task-scoped
`proposed-deviations.md` working file. It records the challenged instruction and
evidence, observed current-state reason, proposed alternative, impact and
affected files, and pending Lead disposition. Spark stops before implementing
the departure. The Lead accepts or rejects it before coding resumes. No proposal
may remain unresolved at developer completion.

A formal deviation is different: it describes final current implemented reality
that materially differs from an applicable prior normative expected state. It is
not a future proposal. Record one only when the resulting reality requires it.

## Review and steering

Treat every handoff as evidence, not authority. Investigate blockers and unclear
claims against exact repository state and accepted records before changing route
or asking the human, unless evidence already proves a human-owned decision,
safety boundary, unavailable required capability, or external blocker.

For Dual, rely on the Lead for deep implementation review and correction
steering, then independently verify the exact remote result against the accepted
outcome, relevant system and architecture constraints, ordinary check evidence,
durable truth, and unresolved risk. Do not routinely repeat the Lead's complete
line-by-line review.

For direct, `small`, and `heavy`, review the bounded implementation more directly:
inspect the exact changed range and affected context, assess the reported checks,
and request the shortest safe correction if needed. Never rewrite shared history.

## Durable truth and completion

Before mutating handoff, assess applicable AS-BUILT, formal deviations,
actionable docs, and package or release effects. Preserve the directory-wide
AS-BUILT completeness invariant for every changed code file. Do not package by
default, require archival, create handoff-only snapshot commits, or require a
push after every commit. Push when exact remote durability or evidence is useful.

Use the last 5,000 raw chat tokens with no compaction or fallback. On every new or
resumed bounded session, re-read durable authority and exact Git state rather
than relying on older discarded chat.

Completion requires the requested outcome and relevant safety/system conditions
to be supported by exact evidence, all launched mutating work to be reconciled,
and material unresolved risks or human decisions to be stated. Promotion remains
a separate human-only exact-SHA procedure.
