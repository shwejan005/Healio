export type JudgeRubric = {
  faithfulness: number;
  factualGrounding: number;
  helpfulness: number;
  rationale: string;
};

export function parseJudgeRubric(value: unknown): JudgeRubric {
  if (!value || typeof value !== "object") throw new Error("Judge response must be a JSON object");
  const candidate = value as Record<string, unknown>;
  for (const key of ["faithfulness", "factualGrounding", "helpfulness"] as const) {
    if (typeof candidate[key] !== "number" || candidate[key] < 0 || candidate[key] > 1) throw new Error(`${key} must be between 0 and 1`);
  }
  if (typeof candidate.rationale !== "string" || candidate.rationale.length > 1000) throw new Error("rationale must be a string under 1000 characters");
  return {
    faithfulness: candidate.faithfulness as number,
    factualGrounding: candidate.factualGrounding as number,
    helpfulness: candidate.helpfulness as number,
    rationale: candidate.rationale,
  };
}

export async function judgeWithGemini(input: { prompt: string; context: string; response: string }): Promise<JudgeRubric | null> {
  const key = process.env.GEMINI_API_KEY;
  if (!key) return null;
  const result = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${encodeURIComponent(key)}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ role: "user", parts: [{ text: `Evaluate the answer using only the provided context. Return JSON with faithfulness, factualGrounding, helpfulness in [0,1] and a short rationale.\nPrompt: ${input.prompt}\nContext: ${input.context}\nAnswer: ${input.response}` }] }],
      generationConfig: { temperature: 0, responseMimeType: "application/json", responseSchema: { type: "OBJECT", properties: { faithfulness: { type: "NUMBER" }, factualGrounding: { type: "NUMBER" }, helpfulness: { type: "NUMBER" }, rationale: { type: "STRING" } }, required: ["faithfulness", "factualGrounding", "helpfulness", "rationale"] } },
    }),
  });
  if (!result.ok) throw new Error(`Gemini judge returned HTTP ${result.status}`);
  const body = await result.json() as { candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }> };
  const text = body.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error("Gemini judge returned no rubric");
  return parseJudgeRubric(JSON.parse(text) as unknown);
}
