# ChatGPT Project installation package

These public-safe files configure a ChatGPT Project as the web reasoning, orchestration, and independent-review layer for a repository created from this template.

## Install

1. Run `node web-orchestration-only/validate-package.mjs` against one exact untouched `web-orchestration` revision.
2. Render that revision in an external, untracked staging directory. Replace `<owner>/<repository>` and `https://github.com/<owner>/<repository>` throughout the staged `chatgpt-project/` with the target public repository identity.
3. Replace `<bridge-control-label>` and `<bridge-bot-login>` throughout the staged directory with the locally configured bridge label and GitHub App bot login. Never commit the rendered copy or connector configuration.
4. Set the rendered `developer-instructions.md` as the Project developer instructions.
5. Add every rendered `skill-*.md` file as an individual Project Source, retaining its exact filename.
6. Configure connected/native GitHub access for exact repository reads and comparisons; issue list/search, create/read/update/comment/close/reopen, label read/write, and comment-author metadata; and narrowly scoped writes under `web-orchestration-only/task-context/**` and `web-orchestration-only/agent-routing/**` on `web-orchestration`.
7. Have the local operator configure and run the repository's outbound GitHub Issues bridge. The connected GitHub identity must be in the bridge author allowlist and have GitHub association `OWNER`, `MEMBER`, or `COLLABORATOR`.
8. Optionally configure the symbol-scouter for orientation. Do not configure a direct OpenCode tool in the Project; implementation control travels through GitHub Issues.
9. Verify exact read/compare, issue-control, expected bridge-bot identity, and narrow orchestration-state write capabilities separately before treating MCP-ON as active. On a disposable issue, test exact comment readback, author metadata, close/reopen, and a harmless non-control label; remove the label and close the issue afterward. Never apply the bridge control label unless a real bounded task is intended.

Project Sources are treated as a flat list. Filename prefixes identify MCP-ON, MCP-OFF, or shared scope so the permanent trigger tables can name each source exactly.

## Boundary

This directory is an installation source, not live private Project state. Do not commit private conversations, credentials, connector configuration, personal data, or Project-specific context here. Runtime orchestration continuity belongs in the sibling `task-context/` and `agent-routing/` directories and must remain public-safe. Bridge issue titles, bodies, comments, hidden markers, labels, and projected results are public too.

The implementation branches must not depend on this branch for code or implementation truth. Exact implementation evidence comes from remote `developer` or accepted `main`.

## Upgrade an existing Project

1. Stop consequential delegation and reconcile any in-flight direct implementation before enabling the bridge. Do not create a bridge task that could duplicate work already running through a former transport.
2. Follow the same validation and external untracked rendering sequence as a fresh install.
3. Replace the Project developer instructions and every existing `skill-*.md` Source from that one rendered revision; remove superseded copies rather than retaining duplicate instructions.
4. Remove the former direct OpenCode connector/tool from the Project and re-verify the capabilities above.
5. Backfill active task-context and routing files with the new bridge fields. Use `none` for unestablished authority, issue, UUID, sequence, lifecycle, and SHA fields. Put `legacy` or `unknown` only in a non-authoritative migration note; never use either as human approval.
6. Resume only after remote state and old work are reconciled. A task with no existing bridge-bound issue requires a new issue whose first valid command is `start`; never infer a bridge continuation from former transport state.
