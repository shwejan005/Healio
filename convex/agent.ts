import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

async function requireOwner(ctx: { auth: { getUserIdentity: () => Promise<{ subject: string } | null> } }, userId: string) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity || identity.subject !== userId) {
    throw new Error("Unauthorized access to wellness data");
  }
}

export const logMoodEntry = mutation({
  args: {
    userId: v.string(),
    date: v.string(),
    mood: v.number(),
    sleepHours: v.number(),
    sleepQuality: v.number(),
    anxiety: v.number(),
    stress: v.number(),
    activities: v.array(v.string()),
    note: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireOwner(ctx, args.userId);
    for (const [name, value] of [["mood", args.mood], ["sleep quality", args.sleepQuality], ["anxiety", args.anxiety], ["stress", args.stress]] as const) {
      if (!Number.isFinite(value) || value < 1 || value > 10) throw new Error(`${name} must be between 1 and 10`);
    }
    if (!Number.isFinite(args.sleepHours) || args.sleepHours < 0 || args.sleepHours > 24) throw new Error("sleepHours must be between 0 and 24");
    if (args.activities.length > 20 || args.activities.some((item) => item.length > 80)) throw new Error("Activities exceed allowed limits");
    if (args.note && args.note.length > 2000) throw new Error("Note is too long");
    return await ctx.db.insert("moodEntries", {
      userId: args.userId,
      date: args.date,
      mood: args.mood,
      sleep: { hours: args.sleepHours, quality: args.sleepQuality },
      anxiety: args.anxiety,
      stress: args.stress,
      activities: args.activities,
      note: args.note,
    });
  },
});

export const createGoal = mutation({
  args: {
    userId: v.string(),
    title: v.string(),
    category: v.string(),
    priority: v.string(),
    subtasks: v.array(v.object({ id: v.string(), title: v.string(), completed: v.boolean() })),
  },
  handler: async (ctx, args) => {
    await requireOwner(ctx, args.userId);
    if (args.title.trim().length < 1 || args.title.length > 180) throw new Error("Goal title must be 1–180 characters");
    if (args.subtasks.length > 20) throw new Error("A goal can have at most 20 subtasks");
    if (!["mindfulness", "physical", "habits", "growth"].includes(args.category)) throw new Error("Invalid goal category");
    if (!["high", "medium", "low"].includes(args.priority)) throw new Error("Invalid goal priority");
    return await ctx.db.insert("goals", {
      userId: args.userId,
      title: args.title.trim(),
      completed: false,
      createdAt: Date.now(),
      category: args.category,
      priority: args.priority,
      subtasks: args.subtasks,
      streak: 0,
    });
  },
});

export const createGratitude = mutation({
  args: { userId: v.string(), gratitude: v.string() },
  handler: async (ctx, args) => {
    await requireOwner(ctx, args.userId);
    const gratitude = args.gratitude.trim();
    if (!gratitude || gratitude.length > 3000) throw new Error("Gratitude entry must be 1–3000 characters");
    return await ctx.db.insert("gratitudeEntries", {
      userId: args.userId,
      date: new Date().toISOString(),
      gratitude,
    });
  },
});

export const queryUserWellness = query({
  args: { userId: v.string(), topic: v.union(v.literal("mood"), v.literal("sleep"), v.literal("fitness"), v.literal("goals"), v.literal("recent")) },
  handler: async (ctx, args) => {
    await requireOwner(ctx, args.userId);
    if (args.topic === "mood" || args.topic === "sleep" || args.topic === "recent") {
      const moods = await ctx.db.query("moodEntries").withIndex("by_user", (q) => q.eq("userId", args.userId)).order("desc").take(30);
      if (args.topic === "mood") return moods.map((entry) => ({ date: entry.date, mood: entry.mood, anxiety: entry.anxiety, stress: entry.stress, activities: entry.activities }));
      if (args.topic === "sleep") {
        const entries = moods.slice(0, 7).map((entry) => ({ date: entry.date, hours: entry.sleep.hours, quality: entry.sleep.quality }));
        const totalSleepDebt = Math.round(entries.reduce((total, entry) => total + Math.max(8 - entry.hours, 0), 0) * 10) / 10;
        return { entries, totalSleepDebt };
      }
      const fitness = await ctx.db.query("fitnessLogs").withIndex("by_user", (q) => q.eq("userId", args.userId)).order("desc").take(20);
      return { moods, fitness };
    }
    if (args.topic === "fitness") {
      return await ctx.db.query("fitnessLogs").withIndex("by_user", (q) => q.eq("userId", args.userId)).order("desc").take(30);
    }
    return await ctx.db.query("goals").withIndex("byUserId", (q) => q.eq("userId", args.userId)).order("desc").take(30);
  },
});
