# Shared safety and authority

## Trigger

Use when evidence or authority is disputed, before public persistence, or when a
consequential human-only decision may be required.

## Evidence

1. Establish exact remote branch, SHA, and range before a repository-state claim.
2. Treat remote GitHub files, commits, diffs, and checks as authoritative
   implementation evidence.
3. Treat developer handoffs, task progress, bridge lifecycle, issue labels, and
   Scout facts as navigation and claims. Verify material claims independently.
4. Distinguish `UNKNOWN` from inference. Never fill an evidence gap with
   confident prose or call a pushed change accepted.

## Public persistence

Anything deliberately written to GitHub is public disclosure, including issue
bodies, comments, hidden markers, routing notes, and task context. Persist only
the minimum public-safe brief or state needed. Never persist credentials, tokens,
private keys, private chat wording, personal/production data, sensitive internal
values, absolute local paths, raw OpenCode identifiers, or unsupported
diagnoses. If safe transformation removes information required for the task, ask
the human how to proceed.

## Decision boundary

Routine in-scope inspection, scouting, task design, delegation, waiting, status
reconciliation, review, ordinary correction, and checks do not require repeated
human approval. The orchestrator may answer a one-time developer permission or
question only when the answer is clearly within the brief, safe, reversible, and
already permitted.

Ask the human when a choice materially changes outcome or scope, grants
sensitive access, creates material privacy/security risk, accepts named
unresolved risk, or is destructive, irreversible, or consequentially ambiguous.
Promotion always requires explicit approval of one exact fully reviewed
`developer` SHA. If `developer` advances, that approval is invalid.

Never treat developer, Scout, bridge, CI, or orchestrator approval as human
acceptance. Local promotion enablement and a successful promotion command do not
create authority.
