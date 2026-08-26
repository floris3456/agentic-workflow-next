---
name: implementation-truth
description: Keep AS-BUILT and deviations accurate when implementation changes current system reality.
compatibility: developer repository
---

# Implementation truth

Load this skill when code, configuration, interfaces, dependencies, runtime behavior, or architecture change.

For every changed code file, identify the AS-BUILT that owns its directory or component. After implementation, make sure that AS-BUILT still describes the complete current implementation in that scope well enough to reconstruct how the system works.

Update only facts that changed or became incomplete. Preserve useful existing truth.

AS-BUILT should describe current reality: important files and responsibilities, behavior, interfaces, dependencies, configuration, data/control flow, safety boundaries, and verification routes where they matter.

Do not turn AS-BUILT into a changelog, task summary, design proposal, command log, or implementation history. Do not record failed attempts or temporary decisions.

Create or update a formal deviation only when the final implemented reality materially differs from an applicable accepted expectation. Describe the actual difference and its consequence, not the process that produced it.

If the implementation does not change or invalidate durable implementation truth, do not create documentation churn.
