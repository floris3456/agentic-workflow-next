# Prompt creation design

## Purpose

Prompt creation is a context-transfer capability for crossing an execution
boundary. It does not replace ordinary task execution. Use it when the human asks
the current web orchestrator to prepare a ready-to-use prompt for a different
execution context.

The architecture separates two orthogonal content dimensions:

- **Destination:** where the prompt will execute.
- **Mission:** what the receiving context must accomplish.

Prompt craft is a downstream optimizer, not a third content dimension. It may
improve wording, information organization, task scaffolding, examples,
verification framing, or output shaping only after destination, mission,
transferable state, and evidence meanings are resolved.

## Source structure

The ChatGPT Project package contains four prompt-related Sources:

1. `skill-prompt-creation.md` is the only user-facing routed Source. It owns the
   boundary decision, destination-plus-mission composition, transferable-state
   extraction, evidence separation, handoff-format precedence, duplication/leak
   checks, executability check, craft application, and final prompt assembly.
2. `skill-prompt-destinations.md` is a support Source loaded only by the core. It
   defines receiver capabilities, receiver-owned protocol, information that must
   cross the boundary, and information that would be redundant or impossible for
   each destination.
3. `skill-prompt-missions.md` is a support Source loaded only by the core. It
   defines the task payload needed for investigation/research, review,
   implementation/change, reproduce/test, continue/recover, and
   template-maintenance transfer missions, including research-source roles when
   material.
4. `skill-prompt-craft.md` is a support Source loaded only by the core. It selects
   the smallest communication/scaffolding techniques that address a material
   task failure mode without changing destination, mission, evidence, authority,
   or receiver-owned workflow.

The permanent Project router exposes one cross-mode prompt-creation trigger, not
separate trigger rows for support files. The support-trigger paragraph states
semantically that destination, mission, and craft load with prompt creation,
while exact support filenames remain canonical in the core Source.

## Prompt-handoff precedence

A concrete MCP-OFF design exercise exposed an ambiguity: the MCP-OFF workflow's
generic future-task format and the prompt system's destination-aware anti-
duplication rule were individually valid, yet a generated MCP-ON handoff still
copied receiver-owned procedure and the developer-response schema.

The corrected rule is explicit at both decision points:

- when the human asks for a prompt to another execution context,
  `skill-prompt-creation.md` owns the final handoff shape;
- mode-specific workflows still supply capability, evidence, safety, authority,
  and public-safety limits, but their generic handoff schemas, developer response
  contracts, issue/Scout/delegation mechanics, and other receiver-owned procedure
  are not copied unless the human explicitly asks for them;
- the MCP-OFF future-task step states the same exception locally rather than
  requiring the model to reconcile scattered Sources by inference.

This resolves a format conflict without weakening MCP-OFF capability limits or
the destination profile's receiver-knowledge contract.

## Destinations

The destination set is:

- a fresh MCP-ON web-orchestration chat;
- a fresh MCP-OFF web-orchestration chat;
- a direct OpenCode session visible to the local adapter/operator.

The destination describes the future receiver only. It never changes the current
chat's effective mode or capabilities. An MCP-OFF chat can prepare an MCP-ON
prompt without gaining MCP-ON execution rights.

Destination profiles omit protocol the receiver already owns. An MCP-ON handoff
normally transfers task-specific outcome, evidence, constraints, dependencies,
and any material prior interpretation rather than bridge envelopes, Scout
mechanics, Luna/Sol routing, finalization procedure, promotion rules, or generic
developer-task response formatting already supplied by the receiving Project.

A direct OpenCode prompt carries more execution-specific task state when useful
because the receiver is no longer the web orchestration layer. It still points to
repository-owned local instructions rather than copying them into every prompt.

## Missions

Mission profiles are independent of destination. The initial set covers:

- investigation / research;
- review;
- implementation / change;
- reproduce / test;
- continue / recover;
- template-maintenance transfer.

