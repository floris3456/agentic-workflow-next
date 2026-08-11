# Branch workflow

## Semantics

| Branch | Meaning | Normal writer |
| --- | --- | --- |
| `developer` | Active shared implementation and task-progress | Delegated OpenCode developer |
| `main` | Exact implementation deliberately accepted by the human | Luna through guarded promotion after approval |
| `web-orchestration` | Web-orchestrator-only persistent task context | Web orchestrator through connected GitHub MCP |

## Developer synchronization

Every commit on `developer` is pushed immediately. A failed push creates a local failure marker and stops further implementation commits until an auditable recovery restores synchronization.

The post-commit hook attempts `git push origin developer`. The pre-commit hook never clears a failed-push marker merely because the current head matches its upstream; only directed recovery may clear it after proving that the recorded failed commit is present in synchronized local and remote history. The pre-push hook rejects ordinary direct pushes to `main`, branch deletion, and non-fast-forward updates.

Recovery validates the marker and restores a discarded local branch only by fast-forwarding it to the recorded failed commit. It then uses fast-forward operations when either side contains the other. True divergence may be resolved only by the repository recovery script creating one exact-head, non-conflicting two-parent merge whose parents are the failed local head and the fetched remote head. The merge is pushed as a fast-forward. The marker clears only when both refs match and their history contains the originally recorded failed commit. Conflicts, missing commits, ambiguous local movement, or concurrent ref movement retain the failure state and stop recovery.

## Review ranges

The final handoff snapshot commit may change only task-progress, so it is not the review unit.

- First review: task-start `developer` SHA through current handoff SHA.
- Later review: last reviewed SHA through current handoff SHA.
- Finalization review: substantive-approval SHA through finalization SHA.

The web orchestrator records these boundaries in its task context.

## Human acceptance

After implementation and finalization reviews pass, the web orchestrator asks the human to approve the exact final `developer` SHA. A branch name alone is not approval. If `developer` advances, approval is stale.

## Promotion

Promotion is a no-edit operation rather than an implementation task. It creates no task-progress file, task update, or handoff snapshot, because any such commit would invalidate exact-SHA approval. Luna runs:

```bash
./scripts/promote-developer-to-main.sh <approved-developer-sha>
```

The script:

1. requires a clean checkout and synchronized refs;
2. verifies `origin/developer` equals the approved SHA;
3. checks out and fast-forwards local `main` to `origin/main`;
4. creates an explicit `--no-ff` merge without content changes;
5. pushes `main` through a narrowly scoped promotion marker;
6. fast-forwards `developer` to the accepted merge commit; and
7. pushes `developer`; and
8. can resume the same exact promotion if `main` succeeded but developer synchronization failed.

Any conflict or unsafe ref movement aborts. The merge must have exactly two parents, the exact previous `main` first parent, and the exact approved `developer` second parent and tree. Before pushing `main`, the script durably records those three identities in a local pending marker. If the push reports failure, that evidence and the local merge are discarded only after a fresh successful fetch proves `main` remains at the previous SHA and `developer` remains at the approved SHA; an unavailable or different remote state retains both and fails closed. Resumption requires the exact marker and rejects a structurally similar merge without matching evidence. The marker blocks commits until both remote branches are verified at the accepted merge. Promotion never contains cleanup or opportunistic edits.

## `web-orchestration`

Its current tree contains only `web-orchestration-only/**`. It is not synchronized with implementation branches and is never a source of code or implementation truth.
