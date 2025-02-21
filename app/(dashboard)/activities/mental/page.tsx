'use client'
import React, { useState, useRef } from "react";
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

export default function MentalActivities() {
  const [currentAudio, setCurrentAudio] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentVideo, setCurrentVideo] = useState(null);
  const audioRef = useRef(new Audio());

  // Relaxing Sounds Data
  const relaxingSounds = [
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

  // Games Data
  const games = [
    {
      label: "Tetris",
      image: "/images/tetris.png",
      link: "/activities/mental/games/tetris", // Fixed route
    },
    {
      label: "Snake Game",
      image: "/images/snakegame.png",
      link: "/activities/mental/games/snake", // Fixed route
    },
    {
      label: "Minesweeper",
      image: "/images/mine.png",
      link: "/activities/mental/games/minesweeper", // Fixed route
    },
  ];

  // Play or stop audio
  const toggleAudio = (audioSrc) => {
    if (isPlaying && audioSrc === currentAudio) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlaying(false);
    } else {
      if (currentAudio !== audioSrc) {
        audioRef.current.src = audioSrc;
      }
      audioRef.current.play();
      setCurrentAudio(audioSrc);
      setIsPlaying(true);
    }
  };

  // Set video for dialog
  const setVideo = (videoSrc) => {
    setCurrentVideo(videoSrc);
  };

  // Stop audio when dialog closes
  const stopAudio = () => {
    audioRef.current.pause();
    audioRef.current.currentTime = 0;
    setIsPlaying(false);
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
              Calm Your Mind With These Activities
            </h1>
            <p className="text-gray-600">"Find Your Peace"</p>
          </div>

          {/* Relaxing Sound</div>s Section */}
          <Card className="p-6 bg-white rounded-lg shadow-lg mb-6">
            <h2 className="text-2xl font-medium text-[#314328] mb-4">Relaxing Sounds</h2>
            <p className="text-gray-600 mb-4">"Immerse Yourself In Peaceful Sounds"</p>

            <div className="grid md:grid-cols-3 gap-4">
              {relaxingSounds.map((sound, index) => (
                <TooltipProvider key={index}>
                  <Tooltip delayDuration={200}>
                    <TooltipTrigger asChild>
                      <Card className="p-4 bg-[#F9FDF7] rounded-lg overflow-hidden">
                        <Dialog>
                          <DialogTrigger asChild>
                            <div
                              className="cursor-pointer"
                              onClick={() => setVideo(sound.video)}
                            >
                              <div className="aspect-video relative mb-4">
                                <Image
                                  src={sound.image}
                                  alt={sound.label}
                                  fill
                                  className="object-cover rounded-lg"
                                />
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-[#314328] font-medium">{sound.label}</span>
                              </div>
                            </div>
                          </DialogTrigger>
                          <DialogContent
                            className="sm:max-w-[425px]"
                            onClose={stopAudio}
                          >
                            <DialogHeader>
                              <DialogTitle>{sound.label} Video</DialogTitle>
                              <DialogDescription>
                                Enjoy the visuals along with the sounds.
                              </DialogDescription>
                            </DialogHeader>
                            <div className="mt-4">
                              <video
                                key={currentVideo}
                                src={currentVideo}
                                controls
                                autoPlay
                                className="w-full rounded-lg"
                              />
                            </div>
                            <DialogClose asChild>
                              <button
                                className="mt-4 px-4 py-2 bg-[#314328] text-white rounded-lg hover:bg-[#1f2b1f] transition-colors"
                                onClick={stopAudio}
                              >
                                Close
                              </button>
                            </DialogClose>
                          </DialogContent>
                        </Dialog>
                        <button
                          className="mt-2 p-2 bg-[#314328] text-white rounded-full hover:bg-[#1f2b1f] transition-colors"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleAudio(sound.audio);
                          }}
                        >
                          {isPlaying && currentAudio === sound.audio ? (
                            <StopCircle size={24} />
                          ) : (
                            <PlayCircle size={24} />
                          )}
                        </button>
                      </Card>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Click to watch video, Click play button to listen to sound</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ))}
            </div>
          </Card>

          {/* Games Section */}
          <Card className="p-6 bg-white rounded-lg shadow-lg">
            <h2 className="text-2xl font-medium text-[#314328] mb-4">Games For Relaxation</h2>
            <p className="text-gray-600 mb-4">"Engage Your Brain And Relax With Simple Fun Games"</p>

            <div className="grid md:grid-cols-2 gap-6">
              {games.map((game, index) => (
                <Link key={index} href={game.link}>
                  <TooltipProvider key={index}>
                    <Tooltip delayDuration={200}>
                      <TooltipTrigger asChild>
                        <Card className="p-4 bg-[#F9FDF7] rounded-lg overflow-hidden">
                          <div className="aspect-video relative mb-4">
                            <Image
                              src={game.image}
                              alt={game.label}
                              fill
                              className="object-cover rounded-lg"
                            />
                          </div>
                          <h3 className="text-center text-[#314328] font-medium">{game.label}</h3>
                        </Card>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Click to play game</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </Link>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
