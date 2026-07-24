"use client"

import React from "react"
import { usePathname } from "next/navigation"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { useUser, UserButton } from "@clerk/nextjs"
import { ChevronRight, Home, Search, Bell, Sparkles } from "lucide-react"

const pageTitles: Record<string, { title: string; section: string }> = {
  "/home": { title: "Dashboard Overview", section: "Overview" },
  "/check-in": { title: "Daily Mood Check-In", section: "Overview" },
  "/ai": { title: "Your Companion", section: "AI & Support" },
  "/chats": { title: "Anonymous Support Network", section: "AI & Support" },
  "/gratitude": { title: "Gratitude Journal", section: "Mindfulness" },
  "/activities": { title: "Mindful Activities", section: "Mindfulness" },
  "/stories": { title: "Calming Stories", section: "Mindfulness" },
  "/community": { title: "Community Forum", section: "Mindfulness" },
  "/goals": { title: "Goal Tracking", section: "Health & Habits" },
  "/sleep": { title: "Sleep Debt Manager", section: "Health & Habits" },
  "/fit": { title: "Physical Activity Log", section: "Health & Habits" },
  "/diet": { title: "Personalised Diet Plan", section: "Health & Habits" },
  "/feedback": { title: "Feedback & Suggestions", section: "Health & Habits" },
  "/account": { title: "Account & Analytics", section: "Profile" },
}

export function DashboardHeader() {
  const pathname = usePathname()
  const { user } = useUser()
  const pageInfo = pageTitles[pathname] || { title: "Dashboard", section: "Healio" }

  return (
    <header className="sticky top-0 z-40 w-full h-16 bg-white/80 backdrop-blur-xl border-b border-[#3a633a]/15 px-4 sm:px-6 flex items-center justify-between shadow-xs">
      {/* Left: Sidebar Toggle + Breadcrumb */}
      <div className="flex items-center gap-3">
        <SidebarTrigger className="h-9 w-9 rounded-xl bg-white border border-[#3a633a]/20 hover:bg-[#e0f0e0] text-[#2d4c2d] transition-colors shadow-xs" />

        <div className="h-4 w-px bg-[#3a633a]/20 hidden sm:block" />

        <div className="flex items-center gap-1.5 text-xs font-semibold text-[#4a7a4a]">
          <Home className="w-3.5 h-3.5 text-[#3a633a]" />
          <span className="hidden sm:inline">{pageInfo.section}</span>
          <ChevronRight className="w-3 h-3 text-slate-400 hidden sm:inline" />
          <span className="text-[#2d4c2d] font-bold text-sm sm:text-base">
            {pageInfo.title}
          </span>
        </div>
      </div>

      {/* Right: Search, Notifications & User Avatar */}
      <div className="flex items-center gap-3">
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/80 border border-[#3a633a]/20 text-xs text-[#4a7a4a] shadow-xs">
          <Search className="w-3.5 h-3.5 text-[#3a633a]" />
          <span>Search...</span>
          <kbd className="px-1.5 py-0.5 rounded bg-[#e0f0e0] text-[10px] font-mono text-[#2d4c2d]">⌘K</kbd>
        </div>

        <div className="flex items-center gap-2">
          <UserButton
            appearance={{
              elements: {
                avatarBox: "w-9 h-9 rounded-xl border border-[#3a633a]/30 shadow-xs",
              },
            }}
          />
        </div>
      </div>
    </header>
  )
}
