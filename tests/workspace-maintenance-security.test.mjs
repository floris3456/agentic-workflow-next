import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { chmod, mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { promisify } from "node:util";
import { WorkspaceMaintenanceGate } from "../scripts/workspace-maintenance-lib.mjs";

const executeFile = promisify(execFile);

async function command(cwd, executable, args) {
  const result = await executeFile(executable, args, {
    cwd,
    encoding: "utf8",
    env: { ...process.env, GIT_TERMINAL_PROMPT: "0" },
  });
  return { stdout: result.stdout.trim(), stderr: result.stderr.trim() };
}

async function git(cwd, ...args) {
  return await command(cwd, "git", args);
}

async function configureRepository(root) {
  await git(root, "config", "user.name", "Workspace Security Fixture");
  await git(root, "config", "user.email", "workspace-security@example.invalid");
  await git(root, "config", "commit.gpgsign", "false");
}

async function fixture(t) {
  const root = await mkdtemp(join(tmpdir(), "workspace-maintenance-security-"));
  t.after(async () => await rm(root, { recursive: true, force: true }));
  const origin = join(root, "origin.git");
  const foreign = join(root, "foreign.git");
  const template = join(root, "template");
  const developer = join(root, "developer");
  await git(root, "init", "--bare", origin);
  await git(root, "init", "--bare", foreign);
  await mkdir(template);
  await git(template, "init", "--initial-branch=workspace");
  await configureRepository(template);
  await git(template, "remote", "add", "origin", origin);
  await writeFile(join(template, "AGENTS.md"), "ROOT TEMPLATE AUTHORITY\n", "utf8");
  await writeFile(join(template, "base.txt"), "base\n", "utf8");
  await git(template, "add", ".");
  await git(template, "commit", "-m", "Create security fixture");
  await git(template, "push", "--set-upstream", "origin", "workspace");
  await git(template, "branch", "developer");
  await git(template, "worktree", "add", developer, "developer");
  await git(developer, "push", "--set-upstream", "origin", "developer");
  return {
    root,
    origin,
    foreign,
    template,
    developer,
    gate: new WorkspaceMaintenanceGate(template, { fixtureOrigins: [origin, foreign] }),
  };
}

async function dirtyDeveloper(value, name = "change.txt") {
  await writeFile(join(value.developer, name), "security change\n", "utf8");
  return await value.gate.inspect("developer");
}

async function foreignDeveloperHead(value) {
  return (await git(value.template, "ls-remote", value.foreign, "refs/heads/developer")).stdout;
}

test("workspace_exec exposes only current sanitized Git state, not private common state, stale shared indexes, or unreachable objects", async (t) => {
  const value = await fixture(t);
  const common = (await git(value.template, "rev-parse", "--git-common-dir")).stdout;
  const commonPath = common.startsWith("/") ? common : join(value.template, common);
  const privateDirectory = join(commonPath, "private-runtime", "security-fixture");
  await mkdir(privateDirectory, { recursive: true });
  await writeFile(join(privateDirectory, "private-state.sqlite"), "private-common-git-sentinel\n", "utf8");

  const worktreeGit = (await git(value.developer, "rev-parse", "--absolute-git-dir")).stdout;
  await writeFile(join(worktreeGit, `sharedindex.${"a".repeat(40)}`), "private-stale-shared-index-sentinel\n", "utf8");

  const unreachableSource = join(value.root, "unreachable.txt");
  await writeFile(unreachableSource, "private-unreachable-object-sentinel\n", "utf8");
  const unreachable = (await git(value.template, "hash-object", "-w", unreachableSource)).stdout;
  assert.match(unreachable, /^[0-9a-f]{40,64}$/);

  await writeFile(join(value.developer, "staged.txt"), "staged-content\n", "utf8");
  await git(value.developer, "add", "staged.txt");
  await writeFile(join(value.developer, "dirty.txt"), "dirty\n", "utf8");
  let state = await value.gate.inspect("developer");
  const privateRead = await value.gate.execute(
    "developer",
    "node",
    [
      "-e",
      [
        "const fs=require('node:fs');",
        "const probes=['/repo.git/private-runtime/security-fixture/private-state.sqlite','/worktree.git/private-runtime/security-fixture/private-state.sqlite','/git-view/private-runtime/security-fixture/private-state.sqlite'];",
        "let visible=false;",
        "for (const path of probes) { try { if (fs.readFileSync(path,'utf8').includes('private-common-git-sentinel')) visible=true; } catch {} }",
        "let names=[];",
        "for (const root of ['/git-view','/workspace/.git']) { try { const stat=fs.lstatSync(root); names.push(root); if (stat.isDirectory()) { const entries=fs.readdirSync(root); names.push(...entries); for (const name of entries.filter(v=>v.startsWith('sharedindex.'))) { try { if (fs.readFileSync(root+'/'+name,'utf8').includes('private-stale-shared-index-sentinel')) visible=true; } catch {} } } else names.push(fs.readFileSync(root,'utf8')); } catch {} }",
        "process.stdout.write(visible || names.some(v=>String(v).includes('private-runtime')) ? 'private-git-state-visible' : 'private-git-state-absent');",
      ].join(""),
    ],
    state.head,
    state.status_digest,
  );
  assert.equal(privateRead.exit_code, 0, privateRead.stderr);
  assert.equal(privateRead.stdout, "private-git-state-absent");
  assert.doesNotMatch(JSON.stringify(privateRead), /private-common-git-sentinel|private-stale-shared-index-sentinel|private-runtime\/security-fixture/);

  state = privateRead.target_state;
  const unreachableRead = await value.gate.execute(
    "developer",
    "git",
    ["cat-file", "-p", unreachable],
    state.head,
    state.status_digest,
  );
  assert.notEqual(unreachableRead.exit_code, 0, JSON.stringify(unreachableRead));
  assert.doesNotMatch(`${unreachableRead.stdout}\n${unreachableRead.stderr}`, /private-unreachable-object-sentinel/);

  state = unreachableRead.target_state;
  const status = await value.gate.execute(
    "developer",
    "git",
    ["status", "--short"],
    state.head,
    state.status_digest,
  );
  assert.equal(status.exit_code, 0, status.stderr);
  assert.match(status.stdout, /A  staged\.txt/);
  assert.match(status.stdout, /\?\? dirty\.txt/);

  state = status.target_state;
  const stagedDiff = await value.gate.execute(
    "developer",
    "git",
    ["diff", "--cached", "--", "staged.txt"],
    state.head,
    state.status_digest,
  );
  assert.equal(stagedDiff.exit_code, 0, stagedDiff.stderr);
  assert.match(stagedDiff.stdout, /staged-content/);

  state = stagedDiff.target_state;
  const history = await value.gate.execute(
    "developer",
    "git",
    ["log", "--oneline", "-1"],
    state.head,
    state.status_digest,
  );
  assert.equal(history.exit_code, 0, history.stderr);
  assert.match(history.stdout, /Create security fixture/);
});

test("workspace_publish rejects common pushInsteadOf before any foreign push", async (t) => {
  const value = await fixture(t);
  const state = await dirtyDeveloper(value, "common-push-rewrite.txt");
  await git(value.template, "config", `url.${value.foreign}.pushInsteadOf`, value.origin);
  await assert.rejects(
    () => value.gate.publish("developer", "Must reject push rewrite", state.head, state.status_digest),
    /redirect transport or execute helpers/,
  );
  assert.equal(await foreignDeveloperHead(value), "");
  assert.equal((await value.gate.inspect("developer")).head, state.head);
});

test("workspace_publish rejects worktree pushInsteadOf before any foreign push", async (t) => {
  const value = await fixture(t);
  const state = await dirtyDeveloper(value, "worktree-push-rewrite.txt");
  await git(value.template, "config", "extensions.worktreeConfig", "true");
  await git(value.developer, "config", "--worktree", `url.${value.foreign}.pushInsteadOf`, value.origin);
  await assert.rejects(
    () => value.gate.publish("developer", "Must reject worktree push rewrite", state.head, state.status_digest),
    /redirect transport or execute helpers/,
  );
  assert.equal(await foreignDeveloperHead(value), "");
  assert.equal((await value.gate.inspect("developer")).head, state.head);
});

test("workspace_publish rejects common core.askPass before any prompt program runs", async (t) => {
  const value = await fixture(t);
  const sentinel = join(value.root, "common-askpass-ran.txt");
  const askpass = join(value.root, "common-askpass.sh");
  await writeFile(askpass, `#!/bin/sh\nprintf 'executed\\n' > '${sentinel}'\nprintf 'credential\\n'\n`, "utf8");
  await chmod(askpass, 0o755);
  await git(value.template, "config", "core.askPass", askpass);
  const state = await dirtyDeveloper(value, "common-askpass-change.txt");
  await assert.rejects(
    () => value.gate.publish("developer", "must reject common askpass", state.head, state.status_digest),
    /redirect transport or execute helpers/,
  );
  assert.equal(await readFile(sentinel, "utf8").catch(() => "absent"), "absent");
  assert.equal((await value.gate.inspect("developer")).head, state.head);
});

test("workspace_publish rejects worktree core.askPass before any prompt program runs", async (t) => {
  const value = await fixture(t);
  const state = await dirtyDeveloper(value, "worktree-askpass.txt");
  const askpassSentinel = join(value.root, "askpass-ran.txt");
  const askpass = join(value.root, "askpass.sh");
  await writeFile(
    askpass,
    `#!/bin/sh\nprintf 'executed\\n' > ${JSON.stringify(askpassSentinel)}\nprintf 'credential\\n'\n`,
    { mode: 0o700 },
  );
  await chmod(askpass, 0o700);
  await git(value.template, "config", "extensions.worktreeConfig", "true");
  await git(value.developer, "config", "--worktree", "core.askPass", askpass);
  await assert.rejects(
    () => value.gate.publish("developer", "Must reject askpass", state.head, state.status_digest),
    /redirect transport or execute helpers/,
  );
  assert.equal(await readFile(askpassSentinel, "utf8").catch(() => "absent"), "absent");
  assert.equal((await value.gate.inspect("developer")).head, state.head);
});
