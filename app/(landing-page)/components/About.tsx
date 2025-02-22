"use client";
import Image from 'next/image';
import React from 'react';

const About = () => {
  return (
    <div className='block -mt-5 w-full p-20 rounded-tl-3xl rounded-tr-3xl'>
      {/* Top border */}
      <hr className="border-t-[1px] border-[#99AD53] w-full mb-10" />
      
      <div className="w-full flex justify-between items-center gap-10">
        {/* Left side: Image */}
        <div className="w-1/2">
          <Image 
            src="/images/sunshine.png" 
            alt="About Image"
            className="rounded-lg object-cover" 
            width={300}
            height={300} 
          />
        </div>

        {/* Right side: Text */}
        <div className="w-1/2 text-right">
          {/* Heading */}
          <h1 className='font-montreal text-[3.7vw] leading-[4.5vw] tracking-tight text-[#374D2D]'>
            About The Platform
          </h1>

          {/* Paragraph */}
          <p className="mt-5 text-[1.6vw] text-[#374C2D] font-montreal">
            Welcome to Healio, your personal mental wellness companion. 
            We use cutting-edge AI and cloud-based technology to create a safe, supportive environment where you can explore your emotions, build resilience, and achieve peace of mind. Whether you&apos;re managing stress, looking for motivation, or simply need someone to talk to, we are here to help.
          </p>
        </div>
      </div>

      {/* Bottom border */}
      <hr className="border-t-[1px] border-[#99AD53] w-full mt-10" />
    </div>
  );
};

export default About;