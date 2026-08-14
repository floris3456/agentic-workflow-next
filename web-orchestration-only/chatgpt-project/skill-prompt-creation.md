# Prompt creation and context transfer

## Trigger

Use when the human explicitly asks this web orchestrator to create, draft, prepare,
or hand off a prompt intended to run in a different execution context: a new
MCP-ON web-orchestration chat, a new MCP-OFF web-orchestration chat, or a direct
OpenCode session. Do not insert prompt creation into ordinary work merely because
another agent could theoretically do it; if this context can complete the human's
requested outcome and the human did not ask for a prompt, use the normal shortest
safe execution route instead.

## Required support Sources

Load `skill-prompt-destinations.md` and `skill-prompt-missions.md` for every prompt
creation task. The destination Source defines what the receiver already owns and
can do. The mission Source defines what task information the receiver needs. They
are support Sources, not independent user-facing routes.

## Core model

Treat prompt creation as context transfer across an execution boundary, not as
generic prose generation. Compose two orthogonal dimensions:

- **Destination:** where the prompt will execute.
- **Mission:** what the receiving context must accomplish.

The prompt should carry what the receiver needs but does not already own. Do not
reproduce destination protocol, safety boilerplate, routing mechanics, or tool
syntax that the receiving environment already supplies unless the human
explicitly asks for those mechanics to be part of the task.

## Procedure

1. **Resolve destination and mission.** Treat the human's explicit destination
   and requested purpose as authoritative. Avoid token-heavy keyword
   classification. If either dimension is unstated, infer it only when the
   conversation makes it unambiguous; ask only when the ambiguity would
   materially change what the receiver can do or what outcome is requested.
2. **Confirm a boundary actually exists.** An explicit request for a prompt is
   sufficient. Otherwise do not manufacture a handoff when the current context
   should simply perform the work itself.
3. **Extract transferable state from the current context.** Keep only material
   information the receiver cannot safely assume:
   - requested outcome and success condition;
   - exact useful repository, branch, SHA, path, issue, artifact, or other
     evidence references when established and relevant;
   - scope and material constraints;
   - unresolved blockers, dependencies, or decisions;
   - expected deliverable or next-state handoff when the mission needs one.
4. **Preserve evidence boundaries.** Separate:
   - **Observed:** facts or evidence actually established in the originating
     context;
   - **Interpretation:** current hypotheses, diagnoses, or conclusions that the
     receiver should independently verify when material;
   - **Requested outcome:** what the receiver is being asked to accomplish.
   Never convert an interpretation into an observed fact merely to make the
   prompt sound decisive.
5. **Apply the destination profile.** Remove protocol the receiver already owns;
   adapt the requested outcome to capabilities the destination actually has; and
   include destination-specific execution context only when it materially helps.
6. **Apply the mission profile.** Include the mission's required task payload
   without prescribing implementation details that are not part of the human's
   request or established evidence.
7. **Compose one self-contained execution prompt.** A fresh receiving context
   should be able to begin correctly without access to this conversation. Prefer
   concise natural structure over ceremonial headings; use headings or lists
   only when they make evidence, constraints, or deliverables materially clearer.
8. **Check for context leakage and duplication.** Remove private-chat narration,
   irrelevant history, duplicated receiver-owned rules, stale guesses, and
   unnecessary tokens. Do not expose secrets, credentials, personal data, or
   other sensitive values merely because they appeared in the originating
   context.
9. **Check executability.** The prompt must request something the chosen
   destination can actually do. Where a destination cannot perform the eventual
   action, ask it for the strongest useful predecessor outcome instead of
   pretending the action is available.
10. **Return the ready-to-use prompt.** Add a short note outside the prompt only
    when a material assumption, capability limit, or intentionally omitted detail
    must be visible to the human.

## Boundaries

- Do not embed bridge envelopes, issue-control mechanics, Scout protocol,
  Luna/Sol routing rules, promotion procedure, or other Project implementation
  detail into a prompt for a web orchestrator that already owns those rules.
- Do not force a fixed output template onto every generated prompt. Destination
  and mission requirements control necessary structure.
- Do not silently copy a project-specific proposed patch into a reusable-template
  handoff as if it were the canonical solution; transfer the observed problem and
  relevant evidence, preserve the interpretation boundary, and let the canonical
  template context determine the reusable fix.
- General prompt-optimization methodology is intentionally out of scope for this
  first architecture. A later prompt-craft Source may improve wording and
  information design without changing the destination/mission contract.
