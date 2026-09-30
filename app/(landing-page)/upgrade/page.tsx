"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import Navbar from "../components/Navbar";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useUser } from "@clerk/nextjs";

declare global {
  interface Window {
    paypal?: PayPalSdk;
  }
}

type PayPalActions = {
  order: {
    create: (args: { purchase_units: Array<{ amount: { currency_code: string; value: string } }> }) => Promise<string>;
    capture: () => Promise<unknown>;
  };
};

type PayPalSdk = {
  Buttons: (options: {
    style: { layout: string; color: string; shape: string; label: string };
    createOrder: (_data: Record<string, unknown>, actions: PayPalActions) => Promise<string>;
    onApprove: (_data: Record<string, unknown>, actions: PayPalActions) => Promise<void>;
    onError: (error: unknown) => void;
  }) => { render: (container: HTMLElement) => Promise<void> | void };
};

export default function UpgradePage() {
  const { user } = useUser();
  const userEmail = user?.emailAddresses?.[0]?.emailAddress || ""; // Safe string
  const makeUserPremium = useMutation(api.users.makeUserPremium);
  const paypalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const paypalContainer = paypalRef.current;
    if (!paypalContainer || !userEmail) return; // Wait until email and container exist

    // Only inject PayPal script once
    if (!document.getElementById("paypal-sdk")) {
      const script = document.createElement("script");
      script.id = "paypal-sdk";
      script.src = `https://www.paypal.com/sdk/js?client-id=${process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID}&currency=USD`;
      script.async = true;

      script.onload = () => {
        if (window.paypal) {
          window.paypal
            .Buttons({
              style: {
                layout: "horizontal",
                color: "gold",
                shape: "rect",
                label: "pay",
              },
              createOrder: (_data: Record<string, unknown>, actions: PayPalActions) => {
                return actions.order.create({
                  purchase_units: [
                    {
                      amount: {
                        currency_code: "USD",
                        value: "2.99",
                      },
                    },
                  ],
                });
              },
              onApprove: async (_data: Record<string, unknown>, actions: PayPalActions) => {
                try {
                  await actions.order.capture();

                  // Convex mutation to mark user as premium
                  await makeUserPremium({ email: userEmail });
                  console.log("✅ User upgraded to premium in Convex!");
                } catch (err) {
                  console.error(
                    "❌ Error capturing order or updating user:",
                    err
                  );
                }
              },
              onError: (err: unknown) => {
                console.error("❌ PayPal Error:", err);
              },
            })
            .render(paypalContainer);
        }
      };

      document.body.appendChild(script);
    }

    return () => {
      paypalContainer.innerHTML = "";
    };
  }, [userEmail, makeUserPremium]);

  return (
    <div>
      <Navbar />
      <div
        data-scroll
        data-scroll-speed="-.8"
        className="w-full h-screen pt-1 bg-[url('/images/hero-img.png')] bg-cover bg-center"
      >
        <div className="textstructure text-[#E5F4DD] mt-40 px-20">
          {["Upgrade to Premium", "Unlock Full", "Access"].map((item, index) => (
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
                <h1 className="pt-[2vw] -mb-[.1vw] uppercase text-[8vw] leading-[.76] text-shadow-md text-center">
                  {item}
                </h1>
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-center items-center py-5 px-20 mt-12">
          <div ref={paypalRef} className="w-[300px]"></div>
        </div>
      </div>
    </div>
  );
}
