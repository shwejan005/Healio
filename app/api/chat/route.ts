import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { retrieveContext, formatRetrievedContext } from "@/lib/rag"

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

    // Get the authenticated user's ID from Clerk
    const { userId } = await auth()

    // --- RAG Retrieval ---
    // Embed the query and search Qdrant for relevant context
    let ragContext = ""
    try {
      const retrievedChunks = await retrieveContext(query, userId ?? undefined)
      ragContext = formatRetrievedContext(retrievedChunks)

      if (ragContext) {
        console.log(`RAG: Retrieved ${retrievedChunks.length} chunks for query: "${query.substring(0, 50)}..."`)
      }
    } catch (error) {
      console.error("RAG retrieval failed, continuing without context:", error)
      // Graceful degradation — chat still works without RAG context
    }

    // Build the context block for the prompt
    const contextBlock = ragContext
      ? `\n\nThe following context was retrieved via semantic search from the knowledge base and the user's personal wellness data. Use ONLY the information below to personalize your response — do not invent or assume data that isn't provided:\n\n${ragContext}\n\nIMPORTANT: Only reference the retrieved information when it's relevant to the user's question. Do NOT dump all retrieved data in your response.`
      : ""

    // Prepare the payload for Gemini API
    const payload = {
      contents: [
        {
          parts: [
            {
              text: `You are a supportive mental health companion named Healio. You use Retrieval-Augmented Generation to provide personalized, evidence-based responses grounded in the user's actual wellness data and curated mental health resources.${contextBlock}

Given the following mental health-related query, provide a short, concise, and personalized response:
User Query: ${query}.

Your response should:
- Be brief and to the point (2-3 short paragraphs maximum)
- Use a warm, positive tone that makes the user feel happy
- Ground your advice in the retrieved context when relevant
- Reference the user's actual data naturally (e.g., mood trends, sleep patterns, goals, activities) when it appears in the retrieved context
- Cite specific techniques or strategies from the retrieved mental health resources when applicable
- Provide practical advice personalized to their situation
- Be empathetic but avoid lengthy explanations
- Use ** for important points or headings
- Use * for very short bullet points (only when necessary)
- If no user data was retrieved, encourage them to start tracking their mood, setting goals, or journaling

Remember to keep your response short and uplifting. Focus on making the user feel better immediately rather than providing comprehensive information.
For greetings like Hello or Hi, respond with a brief, cheerful greeting using their name if available, and a simple question about how you can help.
`,
            },
          ],
        },
      ],
    }

    // Call Gemini API for generating a response
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiApiKey}`,
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
