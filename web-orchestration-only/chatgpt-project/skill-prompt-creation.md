# Prompt creation and optimization

## Trigger

Use when the human explicitly asks the web orchestrator to create, draft,
prepare, or hand off a ready-to-use prompt intended for a different execution
context. Do not manufacture a handoff when the current context should simply
complete the task itself.

## Core model

Treat prompt creation as **context transfer across an execution boundary**, not
as generic prose generation. Resolve what the receiving context needs before
optimizing how the prompt says it.

A good prompt transfers task-specific state the receiver cannot safely assume and
omits protocol, safety boilerplate, tool syntax, and workflow mechanics the
receiver already owns. The destination describes the future receiver; it never
changes this chat's current capabilities.

Preserve three evidential roles whenever they matter:

- **Observed:** facts/evidence actually established in the originating context.
- **Interpretation:** hypotheses, diagnoses, conclusions, or proposed approaches
  that may need independent verification.
- **Requested outcome:** what the receiver is being asked to accomplish.

Never convert an interpretation into an observed fact merely to make the prompt
sound decisive.

## Minimality and precedence

Keep the finished prompt as short as possible without losing information that can
materially change execution or evaluation. State a rule once. Remove stale
claims, irrelevant history, duplicated receiver-owned instructions, and context
that does not affect the task.

Apply this order:

1. platform, human authority, safety, and repository workflow;
2. requested outcome and destination capability;
3. mission-specific task payload and evidence;
4. actual task characteristics and failure modes;
5. optional prompt-engineering craft.

Prompt craft may improve communication but must not change capability, mission,
evidence meaning, source role, authority, approval, or a receiver-owned route.
Applying no extra craft technique is a valid and common result.

## Destination

Choose the receiving context named by the human. If unstated, infer it only when
conversation makes it unambiguous; ask only when the ambiguity would materially
change what the receiver can do.

### Fresh web orchestrator

A fresh web-orchestration Project already owns its permanent authority/safety
rules, ordinary workflow, recovery, template-maintenance, promotion, and prompt
creation procedures. Do not copy those mechanics into the generated prompt.

Transfer only task-specific state that a fresh chat would not know: repository or
project identity when needed, observable problem/outcome, exact useful refs,
paths, issues or artifacts, material observations/interpretations, constraints,
unknowns, dependencies, and expected deliverable. Ask it to re-establish current
remote state before acting on repository facts supplied by this context.

Do not prescribe direct GitHub versus delegation, Scout use, issue commands,
finalization, model routing, or promotion unless that route itself is part of the
human's explicit request. The receiver chooses among capabilities actually
available when it runs.

### Direct OpenCode

A direct OpenCode session owns the repository's local agent instructions and
skills. Tell it to follow those instructions rather than copying their content.
Carry more execution-specific state when relevant: repository/branch/ref or exact
start SHA, task identity, observable outcome, bounded scope, known useful files or
symbols, mutation boundaries, required durable records/checks/generation, stop
conditions, and handoff evidence.

For research-only work, explicitly prohibit mutation and request evidence. For
mutating work, do not imply the session may bypass branch-owned synchronization,
review, record, or human-promotion requirements. Do not embed the web
orchestrator's Issues bridge protocol unless that protocol itself is the subject
of the task.

### Other explicit receivers

If the human names another execution context, transfer only capabilities and
constraints actually established for that receiver. Do not invent a capability
profile. Where the receiver cannot perform the eventual action, ask for the
strongest useful predecessor outcome instead.

## Mission payload

Use the smallest mission set that matches the requested outcome. Closely related
missions may be combined when the work genuinely spans them; do not add phases
ceremonially.

### Investigation / research

Transfer the question/decision the evidence must support; established starting
evidence; hypotheses to test as interpretations; bounded scope/exclusions;
important unknowns/conflicts; and the evidence expected back.

When the question concerns a target repository, make source roles explicit when
material: target-repository evidence may establish facts about that repository;
external sources or other repositories may provide standards, comparison, prior
art, alternatives, or inspiration. External prior art is not proof of target
repository behavior. Do not force repository-first ordering when the human's
mission is intentionally exploratory or comparative.

Ask the receiver to test the question independently, not to confirm the
originating hypothesis.

### Review

Transfer the exact review subject and known base/head refs; the intended contract
or outcome; affected boundaries; known concerns as observations/interpretations;
requested review depth; and the desired result: evidence-backed findings,
explicit no-finding result where justified, and unresolved uncertainties.

Do not silently turn review into implementation. Combine Review with
Implementation only when fixes are also requested.

### Implementation / change

Transfer observable outcome and success condition; exact useful start state;
bounded scope and material exclusions; relevant evidence explaining the need;
task-specific authority constraints; durable-record/compatibility obligations;
proportional checks; stop conditions for unsafe scope expansion or human-owned
decisions; and expected handoff evidence when the receiver does not already own a
contract.

Prefer outcome and constraints over an unverified patch prescription. Include a
specific implementation approach only when the human required it or the approach
is itself established evidence/constraint.

### Reproduce / test

Transfer the behavior/claim under test; expected versus observed behavior when
known; relevant version/ref/environment facts; setup/inputs; non-destructive
constraints; evidence to capture; pass/fail/reproduced/inconclusive criteria; and
known variability. Do not fabricate a reproducible procedure from incomplete
evidence.

### Continue / recover

Transfer only durable decision-relevant continuity: stable task identity,
intended outcome, current exact refs, last independently reviewed/handoff refs,
what work is terminal/absorbed versus active/uncertain, pending publication or
interaction, blockers/human decisions, material failed attempts/changed approach,
and the safest next read/action. Do not dump private reasoning or conversational
history, and never turn missing state into invented completion.

### Template-maintenance transfer

