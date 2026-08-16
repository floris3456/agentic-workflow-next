# Template-maintenance task progress

## Task ID

TEMPLATE-OPENCODE-FAST-COMPLETION-001

## Status

Completed working cycle; source correction is reviewed and the exact provenance package is pushed, remotely reconciled, and canonical-CI green; finalization remains separate

## Task-start template-development SHA

f2da387fab23934044a79ede841516d9497e7003

## Review-base template-development SHA

f2da387fab23934044a79ede841516d9497e7003

## Public-safe task brief

Correct the post-interaction continuation race where normal same-session work can finish before the bridge's first post-reply proof and be mistaken for stalled work. Keep the fix minimal, preserve fail-closed one-shot same-session recovery, add the missing fast-completion regression, run proportional checks, and produce a reviewed change package. Do not modify or promote main.

## Current objective

Hand off the pushed provenance package and exact evidence for the separate downstream-application/finalization review boundary. No main promotion is authorized.

## Current position

Developer implementation `61c430590dc7008c845586373f27355847a4ac31` and task-record-only handoff `326e9c402f571b82f6497c4da0f9d3722b553dba` are remote and independently reviewed. The exact fix captures mapped-session activity plus latest assistant completion evidence before permission/question reply; post-reply changed activity or changed terminal assistant-message fingerprint is clean completion; baseline/proof failure blocks; the existing grace and durable one-shot claim-before-delivery remain; and the regression covers normal completion before the first post-reply observation with inactive status and unchanged session activity.

The bridge missed the durable terminal projection for the Luna session. Read-only sequence 4 proved live `session.status = {}`; sequence 5 idempotent `sync.recover` succeeded but did not update stale `task.status`; read-only sequence 6 then returned the latest assistant turn with `finish: stop` and the canonical six-field completed handoff naming exact SHA `326e9c402f571b82f6497c4da0f9d3722b553dba`. That exact live terminal evidence plus the remote handoff proves the Luna route terminal and absorbed without restart, replay, replacement session, or steer. Canonical issue #45 is closed `completed`.

Exact source refs were reread and `source-lock.json` was reconciled to developer `326e9c402f571b82f6497c4da0f9d3722b553dba`, web-orchestration `7e29c07e6ac9fc65a2cb2a8957514bc03500cc17`, and unchanged main `6127611113dfdb66f93a0cfd2d355359aa370833`; the template-development push validator passed on that lock commit.

The clean `template-development` worktree was synchronized from `f2da387fab23934044a79ede841516d9497e7003` to canonical `1cc1621ed34d2c9228544c0d8ff41d56c3cd5673`. Fresh canonical refs independently matched the transfer state: developer `326e9c402f571b82f6497c4da0f9d3722b553dba`, web-orchestration `7e29c07e6ac9fc65a2cb2a8957514bc03500cc17`, main `6127611113dfdb66f93a0cfd2d355359aa370833`, and template-development `1cc1621ed34d2c9228544c0d8ff41d56c3cd5673` before this cycle's ledger commits.

The output directory was absent, so no partial package required reconciliation. The tracked generator then performed its fresh canonical fetch and created `changes/TEMPLATE-OPENCODE-FAST-COMPLETION-001/manifest.json` for only the exact reviewed ranges. Schema/provenance validation succeeds; package SHA-256 is `7900e6123d9d76d89b6c9e1232bc0e3c81795fdda1c8290fe4b31e533bf67ae7`; developer patch SHA-256 is `5b27828115663e78e9cdfed6f1092f9d0e70bf0210c62e521d69b4922ee40d58`; and the empty web patch SHA-256 is `e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855`.

Package/ledger commit `4fc5b16d3a1df7e6a086553a65f5a45c49d9cd14` was pushed and independently read back from canonical `template-development`. Canonical Actions run `31975950098` completed successfully for that exact commit. Developer, web-orchestration, and main remained at their verified pre-cycle SHAs.

## Source ranges

