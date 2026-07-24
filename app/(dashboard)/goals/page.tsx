"use client"

import { useState } from "react"
import { useQuery, useMutation } from "convex/react"
import { useUser } from "@clerk/nextjs"
import { api } from "@/convex/_generated/api"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { motion, AnimatePresence } from "framer-motion"
import {
  CheckCircle2,
  Circle,
  Plus,
  Target,
  Trash2,
  Sparkles,
  Calendar,
  Flame,
  ChevronDown,
  ChevronUp,
  Filter,
  Check,
  ListTodo,
} from "lucide-react"
import { Id } from "@/convex/_generated/dataModel"
import Confetti from "react-confetti"
import { useWindowSize } from "react-use"
import { SpotlightCard } from "@/components/reactbits/SpotlightCard"
import { SplitText } from "@/components/reactbits/SplitText"

const categories = [
  { id: "all", name: "All Goals" },
  { id: "mindfulness", name: "Mindfulness" },
  { id: "physical", name: "Physical" },
  { id: "habits", name: "Daily Habits" },
  { id: "growth", name: "Personal Growth" },
]

export default function GoalsPage() {
  const { user } = useUser()
  const { toast } = useToast()
  const { width, height } = useWindowSize()
  const [showConfetti, setShowConfetti] = useState(false)

  // Form states
  const [title, setTitle] = useState("")
  const [category, setCategory] = useState("habits")
  const [priority, setPriority] = useState("medium")
  const [dueDate, setDueDate] = useState("")
  const [subtaskInput, setSubtaskInput] = useState("")
  const [subtasks, setSubtasks] = useState<Array<{ id: string; title: string; completed: boolean }>>([])
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [expandedGoalId, setExpandedGoalId] = useState<string | null>(null)

  const goals = useQuery(api.goals.getGoals, user?.id ? { userId: user.id } : "skip")
  const addGoal = useMutation(api.goals.addGoal)
  const updateGoal = useMutation(api.goals.updateGoal)
  const toggleSubtask = useMutation(api.goals.toggleSubtask)
  const deleteGoal = useMutation(api.goals.deleteGoal)

  const handleAddSubtask = () => {
    if (!subtaskInput.trim()) return
    setSubtasks([
      ...subtasks,
      { id: Date.now().toString(), title: subtaskInput.trim(), completed: false },
    ])
    setSubtaskInput("")
  }

  const handleRemoveSubtask = (id: string) => {
    setSubtasks(subtasks.filter((st) => st.id !== id))
  }

  const handleCreateGoal = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !user?.id) return

    await addGoal({
      userId: user.id,
      title: title.trim(),
      category,
      priority,
      dueDate,
      subtasks,
    })

    setTitle("")
    setDueDate("")
    setSubtasks([])
    toast({ title: "Goal Created", description: "Your goal has been added to your dashboard." })
  }

  const handleToggleComplete = async (id: string, completed: boolean) => {
    await updateGoal({ id: id as Id<"goals">, completed: !completed })
    if (!completed) {
      setShowConfetti(true)
      setTimeout(() => setShowConfetti(false), 3000)
      toast({ title: "Goal Completed", description: "Awesome work achieving this milestone!" })
    }
  }

  const filteredGoals = goals?.filter((g) => {
    if (selectedCategory === "all") return true
    return (g.category || "habits") === selectedCategory
  })

  const completedCount = goals?.filter((g) => g.completed).length || 0
  const totalCount = goals?.length || 0
  const completionPercentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0

  return (
    <div className="font-montreal min-h-screen p-4 sm:p-8 max-w-5xl mx-auto space-y-8">
      {showConfetti && <Confetti width={width} height={height} numberOfPieces={250} />}

      {/* Header Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white/80 backdrop-blur-xl border border-white/80 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="space-y-1">
          <span className="text-xs font-bold uppercase tracking-wider text-[#3a633a] flex items-center gap-1.5">
            <Target className="w-4 h-4" /> Practical Habit Architecture
          </span>
          <h1 className="text-3xl font-extrabold text-[#2d4c2d]">
            <SplitText text="Goals & Milestone Tracker" />
          </h1>
          <p className="text-sm text-[#4a7a4a]">
            Break down ambitious objectives into actionable sub-tasks and maintain daily streaks.
          </p>
        </div>

        {totalCount > 0 && (
          <div className="p-4 rounded-2xl bg-[#f0f9ed] border border-[#3a633a]/20 text-center min-w-[140px] shadow-sm">
            <p className="text-3xl font-extrabold text-[#2d4c2d]">{completionPercentage}%</p>
            <p className="text-xs text-[#4a7a4a] font-medium">{completedCount} of {totalCount} completed</p>
          </div>
        )}
      </div>

      {/* Goal Creator Form */}
      <SpotlightCard className="p-6 rounded-3xl bg-white/85 backdrop-blur-xl border border-white/80 shadow-xl space-y-4">
        <h2 className="text-lg font-bold text-[#2d4c2d] flex items-center gap-2">
          <Plus className="w-4 h-4 text-[#3a633a]" /> Create Practical Goal
        </h2>

        <form onSubmit={handleCreateGoal} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <input
              type="text"
              placeholder="Goal title (e.g. Complete 20-min daily meditation)"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="md:col-span-2 p-3.5 rounded-xl border border-[#3a633a]/20 bg-white text-sm text-[#2d4c2d] placeholder-[#4a7a4a]/50 focus:outline-none focus:ring-2 focus:ring-[#3a633a]/30"
            />
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="p-3.5 rounded-xl border border-[#3a633a]/20 bg-white text-sm text-[#2d4c2d] focus:outline-none focus:ring-2 focus:ring-[#3a633a]/30"
            >
              <option value="mindfulness">Mindfulness</option>
              <option value="physical">Physical Health</option>
              <option value="habits">Daily Habits</option>
              <option value="growth">Personal Growth</option>
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-[#4a7a4a] block mb-1">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full p-3 rounded-xl border border-[#3a633a]/20 bg-white text-xs text-[#2d4c2d] focus:outline-none"
              >
                <option value="high">High Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="low">Low Priority</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-[#4a7a4a] block mb-1">Target Date</label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full p-3 rounded-xl border border-[#3a633a]/20 bg-white text-xs text-[#2d4c2d] focus:outline-none"
              />
            </div>
          </div>

          {/* Subtasks Builder */}
          <div className="space-y-2 pt-1">
            <label className="text-xs font-bold text-[#4a7a4a] block">Sub-tasks & Milestones</label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Add sub-task (e.g. Setup quiet space)"
                value={subtaskInput}
                onChange={(e) => setSubtaskInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault()
                    handleAddSubtask()
                  }
                }}
                className="flex-1 p-2.5 rounded-xl border border-[#3a633a]/20 bg-white text-xs text-[#2d4c2d]"
              />
              <Button
                type="button"
                onClick={handleAddSubtask}
                className="bg-[#e0f0e0] hover:bg-[#3a633a] text-[#2d4c2d] hover:text-white text-xs font-semibold px-4 rounded-xl transition-colors"
              >
                Add
              </Button>
            </div>

            {subtasks.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-2">
                {subtasks.map((st) => (
                  <span
                    key={st.id}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-[#f0f9ed] border border-[#3a633a]/20 text-xs font-medium text-[#2d4c2d]"
                  >
                    <span>{st.title}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveSubtask(st.id)}
                      className="text-slate-400 hover:text-rose-600 font-bold ml-1"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <Button
            type="submit"
            disabled={!title.trim()}
            className="w-full bg-[#3a633a] hover:bg-[#2d4c2d] text-white font-semibold py-3 rounded-xl shadow-md transition-all text-sm disabled:opacity-50"
          >
            Publish Goal & Track Progress
          </Button>
        </form>
      </SpotlightCard>

      {/* Category Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#3a633a]/15 pb-4">
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                selectedCategory === cat.id
                  ? "bg-[#3a633a] text-white shadow-sm"
                  : "bg-white/80 hover:bg-[#e0f0e0] text-[#2d4c2d] border border-white/80"
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Goals Display List */}
      <div className="space-y-4">
        {filteredGoals === undefined ? (
          <div className="text-center text-[#4a7a4a] animate-pulse p-8 bg-white/50 rounded-2xl">
            Loading your goals...
          </div>
        ) : filteredGoals.length > 0 ? (
          <div className="space-y-4">
            {filteredGoals.map((goal) => {
              const isExpanded = expandedGoalId === goal._id
              const subtaskCount = goal.subtasks?.length || 0
              const completedSubtasks = goal.subtasks?.filter((st) => st.completed).length || 0

              return (
                <SpotlightCard
                  key={goal._id}
                  className={`p-5 rounded-3xl bg-white/90 backdrop-blur-xl border border-white/80 shadow-md space-y-3 transition-all ${
                    goal.completed ? "opacity-75" : ""
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 flex-1">
                      <button
                        onClick={() => handleToggleComplete(goal._id, goal.completed)}
                        className={`mt-0.5 transition-colors ${
                          goal.completed ? "text-emerald-600" : "text-slate-300 hover:text-[#3a633a]"
                        }`}
                      >
                        {goal.completed ? (
                          <CheckCircle2 className="w-6 h-6 fill-emerald-100" />
                        ) : (
                          <Circle className="w-6 h-6" />
                        )}
                      </button>

                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3
                            className={`text-lg font-bold ${
                              goal.completed ? "line-through text-[#4a7a4a]" : "text-[#2d4c2d]"
                            }`}
                          >
                            {goal.title}
                          </h3>

                          {goal.priority === "high" && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-rose-50 text-rose-700 border border-rose-200">
                              High Priority
                            </span>
                          )}

                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#e0f0e0] text-[#2d4c2d]">
                            {goal.category || "habits"}
                          </span>
                        </div>

                        <div className="flex items-center gap-4 text-xs text-[#4a7a4a] font-medium pt-1">
                          {goal.dueDate && (
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3.5 h-3.5 text-[#3a633a]" /> Due {goal.dueDate}
                            </span>
                          )}
                          {(goal.streak || 0) > 0 && (
                            <span className="flex items-center gap-1 font-bold text-amber-700">
                              <Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-500" /> {goal.streak} Day Streak
                            </span>
                          )}
                          {subtaskCount > 0 && (
                            <span className="flex items-center gap-1">
                              <ListTodo className="w-3.5 h-3.5" /> {completedSubtasks}/{subtaskCount} Subtasks
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {subtaskCount > 0 && (
                        <button
                          onClick={() => setExpandedGoalId(isExpanded ? null : goal._id)}
                          className="p-2 rounded-xl text-[#3a633a] hover:bg-[#e0f0e0] transition-colors"
                        >
                          {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                        </button>
                      )}
                      <button
                        onClick={() => deleteGoal({ id: goal._id })}
                        className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  {/* Subtask Accordion Checklist */}
                  <AnimatePresence>
                    {isExpanded && subtaskCount > 0 && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="pt-3 border-t border-[#3a633a]/10 space-y-2 pl-9"
                      >
                        <p className="text-xs font-bold text-[#4a7a4a]">Subtask Checklist</p>
                        {goal.subtasks?.map((st) => (
                          <div
                            key={st.id}
                            onClick={() => toggleSubtask({ goalId: goal._id, subtaskId: st.id })}
                            className="flex items-center gap-2.5 text-xs font-medium text-[#2d4c2d] cursor-pointer hover:text-[#3a633a] p-1.5 rounded-lg hover:bg-[#f0f9ed] transition-colors"
                          >
                            <div
                              className={`w-4 h-4 rounded-md border flex items-center justify-center ${
                                st.completed
                                  ? "bg-[#3a633a] border-[#3a633a] text-white"
                                  : "border-[#3a633a]/30"
                              }`}
                            >
                              {st.completed && <Check className="w-3 h-3 stroke-[3]" />}
                            </div>
                            <span className={st.completed ? "line-through text-[#4a7a4a]" : ""}>
                              {st.title}
                            </span>
                          </div>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </SpotlightCard>
              )
            })}
          </div>
        ) : (
          <SpotlightCard className="text-center p-12 rounded-3xl bg-white/70 backdrop-blur-xl border border-white/80 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-[#e0f0e0] text-[#3a633a] flex items-center justify-center mx-auto shadow-sm">
              <Target className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-[#2d4c2d]">No Goals Found</h3>
            <p className="text-xs text-[#4a7a4a] max-w-sm mx-auto">
              Create your first practical goal above to begin tracking habits and milestones.
            </p>
          </SpotlightCard>
        )}
      </div>
    </div>
  )
}