import { GoogleGenerativeAI } from '@google/generative-ai'
import { NextResponse } from 'next/server'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)
const model = genAI.getGenerativeModel({ model: 'gemini-pro' })

export async function POST(req : Request) {
  try {
    const { messages, contextData } = await req.json()

    // Convert messages to Gemini format
    const geminiMessages = messages.map((m: { role: string; content: any }) => ({
      role: m.role === 'user' ? 'user' : 'model',
      parts: [{ text: m.content }],
    }))

    // Add context data to the prompt
    const contextPrompt = `You have access to the following data: ${JSON.stringify(contextData)}. Use this information to provide accurate answers to user queries.`
    geminiMessages.unshift({ role: 'user', parts: [{ text: contextPrompt }] })

    const result = await model.generateContent({
      contents: geminiMessages,
      generationConfig: {
        maxOutputTokens: 1000,
      },
    })

    const response = result.response
    const text = response.text()

    return NextResponse.json({ text })
  } catch (error) {
    console.error('Error in chat route:', error)
    return NextResponse.json({ error: 'An error occurred while processing your request.' }, { status: 500 })
  }
}

