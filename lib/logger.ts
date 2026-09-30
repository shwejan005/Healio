import { randomUUID } from "node:crypto";

export type LogLevel = "info" | "warn" | "error";
export type LogMetadata = Record<string, string | number | boolean | null>;

export type LogEvent = {
  component: string;
  message: string;
  traceId?: string;
  userId?: string;
  metadata?: LogMetadata;
};

const SENSITIVE_METADATA_KEY = /(prompt|input|output|response|query|content|secret|token|email|phone|ssn|aadhaar|address)/i;
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function requestTraceId(request: Request): string {
  const supplied = request.headers.get("x-request-id");
  return supplied && UUID_PATTERN.test(supplied) ? supplied.toLowerCase() : randomUUID();
}

export function logEvent(level: LogLevel, event: LogEvent): void {
  const metadata = Object.fromEntries(
    Object.entries(event.metadata ?? {})
      .filter(([key]) => !SENSITIVE_METADATA_KEY.test(key))
      .map(([key, value]) => [key, typeof value === "string" ? value.slice(0, 120) : value]),
  );
  const record = {
    timestamp: new Date().toISOString(),
    level,
    traceId: event.traceId ?? null,
    userId: event.userId ?? null,
    component: event.component,
    message: event.message,
    metadata,
  };
  const line = JSON.stringify(record);
  if (level === "error") console.error(line);
  else if (level === "warn") console.warn(line);
  else console.log(line);
}
