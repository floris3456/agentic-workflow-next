# Template-maintenance task progress

## Task ID

TEMPLATE-TRUST-BOUNDARY-001

## Status

in progress

## Task-start / review-base refs

- main: `6127611113dfdb66f93a0cfd2d355359aa370833`
- developer: `e2700f586fe8ab634053eb514bb9da487e881a21`
- web-orchestration: `2b95a9803115b05283494fb3699b9d34c58a91a5`
- template-development: `7dde0897c4b0bc1df304bd43fe61f4eb99fd682f`

`source-lock.json` matched the source refs at task start. `main` is not authorized for change or promotion.

## Public-safe task brief

Harden reusable-template trust boundaries across package provenance, Git remote repository identity, and independent Scout isolation while preserving portability, recovery, exact-ref review, deterministic packaging, public safety, ordinary developer OpenCode behavior, and human-only `main` promotion. Existing OpenCode Scouts are not evidence until the isolation change is independently reviewed.

## Current position

Issue 26 is canonical. The delegated Sol route is now terminal and absorbed as an execution failure, not an implementation handoff. Exact comparison proves its sole Git effect was the required developer task record at `0b4813240c5ee2358789d01b66293ff9cf91efed`. The final bridge status showed the same mapped session idle with live heartbeat and latest response `MessageAbortedError: Aborted`; no six-field handoff or product/source change exists. `start` cannot replace an existing mapped session, while `steer`/`route` reuse that session, so the bridge exposes no supported task-preserving session replacement. No further delegated prompt will be sent. The next justified developer route is direct connected GitHub from exact current head `0b4813240c5ee2358789d01b66293ff9cf91efed`, with atomic source commits, remote CI, and exact connected-GitHub review.

## Independently established findings

- Package generation can stamp source-lock canonical identity without proving the supplied repository/history is canonical; package validation only binds patch digests today.
- Source-lock was pinned to task-start source refs and should remain the review-base lock through package generation, then reconcile to reviewed heads.
- Bridge origin validation authenticates only an owner/repository suffix, not host; custom `github.api_base_url` requires fail-closed host derivation rather than hard-coded github.com.
- Scout worktree creation does not disable hooks; startup shares ordinary OpenCode, discovers inspected-workspace agents/tools before validation, lets the ref own `repository-scout`, and allows LSP.
- OpenCode 1.18.16 built-in `read` injects repository instructions and warms LSP; external tool/plugin discovery can execute extensions. A trusted Scout runtime therefore needs sterile config plus trusted no-side-effect read/search with realpath containment.
- Bridge bootstrap has no Scout-specific readiness gate.
- Legacy package manifests are schema 1; new provenance validation needs explicit legacy compatibility without representing old packages as newly provenance-valid.
- There is no standalone `scripts/validate-change-package.mjs`; package validation currently lives in `validate-template-development.mjs` and `apply-change-package.mjs`.

## Route / active work

- Delegated developer route: terminal/absorbed; no implementation handoff; exact effect only the task-record commit.
- Direct developer route: selected next, not yet mutated; current exact base `0b4813240c5ee2358789d01b66293ff9cf91efed`.
- Existing Scouts: none launched/prohibited as evidence.
- Web-orchestration/template-development source edits wait until the direct developer mutation is reviewed and terminal.
- Canonical issue: `https://github.com/floris3456/agentic-workflow-template/issues/26`
- Highest accepted command sequence: 7; no further developer bridge command is planned.

## Command / interaction journal

- Seq 1 start succeeded and created the mapped Sol session.
- Seq 2 permission-6 reject succeeded.
- Seq 3 permission-7 reject ended `indeterminate` because upstream had already removed it; never retry.
- Seq 4 steer succeeded; no new turn.
- Status `a59300e4-22af-4d94-9805-b63d48e5f201` showed mapped idle session and unchanged empty response.
- Seq 5 steer succeeded; no new turn.
- Seq 6 abort succeeded with `result: true`.
- Seq 7 post-abort steer succeeded as prompt delivery; the new OpenCode message immediately ended `MessageAbortedError` with no parts.
- Final status `ed71b30a-613a-4d99-b010-cba5e630f208` succeeded: mapped session idle, live bridge heartbeat, latest projected response `MessageAbortedError: Aborted`, no handoff.

## Checks performed by orchestrator

- Exact refs and required maintenance/source-lock/package/bridge/Project contracts read from authenticated GitHub.
- Pinned OpenCode 1.18.16 read/config/tool/plugin source inspected for the material execution behaviors.
- `developer` base-to-interim compare is exactly one commit and one added file: `docs/work/current/TEMPLATE-TRUST-BOUNDARY-001-scout-trust-boundary.md`; no product implementation was made by the delegated route.
- Bridge command source proves mapped session replacement is unavailable: `start` refuses an existing mapping; `steer` and `route` reuse it.
- The maintainer skill requires the final package to be genuinely generated by `scripts/create-change-package.mjs` after exact source review and then committed/validated; no hand-built substitute is permitted.

## Blockers / decisions

No human-owned decision is currently required. The failed delegation is closed as a tool/runtime execution failure; continuing through direct connected GitHub avoids pretending it completed source work. If direct evidence later shows a required Scout isolation property cannot be implemented without a materially larger human-owned architecture dependency, stop at that genuine decision rather than weaken the property.

## Remaining work

Implement/review developer repository identity and Scout isolation directly; update/validate durable records and archive the developer task record if required; then make the minimal reviewed web-orchestration contract change; harden/test package provenance on template-development; genuinely generate/validate the deterministic package; reconcile source-lock/durable records; return exact source/package handoffs. Do not modify/promote `main`.

## Last handoff commit

None
