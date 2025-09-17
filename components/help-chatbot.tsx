"use client"

import React, { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { 
  MessageCircle, 
  X, 
  Send, 
  Bot, 
  User, 
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Lightbulb,
  Settings,
  CreditCard,
  Calendar,
  Image,
  Link,
  Zap,
  Minimize2,
  Maximize2
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface Message {
  id: string
  text: string
  sender: 'user' | 'bot'
  timestamp: Date
  isTyping?: boolean
}

interface FAQItem {
  id: string
  question: string
  answer: string
  category: string
  icon: React.ReactNode
}

const faqData: FAQItem[] = [
  {
    id: '1',
    question: 'How do I create AI-powered LinkedIn posts?',
    answer: 'Click the "Generate with AI" button on your dashboard. You can provide a topic, use voice input, or let our AI create content based on your preferences. The AI will generate engaging posts optimized for LinkedIn.',
    category: 'AI Features',
    icon: <Zap className="w-4 h-4" />
  },
  {
    id: '2',
    question: 'How does the credit system work?',
    answer: 'Each AI generation costs 1 credit. You get 10 free credits monthly. You can purchase additional credits or upgrade to a premium plan for unlimited generations.',
    category: 'Billing',
    icon: <CreditCard className="w-4 h-4" />
  },
  {
    id: '3',
    question: 'Can I schedule posts for later?',
    answer: 'Yes! After creating a post, click the "Schedule" button to choose a specific date and time. Your posts will be automatically published to LinkedIn at the scheduled time.',
    category: 'Scheduling',
    icon: <Calendar className="w-4 h-4" />
  },
  {
    id: '4',
    question: 'How do I connect my LinkedIn account?',
    answer: 'Go to Settings and click "Connect LinkedIn". You\'ll be redirected to LinkedIn to authorize LinkzUp. Once connected, you can post directly from our platform.',
    category: 'Setup',
    icon: <Link className="w-4 h-4" />
  },
  {
    id: '5',
    question: 'Can I add images to my posts?',
    answer: 'Absolutely! Use our image search feature to find relevant images, or upload your own. The AI can also suggest images that match your content.',
    category: 'Media',
    icon: <Image className="w-4 h-4" />
  },
  {
    id: '6',
    question: 'What if I need to edit a generated post?',
    answer: 'All generated posts can be edited before publishing. Click on any post to modify the text, add hashtags, or make other changes.',
    category: 'Editing',
    icon: <Settings className="w-4 h-4" />
  },
  {
    id: '7',
    question: 'How do I customize my AI preferences?',
    answer: 'Go to Settings > AI Customization to set your writing style, tone, industry focus, and other preferences that will influence AI-generated content.',
    category: 'Customization',
    icon: <Settings className="w-4 h-4" />
  },
  {
    id: '8',
    question: 'Is my data secure?',
    answer: 'Yes! We use enterprise-grade security to protect your data. Your LinkedIn credentials are encrypted and we never store your passwords.',
    category: 'Security',
    icon: <HelpCircle className="w-4 h-4" />
  }
]

const quickActions = [
  { text: 'How to create posts?', category: 'AI Features' },
  { text: 'Credit system explained', category: 'Billing' },
  { text: 'Schedule posts', category: 'Scheduling' },
  { text: 'Connect LinkedIn', category: 'Setup' },
  { text: 'Add images', category: 'Media' },
  { text: 'Edit posts', category: 'Editing' }
]

export function HelpChatbot() {
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Hi! I\'m your LinkzUp assistant. How can I help you today?',
      sender: 'bot',
      timestamp: new Date()
    }
  ])
  const [inputValue, setInputValue] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [showFAQ, setShowFAQ] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isOpen])

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputValue,
      sender: 'user',
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputValue('')
    setIsTyping(true)

    // Simulate bot response
    setTimeout(() => {
      const botResponse = generateBotResponse(inputValue)
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: botResponse,
        sender: 'bot',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, botMessage])
      setIsTyping(false)
    }, 1000)
  }

  const generateBotResponse = (userInput: string): string => {
    const input = userInput.toLowerCase()
    
    // Check for FAQ matches
    const matchedFAQ = faqData.find(faq => 
      faq.question.toLowerCase().includes(input) || 
      input.includes(faq.category.toLowerCase()) ||
      faq.answer.toLowerCase().includes(input)
    )

    if (matchedFAQ) {
      return matchedFAQ.answer
    }

    // General responses based on keywords
    if (input.includes('credit') || input.includes('billing')) {
      return 'Our credit system works like this: Each AI generation costs 1 credit. You get 10 free credits monthly with your account. You can purchase additional credits or upgrade to a premium plan for unlimited generations. Would you like to know more about our pricing plans?'
    }

    if (input.includes('post') || input.includes('create') || input.includes('generate')) {
      return 'To create AI-powered LinkedIn posts, click the "Generate with AI" button on your dashboard. You can provide a topic, use voice input, or let our AI create content based on your preferences. The AI will generate engaging posts optimized for LinkedIn. Would you like help with any specific aspect of post creation?'
    }

    if (input.includes('schedule') || input.includes('time')) {
      return 'You can schedule posts by clicking the "Schedule" button after creating a post. Choose your preferred date and time, and LinkzUp will automatically publish your content to LinkedIn. You can also view and manage all your scheduled posts in the dashboard.'
    }

    if (input.includes('linkedin') || input.includes('connect')) {
      return 'To connect your LinkedIn account, go to Settings and click "Connect LinkedIn". You\'ll be redirected to LinkedIn to authorize LinkzUp. Once connected, you can post directly from our platform. Your credentials are secure and encrypted.'
    }

    if (input.includes('image') || input.includes('photo') || input.includes('media')) {
      return 'You can add images to your posts using our image search feature or by uploading your own. The AI can also suggest relevant images that match your content. Simply click the image icon when creating or editing a post.'
    }

    if (input.includes('edit') || input.includes('modify') || input.includes('change')) {
      return 'All generated posts can be edited before publishing. Click on any post to modify the text, add hashtags, change the tone, or make other adjustments. You can also save drafts to edit later.'
    }

    if (input.includes('help') || input.includes('support')) {
      return 'I\'m here to help! You can ask me about creating posts, managing credits, scheduling content, connecting LinkedIn, adding images, or any other LinkzUp features. What would you like to know more about?'
    }

    return 'I understand you\'re looking for help. Could you be more specific about what you\'d like to know? I can help with AI post generation, credit management, scheduling, LinkedIn connection, image handling, and more. You can also check out the FAQ section below for quick answers!'
  }

  const handleQuickAction = (action: string) => {
    setInputValue(action)
    handleSendMessage()
  }

  const handleFAQClick = (faq: FAQItem) => {
    const message: Message = {
      id: Date.now().toString(),
      text: `**${faq.question}**\n\n${faq.answer}`,
      sender: 'bot',
      timestamp: new Date()
    }
    setMessages(prev => [...prev, message])
    setShowFAQ(false)
  }

  const formatMessage = (text: string) => {
    return text.split('\n').map((line, index) => {
      if (line.startsWith('**') && line.endsWith('**')) {
        return (
          <div key={index} className="font-semibold text-sm mb-2 break-words overflow-wrap-anywhere">
            {line.slice(2, -2)}
          </div>
        )
      }
      return <div key={index} className="mb-1 break-words overflow-wrap-anywhere">{line}</div>
    })
  }

  return (
    <>
      {/* Chatbot Toggle Button */}
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            "rounded-full shadow-lg transition-all duration-300",
            "h-12 w-12 md:h-14 md:w-14",
            "bg-blue-600 hover:bg-blue-700 text-white",
            "hover:scale-105 active:scale-95"
          )}
          size="icon"
        >
          {isOpen ? (
            <X className="h-5 w-5 md:h-6 md:w-6" />
          ) : (
            <MessageCircle className="h-5 w-5 md:h-6 md:w-6" />
          )}
        </Button>
      </div>

      {/* Chatbot Window */}
      {isOpen && (
        <div className="fixed bottom-20 right-4 z-40 md:bottom-24 md:right-6">
          <div className={cn(
            "bg-white dark:bg-gray-900 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700",
            "w-80 h-96 md:w-96 md:h-[500px]",
            "animate-in slide-in-from-bottom-4 duration-300",
            "max-w-[calc(100vw-2rem)] max-h-[calc(100vh-8rem)]",
            "flex flex-col overflow-hidden"
          )}>
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 rounded-t-xl">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-full">
                  <Bot className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">LinkzUp Assistant</h3>
                  <p className="text-xs text-green-600 dark:text-green-400">Online</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowFAQ(!showFAQ)}
                  className="h-7 w-7 p-0"
                >
                  {showFAQ ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsMinimized(!isMinimized)}
                  className="h-7 w-7 p-0"
                >
                  {isMinimized ? <Maximize2 className="h-3 w-3" /> : <Minimize2 className="h-3 w-3" />}
                </Button>
              </div>
            </div>

            {/* FAQ Section */}
            {showFAQ && !isMinimized && (
              <div className="p-3 border-b border-gray-200 dark:border-gray-700 bg-blue-50 dark:bg-blue-900/20">
                <div className="flex items-center gap-2 mb-2">
                  <Lightbulb className="h-4 w-4 text-yellow-500" />
                  <span className="text-sm font-medium text-gray-900 dark:text-gray-100">Quick Help</span>
                </div>
                <div className="grid grid-cols-2 gap-1">
                  {quickActions.map((action, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      className="text-xs h-7 justify-start bg-white dark:bg-gray-800 hover:bg-blue-100 dark:hover:bg-blue-800"
                      onClick={() => handleQuickAction(action.text)}
                    >
                      {action.text}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* Messages Area */}
            {!isMinimized && (
              <div className="flex-1 overflow-hidden">
                <ScrollArea className="h-full">
                  <div className="p-3 space-y-3">
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={cn(
                          "flex gap-2",
                          message.sender === 'user' ? 'justify-end' : 'justify-start'
                        )}
                      >
                        {message.sender === 'bot' && (
                          <div className="p-1 bg-blue-100 dark:bg-blue-900 rounded-full self-end flex-shrink-0">
                            <Bot className="h-3 w-3 text-blue-600 dark:text-blue-400" />
                          </div>
                        )}
                        <div
                          className={cn(
                            "max-w-[85%] rounded-lg px-3 py-2 text-sm",
                            message.sender === 'user'
                              ? "bg-blue-600 text-white"
                              : "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                          )}
                        >
                          <div className="break-words whitespace-pre-wrap">
                            {formatMessage(message.text)}
                          </div>
                          <div className="text-xs opacity-70 mt-1">
                            {message.timestamp.toLocaleTimeString([], { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </div>
                        </div>
                        {message.sender === 'user' && (
                          <div className="p-1 bg-gray-200 dark:bg-gray-700 rounded-full self-end flex-shrink-0">
                            <User className="h-3 w-3 text-gray-600 dark:text-gray-400" />
                          </div>
                        )}
                      </div>
                    ))}
                    
                    {isTyping && (
                      <div className="flex gap-2 justify-start">
                        <div className="p-1 bg-blue-100 dark:bg-blue-900 rounded-full self-end flex-shrink-0">
                          <Bot className="h-3 w-3 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div className="bg-gray-100 dark:bg-gray-800 rounded-lg px-3 py-2">
                          <div className="flex gap-1">
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  <div ref={messagesEndRef} />
                </ScrollArea>
              </div>
            )}

            {/* Input Area */}
            {!isMinimized && (
              <div className="p-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 rounded-b-xl">
                <div className="flex gap-2">
                  <Input
                    ref={inputRef}
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder="Ask me anything..."
                    className="flex-1 text-sm bg-white dark:bg-gray-900"
                    disabled={isTyping}
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={!inputValue.trim() || isTyping}
                    size="sm"
                    className="px-3 bg-blue-600 hover:bg-blue-700"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* FAQ Modal for Mobile */}
      {showFAQ && (
        <div className="fixed inset-0 bg-black/50 z-30 md:hidden">
          <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 rounded-t-xl p-4 max-h-[60vh] overflow-hidden">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-yellow-500" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Quick Help</h3>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowFAQ(false)}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <ScrollArea className="max-h-[40vh]">
              <div className="space-y-3 pr-2">
                {faqData.map((faq) => (
                  <div
                    key={faq.id}
                    className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                    onClick={() => handleFAQClick(faq)}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      {faq.icon}
                      <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{faq.question}</span>
                    </div>
                    <Badge variant="secondary" className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
                      {faq.category}
                    </Badge>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        </div>
      )}
    </>
  )
}
