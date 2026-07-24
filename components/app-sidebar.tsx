"use client"

import * as React from "react"
import Link from "next/link"
import Image from "next/image"
import { useClerk, useUser } from "@clerk/nextjs"
import { NavMain, NavCategory } from "@/components/nav-main"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"
import {
  BadgeCheck,
  Bed,
  Bell,
  BookHeart,
  BookOpen,
  Calendar,
  ChevronsUpDown,
  Footprints,
  Home,
  LogOut,
  MessageCircle,
  MessageSquareWarning,
  PersonStanding,
  Plus,
  Soup,
  Target,
  Users2,
  Shield,
} from "lucide-react"

const categories: NavCategory[] = [
  {
    category: "Overview",
    items: [
      { title: "Home", href: "/home", icon: Home },
      { title: "Daily Mood Check-In", href: "/check-in", icon: Calendar },
    ],
  },
  {
    category: "AI & Support",
    items: [
      { title: "Your Companion", href: "/ai", icon: PersonStanding },
      { title: "Anonymous Chats", href: "/chats", icon: MessageCircle },
    ],
  },
  {
    category: "Mindfulness",
    items: [
      { title: "Gratitude Journal", href: "/gratitude", icon: BookHeart },
      { title: "Mindful Activities", href: "/activities", icon: Plus },
      { title: "Calming Stories", href: "/stories", icon: BookOpen },
      { title: "Community Forum", href: "/community", icon: Users2 },
    ],
  },
  {
    category: "Health & Habits",
    items: [
      { title: "Goal Tracking", href: "/goals", icon: Target },
      { title: "Sleep Debt", href: "/sleep", icon: Bed },
      { title: "Physical Activity", href: "/fit", icon: Footprints },
      { title: "Personalised Diet", href: "/diet", icon: Soup },
      { title: "Feedback", href: "/feedback", icon: MessageSquareWarning },
    ],
  },
]

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user } = useUser()
  const { signOut } = useClerk()

  return (
    <Sidebar
      collapsible="icon"
      {...props}
      className="font-montreal border-r border-[#3a633a]/15 bg-white/70 backdrop-blur-xl shadow-lg"
    >
      <SidebarHeader className="p-4 flex items-center justify-between">
        <Link href="/home" className="flex items-center gap-3 group">
          <div className="p-1.5 rounded-xl bg-white/80 shadow-sm border border-[#3a633a]/20 group-hover:scale-105 transition-transform">
            <Image
              src="/images/healio.png"
              height={36}
              width={36}
              alt="Healio Logo"
              className="w-8 h-8 object-contain"
            />
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-bold text-[#2d4c2d] tracking-tight group-hover:text-[#3a633a] transition-colors">
              Healio
            </span>
            <span className="text-[10px] font-medium text-[#4a7a4a] flex items-center gap-1">
              <Shield className="w-2.5 h-2.5 inline text-[#3a633a]" /> Sanctuary
            </span>
          </div>
        </Link>
      </SidebarHeader>

      <SidebarContent className="py-2 overflow-y-auto">
        <NavMain categories={categories} />
      </SidebarContent>

      <SidebarFooter className="p-3 border-t border-[#3a633a]/15 bg-white/40">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <div className="flex items-center space-x-3 p-2.5 rounded-xl hover:bg-[#e0f0e0]/60 transition-colors cursor-pointer border border-[#3a633a]/10 bg-white/60 shadow-sm">
              <div className="relative">
                <Avatar className="h-9 w-9 rounded-lg border border-[#3a633a]/20 shadow-sm">
                  <AvatarImage src={user?.imageUrl || "/default-avatar.png"} alt={user?.fullName || "User"} />
                  <AvatarFallback className="bg-[#3a633a] text-white font-bold rounded-lg">
                    {user?.fullName ? user.fullName.charAt(0) : "?"}
                  </AvatarFallback>
                </Avatar>
                <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 border-2 border-white rounded-full" />
              </div>
              <div className="grid flex-1 text-left text-xs leading-tight">
                <span className="text-[#2d4c2d] truncate font-bold">{user?.fullName || "Wellness Member"}</span>
                <span className="truncate text-[11px] text-[#4a7a4a]">
                  {user?.primaryEmailAddress?.emailAddress || "member@healio.app"}
                </span>
              </div>
              <ChevronsUpDown className="ml-auto size-4 text-[#4a7a4a]" />
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-56 rounded-2xl bg-white/95 backdrop-blur-xl border border-[#3a633a]/20 p-1.5 shadow-xl"
            align="end"
            sideOffset={6}
          >
            <DropdownMenuGroup>
              <Link href="/account">
                <DropdownMenuItem className="rounded-xl cursor-pointer focus:bg-[#f0f9ed] text-[#2d4c2d]">
                  <BadgeCheck className="w-4 h-4 mr-2 text-[#4a7a4a]" />
                  Account Profile
                </DropdownMenuItem>
              </Link>
              <DropdownMenuItem className="rounded-xl cursor-pointer focus:bg-[#f0f9ed] text-[#2d4c2d]">
                <Bell className="w-4 h-4 mr-2 text-[#4a7a4a]" />
                Notifications
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator className="bg-[#3a633a]/15 my-1" />
            <DropdownMenuItem
              onClick={() => signOut()}
              className="rounded-xl cursor-pointer focus:bg-rose-50 text-rose-700 font-medium"
            >
              <LogOut className="w-4 h-4 mr-2 text-rose-600" />
              Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  )
}