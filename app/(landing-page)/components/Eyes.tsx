"use client";

import React, { useEffect, useState } from "react";

const Eyes = () => {
  const [rotate, setRotate] = useState(0);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const mouseX = e.clientX;
      const mouseY = e.clientY;

      const deltaX = mouseX - window.innerWidth / 2;
      const deltaY = mouseY - window.innerHeight / 2;

      const angle = Math.atan2(deltaY, deltaX) * (180 / Math.PI);

      setRotate(angle - 180);
    };

    window.addEventListener("mousemove", handleMouseMove);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  return (
    <div className="eyes w-full h-screen overflow-hidden">
      <div className='relative w-full h-full bg-cover bg-center bg-[url("https://ochi.design/wp-content/uploads/2022/05/Top-Viewbbcbv-1-scaled.jpg")]'>
        <div className="absolute top-1/2 left-1/2 -translate-x-[50%] -translate-y-[50%] flex gap-10">
          {/* Left Eye */}
          <div className="rounded-full w-[15vw] h-[15vw] bg-zinc-100 flex items-center justify-center">
            <div className="relative rounded-full w-2/3 h-2/3 bg-black">
              <div
                style={{ transform: `translate(-50%,-50%) rotate(${rotate}deg)` }}
                className="absolute top-1/2 left-1/2 -translate-x-[50%] -translate-y-[50%] line w-full h-10"
              >
                <div className="rounded-full w-10 h-10 bg-zinc-100"></div>
              </div>
            </div>
          </div>

          {/* Right Eye */}
          <div className="rounded-full w-[15vw] h-[15vw] bg-zinc-100 flex items-center justify-center">
            <div className="relative rounded-full w-2/3 h-2/3 bg-black">
              <div
                style={{ transform: `translate(-50%,-50%) rotate(${rotate}deg)` }}
                className="absolute top-1/2 left-1/2 -translate-x-[50%] -translate-y-[50%] line w-full h-10"
              >
                <div className="rounded-full w-10 h-10 bg-zinc-100"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Eyes;