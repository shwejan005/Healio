"use client"

import { useState, useEffect, useCallback } from "react"
import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import { useUser } from "@clerk/clerk-react"
import { Card, CardContent } from "@/components/ui/card"
import { motion } from "framer-motion"
import { Skeleton } from "@/components/ui/skeleton"

const GEMINI_API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY

async function fetchGeminiResponse(sleepDebt: number) {
  if (!GEMINI_API_KEY) {
    console.error("Gemini API key is missing")
    return null
  }

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [
                {
                  text: `I have accumulated ${sleepDebt} hours of sleep debt over the last 7 days. Give me actionable tips to improve my sleep.`,
                },
              ],
            },
          ],
        }),
      }
    )

    const data = await response.json()
    return data.candidates?.[0]?.content?.parts?.[0]?.text || "No response received."
  } catch (error) {
    console.error("Error fetching sleep suggestions from Gemini:", error)
    return "Failed to generate suggestions."
  }
}

export default function SleepPage() {
  const { user } = useUser()
  const [suggestions, setSuggestions] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  // Fetch sleep debt data
  const sleepDebt = useQuery(api.moodEntries.getSleepDebt, user ? { userId: user.id } : "skip")

  // Fetch suggestions directly from Gemini
  const fetchSuggestions = useCallback(async () => {
    if (!sleepDebt || !user) return

    setLoading(true)
    const response = await fetchGeminiResponse(sleepDebt.totalSleepDebt)
    setSuggestions(response)
    setLoading(false)
  }, [sleepDebt, user])

  useEffect(() => {
    if (sleepDebt && !suggestions) {
      fetchSuggestions()
    }
  }, [sleepDebt, suggestions, fetchSuggestions])

  return (
    <div className="min-h-screen p-4 pt-12 flex flex-col items-center justify-center">
      <motion.div className="relative z-10 w-full max-w-4xl space-y-8">
        <motion.div initial={{ scale: 0.5, opacity: 0, rotate: -5 }} animate={{ scale: 1, opacity: 1, rotate: 0 }}>
          <Card className="transition-transform duration-300 hover:scale-[1.02] bg-white/80 backdrop-blur-xl border-0 shadow-lg">
            <CardContent className="p-8 text-[#2e7d32]">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center space-y-4">
                <div className="flex items-center gap-3 mb-4">
                  <motion.span animate={{ rotate: [0, 15, -15, 0] }} transition={{ repeat: Number.POSITIVE_INFINITY, duration: 4 }} className="text-4xl">
                    😴
                  </motion.span>
                  <h1 className="text-3xl font-bold tracking-wider">Sleep Debt Tracker</h1>
                </div>

                {sleepDebt ? (
                  <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="text-center">
                    <p className="text-xl font-medium mb-2">Over the last 7 days, you&apos;ve accumulated</p>
                    <div className="flex justify-center items-baseline gap-2">
                      <motion.span className="text-6xl font-black px-6 py-3 rounded-2xl">
                        {sleepDebt.totalSleepDebt}
                      </motion.span>
                      <span className="text-3xl">hours</span>
                    </div>
                    <p className="mt-4 text-lg opacity-90">of sleep debt 🌙</p>
                  </motion.div>
                ) : (
                  <div className="space-y-4 w-full">
                    <Skeleton className="h-8 w-3/4 mx-auto" />
                    <Skeleton className="h-12 w-1/2 mx-auto" />
                    <Skeleton className="h-6 w-1/3 mx-auto" />
                  </div>
                )}

                {/* Show loading state for suggestions */}
                {loading ? (
                  <div className="space-y-4 w-full">
                    <Skeleton className="h-6 w-3/4 mx-auto" />
                    <Skeleton className="h-6 w-1/2 mx-auto" />
                    <Skeleton className="h-6 w-1/3 mx-auto" />
                  </div>
                ) : suggestions ? (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-6">
                    <h2 className="text-xl font-semibold mb-2 text-[#2e7d32]">Sleep Improvement Tips:</h2>
                    <div>{parseAndStyleMessage(suggestions)}</div>
                  </motion.div>
                ) : null}
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  )
}

function parseAndStyleMessage(content: string) {
  const lines = content.split("\n")
  let inList = false

  return lines.map((line: string, index: number) => {
    if (line.startsWith("**") && line.endsWith("**")) {
      return (
        <h2 key={index} className="text-xl font-bold mt-4 mb-2 text-[#314328]">
          {line.replace(/\*\*/g, "")}
        </h2>
      )
    } else if (line.trim().startsWith("*")) {
      if (!inList) {
        inList = true
        return (
          <ul key={index} className="list-disc pl-5 mb-2">
            <li>{parseBoldText(line.trim().substring(1).trim())}</li>
          </ul>
        )
      } else {
        return <li key={index}>{parseBoldText(line.trim().substring(1).trim())}</li>
      }
    } else {
      inList = false
      return (
        <p key={index} className="mb-2">
          {parseBoldText(line)}
        </p>
      )
    }
  })
}

function parseBoldText(text: string) {
  const parts = text.split(/(\*\*.*?\*\*)/)
  return parts.map((part: string, index: number) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={index}>{part.slice(2, -2)}</strong>
    }
    return part
  })
}