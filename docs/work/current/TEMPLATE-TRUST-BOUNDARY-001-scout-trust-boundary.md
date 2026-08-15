# Task progress

## Task ID

TEMPLATE-TRUST-BOUNDARY-001

## Status

Needs decision. Safe independent implementation is complete; pinned OpenCode
cannot satisfy the required Scout isolation properties without a materially
larger bridge-owned tool/runtime or separately audited sandbox dependency.

## Task-start developer SHA

e2700f586fe8ab634053eb514bb9da487e881a21

## Review-base developer SHA

e2700f586fe8ab634053eb514bb9da487e881a21

## Original task brief

Implement the developer-owned portion of TEMPLATE-TRUST-BOUNDARY-001 from exact developer SHA e2700f586fe8ab634053eb514bb9da487e881a21. Independently re-inspect current code before editing. Required outcome: (1) replace suffix-based origin acceptance with fail-closed repository identity that parses supported HTTPS, ssh://, and scp-style SSH remotes; authenticates host plus owner/repository; derives acceptable Git host unambiguously from configured GitHub API/repository identity including supported GitHub Enterprise/custom API bases; and rejects deceptive hosts, suffix tricks, malformed paths, misleading userinfo, or ambiguous configuration; (2) create a genuine independent Scout trust boundary in which inspected-ref checkout/reuse/disposal cannot execute Git hooks, inspected-ref or unrelated global OpenCode config/plugins/tools/skills/instructions cannot execute or control startup, trusted Scout instructions/model/permissions/evidence contract are bridge/runtime-owned rather than ref-owned, repository instructions are evidence only, normal read/search launches no LSP/package installer/ref-controlled process/network download, realpath containment blocks symlink escape, and absent/misconfigured hardened runtime fails clearly; (3) preserve exact requested SHA, clean detached view, concurrent read-only Scout requests, durable correlation/recovery/public-safe projection, concise evidence, and normal developer OpenCode behavior. Remove LSP from every Scout contract/validator/doc if it cannot be proven safe. Add focused positive/adversarial tests for legitimate/forged origins, malicious checkout hooks, repo/global extension contamination, trusted-prompt independence, repository instruction injection, no LSP/process side effects, symlink escape, concurrent/recovery behavior, normal developer behavior, and bootstrap/status misconfiguration. Update the task-progress record and all justified AS-BUILT/design/deviation/SECURITY/setup/architecture/agent-system/validator artifacts in the same source work. Do not use existing Scouts as evidence. Do not modify main or web-orchestration, do not promote, force-push, or rewrite shared history. If the pinned OpenCode runtime cannot meet a required isolation property without a materially larger architectural dependency, implement every safe independent fix and return needs decision with exact evidence rather than weakening the property. Run proportional bridge, agent-system, and repository checks. Return exactly: Status:; Handoff developer SHA:; Files changed:; Checks + perceived results:; Blockers/decisions:; Task record:. Status must be completed, blocked, failed, or needs decision; completed requires an exact pushed 40-character developer SHA.

## Current objective

Replace the origin and Scout boundaries with fail-closed, bridge-owned identity and isolation controls while preserving exact-ref, concurrency, recovery, projection, and ordinary developer behavior.

## Current position

Source commit `9ab08b8d338c0764899bb553d50dbe491cdc09bc` is pushed and synchronized.
It contains the exact repository identity boundary, every safe independent Scout
fix, fail-before-OpenCode behavior for new starts and historical inspected-ref
recovery, adversarial tests, validators, reconciled durable records, and the
active deviation. Normal developer OpenCode remains unchanged. Proportional
bridge, agent-system, and full repository checks pass. This record is ready for
the dedicated `needs decision` handoff snapshot.

## Observed

- `tools/opencode-bridge/src/service.ts` normalizes the origin text and accepts owner/repository suffixes without authenticating the remote host.
- `tools/opencode-bridge/src/scout.ts` creates a Git worktree with default Git behavior, resolves the Scout agent from the exact-ref workspace, and allows LSP.
- The existing Scout contract and documentation describe the agent as tracked in the inspected repository.
- Pinned public upstream OpenCode `1.18.16` source at release commit
  `a3647eb025c7615159d417dcc49fc39fdaeba65b` shows built-in `read` calling
  `Instruction.resolve` for nearby repository instructions and unconditionally
  warming LSP. Its config initialization schedules package dependency
  installation for scanned configuration directories.
