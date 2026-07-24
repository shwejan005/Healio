"use client"

import React from "react"
import { cn } from "@/lib/utils"

interface GlowBadgeProps {
  children: React.ReactNode
  variant?: "emerald" | "amber" | "indigo" | "rose"
  className?: string
}

export function GlowBadge({
  children,
  variant = "emerald",
  className,
}: GlowBadgeProps) {
  const variantStyles = {
    emerald: "bg-emerald-50 text-emerald-800 border-emerald-300/60 shadow-emerald-500/10",
    amber: "bg-amber-50 text-amber-800 border-amber-300/60 shadow-amber-500/10",
    indigo: "bg-indigo-50 text-indigo-800 border-indigo-300/60 shadow-indigo-500/10",
    rose: "bg-rose-50 text-rose-800 border-rose-300/60 shadow-rose-500/10",
  }

  const dotStyles = {
    emerald: "bg-emerald-500",
    amber: "bg-amber-500",
    indigo: "bg-indigo-500",
    rose: "bg-rose-500",
  }

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border shadow-sm backdrop-blur-sm transition-all duration-300 hover:scale-105",
        variantStyles[variant],
        className
      )}
    >
      <span className={cn("w-1.5 h-1.5 rounded-full animate-ping", dotStyles[variant])} />
      <span>{children}</span>
    </span>
  )
}
