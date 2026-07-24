"use client"

import { useUser } from "@clerk/nextjs"
import { useQuery } from "convex/react"
import { motion } from "framer-motion"
import { Apple, Salad, Sparkles, RefreshCw } from "lucide-react"
import { useCallback, useEffect, useState } from "react"
import { api } from "@/convex/_generated/api"
import { SpotlightCard } from "@/components/reactbits/SpotlightCard"
import { SplitText } from "@/components/reactbits/SplitText"
import ReactMarkdown from "react-markdown"

export default function DietPage() {
  const { user } = useUser()
  const userId = user?.id || ""
  const [dietPlan, setDietPlan] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const moodEntries = useQuery(api.moodEntries.getMoodEntries, userId ? { userId } : "skip")
  const journalEntries = useQuery(api.journals.getEntries, userId ? { userId } : "skip")
  const fitnessLogs = useQuery(api.fitnessLogs.getFitnessLogs, userId ? { userId } : "skip")

  const calculateAverage = (arr: number[] | undefined) =>
    arr?.length ? (arr.reduce((a, b) => a + b, 0) / arr.length).toFixed(1) : "N/A"

  const getMostCommon = (items: string[] = []) => {
    const counts = items.reduce((acc: Record<string, number>, item) => {
      acc[item] = (acc[item] || 0) + 1
      return acc
    }, {})
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([item]) => item)
      .join(", ") || "None"
  }

  const generateDietPlan = useCallback(async () => {
    if (!userId) return

    setIsLoading(true)
    try {
      const moodAvg = calculateAverage(moodEntries?.map((e) => e.mood))
      const sleepAvg = calculateAverage(moodEntries?.map((e) => e.sleep?.hours))
      const activities = getMostCommon(moodEntries?.flatMap((e) => e.activities || []))
      const workoutCount = fitnessLogs?.length || 0

      const prompt = `
        Create a clean, professional, personalized daily meal plan for a person focused on mental wellness & energy based on:
        - 7-day mood average: ${moodAvg}/5
        - Common activities: ${activities}
        - Average sleep: ${sleepAvg} hours
        - Fitness workouts: ${workoutCount} logged

        Respond with:
        - Structured 1-day meal plan (Breakfast, Lunch, Dinner, Healthy Snacks)
        - High fiber & protein focus for sustained mental focus
        - Clear bullet points with bold section headings
        - Do NOT include any emojis
      `

      const geminiApiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiApiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
          }),
        }
      )

      if (!response.ok) {
        throw new Error("Gemini API request failed")
      }

      const data = await response.json()
      const generatedText =
        data.candidates?.[0]?.content?.parts?.[0]?.text || "No plan generated."

      setDietPlan(generatedText)
    } catch (error) {
      console.error("Diet generation failed:", error)
      setDietPlan("Balanced Meal Plan:\n\n**Breakfast**: Oatmeal with chia seeds and almonds.\n**Lunch**: Whole grain bowl with roasted vegetables, legumes, and greens.\n**Dinner**: Grilled protein with steamed broccoli and quinoa.\n**Snacks**: Green tea, walnuts, and fresh berries.")
    } finally {
      setIsLoading(false)
    }
  }, [userId, moodEntries, fitnessLogs])

  useEffect(() => {
    if (userId) {
      generateDietPlan()
    }
  }, [userId, generateDietPlan])

  return (
    <div className="font-montreal min-h-screen p-4 sm:p-8 max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white/80 backdrop-blur-xl border border-white/80 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="space-y-1">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#3a633a] flex items-center gap-1.5">
            <Salad className="w-4 h-4" /> Nutrition & Vitality
          </span>
          <h1 className="text-3xl font-extrabold text-[#2d4c2d]">
            <SplitText text="Personalised Diet Plan" />
          </h1>
          <p className="text-sm text-[#4a7a4a]">
            Nutritional recommendations customized for {user?.firstName || "you"} based on mood, sleep, and physical activity logs.
          </p>
        </div>

        <button
          onClick={generateDietPlan}
          disabled={isLoading}
          className="px-4 py-2.5 rounded-xl bg-[#e0f0e0] hover:bg-[#3a633a] text-[#2d4c2d] hover:text-white font-semibold text-xs transition-colors flex items-center gap-2 shadow-sm disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} /> Regenerate
        </button>
      </div>

      {/* Main Content Card */}
      <SpotlightCard className="p-6 sm:p-8 rounded-3xl bg-white/85 backdrop-blur-xl border border-white/80 shadow-xl space-y-6">
        <div className="flex items-center justify-between border-b border-[#3a633a]/15 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[#e0f0e0] text-[#3a633a]">
              <Apple className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#2d4c2d]">Personalized Meal Blueprint</h2>
              <p className="text-xs text-[#4a7a4a]">Tailored to optimize mood stability and energy</p>
            </div>
          </div>
          <span className="text-xs font-semibold text-[#3a633a] flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5" /> AI Engine
          </span>
        </div>

        {isLoading ? (
          <div className="space-y-4 animate-pulse py-8">
            <div className="h-4 bg-[#e0f0e0] rounded w-3/4" />
            <div className="h-4 bg-[#e0f0e0] rounded w-full" />
            <div className="h-4 bg-[#e0f0e0] rounded w-5/6" />
          </div>
        ) : dietPlan ? (
          <div className="prose prose-sm max-w-none text-[#2d4c2d] leading-relaxed">
            <ReactMarkdown>{dietPlan}</ReactMarkdown>
          </div>
        ) : (
          <div className="text-center py-12 text-[#4a7a4a]">
            <p>Click &quot;Regenerate&quot; to formulate your custom diet recommendations.</p>
          </div>
        )}
      </SpotlightCard>
    </div>
  )
}