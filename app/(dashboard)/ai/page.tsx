"use client"

import { useState, useRef, useEffect } from 'react'
import { ArrowUp } from 'lucide-react'

function parseAndStyleMessage(content: string) {
  const lines = content.split('\n')
  let currentHeading = ''
  let inList = false

  return lines.map((line: string, index: number) => {
    if (line.startsWith('**') && line.endsWith('**')) {
      currentHeading = line.replace(/\*\*/g, '')
      return <h2 key={index} className="text-xl font-bold mt-4 mb-2 text-[#314328]">{currentHeading}</h2>
    } else if (line.trim().startsWith('*')) {
      if (!inList) {
        inList = true
        return (
          <ul key={index} className="list-disc pl-5 mb-2">
            <li>{parseBoldText(line.trim().substring(1).trim())}</li>
          </ul>
        )
      } else {
        return (
          <li key={index}>{parseBoldText(line.trim().substring(1).trim())}</li>
        )
      }
    } else {
      inList = false
      return <p key={index} className="mb-2">{parseBoldText(line)}</p>
    }
  })
}

function parseBoldText(text: string) {
  const parts = text.split(/(\*\*.*?\*\*)/)
  return parts.map((part: string, index: number) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={index}>{part.slice(2, -2)}</strong>
    }
    return part
  })
}

export default function HealioAIPage() {
  const [messages, setMessages] = useState<{ role: string; content: string }[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [contextData, setContextData] = useState(null)
  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    (messagesEndRef.current as unknown as HTMLElement)?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    async function fetchContextData() {
      try {
        const response = await fetch('/api/fetch-data')
        if (!response.ok) {
          throw new Error('Failed to fetch context data')
        }
        const data = await response.json()
        setContextData(data)
      } catch (error) {
        console.error('Error fetching context data:', error)
      }
    }

    fetchContextData()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    setIsLoading(true)
    const userMessage = { role: 'user', content: input }
    setMessages((prevMessages: { role: string; content: string }[]) => [...prevMessages, userMessage])
    setInput('')

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          messages: [...messages, userMessage],
          contextData: contextData
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to get response from AI')
      }

      const data = await response.json()
      const aiMessage = { role: 'assistant', content: data.text }
      setMessages((prevMessages: { role: string; content: string }[]) => [...prevMessages, aiMessage])
    } catch (error) {
      console.error('Error:', error)
      setMessages((prevMessages: { role: string; content: string }[]) => [...prevMessages, { role: 'assistant', content: 'Sorry, I encountered an error. Please try again.' }])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  return (
    <div className="font-montreal flex min-h-screen bg-[#E5F4DD] items-center justify-center">
      <main className="flex-1 p-8 mt-35">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center gap-8 mb-8">
            <img
              src="/images/logohealio.png"
              alt="Healio AI"
              className="w-24 h-24 object-cover rounded-full"
            />
            <div className="text-center">
              <h1 className="text-5xl font-medium text-[#314328] mb-2">
                How Can Healio AI Help You Today?
              </h1>
              <p className="text-gray-600">
                Ask Questions, Share Your Thoughts, Or Seek Advice. Healio AI Is Here To Listen, Support, And Guide You On Your Mental Wellness Journey.
              </p>
            </div>
          </div>

          <div className="bg-white/80 rounded-lg p-4 mb-4 h-[400px] overflow-y-auto">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`mb-4 ${
                  message.role === 'user' ? 'text-right' : 'text-left'
                }`}
              >
                {message.role === 'user' ? (
                  <span className="inline-block p-2 rounded-lg bg-[#A5C49C] text-white">
                    {message.content}
                  </span>
                ) : (
                  <div className="inline-block p-2 rounded-lg bg-gray-200 text-[#526D4E] max-w-[80%]">
                    {parseAndStyleMessage(message.content)}
                  </div>
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={handleSubmit} className="relative">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="How can Healio AI help you today?"
              className="w-full min-h-[120px] p-4 pr-12 rounded-lg border border-[#526D4E]/20 bg-white/80 text-[#526D4E] placeholder-[#526D4E]/60 focus:outline-none focus:ring-2 focus:ring-[#526D4E]/20"
              disabled={isLoading}
            />
            <button
              type="submit"
              className="absolute bottom-4 right-4 p-2 rounded-lg bg-[#A5C49C] hover:bg-[#94b38b] transition-colors disabled:opacity-50"
              aria-label="Send message"
              disabled={isLoading}
            >
              <ArrowUp className="w-4 h-4 text-white" />
            </button>
          </form>
          {isLoading && (
            <p className="text-center mt-2 text-[#526D4E]">Healio AI is thinking...</p>
          )}
        </div>
      </main>
    </div>
  )
}

