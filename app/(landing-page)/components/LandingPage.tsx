"use client";

import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

function LandingPage() {
  const { isSignedIn } = useUser();
  const router = useRouter();

  const handleButtonClick = () => {
    if (isSignedIn) {
      router.push("/home");
    } else {
      router.push("/sign-in");
    }
  };

  return (
    <div
      data-scroll
      data-scroll-speed="-.8"
      className="w-full h-screen pt-1 bg-[url('/images/hero-img.png')] bg-cover bg-center"
    >
      <div className="textstructure mt-40 px-20">
        {["Empowering Your Mind,", "One Step", "at a Time"].map(
          (item, index) => (
            <div key={index} className="masker">
              <div className="w-full flex items-center justify-center overflow-hidden">
                {index === 1 && (
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: "9vw" }}
                    transition={{ ease: [0.76, 0, 0.24, 1], duration: 1.1 }}
                    className="mr-[1vw] mt-[50px] w-[8vw] rounded-md h-[5.7vw] relative bg-green-500 bg-cover bg-center"
                    style={{
                      backgroundImage: "url('/images/hero-small-img.png')",
                    }}
                  ></motion.div>
                )}
                <h1 className="pt-[2vw] -mb-[.1vw] uppercase text-[8vw] leading-[.76] font-grotesk text-shadow-md text-center">
                  {item}
                </h1>
              </div>
            </div>
          )
        )}
      </div>

      <div className="flex justify-center items-center py-5 px-20 mt-12">
        <button
          onClick={handleButtonClick}
          className="px-11 py-3 text-white rounded-full text-xl font-montreal hover:bg-zinc-700 transition duration-300 border-2"
          style={{ backgroundColor: "#89AE76", borderColor: "white" }}
        >
          Get Started
        </button>
      </div>
    </div>
  );
}

export default LandingPage;