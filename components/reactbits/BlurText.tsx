"use client"

import React from "react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

interface BlurTextProps {
  children: React.ReactNode
  className?: string
  delay?: number
  duration?: number
}

export function BlurText({
  children,
  className,
  delay = 0.2,
  duration = 0.8,
}: BlurTextProps) {
  return (
    <motion.div
      initial={{ opacity: 0, filter: "blur(12px)", y: 15 }}
      animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
      transition={{ duration, delay, ease: "easeOut" }}
      className={cn(className)}
    >
      {children}
    </motion.div>
  )
}
