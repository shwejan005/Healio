"use client"

import React, { useState, useEffect } from "react"
import { useUser } from "@clerk/nextjs"
import Link from "next/link"
import { motion } from "framer-motion"
import Loading from "@/components/loading"
import { SpotlightCard } from "@/components/reactbits/SpotlightCard"
import { SplitText } from "@/components/reactbits/SplitText"
import { BlurText } from "@/components/reactbits/BlurText"
import { ParticleBackground } from "@/components/reactbits/ParticleBackground"
import {
  ArrowRight,
  Bed,
  BookHeart,
  BookOpen,
  Calendar,
  Compass,
  Footprints,
  MessageCircle,
  MessageSquareWarning,
  PersonStanding,
  Plus,
  Quote,
  RefreshCw,
  Soup,
  Target,
  Users2,
  Sparkles,
} from "lucide-react"

interface FeatureItem {
  title: string
  description: string
  href: string
  icon: React.ElementType
}

const features: FeatureItem[] = [
  {
    title: "Your Companion",
    description: "An empathetic AI partner for emotional support & reflection",
    href: "/ai",
    icon: PersonStanding,
  },
  {
    title: "Daily Mood Check-In",
    description: "Track your emotional baseline and spot weekly trends",
    href: "/check-in",
    icon: Calendar,
  },
  {
    title: "Gratitude Journal",
    description: "Capture daily moments of appreciation & optimism",
    href: "/gratitude",
    icon: BookHeart,
  },
  {
    title: "Mindful Activities",
    description: "Curated breathing exercises, meditation & grounding",
    href: "/activities",
    icon: Plus,
  },
  {
    title: "Calming Stories",
    description: "AI generated sleep & relaxation narratives",
    href: "/stories",
    icon: BookOpen,
  },
  {
    title: "Goal Tracking",
    description: "Set achievable wellness milestones & track habit streaks",
    href: "/goals",
    icon: Target,
  },
  {
    title: "Sleep Debt Manager",
    description: "Monitor sleep deficit to reduce fatigue & optimize recovery",
    href: "/sleep",
    icon: Bed,
  },
  {
    title: "Physical Activity",
    description: "Track daily movement and its direct impact on mood",
    href: "/fit",
    icon: Footprints,
  },
  {
    title: "Personalised Diet",
    description: "Nutritional guidance tailored to your mental energy",
    href: "/diet",
    icon: Soup,
  },
  {
    title: "Anonymous Community Chats",
    description: "Connect with peers in a safe, judgment-free space",
    href: "/chats",
    icon: MessageCircle,
  },
  {
    title: "Community Forum",
    description: "Share stories & advice with the Healio wellness circle",
    href: "/community",
    icon: Users2,
  },
  {
    title: "Feedback & Suggestions",
    description: "Help us shape Healio into your ideal wellness haven",
    href: "/feedback",
    icon: MessageSquareWarning,
  },
]

const quotes = [
  { text: "In the middle of movement and chaos, keep stillness inside of you.", author: "Deepak Chopra" },
  { text: "You don't have to control your thoughts. You just have to stop letting them control you.", author: "Dan Millman" },
  { text: "Peace is the result of re-training your mind to process life as it is, rather than as you think it should be.", author: "Wayne Dyer" },
  { text: "Almost everything will work again if you unplug it for a few minutes, including you.", author: "Anne Lamott" },
]

