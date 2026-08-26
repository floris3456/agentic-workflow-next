# Dual Developer architecture

Status: default substantive route

Dual is the default route for non-trivial project implementation.

- `lead-developer` is the developer brain: it deeply inspects current implementation, chooses the concrete architecture, gives Spark complete task-scoped instructions, reviews the actual repository diff and checks, and steers corrections. Its edit permission is denied and its only task route is `spark-implementer`.
- `spark-implementer` is the sole source editor in Dual and cannot delegate. It implements inside Lead's design, iterates on ordinary edit/test failures with focused checks, reviews the final diff once, and returns concise changed-file, check, risk, and material-decision evidence rather than routinely transmitting a full diff Lead can inspect directly.
- If implementation requires a material change to architecture, intended behavior, scope, interfaces, or Lead instructions, Spark returns the evidence and proposed direction before departing from the design. Lead decides the new direction and issues revised instructions; no special proposal-file ceremony is required.
- Model identities are replaceable configuration.
- `small-developer` and `heavy-developer` are independent bounded shortcuts used only when Dual would be unnecessary overhead; they are never Spark substitutes inside Dual.

Web owns route selection and independent final outcome verification; developer-side completion is not web or human acceptance.
