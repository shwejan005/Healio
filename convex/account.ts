import { query } from "./_generated/server"
import { v } from "convex/values"
import type { Id } from "./_generated/dataModel"

// Define TypeScript interfaces for our return types
interface MoodStats {
  averageMood: number
  averageSleep: number
  averageAnxiety: number
  averageStress: number
  moodTrend: Array<{ date: string; mood: number }>
  commonActivities: Array<{ activity: string; count: number }>
}

interface GratitudeStats {
  totalEntries: number
  recentEntries: Array<{
    _id: Id<"gratitudeEntries">
    userId: string
    date: string
    gratitude: string
  }>
}

interface ForumActivity {
  type: "post" | "comment"
  title?: string
  content?: string
  date: string
  id: Id<"forums"> | Id<"forumComments">
}

interface ForumStats {
  totalPosts: number
  totalComments: number
  recentActivity: ForumActivity[]
}

interface GoalsStats {
  totalGoals: number
  completedGoals: number
  completionRate: number
  activeGoals: Array<{
    _id: Id<"goals">
    userId: string
    title: string
    completed: boolean
    createdAt: number
  }>
}

interface WorkoutType {
  type: string
  count: number
  percentage: number
}

interface FitnessStats {
  totalWorkouts: number
  totalDuration: number
  totalCaloriesBurned: number
  workoutTypes: WorkoutType[]
  recentWorkouts: Array<{
    _id: Id<"fitnessLogs">
    userId: string
    workoutType: string
    duration: number
    caloriesBurned: number
    _creationTime?: number
  }>
}

interface UserAnalytics {
  user: {
    _id: Id<"users">
    name: string
    email: string
    image?: string
    clerkId: string
  } | null
  moodStats: MoodStats
  gratitudeStats: GratitudeStats
  forumStats: ForumStats
  goalsStats: GoalsStats
  fitnessStats: FitnessStats
}

// Get basic user information
export const getUser = query({
  args: { userId: v.string() },
  handler: async (
    ctx,
    args,
  ): Promise<{
    _id: Id<"users">
    name: string
    email: string
    image?: string
    clerkId: string
  } | null> => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.userId))
      .first()

    return user
  },
})

// Get user mood statistics
export const getMoodStats = query({
  args: { userId: v.string() },
  handler: async (ctx, args): Promise<MoodStats> => {
    const moodEntries = await ctx.db
      .query("moodEntries")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect()

    if (moodEntries.length === 0) {
      return {
        averageMood: 0,
        averageSleep: 0,
        averageAnxiety: 0,
        averageStress: 0,
        moodTrend: [],
        commonActivities: [],
      }
    }

    // Calculate averages
    const averageMood = moodEntries.reduce((sum, entry) => sum + entry.mood, 0) / moodEntries.length
    const averageSleep = moodEntries.reduce((sum, entry) => sum + entry.sleep.hours, 0) / moodEntries.length
    const averageAnxiety = moodEntries.reduce((sum, entry) => sum + entry.anxiety, 0) / moodEntries.length
    const averageStress = moodEntries.reduce((sum, entry) => sum + entry.stress, 0) / moodEntries.length

    // Get mood trend (last 7 entries)
    const sortedEntries = [...moodEntries].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    const moodTrend = sortedEntries
      .slice(0, 7)
      .map((entry) => ({
        date: entry.date,
        mood: entry.mood,
      }))
      .reverse()

    // Find most common activities
    const activityCount: Record<string, number> = {}
    moodEntries.forEach((entry) => {
      entry.activities.forEach((activity) => {
        activityCount[activity] = (activityCount[activity] || 0) + 1
      })
    })

    const commonActivities = Object.entries(activityCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([activity, count]) => ({ activity, count }))

    return {
      averageMood,
      averageSleep,
      averageAnxiety,
      averageStress,
      moodTrend,
      commonActivities,
    }
  },
})

// Get gratitude statistics
export const getGratitudeStats = query({
  args: { userId: v.string() },
  handler: async (ctx, args): Promise<GratitudeStats> => {
    const gratitudeEntries = await ctx.db
      .query("gratitudeEntries")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect()

    return {
      totalEntries: gratitudeEntries.length,
      recentEntries: gratitudeEntries
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 5),
    }
  },
})

