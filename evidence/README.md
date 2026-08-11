# Evidence

This directory stores reproducible evidence used by decisions and gates.

- `manifests/` records file identity, provenance, and hashes.
- `sanitized/` contains derived counts or measurements safe for this public repository.
- Sensitive raw inputs remain ignored and local; their values are never copied here.

Every evidence file should name its classification, source basename or system type, deterministic generation command, limitations, and relevant hash. Evidence supports a decision but does not make the human decision.
