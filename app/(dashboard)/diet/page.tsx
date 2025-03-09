"use client";

import { Card } from "@/components/ui/card";
import { useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { motion } from "framer-motion";
import { AppleIcon, SaladIcon } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { api } from "@/convex/_generated/api";

function parseAndStyleMessage(content: string) {
  return content.split("\n").map((line, index) => {
    if (line.startsWith("**") && line.endsWith("**")) {
      return (
        <h3 key={index} className="text-lg font-semibold mt-4 mb-2 text-[#314328]">
          {line.replace(/\*\*/g, "")}
        </h3>
      );
    }
    if (line.trim().startsWith("- ") || line.trim().startsWith("* ")) {
      return (
        <div key={index} className="flex items-start gap-2 ml-4 mb-1">
          <span className="text-[#698c5c] mt-1">•</span>
          <span className="flex-1">{parseBoldText(line.replace(/^[-*] /, ""))}</span>
        </div>
      );
    }
    return (
      <p key={index} className="mb-2 text-gray-700">
        {parseBoldText(line)}
      </p>
    );
  });
}

function parseBoldText(text: string) {
  return text.split(/(\*\*.+?\*\*)/g).map((part, i) =>
    part.startsWith("**") && part.endsWith("**") ? (
      <span key={i} className="font-medium text-[#314328]">
        {part.slice(2, -2)}
      </span>
    ) : (
      part
    )
  );
}

export default function DietPage() {
  const { user } = useUser();
  const userId = user?.id || "";
  const [dietPlan, setDietPlan] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const moodEntries = useQuery(api.moodEntries.getMoodEntries, userId ? { userId } : "skip");
  const journalEntries = useQuery(api.journals.getEntries, userId ? { userId } : "skip");
  const fitnessLogs = useQuery(api.fitnessLogs.getFitnessLogs, userId ? { userId } : "skip");

  const calculateAverage = (arr: number[] | undefined) =>
    arr?.length ? (arr.reduce((a, b) => a + b, 0) / arr.length).toFixed(1) : "N/A";

  const getMostCommon = (items: string[] = []) => {
    const counts = items.reduce((acc: Record<string, number>, item) => {
      acc[item] = (acc[item] || 0) + 1;
      return acc;
    }, {});
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([item]) => item)
      .join(", ") || "None";
  };

  const generateDietPlan = useCallback(async () => {
    if (!userId || !moodEntries || !journalEntries || !fitnessLogs) return;

    setIsLoading(true);
    try {
      const prompt = `
        Create a personalized daily diet for an Indian based on:

        Mood (7-day avg): ${calculateAverage(moodEntries.map(e => e.mood))}/5
        Activities: ${getMostCommon(moodEntries.flatMap(e => e.activities))}
        Sleep: ${calculateAverage(moodEntries.map(e => e.sleep.hours))} hrs (${calculateAverage(moodEntries.map(e => e.sleep.quality))}/5 quality)

        Journal Themes:
        ${journalEntries.slice(0, 3).map(e => `- ${e.gratitude}`).join("\n")}

        Fitness:
        ${fitnessLogs.length} workouts, avg ${calculateAverage(fitnessLogs.map(f => f.duration))} mins
        ${calculateAverage(fitnessLogs.map(f => f.caloriesBurned))} kcal burned

        Respond with:
        - 1-day meal plan (breakfast, lunch, dinner, snacks) rich in protein and fiber for energy
        - Focus on mood support and fitness recovery
        - Use bullet points with **bold** categories
        - Include emojis and practical portions
      `;

      const geminiApiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Gemini API request failed");
      }

      const data = await response.json();
      const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text || "No response received.";

      setDietPlan(generatedText);
    } catch (error) {
      console.error("Diet generation failed:", error);
      setDietPlan("Couldn't generate diet plan. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  }, [userId, moodEntries, journalEntries, fitnessLogs]);

  useEffect(() => {
    if (userId && moodEntries?.length && journalEntries?.length && fitnessLogs?.length) {
      generateDietPlan();
    }
  }, [userId, moodEntries, journalEntries, fitnessLogs, generateDietPlan]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="font-montreal flex flex-col items-center justify-center min-h-screen bg-[#E5F4DD] px-6 py-12"
    >
      <div className="max-w-4xl w-full">
        <motion.div initial={{ y: -20 }} animate={{ y: 0 }} className="mb-10 text-center">
          <h1 className="text-4xl font-semibold text-[#314328] mb-3">
            Hey, {user?.firstName}
          </h1>
          <p className="text-lg text-gray-600">Here's your personalised diet based on your current mood</p>
        </motion.div>

        <div className="flex flex-col items-center">
          <Card className="p-6 w-full bg-[#f1f7ee] rounded-lg shadow-lg">
            <div className="flex items-center gap-3 mb-4">
              <SaladIcon className="h-8 w-8 text-[#698c5c]" />
              <h2 className="text-2xl font-semibold text-[#314328]">
                AI-Powered Diet Plan
              </h2>
            </div>

            {isLoading ? (
              <div className="space-y-4 animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4" />
                <div className="h-4 bg-gray-200 rounded" />
                <div className="h-4 bg-gray-200 rounded w-5/6" />
              </div>
            ) : dietPlan ? (
              <div className="text-gray-700 space-y-2">{parseAndStyleMessage(dietPlan)}</div>
            ) : (
              <p className="text-gray-500">Generating your nutrition recommendations...</p>
            )}

            <div className="mt-6 flex items-center gap-2 text-sm text-gray-500">
              <AppleIcon className="h-5 w-5 text-[#698c5c]" />
              <span>Powered by Gemini AI</span>
            </div>
          </Card>
        </div>
      </div>
    </motion.div>
  );
}