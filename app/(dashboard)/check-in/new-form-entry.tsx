"use client"

import { useState } from "react"
import { format } from "date-fns"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { X } from "lucide-react"
import type { NewEntryFormData } from "@/types/mood"
import { activities } from "./constants/activities"
import type { MoodEntry } from "@/types/mood" 

const moodEmojis = ["😢", "☹️", "😐", "🙂", "😊"]

interface NewEntryFormProps {
  onClose: () => void
  onEntryAdded: (entry: NewEntryFormData) => Promise<void>
  initialData?: MoodEntry // Add this for edit mode
  isEdit?: boolean // Add this to determine if we're editing
}

export function NewEntryForm({ onClose, onEntryAdded, initialData, isEdit }: NewEntryFormProps) {
  const [mood, setMood] = useState(initialData?.mood ?? 3)
  const [sleepHours, setSleepHours] = useState(initialData?.sleep.hours ?? 7)
  const [sleepQuality, setSleepQuality] = useState(initialData?.sleep.quality ?? 3)
  const [anxiety, setAnxiety] = useState(initialData?.anxiety ?? 3)
  const [stress, setStress] = useState(initialData?.stress ?? 3)
  const [selectedActivities, setSelectedActivities] = useState<string[]>(initialData?.activities ?? [])
  const [note, setNote] = useState(initialData?.note ?? "")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async () => {
    if (sleepHours <= 0 || sleepHours > 24) {
      return
    }

    setIsSubmitting(true)
    try {
      await onEntryAdded({
        date: format(new Date(), "yyyy-MM-dd HH:mm:ss"),
        mood,
        sleep: { hours: sleepHours, quality: sleepQuality },
        anxiety,
        stress,
        activities: selectedActivities,
        note: note.trim() || undefined,
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const toggleActivity = (activity: string) => {
    setSelectedActivities((prev) =>
      prev.includes(activity) ? prev.filter((a) => a !== activity) : [...prev, activity],
    )
  }

  return (
    <Card className="w-full max-w-4xl mx-auto backdrop-blur-sm bg-white/95 border-none shadow-2xl">
      <CardHeader className="relative">
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-4 top-4 hover:rotate-90 transition-transform duration-200"
          onClick={onClose}
        >
          <X className="h-4 w-4" />
        </Button>
        <CardTitle className="text-2xl">{isEdit ? "Edit Mood Entry" : "How Are You Feeling Today?"}</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[70vh] pr-4">
          <div className="space-y-8">
            <div className="space-y-4">
              <Label className="text-lg">Mood</Label>
              <div className="flex justify-between mb-2">
                {moodEmojis.map((emoji, index) => (
                  <span
                    key={index}
                    className={`text-3xl transition-transform duration-200 cursor-pointer ${
                      mood === index + 1 ? "scale-150" : "opacity-50 hover:opacity-75"
                    }`}
                    onClick={() => setMood(index + 1)}
                  >
                    {emoji}
                  </span>
                ))}
              </div>
              <Slider
                value={[mood]}
                min={1}
                max={5}
                step={1}
                onValueChange={(value) => setMood(value[0])}
                className="w-full"
              />
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="sleep-hours" className="flex items-center gap-2">
                  <span>💤</span> Hours of Sleep
                </Label>
                <Input
                  id="sleep-hours"
                  type="number"
                  min={0}
                  max={24}
                  value={sleepHours}
                  onChange={(e) => setSleepHours(Number(e.target.value))}
                  className="transition-all focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <span>⭐️</span> Sleep Quality
                </Label>
                <Slider
                  value={[sleepQuality]}
                  min={1}
                  max={5}
                  step={1}
                  onValueChange={(value) => setSleepQuality(value[0])}
                />
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <span>😰</span> Anxiety Level
                </Label>
                <Slider value={[anxiety]} min={1} max={5} step={1} onValueChange={(value) => setAnxiety(value[0])} />
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <span>🎭</span> Stress Level
                </Label>
                <Slider value={[stress]} min={1} max={5} step={1} onValueChange={(value) => setStress(value[0])} />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <span>🎯</span> Activities
              </Label>
              <div className="flex flex-wrap gap-2">
                {activities.map((activity) => (
                  <Badge
                    key={activity}
                    variant={selectedActivities.includes(activity) ? "default" : "outline"}
                    className={`cursor-pointer transition-all duration-200 ${
                      selectedActivities.includes(activity) ? "bg-primary hover:bg-primary/90" : "hover:bg-primary/10"
                    }`}
                    onClick={() => toggleActivity(activity)}
                  >
                    {activity}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="note" className="flex items-center gap-2">
                <span>📝</span> Notes (Optional)
              </Label>
              <Textarea
                id="note"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Write about what's influencing your mood today..."
                className="h-32 transition-all focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <Button
              className="w-full bg-primary hover:bg-primary/90 transition-all duration-200 text-lg py-6"
              onClick={handleSubmit}
              disabled={isSubmitting || sleepHours <= 0 || sleepHours > 24}
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <span className="animate-spin">⏳</span> {isEdit ? "Updating..." : "Saving..."}
                </span>
              ) : isEdit ? (
                "Update Entry"
              ) : (
                "Save Entry"
              )}
            </Button>
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}

