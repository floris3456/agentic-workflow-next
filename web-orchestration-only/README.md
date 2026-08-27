# Web-orchestrator persistence

This independent branch stores concise public-safe continuity and reusable
installation material for the web orchestrator.

## Authority

- These files are orchestration instructions and memory, not authoritative
  implementation evidence.
- Exact implementation facts come from remote `developer` or accepted `main`.
- The web orchestrator owns orchestration, web research, useful task/outcome
  design, route selection, and independent final outcome/system verification.
- Dual Lead and Spark reports, local developer reports, CI, and task progress are
  evidence, not human acceptance.
- Only the human may approve one exact reviewed `developer` SHA for `main`.
- This branch is independent and is not normally merged with implementation
  branches.

## Contents

- `task-context/TEMPLATE.md`: canonical ordinary task-record template for
  consequential work that benefits from durable authority.
- `task-context/<task-id>-progress.md`: optional concise resumable execution state;
  it is never required for every task and never replaces the task-record.
- Historical `task-context/*.md` files: unchanged historical evidence that may
  retain obsolete terminology.
- `chatgpt-project/`: permanent instructions plus five conditionally routed
  Sources for workflow, recovery, template maintenance, promotion, and prompt
  creation.
- `ORCHESTRATION-EVOLUTION.md`: non-runtime design for the later shared Web/Local Orchestrator package; the current Web runtime remains unchanged until that migration is explicitly implemented.
- `validate-package.mjs` and `validate-package.test.mjs`: structural package,
  task-template, public-safety, and CI-posture checks.
- `.github/workflows/validate-orchestration.yml`: ordinary push validation
  with exact-SHA status reporting.

Anything persisted here is public disclosure. Never store secrets, credentials,
private chat details, personal data, raw sensitive values, or host-local absolute
paths.

## Validate

```bash
node web-orchestration-only/validate-package.mjs
node --test
```

Every push to `orchestration` runs the same validator and discovery-mode Node
tests. The workflow has read-only repository access, does not persist checkout
credentials, and publishes its result against the exact pushed SHA.
