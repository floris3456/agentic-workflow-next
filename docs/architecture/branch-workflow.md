# Branch workflow

## Branch semantics

| Branch | Meaning | Normal writer |
| --- | --- | --- |
| `developer` | Active implementation and durable task coordination | Local OpenCode routes |
| `main` | Exact state explicitly approved by human | Promotion script only |
| `orchestration` | Paired Web/Local Orchestrator runtimes and public orchestration continuity | Orchestrator / Workspace Maintainer for instruction structure |
| `workspace` | Workspace Maintainer runtime, workspace architecture, source lock and package machinery | Workspace Maintainer |

## Main promotion

Main accepts only exact-SHA promotion via `./scripts/promote-developer-to-main.sh` after human approval.

## Route and synchronization policy

- Dual (`lead-developer` + `spark-implementer`) is the default substantive route for non-trivial work.
- `small-developer` and `heavy-developer` are bounded direct shortcuts.
- No automatic replay of uncertain operations: inspect exact local/remote Git state before retrying.
- Push, checkpoint, and transfer commits are for useful synchronization/review/recovery moments, not a fixed per-commit ceremony.

## Fresh-template branch repair

`./scripts/initialize-template-branches.sh` preserves existing established histories and only repairs fresh-template unrelated root states that pass integrity checks and have no active task record blocking repair.
