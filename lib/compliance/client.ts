import { assessInput, assessOutput, type InputAssessment, type OutputAssessment } from "./rules";

const REQUEST_TIMEOUT_MS = 900;
let consecutiveFailures = 0;
let circuitOpenUntil = 0;

async function requestRules<T>(path: string, body: unknown): Promise<T | null> {
  const baseUrl = process.env.RULES_ENGINE_URL;
  if (!baseUrl || circuitOpenUntil > Date.now()) return null;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    const response = await fetch(`${baseUrl.replace(/\/$/, "")}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: controller.signal,
      cache: "no-store",
    });
    if (!response.ok) {
      consecutiveFailures += 1;
      if (consecutiveFailures >= 3) circuitOpenUntil = Date.now() + 30_000;
      return null;
    }
    const data = await response.json() as T;
    consecutiveFailures = 0;
    circuitOpenUntil = 0;
    return data;
  } catch {
    consecutiveFailures += 1;
    if (consecutiveFailures >= 3) circuitOpenUntil = Date.now() + 30_000;
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

export async function validateInput(text: string): Promise<InputAssessment> {
  const remote = await requestRules<InputAssessment>("/validate/input", { text });
  if (remote && typeof remote.safeText === "string" && typeof remote.injectionDetected === "boolean") return remote;
  return assessInput(text);
}

export async function validateOutput(text: string, crisisInput: boolean): Promise<OutputAssessment> {
  const remote = await requestRules<OutputAssessment>("/validate/output", { text, crisisInput });
  if (remote && typeof remote.safeText === "string" && typeof remote.passed === "boolean") return remote;
  return assessOutput(text, crisisInput);
}
