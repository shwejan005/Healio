import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Fetch all goals for a user
export const getGoals = query({
  args: { userId: v.string() },
  handler: async (ctx, { userId }) => {
    return await ctx.db
      .query("goals")
      .withIndex("byUserId", (q) => q.eq("userId", userId))
      .order("desc")
      .collect();
  },
});

// Add a new goal
export const addGoal = mutation({
  args: { userId: v.string(), title: v.string() },
  handler: async (ctx, { userId, title }) => {
    await ctx.db.insert("goals", {
      userId,
      title,
      completed: false,
      createdAt: Date.now(),
    });
  },
});

// Update goal status
export const updateGoal = mutation({
  args: { id: v.id("goals"), completed: v.boolean() },
  handler: async (ctx, { id, completed }) => {
    await ctx.db.patch(id, { completed });
  },
});

// Delete a goal
export const deleteGoal = mutation({
  args: { id: v.id("goals") },
  handler: async (ctx, { id }) => {
    await ctx.db.delete(id);
  },
});