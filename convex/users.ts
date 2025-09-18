import { v } from "convex/values"
import { mutation, MutationCtx, query, QueryCtx } from "./_generated/server"

export const syncUser = mutation({
  args: {
    clerkId: v.string(),
    email: v.string(),
    name: v.string(),
    image: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .first()
 
    if (existingUser) {
      const patchData: {
        email: string;
        name: string;
        image?: string;
        isPremium?: boolean;
      } = {
        email: args.email,
        name: args.name,
        image: args.image,
      };

      if (existingUser.isPremium === undefined) {
        patchData.isPremium = false;
      }

      return await ctx.db.patch(existingUser._id, patchData);
    }

    return await ctx.db.insert("users", {
      clerkId: args.clerkId,
      email: args.email,
      name: args.name,
      image: args.image,
      isPremium: false,
    })
  },
})

export const getUser = query({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .first()

    return user
  },
})

export const mustGetCurrentUser = async (ctx: QueryCtx | MutationCtx) => {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) throw new Error("Not authenticated");
  
  const user = await ctx.db
    .query("users")
    .withIndex("by_clerk_id", q => q.eq("clerkId", identity.subject))
    .unique();

  if (!user) throw new Error("User not found");
  return user;
};

export const makeUserPremium = mutation({
   args: { email: v.string() },
   handler: async (ctx, args) => {
     const user = await ctx.db
       .query("users")
       .withIndex("by_email", (q) => q.eq("email", args.email
  ))
       .first();
 
     if (!user) {
       throw new Error("User not found");
     }
 
     await ctx.db.patch(user._id, {
       isPremium: true,
     });
   },
 });