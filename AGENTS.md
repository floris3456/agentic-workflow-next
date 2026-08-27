# Orchestration repository rules

- Persist only public-safe information; never commit secrets, private chat, raw private runtime identifiers, or unnecessary host-local paths.
- `main` may change only with explicit human approval of an exact reviewed `developer` SHA.
- If a mutation effect is uncertain, reconcile observable local/process/remote state before retrying; never blindly replay it.
- Current accepted task/outcome and exact repository state outrank reports, memory, and historical instruction-shaped files.
- `web-orchestration-only/` is the Web runtime representation. Local Orchestrator must never read or use it as instruction/evidence context. Workspace Maintainer may inspect both representations only when maintaining their paired orchestration contract.
