"use client";
import Image from 'next/image';
import React from 'react';

const Footer = () => {
  return (
    <div className='w-full h-screen bg-[#A9C89A] p-20 flex relative'>
      <div className="w-1/2 h-full flex flex-col justify-between font-grotesk">
        <div className='heading'>
          <h1 className='text-[8vw] uppercase leading-none -mb-7'>Take the First</h1>
          <h1 className='text-[8vw] uppercase leading-none -mb-7'>Step to a</h1>
          <h1 className='text-[8vw] uppercase leading-none -mb-10'>Healthier Mind</h1>
        </div>
      </div>
      <Image
        src="/images/healiowhite.png" 
        alt="Your Image" 
        height={110}
        width={280}
        className="absolute bottom-10 right-10" 
      />
    </div>
  );
}

export default Footer;
