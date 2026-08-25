# ChatGPT Project installation package

These public-safe files configure a ChatGPT Project as the Web research,
orchestration, task-design, route-selection, and independent final-verification
layer for `<owner>/<repository>` at
`https://github.com/<owner>/<repository>`.

## Install

1. Validate one exact untouched `web-orchestration` revision with
   `node web-orchestration-only/validate-package.mjs`.
2. Render that revision in an external untracked staging directory. Replace
   `<owner>/<repository>` and `https://github.com/<owner>/<repository>` with the
   target public repository identity.
3. Set rendered `developer-instructions.md` as the Project developer instructions.
4. Add exactly these five rendered Project Sources, keeping their filenames:

   - `skill-workflow.md`
   - `skill-recovery.md`
   - `skill-maintenance.md`
   - `skill-promotion.md`
   - `skill-prompt-creation.md`
5. Configure only capabilities the deployment really has, such as public web
   research, exact GitHub reads and authorized writes, and access to installed
   developer or maintenance execution. Capability availability is not task
   authority and does not create a retry ladder.
6. Test optional mutation capabilities on safe disposable targets before relying
   on them.

The Sources are separated by trigger so exceptional and maintenance procedure is
not loaded during ordinary work. The permanent instructions contain only the
continuous Web role, authority, safety, evidence, context, and router.

## Boundary

This directory is installation source, not private live Project state. Do not
commit private conversations, credentials, connector or host configuration,
personal data, host-local absolute paths, or private runtime identifiers.

Durable task records and optional progress belong under sibling `task-context/`
when useful. Historical records remain unchanged evidence. Exact implementation
truth stays on the branch that owns the implementation.

## Upgrade

1. Reconcile any in-flight or uncertain mutation before replacing instructions.
2. Validate and externally render one exact new revision.
3. Replace the developer instructions and install the exact five-Source inventory
   above; remove superseded or duplicate Sources.
4. Remove obsolete mode, context-reconstruction, retry-counter, mandatory
   finalization, push-every-commit, and package-ceremony assumptions from the live
   Project setup.
5. Resume active work only after exact remote and execution-session state is
   reconciled.
