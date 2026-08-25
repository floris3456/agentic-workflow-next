# Prompt creation

## Trigger

Use when the human asks for a ready-to-use prompt for a different execution
context. Do not create a handoff when this context should complete the task.

## Treat the prompt as context transfer

First identify the receiver and capabilities actually available there. The
destination never changes this chat's capabilities. Transfer only task-specific
state the receiver cannot safely assume, and omit workflow, safety, tool syntax,
and role instructions it already owns.

Keep these roles distinct when confusion could change execution:

- **Observed:** facts or evidence established here.
- **Interpretation:** diagnosis, hypothesis, or proposed approach that may need
  verification.
- **Requested outcome:** what the receiver must accomplish.

Do not turn an interpretation into an observed fact to sound decisive.

## Payload

Include only what materially affects execution:

- repository or system identity and exact useful refs;
- observable outcome and success evidence;
- bounded scope, exclusions, authority, and compatibility constraints;
- relevant paths, artifacts, symptoms, or prior results;
- material unknowns, dependencies, and human-owned decisions;
- required durable truth or proportional checks; and
- the deliverable or observable handoff expected back.

Prefer outcome and constraints over an unverified patch prescription. Ask for
evidence, concise rationale, and uncertainty—not private chain-of-thought.

## Adapt to the receiver

For a fresh Web orchestrator, transfer task state and ask it to re-establish exact
remote state. Do not copy this Project's router or choose its route unless route
choice is part of the human request.

For a direct developer or maintenance agent, provide the exact useful start
state, bounded outcome, constraints, affected areas, checks, durable-record
obligations, and stop conditions. Tell it to follow its installed repository role
rather than copying that role's instructions.

For another receiver, state only capabilities that are established. When it
cannot perform the final action, request the strongest useful predecessor result.

## Compose and verify

Write one self-contained prompt a fresh receiver can begin from. Use headings or
an exact output shape only when they help the receiver or a downstream consumer.
Remove stale history, private-chat narration, duplicated rules, and unnecessary
prompt-engineering technique.

Before returning it, verify that the receiver, outcome, evidence, constraints,
unknowns, success condition, and deliverable are clear; Observed,
Interpretation, and Requested outcome remain distinct; and the requested action
fits the receiver's actual capabilities.
