import Image from "next/image";
import React from "react";

function Steps() {
  return (
    <Image
      src="/images/steps.png"
      height={1200}
      width={1200}
      alt="Your Image"
      className="w-full h-auto"
    />
  );
}

export default Steps;
