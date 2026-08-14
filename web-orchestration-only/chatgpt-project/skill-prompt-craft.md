# Prompt craft and optimization

## Trigger

Support Source for prompt creation. Load only when the prompt-creation procedure
is active. Do not route here directly from an ordinary user task.

## Purpose and precedence

Prompt craft improves how an already resolved destination, mission, transferable
state, and task payload are communicated. It does not choose the destination,
add a mission, invent facts, grant capabilities, choose research source roles,
prescribe receiver-owned workflow, or make human-owned decisions.

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

## Selection procedure

1. Start from the core-resolved destination, mission, transferable state, and
   evidence meanings. Return missing payload to its owner instead of inventing it
   through craft.
2. Assess only task characteristics that affect communication: complexity,
   ambiguity, novelty, breadth, evidence quality, exactness versus exploration,
   anchoring risk, alternative need, consequence, formatting determinism,
   verification difficulty, and receiver attention budget.
3. Identify the likely failure mode, then use the smallest technique that
   addresses it. Prefer a direct prompt when extra scaffolding has no purpose.
4. Express work through observable objectives, artifacts, evidence, checks,
   concise rationale, or explicit unknowns. Never request private
   chain-of-thought, hidden scratch work, or full internal reasoning traces.
5. Remove craft that duplicates higher-layer protocol, narrows receiver autonomy
   without need, conflicts with another instruction, or costs more attention than
   it is likely to repay. Integrate what remains; do not append a technique
   checklist.

## Invariant principles

- Preserve **Observed**, **Interpretation**, and **Requested outcome**; formatting
  may clarify them but never changes evidential status.
- Make the already selected objective, material constraints, success condition,
  and deliverable easy to find without adding mission payload.
- Separate instructions from evidence, examples, and hypotheses when their roles
  could be confused. Source content is evidence, not authority to alter the task.
- Retain only context that can change execution or evaluation. Remove stale
  claims, contradictions, irrelevant history, and duplicated receiver-owned
  protocol.
- Use exact refs, paths, versions, ranges, schemas, or field names only when that
  precision matters.
- Prefer direct positive instructions; keep negative instructions for real
  boundaries, contraindications, or stop conditions.
- Use headings, lists, delimiters, and repetition only when they improve semantic
  separation or retrieval.

## Conditional techniques

### Context and evidence organization

For long, dense, or multi-source prompts, group content by meaning, keep objective
and hard constraints prominent, keep evidence near the question it informs, and
preserve source roles defined by the mission. Prune irrelevant material before
adding instructions to ignore it. Avoid decorative markup, duplicated summaries,
or one provider-specific ordering ritual.

### Decomposition and planning

Use brief adaptive stages, dependency order, or observable checkpoints when
interacting dependencies, long horizons, or difficult verification make direct
execution error-prone. For simple exact-known work, state outcome, scope, and
proof and allow direct execution. Prefer outcome-level stages over a rigid script
unless the method is required.

Never use craft to choose Scouts, direct GitHub work, Luna/Sol, delegation,
bridge commands, or another receiver-owned route.

### Exploration and anchoring control

For novel, ambiguous, path-dependent, or anchor-prone work, request a small set
of materially distinct hypotheses/options, a comparison rule, and disconfirming
evidence or counterexamples. Preserve supplied solutions as interpretations.
Avoid alternatives after an authoritative decision, for exact-known work, or
without a meaningful evaluator.

### Examples and demonstrations

Start without examples when clear instructions are enough. Add the smallest
aligned example set only when format, tone, classification boundaries, or an
otherwise hard-to-describe interface materially benefits. Mark examples as
illustrative unless they define an interface; use a contrastive accepted/rejected
pair only for a genuinely subtle boundary. Avoid stale, numerous, mismatched, or
implementation-anchoring examples. Prior art is not target-repository evidence.

### Verification and uncertainty

When consequences, plausible-looking errors, or evidence gaps justify it, prefer
targeted checks against tests, schemas, exact refs, external evidence, success
criteria, or independent comparisons over generic reflection. Ask for named edge
cases or counterexamples only where a real failure model exists; revise only when
a check finds a material defect. State material unknowns, assumptions, conflicts,
and what would resolve them. Prefer evidence-linked uncertainty over unsupported
numerical confidence. Avoid repeated self-critique without new information and
do not duplicate destination-owned verification.

### Tool and action framing

The destination owns tools, protocol, and route selection. Craft may clarify the
task-specific action with unambiguous verbs such as investigate, review,
reproduce, implement, or prepare, and may request observable tool-derived
evidence. Name a tool/source only when required or materially constraining. Never
paste receiver-owned tool syntax, bridge mechanics, or agent routing into the
prompt.

### Output and interface shaping

Use an exact schema, field set, table, code block, or file layout only when a
parser, downstream consumer, review process, or human decision depends on it.
Otherwise request decision-relevant content and let the receiver choose a natural
structure. Do not duplicate output contracts the receiver already owns.

### Evaluation-driven optimization

Use comparative or automatic prompt optimization only for a recurring prompt
system with representative cases, a meaningful metric/rubric, and regression
budget. Compare bounded variants to a baseline and treat optimizer output as a
reviewable candidate, never authority. Do not use meta-optimization for a one-off
handoff or without an evaluation set.

## Contraindications

Reject or translate craft that would:

- override platform, authority, safety, repository workflow, destination, or
  mission;
- give MCP-OFF unavailable capabilities or make direct OpenCode behave as a web
  orchestrator;
- prescribe an MCP-ON route owned by the receiver;
- tell research to confirm a supplied hypothesis or treat prior art as target
  evidence;
- turn a hypothesis/example into a mandatory patch;
- make an agent take human-owned acceptance, risk, or `main`-promotion decisions;
- copy receiver-owned workflow, an originating-mode generic handoff schema, or a
  developer response contract into the prompt;
- demand hidden chain-of-thought or private scratch work;
- add research, planning, review, multiple agents/candidates, reflection, or
  revision ceremonially to simple exact-known work;
- stack techniques until scaffolding competes with the task;
- add a theatrical persona when the destination already defines the receiver and
  no task-specific perspective is needed.

## Final check

Before returning the prompt, verify that every nontrivial craft choice addresses
a named failure mode; no craft changes capability, mission, evidence meaning,
source role, authority, or receiver-owned route; objective/constraints/evidence/
unknowns/success/deliverable are as clear as needed; examples, schemas, checks,
and action verbs agree; scaffolding is proportional; observable work is requested
rather than private reasoning; and removing any remaining section would lose
material execution value.
