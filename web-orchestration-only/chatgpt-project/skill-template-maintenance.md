# Template maintenance

## Trigger

Use only when the human explicitly asks to evaluate, test, change, package, or
transfer the reusable workflow template itself: its Project package, agents,
skills, branch workflow, validators, runtime, or maintenance assets. Do not load
for ordinary project work or an incidental template observation.

## Canonical authority

The accepted canonical task-record on `template-development` is the durable
instruction authority. Read it first, together with useful separate
task-progress, applicable AS-BUILT and formal deviations, relevant architecture
and actionable docs, `source-lock.json` when source provenance matters, and exact
current remote refs and Git state.

Use exactly one canonical task-record for consequential template work. Keep
optional progress concise and non-authoritative. A material authorized outcome,
scope, or constraint change updates the task-record. Historical task-context and
task records remain historical evidence; never rewrite them merely because
current terminology or procedure changed.

Use zero compaction and no fallback. A resumed bounded session receives the last
5,000 raw chat tokens and re-reads the durable records it needs.

## Source work and routes

Actual source edits remain on their authoritative branches. Identify which
requested effects belong on `template-development`, `developer`,
`web-orchestration`, or another expressly authorized branch. Do not merge
independent branch histories or treat a maintenance ledger as implementation
truth for another branch.

Select the source route from the task:

- direct web/GitHub for a tiny exact low-risk edit;
- `small` for very simple bounded local work;
- `heavy` for difficult or subtle but still small bounded work;
- `dual` by default for substantive work.

Only one mutating source route runs at a time. Read-only research may overlap
where safe. `small` and `heavy` are not retries or substitutes for Spark inside
Dual. If Dual is unavailable, reconcile existing effects and make a fresh route
decision.

For Dual, the Lead owns deep current-state inspection, concrete implementation
architecture, detailed Spark direction, diff and check review, and correction
steering while remaining non-editing for implementation source. Spark alone
performs edits and implementation commands. The web orchestrator independently
verifies the exact remote result against the accepted template outcome and
cross-system constraints without routinely duplicating the Lead's full review.

Review every resulting source range against exact remote Git. Reports and CI are
evidence; they do not replace inspection or human promotion authority.

## Durable implementation truth

Before each mutating handoff, assess AS-BUILT, formal deviations, actionable
documentation, source-lock/provenance effects, and whether transfer or release
packaging is actually required.

For every changed code file, identify the applicable AS-BUILT scope. Keep that
AS-BUILT complete and accurate for every code file in its directory, enough to
reconstruct current implemented reality. Update ordinary docs only when the
implementation makes them false, materially incomplete, or misleading.

A formal deviation records final current implementation that materially differs
from an applicable prior normative expected state. It is not a future proposal.
In Dual, Spark's single task-scoped `proposed-deviations.md` is temporary working
state for Lead disposition and must have no unresolved proposal at completion.

Keep `source-lock.json` accurate when the task reaches a meaningful source
provenance checkpoint. Reconcile it only from independently verified exact remote
refs; do not infer source state from reports or package endpoints.

## Conditional packages and transfer

Source work can complete without a package. Generate or apply a package only when
the accepted task requests transfer, downstream application, or release
packaging. When requested, use the tracked deterministic generator, verifier, and
provenance contract on an authorized execution surface. Never hand-build package
contents, silently widen reviewed ranges, or treat package generation as a
completion ceremony.

Keep source-lock concepts and exact package base/head provenance distinct. Review
the pushed package bytes and manifest when a package is an accepted output.
Downstream conflict is an explicit adaptation task, not permission to alter the
canonical package silently.

## Checkpoints and completion

Do not require push-after-every-commit, handoff-only snapshot commits, mandatory
finalization, or archive movement. Push when remote durability, handoff, review,
session/worktree transfer, interruption recovery, or CI evidence is useful.
Archival is outside the critical path.

Completion requires the accepted template outcome, affected source ranges,
durable truth, relevant checks, and unresolved risks to be independently
accounted for. `main` remains unchanged unless the human separately invokes the
exact-SHA promotion procedure.
