# Template-maintenance task progress

## Task ID

TEMPLATE-PACKAGE-EXECUTION-001

## Status

in_progress

## Task-start template-development SHA

ad563cdf00900bfd210f3d15d00cb06001009e99

## Review-base template-development SHA

ad563cdf00900bfd210f3d15d00cb06001009e99

## Public-safe task brief

Provide the reusable template with a legitimate networked maintainer execution
surface for deterministic change-package generation without weakening the
existing provenance contract or hand-building package bytes.

Use the existing tracked `scripts/create-change-package.mjs` generator and
validator. Prefer a fixed-operation, template-development-owned GitHub Actions
broker triggered by one strict public-safe package request. The broker may fetch
canonical public Git history, generate and validate exactly the requested package,
and publish only the generated `changes/<task-id>...` package plus bounded request
result metadata back to `template-development`.

Do not grant arbitrary shell/network authority to the web orchestrator, do not
merge source histories, do not modify or promote `main`, and do not allow package
requests to widen reviewed ranges or choose arbitrary output paths/commands.

After the broker source is independently reviewed, use it to generate its own
package and then the pending packages for the recently completed maintenance
source tasks.

## Current objective

Implement and prove a narrow package-request broker that turns an exact reviewed
three-branch range into the repository's existing schema-3 package through the
tracked generator on canonical networked GitHub Actions infrastructure.

## Current position

Exact refs at activation:

- `main`: `6127611113dfdb66f93a0cfd2d355359aa370833`
- `developer`: `1bd5cbaefcd01245e181dfc7319ae04e2d2e0c68`
- `web-orchestration`: `d642359993fc1d819517b3fc10e4e704810a03a7`
- `template-development`: `ad563cdf00900bfd210f3d15d00cb06001009e99`

`source-lock.json` already records those exact canonical source refs. The tracked
package generator requires fresh canonical Git fetches. The current ChatGPT/local
execution environment cannot resolve `github.com`, so local generation is a real
capability boundary rather than a transient source defect.

GitHub Actions is already an accepted canonical remote execution surface for
branch validation. This task will add only the package-generation operation it
needs rather than a general-purpose remote shell.

## Source ranges

- `template-development`: starts at `ad563cdf00900bfd210f3d15d00cb06001009e99`
- `developer`: unchanged unless exact review later proves a developer-owned change is required
- `web-orchestration`: unchanged unless exact review later proves a web-owned change is required
- `main`: unchanged

## Observed

- `scripts/create-change-package.mjs` already performs sterile canonical remote
  fetch, exact base/head resolution, ancestry checks, current-tip containment,
  package-storage exclusion, patch hashing, schema-3 manifest creation,
  provenance validation, and public-safety validation.
- Existing package tasks remain pending only because no currently usable
  networked maintainer execution surface invokes that tracked generator.
- `template-development` already has push-triggered GitHub Actions and a canonical
  repository validator.
- A broker can therefore stay small: validate one request, invoke the existing
  generator with fixed arguments, validate the result, prove branch freshness,
  and publish only the bounded generated result.

## Interpretation

The missing capability is execution plumbing, not a new package format or weaker
provenance rule. Reusing the tracked generator is safer than duplicating package
logic in the workflow or in the web orchestrator.

A request commit followed by one broker-generated package commit gives durable
idempotency: if the branch has already advanced beyond the request SHA, a rerun
must fail closed rather than create a second package.

## Attempts

1. Re-established exact canonical refs and current source-lock state.
2. Confirmed the historical CI-reachability task already established GitHub
   Actions as the accepted networked validation surface.
3. Tested the current local execution environment with a read-only Git remote
   query; DNS resolution for `github.com` is unavailable.
4. Read the exact current package generator contract before selecting this route.

## Changed approach

The initial idea of adding a host/Workspace package broker is unnecessary if a
more contained repository-owned GitHub Actions operation can invoke the exact
tracked generator and publish only its bounded result.

## Checks

Planning evidence and exact remote refs reviewed. Implementation checks pending.

## Blockers / required decisions

No human decision remains. No `main` mutation is authorized.

## Remaining work

1. Add a strict package-request processor and request schema/inventory rules.
2. Add a push-triggered GitHub Actions broker with the minimum write permission
   needed to publish only the validated package result.
3. Fail closed on malformed requests, unexpected changed paths, branch movement,
   existing output, or ambiguous push.
4. Add deterministic tests and template-development validation coverage.
5. Update AS-BUILT/design/instructions where the execution surface is described.
6. Independently review the exact source range and canonical CI.
7. Generate and review this task's own package through the new broker.
8. Use the proven broker to generate the pending packages for the recently
   completed source tasks.

## Next action

Implement the bounded package-request processor and workflow from the exact
remote template-development state.

## Relevant durable records

- `scripts/create-change-package.mjs`
- `scripts/change-package-lib.mjs`
- `.github/workflows/validate-template-development.yml`
- `.opencode/skills/template-maintenance/SKILL.md`
- `scripts/validate-template-development.mjs`
- `scripts/validate-template-development.sh`
- `docs/architecture/AS-BUILT.md`
- `docs/design/template-maintenance-workflow.md`
- `source-lock.json`

## Last handoff commit

None
