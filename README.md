# Orchestration

This branch contains two native representations of one repository Orchestrator contract.

- `web-orchestration-only/`: ChatGPT Project/Web instructions and public task continuity.
- `.opencode/`: Local OpenCode Orchestrator agent and skills.
- `AGENTS.md`: ambient safety plus the Local-vs-Web instruction boundary.
- `opencode.json`: Local runtime selection, compaction/share settings and Tavily MCP connection.
- `validate-orchestration.mjs`: branch-level structural/configuration validator.

Web uses native ChatGPT web research and Remote Desktop Commander for indirect local/OpenCode interaction. Local uses Tavily for public web research and never reads `web-orchestration-only/`. Both may create prompts and prompt packages.

Workspace Maintainer owns paired maintenance of the two instruction representations. Shared semantics should remain aligned while tool/runtime-specific behavior stays separate.

Validate with:

```bash
node validate-orchestration.mjs
node --test
```
