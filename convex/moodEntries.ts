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

export const updateMoodEntry = mutation({
  args: {
    id: v.id("moodEntries"),
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
    const { id, ...updates } = args;
    await ctx.db.patch(id, updates);
    return id;
  },
});

export const deleteMoodEntry = mutation({
  args: { id: v.id("moodEntries") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
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


export const getSleepDebt = query({
  args: { userId: v.string() },
  handler: async (ctx, { userId }): Promise<{ totalSleepDebt: number }> => {
    const entries = await ctx.db
      .query("moodEntries")
      .withIndex("by_user", q => q.eq("userId", userId))
      .order("desc")
      .take(7)

    const total = entries.reduce((acc, entry) => {
      const deficit = Math.max(8 - entry.sleep.hours, 0)
      return acc + deficit
    }, 0)

    return { totalSleepDebt: Math.round(total * 10) / 10 }
  }
})