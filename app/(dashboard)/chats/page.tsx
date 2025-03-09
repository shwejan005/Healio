"use client";

import React, { useState, useEffect, useRef, Suspense, FC } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useSearchParams, useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { Id } from "@/convex/_generated/dataModel";
import { cn } from "@/lib/utils";
import { Send, LogOut, Plus, Users } from "lucide-react";
import { motion } from "framer-motion";

// --- Sub-Components ---

interface ChatHeaderProps {
  roomName: string;
  onLeave: () => void;
}

const ChatHeader: FC<ChatHeaderProps> = ({ roomName, onLeave }) => (
  <div className="p-6 bg-[#e0f0e0] flex justify-between items-center">
    <h3 className="text-2xl font-bold text-[#2d4c2d]">{roomName}</h3>
    <Button
      onClick={onLeave}
      variant="outline"
      className="bg-white text-[#4a7a4a] border-[#4a7a4a] hover:bg-[#4a7a4a] hover:text-white transition-all duration-300"
    >
      <LogOut className="mr-2" /> Leave Room
    </Button>
  </div>
);

interface MessageListProps {
  messages: any[];
  username: string;
}

const MessageList: FC<MessageListProps> = ({ messages, username }) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <ScrollArea className="flex-grow p-6">
      <div className="space-y-4 flex flex-col">
        {messages.map((msg, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div
              className={cn(
                "p-4 max-w-[80%] rounded-xl shadow-md",
                msg.sender === username
                  ? "ml-auto bg-[#4a7a4a] text-white"
                  : "bg-[#e0f0e0] text-[#2d4c2d]"
              )}
            >
              <p className="font-semibold mb-1">{msg.sender}</p>
              <p>{msg.text}</p>
            </div>
          </motion.div>
        ))}
        <div ref={messagesEndRef} />
      </div>
    </ScrollArea>
  );
};

interface ChatInputProps {
  newMessage: string;
  setNewMessage: (msg: string) => void;
  onSend: () => void;
}

const ChatInput: FC<ChatInputProps> = ({ newMessage, setNewMessage, onSend }) => (
  <div className="p-6 bg-[#e0f0e0]">
    <div className="flex items-center bg-white rounded-full overflow-hidden shadow-md">
      <Input
        type="text"
        value={newMessage}
        onChange={(e) => setNewMessage(e.target.value)}
        placeholder="Type your message..."
        className="flex-grow border-none text-[#2d4c2d] placeholder-[#547454] text-lg py-4 px-6"
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            onSend();
          }
        }}
      />
      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
        <Button
          onClick={onSend}
          className="bg-[#4a7a4a] hover:bg-[#5c965c] text-white rounded-full p-4 m-2 transition-all duration-300"
        >
          <Send />
        </Button>
      </motion.div>
    </div>
  </div>
);

// --- Main ChatRoom Component ---

function ChatRoom() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [newMessage, setNewMessage] = useState("");
  const [isUsernameSet, setIsUsernameSet] = useState(false);
  const roomId = searchParams.get("room") as Id<"rooms"> | null;
  const rooms = useQuery(api.rooms.getRooms);
  const messages = useQuery(api.messages.getMessages, roomId ? { roomId } : "skip");
  const createRoom = useMutation(api.rooms.createRoom);
  const joinRoom = useMutation(api.rooms.joinRoom);
  const leaveRoom = useMutation(api.rooms.leaveRoom);
  const sendMessage = useMutation(api.messages.sendMessage);

  useEffect(() => {
    if (roomId && isUsernameSet) {
      joinRoom({ roomId, username }).catch((err) =>
        console.error("Join Room Error:", err)
      );
    }
  }, [roomId, isUsernameSet, joinRoom, username]);

  const handleSetUsername = () => {
    if (username.trim()) {
      setIsUsernameSet(true);
    }
  };

  const handleCreateRoom = async () => {
    try {
      const newRoom = await createRoom({ name: "New Room", maxUsers: 5 });
      router.push(`?room=${newRoom}`);
    } catch (error) {
      console.error("Create Room Error:", error);
    }
  };

  const handleSendMessage = async () => {
    if (newMessage.trim() && roomId) {
      try {
        await sendMessage({ roomId, sender: username, text: newMessage });
        setNewMessage("");
      } catch (error) {
        console.error("Send Message Error:", error);
      }
    }
  };

  const handleLeaveRoom = async () => {
    if (roomId) {
      try {
        await leaveRoom({ roomId, username });
        router.push("/chats");
      } catch (error) {
        console.error("Leave Room Error:", error);
      }
    }
  };

  if (!isUsernameSet) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="p-8 max-w-md w-full bg-white shadow-md rounded-xl">
          <motion.h2
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-4xl font-bold text-center text-[#2d4c2d] mb-6"
          >
            Welcome to Healio Chat
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-xl text-center text-[#547454] mb-8"
          >
            Enter your username to continue
          </motion.p>
          <Input
            type="text"
            placeholder="Your username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="mb-6 border-[#4a7a4a] text-[#2d4c2d] placeholder-[#547454]"
          />
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              onClick={handleSetUsername}
              className="w-full bg-[#4a7a4a] hover:bg-[#5c965c] text-white font-bold py-3 px-6 rounded-full transition-colors duration-300 shadow-md"
            >
              Start Your Journey
            </Button>
          </motion.div>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#f3faf3] p-6">
      <Card className="flex flex-col w-full max-w-6xl mx-auto bg-white shadow-md rounded-xl overflow-hidden">
        {!roomId ? (
          <div className="p-8 flex flex-col h-full">
            <motion.h2
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-3xl font-bold text-[#2d4c2d] mb-8"
            >
              Healing Chat Rooms
            </motion.h2>
            <Button
              onClick={handleCreateRoom}
              className="mb-8 bg-[#4a7a4a] hover:bg-[#5c965c] text-white font-bold py-3 px-6 rounded-full transition-colors duration-300 shadow-md"
            >
              <Plus className="mr-2" /> Create New Room
            </Button>
            <ScrollArea className="flex-grow">
              <div className="space-y-4">
                {rooms?.map((room, index) => (
                  <motion.div
                    key={room._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    <div className="p-6 bg-[#e0f0e0] rounded-xl flex justify-between items-center transition-all duration-300 hover:bg-[#c8e6c8]">
                      <div>
                        <p className="text-xl font-semibold text-[#2d4c2d]">
                          {room.name}
                        </p>
                        <p className="text-[#547454]">
                          <Users className="inline mr-2" />
                          {room.currentUsers}/{room.maxUsers} participants
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        onClick={() => router.push(`?room=${room._id}`)}
                        className="bg-white text-[#4a7a4a] border-[#4a7a4a] hover:bg-[#4a7a4a] hover:text-white transition-all duration-300"
                      >
                        Join Room
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </ScrollArea>
          </div>
        ) : (
          <>
            <ChatHeader roomName="Healing Room" onLeave={handleLeaveRoom} />
            <MessageList messages={messages || []} username={username} />
            <ChatInput
              newMessage={newMessage}
              setNewMessage={setNewMessage}
              onSend={handleSendMessage}
            />
          </>
        )}
      </Card>
    </div>
  );
}

// --- Default Export Wrapped in Suspense ---

export default function ChatRoomWrapper() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading Chat...</div>}>
      <ChatRoom />
    </Suspense>
  );
}
