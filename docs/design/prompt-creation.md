# Prompt creation design

## Purpose

Prompt creation is a context-transfer capability for crossing an execution
boundary. It does not replace ordinary task execution and is not a general prompt
optimization system. Use it when the human asks the current web orchestrator to
prepare a ready-to-use prompt for a different execution context.

The initial architecture deliberately separates two orthogonal dimensions:

- **Destination:** where the prompt will execute.
- **Mission:** what the receiving context must accomplish.

A future prompt-craft layer may improve wording and information design without
changing those two dimensions.

## Source structure

The ChatGPT Project package contains three prompt-related Sources:

1. `skill-prompt-creation.md` is the only user-facing routed Source. It owns the
   boundary decision, destination-plus-mission composition, transferable-state
   extraction, evidence separation, duplication/leak checks, executability check,
   and final prompt assembly.
2. `skill-prompt-destinations.md` is a support Source loaded only by the core. It
   defines receiver capabilities, receiver-owned protocol, information that must
   cross the boundary, and information that would be redundant or impossible for
   each destination.
3. `skill-prompt-missions.md` is a support Source loaded only by the core. It
   defines the task payload needed for investigation/research, review,
   implementation/change, reproduce/test, continue/recover, and
   template-maintenance transfer missions.

The permanent Project router therefore exposes one cross-mode prompt-creation
trigger, not separate trigger rows for destination and mission support files.
This keeps the Project's flat Source inventory compatible with dependency-shaped
skill composition and avoids treating support material as independent user
intent.

## Destinations

The initial destination set is:

- a fresh MCP-ON web-orchestration chat;
- a fresh MCP-OFF web-orchestration chat;
- a direct OpenCode session visible to the local adapter/operator.

The destination describes the future receiver only. It never changes the current
chat's effective mode or capabilities. An MCP-OFF chat can prepare an MCP-ON
prompt without gaining MCP-ON execution rights.

Destination profiles omit protocol the receiver already owns. In particular, an
MCP-ON handoff should normally transfer the task-specific outcome, evidence,
constraints, and dependencies rather than bridge envelopes, Scout mechanics,
Luna/Sol routing, finalization procedure, or promotion rules already supplied by
the receiving Project.

A direct OpenCode prompt carries more execution-specific task state when useful
because the receiver is no longer the web orchestration layer. It still points to
repository-owned local instructions rather than copying those instructions into
every prompt.

## Missions

Mission profiles are independent of destination. The initial set covers:

- investigation / research;
- review;
- implementation / change;
- reproduce / test;
- continue / recover;
- template-maintenance transfer.

Closely related missions may be combined only when the human's requested outcome
genuinely spans them. The existence of a profile is never a reason to add a
ceremonial phase.

Future missions can be added without creating a new destination or changing the
core composition model. If either support Source later becomes materially large,
it may be split by profile while preserving the same axis ownership.

## Evidence boundary

Every generated prompt preserves three meanings when material:

- **Observed:** facts or evidence actually established in the originating
  context.
- **Interpretation:** hypotheses, diagnoses, conclusions, or proposed solutions
  that remain subject to receiver verification.
- **Requested outcome:** what the receiving context is being asked to accomplish.

Prompt creation must never launder interpretation into observation merely to
sound decisive. A fresh receiver should know what it can rely on, what it should
verify, and what success means.

## Template-maintenance transfer

A downstream project may reveal a reusable problem. The upstream transfer prompt
should carry the project's observable symptom, exact useful evidence, reusable
interpretation, and desired template-wide outcome to the canonical template
context. It should not instruct the canonical template to blindly copy a
project-specific patch.

The canonical template context independently verifies the problem, determines the
reusable fix, reviews the exact canonical source range, and may generate the
repository's deterministic change package when the reviewed canonical fix needs
to return to the originating project. The downstream project then applies the
matching package patch and validates/reviews that application under its own
normal workflow. Patch conflict is an explicit adaptation decision, not
permission to silently alter the canonical package.

## Non-goals for the first version

The first version intentionally does not define general prompt-engineering
methodology such as optimal phrasing, examples, decomposition patterns, model
priming, or other prompt-craft techniques. Those concerns may later live in a
separate prompt-craft Source so they can evolve independently from destination
capabilities and mission requirements.

The first version also does not create destination-by-mission files. Composition
prevents the combinatorial duplication that would result from separate files for
MCP-ON research, MCP-ON implementation, OpenCode research, and so on.

## Verification contract

The Project-package validator enforces:

- the exact eleven-Source inventory;
- nine permanent routed Sources and two prompt support Sources;
- exactly one permanent route for the prompt-creation core and no permanent route
  for the support Sources;
- exactly one dependency reference from the core to each support Source;
- the context-transfer, destination-plus-mission, evidence-boundary, and
  destination/current-mode separation rules;
- all three destination profiles and the initial mission profile set;
- the template-maintenance transfer's independent-verification and deterministic
  change-package relationship;
- preservation of the existing MCP-ON/MCP-OFF, bridge, continuity, no-replay,
  safety, and human-only promotion contracts.
