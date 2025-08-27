"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
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
import { User, BookOpen, Lightbulb, Target, Calendar, Send, Eye, CheckCircle } from "lucide-react"
import { useSession } from "next-auth/react"
import { toast } from "@/hooks/use-toast"

interface PersonalStoryForm {
  challenge: string
  achievement: string
  failure: string
  mentor: string
  turning_point: string
  lesson: string
  tone: string
  wordCount: string
}

interface GeneratedStory {
  id: string
  title: string
  content: string
  tone: string
  wordCount: number
  createdAt: Date
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
    tone: "inspirational",
    wordCount: "300",
  })

  const handleInputChange = (field: keyof PersonalStoryForm, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleNext = () => {
    if (currentStep < storyQuestions.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const isCurrentStepComplete = () => {
    const currentQuestion = storyQuestions[currentStep]
    return formData[currentQuestion.key].trim().length > 0
  }

  const getCompletedSteps = () => {
    return storyQuestions.filter((question) => formData[question.key].trim().length > 0).length
  }

  const handleGenerateStories = async () => {
    const completedSteps = getCompletedSteps()
    if (completedSteps < 3) {
      toast({
        title: "More Information Needed",
        description: "Please complete at least 3 questions to generate meaningful stories.",
        variant: "destructive",
      })
      return
    }

    setIsGenerating(true)

    try {
      // TODO: Replace with actual AI API call
      await new Promise((resolve) => setTimeout(resolve, 4000)) // Simulate API call

      // Mock generated stories based on user input
      const mockStories: GeneratedStory[] = [
        {
          id: "1",
          title: "The Challenge That Defined My Leadership Style",
          content: `Three years ago, I faced what seemed like an impossible situation. ${formData.challenge || "A major project was failing, deadlines were looming, and team morale was at an all-time low."}\n\nI remember sitting in my office at 2 AM, wondering if I was cut out for leadership. But instead of giving up, I decided to approach the problem differently.\n\nI started by having honest one-on-one conversations with each team member. I listened—really listened—to their concerns, frustrations, and ideas. What I discovered changed everything.\n\nThe issue wasn't capability; it was communication. We were all working hard, but we weren't working together.\n\nI implemented daily stand-ups, created clear communication channels, and most importantly, I admitted my mistakes and asked for help. The transformation was remarkable.\n\nNot only did we deliver the project on time, but we also built a stronger, more cohesive team. That experience taught me that vulnerability isn't weakness—it's the foundation of authentic leadership.\n\nToday, whenever I face a challenge, I remember that lesson: the best solutions often come from the people closest to the problem. You just have to be brave enough to ask and humble enough to listen.`,
          tone: formData.tone,
          wordCount: Number.parseInt(formData.wordCount),
          createdAt: new Date(),
        },
        {
          id: "2",
          title: "The Mentor Who Changed Everything",
          content: `${formData.mentor || "Sarah wasn't just my manager; she was the mentor I didn't know I needed."}\n\nWhen I first joined the company, I was eager but directionless. I had skills but lacked wisdom. I had ambition but no clear path forward.\n\nSarah saw something in me that I couldn't see in myself. Instead of just assigning tasks, she invested in my growth. She challenged me with stretch assignments, provided honest feedback, and most importantly, she believed in my potential even when I doubted myself.\n\nOne conversation stands out. I had just made a significant mistake on a client project. I was ready to resign, convinced I wasn't cut out for this role.\n\nSarah sat me down and said, "Mistakes don't define you—how you respond to them does. This is your opportunity to show what you're really made of."\n\nShe was right. Instead of dwelling on the error, we worked together to fix it, implement better processes, and turn it into a learning opportunity for the entire team.\n\nThat experience taught me the power of mentorship. Today, I make it a priority to mentor others the way Sarah mentored me—with patience, honesty, and unwavering belief in their potential.\n\nThe best leaders aren't just focused on their own success; they're committed to lifting others up along the way.`,
          tone: formData.tone,
          wordCount: Number.parseInt(formData.wordCount),
          createdAt: new Date(),
        },
        {
          id: "3",
          title: "The Pivot That Saved My Career",
          content: `${formData.turning_point || "Five years ago, I was stuck in a career that looked successful on paper but felt empty in reality."}\n\nI had climbed the corporate ladder, earned a good salary, and had all the traditional markers of success. But I was miserable.\n\nEvery Monday felt like a prison sentence. I was good at my job, but I wasn't passionate about it. I was surviving, not thriving.\n\nThe turning point came during a casual conversation with a friend who had recently made a career change. She said something that hit me like a lightning bolt: "You spend more time at work than anywhere else. Shouldn't you love what you do?"\n\nThat night, I couldn't sleep. I started researching, networking, and exploring possibilities I had never considered. It was scary—leaving security for uncertainty—but it was also exhilarating.\n\nThe transition wasn't easy. I took a pay cut, worked longer hours, and faced skepticism from well-meaning friends and family. But for the first time in years, I was excited about my future.\n\nLooking back, that decision to pivot was the best investment I ever made—not just in my career, but in myself.\n\nNow I wake up energized, tackle challenges with enthusiasm, and feel aligned with my values and goals.\n\nSometimes the biggest risk is not taking any risk at all. Your future self will thank you for having the courage to change course when your current path isn't serving you.`,
          tone: formData.tone,
          wordCount: Number.parseInt(formData.wordCount),
          createdAt: new Date(),
        },
      ]

      setGeneratedStories(mockStories)
      toast({
        title: "Stories Generated!",
        description: `Created ${mockStories.length} personal stories based on your experiences.`,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate stories. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const handleSelectStory = (story: GeneratedStory) => {
    setSelectedStory(story)
    setShowPreviewModal(true)
  }

  const handlePostStory = () => {
    // TODO: Implement story posting logic
    toast({
      title: "Story Posted!",
      description: "Your personal story has been published to LinkedIn.",
    })
    setShowPreviewModal(false)
  }

  const handleScheduleStory = () => {
    // TODO: Implement story scheduling logic
    toast({
      title: "Story Scheduled!",
      description: "Your personal story has been scheduled for later.",
    })
    setShowPreviewModal(false)
  }

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
                <BreadcrumbPage>Personal Story</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>

      {/* Welcome Section */}
      <div className="px-4">
        <div className="rounded-lg bg-gradient-to-r from-primary/10 to-secondary/10 p-6">
          <h1 className="text-2xl font-bold text-foreground mb-2 flex items-center gap-2">
            <User className="w-6 h-6 text-primary" />
            Personal Story Generator
          </h1>
          <p className="text-muted-foreground">
            Transform your professional experiences into compelling narratives that resonate with your LinkedIn
            audience. Share your journey, lessons learned, and insights gained.
          </p>
        </div>
      </div>

      <div className="grid gap-6 px-4">
        {/* Progress Indicator */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Progress</span>
              <span className="text-sm text-muted-foreground">
                {getCompletedSteps()}/{storyQuestions.length} questions completed
              </span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div
                className="bg-primary h-2 rounded-full transition-all duration-300"
                style={{ width: `${(getCompletedSteps() / storyQuestions.length) * 100}%` }}
              />
            </div>
          </CardContent>
        </Card>

        {/* Story Questions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-primary" />
              Share Your Professional Journey
            </CardTitle>
            <CardDescription>
              Answer these questions about your experiences to help our AI create authentic, engaging stories.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Question Navigation */}
            <div className="flex flex-wrap gap-2">
              {storyQuestions.map((_, index) => (
                <Button
                  key={index}
                  variant={
                    currentStep === index ? "default" : formData[storyQuestions[index].key] ? "secondary" : "outline"
                  }
                  size="sm"
                  onClick={() => setCurrentStep(index)}
                  className="relative"
                >
                  {index + 1}
                  {formData[storyQuestions[index].key] && (
                    <CheckCircle className="w-3 h-3 absolute -top-1 -right-1 text-green-500" />
                  )}
                </Button>
              ))}
            </div>

            {/* Current Question */}
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-2">
                  {currentStep + 1}. {storyQuestions[currentStep].title}
                </h3>
                <p className="text-muted-foreground text-sm mb-4">{storyQuestions[currentStep].description}</p>
              </div>

              <Textarea
                placeholder={storyQuestions[currentStep].placeholder}
                value={formData[storyQuestions[currentStep].key]}
                onChange={(e) => handleInputChange(storyQuestions[currentStep].key, e.target.value)}
                className="min-h-[120px]"
              />

              {/* Navigation Buttons */}
              <div className="flex justify-between">
                <Button
                  variant="outline"
                  onClick={handlePrevious}
                  disabled={currentStep === 0}
                  className="bg-transparent"
                >
                  Previous
                </Button>
                <Button
                  onClick={handleNext}
                  disabled={currentStep === storyQuestions.length - 1}
                  variant={isCurrentStepComplete() ? "default" : "outline"}
                  className={!isCurrentStepComplete() ? "bg-transparent" : ""}
                >
                  Next
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Story Configuration */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5 text-primary" />
              Story Customization
            </CardTitle>
            <CardDescription>Configure how you want your stories to be written.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="tone">Tone</Label>
                <Select value={formData.tone} onValueChange={(value) => handleInputChange("tone", value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="inspirational">Inspirational</SelectItem>
                    <SelectItem value="professional">Professional</SelectItem>
                    <SelectItem value="conversational">Conversational</SelectItem>
                    <SelectItem value="reflective">Reflective</SelectItem>
                    <SelectItem value="motivational">Motivational</SelectItem>
                    <SelectItem value="educational">Educational</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="wordCount">Story Length</Label>
                <Select value={formData.wordCount} onValueChange={(value) => handleInputChange("wordCount", value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="200">Short (200 words)</SelectItem>
                    <SelectItem value="300">Medium (300 words)</SelectItem>
                    <SelectItem value="400">Long (400 words)</SelectItem>
                    <SelectItem value="500">Extended (500 words)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button
              onClick={handleGenerateStories}
              disabled={isGenerating || getCompletedSteps() < 3}
              className="w-full mt-6"
              size="lg"
            >
              {isGenerating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Generating Your Stories...
                </>
              ) : (
                <>
                  <Lightbulb className="w-4 h-4 mr-2" />
                  Generate Personal Stories ({getCompletedSteps()}/6 questions)
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Generated Stories */}
        {generatedStories.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-primary" />
                Your Personal Stories ({generatedStories.length})
              </CardTitle>
              <CardDescription>
                Review your generated stories and choose which ones to post or schedule.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {generatedStories.map((story, index) => (
                  <Card key={story.id} className="border-border hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="secondary">Story {index + 1}</Badge>
                            <Badge variant="outline">{story.tone}</Badge>
                            <Badge variant="outline">{story.wordCount} words</Badge>
                          </div>
                          <h4 className="font-semibold mb-2">{story.title}</h4>
                          <p className="text-sm text-muted-foreground line-clamp-2">{story.content}</p>
                        </div>
                        <Button onClick={() => handleSelectStory(story)} variant="outline" size="sm">
                          <Eye className="w-4 h-4 mr-2" />
                          View Story
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Story Preview Modal */}
      <Dialog open={showPreviewModal} onOpenChange={setShowPreviewModal}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Personal Story Preview</DialogTitle>
            <DialogDescription>Review your story and choose to post it now or schedule it for later.</DialogDescription>
          </DialogHeader>

          {selectedStory && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>{selectedStory.title}</CardTitle>
                  <div className="flex gap-2">
                    <Badge variant="outline">{selectedStory.tone}</Badge>
                    <Badge variant="outline">{selectedStory.wordCount} words</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="whitespace-pre-wrap text-sm leading-relaxed">{selectedStory.content}</div>
                </CardContent>
              </Card>

              <div className="flex gap-3">
                <Button onClick={handlePostStory} className="flex-1">
                  <Send className="w-4 h-4 mr-2" />
                  Post Story Now
                </Button>
                <Button onClick={handleScheduleStory} variant="outline" className="flex-1 bg-transparent">
                  <Calendar className="w-4 h-4 mr-2" />
                  Schedule Story
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
