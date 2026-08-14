# ChatGPT Project installation package

These public-safe files configure a ChatGPT Project as the web reasoning, orchestration, and independent-review layer for a repository created from this template.

## Install

1. Run `node web-orchestration-only/validate-package.mjs` against one exact untouched `web-orchestration` revision.
2. Render that revision in an external, untracked staging directory. Replace `<owner>/<repository>` and `https://github.com/<owner>/<repository>` throughout the staged `chatgpt-project/` with the target public repository identity.
3. Replace `<bridge-control-label>` and `<bridge-bot-login>` throughout the staged directory with the locally configured bridge label and GitHub App bot login. Never commit the rendered copy or connector configuration.
4. Set the rendered `developer-instructions.md` as the Project developer instructions.
5. Add these eight rendered files as individual Project Sources, retaining each
   exact filename:

   - `skill-mcp-on-template-maintenance.md`
   - `skill-mcp-on-workflow.md`
   - `skill-mcp-on-scouting.md`
   - `skill-mcp-on-recovery.md`
   - `skill-mcp-on-finalization.md`
   - `skill-mcp-on-promotion.md`
   - `skill-mcp-off-workflow.md`
   - `skill-mcp-off-scouting.md`
6. Configure connected/native GitHub access for exact repository reads and comparisons; issue list/search, create/read/update/comment/close/reopen, label read/write, and comment-author metadata; narrowly scoped ordinary continuity writes under `web-orchestration-only/task-context/**` on `web-orchestration`; and narrowly scoped template-maintenance continuity writes under `docs/work/current/**` on `template-development`.
7. Have the local operator configure and run the repository's outbound GitHub Issues bridge. The connected GitHub identity must be in the bridge author allowlist and have GitHub association `OWNER`, `MEMBER`, or `COLLABORATOR`.
8. Do not configure a direct OpenCode tool in the Project. MCP-ON launches the
   repository's read-only OpenCode Scout and controls implementation through
   GitHub Issues; MCP-OFF has neither capability.
9. Verify exact read/compare, issue-control, expected bridge-bot identity, and narrow orchestration-state write capabilities separately before treating MCP-ON as active. On a disposable issue, test exact comment readback, author metadata, close/reopen, and a harmless non-control label; remove the label and close the issue afterward. Never apply the bridge control label unless a real bounded task is intended.

Project Sources are treated as a flat list. Filename prefixes identify MCP-ON or
MCP-OFF scope, and the permanent router names every Source exactly. Shared
authority and public-safety boundaries stay permanently visible in the router.

## Boundary

This directory is an installation source, not live private Project state. Do not commit private conversations, credentials, connector configuration, personal data, or Project-specific context here. Ordinary runtime continuity belongs in the sibling `task-context/` directory; explicitly commissioned template maintenance belongs in `docs/work/current/**` on `template-development` instead. Both must remain public-safe. Bridge issue titles, bodies, comments, hidden markers, labels, and projected results are public too.

The implementation branches must not depend on this branch for code or implementation truth. Exact implementation evidence comes from remote `developer` or accepted `main`.

## Upgrade an existing Project

1. Stop consequential delegation and reconcile any in-flight direct implementation before enabling the bridge. Do not create a bridge task that could duplicate work already running through a former transport.
2. Follow the same validation and external untracked rendering sequence as a fresh install.
3. Replace the Project developer instructions and install the exact eight-Source
   inventory above from that one rendered revision. Remove every superseded
   `skill-*.md` Source, including `skill-shared-safety-and-authority.md`, rather
   than retaining stale or duplicate instructions.
4. Remove the former direct OpenCode connector/tool from the Project and re-verify the capabilities above.
5. Merge active legacy routing facts into each task context's `## Routing`
   section, then retire the separate routing record. Backfill the canonical
   bridge issue, related-issue dispositions, and highest accepted sequence from
   exact trusted issue history; use `none` where authority, issue, UUID,
   lifecycle, or SHA is unestablished. Put `legacy` or `unknown` only in a
   non-authoritative migration note; never use either as human approval. Migrate
   active launched work and prepared publication into the current task-context
   sections; use `none` for connector refusals that were never recorded.
6. Resume only after remote state and old work are reconciled. A task with no existing bridge-bound issue requires a new issue whose first valid command is `start`; never infer a bridge continuation from former transport state.
