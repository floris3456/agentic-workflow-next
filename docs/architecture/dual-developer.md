# Dual Developer architecture

Status: default substantive route

Dual is the default route for non-trivial implementation work.

- `lead-developer` is the primary route owner. It deeply inspects current implementation, chooses the concrete architecture, gives Spark complete task-scoped instructions, reviews the actual repository diff and checks, and steers corrections. Its edit permission is denied and its only task route is `spark-implementer`.
- `spark-implementer` is the sole source editor in Dual and cannot delegate further. It implements within Lead's boundaries, iterates on ordinary edit/test failures, reviews the final diff once, and returns concise changed-file, check, and risk evidence that Lead cannot inspect more directly.
- If implementation requires a material change to architecture, intended behavior, authorized scope, interfaces, or Lead instructions, Spark stops and returns the observed reason and useful evidence. Lead resolves the change and issues revised instructions. No task-scoped proposal file or special choreography is required.
- Model identities are replaceable configuration.
- `small-developer` and `heavy-developer` are independent bounded routes and are not Spark substitutes.

Web remains responsible for route selection and independent final outcome verification. It relies on Lead as the developer brain in Dual rather than duplicating Lead's implementation analysis or review.
