# Portable template changes

Each completed task may add exactly one directory named by its task ID. It holds
the generated manifest and the two independent source-range patches. Empty
source ranges produce empty patch files and remain explicit in the manifest.

New packages use manifest schema 2. Generation authenticates the supplied
checkout against the canonical repository recorded by `source-lock.json`, then
fetches the current canonical `developer` and `web-orchestration` tips into a
sterile temporary Git object database. Each exact package base and reviewed head
must resolve from those fetched canonical objects; the base must be an ancestor
of the reviewed head, and the reviewed head must be an ancestor of (or equal to)
the current canonical tip. Package bases come from the task's reviewed ranges and
do not have to equal `source-lock.json`, which is the latest reconciled canonical
source snapshot. This proves package membership from canonical history while
keeping later unrelated branch work out of the package. Patch bytes are generated
only from the fetched canonical objects.

The schema-2 manifest embeds the generation-time source snapshot and its digest,
the observed canonical tips, reviewed-head relationships, exact range metadata,
per-patch digests, and a package-level SHA-256 that binds the provenance metadata
and both patch byte streams. The embedded snapshot is provenance context, not the
authority that defines the package's range bases.

Historical schema-1 packages remain readable and applicable for compatibility,
but they provide integrity checks only and are not reclassified as
provenance-verified. Existing schema-2 packages whose range bases equal their
embedded snapshot remain valid under the independent-snapshot contract. The
validator and apply script make the schema distinction explicit.

Packages are public repository content. Never include credentials, private
configuration, host paths, private chat, or unrelated project changes.
