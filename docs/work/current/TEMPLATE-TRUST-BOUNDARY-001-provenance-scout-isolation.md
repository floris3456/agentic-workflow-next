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

`source-lock.json` matched those source refs at task start. `main` remains unauthorized for change or promotion.

## Public-safe task brief

Harden reusable-template package provenance, exact Git repository identity, and the independent Scout trust boundary. Preserve portability, recovery, exact-ref review, deterministic packaging, public safety, normal developer OpenCode behavior, and the human-only `main` promotion boundary. Existing Scouts are not evidence for this task until hardening is independently reviewed.

## Current position

Issue 26 is canonical. Sol pushed source `9ab08b8d338c0764899bb553d50dbe491cdc09bc` and snapshot `f8ed4a7e570ff173dc6c8dbbc533735916f8ed41`, then returned `needs decision` because Scout execution remained fail-closed. Independent upstream inspection resolved that decision inside the user's already-authorized scope: a separate pinned OpenCode 1.18.16 Scout process can use sterile HOME/XDG/config, project/global instruction isolation, read-only bridge-owned config/agent/tools, explicit LSP/plugin/skill/default-feature disablement, and dependency-free trusted contained read/search tools. Exact Scout workspace materialization can use canonical Git plumbing (`ls-tree`/`cat-file blob`) instead of checkout/worktree, eliminating checkout hooks and smudge/filter execution.

A direct Git-object publication attempt was abandoned before moving any branch ref when readback of the first unreachable staged blob failed the local content-address check. No developer ref/content changed from that attempt. Sequence 8 then steered the same Sol session with the resolved dedicated-runtime design. Its bridge delivery succeeded; remote `developer` remains `f8ed4a7e570ff173dc6c8dbbc533735916f8ed41` at the latest read. One sequence-free `task.status` request is persisted below after an independent AWT-001 design interval.

## Key independent findings

- AWT-002 at `f8ed4a7e...` already authenticates supported Git remote host + owner + repository, handles public GitHub/GHES and explicit ambiguous custom `git_host`, and has adversarial URL tests.
- Current Scout source fail-closes before OpenCode contact and has safe Git/symlink checks, but does not yet execute a hardened runtime.
- OpenCode 1.18.16 project instruction loading is disabled by `OPENCODE_DISABLE_PROJECT_CONFIG`; sterile global config/home removes unrelated operator-global instruction sources.
- Pinned config dependency bootstrap returns before spawning when its config directories are non-writable; therefore both Scout discovery/config directories must be bridge-owned and read-only.
- Built-in `read` must stay disabled because it can append repo instructions and warm LSP. Bridge-owned `scout_read`/`scout_glob`/`scout_grep` can instead enforce realpath containment, bounded UTF-8 evidence access, no symlink-directory following, and no process/network/package side effects.
- The Scout runtime package is part of the TCB and must execute from a reviewed installation outside untrusted `repository_root`; inspected developer refs are data only.
- AWT-001 current generator stamps `source-lock.json` canonical identity after only local commit/ancestry checks; current validation only verifies schema-1 range shapes and patch digests.
- Planned AWT-001 provenance model: keep source-lock source SHAs as package review-base lock until generation; authenticate supplied origin; fetch canonical developer/web branch tips into a sterile temporary Git repository from the canonical URL; require requested bases equal lock sources and requested heads equal fetched canonical tips; require exact objects also exist locally; generate patches only from sterile canonical objects; include an exact source-lock snapshot; schema-2 manifest binds canonical refs, lock digest, patch digests and a stable package-binding SHA-256; offline validation recomputes all bindings without network. Historical schema-1 packages remain archival/legacy, not newly provenance-valid.

## Route / active work

- Delegated Sol range through `f8ed4a7e...`: terminal/absorbed as navigation, not accepted completion.
- Direct publication attempt: canceled before any branch ref/content effect; one unreachable blob was discarded.
- Active mutating route: same Sol session, sequence-8 hardened-runtime continuation.
- Existing Scouts: none launched; none accepted as evidence.
- Web-orchestration/template-development source mutation waits for developer terminal review.
- Highest accepted command sequence: 8.

## Command / request journal

- Seq 1 start; seq 2 permission-6 reject; seq 3 permission-7 reply indeterminate after upstream removal; seq 4/5 steers; seq 6 abort; seq 7 steer/recovery produced `9ab08b8d...` / `f8ed4a7e...` and `needs decision`.
- Seq 8 `a73e1c51-1e10-47ae-b9bc-755f0a09c108` steer: accepted -> applying -> succeeded as prompt delivery. It preserves AWT-002 and requires the separate installed Scout server, immutable Git-object snapshot, trusted tools, sterile/read-only config, runtime readiness checks, recovery migration guard, adversarial tests, validators/docs, and no Scout evidence for this task.
- Pending sequence-free request, to publish byte-for-byte after this ledger commit is confirmed:

```json
{"protocol":"agentic-bridge/1","request_id":"52fd0ef7-1884-43f6-b89f-373d23713209","task_id":"TEMPLATE-TRUST-BOUNDARY-001","kind":"task.status","arguments":{}}
```

## Checks performed by orchestrator

Authenticated exact refs and source-lock; maintenance contract/package scripts; exact AWT-002 and Scout source/tests/docs; exact OpenCode 1.18.16 instruction/config/tool/runtime-flag/auth/npm/LSP/read behavior; delayed developer range; direct staging readback; and current package generator/validator/apply/tests have all been independently inspected. No existing Scout result has been used as evidence.

## Blockers / decisions

No human-owned decision currently remains. If the implemented dedicated runtime still cannot prove non-execution of inspected/global extensions/instructions/installers/LSP/ref-controlled processes or real filesystem containment, stop at that concrete architecture boundary rather than weaken the property.

## Remaining work

Reconcile the pending status; absorb and independently review the final developer range and CI; finalize/archive developer task record if required. Then update the minimal web-orchestration Scout Source; implement/test AWT-001 on template-development; genuinely run `create-change-package.mjs` for the reviewed source refs, validate the package, reconcile source-lock and durable records, and return exact remote source/package handoffs. Do not modify/promote `main`.

## Last handoff commit

Developer navigation snapshot: `f8ed4a7e570ff173dc6c8dbbc533735916f8ed41` (`needs decision`, not accepted as completion).
