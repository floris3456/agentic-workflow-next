# Portable template changes

Each completed task may add exactly one directory named by its task ID. It holds
the generated manifest and the two independent source-range patches. Empty
source ranges produce empty patch files and remain explicit in the manifest.

New packages use manifest schema 2. Generation authenticates the supplied
checkout against `source-lock.json`, requires the requested bases to equal the
locked review bases, fetches the current canonical `developer` and
`web-orchestration` tips into a sterile temporary Git object database, requires
the requested heads to equal those fetched tips, and generates patch bytes only
from the fetched canonical objects. The manifest embeds the source-lock snapshot,
its digest, the fetched heads, per-patch digests, and a package-level SHA-256 that
binds the provenance metadata and both patch byte streams.

Historical schema-1 packages remain readable and applicable for compatibility,
but they provide integrity checks only and are not reclassified as
provenance-verified. The validator and apply script make that distinction
explicit.

Packages are public repository content. Never include credentials, private
configuration, host paths, private chat, or unrelated project changes.
