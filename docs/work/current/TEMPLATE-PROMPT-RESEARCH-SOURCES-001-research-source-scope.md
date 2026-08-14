# Template-maintenance task progress

## Task ID

TEMPLATE-PROMPT-RESEARCH-SOURCES-001

## Status

Completed

## Task-start template-development SHA

d5a2e82e0b6d5f0a26d2a929c6b509cae2c7aa5a

## Review-base template-development SHA

d5a2e82e0b6d5f0a26d2a929c6b509cae2c7aa5a

## Public-safe task brief

Refine the prompt-creation research mission so generated research prompts can explicitly state whether the receiver should inspect the target repository before external research and can also request external repository research for comparative patterns or inspiration. Keep repository evidence and external inspiration distinct. Then reason about the architecture of the future prompt-craft Source before researching prompt-engineering techniques.

## Current objective

Make the small research-mission correction on `web-orchestration`, reconcile the source lock, and use the corrected architecture as the basis for discussing how prompt-craft techniques should be selected without contradicting destination or mission constraints.

## Current position

The research mission now includes an explicit research-source strategy. A generated research prompt can say whether target-repository evidence should ground the investigation first, whether external sources or other repositories should also be studied, and what each source class contributes. Other repositories may provide comparison, prior art, alternative patterns, or inspiration, but they are not evidence of facts about the target repository. Repository-first ordering is not forced when the human wants exploratory or comparative research.

## Source ranges

- `template-development`: `d5a2e82e0b6d5f0a26d2a929c6b509cae2c7aa5a..8618dd5a70c6b485d18cd98387c5e1e5840aa025` before this dedicated handoff snapshot.
- `web-orchestration`: `e6079712e711096e32362da838ef3930cf7ddf52..e639548257705553fec81ee6ae07389620dd19d1`.
- `developer`: unchanged at `e2700f586fe8ab634053eb514bb9da487e881a21`.
- `main`: unchanged at `6127611113dfdb66f93a0cfd2d355359aa370833`.

## Observed

- No open control issue existed at task start.
- The prior research mission transferred questions, evidence, hypotheses, scope, unknowns, and expected evidence but did not explicitly model research-source ordering or external-repository inspiration.
- The exact web range is one commit and changes only `web-orchestration-only/chatgpt-project/skill-prompt-missions.md` with 16 additions.
- The new wording distinguishes target-repository grounding from external comparative/inspirational research and preserves evidence authority boundaries.
- `source-lock.json` now reconciles `web-orchestration` at `e639548257705553fec81ee6ae07389620dd19d1` under this task.

## Interpretation

Research-source strategy belongs inside the Investigation / research mission rather than becoming a new destination or mission. The prompt-craft Source should later consume the destination and mission constraints rather than applying every generally useful technique indiscriminately.

## Attempts

- Accidental unlabeled GitHub issue #17 was created while selecting a file-write action. It contained no task or bridge marker, launched no work, and was immediately rewritten to document the mistake and closed as `not_planned`.

## Changed approach

None beyond correcting the accidental issue publication before continuing.

## Checks

- Exact live `template-development` and `web-orchestration` heads read back.
- Exact web compare `e6079712e711096e32362da838ef3930cf7ddf52..e639548257705553fec81ee6ae07389620dd19d1` is linear and changes one intended file only.
- Exact remote readback confirms the research-source-strategy wording.
- `source-lock.json` reconciled to the new web handoff.
- No Scout, bridge command, developer route, `developer` mutation, or `main` promotion occurred.

## Blockers / required decisions

None.

## Remaining work

None for the requested small correction. The next design discussion concerns the fourth prompt-craft Source; no prompt-engineering research has been performed yet.

## Next action

Discuss how the prompt-craft Source should gate techniques by destination, mission, and workflow compatibility before researching specific techniques.

## Relevant durable records

- `web-orchestration-only/chatgpt-project/skill-prompt-missions.md` at `e639548257705553fec81ee6ae07389620dd19d1`
- `docs/design/prompt-creation.md`
- `source-lock.json`

## Last handoff commit

None
