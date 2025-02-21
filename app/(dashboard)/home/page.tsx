"use client";
import { useUser } from "@clerk/nextjs";
import Link from "next/link";
import { WobbleCard } from "@/components/ui/wobble-card"; 
import Loading from "@/components/loading";

const features = [
  { title: "Healio AI", description: "Your personal AI companion for mental wellness guidance and support", href: "/ai" },
  { title: "Activities", description: "Curated mindfulness exercises and relaxation techniques", href: "/activities" },
  { title: "Daily Mood Check-In", description: "Track your emotional well-being and identify patterns", href: "/check-in" },
  { title: "Gratitude Journal", description: "Document daily moments of appreciation and positivity", href: "/gratitude" },
  { title: "Anonymous Chats", description: "Connect with others in a safe, confidential space", href: "/chats" },
  { title: "Story Generator", description: "Create personalized calming stories for relaxation", href: "/stories" },
  { title: "Community Forum", description: "Share experiences and find support in our welcoming community", href: "/community" },
  { title: "Goal Tracking", description: "Set and monitor your personal wellness objectives", href: "/goals" },
  { title: "Personalized Diet", description: "Get diet recommendations based on your mental & physical health", href: "/diet" },
];

export default function DashboardPage() {
  const { user } = useUser();

  if (!user) return <Loading />;

  return (
    <div className="font-montreal">
      <div className="flex-1 p-8">
        <h1 className="text-4xl font-medium text-[#2d4c2d] mb-2">
          Hey {user.firstName}!, Welcome To Healio!
        </h1>
        <p className="text-[#547454] text-lg mb-8">
          Ready to take the next step toward a calmer, more balanced life?
          <br />
          Explore our tools and resources designed just for you.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 border border-[#2d4c2d]/20 bg-[#f4faf1]/50 p-6 rounded-xl">
          {features.map((feature, index) => (
            <Link key={index} href={feature.href}>
              <WobbleCard containerClassName="bg-[#f4faf1] min-h-[200px] border border-[#2d4c2d]/20 rounded-lg shadow-lg shadow-[#2d4c2d]/10 transition-all hover:shadow-[#2d4c2d]/20">
                <div className="p-4">
                  <h2 className="text-xl font-semibold text-[#2d4c2d]">
                    {feature.title}
                  </h2>
                  <p className="mt-2 text-[#547454]">{feature.description}</p>
                </div>
              </WobbleCard>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}