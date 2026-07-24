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

// Add a new goal with category, priority, due date & subtasks
export const addGoal = mutation({
  args: {
    userId: v.string(),
    title: v.string(),
    category: v.optional(v.string()),
    priority: v.optional(v.string()),
    dueDate: v.optional(v.string()),
    subtasks: v.optional(
      v.array(
        v.object({
          id: v.string(),
          title: v.string(),
          completed: v.boolean(),
        })
      )
    ),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("goals", {
      userId: args.userId,
      title: args.title,
      completed: false,
      createdAt: Date.now(),
      category: args.category || "habits",
      priority: args.priority || "medium",
      dueDate: args.dueDate || "",
      subtasks: args.subtasks || [],
      streak: 0,
    });
  },
});

// Update goal status
export const updateGoal = mutation({
  args: { id: v.id("goals"), completed: v.boolean() },
  handler: async (ctx, { id, completed }) => {
    const goal = await ctx.db.get(id);
    const newStreak = completed ? (goal?.streak || 0) + 1 : goal?.streak;
    await ctx.db.patch(id, { completed, streak: newStreak });
  },
});

// Toggle subtask status
export const toggleSubtask = mutation({
  args: { goalId: v.id("goals"), subtaskId: v.string() },
  handler: async (ctx, { goalId, subtaskId }) => {
    const goal = await ctx.db.get(goalId);
    if (!goal || !goal.subtasks) return;

    const updatedSubtasks = goal.subtasks.map((st) =>
      st.id === subtaskId ? { ...st, completed: !st.completed } : st
    );

    // Auto complete parent goal if all subtasks are completed
    const allCompleted = updatedSubtasks.length > 0 && updatedSubtasks.every((st) => st.completed);

    await ctx.db.patch(goalId, {
      subtasks: updatedSubtasks,
      completed: allCompleted,
    });
  },
});

// Delete a goal
export const deleteGoal = mutation({
  args: { id: v.id("goals") },
  handler: async (ctx, { id }) => {
    await ctx.db.delete(id);
  },
});