Research missions can state whether target-repository evidence should ground the
investigation before external research and whether other repositories should be
studied for comparison or inspiration. External prior art can suggest an
approach or hypothesis but is never evidence about the target repository.

Closely related missions may be combined only when the human's requested outcome
genuinely spans them. The existence of a profile is never a reason to add a
ceremonial phase.

## Craft model

Craft follows this precedence:

1. platform, authority, safety, and repository workflow;
2. destination;
3. mission;
4. actual task characteristics;
5. craft techniques.

The task-characteristic layer is qualitative rather than a rigid scoring system.
Relevant characteristics include complexity, ambiguity, novelty, breadth,
evidence quality, exactness versus exploration, anchoring risk, need for
alternatives, implementation consequence, formatting determinism, verification
difficulty, and attention budget.

A technique is selected only when it addresses a named material failure mode and
its likely benefit exceeds its attention/token/rigidity/autonomy cost. Applying
no extra craft technique is a normal result. This keeps small exact-known tasks
small while allowing proportionate decomposition, alternatives, examples,
verification, uncertainty handling, tool/action framing, output shaping, or
bounded evaluation-driven optimization where they materially help.

Contraindications are first-class. Craft cannot grant MCP-OFF unavailable
capabilities, prescribe an MCP-ON implementation route, choose research source
roles, turn hypotheses into mandatory patches, take human-owned approval or
promotion decisions, demand private chain-of-thought, or stack fashionable
techniques ceremonially.

## Evidence boundary

Every generated prompt preserves three meanings when material:

- **Observed:** facts or evidence actually established in the originating
  context.
- **Interpretation:** hypotheses, diagnoses, conclusions, or proposed solutions
  that remain subject to receiver verification.
- **Requested outcome:** what the receiving context is being asked to accomplish.

Prompt creation and craft may improve clarity but never launder interpretation
into observation.

## Template-maintenance transfer

A downstream project may reveal a reusable problem. The upstream transfer prompt
carries the project's observable symptom, exact useful evidence, reusable
interpretation, and desired template-wide outcome to the canonical template
context. It does not instruct the canonical template to blindly copy a project-
specific patch.

The canonical template context independently verifies the problem, determines the
reusable fix, reviews the exact canonical source range, and may generate the
repository's deterministic change package when the reviewed canonical fix needs
to return to the originating project. The downstream project applies the
matching package patch and validates/reviews that application under its own
normal workflow. Patch conflict is an explicit adaptation decision.

## Repository-action reliability boundary

Repeated maintenance runs exposed a separate tool-selection failure: ordinary
repository file writes were mistakenly dispatched as unlabeled GitHub issue
creation. Permanent Project instructions now state the distinction directly:
file/contents actions are used for repository file creation/update/deletion,
including task records and continuity; GitHub issue creation is reserved for a
loaded MCP-ON workflow/scouting route that actually requires a task-bound
control or Scout issue after open-issue/task-ID reconciliation.

This is a global orchestration reliability boundary, not a prompt-craft
technique, but it is recorded here because the defect surfaced while integrating
the prompt system.

## Verification contract

The Project-package validator enforces:

- the exact twelve-Source inventory;
- nine permanent routed Sources and three prompt support Sources;
- exactly one permanent route for the prompt-creation core and no permanent route
  for support Sources;
- exactly one dependency reference from the core to each support Source;
- context-transfer, destination-plus-mission, evidence-boundary,
  destination/current-mode, and prompt-handoff-format precedence;
- all three destination profiles and the initial mission profile set;
- craft precedence, proportional technique selection, no-op selection,
  receiver-route ownership, and the private-reasoning prohibition;
- the file-write versus issue-control boundary;
- the template-maintenance transfer's independent-verification and deterministic
  change-package relationship;
- preservation of existing MCP-ON/MCP-OFF, bridge, continuity, no-replay,
  public-safety, and human-only promotion contracts.

Validator tests preserve these architectural boundaries without phrase-locking
the complete craft taxonomy so prompt techniques can evolve with evidence.
