"use client"

import { useUser } from "@clerk/nextjs"
import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { BarChart, LineChart, PieChart } from "@/components/ui/charts"
import { Loader2, Smile, Target, Dumbbell, BookHeart, Users2, Shield, Calendar, Flame, Timer, Activity } from "lucide-react"
import { SpotlightCard } from "@/components/reactbits/SpotlightCard"
import { SplitText } from "@/components/reactbits/SplitText"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export default function UserAnalyticsPage() {
  const { user } = useUser()
  const userId = user?.id
  const [activeTab, setActiveTab] = useState("overview")

  const analytics = useQuery(api.account.getUserAnalytics, userId ? { userId } : "skip")

  if (!userId) {
    return (
      <div className="flex h-screen items-center justify-center text-[#4a7a4a]">
        <p>Please sign in to view your account analytics.</p>
      </div>
    )
  }

  if (!analytics) {
    return (
      <div className="flex h-screen items-center justify-center text-[#3a633a]">
        <Loader2 className="h-8 w-8 animate-spin" />
        <p className="ml-2 font-semibold text-sm">Loading your analytics dashboard...</p>
      </div>
    )
  }

  const { moodStats, gratitudeStats, forumStats, goalsStats, fitnessStats } = analytics

  return (
    <div className="font-montreal min-h-screen p-4 sm:p-8 max-w-6xl mx-auto space-y-8">
      {/* Profile Header */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white/80 backdrop-blur-xl border border-white/80 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <Avatar className="w-16 h-16 border-2 border-[#3a633a]/30 shadow-md">
            <AvatarImage src={user?.imageUrl} />
            <AvatarFallback className="bg-[#3a633a] text-white font-bold text-xl">
              {user?.fullName ? user.fullName.charAt(0) : "U"}
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#2d4c2d]">
              <SplitText text={user?.fullName || "Wellness Member"} />
            </h1>
            <p className="text-xs text-[#4a7a4a] flex items-center gap-1.5 mt-0.5">
              <Shield className="w-3.5 h-3.5 text-[#3a633a]" /> {user?.primaryEmailAddress?.emailAddress}
            </p>
          </div>
        </div>

        <div className="flex gap-3">
          <div className="px-4 py-2.5 rounded-2xl bg-[#f0f9ed] border border-[#3a633a]/20 text-center shadow-sm">
            <p className="text-xs font-bold text-[#3a633a]">Member Sanctuary</p>
            <p className="text-[11px] text-[#4a7a4a]">Active Account</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full space-y-6">
        <TabsList className="grid grid-cols-3 sm:grid-cols-6 p-1.5 rounded-2xl bg-white/80 backdrop-blur-md border border-white/80 shadow-sm">
          <TabsTrigger value="overview" className="rounded-xl text-xs font-semibold">Overview</TabsTrigger>
          <TabsTrigger value="mood" className="rounded-xl text-xs font-semibold">Mood</TabsTrigger>
          <TabsTrigger value="gratitude" className="rounded-xl text-xs font-semibold">Gratitude</TabsTrigger>
          <TabsTrigger value="forum" className="rounded-xl text-xs font-semibold">Forum</TabsTrigger>
          <TabsTrigger value="goals" className="rounded-xl text-xs font-semibold">Goals</TabsTrigger>
          <TabsTrigger value="fitness" className="rounded-xl text-xs font-semibold">Fitness</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <SpotlightCard className="p-6 rounded-3xl bg-white/80 backdrop-blur-xl border border-white/80 shadow-md">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-[#4a7a4a]">Average Mood</span>
                <Smile className="w-5 h-5 text-[#3a633a]" />
              </div>
              <p className="text-3xl font-extrabold text-[#2d4c2d]">{moodStats.averageMood.toFixed(1)} / 5</p>
              <p className="text-xs text-[#4a7a4a] mt-1">Based on recent check-in entries</p>
            </SpotlightCard>

            <SpotlightCard className="p-6 rounded-3xl bg-white/80 backdrop-blur-xl border border-white/80 shadow-md">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-[#4a7a4a]">Goal Completion</span>
                <Target className="w-5 h-5 text-amber-600" />
              </div>
              <p className="text-3xl font-extrabold text-[#2d4c2d]">{goalsStats.completionRate.toFixed(0)}%</p>
              <p className="text-xs text-[#4a7a4a] mt-1">{goalsStats.completedGoals} of {goalsStats.totalGoals} achieved</p>
            </SpotlightCard>

            <SpotlightCard className="p-6 rounded-3xl bg-white/80 backdrop-blur-xl border border-white/80 shadow-md">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-[#4a7a4a]">Total Workouts</span>
                <Dumbbell className="w-5 h-5 text-[#3a633a]" />
              </div>
              <p className="text-3xl font-extrabold text-[#2d4c2d]">{fitnessStats.totalWorkouts}</p>
              <p className="text-xs text-[#4a7a4a] mt-1">{fitnessStats.totalCaloriesBurned} kcal total burned</p>
            </SpotlightCard>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <SpotlightCard className="p-6 rounded-3xl bg-white/80 backdrop-blur-xl border border-white/80 shadow-md space-y-4">
              <div>
                <h3 className="text-lg font-bold text-[#2d4c2d]">Mood Trend</h3>
                <p className="text-xs text-[#4a7a4a]">Rating trajectory across recent entries</p>
              </div>
              {moodStats.moodTrend.length > 0 ? (
                <LineChart
                  data={moodStats.moodTrend.map((entry) => ({
                    name: new Date(entry.date).toLocaleDateString(),
                    value: entry.mood,
                  }))}
                  index="name"
                  categories={["value"]}
                  colors={["primary"]}
                  valueFormatter={(value) => `${value}/5`}
                  showLegend={false}
                  showXAxis={true}
                  showYAxis={true}
                />
              ) : (
                <p className="text-center py-8 text-xs text-[#4a7a4a]">No mood data recorded yet</p>
              )}
            </SpotlightCard>

            <SpotlightCard className="p-6 rounded-3xl bg-white/80 backdrop-blur-xl border border-white/80 shadow-md space-y-4">
              <div>
                <h3 className="text-lg font-bold text-[#2d4c2d]">Workout Breakdown</h3>
                <p className="text-xs text-[#4a7a4a]">Distribution by exercise category</p>
              </div>
              {fitnessStats.workoutTypes.length > 0 ? (
                <PieChart
                  data={fitnessStats.workoutTypes.map((wt) => ({
                    name: wt.type,
                    value: wt.count,
                  }))}
                  index="name"
                  valueFormatter={(value) => `${value} sessions`}
                  category="value"
                  colors={["primary", "secondary", "accent", "destructive", "muted"]}
                />
              ) : (
                <p className="text-center py-8 text-xs text-[#4a7a4a]">No fitness activity recorded yet</p>
              )}
            </SpotlightCard>
          </div>
        </TabsContent>

        <TabsContent value="mood" className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <SpotlightCard className="p-5 rounded-2xl bg-white/80 border border-white/80 text-center">
              <Smile className="w-5 h-5 text-[#3a633a] mx-auto mb-1" />
              <p className="text-2xl font-bold text-[#2d4c2d]">{moodStats.averageMood.toFixed(1)} / 5</p>
              <p className="text-xs text-[#4a7a4a]">Average Mood</p>
            </SpotlightCard>

            <SpotlightCard className="p-5 rounded-2xl bg-white/80 border border-white/80 text-center">
              <Calendar className="w-5 h-5 text-[#3a633a] mx-auto mb-1" />
              <p className="text-2xl font-bold text-[#2d4c2d]">{moodStats.averageSleep.toFixed(1)} hrs</p>
              <p className="text-xs text-[#4a7a4a]">Average Sleep</p>
            </SpotlightCard>

            <SpotlightCard className="p-5 rounded-2xl bg-white/80 border border-white/80 text-center">
              <Activity className="w-5 h-5 text-amber-600 mx-auto mb-1" />
              <p className="text-2xl font-bold text-[#2d4c2d]">{moodStats.averageAnxiety.toFixed(1)} / 5</p>
              <p className="text-xs text-[#4a7a4a]">Anxiety Level</p>
            </SpotlightCard>

            <SpotlightCard className="p-5 rounded-2xl bg-white/80 border border-white/80 text-center">
              <Activity className="w-5 h-5 text-rose-600 mx-auto mb-1" />
              <p className="text-2xl font-bold text-[#2d4c2d]">{moodStats.averageStress.toFixed(1)} / 5</p>
              <p className="text-xs text-[#4a7a4a]">Stress Level</p>
            </SpotlightCard>
          </div>
        </TabsContent>

        <TabsContent value="gratitude" className="space-y-6">
          <SpotlightCard className="p-6 rounded-3xl bg-white/80 backdrop-blur-xl border border-white/80 shadow-md space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-[#e0f0e0] text-[#3a633a]">
                <BookHeart className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-[#2d4c2d]">Gratitude Entries Logged</h3>
                <p className="text-xs text-[#4a7a4a]">{gratitudeStats.totalEntries} entries recorded</p>
              </div>
            </div>

            {gratitudeStats.recentEntries.length > 0 ? (
              <div className="space-y-3 pt-2">
                {gratitudeStats.recentEntries.map((entry, index) => (
                  <div key={index} className="p-4 rounded-2xl bg-[#f0f9ed] border border-[#3a633a]/15 text-xs text-[#2d4c2d]">
                    <p className="italic font-medium">&quot;{entry.gratitude}&quot;</p>
                    <p className="text-[11px] text-[#4a7a4a] mt-2 font-semibold">{new Date(entry.date).toLocaleDateString()}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center py-8 text-xs text-[#4a7a4a]">No gratitude entries yet</p>
            )}
          </SpotlightCard>
        </TabsContent>

        <TabsContent value="forum" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <SpotlightCard className="p-6 rounded-3xl bg-white/80 border border-white/80 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-[#4a7a4a]">Forum Posts</p>
                <p className="text-3xl font-extrabold text-[#2d4c2d] mt-1">{forumStats.totalPosts}</p>
              </div>
              <Users2 className="w-8 h-8 text-[#3a633a]" />
            </SpotlightCard>

            <SpotlightCard className="p-6 rounded-3xl bg-white/80 border border-white/80 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-[#4a7a4a]">Comments Shared</p>
                <p className="text-3xl font-extrabold text-[#2d4c2d] mt-1">{forumStats.totalComments}</p>
              </div>
              <Users2 className="w-8 h-8 text-[#3a633a]" />
            </SpotlightCard>
          </div>
        </TabsContent>

        <TabsContent value="goals" className="space-y-6">
          <SpotlightCard className="p-6 rounded-3xl bg-white/80 backdrop-blur-xl border border-white/80 shadow-md space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-[#2d4c2d]">Goal Progress Overview</h3>
                <p className="text-xs text-[#4a7a4a]">{goalsStats.completedGoals} of {goalsStats.totalGoals} goals completed</p>
              </div>
              <span className="text-lg font-extrabold text-[#3a633a]">{goalsStats.completionRate.toFixed(0)}%</span>
            </div>
            <Progress value={goalsStats.completionRate} className="h-2.5 rounded-full bg-[#e0f0e0]" />
          </SpotlightCard>
        </TabsContent>

        <TabsContent value="fitness" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <SpotlightCard className="p-6 rounded-3xl bg-white/80 border border-white/80">
              <Dumbbell className="w-5 h-5 text-[#3a633a] mb-2" />
              <p className="text-2xl font-bold text-[#2d4c2d]">{fitnessStats.totalWorkouts}</p>
              <p className="text-xs text-[#4a7a4a]">Total Workouts</p>
            </SpotlightCard>

            <SpotlightCard className="p-6 rounded-3xl bg-white/80 border border-white/80">
              <Timer className="w-5 h-5 text-[#3a633a] mb-2" />
              <p className="text-2xl font-bold text-[#2d4c2d]">
                {Math.floor(fitnessStats.totalDuration / 60)}h {fitnessStats.totalDuration % 60}m
              </p>
              <p className="text-xs text-[#4a7a4a]">Exercise Duration</p>
            </SpotlightCard>

            <SpotlightCard className="p-6 rounded-3xl bg-white/80 border border-white/80">
              <Flame className="w-5 h-5 text-amber-600 mb-2" />
              <p className="text-2xl font-bold text-[#2d4c2d]">{fitnessStats.totalCaloriesBurned.toLocaleString()} kcal</p>
              <p className="text-xs text-[#4a7a4a]">Calories Burned</p>
            </SpotlightCard>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}