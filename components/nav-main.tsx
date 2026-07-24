"use client"

import * as React from "react"
import { usePathname } from "next/navigation"
import Link from "next/link"
import { motion } from "framer-motion"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

export type NavItem = {
  title: string
  href: string
  icon: React.ElementType
}

export type NavCategory = {
  category: string
  items: NavItem[]
}

interface NavMainProps {
  categories: NavCategory[]
}

export function NavMain({ categories }: NavMainProps) {
  const pathname = usePathname()

  return (
    <div className="space-y-5 px-2">
      {categories.map((cat) => (
        <SidebarGroup key={cat.category} className="p-0">
          <SidebarGroupLabel className="text-[11px] font-bold uppercase tracking-wider text-[#4a7a4a]/70 px-3 mb-1.5">
            {cat.category}
          </SidebarGroupLabel>
          <SidebarMenu className="space-y-1">
            {cat.items.map((item) => {
              const isActive = pathname === item.href
              const Icon = item.icon

              return (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive}
                    tooltip={item.title}
                    className="relative group transition-all duration-200"
                  >
                    <Link
                      href={item.href}
                      className={`flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                        isActive
                          ? "bg-[#3a633a] text-white shadow-md font-semibold"
                          : "text-[#2d4c2d] hover:bg-[#e0f0e0]/70 hover:text-[#1e341e]"
                      }`}
                    >
                      <Icon
                        className={`w-4 h-4 transition-transform group-hover:scale-105 ${
                          isActive ? "text-white" : "text-[#4a7a4a]"
                        }`}
                      />
                      <span className="flex-1 truncate">{item.title}</span>

                      {/* Active indicator dot */}
                      {isActive && (
                        <motion.div
                          layoutId="activeNavDot"
                          className="w-1.5 h-1.5 rounded-full bg-white ml-auto"
                          transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        />
                      )}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )
            })}
          </SidebarMenu>
        </SidebarGroup>
      ))}
    </div>
  )
}