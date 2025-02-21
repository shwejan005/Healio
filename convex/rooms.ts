import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const createRoom = mutation({
  args: { name: v.string(), maxUsers: v.number() },
  handler: async (ctx, { name, maxUsers }) => {
    return await ctx.db.insert("rooms", {
      name,
      maxUsers,
      currentUsers: 0,
      activeUsers: [],
    });
  },
});

export const getRooms = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("rooms").collect();
  },
});

export const joinRoom = mutation({
  args: { roomId: v.id("rooms"), username: v.string() },
  handler: async (ctx, { roomId, username }) => {
    const room = await ctx.db.get(roomId);
    if (!room) throw new Error("Room not found");

    if (room.currentUsers < room.maxUsers) {
      return await ctx.db.patch(roomId, {
        currentUsers: room.currentUsers + 1,
        activeUsers: [...room.activeUsers, username],
      });
    } else {
      throw new Error("Room is full");
    }
  },
});

export const leaveRoom = mutation({
  args: { roomId: v.id("rooms"), username: v.string() },
  handler: async (ctx, { roomId, username }) => {
    const room = await ctx.db.get(roomId);
    if (!room) throw new Error("Room not found");

    return await ctx.db.patch(roomId, {
      currentUsers: room.currentUsers - 1,
      activeUsers: room.activeUsers.filter((user) => user !== username),
    });
  },
});