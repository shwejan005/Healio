export type AgentToolName = "logMoodEntry" | "createGoal" | "queryUserWellness" | "createGratitude" | "searchMentalHealthCorpus";
export type ToolCall = { name: AgentToolName; args: Record<string, unknown> };

export const TOOL_DECLARATIONS = [
  { name: "logMoodEntry", description: "Save a mood check-in requested by the user. Ask for missing scale values before saving.", parameters: { type: "OBJECT", required: ["date", "mood", "sleepHours", "sleepQuality", "anxiety", "stress", "activities"], properties: { date: { type: "STRING", description: "Date in YYYY-MM-DD format" }, mood: { type: "NUMBER", minimum: 1, maximum: 10 }, sleepHours: { type: "NUMBER", minimum: 0, maximum: 24 }, sleepQuality: { type: "NUMBER", minimum: 1, maximum: 10 }, anxiety: { type: "NUMBER", minimum: 1, maximum: 10 }, stress: { type: "NUMBER", minimum: 1, maximum: 10 }, activities: { type: "ARRAY", items: { type: "STRING" } }, note: { type: "STRING" } } } },
  { name: "createGoal", description: "Create a wellness goal the user explicitly asked to add.", parameters: { type: "OBJECT", required: ["title", "category", "priority", "subtasks"], properties: { title: { type: "STRING" }, category: { type: "STRING", enum: ["mindfulness", "physical", "habits", "growth"] }, priority: { type: "STRING", enum: ["high", "medium", "low"] }, subtasks: { type: "ARRAY", items: { type: "STRING" } } } } },
  { name: "queryUserWellness", description: "Read the signed-in user's historical wellness records. Use only when the user asks about their own history or trends.", parameters: { type: "OBJECT", required: ["topic"], properties: { topic: { type: "STRING", enum: ["mood", "sleep", "fitness", "goals", "recent"] } } } },
  { name: "createGratitude", description: "Save a gratitude journal entry when the user explicitly asks to record it.", parameters: { type: "OBJECT", required: ["gratitude"], properties: { gratitude: { type: "STRING" } } } },
  { name: "searchMentalHealthCorpus", description: "Find relevant material in Healio's curated mental health resource corpus. Search only for general wellness questions, not diagnosis.", parameters: { type: "OBJECT", required: ["query"], properties: { query: { type: "STRING" } } } },
] as const;

const TOOL_NAMES = new Set<string>(TOOL_DECLARATIONS.map((tool) => tool.name));

function record(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error("Tool arguments must be a JSON object");
  return value as Record<string, unknown>;
}

function exactKeys(args: Record<string, unknown>, allowed: string[], required: string[]): void {
  const unexpected = Object.keys(args).filter((key) => !allowed.includes(key));
  const missing = required.filter((key) => !(key in args));
  if (unexpected.length || missing.length) throw new Error(`Invalid arguments. Missing: ${missing.join(", ") || "none"}; unexpected: ${unexpected.join(", ") || "none"}`);
}

function stringValue(args: Record<string, unknown>, key: string, min = 1, max = 3000): string {
  const value = args[key];
  if (typeof value !== "string" || value.trim().length < min || value.length > max) throw new Error(`${key} must be a string of ${min}–${max} characters`);
  return value.trim();
}

function numberValue(args: Record<string, unknown>, key: string, min: number, max: number): number {
  const value = args[key];
  if (typeof value !== "number" || !Number.isFinite(value) || value < min || value > max) throw new Error(`${key} must be a number between ${min} and ${max}`);
  return value;
}

function stringArray(args: Record<string, unknown>, key: string, maxItems: number, maxLength: number): string[] {
  const value = args[key];
  if (!Array.isArray(value) || value.length > maxItems || value.some((item) => typeof item !== "string" || item.length > maxLength)) {
    throw new Error(`${key} must be an array of at most ${maxItems} strings, each no longer than ${maxLength} characters`);
  }
  return value.map((item) => (item as string).trim());
}

export function validateToolCall(name: string, value: unknown): ToolCall {
  if (!TOOL_NAMES.has(name)) throw new Error(`Unknown tool: ${name}`);
  const args = record(value);
  if (name === "logMoodEntry") {
    exactKeys(args, ["date", "mood", "sleepHours", "sleepQuality", "anxiety", "stress", "activities", "note"], ["date", "mood", "sleepHours", "sleepQuality", "anxiety", "stress", "activities"]);
    const date = stringValue(args, "date", 10, 10);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || Number.isNaN(Date.parse(`${date}T00:00:00Z`))) throw new Error("date must use YYYY-MM-DD format");
    numberValue(args, "mood", 1, 10); numberValue(args, "sleepHours", 0, 24); numberValue(args, "sleepQuality", 1, 10);
    numberValue(args, "anxiety", 1, 10); numberValue(args, "stress", 1, 10); stringArray(args, "activities", 20, 80);
    if (args.note !== undefined) stringValue(args, "note", 0, 2000);
  } else if (name === "createGoal") {
    exactKeys(args, ["title", "category", "priority", "subtasks"], ["title", "category", "priority", "subtasks"]);
    stringValue(args, "title", 1, 180);
    if (!( ["mindfulness", "physical", "habits", "growth"] as unknown[]).includes(args.category)) throw new Error("category is invalid");
    if (!( ["high", "medium", "low"] as unknown[]).includes(args.priority)) throw new Error("priority is invalid");
    stringArray(args, "subtasks", 20, 180);
  } else if (name === "queryUserWellness") {
    exactKeys(args, ["topic"], ["topic"]);
    if (!( ["mood", "sleep", "fitness", "goals", "recent"] as unknown[]).includes(args.topic)) throw new Error("topic is invalid");
  } else if (name === "createGratitude") {
    exactKeys(args, ["gratitude"], ["gratitude"]); stringValue(args, "gratitude", 1, 3000);
  } else {
    exactKeys(args, ["query"], ["query"]); stringValue(args, "query", 1, 500);
  }
  return { name: name as AgentToolName, args };
}
