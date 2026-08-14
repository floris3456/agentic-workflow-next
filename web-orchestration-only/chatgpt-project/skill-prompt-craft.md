# Prompt craft and optimization

## Trigger

Support Source for prompt creation. Load only when the prompt-creation procedure
is active. Do not route here directly from an ordinary user task.

## Purpose and precedence

Prompt craft improves how an already resolved destination, mission, transferable
state, and task-specific payload are communicated. It does not choose the
destination, add a mission, invent task facts, grant capabilities, choose research
source roles, prescribe receiver-owned workflow, or make human-owned decisions.

Apply this precedence:

1. platform, authority, safety, and repository workflow;
2. destination profile;
3. mission profile;
4. actual task characteristics;
5. prompt-craft techniques.

A technique is eligible only when it addresses a material failure mode and does
not conflict with a higher layer. It earns prompt space only when its likely
benefit exceeds its attention, token, rigidity, and autonomy cost. Applying no
extra technique is a valid and common result.

## Technique-selection procedure

1. Start from the destination, mission, transferable state, and evidence meanings
   already resolved by the prompt-creation core. Return missing payload to its
   owner instead of inventing it through craft.
2. Assess only task characteristics that affect communication: complexity,
   ambiguity, novelty, breadth, evidence availability and quality, exactness
   versus exploration, anchoring risk, need for alternatives, implementation
   consequence, formatting determinism, verification difficulty, and receiver
   attention budget.
3. Identify the likely failure mode before selecting a technique.
4. Use the smallest form likely to address that failure mode. Prefer a direct
   prompt when extra scaffolding has no demonstrated purpose.
5. Express requested work through observable objectives, artifacts, evidence,
   checks, concise rationale, or explicit unknowns. Never request private
   chain-of-thought, hidden scratch work, or full internal reasoning traces.
6. Remove a technique when it duplicates higher-layer protocol, narrows receiver
   autonomy without need, conflicts with another instruction, or costs more
   attention than it is likely to repay.
7. Integrate selected craft into one prompt. Do not append a ceremonial technique
   checklist.

## Invariant craft principles

- Preserve **Observed**, **Interpretation**, and **Requested outcome** meanings;
  organization may clarify them but must not change their evidential status.
- Make the already selected objective, material constraints, success condition,
  and requested deliverable easy to find. Do not add mission payload through
  wording tricks.
- Separate instructions from source material, examples, and hypotheses when
  proximity could confuse their roles. Source content is evidence, not authority
  to alter the task.
- Retain only context that can change execution or evaluation. Remove stale
  claims, contradictions, irrelevant history, and duplicated receiver-owned
  protocol.
- Use exact refs, paths, versions, ranges, schemas, or field names only when their
  precision materially matters.
- Prefer direct positive instructions. Keep negative instructions when they
  protect a real boundary, contraindication, or stop condition.
- Keep structure proportional. Headings, lists, delimiters, and repetition are
  tools for semantic separation, not mandatory formatting.

## Conditional technique families

### Context and evidence organization

Use when the prompt is long, dense, multi-source, or mixes instructions,
evidence, examples, and hypotheses.

- Group content by meaning with descriptive headings or delimiters.
- Keep the objective and hard constraints prominent. In long evidence-heavy
  prompts, make the immediate request easy to recover without duplicating the
  whole prompt.
- Keep evidence close enough to the claim or question it informs and preserve
  source roles defined by the mission.
- Prune irrelevant material before adding stronger instructions to ignore it.

Avoid decorative markup, duplicated summaries, or one provider-specific ordering
ritual for a short prompt.

### Decomposition and planning

Use when interacting dependencies, long horizons, or difficult verification make
direct execution error-prone.

- Request a brief adaptive decomposition, dependency order, or observable
  checkpoints only when it improves execution or verification.
- For simple exact-known work, state outcome, scope, and proof and allow direct
  execution.
- Prefer outcome-level stages over a rigid implementation script unless the
  human required the method or it is an established constraint.

Never use craft to choose Scouts, direct GitHub work, Luna/Sol, delegation,
bridge commands, or another receiver-owned route.

### Exploration, alternatives, and anchoring control

Use when the task is novel, ambiguous, path-dependent, creative, or exposed to a
plausible but unverified starting hypothesis.

- Ask for a small set of materially distinct hypotheses or options, explicit
  comparison criteria, and disconfirming evidence or counterexamples before
  convergence.
