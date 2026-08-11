# Public repository safety

This repository is intentionally public. Every deliberate Git write must therefore be safe for public disclosure.

## Never commit

- Credentials, secrets, access tokens, cookies, session data, or browser profiles.
- Private chat text or private human context that is not necessary and approved for public persistence.
- Production exports, personal data, raw device/user telemetry, or unreviewed internal identifiers.
- Local `.env` files, build output, temporary workspaces, or tool caches covered by `.gitignore`.

“Preserve the delegated task brief verbatim” means preserve the exact **public-safe brief actually sent to OpenCode**. The web orchestrator sanitizes the brief before delegation. Local developers must stop if a delegated brief appears unsafe to commit.

## Evidence

Raw externally produced research evidence is readable when required but immutable. Correct errors through derived analysis, AS-BUILT, deviation, design, or correction records; never rewrite source evidence.

## Reporting

Do not open a public issue containing a suspected secret or sensitive value. Use the human operator's approved private security route and remove exposed credentials at their source.
