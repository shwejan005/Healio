'use client';

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useState } from "react";
import { Id } from "@/convex/_generated/dataModel";
import { ThumbsUp, ThumbsDown, MessageCircle, Trash2 } from "lucide-react";

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
    <div className="min-h-screen bg-[#EDF2E1] p-6">
      <div className="max-w-3xl mx-auto">
        {/* Title */}
        <h1 className="text-3xl font-bold text-gray-800 mb-4 text-center">
          Community Forum
        </h1>

        {/* Create New Post */}
        <div className="mb-6 bg-white rounded-lg shadow-md p-4">
          <h2 className="text-lg font-semibold text-gray-700 mb-2">
            Start a Discussion
          </h2>
          <input
            value={newPost.title}
            onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
            placeholder="Post title"
            className="w-full p-2 border bg-[#E5F4DD] border-gray-300 rounded mb-2"
          />
          <textarea
            value={newPost.content}
            onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
            placeholder="Share your thoughts..."
            className="w-full p-2 border bg-[#E5F4DD] border-gray-300 rounded h-24"
          />
          <button 
            onClick={handleCreatePost}
            className="w-full bg-[#95b286] text-white px-4 py-2 rounded-md hover:bg-[#aabea0] transition"
          >
            Create Post
          </button>
        </div>

        {/* Forum Posts */}
        {forums?.map((forum) => (
          <div key={forum._id} className="mb-6 bg-white rounded-lg shadow-md p-4">
            {/* Author Info */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img 
                  src={forum.author.image || "https://via.placeholder.com/40"} 
                  className="w-10 h-10 rounded-full" 
                  alt="Author" 
                />
                <div>
                  <p className="font-semibold text-gray-800">{forum.author.name}</p>
                  <p className="text-sm text-gray-500">
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
            <h3 className="text-xl font-bold mt-2 text-gray-900">{forum.title}</h3>
            <p className="text-gray-700 mt-2">{forum.content}</p>

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
              <div className="flex items-center gap-1 text-gray-600">
                <MessageCircle size={20} /> {forum.comments.length}
              </div>
            </div>

            {/* Comments */}
            <div className="mt-4">
              <h4 className="text-md font-semibold text-gray-800">Comments</h4>
              <div className="ml-4 border-l-2 pl-4 mt-2">
                {forum.comments.map((comment) => (
                  <div key={comment._id} className="mb-3">
                    <div className="flex items-center gap-2">
                      <img 
                        src={comment.author.image || "https://via.placeholder.com/30"} 
                        className="w-6 h-6 rounded-full" 
                        alt="Comment author" 
                      />
                      <span className="font-medium text-gray-700">{comment.author.name}</span>
                    </div>
                    <p className="ml-8 text-gray-600">{comment.content}</p>
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
                  className="flex-1 p-2 border bg-[#E5F4DD] border-gray-300 rounded"
                />
                <button
                  onClick={() => handleAddComment(forum._id)}
                  className="bg-[#95b286] text-white px-4 py-2 rounded-md hover:bg-[#aabea0]"
                >
                  Comment
                </button>
              </div>
            </div>
          </div>
        ))}

      </div>
    </div>
  );
}