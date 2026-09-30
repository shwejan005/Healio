import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";
import { validateInput } from "@/lib/compliance/client";
import { submitLangfuseScore } from "@/lib/observability/langfuse";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const { userId, getToken } = await auth();
  if (!userId) return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  let body: unknown;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Request body must be valid JSON" }, { status: 400 }); }
  if (!body || typeof body !== "object") return NextResponse.json({ error: "Invalid feedback payload" }, { status: 400 });
  const values = body as Record<string, unknown>;
  if (typeof values.traceId !== "string" || values.traceId.length > 120 || (values.rating !== "up" && values.rating !== "down")) {
    return NextResponse.json({ error: "traceId and an up/down rating are required" }, { status: 400 });
  }
  if (values.comment !== undefined && (typeof values.comment !== "string" || values.comment.length > 1000)) {
    return NextResponse.json({ error: "Comment must be 1000 characters or fewer" }, { status: 400 });
  }
  const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
  if (!convexUrl) return NextResponse.json({ error: "Convex is not configured" }, { status: 503 });
  const convex = new ConvexHttpClient(convexUrl);
  const token = await getToken({ template: "convex" });
  if (!token) return NextResponse.json({ error: "Convex session token is unavailable" }, { status: 401 });
  convex.setAuth(token);
  try {
    const owner = await convex.query(api.audit.getAuditLogForUser, { traceId: values.traceId, userId });
    if (!owner) return NextResponse.json({ error: "Trace not found for this user" }, { status: 404 });
  } catch {
    return NextResponse.json({ error: "Unable to verify trace ownership" }, { status: 503 });
  }
  const comment = typeof values.comment === "string" ? (await validateInput(values.comment)).safeText : undefined;
  const accepted = await submitLangfuseScore({
    traceId: values.traceId,
    name: "user-feedback",
    value: values.rating === "up" ? 1 : 0,
    comment,
    userId,
  });
  return NextResponse.json({ accepted, persisted: accepted }, { status: accepted ? 201 : 202 });
}
