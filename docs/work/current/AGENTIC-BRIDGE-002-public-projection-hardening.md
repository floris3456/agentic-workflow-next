# Task progress

## Task ID

`AGENTIC-BRIDGE-002`

## Status

Active: live GitHub App setup exposed unsafe public projection; the bridge is stopped and affected bot result comments were deleted before corrective implementation.

## Task-start developer SHA

`cbb63e8df10c3fcd2e2b6bafe77e9d0c6352df1a`

## Review-base developer SHA

`cbb63e8df10c3fcd2e2b6bafe77e9d0c6352df1a`

## Original task brief

Continue setup autonomously where possible after the GitHub MCP was installed. During the bounded live bridge smoke test, harden any implementation defect required to complete a public-safe end-to-end run. Do not expose secrets, weaken branch or human authority, or promote corrective work without exact human approval.

## Current objective

Prevent GitHub projection of OpenCode reasoning content, opaque project identifiers, and provider-internal metadata while retaining complete raw results locally and preserving useful public-safe final responses.

## Current position

Private App registration, selected-repository installation, labels, pinned OpenCode `1.18.16`, bridge bootstrap, and command transport succeeded. A live `status` result exposed reasoning parts, encrypted provider metadata, and an unaliased project identifier. The two unsafe terminal result comments were deleted, the bridge was stopped, the repository stayed clean/synchronized, and corrective implementation is starting from the promoted baseline.

## Observed

- GitHub App `agentic-bridge-template` has selected-repository installation access with Metadata read, Issues write, and Contents read.
- Authenticated loopback OpenCode `1.18.16` is healthy on `127.0.0.1:44123`; unauthenticated health returns `401`.
- Live `start` command `f55f6efe-85d8-4393-9bef-b2c5f385f11d` was accepted and created a Luna session; the session produced exactly `Bridge smoke test received successfully.` without Git changes.
- Live read-only `status` command `442550d1-8613-46fa-b6c7-6baecc51ba94` published internal reasoning text/provider metadata and a raw project ID because `PublicProjection` currently sanitizes fields generically rather than suppressing non-public OpenCode content classes.
- Bridge process `1375725` was terminated cleanly before correction; no pending outbox or Git changes remained.

## Interpretation

Field-level token/path/ID redaction is insufficient for heterogeneous OpenCode response objects. Reasoning parts and provider metadata are non-public by class and must be omitted wholesale; opaque project IDs need durable aliasing or omission. The public projection should retain assistant final text and ordinary safe status fields while raw response detail remains local.

## Attempts

- The first status check initially returned `database is locked` while initial sync imported historical events. After import settled at 57,316 deduplicated events, heartbeat and status became healthy; this was transient write pressure rather than the projection defect.
- The first public status projection relied on generic recursive sanitization. Live evidence showed that encrypted/provider reasoning metadata and unprefixed project IDs evade the existing sensitive-key/private-ID patterns.

## Changed approach

Live setup is paused and converted into a bounded corrective developer task. The bridge will not restart until adversarial tests and full repository validation prove a structurally safe projection.

## Checks

- Bridge bootstrap passed live compatibility, GitHub App access, labels, and state initialization.
- Git remained clean at `developer=origin/developer=origin/main=cbb63e8df10c3fcd2e2b6bafe77e9d0c6352df1a` throughout the smoke test.
- Unsafe result comments were deleted and subsequent issue inspection confirmed only commands, accepted ACKs, and the safe idle event remain.

## Blockers / required decisions

No implementation blocker. Corrective work requires later independent review and exact human approval before promotion.

## Remaining work

- Implement class-aware public projection suppression/aliasing.
- Add adversarial tests using the live response shapes.
- Update component AS-BUILT and operator deviation record.
- Run full validation, push implementation and handoff, then independently review before promotion.
- Restart the bridge and repeat a sanitized live round trip after the corrected SHA is active.

## Next action

Add fail-closed structural projection rules and tests for reasoning parts, provider metadata, encrypted content, and project IDs.

## Relevant durable records

- `tools/opencode-bridge/AS-BUILT.md`
- `docs/architecture/opencode-bridge.md`
- `docs/architecture/AS-BUILT.md`

## Last handoff commit

`None`
