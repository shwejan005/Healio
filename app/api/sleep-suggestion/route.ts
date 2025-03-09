import { NextApiRequest, NextApiResponse } from 'next';
import { GoogleGenerativeAI } from "@google/generative-ai";

interface ChatMessage {
  role: 'user' | 'model';
  content: string;
}

interface ChatRequest {
  messages: ChatMessage[];
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { messages }: ChatRequest = req.body;

    const formattedMessages = messages.map(msg => ({
      role: msg.role,
      parts: [{ text: msg.content }]
    }));

    const model = genAI.getGenerativeModel({ model: "gemini-pro"});
    const chat = model.startChat({ history: formattedMessages });
    
    const result = await chat.sendMessage("Please provide clear, actionable tips");
    const response = await result.response;
    
    res.status(200).json({ text: response.text() });
    
  } catch (error) {
    console.error('Gemini API Error:', error);
    res.status(500).json({ error: 'Failed to generate suggestions' });
  }
}