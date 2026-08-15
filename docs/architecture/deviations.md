# Deviation records

## TEMPLATE-TRUST-BOUNDARY-001 — Scout runtime unavailable

- **Expected state:** The current design and delegated trust-boundary task require
  a concurrent Luna/high repository Scout whose model, instructions, permissions,
  evidence contract, read/search tools, and startup are bridge/runtime-owned;
  inspected refs and unrelated global OpenCode customization must be evidence only
  and unable to execute or steer startup.
- **Implemented state:** `scout.start` retains strict request admission, durable
  correlation/status, concurrency, and no-replay semantics but fails before
  checkout or OpenCode contact. The ref-owned tracked Scout agent is removed. The
  future-runtime exact-ref workspace disables hooks and inherited/global/system
  Git config, verifies detached cleanliness and ancestry, realpath-checks all
  symlinks, and disposes invalid views. LSP is excluded. Bootstrap/status report
  the unavailable runtime explicitly.
- **Reason:** Public upstream source at pinned OpenCode release commit
  `a3647eb025c7615159d417dcc49fc39fdaeba65b` shows built-in `read` calling
  `Instruction.resolve` (which attaches nearby repository instructions) and LSP
  warm-up, while config initialization schedules package installation for scanned
  config directories. Project-config disablement, permissions, `--pure`, and an
  isolated HOME do not remove these behaviors. Reusing the normal developer
  server would additionally admit unrelated global startup customization.
- **Impact and residual risk:** New Scout evidence is unavailable, and historical
  mapped sessions are not contacted or advanced. Developer sessions, ordinary TUI
  use, status reads, GitHub control, and direct GitHub evidence remain available.
  The fail-closed path has no known ref/global execution exposure because it makes
  no Scout checkout or runtime request.
- **Required decision:** Approve a materially larger bridge-owned in-process
  read/glob/grep tool/runtime, approve a separately audited OS/container sandbox
  and runtime protocol, or adopt an upstream OpenCode release that proves all
  required isolation properties.
- **Reconciliation route:** Implement the selected runtime behind the existing
  UUID request/state contract; prove no repository/global instruction or extension
  loading, no LSP/package/ref-process/download side effects, realpath containment,
  exact-ref concurrency and recovery; then remove this deviation in the same
  reviewed change.

When an accepted plan, design, milestone, or gate differs materially from implementation, create or update the applicable deviation record in the same commit as the implementation fact it describes. A deviation should state:

- the expected state and its authoritative source;
- the implemented state;
- why the difference exists;
- impact, residual risk, and affected evidence;
- the required human decision or experiment; and
- the route for reconciliation, acceptance, or reversal.

Failed approaches belong in task-progress unless they create a durable system constraint. Research and automated checks are evidence, not acceptance.