// Get forum activity statistics
export const getForumStats = query({
  args: { userId: v.string() },
  handler: async (ctx, args): Promise<ForumStats> => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.userId))
      .first()

    if (!user) {
      return {
        totalPosts: 0,
        totalComments: 0,
        recentActivity: [],
      }
    }

    const userId = user._id

    const posts = await ctx.db
      .query("forums")
      .withIndex("by_author", (q) => q.eq("authorId", userId))
      .collect()

    const comments = await ctx.db
      .query("forumComments")
      .withIndex("by_author", (q) => q.eq("authorId", userId))
      .collect()

    // Combine and sort recent activity
    const recentActivity: ForumActivity[] = [
      ...posts.map((post) => ({
        type: "post" as const,
        title: post.title,
        date: new Date(post.createdAt).toISOString(),
        id: post._id,
      })),
      ...comments.map((comment) => ({
        type: "comment" as const,
        content: comment.content.substring(0, 50) + (comment.content.length > 50 ? "..." : ""),
        date: new Date(comment.createdAt).toISOString(),
        id: comment._id,
      })),
    ]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5)

    return {
      totalPosts: posts.length,
      totalComments: comments.length,
      recentActivity,
    }
  },
})

// Get goals statistics
export const getGoalsStats = query({
  args: { userId: v.string() },
  handler: async (ctx, args): Promise<GoalsStats> => {
    const goals = await ctx.db
      .query("goals")
      .withIndex("byUserId", (q) => q.eq("userId", args.userId))
      .collect()

    const completedGoals = goals.filter((goal) => goal.completed)

    return {
      totalGoals: goals.length,
      completedGoals: completedGoals.length,
      completionRate: goals.length > 0 ? (completedGoals.length / goals.length) * 100 : 0,
      activeGoals: goals.filter((goal) => !goal.completed).sort((a, b) => b.createdAt - a.createdAt),
    }
  },
})

// Get fitness statistics
export const getFitnessStats = query({
  args: { userId: v.string() },
  handler: async (ctx, args): Promise<FitnessStats> => {
    const fitnessLogs = await ctx.db
      .query("fitnessLogs")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect()

    if (fitnessLogs.length === 0) {
      return {
        totalWorkouts: 0,
        totalDuration: 0,
        totalCaloriesBurned: 0,
        workoutTypes: [],
        recentWorkouts: [],
      }
    }

    // Calculate totals
    const totalWorkouts = fitnessLogs.length
    const totalDuration = fitnessLogs.reduce((sum, log) => sum + log.duration, 0)
    const totalCaloriesBurned = fitnessLogs.reduce((sum, log) => sum + log.caloriesBurned, 0)

    // Get workout type distribution
    const workoutTypeCount: Record<string, number> = {}
    fitnessLogs.forEach((log) => {
      workoutTypeCount[log.workoutType] = (workoutTypeCount[log.workoutType] || 0) + 1
    })

    const workoutTypes = Object.entries(workoutTypeCount)
      .map(([type, count]) => ({
        type,
        count,
        percentage: (count / totalWorkouts) * 100,
      }))
      .sort((a, b) => b.count - a.count)

    // Get recent workouts
    const recentWorkouts = [...fitnessLogs]
      .sort((a, b) => {
        // Sort by _creationTime if available, otherwise use a fallback
        const aTime = a._creationTime ? a._creationTime : 0
        const bTime = b._creationTime ? b._creationTime : 0
        return bTime - aTime
      })
      .slice(0, 5)

    return {
      totalWorkouts,
      totalDuration,
      totalCaloriesBurned,
      workoutTypes,
      recentWorkouts,
    }
  },
})

