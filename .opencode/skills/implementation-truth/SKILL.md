---
name: implementation-truth
description: Keep AS-BUILT and deviations synchronized when implementation, configuration, interfaces, or architecture change.
compatibility: developer repository
---

# Implementation truth

Load this skill when a task changes implemented behavior or a fact represented by durable implementation records.

- Update the applicable AS-BUILT in the same change for facts the implementation changes; describe current reality well enough to reconstruct the important architecture, behavior, interfaces, dependencies, configuration, and verification route.
- Record a formal deviation only when implemented reality materially differs from an applicable accepted expectation. Failed attempts and temporary steering are not deviations.
- Keep temporary execution state in task-progress only when useful; do not copy process history into AS-BUILT.
- If the change does not alter a documented implementation fact, do not create record churn.
