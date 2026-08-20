---
name: template-maintenance
description: Coordinate a compaction-safe reusable-template task across exact source branches and portable downstream application.
compatibility: template-development ledger branch
---

# Template maintenance

## Start or resume

1. Require the current branch to be `template-development`, a clean tracked tree,
   and local HEAD equal to `origin/template-development`.
2. Read `source-lock.json`, the not-yet-finalized task record, AS-BUILT, design
   record, and deviations before source work.
3. For a new task, create
   `docs/work/current/<task-id>-<slug>.md` from the task template first and record
   a concise public-safe brief that preserves the requested outcome, scope,
   constraints, and material decisions without quoting or reproducing private
   chat, personal data, secrets, host-local absolute paths, or raw private agent
   identifiers.
4. Resolve exact live canonical source refs. Treat `source-lock.json` as the latest
   reconciled canonical source snapshot, not a task review base. Reconcile it only
   from independently verified exact remote refs; task records keep their own
   exact review bases and source ranges.

## Source work

- Keep product, bridge, and Project-package edits on the canonical repository's
  real `developer` and `web-orchestration` branches. Use a bounded direct connected-GitHub route when
  proportionality makes it the shortest safe remotely provable route; otherwise
  use isolated source worktrees when local repository context/tools materially
  help. Never materialize source trees in this ledger.
- Maintain the template-development-rooted Workspace Maintenance Agent/runtime,
  package machinery, and their cross-branch records on `template-development`.
  Treat those files as this branch's intentional maintenance implementation, not
  as copied developer or web source.
- Follow each source branch's own agent instructions, task lifecycle, AS-BUILT,
  deviations, push recovery, and review boundaries regardless of execution
  route.
- Treat source commits as implementation evidence only after remote readback.
- A change may have independently pushed/reviewed `template-development`,
  `developer`, and `web-orchestration` ranges. It is not made atomic by merging
  them.
- Never modify `main` without its repository's normal exact-SHA human approval.

## Maintain the ledger

Keep the not-yet-finalized task record useful after compaction: exact current
position, direct observations, interpretations, attempts, changed approach,
checks, blockers, remaining work, next action, source ranges, and relevant
durable records. Do not store private reasoning or sensitive data.

Keep `source-lock.json` current at meaningful maintenance checkpoints by writing
only independently verified exact canonical `main`, `developer`, and
`web-orchestration` refs. Package creation does not consume, freeze, or advance
the source snapshot.

Push every ledger commit immediately to `origin/template-development`. On a
failed push, stop mutation and use the directed recovery script; never claim a
local-only SHA as a handoff.

## Package and apply

After exact source-range review, run `scripts/create-change-package.mjs` with the
reviewed template-development, developer, and web ranges. The reviewed
template-development head must precede the commit that stores the new package;
all paths beneath `changes/**` are ledger-only package storage and are automatically
excluded from `template-development.patch`. When superseding an earlier package,
preserve the historical package unchanged, store the superseding package in a
distinct revision directory (e.g. `changes/<task-id>.rev2/`) using
`--supersedes changes/<package-directory>`, and verify the supersession relation.
Package bases and heads come from reviewed task ranges and do not have to equal
`source-lock.json`. The source lock deliberately does not contain its own or a
resulting template-development commit SHA. The generator proves every endpoint
against freshly fetched canonical branch history. Commit the generated package
directory and verify it with the validator.

Apply each non-empty patch to the downstream repository's matching branch using
`scripts/apply-change-package.mjs`. Application only updates the working tree;
the downstream branch's normal task, checks, commit, push, and review procedure
remains authoritative.

## Handoff

Bring AS-BUILT, deviations, source locks, and task progress current, then create
and push a dedicated task-progress snapshot commit. Its successful push ends the
working cycle. Return only:

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
A `completed` handoff ends the working cycle but does not by itself finalize or
archive the task record.

## Finalization

After source and downstream application review, reconcile durable records and
move the exact approved task blob unchanged to the same basename under
`docs/work/archive/`. This move is the transition from not-yet-finalized to
finalized. Refuse an archive collision or blob mismatch. Commit and push
finalization; never self-approve source work or promotion.
