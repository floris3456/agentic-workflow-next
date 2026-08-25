# Evolution from Web orchestration to orchestration

## Status and authority

This is a repository-ready design, not implemented runtime architecture. The
current live records do not authorize renaming the branch/package or claiming a
Local orchestrator capability profile. The current `web-orchestration` package
therefore remains Web-specific.

The smallest next authorized change is an accepted task record that names the
new branch/package, defines the actually available Local capabilities, selects
the installation composition contract, and states any compatibility period for
existing Web installations.

## Recommendation

Use a **shared orchestrator core plus one small capability profile**, not two
duplicated instruction stacks.

The shared core owns behavior whose meaning does not change with tools:

- task and outcome design;
- evidence versus authority;
- one mutating route;
- durable task-record and progress roles;
- route selection by task rather than retry ladder;
- developer and maintenance ownership boundaries;
- uncertain-effect reconciliation;
- human exact-SHA main promotion;
- context transfer and the 5,000-token reread policy; and
- independent final verification.

A capability profile is continuous role context and belongs beside the core in
the installed permanent instructions. It declares only evidence and mutation
surfaces that actually exist. Conditional Sources remain shared unless a real
procedure differs because of capability.

## Capability profiles

### Web

The Web profile may own capabilities that are actually installed, such as:

- public web research and external-source synthesis;
- exact remote Git/GitHub inspection;
- authorized remote branch mutation;
- invocation of connected developer or maintenance execution;
- remote checks and publication evidence; and
- independent remote final verification.

It must not assume local filesystem, process, worktree, or agent-session access.

### Local

The Local profile may own capabilities that are actually installed, such as:

- direct filesystem and registered-worktree inspection;
- local Git, process, and session state;
- local commands, tests, and builds;
- launching or interacting with installed developer and maintenance agents; and
- reconciliation of local effects with exact remote refs.

It must not assume web research, connected GitHub mutation, or external service
access unless those capabilities are explicitly installed.

## Package shape

A future `orchestration` branch/package should use a small layout such as:

```text
orchestration-only/
  shared/developer-instructions-core.md
  profiles/web.md
  profiles/local.md
  sources/skill-workflow.md
  sources/skill-recovery.md
  sources/skill-maintenance.md
  sources/skill-promotion.md
  sources/skill-prompt-creation.md
  README.md
  AS-BUILT.md
  validate-package.mjs
  validate-package.test.mjs
```

Installation concatenates the shared permanent core with exactly one capability
profile. It installs the shared Sources unchanged. This composition should be a
small deterministic render step, not a runtime router or generalized framework.

A variant-specific Source should exist only when evidence proves that one
procedure cannot be expressed clearly through the capability profile. Tool
schemas and permissions should enforce hard mechanical boundaries; prose should
not duplicate them.

## Route and ownership behavior

Both variants choose development and maintenance routes using the same task
reasoning. The profile changes how state is inspected, how an execution route is
invoked, and which final effects can be verified directly.

The Web orchestrator does not become a second Lead developer. The Local
orchestrator does not become an implementation editor merely because it can see
the filesystem. Lead remains the developer brain in Dual, Spark edits, and the
unified maintenance role handles bounded maintenance on an explicit verified
target.

Recovery uses the same rule in both profiles: inspect the surfaces available to
the current variant, absorb an existing effect, retry only when absence is proven
and safe, and never launch a second mutating route over unresolved work.

## Migration sequence

1. Accept the rename/generalization task and exact capability profiles.
2. Create the shared core and Web profile from the current validated package
   without changing Web behavior.
3. Add the Local profile only after its real tools, evidence surfaces, mutation
   boundaries, and agent invocation path are known and testable.
4. Validate deterministic composition and each profile's hard capability claims.
5. Migrate installed consumers during the accepted compatibility period, then
   retire the Web-only package name.

Do not rename first and invent Local behavior afterward. The profile must describe
implemented capability, not desired capability.
