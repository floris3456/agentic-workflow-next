# Public repository safety

This repository is intentionally public. Every deliberate Git write must therefore be safe for public disclosure.

## Never commit

- Credentials, secrets, access tokens, cookies, session data, or browser profiles.
- Private chat text or private human context that is not necessary and approved for public persistence.
- Production exports, personal data, raw device/user telemetry, or unreviewed internal identifiers.
- Local `.env` files, build output, temporary workspaces, or tool caches covered by `.gitignore`.
- GitHub App private keys or installation tokens, OpenCode server passwords, bridge configuration, bridge SQLite state, or local `secret_ref` values.

“Preserve the delegated task brief verbatim” means preserve the exact **public-safe brief actually sent to OpenCode**. The web orchestrator sanitizes the brief before delegation. Local developers must stop if a delegated brief appears unsafe to commit.

## Evidence

Raw externally produced research evidence is readable when required but immutable. Correct errors through derived analysis, AS-BUILT, deviation, design, or correction records; never rewrite source evidence.

## Bridge boundary

OpenCode must listen only on a project-unique loopback port with authentication. The local bridge makes outbound GitHub requests and never exposes an inbound webhook. Keep each operator config, password, private key, and referenced secret in mode `0600` files outside Git. The GitHub App requires Issues write and Contents read, not Contents write. GitHub-visible bridge output is always public disclosure: use public aliases and `secret_ref` indirection, and inspect raw retained results only in the protected local database.

Bridge bootstrap authenticates the checkout's exact Git host and
owner/repository, not a textual suffix. Public GitHub and Enterprise `/api/v3`
bases derive their Git host; other custom API layouts must set an unambiguous
`github.git_host`. Credential-bearing origins, deceptive suffix hosts, malformed
or encoded paths, and unsupported remote forms are rejected.

Never use the normal developer OpenCode server or a ref-owned agent/tool as a
Scout runtime. The dedicated Scout endpoint runs exact pinned OpenCode `1.18.16`
from a bridge-installed root outside the repository with sterile HOME/XDG/temp,
explicit provider auth, read-only config/discovery files, project/default-plugin/
external-skill/watcher/LSP/formatter disablement, and managed-config redirection
into the immutable runtime. Bootstrap actively checks
the installed source hashes, package/runtime versions, OpenAPI hash, agent prompt,
model/effort, permissions, and tool inventory. Missing or mismatched controls fail
Scout closed without disabling ordinary developer OpenCode.

Scout snapshots come only from canonical `origin/developer` Git objects through
`ls-tree` and `cat-file`, not checkout, worktree, archive filters, or hooks. They
contain no `.git` entry or executable/writable regular file, reject gitlinks, and
preserve symlinks only as inert evidence. The bridge-owned `scout_read`,
`scout_glob`, and `scout_grep` tools never follow symlinks, enforce realpath
containment and bounded UTF-8 input/output, and expose no process, package-manager,
network, mutation, delegation, interaction, or download primitive. Run the Scout
runtime only as a non-root Linux operator; other environments are unsupported and
fail closed.

## Repository controls

Tracked Git hooks are advisory client-side safeguards. A user who can replace or bypass local hooks can also bypass their branch checks, so hooks are defense in depth rather than a server-side security boundary. Repository operators should add a GitHub ruleset for `main` that blocks force pushes and deletion and restricts updates to designated promotion operators using the reviewed exact-SHA procedure.

## Reporting

Do not open a public issue containing a suspected secret or sensitive value. Use the human operator's approved private security route and remove exposed credentials at their source.
