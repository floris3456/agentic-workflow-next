# Template-maintenance task progress

## Task ID

TEMPLATE-TRUST-BOUNDARY-001

## Status

in progress

## Task-start / review-base refs

- main: `6127611113dfdb66f93a0cfd2d355359aa370833`
- developer: `e2700f586fe8ab634053eb514bb9da487e881a21`
- web-orchestration: `2b95a9803115b05283494fb3699b9d34c58a91a5`
- template-development: `7dde0897c4b0bc1df304bd43fe61f4eb99fd682f`

`source-lock.json` matched these three source refs at task start and remains the
review-base lock until genuine package generation. `main` is not authorized for
change or promotion.

## Public-safe task brief

Harden reusable-template change-package provenance, exact Git repository identity,
and the independent Scout trust boundary while preserving portability, recovery,
exact-ref review, deterministic packaging, public safety, normal developer
OpenCode behavior, and the human-only `main` boundary. Existing pre-hardening
Scouts are not evidence for this task.

## Current position

Developer source is independently accepted at bookkeeping handoff
`4d3aa8c340ab1503443b14e155b24c52e640194f`. The delegated implementation was
reviewed directly through GitHub; review found and corrected one CI-only fixture
bug and one per-start origin-authentication gap. The exact corrected substantive
source SHA `8941c2f89a595b16835a5326e42d5a1ec9d7a32c` and the task-record-only
bookkeeping handoff `4d3aa8c340ab1503443b14e155b24c52e640194f` both have successful full
`Validate repository` GitHub Actions runs.

The one-file `web-orchestration` source range from
`2b95a9803115b05283494fb3699b9d34c58a91a5` to
`6a7793738bcb12b92bc7a7bc43fde1fcebe61e35` has also been independently reviewed.
It adds a fail-closed hardened-Scout readiness gate, forbids fallback to ordinary
developer OpenCode/ref-owned instructions, and retains exact connected GitHub as
the proof route.

The remaining reusable source change is AWT-001 package provenance on
`template-development`, followed by genuine package generation/validation and
source-lock reconciliation.

## Independent findings / review

- Repository identity now parses supported HTTPS, `ssh://`, and scp-style SSH
  remotes and authenticates exact Git host plus owner/repository. Public GitHub
  and standard GHES `/api/v3` derive the Git host; ambiguous custom API layouts
  require explicit `github.git_host`.
- Hardened Scouts run on a distinct authenticated loopback OpenCode `1.18.16`
  endpoint installed outside `repository_root`, with bridge-owned prompt/model/
  permissions/tools, sterile configuration roots, no ref-owned Scout agent, and
  no normal developer endpoint fallback.
- Exact Scout views are materialized from Git object plumbing, not checkout or
  worktree; gitlinks/`.git` are rejected, regular files are non-writable and
  non-executable, symlinks are inert evidence, and reuse re-hashes content.
- Trusted `scout_read`/`scout_glob`/`scout_grep` use filesystem/path APIs only,
  bound UTF-8 evidence, do not follow symlink directories, and enforce lexical
  plus realpath containment.
- Review correction: every new Scout start now calls
  `synchronizedGitState(config)` before the Scout server/snapshot path, so a
  changed, deceptive, or unsynchronized origin fails closed at consumption time.
- The original implementation Actions failure was exactly one test fixture that
  pre-created private snapshot state under ambient umask. The product check was
  retained; the fixture now requests `0700`. The later full CI runs are green.
- AWT-001 remains open: current package creation can trust arbitrary supplied Git
  object databases while stamping canonical repository identity from
  `source-lock.json`; schema-1 validation binds patch hashes but does not prove
  canonical origin/base/head provenance.

## Route / active work

- Canonical control issue: `https://github.com/floris3456/agentic-workflow-template/issues/26`.
- Developer delegated/direct source routes: terminal and absorbed.
- Developer substantive approval/bookkeeping SHA:
  `4d3aa8c340ab1503443b14e155b24c52e640194f`.
- Developer current task path exists at that SHA with blob
  `e9ce0154342cade46ca3a21299295ccd56f18bff`; same-basename archive target is
  absent.
- Web-orchestration source: reviewed at
  `6a7793738bcb12b92bc7a7bc43fde1fcebe61e35`.
- Existing Scouts: none launched or used as evidence.
- Next mutating action: developer finalization only; template-development source
  work waits until that finalization route is terminal/absorbed.

## Command journal

