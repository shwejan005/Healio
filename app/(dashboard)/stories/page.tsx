"use client"

import { useState } from 'react'
import { RefreshCw } from 'lucide-react'
import { motion } from "framer-motion"

// Utility function to sanitize text
const sanitizeText = (text: string) => {
  return text
    .replace(/[*]/g, "") // Remove asterisks
    .replace(/[\/]/g, "") // Remove slashes
    .replace(/\n/g, "<br />") // Replace newlines with HTML line breaks
    .trim(); // Remove extra whitespace from the beginning and end
};

export default function AutoStoryGenerator() {
  const [generatedStory, setGeneratedStory] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)

  const generateStory = async () => {
    setIsGenerating(true)
    try {
      const response = await fetch("/api/generategemini", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ generateNew: true }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Unknown error occurred")
      }

      const data = await response.json()
      const sanitizedStory = sanitizeText(data.story || "No story generated.")
      setGeneratedStory(sanitizedStory)
    } catch (error) {
      console.error("Error:", error)
      setGeneratedStory(`Error: ${error}`)
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="font-montreal flex min-h-screen bg-[#E5F4DD] items-center justify-center"
    >
      <main className="flex-1 p-8">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut", delay: 0.2 }}
          className="max-w-4xl mx-auto"
        >
          <div className="text-center mb-12">
            <h1 className="text-5xl font-medium text-[#314328] mb-4">
              Need A Boost Of Inspiration?
            </h1>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Discover Motivational Stories Crafted Just For You. Let Healio AI Brighten Your Day With Tales Of
              Resilience, Hope, And Positivity.
            </p>
          </div>

          <div className="space-y-6">
            <motion.button
              onClick={generateStory}
              disabled={isGenerating}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-full py-4 px-6 rounded-lg bg-[#A5C49C] hover:bg-[#94b38b] transition-colors text-white font-medium focus:outline-none focus:ring-2 focus:ring-[#526D4E]/20 disabled:opacity-50 flex items-center justify-center"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                  Generating Story...
                </>
              ) : (
                <>
                  <RefreshCw className="w-5 h-5 mr-2" />
                  Generate New Story
                </>
              )}
            </motion.button>

            {generatedStory && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: "easeOut", delay: 0.3 }}
                className="w-full min-h-[200px] p-6 rounded-lg border border-[#526D4E]/20 bg-white/80 text-[#526D4E]"
              >
                {isGenerating ? (
                  <div className="flex items-center justify-center h-full">
                    <RefreshCw className="w-8 h-8 animate-spin text-[#526D4E]" />
                  </div>
                ) : (
                  <p dangerouslySetInnerHTML={{ __html: generatedStory }}></p>
                )}
              </motion.div>
            )}
          </div>
        </motion.div>
      </main>
    </motion.div>
  )
}