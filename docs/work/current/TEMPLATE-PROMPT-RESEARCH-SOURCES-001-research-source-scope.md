# Template-maintenance task progress

## Task ID

TEMPLATE-PROMPT-RESEARCH-SOURCES-001

## Status

In progress

## Task-start template-development SHA

d5a2e82e0b6d5f0a26d2a929c6b509cae2c7aa5a

## Review-base template-development SHA

d5a2e82e0b6d5f0a26d2a929c6b509cae2c7aa5a

## Public-safe task brief

Refine the prompt-creation research mission so generated research prompts can explicitly state whether the receiver should inspect the target repository before external research and can also request external repository research for comparative patterns or inspiration. Keep repository evidence and external inspiration distinct. Then reason about the architecture of the future prompt-craft Source before researching prompt-engineering techniques.

## Current objective

Make the small research-mission correction on `web-orchestration`, reconcile the source lock, and use the corrected architecture as the basis for discussing how prompt-craft techniques should be selected without contradicting destination or mission constraints.

## Current position

The existing research mission transfers questions, evidence, hypotheses, scope, unknowns, and expected evidence, but does not explicitly model the research-source strategy: target-repository-first grounding versus external research, including other repositories for comparative inspiration.

## Source ranges

- `template-development`: task start `d5a2e82e0b6d5f0a26d2a929c6b509cae2c7aa5a`.
- `web-orchestration`: task start `e6079712e711096e32362da838ef3930cf7ddf52`.
- `developer`: unchanged at `e2700f586fe8ab634053eb514bb9da487e881a21`.
- `main`: unchanged at `6127611113dfdb66f93a0cfd2d355359aa370833`.

## Observed

- No open control issue existed at task start.
- `skill-prompt-missions.md` currently does not explicitly ask prompt creation to encode whether target-repository files should be read before external research.
- It also does not explicitly mention researching other repositories for comparative patterns or inspiration.

## Interpretation

Research prompts need a source-strategy dimension inside the research mission, not a new destination or mission. Repository-grounded diagnosis and external inspiration can both be useful, but should remain distinguishable so outside patterns are not mistaken for facts about the target repository.

## Attempts

- Accidental unlabeled GitHub issue #17 was created while selecting a file-write action. It contained no task or bridge marker, launched no work, and was immediately rewritten to document the mistake and closed as `not_planned`.

## Changed approach

None beyond correcting the accidental issue publication before continuing.

## Checks

- Exact live `template-development` and `web-orchestration` heads read back.
- `source-lock.json` matches the live source refs at task start.
- Exact current research mission inspected.

## Blockers / required decisions

None.

## Remaining work

Update the research mission, review the exact web diff, reconcile `source-lock.json`, validate the ledger handoff, and then discuss the fourth Source architecture without yet researching prompt-engineering methods.

## Next action

Apply the bounded research-source-strategy wording to `skill-prompt-missions.md`.

## Relevant durable records

- `web-orchestration-only/chatgpt-project/skill-prompt-missions.md`
- `docs/design/prompt-creation.md`
- `source-lock.json`

## Last handoff commit

None
