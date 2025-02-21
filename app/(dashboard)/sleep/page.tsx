"use client"
import { useState, useEffect } from "react"
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
  const [loadingSuggestions, setLoadingSuggestions] = useState(false)

  // Fetch sleep debt data
  const sleepDebt = useQuery(api.moodEntries.getSleepDebt, user ? { userId: user.id } : "skip")

  // Fetch personalized sleep improvement suggestions
  const fetchSuggestions = async () => {
    if (!sleepDebt || !user) return

    setLoadingSuggestions(true)
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
      setLoadingSuggestions(false)
    }
  }

  // Fetch suggestions when sleep debt data is available
  useEffect(() => {
    if (sleepDebt && !suggestions) {
      fetchSuggestions()
    }
  }, [sleepDebt, suggestions])

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#e8f5e9] to-[#c8e6c9] p-4 flex flex-col items-center justify-center">
      {/* Animated Background Elements */}
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

      {/* Main Content */}
      <div className="relative z-10 w-full max-w-4xl space-y-8">
        {/* Sleep Debt Card */}
        <motion.div
          initial={{ scale: 0.5, opacity: 0, rotate: -5 }}
          animate={{ scale: 1, opacity: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 100 }}
        >
          <Card className="transition-transform duration-300 hover:scale-[1.02] bg-white/80 backdrop-blur-xl border-0 shadow-lg shadow-[#4a7a4a]/20">
            <CardContent className="p-8 text-[#2e7d32]">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center space-y-4"
              >
                <div className="flex items-center gap-3 mb-4">
                  <motion.span
                    animate={{ rotate: [0, 15, -15, 0] }}
                    transition={{ repeat: Number.POSITIVE_INFINITY, duration: 4 }}
                    className="text-4xl"
                  >
                    😴
                  </motion.span>
                  <h1 className="text-3xl font-bold tracking-wider">Sleep Debt Tracker</h1>
                </div>

                {sleepDebt ? (
                  <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="text-center">
                    <p className="text-xl font-medium mb-2">Over the last 7 days, you've accumulated</p>
                    <div className="flex justify-center items-baseline gap-2">
                      <motion.span
                        className="text-6xl font-black px-6 py-3 rounded-2xl"
                        animate={{
                          backgroundColor: ["#e8f5e9", "#c8e6c9", "#e8f5e9"],
                          scale: [1, 1.05, 1],
                        }}
                        transition={{ duration: 3, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
                      >
                        {sleepDebt.totalSleepDebt}
                      </motion.span>
                      <span className="text-3xl">hours</span>
                    </div>
                    <p className="mt-4 text-lg opacity-90">of sleep debt 🌙</p>
                  </motion.div>
                ) : (
                  <div className="space-y-4 w-full">
                    <Skeleton className="h-8 w-3/4 mx-auto bg-white/20" />
                    <Skeleton className="h-12 w-1/2 mx-auto bg-white/20" />
                    <Skeleton className="h-6 w-1/3 mx-auto bg-white/20" />
                  </div>
                )}
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Suggestions Card */}
        <motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }}>
          <Card className="transition-transform duration-300 hover:scale-[1.02] bg-white/90 backdrop-blur-xl border border-[#81c784] shadow-lg shadow-[#4a7a4a]/20">
            <CardContent className="p-8 text-[#2e7d32]">
              <div className="flex items-center gap-3 mb-6">
                <motion.span
                  animate={{ rotateZ: [0, 20, -20, 0] }}
                  transition={{ repeat: Number.POSITIVE_INFINITY, duration: 4 }}
                  className="text-3xl"
                >
                  💡
                </motion.span>
                <h2 className="text-2xl font-bold tracking-wide">Personalized Sleep Plan</h2>
              </div>

              {loadingSuggestions ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.1 }}
                    >
                      <Skeleton className="h-4 w-full bg-[#4a7a4a]/20" />
                      <Skeleton className="h-4 w-3/4 mt-2 bg-[#4a7a4a]/20" />
                    </motion.div>
                  ))}
                </div>
              ) : suggestions ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  {parseAndStyleMessage(suggestions)}
                </motion.div>
              ) : (
                <motion.div className="text-center py-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <p className="text-red-600/80">Failed to load suggestions 🌧️</p>
                  <motion.button
                    onClick={fetchSuggestions}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="mt-4 px-6 py-2 bg-[#66bb6a] text-white rounded-lg hover:bg-[#4caf50] transition-colors"
                  >
                    Try Again 🔄
                  </motion.button>
                </motion.div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}

