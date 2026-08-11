# AS-BUILT: repository workflow

**Status:** Template baseline

## Purpose

This repository is a reusable workflow template rather than a product implementation. Its implemented system consists of OpenCode agent definitions and skills, tracked Git enforcement, deterministic validators, durable record conventions, a research package shape, and an independent web-orchestration persistence branch.

## Implemented boundaries

- `developer` is the active implementation branch and is pushed after every commit.
- `main` is advanced only by the guarded exact-SHA promotion script after human approval.
- `web-orchestration` is an independent root history containing only `web-orchestration-only/**`.
- `small-developer` is the default Luna route; `large-developer` is the exceptional Sol route selected by the web orchestrator.
- Local agents deny subagent/task launches and do not perform orchestration, acceptance, or independent review.
- Tracked hooks block direct `main` changes, branch deletion, non-fast-forward pushes, and continued work after failed synchronization.
- Recovery and promotion scripts fail closed on ambiguous synchronization or authorization evidence.
- Validators check deterministic structure, links, configuration, executable bits, clean research shape, and residual source-project terminology; they do not establish semantic correctness or human acceptance.

## Durable records

Task-progress is temporary process memory. AS-BUILT records current implementation reality. Deviation records capture material intended-versus-actual differences. When implementation changes a fact described by AS-BUILT or a deviation, the record changes in the same commit.

## Verification routes

Run `./scripts/bootstrap-agent-workflow.sh --check` to verify local hook activation, `./scripts/validate-repository.sh` for the complete deterministic check, and `node scripts/validate-research.mjs` for research-only checks. Inspect remote refs with Git before treating a branch or commit as evidence.

This file describes the template baseline. Future project components should add their own AS-BUILT records at the component location defined in [`repository-layout.md`](repository-layout.md).
