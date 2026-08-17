import { tool } from "@opencode-ai/plugin";
import { WorkspaceMaintenanceGate, publicWorkspaceError } from "../../scripts/workspace-maintenance-lib.mjs";

const target = tool.schema.string().min(1).max(255).describe("Registered local branch name or exact detached-worktree HEAD; never a filesystem path");
const expectedHead = tool.schema.string().regex(/^[0-9a-f]{40}$/);
const expectedStatusDigest = tool.schema.string().regex(/^[0-9a-f]{64}$/);

function gate(context: { directory: string }) {
  return new WorkspaceMaintenanceGate(context.directory);
}

function json(value: unknown) {
  return JSON.stringify(value, null, 2);
}

async function publicResult(operation: () => Promise<string>) {
  try {
    return await operation();
  } catch (error) {
    throw new Error(`Workspace operation rejected: ${publicWorkspaceError(error)}`);
  }
}

export default async function WorkspaceMaintenanceTools() {
  return {
    tool: {
      workspace_list: tool({
        description: "List public-safe identities and Git state for eligible registered worktrees of the exact repository. Host-local paths are never returned.",
        args: {},
        async execute(_args, context) {
          return await publicResult(async () => json(await gate(context).list()));
        },
      }),
      workspace_inspect: tool({
        description: "Verify one registered same-repository worktree and return its branch, HEAD, cleanliness, status digest, relative status, and upstream relationship without changing OpenCode's directory.",
        args: { target },
        async execute(args, context) {
          return await publicResult(async () => json(await gate(context).inspect(args.target)));
        },
      }),
      workspace_read: tool({
        description: "Read bounded UTF-8 lines from a repository-relative regular file in one verified worktree without following symlinks.",
        args: {
          target,
          path: tool.schema.string().min(1).max(4096),
          offset: tool.schema.number().int().min(1).max(1_000_000).optional(),
          limit: tool.schema.number().int().min(1).max(500).optional(),
        },
        async execute(args, context) {
          return await publicResult(async () => await gate(context).read(args.target, args.path, args.offset, args.limit));
        },
      }),
      workspace_write: tool({
        description: "Create or replace one repository-relative UTF-8 file after exact HEAD and status-digest preflight in a verified worktree; symlinks and escapes are rejected.",
        args: {
          target,
          path: tool.schema.string().min(1).max(4096),
          content: tool.schema.string().max(1024 * 1024),
          expected_head: expectedHead,
          expected_status_digest: expectedStatusDigest,
        },
        async execute(args, context) {
          return await publicResult(async () => json(await gate(context).write(
            args.target,
            args.path,
            args.content,
            args.expected_head,
            args.expected_status_digest,
          )));
        },
      }),
      workspace_delete: tool({
        description: "Delete one repository-relative regular file after exact HEAD and status-digest preflight in a verified worktree; directories, symlinks, and escapes are rejected.",
        args: {
          target,
          path: tool.schema.string().min(1).max(4096),
          expected_head: expectedHead,
          expected_status_digest: expectedStatusDigest,
        },
        async execute(args, context) {
          return await publicResult(async () => json(await gate(context).remove(
            args.target,
            args.path,
            args.expected_head,
            args.expected_status_digest,
          )));
        },
      }),
      workspace_glob: tool({
        description: "List bounded repository-relative paths matching a glob in one verified worktree without following symlinks.",
        args: {
          target,
          pattern: tool.schema.string().min(1).max(1024),
        },
        async execute(args, context) {
          return await publicResult(async () => await gate(context).glob(args.target, args.pattern));
        },
      }),
      workspace_grep: tool({
        description: "Find bounded literal UTF-8 text in one verified worktree without following symlinks.",
        args: {
          target,
          query: tool.schema.string().min(1).max(1024),
          glob: tool.schema.string().min(1).max(1024).optional(),
        },
        async execute(args, context) {
          return await publicResult(async () => await gate(context).grep(args.target, args.query, args.glob));
        },
      }),
      workspace_exec: tool({
        description: "Run one executable with explicit arguments inside a networkless Bubblewrap sandbox after exact target preflight. Only the verified worktree is writable; exact Git metadata and fixed system runtimes are read-only, and no host environment or credential is inherited.",
        args: {
          target,
          command: tool.schema.string().min(1).max(1000),
          args: tool.schema.array(tool.schema.string().max(16_384)).max(200).optional(),
          expected_head: expectedHead,
          expected_status_digest: expectedStatusDigest,
          timeout_ms: tool.schema.number().int().min(1).max(600_000).optional(),
        },
        async execute(args, context) {
          return await publicResult(async () => json(await gate(context).execute(
            args.target,
            args.command,
            args.args ?? [],
            args.expected_head,
            args.expected_status_digest,
            args.timeout_ms,
          )));
        },
      }),
      workspace_publish: tool({
        description: "Create one commit from the exactly inspected non-main worktree state and push only that commit to the same verified branch on its verified origin. Git redirection, hooks, filters, alternate objects, force updates, and arbitrary credential access are denied.",
        args: {
          target,
          message: tool.schema.string().min(1).max(4000),
          expected_head: expectedHead,
          expected_status_digest: expectedStatusDigest,
        },
        async execute(args, context) {
          return await publicResult(async () => json(await gate(context).publish(
            args.target,
            args.message,
            args.expected_head,
            args.expected_status_digest,
          )));
        },
      }),
    },
  };
}
