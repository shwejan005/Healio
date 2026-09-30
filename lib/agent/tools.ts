import { randomUUID } from "node:crypto";
import type { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";
import { formatRetrievedContext, retrieveContext } from "@/lib/rag";
import type { LangfuseTrace } from "@/lib/observability/langfuse";
import type { AgentToolName, ToolCall } from "@/lib/agent/schema";
export { TOOL_DECLARATIONS, validateToolCall, type AgentToolName, type ToolCall } from "@/lib/agent/schema";

export type AgentToolContext = { userId: string; convex: ConvexHttpClient; trace: LangfuseTrace };

export function safeToolInput(tool: ToolCall): Record<string, unknown> {
  const safe: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(tool.args)) {
    if (["note", "gratitude", "query", "title"].includes(key) && typeof value === "string") safe[key] = `[REDACTED ${value.length} chars]`;
    else if (key === "subtasks" && Array.isArray(value)) safe[key] = `[${value.length} subtasks]`;
    else if (key === "activities" && Array.isArray(value)) safe[key] = `[${value.length} activities]`;
    else safe[key] = value;
  }
  return safe;
}

export async function executeTool(tool: ToolCall, context: AgentToolContext): Promise<{ result: unknown; auditInput: string }> {
  const { args, name } = tool;
  if (name === "logMoodEntry") {
    const insertedId = await context.convex.mutation(api.agent.logMoodEntry, {
      userId: context.userId, date: String(args.date), mood: Number(args.mood), sleepHours: Number(args.sleepHours),
      sleepQuality: Number(args.sleepQuality), anxiety: Number(args.anxiety), stress: Number(args.stress),
      activities: args.activities as string[], ...(typeof args.note === "string" ? { note: args.note } : {}),
    });
    return { result: { saved: true, entryId: insertedId }, auditInput: JSON.stringify(safeToolInput(tool)) };
  }
  if (name === "createGoal") {
    const subtasks = (args.subtasks as string[]).map((title) => ({ id: randomUUID(), title, completed: false }));
    const goalId = await context.convex.mutation(api.agent.createGoal, {
      userId: context.userId, title: String(args.title), category: String(args.category), priority: String(args.priority), subtasks,
    });
    return { result: { created: true, goalId }, auditInput: JSON.stringify(safeToolInput(tool)) };
  }
  if (name === "queryUserWellness") {
    const data = await context.convex.query(api.agent.queryUserWellness, { userId: context.userId, topic: args.topic as "mood" | "sleep" | "fitness" | "goals" | "recent" });
    return { result: data, auditInput: JSON.stringify(safeToolInput(tool)) };
  }
  if (name === "createGratitude") {
    const entryId = await context.convex.mutation(api.agent.createGratitude, { userId: context.userId, gratitude: String(args.gratitude) });
    return { result: { saved: true, entryId }, auditInput: JSON.stringify(safeToolInput(tool)) };
  }
  const queryText = String(args.query);
  const chunks = await retrieveContext(queryText, undefined, context.trace);
  return {
    result: { context: formatRetrievedContext(chunks), documents: chunks.map(({ id, score, source, title }) => ({ id, score, source, title })) },
    auditInput: JSON.stringify(safeToolInput(tool)),
  };
}

export function toolOutputForTrace(name: AgentToolName, result: unknown): unknown {
  if (name === "queryUserWellness" && Array.isArray(result)) return { returnedRecords: result.length };
  if (name === "queryUserWellness" && result && typeof result === "object") {
    const data = result as Record<string, unknown>;
    return {
      returnedMoods: Array.isArray(data.moods) ? data.moods.length : undefined,
      returnedFitness: Array.isArray(data.fitness) ? data.fitness.length : undefined,
      returnedEntries: Array.isArray(data.entries) ? data.entries.length : undefined,
      totalSleepDebtHours: typeof data.totalSleepDebt === "number" ? data.totalSleepDebt : undefined,
    };
  }
  if (name === "searchMentalHealthCorpus" && result && typeof result === "object") {
    const data = result as { documents?: Array<{ id: string; score: number }>; context?: string };
    return { documents: data.documents?.map(({ id, score }) => ({ id, score })) ?? [], context: data.context ?? "" };
  }
  return result;
}
