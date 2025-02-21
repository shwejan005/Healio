"use client"

import {
  BookHeart,
  BookOpen,
  Calendar,
  Home,
  MessageCircle,
  Plus,
  Sparkles,
  Target,
  Users2,
  BadgeCheck,
  Bell,
  LogOut,
  ChevronsUpDown,
  PersonStanding,
  MessageSquareWarning,
  Bed
} from "lucide-react";
import * as React from "react";
import { NavMain } from "@/components/nav-main";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuGroup,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useUser, useClerk } from "@clerk/nextjs";
import Link from "next/link";

const data = {
  navMain: [
    { title: "Home", href: "/home", icon: Home },
    { title: "Daily Mood Check-In", href: "/check-in", icon: Calendar },
    { title: "Gratitude Journal", href: "/gratitude", icon: BookHeart },
    { title: "Your Companion", href: "/ai", icon: PersonStanding },
    { title: "Activities", href: "/activities", icon: Plus },
    { title: "Story Generator", href: "/stories", icon: BookOpen },
    { title: "Community Forum", href: "/community", icon: Users2 },
    { title: "Goal Tracking", href: "/goals", icon: Target },
    { title: "Sleep Debt", href: "/sleep", icon: Bed },
    { title: "Anonymous Chats", href: "/chats", icon: MessageCircle },
    { title: "Feedback", href: "/feedback", icon: MessageSquareWarning },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user } = useUser();
  const { signOut } = useClerk();

  return (
    <Sidebar collapsible="icon" {...props} className="font-montreal border-r border-gray-300">
      <Link href='/'>
        <SidebarHeader>
          <img
            src="/images/healio.png"
            alt="logo"
            className="w-[100px] h-[80px]"
          />
        </SidebarHeader>
      </Link>

      <SidebarSeparator className="mb-7" />

      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>

      <SidebarFooter>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <div className="flex items-center space-x-3 p-3 border-t border-gray-200 cursor-pointer">
              <Avatar className="h-8 w-8 rounded-lg">
                <AvatarImage src={user?.imageUrl || "/default-avatar.png"} alt={user?.fullName || "User"} />
                <AvatarFallback className="rounded-lg">
                  {user?.fullName ? user.fullName.charAt(0) : "?"}
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="text-[#323d2c] truncate font-semibold">{user?.fullName || "Guest"}</span>
                <span className="truncate text-xs">{user?.primaryEmailAddress?.emailAddress || "guest@example.com"}</span>
              </div>
              <ChevronsUpDown className="ml-auto size-4" />
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg" align="end" sideOffset={4}>
            <DropdownMenuGroup>
              <DropdownMenuItem>
                <BadgeCheck />
                Account
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Bell />
                Notifications
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => signOut()}>
              <LogOut />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}