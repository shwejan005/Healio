"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { PlayCircle, StopCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";

interface RelaxingSound {
  label: string;
  audio: string;
  image: string;
  video: string;
}

interface Game {
  label: string;
  image: string;
  link: string;
}

export default function MentalActivities() {
  const [currentAudio, setCurrentAudio] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentVideo, setCurrentVideo] = useState<string | undefined>(undefined);
  const [isClient, setIsClient] = useState(false); // Track if we are on the client side
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const relaxingSounds: RelaxingSound[] = [
    {
      label: "Ocean Waves 🌊",
      audio: "/assets/oceanwaves.mp3",
      image: "/images/oceanwaves.jpg",
      video: "/videos/oceanwaves.mp4",
    },
    {
      label: "Rainfall 🌧️",
      audio: "/assets/rainfall.mp3",
      image: "/images/rainfall.jpg",
      video: "/videos/rainfall.mp4",
    },
    {
      label: "Forest Ambience 🌲",
      audio: "/assets/forest.mp3",
      image: "/images/forest.jpg",
      video: "/videos/forest.mp4",
    },
  ];

  const games: Game[] = [
    {
      label: "Tetris",
      image: "/images/tetris.png",
      link: "/activities/mental/games/tetris",
    },
    {
      label: "Snake Game",
      image: "/images/snakegame.png",
      link: "/activities/mental/games/snake",
    },
    {
      label: "Minesweeper",
      image: "/images/mine.png",
      link: "/activities/mental/games/minesweeper",
    },
  ];

  useEffect(() => {
    setIsClient(true); // Set the flag to true when the component is mounted on the client side
  }, []);

  const toggleAudio = (audioSrc: string) => {
    if (isPlaying && audioSrc === currentAudio) {
      audioRef.current?.pause();
      audioRef.current!.currentTime = 0;
      setIsPlaying(false);
    } else {
      if (currentAudio !== audioSrc) {
        audioRef.current = new Audio(audioSrc); // Initialize the audio on the client side
      }
      audioRef.current?.play();
      setCurrentAudio(audioSrc);
      setIsPlaying(true);
    }
  };
  const stopAudio = () => {
    audioRef.current?.pause();
    audioRef.current!.currentTime = 0;
    setIsPlaying(false);
  };

  if (!isClient) return null; // Render nothing on the server-side

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
              Relax Your Mind with These Activities
            </h1>
            <p className="text-gray-600">
              &quot;Explore Activities You Can Do Anytime, Anywhere&quot;
            </p>
          </div>

          {/* Relaxing Sounds */}
          <div className="mb-12">
            <h2 className="text-3xl font-semibold text-[#314328] mb-6">
              Relaxing Sounds 🎵
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relaxingSounds.map((sound) => (
                <Card key={sound.label} className="p-4 rounded-lg shadow-lg bg-white">
                  <Image 
                    src={sound.image} 
                    alt={sound.label} 
                    height={400}
                    width={400}
                    className="w-full h-48 object-cover rounded-lg"
                  />
                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-lg font-medium">{sound.label}</span>
                    {isPlaying && currentAudio === sound.audio ? (
                      <StopCircle className="text-red-500 cursor-pointer" onClick={stopAudio} size={30} />
                    ) : (
                      <PlayCircle className="w-8 h-8 text-[#314328] hover:scale-110 transition-transform cursor-pointer" />
                    )}
                  </div>
                  <Dialog>
                    <DialogTrigger>
                      <Button className="px-3 py-1 mt-2 text-white bg-[#314328] rounded-lg hover:bg-[#1f2b1f] transition">
                        Watch Video 🎥
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>{sound.label} Video</DialogTitle>
                        <DialogDescription>
                          <video controls className="w-full rounded-md">
                            <source src={currentVideo} type="video/mp4" />
                          </video>
                        </DialogDescription>
                      </DialogHeader>
                      <DialogClose />
                    </DialogContent>
                  </Dialog>
                </Card>
              ))}
            </div>
          </div>

          {/* Games */}
          <div className="mb-12">
            <h2 className="text-3xl font-semibold text-[#314328] mb-6">Brain Games 🎮</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {games.map((game) => (
                <TooltipProvider key={game.label}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Link href={game.link}>
                        <Card className="p-4 rounded-lg shadow-lg bg-white cursor-pointer">
                          <Image src={game.image} alt={game.label} width={300} height={200} className="rounded-md" />
                          <div className="mt-4 text-center text-lg font-medium">{game.label}</div>
                        </Card>
                      </Link>
                    </TooltipTrigger>
                    <TooltipContent>{game.label}</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}