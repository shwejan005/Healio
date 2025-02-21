"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Pencil, Trash2 } from "lucide-react"
import type { MoodEntry } from "@/types/mood"

const moodEmojis = ["😢", "☹️", "😐", "🙂", "😊"]
const moodColors = [
  "from-red-100 to-red-50",
  "from-orange-100 to-orange-50",
  "from-blue-100 to-blue-50",
  "from-green-100 to-green-50",
  "from-emerald-100 to-emerald-50",
]
const moodLabels = ["Very Sad", "Sad", "Neutral", "Happy", "Very Happy"]

interface MoodEntryProps {
  entry: MoodEntry
  onEdit: (entry: MoodEntry) => void
  onDelete: (id: string) => Promise<void>
}

function MetricBar({ value, max = 5, color = "bg-primary" }: { value: number; max?: number; color?: string }) {
  return (
    <div className="flex gap-1">
      {Array.from({ length: max }).map((_, i) => (
        <div key={i} className={`h-2 w-4 rounded-full transition-all ${i < value ? color : "bg-muted"}`} />
      ))}
    </div>
  )
}

export function MoodEntry({ entry, onEdit, onDelete }: MoodEntryProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const moodIndex = entry.mood - 1
  const formattedDate = new Date(entry.date).toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
  })

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      if (entry._id) {
        await onDelete(entry._id)
      }
    } catch (error) {
      setIsDeleting(false)
      setShowDeleteDialog(false)
    }
  }

  return (
    <>
      <Card
        className={`mood-entry overflow-hidden bg-gradient-to-br ${moodColors[moodIndex]} border-none shadow-lg shadow-primary/10`}
      >
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/80 text-3xl shadow-inner">
                {moodEmojis[moodIndex]}
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{formattedDate}</p>
                <p className="font-semibold text-lg">{moodLabels[moodIndex]}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-white/20" onClick={() => onEdit(entry)}>
                <Pencil className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 hover:bg-white/20 text-red-500 hover:text-red-600"
                onClick={() => setShowDeleteDialog(true)}
                disabled={isDeleting}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="grid gap-6">
          <div className="grid gap-4 rounded-xl bg-white/60 p-4 backdrop-blur-sm">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">💤</span>
                    <span className="font-medium">Sleep Duration</span>
                  </div>
                  <span className="font-bold">{entry.sleep.hours}h</span>
                </div>
                <div className="h-2 w-full rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-primary transition-all"
                    style={{ width: `${(entry.sleep.hours / 12) * 100}%` }}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">⭐️</span>
                    <span className="font-medium">Sleep Quality</span>
                  </div>
                  <span className="font-bold">{entry.sleep.quality}/5</span>
                </div>
                <MetricBar value={entry.sleep.quality} />
              </div>
            </div>
          </div>

          <div className="grid gap-4 rounded-xl bg-white/60 p-4 backdrop-blur-sm">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">😰</span>
                    <span className="font-medium">Anxiety Level</span>
                  </div>
                  <span className="font-bold">{entry.anxiety}/5</span>
                </div>
                <MetricBar value={entry.anxiety} color="bg-orange-400" />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">🎭</span>
                    <span className="font-medium">Stress Level</span>
                  </div>
                  <span className="font-bold">{entry.stress}/5</span>
                </div>
                <MetricBar value={entry.stress} color="bg-red-400" />
              </div>
            </div>
          </div>

          {entry.activities.length > 0 && (
            <div className="rounded-xl bg-white/60 p-4 backdrop-blur-sm">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-lg">🎯</span>
                <span className="font-medium">Activities</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {entry.activities.map((activity) => (
                  <Badge
                    key={activity}
                    variant="secondary"
                    className="bg-white/50 hover:bg-white/70 transition-colors text-sm px-3 py-1"
                  >
                    {activity}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {entry.note && (
            <div className="rounded-xl bg-white/60 p-4 backdrop-blur-sm">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">📝</span>
                <span className="font-medium">Notes</span>
              </div>
              <p className="text-muted-foreground leading-relaxed">{entry.note}</p>
            </div>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your mood entry.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction className="bg-red-500 hover:bg-red-600" onClick={handleDelete}>
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

