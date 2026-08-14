# Template-maintenance task progress

## Task ID

TEMPLATE-PROMPT-CRAFT-001

## Status

Completed

## Task-start template-development SHA

0ee64599442c8f77d43090363aa461af9c11e71d

## Review-base template-development SHA

0ee64599442c8f77d43090363aa461af9c11e71d

## Public-safe task brief

First correct three prompt-system reliability issues before adding the fourth prompt-craft Source: (1) make prompt-creation handoff formatting take precedence over generic MCP-OFF future-task formatting when the user explicitly asks for a prompt to another execution context; (2) reduce fragile cross-file inference by stating the conflict-resolution rule at the prompt-creation decision point rather than requiring the receiver to reconcile scattered instructions; and (3) add an explicit repository-file-write versus GitHub-Issue-creation boundary because repeated connector action mis-selection created inert unlabeled issues while ordinary file writes were intended. Then implement and integrate `skill-prompt-craft.md` as a support-only, context-sensitive prompt optimizer grounded in the reviewed MCP-OFF research: craft selects only techniques that address a material failure mode, preserves destination/mission/evidence/workflow ownership, and treats no extra technique as a valid result.

## Current objective

Complete. The prerequisite precedence/reliability corrections and the fourth prompt-craft Source are implemented, reviewed, and validated. The Project package now contains twelve Sources: nine routed and three prompt support Sources.

## Current position

`skill-prompt-creation.md` now owns the final destination-aware handoff shape whenever the human explicitly asks for a prompt to another execution context. `skill-mcp-off-workflow.md` states the same exception at its future-task decision point, so MCP-OFF capability/evidence/safety limits carry forward without leaking its generic developer-task schema or receiver-owned procedure into an MCP-ON/OpenCode prompt. Permanent instructions distinguish repository file/contents writes from GitHub Issue control. `skill-prompt-craft.md` is the third support Source and applies only after destination and mission resolution, using material failure mode plus attention/token/rigidity/autonomy cost as its technique gate; applying no additional technique is valid.

## Source ranges

- `web-orchestration`: `951a629e0f37d3014baea7b668059b35bafff4db..2b95a9803115b05283494fb3699b9d34c58a91a5`.
- `template-development`: `0ee64599442c8f77d43090363aa461af9c11e71d..2bd55d836f74509df274686eb6893e6f60cd0b3f` before this dedicated handoff snapshot.
- `developer`: unchanged at task-start value `e2700f586fe8ab634053eb514bb9da487e881a21`; final live recheck still required after this snapshot.
- `main`: unchanged at task-start value `6127611113dfdb66f93a0cfd2d355359aa370833`; final live recheck still required after this snapshot.

## Observed

- The prior prompt core already prohibited reproducing receiver-owned protocol, while the MCP-OFF workflow separately required a detailed generic future implementation task. A previous MCP-OFF prompt-design exercise correctly analyzed the anti-duplication rule yet still produced an over-prescribed MCP-ON handoff, establishing that the precedence between those individually valid instructions was not robust enough when left implicit.
- The corrected rule is now local at both decision points: explicit prompt creation owns final handoff shape; mode workflows retain capability/evidence/safety/authority/public-safety boundaries but do not inject generic handoff/developer schemas unless explicitly requested.
- Repeated ordinary file-write attempts in this task were mis-dispatched as plain unlabeled GitHub issues #22-#25. Each issue contained no bridge marker/task binding, launched no agent or mutation route, and was immediately closed `not_planned`. After switching to the explicitly discovered file-content action surface, all repository writes used `GitHub.create_file` / `GitHub.update_file` successfully.
- Permanent instructions now state that ordinary repository file creation/update/deletion—including task records and continuity—uses repository file/contents actions; Issue creation is reserved for a real loaded MCP-ON control/Scout route after required issue/task-ID reconciliation.
- `skill-prompt-craft.md` is intentionally support-only and preserves destination and mission as the two content axes. Its precedence is workflow/authority -> destination -> mission -> actual task characteristics -> craft.
- Craft technique families are compact and conditional: context/evidence organization, decomposition/planning, exploration/anchoring control, examples/demonstrations, targeted verification/uncertainty, tool/action framing, output/interface shaping, and evaluation-driven optimization only for recurring systems with representative evaluations.
- Craft contraindications preserve capability, evidence/source-role, route, authority, approval/promotion, private-reasoning, and proportionality boundaries.
- Package inventory is now exactly twelve Sources: nine routed and three support.

## Interpretation

The instruction split remains valuable; the defect was not that core/destination/mission must be collapsed. The robust pattern is modular ownership plus explicit local conflict resolution whenever two loaded Sources could both plausibly prescribe the final artifact. Craft follows the same principle: it optimizes communication only after higher-layer semantics are settled and cannot compensate for missing destination/mission payload or take over receiver workflow.

