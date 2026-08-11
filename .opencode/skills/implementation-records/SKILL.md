---
name: implementation-records
description: Maintain AS-BUILT and deviation records continuously and atomically with the implementation facts they describe.
compatibility: Generic repository component and milestone records
---

# Implementation records

Load this skill before implementing or changing a component, or when actual implementation may differ from accepted design.

## AS-BUILT

AS-BUILT has two equal purposes:

1. live implementation memory for the current developer; and
2. durable, reverse-engineer-capable truth about what exists.

Maintain the component's `AS-BUILT.md` continuously. It must let another competent engineer or agent reconstruct important architecture, behavior, interfaces, dependencies, configuration, invariants, operational assumptions, and verification routes without prior chat context.

Do not reproduce source line-by-line. Do not store failed routes or temporary process history unless they create a durable system constraint.

## Atomicity

If a commit changes a fact represented by AS-BUILT, update AS-BUILT in the **same commit**.

Never intentionally push code that makes an implementation record false and plan to repair the record in a later commit. Every pushed implementation commit must be internally understandable and truthful for the facts it changes.

If existing AS-BUILT is wrong, correct it immediately and note the discovery in task-progress where useful.

## Deviations

Update the applicable deviation record as soon as actual implementation materially differs from an accepted plan, ADR, gate, design, or other authoritative expected state.

A failed implementation attempt is not a deviation. Failed routes belong in task-progress. A deviation records an intended-versus-actual system difference.

If a commit creates or materially changes a deviation, update the deviation record in the same commit.

## Separation

- Task-progress owns process, attempts, steering, remaining work, and next action.
- AS-BUILT owns current implemented reality.
- Deviations own material intended-versus-actual differences.

Link records instead of copying them wholesale.

## Public safety and evidence

Write only public-safe information. Externally produced evidence is immutable; reference it and record corrections elsewhere rather than editing it.

## Final reconciliation

At orchestrator-approved finalization, compare durable records against exact implementation one last time and promote any durable fact still found only in task-progress. This is a double-check. It does not excuse stale records during implementation.
