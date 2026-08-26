# Evolution to shared orchestration

## Status

Design only. The current `web-orchestration` branch/package remains the active Web Orchestrator implementation. Do not rename/generalize it or claim a Local Orchestrator runtime until a later human-approved implementation task.

## Goal

Future `orchestration` should contain one Orchestrator instruction system with two installation variants: Web and Local. They should share the same role, authority, owner/route selection, task continuity, recovery, template-maintenance, promotion, and ordinary prompt-creation behavior.

Do not create two orchestration architectures or a runtime capability router. The variant should change only behavior that genuinely differs.

## Shared core

The shared core should preserve the current validated Web architecture:

- Orchestrator owns research, task/outcome design, route selection, orchestration, and independent final verification.
- Reusable template structure is Template Maintainer-owned in every worktree; actual project implementation/content is Developer-owned.
- Dual is the default substantive Developer route; Small/Heavy are bounded shortcuts only.
- Developer-discovered template concerns go to the Orchestrator backlog and require post-task human approval before Template Maintainer execution.
- Lead remains the developer brain in Dual; the Orchestrator does not duplicate Lead/Spark internals.
- Uncertain mutations are reconciled before retry and one mutating route remains active at a time.
- Human exact-SHA authority remains required for `main`.
- The five ordinary conditional Sources remain shared unless implementation proves a real procedural difference.

## The only intended variant differences

### Web

Use the Web deployment's existing web-research capability for public web research. Web may create ordinary prompts and prompt packages when the installed Web capability/procedure supports them.

### Local

Use the connected Tavily MCP for public web research. Do not substitute another search route merely because one is available.

Local may create ordinary ready-to-use prompts through the shared prompt-creation procedure, but it does not create prompt packages. Any prompt-package capability/procedure remains Web-only and should not be installed into the Local variant.

Apart from those two differences, Local should inherit the same orchestration instructions and conditional Sources as Web. Do not invent Local-specific filesystem/process/Git behavior merely from the word “Local”; tool permissions/configuration may differ mechanically, but prose should diverge only when an actual required behavior differs.

## Proposed package shape

When implemented, prefer deterministic composition rather than duplicated files:

```text
orchestration-only/
  shared/developer-instructions.md
  variants/web.md
  variants/local.md
  sources/skill-workflow.md
  sources/skill-recovery.md
  sources/skill-template-maintenance.md
  sources/skill-promotion.md
  sources/skill-prompt-creation.md
```

Install shared permanent instructions plus exactly one tiny variant fragment and the shared Sources. If prompt packages need separate procedural content, keep that content Web-only rather than burdening the shared prompt Source with Local-only prohibitions.

## Later implementation sequence

1. Start from the then-current validated `web-orchestration` state; do not redesign Web and generalize simultaneously.
2. Create the new `orchestration` branch/package without rewriting current branch history.
3. Extract shared permanent instructions and shared Sources while proving the rendered Web variant preserves the accepted Web behavior.
4. Add the Local variant with only the Tavily-search requirement and prompt-package prohibition.
5. Validate each rendered variant mechanically: expected Source inventory, required variant fragment, public-safety/human authority, and absence of capabilities the variant must not expose. Do not validate exact prose.
6. In a coordinated Template Maintainer task, update template source-lock/package references from the old Web branch/package identity to the new orchestration identity. Preserve historical package manifests/records unchanged.
7. Move installed consumers to the new package, verify both variants, then retire the old Web-only name only when no active consumer depends on it.

The implementation should not add a runtime selector, generalized capability registry, or separate Web/Local workflow copies. If a future real tool difference requires a procedural split, add the smallest variant-specific instruction at that time.
