# Contributing

This template governs implementation behavior, not product feature scope.

## Before implementation

1. Start from a clean `developer` checkout that matches `origin/developer`.
2. Run `./scripts/bootstrap-agent-workflow.sh --check`.
3. On a generated fresh repository, run `./scripts/initialize-template-branches.sh` once before local implementation.
4. Read `AGENTS.md`, `README.md`, and the current architecture records.
5. For consequential work, use a canonical `docs/work/current/<task-id>-<slug>.md` task-record.

## During implementation

- Follow root instructions and exact Git state.
- Use proportional validation rather than full sweeps for tiny changes.
- Run ordinary checks (`node --test`, targeted scripts, linters where relevant).
- Keep AS-BUILT and applicable deviations current when implementation facts change.

## Promotion

Do not use normal implementation commits to promote `main`.
After human approval, run:

```bash
./scripts/promote-developer-to-main.sh <approved-developer-sha>
```

Promotion is exact-SHA and non-substantive to the task route.

## Validation

```bash
./scripts/validate-repository.sh
```
