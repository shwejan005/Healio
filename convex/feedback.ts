import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Create feedback
export const submit = mutation({
  args: { rating: v.number(), text: v.string() },
  handler: async (ctx, { rating, text }) => {
    await ctx.db.insert("feedback", {
      rating,
      text,
      createdAt: Date.now(),
    });
  },
});

// Get all feedback
export const getAll = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("feedback").order("desc").collect();
  },
});

// Update feedback
export const update = mutation({
  args: { id: v.id("feedback"), rating: v.number(), text: v.string() },
  handler: async (ctx, { id, rating, text }) => {
    await ctx.db.patch(id, { rating, text });
  },
});

// Delete feedback
export const deleteFeedback = mutation({
  args: { id: v.id("feedback") },
  handler: async (ctx, { id }) => {
    await ctx.db.delete(id);
  },
});