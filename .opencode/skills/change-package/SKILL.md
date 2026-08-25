---
name: change-package
description: Generate, verify, apply, or reconcile deterministic template change-package and source-lock state when explicitly required.
compatibility: small-maintainer and heavy-maintainer
---

# Change packages

Load this skill only for an explicit package, downstream transfer, release, or related `source-lock.json` task.

- Keep source implementation on its canonical branch. `template-development` owns only its maintenance runtime, ledger state, and package machinery; never copy or merge independent source trees into it.
- Establish exact current remote refs before relying on stored SHAs. `source-lock.json` is a reconciled source snapshot, not authority over a task's reviewed package ranges.
- Generate a package only with `scripts/create-change-package.mjs` over exact reviewed `template-development`, `developer`, and `web-orchestration` ranges. Do not hand-build package bytes or weaken provenance checks.
- Package storage under `changes/**` is ledger-only and excluded from portable template-development patch content. A superseding package uses a distinct revision directory and preserves earlier evidence.
- Apply a package only with `scripts/apply-change-package.mjs`. Application may change the matching downstream worktree but never commits, pushes, merges, or promotes it.
- Reconcile `source-lock.json` only from independently verified canonical refs at a meaningful checkpoint. Package creation neither consumes nor advances that snapshot.
- Report exact source ranges, package path when created or applied, validation results, reconciled refs when changed, and any blocker. A package is not required for ordinary maintenance completion.
