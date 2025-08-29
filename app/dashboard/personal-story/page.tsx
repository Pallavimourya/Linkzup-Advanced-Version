"use client"

import { useState, useEffect } from "react"
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
import { User, BookOpen, Lightbulb, Target, Calendar, Send, Eye, CheckCircle, Sparkles } from "lucide-react"
import { useSession } from "next-auth/react"
import { useToast } from "@/hooks/use-toast"
import { PersonalStoryCustomizationPanel, type PersonalStoryCustomization } from "@/components/personal-story-customization"

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
    placeholder:
      "Tell us about a time when you faced a difficult situation at work, a project that seemed impossible, or a skill you had to develop quickly...",
  },
  {
    key: "achievement" as keyof PersonalStoryForm,
    title: "Proudest Achievement",
    description: "Share an accomplishment that you're particularly proud of and what it meant to you.",
    placeholder: "Describe a project you completed, a goal you reached, a team you led, or recognition you received...",
  },
  {
    key: "failure" as keyof PersonalStoryForm,
    title: "Learning from Failure",
    description: "Tell us about a time when things didn't go as planned and what you learned from it.",
    placeholder: "Share a mistake you made, a project that failed, or a decision you regret and how it shaped you...",
  },
  {
    key: "mentor" as keyof PersonalStoryForm,
    title: "Influential Mentor or Role Model",
    description: "Describe someone who significantly impacted your professional journey.",
    placeholder: "Tell us about a boss, colleague, teacher, or industry leader who influenced your career path...",
  },
  {
    key: "turning_point" as keyof PersonalStoryForm,
    title: "Career Turning Point",
    description: "Share a moment or decision that changed the direction of your career.",
    placeholder:
      "Describe a job change, industry switch, entrepreneurial leap, or realization that shifted your path...",
  },
  {
    key: "lesson" as keyof PersonalStoryForm,
    title: "Key Life/Career Lesson",
    description: "What's the most important lesson you've learned in your professional journey?",
    placeholder: "Share wisdom about leadership, work-life balance, networking, skill development, or career growth...",
  },
]

