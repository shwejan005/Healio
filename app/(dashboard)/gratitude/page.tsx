"use client";

import { Card } from "@/components/ui/card";
import { api } from "@/convex/_generated/api";
import { useUser } from "@clerk/clerk-react";
import { useMutation, useQuery } from "convex/react";
import { CalendarIcon, TimerIcon } from "lucide-react";
import { NewEntryDialog } from "./new-entry-dialog";

export default function GratitudePage() {
  const { user } = useUser();
  const userId = user?.id || "";
  const entries = useQuery(api.journals.getEntries, userId ? { userId } : "skip");
  const addEntry = useMutation(api.journals.addEntry);
  const deleteEntry = useMutation(api.journals.deleteEntry);

  // Add a new entry
  const handleAddEntry = async (entry: { gratitude: any; }) => {
    if (!userId) return;
    await addEntry({ userId, gratitude: entry.gratitude });
  };

  return (
    <div className="font-montreal flex min-h-screen bg-[#E5F4DD]">
      <div className="flex-1 p-8">
        <div className="max-w-4xl mx-auto">
          {/* Header Section */}
          <div className="text-center mb-8">
            <h1 className="text-5xl font-medium text-[#314328] mb-2">
              Reflect On The Good Things In Life
            </h1>
            <p className="text-gray-600">
              Taking a moment to express gratitude can help shift your focus to
              the positive and improve your overall well-being.
            </p>
          </div>

          {/* Input Section */}
          <div className="mb-6">
            <Card className="p-6 bg-white rounded-lg shadow-lg">
              <NewEntryDialog onSave={handleAddEntry} />
            </Card>
          </div>

          {/* Previous Entries Section */}
          <div className="mb-6">
            <Card className="p-6 bg-white rounded-lg shadow-lg">
              <h2 className="text-2xl font-medium text-[#314328] mb-4">
                Previous Entries
              </h2>
              {entries === undefined ? (
                <p>Loading entries...</p>
              ) : (
                <div className="space-y-4">
                  {entries.map((entry) => (
                    <Card key={entry._id} className="p-4 bg-[#F9FDF7] rounded-lg">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          <CalendarIcon className="h-5 w-5 text-gray-500" />
                          <span className="text-gray-500">
                            {new Date(entry.date).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <TimerIcon className="h-5 w-5 text-gray-500" />
                          <span className="text-gray-500">
                            {new Date(entry.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}
                          </span>
                        </div>
                      </div>
                      <p className="mt-2 text-gray-700">{entry.gratitude}</p>
                    </Card>
                  ))}
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}