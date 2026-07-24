import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { ConvexHttpClient } from "convex/browser"
import { api } from "@/convex/_generated/api"
import { embedDocumentBatch } from "@/lib/embeddings"
import {
  ensureCollections,
  upsertPoints,
  deleteByUserId,
  USER_DATA_COLLECTION,
} from "@/lib/qdrant"
import { createHash } from "crypto"

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!)

/**
 * Generate a deterministic ID for a user data point.
 * Ensures idempotent upserts without duplicates.
 */
function makePointId(userId: string, dataType: string, index: number): string {
  const hash = createHash("sha256")
    .update(`${userId}:${dataType}:${index}`)
    .digest("hex")
    .slice(0, 32)
  // Convert to UUID-like format for Qdrant compatibility
  return `${hash.slice(0, 8)}-${hash.slice(8, 12)}-${hash.slice(12, 16)}-${hash.slice(16, 20)}-${hash.slice(20, 32)}`
}

/**
 * Convert user data entries into natural language text descriptions
 * suitable for embedding and semantic retrieval.
 */
function convertUserDataToTexts(analytics: {
  user: { name: string } | null
  moodStats: {
    averageMood: number
    averageSleep: number
    averageAnxiety: number
    averageStress: number
    moodTrend: Array<{ date: string; mood: number }>
    commonActivities: Array<{ activity: string; count: number }>
  }
  gratitudeStats: {
    totalEntries: number
    recentEntries: Array<{ date: string; gratitude: string }>
  }
  goalsStats: {
    totalGoals: number
    completedGoals: number
    completionRate: number
    activeGoals: Array<{ title: string; completed: boolean }>
  }
  fitnessStats: {
    totalWorkouts: number
    totalDuration: number
    totalCaloriesBurned: number
    workoutTypes: Array<{ type: string; count: number; percentage: number }>
    recentWorkouts: Array<{
      workoutType: string
      duration: number
      caloriesBurned: number
    }>
  }
}): Array<{ text: string; dataType: string }> {
  const entries: Array<{ text: string; dataType: string }> = []
  const userName = analytics.user?.name || "User"

  // Mood trend entries — one per data point for granular retrieval
  const mood = analytics.moodStats
  if (mood.moodTrend.length > 0) {
    // Overall mood summary
    entries.push({
      text: `${userName}'s overall mental wellness summary: Average mood is ${mood.averageMood.toFixed(1)}/10, average sleep is ${mood.averageSleep.toFixed(1)} hours per night, anxiety level averages ${mood.averageAnxiety.toFixed(1)}/10, and stress level averages ${mood.averageStress.toFixed(1)}/10. Most common activities include ${mood.commonActivities.map((a) => a.activity).join(", ") || "none recorded"}.`,
      dataType: "mood_summary",
    })

    // Individual mood trend entries
    mood.moodTrend.forEach((entry) => {
      entries.push({
        text: `${userName}'s mood check-in on ${entry.date}: Mood was ${entry.mood}/10.`,
        dataType: "mood_entry",
      })
    })
  }

  // Gratitude entries — each one separately for precise retrieval
  const gratitude = analytics.gratitudeStats
  if (gratitude.recentEntries.length > 0) {
    gratitude.recentEntries.forEach((entry) => {
      entries.push({
        text: `${userName}'s gratitude journal entry on ${entry.date}: "${entry.gratitude}"`,
        dataType: "gratitude",
      })
    })
  }

  // Goals — combined into a summary + individual active goals
  const goals = analytics.goalsStats
  if (goals.totalGoals > 0) {
    entries.push({
      text: `${userName}'s goals overview: ${goals.totalGoals} total goals, ${goals.completedGoals} completed (${goals.completionRate.toFixed(0)}% completion rate). Active goals: ${goals.activeGoals.map((g) => `"${g.title}"`).join(", ") || "all goals completed"}.`,
      dataType: "goals",
    })
  }

  // Fitness — summary + recent workouts
  const fitness = analytics.fitnessStats
  if (fitness.totalWorkouts > 0) {
    entries.push({
      text: `${userName}'s fitness activity summary: ${fitness.totalWorkouts} total workouts, ${fitness.totalDuration} minutes of exercise, ${fitness.totalCaloriesBurned} calories burned. Workout types: ${fitness.workoutTypes.map((w) => `${w.type} (${w.count} sessions)`).join(", ")}.`,
      dataType: "fitness_summary",
    })

    fitness.recentWorkouts.forEach((workout) => {
      entries.push({
        text: `${userName} completed a ${workout.workoutType} workout lasting ${workout.duration} minutes, burning ${workout.caloriesBurned} calories.`,
        dataType: "fitness_entry",
      })
    })
  }

  return entries
}

/**
 * POST /api/rag/sync
 * Syncs the authenticated user's data from Convex into Qdrant for RAG retrieval.
 * Deletes stale data first, then batch-embeds and upserts fresh data.
 */
export async function POST() {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Ensure collections exist
    await ensureCollections()

    // Fetch user analytics from Convex
    const analytics = await convex.query(api.account.getUserAnalytics, {
      userId,
    })

    // Convert to text descriptions
    const dataEntries = convertUserDataToTexts(analytics)

    if (dataEntries.length === 0) {
      return NextResponse.json({
        synced: true,
        count: 0,
        message: "No user data to sync",
      })
    }

    // Delete stale data for this user
    await deleteByUserId(USER_DATA_COLLECTION, userId)

    // Batch embed all text descriptions
    const texts = dataEntries.map((e) => e.text)
    const embeddings = await embedDocumentBatch(texts)

    // Build Qdrant points
    const points = dataEntries.map((entry, i) => ({
      id: makePointId(userId, entry.dataType, i),
      vector: embeddings[i],
      payload: {
        userId,
        text: entry.text,
        dataType: entry.dataType,
        syncedAt: new Date().toISOString(),
      },
    }))

    // Upsert into Qdrant
    await upsertPoints(USER_DATA_COLLECTION, points)

    console.log(`Synced ${points.length} data points for user ${userId}`)

    return NextResponse.json({
      synced: true,
      count: points.length,
      message: `Synced ${points.length} data points to Qdrant`,
    })
  } catch (error) {
    console.error("Error syncing user data:", error)
    return NextResponse.json(
      { error: "Failed to sync user data", details: String(error) },
      { status: 500 }
    )
  }
}
