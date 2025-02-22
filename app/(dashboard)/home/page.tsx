"use client"

import { useUser } from "@clerk/nextjs"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { useInView } from "react-intersection-observer"
import Loading from "@/components/loading"

const features = [
  {
    title: "Your Companion",
    description: "A supportive AI companion for emotional support",
    href: "/ai",
  },
  {
    title: "Activities",
    description: "Curated mindfulness exercises and relaxation techniques",
    href: "/activities",
  },
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
  {
    title: "Anonymous Chats",
    description: "Connect with others in a safe, confidential space",
    href: "/chats",
  },
  {
    title: "Story Generator",
    description: "Create personalized calming stories for relaxation",
    href: "/stories",
  },
  {
    title: "Community Forum",
    description: "Share experiences and find support in our welcoming community",
    href: "/community",
  },
  {
    title: "Goal Tracking",
    description: "Set and monitor your personal wellness objectives",
    href: "/goals",
  },
  {
    title: "Sleep Debt",
    description: "Monitor and manage your sleep patterns to reduce fatigue",
    href: "/sleep",
  },
  {
    title: "Feedback",
    description: "Share your thoughts to help us improve your experience",
    href: "/feedback",
  },
  {
    title: "Personalized Diet",
    description: "Get diet recommendations based on your mental & physical health",
    href: "/diet",
  },
  {
    title: "Track Physical Activities",
    description: "Track how you move and improve it too",
    href: "/fit",
  },
];

interface Feature {
  title: string
  description: string
  href: string
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
      <Link href={feature.href} className="block">
        <motion.div
          whileHover={{ scale: 1.05, rotate: 1 }}
          whileTap={{ scale: 0.98 }}
          className="group relative overflow-hidden rounded-xl bg-[#f3faf3] shadow-lg transition-all duration-300"
        >
          <motion.div
            initial={{ opacity: 0 }}
            whileHover={{ opacity: 1 }}
            className="absolute inset-0 bg-gradient-to-br from-[#e0f0e0] to-[#c8e6c8] transition-opacity duration-300"
          />
          <div className="relative z-10 p-6">
            <div className="flex items-center mb-4">
              <motion.div
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.5 }}
                className="bg-[#4a7a4a] rounded-full p-2 mr-3"
              >
                
              </motion.div>
              <h2 className="text-2xl font-bold text-[#2d4c2d]">{feature.title}</h2>
            </div>
            <p className="text-[#547454] transition-colors duration-300 text-lg">{feature.description}</p>
          </div>
          <motion.div
            initial={{ x: 0 }}
            whileHover={{ x: 8 }}
            transition={{ duration: 0.3 }}
            className="absolute bottom-4 right-4"
          >
          </motion.div>
        </motion.div>
      </Link>
    </motion.div>
  )
}

export default function DashboardPage() {
  const { user } = useUser()

  if (!user) return <Loading />

  return (
    <div className="font-montreal min-h-screen">
      <div className="container mx-auto px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <motion.h1
            className="text-5xl mb-4 text-[#2d4c2d]"
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, type: "spring", stiffness: 200 }}
          >
            Welcome to Healio, {user.firstName}!
          </motion.h1>
          <motion.p
            className="text-2xl text-[#547454]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.8 }}
          >
            Embark on your journey to inner peace and balance
          </motion.p>
        </motion.div>

        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.5 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {features.map((feature, index) => (
              <FeatureCard key={index} feature={feature} index={index} />
            ))}
          </motion.div>
        </AnimatePresence>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1 }}
          className="mt-20 text-center"
        >
          <Link href="/check-in">
            <motion.button
              whileHover={{ scale: 1.05, boxShadow: "0 10px 20px rgba(0,0,0,0.1)" }}
              whileTap={{ scale: 0.95 }}
              className="bg-[#4a7a4a] hover:bg-[#5c965c] text-white font-bold py-4 px-8 rounded-full transition-all duration-300 shadow-lg text-xl"
            >
              Personalize Your Journey
            </motion.button>
          </Link>
        </motion.div>
      </div>
    </div>
  )
}