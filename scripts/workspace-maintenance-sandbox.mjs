import { createWriteStream } from "node:fs";
import { copyFile, lstat, mkdir, mkdtemp, realpath, rename, rm, writeFile } from "node:fs/promises";
import { spawn } from "node:child_process";
import { tmpdir } from "node:os";
import { finished } from "node:stream/promises";
import { basename, dirname, isAbsolute, join, resolve } from "node:path";
import {
  BWRAP,
  GIT,
  FALSE_PROGRAM,
  SANDBOX_PATH,
  bounded,
  commonDirectory,
  git,
  gitArguments,
  gitRaw,
  gitDirectory,
  inside,
  nodeRuntimeMountArguments,
  pathExists,
  redactLocalPaths,
  run,
  safeEnvironment,
  secureParent,
  systemMountArguments,
  utf8,
} from "./workspace-maintenance-common.mjs";

async function writeReachablePack(worktree, packPath, revisions) {
  const output = createWriteStream(packPath, { mode: 0o600 });
  const child = spawn(GIT, gitArguments([
    "-c", "pack.useBitmaps=false",
    "-c", "pack.useSparse=false",
    "-c", "pack.usePathWalk=false",
    "pack-objects", "--revs", "--stdout", "--no-reuse-object", "--no-sparse",
  ]), {
    cwd: worktree,
    env: safeEnvironment(),
    stdio: ["pipe", "pipe", "pipe"],
  });
  let diagnostics = Buffer.alloc(0);
  child.stderr.on("data", (chunk) => {
    if (diagnostics.length < 64 * 1024) diagnostics = Buffer.concat([diagnostics, Buffer.from(chunk)]).subarray(0, 64 * 1024);
  });
  child.stdout.pipe(output);
  child.stdin.end(revisions, "utf8");
  const [exitCode] = await Promise.all([
    new Promise((resolvePromise, reject) => {
      child.once("error", () => reject(new Error("Workspace command could not create a sanitized Git snapshot")));
      child.once("close", (code) => resolvePromise(code));
    }),
    finished(output),
  ]);
  if (exitCode !== 0) throw new Error("Workspace command could not create a sanitized Git snapshot");
}

