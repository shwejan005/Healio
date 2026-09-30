import { AsyncLocalStorage } from "node:async_hooks";
import { randomBytes, randomUUID } from "node:crypto";

type AnyValue = { stringValue?: string; boolValue?: boolean; intValue?: string; doubleValue?: number; arrayValue?: { values: AnyValue[] } };
type Attribute = { key: string; value: AnyValue };
type OtelSpan = {
  traceId: string;
  spanId: string;
  parentSpanId?: string;
  name: string;
  kind: number;
  startTimeUnixNano: string;
  endTimeUnixNano: string;
  attributes: Attribute[];
  status?: { code: number; message?: string };
};

function credentials(): { host: string; authorization: string } | null {
  const publicKey = process.env.LANGFUSE_PUBLIC_KEY;
  const secretKey = process.env.LANGFUSE_SECRET_KEY;
  if (!publicKey || !secretKey) return null;
  const host = (process.env.LANGFUSE_HOST || "https://cloud.langfuse.com").replace(/\/$/, "");
  return { host, authorization: `Basic ${Buffer.from(`${publicKey}:${secretKey}`).toString("base64")}` };
}

function asAnyValue(value: unknown): AnyValue {
  if (typeof value === "string") return { stringValue: value };
  if (typeof value === "boolean") return { boolValue: value };
  if (typeof value === "number") return Number.isInteger(value) ? { intValue: String(value) } : { doubleValue: value };
  if (Array.isArray(value)) return { arrayValue: { values: value.map(asAnyValue) } };
  return { stringValue: JSON.stringify(value) };
}

function attr(key: string, value: unknown): Attribute { return { key, value: asAnyValue(value) }; }
function toNanos(value: Date): string { return String(BigInt(value.getTime()) * BigInt(1_000_000)); }
function observationType(name: string): string {
  if (name === "tool_execution") return "tool";
  if (name === "vector_retrieval") return "retriever";
  if (name === "embed_query") return "embedding";
  if (name === "agent_reasoning") return "agent";
  if (name === "output_compliance" || name === "input_guardrail") return "guardrail";
  return "span";
}

export class LangfuseTrace {
  readonly traceId: string;
  private readonly spans: OtelSpan[] = [];
  private readonly enabled: boolean;
  private readonly startedAt = new Date();
  private readonly rootSpanId: string;
  private readonly context = new AsyncLocalStorage<string>();
  private readonly root: OtelSpan;
  private readonly commonAttributes: Attribute[];

  constructor(args: { traceId?: string; userId: string; sessionId: string; model: string; input: string }) {
    this.traceId = args.traceId?.replaceAll("-", "") || randomBytes(16).toString("hex");
    this.rootSpanId = randomBytes(8).toString("hex");
    this.enabled = credentials() !== null;
    this.commonAttributes = [
      attr("langfuse.user.id", args.userId),
      attr("langfuse.session.id", args.sessionId),
      attr("langfuse.trace.name", "healio-agent-session"),
      attr("langfuse.trace.tags", ["agent", "healthcare"]),
      attr("langfuse.trace.metadata.model", args.model),
      attr("service.name", "healio"),
    ];
    this.root = {
      traceId: this.traceId,
      spanId: this.rootSpanId,
      name: "healio-agent-session",
      kind: 1,
      startTimeUnixNano: toNanos(this.startedAt),
      endTimeUnixNano: toNanos(this.startedAt),
      attributes: [...this.commonAttributes, attr("langfuse.observation.type", "span"), attr("langfuse.observation.input", JSON.stringify({ query: args.input }))],
    };
    if (this.enabled) this.spans.push(this.root);
  }

