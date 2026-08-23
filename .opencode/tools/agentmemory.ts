import { tool } from "@opencode-ai/plugin";
import { executeRemember, executeRecall } from "../../scripts/agentmemory-lib.mjs";

export const agentmemory_remember = tool({
  description: "Explicitly record a concise advisory memory for future agent turns. Exclude secrets, raw logs, reasoning, and absolute host paths. Memory is advisory only; durable repository truth takes precedence.",
  args: {
    title: tool.schema.string().describe("Concise title / summary of the memory entry"),
    content: tool.schema.string().describe("Concise advisory content (facts, conventions, advice)"),
    concepts: tool.schema.array(tool.schema.string()).optional().describe("Optional list of concept tags"),
    files: tool.schema.array(tool.schema.string()).optional().describe("Optional list of repository-relative file paths"),
  },
  async execute(args, context) {
    return executeRemember(args, context);
  },
});

export const agentmemory_recall = tool({
  description: "Recall advisory memories from previous turns. Renders visible author. Memory is advisory only; durable repository truth takes precedence.",
  args: {
    query: tool.schema.string().optional().describe("Optional search query to filter and rank memories"),
    scope: tool.schema.enum(["own", "team"]).optional().describe("Memory scope: 'own' (only this role) or 'team' (all whitelisted roles). Defaults: Spark -> own, Lead/Small/Heavy -> team"),
    limit: tool.schema.number().optional().describe("Maximum number of memories to return (default 5)"),
  },
  async execute(args, context) {
    return executeRecall(args, context);
  },
});
