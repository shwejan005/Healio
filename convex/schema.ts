import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users : defineTable({
    name: v.string(),
    email: v.string(),
    image: v.optional(v.string()),
    clerkId: v.string(),
  }).index("by_clerk_id", ["clerkId"]),


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
})