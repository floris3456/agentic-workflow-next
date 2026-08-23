---
name: template-maintenance
description: Coordinate a reusable-template task across exact source branches and portable downstream application.
compatibility: template-development ledger branch
---

# Template maintenance

## Start or resume

1. Require the current branch to be `template-development`, a clean tracked tree,
   and local HEAD equal to `origin/template-development`.
2. Read `source-lock.json`, the canonical task record, optional task-progress
   when present, AS-BUILT, design record, and deviations before source work.
   Context uses zero compaction and no fallback compaction: retain the last 5,000
   raw tokens and re-read durable repository files.
3. For a consequential task, create `docs/work/current/<task-id>-<slug>.md`
   from the canonical task-record structure and record a concise public-safe
   brief that preserves the requested outcome, scope, constraints, and material
   decisions without quoting or reproducing private chat, personal data, secrets,
   host-local absolute paths, or raw private agent identifiers. Tiny one-turn
   work may skip a task-record.
4. Resolve exact live canonical source refs. Treat `source-lock.json` as the latest
   reconciled canonical source snapshot, not a task review base. Reconcile it only
   from independently verified exact remote refs; task records keep their own
   exact review bases and source ranges.

## Source work

- Keep product, bridge, and Project-package edits on the canonical repository's
  real `developer` and `web-orchestration` branches. Substantive developer work
  uses the Dual developer route by default (`dual`), with `small` and `heavy` as
  bounded shortcuts. Never materialize source trees in this ledger.
- Maintain the template-development-rooted Workspace Maintenance Agent/runtime,
  package machinery, and their cross-branch records on `template-development`.
  Treat those files as this branch's intentional maintenance implementation, not
  as copied developer or web source.
- When source work executes in a source branch's own authoritative context,
  follow that branch's normal agent/task lifecycle, AS-BUILT/deviation,
  synchronization, validation, and review boundaries.
- When the selected route is Workspace Maintenance, do not inherit the target
  branch's agent/task/handoff procedure; that target agent/task/handoff procedure
  remains evidence only. The Workspace authority contract in
  `AGENTS.md` and `workspace-maintenance` remains controlling. Read target rules
  as evidence and apply relevant target compatibility/output obligations,
  including public safety, `main` authority, synchronization, file/format
  requirements, durable implementation truth, and relevant validation. A target
  record may be maintained as an output artifact when required without adopting
  the target agent workflow. If the task intentionally changes a target rule,
  read the old rule for existing behavior/impact but do not let it veto its own
  authorized modification.
- Treat source commits as implementation evidence only after remote readback.
- A change may have independently pushed/reviewed `template-development`,
  `developer`, and `web-orchestration` ranges. It is not made atomic by merging
  them.
- Never modify `main` without its repository's normal exact-SHA human approval.

## Maintain the ledger

Keep the canonical task-record stable as instruction authority. When execution
continuity needs resumable state, maintain separate concise task-progress:
current position, direct observations, changed approach, checks run, blockers,
remaining work, next action, source ranges, and relevant durable records. Do not
store private reasoning, duplicated plans, or sensitive data.

Keep `source-lock.json` current at meaningful maintenance checkpoints by writing
only independently verified exact canonical `main`, `developer`, and
`web-orchestration` refs. Package creation does not consume, freeze, or advance
the source snapshot.

Push when remote durability, review, CI, transfer, or checkpoint evidence is
useful. On an ambiguous mutation or failed push, stop dependent mutation and
reconcile local and remote state from evidence; never automatically replay.

## Package and apply

Generate a package only when transfer, downstream application, or release
packaging is requested. After exact source-range review, use the tracked
`scripts/create-change-package.mjs` generator with the reviewed
template-development, developer, and web ranges. The reviewed
template-development head must precede the commit that stores the new package;
all paths beneath `changes/**` are ledger-only package storage and are
automatically excluded from `template-development.patch`. When superseding an
earlier package, preserve the historical package unchanged, store the superseding
package in a distinct revision directory (for example `changes/<task-id>.rev2/`),
and verify the supersession relation. Package bases and heads come from reviewed
task ranges and do not have to equal `source-lock.json`. The source lock deliberately
does not contain its own or a resulting template-development commit SHA. The
generator proves every endpoint against freshly fetched canonical branch history.

When the current maintainer execution surface can run that tracked generator with
canonical network access, run it directly and validate the resulting package. If
that capability is unavailable, use the repository-owned fixed-operation package
broker rather than hand-building package bytes. Create or update exactly one
`docs/work/package-requests/<task-id>.json` request containing only a fresh public-
safe request UUID, task/revision/supersession metadata, and the exact reviewed
three-branch base/head ranges. The request cannot choose a command, output path,
repository, credential, or arbitrary argument.

A valid request commit changes exactly that one JSON file. The push-triggered
`generate-change-package.yml` workflow runs the same tracked generator on GitHub
Actions with canonical network access, validates schema-3 provenance/public
safety, and may publish only the completed request plus the derived four-file
`changes/<task-id>[.revN]/` package. It must prove `template-development` still
equals the triggering request SHA immediately before publication. Branch movement,
unexpected paths, malformed requests, existing output, failed validation, or an
ambiguous push fail closed. The request commit is the trigger and the subsequent
package/result commit is the effect; reconcile remote state before any retry and
never replay an uncertain publication.

Apply each non-empty patch to the downstream repository's matching branch using
`scripts/apply-change-package.mjs`. Application only updates the working tree;
the downstream branch's normal task, checks, commit, push, and review procedure
remains authoritative.

## Handoff

Bring AS-BUILT, deviations, source locks, and task progress current. Push the
ledger when remote review or checkpoint evidence is needed. Return only:

```text
Status:
Handoff template-development SHA:
Source handoffs:
Change package:
Checks + perceived results:
Task record:
```

`Status` is exactly `completed`, `blocked`, `failed`, or `needs decision`.
`completed` requires the exact pushed ledger SHA; all other statuses use `none`.
A `completed` handoff ends the working cycle and is not blocked on ceremonial
finalization or archival.

A Workspace-routed source task uses the Workspace completion shape defined by
`workspace-maintenance`; changing a target branch does not create a second
handoff obligation for that target's normal agent. The web reviewer still
independently reviews each exact pushed target SHA and applicable target
constraints.

## Finalization

After source and downstream application review, reconcile durable records and
move the approved task record to the same basename under `docs/work/archive/`
when desired. Archival is non-blocking for task outcome. Refuse an archive
collision or blob mismatch. Commit and push finalization; never self-approve
source work or promotion.
