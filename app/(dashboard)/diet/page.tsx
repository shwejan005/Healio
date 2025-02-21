"use client";

import { Card } from "@/components/ui/card";
import { api } from "@/convex/_generated/api";
import { useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { AppleIcon, SaladIcon, UtensilsIcon, Dumbbell, Flame, TimerIcon } from "lucide-react";
import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI('AIzaSyABmemGBhZSVuGE_mOjBDv48m-o5wcIiyY');

function parseAndStyleMessage(content: string) {
  return content.split('\n').map((line, index) => {
    if (line.startsWith('**') && line.endsWith('**')) {
      return (
        <h3 key={index} className="text-lg font-semibold mt-4 mb-2 text-[#314328]">
          {line.replace(/\*\*/g, '')}
        </h3>
      );
    }

    if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
      return (
        <div key={index} className="flex items-start gap-2 ml-4 mb-1">
          <span className="text-[#698c5c] mt-1">•</span>
          <span className="flex-1">
            {parseBoldText(line.replace(/^[-*] /, ''))}
          </span>
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
  const parts = text.split(/(\*\*.+?\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <span key={i} className="font-medium text-[#314328]">
          {part.slice(2, -2)}
        </span>
      );
    }
    return part;
  });
}

export default function HomePage() {
  const { user } = useUser();
  const userId = user?.id || "";
  const [dietPlan, setDietPlan] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const moodEntries = useQuery(api.moodEntries.getMoodEntries, userId ? { userId } : "skip");
  const journalEntries = useQuery(api.journals.getEntries, userId ? { userId } : "skip");
  const fitnessLogs = useQuery(api.fitnessLogs.getFitnessLogs, userId ? { userId } : "skip");

  const generateDietPlan = async () => {
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
        - 1-day meal plan (breakfast, lunch, dinner, snacks)
        - Focus on mood support and fitness recovery
        - Use bullet points with **bold** categories
        - Include emojis and practical portions
      `;

      const model = genAI.getGenerativeModel({ model: "gemini-pro" });
      const result = await model.generateContent(prompt);
      const text = result.response.text();
      setDietPlan(text.replace(/(\*\*)/g, '**')); // Ensure consistent bold formatting
    } catch (error) {
      console.error("Diet generation failed:", error);
      setDietPlan("Couldn't generate diet plan. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

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

  useEffect(() => {
    if (userId && moodEntries?.length && journalEntries?.length && fitnessLogs?.length) {
      generateDietPlan();
    }
  }, [userId, moodEntries, journalEntries, fitnessLogs]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="font-montreal flex min-h-screen bg-[#E5F4DD] p-8"
    >
      <div className="max-w-4xl mx-auto w-full">
        <motion.div
          initial={{ y: -20 }}
          animate={{ y: 0 }}
          className="mb-8 text-center"
        >
          <h1 className="text-5xl font-medium text-[#314328] mb-2">
            Welcome Back, {user?.firstName}
          </h1>
          <p className="text-gray-600">
            Your holistic wellness overview
          </p>
        </motion.div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card className="p-6 bg-white rounded-lg shadow-lg">
            <div className="flex items-center gap-3 mb-4">
              <SaladIcon className="h-8 w-8 text-[#698c5c]" />
              <h2 className="text-2xl font-medium text-[#314328]">
                AI Diet Plan
              </h2>
            </div>

            {isLoading ? (
              <div className="space-y-4 animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4" />
                <div className="h-4 bg-gray-200 rounded" />
                <div className="h-4 bg-gray-200 rounded w-5/6" />
              </div>
            ) : dietPlan ? (
              <div className="text-gray-700 space-y-2">
                {parseAndStyleMessage(dietPlan)}
              </div>
            ) : (
              <p className="text-gray-500">
                Generating personalized nutrition recommendations...
              </p>
            )}

            <div className="mt-4 flex items-center gap-2 text-sm text-gray-500">
              <AppleIcon className="h-4 w-4" />
              <span>AI-powered by Gemini</span>
            </div>
          </Card>

          <Card className="p-6 bg-white rounded-lg shadow-lg">
            <div className="flex items-center gap-3 mb-4">
              <UtensilsIcon className="h-8 w-8 text-[#698c5c]" />
              <h2 className="text-2xl font-medium text-[#314328]">
                Wellness Metrics
              </h2>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <MetricTile
                icon={<Dumbbell className="h-6 w-6" />}
                title="Fitness"
                value={`${fitnessLogs?.length || 0} sessions`}
              />
              <MetricTile
                icon={<Flame className="h-6 w-6" />}
                title="Activity"
                value={`${calculateAverage(fitnessLogs?.map(f => f.duration))} mins`}
              />
              <MetricTile
                icon={<TimerIcon className="h-6 w-6" />}
                title="Mood"
                value={`${calculateAverage(moodEntries?.map(m => m.mood))}/5`}
              />
              <MetricTile
                icon={<SaladIcon className="h-6 w-6" />}
                title="Sleep"
                value={`${calculateAverage(moodEntries?.map(m => m.sleep.hours))} hrs`}
              />
            </div>
          </Card>
        </div>
      </div>
    </motion.div>
  );
}

function MetricTile({ icon, title, value }: { icon: React.ReactNode; title: string; value: string }) {
  return (
    <div className="p-4 bg-[#F9FDF7] rounded-lg">
      <div className="text-[#698c5c] mb-2">{icon}</div>
      <h3 className="font-medium">{title}</h3>
      <p className="text-sm text-gray-600">{value}</p>
    </div>
  );
}