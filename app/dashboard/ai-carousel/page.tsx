"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Slider } from "@/components/ui/slider"
import {
  Palette,
  Plus,
  Minus,
  ChevronLeft,
  ChevronRight,
  Type,
  Upload,
  Search,
  Sparkles,
  Save,
  Send,
  Download,
  Eye,
  Move,
} from "lucide-react"
import { useSession } from "next-auth/react"
import { toast } from "@/hooks/use-toast"
import jsPDF from "jspdf"
import html2canvas from "html2canvas"

interface CarouselSlide {
  id: string
  text: string
  fontSize: number
  fontFamily: string
  textColor: string
  textPosition: { x: number; y: number }
  backgroundColor: string
  backgroundImage?: string
  backgroundType: "color" | "image" | "gradient"
}

interface CarouselProject {
  id: string
  title: string
  slides: CarouselSlide[]
  tone: string
  createdAt: Date
}

const backgroundColors = [
  "#0077B5", // LinkedIn Blue
  "#00A3E0", // Light Blue
  "#1E3A8A", // Dark Blue
  "#3B82F6", // Blue
  "#6366F1", // Indigo
  "#8B5CF6", // Purple
  "#EC4899", // Pink
  "#EF4444", // Red
  "#F59E0B", // Amber
  "#10B981", // Emerald
  "#06B6D4", // Cyan
  "#64748B", // Slate
]

const fontFamilies = [
  { name: "Inter", value: "Inter, sans-serif" },
  { name: "Roboto", value: "Roboto, sans-serif" },
  { name: "Open Sans", value: "Open Sans, sans-serif" },
  { name: "Montserrat", value: "Montserrat, sans-serif" },
  { name: "Poppins", value: "Poppins, sans-serif" },
  { name: "Lato", value: "Lato, sans-serif" },
]