- developer: `80ad63319cd746d6205d67781b25e3c327b230bc..326e9c402f571b82f6497c4da0f9d3722b553dba`
- implementation: `afd5d48a6aafc5c6c8974c9f5398bd06cfcb8c81..61c430590dc7008c845586373f27355847a4ac31`
- handoff: `61c430590dc7008c845586373f27355847a4ac31..326e9c402f571b82f6497c4da0f9d3722b553dba` (task record only)
- web-orchestration: `7e29c07e6ac9fc65a2cb2a8957514bc03500cc17..7e29c07e6ac9fc65a2cb2a8957514bc03500cc17`
- main: unchanged at `6127611113dfdb66f93a0cfd2d355359aa370833`
- template-development review/synchronization head before this cycle's ledger commits: `1cc1621ed34d2c9228544c0d8ff41d56c3cd5673`

## Observed

- Normal OpenCode idle removes the session from live status; the prior race was real.
- New recovery anchors proof before the reply instead of merely increasing delay.
- Baseline unavailability blocks continuation recovery rather than permitting an unbaselined nudge; the interaction reply itself is still delivered once.
- Regression proves inactive/unchanged-session fast completion returns `clean`, sends zero nudge, and leaves nudge state `not-attempted`.
- Luna reported build, focused recovery 19/19, full bridge 96/96, agent-system, bridge/repository validation, 8/8 branch-initializer tests, and `git diff --check` passing.
- Latest live assistant message is terminal (`finish: stop`) and contains the six-field completed handoff for the exact remote developer SHA.
- Template-development validation passed after source-lock reconciliation.
- Canonical source refs remained exactly unchanged from transfer through generation.
- The tracked generator's sterile canonical fetch succeeded and proved both reviewed heads are ancestors of/equal to the current canonical tips.
- The generated manifest lists the same 11 developer paths as the exact reviewed Git range and no web-orchestration paths.
- No developer, web-orchestration, or main mutation occurred during package generation.
- Canonical `template-development` validation succeeded for exact package/ledger commit `4fc5b16d3a1df7e6a086553a65f5a45c49d9cd14`.
- No template-maintenance AS-BUILT, design, or deviation update was required because generation and publication followed the documented mechanism without changing an implemented fact.

## Interpretation

The source defect is fixed and the developer route is terminal/absorbed. The repository-required provenance package now binds the exact independently reviewed source ranges without widening to unrelated commits. This working cycle remains open only for ledger publication, canonical CI observation, and its dedicated handoff snapshot; finalization and later promotion review remain separate human/review boundaries.

## Attempts

1. Bound canonical issue #45 and guarded Luna start from exact developer SHA `80ad63319cd746d6205d67781b25e3c327b230bc`.
2. Proved live `busy` before declining to steer despite stale projected `starting`.
3. Diagnostic messages sequence 3 was retained locally because its projection exceeded GitHub limits; it was not replayed.
4. Luna pushed implementation and handoff without replacement session/start.
5. Independently reviewed exact source/test behavior.
6. Live status proved inactive; idempotent `sync.recover` succeeded but durable task projection stayed stale.
7. Minimal latest-message read proved terminal `finish: stop` and exact completed handoff.
8. Closed issue #45 after terminal route absorption.
9. Reconciled `source-lock.json` from independently reread exact refs; template-development CI passed.
10. Attempted the tracked package generator on the available sandbox; canonical Git fetch failed at DNS/network resolution before package generation. No manual package construction was attempted.
11. Synchronized a clean template-development checkout, independently verified all four canonical refs, confirmed the output path was absent, and proved reviewed-range ancestry and changed paths.
12. Ran the tracked generator successfully; it fetched canonical developer/web-orchestration history into its sterile temporary repository and created the schema-2 provenance package.
13. Recomputed package and patch digests through the shared verifier and ran `./scripts/validate-template-development.sh`; all five package tests and full validation passed.
14. Committed and pushed the package/ledger as `4fc5b16d3a1df7e6a086553a65f5a45c49d9cd14`, independently reconciled the canonical remote ref, and observed Actions run `31975950098` complete successfully.

## Changed approach

The rejected prior implementation used only post-reply evidence. This correction uses a pre-reply baseline plus terminal assistant-message evidence without widening recovery authority or delay. Package completion remained separate from source completion until a maintainer surface could reach canonical Git directly. The default proxy route on that surface returned an access error, but direct canonical transport and the generator's required sterile fetch succeeded; no provenance rule or package range changed.

