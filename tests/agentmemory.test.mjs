import assert from "node:assert/strict";
import http from "node:http";
import test from "node:test";
import {
  ALLOWED_ROLES,
  getDefaultScopeForRole,
  validateMemoryInput,
  executeRemember,
  executeRecall,
} from "../scripts/agentmemory-lib.mjs";

function createFakeAgentMemoryServer() {
  const store = [];
  const requests = [];
  const server = http.createServer((req, res) => {
    const url = new URL(req.url, `http://${req.headers.host || "127.0.0.1"}`);
    const pathname = url.pathname;

    if (req.method === "POST" && (pathname === "/agentmemory/remember" || pathname === "/remember")) {
      let body = "";
      req.on("data", (chunk) => { body += chunk; });
      req.on("end", () => {
        try {
          const parsed = JSON.parse(body);
          requests.push({ method: req.method, pathname, parsed });
          store.push({
            id: `mem-${store.length + 1}`,
            agentId: parsed.agentId,
            author: parsed.agentId,
            title: parsed.title,
            content: parsed.content,
            concepts: parsed.concepts || [],
            files: parsed.files || [],
            createdAt: new Date().toISOString(),
          });
          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ success: true, id: `mem-${store.length}` }));
        } catch (e) {
          res.writeHead(400, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ error: "Invalid JSON" }));
        }
      });
      return;
    }

    if (req.method === "GET" && (pathname === "/agentmemory/memories" || pathname === "/memories")) {
      requests.push({ method: req.method, pathname, agentId: url.searchParams.get("agentId") });
      const agentId = url.searchParams.get("agentId");
      let results = store;
      if (agentId && agentId !== "*") {
        results = store.filter((m) => (m.agentId || m.author) === agentId);
      }
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify(results));
      return;
    }

    res.writeHead(404, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Not found" }));
  });

  return {
    server,
    store,
    requests,
    start: () =>
      new Promise((resolve) => {
        server.listen(0, "127.0.0.1", () => {
          const address = server.address();
          resolve(`http://127.0.0.1:${address.port}`);
        });
      }),
    stop: () =>
      new Promise((resolve) => {
        server.close(resolve);
      }),
  };
}

test("role author write records caller role correctly and rejects invalid roles", async (t) => {
  const fake = createFakeAgentMemoryServer();
  const serverUrl = await fake.start();
  t.after(async () => {
    await fake.stop();
  });

  // Spark author remember
  const sparkRes = await executeRemember(
    {
      title: "Spark invariant note",
      content: "Ensure hooks remain executable on bootstrap.",
      concepts: ["hooks", "bootstrap"],
      files: ["scripts/bootstrap-agent-workflow.sh"],
    },
    { agent: "spark-implementer" },
    { serverUrl }
  );
  assert.match(sparkRes, /Remembered: "Spark invariant note" by author spark-implementer/);
  assert.equal(fake.store.length, 1);
  assert.equal(fake.store[0].agentId, "spark-implementer");

  // Lead author remember
  const leadRes = await executeRemember(
    {
      title: "Lead architectural advice",
      content: "All edits must be completed in a single batch before testing.",
      concepts: ["batching", "workflow"],
      files: ["docs/architecture/AS-BUILT.md"],
    },
    { agent: "lead-developer" },
    { serverUrl }
  );
  assert.match(leadRes, /Remembered: "Lead architectural advice" by author lead-developer/);
  assert.equal(fake.store.length, 2);
  assert.equal(fake.store[1].agentId, "lead-developer");
  assert.equal(fake.requests[0].pathname, "/agentmemory/remember");
  assert.equal(fake.requests[0].parsed.agentId, "spark-implementer");

  // Rejection of unwhitelisted role
  const unauthRes = await executeRemember(
    {
      title: "Orphan advice",
      content: "Some random note.",
    },
    { agent: "unauthorized-agent" },
    { serverUrl }
  );
  assert.match(unauthRes, /Remember rejected: unauthorized or unknown agent role "unauthorized-agent"/);
  assert.equal(fake.store.length, 2);
});

