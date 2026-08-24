---
name: git-safety
description: Reconcile ambiguous Git mutations and synchronization, and protect exact-SHA main promotion.
compatibility: developer repository
---

# Git safety

Load this skill when a mutation outcome is uncertain, local/remote state is ambiguous, a push needs reconciliation, or promotion is requested.

- Inspect the existing process/session, working tree, local refs, upstream refs, and remote refs needed to determine what actually happened before retrying anything.
- Never automatically replay an operation whose effect is uncertain. Keep one mutating route at a time until state is reconciled.
- Push when remote durability, review, CI, transfer, or checkpoint evidence is useful; there is no push-every-commit ceremony.
- Never rewrite or advance `main` without explicit human authorization of the exact developer SHA and the repository's promotion mechanism.
