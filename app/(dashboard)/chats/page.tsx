"use client"

import React, { useState, useEffect, useRef, Suspense, FC } from "react"
import { useMutation, useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import { useSearchParams, useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import type { Id } from "@/convex/_generated/dataModel"
import { cn } from "@/lib/utils"
import { Send, LogOut, Plus, Users, MessageCircle, Shield, Hash, Heart, Smile, Sparkles, RefreshCw } from "lucide-react"
import { motion } from "framer-motion"
import { SpotlightCard } from "@/components/reactbits/SpotlightCard"
import { SplitText } from "@/components/reactbits/SplitText"

const ANONYMOUS_ALIASES = [
  "Calm Panda",
  "Gentle Falcon",
  "Wise Owl",
  "Serene Otter",
  "Mindful Koala",
  "Tranquil Deer",
  "Peaceful River",
]

function ChatRoom() {
  const searchParams = useSearchParams()
  const router = useRouter()

  const [username, setUsername] = useState("")
  const [selectedAlias, setSelectedAlias] = useState(ANONYMOUS_ALIASES[0])
  const [newMessage, setNewMessage] = useState("")
  const [isUsernameSet, setIsUsernameSet] = useState(false)

  const roomId = searchParams.get("room") as Id<"rooms"> | null
  const rooms = useQuery(api.rooms.getRooms)
  const messages = useQuery(api.messages.getMessages, roomId ? { roomId } : "skip")

  const seedRooms = useMutation(api.rooms.seedDefaultRooms)
  const createRoom = useMutation(api.rooms.createRoom)
  const joinRoom = useMutation(api.rooms.joinRoom)
  const leaveRoom = useMutation(api.rooms.leaveRoom)
  const sendMessage = useMutation(api.messages.sendMessage)
  const addReaction = useMutation(api.messages.addReaction)

  // Seed default support channels on load if needed
  useEffect(() => {
    seedRooms().catch(console.error)
  }, [seedRooms])

  useEffect(() => {
    if (roomId && isUsernameSet) {
      joinRoom({ roomId, username }).catch((err) =>
        console.error("Join Room Error:", err)
      )
    }
  }, [roomId, isUsernameSet, joinRoom, username])

  const handleSetUsername = () => {
    if (username.trim()) {
      setIsUsernameSet(true)
    }
  }

  const handleCreateRoom = async () => {
    try {
      const newRoom = await createRoom({
        name: "Mindful Community Space",
        maxUsers: 25,
        description: "Open community discussion and mutual encouragement.",
        category: "general",
      })
      router.push(`?room=${newRoom}`)
    } catch (error) {
      console.error("Create Room Error:", error)
    }
  }

  const handleSendMessage = async () => {
    if (newMessage.trim() && roomId) {
      try {
        await sendMessage({
          roomId,
          sender: username,
          text: newMessage,
          avatarAlias: selectedAlias,
        })
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

  const activeRoom = rooms?.find((r) => r._id === roomId)

  // Alias Selection Screen
  if (!isUsernameSet) {
    return (
      <div className="font-montreal flex items-center justify-center min-h-screen p-4">
        <SpotlightCard className="max-w-lg w-full bg-white/90 backdrop-blur-xl border border-white/80 p-8 shadow-2xl rounded-3xl space-y-6">
          <div className="text-center space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-[#e0f0e0] text-[#3a633a] flex items-center justify-center mx-auto shadow-sm">
              <Shield className="w-7 h-7" />
            </div>
            <h2 className="text-3xl font-extrabold text-[#2d4c2d]">
              Anonymous Support Network
            </h2>
            <p className="text-sm text-[#4a7a4a] leading-relaxed">
              Connect in real-time with peer support channels. Your identity remains 100% confidential.
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold text-[#2d4c2d] mb-1.5 block">
                Your Display Username
              </label>
              <Input
                type="text"
                placeholder="Enter an alias (e.g. HopefulMind)"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="rounded-xl border-[#3a633a]/20 text-[#2d4c2d] placeholder-[#4a7a4a]/50 py-3"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-[#2d4c2d] mb-1.5 block">
                Choose Persona Avatar
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {ANONYMOUS_ALIASES.map((alias) => (
                  <button
                    key={alias}
                    type="button"
                    onClick={() => setSelectedAlias(alias)}
                    className={`p-2.5 rounded-xl text-xs font-semibold border transition-all text-left ${
                      selectedAlias === alias
                        ? "bg-[#3a633a] text-white border-[#3a633a] shadow-sm"
                        : "bg-white text-[#2d4c2d] border-[#3a633a]/20 hover:bg-[#f0f9ed]"
                    }`}
                  >
                    {alias}
                  </button>
                ))}
              </div>
            </div>

            <Button
              onClick={handleSetUsername}
              disabled={!username.trim()}
              className="w-full bg-[#3a633a] hover:bg-[#2d4c2d] text-white font-semibold py-3.5 rounded-xl shadow-md transition-all text-sm disabled:opacity-50"
            >
              Enter Support Channels
            </Button>
          </div>
        </SpotlightCard>
      </div>
    )
  }

  return (
    <div className="font-montreal min-h-screen p-4 sm:p-8 max-w-7xl mx-auto">
      <div className="bg-white/85 backdrop-blur-xl rounded-3xl border border-white/80 shadow-2xl overflow-hidden h-[700px] flex flex-col md:flex-row">
        {/* Left Sidebar: Support Channels */}
        <div className="w-full md:w-80 border-b md:border-b-0 md:border-r border-[#3a633a]/15 bg-white/50 flex flex-col p-4">
          <div className="flex items-center justify-between pb-4 border-b border-[#3a633a]/10 mb-4">
            <div className="flex items-center gap-2">
              <MessageCircle className="w-5 h-5 text-[#3a633a]" />
              <h2 className="font-bold text-[#2d4c2d] text-base">Support Channels</h2>
            </div>
            <button
              onClick={handleCreateRoom}
              className="p-1.5 rounded-xl bg-[#3a633a] text-white hover:bg-[#2d4c2d] transition-colors"
              title="Create new channel"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-2 flex-1 overflow-y-auto pr-1">
            {rooms?.map((room) => {
              const isSelected = room._id === roomId
              return (
                <button
                  key={room._id}
                  onClick={() => router.push(`?room=${room._id}`)}
                  className={`w-full p-3 rounded-2xl text-left transition-all flex items-start gap-3 border ${
                    isSelected
                      ? "bg-[#3a633a] text-white border-[#3a633a] shadow-md"
                      : "bg-white/80 hover:bg-[#e0f0e0] text-[#2d4c2d] border-[#3a633a]/10"
                  }`}
                >
                  <Hash className={`w-4 h-4 mt-0.5 ${isSelected ? "text-white" : "text-[#3a633a]"}`} />
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm truncate">{room.name}</p>
                    <p
                      className={`text-xs truncate ${
                        isSelected ? "text-white/80" : "text-[#4a7a4a]"
                      }`}
                    >
                      {room.description || "Peer discussion"}
                    </p>
                  </div>
                </button>
              )
            })}
          </div>

          {/* User Alias Card */}
          <div className="pt-4 border-t border-[#3a633a]/10 flex items-center justify-between text-xs text-[#2d4c2d]">
            <div>
              <p className="font-bold">{username}</p>
              <p className="text-[11px] text-[#4a7a4a]">{selectedAlias}</p>
            </div>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          </div>
        </div>

        {/* Right Area: Active Chat Window */}
        <div className="flex-1 flex flex-col bg-white/70">
          {roomId && activeRoom ? (
            <>
              {/* Channel Header */}
              <div className="p-4 sm:p-5 bg-white/90 border-b border-[#3a633a]/15 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-[#2d4c2d] flex items-center gap-2">
                    <Hash className="w-5 h-5 text-[#3a633a]" /> {activeRoom.name}
                  </h3>
                  <p className="text-xs text-[#4a7a4a] mt-0.5">{activeRoom.description}</p>
                </div>

                <Button
                  onClick={handleLeaveRoom}
                  variant="outline"
                  className="bg-white hover:bg-rose-50 text-rose-700 border-rose-200 rounded-xl text-xs font-semibold shadow-sm"
                >
                  <LogOut className="w-3.5 h-3.5 mr-1" /> Leave Channel
                </Button>
              </div>

              {/* Message Feed */}
              <div className="flex-1 p-6 overflow-y-auto space-y-4">
                {messages?.map((msg) => {
                  const isSelf = msg.sender === username
                  return (
                    <motion.div
                      key={msg._id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2 }}
                      className={`flex flex-col max-w-[80%] ${
                        isSelf ? "ml-auto items-end" : "items-start"
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1 px-1">
                        <span className="text-[11px] font-bold text-[#2d4c2d]">
                          {msg.sender}
                        </span>
                        <span className="text-[10px] text-[#4a7a4a]">
                          ({msg.avatarAlias || "Peer"})
                        </span>
                      </div>

                      <div
                        className={`p-4 rounded-2xl text-sm leading-relaxed shadow-sm ${
                          isSelf
                            ? "bg-[#3a633a] text-white rounded-tr-none"
                            : "bg-white border border-[#3a633a]/15 text-[#2d4c2d] rounded-tl-none"
                        }`}
                      >
                        {msg.text}
                      </div>

                      {/* Reaction Bar */}
                      <div className="flex items-center gap-1 mt-1">
                        {["❤️", "🙏", "🌿"].map((emoji) => {
                          const count = msg.reactions?.[emoji] || 0
                          return (
                            <button
                              key={emoji}
                              onClick={() => addReaction({ messageId: msg._id, reaction: emoji })}
                              className="px-2 py-0.5 rounded-lg bg-white/80 border border-[#3a633a]/15 text-[11px] hover:bg-[#e0f0e0] transition-colors"
                            >
                              {emoji} {count > 0 && <span className="font-bold ml-1 text-[#2d4c2d]">{count}</span>}
                            </button>
                          )
                        })}
                      </div>
                    </motion.div>
                  )
                })}
              </div>

              {/* Message Input Bar */}
              <div className="p-4 bg-white/90 border-t border-[#3a633a]/15">
                <div className="flex items-center gap-2 bg-white rounded-2xl border border-[#3a633a]/20 p-2 shadow-sm focus-within:ring-2 focus-within:ring-[#3a633a]/30">
                  <Input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                    placeholder={`Message #${activeRoom.name}...`}
                    className="flex-1 border-none shadow-none focus-visible:ring-0 text-[#2d4c2d] placeholder-[#4a7a4a]/50 text-sm px-3"
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim()}
                    className="bg-[#3a633a] hover:bg-[#2d4c2d] text-white rounded-xl p-2.5 transition-all shadow-sm disabled:opacity-50"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="h-full flex flex-col items-center justify-center p-8 text-center text-[#4a7a4a] space-y-3">
              <MessageCircle className="w-12 h-12 text-[#3a633a]/40 mx-auto" />
              <h3 className="text-xl font-bold text-[#2d4c2d]">Select a Support Channel</h3>
              <p className="text-xs max-w-sm">
                Choose a channel from the left sidebar to join real-time anonymous conversations with peers.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function ChatRoomWrapper() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen text-[#3a633a] font-semibold">Loading Channels...</div>}>
      <ChatRoom />
    </Suspense>
  )
}
