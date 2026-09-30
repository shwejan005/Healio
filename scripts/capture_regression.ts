import { appendFile, readFile } from "node:fs/promises";
import { resolve } from "node:path";

type Observation = { name?: string; input?: unknown; output?: unknown };
type JsonRecord = Record<string, unknown>;

function arg(name: string): string | undefined {
  const prefix = `--${name}=`;
  const value = process.argv.find((item) => item.startsWith(prefix));
  return value?.slice(prefix.length);
}

function parseValue(value: unknown): unknown {
  if (typeof value !== "string") return value;
  try { return JSON.parse(value) as unknown; } catch { return value; }
}

function credentials(): { host: string; authorization: string } {
  const publicKey = process.env.LANGFUSE_PUBLIC_KEY;
  const secretKey = process.env.LANGFUSE_SECRET_KEY;
  if (!publicKey || !secretKey) throw new Error("Set LANGFUSE_PUBLIC_KEY and LANGFUSE_SECRET_KEY to capture a trace");
  return { host: (process.env.LANGFUSE_HOST || "https://cloud.langfuse.com").replace(/\/$/, ""), authorization: `Basic ${Buffer.from(`${publicKey}:${secretKey}`).toString("base64")}` };
}

async function main(): Promise<void> {
  const traceId = arg("trace-id");
  const expectedBehavior = arg("expected");
  const expectedResponse = arg("expected-response");
  if (!traceId || !expectedBehavior || !expectedResponse) throw new Error("Usage: npm run eval:capture -- --trace-id=<id> --expected=<behavior> --expected-response=<safe response>");

  const auth = credentials();
  const url = new URL(`${auth.host}/api/public/v2/observations`);
  url.searchParams.set("traceId", traceId);
  url.searchParams.set("fields", "core,basic,io,metadata");
  url.searchParams.set("limit", "1000");
  const response = await fetch(url, { headers: { Authorization: auth.authorization } });
  if (!response.ok) throw new Error(`Langfuse observations API returned HTTP ${response.status}`);
  const body = await response.json() as { data?: Observation[] };
  const observations = body.data ?? [];
  if (!observations.length) throw new Error(`No observations found for trace ${traceId}`);
  const root = observations.find((item) => item.name === "healio-agent-session");
  const input = parseValue(root?.input);
  const query = input && typeof input === "object" && typeof (input as JsonRecord).query === "string" ? (input as JsonRecord).query as string : "";
  if (!query) throw new Error("Trace root did not contain a query input");
  const retrievals = observations.filter((item) => item.name === "tool_execution" || item.name === "vector_retrieval");
  const contextDocumentIds: string[] = [];
  const contexts: string[] = [];
  for (const observation of retrievals) {
    const output = parseValue(observation.output);
    if (!output || typeof output !== "object") continue;
    const value = output as JsonRecord;
    if (Array.isArray(value.documents)) {
      for (const item of value.documents) if (item && typeof item === "object" && typeof (item as JsonRecord).id === "string") contextDocumentIds.push((item as JsonRecord).id as string);
    }
    if (typeof value.context === "string") contexts.push(value.context);
  }
  const markerText = arg("must-include") || "";
  const caseRow = {
    id: `langfuse-${traceId}`,
    kind: "captured",
    prompt: query,
    context: contexts.join("\n\n"),
    contextDocumentIds: [...new Set(contextDocumentIds)],
    expectedBehavior,
    expectedResponse,
    mustInclude: markerText.split(",").map((part) => part.trim()).filter(Boolean),
    requiresCrisisSupport: /\b(suicid(?:e|al)|kill myself|end my life|self[- ]harm|hurt myself|don't want to live|do not want to live)\b/i.test(query),
    requiresMedicalDisclaimer: /\b(diagnos|medication|depression|anxiety disorder|therapy|clinical)\b/i.test(query),
    sourceTraceId: traceId,
  };
  const datasetPath = resolve(process.cwd(), "evals/datasets/regression.jsonl");
  const existing = await readFile(datasetPath, "utf8");
  if (existing.split(/\r?\n/).some((line) => line.includes(`"id":"langfuse-${traceId}"`))) throw new Error("This trace is already in regression.jsonl");
  await appendFile(datasetPath, `${JSON.stringify(caseRow)}\n`, "utf8");
  console.log(`Added trace ${traceId} to evals/datasets/regression.jsonl. Review the case before committing it.`);
}

void main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : "Regression capture failed");
  process.exitCode = 1;
});
