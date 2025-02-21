"use client"

import { useUser } from "@clerk/nextjs"
import Link from "next/link"
import { motion } from "framer-motion"
import { useInView } from "react-intersection-observer"
import { ChevronRight } from "lucide-react"
import Loading from "@/components/loading"

const features = [
  {
    title: "Healio AI",
    description: "Your personal AI companion for mental wellness guidance and support",
    href: "/ai",
  },
  { title: "Activities", description: "Curated mindfulness exercises and relaxation techniques", href: "/activities" },
  {
    title: "Daily Mood Check-In",
    description: "Track your emotional well-being and identify patterns",
    href: "/check-in",
  },
  {
    title: "Gratitude Journal",
    description: "Document daily moments of appreciation and positivity",
    href: "/gratitude",
  },
  { title: "Anonymous Chats", description: "Connect with others in a safe, confidential space", href: "/chats" },
  { title: "Story Generator", description: "Create personalized calming stories for relaxation", href: "/stories" },
  {
    title: "Community Forum",
    description: "Share experiences and find support in our welcoming community",
    href: "/community",
  },
  { title: "Goal Tracking", description: "Set and monitor your personal wellness objectives", href: "/goals" },
  {
    title: "Personalized Diet",
    description: "Get diet recommendations based on your mental & physical health",
    href: "/diet",
  },
]

interface Feature {
  title: string;
  description: string;
  href: string;
}

const FeatureCard = ({ feature, index }: { feature: Feature; index: number }) => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  })

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: index * 0.1 }}
    >
      <Link href={feature.href}>
        <div className="group relative overflow-hidden rounded-xl bg-[#e4f9e4] shadow-md transition-all duration-300 hover:shadow-lg hover:shadow-[#2d4c2d]/20">
          <div className="absolute inset-0 bg-gradient-to-br from-[#e0f0e0] to-[#c8e6c8] opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
          <div className="relative z-10 p-6">
            <h2 className="text-xl font-semibold text-[#2d4c2d] mb-2">{feature.title}</h2>
            <p className="text-[#547454] group-hover:text-[#2d4c2d] transition-colors duration-300">
              {feature.description}
            </p>
          </div>
          <ChevronRight className="absolute bottom-4 right-4 h-6 w-6 text-[#2d4c2d] opacity-0 transition-all duration-300 group-hover:opacity-100" />
        </div>
      </Link>
    </motion.div>
  )
}

export default function DashboardPage() {
  const { user } = useUser()

  if (!user) return <Loading />

  return (
    <div className="font-montreal min-h-screen ">
      <div className="container mx-auto px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h1 className="text-5xl font-bold mb-4 text-[#2d4c2d]">Welcome to Healio, {user.firstName}!</h1>
          <p className="text-xl text-[#547454]">Embark on your journey to inner peace and balance</p>
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1, delay: 0.5 }}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <FeatureCard key={index} feature={feature} index={index} />
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1 }}
          className="mt-16 text-center"
        >
          <Link href="/profile">
            <button className="bg-[#4a7a4a] hover:bg-[#5c965c] text-white font-bold py-3 px-6 rounded-full transition-colors duration-300">
              Personalize Your Journey
            </button>
          </Link>
        </motion.div>
      </div>
    </div>
  )
}

