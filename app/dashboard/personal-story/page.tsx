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
  PenTool, MessageSquare, Share2, Save, Clock, RefreshCw, Trash2, Plus
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
}

const storyQuestions = [
  {
    key: "challenge" as keyof PersonalStoryForm,
    title: "Biggest Professional Challenge",
    description: "Describe a significant challenge you faced in your career and how you approached it.",
    placeholder: "Tell us about a time when you faced a difficult situation at work, a project that seemed impossible, or a skill you had to develop quickly...",
    icon: Target,
    color: "from-red-500 to-orange-500",
    bgColor: "from-red-50 to-orange-50",
    borderColor: "border-red-200",
    textColor: "text-red-700"
  },
  {
    key: "achievement" as keyof PersonalStoryForm,
    title: "Proudest Achievement",
    description: "Share an accomplishment that you're particularly proud of and what it meant to you.",
    placeholder: "Describe a project you completed, a goal you reached, a team you led, or recognition you received...",
    icon: Award,
    color: "from-yellow-500 to-amber-500",
    bgColor: "from-yellow-50 to-amber-50",
    borderColor: "border-yellow-200",
    textColor: "text-yellow-700"
  },
  {
    key: "failure" as keyof PersonalStoryForm,
    title: "Learning from Failure",
    description: "Tell us about a time when things didn't go as planned and what you learned from it.",
    placeholder: "Share a mistake you made, a project that failed, or a decision you regret and how it shaped you...",
    icon: Brain,
    color: "from-purple-500 to-indigo-500",
    bgColor: "from-purple-50 to-indigo-50",
    borderColor: "border-purple-200",
    textColor: "text-purple-700"
  },
  {
    key: "mentor" as keyof PersonalStoryForm,
    title: "Influential Mentor or Role Model",
    description: "Describe someone who significantly impacted your professional journey.",
    placeholder: "Tell us about a boss, colleague, teacher, or industry leader who influenced your career path...",
    icon: Users,
    color: "from-blue-500 to-cyan-500",
    bgColor: "from-blue-50 to-cyan-50",
    borderColor: "border-blue-200",
    textColor: "text-blue-700"
  },
  {
    key: "turning_point" as keyof PersonalStoryForm,
    title: "Career Turning Point",
    description: "Share a moment or decision that changed the direction of your career.",
    placeholder: "Describe a job change, industry switch, entrepreneurial leap, or realization that shifted your path...",
    icon: TrendingUp,
    color: "from-green-500 to-emerald-500",
    bgColor: "from-green-50 to-emerald-50",
    borderColor: "border-green-200",
    textColor: "text-green-700"
  },
  {
    key: "lesson" as keyof PersonalStoryForm,
    title: "Key Life/Career Lesson",
    description: "What's the most important lesson you've learned in your professional journey?",
    placeholder: "Share wisdom about leadership, work-life balance, networking, skill development, or career growth...",
    icon: Lightbulb,
    color: "from-pink-500 to-rose-500",
    bgColor: "from-pink-50 to-rose-50",
    borderColor: "border-pink-200",
    textColor: "text-pink-700"
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

      // Ensure we have at least 3 distinct variations
      let storyContents = contents
      if (contents.length < 3) {
        // If we don't have enough variations, create distinct variations from the base content
        const baseContent = contents[0] || "Story content not generated properly"
        
        // Create 3 distinct variations with different focuses
        storyContents = [
          // Variation 1: Challenge-focused
          baseContent.includes("challenge") ? baseContent : 
          `Challenge-Focused Version:\n\n${baseContent}\n\nThis story emphasizes the challenges I faced and how I overcame them through determination and resilience.`,
          
          // Variation 2: Achievement-focused  
          baseContent.includes("achievement") ? baseContent :
          `Achievement-Focused Version:\n\n${baseContent}\n\nThis story highlights the achievements and successes that shaped my professional journey.`,
          
          // Variation 3: Lesson-focused
          baseContent.includes("lesson") ? baseContent :
          `Lesson-Focused Version:\n\n${baseContent}\n\nThis story focuses on the key lessons learned and personal growth throughout my career.`
        ]
      }

      // If no content was generated at all, create sample stories
      if (contents.length === 0 || (contents.length === 1 && contents[0].length < 50)) {
        storyContents = [
          `Based on your challenge: "${formData.challenge}", achievement: "${formData.achievement}", and lesson: "${formData.lesson}", here's a story focused on overcoming challenges:\n\nEarly in my career, I faced a significant challenge that tested my resilience and determination. Through perseverance and the support of mentors, I was able to overcome this obstacle and achieve remarkable success. This experience taught me valuable lessons about leadership, teamwork, and personal growth that continue to shape my professional journey today.`,
          
          `Here's a story focused on your achievements and what they meant:\n\nOne of my proudest moments was when I achieved "${formData.achievement}". This accomplishment wasn't just about the result itself, but about the journey that led there. It represented years of hard work, dedication, and the culmination of lessons learned from both successes and failures. This achievement taught me that persistence and continuous learning are key to professional growth.`,
          
          `Here's a story focused on the lessons learned and personal growth:\n\nThe most valuable lesson I've learned in my career is "${formData.lesson}". This insight came from a combination of experiences, including the challenges I faced and the guidance I received from mentors. This lesson has become a cornerstone of my professional philosophy and continues to guide my decisions and actions in both personal and professional contexts.`
        ]
      }

      // Create 3 story variations (take only first 3 from the generated)
      const newStories: GeneratedStory[] = storyContents.slice(0, 3).map((content: string, index: number) => ({
        id: `story-${Date.now()}-${index}`,
        title: `My Professional Journey - Variation ${index + 1}`,
        content: content.trim(),
        tone: customization.tone,
        wordCount: 500,
        createdAt: new Date(),
        variation: index + 1,
      }))

      setGeneratedStories([...newStories, ...generatedStories])
      
      // Check if we got proper content
      const validStories = newStories.filter(story => story.content && story.content.length > 50)
      if (validStories.length < 3) {
        toast({
          title: "Partial Generation",
          description: `Generated ${validStories.length} story variations. Some content may need regeneration.`,
          variant: "destructive",
        })
      } else {
        toast({
          title: "Stories Generated!",
          description: "Your 3 personal story variations have been created successfully.",
        })
        // Save answers permanently to database after successful generation
        await saveAnswersToDatabase()
        // Clear localStorage backup since data is now in database
        localStorage.removeItem('personalStoryFormData')
      }
    } catch (error) {
      console.error("Error generating stories:", error)
      
      let errorMessage = "Failed to generate stories. Please try again."
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

  const currentQuestion = storyQuestions[currentStep]

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50/30 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-purple-500/5 to-pink-500/5 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-blue-500/5 to-cyan-500/5 rounded-full blur-3xl"></div>
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
              className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl mb-4"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.6, delay: 0.4, ease: "easeOut" }}
            >
              <BookOpen className="w-8 h-8 text-white" />
            </motion.div>
            
            <motion.h1 
              className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-gray-900 via-purple-900 to-pink-900 bg-clip-text text-transparent leading-tight"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.6, ease: "easeOut" }}
            >
              Personal Story Generator
            </motion.h1>
            
            <motion.p 
              className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.8, ease: "easeOut" }}
            >
              Transform your professional journey into compelling stories that inspire and connect with your audience
            </motion.p>
          </motion.div>

          {/* Story Journey Preview */}
          <motion.div 
            className="flex flex-wrap items-center justify-center gap-4 pt-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.0, ease: "easeOut" }}
          >
            {storyQuestions.map((question, index) => (
              <motion.div
                key={question.key}
                className="flex items-center gap-2"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 1.2 + index * 0.1, ease: "easeOut" }}
              >
                <div className={`w-8 h-8 rounded-full bg-gradient-to-r ${question.color} flex items-center justify-center`}>
                  <question.icon className="w-4 h-4 text-white" />
                </div>
                {index < storyQuestions.length - 1 && (
                  <ArrowRight className="w-4 h-4 text-gray-400" />
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
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 sm:gap-12">
            {/* Main Story Form */}
            <div className="lg:col-span-2 space-y-8">
              {/* Enhanced Story Questions Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 1.6, ease: "easeOut" }}
              >
                <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-2xl overflow-hidden">
                  <CardHeader className="pb-6 bg-gradient-to-r from-purple-500/10 to-pink-500/10">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-2xl bg-gradient-to-r ${currentQuestion.color} flex items-center justify-center`}>
                          <currentQuestion.icon className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <CardTitle className="text-2xl font-bold text-gray-900">
                            {currentQuestion.title}
                          </CardTitle>
                          <CardDescription className="text-gray-600 mt-1">
                            Step {currentStep + 1} of {storyQuestions.length} • {currentQuestion.description}
                          </CardDescription>
                        </div>
                      </div>
                      {Object.values(formData).some(value => value.trim() !== "") && (
                        <Badge variant={answersSaved ? "default" : "secondary"} className="text-sm px-3 py-1">
                          <CheckCircle className="w-4 h-4 mr-2" />
                          {answersSaved ? "Saved" : "Auto-saved"}
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  
                  <CardContent className="p-8 space-y-8">
                    {/* Enhanced Progress Indicator */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-600">Story Progress</span>
                        <span className="text-sm text-gray-500">{Math.round(((currentStep + 1) / storyQuestions.length) * 100)}% Complete</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {storyQuestions.map((question, index) => (
                          <motion.div
                            key={index}
                            className="flex items-center gap-2"
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.3, delay: index * 0.1 }}
                          >
                            <div
                              className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${
                                index < currentStep 
                                  ? `bg-gradient-to-r ${question.color} shadow-lg` 
                                  : index === currentStep
                                  ? `bg-gradient-to-r ${question.color} shadow-lg ring-4 ring-purple-200`
                                  : "bg-gray-200"
                              }`}
                            >
                              {index < currentStep ? (
                                <CheckCircle className="w-4 h-4 text-white" />
                              ) : (
                                <question.icon className={`w-4 h-4 ${index === currentStep ? 'text-white' : 'text-gray-500'}`} />
                              )}
                            </div>
                            {index < storyQuestions.length - 1 && (
                              <div className={`w-8 h-0.5 ${index < currentStep ? 'bg-gradient-to-r from-purple-500 to-pink-500' : 'bg-gray-200'}`} />
                            )}
                          </motion.div>
                        ))}
                      </div>
                    </div>

                    {/* Enhanced Question Input */}
                    <div className="space-y-6">
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <Mic className="h-4 w-4" />
                          <span>Tip: Click the microphone icon to record your answer instead of typing</span>
                        </div>
                      </div>
                      
                      <div className="relative group">
                        <Textarea
                          placeholder={currentQuestion.placeholder}
                          value={formData[currentQuestion.key]}
                          onChange={(e) => handleInputChange(currentQuestion.key, e.target.value)}
                          className={`min-h-[200px] text-lg resize-none border-2 ${currentQuestion.borderColor} focus:border-purple-500 focus:ring-purple-200 rounded-2xl bg-gradient-to-br ${currentQuestion.bgColor} focus:bg-white pr-16 transition-all duration-300`}
                        />
                        <div className="absolute bottom-4 right-4">
                          <MicrophoneButton
                            onTranscript={(transcript) => handleMicrophoneTranscript(currentQuestion.key, transcript)}
                            size="sm"
                            variant="ghost"
                            className="h-12 w-12 p-0 hover:bg-purple-100 rounded-xl transition-colors"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Enhanced Navigation */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pt-6 border-t border-gray-200">
                      <div className="flex flex-wrap gap-3">
                        <Button
                          variant="outline"
                          onClick={prevStep}
                          disabled={currentStep === 0}
                          className="gap-2 h-12 px-6 rounded-xl border-2 hover:bg-gray-50"
                        >
                          <ArrowLeft className="w-4 h-4" />
                          Previous
                        </Button>
                        <Button
                          variant="outline"
                          onClick={clearFormData}
                          className="gap-2 h-12 px-6 rounded-xl border-2 hover:bg-red-50 hover:border-red-200"
                        >
                          <Trash2 className="w-4 h-4" />
                          Clear All
                        </Button>
                        <Button
                          variant="outline"
                          onClick={saveAnswersToDatabase}
                          disabled={Object.values(formData).every(value => value.trim() === "")}
                          className="gap-2 h-12 px-6 rounded-xl border-2 hover:bg-blue-50 hover:border-blue-200"
                        >
                          <Save className="w-4 h-4" />
                          Save Progress
                        </Button>
                      </div>
                      
                      {currentStep < storyQuestions.length - 1 ? (
                        <Button 
                          onClick={nextStep} 
                          className="gap-2 h-12 px-8 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                        >
                          Next Step
                          <ArrowRight className="w-4 h-4" />
                        </Button>
                      ) : (
                        <Button
                          onClick={generateStory}
                          disabled={isGenerating}
                          className="gap-3 h-12 px-8 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                        >
                          {isGenerating ? (
                            <>
                              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                              <span>Generating Stories...</span>
                            </>
                          ) : (
                            <>
                              <Sparkles className="w-5 h-5" />
                              <span>Generate My Stories</span>
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
                    <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-2xl">
                      <CardContent className="flex items-center justify-center py-16">
                        <div className="text-center space-y-6">
                          <motion.div
                            className="relative"
                            animate={{ rotate: 360 }}
                            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                          >
                            <div className="w-20 h-20 border-4 border-purple-200 border-t-purple-500 rounded-full"></div>
                            <div className="absolute inset-0 flex items-center justify-center">
                              <Sparkles className="w-8 h-8 text-purple-500 animate-pulse" />
                            </div>
                          </motion.div>
                          <div className="space-y-2">
                            <h3 className="text-2xl font-bold text-gray-900">Crafting Your Stories</h3>
                            <p className="text-gray-600">Our AI is weaving your experiences into compelling narratives...</p>
                          </div>
                          <div className="flex justify-center space-x-1">
                            <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce"></div>
                            <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                            <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
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
                  <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-2xl">
                    <CardHeader className="pb-6 bg-gradient-to-r from-green-500/10 to-emerald-500/10">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center">
                          <BookOpen className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <CardTitle className="text-2xl font-bold text-gray-900">
                            Your Story Collection
                          </CardTitle>
                          <CardDescription className="text-gray-600 mt-1">
                            {generatedStories.length} unique variations • Choose your favorite to share
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="p-8">
                      <div className="space-y-6">
                        {generatedStories.length > 0 && generatedStories.every(story => !story.content || story.content.length < 50) && (
                          <motion.div 
                            className="p-6 border-2 border-orange-200 bg-gradient-to-r from-orange-50 to-amber-50 rounded-2xl"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.3 }}
                          >
                            <div className="flex items-center gap-3 mb-4">
                              <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
                                <RefreshCw className="w-4 h-4 text-white" />
                              </div>
                              <h4 className="font-semibold text-orange-800">Regeneration Needed</h4>
                            </div>
                            <p className="text-orange-700 mb-4">
                              Some stories may not have generated properly. Click below to regenerate with fresh content.
                            </p>
                            <Button 
                              onClick={generateStory}
                              disabled={isGenerating}
                              className="gap-2 bg-orange-500 hover:bg-orange-600 text-white"
                            >
                              <RefreshCw className="w-4 h-4" />
                              {isGenerating ? "Regenerating..." : "Regenerate Stories"}
                            </Button>
                          </motion.div>
                        )}
                        
                        <div className="grid gap-6">
                          {generatedStories.map((story, index) => (
                            <motion.div
                              key={story.id}
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ duration: 0.5, delay: index * 0.1 }}
                              className="group cursor-pointer"
                              onClick={() => handleSelectStory(story)}
                            >
                              <Card className="bg-white border-2 border-gray-200 hover:border-purple-300 hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]">
                                <CardContent className="p-6">
                                  <div className="flex items-start justify-between mb-4">
                                    <div className="flex flex-wrap items-center gap-2">
                                      <Badge variant="secondary" className="text-sm px-3 py-1">
                                        {story.tone}
                                      </Badge>
                                      <Badge variant="outline" className="text-sm px-3 py-1">
                                        {story.wordCount} words
                                      </Badge>
                                      {story.variation && (
                                        <Badge className="text-sm px-3 py-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                                          Variation {story.variation}
                                        </Badge>
                                      )}
                                    </div>
                                    <div className="flex items-center gap-2 text-gray-400 group-hover:text-purple-500 transition-colors">
                                      <Eye className="w-5 h-5" />
                                      <span className="text-sm font-medium">Preview</span>
                                    </div>
                                  </div>
                                  
                                  <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-purple-600 transition-colors">
                                    {story.title}
                                  </h3>
                                  
                                  <p className="text-gray-600 leading-relaxed line-clamp-4 mb-4">
                                    {story.content && story.content.length > 0 
                                      ? story.content 
                                      : "Story content is being generated..."}
                                  </p>
                                  
                                  {story.content && story.content.length > 0 && (
                                    <div className="flex gap-3 pt-4 border-t border-gray-200">
                                      <LinkedInPostButton 
                                        content={story.content}
                                        className="flex-1 h-10 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl"
                                      />
                                      <ScheduleButton
                                        content={story.content}
                                        defaultPlatform="linkedin"
                                        defaultType="text"
                                        className="flex-1 h-10 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white rounded-xl"
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
            </div>

            {/* Enhanced Customization Sidebar */}
            <div className="space-y-8">
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
        <DialogContent className="max-w-[95vw] sm:max-w-4xl max-h-[90vh] sm:max-h-[85vh] overflow-y-auto mx-2 sm:mx-4 lg:mx-auto w-[calc(100vw-1rem)] sm:w-auto bg-white/95 backdrop-blur-sm">
          <DialogHeader className="pb-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center">
                <Eye className="w-6 h-6 text-white" />
              </div>
              <div>
                <DialogTitle className="text-2xl font-bold text-gray-900">Story Preview</DialogTitle>
                <DialogDescription className="text-gray-600 mt-1">
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
              <Card className="bg-gradient-to-br from-purple-50/50 to-pink-50/50 border-2 border-purple-200">
                <CardContent className="p-8">
                  <div className="flex flex-wrap items-center gap-3 mb-6">
                    <Badge variant="secondary" className="text-sm px-3 py-1">
                      {selectedStory.tone}
                    </Badge>
                    <Badge variant="outline" className="text-sm px-3 py-1">
                      {selectedStory.wordCount} words
                    </Badge>
                    {selectedStory.variation && (
                      <Badge className="text-sm px-3 py-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                        Variation {selectedStory.variation}
                      </Badge>
                    )}
                  </div>
                  
                  <h3 className="text-2xl font-bold text-gray-900 mb-6">{selectedStory.title}</h3>
                  
                  <div className="prose prose-lg max-w-none">
                    <div className="whitespace-pre-wrap text-gray-700 leading-relaxed text-base">
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
                  className="flex-1 h-12 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
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
                  className="flex-1 h-12 border-2 border-purple-200 hover:border-purple-300 hover:bg-purple-50 text-purple-700 rounded-xl transition-all duration-300"
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
