"use client"

import { useState } from "react"
import { useQuery, useMutation } from "convex/react"
import { useUser } from "@clerk/nextjs"
import { api } from "@/convex/_generated/api"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast" 
import { NewEntryForm } from "./new-form-entry"
import { MoodEntry } from "./mood-entry"
import type { MoodEntry as MoodEntryType } from "@/types/mood"
import { Id } from "@/convex/_generated/dataModel"
import { motion } from "framer-motion"

export default function CheckinPage() {
  const [showNewEntry, setShowNewEntry] = useState(false)
  const [editingEntry, setEditingEntry] = useState<MoodEntryType | null>(null)
  const { user } = useUser()
  const { toast } = useToast()

  const moodEntries = useQuery(api.moodEntries.getMoodEntries, {
    userId: user?.id ?? "",
  })

  const addMoodEntry = useMutation(api.moodEntries.createMoodEntry)
  const updateMoodEntry = useMutation(api.moodEntries.updateMoodEntry)
  const deleteMoodEntry = useMutation(api.moodEntries.deleteMoodEntry)

  const handleNewEntryAdded = async (newEntry: Omit<MoodEntryType, "userId">) => {
    try {
      await addMoodEntry({
        userId: user?.id ?? "",
        ...newEntry,
      })
      toast({
        title: "Success!",
        description: "Your mood entry has been saved.",
      })
      setShowNewEntry(false)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save your mood entry. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleEntryUpdated = async (updatedEntry: Omit<MoodEntryType, "userId">) => {
    if (!editingEntry?._id) return

    try {
      await updateMoodEntry({
        id: editingEntry._id as Id<"moodEntries">,
        ...updatedEntry,
      })
      toast({
        title: "Success!",
        description: "Your mood entry has been updated.",
      })
      setEditingEntry(null)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update your mood entry. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleEntryDeleted = async (id: string) => {
    try {
      await deleteMoodEntry({ id: id as Id<"moodEntries"> })
      toast({
        title: "Success!",
        description: "Your mood entry has been deleted.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete your mood entry. Please try again.",
        variant: "destructive",
      })
      throw error
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      className="min-h-screen bg-gradient-to-b from-[#E5F4DD] to-[#D1E6C7] py-8 px-4"
    >
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center space-y-4"
        >
          <h1 className="text-4xl font-medium text-[#314328] md:text-5xl">
            How Are You Feeling Today?
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Take a moment to reflect and share your thoughts. Logging your emotions helps you understand your patterns
            and take charge of your mental well-being.
          </p>
        </motion.div>

        {/* New Entry Button */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
          <Button
            size="lg"
            className="w-full bg-primary hover:bg-primary/90 transition-all duration-300 text-lg py-6 shadow-lg shadow-primary/20"
            onClick={() => setShowNewEntry(true)}
          >
            New Entry
          </Button>
        </motion.div>

        {/* Past Entries Section */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, delay: 0.3 }}>
          <h2 className="text-2xl font-medium flex items-center gap-2">
            <span>📅</span> Past Entries
          </h2>
          {moodEntries === undefined ? (
            <div className="text-center text-muted-foreground animate-pulse p-8">Loading past entries...</div>
          ) : moodEntries.length > 0 ? (
            <div className="space-y-4">
              {moodEntries.map((entry, index) => (
                <motion.div
                  key={entry._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <MoodEntry key={entry._id} entry={entry} onEdit={setEditingEntry} onDelete={handleEntryDeleted} />
                </motion.div>
              ))}
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="text-center text-muted-foreground p-8 border border-dashed rounded-lg"
            >
              No mood entries found. Create your first entry to get started!
            </motion.div>
          )}
        </motion.div>

        {/* New Entry Form Modal */}
        {(showNewEntry || editingEntry) && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
          >
            <NewEntryForm
              onClose={() => {
                setShowNewEntry(false)
                setEditingEntry(null)
              }}
              onEntryAdded={editingEntry ? handleEntryUpdated : handleNewEntryAdded}
              initialData={editingEntry ?? undefined}
              isEdit={!!editingEntry}
            />
          </motion.div>
        )}
      </div>
    </motion.div>
  )
}