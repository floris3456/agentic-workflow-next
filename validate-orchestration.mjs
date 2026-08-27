#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(fileURLToPath(import.meta.url));
const failures = [];
const fail = (m) => failures.push(m);
const read = (p) => readFileSync(join(root,p), "utf8");
const exact = (dir, expected, label) => {
  const got = readdirSync(join(root,dir)).sort();
  const want = [...expected].sort();
  if (JSON.stringify(got)!==JSON.stringify(want)) fail(`${label} inventory differs: expected ${want.join(", ")}; found ${got.join(", ")}`);
};

for (const p of ["AGENTS.md","README.md","AS-BUILT.md","opencode.json","validate-orchestration.mjs","web-orchestration-only",".opencode",".github/workflows/validate-orchestration.yml"]) {
  try { statSync(join(root,p)); } catch { fail(`Missing required path: ${p}`); }
}
exact(".opencode/agents", ["local-orchestrator.md"], "Local agent");
exact(".opencode/skills", ["orchestration-workflow","recovery","workspace","promotion","prompt-creation"], "Local skill");
for (const name of ["orchestration-workflow","recovery","workspace","promotion","prompt-creation"]) exact(`.opencode/skills/${name}`, ["SKILL.md"], `${name} skill`);

let config = {};
try { config = JSON.parse(read("opencode.json")); } catch (e) { fail(`Invalid opencode.json: ${e.message}`); }
if (config.default_agent !== "local-orchestrator") fail("Local Orchestrator must be the default agent");
if (config.share !== "disabled") fail("Local Orchestrator sharing must remain disabled");
if (config.compaction?.auto !== false || config.compaction?.prune !== false) fail("Local Orchestrator compaction/pruning must remain disabled");
const tavily = config.mcp?.tavily;
if (tavily?.type !== "remote" || tavily?.url !== "https://mcp.tavily.com/mcp" || tavily?.enabled !== true) fail("Local Orchestrator must configure the remote Tavily MCP endpoint");
if (JSON.stringify(tavily ?? {}).match(/tvly-|tavilyApiKey/i)) fail("Tavily configuration must not persist an API key");

let pkg={}; try { pkg=JSON.parse(read(".opencode/package.json")); } catch(e){ fail(`Invalid .opencode/package.json: ${e.message}`); }
if (pkg.dependencies?.["opencode-ai"] !== "1.18.23") fail("Local OpenCode runtime must remain pinned to 1.18.23");

const agent = read(".opencode/agents/local-orchestrator.md");
if (!agent.startsWith("---\n") || !agent.includes("mode: primary") || !agent.includes("model: ")) fail("Local Orchestrator agent frontmatter is incomplete");
if (!agent.includes("Tavily MCP")) fail("Local Orchestrator must identify Tavily as its public research route");
if (!agent.includes("web-orchestration-only/")) fail("Local Orchestrator must retain the Web-representation isolation boundary");
if (!agent.includes("websearch: deny")) fail("Local Orchestrator must keep built-in web search disabled so Tavily remains the search route");
for (const name of ["orchestration-workflow","recovery","workspace","promotion","prompt-creation"]) {
  const text=read(`.opencode/skills/${name}/SKILL.md`);
  if (!text.startsWith("---\n") || !text.includes(`name: ${name}`) || !text.includes("compatibility: local-orchestrator")) fail(`${name} skill frontmatter is incomplete`);
}

try { execFileSync(process.execPath,[join(root,"web-orchestration-only/validate-package.mjs")],{stdio:"pipe"}); } catch(e) { fail(`Web package validation failed: ${e.stderr?.toString().trim() || e.message}`); }
const wf=read(".github/workflows/validate-orchestration.yml");
for (const term of ["branches: [orchestration]","contents: read","statuses: write","persist-credentials: false","node validate-orchestration.mjs","node --test","agentic-template/validate-orchestration"]) if (!wf.includes(term)) fail(`Orchestration workflow missing: ${term}`);
if (wf.includes("contents: write") || wf.includes("secrets.")) fail("Orchestration workflow has an unsafe write/secret surface");

const publicFiles=["AGENTS.md","README.md","AS-BUILT.md","opencode.json",".opencode/agents/local-orchestrator.md",...['orchestration-workflow','recovery','workspace','promotion','prompt-creation'].map(n=>`.opencode/skills/${n}/SKILL.md`)];
for (const p of publicFiles) {
  const text=read(p);
  if (/\b(?:ghp_|github_pat_|sk-)[A-Za-z0-9_-]{16,}/.test(text) || /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/.test(text)) fail(`${p} contains credential-like material`);
}
if (failures.length) { console.error(`Orchestration validation failed (${failures.length}):`); for(const f of failures) console.error(`- ${f}`); process.exit(1); }
console.log("Orchestration validation passed: Web and Local representations, Tavily configuration, routed inventories, CI contract, and safety boundaries are coherent.");
