"use client"

import { useState, useEffect, useRef } from "react"
import { useMutation, useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import { useSearchParams, useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import type { Id } from "@/convex/_generated/dataModel"
import { cn } from "@/lib/utils"
import { Send, LogOut, Plus, Users } from "lucide-react"
import { motion } from "framer-motion"

export default function ChatRoom() {
  const searchParams = useSearchParams()
  const router = useRouter()

  const [username, setUsername] = useState("")
  const [newMessage, setNewMessage] = useState("")
  const [isUsernameSet, setIsUsernameSet] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const roomId = searchParams.get("room") as Id<"rooms"> | null

  const rooms = useQuery(api.rooms.getRooms)
  const messages = useQuery(api.messages.getMessages, roomId ? { roomId } : "skip")
  const createRoom = useMutation(api.rooms.createRoom)
  const joinRoom = useMutation(api.rooms.joinRoom)
  const leaveRoom = useMutation(api.rooms.leaveRoom)
  const sendMessage = useMutation(api.messages.sendMessage)

  useEffect(() => {
    if (roomId && isUsernameSet) {
      joinRoom({ roomId, username }).catch((err) => console.error("Join Room Error:", err))
    }
  }, [roomId, isUsernameSet, joinRoom, username])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleSetUsername = () => {
    if (username.trim()) {
      setIsUsernameSet(true)
    }
  }

  const handleCreateRoom = async () => {
    try {
      const newRoom = await createRoom({ name: "New Room", maxUsers: 5 })
      router.push(`?room=${newRoom}`)
    } catch (error) {
      console.error("Create Room Error:", error)
    }
  }

  const handleSendMessage = async () => {
    if (newMessage.trim() && roomId) {
      try {
        await sendMessage({ roomId, sender: username, text: newMessage })
        setNewMessage("")
      } catch (error) {
        console.error("Send Message Error:", error)
      }
    }
  }

  const handleLeaveRoom = async () => {
    if (roomId) {
      try {
        await leaveRoom({ roomId, username })
        router.push("/chats")
      } catch (error) {
        console.error("Leave Room Error:", error)
      }
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5 }}
      className="flex h-screen bg-[#f3faf3] p-6"
    >
      <Card className="flex flex-col w-full max-w-6xl mx-auto bg-white shadow-md rounded-xl overflow-hidden">
        {!isUsernameSet ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="flex items-center justify-center min-h-screen"
          >
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
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col h-full"
          >
            <ScrollArea className="flex-grow p-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="space-y-4 flex flex-col"
              >
                {messages?.map((msg, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: idx * 0.05 }}
                  >
                    <div
                      className={cn(
                        "p-4 max-w-[80%] rounded-xl shadow-md",
                        msg.sender === username ? "ml-auto bg-[#4a7a4a] text-white" : "bg-[#e0f0e0] text-[#2d4c2d]",
                      )}
                    >
                      <p className="font-semibold mb-1">{msg.sender}</p>
                      <p>{msg.text}</p>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </ScrollArea>
          </motion.div>
        )}
      </Card>
    </motion.div>
  )
}
