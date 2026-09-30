import { NextResponse } from "next/server";
import { ChatRequestError, executeChatRequest, type ChatRequestBody } from "@/lib/agent/handle-request";
import { logEvent, requestTraceId } from "@/lib/logger";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(request: Request) {
  const traceId = requestTraceId(request);
  let body: ChatRequestBody;
  try {
    body = await request.json() as ChatRequestBody;
  } catch {
    logEvent("warn", { traceId, component: "api.chat", message: "invalid_json_request" });
    return NextResponse.json({ error: "Request body must be valid JSON", traceId }, { status: 400, headers: { "x-request-id": traceId } });
  }
  try {
    const result = await executeChatRequest(body, { traceId });
    return NextResponse.json({ response: result.response, traceId: result.traceId, sessionId: result.sessionId, complianceStatus: result.complianceStatus, auditLogged: result.auditLogged }, { headers: { "x-request-id": result.traceId } });
  } catch (error) {
    if (error instanceof ChatRequestError) {
      logEvent(error.status >= 500 ? "error" : "warn", { traceId, component: "api.chat", message: "request_rejected", metadata: { status: error.status } });
      return NextResponse.json({ error: error.message, traceId }, { status: error.status, headers: { "x-request-id": traceId } });
    }
    logEvent("error", { traceId, component: "api.chat", message: "unexpected_route_failure" });
    return NextResponse.json({ error: "Unable to process the chat request", traceId }, { status: 500, headers: { "x-request-id": traceId } });
  }
}
