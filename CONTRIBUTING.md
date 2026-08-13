# Contributing

This repository uses a serialized, human-directed implementation workflow. It is a template: adopt a project-specific product scope only through the normal human and web-orchestrator process.

## Before implementation

1. Begin from a clean checkout whose `developer` branch matches `origin/developer`.
2. Run `./scripts/bootstrap-agent-workflow.sh --check`; run it without `--check` once per clone to activate tracked hooks.
3. On a newly generated all-branch repository, run `./scripts/initialize-template-branches.sh` before any implementation; never use it to rewrite established unrelated history.
4. If using GitHub-mediated delegation, run `./scripts/bootstrap-opencode-bridge.sh --check --config <operator-config>`.
5. Read `AGENTS.md` and load the skills triggered by the task.
6. Use the stable task ID supplied by the web orchestrator.
7. Create `docs/work/current/<task-id>-<slug>.md` from the task-progress template before substantive work.

## During implementation

- Preserve the exact public-safe delegated task brief verbatim in the task-progress file.
- Keep AS-BUILT and applicable deviation records continuously accurate.
- Put an implementation-record update in the same commit as the implementation fact it describes.
- Push every commit immediately. Do not accumulate local commits while synchronization is broken.
- Prefer corrective commits or `git revert` over rewriting pushed history.
- Use one repository-mutating task at a time.

## Returning control

Before a normal developer response:

1. Finish the current bounded activity.
2. Bring AS-BUILT and deviations current.
3. Bring task-progress current.
4. Create a dedicated handoff snapshot commit.
5. Push successfully.
6. Return only the six fields in `docs/work/templates/developer-response-template.md`, including exact pushed handoff SHA or `none`.

A failed push is the sole exception. Report it as an unsuccessful synchronization handoff and stop implementation.

## Review and finalization

The web orchestrator reviews the exact remote commit range independently. Developer notes are navigation, not proof.

After substantive approval, the implementing developer:

1. reconciles AS-BUILT, deviations, design, and other durable records;
2. verifies the task-progress file still has the exact blob approved by the web orchestrator;
3. refuses to overwrite an existing same-name archive file;
4. moves task-progress without editing it to the same basename under `docs/work/archive/`;
5. commits and pushes finalization; and
6. returns the finalization form identifying the archived task record.

Archived task-progress is immutable, public-safe benchmark history, not an active task or an authoritative implementation record. Correct durable records separately; never rewrite an archived task file.

The web orchestrator reviews the finalization range before asking the human to accept an exact `developer` SHA.

## Promotion to `main`

After explicit human approval of an exact `developer` SHA, the Luna/small developer runs:

```bash
./scripts/promote-developer-to-main.sh <approved-developer-sha>
```

Promotion is mechanical and is not a normal implementation task. Do not create or update task-progress or make a handoff snapshot before running it. It must not introduce content changes. Any conflict aborts promotion and returns work to the normal `developer` workflow. If only post-`main` developer synchronization fails, rerun the same command with the same approved SHA; do not commit.

## Validation

```bash
./scripts/validate-repository.sh
./scripts/validate-opencode-bridge.sh
```
