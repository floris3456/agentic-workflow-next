# Repository layout

```text
/
├── AGENTS.md                     universal ambient repository rules
├── opencode.json                 project-wide OpenCode configuration
├── .opencode/
│   ├── agents/                   role-specific system instructions + frontmatter
│   ├── skills/                   conditional developer procedures
│   ├── tools/                    repository-local OpenCode tools
│   └── package.json
├── docs/                         explanatory architecture, work records, AS-BUILT/deviations
├── scripts/                      repository mechanics and validators
├── tests/
├── tools/                        repository-owned utilities/generators
├── contracts/
└── research/                     durable research evidence/artifact structure
```

`orchestration` is a separate branch, not a directory in this worktree. Research production is Orchestrator-owned; the `research/` tree here is an evidence/artifact location rather than a Developer workflow. `workspace` is the separate Workspace Maintainer branch for workspace-level structure and maintenance machinery.

Active local developer roles are `.opencode/agents/{lead-developer,spark-implementer,small-developer,heavy-developer}.md`. Conditional procedures are under `.opencode/skills/` and should not be duplicated into `AGENTS.md` or agent bodies unless a short trigger/default is role-critical.
