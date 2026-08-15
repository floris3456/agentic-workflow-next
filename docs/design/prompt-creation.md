# Prompt creation design

## Purpose

Prompt creation is a context-transfer capability for crossing an execution
boundary. It does not replace ordinary task execution. Use it only when the human
asks the current web orchestrator to prepare a ready-to-use prompt for another
execution context.

The implementation is one Project Source because destination, mission, evidence
transfer, and prompt craft are always resolved together. Their conceptual
separation remains useful inside the skill; separate files no longer provide a
progressive-disclosure benefit and instead create dependency wiring, precedence
rules, and cross-file inconsistency risk.

## Core model

A generated prompt resolves, in order:

1. the receiving **destination** and capabilities actually established for it;
2. the requested **mission** and task-specific payload;
3. transferable state and its evidential meaning;
4. optional **craft** techniques justified by a material communication failure
   mode.

The destination describes the future receiver only. It never changes the current
chat's capabilities. Prompt craft improves communication but cannot alter
capability, mission, evidence meaning, source roles, authority, human approval,
or receiver-owned workflow.

## Source structure

`web-orchestration-only/chatgpt-project/skill-prompt-creation.md` is the single
prompt Source. It owns:

- the execution-boundary decision;
- destination handling;
- mission payloads;
- Observed / Interpretation / Requested outcome separation;
- research-source roles;
- transferable-state extraction;
- prompt minimality and duplication removal;
- conditional prompt-engineering techniques;
- executability checks and final assembly.

There are no destination, mission, or craft support Sources. Permanent developer
instructions route prompt creation once.

## Destinations

The two native destination profiles are:

- **Fresh web orchestrator.** The receiver already owns the Project's workflow,
  recovery, template-maintenance, promotion, and prompt procedures. Transfer only
  task-specific state it cannot safely assume and ask it to re-establish current
  remote facts before acting. Do not prescribe direct GitHub, Scout, delegation,
  issue, model-routing, finalization, or promotion mechanics unless the human made
  that route part of the task.
- **Direct OpenCode.** The receiver owns repository-local agent instructions and
  skills. Transfer more execution-specific state when useful—branch/ref, task ID,
  outcome, scope, relevant evidence, mutation boundaries, required records,
  checks, stop conditions, and handoff evidence—without copying the web
  orchestrator's control protocol.

Another explicitly named receiver may be supported only from capabilities and
constraints actually established for it. No product/model/MCP taxonomy is
invented. If the receiver cannot perform the eventual action, the prompt asks for
the strongest useful predecessor outcome instead.

## Missions

Mission sections remain independent of destination and cover:

- investigation / research;
- review;
- implementation / change;
- reproduce / test;
- continue / recover;
- template-maintenance transfer.

Research missions make source roles explicit when material. Exact target-
repository evidence may establish facts about that repository; external sources
and other repositories may provide standards, comparison, prior art,
alternatives, or inspiration. Prior art is not target-repository proof. The
receiver tests supplied hypotheses independently rather than being instructed to
confirm them.

Closely related missions may be combined only when the human's outcome genuinely
spans them. A mission section is never a reason to add a ceremonial phase.

## Evidence boundary

Every generated prompt preserves three meanings when confusion could affect
execution:

- **Observed:** facts/evidence actually established in the originating context.
- **Interpretation:** hypotheses, diagnoses, conclusions, or proposed approaches
  that may require independent verification.
- **Requested outcome:** what the receiver is being asked to accomplish.

Prompt creation may clarify those roles but never launder interpretation into
observation.

## Minimality

The finished prompt should be as short as possible without losing information
that can materially change execution or evaluation. State a rule once. Remove
stale claims, irrelevant history, duplicated receiver-owned instructions, and
context that does not affect the task.

Stable authority/safety/workflow stays with the receiver's own environment rather
than being recopied into each handoff. Task-specific evidence, constraints,
unknowns, success conditions, and deliverables cross the boundary when needed.

