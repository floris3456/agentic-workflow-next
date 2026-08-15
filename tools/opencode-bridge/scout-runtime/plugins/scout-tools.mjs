import { lstat, readFile, readdir, readlink, realpath } from "node:fs/promises";
import { isAbsolute, relative, resolve, sep } from "node:path";
import { tool } from "@opencode-ai/plugin";

const MAX_FILE_BYTES = 1024 * 1024;
const MAX_OUTPUT_BYTES = 64 * 1024;
const MAX_RESULTS = 500;
const snapshotParent = await realpath(process.env.SCOUT_SNAPSHOT_PARENT ?? "");

function inside(root, candidate) {
  const value = relative(root, candidate);
  return value === "" || (!value.startsWith("..") && !isAbsolute(value));
}

async function rootFor(context) {
  const root = await realpath(context.directory);
  if (!inside(snapshotParent, root) || root === snapshotParent || !/^[0-9a-f]{40}$/.test(root.slice(root.lastIndexOf(sep) + 1))) {
    throw new Error("Scout tool context is not an admitted exact-ref snapshot");
  }
  return root;
}

function requested(root, input = ".") {
  if (typeof input !== "string" || input.length === 0 || input.length > 4096 || input.includes("\0") || isAbsolute(input)) {
    throw new Error("Scout path must be a bounded repository-relative path");
  }
  const candidate = resolve(root, input);
  if (!inside(root, candidate)) throw new Error("Scout path escapes the exact-ref snapshot");
  return candidate;
}

async function admitted(root, input, allowSymlink = false) {
  const candidate = requested(root, input);
  const stat = await lstat(candidate);
  const parent = await realpath(resolve(candidate, ".."));
  if (!inside(root, parent)) throw new Error("Scout path traverses a symlink outside the exact-ref snapshot");
  if (stat.isSymbolicLink()) {
    if (allowSymlink) return { candidate, stat, symlink: await readlink(candidate) };
    throw new Error("Scout tools do not follow repository symlinks");
  }
  const canonical = await realpath(candidate);
  if (!inside(root, canonical)) throw new Error("Scout path resolves outside the exact-ref snapshot");
  return { candidate: canonical, stat };
}

function utf8(bytes, label) {
  if (bytes.includes(0)) throw new Error(`${label} is binary and cannot be returned as Scout evidence`);
  try {
    return new TextDecoder("utf-8", { fatal: true }).decode(bytes);
  } catch {
    throw new Error(`${label} is not valid UTF-8`);
  }
}

function bounded(text) {
  const bytes = Buffer.from(text);
  if (bytes.length <= MAX_OUTPUT_BYTES) return text;
  return `${bytes.subarray(0, MAX_OUTPUT_BYTES).toString("utf8")}\n[output truncated at ${MAX_OUTPUT_BYTES} bytes]`;
}

function globExpression(pattern) {
  if (typeof pattern !== "string" || pattern.length === 0 || pattern.length > 1024 || pattern.includes("\0") || isAbsolute(pattern)) {
    throw new Error("Scout glob must be a bounded repository-relative pattern");
  }
  let result = "";
  for (let index = 0; index < pattern.length; index++) {
    const char = pattern[index];
    if (char === "*" && pattern[index + 1] === "*") {
      result += ".*";
      index++;
    } else if (char === "*") result += "[^/]*";
    else if (char === "?") result += "[^/]";
    else result += char.replace(/[.+^${}()|[\]\\]/g, "\\$&");
  }
  return new RegExp(`^${result}$`);
}

async function paths(root) {
  const output = [];
  const visit = async (directory) => {
    for (const entry of await readdir(directory, { withFileTypes: true })) {
      const absolute = resolve(directory, entry.name);
      const name = relative(root, absolute).split(sep).join("/");
      output.push({ absolute, name, symlink: entry.isSymbolicLink(), directory: entry.isDirectory() });
      if (output.length > 50_000) throw new Error("Scout traversal exceeds the 50000-entry limit");
      if (entry.isDirectory() && !entry.isSymbolicLink()) await visit(absolute);
    }
  };
  await visit(root);
  return output;
}

export default async function ScoutTools() {
  return {
    tool: {
      scout_read: tool({
        description: "Read bounded UTF-8 lines from one repository-relative file. A final symlink is reported as evidence and never followed.",
        args: {
          path: tool.schema.string().min(1).max(4096),
          offset: tool.schema.number().int().min(1).max(1000000).optional(),
          limit: tool.schema.number().int().min(1).max(500).optional()
        },
        async execute(args, context) {
          const root = await rootFor(context);
          const target = await admitted(root, args.path, true);
          if (target.symlink !== undefined) return `SYMLINK ${args.path} -> ${target.symlink}`;
          if (!target.stat.isFile() || target.stat.size > MAX_FILE_BYTES) throw new Error("Scout read requires a regular file no larger than 1 MiB");
          const lines = utf8(await readFile(target.candidate), args.path).split(/\r?\n/);
          const offset = args.offset ?? 1;
          const limit = args.limit ?? 200;
          return bounded(lines.slice(offset - 1, offset - 1 + limit).map((line, index) => `${offset + index}: ${line}`).join("\n"));
        }
      }),
      scout_glob: tool({
        description: "List bounded repository-relative paths matching a glob without following symlinks.",
        args: { pattern: tool.schema.string().min(1).max(1024) },
        async execute(args, context) {
          const root = await rootFor(context);
          const expression = globExpression(args.pattern);
          const matches = (await paths(root)).filter((entry) => expression.test(entry.name)).slice(0, MAX_RESULTS);
          return bounded(matches.map((entry) => `${entry.name}${entry.directory ? "/" : entry.symlink ? " -> [symlink]" : ""}`).join("\n"));
        }
      }),
      scout_grep: tool({
        description: "Find a bounded literal UTF-8 string in snapshot files without following symlinks.",
        args: {
          query: tool.schema.string().min(1).max(1024),
          glob: tool.schema.string().min(1).max(1024).optional()
        },
        async execute(args, context) {
          const root = await rootFor(context);
          const expression = args.glob ? globExpression(args.glob) : undefined;
          const results = [];
          for (const entry of await paths(root)) {
            if (entry.directory || entry.symlink || (expression && !expression.test(entry.name))) continue;
            const stat = await lstat(entry.absolute);
            if (!stat.isFile() || stat.size > MAX_FILE_BYTES) continue;
            let lines;
            try { lines = utf8(await readFile(entry.absolute), entry.name).split(/\r?\n/); } catch { continue; }
            for (let index = 0; index < lines.length; index++) {
              if (lines[index].includes(args.query)) results.push(`${entry.name}:${index + 1}: ${lines[index]}`);
              if (results.length >= MAX_RESULTS) return bounded(results.join("\n"));
            }
          }
          return bounded(results.join("\n"));
        }
      })
    }
  };
}
