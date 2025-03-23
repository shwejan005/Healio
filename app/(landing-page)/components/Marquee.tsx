"use client";
import React from 'react'
import { motion } from "framer-motion"

const Marquee = () => {
  return (
    <div data-scroll data-scroll-section data-scroll-speed=".2" className=' w-full py-20   ' style={{ backgroundColor: "#A9C89A"}}>
        <div className="text border-t-2 border-b-2 flex whitespace-nowrap overflow-hidden font-grotesk uppercase pr-5">
        <motion.h1 initial={{x:0}} animate={{x:"-100%"}} transition={{ease:"linear", repeat: Infinity , duration:5}} className='text-[10vw] leading-none mb-5 pt-5'>We are Healio-</motion.h1>
        <motion.h1 initial={{x:0}} animate={{x:"-100%"}} transition={{ease:"linear", repeat: Infinity , duration:5}} className='text-[10vw] leading-none mb-5 pt-5'>We are Healio-</motion.h1>
        <motion.h1 initial={{x:0}} animate={{x:"-100%"}} transition={{ease:"linear", repeat: Infinity , duration:5}} className='text-[10vw] leading-none mb-5 pt-5'>We are Healio-</motion.h1>
        </div>
      
    </div>
  )
}

export default Marquee
