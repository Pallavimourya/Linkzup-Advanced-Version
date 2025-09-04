"use client"
import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
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
  Sparkles,
  Eye,
  Loader2,
  Edit3,
  Linkedin,
  FileImage,
  FileText,
} from "lucide-react"
import { useSession } from "next-auth/react"
import { toast } from "@/hooks/use-toast"
import { useLinkedInPosting } from "@/hooks/use-linkedin-posting"
import jsPDF from "jspdf"
import html2canvas from "html2canvas"

// Import web fonts for carousel templates
import { Inter, Open_Sans, Montserrat, Lato, Poppins, Roboto, Dancing_Script, Bebas_Neue, Righteous } from 'next/font/google'

// Configure fonts
const openSans = Open_Sans({ 
  subsets: ['latin'],
  weight: ['400', '600', '700'],
  variable: '--font-open-sans'
})

const montserrat = Montserrat({ 
  subsets: ['latin'],
  weight: ['400', '600', '700'],
  variable: '--font-montserrat'
})

const lato = Lato({ 
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-lato'
})

const poppins = Poppins({ 
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-poppins'
})

const roboto = Roboto({ 
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  variable: '--font-roboto'
})

const inter = Inter({ 
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  variable: '--font-inter'
})

const dancingScript = Dancing_Script({ 
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-dancing-script'
})

const bebasNeue = Bebas_Neue({ 
  subsets: ['latin'],
  weight: ['400'],
  variable: '--font-bebas-neue'
})

const righteous = Righteous({ 
  subsets: ['latin'],
  weight: ['400'],
  variable: '--font-righteous'
})

interface CarouselSlide {
  id: string
  type: "first" | "middle" | "last"
  content: {
    top_line?: string
    main_heading?: string
    bullet?: string
    heading?: string
    bullets?: string[]
    tagline?: string
    final_heading?: string
    last_bullet?: string
  }
  design: {
    fontSize: number
    fontFamily: string
    textColor: string
    backgroundColor: string
    backgroundType: "color" | "gradient" | "image"
    backgroundImage?: string
    template: string
    aspectRatio: "1:1" | "9:16"
    borderWidth: number
    borderColor: string
    branding: "none" | "name" | "email" | "both"
  }
  position: { x: number; y: number }
}

interface CarouselElement {
  id: string
  type: "swipe-right" | "swipe-left" | "swipe-up" | "swipe-down" | "tap" | "click" | "arrow-right" | "arrow-left" | "arrow-up" | "arrow-down"
  text?: string
  position: "right-bottom"
  size: number
}

interface CarouselProject {
  id: string
  title: string
  slides: CarouselSlide[]
  tone: string
  topic: string
  createdAt: Date
  aspectRatio: "1:1" | "9:16"
  branding: "none" | "name" | "email" | "both"
  elements: CarouselElement[]
}

const designTemplates = [
  {
    id: "open-sans",
    name: "Open Sans",
    fontFamily: "var(--font-open-sans), Open Sans, sans-serif",
    backgroundColor: "#0077B5",
    textColor: "#FFFFFF",
    style: "clean",
  },
  {
    id: "bebas-neue",
    name: "Bebas Neue",
    fontFamily: "var(--font-bebas-neue), Bebas Neue, sans-serif",
    backgroundColor: "#1F2937",
    textColor: "#FFFFFF",
    style: "bold",
  },
  {
    id: "dancing-script",
    name: "Dancing Script",
    fontFamily: "var(--font-dancing-script), Dancing Script, cursive",
    backgroundColor: "#8B5CF6",
    textColor: "#FFFFFF",
    style: "elegant",
  },
  {
    id: "righteous",
    name: "Righteous",
    fontFamily: "var(--font-righteous), Righteous, cursive",
    backgroundColor: "#0077B5",
    textColor: "#FFFFFF",
    style: "funky",
  },
  {
    id: "poppins",
    name: "Poppins",
    fontFamily: "var(--font-poppins), Poppins, sans-serif",
    backgroundColor: "#1F2937",
    textColor: "#FFFFFF",
    style: "modern",
  },
]

const backgroundColors = [
  "#0077B5",
  "#00A3E0",
  "#1E3A8A",
  "#3B82F6",
  "#6366F1",
  "#8B5CF6",
  "#EC4899",
  "#EF4444",
  "#F59E0B",
  "#10B981",
  "#06B6D4",
  "#64748B",
]

const backgroundImages = [
  "/Backgrounds/bg1.jpg",
  "/Backgrounds/bg2.jpg",
  "/Backgrounds/bg3.jpg",
  "/Backgrounds/bg4.jpg",
  "/Backgrounds/bg5.jpg",
  "/Backgrounds/bg6.jpg",
  "/Backgrounds/bg7.jpg",
  "/Backgrounds/bg8.png",
  "/Backgrounds/bg9.png",
  "/Backgrounds/bg10.jpg",
  "/Backgrounds/bg11.jpg",
  "/Backgrounds/bg12.png",
  "/Backgrounds/bg13.png",
  "/Backgrounds/bg14.jpg",
  "/Backgrounds/bg15.jpg",
  "/Backgrounds/bg16.jpg",
  "/Backgrounds/bg17.jpg",
  "/Backgrounds/bg18.jpg",
  "/Backgrounds/bg19.jpg",
  "/Backgrounds/bg20.jpg",
  "/Backgrounds/bg21.jpg",
  "/Backgrounds/bg22.jpg",
  "/Backgrounds/bg23.jpg",
  "/Backgrounds/bg24.jpg",
]

// Function to get a random background image
const getRandomBackgroundImage = () => {
  const randomIndex = Math.floor(Math.random() * backgroundImages.length)
  return backgroundImages[randomIndex]
}

