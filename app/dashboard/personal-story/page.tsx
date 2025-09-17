"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { 
  User, BookOpen, Lightbulb, Target, Calendar, Send, Eye, CheckCircle, Sparkles, Mic, 
  ArrowRight, ArrowLeft, Star, Heart, TrendingUp, Users, Zap, Award, Brain, 
  PenTool, MessageSquare, Share2, Save, Clock, RefreshCw, Trash2, Plus, X
} from "lucide-react"
import { useSession } from "next-auth/react"
import { useToast } from "@/hooks/use-toast"
import { PersonalStoryCustomizationPanel, type PersonalStoryCustomization } from "@/components/personal-story-customization"
import { useLinkedInPosting } from "@/hooks/use-linkedin-posting"
import { LinkedInPostButton } from "@/components/linkedin-post-button"
import { ScheduleButton } from "@/components/schedule-button"
import { MicrophoneButton } from "@/components/ui/microphone-button"

interface PersonalStoryForm {
  challenge: string
  achievement: string
  failure: string
  mentor: string
  turning_point: string
  lesson: string
}

interface GeneratedStory {
  id: string
  title: string
  content: string
  tone: string
  wordCount: number
  createdAt: Date
  variation: number
  relatedTopics?: string[]
}

interface GeneratedTopic {
  id: string
  title: string
  status: "pending" | "approved" | "discarded"
}

const storyQuestions = [
  {
    key: "challenge" as keyof PersonalStoryForm,
    title: "Biggest Professional Challenge",
    description: "Describe a significant challenge you faced in your career and how you approached it.",
    placeholder: "Tell us about a time when you faced a difficult situation at work, a project that seemed impossible, or a skill you had to develop quickly...",
    icon: Target,
    color: "from-blue-500 to-blue-600",
    bgColor: "from-blue-50 to-blue-100",
    borderColor: "border-blue-200",
    textColor: "text-blue-700"
  },
  {
    key: "achievement" as keyof PersonalStoryForm,
    title: "Proudest Achievement",
    description: "Share an accomplishment that you're particularly proud of and what it meant to you.",
    placeholder: "Describe a project you completed, a goal you reached, a team you led, or recognition you received...",
    icon: Award,
    color: "from-blue-400 to-blue-500",
    bgColor: "from-blue-50 to-blue-100",
    borderColor: "border-blue-200",
    textColor: "text-blue-700"
  },
  {
    key: "failure" as keyof PersonalStoryForm,
    title: "Learning from Failure",
    description: "Tell us about a time when things didn't go as planned and what you learned from it.",
    placeholder: "Share a mistake you made, a project that failed, or a decision you regret and how it shaped you...",
    icon: Brain,
    color: "from-blue-600 to-blue-700",
    bgColor: "from-blue-50 to-blue-100",
    borderColor: "border-blue-200",
    textColor: "text-blue-700"
  },
  {
    key: "mentor" as keyof PersonalStoryForm,
    title: "Influential Mentor or Role Model",
    description: "Describe someone who significantly impacted your professional journey.",
    placeholder: "Tell us about a boss, colleague, teacher, or industry leader who influenced your career path...",
    icon: Users,
    color: "from-blue-500 to-blue-600",
    bgColor: "from-blue-50 to-blue-100",
    borderColor: "border-blue-200",
    textColor: "text-blue-700"
  },
  {
    key: "turning_point" as keyof PersonalStoryForm,
    title: "Career Turning Point",
    description: "Share a moment or decision that changed the direction of your career.",
    placeholder: "Describe a job change, industry switch, entrepreneurial leap, or realization that shifted your path...",
    icon: TrendingUp,
    color: "from-blue-300 to-blue-400",
    bgColor: "from-blue-50 to-blue-100",
    borderColor: "border-blue-200",
    textColor: "text-blue-700"
  },
  {
    key: "lesson" as keyof PersonalStoryForm,
    title: "Key Life/Career Lesson",
    description: "What's the most important lesson you've learned in your professional journey?",
    placeholder: "Share wisdom about leadership, work-life balance, networking, skill development, or career growth...",
    icon: Lightbulb,
    color: "from-blue-700 to-blue-800",
    bgColor: "from-blue-50 to-blue-100",
    borderColor: "border-blue-200",
    textColor: "text-blue-700"
  },
]

