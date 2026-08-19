import assert from "node:assert/strict";
import test from "node:test";
import {
  HostBridgeRegistry,
  WorkspaceMaintenanceGate,
} from "../scripts/workspace-maintenance-lib.mjs";

const enabled = process.env.AGENTIC_WORKFLOW_LIVE_BRIDGE_MUTATION_ACCEPTANCE === "1";

test("operator-opt-in live host bridge start/reconcile acceptance", { skip: enabled ? false : "set AGENTIC_WORKFLOW_LIVE_BRIDGE_MUTATION_ACCEPTANCE=1 for explicit host mutation acceptance" }, async (t) => {
  const hostRegistry = new HostBridgeRegistry();
  const candidates = hostRegistry.findCandidateConfigFiles();
  if (candidates.length === 0) {
    t.skip("No real host bridge configuration found in the default registry");
    return;
  }

  const gate = new WorkspaceMaintenanceGate(process.cwd());
  const status = await gate.bridgeInspect();
  assert.ok(status && typeof status === "object");

  if (status.bridge_running) {
    const reconcile = await gate.bridgeReconcile();
    assert.equal(reconcile.reconciled, true);
    return;
  }

  if (status.service_state === "stopped" && status.starting_safe) {
    const start = await gate.bridgeStart();
    assert.equal(start.status, "started");
    return;
  }

  t.skip("The registered bridge is neither a verified running endpoint nor safely startable from the current host state");
});