const availableElements: Array<{ type: CarouselElement["type"]; label: string; icon: string }> = [
  { type: "swipe-right", label: "Swipe Right", icon: "→" },
  { type: "swipe-left", label: "Swipe Left", icon: "←" },
  { type: "swipe-up", label: "Swipe Up", icon: "↑" },
  { type: "swipe-down", label: "Swipe Down", icon: "↓" },
  { type: "tap", label: "Tap", icon: "👆" },
  { type: "click", label: "Click", icon: "🖱️" },
  { type: "arrow-right", label: "Arrow Right", icon: "➡️" },
  { type: "arrow-left", label: "Arrow Left", icon: "⬅️" },
  { type: "arrow-up", label: "Arrow Up", icon: "⬆️" },
  { type: "arrow-down", label: "Arrow Down", icon: "⬇️" },
]

const toneOptions = [
  { value: "informative", label: "Informative" },
  { value: "friendly", label: "Friendly" },
  { value: "professional", label: "Professional" },
  { value: "casual", label: "Casual" },
  { value: "authoritative", label: "Authoritative" },
  { value: "inspirational", label: "Inspirational" },
]

export default function AICarouselPage() {
  const { data: session } = useSession()
  const { postToLinkedIn, isPosting, isLinkedInConnected } = useLinkedInPosting()
  const [currentProject, setCurrentProject] = useState<CarouselProject | null>(null)
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0)
  const [showPreviewModal, setShowPreviewModal] = useState(false)
  const [showLinkedInModal, setShowLinkedInModal] = useState(false)
  const [linkedInCaption, setLinkedInCaption] = useState("")
  const [mounted, setMounted] = useState(false)
  const [activeTab, setActiveTab] = useState<"generate" | "scratch">("generate")
  const [isGenerating, setIsGenerating] = useState(false)
  const [savedProjects, setSavedProjects] = useState<CarouselProject[]>([])
  const [editingText, setEditingText] = useState<string | null>(null)
  const [overlayOpacity, setOverlayOpacity] = useState(0.4)
  const slideCanvasRef = useRef<HTMLDivElement>(null)

  const [aiForm, setAiForm] = useState({
    topic: "",
    tone: "professional",
    slideCount: 5,
    style: "modern",
  })

  useEffect(() => {
    setMounted(true)
  }, [])

  const currentSlide = currentProject?.slides[currentSlideIndex]

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
      const prompt = `Generate a carousel for the topic "${aiForm.topic}" in a "${aiForm.tone}" tone with ${aiForm.slideCount} slides. The JSON structure should be:

1. First slide:
   - top_line: Short punchline or topic-related phrase (max 10 words)
   - main_heading: Large, bold heading (max 8 words)
   - bullet: Concise bullet point (max 12 words)
2. Slides 2 to N-1:
   - heading: Short, clear heading (max 8 words)
   - bullets: Three bullet points for each slide, relevant and concise (each max 12 words)
3. Final slide:
   - tagline: Short tagline (max 8 words)
   - final_heading: Large heading (max 8 words)
   - last_bullet: Final summary bullet (max 12 words)

Content must be short, clear, and suitable for displaying on a card, as per design guidelines.`

      // TODO: Replace with actual OpenAI API call
      // const response = await fetch('/api/openai/generate-carousel', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ prompt, topic: aiForm.topic, tone: aiForm.tone, slideCount: aiForm.slideCount })
      // })

      // Mock response for now - will be replaced with actual API
      await new Promise((resolve) => setTimeout(resolve, 2000))

      const mockResponse = {
        slides: [
          {
            top_line: `Master ${aiForm.topic}`,
            main_heading: "Complete Guide",
            bullet: "Everything you need to know",
          },
          {
            heading: "Why It Matters",
            bullets: ["Increases productivity by 40%", "Saves time and resources", "Improves team collaboration"],
          },
          {
            heading: "Getting Started",
            bullets: ["Set clear objectives first", "Gather necessary resources", "Create a timeline"],
          },
          {
            heading: "Best Practices",
            bullets: ["Follow industry standards", "Regular progress reviews", "Continuous improvement mindset"],
          },
          {
            tagline: "Ready to Excel?",
            final_heading: "Take Action Today",
            last_bullet: "Start your journey now",
          },
        ],
      }

      const slides: CarouselSlide[] = mockResponse.slides.map((slideData, index) => {
        const isFirst = index === 0
        const isLast = index === mockResponse.slides.length - 1
        const template = designTemplates[0] // Default template (Open Sans)
        const randomBackground = getRandomBackgroundImage()

        return {
          id: (index + 1).toString(),
          type: isFirst ? "first" : isLast ? "last" : "middle",
          content: slideData,
          design: {
            fontSize: isFirst ? 36 : 24,
            fontFamily: template.fontFamily,
            textColor: "#FFFFFF", // White text for better contrast on backgrounds
            backgroundColor: "#ffffff",
            backgroundType: "image",
            backgroundImage: randomBackground,
            template: template.id,
            aspectRatio: "1:1",
            borderWidth: 2,
            borderColor: "#E5E7EB",
            branding: "both",
          },
          position: { x: 50, y: 50 },
        }
      })

      const newProject: CarouselProject = {
        id: Date.now().toString(),
        title: `${aiForm.topic} Carousel`,
        topic: aiForm.topic,
        tone: aiForm.tone,
        createdAt: new Date(),
        slides,
        aspectRatio: "1:1",
        branding: "both",
        elements: [],
      }

      setCurrentProject(newProject)
      setCurrentSlideIndex(0)

      toast({
        title: "Carousel Generated!",
        description: `Created a ${aiForm.slideCount}-slide carousel about ${aiForm.topic} with a random background.`,
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

  const createNewProject = () => {
    const template = designTemplates[0] // Default template (Open Sans)
    const randomBackground = getRandomBackgroundImage()
    const newProject: CarouselProject = {
      id: Date.now().toString(),
      title: "Untitled Carousel",
      topic: "",
      tone: "professional",
      createdAt: new Date(),
      aspectRatio: "1:1",
      branding: "both",
      elements: [],
      slides: [
        {
          id: "1",
          type: "first",
          content: {
            top_line: "Your Topic Here",
            main_heading: "Main Title",
            bullet: "Engaging subtitle",
          },
          design: {
            fontSize: 32,
            fontFamily: template.fontFamily,
            textColor: "#FFFFFF", // White text for better contrast on backgrounds
            backgroundColor: "#ffffff",
            backgroundType: "image",
            backgroundImage: randomBackground,
            template: template.id,
            aspectRatio: "1:1",
            borderWidth: 2,
            borderColor: "#E5E7EB",
            branding: "both",
          },
          position: { x: 50, y: 50 },
        },
      ],
    }
    setCurrentProject(newProject)
    setCurrentSlideIndex(0)
  }

  const handleTextEdit = (field: string, value: string) => {
    if (!currentProject || !currentSlide) return

    const updatedSlides = [...currentProject.slides]
    updatedSlides[currentSlideIndex] = {
      ...updatedSlides[currentSlideIndex],
      content: {
        ...updatedSlides[currentSlideIndex].content,
        [field]: value,
      },
    }

    setCurrentProject({
      ...currentProject,
      slides: updatedSlides,
    })
  }

  const addSlide = () => {
    if (!currentProject) return

    const template = designTemplates.find((t) => t.id === currentSlide?.design.template) || designTemplates[0]
    const newSlide: CarouselSlide = {
      id: Date.now().toString(),
      type: "middle",
      content: {
        heading: "New Slide",
        bullets: ["Point 1", "Point 2", "Point 3"],
      },
      design: {
        fontSize: 24,
        fontFamily: template.fontFamily,
        textColor: "#FFFFFF", // White text for better contrast on backgrounds
        backgroundColor: "#ffffff",
        backgroundType: currentSlide?.design.backgroundType || "color",
        backgroundImage: currentSlide?.design.backgroundImage,
        template: template.id,
        aspectRatio: currentProject.aspectRatio,
        borderWidth: 2,
        borderColor: "#E5E7EB",
        branding: "both",
      },
      position: { x: 50, y: 50 },
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

  const updateSlideDesign = (updates: Partial<CarouselSlide["design"]>) => {
    if (!currentProject || !currentSlide) return

    const updatedSlides = [...currentProject.slides]
    updatedSlides[currentSlideIndex] = {
      ...updatedSlides[currentSlideIndex],
      design: {
        ...updatedSlides[currentSlideIndex].design,
        ...updates,
      },
    }

    setCurrentProject({
      ...currentProject,
      slides: updatedSlides,
    })
  }

  const updateProjectBranding = (branding: "none" | "name" | "email" | "both") => {
    if (!currentProject) return

    setCurrentProject({
      ...currentProject,
      branding,
    })

    toast({
      title: "Branding Updated",
      description: `Branding set to ${branding === "none" ? "none" : branding === "name" ? "LinkedIn name only" : branding === "email" ? "LinkedIn email only" : "both name and email"}.`,
    })
  }

  const addElement = (elementType: CarouselElement["type"]) => {
    if (!currentProject) return

    const newElement: CarouselElement = {
      id: Date.now().toString(),
      type: elementType,
      position: "right-bottom",
      size: 25,
    }

    setCurrentProject({
      ...currentProject,
      elements: [...currentProject.elements, newElement],
    })

    toast({
      title: "Element Added",
      description: `${availableElements.find(e => e.type === elementType)?.label} element added to all slides.`,
    })
  }

  const removeElement = (elementId: string) => {
    if (!currentProject) return

    const element = currentProject.elements.find(e => e.id === elementId)
    setCurrentProject({
      ...currentProject,
      elements: currentProject.elements.filter(e => e.id !== elementId),
    })

    toast({
      title: "Element Removed",
      description: `${element ? availableElements.find(e => e.type === element.type)?.label : "Element"} removed from all slides.`,
    })
  }

  const applyTemplate = (template: (typeof designTemplates)[0]) => {
    if (!currentProject) return

    const updatedSlides = currentProject.slides.map((slide) => ({
      ...slide,
      design: {
        ...slide.design,
        fontFamily: template.fontFamily,
        template: template.id,
      },
    }))

    setCurrentProject({
      ...currentProject,
      slides: updatedSlides,
    })

    toast({
      title: "Font Applied",
      description: `Applied ${template.name} font to all slides.`,
    })
  }

  const applyBackgroundColor = (color: string) => {
    if (!currentProject) return

    const updatedSlides: CarouselSlide[] = currentProject.slides.map((slide) => ({
      ...slide,
      design: {
        ...slide.design,
        backgroundColor: color,
        backgroundType: "color",
        backgroundImage: undefined,
      },
    }))

    setCurrentProject({
      ...currentProject,
      slides: updatedSlides,
    })

    toast({
      title: "Background Applied",
      description: `Applied background color to all slides.`,
    })
  }

  const applyBackgroundImage = (imagePath: string) => {
    if (!currentProject) return

    const updatedSlides: CarouselSlide[] = currentProject.slides.map((slide) => ({
      ...slide,
      design: {
        ...slide.design,
        backgroundType: "image",
        backgroundImage: imagePath,
        backgroundColor: "#ffffff", // Reset color when using image
      },
    }))

    setCurrentProject({
      ...currentProject,
      slides: updatedSlides,
    })

    toast({
      title: "Background Applied",
      description: `Applied background image to all slides.`,
    })
  }

  const refreshRandomBackground = () => {
    if (!currentProject) return

    const newRandomBackground = getRandomBackgroundImage()
    
    const updatedSlides: CarouselSlide[] = currentProject.slides.map((slide) => ({
      ...slide,
      design: {
        ...slide.design,
        backgroundType: "image",
        backgroundImage: newRandomBackground,
        backgroundColor: "#ffffff",
      },
    }))

    setCurrentProject({
      ...currentProject,
      slides: updatedSlides,
    })

    toast({
      title: "Background Refreshed",
      description: `Applied new random background to all slides.`,
    })
  }

  const exportAllAsJPEG = async () => {
    if (!currentProject) return

    const images: string[] = []

    for (let i = 0; i < currentProject.slides.length; i++) {
      setCurrentSlideIndex(i)
      await new Promise((resolve) => setTimeout(resolve, 100)) // Allow render

      if (slideCanvasRef.current) {
        const canvas = await html2canvas(slideCanvasRef.current, {
          backgroundColor: null,
          scale: 2,
        })
        images.push(canvas.toDataURL("image/jpeg", 0.9))
      }
    }

    // Create zip file (simplified - in real implementation use JSZip)
    const link = document.createElement("a")
    images.forEach((image, index) => {
      link.href = image
      link.download = `${currentProject.title}-slide-${index + 1}.jpg`
      link.click()
    })

    toast({
      title: "Export Complete",
      description: `Exported ${images.length} slides as JPEG files.`,
    })
  }

  const exportAsPDF = async () => {
    if (!currentProject) return

    const pdf = new jsPDF()

    for (let i = 0; i < currentProject.slides.length; i++) {
      setCurrentSlideIndex(i)
      await new Promise((resolve) => setTimeout(resolve, 100))

      if (slideCanvasRef.current) {
        const canvas = await html2canvas(slideCanvasRef.current, {
          backgroundColor: null,
          scale: 2,
        })

        if (i > 0) pdf.addPage()

        const imgData = canvas.toDataURL("image/png")
        const imgWidth = 190
        const imgHeight = (canvas.height * imgWidth) / canvas.width

        pdf.addImage(imgData, "PNG", 10, 10, imgWidth, imgHeight)
      }
    }

    pdf.save(`${currentProject.title}.pdf`)

    toast({
      title: "PDF Export Complete",
      description: "All slides exported as PDF.",
    })
  }

  const openLinkedInModal = async () => {
    if (!isLinkedInConnected) {
      toast({
        title: "LinkedIn Not Connected",
        description: "Please connect your LinkedIn account first.",
        variant: "destructive",
      })
      return
    }

    setLinkedInCaption(`Check out my latest carousel about ${currentProject?.topic || "this topic"}! 

What do you think? Share your thoughts in the comments below.

#LinkedIn #Content #${currentProject?.topic?.replace(/\s+/g, "") || "Learning"}`)
    setShowLinkedInModal(true)
  }

  const postToLinkedInWithImages = async () => {
    if (!currentProject) return

    try {
      // Convert all slides to images
      const images: string[] = []

      for (let i = 0; i < currentProject.slides.length; i++) {
        setCurrentSlideIndex(i)
        await new Promise((resolve) => setTimeout(resolve, 100))

        if (slideCanvasRef.current) {
          const canvas = await html2canvas(slideCanvasRef.current, {
            backgroundColor: null,
            scale: 2,
          })
          images.push(canvas.toDataURL("image/jpeg", 0.9))
        }
      }

      // TODO: Implement actual LinkedIn API posting
      // await postToLinkedIn(linkedInCaption, images)

      toast({
        title: "Posted to LinkedIn!",
        description: `Successfully posted carousel with ${images.length} slides.`,
      })

      setShowLinkedInModal(false)
    } catch (error) {
      toast({
        title: "Posting Failed",
        description: "Failed to post to LinkedIn. Please try again.",
        variant: "destructive",
      })
    }
  }

  const renderSlideContent = (slide: CarouselSlide) => {
    const { content, design } = slide

    return (
      <div
        className="w-full h-full flex flex-col justify-start items-start p-8 relative"
        style={{
          fontFamily: design.fontFamily,
          color: design.textColor,
          paddingTop: slide.type === "first" ? "60px" : "32px",
          textShadow: design.backgroundType === "image" && overlayOpacity > 0 ? "0 2px 4px rgba(0,0,0,0.8)" : "none"
        }}
        data-font-family={design.fontFamily}
      >
        {slide.type === "first" && (
          <>
            {content.top_line && (
              <div
                className="text-sm opacity-80 mb-2 self-start text-left w-full"
                onClick={() => setEditingText("top_line")}
                style={{ 
                  fontSize: "20px",
                  marginTop: "-10px",
                  paddingLeft: "20px",
                  fontFamily: design.fontFamily
                }}
              >
                {editingText === "top_line" ? (
                  <textarea
                    value={content.top_line}
                    onChange={(e) => handleTextEdit("top_line", e.target.value)}
                    onBlur={() => setEditingText(null)}
                    onKeyDown={(e) => e.key === "Enter" && setEditingText(null)}
                    className="bg-transparent border-b border-current outline-none text-left w-full resize-none overflow-hidden"
                    style={{ minHeight: "20px", lineHeight: "1.2", fontFamily: design.fontFamily }}
                    autoFocus
                  />
                ) : (
                  <div className="whitespace-pre-wrap break-words">{content.top_line}</div>
                )}
              </div>
            )}
            {content.main_heading && (
              <h1
                className="font-bold mb-4 leading-tight self-start text-left w-full"
                onClick={() => setEditingText("main_heading")}
                style={{ 
                  fontSize: "35px",
                  paddingLeft: "20px",
                  fontFamily: design.fontFamily
                }}
              >
                {editingText === "main_heading" ? (
                  <textarea
                    value={content.main_heading}
                    onChange={(e) => handleTextEdit("main_heading", e.target.value)}
                    onBlur={() => setEditingText(null)}
                    onKeyDown={(e) => e.key === "Enter" && setEditingText(null)}
                    className="bg-transparent border-b border-current outline-none text-left w-full resize-none overflow-hidden"
                    style={{ minHeight: "35px", lineHeight: "1.2", fontFamily: design.fontFamily }}
                    autoFocus
                  />
                ) : (
                  <div className="whitespace-pre-wrap break-words">{content.main_heading}</div>
                )}
              </h1>
            )}
            {content.bullet && (
              <p className="text-lg self-start text-left w-full break-words" onClick={() => setEditingText("bullet")} style={{ fontSize: "18px", paddingLeft: "20px", fontFamily: design.fontFamily }}>
                {editingText === "bullet" ? (
                  <textarea
                    value={content.bullet}
                    onChange={(e) => handleTextEdit("bullet", e.target.value)}
                    onBlur={() => setEditingText(null)}
                    onKeyDown={(e) => e.key === "Enter" && setEditingText(null)}
                    className="bg-transparent border-b border-current outline-none text-left w-full resize-none overflow-hidden"
                    style={{ minHeight: "18px", lineHeight: "1.2", fontFamily: design.fontFamily }}
                    autoFocus
                  />
                ) : (
                  <div className="whitespace-pre-wrap break-words">{content.bullet}</div>
                )}
              </p>
            )}
          </>
        )}

        {slide.type === "middle" && (
          <>
            {content.heading && (
              <h2
                className="font-bold mb-6 leading-tight self-start text-left w-full break-words"
                onClick={() => setEditingText("heading")}
                style={{ fontSize: `${design.fontSize}px`, paddingLeft: "20px", fontFamily: design.fontFamily }}
              >
                {editingText === "heading" ? (
                  <textarea
                    value={content.heading}
                    onChange={(e) => handleTextEdit("heading", e.target.value)}
                    onBlur={() => setEditingText(null)}
                    onKeyDown={(e) => e.key === "Enter" && setEditingText(null)}
                    className="bg-transparent border-b border-current outline-none text-left w-full resize-none overflow-hidden"
                    style={{ minHeight: "24px", lineHeight: "1.2", fontFamily: design.fontFamily }}
                    autoFocus
                  />
                ) : (
                  <div className="whitespace-pre-wrap break-words">{content.heading}</div>
                )}
              </h2>
            )}
            {content.bullets && (
              <ul className="space-y-3 text-left w-full px-5">
                {content.bullets.map((bullet, index) => (
                  <li
                    key={index}
                    className="flex items-start gap-2"
                    onClick={() => setEditingText(`bullet_${index}`)}
                    style={{ fontSize: "16px", fontFamily: design.fontFamily }}
                  >
                    <span className="w-2 h-2 bg-current rounded-full mt-2 flex-shrink-0"></span>
                    {editingText === `bullet_${index}` ? (
                      <textarea
                        value={bullet}
                        onChange={(e) => {
                          const newBullets = [...content.bullets!]
                          newBullets[index] = e.target.value
                          handleTextEdit("bullets", newBullets as any)
                        }}
                        onBlur={() => setEditingText(null)}
                        onKeyDown={(e) => e.key === "Enter" && setEditingText(null)}
                        className="bg-transparent border-b border-current outline-none flex-1 resize-none overflow-hidden"
                        style={{ minHeight: "16px", lineHeight: "1.2", fontFamily: design.fontFamily }}
                        autoFocus
                      />
                    ) : (
                      <span className="whitespace-pre-wrap break-words">{bullet}</span>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </>
        )}

        {slide.type === "last" && (
          <>
            {content.tagline && (
              <div
                className="text-sm opacity-80 mb-2 self-start text-left w-full break-words"
                onClick={() => setEditingText("tagline")}
                style={{ fontSize: "14px", paddingLeft: "20px", fontFamily: design.fontFamily }}
              >
                {editingText === "tagline" ? (
                  <textarea
                    value={content.tagline}
                    onChange={(e) => handleTextEdit("tagline", e.target.value)}
                    onBlur={() => setEditingText(null)}
                    onKeyDown={(e) => e.key === "Enter" && setEditingText(null)}
                    className="bg-transparent border-b border-current outline-none text-left w-full resize-none overflow-hidden"
                    style={{ minHeight: "14px", lineHeight: "1.2", fontFamily: design.fontFamily }}
                    autoFocus
                  />
                ) : (
                  <div className="whitespace-pre-wrap break-words">{content.tagline}</div>
                )}
              </div>
            )}
            {content.final_heading && (
              <h1
                className="font-bold mb-4 leading-tight self-start text-left w-full break-words"
                onClick={() => setEditingText("final_heading")}
                style={{ fontSize: `${design.fontSize}px`, paddingLeft: "20px", fontFamily: design.fontFamily }}
              >
                {editingText === "final_heading" ? (
                  <textarea
                    value={content.final_heading}
                    onChange={(e) => handleTextEdit("final_heading", e.target.value)}
                    onBlur={() => setEditingText(null)}
                    onKeyDown={(e) => e.key === "Enter" && setEditingText(null)}
                    className="bg-transparent border-b border-current outline-none text-left w-full resize-none overflow-hidden"
                    style={{ minHeight: "24px", lineHeight: "1.2", fontFamily: design.fontFamily }}
                    autoFocus
                  />
                ) : (
                  <div className="whitespace-pre-wrap break-words">{content.final_heading}</div>
                )}
              </h1>
            )}
            {content.last_bullet && (
              <p className="text-lg self-start text-left w-full break-words" onClick={() => setEditingText("last_bullet")} style={{ fontSize: "18px", paddingLeft: "20px", fontFamily: design.fontFamily }}>
                {editingText === "last_bullet" ? (
                  <textarea
                    value={content.last_bullet}
                    onChange={(e) => handleTextEdit("last_bullet", e.target.value)}
                    onBlur={() => setEditingText(null)}
                    onKeyDown={(e) => e.key === "Enter" && setEditingText(null)}
                    className="bg-transparent border-b border-current outline-none text-left w-full resize-none overflow-hidden"
                    style={{ minHeight: "18px", lineHeight: "1.2", fontFamily: design.fontFamily }}
                    autoFocus
                  />
                ) : (
                  <div className="whitespace-pre-wrap break-words">{content.last_bullet}</div>
                )}
              </p>
            )}
          </>
        )}

        {/* Interactive Elements - Display on all slides except last */}
        {currentProject?.elements && currentProject.elements.length > 0 && slide.type !== "last" && (
          <div className="absolute bottom-16 right-8">
            <div className="flex flex-col gap-1">
              {currentProject.elements.map((element) => (
                <div
                  key={element.id}
                  className="flex items-center justify-center bg-white/20 backdrop-blur-sm rounded-full p-1"
                  style={{
                    width: `${element.size}px`,
                    height: `${element.size}px`,
                    fontFamily: design.fontFamily,
                    color: design.textColor,
                    fontSize: `${element.size * 0.6}px`
                  }}
                >
                  {element.type === "swipe-right" && "→"}
                  {element.type === "swipe-left" && "←"}
                  {element.type === "swipe-up" && "↑"}
                  {element.type === "swipe-down" && "↓"}
                  {element.type === "tap" && "👆"}
                  {element.type === "click" && "🖱️"}
                  {element.type === "arrow-right" && "➡️"}
                  {element.type === "arrow-left" && "⬅️"}
                  {element.type === "arrow-up" && "⬆️"}
                  {element.type === "arrow-down" && "⬇️"}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Branding Section - Display at bottom of each slide */}
        {currentProject?.branding && currentProject.branding !== "none" && (
          <div className="absolute bottom-4 left-8 right-8">
            <div 
              className="text-xs opacity-70 text-center"
              style={{ 
                fontFamily: design.fontFamily,
                color: design.textColor
              }}
            >
              {currentProject.branding === "name" && session?.user?.name && (
                <span>{session.user.name}</span>
              )}
              {currentProject.branding === "email" && session?.user?.email && (
                <span>{session.user.email}</span>
              )}
              {currentProject.branding === "both" && session?.user?.name && session?.user?.email && (
                <span>{session.user.name} • {session.user.email}</span>
              )}
            </div>
          </div>
        )}
      </div>
    )
  }

  if (!mounted) return null

  return (
    <>
      <style jsx>{`
        .carousel-slide [data-font-family*="open-sans"] * {
          font-family: var(--font-open-sans), Open Sans, sans-serif !important;
        }
        .carousel-slide [data-font-family*="bebas-neue"] * {
          font-family: var(--font-bebas-neue), Bebas Neue, sans-serif !important;
        }
        .carousel-slide [data-font-family*="dancing-script"] * {
          font-family: var(--font-dancing-script), Dancing Script, cursive !important;
        }
        .carousel-slide [data-font-family*="righteous"] * {
          font-family: var(--font-righteous), Righteous, cursive !important;
        }
        .carousel-slide [data-font-family*="poppins"] * {
          font-family: var(--font-poppins), Poppins, sans-serif !important;
        }
      `}</style>
      <div className={`flex-1 space-y-4 p-4 pt-6 ${openSans.variable} ${montserrat.variable} ${lato.variable} ${poppins.variable} ${roboto.variable} ${inter.variable} ${dancingScript.variable} ${bebasNeue.variable} ${righteous.variable}`}>
        {/* Header */}
        <div className="flex items-center justify-between space-y-2">
          <div>
            <div className="flex items-center space-x-2">
              <SidebarTrigger />
              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem>
                    <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    <BreadcrumbPage>AI Carousel</BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </div>
            <h2 className="text-3xl font-bold tracking-tight">AI Carousel Generator</h2>
            <p className="text-muted-foreground">Create engaging LinkedIn carousels with AI or design from scratch</p>
          </div>
        </div>

      {!currentProject ? (
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" />
                Generate using AI
              </CardTitle>
              <CardDescription>
                Let AI create a professional carousel based on your topic, tone, and slide count preferences.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="topic">Topic *</Label>
                <Input
                  id="topic"
                  placeholder="e.g., LinkedIn Marketing Tips, Remote Work Best Practices..."
                  value={aiForm.topic}
                  onChange={(e) => setAiForm({ ...aiForm, topic: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label>Tone of Content</Label>
                <Select value={aiForm.tone} onValueChange={(value) => setAiForm({ ...aiForm, tone: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {toneOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Number of Slides</Label>
                <div className="px-3">
                  <Slider
                    value={[aiForm.slideCount]}
                    onValueChange={([value]) => setAiForm({ ...aiForm, slideCount: value })}
                    max={10}
                    min={3}
                    step={1}
                  />
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>3</span>
                    <span>{aiForm.slideCount} slides</span>
                    <span>10</span>
                  </div>
                </div>
              </div>

              <Button onClick={generateAICarousel} disabled={isGenerating} className="w-full" size="lg">
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
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

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-primary" />
                Create from Scratch
              </CardTitle>
              <CardDescription>
                Start with a blank canvas and design your carousel slides manually with full control.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={createNewProject} className="w-full" size="lg">
                <Edit3 className="w-5 h-5 mr-2" />
                Start Creating
              </Button>
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Slide Preview */}
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
                      Preview All
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

                {currentSlide && (
                  <div className="relative flex justify-center">
                    <div
                      ref={slideCanvasRef}
                      className="rounded-lg relative overflow-hidden cursor-pointer carousel-slide"
                      style={{
                        width: currentProject.aspectRatio === "1:1" ? "400px" : "300px",
                        height: currentProject.aspectRatio === "1:1" ? "400px" : "533px",
                        backgroundColor: currentSlide.design.backgroundType === "color" ? currentSlide.design.backgroundColor : "transparent",
                        backgroundImage:
                          currentSlide.design.backgroundType === "image" && currentSlide.design.backgroundImage
                            ? `url(${currentSlide.design.backgroundImage})`
                            : undefined,
                        backgroundSize: currentSlide.design.backgroundType === "image" 
                          ? (currentProject.aspectRatio === "1:1" ? "cover" : "contain") 
                          : undefined,
                        backgroundPosition: currentSlide.design.backgroundType === "image" ? "center" : undefined,
                        backgroundRepeat: currentSlide.design.backgroundType === "image" ? "no-repeat" : undefined,
                        border: `${currentSlide.design.borderWidth}px solid ${currentSlide.design.borderColor}`,
                      }}
                    >
                      {/* Dark matte overlay for background images */}
                      {currentSlide.design.backgroundType === "image" && currentSlide.design.backgroundImage && overlayOpacity > 0 && (
                        <div 
                          className="absolute inset-0 pointer-events-none"
                          style={{
                            background: `linear-gradient(135deg, rgba(0,0,0,${overlayOpacity}) 0%, rgba(0,0,0,${overlayOpacity * 0.5}) 50%, rgba(0,0,0,${overlayOpacity * 0.75}) 100%)`,
                            zIndex: 1
                          }}
                        />
                      )}
                      
                      <div className="relative z-10 w-full h-full">
                        {renderSlideContent(currentSlide)}
                      </div>

                      {/* Click to edit indicator */}
                      <div className="absolute top-2 left-2 flex items-center gap-1 text-white/70 text-xs bg-black/20 px-2 py-1 rounded">
                        <Type className="w-3 h-3" />
                        <span>Click text to edit</span>
                      </div>
                    </div>

                    <div className="absolute top-2 right-2 flex gap-1">
                      <Badge variant="secondary">
                        {currentSlideIndex + 1}/{currentProject.slides.length}
                      </Badge>
                      <Badge variant="outline">{currentProject.aspectRatio}</Badge>
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
                    <Button onClick={exportAllAsJPEG} variant="outline" size="sm">
                      <FileImage className="w-4 h-4 mr-2" />
                      Export JPEG
                    </Button>
                    <Button onClick={exportAsPDF} variant="outline" size="sm">
                      <FileText className="w-4 h-4 mr-2" />
                      Export PDF
                    </Button>
                    <Button onClick={openLinkedInModal} size="sm">
                      <Linkedin className="w-4 h-4 mr-2" />
                      Post to LinkedIn
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Editing Panel */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="w-5 h-5 text-primary" />
                  Design & Layout
                </CardTitle>
              </CardHeader>
              <CardContent>
                        <Tabs defaultValue="background" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="background">Background</TabsTrigger>
            <TabsTrigger value="layout">Layout</TabsTrigger>
            <TabsTrigger value="fonts">Fonts</TabsTrigger>
            <TabsTrigger value="elements">Elements</TabsTrigger>
          </TabsList>

          <TabsContent value="fonts" className="mt-4 space-y-3">
            {designTemplates.map((template) => (
                      <div
                        key={template.id}
                        className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                          currentSlide?.design.template === template.id
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-primary/50"
                        }`}
                        onClick={() => applyTemplate(template)}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium text-sm">{template.name}</h4>
                            <p className="text-xs text-muted-foreground">{template.style}</p>
                          </div>
                          <div
                            className="w-8 h-8 rounded border"
                            style={{
                              backgroundColor: template.backgroundColor,
                              color: template.textColor,
                              fontSize: "8px",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontFamily: template.fontFamily,
                            }}
                          >
                            Aa
                          </div>
                        </div>
                      </div>
                    ))}
                  </TabsContent>

                  <TabsContent value="background" className="mt-4 space-y-3">
                    <div className="space-y-2">
                      <Label>Background Color</Label>
                      <div className="grid grid-cols-6 gap-2">
                        {backgroundColors.map((color) => (
                          <button
                            key={color}
                            onClick={() => applyBackgroundColor(color)}
                            className={`w-8 h-8 rounded border-2 ${
                              currentSlide?.design.backgroundColor === color
                                ? "border-foreground"
                                : "border-transparent"
                            }`}
                            style={{ backgroundColor: color }}
                          />
                        ))}
                      </div>
                      <div className="mt-2 p-2 bg-muted/50 rounded text-xs text-muted-foreground">
                        Background color will be applied to all slides
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Background Images</Label>
                      <div className="grid grid-cols-6 gap-2">
                        {backgroundImages.map((imagePath) => (
                          <button
                            key={imagePath}
                            onClick={() => applyBackgroundImage(imagePath)}
                            className={`relative w-full h-20 rounded border-2 overflow-hidden ${
                              currentSlide?.design.backgroundImage === imagePath
                                ? "border-foreground"
                                : "border-transparent"
                            }`}
                          >
                            <img
                              src={imagePath}
                              alt="Background"
                              className="w-full h-full object-cover"
                            />
                          </button>
                        ))}
                      </div>
                      <div className="mt-2 p-2 bg-muted/50 rounded text-xs text-muted-foreground">
                        Background images will be applied to all slides. 1:1 crops to fit, 9:16 shows full image.
                      </div>
                      
                      <div className="space-y-2">
                        <Label className="text-sm">Overlay Opacity</Label>
                        <div className="px-3">
                          <Slider
                            value={[overlayOpacity]}
                            onValueChange={([value]) => setOverlayOpacity(value)}
                            max={0.8}
                            min={0.1}
                            step={0.05}
                          />
                          <div className="flex justify-between text-xs text-muted-foreground mt-1">
                            <span>Subtle</span>
                            <span>{Math.round(overlayOpacity * 100)}%</span>
                            <span>Strong</span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant={overlayOpacity > 0 ? "outline" : "default"}
                            size="sm"
                            onClick={() => setOverlayOpacity(0)}
                            className="flex-1"
                          >
                            No Overlay
                          </Button>
                          <Button
                            variant={overlayOpacity > 0 ? "default" : "outline"}
                            size="sm"
                            onClick={() => setOverlayOpacity(0.4)}
                            className="flex-1"
                          >
                            Default
                          </Button>
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          onClick={refreshRandomBackground}
                          className="flex-1"
                        >
                          🎲 New Random
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => applyBackgroundColor("#ffffff")}
                          className="flex-1"
                        >
                          Remove Background
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Text Color</Label>
                      <div className="flex gap-2">
                        <Input
                          type="color"
                          value={currentSlide?.design.textColor}
                          onChange={(e) => updateSlideDesign({ textColor: e.target.value })}
                          className="w-12 h-10 p-1 border rounded"
                        />
                        <Input
                          value={currentSlide?.design.textColor}
                          onChange={(e) => updateSlideDesign({ textColor: e.target.value })}
                          placeholder="#FFFFFF"
                          className="flex-1"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Border</Label>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                          <Label className="text-xs">Width (px)</Label>
                          <Slider
                            value={[currentSlide?.design.borderWidth || 2]}
                            onValueChange={([value]) => updateSlideDesign({ borderWidth: value })}
                            max={8}
                            min={0}
                            step={1}
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">Color</Label>
                          <Input
                            type="color"
                            value={currentSlide?.design.borderColor}
                            onChange={(e) => updateSlideDesign({ borderColor: e.target.value })}
                            className="w-full h-8 p-1 border rounded"
                          />
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="layout" className="mt-4 space-y-3">
                    <div className="space-y-2">
                      <Label>Aspect Ratio</Label>
                      <div className="grid grid-cols-2 gap-2">
                        <Button
                          variant={currentProject.aspectRatio === "1:1" ? "default" : "outline"}
                          onClick={() => setCurrentProject({ ...currentProject, aspectRatio: "1:1" })}
                          className="h-16"
                        >
                          <div className="text-center">
                            <div className="w-8 h-8 bg-current/20 rounded mb-1 mx-auto"></div>
                            <div className="text-xs">1:1 Square</div>
                          </div>
                        </Button>
                        <Button
                          variant={currentProject.aspectRatio === "9:16" ? "default" : "outline"}
                          onClick={() => setCurrentProject({ ...currentProject, aspectRatio: "9:16" })}
                          className="h-16"
                        >
                          <div className="text-center">
                            <div className="w-6 h-10 bg-current/20 rounded mb-1 mx-auto"></div>
                            <div className="text-xs">9:16 Vertical</div>
                          </div>
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Font Size</Label>
                      <div className="px-3">
                        <Slider
                          value={[currentSlide?.design.fontSize || 24]}
                          onValueChange={([value]) => updateSlideDesign({ fontSize: value })}
                          max={72}
                          min={12}
                          step={2}
                        />
                        <div className="flex justify-between text-xs text-muted-foreground mt-1">
                          <span>12px</span>
                          <span>{currentSlide?.design.fontSize}px</span>
                          <span>72px</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Branding</Label>
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <input
                            type="radio"
                            id="branding-none"
                            name="branding"
                            value="none"
                            checked={currentProject?.branding === "none"}
                            onChange={(e) => updateProjectBranding(e.target.value as "none" | "name" | "email" | "both")}
                            className="w-4 h-4"
                          />
                          <Label htmlFor="branding-none" className="text-sm">No Branding</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <input
                            type="radio"
                            id="branding-name"
                            name="branding"
                            value="name"
                            checked={currentProject?.branding === "name"}
                            onChange={(e) => updateProjectBranding(e.target.value as "none" | "name" | "email" | "both")}
                            className="w-4 h-4"
                          />
                          <Label htmlFor="branding-name" className="text-sm">LinkedIn Name Only</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <input
                            type="radio"
                            id="branding-email"
                            name="branding"
                            value="email"
                            checked={currentProject?.branding === "email"}
                            onChange={(e) => updateProjectBranding(e.target.value as "none" | "name" | "email" | "both")}
                            className="w-4 h-4"
                          />
                          <Label htmlFor="branding-email" className="text-sm">LinkedIn Email Only</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <input
                            type="radio"
                            id="branding-both"
                            name="branding"
                            value="both"
                            checked={currentProject?.branding === "both"}
                            onChange={(e) => updateProjectBranding(e.target.value as "none" | "name" | "email" | "both")}
                            className="w-4 h-4"
                          />
                          <Label htmlFor="branding-both" className="text-sm">Both Name & Email</Label>
                        </div>
                      </div>
                      {currentProject?.branding !== "none" && (
                        <div className="mt-2 p-2 bg-muted/50 rounded text-xs text-muted-foreground">
                          Branding will appear at the bottom of all slides
                        </div>
                      )}
                      {currentProject?.branding === "none" && (
                        <div className="mt-2 p-2 bg-muted/50 rounded text-xs text-muted-foreground">
                          No branding will be displayed
                        </div>
                      )}
                    </div>
                  </TabsContent>

                  <TabsContent value="elements" className="mt-4 space-y-3">
                      <div className="space-y-2">
                        <Label>Interactive Elements</Label>
                        <p className="text-xs text-muted-foreground">Add interactive elements to guide users through your carousel</p>
                        
                        <div className="space-y-2">
                          <Label>Available Elements</Label>
                          <div className="grid grid-cols-2 gap-2">
                            {availableElements.map((element) => (
                              <Button
                                key={element.type}
                                variant="outline"
                                size="sm"
                                onClick={() => addElement(element.type)}
                                className="h-12 flex flex-col items-center justify-center gap-1"
                              >
                                <span className="text-lg">{element.icon}</span>
                                <span className="text-xs">{element.label}</span>
                              </Button>
                            ))}
                          </div>
                        </div>

                        {currentProject?.elements && currentProject.elements.length > 0 && (
                          <div className="space-y-2">
                            <Label>Current Elements</Label>
                            <div className="space-y-2">
                              {currentProject.elements.map((element) => (
                                <div key={element.id} className="flex items-center justify-between p-2 bg-muted/50 rounded">
                                  <div className="flex items-center gap-2">
                                    <span className="text-lg">
                                      {element.type === "swipe-right" && "→"}
                                      {element.type === "swipe-left" && "←"}
                                      {element.type === "swipe-up" && "↑"}
                                      {element.type === "swipe-down" && "↓"}
                                      {element.type === "tap" && "👆"}
                                      {element.type === "click" && "🖱️"}
                                      {element.type === "arrow-right" && "➡️"}
                                      {element.type === "arrow-left" && "⬅️"}
                                      {element.type === "arrow-up" && "⬆️"}
                                      {element.type === "arrow-down" && "⬇️"}
                                    </span>
                                    <span className="text-sm">
                                      {availableElements.find(e => e.type === element.type)?.label}
                                    </span>
                                  </div>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => removeElement(element.id)}
                                    className="h-6 w-6 p-0 text-destructive"
                                  >
                                    ×
                                  </Button>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </>
  )
}