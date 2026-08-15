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

`source-lock.json` matched those refs at task start. `main` remains outside mutation/promotion scope.

## Public-safe task brief

Harden reusable-template package provenance, exact Git repository identity, and the independent Scout trust boundary while preserving portability, recovery, exact-ref review, deterministic packaging, public safety, normal developer OpenCode behavior, and the human-only `main` boundary. Existing Scouts are not evidence for this task.

## Current position

Issue 26 is canonical. Sol source `9ab08b8d338c0764899bb553d50dbe491cdc09bc` plus snapshot `f8ed4a7e570ff173dc6c8dbbc533735916f8ed41` implemented AWT-002 and safe Scout fail-closed behavior. Its `needs decision` architecture question was independently resolved within the user's already-authorized scope. Two subsequent architecture steers (sequences 8 and 9) were each accepted/applied/succeeded as bridge delivery, but sequence-free status reads after each showed the mapped session idle, `latest_event_id` still `event-134`, and the same old `needs decision` response. No new OpenCode turn or remote developer SHA followed. The delegated continuation is therefore terminal/absorbed as an execution-path failure; there will be no more developer-agent prompt retries.

Direct connected-GitHub implementation is selected from exact current developer head `f8ed4a7e570ff173dc6c8dbbc533735916f8ed41`. The earlier direct Git-object staging attempt moved no branch ref and was abandoned after unreachable-blob readback failed content-address verification; the direct route will use ordinary connected file writes with readback/CI rather than hand-built Git objects.

## Independent findings / design

- Preserve current AWT-002 host+owner+repository validation and adversarial tests.
- Hardened Scout architecture: separate mandatory loopback Scout OpenCode endpoint; runtime package/agent/tools are trusted bridge installation outside untrusted `repository_root`; sterile HOME/XDG/config/data; project config/default plugins/external skills/Claude instructions/LSP/downloads/experimental features disabled; both OpenCode config discovery directories read-only; built-in `read/glob/grep/lsp` denied; bridge-owned dependency-free `scout_read`/`scout_glob`/`scout_grep` only; exact `.git`-less commit snapshot materialized from canonical `origin/developer` objects with Git plumbing rather than checkout/worktree; realpath containment/no symlink-directory following; bootstrap/status fail closed if dedicated runtime is absent/misconfigured; historical pre-hardening Scout recovery rejected.
- AWT-001 current generator can stamp canonical identity from an arbitrary local object database. Planned schema-2 provenance keeps source-lock source SHAs as review-base lock through generation, authenticates supplied origin, fetches canonical developer/web tips into a sterile temporary repository, requires locked bases and fetched canonical heads, generates patches only from those canonical objects, embeds/digests the source-lock snapshot, and deterministically binds provenance+manifest+patch bytes. Offline validation recomputes those bindings; schema-1 artifacts remain legacy/unverified.
- Current Project scouting Source still describes detached worktrees/ref-owned Scout behavior and will need one minimal aligned update after developer review.

## Route / active work

- Canonical issue: `https://github.com/floris3456/agentic-workflow-template/issues/26`.
- Delegated Sol continuation: terminal/absorbed; final status request `9bf876b1-eb67-40c4-b034-41db81675a09` succeeded with idle session, `event-134`, old response.
- Active mutating source route after this ledger commit: direct connected-GitHub on `developer` from `f8ed4a7e570ff173dc6c8dbbc533735916f8ed41`.
- Existing Scouts: none launched/accepted as evidence.
- No web-orchestration or template-development source mutation overlaps the developer direct route.

## Command journal

Sequences 1-7 produced the current AWT-002/fail-closed Scout source. Sequence 8 `a73e1c51-1e10-47ae-b9bc-755f0a09c108` and sequence 9 `6b097d43-0dc3-46cc-a6a4-54c90e27a109` delivered the resolved hardened-runtime design but started no later OpenCode turn. Status requests `52fd0ef7-1884-43f6-b89f-373d23713209` and `9bf876b1-eb67-40c4-b034-41db81675a09` both confirmed the same idle/old-response state. Highest accepted command sequence is 9; no new developer bridge mutation is planned.

## Checks performed by orchestrator

Authenticated exact refs/source-lock; full task-start→`f8ed4a7e...` file map; current AWT-002/Scout source/tests/docs; pinned OpenCode 1.18.16 instruction/config/tool/runtime/npm/LSP/read behavior; package generator/validator/apply/tests; and Project scouting Source were independently inspected. No Scout result was used.

## Remaining work

Implement and review the developer hardened runtime directly; run/read CI and focused adversarial checks; archive/finalize developer task record if required. Then make the minimal web-orchestration Source change; implement/review AWT-001 on template-development; genuinely run/validate `create-change-package.mjs`; reconcile source-lock/durable records; return exact remote handoffs. Never modify/promote `main`.

## Last handoff commit

Developer navigation snapshot `f8ed4a7e570ff173dc6c8dbbc533735916f8ed41` (`needs decision`, not accepted completion).
