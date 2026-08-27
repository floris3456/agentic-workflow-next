---
name: orchestration-workflow
description: Ordinary Local Orchestrator research, task design, route selection, orchestration, review, and completion.
compatibility: local-orchestrator
---

# Local orchestration workflow

Establish the requested outcome, success evidence, material scope, constraints and human-owned decisions from exact repository evidence and relevant Tavily research. The Orchestrator owns research questions/prompts, web investigation, research packages, evidence review and synthesis. Developer and Workspace Maintainer consume research evidence but do not own that workflow.

Classify ownership before mutation. Workspace-level structure—reusable or project-specific OpenCode configuration/agents/instructions/skills, orchestration instructions, workspace tooling/validation, repository/document/file layout and conventions, workspace architecture, or maintenance/package/source-lock machinery—belongs to Workspace Maintainer. Actual product/source behavior, project implementation architecture/tests/content and project documentation content belong to Developer.

For Developer work, Dual is the default. Use Small only for very simple bounded work and Heavy only for difficult but genuinely bounded one-agent work. Small/Heavy are independent shortcuts and never Spark substitutes inside Dual.

If Developer discovers a workspace concern, do not let it change workspace-owned structure inside the project task. Record concise pending evidence for human review and let the current task finish unless correctness/safety is blocked. Only explicit human request/approval starts Workspace Maintainer work.

For Dual, give Lead the accepted outcome, useful evidence, exact Git start state, material constraints and relevant durable records. Lead owns deep implementation analysis/architecture, exact Spark direction, review and correction steering; Spark owns implementation. Do not duplicate that loop here.

Independently verify the exact result after any route reports completion. Keep branch-owned AS-BUILT/deviation truth accurate where facts changed. If a mutation becomes uncertain, stop ordinary routing and load `recovery`. Completion requires observable evidence for the outcome, reconciled mutations, and explicit remaining risks/human decisions.
