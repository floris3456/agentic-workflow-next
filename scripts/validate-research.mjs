#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const researchRoot = path.join(repoRoot, "research");
const failures = [];
const warnings = [];
const fail = (message) => failures.push(message);
const warn = (message) => warnings.push(message);

function rel(absolutePath) {
  return path.relative(repoRoot, absolutePath).split(path.sep).join("/");
}

function walk(directory) {
  const result = [];
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const fullPath = path.join(directory, entry.name);
    if (entry.isSymbolicLink()) {
      fail(`Research tree contains symlink: ${rel(fullPath)}`);
    } else if (entry.isDirectory()) {
      result.push(...walk(fullPath));
    } else if (entry.isFile()) {
      result.push(fullPath);
    }
  }
  return result;
}

function directories(directory) {
  return [
    directory,
    ...fs.readdirSync(directory, { withFileTypes: true })
      .filter((entry) => entry.isDirectory() && !entry.isSymbolicLink())
      .flatMap((entry) => directories(path.join(directory, entry.name))),
  ];
}

const isResult = (file) => /\/result-[^/]+\.md$/.test(file);
const isText = (file) => /\.(?:md|json|yml|yaml|txt)$/i.test(file);

if (!fs.existsSync(researchRoot)) {
  console.error("Research directory missing");
  process.exit(1);
}

const files = walk(researchRoot);
const textFiles = files.filter(isText);

for (const file of files) {
  const relative = rel(file);
  if (/\s|\(\d+\)/.test(relative)) fail(`Research path is not canonical: ${relative}`);
}
if (files.some((file) => rel(file).includes("/.ssh/") || path.basename(file).startsWith("id_"))) {
  fail("Research tree contains SSH material");
}
for (const directory of directories(researchRoot)) {
  if (!fs.existsSync(path.join(directory, "README.md"))) fail(`Research directory lacks README.md: ${rel(directory)}`);
}

const resultFiles = files.filter(isResult);
const resultNames = resultFiles.map((file) => path.basename(file));
if (new Set(resultNames).size !== resultNames.length) fail("Research result basenames are not globally unique");
const requiredPromptSections = [
  "## Expert role",
  "## Result target",
  "## Research questions",
  "## Required output",
  "## Human decisions",
  "## CLI evidence and experiments",
  "## Residual risk",
];
for (const file of files.filter((item) => item.endsWith("/prompt.md"))) {
  const content = fs.readFileSync(file, "utf8");
  for (const section of requiredPromptSections) {
    if (!content.includes(section)) fail(`${rel(file)} lacks required prompt section: ${section}`);
  }
}
for (const resultFile of resultFiles) {
  const directory = path.dirname(resultFile);
  if (!fs.existsSync(path.join(directory, "prompt.md"))) fail(`${rel(resultFile)} lacks a colocated prompt.md`);
  if (!fs.existsSync(path.join(directory, "README.md"))) fail(`${rel(resultFile)} lacks a colocated README.md`);
  if (fs.statSync(resultFile).size < 100) fail(`Result is empty or too small: ${rel(resultFile)}`);
}

for (const synthesisResult of files.filter((item) => /\/synthesis\/result-[^/]+\.md$/.test(item))) {
  const content = fs.readFileSync(synthesisResult, "utf8");
  if (!content.includes("## Human summary")) fail(`${rel(synthesisResult)} lacks the mandatory Human summary front section`);
}

for (const conclusions of files.filter((item) => item.endsWith("/conclusions.md"))) {
  const content = fs.readFileSync(conclusions, "utf8");
  if (!content.includes("Suggested promotion")) fail(`${rel(conclusions)} lacks the mandated conclusions table (Suggested promotion column)`);
  if (!content.includes("Disposition")) fail(`${rel(conclusions)} lacks the Disposition column for human dispositions`);
}

for (const entry of fs.readdirSync(researchRoot, { withFileTypes: true })) {
  if (entry.isSymbolicLink() || !entry.isDirectory() || ["baseline", "implementation", "templates"].includes(entry.name)) continue;
  const cardPath = path.join(researchRoot, entry.name, "README.md");
  if (!fs.existsSync(cardPath)) {
    fail(`Package ${entry.name} lacks a package card README.md`);
    continue;
  }
  const content = fs.readFileSync(cardPath, "utf8");
  if (!content.includes("**Status:**")) fail(`Package card ${entry.name}/README.md lacks a Status field`);
  if (!content.includes("**Type:**")) fail(`Package card ${entry.name}/README.md lacks a Type field`);
}

const forbiddenDirectories = ["research-packs", "results", "execution-waves", "final-synthesis"];
for (const directory of directories(researchRoot)) {
  const name = path.basename(directory);
  if (forbiddenDirectories.includes(name)) fail(`Obsolete research directory exists: ${rel(directory)}`);
  if (/^batch-/.test(name)) fail(`Batch directory repeats its parent name: ${rel(directory)}`);
}

