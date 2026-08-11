---
name: gate-workflow
description: Prepare milestone, gate, deviation, and human-acceptance records without treating research or developer claims as acceptance.
compatibility: Generic milestone and gate documentation
---

# Gate workflow

Use this skill for milestone/gate records and evidence preparation.

- Research, developer reports, and automated checks are evidence; none is human acceptance.
- State the exact repository SHA and evidence reviewed.
- Keep expected design separate from AS-BUILT reality.
- Use `implementation-records` whenever actual implementation or deviations are involved.
- Record unresolved human decisions explicitly.
- Do not mark a gate passed until the human explicitly accepts it.
- Write only public-safe content.
- Link to normative records instead of copying their full procedures.

A gate record should make clear: scope, evidence, checks, known deviations, residual risk, human decision, exact accepted SHA if applicable, and date.
