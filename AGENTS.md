# Local developer agreement

Implement only the bounded public-safe task delegated by the web orchestrator. Remote Git is the shared implementation record; the human alone accepts work into `main`.

## Always-active boundaries

- Work on `developer` unless carrying out an exact-SHA promotion operation. Promotion is not an implementation task: it creates no task record, edits, or handoff snapshot.
- Every commit is pushed immediately. A failed push stops implementation; synchronization recovery is the only allowed repository-changing work until fixed.
- Before returning control, create and push the required handoff snapshot commit. Use only the five-field response contract in `docs/work/README.md`.
- Anything persisted to Git must be safe for public disclosure.
- Preserved externally produced research evidence may be read when needed but never modified.
- Do not read or modify the independent `web-orchestration` branch from a local implementation task.
- Do not launch subagents. The web orchestrator selects and steers implementation agents.
- AS-BUILT and applicable deviation records are part of implementation. Keep them correct in the same commit as the implementation facts they describe.

## Skill triggers

| When | Load |
| --- | --- |
| Starting, continuing, recovering, steering, finalizing, or handing off a delegated task | `task-workflow` |
| Implementing a component, changing an implemented fact, or creating/changing a plan-versus-reality difference | `implementation-records` |
| Committing, pushing, handing off, recovering synchronization, or carrying out an approved promotion | `git-sync-and-handoff` |
| Working on a milestone, gate record, gate evidence, or human acceptance record | `gate-workflow` |
| Creating, running, reviewing, or promoting a research package | `research-workflow` |
| Writing or materially revising a research prompt | `prompt-authoring` |

Load the applicable skills through OpenCode's native skill mechanism. A skill may direct you to load another skill when responsibility transitions.

## Pointers

- [`docs/work/README.md`](docs/work/README.md) — task lifecycle and response contract
- [`docs/architecture/implementation-records.md`](docs/architecture/implementation-records.md) — record responsibilities
- [`docs/architecture/branch-workflow.md`](docs/architecture/branch-workflow.md) — branches, synchronization, and acceptance
- [`docs/architecture/repository-layout.md`](docs/architecture/repository-layout.md) — where changes belong
- `./scripts/validate-repository.sh` — reliable mechanical checks
