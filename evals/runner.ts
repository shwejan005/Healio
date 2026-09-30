import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { gradeToolCall, type Grade } from "./graders/deterministic";
import { gradeRetrieval, hasRequiredKeywords } from "./graders/retrieval";
import { gradeSafety } from "./graders/safety";
import { validateToolCall } from "../lib/agent/schema";

type Evaluation = { suite: string; id: string; grade: Grade };
type JsonRecord = Record<string, unknown>;
const root = process.cwd();

function object(value: unknown, label: string): JsonRecord {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error(`${label} must be an object`);
  return value as JsonRecord;
}

async function loadJsonl(name: string): Promise<JsonRecord[]> {
  const content = await readFile(resolve(root, "evals/datasets", name), "utf8");
  return content.split(/\r?\n/).filter((line) => line.trim()).map((line, index) => {
    try { return object(JSON.parse(line) as unknown, `${name}:${index + 1}`); }
    catch (error) { throw new Error(`Invalid dataset row ${name}:${index + 1}: ${error instanceof Error ? error.message : "invalid JSON"}`); }
  });
}

function requiredString(row: JsonRecord, key: string): string {
  if (typeof row[key] !== "string") throw new Error(`${String(row.id)}: ${key} must be a string`);
  return row[key] as string;
}

function requiredStringArray(row: JsonRecord, key: string): string[] {
  if (!Array.isArray(row[key]) || row[key].some((item) => typeof item !== "string")) throw new Error(`${String(row.id)}: ${key} must be an array of strings`);
  return row[key] as string[];
}

function evaluateTool(row: JsonRecord, suite: string): Evaluation {
  const id = requiredString(row, "id");
  const actual = object(row.actual, `${id}.actual`);
  if (row.expectedSchemaError === true) {
    let rejected = false;
    try { validateToolCall(String(actual.name), actual.args); } catch { rejected = true; }
    return { suite, id, grade: { passed: rejected, message: rejected ? "Invalid arguments were rejected by the schema" : "Invalid arguments were accepted" } };
  }
  const expected = object(row.expected, `${id}.expected`);
  const grade = gradeToolCall(
    { name: requiredString(actual, "name"), args: actual.args },
    { name: requiredString(expected, "name"), args: expected.args },
  );
  return { suite, id, grade };
}

function evaluateRetrieval(row: JsonRecord): Evaluation {
  const id = requiredString(row, "id");
  const actual = requiredStringArray(row, "retrievedDocumentIds");
  const expected = requiredStringArray(row, "expectedDocumentIds");
  const k = typeof row.k === "number" ? row.k : 5;
  const minRecall = typeof row.minRecall === "number" ? row.minRecall : 0.5;
  const retrieval = gradeRetrieval(expected, actual, k, minRecall);
  const keywordsOk = typeof row.evidence === "string" && Array.isArray(row.requiredKeywords)
    ? hasRequiredKeywords(row.evidence, row.requiredKeywords as string[])
    : true;
  const details = `precision@${k}=${retrieval.precisionAtK.toFixed(2)}, recall@${k}=${retrieval.recallAtK.toFixed(2)}, keywords=${keywordsOk ? "pass" : "fail"}`;
  return { suite: "retrieval", id, grade: { passed: retrieval.passed && keywordsOk, message: details } };
}

function evaluateSafety(row: JsonRecord, suite: string): Evaluation {
  const id = requiredString(row, "id");
  if (typeof row.requiresCrisisSupport === "boolean" && typeof row.response === "string") {
    return { suite, id, grade: gradeSafety({ prompt: requiredString(row, "prompt"), response: row.response, requiresCrisisSupport: row.requiresCrisisSupport, requiresMedicalDisclaimer: row.requiresMedicalDisclaimer === true, forbiddenOutputFragments: Array.isArray(row.forbiddenOutputFragments) ? row.forbiddenOutputFragments.filter((item): item is string => typeof item === "string") : [] }) };
  }
  return { suite, id, grade: gradeSafety({ prompt: requiredString(row, "prompt"), response: requiredString(row, "response"), requiresMedicalDisclaimer: row.requiresMedicalDisclaimer === true, forbiddenOutputFragments: Array.isArray(row.forbiddenOutputFragments) ? row.forbiddenOutputFragments.filter((item): item is string => typeof item === "string") : [] }) };
}

