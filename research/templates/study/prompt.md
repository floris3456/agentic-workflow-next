# Study NN — Title

## Expert role

State the exact expertise and authority boundary in one line.

## Result target

Save the complete response as `result-NN-short-topic.md` — a globally unique filename that can coexist with any other result in one ChatGPT Project. Give every load-bearing section a stable heading (heading-anchor friendly: lowercase, hyphens, no punctuation) so repository links can point at it. Save the result verbatim; never silently rewrite it later.

## Inputs

- Code zips: one per code-bearing root (`src`, `tests`, `contracts`, `tools`, `scripts`, …), produced via `git archive` of the declared ref.
- Attachments (non-code context): list exact basenames.

## Reading list

List exactly which files inside the zips and attachments this study reads. Inputs are shared by all parallel prompts and every step of a multi-step run — the reading list is what distinguishes this study, so it must be written into this prompt. You may read other files only if you truly think the effort is worth it; state why.

## Accepted baseline and provisional matters

State both separately. Research cannot silently change the accepted baseline; a change needs an explicit proposal with new evidence, impact, smallest falsifying experiment, and ADR action.

## Research questions

Ask bounded, non-overlapping questions that require web research rather than human authority or a local measurement. Demand visible reasoning: where sources conflict, reconstruct the reasoning and state which evidence you weighted and why; name explicit UNKNOWNs; give per-conclusion change conditions.

## Required web verification

Verify time-sensitive claims as of the research date. Prefer official specifications, standards, and maintained primary sources; record document/release dates. Vendor marketing, search snippets, popularity, and synthetic benchmarks are not proof.

## Open-source reference review

(Include only when the prompt guide selects this ingredient.) Assess each candidate consistently: license, maintenance, tests, security, fit, gaps. Produce a comparison table, state what we would take inspiration from, and say explicitly when no relevant prior art exists.

## Required output

(One of two modes, declared on the package card.)

- `synthesis` — conclusions with visible reasoning; small labeled implementation seeds are allowed when they practically help the next research step.
- `synthesis+implementation` — additionally produce `theoretical-implementation.md`: a draft plan, every claim labeled THEORETICAL or ESTIMATE, grounded in cited facts, explicitly unverified until a CLI experiment, with change conditions.

A synthesis result must start with a one-page `## Human summary` front section. Every load-bearing section must carry a stable heading anchor.

## Human decisions

List every decision this research must leave to accountable humans, as options with consequences. Research never selects policy, ownership, budget, retention, or risk acceptance.

## CLI evidence and experiments

Convert every claim only code or a lab can settle into a named falsifying experiment with pass/fail criteria. Research prose never substitutes for measurement.

## Evidence labels and conflict handling

Use: FACT · ASSUMPTION · INFERENCE · ESTIMATE · RECOMMENDATION · UNKNOWN · HUMAN DECISION · CLI EXPERIMENT. Do not invent numerical confidence percentages; give High/Medium/Low with reasons.

## Residual risk

End with the risks that remain after all planned controls, and the exact next gate that can invalidate the plan.
