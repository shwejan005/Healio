import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const createRoom = mutation({
  args: {
    name: v.string(),
    maxUsers: v.number(),
    description: v.optional(v.string()),
    category: v.optional(v.string()),
  },
  handler: async (ctx, { name, maxUsers, description, category }) => {
    return await ctx.db.insert("rooms", {
      name,
      maxUsers,
      currentUsers: 0,
      activeUsers: [],
      description: description || "Peer support space",
      category: category || "general",
    });
  },
});

export const getRooms = query({
  args: {},
  handler: async (ctx) => {
    const existing = await ctx.db.query("rooms").collect();
    return existing;
  },
});

// Seed default rooms if empty
export const seedDefaultRooms = mutation({
  args: {},
  handler: async (ctx) => {
    const existing = await ctx.db.query("rooms").collect();
    if (existing.length === 0) {
      const defaultChannels = [
        { name: "Anxiety & Calm Support", maxUsers: 20, description: "Safe space to share anxiety coping strategies & calm reassurance.", category: "anxiety" },
        { name: "Mindfulness & Gratitude", maxUsers: 25, description: "Daily positive reflection, breathing, and present moments.", category: "mindfulness" },
        { name: "Burnout & Work Balance", maxUsers: 20, description: "Navigating stress, workload boundaries, and fatigue.", category: "burnout" },
        { name: "Daily Small Victories", maxUsers: 30, description: "Celebrate wins, big or small, in a judgment-free circle.", category: "victories" },
      ];

      for (const ch of defaultChannels) {
        await ctx.db.insert("rooms", {
          name: ch.name,
          maxUsers: ch.maxUsers,
          currentUsers: 0,
          activeUsers: [],
          description: ch.description,
          category: ch.category,
        });
      }
    }
  },
});

export const joinRoom = mutation({
  args: { roomId: v.id("rooms"), username: v.string() },
  handler: async (ctx, { roomId, username }) => {
    const room = await ctx.db.get(roomId);
    if (!room) throw new Error("Room not found");

    if (!room.activeUsers.includes(username)) {
      await ctx.db.patch(roomId, {
        currentUsers: room.currentUsers + 1,
        activeUsers: [...room.activeUsers, username],
      });
    }
  },
});

export const leaveRoom = mutation({
  args: { roomId: v.id("rooms"), username: v.string() },
  handler: async (ctx, { roomId, username }) => {
    const room = await ctx.db.get(roomId);
    if (!room) throw new Error("Room not found");

    await ctx.db.patch(roomId, {
      currentUsers: Math.max(0, room.currentUsers - 1),
      activeUsers: room.activeUsers.filter((user) => user !== username),
    });
  },
});