Sequences 1-9 are historical and reconciled on issue #26; highest accepted
sequence is 9. The delegated implementation eventually produced the hardened
runtime, after which independent connected-GitHub review made two bounded direct
corrections and reconciled the developer task record. No task-correlated question
is pending; the only permissions were the earlier rejected operator-local
`.opencode/*` requests.

Pending sequence 10:

```json
{"protocol":"agentic-bridge/1","sequence":10,"command_id":"47ac6cf4-8d27-4d87-b4f1-b3d61cf6b10a","task_id":"TEMPLATE-TRUST-BOUNDARY-001","kind":"finalize","arguments":{"message":"Finalize the already reviewed developer source for TEMPLATE-TRUST-BOUNDARY-001. First synchronize safely to remote developer 4d3aa8c340ab1503443b14e155b24c52e640194f. Do not change product behavior or the approved task-record bytes. Move docs/work/current/TEMPLATE-TRUST-BOUNDARY-001-scout-trust-boundary.md to the same basename under docs/work/archive/ with git mv; the current approved blob is e9ce0154342cade46ca3a21299295ccd56f18bff and the archive target must not already exist. Preserve that blob exactly, run proportional repository checks, push the finalization commit, and return the normal six-field handoff. Do not modify main or web-orchestration and do not promote."}}
```

## Connector refusal journal

- Phase: developer finalization publication.
- Tool/target: connected GitHub issue-comment write, canonical issue #26.
- Delivery window / attempt: first window, attempt 1.
- Content class: persisted public-safe `agentic-bridge/1` finalize envelope above.
- Connector arguments used: repository `floris3456/agentic-workflow-template`, issue
  number 26, exact sequence-10 marker body.
- Connector error: write was rejected before GitHub because the current connector
  schema requires the issue number in its `pr_number` field rather than
  `issue_number`.
- Readback: issue #26 contains no occurrence of command UUID
  `47ac6cf4-8d27-4d87-b4f1-b3d61cf6b10a`.
- Confirmed external effect: none; sequence 10 is not yet bridge-admitted.
- Resolution: retry publication only with the same byte-identical envelope and
  same UUID/sequence, using connector field `pr_number: 26`. Do not alter or
  repeat any underlying mutation.

## Checks performed by orchestrator

- Exact current refs were re-established before continuation.
- Full developer task-start range and high-risk trust boundaries were inspected
  directly; no Scout output was accepted as proof.
- GitHub Actions job logs for the failed implementation run were read exactly:
  83/84 tests passed and the sole failure was the private-directory test fixture.
- Direct correction `080dbf883cd6e567db7db934816b3f526ba17325`
  changes only the fixture mode; direct correction
  `8941c2f89a595b16835a5326e42d5a1ec9d7a32c` adds only the per-start
  synchronization/origin gate.
- GitHub Actions run `31902255588` for `8941c2f...` succeeded.
- Task-record bookkeeping commit
  `4d3aa8c340ab1503443b14e155b24c52e640194f` changes only the developer task
  record and Actions run `31902314637` succeeded.
- Web-orchestration changed-file range was independently reviewed and matches the
  hardened runtime contract.
- `main` remains exactly `6127611113dfdb66f93a0cfd2d355359aa370833`.

## Blockers / decisions

No developer/web source blocker remains. The tracked template-maintenance tree has
validation CI but no remote workflow that performs package generation/commit; AWT-001
and the final deterministic package still require the repository-owned maintainer
execution route or an equivalent authorized local execution surface. A package
will not be hand-built through GitHub API writes.

## Remaining work

Publish/reconcile developer sequence-10 finalization and prove the archive move
preserved blob `e9ce0154342cade46ca3a21299295ccd56f18bff`. Then implement/review AWT-001
package provenance on `template-development`; genuinely execute and validate
`scripts/create-change-package.mjs` for developer/web review-base-to-final ranges;
reconcile `source-lock.json`, maintenance AS-BUILT/deviations, exact source/package
SHAs, and keep `main` unchanged.

## Next action

Confirm this ledger commit remotely, then retry exact sequence 10 on issue #26
using the connector's `pr_number` field and absorb the finalization handoff before
any new template-development source mutation.

## Last handoff commit

- developer reviewed bookkeeping handoff:
  `4d3aa8c340ab1503443b14e155b24c52e640194f`
- web-orchestration reviewed source:
  `6a7793738bcb12b92bc7a7bc43fde1fcebe61e35`
