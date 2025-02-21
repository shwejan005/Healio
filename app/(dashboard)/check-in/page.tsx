"use client"

import { useState } from "react"
import { useQuery, useMutation } from "convex/react"
import { useUser } from "@clerk/nextjs"
import { api } from "@/convex/_generated/api"
import { Button } from "@/components/ui/button"
import { NewEntryForm } from "./new-form-entry"
import { MoodEntry } from "./mood-entry"
import type { MoodEntry as MoodEntryType } from "@/types/mood"

export default function CheckinPage() {
  const [showNewEntry, setShowNewEntry] = useState(false)
  const { user } = useUser()
  const moodEntries = useQuery(api.moodEntries.getMoodEntries, {
    userId: user?.id ?? "",
  })
  const addMoodEntry = useMutation(api.moodEntries.createMoodEntry)

  const handleNewEntryAdded = async (newEntry: Omit<MoodEntryType, "userId">) => {
    await addMoodEntry({
      userId: user?.id ?? "",
      ...newEntry,
    })
    setShowNewEntry(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#E5F4DD] to-[#D1E6C7] py-8 px-4">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center space-y-4 mood-card">
          <h1 className="text-4xl font-medium text-[#314328] md:text-5xl">How Are You Feeling Today?</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Take a moment to reflect and share your thoughts. Logging your emotions helps you understand your patterns
            and take charge of your mental well-being.
          </p>
        </div>

        <Button
          size="lg"
          className="w-full bg-primary hover:bg-primary/90 transition-all duration-300 text-lg py-6 shadow-lg shadow-primary/20"
          onClick={() => setShowNewEntry(true)}
        >
          New Entry
        </Button>

        <div className="space-y-6">
          <h2 className="text-2xl font-medium flex items-center gap-2">
            <span>📅</span> Past Entries
          </h2>
          {moodEntries === undefined ? (
            <div className="text-center text-muted-foreground animate-pulse p-8">Loading past entries...</div>
          ) : moodEntries.length > 0 ? (
            <div className="space-y-4">
              {moodEntries.map((entry) => (
                <MoodEntry key={entry._id} entry={entry} />
              ))}
            </div>
          ) : (
            <div className="text-center text-muted-foreground p-8 border border-dashed rounded-lg">
              No mood entries found. Create your first entry to get started!
            </div>
          )}
        </div>

        {showNewEntry && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
            <NewEntryForm onClose={() => setShowNewEntry(false)} onEntryAdded={handleNewEntryAdded} />
          </div>
        )}
      </div>
    </div>
  )
}

