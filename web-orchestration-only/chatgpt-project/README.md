# ChatGPT Project installation package

These public-safe files configure a ChatGPT Project as the web reasoning,
orchestration, and independent-review layer for a repository created from this
template.

## Install

1. Run `node web-orchestration-only/validate-package.mjs` against one exact
   untouched `web-orchestration` revision.
2. Render that revision in an external, untracked staging directory. Replace
   `<owner>/<repository>` and `https://github.com/<owner>/<repository>` throughout
   the staged `chatgpt-project/` with the target public repository identity.
3. Replace `<bridge-control-label>` and `<bridge-bot-login>` throughout the staged
   directory with the locally configured bridge label and GitHub App bot login.
   Never commit the rendered copy or connector configuration.
4. Set the rendered `developer-instructions.md` as the Project developer
   instructions.
5. Add these five rendered files as individual Project Sources, retaining each
   exact filename:

   - `skill-workflow.md`
   - `skill-recovery.md`
   - `skill-template-maintenance.md`
   - `skill-promotion.md`
   - `skill-prompt-creation.md`
6. Configure the Project's available repository capabilities according to the
   deployment: exact GitHub reads/comparisons where possible; required
   issue/comment/label control for the repository's Issues bridge when local
   delegation or Scouts are intended; narrowly scoped ordinary continuity writes
   under `web-orchestration-only/task-context/**` on `web-orchestration`; and
   narrowly scoped template-maintenance continuity writes under
   `docs/work/current/**` on `template-development`.
7. Have the local operator configure and run the repository's outbound GitHub
   Issues bridge when Scout/developer delegation is desired. The connected GitHub
   identity must satisfy the bridge's author allowlist/association requirements.
8. Do not configure the Project around a model-name or MCP-ON/MCP-OFF distinction.
   The Project chooses actions from the human outcome and capabilities actually
   available when each action is needed. Missing one capability limits only the
   dependent action; it does not switch the Project into a separate global mode.
9. Before relying on optional write/bridge capabilities, test them directly on
   safe disposable targets. A capability test proves only that capability; it
   does not authorize a real control mutation or weaken task-specific review.

The five Sources are intentionally separated by conditional trigger. Prompt
creation is one Source because destination, mission, evidence-transfer, and craft
are always used together. Recovery and promotion stay separate because their
detailed procedures are rare and should not occupy ordinary task context.

## Boundary

This directory is an installation source, not live private Project state. Do not
commit private conversations, credentials, connector configuration, personal
data, host-local absolute paths, or Project-specific private context here.
Ordinary runtime continuity belongs in the sibling `task-context/` directory;
explicitly commissioned template maintenance belongs in `docs/work/current/**`
on `template-development` instead. Both must remain public-safe. Bridge issue
titles, bodies, comments, hidden markers, labels, and projected results are
public too.

The implementation branches must not depend on this branch for code or
implementation truth. Exact implementation evidence comes from remote
`developer` or accepted `main`.

## Upgrade an existing Project

1. Reconcile any in-flight developer mutation, Scout, bridge command, or pending
   publication before changing the installed Project package. Do not create a new
   task that could duplicate unresolved work.
2. Follow the same validation and external untracked rendering sequence as a
   fresh install.
3. Replace the Project developer instructions and install the exact five-Source
   inventory above from that one rendered revision. Remove every superseded
   `skill-*.md` Source rather than retaining stale or duplicate instructions.
4. Remove MCP-ON/MCP-OFF mode assumptions from local Project setup. Keep any
   useful GitHub, web, bridge, or other capabilities configured independently;
   the new workflow selects them locally when relevant.
5. Existing public task records remain historical truth. For active ordinary
   task contexts, remove obsolete mode metadata on the next consequential update
   and retain only capability limitations that materially affect the task.
6. Resume work only after exact remote state and previously launched work are
   reconciled. The new package does not reinterpret a historical bridge issue,
   command UUID, Scout result, or human approval.