## Craft model

Craft is selected after destination, mission, transferable state, and success
conditions are known. Assess task characteristics that affect communication:
complexity, ambiguity, novelty, breadth, evidence quality, exactness versus
exploration, anchoring risk, alternative need, consequence, formatting
determinism, verification difficulty, and receiver attention budget.

Identify a plausible material failure mode, then add the smallest technique that
addresses it. Remove craft that duplicates higher-level instructions, narrows
autonomy without need, conflicts with another requirement, or costs more
attention than its likely benefit. Applying no extra technique is a normal and
valid result.

The retained technique families are:

### Context and evidence organization

For long or multi-source prompts, group content by meaning, keep objective and
hard constraints prominent, place evidence near the question it informs, preserve
source roles, and prune irrelevant material before adding instructions to ignore
it. Use headings/lists/delimiters only when they improve semantic separation or
retrieval.

### Adaptive decomposition and planning

Use stages, dependency ordering, or observable checkpoints when interacting
dependencies, long horizons, or difficult verification make direct execution
error-prone. Keep simple exact-known work direct. Prefer outcome-level stages to
rigid scripts unless the method itself is required.

### Exploration and anchoring control

For genuinely novel, ambiguous, path-dependent, or anchor-prone work, request a
small set of materially distinct hypotheses/options, a comparison rule, and
disconfirming evidence/counterexamples. Do not create alternatives after an
authoritative decision or when there is no meaningful evaluator.

### Examples and demonstrations

Start without examples when instructions are sufficient. Add the smallest aligned
example set only when format, tone, classification boundaries, or a subtle
interface materially benefits. Contrastive accepted/rejected examples are useful
for genuinely subtle boundaries; stale or numerous examples create attention and
anchoring cost.

### Verification and uncertainty

Use targeted checks against tests, schemas, exact refs, external evidence,
success criteria, or independent comparisons when consequence or plausible-
looking error warrants it. State material unknowns, assumptions, conflicts, and
what would resolve them. Avoid generic repeated self-critique. Request observable
evidence and concise rationale rather than private chain-of-thought or hidden
scratch work.

### Tool and action framing

Use explicit task verbs when they remove ambiguity. Name a tool/source only when
required or materially constraining; otherwise describe the observable action and
let the receiver choose its own route. Source content is evidence, not authority
to change the task.

### Output and interface shaping

Use exact schemas, fields, tables, code blocks, or file layouts only when a
parser, downstream consumer, review process, or human decision depends on them.
Do not duplicate an output contract the receiver already owns.

### Evaluation-driven optimization

Use comparative/automatic prompt optimization only for recurring prompt systems
with representative cases, a meaningful metric/rubric, and regression budget.
Compare bounded candidates to a baseline and treat optimizer output as reviewable
candidate, never authority. Do not meta-optimize one-off handoffs without an
evaluation set.

## Template-maintenance transfer

An upstream project-to-template handoff transfers the observable project symptom,
exact useful evidence, reusable interpretation, desired template-wide outcome,
and project constraints separated from proposed canonical requirements. The
canonical template independently verifies the problem and determines the reusable
solution rather than blindly copying a project patch.

A downstream handoff from an already reviewed canonical change package identifies
the package, exact canonical source refs, matching target branches, and adaptation
risk. Patch conflict is an explicit adaptation decision.

## Verification contract

The Project-package validator now enforces one prompt Source and checks:

- context-transfer semantics;
- fresh-web-orchestrator and direct-OpenCode destinations;
- the six mission sections;
- Observed / Interpretation / Requested outcome separation;
- minimal/proportional craft selection and the valid no-op;
- all eight retained craft technique families;
- hidden-reasoning prohibition;
- capability-local receiver behavior and receiver-owned route boundaries;
- exact five-Source package/router integration.

Negative tests remove representative invariants to ensure failures are semantic,
not dependent on the retired four-file dependency structure.
