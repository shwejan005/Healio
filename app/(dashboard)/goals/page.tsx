"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { useUser } from "@clerk/nextjs";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { CheckCircleIcon, TrashIcon, PlusIcon } from "lucide-react";
import { Id } from "@/convex/_generated/dataModel";
import Confetti from "react-confetti";
import { useWindowSize } from "react-use";

export default function GoalsPage() {
  const [newGoal, setNewGoal] = useState("");
  const { user } = useUser();
  const { toast } = useToast();
  const { width, height } = useWindowSize();
  const [showConfetti, setShowConfetti] = useState(false);

  const goals = useQuery(api.goals.getGoals, user?.id ? { userId: user.id } : "skip");
  const addGoal = useMutation(api.goals.addGoal);
  const updateGoal = useMutation(api.goals.updateGoal);
  const deleteGoal = useMutation(api.goals.deleteGoal);

  const handleAddGoal = async () => {
    if (!newGoal.trim() || !user?.id) return;

    await addGoal({ userId: user.id, title: newGoal.trim() });
    setNewGoal("");
    toast({ title: "Goal Added!", description: "Stay productive and achieve your goals." });
  };

  const handleToggleComplete = async (id: string, completed: boolean) => {
    await updateGoal({ id: id as Id<"goals">, completed: !completed });

    if (!completed) {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3000);
      toast({ title: "Goal Completed 🎉", description: "Great job! Keep going!" });
    }
  };

  const handleDeleteGoal = async (id: string) => {
    await deleteGoal({ id: id as Id<"goals"> });
    toast({ title: "Goal Deleted", description: "Removed from your list." });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      className="min-h-screen bg-gradient-to-b from-[#E5F4DD] to-[#D1E6C7] py-8 px-4"
    >
      {showConfetti && <Confetti width={width} height={height} numberOfPieces={300} />}
      
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <motion.div className="text-center space-y-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
          <h1 className="text-4xl font-medium text-[#314328] md:text-5xl">Your Goals</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Stay focused and productive by setting and tracking your goals.
          </p>
        </motion.div>

        {/* Add Goal Input */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, delay: 0.3 }}>
          <div className="flex items-center justify-center gap-2">
            <input
              type="text"
              value={newGoal}
              onChange={(e) => setNewGoal(e.target.value)}
              placeholder="Enter a new goal..."
              className="flex-1 p-4 rounded-lg border bg-[#eaf0e7] border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <Button className="flex items-center p-4 bg-primary hover:bg-primary/90 transition-all" onClick={handleAddGoal}>
              <PlusIcon className="w-6 h-6" />
            </Button>
          </div>
        </motion.div>

        {/* Goals List */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, delay: 0.5 }} className="space-y-4">
          <h2 className="text-2xl font-medium">Tasks</h2>
          {goals === undefined ? (
            <div className="text-center text-muted-foreground animate-pulse p-8">Loading goals...</div>
          ) : goals.length > 0 ? (
            <div className="space-y-4">
              {goals.map((goal, index) => (
                <motion.div
                  key={goal._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className={`p-4 flex items-center justify-between rounded-lg transition-transform duration-300 ${
                    goal.completed ? "bg-[#edf7e8] text-gray-600" : "bg-[#f4f9f2] shadow-md"
                  }`}
                >
                  <span className="flex-1">{goal.title}</span>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handleToggleComplete(goal._id, goal.completed)}
                      className={`p-2 rounded-lg transition-all duration-300 ${
                        goal.completed ? "text-green-600" : "text-gray-600 hover:text-green-500"
                      }`}
                    >
                      <CheckCircleIcon className="w-6 h-6" />
                    </button>
                    <button
                      onClick={() => handleDeleteGoal(goal._id)}
                      className="p-2 text-red-600 hover:text-red-700 transition-all duration-300"
                    >
                      <TrashIcon className="w-6 h-6" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center bg-[#eaf0e7] text-muted-foreground p-8 border border-dashed rounded-lg">
              <span className="text-6xl">🎯</span>
              <p className="mt-4 text-lg">No goals yet. Add one to start tracking!</p>
            </div>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
}