import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";

test("trusted Scout tools bound UTF-8 evidence and never follow snapshot symlinks", async (context) => {
  const root = mkdtempSync(join(tmpdir(), "bridge-scout-tools-"));
  context.after(() => rmSync(root, { recursive: true, force: true }));
  const parent = join(root, "snapshots");
  const snapshot = join(parent, "a".repeat(40));
  const outside = join(root, "outside");
  mkdirSync(join(snapshot, "src"), { recursive: true });
  mkdirSync(outside);
  writeFileSync(join(snapshot, "src", "fact.ts"), "first\nconst boundary = true\nlast\n");
  writeFileSync(join(outside, "secret.txt"), "outside secret\n");
  symlinkSync(join(outside, "secret.txt"), join(snapshot, "evidence-link"));
  symlinkSync(outside, join(snapshot, "outside-dir"));
  process.env.SCOUT_SNAPSHOT_PARENT = parent;
  context.after(() => { delete process.env.SCOUT_SNAPSHOT_PARENT; });
  const runtimePlugin = new URL("../../scout-runtime/plugins/scout-tools.mjs", import.meta.url).href;
  const plugin = await import(runtimePlugin);
  const hooks = await plugin.default();
  const tools = hooks.tool as Record<string, { execute(args: Record<string, unknown>, context: { directory: string }): Promise<string> }>;
  const contextValue = { directory: snapshot };

  assert.equal(
    await tools.scout_read!.execute({ path: "src/fact.ts", offset: 2, limit: 1 }, contextValue),
    "2: const boundary = true",
  );
  assert.match(await tools.scout_glob!.execute({ pattern: "src/**" }, contextValue), /src\/fact\.ts/);
  assert.equal(
    await tools.scout_grep!.execute({ query: "boundary", glob: "**/*.ts" }, contextValue),
    "src/fact.ts:2: const boundary = true",
  );
  assert.match(await tools.scout_read!.execute({ path: "evidence-link" }, contextValue), /^SYMLINK evidence-link -> /);
  await assert.rejects(tools.scout_read!.execute({ path: "outside-dir/secret.txt" }, contextValue), /traverses a symlink outside/);
  await assert.rejects(tools.scout_read!.execute({ path: "../outside/secret.txt" }, contextValue), /escapes/);
});
