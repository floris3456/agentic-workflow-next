# Task progress

## Task ID

TEMPLATE-TRUST-BOUNDARY-001

## Status

In progress.

## Task-start developer SHA

e2700f586fe8ab634053eb514bb9da487e881a21

## Review-base developer SHA

e2700f586fe8ab634053eb514bb9da487e881a21

## Original task brief

Implement the developer-owned portion of TEMPLATE-TRUST-BOUNDARY-001 from exact developer SHA e2700f586fe8ab634053eb514bb9da487e881a21. Independently re-inspect current code before editing. Required outcome: (1) replace suffix-based origin acceptance with fail-closed repository identity that parses supported HTTPS, ssh://, and scp-style SSH remotes; authenticates host plus owner/repository; derives acceptable Git host unambiguously from configured GitHub API/repository identity including supported GitHub Enterprise/custom API bases; and rejects deceptive hosts, suffix tricks, malformed paths, misleading userinfo, or ambiguous configuration; (2) create a genuine independent Scout trust boundary in which inspected-ref checkout/reuse/disposal cannot execute Git hooks, inspected-ref or unrelated global OpenCode config/plugins/tools/skills/instructions cannot execute or control startup, trusted Scout instructions/model/permissions/evidence contract are bridge/runtime-owned rather than ref-owned, repository instructions are evidence only, normal read/search launches no LSP/package installer/ref-controlled process/network download, realpath containment blocks symlink escape, and absent/misconfigured hardened runtime fails clearly; (3) preserve exact requested SHA, clean detached view, concurrent read-only Scout requests, durable correlation/recovery/public-safe projection, concise evidence, and normal developer OpenCode behavior. Remove LSP from every Scout contract/validator/doc if it cannot be proven safe. Add focused positive/adversarial tests for legitimate/forged origins, malicious checkout hooks, repo/global extension contamination, trusted-prompt independence, repository instruction injection, no LSP/process side effects, symlink escape, concurrent/recovery behavior, normal developer behavior, and bootstrap/status misconfiguration. Update the task-progress record and all justified AS-BUILT/design/deviation/SECURITY/setup/architecture/agent-system/validator artifacts in the same source work. Do not use existing Scouts as evidence. Do not modify main or web-orchestration, do not promote, force-push, or rewrite shared history. If the pinned OpenCode runtime cannot meet a required isolation property without a materially larger architectural dependency, implement every safe independent fix and return needs decision with exact evidence rather than weakening the property. Run proportional bridge, agent-system, and repository checks. Return exactly: Status:; Handoff developer SHA:; Files changed:; Checks + perceived results:; Blockers/decisions:; Task record:. Status must be completed, blocked, failed, or needs decision; completed requires an exact pushed 40-character developer SHA.

## Current objective

Replace the origin and Scout boundaries with fail-closed, bridge-owned identity and isolation controls while preserving exact-ref, concurrency, recovery, projection, and ordinary developer behavior.

## Current position

Task record created after confirming the clean synchronized `developer` checkout at the delegated exact SHA. Initial independent source inspection found suffix-based origin matching and a ref-owned Scout agent/runtime contract with LSP enabled.

## Observed

- `tools/opencode-bridge/src/service.ts` normalizes the origin text and accepts owner/repository suffixes without authenticating the remote host.
- `tools/opencode-bridge/src/scout.ts` creates a Git worktree with default Git behavior, resolves the Scout agent from the exact-ref workspace, and allows LSP.
- The existing Scout contract and documentation describe the agent as tracked in the inspected repository.

## Interpretation

The current Scout startup is not independent of inspected-ref OpenCode configuration, and the current remote check permits deceptive-host forms. Both require architectural changes rather than validator-only tightening.

## Attempts

None.

## Changed approach

None.

## Checks

- `git status --short --branch`, `git rev-parse HEAD`, and `git rev-parse origin/developer`: clean synchronized `developer` at the delegated SHA.
- `./scripts/bootstrap-agent-workflow.sh --check`: tracked hooks active.

## Blockers / required decisions

None identified yet.

## Remaining work

- Inspect bridge startup/configuration, runtime launch, validators, and records in detail.
- Implement and test fail-closed repository identity.
- Implement and test a hardened bridge-owned Scout runtime/workspace boundary.
- Reconcile documentation and implementation records.
- Run proportional checks and prepare the handoff snapshot.

## Next action

Inspect bridge service/bootstrap/runtime launch and all Scout configuration/validator surfaces before selecting the bounded implementation route.

## Relevant durable records

- `tools/opencode-bridge/AS-BUILT.md`
- `docs/architecture/AS-BUILT.md`
- `docs/architecture/design-record.md`
- `docs/architecture/deviations.md`
- `docs/architecture/agent-system.md`

## Last handoff commit

None
