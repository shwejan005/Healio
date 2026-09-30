import { assessInput } from "../lib/compliance/rules";

type Observation = {
  id?: string;
  traceId?: string;
  name?: string;
  type?: string;
  startTime?: string;
  endTime?: string;
  latency?: number;
  level?: string;
  statusMessage?: string;
  input?: unknown;
  output?: unknown;
  metadata?: unknown;
};

function auth(): { host: string; authorization: string } {
  const publicKey = process.env.LANGFUSE_PUBLIC_KEY;
  const secretKey = process.env.LANGFUSE_SECRET_KEY;
  if (!publicKey || !secretKey) throw new Error("Set LANGFUSE_PUBLIC_KEY and LANGFUSE_SECRET_KEY to analyze traces");
  return {
    host: (process.env.LANGFUSE_HOST || "https://cloud.langfuse.com").replace(/\/$/, ""),
    authorization: `Basic ${Buffer.from(`${publicKey}:${secretKey}`).toString("base64")}`,
  };
}

async function loadObservations(days: number): Promise<Observation[]> {
  const config = auth();
  const to = new Date();
  const from = new Date(to.getTime() - days * 24 * 60 * 60 * 1000);
  const observations: Observation[] = [];
  let cursor: string | undefined;
  do {
    const url = new URL(`${config.host}/api/public/v2/observations`);
    url.searchParams.set("fromStartTime", from.toISOString());
    url.searchParams.set("toStartTime", to.toISOString());
    url.searchParams.set("fields", "core,basic,io,metadata,usage,metrics,trace_context");
    url.searchParams.set("limit", "1000");
    if (cursor) url.searchParams.set("cursor", cursor);
    const response = await fetch(url, { headers: { Authorization: config.authorization } });
    if (!response.ok) throw new Error(`Langfuse observations API returned HTTP ${response.status}`);
    const page = await response.json() as { data?: Observation[]; meta?: { cursor?: string | null } };
    observations.push(...(page.data ?? []));
    cursor = page.meta?.cursor || undefined;
  } while (cursor && observations.length < 10_000);
  return observations;
}

function parseValue(value: unknown): unknown {
  if (typeof value !== "string") return value;
  try { return JSON.parse(value) as unknown; } catch { return value; }
}

function retrievalScores(output: unknown): number[] {
  const value = parseValue(output);
  if (!value || typeof value !== "object") return [];
  const record = value as Record<string, unknown>;
  if (Array.isArray(record.documents)) {
    return record.documents.flatMap((document) => {
      if (!document || typeof document !== "object") return [];
      const score = (document as Record<string, unknown>).score;
      return typeof score === "number" ? [score] : [];
    });
  }
  if (Array.isArray(record.scores)) return record.scores.filter((score): score is number => typeof score === "number");
  return [];
}

function latencyMs(observation: Observation): number {
  if (typeof observation.latency === "number") return observation.latency * 1000;
  const start = Date.parse(observation.startTime || "");
  const end = Date.parse(observation.endTime || "");
  return Number.isFinite(start) && Number.isFinite(end) ? Math.max(0, end - start) : 0;
}

async function main(): Promise<void> {
  const daysArg = process.argv.find((arg) => arg.startsWith("--days="));
  const days = Math.max(1, Math.min(90, Number(daysArg?.slice("--days=".length) || 7)));
  const observations = await loadObservations(days);
  const roots = observations.filter((item) => item.name === "healio-agent-session");
  const latencies = roots.map((item) => ({ traceId: item.traceId || "unknown", latency: latencyMs(item) })).sort((a, b) => a.latency - b.latency);
  const p95 = latencies.length ? latencies[Math.min(latencies.length - 1, Math.ceil(latencies.length * 0.95) - 1)].latency : 0;
  const slowTraces = latencies.filter((item) => item.latency >= p95 && p95 > 0);
  const lowSimilarity = observations.flatMap((item) => retrievalScores(item.output)
    .filter((score) => score < 0.6)
    .map((score) => ({ traceId: item.traceId || "unknown", observation: item.name || "retrieval", score })));
  const toolErrors = observations.filter((item) => item.name === "tool_validation_error" || (item.name === "tool_execution" && item.level === "ERROR"))
    .map((item) => ({ traceId: item.traceId || "unknown", observation: item.name || "tool", detail: item.statusMessage || "validation/execution failure" }));
  const failureModes = [
    { name: "p95 latency", count: slowTraces.length },
    { name: "retrieval similarity below 0.60", count: lowSimilarity.length },
    { name: "tool validation/execution error", count: toolErrors.length },
  ].sort((left, right) => right.count - left.count);

  console.log(`# Langfuse trace anomaly report (${days} days)`);
  console.log(`\n- Traces analyzed: ${roots.length}`);
  console.log(`- p95 latency: ${p95.toFixed(0)} ms`);
  console.log(`- Traces at or above p95: ${slowTraces.length}`);
  console.log(`- Retrieval scores below 0.60: ${lowSimilarity.length}`);
  console.log(`- Tool validation/execution errors: ${toolErrors.length}`);
  console.log(`\n## Failure modes\n${failureModes.map((item) => `- ${item.name}: ${item.count}`).join("\n")}`);
  if (slowTraces.length) console.log(`\n## Slow traces\n${slowTraces.map((item) => `- ${item.traceId}: ${item.latency.toFixed(0)} ms`).join("\n")}`);
  if (lowSimilarity.length) console.log(`\n## Low similarity matches\n${lowSimilarity.map((item) => `- ${item.traceId} (${item.observation}): ${item.score.toFixed(3)}`).join("\n")}`);
  if (toolErrors.length) console.log(`\n## Tool failures\n${toolErrors.map((item) => `- ${item.traceId} (${item.observation}): ${assessInput(item.detail).safeText}`).join("\n")}`);
  if (!slowTraces.length && !lowSimilarity.length && !toolErrors.length) console.log("\nNo anomalies were found in the selected observation window.");
}

void main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : "Trace analysis failed");
  process.exitCode = 1;
});