export default function DashboardPage() {
  const { user } = useUser()
  const [greeting, setGreeting] = useState("Welcome back")
  const [quoteIndex, setQuoteIndex] = useState(0)

  useEffect(() => {
    const hour = new Date().getHours()
    if (hour < 12) setGreeting("Good Morning")
    else if (hour < 18) setGreeting("Good Afternoon")
    else setGreeting("Good Evening")
  }, [])

  if (!user) return <Loading />

  const currentQuote = quotes[quoteIndex]

  return (
    <div className="font-montreal min-h-screen relative p-4 sm:p-8 md:p-12">
      <ParticleBackground />

      <div className="max-w-7xl mx-auto space-y-10 relative z-10">
        {/* Top Hero Section */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 p-6 sm:p-8 rounded-3xl bg-white/80 backdrop-blur-xl border border-white/80 shadow-xl">
          <div className="space-y-3 max-w-2xl">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#3a633a] flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" /> Wellness Sanctuary
            </span>

            <h1 className="text-3xl sm:text-5xl font-extrabold text-[#2d4c2d] tracking-tight">
              <SplitText text={`${greeting}, ${user.firstName || "Friend"}`} />
            </h1>

            <BlurText delay={0.2} className="text-base sm:text-lg text-[#4a7a4a] leading-relaxed">
              Welcome to your personal space. Take a moment to check in with yourself and explore your daily tools.
            </BlurText>

            <div className="pt-2 flex flex-wrap items-center gap-4">
              <Link href="/check-in">
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className="px-5 py-3 rounded-xl bg-[#3a633a] hover:bg-[#2d4c2d] text-white font-semibold text-sm shadow-md transition-all"
                >
                  Start Daily Check-In
                </motion.button>
              </Link>
              <Link href="/ai">
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className="px-5 py-3 rounded-xl bg-white/90 hover:bg-white text-[#2d4c2d] border border-[#3a633a]/20 font-semibold text-sm shadow-sm transition-all flex items-center gap-2"
                >
                  <PersonStanding className="w-4 h-4 text-[#3a633a]" /> Talk to AI Companion
                </motion.button>
              </Link>
            </div>
          </div>

          {/* Daily Mindfulness Quote Widget */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="w-full lg:w-80 p-5 rounded-2xl bg-gradient-to-br from-[#f0f9ed] to-[#e2f2de] border border-[#3a633a]/20 shadow-sm relative group"
          >
            <div className="flex items-center justify-between mb-3 text-xs font-semibold text-[#4a7a4a] uppercase tracking-wider">
              <span className="flex items-center gap-1.5">
                <Quote className="w-3.5 h-3.5 text-[#3a633a]" /> Daily Inspiration
              </span>
              <button
                onClick={() => setQuoteIndex((prev) => (prev + 1) % quotes.length)}
                className="p-1 rounded-lg hover:bg-[#3a633a]/10 transition-colors text-[#3a633a]"
                title="Next Quote"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>
            <p className="italic text-sm text-[#2d4c2d] leading-relaxed mb-3">
              &quot;{currentQuote.text}&quot;
            </p>
            <p className="text-right text-xs font-semibold text-[#3a633a]">
              — {currentQuote.author}
            </p>
          </motion.div>
        </div>

        {/* Feature Cards Section Header */}
        <div className="flex items-center justify-between pt-2">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#2d4c2d] flex items-center gap-2">
              <Compass className="w-6 h-6 text-[#3a633a]" /> Wellness Tools
            </h2>
            <p className="text-sm text-[#4a7a4a]">
              Select a module to view, track, or manage your personal progress.
            </p>
          </div>
        </div>

        {/* Feature Grid with Spotlight Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, idx) => {
            const Icon = feature.icon
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: idx * 0.04 }}
              >
                <Link href={feature.href} className="block h-full">
                  <SpotlightCard className="h-full flex flex-col justify-between group hover:border-[#3a633a]/40 bg-white/80">
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <div className="p-3 rounded-xl bg-[#e0f0e0] text-[#2d4c2d] group-hover:bg-[#3a633a] group-hover:text-white transition-colors duration-300 shadow-sm">
                          <Icon className="w-6 h-6" />
                        </div>
                      </div>

                      <h3 className="text-xl font-bold text-[#2d4c2d] mb-2 group-hover:text-[#3a633a] transition-colors">
                        {feature.title}
                      </h3>

                      <p className="text-sm text-[#4a7a4a] leading-relaxed mb-6">
                        {feature.description}
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-[#3a633a]/10 text-xs font-semibold text-[#3a633a] group-hover:text-[#2d4c2d]">
                      <span>Open Module</span>
                      <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1.5 transition-transform" />
                    </div>
                  </SpotlightCard>
                </Link>
              </motion.div>
            )
          })}
        </div>
      </div>
    </div>
  )
}