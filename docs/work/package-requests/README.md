# Package requests

This directory is the durable input/output mailbox for the fixed-operation
template change-package broker.

A request file is named exactly `<task-id>.json`. It contains only a public-safe
request ID, one task ID, revision/supersession metadata, and exact reviewed
`template-development`, `developer`, and `web-orchestration` base/head commits.
It cannot contain a command, arbitrary output path, repository URL, credential,
or shell argument.

A commit that changes exactly one request JSON file from a non-request state to a
valid `requested` state triggers the package broker. GitHub Actions runs the
tracked `scripts/create-change-package.mjs` generator with that exact request,
validates the generated schema-3 package, updates the request to `completed`, and
publishes one package/result commit to `template-development` only if the remote
branch still equals the triggering request commit.

Revision 1 writes `changes/<task-id>`. Revision 2 writes
`changes/<task-id>.rev2` and must supersede `changes/<task-id>`; later revisions
must supersede the immediately preceding revision. Existing package directories
are never overwritten.

The request commit is the trigger; the package/result commit is the effect.
Rerun or recovery must inspect remote state first. Never replay an uncertain
package publication, manually construct package bytes, or use this broker to
modify `main`.
