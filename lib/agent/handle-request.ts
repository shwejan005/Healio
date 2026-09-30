import { randomUUID } from "node:crypto";
import { auth } from "@clerk/nextjs/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";
import { runAgent, type AgentResult, type AgentStatus, type HistoryTurn, agentModel } from "@/lib/agent/engine";
import { validateInput } from "@/lib/compliance/client";
import { LangfuseTrace } from "@/lib/observability/langfuse";
import { consumeRateLimit } from "@/lib/rate-limit";
import { logEvent } from "@/lib/logger";

export type ChatRequestBody = {
  query: string;
  history?: unknown;
  sessionId?: unknown;
};

export type ChatExecution = AgentResult & { traceId: string; sessionId: string; auditLogged: boolean; durationMs: number };

export class ChatRequestError extends Error {
  constructor(message: string, readonly status: number) { super(message); }
}

function validateHistory(value: unknown): HistoryTurn[] {
  if (!Array.isArray(value)) return [];
  return value.slice(-12).flatMap((turn): HistoryTurn[] => {
    if (!turn || typeof turn !== "object") return [];
    const candidate = turn as Record<string, unknown>;
    const role = candidate.role === "user" || candidate.sender === "user" ? "user" : candidate.role === "model" || candidate.role === "assistant" || candidate.sender === "ai" ? "model" : null;
    const text = typeof candidate.text === "string" ? candidate.text : typeof candidate.content === "string" ? candidate.content : null;
    if (!role || text === null) return [];
    return [{ role, text: text.slice(0, 1800) }];
  });
}

export async function executeChatRequest(
  body: ChatRequestBody,
  options: { traceId?: string; stream?: boolean; onStatus?: (event: AgentStatus) => void; onToken?: (text: string) => void } = {},
): Promise<ChatExecution> {
  if (typeof body.query !== "string" || !body.query.trim()) throw new ChatRequestError("User query is required", 400);
  if (body.query.length > 6000) throw new ChatRequestError("User query is too long", 413);
  const { userId, getToken } = await auth();
  if (!userId) throw new ChatRequestError("Authentication required", 401);
  if (!consumeRateLimit(userId, 30, 60_000).allowed) throw new ChatRequestError("Rate limit reached. Please try again shortly.", 429);
  if (!process.env.GEMINI_API_KEY) throw new ChatRequestError("Gemini API key is not configured", 503);
  const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
  if (!convexUrl) throw new ChatRequestError("Convex is not configured", 503);

  const startedAt = Date.now();
  const input = await validateInput(body.query.trim());
  const sessionId = typeof body.sessionId === "string" && body.sessionId.length <= 120 ? body.sessionId : randomUUID();
  const trace = new LangfuseTrace({ traceId: options.traceId, userId, sessionId, model: agentModel, input: input.safeText });
  logEvent("info", { traceId: trace.traceId, userId, component: "agent.request", message: "request_started", metadata: { model: agentModel, streaming: options.stream === true } });
  const convex = new ConvexHttpClient(convexUrl);
  try {
    const token = await getToken({ template: "convex" });
    if (token) convex.setAuth(token);
  } catch {
    // The data tools will return their typed authorization failure; plain conversation can still work.
  }
  const safeHistory = await Promise.all(validateHistory(body.history).map(async (turn) => {
    if (turn.role === "user") return { ...turn, text: (await validateInput(turn.text)).safeText };
    return turn;
  }));
  let result: AgentResult | null = null;
  let failure: unknown;
  try {
    if (input.injectionDetected) {
      await trace.span("input_guardrail", { detected: true, queryCharacters: input.safeText.length }, async () => ({ treatment: "kept as untrusted user content; system instructions remain authoritative" }));
    }
    result = await runAgent({
      query: input.safeText,
      history: safeHistory,
      userId,
      convex,
      trace,
      stream: options.stream,
      onStatus: options.onStatus,
      onToken: options.onToken,
    });
  } catch (error) {
    failure = error;
    logEvent("error", { traceId: trace.traceId, userId, component: "agent.execution", message: "agent_execution_failed", metadata: { errorType: error instanceof Error ? error.name : "unknown" } });
    await trace.span("agent_failure", { stage: "execution" }, async () => ({ failed: true }));
  }

  const toolCalls = result?.toolCalls ?? [];
  let auditLogged = false;
  try {
    await convex.mutation(api.audit.recordAuditLog, {
      writeSecret: process.env.AUDIT_WRITE_SECRET || "",
      traceId: trace.traceId,
      userId,
      action: "agent_turn",
      retrievedDocumentIds: result?.retrievedDocumentIds ?? [],
      toolCalls,
      complianceStatus: result?.complianceStatus ?? "FLAGGED",
    });
    auditLogged = true;
  } catch (error) {
    logEvent("error", { traceId: trace.traceId, userId, component: "agent.audit", message: "audit_write_failed", metadata: { errorType: error instanceof Error ? error.name : "unknown" } });
    await trace.span("audit_write", { action: "agent_turn" }, async () => ({ recorded: false }), { error: error instanceof Error ? error.message.slice(0, 160) : "audit write failed" });
  }

  await trace.flush({ durationMs: Date.now() - startedAt, ttftMs: result?.ttftMs, complianceStatus: result?.complianceStatus ?? "FLAGGED", auditLogged, inputPiiRedacted: input.piiRedacted });
  if (failure) throw new ChatRequestError("The assistant could not complete that request safely. Please try again.", 502);
  if (!result) throw new ChatRequestError("Agent returned no response", 502);
  logEvent("info", { traceId: trace.traceId, userId, component: "agent.request", message: "request_completed", metadata: { durationMs: Date.now() - startedAt, toolCallCount: result.toolCalls.length, complianceStatus: result.complianceStatus, auditLogged } });
  return { ...result, traceId: trace.traceId, sessionId, auditLogged, durationMs: Date.now() - startedAt };
}