const forbiddenContent = [
  [/BEGIN (?:RSA|OPENSSH|EC|DSA) PRIVATE KEY/, "private key material"],
  [/\b(?:github_pat_|ghp_)[A-Za-z0-9_]{16,}/, "GitHub token"],
  [/\b(?:password|passwd|secret|token)\s*[:=]\s*["'][^<\n"']{6,}["']/i, "obvious credential literal"],
  [/\b(?:10(?:\.\d{1,3}){3}|192\.168(?:\.\d{1,3}){2}|172\.(?:1[6-9]|2\d|3[01])(?:\.\d{1,3}){2})\b/, "private IPv4 address"],
  [/https?:\/\/[^\s`)<>]*(?:\.internal|\.local|\.lan)(?=[\s/:`)<>]|$)/i, "internal URL"],
];

for (const file of textFiles) {
  const content = fs.readFileSync(file, "utf8");
  for (const [pattern, label] of forbiddenContent) {
    const matches = [...content.matchAll(new RegExp(pattern.source, pattern.flags.includes("g") ? pattern.flags : `${pattern.flags}g`))];
    if (!matches.length) continue;
    if (label === "GitHub token" && isResult(file)) {
      const allDeclaredInvalidCanaries = matches.every((match) => {
        const context = content.slice(Math.max(0, match.index - 200), Math.min(content.length, match.index + match[0].length + 200));
        return context.includes("secret-shaped-invalid") && context.includes("canaryId");
      });
      if (allDeclaredInvalidCanaries) continue;
    }
    fail(`${rel(file)} contains ${label}`);
  }
  if (path.basename(file) !== "code-reference.md" && !isResult(file)) {
    const staleReferences = [
      /research-packs/,
      /results\/(?:batch|final-synthesis)/,
      /\b\d{2}-[a-z0-9-]+-result\.md\b/,
      /\bbatch-\d{2}-review-result\.md\b/,
      /catalog\.json/,
    ];
    for (const pattern of staleReferences) {
      if (pattern.test(content)) fail(`${rel(file)} contains a stale research-layout reference: ${pattern.source}`);
    }
  }
}

for (const directory of directories(researchRoot)) {
  if (path.basename(directory) !== "attachments") continue;
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    if (entry.isSymbolicLink() || !entry.isFile()) continue;
    const file = entry.name;
    if (file === "README.md" || file === "code-reference.md") continue;
    const fullPath = path.join(directory, file);
    if (!isText(fullPath)) continue;
    const content = fs.readFileSync(fullPath, "utf8");
    if (!content.includes("**Classification:**")) fail(`${rel(fullPath)} does not state its classification`);
    if (!content.includes("**Source:**")) fail(`${rel(fullPath)} does not state its source`);
    if (!content.includes("**Generation:**")) fail(`${rel(fullPath)} does not state its generation method`);
    if (!/(?:limitation|evidence limit|missing evidence)/i.test(content)) fail(`${rel(fullPath)} does not explain its limitations`);
    const ipv4 = content.match(/\b(?:\d{1,3}\.){3}\d{1,3}\b/g) ?? [];
    if (ipv4.length) fail(`${rel(fullPath)} contains an IPv4 literal`);
    if (content.length > 30_000) warn(`${rel(fullPath)} is larger than 30 KB and may be unfocused`);
  }
}

function slugify(heading) {
  return heading
    .trim()
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-");
}

function headingsOf(targetPath) {
  const content = fs.readFileSync(targetPath, "utf8");
  const headings = new Set();
  for (const line of content.split("\n")) {
    const match = /^#{1,6}\s+(.*)$/.exec(line);
    if (match) headings.add(slugify(match[1]));
  }
  return headings;
}

const linkPattern = /\[[^\]]*\]\(([^)]+)\)/g;
for (const file of textFiles.filter((item) => !isResult(item) && path.basename(item) !== "code-reference.md")) {
  const content = fs.readFileSync(file, "utf8");
  for (const match of content.matchAll(linkPattern)) {
    const target = match[1].trim().replace(/^<|>$/g, "");
    if (/^(?:https?:|mailto:)/i.test(target)) continue;
    const [targetPath, anchor] = target.split("#");
    const resolvedPath = targetPath ? path.resolve(path.dirname(file), targetPath) : file;
    if (!fs.existsSync(resolvedPath)) {
      fail(`${rel(file)} has unresolved Markdown link: ${target}`);
      continue;
    }
    if (anchor && fs.statSync(resolvedPath).isFile()) {
      const headings = headingsOf(resolvedPath);
      if (!headings.has(anchor)) fail(`${rel(file)} links to missing anchor #${anchor} in ${rel(resolvedPath)}`);
    }
  }
}

if (failures.length) {
  console.error(`Research validation failed (${failures.length}):`);
  for (const failure of failures) console.error(`- ${failure}`);
  process.exitCode = 1;
} else {
  console.log(`Research validation passed: ${files.length} files, ${resultFiles.length} results.`);
}
for (const warning of warnings) console.warn(`Warning: ${warning}`);
