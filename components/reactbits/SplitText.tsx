"use client"

import React from "react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

interface SplitTextProps {
  text: string
  className?: string
  delay?: number
  staggerDuration?: number
  by?: "word" | "character"
}

export function SplitText({
  text,
  className,
  delay = 0,
  staggerDuration = 0.05,
  by = "word",
}: SplitTextProps) {
  const items = by === "word" ? text.split(" ") : text.split("")

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: staggerDuration,
        delayChildren: delay,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20, filter: "blur(8px)" },
    visible: {
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      transition: { duration: 0.5, ease: [0.2, 0.65, 0.3, 0.9] },
    },
  }

  return (
    <motion.span
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className={cn("inline-flex flex-wrap gap-x-[0.25em]", className)}
    >
      {items.map((item, index) => (
        <motion.span key={index} variants={itemVariants} className="inline-block">
          {item}
        </motion.span>
      ))}
    </motion.span>
  )
}
