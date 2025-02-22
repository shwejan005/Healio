"use client";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Star, Edit } from "lucide-react";
import { motion } from "framer-motion";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import Image from "next/image";
import { useUser } from "@clerk/nextjs";
import { Id } from "@/convex/_generated/dataModel";

export default function FeedbackPage() {
  const { user } = useUser()
  const userId = user?.id
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [editId, setEditId] = useState<Id<"feedback"> | null>(null);

  // Convex mutations and queries
  const addFeedback = useMutation(api.feedback.submit);
  const updateFeedback = useMutation(api.feedback.update);
  const feedbackList = useQuery(api.feedback.getAll) as { 
    _id: Id<"feedback">; 
    _creationTime: number; 
    createdAt: number; 
    text: string; 
    rating: number; 
    userId: string; 
  }[] || [];

  // Fetch user details
  const getUser = useQuery(api.users.getUser, { clerkId: userId || "" });

  // Calculate average rating
  const averageRating =
    feedbackList.length > 0
      ? (
          feedbackList.reduce((acc: number, f: { rating: number }) => acc + f.rating, 0) /
          feedbackList.length
        ).toFixed(1)
      : "No ratings yet";

  // Submit or update feedback
  const handleSubmit = async () => {
    if (rating > 0 && feedback.trim() !== "") {
      if (editId) {
        await updateFeedback({ id: editId, rating, text: feedback });
        setEditId(null);
      } else {
        await addFeedback({ rating, text: feedback });
      }
      setFeedback("");
      setRating(0);
    }
  };

  // Enter edit mode
  const handleEdit = (id: Id<"feedback">, rating: number, text: string) => {
    setEditId(id);
    setRating(rating);
    setFeedback(text);
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center text-gray-900 p-10">
      {/* Average Rating Display */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center text-4xl font-bold text-gray-800"
      >
        Average Rating: {averageRating} ⭐
      </motion.div>

      {/* Feedback Form */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-2xl mt-6"
      >
        <Card className="shadow-md border border-gray-300 bg-white">
          <CardContent className="p-6 space-y-6">
            <div className="flex justify-center gap-4">
              {[1, 2, 3, 4, 5].map((num) => (
                <motion.div key={num} whileHover={{ scale: 1.2 }} whileTap={{ scale: 0.9 }}>
                  <Star
                    className={`w-10 h-10 cursor-pointer transition-all ${rating >= num ? "text-yellow-500" : "text-gray-400"}`}
                    onClick={() => setRating(num)}
                  />
                </motion.div>
              ))}
            </div>
            <Input
              className="p-4 text-lg border border-gray-300 focus:ring-2 focus:ring-green-400"
              placeholder="Share your thoughts..."
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
            />
            <Button
              onClick={handleSubmit}
              disabled={rating === 0 || !feedback.trim()}
              className="w-full py-4 text-lg font-semibold"
            >
              {editId ? "Update Feedback" : "Submit Feedback"}
            </Button>
          </CardContent>
        </Card>
      </motion.div>

      {/* Feedback List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="w-full max-w-2xl space-y-4 mt-6"
      >
        {feedbackList.length === 0 ? (
          <p className="text-center text-lg text-gray-600">No feedback yet. Be the first! 🌟</p>
        ) : (
          feedbackList.map((f: { _id: Id<"feedback">; rating: number; text: string; userId: string }, idx: number) => {
            const user = getUser?._id === f.userId ? getUser : null;
            return (
              <motion.div key={idx} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: idx * 0.1 }}>
                <Card className="shadow-md border border-gray-300 bg-white">
                  <CardContent className="p-5 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <Image
                        src={user?.image || "/images/user-image.png"}
                        alt={user?.name || "User"}
                        width={40}
                        height={40}
                        className="rounded-full border border-gray-300"
                      />
                      <div>
                        <span className="text-md font-semibold text-gray-900">{user?.name || "Unknown User"}</span>
                        <p className="text-sm text-gray-600">{f.text}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xl font-bold text-yellow-500">{f.rating} ⭐</span>
                      <Edit className="w-5 h-5 cursor-pointer text-gray-500 hover:text-green-500" onClick={() => handleEdit(f._id, f.rating, f.text)} />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })
        )}
      </motion.div>
    </div>
  );
}