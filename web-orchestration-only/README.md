# Web-orchestrator persistence

This independent branch stores concise, public-safe continuity and reusable
installation material for the web orchestrator.

## Authority

- These files are orchestration memory and installation sources, not
  authoritative implementation evidence.
- Exact implementation facts come from remote `developer` or accepted `main`.
- Only the web orchestrator writes runtime continuity here through an authorized
  repository capability.
- Bridge-control issues, bridge results, Scouts, developers, CI, and task records
  are navigation/evidence, not human acceptance.
- OpenCode implementation developers do not read, modify, pull, or depend on this
  branch during normal tasks.
- This branch is never normally merged with implementation branches.

## Contents

- `task-context/<task-id>.md`: focused public-safe ordinary orchestration
  continuity when a consequential task needs durable state.
- `chatgpt-project/`: minimal permanent developer instructions plus five
  conditionally routed Sources: workflow, recovery, template maintenance,
  promotion, and one unified prompt-creation/optimization skill.
- `validate-package.mjs` and `validate-package.test.mjs`: package inventory,
  routing, task-context continuity, installation, capability-local behavior,
  executable bridge-envelope contracts, and focused safety-negative fixtures.
- `.github/workflows/validate-web-orchestration.yml`: read-only branch-owned
  push validation for the canonical package validator and automatically
  discovered Node tests.

The Project does not define MCP-ON/MCP-OFF or model-name operating modes.
Capabilities are selected locally when they serve the human's requested outcome;
a missing capability limits only the dependent action.

Anything written here or in a bridge-control issue, including hidden command
markers and projected results, is public disclosure. Do not store secrets,
private chat details, personal data, raw sensitive values, connector credentials,
host-local absolute paths, or unsupported allegations.

## Validate

```bash
node web-orchestration-only/validate-package.mjs
node --test
```

Every push to `web-orchestration` runs the same validator plus discovery-mode
`node --test` through `.github/workflows/validate-web-orchestration.yml`. This
keeps normal future Node test files on the branch inside the canonical remote
acceptance path without requiring a workflow edit for each new test file. The
workflow has only read access to repository contents and does not persist checkout
credentials.
