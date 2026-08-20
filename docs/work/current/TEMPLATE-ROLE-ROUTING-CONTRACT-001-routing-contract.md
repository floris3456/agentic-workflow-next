# Task progress

## Task ID

TEMPLATE-ROLE-ROUTING-CONTRACT-001

## Status

in_progress

## Task-start developer SHA

c6b747f00ad7509c1340fc11fca1466abb8eb1f9

## Review-base developer SHA

c6b747f00ad7509c1340fc11fca1466abb8eb1f9

## Original task brief

Align the developer-side role-routing contract with the template-wide small/heavy-only vocabulary. Keep runtime configuration internal rather than using model/provider names as routing language. Fix the heavy workspace bridge mapping to the existing tracked workspace maintainer, update affected developer agent instruction prose and durable architecture/validation, preserve public safety and exact branch authority, and do not modify or promote `main`.

## Current objective

Make developer-side routing accept and describe only `small` and `heavy`, with every bridge selector resolving to an actual tracked agent on the appropriate source branch.

## Current position

Direct GitHub source route selected by the web orchestrator under the active reusable-template maintenance task. No developer source file has been changed yet for this task.

## Observed

- Bridge command parsing already accepts only `small|heavy`.
- Developer mapping is `small-developer` / `large-developer`.
- Workspace mapping currently names `heavy-workspace-maintainer`, but the tracked template-development inventory instead contains the existing `workspace-maintainer` heavy role.
- Developer agent instructional prose still uses model-specific descriptions rather than small/heavy role language.
- `scripts/validate-agent-system.mjs` hardcodes model/provider specifics instead of validating the stable routing role contract.

## Interpretation

Public/instruction routing should be stable small/heavy language. Concrete runtime configuration remains implementation detail. The safest heavy workspace correction is a bridge mapping change to the existing tracked workspace role, not a cosmetic agent-file rename.

## Attempts

None before this source boundary.

## Changed approach

None.

## Checks

Pending source implementation and canonical developer validation.

## Blockers / required decisions

None.

## Remaining work

1. Update bridge heavy workspace mapping.
2. Update small/heavy developer agent instructional prose.
3. Remove model-specific routing assertions from developer validation and add mapping/role checks.
4. Update durable architecture where it describes the routing contract.
5. Review exact developer source range and canonical validation evidence.

## Next action

Apply the bounded developer-side routing edits from exact remote state.

## Relevant durable records

- `.opencode/agents/small-developer.md`
- `.opencode/agents/large-developer.md`
- `tools/opencode-bridge/src/commands.ts`
- `tools/opencode-bridge/src/service.ts`
- `scripts/validate-agent-system.mjs`
- `docs/architecture/agent-system.md`
- `docs/architecture/opencode-bridge.md`

## Last handoff commit

None
