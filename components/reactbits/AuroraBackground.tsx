"use client"

import React, { ReactNode } from "react"
import { cn } from "@/lib/utils"

interface AuroraBackgroundProps extends React.HTMLProps<HTMLDivElement> {
  children?: ReactNode
  showRadialGradient?: boolean
}

export function AuroraBackground({
  className,
  children,
  showRadialGradient = true,
  ...props
}: AuroraBackgroundProps) {
  return (
    <div
      className={cn(
        "relative flex flex-col items-center justify-center bg-[#f0f9ed] text-slate-950 transition-colors overflow-hidden",
        className
      )}
      {...props}
    >
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className={cn(
            `
            [--white-gradient:repeat-linear-gradient(100deg,var(--white)_0%,var(--white)_7%,var(--transparent)_10%,var(--transparent)_12%,var(--white)_16%)]
            [--dark-gradient:repeat-linear-gradient(100deg,var(--black)_0%,var(--black)_7%,var(--transparent)_10%,var(--transparent)_12%,var(--black)_16%)]
            [--aurora:repeat-linear-gradient(100deg,#4a7a4a_10%,#88c488_15%,#3a633a_20%,#b2e0b2_25%,#2d4c2d_30%)]
            [background-image:var(--aurora)]
            [background-size:300%_200%]
            [background-position:50%_50%]
            filter blur-[25px] opacity-40
            after:content-[""] after:absolute after:inset-0 after:[background-image:var(--aurora)]
            after:[background-size:200%_100%] 
            after:animate-aurora after:[background-attachment:fixed] after:mix-blend-difference
            pointer-events-none
            absolute -inset-[10px] opacity-30
          `,
            showRadialGradient &&
              `[mask-image:radial-gradient(ellipse_at_100%_0%,black_10%,var(--transparent)_70%)]`
          )}
        />
        {/* Glowing ambient orbs */}
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-[#88c488]/30 rounded-full blur-3xl animate-pulse" />
        <div
          className="absolute -bottom-24 -right-24 w-96 h-96 bg-[#2d4c2d]/20 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "2s" }}
        />
      </div>
      {children}
    </div>
  )
}
