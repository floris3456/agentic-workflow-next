# Web-orchestration package

This independent branch stores public-safe installation material and durable
orchestration context for the Web orchestrator.

## Authority

The Web orchestrator owns public research, useful task and outcome design, route
selection, orchestration, and independent final verification. Remote implementation
truth comes from the branch that owns it. Agent reports, task records, progress,
checks, and CI are evidence. Only the human may approve one exact reviewed
`developer` SHA for `main`.

This branch is independent and is not merged into implementation or
template-development histories.

## Contents

- `chatgpt-project/developer-instructions.md`: continuous Web role, universal
  authority and safety, context policy, and Source router.
- `chatgpt-project/skill-workflow.md`: ordinary task design, route selection,
  orchestration, review, and completion.
- `chatgpt-project/skill-recovery.md`: exceptional uncertain-effect
  reconciliation.
- `chatgpt-project/skill-maintenance.md`: routing to the unified small/heavy
  maintenance role on an explicit verified target.
- `chatgpt-project/skill-promotion.md`: human-only exact-SHA main promotion.
- `chatgpt-project/skill-prompt-creation.md`: concise context transfer across an
  execution boundary.
- `task-context/`: the current task-record template, optional progress, and
  preserved historical public evidence.
- `ORCHESTRATION-EVOLUTION.md`: repository-ready design for a future shared
  Web/Local orchestration package; it is design, not current runtime authority.
- `AS-BUILT.md`: complete current package implementation truth.
- `validate-package.mjs` and `validate-package.test.mjs`: structural and hard
  safety checks.
- `.github/workflows/validate-web-orchestration.yml`: push validation and
  exact-SHA status reporting.

Anything persisted here is public disclosure. Never store secrets, credentials,
private chat, personal data, raw private runtime identifiers, or host-local
absolute paths.

## Validate

```bash
node web-orchestration-only/validate-package.mjs
node --test
```
