"use client";
import { SignedIn, UserButton } from '@clerk/nextjs';
import Image from 'next/image';
import Link from 'next/link';
import React from 'react';

const Navbar = () => {
  return (
    <div
      className="fixed z-[999] w-full px-20 py-1 font-montreal flex justify-between"
      style={{ backgroundColor: "#E5F4DD" }}
    >
      <Link href={'/'} className="logo flex gap-8 items-center">
        <Image src="/images/logohealio.png" alt="logo" height={120} width={100}/>
      </Link>

      <div className="links flex gap-6 items-center">
        <Link href={'/'}>
          <Image src="/images/healio.png" alt="logo" height={120} width={100}/>
        </Link>
        <SignedIn>
          <Link
            href="/upgrade"
            className="px-5 py-2 rounded-full text-[#547454] border border-[#547454] font-semibold shadow-lg hover:scale-105 transition-all ease-linear duration-300"
          >
            Upgrade
          </Link>
        </SignedIn>

        <UserButton />
      </div>
    </div>
  );
};

export default Navbar;