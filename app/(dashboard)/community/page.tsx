'use client';

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useState } from "react";
import { Id } from "@/convex/_generated/dataModel";
import { ThumbsUp, ThumbsDown, MessageCircle, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

type Forum = {
  _id: Id<"forums">;
  title: string;
  content: string;
  authorId: Id<"users">;
  votes: Record<string, number>;
  createdAt: number;
  author: {
    name: string;
    image?: string;
  };
  comments: {
    _id: Id<"forumComments">;
    content: string;
    author: {
      name: string;
      image?: string;
    };
  }[];
  upvotes: number;
  dislikes: number;
};

export default function ForumList() {
  const forums = useQuery(api.forum.getForums) as Forum[] | undefined;
  const [newPost, setNewPost] = useState({ title: "", content: "" });
  const [commentContent, setCommentContent] = useState<Record<Id<"forums">, string>>({});

  const createForum = useMutation(api.forum.create);
  const addComment = useMutation(api.forum.addComment);
  const vote = useMutation(api.forum.vote);
  const removeForum = useMutation(api.forum.removeForum);

  const handleCreatePost = async () => {
    await createForum(newPost);
    setNewPost({ title: "", content: "" });
  };

  const handleAddComment = async (forumId: Id<"forums">) => {
    await addComment({ forumId, content: commentContent[forumId] || "" });
    setCommentContent({ ...commentContent, [forumId]: "" });
  };

  return (
    <div className="min-h-screen p-6 bg-background">
      <div className="max-w-3xl mx-auto">
        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="text-3xl font-bold text-primary mb-4 text-center"
        >
          Community Forum
        </motion.h1>

        {/* Create New Post */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="mb-6 rounded-lg border bg-card p-4 shadow-md"
        >
          <h2 className="text-lg font-semibold text-primary mb-2">
            Start a Discussion
          </h2>
          <input
            value={newPost.title}
            onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
            placeholder="Post title"
            className="w-full p-2 border bg-muted border-gray-300 rounded mb-2"
          />
          <textarea
            value={newPost.content}
            onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
            placeholder="Share your thoughts..."
            className="w-full p-2 border bg-muted border-gray-300 rounded h-24"
          />
          <button
            onClick={handleCreatePost}
            className="w-full bg-primary text-white px-4 py-2 rounded-md hover:bg-primary/80 transition"
          >
            Create Post
          </button>
        </motion.div>

        {/* Forum Posts */}
        {forums?.map((forum) => (
          <motion.div
            key={forum._id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="mb-6 rounded-lg border bg-card p-4 shadow-md"
          >
            {/* Author Info */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img
                  src={forum.author.image || "https://via.placeholder.com/40"}
                  className="w-10 h-10 rounded-full"
                  alt="Author"
                />
                <div>
                  <p className="font-semibold text-primary">{forum.author.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(forum.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <button
                onClick={() => removeForum({ forumId: forum._id })}
                className="text-red-500 hover:text-red-700"
              >
                <Trash2 size={20} />
              </button>
            </div>

            {/* Post Content */}
            <h3 className="text-xl font-bold mt-2 text-primary">{forum.title}</h3>
            <p className="text-muted-foreground mt-2">{forum.content}</p>

            {/* Vote & Comment Section */}
            <div className="flex items-center gap-4 mt-4">
              <button
                onClick={() => vote({ forumId: forum._id, vote: 1 })}
                className="flex items-center gap-1 text-green-600 hover:text-green-800"
              >
                <ThumbsUp size={20} /> {forum.upvotes}
              </button>
              <button
                onClick={() => vote({ forumId: forum._id, vote: -1 })}
                className="flex items-center gap-1 text-red-600 hover:text-red-800"
              >
                <ThumbsDown size={20} /> {forum.dislikes}
              </button>
              <div className="flex items-center gap-1 text-muted-foreground">
                <MessageCircle size={20} /> {forum.comments.length}
              </div>
            </div>

            {/* Comments */}
            <div className="mt-4">
              <h4 className="text-md font-semibold text-primary">Comments</h4>
              <div className="ml-4 border-l-2 pl-4 mt-2 border-muted">
                {forum.comments.map((comment) => (
                  <div key={comment._id} className="mb-3">
                    <div className="flex items-center gap-2">
                      <img
                        src={comment.author.image || "https://via.placeholder.com/30"}
                        className="w-6 h-6 rounded-full"
                        alt="Comment author"
                      />
                      <span className="font-medium text-primary">{comment.author.name}</span>
                    </div>
                    <p className="ml-8 text-muted-foreground">{comment.content}</p>
                  </div>
                ))}
              </div>
              {/* Add Comment */}
              <div className="mt-4 flex gap-2">
                <input
                  value={commentContent[forum._id] || ""}
                  onChange={(e) => setCommentContent({
                    ...commentContent,
                    [forum._id]: e.target.value
                  })}
                  placeholder="Write a comment..."
                  className="flex-1 p-2 border bg-muted border-gray-300 rounded"
                />
                <button
                  onClick={() => handleAddComment(forum._id)}
                  className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary/80 transition"
                >
                  Comment
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}