# Orchestration architecture

## Current state

`orchestration` contains two native runtime representations of one Orchestrator contract:

- `web-orchestration-only/chatgpt-project/` is the ChatGPT Project/Web representation.
- `.opencode/` is the Local OpenCode representation.

Two physical copies are intentional because ChatGPT Project Sources and OpenCode agents/skills require different layouts. There is no generated shared instruction layer.

## Shared semantics

Both variants own research, prompt and prompt-package creation, task/outcome design, Developer-vs-Workspace ownership classification, route selection, orchestration, recovery, workspace backlog handling, promotion guarding, and independent final verification. Dual is the default substantive Developer route.

Workspace Maintainer owns workspace-level structure whether reusable or project-specific. Developer owns actual project implementation/content.

## Runtime-specific behavior

Web uses native ChatGPT web research. Remote Desktop Commander is its indirect medium for local repository/OpenCode interaction; the underlying Developer and Workspace Maintainer runtimes remain OpenCode-owned.

Local uses the connected Tavily MCP for public web research. Local must never read or use `web-orchestration-only/`; that directory is the separate Web runtime representation and would create conflicting instruction context.

Both variants may create ordinary prompts and prompt packages.

## Paired maintenance

Workspace Maintainer treats corresponding Web Project Sources and Local OpenCode skills as paired representations. Shared orchestration behavior changes update both when appropriate; tool/runtime-specific behavior remains only on the applicable side. Validators prove inventory, configuration, safety and runtime wiring rather than prose equality.