  span<T>(name: string, input: unknown, operation: () => Promise<T>, metadata?: Record<string, unknown>, projectOutput: (output: T) => unknown = (output) => output): Promise<T> {
    if (!this.enabled) return operation();
    const start = new Date();
    const id = randomBytes(8).toString("hex");
    const span: OtelSpan = {
      traceId: this.traceId,
      spanId: id,
      parentSpanId: this.context.getStore() || this.rootSpanId,
      name,
      kind: 1,
      startTimeUnixNano: toNanos(start),
      endTimeUnixNano: toNanos(start),
      attributes: [
        ...this.commonAttributes,
        attr("langfuse.observation.type", observationType(name)),
        attr("langfuse.observation.input", JSON.stringify(input)),
        ...Object.entries(metadata ?? {}).map(([key, value]) => attr(`langfuse.observation.metadata.${key}`, typeof value === "string" ? value : JSON.stringify(value))),
      ],
    };
    this.spans.push(span);
    return this.context.run(id, operation).then(
      (output) => {
        span.endTimeUnixNano = toNanos(new Date());
        span.attributes.push(attr("langfuse.observation.output", JSON.stringify(projectOutput(output))));
        return output;
      },
      (error: unknown) => {
        span.endTimeUnixNano = toNanos(new Date());
        span.status = { code: 2, message: error instanceof Error ? error.message.slice(0, 240) : "operation failed" };
        span.attributes.push(attr("langfuse.observation.level", "ERROR"), attr("langfuse.observation.status_message", span.status.message));
        throw error;
      },
    );
  }

  generation(args: { name: string; model: string; input: unknown; output: unknown; latencyMs: number; usage?: { prompt: number; completion: number; total: number }; costUsd?: number; metadata?: Record<string, unknown> }): void {
    if (!this.enabled) return;
    const end = new Date();
    const start = new Date(end.getTime() - args.latencyMs);
    const attributes = [
      ...this.commonAttributes,
      attr("langfuse.observation.type", "generation"),
      attr("langfuse.observation.input", JSON.stringify(args.input)),
      attr("langfuse.observation.output", JSON.stringify(args.output)),
      attr("langfuse.observation.model.name", args.model),
      attr("langfuse.observation.model.parameters", JSON.stringify({ temperature: 0 })),
      ...Object.entries(args.metadata ?? {}).map(([key, value]) => attr(`langfuse.observation.metadata.${key}`, typeof value === "string" ? value : JSON.stringify(value))),
    ];
    if (args.usage) attributes.push(attr("langfuse.observation.usage_details", JSON.stringify({ input: args.usage.prompt, output: args.usage.completion, total: args.usage.total })));
    if (args.costUsd !== undefined) attributes.push(attr("langfuse.observation.cost_details", JSON.stringify({ total: args.costUsd })));
    this.spans.push({
      traceId: this.traceId, spanId: randomBytes(8).toString("hex"), parentSpanId: this.rootSpanId,
      name: args.name, kind: 1, startTimeUnixNano: toNanos(start), endTimeUnixNano: toNanos(end), attributes,
    });
  }

  async flush(metadata?: Record<string, unknown>): Promise<void> {
    if (!this.enabled) return;
    const end = new Date();
    this.root.endTimeUnixNano = toNanos(end);
    this.root.attributes.push(
      attr("langfuse.observation.output", JSON.stringify(metadata ?? {})),
      ...Object.entries(metadata ?? {}).map(([key, value]) => attr(`langfuse.trace.metadata.${key}`, typeof value === "string" ? value : JSON.stringify(value))),
      attr("langfuse.trace.metadata.latencyMs", Date.now() - this.startedAt.getTime()),
    );
    const auth = credentials();
    if (!auth || this.spans.length === 0) return;
    const payload = { resourceSpans: [{ resource: { attributes: [attr("service.name", "healio")] }, scopeSpans: [{ scope: { name: "healio.agent", version: "1.0.0" }, spans: this.spans }] }] };
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 1500);
    try {
      const response = await fetch(`${auth.host}/api/public/otel/v1/traces`, {
        method: "POST",
        headers: { Authorization: auth.authorization, "Content-Type": "application/json", "x-langfuse-ingestion-version": "4" },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });
      if (!response.ok) console.warn("Langfuse ingestion returned", response.status);
    } catch {
      // Observability is fail-open; do not make user requests depend on Langfuse availability.
    } finally {
      clearTimeout(timeout);
    }
  }
}

export async function submitLangfuseScore(args: { traceId: string; name: string; value: number; comment?: string; userId: string }): Promise<boolean> {
  const auth = credentials();
  if (!auth) return false;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 1500);
  try {
    const response = await fetch(`${auth.host}/api/public/scores`, {
      method: "POST",
      headers: { Authorization: auth.authorization, "Content-Type": "application/json" },
      body: JSON.stringify({
        id: randomUUID(), traceId: args.traceId, name: args.name, value: args.value, dataType: "BOOLEAN",
        comment: args.comment, metadata: { userId: args.userId },
      }),
      signal: controller.signal,
    });
    return response.ok;
  } catch {
    return false;
  } finally {
    clearTimeout(timeout);
  }
}