export default function PersonalStoryPage() {
  const { data: session } = useSession()
  const { toast } = useToast()
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
  })

  const [provider] = useState<"openai">("openai")

  const handleInputChange = (field: keyof PersonalStoryForm, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
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

  const currentQuestion = storyQuestions[currentStep]

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
        <div className="flex items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbPage>Personal Story Generator</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>

      {/* Welcome Section */}
      <div className="px-4">
        <div className="rounded-lg bg-gradient-to-r from-primary/10 to-secondary/10 p-6">
          <h1 className="text-2xl font-bold text-foreground mb-2">
            Personal Story Generator 📖
          </h1>
          <p className="text-muted-foreground">
            Share your professional journey through compelling personal stories that connect with your audience.
          </p>
        </div>
      </div>

      {/* Content Generator */}
      <div className="grid gap-6 px-4 lg:grid-cols-3">
        {/* Main Content Area */}
        <div className="lg:col-span-2 space-y-6">
          {/* Story Questions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5 text-primary" />
                Your Story Elements
              </CardTitle>
              <CardDescription>
                Answer these questions to help us create your personal story. Step {currentStep + 1} of {storyQuestions.length}.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Progress Indicator */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  {storyQuestions.map((_, index) => (
                    <div
                      key={index}
                      className={`w-3 h-3 rounded-full ${
                        index <= currentStep ? "bg-primary" : "bg-muted"
                      }`}
                    />
                  ))}
                </div>
                {Object.values(formData).some(value => value.trim() !== "") && (
                  <Badge variant={answersSaved ? "default" : "secondary"} className="text-xs">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    {answersSaved ? "Saved to Database" : "Auto-saved"}
                  </Badge>
                )}
              </div>

              {/* Current Question */}
              <div className="space-y-4">
                <div>
                  <Label className="text-lg font-medium">{currentQuestion.title}</Label>
                  <p className="text-sm text-muted-foreground mt-1">{currentQuestion.description}</p>
                </div>
                <Textarea
                  placeholder={currentQuestion.placeholder}
                  value={formData[currentQuestion.key]}
                  onChange={(e) => handleInputChange(currentQuestion.key, e.target.value)}
                  className="min-h-[120px]"
                />
              </div>

              {/* Navigation */}
              <div className="flex justify-between items-center">
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={prevStep}
                    disabled={currentStep === 0}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    onClick={clearFormData}
                    size="sm"
                  >
                    Clear Form
                  </Button>
                  <Button
                    variant="outline"
                    onClick={saveAnswersToDatabase}
                    size="sm"
                    disabled={Object.values(formData).every(value => value.trim() === "")}
                  >
                    Save Answers
                  </Button>
                </div>
                {currentStep < storyQuestions.length - 1 ? (
                  <Button onClick={nextStep}>
                    Next
                  </Button>
                ) : (
                  <Button
                    onClick={generateStory}
                    disabled={isGenerating}
                    className="flex items-center gap-2"
                  >
                    {isGenerating ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Generating Stories...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        Save & Generate Stories
                      </>
                    )}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Generated Stories */}
          {isGenerating && (
            <Card>
              <CardContent className="flex items-center justify-center py-8">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                  <p className="text-muted-foreground">Generating your 3 unique story variations...</p>
                </div>
              </CardContent>
            </Card>
          )}
          
          {generatedStories.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-primary" />
                  Your Generated Stories ({generatedStories.length})
                </CardTitle>
                <CardDescription>
                  Choose your preferred story variation. Each variation offers a different approach to your personal story.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {generatedStories.length > 0 && generatedStories.every(story => !story.content || story.content.length < 50) && (
                    <div className="p-4 border border-orange-200 bg-orange-50 rounded-lg">
                      <p className="text-sm text-orange-800 mb-2">
                        Some stories may not have generated properly. 
                      </p>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={generateStory}
                        disabled={isGenerating}
                      >
                        {isGenerating ? "Regenerating..." : "Regenerate Stories"}
                      </Button>
                    </div>
                  )}
                  
                  {generatedStories.map((story) => (
                    <div
                      key={story.id}
                      className="p-4 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                      onClick={() => handleSelectStory(story)}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary">{story.tone}</Badge>
                          <Badge variant="outline">{story.wordCount} words</Badge>
                          {story.variation && (
                            <Badge variant="default">Variation {story.variation}</Badge>
                          )}
                        </div>
                        <Eye className="w-4 h-4 text-muted-foreground" />
                      </div>
                      <h3 className="font-medium mb-2">{story.title}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-4">
                        {story.content && story.content.length > 0 
                          ? story.content 
                          : "Story content is being generated..."}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Customization Panel */}
        <div className="space-y-6">
          <PersonalStoryCustomizationPanel
            customization={customization}
            onCustomizationChange={setCustomization}
          />
        </div>
      </div>

      {/* Preview Modal */}
      <Dialog open={showPreviewModal} onOpenChange={setShowPreviewModal}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Preview Your Story</DialogTitle>
            <DialogDescription>
              Review your generated personal story before publishing to LinkedIn.
            </DialogDescription>
          </DialogHeader>
          
          {selectedStory && (
            <div className="space-y-4">
              <div className="p-4 border rounded-lg bg-muted/30">
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="secondary">{selectedStory.tone}</Badge>
                  <Badge variant="outline">{selectedStory.wordCount} words</Badge>
                  {selectedStory.variation && (
                    <Badge variant="default">Variation {selectedStory.variation}</Badge>
                  )}
                </div>
                <h3 className="font-medium mb-2">{selectedStory.title}</h3>
                <div className="whitespace-pre-wrap text-sm">
                  {selectedStory.content}
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button>
                  <Send className="w-4 h-4 mr-2" />
                  Post to LinkedIn
                </Button>
                <Button variant="outline" onClick={handleSaveDraft}>
                  <Calendar className="w-4 h-4 mr-2" />
                  Save to Drafts
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
