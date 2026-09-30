import { validateToolCall, type AgentToolName } from "../../lib/agent/schema";

export type Grade = { passed: boolean; message: string };

function canonical(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(canonical).join(",")}]`;
  if (value && typeof value === "object") {
    const entries = Object.entries(value as Record<string, unknown>).sort(([left], [right]) => left.localeCompare(right));
    return `{${entries.map(([key, item]) => `${JSON.stringify(key)}:${canonical(item)}`).join(",")}}`;
  }
  return JSON.stringify(value);
}

export function gradeToolCall(actual: { name: string; args: unknown }, expected: { name: string; args: unknown }): Grade {
  try {
    const validated = validateToolCall(actual.name, actual.args);
    if (actual.name !== expected.name) return { passed: false, message: `Expected tool ${expected.name}, received ${actual.name}` };
    if (canonical(validated.args) !== canonical(expected.args)) return { passed: false, message: "Tool arguments did not match the golden case" };
    return { passed: true, message: "Tool name, JSON arguments, and schema are valid" };
  } catch (error) {
    return { passed: false, message: error instanceof Error ? error.message : "Tool call failed schema validation" };
  }
}

export function gradeExact(actual: unknown, expected: unknown): Grade {
  return canonical(actual) === canonical(expected)
    ? { passed: true, message: "Exact match" }
    : { passed: false, message: "Values differ" };
}

export function isAgentToolName(value: string): value is AgentToolName {
  return ["logMoodEntry", "createGoal", "queryUserWellness", "createGratitude", "searchMentalHealthCorpus"].includes(value);
}
