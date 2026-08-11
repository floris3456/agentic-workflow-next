# ChatGPT Project installation package

These public-safe files configure a ChatGPT Project as the web reasoning, orchestration, and independent-review layer for a repository created from this template.

## Install

1. Replace `<owner>/<repository>` and `https://github.com/<owner>/<repository>` in `developer-instructions.md` with the target public repository identity.
2. Set the resulting `developer-instructions.md` as the Project developer instructions.
3. Add every `skill-*.md` file as an individual Project Source, retaining its exact filename.
4. Configure the connected GitHub, symbol-scouting, and OpenCode tools named by the instructions, or operate in MCP-OFF mode when those capabilities are unavailable.
5. Verify read, compare, delegation, and narrowly scoped `web-orchestration-only/**` write capabilities before treating MCP-ON as active.

Project Sources are treated as a flat list. Filename prefixes identify MCP-ON, MCP-OFF, or shared scope so the permanent trigger tables can name each source exactly.

## Boundary

This directory is an installation source, not live private Project state. Do not commit private conversations, credentials, connector configuration, personal data, or Project-specific context here. Runtime orchestration continuity belongs in the sibling `task-context/` and `agent-routing/` directories and must remain public-safe.

The implementation branches must not depend on this branch for code or implementation truth. Exact implementation evidence comes from remote `developer` or accepted `main`.
