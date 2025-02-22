"use client";
import { UserButton } from '@clerk/nextjs';
import Image from 'next/image';
import React from 'react'

const navbar = () => {
  return (
    <div className='fixed z-[999] w-full px-20 py-1 font-montreal flex justify-between' style={{ backgroundColor: "#E5F4DD" }}>
      <div className='logo flex gap-8 items-center'>
        <Image src="/images/logohealio.png" alt="logo" height={120} width={100}/>

      </div>
      <div className="links flex gap-8 items-center">
        <Image src="/images/healio.png" alt="logo" height={120} width={100}/>
        <UserButton />
      </div>
    </div>
  )
}

export default navbar
