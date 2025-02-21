"use client"

import Link from 'next/link'
import Image from 'next/image'
import { Card } from "@/components/ui/card"
import { motion } from "framer-motion"

export default function WellnessHome() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="font-montreal flex min-h-screen bg-[#E5F4DD]"
    >
      <div className="flex-1 p-8">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut", delay: 0.2 }}
          className="max-w-4xl mx-auto"
        >
          {/* Header Section */}
          <div className="text-center mb-8">
            <h1 className="text-5xl font-medium text-[#314328] mb-2">
              Recenter Your Mind, Energize Your Body
            </h1>
            <p className="text-gray-600">
              Choose From Calming Mental Activities Or Invigorating Physical Workouts To Uplift Your Mood
              And Improve Your Overall Well-Being
            </p>
          </div>

          {/* Activity Cards */}
          <div className="grid md:grid-cols-2 gap-6">
            <Link href="/activities/mental">
              <motion.div 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="cursor-pointer"
              >
                <Card className="p-6 bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow">
                  <div className="aspect-square relative mb-4">
                    <Image
                      src="/images/relax.png"
                      alt="Headphones representing mental activities"
                      fill
                      className="rounded-lg object-cover"
                    />
                  </div>
                  <h2 className="text-2xl text-center font-medium text-[#314328]">
                    Relax And Recharge
                  </h2>
                </Card>
              </motion.div>
            </Link>

            <Link href="/activities/physical">
              <motion.div 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="cursor-pointer"
              >
                <Card className="p-6 bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow">
                  <div className="aspect-square relative mb-4">
                    <Image
                      src="/images/move.png"
                      alt="Group fitness representing physical activities"
                      fill
                      className="rounded-lg object-cover"
                    />
                  </div>
                  <h2 className="text-2xl text-center font-medium text-[#314328]">
                    Move And Energize
                  </h2>
                </Card>
              </motion.div>
            </Link>
          </div>
        </motion.div>
      </div>
    </motion.div>
  )
}