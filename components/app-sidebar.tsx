"use client"

import { NavMain } from "@/components/nav-main";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import { useClerk, useUser } from "@clerk/nextjs";
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
  Users2
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import * as React from "react";

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
    { title: "Physical Activity", href: "/fit", icon: Footprints },
    { title: "Personalised Diet", href: "/diet", icon: Soup },
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
          <Image
            src="/images/healio.png"
            height={40}
            width={40}
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
            <Link href='/account'>
              <DropdownMenuItem>
                <BadgeCheck />
                Account
              </DropdownMenuItem>
            </Link>
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