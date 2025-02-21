import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Fetch all gratitude entries for a user
export const getEntries = query({
  args: { userId: v.string() },
  handler: async (ctx, { userId }) => {
    return await ctx.db
      .query("gratitudeEntries")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .collect();
  },
});

// Add a new gratitude entry
export const addEntry = mutation({
  args: { userId: v.string(), gratitude: v.string() },
  handler: async (ctx, { userId, gratitude }) => {
    return await ctx.db.insert("gratitudeEntries", {
      userId,
      date: new Date().toISOString(),
      gratitude,
    });
  },
});

// Delete an entry
export const deleteEntry = mutation({
  args: { entryId: v.id("gratitudeEntries") },
  handler: async (ctx, { entryId }) => {
    await ctx.db.delete(entryId);
  },
});