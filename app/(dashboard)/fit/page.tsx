"use client";

import { Card } from "@/components/ui/card";
import { api } from "@/convex/_generated/api";
import { useUser } from "@clerk/nextjs";
import { useMutation, useQuery } from "convex/react";
import { Dumbbell, Flame, TimerIcon } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";

export default function FitnessTracker() {
  const { user } = useUser();
  const userId = user?.id || "";
  const [workoutType, setWorkoutType] = useState("");
  const [duration, setDuration] = useState("");
  const [caloriesBurned, setCaloriesBurned] = useState("");

  const addEntry = useMutation(api.fitnessLogs.logFitness);
  const updateEntry = useMutation(api.fitnessLogs.updateFitnessLog);
  const deleteEntry = useMutation(api.fitnessLogs.deleteFitnessLog);
  const fitnessData = useQuery(api.fitnessLogs.getFitnessLogs, userId ? { userId } : "skip");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!workoutType || !duration || !caloriesBurned) return;
    await addEntry({
      userId,
      workoutType,
      duration: parseFloat(duration),
      caloriesBurned: parseFloat(caloriesBurned),
    });
    setWorkoutType("");
    setDuration("");
    setCaloriesBurned("");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      className="font-montreal flex min-h-screen bg-[#E5F4DD]"
    >
      <div className="flex-1 p-8">
        <motion.div className="max-w-4xl mx-auto">
          {/* Header Section */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-8"
          >
            <h1 className="text-5xl font-medium text-[#314328] mb-2">
              Track Your Fitness Journey
            </h1>
            <p className="text-gray-600">
              Monitor your workouts and progress to stay motivated and achieve your fitness goals.
            </p>
          </motion.div>

          {/* Input Section */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="mb-6"
          >
            <Card className="p-6 bg-white rounded-lg shadow-lg">
              <h2 className="text-2xl font-medium text-[#314328] mb-4">New Workout</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <input
                  type="text"
                  placeholder="Workout Type"
                  value={workoutType}
                  onChange={(e) => setWorkoutType(e.target.value)}
                  className="w-full p-3 border rounded-lg bg-[#E5F4DD] focus:ring-2 focus:ring-[#698c5c] focus:outline-none"
                />
                <input
                  type="number"
                  placeholder="Duration (minutes)"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  className="w-full p-3 border rounded-lg bg-[#E5F4DD] focus:ring-2 focus:ring-[#698c5c] focus:outline-none"
                />
                <input
                  type="number"
                  placeholder="Calories Burned"
                  value={caloriesBurned}
                  onChange={(e) => setCaloriesBurned(e.target.value)}
                  className="w-full p-3 border rounded-lg bg-[#E5F4DD] focus:ring-2 focus:ring-[#698c5c] focus:outline-none"
                />
                <button
                  type="submit"
                  className="w-full bg-[#698c5c] text-white py-3 rounded-lg hover:bg-[#314328] transition-colors"
                >
                  Add Workout
                </button>
              </form>
            </Card>
          </motion.div>

          {/* Workout History Section */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mb-6"
          >
            <Card className="p-6 bg-white rounded-lg shadow-lg">
              <h2 className="text-2xl font-medium text-[#314328] mb-4">Workout History</h2>
              {fitnessData === undefined ? (
                <p>Loading workouts...</p>
              ) : (
                <div className="space-y-4">
                  {fitnessData.map((entry, index) => (
                    <motion.div
                      key={entry._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                    >
                      <Card className="p-4 bg-[#F9FDF7] rounded-lg transition-transform duration-300 hover:scale-[1.02]">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Dumbbell className="h-5 w-5 text-[#698c5c]" />
                            <span className="font-medium text-lg">{entry.workoutType}</span>
                          </div>
                          <div className="flex gap-4">
                            <button 
                              onClick={() => updateEntry({ 
                                logId: entry._id, 
                                workoutType: entry.workoutType, 
                                duration: entry.duration, 
                                caloriesBurned: entry.caloriesBurned 
                              })} 
                              className="text-[#698c5c] hover:text-[#314328]"
                            >
                              Edit
                            </button>
                            <button 
                              onClick={() => deleteEntry({ logId: entry._id })} 
                              className="text-red-500 hover:text-red-700"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                        <div className="flex gap-4 text-gray-600">
                          <div className="flex items-center gap-1">
                            <TimerIcon className="h-4 w-4" />
                            <span>{entry.duration} mins</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Flame className="h-4 w-4" />
                            <span>{entry.caloriesBurned} kcal</span>
                          </div>
                        </div>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              )}
            </Card>
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  );
}