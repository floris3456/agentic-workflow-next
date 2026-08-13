# Task progress

## Task ID

`AGENT-QUESTION-TOOL-001`

## Status

In progress.

## Task-start developer SHA

`9b21898129532057b4656d7a05ef0db53b391ccb`

## Review-base developer SHA

`9b21898129532057b4656d7a05ef0db53b391ccb`

## Original task brief

> Ok fix it then right?

Context: fix the observed developer-agent configuration defect that prevents
OpenCode's structured question tool from producing a bridge-replyable public
question alias.

## Current objective

Allow Luna and Sol implementation developers to use OpenCode's structured
question tool so task-correlated `question.reply` can work, while preserving the
Scout's enforced question denial and all existing safety boundaries.

## Current position

The prior bridge smoke task reached durable `session.idle`, pushed handoff
`9b21898129532057b4656d7a05ef0db53b391ccb`, and left a clean synchronized
`developer` tree. Live `app.agents` inspection showed that both implementation
developers resolve the runtime's default `question: deny`, while `tool.ids`
contains the `question` tool. This task record precedes implementation changes.

## Observed

- `small-developer` and `large-developer` each resolve a last applicable
  `question`, wildcard rule of `deny` in OpenCode `1.18.16`.
- `repository-scout` also resolves question denial, as required.
- The smoke developer emitted the requested question as assistant text; the
  bridge recorded no `question.*` event, no question alias, and no pending
  question.
- The bridge itself successfully delivered the associated `task.status`
  recovery response and correctly refused to invent an alias.

## Interpretation

The smallest correct fix is an explicit `question: allow` permission in both
implementation-agent definitions, plus deterministic validation of that
contract. The Scout must retain `question: deny`. The bridge command and alias
implementation does not require modification.

## Attempts

None.

## Changed approach

None.

## Checks

- Prior-task remote synchronization: `developer` and `origin/developer` both
  resolved to `9b21898129532057b4656d7a05ef0db53b391ccb`.
- `./scripts/bootstrap-agent-workflow.sh --check`: passed; tracked hooks active.
- Live OpenCode `tool.ids`: `question` present.
- Live OpenCode `app.agents`: developer question permission denied; Scout
  question permission denied.

## Blockers / required decisions

None.

## Remaining work

- Update developer agent permissions.
- Add deterministic regression validation and current implementation records.
- Run focused/full checks and verify live resolved permissions.
- Commit and push implementation plus a dedicated handoff snapshot.

## Next action

Implement the explicit developer-only question permission and its validator.

## Relevant durable records

- `.opencode/agents/small-developer.md`
- `.opencode/agents/large-developer.md`
- `.opencode/agents/repository-scout.md`
- `scripts/validate-agent-system.mjs`
- `docs/architecture/agent-system.md`
- `docs/architecture/AS-BUILT.md`
- `tools/opencode-bridge/AS-BUILT.md`

## Last handoff commit

`None`
