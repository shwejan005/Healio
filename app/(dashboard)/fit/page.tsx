"use client"

import type React from "react"
import { useState } from "react"
import { api } from "@/convex/_generated/api"
import { useUser } from "@clerk/nextjs"
import { useMutation, useQuery } from "convex/react"
import { Dumbbell, Flame, Timer, Trash2, Plus, Footprints, Zap, Sparkles, Activity, HeartPulse } from "lucide-react"
import { motion } from "framer-motion"
import { SpotlightCard } from "@/components/reactbits/SpotlightCard"
import { SplitText } from "@/components/reactbits/SplitText"
import { Button } from "@/components/ui/button"

const activityPresets = [
  { name: "Mindful Yoga", cpm: 4.5, icon: HeartPulse },
  { name: "Outdoor Walk", cpm: 5.0, icon: Footprints },
  { name: "Indoor Run", cpm: 11.0, icon: Activity },
  { name: "HIIT Workout", cpm: 12.5, icon: Zap },
  { name: "Strength Training", cpm: 8.0, icon: Dumbbell },
  { name: "Cycling", cpm: 9.0, icon: Activity },
]

export default function FitnessTracker() {
  const { user } = useUser()
  const userId = user?.id || ""

  const [selectedPreset, setSelectedPreset] = useState("Mindful Yoga")
  const [duration, setDuration] = useState("30")
  const [intensity, setIntensity] = useState("moderate")
  const [notes, setNotes] = useState("")

  const addEntry = useMutation(api.fitnessLogs.logFitness)
  const deleteEntry = useMutation(api.fitnessLogs.deleteFitnessLog)
  const fitnessData = useQuery(api.fitnessLogs.getFitnessLogs, userId ? { userId } : "skip")

  // Calculate estimated calories based on preset & intensity
  const presetObj = activityPresets.find((p) => p.name === selectedPreset) || activityPresets[0]
  const intensityMultiplier = intensity === "low" ? 0.8 : intensity === "vigorous" ? 1.3 : 1.0
  const estimatedCalories = Math.round((parseFloat(duration) || 0) * presetObj.cpm * intensityMultiplier)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedPreset || !duration) return
    await addEntry({
      userId,
      workoutType: selectedPreset,
      duration: parseFloat(duration),
      caloriesBurned: estimatedCalories,
      intensity,
      notes,
    })
    setNotes("")
  }

  // Apple Fitness Ring targets
  const MOVE_TARGET = 400 // kcal
  const EXERCISE_TARGET = 30 // mins
  const WORKOUT_TARGET = 5 // logs

  const totalCalories = fitnessData?.reduce((acc, curr) => acc + curr.caloriesBurned, 0) || 0
  const totalMinutes = fitnessData?.reduce((acc, curr) => acc + curr.duration, 0) || 0
  const totalLogs = fitnessData?.length || 0

  const movePct = Math.min(100, Math.round((totalCalories / MOVE_TARGET) * 100))
  const exercisePct = Math.min(100, Math.round((totalMinutes / EXERCISE_TARGET) * 100))
  const workoutPct = Math.min(100, Math.round((totalLogs / WORKOUT_TARGET) * 100))

  return (
    <div className="font-montreal min-h-screen p-4 sm:p-8 max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white/80 backdrop-blur-xl border border-white/80 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="space-y-1">
          <span className="text-xs font-bold uppercase tracking-wider text-[#3a633a] flex items-center gap-1.5">
            <Footprints className="w-4 h-4" /> Activity Rings & Energy
          </span>
          <h1 className="text-3xl font-extrabold text-[#2d4c2d]">
            <SplitText text="Apple-Grade Fitness Dashboard" />
          </h1>
          <p className="text-sm text-[#4a7a4a]">
            Track exercise minutes, active calories, and movement progress toward daily health goals.
          </p>
        </div>
      </div>

      {/* Apple Fitness Activity Rings */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {/* Move Ring */}
        <SpotlightCard className="p-6 rounded-3xl bg-white/85 backdrop-blur-xl border border-white/80 shadow-md space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-rose-700">Move Ring</span>
            <Flame className="w-5 h-5 text-rose-500" />
          </div>
          <div className="space-y-1">
            <p className="text-3xl font-extrabold text-[#2d4c2d]">{totalCalories} <span className="text-sm font-normal text-[#4a7a4a]">/ {MOVE_TARGET} kcal</span></p>
            <div className="w-full h-2.5 rounded-full bg-rose-100 overflow-hidden">
              <div className="h-full bg-rose-500 rounded-full transition-all duration-500" style={{ width: `${movePct}%` }} />
            </div>
          </div>
          <p className="text-[11px] text-[#4a7a4a] font-semibold">{movePct}% of daily active calorie goal</p>
        </SpotlightCard>

        {/* Exercise Ring */}
        <SpotlightCard className="p-6 rounded-3xl bg-white/85 backdrop-blur-xl border border-white/80 shadow-md space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">Exercise Ring</span>
            <Timer className="w-5 h-5 text-emerald-600" />
          </div>
          <div className="space-y-1">
            <p className="text-3xl font-extrabold text-[#2d4c2d]">{totalMinutes} <span className="text-sm font-normal text-[#4a7a4a]">/ {EXERCISE_TARGET} mins</span></p>
            <div className="w-full h-2.5 rounded-full bg-emerald-100 overflow-hidden">
              <div className="h-full bg-emerald-600 rounded-full transition-all duration-500" style={{ width: `${exercisePct}%` }} />
            </div>
          </div>
          <p className="text-[11px] text-[#4a7a4a] font-semibold">{exercisePct}% of daily exercise target</p>
        </SpotlightCard>

        {/* Workouts Logged Ring */}
        <SpotlightCard className="p-6 rounded-3xl bg-white/85 backdrop-blur-xl border border-white/80 shadow-md space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-700">Session Ring</span>
            <Dumbbell className="w-5 h-5 text-amber-600" />
          </div>
          <div className="space-y-1">
            <p className="text-3xl font-extrabold text-[#2d4c2d]">{totalLogs} <span className="text-sm font-normal text-[#4a7a4a]">/ {WORKOUT_TARGET} logs</span></p>
            <div className="w-full h-2.5 rounded-full bg-amber-100 overflow-hidden">
              <div className="h-full bg-amber-500 rounded-full transition-all duration-500" style={{ width: `${workoutPct}%` }} />
            </div>
          </div>
          <p className="text-[11px] text-[#4a7a4a] font-semibold">{workoutPct}% of active workout target</p>
        </SpotlightCard>
      </div>

      {/* Preset Launcher & Log Builder */}
      <SpotlightCard className="p-6 rounded-3xl bg-white/85 backdrop-blur-xl border border-white/80 shadow-xl space-y-5">
        <h2 className="text-lg font-bold text-[#2d4c2d] flex items-center gap-2">
          <Plus className="w-4 h-4 text-[#3a633a]" /> Log Workout Session
        </h2>

        {/* Activity Presets Grid */}
        <div>
          <label className="text-xs font-bold text-[#4a7a4a] block mb-2">Select Activity Preset</label>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
            {activityPresets.map((preset) => {
              const Icon = preset.icon
              const isSelected = selectedPreset === preset.name
              return (
                <button
                  key={preset.name}
                  type="button"
                  onClick={() => setSelectedPreset(preset.name)}
                  className={`p-3 rounded-2xl text-xs font-semibold border transition-all flex flex-col items-center gap-1.5 ${
                    isSelected
                      ? "bg-[#3a633a] text-white border-[#3a633a] shadow-sm"
                      : "bg-white text-[#2d4c2d] border-[#3a633a]/15 hover:bg-[#f0f9ed]"
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isSelected ? "text-white" : "text-[#3a633a]"}`} />
                  <span className="truncate text-[11px]">{preset.name}</span>
                </button>
              )
            })}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-bold text-[#4a7a4a] block mb-1">Duration (Minutes)</label>
              <input
                type="number"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className="w-full p-3 rounded-xl border border-[#3a633a]/20 bg-white text-sm text-[#2d4c2d] focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-[#4a7a4a] block mb-1">Intensity Level</label>
              <select
                value={intensity}
                onChange={(e) => setIntensity(e.target.value)}
                className="w-full p-3 rounded-xl border border-[#3a633a]/20 bg-white text-sm text-[#2d4c2d] focus:outline-none"
              >
                <option value="low">Low (Light pace)</option>
                <option value="moderate">Moderate (Standard)</option>
                <option value="vigorous">Vigorous (High effort)</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-[#4a7a4a] block mb-1">Est. Calories Burned</label>
              <div className="p-3 rounded-xl bg-[#f0f9ed] border border-[#3a633a]/20 text-sm font-bold text-[#2d4c2d] flex items-center justify-between">
                <span>{estimatedCalories} kcal</span>
                <Sparkles className="w-4 h-4 text-[#3a633a]" />
              </div>
            </div>
          </div>

          <Button
            type="submit"
            disabled={!selectedPreset || !duration}
            className="w-full bg-[#3a633a] hover:bg-[#2d4c2d] text-white font-semibold py-3.5 rounded-xl shadow-md transition-all text-sm disabled:opacity-50"
          >
            Log Activity & Complete Ring
          </Button>
        </form>
      </SpotlightCard>

      {/* Workout History */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-[#2d4c2d]">Activity History</h2>

        {fitnessData === undefined ? (
          <div className="text-center text-[#4a7a4a] animate-pulse p-8 bg-white/50 rounded-2xl">
            Loading fitness records...
          </div>
        ) : fitnessData.length > 0 ? (
          <div className="space-y-3">
            {fitnessData.map((entry) => (
              <SpotlightCard
                key={entry._id}
                className="p-5 rounded-2xl bg-white/90 backdrop-blur-xl border border-white/80 shadow-sm flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-xl bg-[#e0f0e0] text-[#3a633a]">
                    <Dumbbell className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-[#2d4c2d] text-base">{entry.workoutType}</p>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#e0f0e0] text-[#2d4c2d] capitalize">
                        {entry.intensity || "moderate"}
                      </span>
                    </div>
                    <div className="flex gap-4 text-xs text-[#4a7a4a] mt-0.5 font-medium">
                      <span className="flex items-center gap-1">
                        <Timer className="w-3.5 h-3.5 text-[#3a633a]" /> {entry.duration} mins
                      </span>
                      <span className="flex items-center gap-1">
                        <Flame className="w-3.5 h-3.5 text-rose-500" /> {entry.caloriesBurned} kcal
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => deleteEntry({ logId: entry._id })}
                  className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                  title="Delete entry"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </SpotlightCard>
            ))}
          </div>
        ) : (
          <SpotlightCard className="text-center p-12 rounded-3xl bg-white/70 backdrop-blur-xl border border-white/80 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-[#e0f0e0] text-[#3a633a] flex items-center justify-center mx-auto shadow-sm">
              <Footprints className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-[#2d4c2d]">No Workouts Logged Yet</h3>
            <p className="text-xs text-[#4a7a4a] max-w-sm mx-auto">
              Select an activity preset above to log your exercise session and close your daily rings.
            </p>
          </SpotlightCard>
        )}
      </div>
    </div>
  )
}