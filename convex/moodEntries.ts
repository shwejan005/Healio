// convex/moodEntries.ts
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const createMoodEntry = mutation({
  args: {
    userId: v.string(),
    date: v.string(),
    mood: v.number(),
    sleep: v.object({
      hours: v.number(),
      quality: v.number(),
    }),
    anxiety: v.number(),
    stress: v.number(),
    activities: v.array(v.string()),
    note: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const moodEntryId = await ctx.db.insert("moodEntries", args);
    return moodEntryId;
  },
});

export const getMoodEntries = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    return ctx.db
      .query("moodEntries")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .order("desc")
      .collect();
  },
});