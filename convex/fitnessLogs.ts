import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Mutation to log a new fitness entry
export const logFitness = mutation({
  args: {
    userId: v.string(),
    workoutType: v.string(),
    duration: v.number(), // in minutes
    caloriesBurned: v.number(),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("fitnessLogs", {
      userId: args.userId,
      workoutType: args.workoutType,
      duration: args.duration,
      caloriesBurned: args.caloriesBurned,
    });
  },
});

// Mutation to update an existing fitness entry
export const updateFitnessLog = mutation({
  args: {
    logId: v.id("fitnessLogs"),
    workoutType: v.optional(v.string()),
    duration: v.optional(v.number()),
    caloriesBurned: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.logId, {
      ...(args.workoutType !== undefined && { workoutType: args.workoutType }),
      ...(args.duration !== undefined && { duration: args.duration }),
      ...(args.caloriesBurned !== undefined && { caloriesBurned: args.caloriesBurned }),
    });
  },
});

// Mutation to delete a fitness entry
export const deleteFitnessLog = mutation({
  args: { logId: v.id("fitnessLogs") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.logId);
  },
});

// Query to fetch all fitness logs for a specific user
export const getFitnessLogs = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("fitnessLogs")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();
  },
});

// Query to fetch fitness logs for the last 7 days
export const getWeeklyFitnessLogs = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const allLogs = await ctx.db
      .query("fitnessLogs")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();

    // Get logs for the last 7 days
    const now = Date.now();
    const sevenDaysAgo = now - 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds

    return allLogs.filter((log) => log._creationTime >= sevenDaysAgo);
  },
});