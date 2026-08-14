# Prompt mission profiles

## Trigger

Support Source for prompt creation. Load only when the prompt-creation procedure
is active. Do not route here directly from an ordinary user task.

## Purpose

A mission profile defines what the receiving context must accomplish and which
task facts are necessary to do that well. Mission does not define receiver
capabilities; combine the applicable mission profile with the chosen destination
profile. Use the smallest mission set that matches the human's request. A prompt
may combine closely related missions when the requested outcome genuinely spans
them, but do not add extra phases merely because profiles exist.

## Investigation / research

Use when the receiver should establish facts, diagnose a problem, map an unknown
area, or answer a focused question before implementation.

Transfer:

- the research question or decision the evidence must support;
- observations already established and their exact useful starting evidence;
- interpretations or hypotheses to test, clearly labeled as such;
- bounded scope and known exclusions;
- important unknowns or conflicting evidence;
- the evidence expected back: exact paths, refs, symbols, behavior, source links,
  reproduction evidence, comparisons, or explicit unknowns as appropriate.

Do not tell the receiver to confirm the originating hypothesis. Ask it to test or
resolve the question independently. Research output is evidence for a later
decision, not implementation proof or human acceptance.

## Review

Use when the receiver should evaluate an existing artifact, change, proposal, or
exact repository range rather than create the primary implementation.

Transfer:

- the exact review subject and, for repository changes, the known base/head refs;
- the intended outcome or contract the subject is supposed to satisfy;
- relevant surrounding context and affected boundaries;
- known concerns or prior findings as observations/interpretations, not required
  conclusions;
- the requested review depth, emphasizing correctness, safety, regressions,
  missing evidence, or another human-specified focus;
- the desired result: findings with evidence, explicit no-finding result where
  justified, and unresolved uncertainties.

Do not silently turn review into implementation. If fixes are also requested,
combine Review with Implementation / change explicitly.

## Implementation / change

Use when the receiver should modify code, configuration, documentation, records,
or another artifact.

Transfer:

- the observable outcome and success condition;
- exact current starting state when established and useful;
- bounded scope, allowed paths/components, and material exclusions;
- relevant observations and evidence that explain why the change is needed;
- constraints and authority boundaries that are specific to this task;
- required durable-record updates or compatibility obligations;
- proportional checks/tests/generation needed to prove the outcome;
- stop conditions for ambiguity, scope expansion, unsafe action, or a decision
  that belongs to the human;
- the expected handoff evidence when the destination does not already define it.

Prefer outcome and constraints over an unverified patch prescription. Include a
specific implementation approach only when the human required it or the approach
is itself an established constraint.

## Reproduce / test

Use when the receiver should reproduce a symptom, validate behavior, or test a
hypothesis without necessarily implementing a fix.

Transfer:

- the behavior or claim under test;
- expected versus observed behavior when known;
- exact relevant version/ref/environment facts that are established;
- setup, inputs, or conditions needed for a meaningful reproduction;
- safety/non-destructive constraints;
- what evidence to capture and what constitutes pass, fail, reproduced, or
  inconclusive;
- any known variability or uncertainty that could affect interpretation.

Do not fabricate a reproducible procedure from incomplete evidence. Where setup
is uncertain, ask the receiver to establish the missing conditions and report
what remains unknown.

## Continue / recover

Use when a fresh context must resume work already started elsewhere or reconcile
an interrupted/ambiguous state.

Transfer only durable, decision-relevant continuity:

- stable task identity and intended outcome;
- exact current remote refs and last independently reviewed/handoff refs when
  known;
- what work is terminal and absorbed versus still active or uncertain;
- pending publication, interaction, blocker, or human decision;
- material attempts and changed approach when they affect the next action;
- ambiguous mutations or delivery states that must not be replayed blindly;
- the safest justified next read or action.

Do not reproduce private reasoning or entire conversational history. Never turn
missing state into invented completion. For an MCP-ON destination, let the
receiver re-establish its own issue/bridge/continuity mechanics from durable
state rather than copying protocol commands into the prompt.

## Template-maintenance transfer

Use when a project or downstream context has revealed a problem or improvement
that may belong in the reusable canonical template, or when a reviewed canonical
template fix must be brought back to a project.

For an upstream handoff from Project A to the canonical template, transfer:

- the originating project's observable symptom or need;
- exact useful project evidence and refs;
- why the issue appears reusable, explicitly as interpretation unless already
  established by canonical evidence;
- the reusable outcome the template should provide;
- project-specific constraints that are evidence about the problem, while
  clearly separating them from requirements that should actually become
  template-wide;
- a request for independent verification against the canonical template before
  deciding the reusable fix.

Do not ask the template context to blindly copy or reverse-engineer a
project-specific patch upstream. The canonical template remains responsible for
determining the reusable solution.

When the requested workflow includes returning the canonical fix to the
originating project, state that relationship explicitly. After the canonical
source change is independently reviewed, request the repository's deterministic
change package when appropriate so the reviewed canonical patch can be applied
back to the project's matching branch and then validated/reviewed under that
project's normal workflow.

For a downstream handoff that starts from an already reviewed canonical change
package, identify the package, exact canonical source refs, target project and
matching branch, and any known adaptation risk. Treat patch conflict as an
adaptation decision rather than permission to alter the canonical package
silently.

## Mission checks

Before returning a generated prompt, verify that:

- every requested phase serves the human's actual outcome;
- observations, interpretations, and requested outcome remain distinguishable;
- the prompt contains enough task payload for the chosen mission but not an
  unrelated history dump;
- implementation is not prescribed where the mission is only research/review;
- research or review is not added ceremonially when the requested change is
  already exact-known and directly executable;
- combined missions have a clear dependency order and do not blur which evidence
  proves which phase.
