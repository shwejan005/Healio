import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const sendMessage = mutation({
  args: {
    roomId: v.id("rooms"),
    sender: v.string(),
    text: v.string(),
    avatarAlias: v.optional(v.string()),
  },
  handler: async (ctx, { roomId, sender, text, avatarAlias }) => {
    return await ctx.db.insert("messages", {
      roomId,
      sender,
      text,
      avatarAlias: avatarAlias || "Panda",
      timestamp: Date.now(),
      reactions: {},
    });
  },
});

export const getMessages = query({
  args: { roomId: v.id("rooms") },
  handler: async ({ db }, { roomId }) => {
    return await db
      .query("messages")
      .withIndex("by_room", (q) => q.eq("roomId", roomId))
      .order("asc")
      .take(100);
  },
});

export const addReaction = mutation({
  args: { messageId: v.id("messages"), reaction: v.string() },
  handler: async (ctx, { messageId, reaction }) => {
    const msg = await ctx.db.get(messageId);
    if (!msg) return;

    const currentReactions = msg.reactions || {};
    const currentCount = currentReactions[reaction] || 0;

    await ctx.db.patch(messageId, {
      reactions: {
        ...currentReactions,
        [reaction]: currentCount + 1,
      },
    });
  },
});
