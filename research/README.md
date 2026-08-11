# Research

This directory contains self-contained research packages: prompts, public-safe attachments, results, reviews, syntheses, and human disposition records.

Start with package cards and conclusions. Open individual preserved results only when a current question genuinely needs their detail.

## Invariants

- Populated research results and raw external evidence are immutable source evidence.
- Task implementation may read them but never modify them.
- Research recommends; it does not accept architecture, risk, production use, or gates.
- Anything committed must be safe for public disclosure.
- Conclusions move into ADR, design, gate, AS-BUILT, deviation, or another durable home only through explicit disposition.

## Workflow

See [`WORKFLOW.md`](WORKFLOW.md) and load the OpenCode `research-workflow` skill when working here.

```bash
node scripts/validate-research.mjs
./scripts/validate-repository.sh
```
