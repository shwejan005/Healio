"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";

interface Workout {
  title: string;
  description: string;
  image: string;
  content: string;
}

export default function PhysicalActivities() {
  const [selectedWorkout, setSelectedWorkout] = useState<Workout | null>(null);

  const workouts: Workout[] = [
    {
      title: "Running",
      description: "A Great Way To Boost Endorphins And Clear Your Mind",
      image: "/images/running.jpg",
      content: "Running is great for cardiovascular health, helping you stay fit and healthy.",
    },
    {
      title: "Swimming",
      description: "Feel Light And Refreshed With This Full-Body Workout",
      image: "/images/swimming.jpg",
      content: "Swimming works all major muscle groups while being easy on the joints.",
    },
    {
      title: "Boxing",
      description: "Release Stress And Channel Your Energy Into Strength",
      image: "/images/boxing.png",
      content: "Boxing is an excellent workout for improving strength and stamina.",
    },
    {
      title: "Yoga",
      description: "Stretch, Strengthen, And Find Inner Peace",
      image: "/images/yoga.jpg",
      content: "Yoga helps with flexibility, balance, and mindfulness through different poses.",
    },
    {
      title: "Dancing",
      description: "Turn Up The Music And Let Loose",
      image: "/images/dancing.jpg",
      content: "Dancing is not only fun, but it’s also an excellent cardio workout.",
    },
  ];

  const handleCardClick = (workout: Workout) => {
    setSelectedWorkout(workout);
  };

  return (
    <div className="font-montreal flex min-h-screen bg-[#E5F4DD]">
      <div className="flex-1 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <Link
              href="/activities"
              className="inline-block px-4 py-2 bg-[#314328] text-white rounded-lg hover:bg-[#1f2b1f] transition-colors"
            >
              Back to Home
            </Link>
          </div>

          {/* Header Section */}
          <div className="text-center mb-8">
            <h1 className="text-5xl font-medium text-[#314328] mb-2">
              Get Moving With These Workouts
            </h1>
            <p className="text-gray-600">"Explore Activities You Can Do Anytime, Anywhere"</p>
          </div>

          {/* Workouts Section */}
          <Card className="p-6 bg-white rounded-lg shadow-lg">
            <div className="space-y-4">
              {workouts.map((workout, index) => (
                <TooltipProvider key={index}>
                  <Tooltip delayDuration={200}> {/* Reduced delay to 200ms */}
                    <TooltipTrigger asChild>
                      <Card
                        className="p-4 bg-[#F9FDF7] rounded-lg cursor-pointer"
                        onClick={() => handleCardClick(workout)} // Open dialog on click
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-16 h-16 relative rounded-lg overflow-hidden">
                            <Image
                              src={workout.image}
                              alt={`${workout.title} workout`}
                              layout="fill"
                              objectFit="cover"
                            />
                          </div>
                          <div className="text-left">
                            <h3 className="text-[#314328] font-medium">{workout.title}</h3>
                            <p className="text-gray-600 text-sm">{workout.description}</p>
                          </div>
                        </div>
                      </Card>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Click to learn more about {workout.title}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ))}

              {/* Dialog Section for more details */}
              {selectedWorkout && (
                <Dialog open={selectedWorkout !== null} onOpenChange={(open) => !open && setSelectedWorkout(null)}>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle>{selectedWorkout.title}</DialogTitle>
                      <DialogDescription>{selectedWorkout.description}</DialogDescription>
                    </DialogHeader>
                    <div className="mt-4">
                      <Image
                        src={selectedWorkout.image}
                        alt={selectedWorkout.title}
                        width={400}
                        height={300}
                        className="rounded-lg"
                      />
                      <p className="mt-4 text-gray-600">{selectedWorkout.content}</p>
                    </div>
                    <DialogClose asChild>
                      <button className="mt-4 px-4 py-2 bg-[#314328] text-white rounded-lg hover:bg-[#1f2b1f] transition-colors">
                        Close
                      </button>
                    </DialogClose>
                  </DialogContent>
                </Dialog>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