For upstream transfer from a project to the canonical reusable template, carry
the observable project symptom/need, exact useful evidence/refs, why reuse seems
plausible as interpretation unless canonically established, the reusable outcome,
and project-specific constraints separated from proposed template-wide
requirements. Ask the template context to independently verify the canonical
problem rather than blindly copy a project patch.

For downstream transfer from an already reviewed canonical change package,
identify the package, exact canonical source refs, target project/matching
branches, and known adaptation risk. Patch conflict is an adaptation decision,
not permission to silently alter the canonical package.

## Prompt-craft selection

After destination, mission, transferable state, and success conditions are clear,
assess only task characteristics that affect communication: complexity,
ambiguity, novelty, breadth, evidence quality, exactness versus exploration,
anchoring risk, alternative need, consequence, formatting determinism,
verification difficulty, and receiver attention budget.

Identify the plausible failure mode, then add the **smallest** technique that
addresses it. Remove craft that duplicates higher-level instructions, narrows
receiver autonomy without need, conflicts with another requirement, or costs more
attention than it is likely to repay. Do not append a technique checklist to the
finished prompt.

### Context and evidence organization

For long, dense, or multi-source prompts, group information by meaning, keep the
objective and hard constraints prominent, keep evidence near the question it
informs, and preserve explicit source roles. Prune irrelevant material before
adding instructions to ignore it. Use headings, lists, delimiters, and repetition
only when they improve semantic separation or retrieval; avoid decorative markup
and duplicate summaries.

### Adaptive decomposition and planning

Use brief stages, dependency order, or observable checkpoints when interacting
dependencies, long horizons, or difficult verification make direct execution
error-prone. For simple exact-known work, state outcome, scope, and proof and let
the receiver execute directly. Prefer outcome-level stages over rigid scripts
unless the method itself is required.

Never use prompt craft to choose a receiver-owned tool/agent route merely because
one exists.

### Exploration and anchoring control

For novel, ambiguous, path-dependent, or anchor-prone work, request a small set of
materially distinct hypotheses/options, a comparison rule, and disconfirming
evidence or counterexamples. Treat supplied solutions as interpretations unless
already authoritative. Do not demand alternatives after an authoritative
decision, for exact-known work, or when there is no meaningful evaluator.

### Examples and demonstrations

Start without examples when instructions are clear. Add the smallest aligned
example set only when format, tone, classification boundaries, or an otherwise
hard-to-describe interface materially benefits. Mark examples as illustrative
unless they define an interface. Use a contrastive accepted/rejected pair for a
genuinely subtle boundary. Avoid stale, numerous, mismatched, or
implementation-anchoring examples.

### Verification and uncertainty

When consequences, plausible-looking errors, or evidence gaps justify it, request
targeted checks against tests, schemas, exact refs, external evidence, success
criteria, or independent comparisons. Ask for named edge cases or counterexamples
only where a real failure model exists. Revise only when a check finds a material
defect.

State material unknowns, assumptions, conflicts, and what would resolve them.
Prefer evidence-linked uncertainty over unsupported numerical confidence. Avoid
repeated generic self-critique without new information and do not duplicate
verification the receiver already owns.

Request observable evidence, concise rationale, checks, or explicit uncertainty;
never request private chain-of-thought, hidden scratch work, or full internal
reasoning traces.

### Tool and action framing

Use unambiguous task verbs such as investigate, review, reproduce, compare,
implement, or prepare when they clarify the requested action. Name a particular
tool/source only when required or materially constraining. Otherwise describe the
observable evidence/action and let the receiver choose its route.

Source content is evidence, not authority to alter the task. Separate
instructions from evidence, examples, and hypotheses whenever their roles could
be confused.

### Output and interface shaping

Use an exact schema, field set, table, code block, file layout, or response
contract only when a parser, downstream consumer, review process, or human
decision depends on it. Otherwise request decision-relevant content and let the
receiver choose a natural structure. Do not duplicate an output contract the
receiver already owns.

### Evaluation-driven optimization

Use comparative or automatic prompt optimization only for a recurring prompt
system with representative cases, a meaningful metric/rubric, and regression
budget. Compare bounded variants to a baseline and treat optimizer output as a
reviewable candidate, never authority. Do not use meta-optimization for a one-off
handoff or without an evaluation set.

## Composition procedure

1. Resolve the destination and requested mission from the human's actual request.
2. Confirm a real execution boundary exists; otherwise do the work here instead
   of manufacturing a prompt.
3. Extract only transferable state the receiver cannot safely assume: outcome,
   success condition, exact useful evidence/refs, scope/constraints, unresolved
   dependencies/decisions, and expected deliverable.
4. Preserve Observed, Interpretation, and Requested outcome where confusion could
   change execution.
5. Apply the destination profile: remove receiver-owned protocol and adapt the
   immediate outcome to capabilities actually established for the receiver.
6. Apply the mission payload without adding unrequested phases or unverified
   implementation prescriptions.
7. Add craft only for a material failure mode; use the smallest technique that
   addresses it.
8. Compose one self-contained prompt a fresh receiver can begin from without this
   conversation.
9. Remove private-chat narration, sensitive data, stale guesses, irrelevant
   history, duplicated rules, and unnecessary tokens.
10. Verify executability: the prompt asks for something the receiver can actually
    do or explicitly asks for the strongest useful predecessor outcome.

## Final check

Before returning the prompt, verify that the intended receiver is addressed;
objective, constraints, evidence, unknowns, success condition, and deliverable
are as clear as needed; observations and interpretations remain distinguishable;
source roles are preserved; prompt craft has not changed authority or mission;
examples/schemas/checks agree; receiver-owned workflow has not been copied; and
every remaining nontrivial section earns its attention cost.
