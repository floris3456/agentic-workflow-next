import { WorkspaceMaintenanceBase } from "./workspace-maintenance-base.mjs";
import { executeWorkspaceCommand } from "./workspace-maintenance-sandbox.mjs";
import { publishWorkspace } from "./workspace-maintenance-publish.mjs";

export { parseWorktreePorcelain, publicWorkspaceError } from "./workspace-maintenance-common.mjs";

export class WorkspaceMaintenanceGate extends WorkspaceMaintenanceBase {
  async execute(target, command, args, expectedHead, expectedStatusDigest, timeoutMs) {
    return await executeWorkspaceCommand(this, target, command, args, expectedHead, expectedStatusDigest, timeoutMs);
  }

  async publish(target, message, expectedHead, expectedStatusDigest) {
    return await publishWorkspace(this, target, message, expectedHead, expectedStatusDigest);
  }
}
