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
    logEvent("warn", { traceId, component: "api.chat.stream", message: "invalid_json_request" });
    return new Response(JSON.stringify({ error: "Request body must be valid JSON", traceId }), { status: 400, headers: { "Content-Type": "application/json", "x-request-id": traceId } });
  }

  const encoder = new TextEncoder();
  const startedAt = Date.now();
  let firstClientEventAt: number | undefined;
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const send = (event: Record<string, unknown>) => {
        if (firstClientEventAt === undefined) firstClientEventAt = Date.now();
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`));
      };
      send({ type: "status", message: "🔐 Securing your request…" });
      try {
        const result = await executeChatRequest(body, {
          traceId,
          stream: true,
          onStatus: (event) => send(event),
          onToken: (delta) => send({ type: "token", delta }),
        });
        send({
          type: "final", response: result.response, traceId: result.traceId, sessionId: result.sessionId,
          complianceStatus: result.complianceStatus, auditLogged: result.auditLogged,
          ttftMs: result.ttftMs ?? (firstClientEventAt === undefined ? null : firstClientEventAt - startedAt),
          durationMs: Date.now() - startedAt,
        });
      } catch (error) {
        const status = error instanceof ChatRequestError ? error.status : 500;
        logEvent(status >= 500 ? "error" : "warn", { traceId, component: "api.chat.stream", message: "stream_request_failed", metadata: { status } });
        send({ type: "error", status, traceId, message: error instanceof ChatRequestError ? error.message : "Unable to process the chat request" });
      } finally {
        controller.close();
      }
    },
  });
  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
      "x-request-id": traceId,
    },
  });
}
