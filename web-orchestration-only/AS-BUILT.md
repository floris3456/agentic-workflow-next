# Web orchestration package AS-BUILT

## Scope

This AS-BUILT document describes all code files in `web-orchestration-only/`:
- `validate-package.mjs` — canonical standalone package and structural validator.
- `validate-package.test.mjs` — automated test suite and negative-fixture tests.

## Implemented architecture

### Package validator (`validate-package.mjs`)

`validate-package.mjs` is an executable ES module (Node >= 22.13.0) that validates the structural integrity, inventories, safety invariants, and core semantic boundaries of the `web-orchestration` branch and ChatGPT Project installation package without relying on external dependencies.

It executes the following validations:
1. **Directory inventories and file sanity:**
   - Enforces exact file inventories for the root directory (`AS-BUILT.md`, `README.md`, `chatgpt-project`, `task-context`, `validate-package.mjs`, `validate-package.test.mjs`) and `chatgpt-project/` (`README.md`, `developer-instructions.md`, `skill-workflow.md`, `skill-recovery.md`, `skill-template-maintenance.md`, `skill-promotion.md`, `skill-prompt-creation.md`).
   - Verifies that all required targets are regular files, readable, non-empty, valid UTF-8, and contain no NUL bytes.
   - Enforces directory existence for `chatgpt-project/` and `task-context/`.
2. **Task-context inventory and structure:**
   - Ensures `task-context/` contains required `README.md` and `TEMPLATE.md`, and that any other files are valid Markdown documents matching `^[A-Za-z0-9][A-Za-z0-9._-]{0,127}\.md$`.
   - Validates `task-context/TEMPLATE.md` structure: title `# Task record: <task-id>`, identity field `- Task ID: <task-id>`, and exactly seven canonical sections (`## Accepted outcome`, `## Material scope`, `## Constraints`, `## Required outputs`, `## Required checks`, `## Accepted design`, `## Explicit exceptions`).
   - Rejects the presence of volatile task-progress sections in `task-context/TEMPLATE.md`.
   - Verifies `task-context/README.md` articulates the separation between authoritative task records and resumable execution progress, while preserving historical records without retroactive schema migration.
3. **Project Source routing and structure:**
   - Verifies that the procedure router in `developer-instructions.md` contains exactly one trigger row for each of the five conditionally routed Project Sources (`skill-workflow.md`, `skill-recovery.md`, `skill-template-maintenance.md`, `skill-promotion.md`, `skill-prompt-creation.md`) and no unknown Sources.
   - Ensures each skill file begins with a top-level Markdown title (`# ...`) and contains a `## Trigger` section.
   - Checks that `chatgpt-project/README.md` references each of the five skills exactly once in its installation inventory.
   - Verifies that deterministic rendering placeholders (`<owner>/<repository>`, `https://github.com/<owner>/<repository>`) are present in installation documentation and developer instructions.
4. **Public safety and authority boundaries:**
   - Confirms public-persistence safety rules in `README.md` and `developer-instructions.md`.
   - Confirms that `developer-instructions.md` reserves `developer`-to-`main` promotion exclusively to human exact-SHA approval.
   - Confirms that `skill-recovery.md` prohibits automatic replay of uncertain mutations and mandates evidence-based reconciliation.
   - Confirms that `skill-promotion.md` requires explicit human exact-SHA triggers and prohibits opportunistic modifications or automatic replay.
   - Scans all loaded text files for public-unsafe patterns, rejecting host-local absolute paths, credential/token-like patterns (`sk-...`, `ghp_...`, `github_pat_...`), and private key blocks.

### Package test suite (`validate-package.test.mjs`)

`validate-package.test.mjs` executes under `node --test` using standard Node assertions (`node:assert/strict`), child process execution (`node:child_process`), and temporary directories (`node:os`, `node:fs`).

It verifies:
1. **Passing canonical state:**
   - Validates that the untouched package passes validation cleanly.
2. **CI workflow contract:**
   - Inspects `.github/workflows/validate-web-orchestration.yml` to verify that push validation triggers on branch `web-orchestration`, has read-only repository permissions (`contents: read`), publishes exact-SHA statuses (`statuses: write`), disables credential persistence, runs the canonical package validator and discovery-mode `node --test`, and accesses no secrets.
3. **Negative fixture tests (isolated via temporary directory copies):**
   - Package and Project Source inventory drift (unexpected/missing files).
   - Non-regular files, NUL bytes, invalid UTF-8, and blank files.
   - Acceptance of historical task records with retired schemas and separate task-progress records (`<task-id>-progress.md`).
   - Rejection of invalid filenames in `task-context/`.
   - Missing or unknown routed Sources in `developer-instructions.md`.
   - Malformed skill files missing titles or `## Trigger` sections.
   - Incomplete installation inventories or missing render placeholders.
   - Task template section removal or mixing of execution progress into task records.
   - Weakening of historical truth semantics in `task-context/README.md`.
   - Weakening of the public-persistence safety boundary.
   - Detection of host-local paths or credential tokens in dynamic task-context files.
   - Removal of uncertain-mutation no-replay guards in recovery instructions.
   - Weakening of human exact-SHA promotion authority in developer instructions.
   - Weakening of promotion triggers, opportunistic content bans, or promotion replay safety in promotion instructions.

## Verification

The code files are verified by:
- `node web-orchestration-only/validate-package.mjs`
- `node --test web-orchestration-only/validate-package.test.mjs`
- `node --test` (discovery mode as executed by `.github/workflows/validate-web-orchestration.yml`)
