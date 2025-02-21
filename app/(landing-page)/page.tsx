"use client";

import About from "@/app/(landing-page)/components/About";
import Eyes from "@/app/(landing-page)/components/Eyes";
import Featured from "@/app/(landing-page)/components/Featured";
import Footer from "@/app/(landing-page)/components/Footer";
import LandingPage from "@/app/(landing-page)/components/LandingPage";
import Marquee from "@/app/(landing-page)/components/Marquee";
import Navbar from "@/app/(landing-page)/components/Navbar";
import Steps from "@/app/(landing-page)/components/Steps";
import React, { useEffect } from "react";

const Page = () => {
  useEffect(() => {
    const loadLocomotiveScroll = async () => {
      const LocomotiveScroll = (await import("locomotive-scroll")).default;
      new LocomotiveScroll();
    };

    loadLocomotiveScroll();
  }, []);

  return (
    <div className="w-full min-h-screen text-white" style={{ backgroundColor: "#E5F4DD" }}>
      <Navbar />
      <LandingPage />
      <Marquee />
      <About />
      <Eyes />
      <Featured />
      <Steps />
      <Footer />
    </div>
  );
};

export default Page;