export default function PersonalStoryPage() {
  const { data: session } = useSession()
  const { toast } = useToast()
  const { postToLinkedIn, isPosting, isLinkedInConnected } = useLinkedInPosting()
  const [currentStep, setCurrentStep] = useState(0)
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedStories, setGeneratedStories] = useState<GeneratedStory[]>([])
  const [selectedStory, setSelectedStory] = useState<GeneratedStory | null>(null)
  const [showPreviewModal, setShowPreviewModal] = useState(false)
  const [formData, setFormData] = useState<PersonalStoryForm>({
    challenge: "",
    achievement: "",
    failure: "",
    mentor: "",
    turning_point: "",
    lesson: "",
  })
  const [answersSaved, setAnswersSaved] = useState(false)
  const [generatedTopics, setGeneratedTopics] = useState<GeneratedTopic[]>([])
  const [showTopicApproval, setShowTopicApproval] = useState(false)

  // Debug useEffect to monitor state changes
  useEffect(() => {
    console.log("State changed - showTopicApproval:", showTopicApproval, "generatedTopics length:", generatedTopics.length)
  }, [showTopicApproval, generatedTopics])

  // Load saved form data from database on component mount
  useEffect(() => {
    const loadSavedAnswers = async () => {
      try {
        const response = await fetch('/api/personal-story/answers')
        if (response.ok) {
          const data = await response.json()
          if (data.answers) {
            setFormData(data.answers)
            if (data.customization) {
              setCustomization(data.customization)
            }
            setAnswersSaved(true)
            toast({
              title: "Answers Loaded",
              description: "Your previously saved answers have been restored.",
            })
          }
        }
      } catch (error) {
        console.error('Error loading saved answers:', error)
        // Fallback to localStorage if API fails
        const savedFormData = localStorage.getItem('personalStoryFormData')
        if (savedFormData) {
          try {
            const parsedData = JSON.parse(savedFormData)
            setFormData(parsedData)
          } catch (error) {
            console.error('Error parsing saved form data:', error)
          }
        }
      }
    }

    if (session?.user?.email) {
      loadSavedAnswers()
    }
  }, [session?.user?.email, toast])

  // Save form data to localStorage as backup (will be replaced by database save)
  useEffect(() => {
    localStorage.setItem('personalStoryFormData', JSON.stringify(formData))
  }, [formData])

  // Personal Story Customization state
  const [customization, setCustomization] = useState<PersonalStoryCustomization>({
    tone: "professional",
    language: "english",
    targetAudience: "LinkedIn professionals",
    mainGoal: "engagement",
    storyLength: "medium",
    emotionalTone: "uplifting",
    includeCallToAction: true,
    includeHashtags: true,
    includeEmojis: true,
    personalTouch: true,
  })

  const [provider] = useState<"openai">("openai")

  const handleInputChange = (field: keyof PersonalStoryForm, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleMicrophoneTranscript = (field: keyof PersonalStoryForm, transcript: string) => {
    setFormData((prev) => ({ 
      ...prev, 
      [field]: prev[field] + (prev[field] ? ' ' : '') + transcript.trim()
    }))
  }

  const saveAnswersToDatabase = async () => {
    try {
      const response = await fetch('/api/personal-story/answers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          answers: formData,
          customization: customization
        })
      })

      if (response.ok) {
        console.log('Answers saved to database successfully')
        setAnswersSaved(true)
        toast({
          title: "Answers Saved",
          description: "Your story answers have been saved permanently. You can return anytime to continue.",
        })
        return true
      } else {
        console.error('Failed to save answers to database')
        toast({
          title: "Save Failed",
          description: "Failed to save answers. Please try again.",
          variant: "destructive",
        })
        return false
      }
    } catch (error) {
      console.error('Error saving answers to database:', error)
      toast({
        title: "Save Failed",
        description: "Failed to save answers. Please try again.",
        variant: "destructive",
      })
      return false
    }
  }

  const clearSavedAnswersFromDatabase = async () => {
    try {
      const response = await fetch('/api/personal-story/answers', {
        method: 'DELETE',
      })

      if (response.ok) {
        console.log('Saved answers deleted from database successfully')
        return true
      } else {
        console.error('Failed to delete saved answers from database')
        return false
      }
    } catch (error) {
      console.error('Error deleting saved answers from database:', error)
      return false
    }
  }

  const clearFormData = async () => {
    setFormData({
      challenge: "",
      achievement: "",
      failure: "",
      mentor: "",
      turning_point: "",
      lesson: "",
    })
    localStorage.removeItem('personalStoryFormData')
    setCurrentStep(0)
    setAnswersSaved(false)
    
    // Also clear from database if answers were saved there
    if (answersSaved) {
      await clearSavedAnswersFromDatabase()
    }
    
    toast({
      title: "Form Cleared",
      description: "All answers have been cleared. You can start fresh.",
    })
  }

  const nextStep = () => {
    if (currentStep < storyQuestions.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const generateRelatedTopics = async (story: GeneratedStory) => {
    try {
      console.log("Starting topic generation for story:", story.title)
      
      // Create dynamic topic generation prompts with variety
      const topicPrompts = [
        `Based on this personal story, generate 3 eye-catching LinkedIn post topics that would go viral. Each topic should have a compelling hook, interesting punchline, and be highly shareable. Make them attention-grabbing and thought-provoking.

Story: ${story.content}

Generate exactly 3 topics with these characteristics:
- Eye-catching headlines that make people stop scrolling
- Interesting punchlines or unexpected angles
- Professional but with personality
- Highly shareable and engaging
- Based on the specific themes in the story
- Each should be unique and different from the others

Format as a simple list, one topic per line.`,

        `Transform this personal story into 3 viral-worthy LinkedIn post topics. Each topic should have a strong hook, compelling narrative angle, and be designed to spark conversations and engagement.

Story: ${story.content}

Create 3 topics that are:
- Attention-grabbing and scroll-stopping
- Have interesting twists or unexpected insights
- Professional yet relatable
- Designed to generate comments and shares
- Based on the unique elements of this story
- Each with a different angle or perspective

Format as a simple list, one topic per line.`,

        `Based on this personal story, create 3 LinkedIn post topics that would make professionals stop, read, and share. Each topic should have a compelling hook and interesting punchline that relates to the story's key themes.

Story: ${story.content}

Generate 3 topics that are:
- Irresistibly clickable and engaging
- Have surprising or counterintuitive angles
- Professional but with emotional appeal
- Designed to create discussion and engagement
- Based on the specific challenges and lessons in the story
- Each offering a different valuable insight

Format as a simple list, one topic per line.`
      ]

      // Randomly select a prompt for variety
      const selectedPrompt = topicPrompts[Math.floor(Math.random() * topicPrompts.length)]
      console.log("Selected prompt variant:", topicPrompts.indexOf(selectedPrompt) + 1)

      console.log("Sending topic generation request...")
      
      // Add randomization to customization for variety
      const randomTones = ["professional", "conversational", "inspirational", "authoritative"]
      const randomGoals = ["engagement", "viral", "discussion", "shares"]
      const randomTemperature = 0.8 + Math.random() * 0.2 // 0.8 to 1.0 for more creativity
      
      const response = await fetch("/api/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "topics",
          prompt: selectedPrompt,
          provider: "openai",
          customization: {
            tone: randomTones[Math.floor(Math.random() * randomTones.length)],
            language: "english",
            wordCount: 50,
            targetAudience: "LinkedIn professionals",
            mainGoal: randomGoals[Math.floor(Math.random() * randomGoals.length)],
            includeHashtags: false,
            includeEmojis: false,
            callToAction: false,
            temperature: randomTemperature,
            maxTokens: 600,
            humanLike: true,
            ambiguity: 70,
            randomness: 60,
            personalTouch: true,
            storytelling: true,
            emotionalDepth: 85,
            conversationalStyle: true,
          }
        }),
      })

      console.log("Topic generation response status:", response.status)
      
      if (response.ok) {
        const data = await response.json()
        console.log("Topic generation response data:", data)
        
        const topicsContent = data.data?.content || data.content || ""
        console.log("Topics content:", topicsContent)
        
        // Parse topics from the response
        const topics = topicsContent
          .split('\n')
          .map((line: string) => line.trim())
          .filter((line: string) => line.length > 0)
          .slice(0, 3) // Take only first 3 topics
          .map((topic: string, index: number) => ({
            id: `topic-${Date.now()}-${index}`,
            title: topic.replace(/^\d+\.\s*/, '').trim(), // Remove numbering
            status: "pending" as const
          }))

        console.log("Parsed topics:", topics)
        
        // If no topics were parsed, create some fallback topics
        if (topics.length === 0) {
          console.log("No topics parsed, creating fallback topics")
          
          // Create more diverse fallback topics based on story content
          const storyText = story.content.toLowerCase()
          let fallbackTopics = []
          
          if (storyText.includes("challenge") || storyText.includes("difficult")) {
            fallbackTopics.push("The Challenge That Changed Everything: My Unexpected Breakthrough")
          }
          if (storyText.includes("failure") || storyText.includes("mistake")) {
            fallbackTopics.push("Why My Biggest Failure Became My Greatest Success")
          }
          if (storyText.includes("mentor") || storyText.includes("advice")) {
            fallbackTopics.push("The One Piece of Advice That Transformed My Career")
          }
          if (storyText.includes("lesson") || storyText.includes("learn")) {
            fallbackTopics.push("The Hard Lesson That Taught Me Everything")
          }
          
          // Fill remaining slots with generic but engaging topics
          const genericTopics = [
            "What I Wish I Knew Before Starting My Career",
            "The Moment Everything Clicked: My Professional Awakening",
            "Breaking Through: How I Overcame My Biggest Obstacle"
          ]
          
          while (fallbackTopics.length < 3) {
            const randomTopic = genericTopics[Math.floor(Math.random() * genericTopics.length)]
            if (!fallbackTopics.includes(randomTopic)) {
              fallbackTopics.push(randomTopic)
            }
          }
          
          const finalFallbackTopics = fallbackTopics.slice(0, 3).map((title, index) => ({
            id: `fallback-topic-${Date.now()}-${index}`,
            title,
            status: "pending" as const
          }))
          setGeneratedTopics(finalFallbackTopics)
        } else {
          setGeneratedTopics(topics)
        }
        
        setShowTopicApproval(true)
        console.log("Set showTopicApproval to true, generatedTopics length:", topics.length)
        
        toast({
          title: "Topics Generated",
          description: `${topics.length > 0 ? topics.length : 3} related topics have been generated for your review.`,
        })
      } else {
        console.error("Topic generation failed with status:", response.status)
        const errorData = await response.json().catch(() => ({}))
        console.error("Error data:", errorData)
        
        // Create fallback topics even if API fails
        const storyText = story.content.toLowerCase()
        let fallbackTopics = []
        
        if (storyText.includes("challenge") || storyText.includes("difficult")) {
          fallbackTopics.push("The Challenge That Changed Everything: My Unexpected Breakthrough")
        }
        if (storyText.includes("failure") || storyText.includes("mistake")) {
          fallbackTopics.push("Why My Biggest Failure Became My Greatest Success")
        }
        if (storyText.includes("mentor") || storyText.includes("advice")) {
          fallbackTopics.push("The One Piece of Advice That Transformed My Career")
        }
        if (storyText.includes("lesson") || storyText.includes("learn")) {
          fallbackTopics.push("The Hard Lesson That Taught Me Everything")
        }
        
        // Fill remaining slots with generic but engaging topics
        const genericTopics = [
          "What I Wish I Knew Before Starting My Career",
          "The Moment Everything Clicked: My Professional Awakening",
          "Breaking Through: How I Overcame My Biggest Obstacle"
        ]
        
        while (fallbackTopics.length < 3) {
          const randomTopic = genericTopics[Math.floor(Math.random() * genericTopics.length)]
          if (!fallbackTopics.includes(randomTopic)) {
            fallbackTopics.push(randomTopic)
          }
        }
        
        const finalFallbackTopics = fallbackTopics.slice(0, 3).map((title, index) => ({
          id: `fallback-topic-${Date.now()}-${index}`,
          title,
          status: "pending" as const
        }))
        setGeneratedTopics(finalFallbackTopics)
        setShowTopicApproval(true)
        
        toast({
          title: "Topics Generated (Fallback)",
          description: "Generated fallback topics for your review.",
        })
      }
    } catch (error) {
      console.error("Error generating related topics:", error)
      
      // Create fallback topics even if there's an error
      const storyText = story.content.toLowerCase()
      let fallbackTopics = []
      
      if (storyText.includes("challenge") || storyText.includes("difficult")) {
        fallbackTopics.push("The Challenge That Changed Everything: My Unexpected Breakthrough")
      }
      if (storyText.includes("failure") || storyText.includes("mistake")) {
        fallbackTopics.push("Why My Biggest Failure Became My Greatest Success")
      }
      if (storyText.includes("mentor") || storyText.includes("advice")) {
        fallbackTopics.push("The One Piece of Advice That Transformed My Career")
      }
      if (storyText.includes("lesson") || storyText.includes("learn")) {
        fallbackTopics.push("The Hard Lesson That Taught Me Everything")
      }
      
      // Fill remaining slots with generic but engaging topics
      const genericTopics = [
        "What I Wish I Knew Before Starting My Career",
        "The Moment Everything Clicked: My Professional Awakening",
        "Breaking Through: How I Overcame My Biggest Obstacle"
      ]
      
      while (fallbackTopics.length < 3) {
        const randomTopic = genericTopics[Math.floor(Math.random() * genericTopics.length)]
        if (!fallbackTopics.includes(randomTopic)) {
          fallbackTopics.push(randomTopic)
        }
      }
      
      const finalFallbackTopics = fallbackTopics.slice(0, 3).map((title, index) => ({
        id: `fallback-topic-${Date.now()}-${index}`,
        title,
        status: "pending" as const
      }))
      setGeneratedTopics(finalFallbackTopics)
      setShowTopicApproval(true)
      
      toast({
        title: "Topics Generated (Fallback)",
        description: "Generated fallback topics for your review.",
      })
    }
  }

  const generateStory = async () => {
    // Check if all required fields are filled
    const requiredFields = ["challenge", "achievement", "failure", "mentor", "turning_point", "lesson"]
    const missingFields = requiredFields.filter(field => !formData[field as keyof PersonalStoryForm]?.trim())
    
    if (missingFields.length > 0) {
      toast({
        title: "Missing Information",
        description: `Please complete all story questions before generating your personal story.`,
        variant: "destructive",
      })
      return
    }

    // Skip credit check for now to avoid MongoDB connection issues
    // TODO: Implement proper credit checking when database is stable
    console.log("Skipping credit check for story generation")

    setIsGenerating(true)
    let timeoutId: NodeJS.Timeout | undefined

    try {
      // Create a comprehensive prompt from all story elements
      const storyPrompt = `Personal story about my professional journey: I faced a challenge with ${formData.challenge}, achieved success through ${formData.achievement}, learned from a failure when ${formData.failure}, was mentored by ${formData.mentor}, experienced a turning point when ${formData.turning_point}, and learned the key lesson that ${formData.lesson}.`

      const controller = new AbortController()
      timeoutId = setTimeout(() => controller.abort(), 60000) // 60 second timeout

      const requestBody = {
        type: "story",
        prompt: storyPrompt,
        provider: "openai",
        customization: {
          tone: customization.tone,
          language: customization.language,
          wordCount: 500,
          targetAudience: customization.targetAudience,
          mainGoal: customization.mainGoal,
          includeHashtags: true,
          includeEmojis: true,
          callToAction: true,
          humanLike: true,
          ambiguity: 60,
          randomness: 40,
          personalTouch: true,
          storytelling: true,
          emotionalDepth: 80,
          conversationalStyle: true,
          temperature: 0.8,
          maxTokens: 2000,
        }
      }
      
      console.log("Sending request to AI:", requestBody) // Debug log
      
      const response = await fetch("/api/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify(requestBody),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error("API Error Response:", errorData)
        console.error("Response status:", response.status)
        console.error("Response status text:", response.statusText)
        throw new Error(errorData.error || `Failed to generate stories. Status: ${response.status}`)
      }

      if (timeoutId) clearTimeout(timeoutId)
      const data = await response.json()
      console.log("AI Response:", data) // Debug log
      console.log("Response data structure:", JSON.stringify(data, null, 2)) // Detailed debug log
      
      const contents = Array.isArray(data.data.content) ? data.data.content : [data.data.content]
      console.log("Parsed contents:", contents) // Debug log
      console.log("Number of contents:", contents.length) // Debug log

      // Use the first generated content as the single story
      let storyContent = contents[0] || "Story content not generated properly"

      // If no content was generated at all, create a single sample story
      if (contents.length === 0 || (contents.length === 1 && contents[0].length < 50)) {
        storyContent = `Based on your personal journey, here's your story:\n\nThroughout my career, I've faced significant challenges like "${formData.challenge}", which tested my resilience and determination. Through perseverance and the support of mentors like "${formData.mentor}", I was able to overcome obstacles and achieve remarkable success, including "${formData.achievement}". \n\nI've also learned valuable lessons from failures, such as when "${formData.failure}", which taught me the importance of continuous learning and growth. A major turning point in my career was when "${formData.turning_point}", which completely changed my perspective and approach.\n\nThe most valuable lesson I've learned is that "${formData.lesson}". This insight has become a cornerstone of my professional philosophy and continues to guide my decisions and actions in both personal and professional contexts.`
      }

      // Create a single story
      const newStory: GeneratedStory = {
        id: `story-${Date.now()}`,
        title: `My Professional Journey`,
        content: storyContent.trim(),
        tone: customization.tone,
        wordCount: 500,
        createdAt: new Date(),
        variation: 1,
      }

      setGeneratedStories([newStory, ...generatedStories])
      
      // Check if we got proper content
      if (newStory.content && newStory.content.length > 50) {
        // Generate related topics
        await generateRelatedTopics(newStory)
        
        toast({
          title: "Story Generated!",
          description: "Your personal story has been created successfully. Please review the related topics below.",
        })
        // Save answers permanently to database after successful generation
        await saveAnswersToDatabase()
        // Clear localStorage backup since data is now in database
        localStorage.removeItem('personalStoryFormData')
      } else {
        toast({
          title: "Generation Issue",
          description: "Story content may need regeneration. Please try again.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error generating story:", error)
      
      let errorMessage = "Failed to generate story. Please try again."
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          errorMessage = "Request timed out. Please try again."
        } else {
          errorMessage = error.message
        }
      }
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      if (timeoutId) clearTimeout(timeoutId)
      setIsGenerating(false)
    }
  }

  const handleSelectStory = (story: GeneratedStory) => {
    setSelectedStory(story)
    setShowPreviewModal(true)
  }

  const handleSaveDraft = async () => {
    if (!selectedStory) return

    try {
      const response = await fetch("/api/drafts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: selectedStory.title,
          content: selectedStory.content,
          format: "personal-story",
          niche: "Personal Story"
        })
      })

      if (response.ok) {
        toast({
          title: "Draft Saved!",
          description: "Your personal story has been saved to drafts successfully.",
        })
        setShowPreviewModal(false)
      } else {
        toast({
          title: "Error",
          description: "Failed to save draft. Please try again.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error saving draft:", error)
      toast({
        title: "Error",
        description: "Failed to save draft. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handlePostStory = async () => {
    if (!selectedStory) return

    try {
      const result = await postToLinkedIn({
        content: selectedStory.content,
        images: [],
      })

      if (result.success) {
        toast({
          title: "Posted Successfully!",
          description: "Your personal story has been posted to LinkedIn",
        })
        setShowPreviewModal(false)
      }
    } catch (error) {
      console.error("Error posting story:", error)
      toast({
        title: "Posting Failed",
        description: "Failed to post story to LinkedIn. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleApproveTopic = async (topicId: string) => {
    const topic = generatedTopics.find(t => t.id === topicId)
    if (!topic) return

    try {
      const response = await fetch('/api/approved-topics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topics: [topic.title],
          storyId: generatedStories[0]?.id
        })
      })

      if (response.ok) {
        setGeneratedTopics(prev => prev.map(t => 
          t.id === topicId ? { ...t, status: "approved" } : t
        ))
        toast({
          title: "Topic Approved",
          description: "Topic has been added to your approved topics.",
        })
      }
    } catch (error) {
      console.error("Error approving topic:", error)
      toast({
        title: "Error",
        description: "Failed to approve topic. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleDiscardTopic = (topicId: string) => {
    setGeneratedTopics(prev => prev.map(t => 
      t.id === topicId ? { ...t, status: "discarded" } : t
    ))
  }

  const handleApproveAllTopics = async () => {
    const pendingTopics = generatedTopics.filter(t => t.status === "pending")
    if (pendingTopics.length === 0) return

    try {
      const response = await fetch('/api/approved-topics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topics: pendingTopics.map(t => t.title),
          storyId: generatedStories[0]?.id
        })
      })

      if (response.ok) {
        setGeneratedTopics(prev => prev.map(t => 
          t.status === "pending" ? { ...t, status: "approved" } : t
        ))
        toast({
          title: "All Topics Approved",
          description: "All topics have been added to your approved topics.",
        })
      }
    } catch (error) {
      console.error("Error approving topics:", error)
      toast({
        title: "Error",
        description: "Failed to approve topics. Please try again.",
        variant: "destructive",
      })
    }
  }

  const currentQuestion = storyQuestions[currentStep]

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-white via-blue-50/20 to-black/5 dark:from-black dark:via-blue-950/20 dark:to-white/5 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-500/10 to-secondary/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-secondary/10 to-blue-500/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-blue-400/5 to-secondary/5 rounded-full blur-3xl"></div>
      </div>

      {/* Header */}
      <header className="flex h-14 sm:h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12 px-3 sm:px-4 lg:px-6 relative z-10">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <SidebarTrigger className="-ml-1 flex-shrink-0" />
          <Separator orientation="vertical" className="mr-2 h-4 hidden sm:block" />
          <Breadcrumb className="min-w-0">
            <BreadcrumbList className="flex-wrap">
              <BreadcrumbItem className="hidden sm:block">
                <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden sm:block" />
              <BreadcrumbItem>
                <BreadcrumbPage className="text-sm sm:text-base">Personal Story Generator</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>

      {/* Hero Section */}
      <motion.div 
        className="px-3 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-8 relative z-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <div className="max-w-4xl mx-auto text-center space-y-4">
          <motion.div 
            className="space-y-3"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
          >
            <motion.div 
              className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-secondary rounded-2xl mb-4"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.6, delay: 0.4, ease: "easeOut" }}
            >
              <BookOpen className="w-8 h-8 text-white" />
            </motion.div>
            
            <motion.h1 
              className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-black via-blue-600 to-secondary dark:from-white dark:via-blue-400 dark:to-secondary bg-clip-text text-transparent leading-tight"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.6, ease: "easeOut" }}
            >
              Personal Story Generator
            </motion.h1>
            
            <motion.p 
              className="text-base sm:text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.8, ease: "easeOut" }}
            >
              Transform your professional journey into compelling stories that inspire and connect with your audience
            </motion.p>
          </motion.div>

          {/* Story Journey Preview */}
          <motion.div 
            className="flex flex-wrap items-center justify-center gap-2 sm:gap-4 pt-4 sm:pt-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.0, ease: "easeOut" }}
          >
            {storyQuestions.map((question, index) => (
              <motion.div
                key={question.key}
                className="flex items-center gap-1 sm:gap-2"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 1.2 + index * 0.1, ease: "easeOut" }}
              >
                <div className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-gradient-to-r ${question.color} flex items-center justify-center`}>
                  <question.icon className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                </div>
                {index < storyQuestions.length - 1 && (
                  <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400" />
                )}
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.div>

      {/* Main Content */}
      <motion.div 
        className="px-2 sm:px-4 pb-6 relative z-10"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 1.4, ease: "easeOut" }}
      >
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-8 lg:gap-12">
            {/* Main Story Form */}
            <div className="lg:col-span-2 space-y-4 sm:space-y-8">
              {/* Enhanced Story Questions Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 1.6, ease: "easeOut" }}
              >
                <Card className="bg-white/95 dark:bg-black/95 backdrop-blur-sm border-0 shadow-2xl overflow-hidden">
                  <CardHeader className="pb-4 sm:pb-6 bg-gradient-to-r from-blue-500/10 to-secondary/10 dark:from-blue-950/20 dark:to-secondary/10">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div className="flex items-center gap-3 sm:gap-4">
                        <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-r ${currentQuestion.color} flex items-center justify-center flex-shrink-0`}>
                          <currentQuestion.icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <CardTitle className="text-lg sm:text-2xl font-bold text-black dark:text-white leading-tight">
                            {currentQuestion.title}
                          </CardTitle>
                          <CardDescription className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-1">
                            Step {currentStep + 1} of {storyQuestions.length} • {currentQuestion.description}
                          </CardDescription>
                        </div>
                      </div>
                      {Object.values(formData).some(value => value.trim() !== "") && (
                        <Badge variant={answersSaved ? "default" : "secondary"} className="text-xs sm:text-sm px-2 sm:px-3 py-1 self-start sm:self-center">
                          <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                          {answersSaved ? "Saved" : "Auto-saved"}
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  
                  <CardContent className="p-4 sm:p-8 space-y-4 sm:space-y-8">
                    {/* Enhanced Progress Indicator */}
                    <div className="space-y-3 sm:space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">Story Progress</span>
                        <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">{Math.round(((currentStep + 1) / storyQuestions.length) * 100)}% Complete</span>
                      </div>
                      <div className="flex items-center gap-1 sm:gap-2 overflow-x-auto pb-2">
                        {storyQuestions.map((question, index) => (
                          <motion.div
                            key={index}
                            className="flex items-center gap-1 sm:gap-2 flex-shrink-0"
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.3, delay: index * 0.1 }}
                          >
                            <div
                              className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center transition-all duration-300 ${
                                index < currentStep 
                                  ? `bg-gradient-to-r ${question.color} shadow-lg` 
                                  : index === currentStep
                                  ? `bg-gradient-to-r ${question.color} shadow-lg ring-2 sm:ring-4 ring-blue-200`
                                  : "bg-gray-200"
                              }`}
                            >
                              {index < currentStep ? (
                                <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                              ) : (
                                <question.icon className={`w-3 h-3 sm:w-4 sm:h-4 ${index === currentStep ? 'text-white' : 'text-gray-500'}`} />
                              )}
                            </div>
                            {index < storyQuestions.length - 1 && (
                              <div className={`w-4 sm:w-8 h-0.5 ${index < currentStep ? 'bg-gradient-to-r from-blue-500 to-blue-600' : 'bg-gray-200'}`} />
                            )}
                          </motion.div>
                        ))}
                      </div>
                    </div>

                    {/* Enhanced Question Input */}
                    <div className="space-y-4 sm:space-y-6">
                      <div className="space-y-2 sm:space-y-3">
                        <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                          <Mic className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                          <span>Tip: Click the microphone icon to record your answer instead of typing</span>
                        </div>
                      </div>
                      
                      <div className="relative group">
                        <Textarea
                          placeholder={currentQuestion.placeholder}
                          value={formData[currentQuestion.key]}
                          onChange={(e) => handleInputChange(currentQuestion.key, e.target.value)}
                          className={`min-h-[150px] sm:min-h-[200px] text-sm sm:text-lg resize-none border-2 border-blue-200 dark:border-blue-800 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-blue-200 dark:focus:ring-blue-800/20 rounded-xl sm:rounded-2xl bg-white/80 dark:bg-black/80 focus:bg-white dark:focus:bg-black text-black dark:text-white placeholder-gray-500 dark:placeholder-gray-400 pr-12 sm:pr-16 transition-all duration-300`}
                        />
                        <div className="absolute bottom-3 right-3 sm:bottom-4 sm:right-4">
                          <MicrophoneButton
                            onTranscript={(transcript) => handleMicrophoneTranscript(currentQuestion.key, transcript)}
                            size="sm"
                            variant="ghost"
                            className="h-10 w-10 sm:h-12 sm:w-12 p-0 hover:bg-blue-100 dark:hover:bg-blue-900/50 rounded-lg sm:rounded-xl transition-colors"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Enhanced Navigation */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pt-4 sm:pt-6 border-t border-blue-200/50 dark:border-blue-800/50">
                      <div className="flex flex-wrap gap-2 sm:gap-3 w-full sm:w-auto">
                        <Button
                          variant="outline"
                          onClick={prevStep}
                          disabled={currentStep === 0}
                          className="gap-2 h-10 sm:h-12 px-4 sm:px-6 rounded-lg sm:rounded-xl border-2 border-blue-200 dark:border-blue-800 hover:bg-blue-50 dark:hover:bg-blue-950/50 text-blue-700 dark:text-blue-300 text-sm sm:text-base flex-1 sm:flex-none"
                        >
                          <ArrowLeft className="w-3 h-3 sm:w-4 sm:h-4" />
                          Previous
                        </Button>
                        <Button
                          variant="outline"
                          onClick={clearFormData}
                          className="gap-1 sm:gap-2 h-10 sm:h-12 px-3 sm:px-6 rounded-lg sm:rounded-xl border-2 border-blue-200 dark:border-blue-800 hover:bg-blue-50 dark:hover:bg-blue-950/50 hover:border-blue-300 dark:hover:border-blue-700 text-blue-600 dark:text-blue-400 text-xs sm:text-base flex-1 sm:flex-none"
                        >
                          <Trash2 className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                          <span className="hidden sm:inline">Clear All</span>
                          <span className="sm:hidden">Clear</span>
                        </Button>
                        <Button
                          variant="outline"
                          onClick={saveAnswersToDatabase}
                          disabled={Object.values(formData).every(value => value.trim() === "")}
                          className="gap-1 sm:gap-2 h-10 sm:h-12 px-3 sm:px-6 rounded-lg sm:rounded-xl border-2 border-blue-200 dark:border-blue-800 hover:bg-blue-50 dark:hover:bg-blue-950/50 hover:border-blue-300 dark:hover:border-blue-700 text-blue-600 dark:text-blue-400 text-xs sm:text-base flex-1 sm:flex-none"
                        >
                          <Save className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                          <span className="hidden sm:inline">Save Progress</span>
                          <span className="sm:hidden">Save</span>
                        </Button>
                      </div>
                      
                      {currentStep < storyQuestions.length - 1 ? (
                        <Button 
                          onClick={nextStep} 
                          className="gap-2 h-10 sm:h-12 px-6 sm:px-8 bg-gradient-to-r from-blue-500 to-secondary hover:from-blue-600 hover:to-secondary/90 text-white rounded-lg sm:rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 w-full sm:w-auto text-sm sm:text-base"
                        >
                          Next Step
                          <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4" />
                        </Button>
                      ) : (
                            <Button
                              onClick={generateStory}
                              disabled={isGenerating}
                              className="gap-2 sm:gap-3 h-10 sm:h-12 px-6 sm:px-8 bg-gradient-to-r from-blue-500 to-secondary hover:from-blue-600 hover:to-secondary/90 text-white rounded-lg sm:rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 w-full sm:w-auto text-sm sm:text-base"
                            >
                              {isGenerating ? (
                                <>
                                  <div className="animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 border-b-2 border-white"></div>
                                  <span>Generating Story...</span>
                                </>
                              ) : (
                                <>
                                  <Sparkles className="w-4 h-4 sm:w-5 sm:h-5" />
                                  <span>Generate My Story</span>
                                </>
                              )}
                            </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Enhanced Generated Stories */}
              <AnimatePresence>
                {isGenerating && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.5 }}
                  >
                    <Card className="bg-white/95 dark:bg-black/95 backdrop-blur-sm border-0 shadow-2xl">
                      <CardContent className="flex items-center justify-center py-16">
                        <div className="text-center space-y-6">
                          <motion.div
                            className="relative"
                            animate={{ rotate: 360 }}
                            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                          >
                            <div className="w-20 h-20 border-4 border-blue-200 dark:border-blue-800 border-t-blue-500 dark:border-t-blue-400 rounded-full"></div>
                            <div className="absolute inset-0 flex items-center justify-center">
                              <Sparkles className="w-8 h-8 text-blue-500 dark:text-blue-400 animate-pulse" />
                            </div>
                          </motion.div>
                          <div className="space-y-2">
                            <h3 className="text-2xl font-bold text-black dark:text-white">Crafting Your Stories</h3>
                            <p className="text-gray-600 dark:text-gray-400">Our AI is weaving your experiences into compelling narratives...</p>
                          </div>
                          <div className="flex justify-center space-x-1">
                            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                )}
              </AnimatePresence>
              
              {generatedStories.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                >
                  <Card className="bg-white/95 dark:bg-black/95 backdrop-blur-sm border-0 shadow-2xl">
                    <CardHeader className="pb-6 bg-gradient-to-r from-blue-500/10 to-secondary/10 dark:from-blue-950/20 dark:to-secondary/10">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-secondary rounded-2xl flex items-center justify-center">
                          <BookOpen className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <CardTitle className="text-2xl font-bold text-black dark:text-white">
                            Your Story Collection
                          </CardTitle>
                          <CardDescription className="text-gray-600 dark:text-gray-400 mt-1">
                            {generatedStories.length} unique variations • Choose your favorite to share
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="p-4 sm:p-8">
                      <div className="space-y-4 sm:space-y-6">
                        {generatedStories.length > 0 && generatedStories.every(story => !story.content || story.content.length < 50) && (
                          <motion.div 
                            className="p-4 sm:p-6 border-2 border-blue-200 dark:border-blue-800 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-950/30 dark:to-blue-900/30 rounded-xl sm:rounded-2xl"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.3 }}
                          >
                            <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                              <div className="w-6 h-6 sm:w-8 sm:h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                                <RefreshCw className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                              </div>
                              <h4 className="font-semibold text-sm sm:text-base text-blue-800 dark:text-blue-200">Regeneration Needed</h4>
                            </div>
                            <p className="text-xs sm:text-sm text-blue-700 dark:text-blue-300 mb-3 sm:mb-4">
                              The story may not have generated properly. Click below to regenerate with fresh content.
                            </p>
                            <Button 
                              onClick={generateStory}
                              disabled={isGenerating}
                              className="gap-2 bg-blue-500 hover:bg-blue-600 text-white text-sm sm:text-base h-9 sm:h-10"
                            >
                              <RefreshCw className="w-3 h-3 sm:w-4 sm:h-4" />
                              {isGenerating ? "Regenerating..." : "Regenerate Story"}
                            </Button>
                          </motion.div>
                        )}
                        
                        <div className="grid gap-4 sm:gap-6">
                          {generatedStories.map((story, index) => (
                            <motion.div
                              key={story.id}
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ duration: 0.5, delay: index * 0.1 }}
                              className="group cursor-pointer"
                              onClick={() => handleSelectStory(story)}
                            >
                              <Card className="bg-white dark:bg-black border-2 border-blue-200 dark:border-blue-800 hover:border-blue-500 dark:hover:border-blue-400 hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]">
                                <CardContent className="p-4 sm:p-6">
                                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4 mb-3 sm:mb-4">
                                    <div className="flex flex-wrap items-center gap-2">
                                      <Badge variant="secondary" className="text-xs sm:text-sm px-2 sm:px-3 py-1">
                                        {story.tone}
                                      </Badge>
                                      <Badge variant="outline" className="text-xs sm:text-sm px-2 sm:px-3 py-1">
                                        {story.wordCount} words
                                      </Badge>
                                      {story.variation && (
                                        <Badge className="text-xs sm:text-sm px-2 sm:px-3 py-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white">
                                          Variation {story.variation}
                                        </Badge>
                                      )}
                                    </div>
                                    <div className="flex items-center gap-2 text-gray-400 dark:text-gray-500 group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors self-start">
                                      <Eye className="w-4 h-4 sm:w-5 sm:h-5" />
                                      <span className="text-xs sm:text-sm font-medium">Preview</span>
                                    </div>
                                  </div>
                                  
                                  <h3 className="text-lg sm:text-xl font-bold text-black dark:text-white mb-3 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors leading-tight">
                                    {story.title}
                                  </h3>
                                  
                                  <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 leading-relaxed line-clamp-4 mb-4">
                                    {story.content && story.content.length > 0 
                                      ? story.content 
                                      : "Story content is being generated..."}
                                  </p>
                                  
                                  {story.content && story.content.length > 0 && (
                                    <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-3 sm:pt-4 border-t border-blue-200/50 dark:border-blue-800/50">
                                      <LinkedInPostButton 
                                        content={story.content}
                                        className="flex-1 h-9 sm:h-10 bg-gradient-to-r from-blue-500 to-secondary hover:from-blue-600 hover:to-secondary/90 text-white rounded-lg sm:rounded-xl text-sm sm:text-base"
                                      />
                                      <ScheduleButton
                                        content={story.content}
                                        defaultPlatform="linkedin"
                                        defaultType="text"
                                        className="flex-1 h-9 sm:h-10 bg-gradient-to-r from-blue-500 to-secondary hover:from-blue-600 hover:to-secondary/90 text-white rounded-lg sm:rounded-xl text-sm sm:text-base"
                                      />
                                    </div>
                                  )}
                                </CardContent>
                              </Card>
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {/* Topic Approval Section */}
              {showTopicApproval && generatedTopics.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                >
                  <Card className="bg-white/95 dark:bg-black/95 backdrop-blur-sm border-0 shadow-2xl">
                    <CardHeader className="pb-4 sm:pb-6 bg-gradient-to-r from-blue-500/10 to-secondary/10 dark:from-blue-950/20 dark:to-secondary/10">
                      <div className="flex items-center gap-3 sm:gap-4">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-blue-500 to-secondary rounded-2xl flex items-center justify-center flex-shrink-0">
                          <Lightbulb className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                        </div>
                        <div>
                          <CardTitle className="text-lg sm:text-2xl font-bold text-black dark:text-white leading-tight">
                            Related Topics
                          </CardTitle>
                          <CardDescription className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-1">
                            Review and approve topics generated from your story
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="p-4 sm:p-8">
                      <div className="space-y-4 sm:space-y-6">
                        {generatedTopics.map((topic, index) => (
                          <motion.div
                            key={topic.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            className={`p-4 sm:p-6 rounded-xl sm:rounded-2xl border-2 transition-all duration-300 ${
                              topic.status === "approved" 
                                ? "border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950/30" 
                                : topic.status === "discarded"
                                ? "border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950/30"
                                : "border-blue-200 bg-white dark:border-blue-800 dark:bg-black"
                            }`}
                          >
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
                              <div className="flex-1">
                                <h4 className="text-sm sm:text-base font-semibold text-black dark:text-white mb-2">
                                  {topic.title}
                                </h4>
                                <div className="flex items-center gap-2">
                                  {topic.status === "approved" && (
                                    <Badge className="bg-blue-500 text-white text-xs">
                                      <CheckCircle className="w-3 h-3 mr-1" />
                                      Approved
                                    </Badge>
                                  )}
                                  {topic.status === "discarded" && (
                                    <Badge variant="destructive" className="text-xs">
                                      <X className="w-3 h-3 mr-1" />
                                      Discarded
                                    </Badge>
                                  )}
                                  {topic.status === "pending" && (
                                    <Badge variant="secondary" className="text-xs">
                                      <Clock className="w-3 h-3 mr-1" />
                                      Pending Review
                                    </Badge>
                                  )}
                                </div>
                              </div>
                              
                              {topic.status === "pending" && (
                                <div className="flex gap-2 sm:gap-3">
                                  <Button
                                    onClick={() => handleApproveTopic(topic.id)}
                                    size="sm"
                                    className="bg-blue-500 hover:bg-blue-600 text-white text-xs sm:text-sm h-8 sm:h-9 px-3 sm:px-4"
                                  >
                                    <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                                    <span className="hidden sm:inline">Approve</span>
                                  </Button>
                                  <Button
                                    onClick={() => handleDiscardTopic(topic.id)}
                                    variant="outline"
                                    size="sm"
                                    className="border-red-200 text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950/50 text-xs sm:text-sm h-8 sm:h-9 px-3 sm:px-4"
                                  >
                                    <X className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                                    <span className="hidden sm:inline">Discard</span>
                                  </Button>
                                </div>
                              )}
                            </div>
                          </motion.div>
                        ))}
                        
                        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-4 border-t border-blue-200/50 dark:border-blue-800/50">
                          {generatedTopics.some(t => t.status === "pending") && (
                            <Button
                              onClick={handleApproveAllTopics}
                              className="flex-1 bg-blue-500 hover:bg-blue-600 text-white h-10 sm:h-12 text-sm sm:text-base"
                            >
                              <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                              Approve All Topics
                            </Button>
                          )}
                          <Button
                            onClick={() => {
                              if (generatedStories.length > 0) {
                                generateRelatedTopics(generatedStories[0])
                              }
                            }}
                            variant="outline"
                            className="flex-1 border-purple-200 text-purple-600 hover:bg-purple-50 dark:border-purple-800 dark:text-purple-400 dark:hover:bg-purple-950/50 h-10 sm:h-12 text-sm sm:text-base"
                          >
                            <RefreshCw className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                            Regenerate Topics
                          </Button>
                          <Button
                            onClick={() => setShowTopicApproval(false)}
                            variant="outline"
                            className="flex-1 border-blue-200 text-blue-600 hover:bg-blue-50 dark:border-blue-800 dark:text-blue-400 dark:hover:bg-blue-950/50 h-10 sm:h-12 text-sm sm:text-base"
                          >
                            Close
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </div>

            {/* Enhanced Customization Sidebar */}
            <div className="space-y-4 sm:space-y-8">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 1.8, ease: "easeOut" }}
              >
                <PersonalStoryCustomizationPanel
                  customization={customization}
                  onCustomizationChange={setCustomization}
                />
              </motion.div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Enhanced Preview Modal */}
      <Dialog open={showPreviewModal} onOpenChange={setShowPreviewModal}>
        <DialogContent className="max-w-[95vw] sm:max-w-4xl max-h-[90vh] sm:max-h-[85vh] overflow-y-auto mx-2 sm:mx-4 lg:mx-auto w-[calc(100vw-1rem)] sm:w-auto bg-white/95 dark:bg-black/95 backdrop-blur-sm border border-blue-200 dark:border-blue-800">
          <DialogHeader className="pb-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-secondary rounded-2xl flex items-center justify-center">
                <Eye className="w-6 h-6 text-white" />
              </div>
              <div>
                <DialogTitle className="text-2xl font-bold text-black dark:text-white">Story Preview</DialogTitle>
                <DialogDescription className="text-gray-600 dark:text-gray-400 mt-1">
                  Review your generated personal story before publishing to LinkedIn
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
          
          {selectedStory && (
            <motion.div 
              className="space-y-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              {/* Story Content */}
              <Card className="bg-gradient-to-br from-blue-50/50 to-secondary/20 dark:from-blue-950/30 dark:to-secondary/10 border-2 border-blue-200 dark:border-blue-800">
                <CardContent className="p-8">
                  <div className="flex flex-wrap items-center gap-3 mb-6">
                    <Badge variant="secondary" className="text-sm px-3 py-1 bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300">
                      {selectedStory.tone}
                    </Badge>
                    <Badge variant="outline" className="text-sm px-3 py-1 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300">
                      {selectedStory.wordCount} words
                    </Badge>
                    {selectedStory.variation && (
                      <Badge className="text-sm px-3 py-1 bg-gradient-to-r from-blue-500 to-secondary text-white">
                        Variation {selectedStory.variation}
                      </Badge>
                    )}
                  </div>
                  
                  <h3 className="text-2xl font-bold text-black dark:text-white mb-6">{selectedStory.title}</h3>
                  
                  <div className="prose prose-lg max-w-none">
                    <div className="whitespace-pre-wrap text-black dark:text-white leading-relaxed text-base">
                      {selectedStory.content}
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  onClick={handlePostStory}
                  disabled={isPosting}
                  className="flex-1 h-12 bg-gradient-to-r from-blue-500 to-secondary hover:from-blue-600 hover:to-secondary/90 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  {isPosting ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                      <span>Posting to LinkedIn...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5 mr-3" />
                      <span>Post to LinkedIn</span>
                    </>
                  )}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={handleSaveDraft} 
                  className="flex-1 h-12 border-2 border-blue-200 dark:border-blue-800 hover:border-blue-300 dark:hover:border-blue-700 hover:bg-blue-50 dark:hover:bg-blue-950/50 text-blue-700 dark:text-blue-300 rounded-xl transition-all duration-300"
                >
                  <Save className="w-5 h-5 mr-3" />
                  <span>Save to Drafts</span>
                </Button>
              </div>
            </motion.div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