test("team cross-role recall renders visible authors and discards orphan/unrecognized authors", async (t) => {
  const fake = createFakeAgentMemoryServer();
  const serverUrl = await fake.start();
  t.after(async () => {
    await fake.stop();
  });

  // Populate memories from valid roles and an unrecognized orphan
  fake.store.push(
    {
      agentId: "lead-developer",
      title: "Lead Note",
      content: "Maintain strict authority boundaries.",
      concepts: ["authority"],
      files: ["AGENTS.md"],
    },
    {
      agentId: "spark-implementer",
      title: "Spark Note",
      content: "Check uncommitted diff before returning.",
      concepts: ["diff"],
      files: ["scripts/validate-repository.sh"],
    },
    {
      agentId: "unrecognized-agent",
      title: "Rogue Note",
      content: "This orphan should be discarded.",
      concepts: ["rogue"],
      files: [],
    }
  );

  const recallResult = await executeRecall(
    { scope: "team" },
    { agent: "lead-developer" },
    { serverUrl }
  );

  assert.match(recallResult, /Advisory agent memory \(scope: team/);
  assert.match(recallResult, /- \[Author: lead-developer\] "Lead Note": Maintain strict authority boundaries\./);
  assert.match(recallResult, /- \[Author: spark-implementer\] "Spark Note": Check uncommitted diff before returning\./);
  assert.equal(recallResult.includes("Rogue Note"), false, "Orphan author memories must be discarded");
  assert.equal(recallResult.includes("unrecognized-agent"), false, "Orphan authors must not appear in output");
});

test("own isolation restricts recall to caller and default scopes behave correctly", async (t) => {
  const fake = createFakeAgentMemoryServer();
  const serverUrl = await fake.start();
  t.after(async () => {
    await fake.stop();
  });

  fake.store.push(
    {
      agentId: "spark-implementer",
      title: "Spark private tip",
      content: "Use node:test for all small tests.",
      concepts: ["testing"],
      files: [],
    },
    {
      agentId: "heavy-developer",
      title: "Heavy private tip",
      content: "Complex single turn implementation patterns.",
      concepts: ["implementation"],
      files: [],
    }
  );

  // Default scope for spark-implementer is "own"
  assert.equal(getDefaultScopeForRole("spark-implementer"), "own");
  assert.equal(getDefaultScopeForRole("lead-developer"), "team");
  assert.equal(getDefaultScopeForRole("small-developer"), "team");
  assert.equal(getDefaultScopeForRole("heavy-developer"), "team");

  // Recall with Spark default scope (own)
  const sparkRecall = await executeRecall(
    {},
    { agent: "spark-implementer" },
    { serverUrl }
  );
  assert.match(sparkRecall, /- \[Author: spark-implementer\] "Spark private tip"/);
  assert.equal(sparkRecall.includes("Heavy private tip"), false, "Own scope must isolate other roles");

  // Explicit override: Spark requesting team scope
  const sparkTeamRecall = await executeRecall(
    { scope: "team" },
    { agent: "spark-implementer" },
    { serverUrl }
  );
  assert.match(sparkTeamRecall, /Spark private tip/);
  assert.match(sparkTeamRecall, /Heavy private tip/);
  assert.equal(fake.requests.at(-1).agentId, "*");

  for (const role of ALLOWED_ROLES) {
    const own = await executeRecall({ scope: "own" }, { agent: role }, { serverUrl });
    assert.match(own, /scope: own/);
    assert.equal(fake.requests.at(-1).agentId, role);
  }

  const invalidCaller = await executeRecall({}, { agent: "unknown-agent" }, { serverUrl });
  assert.match(invalidCaller, /Recall rejected: unauthorized or unknown agent role/);
});

test("safety validation rejects reasoning, secrets, private IDs, absolute host paths, and raw logs", async () => {
  // Reasoning rejection
  const reasoningCheck = validateMemoryInput({
    title: "Step 1",
    content: "Thinking process: I will analyze the codebase first.",
  });
  assert.equal(reasoningCheck.valid, false);
  assert.match(reasoningCheck.reason, /reasoning/);

  // Secret rejection
  const secretCheck = validateMemoryInput({
    title: "Token note",
    content: "Use key ghp_1234567890abcdef1234567890 for API calls.",
  });
  assert.equal(secretCheck.valid, false);
  assert.match(secretCheck.reason, /secrets/);

  // Private runtime ID rejection
  const sessionCheck = validateMemoryInput({
    title: "Session id",
    content: "Resume with session-1234567890abcdef1234.",
  });
  assert.equal(sessionCheck.valid, false);
  assert.match(sessionCheck.reason, /private runtime IDs/);

  // Absolute host path rejection in content
  const pathContentCheck = validateMemoryInput({
    title: "Path note",
    content: "Config is stored at /home/user/work/config.json",
  });
  assert.equal(pathContentCheck.valid, false);
  assert.match(pathContentCheck.reason, /absolute host paths/);

  // Absolute host path rejection in files
  const pathFilesCheck = validateMemoryInput({
    title: "File note",
    content: "Valid relative content.",
    files: ["/etc/passwd"],
  });
  assert.equal(pathFilesCheck.valid, false);
  assert.match(pathFilesCheck.reason, /absolute/);

  // Raw logs rejection
  const logCheck = validateMemoryInput({
    title: "Stack trace",
    content: "Error: Unexpected token\n    at Object.parse (node:json:1:1)\n    at run (app/main.js:5:10)",
  });
  assert.equal(logCheck.valid, false);
  assert.match(logCheck.reason, /raw log dumps/);

  // Valid concise input
  const validCheck = validateMemoryInput({
    title: "Clean advice",
    content: "Keep AS-BUILT updated with every source change.",
    concepts: ["as-built", "documentation"],
    files: ["docs/architecture/AS-BUILT.md"],
  });
  assert.equal(validCheck.valid, true);

  assert.equal(validateMemoryInput({ title: "IDs", content: "request_id: abcdefgh1234" }).valid, false);
  assert.equal(validateMemoryInput({ title: "Logs", content: "Tool output is not retained." }).valid, false);
  assert.equal(validateMemoryInput({ title: "Traversal", content: "Valid note.", files: ["../private.txt"] }).valid, false);
  assert.equal(validateMemoryInput({ title: "Bad shape", content: "Valid note.", files: [42] }).valid, false);
});

test("unavailable server returns clean concise advisory fallback without throwing", async () => {
  // An unused port with no server running
  const unreachableUrl = "http://127.0.0.1:59998";

  const rememberRes = await executeRemember(
    {
      title: "Fallback test",
      content: "This should degrade cleanly.",
    },
    { agent: "spark-implementer" },
    { serverUrl: unreachableUrl, timeoutMs: 100 }
  );
  assert.match(rememberRes, /\[agentmemory advisory\] Server unavailable or remember request failed/);
  assert.match(rememberRes, /Work may proceed without memory persistence/);

  const recallRes = await executeRecall(
    { scope: "team" },
    { agent: "lead-developer" },
    { serverUrl: unreachableUrl, timeoutMs: 100 }
  );
  assert.match(recallRes, /\[agentmemory advisory\] Server unavailable/);
  assert.match(recallRes, /Proceeding without advisory memory/);
});
