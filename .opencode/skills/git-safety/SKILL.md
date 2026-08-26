---
name: git-safety
description: Reconcile uncertain Git effects and protect exact-SHA publication and promotion.
compatibility: developer repository
---

# Git safety

Load this skill when a Git mutation has an uncertain result, local and remote state disagree unexpectedly, publication needs reconciliation, or `main` promotion is requested.

Never repeat an operation merely because its response was missing, failed, or timed out.

First determine what actually happened from the smallest useful evidence: current process/session state, working tree, HEAD, branch, upstream state, remote refs, ancestry, and affected tree.

If the intended effect already exists, continue from it. Retry only when evidence shows the previous operation did not take effect and repeating it cannot create a duplicate or conflicting result.

Keep one mutating route until the uncertainty is resolved. Stop on unexpected branch movement, conflicting trees, or evidence you cannot safely reconcile.

Never rewrite or advance `main` without explicit human approval of the exact reviewed developer SHA and the repository's guarded promotion procedure.

After any claimed publication or promotion, verify the exact remote ref before treating it as durable.
