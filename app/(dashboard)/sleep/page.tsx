"use client"
import { useState, useEffect, useCallback } from "react"
import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import { useUser } from "@clerk/clerk-react"
import { Card, CardContent } from "@/components/ui/card"
import { motion } from "framer-motion"
import { Skeleton } from "@/components/ui/skeleton"

function parseAndStyleMessage(content: string) {
  const lines = content.split("\n")
  let currentHeading = ""
  let inList = false

  return lines.map((line: string, index: number) => {
    if (line.startsWith("**") && line.endsWith("**")) {
      currentHeading = line.replace(/\*\*/g, "")
      return (
        <h2 key={index} className="text-xl font-bold mt-4 mb-2 text-[#2e7d32]">
          {currentHeading}
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

export default function SleepPage() {
  const { user } = useUser()
  const [suggestions, setSuggestions] = useState<string | null>(null)
  const [loading, setLoading] = useState(false) // Renamed for clarity

  // Fetch sleep debt data
  const sleepDebt = useQuery(api.moodEntries.getSleepDebt, user ? { userId: user.id } : "skip")

  // Fetch personalized sleep improvement suggestions
  const fetchSuggestions = useCallback(async () => {
    if (!sleepDebt || !user) return

    setLoading(true) // Use this to show a loading state
    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: [
            {
              role: "user",
              content: `I have accumulated ${sleepDebt.totalSleepDebt} hours of sleep debt over the last 7 days. Give me actionable tips to improve my sleep.`,
            },
          ],
          contextData: {
            sleepDebtHours: sleepDebt.totalSleepDebt,
            timeframe: "last 7 days",
          },
        }),
      })

      const data = await response.json()
      if (data.text) {
        setSuggestions(data.text)
      }
    } catch (error) {
      console.error("Error fetching sleep suggestions:", error)
    } finally {
      setLoading(false) // Reset loading state
    }
  }, [sleepDebt, user])

  // Fetch suggestions when sleep debt data is available
  useEffect(() => {
    if (sleepDebt && !suggestions) {
      fetchSuggestions()
    }
  }, [sleepDebt, suggestions, fetchSuggestions])

  return (
    <div className="min-h-screen p-4 pt-12 flex flex-col items-center justify-center">
      <motion.div className="absolute inset-0 pointer-events-none" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute bg-white/10 rounded-full"
            style={{
              width: Math.random() * 30 + 10,
              height: Math.random() * 30 + 10,
              left: Math.random() * 100 + "%",
              top: Math.random() * 100 + "%",
            }}
            animate={{
              y: [0, -100],
              x: [-50, 50],
              scale: [1, 0.5],
              opacity: [0.3, 0],
            }}
            transition={{
              duration: Math.random() * 4 + 6,
              repeat: Number.POSITIVE_INFINITY,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </motion.div>

      <div className="relative z-10 w-full max-w-4xl space-y-8">
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
      </div>
    </div>
  )
}