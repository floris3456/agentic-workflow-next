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

`source-lock.json` matched those refs at task start. `main` remains out of scope for mutation/promotion.

## Public-safe task brief

Harden package provenance, exact Git repository identity, and the independent Scout trust boundary without weakening portability, recovery, exact-ref review, deterministic packaging, public safety, ordinary developer OpenCode behavior, or the human-only `main` boundary. Existing Scouts are not evidence for this task.

## Current position

Issue 26 is canonical. Developer source `9ab08b8d338c0764899bb553d50dbe491cdc09bc` plus snapshot `f8ed4a7e570ff173dc6c8dbbc533735916f8ed41` implemented AWT-002 and safe Scout fail-closed behavior, then returned `needs decision`. Independent pinned OpenCode 1.18.16 inspection resolved that architecture inside the user's already-authorized scope: a separate sterile Scout server, bridge-owned trusted agent/read-search tools, project/global instruction isolation, read-only config dirs, no built-in read/LSP, and exact Git-object snapshot materialization can satisfy the requested boundary without a new external sandbox dependency.

Sequence 8 delivered that design but a status read showed no new turn. Sequence 9 delivered a concise retry. After further independent AWT-001 and Project-policy inspection, remote `developer` is still `f8ed4a7e570ff173dc6c8dbbc533735916f8ed41`. One final sequence-free status read is pending below. If it again returns the old response with an idle session, the delegated continuation will be classified terminal/absorbed and the shortest safe direct route will be used; no more prompt retries.

A prior direct Git-object staging attempt moved no branch ref and was abandoned after an unreachable staged blob failed readback/content-address verification.

## Independent findings / design decisions

- AWT-002 current code authenticates Git host + owner + repository across legitimate HTTPS/SSH/scp forms, public GitHub/GHES and explicit ambiguous custom `git_host`, with adversarial URL tests.
- OpenCode built-in `read` is unsuitable for Scouts because it can append repo instructions and warm LSP. Trusted Scout-specific contained read/search must be used instead.
- Project configuration can be disabled; sterile HOME/XDG removes unrelated global config/instructions. Both trusted OpenCode config discovery dirs must be non-writable so pinned dependency bootstrap cannot spawn a package manager.
- Scout runtime installation is trusted infrastructure and must execute outside untrusted `repository_root`; inspected refs are data only.
- Exact Scout view should be materialized from canonical `origin/developer` commit objects with safe Git plumbing, not checkout/worktree, so hooks and clean/smudge filters never execute.
- AWT-001 current package generator trusts an arbitrary supplied local object database and stamps source-lock identity; current validation only checks schema-1 range shapes and patch digests.
- Planned AWT-001 schema-2 model keeps source-lock source SHAs as review-base lock through generation, authenticates supplied origin, fetches canonical branch tips into a sterile temporary Git repo, requires locked bases + fetched canonical heads, generates patches only from canonical fetched objects, embeds a source-lock snapshot digest, binds manifest/provenance/patch bytes with deterministic SHA-256, and validates bindings offline. Legacy schema-1 packages remain legacy/unverified rather than being silently upgraded.
- Current MCP-ON Project scouting Source still claims isolated worktrees/ref-owned Scout behavior and will need one minimal post-developer alignment change.

## Route / active work

- Canonical issue: `https://github.com/floris3456/agentic-workflow-template/issues/26`
- Existing Scouts: none launched; none accepted as evidence.
- Developer: sequence 9 delivered; final status reconciliation pending.
- Highest accepted command sequence: 9.
- No web-orchestration or template-development source mutation starts until developer route is terminal/absorbed.

## Command / request journal

- Sequences 1-7: original Sol start/interactions/recovery; later yielded `9ab08b8d...`, `f8ed4a7e...`, and `needs decision`.
- Sequence 8 `a73e1c51-1e10-47ae-b9bc-755f0a09c108`: hardened-runtime architecture steer; accepted -> applying -> succeeded as delivery; no new turn observed.
- Status `52fd0ef7-1884-43f6-b89f-373d23713209`: succeeded; session idle and still projected old `needs decision` response.
- Sequence 9 `6b097d43-0dc3-46cc-a6a4-54c90e27a109`: concise retry; accepted -> applying -> succeeded as delivery; no developer ref movement observed afterward.
- Pending sequence-free request, publish byte-for-byte after this ledger commit is confirmed:

```json
{"protocol":"agentic-bridge/1","request_id":"9bf876b1-eb67-40c4-b034-41db81675a09","task_id":"TEMPLATE-TRUST-BOUNDARY-001","kind":"task.status","arguments":{}}
```

## Checks performed by orchestrator

Authenticated exact source refs/source-lock; maintenance/package contracts; current AWT-002/Scout code/tests/docs; pinned OpenCode 1.18.16 instruction/config/tool/runtime/npm/LSP/read behavior; current package generator/validator/apply/tests; Project scouting Source; and every developer range referenced above were independently inspected. No Scout result was used.

## Blockers / decisions

No human-owned decision remains at present. If the final status shows the same idle/old-response state, stop retrying that developer session. If a later concrete implementation cannot prove the required isolation properties, surface that exact architecture boundary instead of weakening them.

## Remaining work

Reconcile the pending status; finish/review developer source and CI; finalize/archive developer task record if required; update the minimal web-orchestration Source; implement/review AWT-001; genuinely generate and validate the deterministic package; reconcile source-lock/durable records; return exact remote handoffs. Do not modify/promote `main`.

## Last handoff commit

Developer navigation snapshot: `f8ed4a7e570ff173dc6c8dbbc533735916f8ed41` (`needs decision`, not accepted completion).
