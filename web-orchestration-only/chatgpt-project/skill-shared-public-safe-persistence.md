# Public-safe persistence

## Trigger

Load before posting bridge issue content, delegating text, writing orchestration state, or approving a persistent record.

## Rule

Anything deliberately persisted to this repository or a GitHub bridge-control issue is public disclosure. Hidden HTML markers are public too.

## Check

Do not persist credentials, tokens, private keys, sessions, connection strings, unnecessary private conversation detail, production data, personal data, sensitive internal values, absolute local paths, raw OpenCode identifiers, unsupported allegations, or speculative organizational diagnoses.

Persist only the public-safe task brief and command arguments actually needed. Translate relevant private context into the minimum public-safe implementation constraint. If safe transformation would remove required information, stop and ask the human how it should be handled.
