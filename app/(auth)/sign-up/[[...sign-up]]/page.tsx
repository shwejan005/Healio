"use client"

import { SignUp } from "@clerk/nextjs"
import React from "react"
import Image from "next/image"
import Link from "next/link"
import { motion } from "framer-motion"
import { AuroraBackground } from "@/components/reactbits/AuroraBackground"
import { ParticleBackground } from "@/components/reactbits/ParticleBackground"
import { SplitText } from "@/components/reactbits/SplitText"
import { BlurText } from "@/components/reactbits/BlurText"
import { GlowBadge } from "@/components/reactbits/GlowBadge"
import { Compass, Sparkles, UserPlus } from "lucide-react"

export default function SignUpPage() {
  return (
    <AuroraBackground className="min-h-screen w-full relative justify-center">
      <ParticleBackground />

      <div className="relative z-10 container mx-auto px-4 py-8 flex flex-col md:flex-row items-center justify-center gap-12 max-w-6xl">
        {/* Left Side: Brand Story & Aesthetics */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="flex-1 text-left max-w-lg"
        >
          <Link href="/" className="inline-flex items-center gap-3 mb-6 group">
            <div className="p-2 rounded-2xl bg-white/80 shadow-md group-hover:scale-105 transition-transform">
              <Image
                src="/images/healio.png"
                width={48}
                height={48}
                alt="Healio logo"
                className="w-12 h-10 object-contain"
              />
            </div>
            <span className="text-3xl font-extrabold text-[#2d4c2d] tracking-tight">
              Healio
            </span>
          </Link>

          <div className="flex flex-wrap gap-2 mb-6">
            <GlowBadge variant="emerald">
              <UserPlus className="w-3 h-3 inline mr-1" /> Join Free
            </GlowBadge>
            <GlowBadge variant="indigo">
              <Compass className="w-3 h-3 inline mr-1" /> Guided Wellness
            </GlowBadge>
            <GlowBadge variant="amber">
              <Sparkles className="w-3 h-3 inline mr-1" /> AI Insights
            </GlowBadge>
          </div>

          <h1 className="text-4xl sm:text-5xl font-extrabold text-[#2d4c2d] leading-tight mb-4">
            <SplitText text="Begin your wellness journey today" />
          </h1>

          <BlurText delay={0.3} className="text-lg text-[#3e5f3e] leading-relaxed mb-8">
            Create your account to unlock personalized AI emotional support, daily mood tracking, gratitude journaling, and community connections.
          </BlurText>

          {/* Feature Highlight Pill List */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            className="space-y-3"
          >
            {[
              "Personalized AI Companion tailored to your feelings",
              "Private gratitude journal & sleep debt tracking",
              "100% confidential & supportive community environment",
            ].map((feat, idx) => (
              <div
                key={idx}
                className="flex items-center gap-3 p-3 rounded-xl bg-white/60 backdrop-blur-md border border-[#3e5f3e]/15 text-[#2d4c2d] text-sm font-medium"
              >
                <div className="w-6 h-6 rounded-full bg-[#4a7a4a] text-white flex items-center justify-center text-xs font-bold">
                  ✓
                </div>
                <span>{feat}</span>
              </div>
            ))}
          </motion.div>
        </motion.div>

        {/* Right Side: Glassmorphic Auth Form */}
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="relative group"
        >
          <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-[#4a7a4a]/40 to-[#88c488]/40 blur-xl opacity-70 group-hover:opacity-100 transition duration-1000" />

          <div className="relative rounded-3xl bg-white/85 backdrop-blur-xl border border-white/80 p-3 sm:p-6 shadow-2xl">
            <SignUp
              appearance={{
                elements: {
                  card: "bg-transparent shadow-none p-0 border-none",
                  headerTitle: "text-2xl font-bold text-[#2d4c2d]",
                  headerSubtitle: "text-[#4a7a4a]",
                  socialButtonsBlockButton:
                    "bg-white/80 border border-[#3a583a]/20 text-[#2d4c2d] hover:bg-[#f0f9ed] transition-colors rounded-xl font-medium",
                  formButtonPrimary:
                    "bg-[#3a633a] hover:bg-[#2d4c2d] text-white shadow-md rounded-xl py-3 font-semibold transition-all duration-300",
                  formFieldInput:
                    "rounded-xl border-[#3a583a]/20 bg-white/70 focus:border-[#3a633a] focus:ring-[#3a633a]/20",
                  footerActionLink: "text-[#3a633a] font-semibold hover:underline",
                },
              }}
            />
          </div>
        </motion.div>
      </div>
    </AuroraBackground>
  )
}