## Attempts

- Open `agentic-bridge` issue map was empty at task start; no legitimate bridge/control issue was required or created.
- Accidental issues #22, #23, #24, and #25 were created by repeated tool-action mis-selection while file writes were intended. Each was immediately converted to an explicit accidental-orphan record and closed `not_planned`; no label, bridge command/request, Scout, developer session, or repository implementation mutation was launched from them.
- Switched to explicit file-specific GitHub actions and completed all subsequent writes without further accidental issue creation.
- Initial craft draft was deliberately shortened before validation so the support Source would not introduce avoidable runtime attention cost.
- A first negative precedence fixture changed only list numbering while the validator correctly checked semantic ordering; the fixture was corrected to remove the task-characteristic stage itself, preserving semantic validation rather than phrase/number locking.
- Reconstructed the exact current Project package locally from the exact changed Sources plus unchanged package Sources and executed the real validator/test suite.

## Changed approach

- Treated the persistent issue/file confusion as evidence for a permanent action-selection boundary rather than continuing to rely on implicit tool semantics.
- Resolved prompt handoff precedence at both the core prompt decision and the MCP-OFF future-task decision to reduce fragile cross-file inference.
- Kept prompt-craft smaller than the research draft while preserving technique coverage; validator checks hard architectural invariants rather than the full evolving technique taxonomy.

## Checks

- Exact web compare `951a629e0f37d3014baea7b668059b35bafff4db..2b95a9803115b05283494fb3699b9d34c58a91a5` is linear (`ahead_by=9`, `behind_by=0`) and changes exactly seven intended Project-package paths: package README, developer instructions, MCP-OFF workflow, prompt core, new prompt craft Source, validator, and validator tests.
- Exact prompt-craft remote readback confirms the support-only trigger, precedence model, material-failure/attention gate, no-op option, receiver-route boundary, and hidden-reasoning prohibition.
- Reconstructed exact Project package passed `node web-orchestration-only/validate-package.mjs`: 12 exact Sources, 9 routed, 3 support, 5 parsed bridge envelopes.
- Reconstructed exact Project package passed `node --test web-orchestration-only/validate-package.test.mjs`: 32 tests, 32 passed, 0 failed. New negatives cover craft routing/dependency/precedence/private-reasoning, prompt handoff precedence, MCP-OFF format yielding, and repository file-write versus issue-control.
- Exact template-development compare `0ee64599442c8f77d43090363aa461af9c11e71d..2bd55d836f74509df274686eb6893e6f60cd0b3f` is linear (`ahead_by=4`, `behind_by=0`) and changes only prompt design, integrated AS-BUILT, this task record, and source lock.
- Push-triggered `Validate template development` run `31851151672` completed successfully for `2bd55d836f74509df274686eb6893e6f60cd0b3f`; its `validate` job and `./scripts/validate-template-development.sh` step concluded `success`.
- `source-lock.json` records reviewed web handoff `2b95a9803115b05283494fb3699b9d34c58a91a5` and task `TEMPLATE-PROMPT-CRAFT-001`.
- No Scout, delegated developer route, direct `developer` mutation, or `main` promotion occurred.

## Blockers / required decisions

None for the requested source implementation.

## Remaining work

Only final live readback after this dedicated handoff snapshot: confirm exact `template-development` handoff validation and recheck `developer` and `main` remain unchanged. No change package was generated: the current connector-only execution context has no authorized local template-maintenance worktree/package-generator route, and no downstream project application was requested. The repository-owned maintenance contract permits preserving that capability boundary rather than hand-building a package.

## Next action

Verify this handoff snapshot's push-triggered template-development validation, recheck exact live source refs, then report completion. Do not promote `main`.

## Relevant durable records

- `web-orchestration-only/chatgpt-project/skill-prompt-creation.md` at `2b95a9803115b05283494fb3699b9d34c58a91a5`
- `web-orchestration-only/chatgpt-project/skill-prompt-craft.md` at `2b95a9803115b05283494fb3699b9d34c58a91a5`
- `web-orchestration-only/chatgpt-project/skill-mcp-off-workflow.md` at `2b95a9803115b05283494fb3699b9d34c58a91a5`
- `web-orchestration-only/chatgpt-project/developer-instructions.md` at `2b95a9803115b05283494fb3699b9d34c58a91a5`
- `web-orchestration-only/chatgpt-project/README.md` at `2b95a9803115b05283494fb3699b9d34c58a91a5`
- `web-orchestration-only/validate-package.mjs` at `2b95a9803115b05283494fb3699b9d34c58a91a5`
- `web-orchestration-only/validate-package.test.mjs` at `2b95a9803115b05283494fb3699b9d34c58a91a5`
- `docs/design/prompt-creation.md`
- `docs/architecture/AS-BUILT.md`
- `source-lock.json`

## Last handoff commit

None
