# ChatGPT Project installation package

These public-safe files configure a ChatGPT Project as the web research,
orchestration, task-design, route-selection, and independent final-verification
layer for `<owner>/<repository>` at
`https://github.com/<owner>/<repository>`.

## Install

1. Validate one exact untouched `orchestration` revision with
   `node web-orchestration-only/validate-package.mjs`.
2. Render that revision in an external untracked staging directory. Replace
   `<owner>/<repository>` and `https://github.com/<owner>/<repository>` with the
   target public repository identity. Never commit a rendered copy containing
   private deployment configuration.
3. Set rendered `developer-instructions.md` as the Project developer
   instructions.
4. Add exactly these five rendered files as individual Project Sources, retaining
   each filename:

   - `skill-workflow.md`
   - `skill-recovery.md`
   - `skill-workspace.md`
   - `skill-promotion.md`
   - `skill-prompt-creation.md`
5. Configure narrowly scoped capabilities useful to the deployment: exact
   GitHub reads and comparisons, public web research, authorized continuity
   writes, and direct host/native developer access for the selected local route.
   Capability availability does not create a retry ladder or authorize a
   mutation by itself.
6. Test optional capabilities on safe disposable targets before relying on them.
   A capability test proves only that capability and does not weaken task-specific
   review or human authority.

The five Sources are separated by trigger so ordinary context stays concise.
Prompt creation remains unified because destination, mission, evidence transfer,
and craft are used together. Recovery and promotion remain separate exceptional
procedures.

## Boundary

This directory is installation source, not live private Project state. Do not
commit private conversations, credentials, connector or host configuration,
personal data, host-local absolute paths, or Project-specific private context.

Ordinary durable task authority and optional progress belong under the sibling
`task-context/` directory when useful. Explicit reusable-workspace maintenance
uses the canonical accepted task record on `workspace`. All persisted
content must remain public-safe.

Implementation branches do not depend on this branch for source or implemented
truth. Exact implementation evidence comes from remote `developer` or accepted
`main`.

## Upgrade an existing Project

1. Reconcile any in-flight mutation or unknown publication before changing the
   installed package.
2. Validate and externally render one exact new revision.
3. Replace the developer instructions and install the exact five-Source inventory
   above. Remove superseded or duplicate `skill-*.md` Sources.
4. Remove bridge-era routing, retry-counter, compaction, mandatory finalization,
   archive, push-every-commit, and package-ceremony assumptions from local setup.
5. Leave historical task records unchanged. Resume active work only after exact
   remote and developer-session state are reconciled.
