"use client"

import React, { useRef, useState } from "react"
import { motion, HTMLMotionProps } from "framer-motion"
import { cn } from "@/lib/utils"

interface SpotlightCardProps extends HTMLMotionProps<"div"> {
  children: React.ReactNode
  spotlightColor?: string
  borderColor?: string
  className?: string
}

export function SpotlightCard({
  children,
  spotlightColor = "rgba(74, 122, 74, 0.15)",
  borderColor = "rgba(74, 122, 74, 0.25)",
  className,
  ...props
}: SpotlightCardProps) {
  const cardRef = useRef<HTMLDivElement>(null)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [opacity, setOpacity] = useState(0)

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return
    const rect = cardRef.current.getBoundingClientRect()
    setPosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    })
  }

  const handleMouseEnter = () => setOpacity(1)
  const handleMouseLeave = () => setOpacity(0)

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className={cn(
        "relative overflow-hidden rounded-2xl border border-[#3a583a]/15 bg-white/80 backdrop-blur-md p-6 shadow-md transition-all duration-300 hover:shadow-xl hover:border-[#4a7a4a]/40",
        className
      )}
      {...props}
    >
      {/* Spotlight Radial Gradient Overlay */}
      <div
        className="pointer-events-none absolute -inset-px transition-opacity duration-300"
        style={{
          opacity,
          background: `radial-gradient(600px circle at ${position.x}px ${position.y}px, ${spotlightColor}, transparent 40%)`,
        }}
      />
      {/* Border Spotlight */}
      <div
        className="pointer-events-none absolute -inset-px rounded-2xl transition-opacity duration-300"
        style={{
          opacity,
          background: `radial-gradient(400px circle at ${position.x}px ${position.y}px, ${borderColor}, transparent 40%)`,
          maskImage: "linear-gradient(black, black) content-box, linear-gradient(black, black)",
          maskComposite: "exclude",
        }}
      />
      <div className="relative z-10">{children}</div>
    </motion.div>
  )
}
