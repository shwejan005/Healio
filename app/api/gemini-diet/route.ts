import { api } from "@/convex/_generated/api" 
import { useQuery } from "convex/react"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  const mood = useQuery(api.moodEntries.getMoodEntries, { userId: "skip" })
  const fitnessLogs = useQuery(api.fitnessLogs.getFitnessLogs, { userId: "skip" })
  const journalEntries = useQuery(api.journals.getEntries, { userId: "skip" })

  try {
    // Parse incoming request to extract user query
    const { query } = await request.json()

    if (!query) {
      return NextResponse.json({ error: "User query is required" }, { status: 400 })
    }

    // Fetch Gemini API Key from environment variables
    const geminiApiKey = process.env.GEMINI_API_KEY

    if (!geminiApiKey) {
      return NextResponse.json({ error: "Gemini API key is missing in environment variables" }, { status: 500 })
    }

    // Prepare the payload for Gemini API
    const payload = {
      contents: [
        {
          parts: [
            {
              text: `You are a supportive mental health companion. Given the following mental activities by the user.
              Mood Entries: ${mood},
              Journal Entries: ${journalEntries},
              Fitness Logs: ${fitnessLogs},
              Please provide an actual diet to help the user become healthier both mentally and physically
              I want you to provide it for an Indian specifically. which is budget friendly and easy to make.
              Mention the ingredients and the recipe, type of food, and the time of the day it should be consumed, all its macro and micro nutrients, and the benefits of the food, make sure it is high in protein and fiber, mention the number of calories,protiens,etc too.
          `,
            },
          ],
        },
      ],
    }

    // Call Gemini API for generating a response
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      },
    )

    // Check if the response is OK
    const responseData = await response.json()

    // Log response for debugging
    console.log("Gemini API Response:", responseData)

    if (!response.ok) {
      return NextResponse.json(
        { error: responseData.error?.message || "Failed to generate response" },
        { status: response.status },
      )
    }

    // Extract and return the generated response from Gemini
    const chatbotResponse =
      responseData?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "I apologize, but I was unable to provide a response at this time. How else might I support you today?"

    return NextResponse.json({ response: chatbotResponse })
  } catch (error) {
    console.error("Error during mental health assistant response generation:", error)
    return NextResponse.json(
      { error: "I encountered an issue while processing your request. Please try again in a moment." },
      { status: 500 },
    )
  }
}

