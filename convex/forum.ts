import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { mustGetCurrentUser } from "./users";

export const create = mutation({
  args: {
    title: v.string(),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await mustGetCurrentUser(ctx);
    return await ctx.db.insert("forums", {
      title: args.title,
      content: args.content,
      authorId: user._id,
      votes: {},
      createdAt: Date.now(),
    });
  },
});

export const getForums = query({
  handler: async (ctx) => {
    const forums = await ctx.db.query("forums").order("desc").take(100);
    
    return Promise.all(forums.map(async (forum) => {
      const author = await ctx.db.get(forum.authorId);
      const comments = await ctx.db
        .query("forumComments")
        .withIndex("by_forum", q => q.eq("forumId", forum._id))
        .collect();

      const commentsWithAuthors = await Promise.all(comments.map(async comment => ({
        ...comment,
        author: await ctx.db.get(comment.authorId),
      })));

      const voteValues = Object.values(forum.votes || {});
      const voteCount = voteValues.reduce((acc, val) => ({
        upvotes: acc.upvotes + (val === 1 ? 1 : 0),
        dislikes: acc.dislikes + (val === -1 ? 1 : 0)
      }), { upvotes: 0, dislikes: 0 });

      return {
        ...forum,
        author,
        comments: commentsWithAuthors,
        ...voteCount
      };
    }));
  },
});

export const vote = mutation({
  args: {
    forumId: v.id("forums"),
    vote: v.union(v.literal(1), v.literal(-1), v.literal(0)),
  },
  handler: async (ctx, args) => {
    const user = await mustGetCurrentUser(ctx);
    const forum = await ctx.db.get(args.forumId);
    if (!forum) throw new Error("Forum not found");

    const newVotes = { ...forum.votes };
    if (args.vote === 0) {
      delete newVotes[user._id];
    } else {
      newVotes[user._id] = args.vote;
    }

    await ctx.db.patch(forum._id, { votes: newVotes });
  },
});

// Keep other operations the same but ensure all ID types are correct

// Add comment
export const addComment = mutation({
  args: {
    forumId: v.id("forums"),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await mustGetCurrentUser(ctx);
    return await ctx.db.insert("forumComments", {
      forumId: args.forumId,
      authorId: user._id,
      content: args.content,
      createdAt: Date.now(),
    });
  },
});

// Delete forum post (author only)
export const removeForum = mutation({
  args: {
    forumId: v.id("forums"),
  },
  handler: async (ctx, args) => {
    const user = await mustGetCurrentUser(ctx);
    const forum = await ctx.db.get(args.forumId);
    
    if (!forum || forum.authorId !== user._id) {
      throw new Error("Not authorized or forum not found");
    }

    // Delete associated comments
    const comments = await ctx.db
      .query("forumComments")
      .withIndex("by_forum", q => q.eq("forumId", args.forumId))
      .collect();

    await Promise.all(comments.map(comment => 
      ctx.db.delete(comment._id)
    ));

    return ctx.db.delete(args.forumId);
  },
});