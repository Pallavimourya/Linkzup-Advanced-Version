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
  early_life: string
  education: string
  career_journey: string
  personal_side: string
  current_identity: string
  future_aspirations: string
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
    key: "early_life" as keyof PersonalStoryForm,
    title: "Early Life & Roots",
    description: "What are some defining childhood experiences or values that shaped who you are today?",
    placeholder: "Share experiences from your childhood, family values, early influences, or formative moments that helped shape your character and worldview...",
    icon: Heart,
    color: "from-blue-500 to-blue-600",
    bgColor: "from-blue-50 to-blue-100",
    borderColor: "border-blue-200",
    textColor: "text-blue-700"
  },
  {
    key: "education" as keyof PersonalStoryForm,
    title: "Education & Learning Phase",
    description: "How did your school/college years influence your interests, skills, or career choices?",
    placeholder: "Describe your educational journey, key teachers, subjects that inspired you, extracurricular activities, or how your education shaped your career path...",
    icon: BookOpen,
    color: "from-blue-400 to-blue-500",
    bgColor: "from-blue-50 to-blue-100",
    borderColor: "border-blue-200",
    textColor: "text-blue-700"
  },
  {
    key: "career_journey" as keyof PersonalStoryForm,
    title: "Career Journey",
    description: "Can you walk me through your professional journey so far — key milestones, challenges, and turning points?",
    placeholder: "Share your career progression, key roles, major projects, challenges overcome, promotions, or significant career moments...",
    icon: Target,
    color: "from-blue-600 to-blue-700",
    bgColor: "from-blue-50 to-blue-100",
    borderColor: "border-blue-200",
    textColor: "text-blue-700"
  },
  {
    key: "personal_side" as keyof PersonalStoryForm,
    title: "Personal Side",
    description: "Outside of work, what passions, hobbies, or personal values define you as a person?",
    placeholder: "Tell us about your hobbies, interests, personal values, family life, community involvement, or what you do for fun and fulfillment...",
    icon: Star,
    color: "from-blue-500 to-blue-600",
    bgColor: "from-blue-50 to-blue-100",
    borderColor: "border-blue-200",
    textColor: "text-blue-700"
  },
  {
    key: "current_identity" as keyof PersonalStoryForm,
    title: "Current Identity & Positioning",
    description: "Right now, what do you want people to know, feel, or remember about you when they come across your profile/content?",
    placeholder: "Describe how you want to be perceived professionally, your current expertise, unique value proposition, or what makes you stand out...",
    icon: User,
    color: "from-blue-300 to-blue-400",
    bgColor: "from-blue-50 to-blue-100",
    borderColor: "border-blue-200",
    textColor: "text-blue-700"
  },
  {
    key: "future_aspirations" as keyof PersonalStoryForm,
    title: "Future Aspirations",
    description: "What are your short-term and long-term goals (career, personal, impact), and how do you want your personal brand to help you achieve them?",
    placeholder: "Share your goals for the next 1-5 years, where you want to be, what impact you want to make, or how you want to grow personally and professionally...",
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
    early_life: "",
    education: "",
    career_journey: "",
    personal_side: "",
    current_identity: "",
    future_aspirations: "",
  })
  const [answersSaved, setAnswersSaved] = useState(false)
  const [generatedTopics, setGeneratedTopics] = useState<GeneratedTopic[]>([])
  const [showTopicApproval, setShowTopicApproval] = useState(false)
  const [currentInputValue, setCurrentInputValue] = useState("")

  // Debug useEffect to monitor state changes
  useEffect(() => {
    console.log("State changed - showTopicApproval:", showTopicApproval, "generatedTopics length:", generatedTopics.length)
  }, [showTopicApproval, generatedTopics])

  // Update current input value when step changes
  useEffect(() => {
    const currentQuestion = storyQuestions[currentStep]
    setCurrentInputValue(formData[currentQuestion.key] || "")
  }, [currentStep, formData])

  // Load saved form data from database on component mount
  useEffect(() => {
    const loadSavedAnswers = async () => {
      try {
        const response = await fetch('/api/personal-story/answers')
        if (response.ok) {
          const data = await response.json()
          if (data.answers) {
            setFormData(data.answers)
            // Set current input value to the first question's answer
            const firstQuestion = storyQuestions[0]
            setCurrentInputValue(data.answers[firstQuestion.key] || "")
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
            // Set current input value to the first question's answer
            const firstQuestion = storyQuestions[0]
            setCurrentInputValue(parsedData[firstQuestion.key] || "")
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

  // Check if all questions are completed
  const isAllQuestionsCompleted = () => {
    const requiredFields = ["early_life", "education", "career_journey", "personal_side", "current_identity", "future_aspirations"]
    return requiredFields.every(field => formData[field as keyof PersonalStoryForm]?.trim())
  }

  // Generate topics directly from question answers
  const generateTopicsFromAnswers = (answers: PersonalStoryForm) => {
    const topics = []
    
    // Extract keywords from text
    const extractKeywords = (text: string) => {
      return text.toLowerCase()
        .replace(/[^\w\s]/g, ' ')
        .split(/\s+/)
        .filter(word => word.length > 3)
        .slice(0, 2)
    }
    
    // Professional topic templates
    const topicTemplates = [
      "The Challenge That Changed Everything: My Unexpected Breakthrough",
      "How I Turned My Biggest Failure Into My Greatest Success", 
      "The Moment That Tested Everything I Believed In",
      "Why My Worst Setback Became My Best Teacher",
      "The Decision That Almost Broke Me (And How It Made Me Stronger)",
      "The Breakthrough That Changed My Entire Career Path",
      "How I Achieved What Everyone Said Was Impossible",
      "The Success That Surprised Even Me",
      "Why My Biggest Risk Led to My Greatest Reward",
      "The Moment I Knew I Had Made It"
    ]
    
    // Generate topics based on question answers
    if (answers.early_life && answers.early_life.trim().length > 0) {
      const keywords = extractKeywords(answers.early_life)
      if (keywords.length > 0) {
        topics.push(`How My Early Life in ${keywords[0]} Shaped My Professional Success`)
      } else {
        topics.push("How My Early Life Shaped My Professional Success")
      }
    }
    
    if (answers.education && answers.education.trim().length > 0) {
      const keywords = extractKeywords(answers.education)
      if (keywords.length > 0) {
        topics.push(`The ${keywords[0]} Education That Changed My Career Path`)
      } else {
        topics.push("The Educational Moment That Changed My Career Path")
      }
    }
    
    if (answers.career_journey && answers.career_journey.trim().length > 0) {
      const keywords = extractKeywords(answers.career_journey)
      if (keywords.length > 0) {
        topics.push(`My ${keywords[0]} Journey: From Where I Started to Where I Am Now`)
      } else {
        topics.push("My Career Journey: From Where I Started to Where I Am Now")
      }
    }
    
    // Fill remaining slots with professional templates
    while (topics.length < 3) {
      const randomTemplate = topicTemplates[Math.floor(Math.random() * topicTemplates.length)]
      if (!topics.includes(randomTemplate)) {
        topics.push(randomTemplate)
      }
    }
    
    return topics.slice(0, 3).map((title, index) => ({
      id: `topic-${Date.now()}-${index}`,
      title,
      status: "pending" as const
    }))
  }

  const handleInputChange = (field: keyof PersonalStoryForm, value: string) => {
    setCurrentInputValue(value)
    // Also update formData immediately so validation works
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleMicrophoneTranscript = (field: keyof PersonalStoryForm, transcript: string) => {
    const newValue = currentInputValue + (currentInputValue ? ' ' : '') + transcript.trim()
    setCurrentInputValue(newValue)
    // Also update formData immediately
    setFormData(prev => ({
      ...prev,
      [field]: newValue
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
        
        // Trigger personalized topics refresh in Topic Generator
        console.log("Personal story saved, triggering topic refresh...")
        if (typeof (window as any).refreshPersonalizedTopics === 'function') {
          (window as any).refreshPersonalizedTopics()
        }
        if (typeof (window as any).checkTopicGeneratorTab === 'function') {
          (window as any).checkTopicGeneratorTab()
        }
        
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
      early_life: "",
      education: "",
      career_journey: "",
      personal_side: "",
      current_identity: "",
      future_aspirations: "",
    })
    setCurrentInputValue("")
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
    // Save current answer before moving to next step
    const currentQuestion = storyQuestions[currentStep]
    setFormData(prev => ({
      ...prev,
      [currentQuestion.key]: currentInputValue
    }))
    
    if (currentStep < storyQuestions.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    // Save current answer before moving to previous step
    const currentQuestion = storyQuestions[currentStep]
    setFormData(prev => ({
      ...prev,
      [currentQuestion.key]: currentInputValue
    }))
    
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const generateRelatedTopics = async (story: GeneratedStory) => {
    try {
      console.log("Starting topic generation based on personal story answers")
      
      // Build context from the actual question answers, not the AI-generated story
      const answersContext = Object.entries(formData)
        .filter(([key, value]) => value && value.trim().length > 0)
        .map(([key, value]) => {
          const questionName = key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
          return `${questionName}: ${value}`
        })
        .join('\n\n')

      if (!answersContext.trim()) {
        console.log("No answers available for topic generation")
        return
      }

      // Generate topics directly from question answers instead of using AI
      console.log("Generating topics directly from question answers")
      const generatedTopics = generateTopicsFromAnswers(formData)
      
      if (generatedTopics.length > 0) {
        console.log("Generated topics from answers:", generatedTopics)
        setGeneratedTopics(generatedTopics)
        setShowTopicApproval(true)
        
        toast({
          title: "Topics Generated",
          description: `${generatedTopics.length} related topics have been generated for your review.`,
        })
        return
      }
      
      // Create dynamic topic generation prompts based on question answers
      const topicPrompts = [
        `Based on these personal story answers, generate 3 eye-catching LinkedIn post topics that would go viral. Each topic should have a compelling hook, interesting punchline, and be highly shareable. Make them attention-grabbing and thought-provoking.

Personal Story Answers:
${answersContext}

Generate exactly 3 topics with these characteristics:
- Eye-catching headlines that make people stop scrolling
- Interesting punchlines or unexpected angles
- Professional but with personality
- Highly shareable and engaging
- Based on the specific experiences and insights in the answers
- Each should be unique and different from the others

Format as a simple list, one topic per line.`,

        `Transform these personal story answers into 3 viral-worthy LinkedIn post topics. Each topic should have a strong hook, compelling narrative angle, and be designed to spark conversations and engagement.

Personal Story Answers:
${answersContext}

Create 3 topics that are:
- Attention-grabbing and scroll-stopping
- Have interesting twists or unexpected insights
- Professional yet relatable
- Designed to generate comments and shares
- Based on the unique elements and experiences in the answers
- Each with a different angle or perspective

Format as a simple list, one topic per line.`,

        `Based on these personal story answers, create 3 LinkedIn post topics that would make professionals stop, read, and share. Each topic should have a compelling hook and interesting punchline that relates to the key themes in the answers.

Personal Story Answers:
${answersContext}

Generate 3 topics that are:
- Irresistibly clickable and engaging
- Have surprising or counterintuitive angles
- Professional but with emotional appeal
- Designed to create discussion and engagement
- Based on the specific challenges and lessons in the answers
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
        console.log("Topics content length:", topicsContent.length)
        
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
        console.log("Number of parsed topics:", topics.length)
        
        // If no topics were parsed, create some fallback topics
        if (topics.length === 0) {
          console.log("No topics parsed, creating fallback topics")
          
          // Create fallback topics based on the actual question answers
          let fallbackTopics = []
          
          // Check each question answer for content
          if (formData.early_life && formData.early_life.trim().length > 0) {
            fallbackTopics.push("How My Early Life Shaped My Professional Success")
          }
          if (formData.education && formData.education.trim().length > 0) {
            fallbackTopics.push("The Educational Moment That Changed My Career Path")
          }
          if (formData.career_journey && formData.career_journey.trim().length > 0) {
            fallbackTopics.push("My Career Journey: From Where I Started to Where I Am Now")
          }
          if (formData.personal_side && formData.personal_side.trim().length > 0) {
            fallbackTopics.push("The Personal Side That Drives My Professional Success")
          }
          if (formData.current_identity && formData.current_identity.trim().length > 0) {
            fallbackTopics.push("How I Want to Be Remembered: Building My Professional Identity")
          }
          if (formData.future_aspirations && formData.future_aspirations.trim().length > 0) {
            fallbackTopics.push("My Vision for the Future: Goals That Drive Me Forward")
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
        
        // Create fallback topics based on question answers if API fails
        let fallbackTopics = []
        
        // Check each question answer for content
        if (formData.early_life && formData.early_life.trim().length > 0) {
          fallbackTopics.push("How My Early Life Shaped My Professional Success")
        }
        if (formData.education && formData.education.trim().length > 0) {
          fallbackTopics.push("The Educational Moment That Changed My Career Path")
        }
        if (formData.career_journey && formData.career_journey.trim().length > 0) {
          fallbackTopics.push("My Career Journey: From Where I Started to Where I Am Now")
        }
        if (formData.personal_side && formData.personal_side.trim().length > 0) {
          fallbackTopics.push("The Personal Side That Drives My Professional Success")
        }
        if (formData.current_identity && formData.current_identity.trim().length > 0) {
          fallbackTopics.push("How I Want to Be Remembered: Building My Professional Identity")
        }
        if (formData.future_aspirations && formData.future_aspirations.trim().length > 0) {
          fallbackTopics.push("My Vision for the Future: Goals That Drive Me Forward")
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
      
      if (storyText.includes("early") || storyText.includes("childhood") || storyText.includes("roots")) {
        fallbackTopics.push("How My Childhood Shaped My Professional Success")
      }
      if (storyText.includes("education") || storyText.includes("school") || storyText.includes("college")) {
        fallbackTopics.push("The Educational Moment That Changed My Career Path")
      }
      if (storyText.includes("career") || storyText.includes("professional") || storyText.includes("journey")) {
        fallbackTopics.push("My Career Journey: From Where I Started to Where I Am Now")
      }
      if (storyText.includes("personal") || storyText.includes("hobby") || storyText.includes("passion")) {
        fallbackTopics.push("The Personal Side That Drives My Professional Success")
      }
      if (storyText.includes("identity") || storyText.includes("positioning") || storyText.includes("brand")) {
        fallbackTopics.push("How I Want to Be Remembered: Building My Professional Identity")
      }
      if (storyText.includes("future") || storyText.includes("goal") || storyText.includes("aspiration")) {
        fallbackTopics.push("My Vision for the Future: Goals That Drive Me Forward")
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
    const requiredFields = ["early_life", "education", "career_journey", "personal_side", "current_identity", "future_aspirations"]
    const missingFields = requiredFields.filter(field => !formData[field as keyof PersonalStoryForm]?.trim())
    
    if (missingFields.length > 0) {
      toast({
        title: "Missing Information",
        description: `Please complete all story questions before generating your personal story. Missing: ${missingFields.map(field => field.replace(/_/g, ' ')).join(', ')}`,
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
      const storyPrompt = `Personal story about my life journey: My early life and roots were shaped by ${formData.early_life}, my education influenced me through ${formData.education}, my career journey includes ${formData.career_journey}, my personal side is defined by ${formData.personal_side}, my current identity and positioning is ${formData.current_identity}, and my future aspirations are ${formData.future_aspirations}.`

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
        storyContent = `Based on your personal journey, here's your story:\n\nMy story begins with my early life and roots, where "${formData.early_life}" shaped the foundation of who I am today. My education journey was marked by "${formData.education}", which influenced my interests and career choices.\n\nMy professional journey has been defined by "${formData.career_journey}", with key milestones and challenges that have shaped my growth. Beyond work, my personal side is enriched by "${formData.personal_side}", which brings balance and fulfillment to my life.\n\nCurrently, I want people to know "${formData.current_identity}" when they encounter my profile and content. Looking ahead, my future aspirations include "${formData.future_aspirations}", and I'm committed to using my personal brand to achieve these goals and make a meaningful impact.`
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
        
        // Trigger personalized topics regeneration after story generation
        try {
          await fetch('/api/personalized-topics/regenerate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
          })
          console.log("Triggered personalized topics regeneration after story generation")
        } catch (error) {
          console.error("Failed to trigger topic regeneration:", error)
        }
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
                          value={currentInputValue}
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
                              disabled={isGenerating || !isAllQuestionsCompleted()}
                              className={`gap-2 sm:gap-3 h-10 sm:h-12 px-6 sm:px-8 rounded-lg sm:rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 w-full sm:w-auto text-sm sm:text-base ${
                                isAllQuestionsCompleted() 
                                  ? "bg-gradient-to-r from-blue-500 to-secondary hover:from-blue-600 hover:to-secondary/90 text-white" 
                                  : "bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                              }`}
                            >
                              {isGenerating ? (
                                <>
                                  <div className="animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 border-b-2 border-white"></div>
                                  <span>Generating Story...</span>
                                </>
                              ) : (
                                <>
                                  <Sparkles className="w-4 h-4 sm:w-5 sm:h-5" />
                                  <span>{isAllQuestionsCompleted() ? "Generate My Story" : "Complete All Questions First"}</span>
                                </>
                              )}
                            </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              
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
                              className="group"
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
                                    <button 
                                      className="flex items-center gap-2 text-gray-400 dark:text-gray-500 hover:text-blue-500 dark:hover:text-blue-400 transition-colors self-start cursor-pointer"
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        handleSelectStory(story)
                                      }}
                                    >
                                      <Eye className="w-4 h-4 sm:w-5 sm:h-5" />
                                      <span className="text-xs sm:text-sm font-medium">Preview</span>
                                    </button>
                                  </div>
                                  
                                  <div 
                                    className="cursor-pointer"
                                    onClick={() => handleSelectStory(story)}
                                  >
                                    <h3 className="text-lg sm:text-xl font-bold text-black dark:text-white mb-3 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors leading-tight">
                                      {story.title}
                                    </h3>
                                    
                                    <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 leading-relaxed line-clamp-4 mb-4">
                                      {story.content && story.content.length > 0 
                                        ? story.content 
                                        : "Story content is being generated..."}
                                    </p>
                                  </div>
                                  
                                  {story.content && story.content.length > 0 && (
                                    <div 
                                      className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-3 sm:pt-4 border-t border-blue-200/50 dark:border-blue-800/50"
                                      onClick={(e) => e.stopPropagation()}
                                    >
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
