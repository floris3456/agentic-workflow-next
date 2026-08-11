# Contributing

This repository uses a serialized, human-directed implementation workflow. It is a template: adopt a project-specific product scope only through the normal human and web-orchestrator process.

## Before implementation

1. Begin from a clean checkout whose `developer` branch matches `origin/developer`.
2. Run `./scripts/bootstrap-agent-workflow.sh --check`; run it without `--check` once per clone to activate tracked hooks.
3. Read `AGENTS.md` and load the skills triggered by the task.
4. Use the stable task ID supplied by the web orchestrator.
5. Create `docs/work/current/<task-id>-<slug>.md` from the task-progress template before substantive work.

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
6. Return only the five fields in `docs/work/templates/developer-response-template.md`.

A failed push is the sole exception. Report it as an unsuccessful synchronization handoff and stop implementation.

## Review and finalization

The web orchestrator reviews the exact remote commit range independently. Developer notes are navigation, not proof.

After substantive approval, the implementing developer:

1. reconciles AS-BUILT, deviations, design, and other durable records;
2. removes temporary procedural residue;
3. deletes the task-progress file;
4. commits and pushes finalization; and
5. returns the finalization form identifying the deleted task record.

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
```
