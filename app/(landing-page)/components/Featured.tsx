"use client";
import Image from "next/image";
import React from "react";

const About = () => {
  return (
    <div className="block -mt-5 w-full p-20 rounded-tl-3xl rounded-tr-3xl bg-[#A9C89A]">
      {/* Top border (using hr for full-width border) */}
      <hr className="border-t-[1px] border-[#99AD53] w-full mb-10" />

      <div className="w-full flex items-center gap-10">
        {/* Left side: Text */}
        <div className="w-1/2 text-left">
          {/* Heading */}
          <h1 className="font-montreal p-8 text-[3.7vw] leading-[4.5vw] tracking-tight">
            Why choose Healio?
          </h1>

          <div className="w-full p-8">
            {/* Feature 1 */}
            <div className="mb-10">
              <h2 className="text-4xl">AI-Powered Emotional Support</h2>
              <p className="text-2xl text-[#374C2D] mt-2">
                <i>
                  {"Engage in meaningful conversations with our chatbot, trained to provide empathetic support and personalized recommendations."}
                </i>
              </p>
            </div>

            {/* Feature 2 */}
            <div className="mb-10">
              <h2 className="text-4xl">Mood Tracking and Insights</h2>
              <p className="text-2xl text-[#374C2D] mt-2">
                <i>
                  {"Log your feelings and gain actionable insights into your emotional patterns with AI-powered analytics."}
                </i>
              </p>
            </div>

            {/* Feature 3 */}
            <div className="mb-10">
              <h2 className="text-4xl">Guided Wellness Activities</h2>
              <p className="text-2xl text-[#374C2D] mt-2">
                <i>
                  {"Access guided meditations, CBT-based exercises, and mindfulness tools tailored to your needs."}
                </i>
              </p>
            </div>

            {/* Feature 4 */}
            <div className="mb-10">
              <h2 className="text-4xl">Community and Crisis Support</h2>
              <p className="text-2xl text-[#374C2D] mt-2">
                <i>
                  {"Connect with others in a safe, moderated community or reach out to crisis helplines when you need urgent help."}
                </i>
              </p>
            </div>
          </div>
        </div>

        {/* Right side: Image */}
        <div className="flex justify-end w-1/2 px-[110px]">
          <Image
            src="/images/featured-image.png"
            alt="About Image"
            height={500}
            width={500}
            className="rounded-lg object-cover"
            style={{ width: "500px", height: "500px" }}
          />
        </div>
      </div>

      {/* Bottom border (using hr for full-width border) */}
      <hr className="border-t-[1px] border-[#99AD53] w-full mt-10" />
    </div>
  );
};

export default About;