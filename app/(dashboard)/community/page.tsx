"use client"

import { useQuery, useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import { useState } from "react"
import { Id } from "@/convex/_generated/dataModel"
import { ThumbsUp, ThumbsDown, MessageCircle, Trash2, Send, Plus, Users2 } from "lucide-react"
import { motion } from "framer-motion"
import { SpotlightCard } from "@/components/reactbits/SpotlightCard"
import { SplitText } from "@/components/reactbits/SplitText"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

type Forum = {
  _id: Id<"forums">
  title: string
  content: string
  authorId: Id<"users">
  votes: Record<string, number>
  createdAt: number
  author: {
    name: string
    image?: string
  }
  comments: {
    _id: Id<"forumComments">
    content: string
    author: {
      name: string
      image?: string
    }
  }[]
  upvotes: number
  dislikes: number
}

export default function ForumList() {
  const forums = useQuery(api.forum.getForums) as Forum[] | undefined
  const [newPost, setNewPost] = useState({ title: "", content: "" })
  const [commentContent, setCommentContent] = useState<Record<Id<"forums">, string>>({})
  const [isPosting, setIsPosting] = useState(false)

  const createForum = useMutation(api.forum.create)
  const addComment = useMutation(api.forum.addComment)
  const vote = useMutation(api.forum.vote)
  const removeForum = useMutation(api.forum.removeForum)

  const handleCreatePost = async () => {
    if (!newPost.title.trim() || !newPost.content.trim()) return
    setIsPosting(true)
    try {
      await createForum(newPost)
      setNewPost({ title: "", content: "" })
    } finally {
      setIsPosting(false)
    }
  }

  const handleAddComment = async (forumId: Id<"forums">) => {
    const text = commentContent[forumId]
    if (!text || !text.trim()) return
    await addComment({ forumId, content: text })
    setCommentContent({ ...commentContent, [forumId]: "" })
  }

  return (
    <div className="font-montreal min-h-screen p-4 sm:p-8 max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white/80 backdrop-blur-xl border border-white/80 shadow-xl flex items-center gap-4">
        <div className="p-3 rounded-2xl bg-[#e0f0e0] text-[#3a633a]">
          <Users2 className="w-8 h-8" />
        </div>
        <div>
          <h1 className="text-3xl font-extrabold text-[#2d4c2d]">
            <SplitText text="Community Sanctuary Forum" />
          </h1>
          <p className="text-sm text-[#4a7a4a] mt-1">
            Share personal stories, ask for wellness advice, and support fellow community members.
          </p>
        </div>
      </div>

      {/* Create New Post Card */}
      <SpotlightCard className="p-6 rounded-3xl bg-white/80 backdrop-blur-xl border border-white/80 shadow-xl space-y-4">
        <h2 className="text-lg font-bold text-[#2d4c2d] flex items-center gap-2">
          <Plus className="w-4 h-4 text-[#3a633a]" /> Start a New Discussion
        </h2>

        <input
          value={newPost.title}
          onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
          placeholder="Post title (e.g. Managing anxiety during work transitions)"
          className="w-full p-3.5 rounded-xl border border-[#3a633a]/20 bg-white/90 text-[#2d4c2d] placeholder-[#4a7a4a]/50 text-sm focus:outline-none focus:ring-2 focus:ring-[#3a633a]/30"
        />

        <textarea
          value={newPost.content}
          onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
          placeholder="Share your thoughts or questions..."
          className="w-full p-3.5 rounded-xl border border-[#3a633a]/20 bg-white/90 text-[#2d4c2d] placeholder-[#4a7a4a]/50 text-sm h-28 focus:outline-none focus:ring-2 focus:ring-[#3a633a]/30 resize-none"
        />

        <button
          onClick={handleCreatePost}
          disabled={isPosting || !newPost.title.trim() || !newPost.content.trim()}
          className="px-6 py-3 rounded-xl bg-[#3a633a] hover:bg-[#2d4c2d] text-white font-semibold text-sm shadow-md transition-all disabled:opacity-50"
        >
          {isPosting ? "Posting..." : "Publish Post"}
        </button>
      </SpotlightCard>

      {/* Forum Post Feed */}
      <div className="space-y-6">
        {forums?.map((forum) => (
          <motion.div
            key={forum._id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <SpotlightCard className="p-6 rounded-3xl bg-white/85 backdrop-blur-xl border border-white/80 shadow-xl space-y-4">
              {/* Author Row */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar className="w-10 h-10 border border-[#3a633a]/20">
                    <AvatarImage src={forum.author.image} />
                    <AvatarFallback className="bg-[#3a633a] text-white font-bold">
                      {forum.author.name ? forum.author.name.charAt(0) : "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-bold text-[#2d4c2d] text-sm">{forum.author.name}</p>
                    <p className="text-xs text-[#4a7a4a]">
                      {new Date(forum.createdAt).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => removeForum({ forumId: forum._id })}
                  className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                  title="Delete post"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {/* Title & Body */}
              <h3 className="text-xl font-bold text-[#2d4c2d]">{forum.title}</h3>
              <p className="text-sm text-[#3e5f3e] leading-relaxed">{forum.content}</p>

              {/* Reaction & Comment Count Bar */}
              <div className="flex items-center gap-4 pt-3 border-t border-[#3a633a]/10 text-xs font-semibold">
                <button
                  onClick={() => vote({ forumId: forum._id, vote: 1 })}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#e0f0e0]/70 text-[#2d4c2d] hover:bg-[#3a633a] hover:text-white transition-colors"
                >
                  <ThumbsUp className="w-3.5 h-3.5" />
                  <span>{forum.upvotes}</span>
                </button>

                <button
                  onClick={() => vote({ forumId: forum._id, vote: -1 })}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#e0f0e0]/70 text-[#2d4c2d] hover:bg-rose-600 hover:text-white transition-colors"
                >
                  <ThumbsDown className="w-3.5 h-3.5" />
                  <span>{forum.dislikes}</span>
                </button>

                <div className="flex items-center gap-1.5 text-[#4a7a4a] ml-auto">
                  <MessageCircle className="w-4 h-4" />
                  <span>{forum.comments.length} Comments</span>
                </div>
              </div>

              {/* Comments Section */}
              {forum.comments.length > 0 && (
                <div className="mt-4 pt-4 border-t border-[#3a633a]/10 space-y-3">
                  {forum.comments.map((comment) => (
                    <div
                      key={comment._id}
                      className="p-3 rounded-2xl bg-[#f0f9ed] border border-[#3a633a]/15 text-xs text-[#2d4c2d]"
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <Avatar className="w-5 h-5">
                          <AvatarImage src={comment.author.image} />
                          <AvatarFallback className="bg-[#3a633a] text-white text-[10px]">
                            {comment.author.name ? comment.author.name.charAt(0) : "C"}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-bold text-[#2d4c2d]">{comment.author.name}</span>
                      </div>
                      <p className="pl-7 text-[#3e5f3e]">{comment.content}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Add Comment Input */}
              <div className="flex gap-2 pt-2">
                <input
                  value={commentContent[forum._id] || ""}
                  onChange={(e) =>
                    setCommentContent({
                      ...commentContent,
                      [forum._id]: e.target.value,
                    })
                  }
                  onKeyDown={(e) => e.key === "Enter" && handleAddComment(forum._id)}
                  placeholder="Write a supportive comment..."
                  className="flex-1 p-2.5 rounded-xl border border-[#3a633a]/20 bg-white/90 text-xs text-[#2d4c2d] placeholder-[#4a7a4a]/50 focus:outline-none focus:ring-2 focus:ring-[#3a633a]/30"
                />
                <button
                  onClick={() => handleAddComment(forum._id)}
                  className="px-4 py-2.5 rounded-xl bg-[#3a633a] hover:bg-[#2d4c2d] text-white text-xs font-semibold shadow-sm transition-all"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
            </SpotlightCard>
          </motion.div>
        ))}
      </div>
    </div>
  )
}