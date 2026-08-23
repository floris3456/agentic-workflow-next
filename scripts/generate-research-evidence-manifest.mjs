#!/usr/bin/env node
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const researchRoot = path.join(repoRoot, "research");
const outputPath = path.join(repoRoot, "evidence/manifests/research-evidence.json");
const checkOnly = process.argv.includes("--check");

function walk(directory) {
  const result = [];
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const fullPath = path.join(directory, entry.name);
    if (entry.isSymbolicLink()) {
      const relative = path.relative(repoRoot, fullPath).split(path.sep).join("/");
      throw new Error(`Research tree contains symlink: ${relative}`);
    }
    if (entry.isDirectory()) result.push(...walk(fullPath));
    else if (entry.isFile()) result.push(fullPath);
  }
  return result;
}

const ledgerFiles = walk(researchRoot)
  .filter((file) => !file.includes(`${path.sep}templates${path.sep}`))
  .filter((file) => /\/result-[^/]+\.md$/.test(file) || file.endsWith("/prompt.md"))
  .sort();
const results = ledgerFiles.flatMap((fullPath) => {
  const bytes = fs.readFileSync(fullPath);
  if (bytes.length < 100) return [];
  const relative = path.relative(repoRoot, fullPath).split(path.sep).join("/");
  const pkg = relative.split("/")[1] ?? "unknown";
  const kind = relative.endsWith("/prompt.md") ? "prompt" : "result";
  return [{ package: pkg, kind, path: relative, byteCount: bytes.length, sha256: crypto.createHash("sha256").update(bytes).digest("hex") }];
});
const resultCount = results.length;
const resultFileCount = results.filter((e) => e.kind === "result").length;
const promptFileCount = results.filter((e) => e.kind === "prompt").length;
const manifest = {
  schemaVersion: 4,
  classification: "Research evidence manifest; contains paths, sizes, and hashes but no research content",
  generation: "node scripts/generate-research-evidence-manifest.mjs",
  // resultCount is retained as a deprecated alias for compatibility (A9.3);
  // entryCount is the normative field.
  resultCount,
  entryCount: resultCount,
  resultFileCount,
  promptFileCount,
  results,
  limitations: ["Only populated results of at least 100 bytes are recorded; each research package defines its own required evidence.", "A hash proves file identity, not correctness or human acceptance.", "Research conclusions remain subject to experiments, gates, and current primary-source verification."],
};
const content = `${JSON.stringify(manifest, null, 2)}\n`;
if (checkOnly) {
  if (!fs.existsSync(outputPath) || fs.readFileSync(outputPath, "utf8") !== content) throw new Error("Research evidence manifest is stale");
  console.log("Research evidence manifest is current.");
} else {
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, content, "utf8");
  console.log(`Recorded ${results.length} populated research results.`);
}