export default function AICarouselPage() {
  const { data: session } = useSession()
  const [currentProject, setCurrentProject] = useState<CarouselProject | null>(null)
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0)
  const [showPreviewModal, setShowPreviewModal] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [savedProjects, setSavedProjects] = useState<CarouselProject[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const slideCanvasRef = useRef<HTMLDivElement>(null)

  // AI Generation Form
  const [aiForm, setAiForm] = useState({
    topic: "",
    tone: "professional",
    slideCount: "5",
    style: "modern",
  })

  const createNewProject = () => {
    const newProject: CarouselProject = {
      id: Date.now().toString(),
      title: "Untitled Carousel",
      tone: "professional",
      createdAt: new Date(),
      slides: [
        {
          id: "1",
          text: "Your Title Here",
          fontSize: 32,
          fontFamily: "Inter, sans-serif",
          textColor: "#FFFFFF",
          textPosition: { x: 50, y: 50 },
          backgroundColor: "#0077B5",
          backgroundType: "color",
        },
      ],
    }
    setCurrentProject(newProject)
    setCurrentSlideIndex(0)
  }

  const addSlide = () => {
    if (!currentProject) return

    const newSlide: CarouselSlide = {
      id: Date.now().toString(),
      text: "New Slide",
      fontSize: 24,
      fontFamily: "Inter, sans-serif",
      textColor: "#FFFFFF",
      textPosition: { x: 50, y: 50 },
      backgroundColor: "#0077B5",
      backgroundType: "color",
    }

    setCurrentProject({
      ...currentProject,
      slides: [...currentProject.slides, newSlide],
    })
    setCurrentSlideIndex(currentProject.slides.length)
  }

  const removeSlide = (slideIndex: number) => {
    if (!currentProject || currentProject.slides.length <= 1) return

    const updatedSlides = currentProject.slides.filter((_, index) => index !== slideIndex)
    setCurrentProject({
      ...currentProject,
      slides: updatedSlides,
    })

    if (currentSlideIndex >= updatedSlides.length) {
      setCurrentSlideIndex(updatedSlides.length - 1)
    }
  }

  const updateSlide = (updates: Partial<CarouselSlide>) => {
    if (!currentProject) return

    const updatedSlides = currentProject.slides.map((slide, index) =>
      index === currentSlideIndex ? { ...slide, ...updates } : slide,
    )

    setCurrentProject({
      ...currentProject,
      slides: updatedSlides,
    })
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true)
    handleMouseMove(e)
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging && e.type !== "click") return
    if (!slideCanvasRef.current) return

    const rect = slideCanvasRef.current.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100

    updateSlide({
      textPosition: {
        x: Math.max(0, Math.min(100, x)),
        y: Math.max(0, Math.min(100, y)),
      },
    })
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  const generateAICarousel = async () => {
    if (!aiForm.topic.trim()) {
      toast({
        title: "Topic Required",
        description: "Please enter a topic for your carousel.",
        variant: "destructive",
      })
      return
    }

    setIsGenerating(true)

    try {
      // TODO: Replace with actual AI API call
      await new Promise((resolve) => setTimeout(resolve, 3000))

      const slideCount = Number.parseInt(aiForm.slideCount)
      const slides: CarouselSlide[] = []

      // Generate slides based on topic
      const sampleContent = [
        `${aiForm.topic}\nA Complete Guide`,
        "Why This Matters\n\nUnderstanding this topic is crucial for professional growth and success in today's market.",
        "Key Benefits\n\n• Improved efficiency\n• Better results\n• Enhanced skills\n• Greater opportunities",
        "Common Mistakes\n\n❌ Rushing the process\n❌ Ignoring best practices\n❌ Not measuring results",
        "Best Practices\n\n✅ Start with research\n✅ Plan your approach\n✅ Execute systematically\n✅ Measure and optimize",
        "Getting Started\n\n1. Define your goals\n2. Gather resources\n3. Create a timeline\n4. Take action",
        "Key Takeaways\n\n• Focus on fundamentals\n• Be consistent\n• Learn from others\n• Stay updated",
        "Thank You!\n\nFollow for more insights on professional growth and industry trends.",
      ]

      for (let i = 0; i < slideCount; i++) {
        slides.push({
          id: (i + 1).toString(),
          text: sampleContent[i] || `Slide ${i + 1}\n\nContent about ${aiForm.topic}`,
          fontSize: i === 0 ? 36 : 24,
          fontFamily: "Inter, sans-serif",
          textColor: "#FFFFFF",
          textPosition: { x: 50, y: 50 },
          backgroundColor: backgroundColors[i % backgroundColors.length],
          backgroundType: "color",
        })
      }

      const newProject: CarouselProject = {
        id: Date.now().toString(),
        title: `${aiForm.topic} Carousel`,
        tone: aiForm.tone,
        createdAt: new Date(),
        slides,
      }

      setCurrentProject(newProject)
      setCurrentSlideIndex(0)

      toast({
        title: "Carousel Generated!",
        description: `Created a ${slideCount}-slide carousel about ${aiForm.topic}.`,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate carousel. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const saveProject = () => {
    if (!currentProject) return

    setSavedProjects((prev) => {
      const existingIndex = prev.findIndex((p) => p.id === currentProject.id)
      if (existingIndex >= 0) {
        const updated = [...prev]
        updated[existingIndex] = currentProject
        return updated
      }
      return [...prev, currentProject]
    })

    toast({
      title: "Carousel Saved!",
      description: "Your carousel has been saved to drafts.",
    })
  }

  const exportToPDF = async () => {
    if (!currentProject) return

    try {
      const pdf = new jsPDF("p", "mm", "a4")
      const slideWidth = 180
      const slideHeight = 180
      const margin = 15

      for (let i = 0; i < currentProject.slides.length; i++) {
        if (i > 0) pdf.addPage()

        const slide = currentProject.slides[i]

        // Create a temporary canvas element for each slide
        const tempDiv = document.createElement("div")
        tempDiv.style.width = "600px"
        tempDiv.style.height = "600px"
        tempDiv.style.backgroundColor = slide.backgroundColor
        tempDiv.style.position = "absolute"
        tempDiv.style.left = "-9999px"
        tempDiv.style.display = "flex"
        tempDiv.style.alignItems = "center"
        tempDiv.style.justifyContent = "center"
        tempDiv.style.padding = "40px"
        tempDiv.style.boxSizing = "border-box"

        if (slide.backgroundImage) {
          tempDiv.style.backgroundImage = `url(${slide.backgroundImage})`
          tempDiv.style.backgroundSize = "cover"
          tempDiv.style.backgroundPosition = "center"
        }

        const textDiv = document.createElement("div")
        textDiv.style.color = slide.textColor
        textDiv.style.fontSize = `${slide.fontSize}px`
        textDiv.style.fontFamily = slide.fontFamily
        textDiv.style.fontWeight = "bold"
        textDiv.style.textAlign = "center"
        textDiv.style.lineHeight = "1.2"
        textDiv.style.whiteSpace = "pre-wrap"
        textDiv.textContent = slide.text

        tempDiv.appendChild(textDiv)
        document.body.appendChild(tempDiv)

        const canvas = await html2canvas(tempDiv, {
          width: 600,
          height: 600,
          backgroundColor: slide.backgroundColor,
        })

        document.body.removeChild(tempDiv)

        const imgData = canvas.toDataURL("image/png")
        pdf.addImage(imgData, "PNG", margin, margin, slideWidth, slideHeight)

        // Add slide number
        pdf.setFontSize(10)
        pdf.setTextColor(100)
        pdf.text(`Slide ${i + 1} of ${currentProject.slides.length}`, margin, margin + slideHeight + 10)
      }

      pdf.save(`${currentProject.title.replace(/[^a-z0-9]/gi, "_").toLowerCase()}_carousel.pdf`)

      toast({
        title: "PDF Exported!",
        description: "Your carousel has been exported as a PDF file.",
      })
    } catch (error) {
      console.error("PDF export error:", error)
      toast({
        title: "Export Failed",
        description: "There was an error exporting your carousel to PDF.",
        variant: "destructive",
      })
    }
  }

  const postToLinkedIn = async () => {
    if (!currentProject) return

    try {
      // First, export slides as images
      const slideImages = []

      for (let i = 0; i < currentProject.slides.length; i++) {
        const slide = currentProject.slides[i]

        const tempDiv = document.createElement("div")
        tempDiv.style.width = "1080px"
        tempDiv.style.height = "1080px"
        tempDiv.style.backgroundColor = slide.backgroundColor
        tempDiv.style.position = "absolute"
        tempDiv.style.left = "-9999px"
        tempDiv.style.display = "flex"
        tempDiv.style.alignItems = "center"
        tempDiv.style.justifyContent = "center"
        tempDiv.style.padding = "60px"
        tempDiv.style.boxSizing = "border-box"

        if (slide.backgroundImage) {
          tempDiv.style.backgroundImage = `url(${slide.backgroundImage})`
          tempDiv.style.backgroundSize = "cover"
          tempDiv.style.backgroundPosition = "center"
        }

        const textDiv = document.createElement("div")
        textDiv.style.color = slide.textColor
        textDiv.style.fontSize = `${slide.fontSize * 1.5}px`
        textDiv.style.fontFamily = slide.fontFamily
        textDiv.style.fontWeight = "bold"
        textDiv.style.textAlign = "center"
        textDiv.style.lineHeight = "1.2"
        textDiv.style.whiteSpace = "pre-wrap"
        textDiv.textContent = slide.text

        tempDiv.appendChild(textDiv)
        document.body.appendChild(tempDiv)

        const canvas = await html2canvas(tempDiv, {
          width: 1080,
          height: 1080,
          backgroundColor: slide.backgroundColor,
        })

        document.body.removeChild(tempDiv)
        slideImages.push(canvas.toDataURL("image/png"))
      }

      // TODO: Implement actual LinkedIn API integration
      // For now, we'll simulate the posting process
      await new Promise((resolve) => setTimeout(resolve, 2000))

      toast({
        title: "Posted to LinkedIn!",
        description: "Your carousel has been published successfully.",
      })
    } catch (error) {
      console.error("LinkedIn posting error:", error)
      toast({
        title: "Posting Failed",
        description: "There was an error posting to LinkedIn. Please try again.",
        variant: "destructive",
      })
    }
  }

  const currentSlide = currentProject?.slides[currentSlideIndex]

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
                <BreadcrumbPage>AI Carousel Creator</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>

      {/* Welcome Section */}
      <div className="px-4">
        <div className="rounded-lg bg-gradient-to-r from-primary/10 to-secondary/10 p-6">
          <h1 className="text-2xl font-bold text-foreground mb-2 flex items-center gap-2">
            <Palette className="w-6 h-6 text-primary" />
            AI Carousel Creator
          </h1>
          <p className="text-muted-foreground">
            Create stunning LinkedIn carousel posts with AI assistance. Design professional slides with custom
            backgrounds, fonts, and drag-and-drop text positioning.
          </p>
        </div>
      </div>

      <div className="grid gap-6 px-4">
        {!currentProject ? (
          <>
            {/* AI Generation */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-primary" />
                  Generate AI Carousel
                </CardTitle>
                <CardDescription>
                  Let AI create a professional carousel for you based on your topic and preferences.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="topic">Carousel Topic</Label>
                  <Input
                    id="topic"
                    placeholder="e.g., LinkedIn Marketing Tips, Remote Work Best Practices, Career Growth..."
                    value={aiForm.topic}
                    onChange={(e) => setAiForm({ ...aiForm, topic: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Tone</Label>
                    <Select value={aiForm.tone} onValueChange={(value) => setAiForm({ ...aiForm, tone: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="professional">Professional</SelectItem>
                        <SelectItem value="casual">Casual</SelectItem>
                        <SelectItem value="educational">Educational</SelectItem>
                        <SelectItem value="inspirational">Inspirational</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Number of Slides</Label>
                    <Select
                      value={aiForm.slideCount}
                      onValueChange={(value) => setAiForm({ ...aiForm, slideCount: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="3">3 slides</SelectItem>
                        <SelectItem value="5">5 slides</SelectItem>
                        <SelectItem value="7">7 slides</SelectItem>
                        <SelectItem value="10">10 slides</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Style</Label>
                    <Select value={aiForm.style} onValueChange={(value) => setAiForm({ ...aiForm, style: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="modern">Modern</SelectItem>
                        <SelectItem value="minimal">Minimal</SelectItem>
                        <SelectItem value="bold">Bold</SelectItem>
                        <SelectItem value="elegant">Elegant</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Button onClick={generateAICarousel} disabled={isGenerating} className="w-full" size="lg">
                  {isGenerating ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Generating Carousel...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      Generate AI Carousel
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Manual Creation */}
            <Card>
              <CardHeader>
                <CardTitle>Create from Scratch</CardTitle>
                <CardDescription>Start with a blank carousel and design it yourself.</CardDescription>
              </CardHeader>
              <CardContent>
                <Button onClick={createNewProject} variant="outline" className="w-full bg-transparent">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Blank Carousel
                </Button>
              </CardContent>
            </Card>

            {/* Saved Projects */}
            {savedProjects.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Saved Carousels ({savedProjects.length})</CardTitle>
                  <CardDescription>Continue working on your saved carousel projects.</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-3">
                    {savedProjects.map((project) => (
                      <div
                        key={project.id}
                        className="flex items-center justify-between p-3 border rounded-lg hover:shadow-sm transition-shadow"
                      >
                        <div>
                          <h4 className="font-medium">{project.title}</h4>
                          <p className="text-sm text-muted-foreground">
                            {project.slides.length} slides • {project.tone} tone
                          </p>
                        </div>
                        <Button
                          onClick={() => {
                            setCurrentProject(project)
                            setCurrentSlideIndex(0)
                          }}
                          variant="outline"
                          size="sm"
                        >
                          Edit
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        ) : (
          <>
            {/* Carousel Editor */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Slide Preview - Updated to 75% viewport width */}
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        <Eye className="w-5 h-5 text-primary" />
                        {currentProject.title}
                      </CardTitle>
                      <div className="flex items-center gap-2">
                        <Button onClick={() => setCurrentProject(null)} variant="outline" size="sm">
                          <ChevronLeft className="w-4 h-4 mr-2" />
                          Back
                        </Button>
                        <Button onClick={() => setShowPreviewModal(true)} variant="outline" size="sm">
                          <Eye className="w-4 h-4 mr-2" />
                          Preview
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {/* Slide Navigation */}
                    <div className="flex items-center justify-between mb-4">
                      <Button
                        onClick={() => setCurrentSlideIndex(Math.max(0, currentSlideIndex - 1))}
                        disabled={currentSlideIndex === 0}
                        variant="outline"
                        size="sm"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </Button>

                      <div className="flex items-center gap-2">
                        {currentProject.slides.map((_, index) => (
                          <button
                            key={index}
                            onClick={() => setCurrentSlideIndex(index)}
                            className={`w-8 h-8 rounded-full text-xs font-medium transition-colors ${
                              index === currentSlideIndex
                                ? "bg-primary text-primary-foreground"
                                : "bg-muted text-muted-foreground hover:bg-muted/80"
                            }`}
                          >
                            {index + 1}
                          </button>
                        ))}
                      </div>

                      <Button
                        onClick={() =>
                          setCurrentSlideIndex(Math.min(currentProject.slides.length - 1, currentSlideIndex + 1))
                        }
                        disabled={currentSlideIndex === currentProject.slides.length - 1}
                        variant="outline"
                        size="sm"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>

                    {/* Slide Canvas - Updated to 75vw width with drag and drop */}
                    {currentSlide && (
                      <div className="relative">
                        <div
                          ref={slideCanvasRef}
                          className="rounded-lg flex items-center justify-center text-center p-8 relative overflow-hidden cursor-crosshair"
                          style={{
                            width: "75vw",
                            maxWidth: "800px",
                            height: "75vw",
                            maxHeight: "800px",
                            backgroundColor: currentSlide.backgroundColor,
                            backgroundImage: currentSlide.backgroundImage
                              ? `url(${currentSlide.backgroundImage})`
                              : undefined,
                            backgroundSize: "cover",
                            backgroundPosition: "center",
                          }}
                          onMouseDown={handleMouseDown}
                          onMouseMove={handleMouseMove}
                          onMouseUp={handleMouseUp}
                          onMouseLeave={handleMouseUp}
                        >
                          <div
                            className="absolute flex items-center justify-center p-4 cursor-move"
                            style={{
                              left: `${currentSlide.textPosition.x}%`,
                              top: `${currentSlide.textPosition.y}%`,
                              transform: "translate(-50%, -50%)",
                              minWidth: "200px",
                              textAlign: "center",
                            }}
                          >
                            <div
                              className="whitespace-pre-wrap font-bold leading-tight select-none"
                              style={{
                                fontSize: `${currentSlide.fontSize}px`,
                                fontFamily: currentSlide.fontFamily,
                                color: currentSlide.textColor,
                              }}
                            >
                              {currentSlide.text}
                            </div>
                          </div>

                          {/* Drag indicator */}
                          <div className="absolute top-2 left-2 flex items-center gap-1 text-white/70 text-xs">
                            <Move className="w-3 h-3" />
                            <span>Click to position text</span>
                          </div>
                        </div>

                        <div className="absolute top-2 right-2 flex gap-1">
                          <Badge variant="secondary">
                            {currentSlideIndex + 1}/{currentProject.slides.length}
                          </Badge>
                        </div>
                      </div>
                    )}

                    {/* Slide Actions */}
                    <div className="flex items-center justify-between mt-4">
                      <div className="flex gap-2">
                        <Button onClick={addSlide} variant="outline" size="sm">
                          <Plus className="w-4 h-4 mr-2" />
                          Add Slide
                        </Button>
                        <Button
                          onClick={() => removeSlide(currentSlideIndex)}
                          disabled={currentProject.slides.length <= 1}
                          variant="outline"
                          size="sm"
                        >
                          <Minus className="w-4 h-4 mr-2" />
                          Remove
                        </Button>
                      </div>

                      <div className="flex gap-2">
                        <Button onClick={saveProject} variant="outline" size="sm">
                          <Save className="w-4 h-4 mr-2" />
                          Save
                        </Button>
                        <Button onClick={exportToPDF} variant="outline" size="sm">
                          <Download className="w-4 h-4 mr-2" />
                          Export PDF
                        </Button>
                        <Button onClick={postToLinkedIn} size="sm">
                          <Send className="w-4 h-4 mr-2" />
                          Post
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Editing Panel */}
              <div className="space-y-4">
                {/* Text Editor */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Type className="w-5 h-5 text-primary" />
                      Text Editor
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label>Text Content</Label>
                      <Textarea
                        value={currentSlide?.text || ""}
                        onChange={(e) => updateSlide({ text: e.target.value })}
                        placeholder="Enter your slide text..."
                        className="min-h-[100px]"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <Label>Font Size</Label>
                        <div className="px-3">
                          <Slider
                            value={[currentSlide?.fontSize || 24]}
                            onValueChange={([value]) => updateSlide({ fontSize: value })}
                            max={72}
                            min={12}
                            step={2}
                          />
                          <div className="flex justify-between text-xs text-muted-foreground mt-1">
                            <span>12px</span>
                            <span>{currentSlide?.fontSize}px</span>
                            <span>72px</span>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Font Family</Label>
                        <Select
                          value={currentSlide?.fontFamily}
                          onValueChange={(value) => updateSlide({ fontFamily: value })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {fontFamilies.map((font) => (
                              <SelectItem key={font.value} value={font.value}>
                                {font.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Text Color</Label>
                      <div className="flex gap-2">
                        <Input
                          type="color"
                          value={currentSlide?.textColor}
                          onChange={(e) => updateSlide({ textColor: e.target.value })}
                          className="w-12 h-10 p-1 border rounded"
                        />
                        <Input
                          value={currentSlide?.textColor}
                          onChange={(e) => updateSlide({ textColor: e.target.value })}
                          placeholder="#FFFFFF"
                          className="flex-1"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Text Position</Label>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <Label className="text-xs">Horizontal (%)</Label>
                          <Slider
                            value={[currentSlide?.textPosition.x || 50]}
                            onValueChange={([value]) =>
                              updateSlide({
                                textPosition: { ...currentSlide!.textPosition, x: value },
                              })
                            }
                            max={100}
                            min={0}
                            step={1}
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">Vertical (%)</Label>
                          <Slider
                            value={[currentSlide?.textPosition.y || 50]}
                            onValueChange={([value]) =>
                              updateSlide({
                                textPosition: { ...currentSlide!.textPosition, y: value },
                              })
                            }
                            max={100}
                            min={0}
                            step={1}
                          />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Background Editor */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Palette className="w-5 h-5 text-primary" />
                      Background
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Tabs defaultValue="color" className="w-full">
                      <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="color">Color</TabsTrigger>
                        <TabsTrigger value="image">Image</TabsTrigger>
                        <TabsTrigger value="gradient">Gradient</TabsTrigger>
                      </TabsList>

                      <TabsContent value="color" className="mt-4">
                        <div className="space-y-3">
                          <div className="grid grid-cols-6 gap-2">
                            {backgroundColors.map((color) => (
                              <button
                                key={color}
                                onClick={() => updateSlide({ backgroundColor: color, backgroundType: "color" })}
                                className={`w-8 h-8 rounded border-2 ${
                                  currentSlide?.backgroundColor === color ? "border-foreground" : "border-transparent"
                                }`}
                                style={{ backgroundColor: color }}
                              />
                            ))}
                          </div>
                          <div className="flex gap-2">
                            <Input
                              type="color"
                              value={currentSlide?.backgroundColor}
                              onChange={(e) =>
                                updateSlide({ backgroundColor: e.target.value, backgroundType: "color" })
                              }
                              placeholder="#0077B5"
                              className="flex-1"
                            />
                          </div>
                        </div>
                      </TabsContent>

                      <TabsContent value="image" className="mt-4">
                        <div className="space-y-3">
                          <Button variant="outline" className="w-full bg-transparent">
                            <Upload className="w-4 h-4 mr-2" />
                            Upload Image
                          </Button>
                          <Button variant="outline" className="w-full bg-transparent">
                            <Search className="w-4 h-4 mr-2" />
                            Search Stock Photos
                          </Button>
                          <Button variant="outline" className="w-full bg-transparent">
                            <Sparkles className="w-4 h-4 mr-2" />
                            Generate with AI
                          </Button>
                        </div>
                      </TabsContent>

                      <TabsContent value="gradient" className="mt-4">
                        <div className="text-center py-4">
                          <p className="text-sm text-muted-foreground">Gradient backgrounds coming soon!</p>
                        </div>
                      </TabsContent>
                    </Tabs>
                  </CardContent>
                </Card>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Preview Modal */}
      <Dialog open={showPreviewModal} onOpenChange={setShowPreviewModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Carousel Preview</DialogTitle>
            <DialogDescription>Preview all slides in your carousel before publishing.</DialogDescription>
          </DialogHeader>

          {currentProject && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-96 overflow-y-auto">
                {currentProject.slides.map((slide, index) => (
                  <div key={slide.id} className="relative">
                    <div
                      className="aspect-square rounded-lg flex items-center justify-center text-center p-4 text-xs"
                      style={{
                        backgroundColor: slide.backgroundColor,
                        backgroundImage: slide.backgroundImage ? `url(${slide.backgroundImage})` : undefined,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                      }}
                    >
                      <div
                        className="whitespace-pre-wrap font-bold leading-tight"
                        style={{
                          fontSize: `${Math.max(8, slide.fontSize / 4)}px`,
                          fontFamily: slide.fontFamily,
                          color: slide.textColor,
                        }}
                      >
                        {slide.text}
                      </div>
                    </div>
                    <Badge variant="secondary" className="absolute top-1 right-1 text-xs">
                      {index + 1}
                    </Badge>
                  </div>
                ))}
              </div>

              <div className="flex gap-3">
                <Button onClick={exportToPDF} variant="outline" className="flex-1 bg-transparent">
                  <Download className="w-4 h-4 mr-2" />
                  Export PDF
                </Button>
                <Button onClick={postToLinkedIn} className="flex-1">
                  <Send className="w-4 h-4 mr-2" />
                  Post to LinkedIn
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
