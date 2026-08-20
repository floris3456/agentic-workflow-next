# Task progress

## Task ID

TEMPLATE-ROLE-ROUTING-CONTRACT-001

## Status

blocked

## Task-start developer SHA

c6b747f00ad7509c1340fc11fca1466abb8eb1f9

## Review-base developer SHA

c6b747f00ad7509c1340fc11fca1466abb8eb1f9

## Original task brief

Align the developer-side role-routing contract with the template-wide small/heavy-only vocabulary. Keep runtime configuration internal rather than using model/provider names as routing language. Fix the heavy workspace bridge mapping to the existing tracked workspace maintainer, update affected developer agent instruction prose and durable architecture/validation, preserve public safety and exact branch authority, and do not modify or promote `main`.

## Current objective

Developer-side source implementation is complete. Preserve the exact reviewed routing range and obtain canonical branch-push CI evidence when that run is observable; no further developer source change is currently planned.

## Current position

Direct GitHub source implementation was completed and independently read back.

Substantive source head before this progress snapshot:

- `593ce467d7f529978463bbd436b5f36ce040fcf4`

Implemented contract:

- public/instruction routing vocabulary is only `small` and `heavy`;
- developer `small` maps to `small-developer`;
- developer `heavy` maps to `large-developer`;
- workspace `small` maps to `small-workspace-maintainer`;
- workspace `heavy` maps to the existing tracked `workspace-maintainer`;
- the web orchestrator owns route selection and implementation agents do not self-escalate;
- internal runtime configuration fields remain implementation detail and are not routing vocabulary.

No `main` mutation occurred.

## Observed

- Bridge command parsing already accepted only `small|heavy` before this task.
- The prior heavy workspace mapping named `heavy-workspace-maintainer`, which is not present in the tracked template-development agent inventory.
- Developer agent instructional prose used model-specific route descriptions.
- Developer validation hard-coded model/provider identity where stable role-contract validation was more appropriate.
- The first direct architecture rewrite correctly changed the routing facts but compressed unrelated technical documentation too broadly.
- Independent range review caught that documentation regression before the task was accepted.
- Corrective commits restored the unrelated bridge/recovery/security/runtime detail while preserving only the intended small/heavy routing changes.

## Interpretation

The runtime mapping and routing instructions are now aligned. The correction episode was an implementation mistake, not a design change: unrelated architecture detail remains valid and was restored.

The remaining gap is evidence observation only. The repository has canonical push-triggered CI, but the currently available connected GitHub workflow-run lookup does not expose branch-push runs for an exact commit, and no CI pass is being inferred from that limitation.

## Attempts

1. Created the developer task record before source changes.
2. Published one atomic routing change across bridge mapping, developer agent prose, validators, and architecture.
3. Independent exact-range review found overly broad architecture compression.
4. Published corrective commits restoring unrelated technical detail while retaining the intended routing changes.
5. Re-read the final remote source head and full changed range.
6. Attempted to observe exact push CI through the available GitHub workflow-run/status surfaces; no authoritative push-run result was exposed.

## Changed approach

After review exposed over-broad architecture editing, switched from broad rewriting to targeted restoration: keep existing technical documentation and alter only role/routing statements. No runtime routing decision changed.

## Checks

- Exact remote developer head independently re-read: `593ce467d7f529978463bbd436b5f36ce040fcf4` before this snapshot.
- Exact range `c6b747f00ad7509c1340fc11fca1466abb8eb1f9..593ce467d7f529978463bbd436b5f36ce040fcf4` compared remotely.
- Final source readback confirms heavy workspace maps to `workspace-maintainer`.
- Final agent prose identifies small/heavy roles and leaves route selection with the web orchestrator.
- Developer validators now check the small/heavy contract and concrete mapped-agent existence rather than using model names as routing semantics.
- Canonical branch-push CI result: not observed through the currently available connected run/status surface; no pass claimed.

## Blockers / required decisions

No source-design or human decision blocker remains.

Canonical developer push-CI observation is still missing from the currently available evidence surface. This does not justify another source mutation or reimplementation.

## Remaining work

1. Observe and record the canonical developer push-CI result for the final exact developer handoff when an authoritative run view is available.
2. No further developer source mutation is planned for this task unless that check exposes a defect.

## Next action

Return control to the template-maintenance ledger with this exact source range and evidence gap. Continue the authorized Workspace target-rule task without treating the CI-observation limitation as a source blocker.

## Relevant durable records

- `.opencode/agents/small-developer.md`
- `.opencode/agents/large-developer.md`
- `.opencode/skills/task-workflow/SKILL.md`
- `.opencode/skills/git-sync-and-handoff/SKILL.md`
- `tools/opencode-bridge/src/commands.ts`
- `tools/opencode-bridge/src/service.ts`
- `tools/opencode-bridge/AS-BUILT.md`
- `scripts/validate-agent-system.mjs`
- `scripts/validate-web-orchestrator-integration.mjs`
- `docs/architecture/AS-BUILT.md`
- `docs/architecture/agent-system.md`
- `docs/architecture/branch-workflow.md`
- `docs/architecture/opencode-bridge.md`

## Last handoff commit

None