## Checks

- Exact developer range and handoff-only final commit verified remotely.
- Baseline placement before both reply kinds verified.
- Fail-closed baseline/proof behavior and one-shot claim preserved.
- Fast-completion regression semantics inspected directly.
- Live terminal assistant response independently read and matched to exact remote handoff.
- Current refs reread: developer `326e9c402f571b82f6497c4da0f9d3722b553dba`; web-orchestration `7e29c07e6ac9fc65a2cb2a8957514bc03500cc17`; main `6127611113dfdb66f93a0cfd2d355359aa370833`.
- Template-development synchronized to exact canonical `1cc1621ed34d2c9228544c0d8ff41d56c3cd5673` before mutation.
- `source-lock.json` reconciled at template-development commit `61da94440982422413df992ca31305998e16fa29`.
- GitHub Actions run `31972355347` for that lock commit completed successfully.
- Generator provenance: schema 2, mode `canonical-remote-fetch-v1`, canonical tips equal the reviewed developer and web heads, and both head relations are `reviewed-head-ancestor-of-canonical-tip`.
- Manifest range/path review: developer `80ad63319cd746d6205d67781b25e3c327b230bc..326e9c402f571b82f6497c4da0f9d3722b553dba` with 11 matching paths; web-orchestration `7e29c07e6ac9fc65a2cb2a8957514bc03500cc17..7e29c07e6ac9fc65a2cb2a8957514bc03500cc17` with zero paths.
- Package binding SHA-256 `7900e6123d9d76d89b6c9e1232bc0e3c81795fdda1c8290fe4b31e533bf67ae7`, developer patch SHA-256 `5b27828115663e78e9cdfed6f1092f9d0e70bf0210c62e521d69b4922ee40d58`, and empty web patch SHA-256 `e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855` recomputed successfully.
- `./scripts/validate-template-development.sh`: passed, including 5/5 change-package tests and `git diff --check`.
- Canonical template-development Actions run `31975950098` for package/ledger commit `4fc5b16d3a1df7e6a086553a65f5a45c49d9cd14`: completed successfully.
- Post-push canonical refs: template-development `4fc5b16d3a1df7e6a086553a65f5a45c49d9cd14`; developer `326e9c402f571b82f6497c4da0f9d3722b553dba`; web-orchestration `7e29c07e6ac9fc65a2cb2a8957514bc03500cc17`; main `6127611113dfdb66f93a0cfd2d355359aa370833`.

## Blockers / required decisions

None. No product/design decision is required.

## Remaining work

1. Finalization/archive remains separate until source and downstream application review satisfy that boundary.
2. Downstream application remains a separate normal task under the receiving repository's branch workflow.
3. Full `main -> developer` promotion review remains separate and later; no promotion is authorized here.

## Next action

At the next authorized maintenance cycle, review/apply the pushed package downstream and archive this task record only when the separate finalization requirements are met.

## Relevant durable records

- Issue #45 (closed completed)
- Start command: `01c0ce88-6cca-4760-8562-71c34db3409b`
- Live terminal-state command: `c8a6d9fb-b43e-4802-83c1-ccca03ad4456`
- Recovery command: `addf782f-bf81-4246-ab17-de148654ae16`
- Terminal latest-message command: `84787149-8736-4666-bca0-85dba278997d`
- Implementation: `61c430590dc7008c845586373f27355847a4ac31`
- Developer handoff: `326e9c402f571b82f6497c4da0f9d3722b553dba`
- Reconciled source lock: template-development commit `61da94440982422413df992ca31305998e16fa29`
- Change package: `changes/TEMPLATE-OPENCODE-FAST-COMPLETION-001/manifest.json`
- Package SHA-256: `7900e6123d9d76d89b6c9e1232bc0e3c81795fdda1c8290fe4b31e533bf67ae7`
- Package/ledger commit: `4fc5b16d3a1df7e6a086553a65f5a45c49d9cd14`
- Package/ledger CI: Actions run `31975950098` (successful)

## Last handoff commit

None; this dedicated snapshot is the first template-development handoff and does not record its own SHA.
