# Orchestration AS-BUILT

## Branch purpose

`orchestration` owns the repository's Orchestrator instruction/runtime representations. It does not own Developer implementation or Workspace Maintainer implementation truth and is never merged into `main`.

## Web representation

`web-orchestration-only/` contains the ChatGPT Project permanent instructions, five conditional Sources, public-safe task-context/backlog, and its standalone validator/tests. Web uses native ChatGPT web research and Remote Desktop Commander as its indirect local/OpenCode medium.

## Local representation

`opencode.json` selects `local-orchestrator`, disables sharing and compaction, and declares the remote Tavily MCP endpoint without persisting credentials. `.opencode/package.json` pins OpenCode `1.18.23`.

`.opencode/agents/local-orchestrator.md` is the Local primary agent. It owns the same orchestration semantics as Web, requires Tavily for public research, and permanently forbids reading/using `web-orchestration-only/`.

The five Local skills are `orchestration-workflow`, `recovery`, `workspace`, `promotion`, and `prompt-creation`. They correspond to the five Web Project Sources but use native OpenCode packaging. Both variants may create prompts and prompt packages.

## Ownership/routing

Workspace-level structure belongs to Workspace Maintainer whether reusable or project-specific. Actual project implementation/content belongs to Developer, with Dual as the default substantive route. Developer-discovered workspace concerns return to Orchestrator for later human decision rather than being changed inside the project task.

## Verification

`validate-orchestration.mjs` validates root/local inventories, OpenCode/Tavily configuration, Local agent/skill frontmatter and critical Local isolation markers, invokes the standalone Web package validator, and checks the orchestration CI contract. Web negative tests remain under `web-orchestration-only/validate-package.test.mjs`.

`.github/workflows/validate-orchestration.yml` validates pushes to `orchestration`, runs the branch validator plus discovery-mode Node tests, and publishes an exact-SHA status with read-only repository permissions except status reporting.