async function createGitSnapshot(verified) {
  const root = await mkdtemp(join(tmpdir(), "workspace-git-view-"));
  try {
    const formatResult = await git(verified.worktree, ["rev-parse", "--show-object-format"]);
    const objectFormat = formatResult.stdout;
    if (!["sha1", "sha256"].includes(objectFormat)) throw new Error("Workspace Git snapshot uses an unsupported object format");
    const oidLength = objectFormat === "sha256" ? 64 : 40;
    const indexResult = await gitRaw(verified.worktree, ["ls-files", "--stage", "-z"]);
    const indexOids = new Set();
    for (const entry of utf8(indexResult.stdout, "Git index inventory", true).split("\0")) {
      if (!entry) continue;
      const match = /^\d+ ([0-9a-f]+) \d\t/.exec(entry);
      if (!match || match[1].length !== oidLength) throw new Error("Workspace Git index inventory is malformed");
      if (!/^0+$/.test(match[1])) indexOids.add(match[1]);
    }

    const view = join(root, "git");
    const packDirectory = join(view, "objects", "pack");
    await mkdir(packDirectory, { recursive: true, mode: 0o700 });
    const temporaryPack = join(packDirectory, "snapshot.pack");
    const revisions = `HEAD\n${[...indexOids].join("\n")}${indexOids.size ? "\n" : ""}`;
    await writeReachablePack(verified.worktree, temporaryPack, revisions);
    const indexed = await git(root, ["index-pack", "--no-rev-index", `--object-format=${objectFormat}`, temporaryPack]);
    const packHash = indexed.stdout.trim();
    if (!new RegExp(`^[0-9a-f]{${oidLength}}$`).test(packHash)) throw new Error("Workspace Git snapshot pack index is malformed");
    const temporaryIndex = temporaryPack.replace(/\.pack$/, ".idx");
    await rename(temporaryPack, join(packDirectory, `pack-${packHash}.pack`));
    await rename(temporaryIndex, join(packDirectory, `pack-${packHash}.idx`));

    await mkdir(join(view, "refs", "heads"), { recursive: true, mode: 0o700 });
    await mkdir(join(view, "info"), { recursive: true, mode: 0o700 });
    await writeFile(join(view, "info", "exclude"), "", { mode: 0o600 });
    if (verified.entry.branch?.startsWith("refs/heads/")) {
      const branch = verified.entry.branch.slice("refs/heads/".length);
      const refPath = join(view, "refs", "heads", ...branch.split("/"));
      await mkdir(dirname(refPath), { recursive: true, mode: 0o700 });
      await writeFile(join(view, "HEAD"), `ref: ${verified.entry.branch}\n`, { mode: 0o600 });
      await writeFile(refPath, `${verified.public.head}\n`, { mode: 0o600 });
    } else {
      await writeFile(join(view, "HEAD"), `${verified.public.head}\n`, { mode: 0o600 });
    }

    const fileMode = await git(verified.worktree, ["config", "--bool", "--get", "core.filemode"], true);
    const ignoreCase = await git(verified.worktree, ["config", "--bool", "--get", "core.ignorecase"], true);
    const symlinks = await git(verified.worktree, ["config", "--bool", "--get", "core.symlinks"], true);
    const config = [
      "[core]",
      `\trepositoryformatversion = ${objectFormat === "sha256" ? "1" : "0"}`,
      `\tfilemode = ${fileMode.exitCode === 0 && fileMode.stdout === "false" ? "false" : "true"}`,
      "\tbare = false",
      "\tlogallrefupdates = false",
      "\thooksPath = /dev/null",
      "\tfsmonitor = false",
      "\tattributesFile = /dev/null",
      ...(ignoreCase.exitCode === 0 ? [`\tignorecase = ${ignoreCase.stdout === "true" ? "true" : "false"}`] : []),
      ...(symlinks.exitCode === 0 ? [`\tsymlinks = ${symlinks.stdout === "false" ? "false" : "true"}`] : []),
      ...(objectFormat === "sha256" ? ["[extensions]", "\tobjectFormat = sha256"] : []),
      "",
    ].join("\n");
    await writeFile(join(view, "config"), config, { mode: 0o600 });

    const realGit = await gitDirectory(verified.worktree);
    const index = join(realGit, "index");
    if (await pathExists(index)) {
      const stat = await lstat(index);
      if (!stat.isFile() || stat.isSymbolicLink()) throw new Error("Workspace Git index is not a regular file");
      await copyFile(index, join(view, "index"));
      const sharedIndexResult = await git(verified.worktree, ["rev-parse", "--path-format=absolute", "--shared-index-path"], true);
      if (sharedIndexResult.exitCode !== 0) throw new Error("Workspace Git shared-index state could not be inspected safely");
      if (sharedIndexResult.stdout) {
        const sharedIndex = await realpath(sharedIndexResult.stdout);
        const name = basename(sharedIndex);
        if (!inside(realGit, sharedIndex) || !new RegExp(`^sharedindex\\.[0-9a-f]{${oidLength}}$`).test(name)) {
          throw new Error("Workspace Git shared index is outside the selected worktree Git directory");
        }
        const sharedStat = await lstat(sharedIndex);
        if (!sharedStat.isFile() || sharedStat.isSymbolicLink()) throw new Error("Workspace shared Git index is not a regular file");
        await copyFile(sharedIndex, join(view, name));
      }
    }

    const gitEntry = resolve(verified.worktree, ".git");
    const gitEntryStat = await lstat(gitEntry);
    let gitFile;
    if (!gitEntryStat.isDirectory()) {
      if (!gitEntryStat.isFile() || gitEntryStat.isSymbolicLink()) throw new Error("Registered worktree .git entry is unsupported");
      gitFile = join(root, "gitfile");
      await writeFile(gitFile, "gitdir: /git-view\n", { mode: 0o600 });
    }
    return { root, view, gitEntryDirectory: gitEntryStat.isDirectory(), gitFile };
  } catch (error) {
    await rm(root, { recursive: true, force: true });
    throw error;
  }
}

