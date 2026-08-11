# Repository layout

```text
/
├── README.md
├── AGENTS.md
├── CONTRIBUTING.md
├── SECURITY.md
├── opencode.json
├── .jcodemunch.jsonc
├── .githooks/                       tracked local enforcement
├── .opencode/
│   ├── agents/                      local implementation agents
│   └── skills/                      conditional local procedures
├── .github/                         CI and contribution templates
├── docs/
│   ├── architecture/                current system truth
│   ├── governance/                  human authority/ownership roles
│   ├── milestones/                  gate plans and evidence
│   ├── plain-language/              first-reader explanation
│   └── work/
│       ├── current/                 temporary task-progress
│       ├── archive/                 durable closed work records only
│       ├── future/                  non-normative proposals
│       └── templates/
├── contracts/                       versioned schemas/examples
├── src/                             deployable implementation and component AS-BUILT
├── tests/                           automated tests and fictional fixtures
├── tools/ and scripts/              deterministic repository utilities
├── research/                        research packages and workflow
├── evidence/                        sanitized derived evidence/provenance
└── raw-evidence/                    optional immutable external evidence
```

The independent `web-orchestration` branch contains only `web-orchestration-only/**` and is not part of the normal implementation tree. It holds public-safe continuity plus a generalized ChatGPT Project installation source. Installed Project state, private conversations, connector credentials, and project-specific private context are deliberately not stored in Git.

## Placement rules

| Change | Location |
| --- | --- |
| Active task process | `docs/work/current/<task>.md` |
| Current implemented component facts | `src/<component>/AS-BUILT.md` or the component's established AS-BUILT location |
| Planned-versus-actual difference | applicable milestone/component deviation record |
| Architecture authority/branch model | `docs/architecture/` |
| Human gate evidence | `docs/milestones/` |
| Conditional local agent procedure | `.opencode/skills/<name>/SKILL.md` |
| Repeatable command | `scripts/` or `tools/` |
| Source evidence | existing immutable evidence root; never rewrite |

## Cleanup

Remove obsolete agents, skills, templates, scripts, validators, and active references together. Do not preserve old agent-system chronology in current architecture records. Do not add empty product frameworks before their milestone.
