import { WorkspaceMaintenanceBase } from "./workspace-maintenance-base.mjs";
import { executeWorkspaceCommand } from "./workspace-maintenance-sandbox.mjs";
import { publishWorkspace } from "./workspace-maintenance-publish.mjs";
import { WorkspaceBridgeBroker } from "./workspace-maintenance-host.mjs";

export { parseWorktreePorcelain, publicWorkspaceError } from "./workspace-maintenance-common.mjs";
export {
  WorkspaceBridgeBroker,
  HostBridgeRegistry,
  SystemdUserClient,
  HostBridgeAdminClient,
} from "./workspace-maintenance-host.mjs";

export class WorkspaceMaintenanceGate extends WorkspaceMaintenanceBase {
  constructor(rootDirectory, options = {}) {
    super(rootDirectory, options);
    this.bridgeBroker = options.bridgeBroker ?? new WorkspaceBridgeBroker(this.rootDirectory, options);
  }

  async execute(target, command, args, expectedHead, expectedStatusDigest, timeoutMs) {
    return await executeWorkspaceCommand(this, target, command, args, expectedHead, expectedStatusDigest, timeoutMs);
  }

  async publish(target, message, expectedHead, expectedStatusDigest) {
    return await publishWorkspace(this, target, message, expectedHead, expectedStatusDigest);
  }

  async bridgeInspect() {
    return await this.bridgeBroker.inspect();
  }

  async bridgeStart() {
    return await this.bridgeBroker.start();
  }

  async bridgeReconcile() {
    return await this.bridgeBroker.reconcile();
  }
}
