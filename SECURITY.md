# Public repository safety

This repository is intentionally public. Every deliberate Git write must therefore be safe for public disclosure.

## Never commit

- Credentials, secrets, access tokens, cookies, session data, or browser profiles.
- Private chat text or private human context that is not necessary and approved for public persistence.
- Production exports, personal data, raw device/user telemetry, or unreviewed internal identifiers.
- Local `.env` files, build output, temporary workspaces, or tool caches covered by `.gitignore`.
- GitHub App private keys or installation tokens, OpenCode server passwords, or local `secret_ref` values.

“Preserve the delegated task brief verbatim” means preserve the exact **public-safe brief actually sent to OpenCode**. The web orchestrator sanitizes the brief before delegation. Local developers must stop if a delegated brief appears unsafe to commit.

## Evidence

Raw externally produced research evidence is readable when required but immutable. Correct errors through derived analysis, AS-BUILT, deviation, design, or correction records; never rewrite source evidence.

## Native OpenCode boundary

Native OpenCode runs on the authorized host using the checked-in project and agent
configuration. Keep credentials, session data, and host-local runtime state outside
Git. Repository-relative work remains bounded to the current checkout; access
outside it remains approval-gated, and no replacement RPC or control plane is
introduced.

## Repository controls

Tracked Git hooks are advisory client-side safeguards. A user who can replace or bypass local hooks can also bypass their branch checks, so hooks are defense in depth rather than a server-side security boundary. Repository operators should add a GitHub ruleset for `main` that blocks force pushes and deletion and restricts updates to designated promotion operators using the reviewed exact-SHA procedure.

## Reporting

Do not open a public issue containing a suspected secret or sensitive value. Use the human operator's approved private security route and remove exposed credentials at their source.
