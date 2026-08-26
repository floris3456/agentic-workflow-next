# Web orchestration package AS-BUILT

## Branch role

`web-orchestration` is the public installation/continuity branch for the Web Orchestrator. It owns the Project instruction package, conditional Sources, public-safe task continuity, package validator/tests, and push validation. It is independent from `developer`, `template-development`, and `main` and is not implementation truth for those branches.

## Project instruction architecture

`chatgpt-project/developer-instructions.md` is the only permanent Project instruction body. It defines the Web Orchestrator role, research ownership, remote-Git/human authority, public-safety/evidence rules, one-mutating-route/no-replay boundary, 5,000-token no-compaction continuity rule, and the five-Source router. Conditional procedure is not duplicated into permanent context.

The five Sources are:

- `skill-workflow.md`: ordinary research/task design, owner/route selection, Developer orchestration, template-concern backlog handling, review, and completion. Orchestrator owns research. Reusable template structure routes to Template Maintainer; actual project work routes to Developer. Dual is the default substantive Developer route, with Small/Heavy only bounded shortcuts. In Dual, Lead is the developer brain and Web does not duplicate Lead/Spark internals or require routine full-diff transmission.
- `skill-recovery.md`: exceptional reconcile-before-replay procedure for uncertain execution/Git/publication effects. It inspects the existing route/effect, absorbs an effect that already exists, and permits retry only when duplication is excluded; switching Developer route or Maintainer capacity does not resolve uncertainty.
- `skill-template-maintenance.md`: human-approved reusable-template work. One Template Maintainer role has `small-maintainer` and `heavy-maintainer` capacity variants from `template-development`; the target may be any authorized worktree. Template-owned structure stays separate from Developer-owned project implementation, and package/source-lock procedure is conditional rather than ordinary maintenance context.
- `skill-promotion.md`: human-triggered exact reviewed Developer-SHA promotion only, with fresh ref checks, no opportunistic content/replay, and exact remote verification.
- `skill-prompt-creation.md`: destination-aware context transfer that preserves Observed/Interpretation/Requested-outcome distinctions, carries only mission-specific state, and omits workflow the receiver already owns.

## Task continuity

`task-context/TEMPLATE.md` defines the canonical ordinary task record when durable authority is useful. Optional `<task-id>-progress.md` is resumable execution state, never task authority. Historical task records remain unchanged evidence rather than being migrated to current terminology.

`task-context/template-maintenance-backlog.md` is separate pending-decision continuity for reusable-template concerns discovered during project work. It carries only public-safe observation/source evidence and affected template surface. It cannot authorize maintenance: after the project task, Web presents pending items to the human; approved items transfer to the canonical `template-development` task record.

## Validator and tests

`validate-package.mjs` is a dependency-free structural/safety validator. It enforces the root and five-Source inventories, regular readable UTF-8 files, current task-template structure, task/progress separation, one router row per Source, installation placeholders/inventory, public-persistence safety, human exact-SHA promotion authority, recovery no-replay, promotion no-opportunistic-content/no-replay, and repository-wide public-unsafe pattern rejection. It validates durable concepts and mechanical structure rather than exact role prose.

`validate-package.test.mjs` verifies canonical success, the read-only-except-status CI contract, and isolated negative fixtures for inventory/file-sanity drift, task history/template boundaries, Source routing/structure, render placeholders, public-safety loss, unsafe dynamic context, recovery replay weakening, and promotion-authority weakening.

`.github/workflows/validate-web-orchestration.yml` validates pushes to `web-orchestration`, checks out without persisted credentials, runs the canonical validator plus discovery-mode Node tests, uses read-only contents permission, and publishes an exact-SHA status.

Verification routes:

```bash
node web-orchestration-only/validate-package.mjs
node --test web-orchestration-only/validate-package.test.mjs
node --test
```

## Future orchestration design

`ORCHESTRATION-EVOLUTION.md` is non-runtime design only. It records the planned later move to one shared Orchestrator with a tiny Web\/Local variant delta; it does not change the active Web Project package.
