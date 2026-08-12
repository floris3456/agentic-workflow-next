# Task progress

## Task ID

`AGENTIC-BRIDGE-002`

## Status

Independent-review correction in progress: the bridge remains stopped, affected bot result comments were deleted, and the projection correction now also binds semantic project aliases to task ownership while aligning architecture wording with the implemented text-part filter.

## Task-start developer SHA

`cbb63e8df10c3fcd2e2b6bafe77e9d0c6352df1a`

## Review-base developer SHA

`cbb63e8df10c3fcd2e2b6bafe77e9d0c6352df1a`

## Original task brief

Continue setup autonomously where possible after the GitHub MCP was installed. During the bounded live bridge smoke test, harden any implementation defect required to complete a public-safe end-to-end run. Do not expose secrets, weaken branch or human authority, or promote corrective work without exact human approval.

## Current objective

Prevent GitHub projection of OpenCode reasoning content, opaque project identifiers, and provider-internal metadata while retaining complete raw results locally and preserving useful public-safe final responses.

## Current position

Private App registration, selected-repository installation, labels, pinned OpenCode `1.18.16`, bridge bootstrap, and command transport succeeded. A live `status` result exposed reasoning parts, encrypted provider metadata, and an unaliased project identifier. The two unsafe terminal result comments were deleted and the bridge was stopped. Corrective projection publishes only recognized text message parts, omits non-public metadata/reasoning fields, and aliases project IDs. Independent review of handoff `72ac319c99293c9085e0862a8d390b83e7efb3b7` found that project aliases were not yet task-bound and that architecture wording overstated text parts as final text. Both findings are corrected locally and pass the full pinned-runtime suite before push.

## Observed

- GitHub App `agentic-bridge-template` has selected-repository installation access with Metadata read, Issues write, and Contents read.
- Authenticated loopback OpenCode `1.18.16` is healthy on `127.0.0.1:44123`; unauthenticated health returns `401`.
- Live `start` command `f55f6efe-85d8-4393-9bef-b2c5f385f11d` was accepted and created a Luna session; the session produced exactly `Bridge smoke test received successfully.` without Git changes.
- Live read-only `status` command `442550d1-8613-46fa-b6c7-6baecc51ba94` published internal reasoning text/provider metadata and a raw project ID because `PublicProjection` currently sanitizes fields generically rather than suppressing non-public OpenCode content classes.
- Bridge process `1375725` was terminated cleanly before correction; no pending outbox or Git changes remained.
- `PublicProjection` now omits reasoning/thinking/analysis parts, every non-text recognized message part, provider metadata, and reasoning/encrypted-content fields; semantic `projectID` values receive durable `project-*` aliases.
- The exact raw live status payload reprojected to 1,110 bytes, retained `Bridge smoke test received successfully.`, and contained none of the observed reasoning/metadata/encrypted/snapshot/provider-item/raw-project-ID classes.
- Review PR `#2` ran two successful GitHub validation jobs at handoff `72ac319c99293c9085e0862a8d390b83e7efb3b7`; GitHub Copilot reviewed all five changed files and identified a project-alias task-isolation gap plus a documentation mismatch.
- `project` now uses the existing task-bound alias enforcement. A generic `project.directories` regression proves the owning task can resolve its project alias while another task is rejected.

## Interpretation

Field-level token/path/ID redaction is insufficient for heterogeneous OpenCode response objects. Reasoning parts and provider metadata are non-public by class and must be omitted wholesale; opaque project IDs need durable aliasing or omission. The public projection should retain assistant final text and ordinary safe status fields while raw response detail remains local.

## Attempts

- The first status check initially returned `database is locked` while initial sync imported historical events. After import settled at 57,316 deduplicated events, heartbeat and status became healthy; this was transient write pressure rather than the projection defect.
- The first public status projection relied on generic recursive sanitization. Live evidence showed that encrypted/provider reasoning metadata and unprefixed project IDs evade the existing sensitive-key/private-ID patterns.

## Changed approach

Live setup is paused and converted into a bounded corrective developer task. Structural policy is fail closed for message-part classes: only text parts are published, while unknown/non-text parts remain local. The bridge will not restart until this validated change is pushed and reviewed.

## Checks

- Bridge bootstrap passed live compatibility, GitHub App access, labels, and state initialization.
- Git remained clean at `developer=origin/developer=origin/main=cbb63e8df10c3fcd2e2b6bafe77e9d0c6352df1a` throughout the smoke test.
- Unsafe result comments were deleted and subsequent issue inspection confirmed only commands, accepted ACKs, and the safe idle event remain.
- Exact Node `22.13.0` nested bridge suite passes 43/43, including the captured live-response projection case.
- Exact Node `22.13.0` `./scripts/validate-repository.sh` passes all repository checks, 43/43 bridge tests, and 8/8 disposable-Git tests.
- `git diff --check` reports no errors.
- Direct replay of stored live command `442550d1-8613-46fa-b6c7-6baecc51ba94` through the corrected projector retained final text and omitted every asserted non-public field/value.
- Corrective implementation commit `a1a1193a1425fe168b5390bb6fbc99e602733b65` pushed successfully through the tracked synchronization hook; local and `origin/developer` were synchronized before this handoff snapshot.
- After the independent-review correction, exact Node `22.13.0` `npm test` passes 43/43 and `./scripts/validate-repository.sh` passes all repository checks, 43/43 bridge tests, and 8/8 disposable-Git tests.
- Post-correction `git diff --check` reports no errors.

## Blockers / required decisions

No implementation blocker. The corrected remote head requires independent re-review, substantive approval, finalization review, and exact human approval before promotion. Live bridge restart remains intentionally blocked until the corrected SHA is promoted, because the service must run from a synchronized `developer` checkout.

## Remaining work

- Push a correction handoff and independently re-review the exact remote range before substantive approval and promotion.
- Restart the bridge and repeat a sanitized live round trip after the corrected SHA is active.

## Next action

Push the project-alias ownership correction and a dedicated task-only handoff, then re-run independent review on PR `#2` at the resulting exact head.

## Relevant durable records

- `tools/opencode-bridge/AS-BUILT.md`
- `docs/architecture/opencode-bridge.md`
- `docs/architecture/AS-BUILT.md`

## Last handoff commit

`72ac319c99293c9085e0862a8d390b83e7efb3b7`
