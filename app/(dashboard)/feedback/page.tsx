"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Star, Edit, MessageSquareWarning } from "lucide-react"
import { motion } from "framer-motion"
import { useMutation, useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import { useUser } from "@clerk/nextjs"
import { Id } from "@/convex/_generated/dataModel"
import { SpotlightCard } from "@/components/reactbits/SpotlightCard"
import { SplitText } from "@/components/reactbits/SplitText"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export default function FeedbackPage() {
  const { user } = useUser()
  const userId = user?.id
  const [rating, setRating] = useState(0)
  const [feedback, setFeedback] = useState("")
  const [editId, setEditId] = useState<Id<"feedback"> | null>(null)

  const addFeedback = useMutation(api.feedback.submit)
  const updateFeedback = useMutation(api.feedback.update)
  const feedbackList = (useQuery(api.feedback.getAll) as Array<{
    _id: Id<"feedback">
    _creationTime: number
    createdAt: number
    text: string
    rating: number
    userId: string
  }>) || []

  const getUser = useQuery(api.users.getUser, { clerkId: userId || "" })

  const averageRating =
    feedbackList.length > 0
      ? (
          feedbackList.reduce((acc: number, f) => acc + f.rating, 0) /
          feedbackList.length
        ).toFixed(1)
      : "N/A"

  const handleSubmit = async () => {
    if (rating > 0 && feedback.trim() !== "") {
      if (editId) {
        await updateFeedback({ id: editId, rating, text: feedback })
        setEditId(null)
      } else {
        await addFeedback({ rating, text: feedback })
      }
      setFeedback("")
      setRating(0)
    }
  }

  const handleEdit = (id: Id<"feedback">, ratingVal: number, text: string) => {
    setEditId(id)
    setRating(ratingVal)
    setFeedback(text)
  }

  return (
    <div className="font-montreal min-h-screen p-4 sm:p-8 max-w-4xl mx-auto space-y-8">
      {/* Header Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white/80 backdrop-blur-xl border border-white/80 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="space-y-1">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#3a633a] flex items-center gap-1.5">
            <MessageSquareWarning className="w-4 h-4" /> Community Suggestions
          </span>
          <h1 className="text-3xl font-extrabold text-[#2d4c2d]">
            <SplitText text="Feedback & Insights" />
          </h1>
          <p className="text-sm text-[#4a7a4a]">
            Help us improve Healio. Your suggestions directly shape future features.
          </p>
        </div>

        {feedbackList.length > 0 && (
          <div className="p-4 rounded-2xl bg-[#f0f9ed] border border-[#3a633a]/20 text-center min-w-[140px] shadow-sm">
            <p className="text-2xl font-extrabold text-[#2d4c2d]">{averageRating} / 5</p>
            <p className="text-xs text-[#4a7a4a] font-medium">Average User Rating</p>
          </div>
        )}
      </div>

      {/* Feedback Form Card */}
      <SpotlightCard className="p-6 rounded-3xl bg-white/85 backdrop-blur-xl border border-white/80 shadow-xl space-y-5">
        <h2 className="text-lg font-bold text-[#2d4c2d]">
          {editId ? "Edit Your Feedback" : "Submit Your Experience"}
        </h2>

        {/* Star Rating Select */}
        <div className="flex items-center gap-2 py-2">
          {[1, 2, 3, 4, 5].map((num) => (
            <button
              type="button"
              key={num}
              onClick={() => setRating(num)}
              className="p-1 transition-transform hover:scale-110"
            >
              <Star
                className={`w-7 h-7 transition-colors ${
                  rating >= num
                    ? "fill-amber-400 text-amber-400"
                    : "text-slate-300 hover:text-amber-300"
                }`}
              />
            </button>
          ))}
          <span className="ml-2 text-xs font-semibold text-[#4a7a4a]">
            {rating > 0 ? `${rating} of 5 stars` : "Select a rating"}
          </span>
        </div>

        <Input
          className="p-3.5 rounded-xl border border-[#3a633a]/20 bg-white/90 text-sm text-[#2d4c2d] placeholder-[#4a7a4a]/50 focus:ring-2 focus:ring-[#3a633a]/30"
          placeholder="Share your thoughts, suggestions, or issues..."
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
        />

        <Button
          onClick={handleSubmit}
          disabled={rating === 0 || !feedback.trim()}
          className="w-full bg-[#3a633a] hover:bg-[#2d4c2d] text-white font-semibold py-3 rounded-xl shadow-md transition-all text-sm disabled:opacity-50"
        >
          {editId ? "Update Submission" : "Submit Feedback"}
        </Button>
      </SpotlightCard>

      {/* Community Feedback List */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-[#2d4c2d]">Recent Community Reviews</h2>

        {feedbackList.length === 0 ? (
          <SpotlightCard className="text-center p-12 rounded-3xl bg-white/70 backdrop-blur-xl border border-white/80 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-[#e0f0e0] text-[#3a633a] flex items-center justify-center mx-auto shadow-sm">
              <MessageSquareWarning className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-[#2d4c2d]">No Feedback Submitted Yet</h3>
            <p className="text-xs text-[#4a7a4a] max-w-sm mx-auto">
              Be the first to submit a review and rate your experience with Healio.
            </p>
          </SpotlightCard>
        ) : (
          <div className="space-y-3">
            {feedbackList.map((f, idx) => {
              const reviewUser = getUser?._id === f.userId ? getUser : null
              return (
                <motion.div
                  key={f._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: idx * 0.05 }}
                >
                  <div className="p-5 rounded-2xl bg-white/90 backdrop-blur-xl border border-white/80 shadow-sm flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <Avatar className="w-10 h-10 border border-[#3a633a]/20">
                        <AvatarImage src={reviewUser?.image} />
                        <AvatarFallback className="bg-[#3a633a] text-white font-bold text-xs">
                          {reviewUser?.name ? reviewUser.name.charAt(0) : "U"}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-[#2d4c2d] text-sm">
                            {reviewUser?.name || "Anonymous Member"}
                          </span>
                          <div className="flex items-center text-amber-500 text-xs font-bold gap-0.5">
                            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                            <span>{f.rating}</span>
                          </div>
                        </div>
                        <p className="text-xs text-[#4a7a4a] mt-0.5">{f.text}</p>
                      </div>
                    </div>

                    <button
                      onClick={() => handleEdit(f._id, f.rating, f.text)}
                      className="p-2 rounded-xl text-slate-400 hover:text-[#3a633a] hover:bg-[#e0f0e0] transition-colors"
                      title="Edit feedback"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}