async function sandboxCommand(verified, command, args, timeoutMs) {
  const snapshot = await createGitSnapshot(verified);
  try {
    const sandboxExecutable = command.includes("/") || command.includes("\\")
      ? `/workspace/${command.split(/[\\/]+/).filter((part) => part.length > 0 && part !== ".").join("/")}`
      : command;
    const gitMask = snapshot.gitEntryDirectory
      ? ["--ro-bind", snapshot.view, "/workspace/.git"]
      : ["--ro-bind", snapshot.gitFile, "/workspace/.git"];
    const bwrap = [
      "--die-with-parent", "--new-session", "--unshare-all",
      ...await systemMountArguments(),
      ...await nodeRuntimeMountArguments(),
      "--proc", "/proc",
      "--dev", "/dev",
      "--tmpfs", "/tmp",
      "--dir", "/tmp/user",
      "--bind", verified.worktree, "/workspace",
      "--ro-bind", snapshot.view, "/git-view",
      ...gitMask,
      "--chdir", "/workspace",
      "--setenv", "HOME", "/tmp/user",
      "--setenv", "XDG_CONFIG_HOME", "/tmp/config",
      "--setenv", "XDG_DATA_HOME", "/tmp/data",
      "--setenv", "XDG_CACHE_HOME", "/tmp/cache",
      "--setenv", "TMPDIR", "/tmp",
      "--setenv", "PATH", SANDBOX_PATH,
      "--setenv", "LANG", "C.UTF-8",
      "--setenv", "LC_ALL", "C.UTF-8",
      "--setenv", "SHELL", FALSE_PROGRAM,
      "--setenv", "GIT_DIR", "/git-view",
      "--setenv", "GIT_WORK_TREE", "/workspace",
      "--setenv", "GIT_CONFIG_NOSYSTEM", "1",
      "--setenv", "GIT_CONFIG_GLOBAL", "/dev/null",
      "--setenv", "GIT_ATTR_NOSYSTEM", "1",
      "--setenv", "GIT_TERMINAL_PROMPT", "0",
      "--setenv", "GIT_ASKPASS", FALSE_PROGRAM,
      "--setenv", "SSH_ASKPASS", FALSE_PROGRAM,
      "--setenv", "GIT_NO_REPLACE_OBJECTS", "1",
      "--setenv", "GIT_OPTIONAL_LOCKS", "0",
      "--", sandboxExecutable, ...args,
    ];
    return await run(BWRAP, bwrap, verified.worktree, timeoutMs);
  } finally {
    await rm(snapshot.root, { recursive: true, force: true });
  }
}

export async function executeWorkspaceCommand(gate, target, command, args, expectedHead, expectedStatusDigest, timeoutMs = 120_000) {
  const verified = await gate.preflight(target, expectedHead, expectedStatusDigest);
  if (typeof command !== "string" || command.length === 0 || command.length > 1000 || command.includes("\0") || isAbsolute(command)) {
    throw new Error("Workspace command must be a bounded executable name or repository-relative executable");
  }
  if (!Array.isArray(args) || args.length > 200 || args.some((value) => typeof value !== "string" || value.length > 16_384 || value.includes("\0"))) {
    throw new Error("Workspace command arguments are invalid");
  }
  if (!Number.isSafeInteger(timeoutMs) || timeoutMs < 1 || timeoutMs > 600_000) throw new Error("Workspace command timeout is invalid");
  if (command.includes("/") || command.includes("\\")) {
    const normalized = command.split(/[\\/]+/).filter((part) => part.length > 0 && part !== ".");
    if (normalized.length === 0 || normalized.includes("..") || normalized[0] === ".git") throw new Error("Workspace executable path escapes the tracked working tree");
    const candidate = await secureParent(verified.worktree, normalized.join("/"), false);
    if (!inside(verified.worktree, candidate)) throw new Error("Workspace executable path escapes the tracked working tree");
    const stat = await lstat(candidate);
    if (!stat.isFile() || stat.isSymbolicLink() || !inside(verified.worktree, await realpath(candidate))) {
      throw new Error("Workspace executable is not a regular in-worktree file");
    }
  } else if (!/^[A-Za-z0-9._+-]+$/.test(command)) {
    throw new Error("Workspace executable name is invalid");
  }

  const result = await sandboxCommand(verified, command, args, timeoutMs);
  const after = await gate.inspect(target);
  const origin = (await git(verified.worktree, ["remote", "get-url", "origin"])).stdout;
  const privatePaths = [
    verified.worktree,
    gate.rootDirectory,
    await commonDirectory(verified.worktree),
    await gitDirectory(verified.worktree),
    origin,
    process.env.HOME,
    "/workspace",
    "/git-view",
    "/repo.git",
    "/worktree.git",
    ...args.filter((value) => isAbsolute(value)),
  ];
  return {
    command,
    containment: "bubblewrap-worktree-v1",
    network: "denied",
    git_metadata: "read-only",
    exit_code: result.exitCode,
    stdout: bounded(redactLocalPaths(utf8(result.stdout, "Workspace command output"), privatePaths)),
    stderr: bounded(redactLocalPaths(utf8(result.stderr, "Workspace command diagnostics"), privatePaths)),
    target_state: after,
  };
}