// Get comprehensive user analytics
export const getUserAnalytics = query({
  args: { userId: v.string() },
  handler: async (ctx, args): Promise<UserAnalytics> => {
    // Get user data
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.userId))
      .first();
    
    // We need to run each query separately instead of using ctx.runQuery with the function reference
    // Get mood statistics
    const moodEntries = await ctx.db
      .query("moodEntries")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();
    
    let moodStats: MoodStats;
    if (moodEntries.length === 0) {
      moodStats = {
        averageMood: 0,
        averageSleep: 0,
        averageAnxiety: 0,
        averageStress: 0,
        moodTrend: [],
        commonActivities: [],
      };
    } else {
      // Calculate averages
      const averageMood = moodEntries.reduce((sum, entry) => sum + entry.mood, 0) / moodEntries.length;
      const averageSleep = moodEntries.reduce((sum, entry) => sum + entry.sleep.hours, 0) / moodEntries.length;
      const averageAnxiety = moodEntries.reduce((sum, entry) => sum + entry.anxiety, 0) / moodEntries.length;
      const averageStress = moodEntries.reduce((sum, entry) => sum + entry.stress, 0) / moodEntries.length;
      
      // Get mood trend (last 7 entries)
      const sortedEntries = [...moodEntries].sort((a, b) => 
        new Date(b.date).getTime() - new Date(a.date).getTime()
      );
      const moodTrend = sortedEntries.slice(0, 7).map(entry => ({
        date: entry.date,
        mood: entry.mood
      })).reverse();
      
      // Find most common activities
      const activityCount: Record<string, number> = {};
      moodEntries.forEach(entry => {
        entry.activities.forEach(activity => {
          activityCount[activity] = (activityCount[activity] || 0) + 1;
        });
      });
      
      const commonActivities = Object.entries(activityCount)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([activity, count]) => ({ activity, count }));
      
      moodStats = {
        averageMood,
        averageSleep,
        averageAnxiety,
        averageStress,
        moodTrend,
        commonActivities,
      };
    }
    
    // Get gratitude statistics
    const gratitudeEntries = await ctx.db
      .query("gratitudeEntries")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();
    
    const gratitudeStats: GratitudeStats = {
      totalEntries: gratitudeEntries.length,
      recentEntries: gratitudeEntries
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 5),
    };
    
    // Get forum statistics
    let forumStats: ForumStats;
    if (!user) {
      forumStats = {
        totalPosts: 0,
        totalComments: 0,
        recentActivity: [],
      };
    } else {
      const userId = user._id;
      
      const posts = await ctx.db
        .query("forums")
        .withIndex("by_author", (q) => q.eq("authorId", userId))
        .collect();
      
      const comments = await ctx.db
        .query("forumComments")
        .withIndex("by_author", (q) => q.eq("authorId", userId))
        .collect();
      
      // Combine and sort recent activity
      const recentActivity: ForumActivity[] = [
        ...posts.map(post => ({ 
          type: 'post' as const, 
          title: post.title, 
          date: new Date(post.createdAt).toISOString(),
          id: post._id
        })),
        ...comments.map(comment => ({ 
          type: 'comment' as const, 
          content: comment.content.substring(0, 50) + (comment.content.length > 50 ? '...' : ''),
          date: new Date(comment.createdAt).toISOString(),
          id: comment._id
        }))
      ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
       .slice(0, 5);
      
      forumStats = {
        totalPosts: posts.length,
        totalComments: comments.length,
        recentActivity,
      };
    }
    
    // Get goals statistics
    const goals = await ctx.db
      .query("goals")
      .withIndex("byUserId", (q) => q.eq("userId", args.userId))
      .collect();
    
    const completedGoals = goals.filter(goal => goal.completed);
    
    const goalsStats: GoalsStats = {
      totalGoals: goals.length,
      completedGoals: completedGoals.length,
      completionRate: goals.length > 0 ? (completedGoals.length / goals.length) * 100 : 0,
      activeGoals: goals.filter(goal => !goal.completed)
        .sort((a, b) => b.createdAt - a.createdAt),
    };
    
    // Get fitness statistics
    const fitnessLogs = await ctx.db
      .query("fitnessLogs")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();
    
    let fitnessStats: FitnessStats;
    if (fitnessLogs.length === 0) {
      fitnessStats = {
        totalWorkouts: 0,
        totalDuration: 0,
        totalCaloriesBurned: 0,
        workoutTypes: [],
        recentWorkouts: [],
      };
    } else {
      // Calculate totals
      const totalWorkouts = fitnessLogs.length;
      const totalDuration = fitnessLogs.reduce((sum, log) => sum + log.duration, 0);
      const totalCaloriesBurned = fitnessLogs.reduce((sum, log) => sum + log.caloriesBurned, 0);
      
      // Get workout type distribution
      const workoutTypeCount: Record<string, number> = {};
      fitnessLogs.forEach(log => {
        workoutTypeCount[log.workoutType] = (workoutTypeCount[log.workoutType] || 0) + 1;
      });
      
      const workoutTypes = Object.entries(workoutTypeCount)
        .map(([type, count]) => ({ 
          type, 
          count, 
          percentage: (count / totalWorkouts) * 100 
        }))
        .sort((a, b) => b.count - a.count);
      
      // Get recent workouts
      const recentWorkouts = [...fitnessLogs]
        .sort((a, b) => {
          // Sort by _creationTime if available, otherwise use a fallback
          const aTime = a._creationTime ? a._creationTime : 0;
          const bTime = b._creationTime ? b._creationTime : 0;
          return bTime - aTime;
        })
        .slice(0, 5);
      
      fitnessStats = {
        totalWorkouts,
        totalDuration,
        totalCaloriesBurned,
        workoutTypes,
        recentWorkouts,
      };
    }
    
    return {
      user,
      moodStats,
      gratitudeStats,
      forumStats,
      goalsStats,
      fitnessStats,
    };
  },
});
