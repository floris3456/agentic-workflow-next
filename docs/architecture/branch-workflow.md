# Branch workflow

## Branch semantics

| Branch | Meaning | Normal writer |
| --- | --- | --- |
| `developer` | Active implementation and durable task coordination | Local OpenCode routes |
| `main` | Exact state explicitly approved by human | Promotion script only |
| `web-orchestration` | Retained orchestration/installation branch | Human-controlled installation/state tools |

## Main promotion

Main accepts only exact-SHA promotion via `./scripts/promote-developer-to-main.sh` after human approval.

## Route and synchronization policy

- Dual (`lead-developer` + `spark-implementer`) is the default substantive route for non-trivial work.
- `small-developer` and `heavy-developer` are bounded direct shortcuts.
- No automatic replay of uncertain operations: inspect exact local/remote Git state before retrying.
- Push, checkpoint, and transfer commits are for useful synchronization/review/recovery moments, not a fixed per-commit ceremony.

## Template repair

`./scripts/initialize-template-branches.sh` preserves existing established histories and only repairs fresh-template unrelated root states that pass integrity checks and have no active task record blocking repair.
