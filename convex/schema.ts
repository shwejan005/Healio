import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    name: v.string(),
    email: v.string(),
    image: v.optional(v.string()),
    clerkId: v.string(),
    isPremium: v.optional(v.boolean()),
  }).index("by_clerk_id", ["clerkId"]).index("by_email", ["email"]),

  moodEntries: defineTable({
    userId: v.string(),
    date: v.string(),
    mood: v.number(),
    sleep: v.object({ hours: v.number(), quality: v.number() }),
    anxiety: v.number(),
    stress: v.number(),
    activities: v.array(v.string()),
    note: v.optional(v.string()),
  }).index("by_user", ["userId"]),

  gratitudeEntries: defineTable({
    userId: v.string(),
    date: v.string(),
    gratitude: v.string(),
  }).index("by_user", ["userId"]),

  forums: defineTable({
    title: v.string(),
    content: v.string(),
    authorId: v.id("users"),
    votes: v.optional(v.record(v.string(), v.number())),
    createdAt: v.number(),
  })
    .index("by_author", ["authorId"])
    .index("by_created", ["createdAt"]),

  forumComments: defineTable({
    forumId: v.id("forums"),
    authorId: v.id("users"),
    content: v.string(),
    createdAt: v.number(),
  })
    .index("by_forum", ["forumId"])
    .index("by_author", ["authorId"]),

  goals: defineTable({
    userId: v.string(),
    title: v.string(),
    completed: v.boolean(),
    createdAt: v.number(),
    category: v.optional(v.string()), // "mindfulness", "physical", "habits", "growth"
    priority: v.optional(v.string()), // "high", "medium", "low"
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
    streak: v.optional(v.number()),
  }).index("byUserId", ["userId"]),

  rooms: defineTable({
    name: v.string(),
    maxUsers: v.number(),
    currentUsers: v.number(),
    activeUsers: v.array(v.string()),
    description: v.optional(v.string()),
    category: v.optional(v.string()),
    topic: v.optional(v.string()),
  }).index("by_name", ["name"]),

  messages: defineTable({
    roomId: v.id("rooms"),
    sender: v.string(),
    text: v.string(),
    timestamp: v.number(),
    avatarAlias: v.optional(v.string()),
    reactions: v.optional(v.record(v.string(), v.number())),
  }).index("by_room", ["roomId"]),

  feedback: defineTable({
    rating: v.number(),
    text: v.string(),
    createdAt: v.number(),
  }),

  fitnessLogs: defineTable({
    userId: v.string(),
    workoutType: v.string(),
    duration: v.number(), // In minutes
    caloriesBurned: v.number(),
    intensity: v.optional(v.string()), // "low", "moderate", "vigorous"
    date: v.optional(v.string()),
    notes: v.optional(v.string()),
  }).index("by_user", ["userId"]),
});