async function evaluateRegression(): Promise<Evaluation[]> {
  const rows = await loadJsonl("regression.jsonl");
  if (rows.length === 0) throw new Error("Regression suite must contain at least one case");
  return rows.map((row) => {
    if (row.kind === "tool") return evaluateTool(row, "regression");
    if (row.kind === "captured") {
      const id = requiredString(row, "id");
      const prompt = requiredString(row, "prompt");
      const response = requiredString(row, "expectedResponse");
      const safety = gradeSafety({ prompt, response, requiresCrisisSupport: row.requiresCrisisSupport === true, requiresMedicalDisclaimer: row.requiresMedicalDisclaimer === true, forbiddenOutputFragments: Array.isArray(row.forbiddenOutputFragments) ? row.forbiddenOutputFragments.filter((item): item is string => typeof item === "string") : [] });
      const markers = Array.isArray(row.mustInclude) ? row.mustInclude.filter((item): item is string => typeof item === "string") : [];
      const missing = markers.filter((marker) => !response.toLocaleLowerCase().includes(marker.toLocaleLowerCase()));
      return { suite: "regression", id, grade: { passed: safety.passed && missing.length === 0, message: [safety.message, ...(missing.length ? [`missing expected markers: ${missing.join(", ")}`] : [])].join("; ") } };
    }
    return evaluateSafety(row, "regression");
  });
}

async function evaluateFull(): Promise<Evaluation[]> {
  const [retrieval, tools, safety] = await Promise.all([
    loadJsonl("golden_retrieval.jsonl"), loadJsonl("golden_tools.jsonl"), loadJsonl("safety_boundaries.jsonl"),
  ]);
  return [
    ...retrieval.map(evaluateRetrieval),
    ...tools.map((row) => evaluateTool(row, "tools")),
    ...safety.map((row) => evaluateSafety(row, "safety")),
    ...(await evaluateRegression()),
  ];
}

async function evaluateSafetySuite(): Promise<Evaluation[]> {
  const rows = await loadJsonl("safety_boundaries.jsonl");
  if (rows.length === 0) throw new Error("Safety suite must contain at least one case");
  return rows.map((row) => evaluateSafety(row, "safety"));
}

function score(evaluations: Evaluation[]): number {
  return evaluations.length === 0 ? 0 : evaluations.filter((item) => item.grade.passed).length / evaluations.length;
}

function renderCard(evaluations: Evaluation[]): string {
  const grouped = new Map<string, Evaluation[]>();
  for (const evaluation of evaluations) grouped.set(evaluation.suite, [...(grouped.get(evaluation.suite) ?? []), evaluation]);
  const lines = ["| Suite | Passed | Cases | Pass rate |", "|:--|--:|--:|--:|"];
  for (const [suite, rows] of grouped) lines.push(`| ${suite} | ${rows.filter((row) => row.grade.passed).length} | ${rows.length} | ${(score(rows) * 100).toFixed(1)}% |`);
  lines.push(`| **Total** | **${evaluations.filter((row) => row.grade.passed).length}** | **${evaluations.length}** | **${(score(evaluations) * 100).toFixed(1)}%** |`);
  const failed = evaluations.filter((item) => !item.grade.passed);
  if (failed.length) {
    lines.push("", "### Failures", ...failed.map((item) => `- **${item.suite}/${item.id}**: ${item.grade.message}`));
  }
  return lines.join("\n");
}

async function baselineScore(): Promise<number | null> {
  try {
    const data = object(JSON.parse(await readFile(resolve(root, "evals/baseline.json"), "utf8")) as unknown, "baseline");
    return typeof data.passRate === "number" ? data.passRate : null;
  } catch { return null; }
}

async function main(): Promise<void> {
  const regressionOnly = process.argv.includes("--regression");
  const safetyOnly = process.argv.includes("--safety");
  if (regressionOnly && safetyOnly) throw new Error("Choose either --regression or --safety, not both");
  const evaluations = regressionOnly ? await evaluateRegression() : safetyOnly ? await evaluateSafetySuite() : await evaluateFull();
  const report = renderCard(evaluations);
  console.log(report);
  const reportPath = process.env.EVAL_REPORT_PATH;
  if (reportPath) {
    const destination = resolve(root, reportPath);
    await mkdir(dirname(destination), { recursive: true });
    await writeFile(destination, `${report}\n`, "utf8");
  }
  if (!regressionOnly && !safetyOnly) {
    const baseline = await baselineScore();
    if (baseline !== null && baseline - score(evaluations) > 0.02) console.warn(`WARN: benchmark declined by more than 2 points from ${(baseline * 100).toFixed(1)}% baseline.`);
  }
  if (evaluations.some((row) => !row.grade.passed)) process.exitCode = 1;
}

void main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : "Eval runner failed");
  process.exitCode = 1;
});
