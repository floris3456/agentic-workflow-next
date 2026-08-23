# Task progress

## Task ID

TEMPLATE-DIRECT-HOST-ORCHESTRATION-001

## Public-safe task brief

Resumable execution state for the accepted Direct Host, Dual Developer, Instruction Minimalism, bridge-retirement, and AgentMemory migration. Canonical scope and constraints remain in the live task records.

## Current position

- The independent Direct Host repository identity and native OpenCode substrate are established.
- Direct Git commit, push, exact readback, no-replay reconciliation, and template CI are proven.
- Native Dual opt-in is proven on `developer`: lead architecture -> Spark implementation -> lead defect finding -> Spark correction -> lead re-review -> ordinary checks -> push/readback/CI.
- `developer` is remotely at `aa46a2820864abbf8ec7264e9150afded09d133d`; the follow-up hardening makes Spark external-directory access fail closed and has successful ordinary CI.
- Instruction Minimalism is in progress. An uncommitted developer-worktree cutover effect exists from Spark execution and must be reviewed/recovered rather than recreated.

## Material observations

- Project instruction injection caused obsolete repository workflow instructions to interfere with the accepted migration; clean-room OpenCode execution with project instruction injection disabled was therefore used for the migration session only.
- Headless `external_directory: ask` can block Spark indefinitely; the retained developer configuration now uses `deny`.
- Successive OpenCode parent CLI exits left child sessions active in a shared legacy runtime, briefly creating overlapping Spark writers. Mutation was stopped and the affected session records were retired before further review.
- A later attempt to stop the interfering legacy runtime caused the authorized Remote Desktop Commander device to disconnect before the stop result could be confirmed. Treat that host-side stop as ambiguous and do not replay it.
- Remote Git proves no Instruction Minimalism commit escaped after the disconnect.

## Checks already run

- Native Dual opt-in proof completed with focused tests, full `scripts/validate-repository.sh`, push/readback, and successful normal developer CI.
- Developer permission hardening at `aa46a2820864abbf8ec7264e9150afded09d133d` passed focused structural checks and normal developer CI.
- Exact remote refs before this progress checkpoint: `developer` `aa46a2820864abbf8ec7264e9150afded09d133d`, `web-orchestration` `e12cea6092ea6bd66d5b1451e488d38e229bc47d`, and unchanged `main` `6127611113dfdb66f93a0cfd2d355359aa370833`.

## Blocker

The authorized Direct Host device is currently offline after the ambiguous legacy-runtime stop. The existing uncommitted Instruction Minimalism effect is host-local, so safe continuation requires reconnecting and reconciling that exact effect first.

## Remaining work

- After reconnection, inspect the legacy runtime/process state, developer worktree/diff, local Git, and exact remote Git before any retry.
- Continue the existing developer cutover effect through one sequential lead review/Spark correction path; do not restart it from the remote baseline.
- Complete the required web-orchestration and template instruction cutover as separate sequential branch passes and independently review their exact remote results.
- Run one representative substantive implementation through the operative Dual workflow and web final review.
- Retire obsolete bridge/runtime/Workspace and package Action/request-broker machinery while retaining deterministic change-package generator/provenance capability.
- Implement AgentMemory as an advisory non-blocking enhancement, then perform the final comprehensive repository review and corrections.
- Leave `main` unchanged and leave the historical-public-residue decision to explicit human authority.

## Next action

After the device reconnects, reconcile rather than replay the ambiguous runtime stop and the existing developer cutover diff, then continue that effect through developer-side review and ordinary checks.
