# Repository layout

```text
/
├── AGENTS.md
├── README.md
├── CONTRIBUTING.md
├── opencode.json
├── .githooks/                     tracked local hooks
├── .opencode/
│   ├── agents/
│   └── package.json
├── docs/
│   ├── architecture/
│   ├── work/
│   └── ...
├── scripts/
├── tests/
├── tools/                         repository-owned utilities and generators
├── contracts/
└── research/
```

`web-orchestration` is a separate branch with independent content; it is not a root path in this tree.

### Placement rules

- Implemented task truth and durable process references: `docs/work/`
- Branch and acceptance contracts: `docs/architecture/`
- Script-level mechanics: `scripts/`
- Repository-owned utilities and generators: `tools/`
- Active implementation agents: `.opencode/agents/{lead-developer,spark-implementer,small-developer,heavy-developer}.md`

## Cleanup principle

Active architecture should describe the current operative route model. Historical or archived notes may still contain legacy ceremony.
