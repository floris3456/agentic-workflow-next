# Current agent-system design record

**Status:** current reference design for this template

## Decision

This repository uses a human-controlled web-orchestrated implementation system with exact remote evidence and serialized local developers.

- The human is the acceptance authority.
- Remote Git is authoritative repository evidence.
- The ChatGPT web orchestrator designs tasks, routes agents, steers implementation, and independently reviews exact remote commit ranges.
- OpenCode agents implement bounded tasks on `developer`; they do not orchestrate or review.
- `main` contains exact implementation explicitly accepted by the human.
- `web-orchestration` is an orphan-style branch containing public-safe task context, routing memory, and generalized Project installation sources.
- jCodeMunch scouts code symbols only.
- Relevance/indexing tools are scouting aids only; they are not access controls.
- Raw external evidence remains readable but immutable.
- All Git persistence is public-safe.

## Local agents

The normal implementation route uses `small-developer` (GPT 5.6 Luna, maximum supported applicable reasoning tier). `large-developer` (GPT 5.6 Sol, high effort) is selected only by the web orchestrator after two substantive Luna failures or for exceptional intrinsic complexity. Environmental failures, external blockers, missing information, and poor task design do not consume attempts.

This routing rule is an orchestration policy, not a permanent validator rule about the number of files under `.opencode/agents/`.

## Continuity

Task-progress preserves procedural context and the public-safe delegated brief. AS-BUILT preserves current implementation truth and is also live developer memory. Deviations preserve material intended-versus-actual differences. AS-BUILT and deviations change atomically with implementation commits.

The web orchestrator keeps per-task context and routing records on the independent branch when MCP-ON GitHub write capability is available. The branch also provides a public-safe Project installation package; installed private Project state remains outside Git.

## Synchronization and handoff

Every developer commit is pushed immediately. A failed push stops implementation and blocks further commits. Before normal return of control, the developer pushes a dedicated task-progress snapshot commit and responds with only the five-field contract. The web orchestrator reviews the whole range, not only the snapshot.

## Acceptance

After substantive review, finalization, and targeted finalization review, the human may approve an exact `developer` SHA. Luna performs a guarded local `--no-ff` merge to `main` without content changes, then synchronizes `developer` to the accepted merge.

## Validation

Validators enforce only deterministic structure and references. Semantic record correctness, implementation quality, attempt classification, escalation, and human acceptance remain reasoning/judgment controls.

## Scope

This record describes the reusable workflow only. It does not decide a future project's product architecture, legal purpose, privacy policy, operational risk, or deployment plan.
