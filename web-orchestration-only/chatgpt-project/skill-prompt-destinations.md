# Prompt destination profiles

## Trigger

Support Source for prompt creation. Load only when the prompt-creation procedure
is active. Do not route here directly from an ordinary user task.

## Purpose

A destination profile defines the receiving execution environment: what context
and protocol it already owns, what capabilities it can use, what information the
prompt must transfer, and what information would be redundant or misleading.
Destination does not define the task itself; combine exactly one destination
profile with the applicable mission profile.

## MCP-ON web orchestration

Use for a prompt that will be pasted into a fresh MCP-ON web-orchestration chat.

The receiver already owns the Project's permanent authority/safety rules,
procedure router, MCP-ON workflows, proportional direct-versus-delegated
implementation logic, Scout/bridge/recovery mechanics, continuity rules, and
human-only promotion boundary. Do not restate those mechanics in the generated
prompt.

Transfer only task-specific state that a fresh chat would not know, such as:

- the target repository or Project when the handoff crosses repositories;
- the observable problem or requested outcome;
- exact useful refs, paths, issues, artifacts, or checks already established;
- material observations, interpretations, constraints, unresolved questions,
  and dependencies;
- any required relationship to an originating project or downstream consumer.

Ask the receiver to independently re-establish exact current remote state before
acting on repository facts supplied by the originating context. Do not prescribe
Scout use, direct GitHub mutation, Luna/Sol delegation, bridge commands,
finalization, or promotion unless that execution route is itself part of the
human's explicit request.

For cross-project reusable-template work, name the canonical template repository
and the originating project's relevant evidence. Treat the originating diagnosis
or proposed solution as an interpretation unless independently established in
canonical template evidence.

## MCP-OFF web orchestration

Use for a prompt that will be pasted into a fresh MCP-OFF web-orchestration chat.

The receiver can use public-web reasoning and public GitHub evidence but cannot
control the bridge, launch OpenCode Scouts, delegate or steer a developer, write
orchestration state, directly mutate repository branches, answer local developer
interactions, or claim promotion. Do not ask it to pretend those capabilities
exist.

If the human's eventual goal is implementation, convert the immediate MCP-OFF
mission into the strongest useful predecessor outcome, normally some combination
of:

- investigate or verify the problem from public evidence;
- establish exact visible refs and affected areas;
- review a visible exact range;
- identify evidence gaps and explicit unknowns;
- prepare a bounded future MCP-ON or local implementation task.

Preserve the eventual desired outcome in the prompt so the receiver knows what
its preparatory work is for, but distinguish that eventual goal from what it can
actually complete in MCP-OFF. Avoid references to private connector state or
non-public evidence the receiver cannot access.

## Direct OpenCode

Use for a prompt that will be given directly to an OpenCode session rather than
to the web orchestrator. The session remains subject to the repository's local
agent instructions and skills; the prompt should tell it to follow those local
instructions rather than copying their entire content.

Compared with a web-orchestration handoff, carry more execution-specific task
state when relevant:

- repository and intended branch/ref or exact start SHA;
- task identity when continuity matters;
- observable outcome and bounded scope;
- known relevant files, symbols, artifacts, or starting evidence without
  overstating uncertain guesses;
- allowed or forbidden mutation boundaries;
- required durable records, checks, tests, generation, or handoff evidence;
- stop conditions and decisions that belong back with the human or web
  orchestrator.

For research-only work, say explicitly that the session must not mutate and
request evidence rather than implementation. For mutating work, do not imply
that a direct OpenCode session may promote `main` or bypass repository-owned
approval, synchronization, or record requirements.

Do not embed GitHub Issues bridge envelopes or web-orchestrator routing protocol
into a direct OpenCode prompt unless the human specifically wants the session to
work on that protocol as subject matter. A prompt intended for direct OpenCode
is not itself a bridge command or Scout request.

## Destination checks

Before returning a generated prompt, verify that:

- the destination named by the human is the destination actually addressed;
- the requested immediate outcome is executable there;
- receiver-owned protocol has not been redundantly pasted into the prompt;
- task-specific evidence needed by a fresh receiver has not been omitted;
- cross-repository or cross-project references clearly identify which context is
  the origin and which is the execution target.
