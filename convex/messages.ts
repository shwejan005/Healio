import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const sendMessage = mutation({
  args: { roomId: v.id("rooms"), sender: v.string(), text: v.string() },
  handler: async (ctx, { roomId, sender, text }) => {
    return await ctx.db.insert("messages", {
      roomId,
      sender,
      text,
      timestamp: Date.now(),
    });
  },
});

export const getMessages = query({
  args: { roomId: v.id("rooms") }, // Explicitly define the type
  handler: async ({ db }, { roomId }) => {
    return await db
      .query("messages")
      .withIndex("by_room", (q) => q.eq("roomId", roomId))
      .order("desc")
      .take(50);
  },
});

