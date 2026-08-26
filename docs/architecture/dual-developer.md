# Dual Developer architecture

Status: default substantive route

Dual is the default route for non-trivial implementation work.

- `lead-developer` is a primary route owner. It has edit deny and keeps only one task permission: `spark-implementer`.
- `spark-implementer` is the sole source editor in Dual and cannot delegate further.
- Model identities are replaceable configuration.
- `small-developer` and `heavy-developer` are independent bounded routes and are not Spark substitutes.

If a material lead instruction must change, Spark must create/update exactly one task-scoped `proposed-deviations.md` file.
The lead resolves it before implementation continues.

Web remains responsible for route selection and final outcome verification; small/heavy routes remain available only when Dual is intentionally unnecessary.
