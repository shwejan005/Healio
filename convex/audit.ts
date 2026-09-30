import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const recordAuditLog = mutation({
  args: {
    writeSecret: v.string(),
    traceId: v.string(),
    userId: v.string(),
    action: v.string(),
    retrievedDocumentIds: v.array(v.string()),
    toolCalls: v.array(v.object({ name: v.string(), input: v.string(), status: v.string(), latencyMs: v.number() })),
    complianceStatus: v.union(v.literal("PASSED"), v.literal("FLAGGED")),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity || identity.subject !== args.userId || !process.env.AUDIT_WRITE_SECRET || args.writeSecret !== process.env.AUDIT_WRITE_SECRET) {
      throw new Error("Unauthorized audit write");
    }
    return await ctx.db.insert("auditLogs", {
      traceId: args.traceId,
      userId: args.userId,
      action: args.action,
      retrievedDocumentIds: args.retrievedDocumentIds,
      toolCalls: args.toolCalls,
      complianceStatus: args.complianceStatus,
      timestamp: Date.now(),
    });
  },
});

export const getAuditLogForUser = query({
  args: { traceId: v.string(), userId: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity || identity.subject !== args.userId) throw new Error("Unauthorized audit read");
    return await ctx.db.query("auditLogs").withIndex("by_user_trace", (q) => q.eq("userId", args.userId).eq("traceId", args.traceId)).first();
  },
});
