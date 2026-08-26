# Prompt creation design

## Purpose

Prompt creation is an Orchestrator-owned context-transfer capability for crossing an execution boundary. It is not a substitute for doing work in the current context.

The active Web implementation is `web-orchestration-only/chatgpt-project/skill-prompt-creation.md`. Template-development does not duplicate that runtime procedure; this document records the reusable design boundary only.

## Core contract

A good prompt transfers only task-specific state the receiver cannot safely assume. Stable safety, tool syntax, routing, and workflow already owned by the receiver stay with that receiver.

Preserve these meanings when confusion could change execution:

- **Observed:** facts/evidence actually established in the originating context.
- **Interpretation:** diagnoses, hypotheses, conclusions, or proposed approaches that may need verification.
- **Requested outcome:** what the receiver is being asked to accomplish.

Do not turn interpretation into observation to make a prompt sound decisive.

Keep the result as short as possible without losing information that could materially change execution or evaluation.

## Destination and mission

Describe only capabilities actually established for the receiving context. A fresh Orchestrator already owns its permanent instructions and conditional Sources; a direct OpenCode session already owns its repository instructions and skills. Do not copy those contracts into the handoff.

Transfer the smallest mission payload that matters: outcome/success condition, useful exact refs/evidence, bounded scope/constraints, important unknowns or dependencies, and expected deliverable/check evidence.

Research prompts distinguish target-repository evidence from external prior art. Review prompts do not silently become implementation prompts. Implementation prompts prefer outcome/constraints over an unverified patch prescription. Recovery prompts carry only durable decision-relevant continuity rather than conversational history.

Add structure, stages, alternatives, examples, schemas, or targeted verification only when a real communication failure mode justifies them. No extra prompt craft is the normal result for simple work.

## Ownership and future variants

Research and prompt creation are Orchestrator-owned; Developer and Template Maintainer consume resulting evidence/prompts rather than owning this workflow.

The planned shared Web/Local Orchestrator keeps this ordinary prompt contract shared. Web may also create prompt packages when its installed procedure supports them. Local may create ordinary prompts but not prompt packages, and uses its connected Tavily MCP for public web research. Those variant rules belong in the future Orchestrator installation, not in Developer or Template Maintainer runtime instructions.

Validators should check only mechanical package/safety boundaries that materially matter. They must not encode the wording, section inventory, or optional craft techniques of this design as exact prompt prose.
