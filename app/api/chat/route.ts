import { NextResponse } from "next/server"

export async function POST(request: Request) {
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
              text: `You are a supportive mental health companion. Given the following mental health-related query, provide a short, concise, and uplifting response:
          User Query: ${query}.
          
          Your response should:
          - Be brief and to the point (2-3 short paragraphs maximum)
          - Use a warm, positive tone that makes the user feel happy
          - Provide practical advice in a concise manner
          - Be empathetic but avoid lengthy explanations
          - Use ** for important points or headings
          - Use * for very short bullet points (only when necessary)
          
          Remember to keep your response short and uplifting. Focus on making the user feel better immediately rather than providing comprehensive information.
          For greetings like Hello or Hi, respond with a brief, cheerful greeting and a simple question about how you can help.
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