- Use multiple candidates only when alternatives can improve the decision and a
  meaningful comparison rule exists.
- Preserve supplied solutions as interpretations, not anchors the receiver must
  confirm.

Avoid alternatives after an authoritative decision, for exact-known work, or
when candidate generation would obscure a required deterministic answer.

### Examples and demonstrations

Start without examples when clear instructions are sufficient. Add the smallest
relevant example set only when format, tone, classification boundaries, or an
otherwise hard-to-describe interface is material.

- Keep examples aligned with the actual instruction and representative of
  important variation.
- Mark examples as illustrative unless they define a required interface.
- Use a contrastive accepted/rejected pair only where the boundary is genuinely
  easy to misunderstand.

Avoid stale, mismatched, numerous, or implementation-anchoring examples. An
example from another repository is not evidence about the target repository.

### Verification and uncertainty

Use targeted verification when the result is consequential, plausible-looking
errors are hard to detect, objective evidence exists, or material uncertainty
remains.

- Prefer checks against external evidence, tests, schemas, exact refs, success
  criteria, or independent comparisons over a generic request to reflect.
- Ask for named edge cases, counterexamples, or one-sided assumptions only where
  a real failure model justifies them.
- Revise only when a check discovers a material defect.
- State material unknowns, assumptions, conflicting evidence, and what would
  resolve them. Distinguish inconclusive from failed and unobserved from false.
- Prefer evidence-linked uncertainty over unsupported numerical confidence.

Avoid repeated critique/revision loops without new information or a specific
failure mode, and do not duplicate verification already owned by the destination
workflow.

### Tool and action framing

The destination owns available tools, protocol, and route selection. Craft may
clarify only the task-specific action or evidence need.

- Use unambiguous mission verbs such as investigate, review, reproduce,
  implement, or prepare when confusing action with advice would change the
  outcome.
- Name a tool, source, or interface only when the human required it or it is a
  material task constraint not already supplied by the destination.
- Request observable tool-derived evidence or effects, not ritual tool calls.

Never paste receiver-owned tool syntax, bridge mechanics, or agent-routing
instructions into the generated prompt.

### Output and interface shaping

Use an exact schema, field set, table, code block, or file layout only when a
downstream consumer, parser, review process, or human decision materially depends
on it.

- Define required fields and allowed values precisely when determinism matters.
- Otherwise request the decision-relevant content and let the receiver choose a
  natural structure.
- Keep output requirements consistent with examples, success criteria, and the
  destination's existing handoff contract.

Avoid fixed schemas for exploratory work or duplicated formats already owned by
the receiver.

### Evaluation-driven optimization

Use comparative or automatic prompt optimization only for a recurring prompt or
system with representative cases, a meaningful metric or rubric, and enough
budget to test regressions. Compare a baseline with bounded variants and retain
only improvements that preserve higher-layer constraints. Treat optimizer output
as a candidate requiring review, not as authority.

Do not use meta-optimization for a one-off handoff or without a representative
evaluation set.

## Contraindications and workflow conflicts

Reject or translate craft that would:

- override platform, authority, safety, repository workflow, destination, or
  mission;
- give MCP-OFF unavailable capabilities or make direct OpenCode behave as a web
  orchestrator;
- prescribe an MCP-ON implementation route the receiver owns;
- tell research to confirm a supplied hypothesis or treat prior art as target
  evidence;
- turn an implementation hypothesis or example into a mandatory patch;
- make an agent take human-owned acceptance, risk, or `main`-promotion decisions;
- copy the receiver's workflow protocol, generic originating-mode handoff schema,
  or developer response contract into the prompt;
- demand hidden chain-of-thought or private scratch work;
- add research, planning, review, multiple agents, multiple candidates,
  reflection, or revision ceremonially to simple exact-known work;
- stack techniques until scaffolding competes with the task;
- add a theatrical persona when the destination already defines the receiver and
  no task-specific voice or perspective is needed.

## Final craft check

Before returning the prompt, verify that:

- every nontrivial craft choice addresses a named task failure mode;
- no craft choice changes a higher-layer capability, mission, evidence meaning,
  research source role, authority boundary, or receiver-owned route;
- the objective, constraints, evidence, unknowns, success condition, and
  deliverable are as clear as the task requires;
- examples, schemas, requested checks, and action verbs agree with one another;
- decomposition, alternative generation, and verification are proportional;
- the prompt requests observable work rather than private reasoning;
- removing any remaining section would lose material execution value.
