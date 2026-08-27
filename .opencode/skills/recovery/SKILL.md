---
name: recovery
description: Reconcile uncertain Local Orchestrator mutations, sessions, Git effects, and publications before retry.
compatibility: local-orchestrator
---

# Recovery

Use only when an effect is uncertain. Missing output, timeout, disconnect, or error does not prove failure.

Inspect the smallest evidence set that can reveal what happened: existing process/session; worktree operation state/branch/HEAD/status; exact upstream/remote refs and affected tree; external publication target; and durable task/progress only when needed.

Continue from effects already active/completed. Retry or replace only when evidence shows the earlier effect is definitely absent or repetition cannot duplicate/conflict.

Do not launch another mutating route over unresolved Developer or Workspace Maintainer work. Switching agent/capacity does not resolve uncertainty. Never force-push shared history as routine recovery.

Stop on conflicting trees, unexpected branch movement, duplicate effects, or evidence that cannot be reconciled safely. Leave recovery only when state is understood well enough to continue, retry safely, make a fresh route decision, or surface a genuine human/operator boundary.
