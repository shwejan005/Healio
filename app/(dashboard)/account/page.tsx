"use client"

import { useUser } from "@clerk/nextjs"
import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { BarChart, LineChart, PieChart } from "@/components/ui/charts"
import { Loader2 } from "lucide-react"

// Define TypeScript interfaces for our props
interface StatCardProps {
  title: string
  value: string
  description: string
  icon: string
  className?: string
}

export default function UserAnalyticsPage() {
  const { user } = useUser()
  const userId = user?.id
  const [activeTab, setActiveTab] = useState("overview")

  const analytics = useQuery(api.account.getUserAnalytics, userId ? { userId } : "skip")

  if (!userId) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p>Please sign in to view your analytics</p>
      </div>
    )
  }

  if (!analytics) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-2">Loading your analytics...</p>
      </div>
    )
  }

  const { moodStats, gratitudeStats, forumStats, goalsStats, fitnessStats } = analytics

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Your Analytics Dashboard</h1>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-6 mb-8">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="mood">Mood</TabsTrigger>
          <TabsTrigger value="gratitude">Gratitude</TabsTrigger>
          <TabsTrigger value="forum">Forum</TabsTrigger>
          <TabsTrigger value="goals">Goals</TabsTrigger>
          <TabsTrigger value="fitness">Fitness</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatCard
              title="Mood"
              value={moodStats.averageMood.toFixed(1)}
              description="Average mood rating"
              icon="😊"
            />
            <StatCard
              title="Goals"
              value={`${goalsStats.completionRate.toFixed(0)}%`}
              description="Goal completion rate"
              icon="🎯"
            />
            <StatCard
              title="Fitness"
              value={fitnessStats.totalWorkouts.toString()}
              description="Total workouts"
              icon="💪"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Mood Trend</CardTitle>
                <CardDescription>Your mood over the last 7 entries</CardDescription>
              </CardHeader>
              <CardContent>
                {moodStats.moodTrend.length > 0 ? (
                  <LineChart
                    data={moodStats.moodTrend.map((entry) => ({
                      name: new Date(entry.date).toLocaleDateString(),
                      value: entry.mood,
                    }))}
                    index="name"
                    categories={["value"]}
                    colors={["primary"]}
                    valueFormatter={(value) => `${value}/10`}
                    showLegend={false}
                    showXAxis={true}
                    showYAxis={true}
                  />
                ) : (
                  <p className="text-center py-8 text-muted-foreground">No mood data available</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Workout Distribution</CardTitle>
                <CardDescription>Types of workouts you&apos;ve done</CardDescription>
              </CardHeader>
              <CardContent>
                {fitnessStats.workoutTypes.length > 0 ? (
                  <PieChart
                    data={fitnessStats.workoutTypes.map((wt) => ({
                      name: wt.type,
                      value: wt.count,
                    }))}
                    index="name"
                    valueFormatter={(value) => `${value} workouts`}
                    category="value"
                    colors={["primary", "secondary", "accent", "destructive", "muted"]}
                  />
                ) : (
                  <p className="text-center py-8 text-muted-foreground">No fitness data available</p>
                )}
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Your latest actions across the platform</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {forumStats.recentActivity.length > 0 ? (
                  forumStats.recentActivity.map((activity, index) => (
                    <div key={index} className="flex items-start gap-2 pb-2 border-b">
                      <Badge variant={activity.type === "post" ? "default" : "secondary"}>
                        {activity.type === "post" ? "Post" : "Comment"}
                      </Badge>
                      <div>
                        <p className="font-medium">{activity.type === "post" ? activity.title : activity.content}</p>
                        <p className="text-sm text-muted-foreground">{new Date(activity.date).toLocaleDateString()}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-center py-4 text-muted-foreground">No recent activity</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="mood" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <StatCard title="Average Mood" value={moodStats.averageMood.toFixed(1)} description="Out of 10" icon="😊" />
            <StatCard
              title="Average Sleep"
              value={`${moodStats.averageSleep.toFixed(1)}h`}
              description="Hours per night"
              icon="😴"
            />
            <StatCard
              title="Average Anxiety"
              value={moodStats.averageAnxiety.toFixed(1)}
              description="Out of 10"
              icon="😰"
            />
            <StatCard
              title="Average Stress"
              value={moodStats.averageStress.toFixed(1)}
              description="Out of 10"
              icon="😓"
            />
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Mood Trend</CardTitle>
              <CardDescription>Your mood over time</CardDescription>
            </CardHeader>
            <CardContent className="h-80">
              {moodStats.moodTrend.length > 0 ? (
                <LineChart
                  data={moodStats.moodTrend.map((entry) => ({
                    name: new Date(entry.date).toLocaleDateString(),
                    value: entry.mood,
                  }))}
                  index="name"
                  categories={["value"]}
                  colors={["primary"]}
                  valueFormatter={(value) => `${value}/10`}
                  showLegend={false}
                  showXAxis={true}
                  showYAxis={true}
                />
              ) : (
                <p className="text-center py-8 text-muted-foreground">No mood data available</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Common Activities</CardTitle>
              <CardDescription>Activities that appear most in your entries</CardDescription>
            </CardHeader>
            <CardContent>
              {moodStats.commonActivities.length > 0 ? (
                <BarChart
                  data={moodStats.commonActivities.map((act) => ({
                    name: act.activity,
                    value: act.count,
                  }))}
                  index="name"
                  categories={["value"]}
                  colors={["primary"]}
                  valueFormatter={(value) => `${value} times`}
                  showLegend={false}
                />
              ) : (
                <p className="text-center py-8 text-muted-foreground">No activity data available</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="gratitude" className="space-y-6">
          <StatCard
            title="Gratitude Entries"
            value={gratitudeStats.totalEntries.toString()}
            description="Total entries recorded"
            icon="🙏"
            className="w-full md:w-1/3 mx-auto"
          />

          <Card>
            <CardHeader>
              <CardTitle>Recent Gratitude Entries</CardTitle>
              <CardDescription>Your latest expressions of gratitude</CardDescription>
            </CardHeader>
            <CardContent>
              {gratitudeStats.recentEntries.length > 0 ? (
                <div className="space-y-4">
                  {gratitudeStats.recentEntries.map((entry, index) => (
                    <div key={index} className="p-4 border rounded-lg">
                      <p className="italic">&quot;{entry.gratitude}&quot;</p>
                      <p className="text-sm text-muted-foreground mt-2">{new Date(entry.date).toLocaleDateString()}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center py-8 text-muted-foreground">No gratitude entries yet</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="forum" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <StatCard
              title="Forum Posts"
              value={forumStats.totalPosts.toString()}
              description="Total posts created"
              icon="📝"
            />
            <StatCard
              title="Comments"
              value={forumStats.totalComments.toString()}
              description="Total comments made"
              icon="💬"
            />
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Recent Forum Activity</CardTitle>
              <CardDescription>Your latest posts and comments</CardDescription>
            </CardHeader>
            <CardContent>
              {forumStats.recentActivity.length > 0 ? (
                <div className="space-y-4">
                  {forumStats.recentActivity.map((activity, index) => (
                    <div key={index} className="flex items-start gap-2 pb-4 border-b">
                      <Badge variant={activity.type === "post" ? "default" : "secondary"}>
                        {activity.type === "post" ? "Post" : "Comment"}
                      </Badge>
                      <div>
                        <p className="font-medium">{activity.type === "post" ? activity.title : activity.content}</p>
                        <p className="text-sm text-muted-foreground">{new Date(activity.date).toLocaleDateString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center py-8 text-muted-foreground">No forum activity yet</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="goals" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatCard
              title="Total Goals"
              value={goalsStats.totalGoals.toString()}
              description="Goals created"
              icon="📋"
            />
            <StatCard
              title="Completed"
              value={goalsStats.completedGoals.toString()}
              description="Goals achieved"
              icon="✅"
            />
            <StatCard
              title="Completion Rate"
              value={`${goalsStats.completionRate.toFixed(0)}%`}
              description="Success rate"
              icon="📊"
            />
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Goal Completion</CardTitle>
              <CardDescription>Your progress</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Progress</span>
                  <span>{goalsStats.completionRate.toFixed(0)}%</span>
                </div>
                <Progress value={goalsStats.completionRate} className="h-2" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Active Goals</CardTitle>
              <CardDescription>Goals you&apos;re currently working on</CardDescription>
            </CardHeader>
            <CardContent>
              {goalsStats.activeGoals.length > 0 ? (
                <div className="space-y-4">
                  {goalsStats.activeGoals.map((goal, index) => (
                    <div key={index} className="p-4 border rounded-lg">
                      <p className="font-medium">{goal.title}</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Created on {new Date(goal.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center py-8 text-muted-foreground">No active goals</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="fitness" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatCard
              title="Total Workouts"
              value={fitnessStats.totalWorkouts.toString()}
              description="Workouts completed"
              icon="🏋️‍♂️"
            />
            <StatCard
              title="Total Duration"
              value={`${Math.floor(fitnessStats.totalDuration / 60)}h ${fitnessStats.totalDuration % 60}m`}
              description="Time spent exercising"
              icon="⏱️"
            />
            <StatCard
              title="Calories Burned"
              value={fitnessStats.totalCaloriesBurned.toLocaleString()}
              description="Total calories"
              icon="🔥"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Workout Types</CardTitle>
                <CardDescription>Distribution of your workouts</CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                {fitnessStats.workoutTypes.length > 0 ? (
                  <PieChart
                    data={fitnessStats.workoutTypes.map((wt) => ({
                      name: wt.type,
                      value: wt.count,
                    }))}
                    index="name"
                    valueFormatter={(value) => `${value} workouts`}
                    category="value"
                    colors={["primary", "secondary", "accent", "destructive", "muted"]}
                  />
                ) : (
                  <p className="text-center py-8 text-muted-foreground">No fitness data available</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Workouts</CardTitle>
                <CardDescription>Your latest fitness activities</CardDescription>
              </CardHeader>
              <CardContent>
                {fitnessStats.recentWorkouts.length > 0 ? (
                  <div className="space-y-4">
                    {fitnessStats.recentWorkouts.map((workout, index) => (
                      <div key={index} className="p-4 border rounded-lg">
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="font-medium">{workout.workoutType}</p>
                            <p className="text-sm text-muted-foreground">
                              {workout.duration} minutes • {workout.caloriesBurned} calories
                            </p>
                          </div>
                          <Badge>{getWorkoutIcon(workout.workoutType)}</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center py-8 text-muted-foreground">No recent workouts</p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

// Helper component for stat cards
function StatCard({ title, value, description, icon, className = "" }: StatCardProps) {
  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <span className="text-2xl">{icon}</span>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  )
}

// Helper function to get workout icon
function getWorkoutIcon(type: string): string {
  const typeToIcon: Record<string, string> = {
    Running: "🏃‍♂️",
    Cycling: "🚴‍♀️",
    Swimming: "🏊‍♂️",
    Yoga: "🧘‍♀️",
    Weightlifting: "🏋️‍♀️",
    HIIT: "⚡",
    Walking: "🚶‍♂️",
    Hiking: "🥾",
  }

  return typeToIcon[type] || "💪"
}