- Public upstream config/runtime flags disable project config, external plugins,
  and external skills, but they do not remove the read-time instruction resolver,
  LSP warm-up call, or config-directory package installation.
- The operator-local customization paths were not inspected; continuation
  steering explicitly restricted evidence to tracked repository files and public
  upstream source.
- OpenCode available on this host reports `1.18.15`, not the pinned `1.18.16`, so
  it was not used as positive isolation evidence.

## Interpretation

Exact remote identity and Git workspace safety are independently fixable. A
genuine Scout runtime is not fixable through configuration/permissions alone:
using built-in read would weaken explicit instruction, process, and download
properties. Fail-closed unavailability is safer than preserving an unsafe Scout
claim; a bridge-owned in-process evidence tool/runtime or audited sandbox is a
material architecture dependency requiring human selection.

## Attempts

- Evaluated an isolated bridge-managed OpenCode process using project-config
  disablement, isolated global paths, `--pure`, external-skill disablement, and a
  bridge-owned inline agent. Public pinned source showed that built-in `read`
  still resolves nearby instructions and warms LSP, and config startup still
  schedules package installation. This route was abandoned because it cannot
  prove the delegated isolation contract.
- Considered retaining the existing exact-ref server with stricter live agent
  permissions. Abandoned because permissions do not establish configuration or
  prompt provenance and do not suppress the read-time side effects above.

## Changed approach

- Continuation steering required using only tracked files and public/upstream
  evidence; no operator-local global customization was inspected.
- The implementation route changed from launching a configured isolated OpenCode
  Scout to removing the ref-owned agent and making Scout startup/recovery fail
  closed. This follows the delegated brief's explicit instruction to implement
  every safe independent fix and return `needs decision` rather than weaken a
  property when the pinned runtime requires a materially larger dependency.

## Checks

- `git status --short --branch`, `git rev-parse HEAD`, and `git rev-parse origin/developer`: clean synchronized `developer` at the delegated SHA.
- `./scripts/bootstrap-agent-workflow.sh --check`: tracked hooks active.
- `npm test` in `tools/opencode-bridge`: 79 tests passed, including exact public/
  Enterprise/custom API-to-Git identity, legitimate HTTPS/SSH forms, deceptive
  host/userinfo/path cases, fail-before-ref/runtime contamination, hook/fsmonitor
  suppression, exact detached cleanliness, symlink escape disposal, concurrent
  request admission, recovery compatibility, and status unavailability.
- `node scripts/validate-agent-system.mjs`: passed.
- `node scripts/validate-opencode-bridge.mjs`: passed.
- `./scripts/validate-repository.sh`: passed pre-implementation/link,
  agent-system, research/manifest, hooks, bridge contracts, all 79 bridge tests,
  all 8 template-branch tests, and the repository aggregate.
- Source commit/push: `9ab08b8d338c0764899bb553d50dbe491cdc09bc`
  is present at both local `developer` and `origin/developer`.
- Final `./scripts/bootstrap-agent-workflow.sh --check`: tracked hooks active.

## Blockers / required decisions

- Human architecture decision required: approve a bridge-owned in-process
  realpath-contained read/glob/grep tool/runtime, approve a separately audited
  OS/container sandbox/runtime protocol, or select an upstream OpenCode release
  that proves no repository/global instruction or extension loading, no LSP,
  package installer, ref-controlled process, or download side effects.
- Until that decision, new Scout starts fail before checkout/OpenCode contact and
  historical Scout sessions are not contacted or advanced. Direct GitHub evidence
  and normal developer OpenCode remain available.

## Remaining work

- Human architecture decision and exact-remote review.
- After a selected runtime route is delegated, implement and prove that route
  behind the preserved request/state boundary before re-enabling Scout launch.

## Next action

Return control after the dedicated handoff snapshot so the web orchestrator can
review exact remote evidence and obtain the required human architecture decision.

## Relevant durable records

- `tools/opencode-bridge/AS-BUILT.md`
- `docs/architecture/AS-BUILT.md`
- `docs/architecture/design-record.md`
- `docs/architecture/deviations.md`
- `docs/architecture/agent-system.md`
- `docs/architecture/opencode-bridge.md`
- `docs/architecture/deviations.md` (`TEMPLATE-TRUST-BOUNDARY-001`)
- `SECURITY.md`

## Last handoff commit

None
