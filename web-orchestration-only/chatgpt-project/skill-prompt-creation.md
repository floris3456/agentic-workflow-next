# Prompt creation

## Trigger

Use when the human asks for a ready-to-use prompt for a different execution
context. Do not manufacture a handoff when the current context should simply do
the work itself.

## Core contract

Treat prompt creation as context transfer across an execution boundary. Transfer
only task-specific state the receiver cannot safely assume; do not copy safety,
workflow, tool syntax, or protocol the receiver already owns.

Preserve these roles when confusion would affect execution:

- **Observed:** facts/evidence actually established here.
- **Interpretation:** hypotheses, diagnoses, conclusions, or proposed approaches that may need verification.
- **Requested outcome:** what the receiver is being asked to accomplish.

Never turn interpretation into observed fact to make a prompt sound decisive.
Keep the prompt as short as possible without losing information that could
materially change execution or evaluation.

Describe only capabilities actually established for the receiver. Ask for
observable evidence, concise rationale, checks, or uncertainty when useful;
never ask for private chain-of-thought or hidden scratch work.

## Destination
### Fresh web orchestrator

A fresh web-orchestration Project already owns its permanent rules and routed
Sources. Do not copy them. Transfer only task-specific state: repository/project
identity when needed, requested outcome, exact useful refs/paths/artifacts,
material evidence and interpretations, constraints, unknowns, dependencies, and
deliverable. Ask it to re-establish current remote state before acting on supplied
repository facts.

Do not prescribe direct/Small/Heavy/Dual routing, recovery mechanics, or
promotion unless that choice is itself part of the human's explicit request.

### Direct OpenCode

A direct OpenCode session owns the repository's local `AGENTS.md`, agent body,
skills, permissions, and developer procedure. Tell it to follow them rather than
copying their contents.

Transfer the exact useful execution state: branch/ref or start SHA, task outcome,
bounded scope, known useful files/symbols, material constraints, required durable
truth/checks, stop conditions, and expected evidence when needed. For research-
only work, explicitly prohibit mutation.

### Other receiver

Use only capabilities and constraints actually established for the named
receiver. If it cannot perform the final action, ask for the strongest useful
predecessor result instead of inventing capability.

## Mission payload
### Investigation / research

Transfer the question or decision the evidence must support, useful starting
evidence, hypotheses as interpretations, bounded scope/exclusions, important
unknowns/conflicts, and the evidence expected back. Distinguish target-repository
evidence from external standards/prior art; outside examples do not prove target
behavior. Ask the receiver to test the question, not confirm a hypothesis.

### Review

Transfer the exact review subject and useful refs, intended contract/outcome,
affected boundaries, known concerns, desired review depth, and expected evidence-
backed findings or explicit no-finding result. Do not turn review into
implementation unless fixes were also requested.

### Implementation / change

Transfer the observable outcome and success condition, exact useful start state,
bounded scope/exclusions, relevant evidence, hard constraints, durable-record or
compatibility obligations, proportional checks, and genuine stop conditions.
Prefer outcome and constraints over an unverified patch prescription.

### Reproduce / test

Transfer the claim or behavior under test, expected versus observed behavior when
known, relevant version/ref/environment facts, setup/inputs, non-destructive
constraints, evidence to capture, and pass/fail/reproduced/inconclusive criteria.
Do not invent reproducibility details that were never established.
### Continue / recover

Transfer only durable decision-relevant continuity: task identity/outcome, exact
current refs, last independently reviewed state, what is terminal versus
active/uncertain, pending publication or interaction, blockers/human decisions,
material failed attempts or changed approach, and the safest next read/action.
Do not dump conversation history or turn missing state into invented completion.

### Template-maintenance transfer

For upstream transfer, carry the observable project symptom/need, exact useful
evidence/refs, reusable outcome, and project-specific constraints separated from
proposed template-wide requirements. Ask the template context to verify the
canonical problem rather than blindly copying a project patch.

For downstream transfer from a reviewed canonical package, identify the package,
exact canonical source refs, target project/branches, and known adaptation risk.
Patch conflict is an adaptation decision, not permission to silently alter the
canonical package.

## Prompt craft

Add craft only for a material communication failure mode:

- organize long context by meaning when retrieval would otherwise be difficult;
- add stages/checkpoints only when dependencies make direct execution error-prone;
- request alternatives or disconfirming evidence only when ambiguity or anchoring is real;
- add examples or an exact schema only when format/interface correctness depends on them;
- request targeted verification when consequences or evidence gaps justify it.

If none applies, add no extra prompt craft. Never use craft to choose a receiver-
owned tool/agent route or to add ceremonial phases.
## Composition

1. Resolve the receiver and requested mission.
2. Confirm a real execution boundary exists; otherwise do the work here.
3. Extract only transferable state the receiver cannot safely assume.
4. Preserve Observed, Interpretation, and Requested outcome where material.
5. Apply the destination and mission profile without copying receiver-owned workflow.
6. Add only craft that solves a real communication problem.
7. Remove stale guesses, private-chat narration, irrelevant history, duplicated rules, and unnecessary tokens.

Before returning, verify that the prompt is executable by the intended receiver,
contains the material objective/constraints/evidence/unknowns/deliverable, keeps
source and evidence roles honest, and contains no section that does not earn its
attention cost.
