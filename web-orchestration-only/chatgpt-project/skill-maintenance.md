# Unified maintenance routing

## Trigger

Use when a bounded task should run through the template-development-rooted
maintenance runtime, including work on `template-development` itself, another
verified authorized worktree, or explicit package/source-lock maintenance.

## Route

Re-establish the exact remote `template-development` ref and the exact target
branch/ref. The operating abstraction is:

**maintenance capacity + explicit verified target + bounded outcome**

Choose `small-maintainer` for easy bounded work. Choose `heavy-maintainer` for
difficult, subtle, important, or risky bounded work. They are capacity variants
of one role, not different workflows and not an escalation ladder.

Give the selected agent:

- the exact template-development version to run;
- one explicit authorized target;
- the bounded observable outcome and scope limits;
- material authority, compatibility, durable-truth, and validation constraints;
- whether durable non-`main` publication is required; and
- the evidence needed back.

Do not copy the maintenance agent's internal execution contract into the handoff.
Do not create separate template-versus-workspace identities, route through target
agent instructions, or require a second target-agent ceremony after one
maintenance result.

## Packages and source lock

Ordinary maintenance does not need a package. When the accepted task explicitly
requires package generation, downstream application, release transfer, or
`source-lock.json` reconciliation, state that requirement so the agent loads its
`change-package` skill. Keep exact package ranges separate from the source-lock
snapshot. Never hand-build package bytes or widen reviewed ranges silently.

## Review and completion

Inspect the exact resulting target ref and changed range directly. Confirm that
the requested target, maintenance capacity, relevant checks, durable truth, and
remote publication evidence match the task. Also record the exact
template-development version that supplied the maintenance runtime.

`main` is never a maintenance mutation target. Main promotion remains the
separate human exact-SHA procedure.
