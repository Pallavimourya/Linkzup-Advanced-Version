"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
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
import { ScheduleButton } from "@/components/schedule-button"
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
  Image as ImageIcon,
  X,
  Loader2,
  Clock
} from "lucide-react"
import { useSession } from "next-auth/react"
import { toast } from "@/hooks/use-toast"
import { useLinkedInPosting } from "@/hooks/use-linkedin-posting"
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
  backgroundType: "color" | "gradient" | "image"
  backgroundImage?: string
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

const templates = [
  { name: "Professional Blue", backgroundColor: "#0077B5", textColor: "#FFFFFF" },
  { name: "Modern Dark", backgroundColor: "#1F2937", textColor: "#FFFFFF" },
  { name: "Elegant Purple", backgroundColor: "#8B5CF6", textColor: "#FFFFFF" },
  { name: "Fresh Green", backgroundColor: "#10B981", textColor: "#FFFFFF" },
  { name: "Warm Orange", backgroundColor: "#F59E0B", textColor: "#FFFFFF" },
  { name: "Bold Red", backgroundColor: "#EF4444", textColor: "#FFFFFF" },
  { name: "Clean White", backgroundColor: "#FFFFFF", textColor: "#1F2937" },
  { name: "Minimal Gray", backgroundColor: "#F3F4F6", textColor: "#374151" },
]

export default function AICarouselPage() {
  const { data: session } = useSession()
  const { postToLinkedIn, isPosting, isLinkedInConnected } = useLinkedInPosting()
  const [currentProject, setCurrentProject] = useState<CarouselProject | null>(null)
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0)
  const [showPreviewModal, setShowPreviewModal] = useState(false)
  const [mounted, setMounted] = useState(false)

  // Prevent hydration mismatch by only rendering after mount
  useEffect(() => {
    setMounted(true)
  }, [])

  const [isGenerating, setIsGenerating] = useState(false)
  const [savedProjects, setSavedProjects] = useState<CarouselProject[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const slideCanvasRef = useRef<HTMLDivElement>(null)

  // Image Management State
  const [isLoading, setIsLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [selectedSource, setSelectedSource] = useState("unsplash")
  const [aiPrompt, setAiPrompt] = useState("")
  const [aiResults, setAiResults] = useState<any[]>([])
  const [uploadedImages, setUploadedImages] = useState<string[]>([])

  const imageSources = [
    { value: "unsplash", label: "Unsplash" },
    { value: "pexels", label: "Pexels" },
    { value: "pixabay", label: "Pixabay" },
    { value: "google", label: "Google Images" },
  ]

  // AI Generation Form
  const [aiForm, setAiForm] = useState({
    topic: "",
    tone: "professional",
    slideCount: "5",
    style: "modern",
    carouselType: "guide",
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

  const handleImageSelect = (imageUrl: string, imageData?: any) => {
    if (!currentProject) return
    
    const updatedSlides = [...currentProject.slides]
    updatedSlides[currentSlideIndex] = {
      ...updatedSlides[currentSlideIndex],
      backgroundType: "image",
      backgroundImage: imageUrl,
      backgroundColor: "#000000", // Fallback color
    }
    
    setCurrentProject({
      ...currentProject,
      slides: updatedSlides,
    })
    
    toast({
      title: "Image applied",
      description: "Background image has been applied to the current slide",
    })
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

  // Image Management Functions
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files || files.length === 0) return

    setIsLoading(true)
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        if (!file.type.startsWith('image/')) {
          toast({
            title: "Invalid file type",
            description: "Please select only image files",
            variant: "destructive",
          })
          continue
        }

        const formData = new FormData()
        formData.append('file', file)

        const response = await fetch('/api/upload-image', {
          method: 'POST',
          body: formData,
        })

        if (response.ok) {
          const data = await response.json()
          setUploadedImages(prev => [...prev, data.url])
          toast({
            title: "Upload successful",
            description: "Image uploaded to Cloudinary",
          })
        } else {
          throw new Error('Upload failed')
        }
      }
    } catch (error) {
      toast({
        title: "Upload failed",
        description: "Failed to upload image. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const searchImages = async () => {
    if (!searchQuery.trim()) return

    setIsLoading(true)
    try {
      const response = await fetch('/api/search-images', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: searchQuery,
          source: selectedSource,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success && data.images && data.images.length > 0) {
          setSearchResults(data.images)
          toast({
            title: "Search Complete",
            description: `Found ${data.images.length} images for "${searchQuery}" from ${data.source}`,
          })
        } else {
          setSearchResults([])
          toast({
            title: "No Images Found",
            description: `No images found for "${searchQuery}". Try a different search term.`,
            variant: "destructive"
          })
        }
      } else {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || "Search failed")
      }
    } catch (error) {
      toast({
        title: "Search failed",
        description: "Failed to search images. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const generateAIImage = async () => {
    if (!aiPrompt.trim()) return

    setIsLoading(true)
    try {
      const response = await fetch('/api/generate-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: aiPrompt,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        const newResult = {
          id: Date.now().toString(),
          url: data.url,
          prompt: aiPrompt,
          timestamp: new Date(),
        }
        setAiResults(prev => [newResult, ...prev])
        setAiPrompt("")
        toast({
          title: "Image generated",
          description: "AI image generated successfully",
        })
      } else {
        throw new Error('Generation failed')
      }
    } catch (error) {
      toast({
        title: "Generation failed",
        description: "Failed to generate image. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
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

      // Generate content based on carousel type
      let sampleContent: string[] = []
      
      switch (aiForm.carouselType) {
        case "guide":
          sampleContent = [
            `${aiForm.topic}\nComplete Guide`,
            "What is it?\n\nUnderstanding the fundamentals and importance of this topic.",
            "Why it matters\n\n• Professional growth\n• Industry relevance\n• Career advancement\n• Skill development",
            "Step 1: Research\n\nStart by gathering information and understanding the basics.",
            "Step 2: Plan\n\nCreate a structured approach and set clear objectives.",
            "Step 3: Execute\n\nTake action and implement your strategy systematically.",
            "Step 4: Measure\n\nTrack progress and analyze results for continuous improvement.",
        "Key Takeaways\n\n• Focus on fundamentals\n• Be consistent\n• Learn from others\n• Stay updated",
          ]
          break
        case "tips":
          sampleContent = [
            `${aiForm.topic}\nPro Tips`,
            "Tip #1\n\nStart with the basics and build a strong foundation.",
            "Tip #2\n\nConsistency is key - practice regularly and stay committed.",
            "Tip #3\n\nLearn from experts and industry leaders in your field.",
            "Tip #4\n\nTrack your progress and celebrate small wins along the way.",
            "Tip #5\n\nStay updated with the latest trends and best practices.",
            "Bonus Tip\n\nNetwork with like-minded professionals and share knowledge.",
            "Ready to implement?\n\nStart with one tip and gradually incorporate others.",
          ]
          break
        case "story":
          sampleContent = [
            `${aiForm.topic}\nMy Journey`,
            "The Beginning\n\nHow I first discovered this topic and why it caught my attention.",
            "The Challenge\n\nFacing obstacles and learning from initial failures and setbacks.",
            "The Breakthrough\n\nKey moments that changed everything and led to success.",
            "Lessons Learned\n\n• Patience is crucial\n• Consistency pays off\n• Community matters\n• Never give up",
            "The Results\n\nTangible outcomes and measurable improvements achieved.",
            "What I'd Do Differently\n\nReflections and advice for others on the same path.",
            "Your Turn\n\nReady to start your own journey? Take the first step today!",
          ]
          break
        case "comparison":
          sampleContent = [
            `${aiForm.topic}\nComparison Guide`,
            "Option A vs Option B\n\nUnderstanding the key differences between approaches.",
            "Option A: Pros\n\n• Advantage 1\n• Advantage 2\n• Advantage 3\n• Advantage 4",
            "Option A: Cons\n\n• Limitation 1\n• Limitation 2\n• Limitation 3",
            "Option B: Pros\n\n• Advantage 1\n• Advantage 2\n• Advantage 3\n• Advantage 4",
            "Option B: Cons\n\n• Limitation 1\n• Limitation 2\n• Limitation 3",
            "My Recommendation\n\nBased on experience, here's what I suggest and why.",
            "Final Verdict\n\nChoose what works best for your specific situation and goals.",
          ]
          break
        case "checklist":
          sampleContent = [
            `${aiForm.topic}\nAction Checklist`,
            "Pre-Planning Checklist\n\n□ Define your goals\n□ Research the topic\n□ Set a timeline\n□ Gather resources",
            "Implementation Checklist\n\n□ Start with basics\n□ Follow best practices\n□ Track progress\n□ Stay consistent",
            "Quality Assurance\n\n□ Review your work\n□ Get feedback\n□ Make improvements\n□ Document learnings",
            "Optimization Checklist\n\n□ Analyze results\n□ Identify areas for improvement\n□ Implement changes\n□ Measure impact",
            "Maintenance Checklist\n\n□ Regular reviews\n□ Stay updated\n□ Continuous learning\n□ Share knowledge",
            "Success Metrics\n\n□ Define KPIs\n□ Track performance\n□ Celebrate wins\n□ Plan next steps",
            "Ready to get started?\n\nPick one checklist and begin your journey today!",
          ]
          break
        case "stats":
          sampleContent = [
            `${aiForm.topic}\nBy The Numbers`,
            "Key Statistics\n\nUnderstanding the data and trends in this field.",
            "Growth Trends\n\n• 85% increase in adoption\n• 3x faster results\n• 92% satisfaction rate\n• 40% cost reduction",
            "Market Analysis\n\n• Market size: $50B\n• Annual growth: 15%\n• Top players: 5 major companies\n• Emerging trends: 3 key areas",
            "Performance Metrics\n\n• 95% success rate\n• 60% time savings\n• 75% quality improvement\n• 80% user satisfaction",
            "Industry Insights\n\n• Top challenges faced\n• Most effective strategies\n• Common pitfalls to avoid\n• Future predictions",
            "Success Stories\n\n• Case study 1: 200% improvement\n• Case study 2: 50% cost savings\n• Case study 3: 90% efficiency gain",
            "Take Action\n\nUse these insights to inform your strategy and make data-driven decisions.",
          ]
          break
        case "quotes":
          sampleContent = [
            `${aiForm.topic}\nInspiration`,
            "Quote #1\n\nThe only way to do great work is to love what you do.\n- Steve Jobs",
            "Quote #2\n\nSuccess is not final, failure is not fatal: it is the courage to continue that counts.\n- Winston Churchill",
            "Quote #3\n\nThe future belongs to those who believe in the beauty of their dreams.\n- Eleanor Roosevelt",
            "Quote #4\n\nDon't watch the clock; do what it does. Keep going.\n- Sam Levenson",
            "Quote #5\n\nThe only limit to our realization of tomorrow is our doubts of today.\n- Franklin D. Roosevelt",
            "Quote #6\n\nBelieve you can and you're halfway there.\n- Theodore Roosevelt",
            "Your Turn\n\nWhat quote inspires you? Share it in the comments below!",
          ]
          break
        default: // custom
          sampleContent = [
            `${aiForm.topic}\nCustom Carousel`,
            "Slide 2\n\nAdd your custom content here.",
            "Slide 3\n\nCustomize this slide with your own text and ideas.",
            "Slide 4\n\nMake it personal and relevant to your audience.",
            "Slide 5\n\nShare your unique perspective and insights.",
            "Slide 6\n\nEnd with a strong call to action or key message.",
            "Slide 7\n\nThank your audience and encourage engagement.",
          ]
      }

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

  const saveProject = async () => {
    if (!currentProject) return

    try {
      // Save to local state
      setSavedProjects((prev) => {
        const existingIndex = prev.findIndex((p) => p.id === currentProject.id)
        if (existingIndex >= 0) {
          const updated = [...prev]
          updated[existingIndex] = currentProject
          return updated
        }
        return [...prev, currentProject]
      })

      // Save to drafts API
      const carouselContent = currentProject.slides.map((slide, index) => 
        `Slide ${index + 1}: ${slide.text}`
      ).join('\n\n')

      const response = await fetch("/api/drafts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: currentProject.title,
          content: carouselContent,
          format: "carousel",
          niche: "AI Carousel"
        })
      })

      if (response.ok) {
        toast({
          title: "Carousel Saved!",
          description: "Your carousel has been saved to drafts successfully.",
        })
      } else {
        toast({
          title: "Error",
          description: "Failed to save carousel to drafts. Please try again.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error saving carousel:", error)
      toast({
        title: "Error",
        description: "Failed to save carousel to drafts. Please try again.",
        variant: "destructive",
      })
    }
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

        // Create a temporary canvas element that matches the exact canvas design
        const tempDiv = document.createElement("div")
        tempDiv.style.width = "500px"
        tempDiv.style.height = "500px"
        tempDiv.style.position = "absolute"
        tempDiv.style.left = "-9999px"
        tempDiv.style.overflow = "hidden"
        tempDiv.style.borderRadius = "8px"
        
        // Ensure we have a valid hex color
        const bgColor = convertToHex(slide.backgroundColor)
        tempDiv.style.backgroundColor = bgColor || "#FFFFFF"

        // Add background image as an actual IMG element if present
        if (slide.backgroundType === "image" && slide.backgroundImage) {
          const bgImg = document.createElement("img")
          const resolved = await resolveBackgroundImageUrl(slide.backgroundImage)
          bgImg.src = resolved || slide.backgroundImage
          bgImg.style.position = "absolute"
          bgImg.style.top = "0"
          bgImg.style.left = "0"
          bgImg.style.width = "100%"
          bgImg.style.height = "100%"
          bgImg.style.objectFit = "cover"
          bgImg.style.objectPosition = "center"
          bgImg.style.zIndex = "1"
          
          // Wait for image to load
          await new Promise((resolve, reject) => {
            bgImg.onload = resolve
            bgImg.onerror = () => {
              console.warn("Background image failed to load:", slide.backgroundImage)
              resolve(null) // Continue without image
            }
            // Timeout after 5 seconds
            setTimeout(() => {
              console.warn("Background image load timeout:", slide.backgroundImage)
              resolve(null)
            }, 5000)
          })
          
          tempDiv.appendChild(bgImg)
        }

        // Create text container with exact positioning
        const textContainer = document.createElement("div")
        textContainer.style.position = "absolute"
        textContainer.style.left = `${slide.textPosition.x}%`
        textContainer.style.top = `${slide.textPosition.y}%`
        textContainer.style.transform = "translate(-50%, -50%)"
        textContainer.style.minWidth = "200px"
        textContainer.style.textAlign = "center"
        textContainer.style.display = "flex"
        textContainer.style.alignItems = "center"
        textContainer.style.justifyContent = "center"
        textContainer.style.padding = "16px"
        textContainer.style.zIndex = "2" // Above background image

        const textDiv = document.createElement("div")
        
        // Ensure we have a valid hex color for text
        const textColor = convertToHex(slide.textColor)
        textDiv.style.color = textColor || "#000000"
        
        textDiv.style.fontSize = `${slide.fontSize}px`
        textDiv.style.fontFamily = slide.fontFamily || "Inter, sans-serif"
        textDiv.style.fontWeight = "bold"
        textDiv.style.lineHeight = "1.2"
        textDiv.style.whiteSpace = "pre-wrap"
        textDiv.style.textAlign = "center"
        textDiv.style.userSelect = "none"
        textDiv.textContent = slide.text

        textContainer.appendChild(textDiv)
        tempDiv.appendChild(textContainer)
        document.body.appendChild(tempDiv)

        let imgData: string
        
        // If there's a background image, use Canvas 2D API for more reliable rendering
        if (slide.backgroundType === "image" && slide.backgroundImage) {
          const canvas = document.createElement('canvas')
          canvas.width = 500
          canvas.height = 500
          const ctx = canvas.getContext('2d')
          
          if (ctx) {
            // Fill background color first
            const bgColor = convertToHex(slide.backgroundColor) || "#FFFFFF"
            ctx.fillStyle = bgColor
            ctx.fillRect(0, 0, 500, 500)
            
            // Load and draw background image
            const img = new Image()
            img.crossOrigin = 'anonymous'
            
            // Set the source (try data URL first, then original)
            const resolved = await resolveBackgroundImageUrl(slide.backgroundImage)
            
            await new Promise((resolve, reject) => {
              img.onload = () => {
                // Draw image to cover the entire canvas
                ctx.drawImage(img, 0, 0, 500, 500)
                resolve(null)
              }
              img.onerror = () => {
                console.warn("Failed to load background image for PDF, using color only")
                resolve(null)
              }
              
              img.src = (resolved || slide.backgroundImage) ?? ""
              
              // Timeout after 5 seconds
              setTimeout(() => {
                console.warn("Background image load timeout for PDF")
                resolve(null)
              }, 5000)
            })
            
            // Draw text on top
            const textColor = convertToHex(slide.textColor) || "#000000"
            ctx.fillStyle = textColor
            ctx.font = `bold ${slide.fontSize}px ${slide.fontFamily || 'Inter, sans-serif'}`
            ctx.textAlign = 'center'
            ctx.textBaseline = 'middle'
            
            // Calculate text position
            const textX = (slide.textPosition.x / 100) * 500
            const textY = (slide.textPosition.y / 100) * 500
            
            // Handle multi-line text
            const lines = slide.text.split('\n')
            const lineHeight = slide.fontSize * 1.2 // 1.2 is line height multiplier
            const totalHeight = lines.length * lineHeight
            const startY = textY - (totalHeight / 2) + (lineHeight / 2)
            
            lines.forEach((line, index) => {
              const y = startY + (index * lineHeight)
              ctx.fillText(line, textX, y)
            })
            
            imgData = canvas.toDataURL("image/png", 1.0)
          } else {
            throw new Error("Could not get 2D context for PDF")
          }
        } else {
          // No background image, use html2canvas
          const canvas = await html2canvas(tempDiv, {
            width: 500,
            height: 500,
            backgroundColor: convertToHex(slide.backgroundColor),
            scale: 2, // Higher quality
            useCORS: true,
            allowTaint: false,
          })
          
          imgData = canvas.toDataURL("image/png", 1.0)
        }

        document.body.removeChild(tempDiv)
        pdf.addImage(imgData, "PNG", margin, margin, slideWidth, slideHeight)

        // Add slide number and title
        pdf.setFontSize(10)
        pdf.setTextColor(100)
        pdf.text(`Slide ${i + 1} of ${currentProject.slides.length}`, margin, margin + slideHeight + 10)
        
        // Add project title on first slide
        if (i === 0) {
          pdf.setFontSize(14)
          pdf.setTextColor(50)
          pdf.text(currentProject.title, margin, margin - 10)
        }
      }

      pdf.save(`${currentProject.title.replace(/[^a-z0-9]/gi, "_").toLowerCase()}_carousel.pdf`)

      toast({
        title: "PDF Exported!",
        description: "Your carousel has been exported as a PDF file with exact canvas design.",
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

  const [showLinkedInModal, setShowLinkedInModal] = useState(false)
  const [linkedInCaption, setLinkedInCaption] = useState("")

  const handlePostToLinkedIn = async () => {
    if (!currentProject) return
    
    // Check if LinkedIn posting is available
    if (!postToLinkedIn) {
      toast({
        title: "LinkedIn Not Available",
        description: "LinkedIn posting functionality is not available. Please check your connection.",
        variant: "destructive",
      })
      return
    }
    
    // Check if user is connected to LinkedIn
    if (!isLinkedInConnected) {
      toast({
        title: "LinkedIn Not Connected",
        description: "Please connect your LinkedIn account before posting.",
        variant: "destructive",
      })
      return
    }
    
    // Check if already posting
    if (isPosting) {
      toast({
        title: "Already Posting",
        description: "Please wait for the current post to complete.",
        variant: "destructive",
      })
      return
    }

    try {
      // First, export slides as images with exact canvas design
      const slideImages = []
      
      // Validate project data
      if (!currentProject.slides || currentProject.slides.length === 0) {
        throw new Error("No slides found in the project")
      }

      for (let i = 0; i < currentProject.slides.length; i++) {
        const slide = currentProject.slides[i]
        
        // Validate slide data
        if (!slide || !slide.text) {
          console.warn(`Skipping invalid slide ${i + 1}`)
          continue
        }

        // Create a temporary canvas element that matches the exact canvas design
        const tempDiv = document.createElement("div")
        tempDiv.style.width = "1080px"
        tempDiv.style.height = "1080px"
        tempDiv.style.position = "absolute"
        tempDiv.style.left = "-9999px"
        tempDiv.style.overflow = "hidden"
        tempDiv.style.borderRadius = "12px"
        
        // Ensure we have a valid hex color
        const bgColor = convertToHex(slide.backgroundColor)
        tempDiv.style.backgroundColor = bgColor || "#FFFFFF"

        // Add background image as an actual IMG element if present
        if (slide.backgroundType === "image" && slide.backgroundImage) {
          const bgImg = document.createElement("img")
          const resolved = await resolveBackgroundImageUrl(slide.backgroundImage)
          bgImg.src = resolved || slide.backgroundImage
          bgImg.style.position = "absolute"
          bgImg.style.top = "0"
          bgImg.style.left = "0"
          bgImg.style.width = "100%"
          bgImg.style.height = "100%"
          bgImg.style.objectFit = "cover"
          bgImg.style.objectPosition = "center"
          bgImg.style.zIndex = "1"
          
          // Wait for image to load
          await new Promise((resolve, reject) => {
            bgImg.onload = resolve
            bgImg.onerror = () => {
              console.warn("Background image failed to load:", slide.backgroundImage)
              resolve(null) // Continue without image
            }
            // Timeout after 5 seconds
            setTimeout(() => {
              console.warn("Background image load timeout:", slide.backgroundImage)
              resolve(null)
            }, 5000)
          })
          
          tempDiv.appendChild(bgImg)
        }

        // Create text container with exact positioning
        const textContainer = document.createElement("div")
        textContainer.style.position = "absolute"
        textContainer.style.left = `${slide.textPosition.x}%`
        textContainer.style.top = `${slide.textPosition.y}%`
        textContainer.style.transform = "translate(-50%, -50%)"
        textContainer.style.minWidth = "400px"
        textContainer.style.textAlign = "center"
        textContainer.style.display = "flex"
        textContainer.style.alignItems = "center"
        textContainer.style.justifyContent = "center"
        textContainer.style.padding = "32px"
        textContainer.style.zIndex = "2" // Above background image

        const textDiv = document.createElement("div")
        
        // Ensure we have a valid hex color for text
        const textColor = convertToHex(slide.textColor)
        textDiv.style.color = textColor || "#000000"
        
        textDiv.style.fontSize = `${slide.fontSize * 1.5}px`
        textDiv.style.fontFamily = slide.fontFamily || "Inter, sans-serif"
        textDiv.style.fontWeight = "bold"
        textDiv.style.lineHeight = "1.2"
        textDiv.style.whiteSpace = "pre-wrap"
        textDiv.style.textAlign = "center"
        textDiv.style.userSelect = "none"
        textDiv.textContent = slide.text

        textContainer.appendChild(textDiv)
        tempDiv.appendChild(textContainer)
        document.body.appendChild(tempDiv)

        try {
          // If there's a background image, use Canvas 2D API for more reliable rendering
          if (slide.backgroundType === "image" && slide.backgroundImage) {
            const canvas = document.createElement('canvas')
            canvas.width = 1080
            canvas.height = 1080
            const ctx = canvas.getContext('2d')
            
            if (ctx) {
              // Fill background color first
              const bgColor = convertToHex(slide.backgroundColor) || "#FFFFFF"
              ctx.fillStyle = bgColor
              ctx.fillRect(0, 0, 1080, 1080)
              
              // Load and draw background image
              const img = new Image()
              img.crossOrigin = 'anonymous'
              
              // Set the source (try data URL first, then original)
              const resolved = await resolveBackgroundImageUrl(slide.backgroundImage)
              
              await new Promise((resolve, reject) => {
                img.onload = () => {
                  // Draw image to cover the entire canvas
                  ctx.drawImage(img, 0, 0, 1080, 1080)
                  resolve(null)
                }
                img.onerror = () => {
                  console.warn("Failed to load background image, using color only")
                  resolve(null)
                }
                
                img.src = (resolved || slide.backgroundImage) ?? ""
                
                // Timeout after 5 seconds
                setTimeout(() => {
                  console.warn("Background image load timeout")
                  resolve(null)
                }, 5000)
              })
              
              // Draw text on top
              const textColor = convertToHex(slide.textColor) || "#000000"
              ctx.fillStyle = textColor
              ctx.font = `bold ${slide.fontSize * 1.5}px ${slide.fontFamily || 'Inter, sans-serif'}`
              ctx.textAlign = 'center'
              ctx.textBaseline = 'middle'
              
              // Calculate text position
              const textX = (slide.textPosition.x / 100) * 1080
              const textY = (slide.textPosition.y / 100) * 1080
              
              // Handle multi-line text
              const lines = slide.text.split('\n')
              const lineHeight = slide.fontSize * 1.5 * 1.2 // 1.2 is line height multiplier
              const totalHeight = lines.length * lineHeight
              const startY = textY - (totalHeight / 2) + (lineHeight / 2)
              
              lines.forEach((line, index) => {
                const y = startY + (index * lineHeight)
                ctx.fillText(line, textX, y)
              })
              
              slideImages.push(canvas.toDataURL("image/png", 1.0))
            } else {
              throw new Error("Could not get 2D context")
            }
          } else {
            // No background image, use html2canvas
            const canvas = await html2canvas(tempDiv, {
              width: 1080,
              height: 1080,
              backgroundColor: convertToHex(slide.backgroundColor),
              scale: 2, // Higher quality for LinkedIn
              useCORS: true,
              allowTaint: false,
              logging: false, // Disable logging to reduce console noise
              removeContainer: true, // Automatically remove temporary elements
              foreignObjectRendering: false, // Disable for better compatibility
              onclone: (clonedDoc) => {
                const elements = clonedDoc.body.querySelectorAll('*')
                elements.forEach((el) => {
                  const attrs = el.getAttributeNames()
                  attrs.forEach((attr) => {
                    if (attr.startsWith('bis_') || (attr.startsWith('data-') && attr.includes('bis'))) {
                      el.removeAttribute(attr)
                    }
                  })
                })
              }
            })

            slideImages.push(canvas.toDataURL("image/png", 1.0))
          }
        } catch (canvasError) {
          console.error(`Error rendering slide ${i + 1}:`, canvasError)
          // Create a fallback canvas with basic colors
          try {
            const fallbackCanvas = document.createElement('canvas')
            fallbackCanvas.width = 1080
            fallbackCanvas.height = 1080
            const ctx = fallbackCanvas.getContext('2d')
            if (ctx) {
              // Ensure we have safe colors
              const bgColor = convertToHex(slide.backgroundColor) || "#FFFFFF"
              const txtColor = convertToHex(slide.textColor) || "#000000"
              
              ctx.fillStyle = bgColor
              ctx.fillRect(0, 0, 1080, 1080)
              ctx.fillStyle = txtColor
              ctx.font = `${slide.fontSize * 1.5}px ${slide.fontFamily || 'Inter, sans-serif'}`
              ctx.textAlign = 'center'
              ctx.textBaseline = 'middle'
              ctx.fillText(slide.text, 540, 540)
              slideImages.push(fallbackCanvas.toDataURL("image/png", 1.0))
            } else {
              // If we can't get a 2D context, create a simple colored div
              console.warn("Could not get 2D context for fallback canvas")
              slideImages.push("data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTA4MCIgaGVpZ2h0PSIxMDgwIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSIxMDgwIiBoZWlnaHQ9IjEwODAiIGZpbGw9IiNGRkZGRkYiLz48dGV4dCB4PSI1NDAiIHk9IjU0MCIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjQ4IiBmaWxsPSIjMDAwMDAwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+RmFsbGJhY2sgU2xpZGU8L3RleHQ+PC9zdmc+")
            }
          } catch (fallbackError) {
            console.error("Fallback canvas creation failed:", fallbackError)
            // Last resort: add a placeholder image
            slideImages.push("data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTA4MCIgaGVpZ2h0PSIxMDgwIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSIxMDgwIiBoZWlnaHQ9IjEwODAiIGZpbGw9IiNGRkZGRkYiLz48dGV4dCB4PSI1NDAiIHk9IjU0MCIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjQ4IiBmaWxsPSIjMDAwMDAwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+RXJyb3IgU2xpZGU8L3RleHQ+PC9zdmc+")
          }
        } finally {
          // Always clean up the temporary element
          if (document.body.contains(tempDiv)) {
            document.body.removeChild(tempDiv)
          }
        }
      }

      // Ensure we have images to post
      if (slideImages.length === 0) {
        throw new Error("No images were generated for posting")
      }
      
      // Post to LinkedIn with the generated images
      const result = await postToLinkedIn({
        content: linkedInCaption || `🎨 ${currentProject.title}\n\n${currentProject.slides.map((slide, index) => `${index + 1}. ${slide.text}`).join('\n')}`,
        images: slideImages,
      })

      if (result.success) {
        toast({
          title: "Posted to LinkedIn!",
          description: "Your carousel has been published successfully.",
        })
        setShowLinkedInModal(false)
        setShowPreviewModal(false)
        setLinkedInCaption("")
      } else {
        throw new Error(result.error || "LinkedIn posting failed")
      }
    } catch (error) {
      console.error("LinkedIn posting error:", error)
      
      // Provide more specific error messages
      let errorMessage = "There was an error posting to LinkedIn. Please try again."
      
      if (error instanceof Error) {
        if (error.message.includes("oklch")) {
          errorMessage = "Color conversion error. Please check your slide colors and try again."
        } else if (error.message.includes("html2canvas")) {
          errorMessage = "Image generation error. Please try refreshing the page and try again."
        } else if (error.message.includes("LinkedIn")) {
          errorMessage = "LinkedIn connection error. Please check your LinkedIn connection and try again."
        }
      }
      
      toast({
        title: "Posting Failed",
        description: errorMessage,
        variant: "destructive",
      })
    }
  }

  const openLinkedInModal = () => {
    setLinkedInCaption(`🎨 ${currentProject?.title || "Carousel"}\n\n${currentProject?.slides.map((slide, index) => `${index + 1}. ${slide.text}`).join('\n')}`)
    setShowLinkedInModal(true)
  }

  // Function to convert any color to hex format
  const convertToHex = (color: string): string => {
    try {
      if (!color) return "#FFFFFF"
      
      // If it's already a hex color, return it
      if (color.startsWith("#")) return color
      
      // Handle CSS custom properties (CSS variables)
      if (color.startsWith("var(--")) {
        // Extract the variable name
        const varName = color.match(/var\(--([^)]+)\)/)?.[1]
        if (varName) {
          // Get computed value from CSS
          const computedValue = getComputedStyle(document.documentElement).getPropertyValue(`--${varName}`).trim()
          if (computedValue) {
            return convertToHex(computedValue)
          }
        }
        // Fallback for CSS variables
        return "#FFFFFF"
      }
      
      // If it's an oklch or other modern color function, convert to a safe fallback
      if (color.includes("oklch") || color.includes("hsl") || color.includes("rgb")) {
        // Extract the color and convert to a safe hex
        if (color.includes("primary")) return "#0077B5"
        if (color.includes("secondary")) return "#6366F1"
        if (color.includes("muted")) return "#64748B"
        if (color.includes("accent")) return "#8B5CF6"
        if (color.includes("destructive")) return "#EF4444"
        if (color.includes("success")) return "#10B981"
        if (color.includes("warning")) return "#F59E0B"
        if (color.includes("info")) return "#06B6D4"
        
        // Handle oklch colors specifically
        if (color.includes("oklch")) {
          // Parse oklch values (allow comma or space separated) and convert to hex
          const oklchMatch = color.match(/oklch\(([^)]+)\)/)
          if (oklchMatch) {
            const raw = oklchMatch[1].trim()
            const parts = raw.includes(',') ? raw.split(',') : raw.split(/\s+/)
            const values = parts.map(v => v.trim().replace(/deg$/, ''))
            if (values.length >= 3) {
              const l = parseFloat(values[0]) // lightness
              const c = parseFloat(values[1]) // chroma
              const h = parseFloat(values[2]) // hue
              
              // Convert oklch to approximate hex based on lightness and hue
              if (l > 0.8) return "#FFFFFF" // Very light colors
              if (l > 0.6) return "#E5E7EB" // Light colors
              if (l > 0.4) return "#9CA3AF" // Medium colors
              if (l > 0.2) return "#4B5563" // Dark colors
              return "#111827" // Very dark colors
            }
          }
        }
        
        // Handle hsl colors
        if (color.includes("hsl")) {
          const hslMatch = color.match(/hsl\(([^)]+)\)/)
          if (hslMatch) {
            const raw = hslMatch[1].trim()
            const parts = raw.includes(',') ? raw.split(',') : raw.split(/\s+/)
            const values = parts.map(v => v.trim().replace(/%$/, ''))
            if (values.length >= 3) {
              const h = parseFloat(values[0])
              const s = parseFloat(values[1])
              const l = parseFloat(values[2])
              
              // Simple HSL to hex conversion
              if (l > 0.8) return "#FFFFFF"
              if (l > 0.6) return "#E5E7EB"
              if (l > 0.4) return "#9CA3AF"
              if (l > 0.2) return "#4B5563"
              return "#111827"
            }
          }
        }
        
        // Handle rgb colors
        if (color.includes("rgb")) {
          const rgbMatch = color.match(/rgb\(([^)]+)\)/)
          if (rgbMatch) {
            const raw = rgbMatch[1].trim()
            const parts = raw.includes(',') ? raw.split(',') : raw.split(/\s+/)
            const values = parts.map(v => Number.parseInt(v.trim()))
            if (values.length >= 3) {
              const [r, g, b] = values
              // Convert RGB to hex
              return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`
            }
          }
        }
        
        // Default fallback
        return "#FFFFFF"
      }
      
      return color
    } catch (error) {
      console.error("Color conversion error:", error, "for color:", color)
      return "#FFFFFF" // Safe fallback
    }
  }

  // Load an image URL as a data URL to avoid CORS tainting in html2canvas
  const fetchImageAsDataURL = async (url: string): Promise<string | null> => {
    try {
      if (!url) return null
      // Already a data URL
      if (url.startsWith("data:")) return url
      // Same-origin URLs are safe to use directly
      try {
        const origin = typeof window !== 'undefined' ? window.location.origin : ''
        if (origin && url.startsWith(origin)) return url
      } catch {}

      // Try fetch -> blob -> dataURL
      const resp = await fetch(url, { mode: 'cors', credentials: 'omit' })
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`)
      const blob = await resp.blob()
      const dataUrl: string = await new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onloadend = () => resolve(reader.result as string)
        reader.onerror = reject
        reader.readAsDataURL(blob)
      })
      return dataUrl
    } catch (err) {
      console.warn('fetchImageAsDataURL failed, using original URL:', err)
      return null
    }
  }

  // Resolve a background image URL to a data URL when possible (for html2canvas)
  const resolveBackgroundImageUrl = async (imageUrl?: string): Promise<string | undefined> => {
    if (!imageUrl) return undefined
    const dataUrl = await fetchImageAsDataURL(imageUrl)
    return dataUrl || imageUrl
  }

  // Function to capture current canvas exactly as it appears
  const captureCurrentCanvas = async () => {
    if (!slideCanvasRef.current || !currentSlide) return null

    try {
      const canvas = await html2canvas(slideCanvasRef.current, {
        backgroundColor: convertToHex(currentSlide.backgroundColor),
        scale: 2, // Higher quality
        useCORS: true,
        allowTaint: true,
        width: slideCanvasRef.current.offsetWidth,
        height: slideCanvasRef.current.offsetHeight,
      })

      return canvas.toDataURL("image/png", 1.0)
    } catch (error) {
      console.error("Canvas capture error:", error)
      return null
    }
  }

  // Function to export current slide as PDF
  const exportCurrentSlideToPDF = async () => {
    if (!currentSlide) return

    try {
      const canvasData = await captureCurrentCanvas()
      if (!canvasData) {
        toast({
          title: "Export Failed",
          description: "Could not capture the current slide.",
          variant: "destructive",
        })
        return
      }

      const pdf = new jsPDF("p", "mm", "a4")
      const imgWidth = 180
      const imgHeight = 180
      const margin = 15

      pdf.addImage(canvasData, "PNG", margin, margin, imgWidth, imgHeight)
      
      // Add slide info
      pdf.setFontSize(14)
      pdf.setTextColor(50)
      pdf.text(currentProject?.title || "Carousel Slide", margin, margin - 10)
      
      pdf.setFontSize(10)
      pdf.setTextColor(100)
      pdf.text(`Slide ${currentSlideIndex + 1} of ${currentProject?.slides.length || 1}`, margin, margin + imgHeight + 10)

      pdf.save(`${currentProject?.title || "slide"}_slide_${currentSlideIndex + 1}.pdf`)

      toast({
        title: "Slide Exported!",
        description: "Current slide has been exported as a PDF file.",
      })
    } catch (error) {
      console.error("Slide export error:", error)
      toast({
        title: "Export Failed",
        description: "There was an error exporting the current slide.",
        variant: "destructive",
      })
    }
  }

  const currentSlide = currentProject?.slides[currentSlideIndex]

  // Prevent hydration mismatch by not rendering until mounted
  if (!mounted) {
    return (
      <div className="flex flex-col gap-4">
        <div className="px-4 py-8">
          <div className="flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        </div>
      </div>
    )
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
                <BreadcrumbPage>AI Carousel Creator</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>

      

      <div className="grid gap-6 px-4">
        {/* Coming Soon Overlay */}
        <Card className="border-2 border-dashed border-primary/50 bg-primary/5">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2 text-primary">
              <Sparkles className="w-6 h-6" />
              Coming Soon
            </CardTitle>
            <CardDescription className="text-lg">
              The AI Carousel feature is currently under development. We're working hard to bring you an amazing carousel creation experience powered by AI.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <div className="space-y-4">
              <p className="text-muted-foreground">
                🚀 Get ready for:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-primary rounded-full"></span>
                  AI-powered carousel generation
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-primary rounded-full"></span>
                  Professional slide templates
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-primary rounded-full"></span>
                  Custom branding options
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-primary rounded-full"></span>
                  One-click LinkedIn posting
                </div>
              </div>
              <div className="pt-4">
                <Button variant="outline" disabled className="cursor-not-allowed">
                  <Clock className="w-4 h-4 mr-2" />
                  Stay Tuned
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {!currentProject ? (
          <>
            {/* Create from Scratch */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="w-5 h-5 text-primary" />
                  Create from Scratch
                </CardTitle>
                <CardDescription>
                  Start with a blank canvas and design your carousel slides manually with full control over design, text, and positioning.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button onClick={createNewProject} className="w-full" size="lg">
                  <Palette className="w-5 h-5 mr-2" />
                  Start Creating
                </Button>
              </CardContent>
            </Card>

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

                <div className="space-y-2">
                  <Label>Carousel Type</Label>
                  <Select value={aiForm.carouselType} onValueChange={(value) => setAiForm({ ...aiForm, carouselType: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="guide">Complete Guide</SelectItem>
                      <SelectItem value="tips">Tips & Tricks</SelectItem>
                      <SelectItem value="story">Story/Experience</SelectItem>
                      <SelectItem value="comparison">Comparison</SelectItem>
                      <SelectItem value="checklist">Checklist</SelectItem>
                      <SelectItem value="stats">Statistics</SelectItem>
                      <SelectItem value="quotes">Quotes/Inspiration</SelectItem>
                      <SelectItem value="custom">Custom</SelectItem>
                    </SelectContent>
                  </Select>
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

                    {/* Slide Canvas - Centered below slide numbers */}
                    {currentSlide && (
                      <div className="relative flex justify-center">
                        <div
                          ref={slideCanvasRef}
                          className="rounded-lg flex items-center justify-center text-center p-8 relative overflow-hidden cursor-crosshair"
                                                     style={{
                             width: "45vw",
                             maxWidth: "500px",
                             height: "45vw",
                             maxHeight: "500px",
                             backgroundColor: convertToHex(currentSlide.backgroundColor),
                             backgroundImage: currentSlide.backgroundType === "image" && currentSlide.backgroundImage 
                               ? `url(${currentSlide.backgroundImage})` 
                               : undefined,
                             backgroundSize: currentSlide.backgroundType === "image" ? "cover" : undefined,
                             backgroundPosition: currentSlide.backgroundType === "image" ? "center" : undefined,
                             backgroundRepeat: currentSlide.backgroundType === "image" ? "no-repeat" : undefined,
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
                                 color: convertToHex(currentSlide.textColor),
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
                        <Button onClick={exportCurrentSlideToPDF} variant="outline" size="sm">
                          <Download className="w-4 h-4 mr-2" />
                          Export Slide
                        </Button>
                        <Button onClick={exportToPDF} variant="outline" size="sm">
                          <Download className="w-4 h-4 mr-2" />
                          Export All
                        </Button>
                        <Button onClick={openLinkedInModal} size="sm">
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
                        <TabsTrigger value="templates">Templates</TabsTrigger>
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
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <Label>Background Image</Label>
                          </div>
                          
                          {currentSlide?.backgroundType === "image" && currentSlide?.backgroundImage && (
                            <div className="relative">
                              <img
                                src={currentSlide.backgroundImage}
                                alt="Background"
                                className="w-full h-32 object-cover rounded-lg"
                              />
                              <Button
                                size="sm"
                                variant="destructive"
                                className="absolute top-2 right-2"
                                onClick={() => updateSlide({ 
                                  backgroundType: "color", 
                                  backgroundImage: undefined 
                                })}
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            </div>
                          )}
                          
                          <p className="text-sm text-muted-foreground">
                            Upload your own image, search from stock photo libraries, or generate AI images for your carousel background.
                          </p>

                          {/* Inline Image Manager */}
                          <Tabs defaultValue="upload" className="w-full">
                            <TabsList className="grid w-full grid-cols-3">
                              <TabsTrigger value="upload">
                                <Upload className="w-4 h-4 mr-2" />
                                Upload
                              </TabsTrigger>
                              <TabsTrigger value="search">
                                <Search className="w-4 h-4 mr-2" />
                                Search
                              </TabsTrigger>
                              <TabsTrigger value="ai-generate">
                                <Sparkles className="w-4 h-4 mr-2" />
                                AI Generate
                              </TabsTrigger>
                            </TabsList>

                            {/* Upload Tab */}
                            <TabsContent value="upload" className="mt-4">
                              <Card>
                                <CardContent className="pt-6">
                                  <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
                                    <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                                    <p className="text-sm text-muted-foreground mb-4">
                                      Drag and drop images here or click to browse
                                    </p>
                                    <Button
                                      onClick={() => document.getElementById('file-upload')?.click()}
                                      disabled={isLoading}
                                    >
                                      {isLoading ? (
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                      ) : (
                                        <Upload className="w-4 h-4 mr-2" />
                                      )}
                                      Choose Files
                                    </Button>
                                    <input
                                      id="file-upload"
                                      type="file"
                                      multiple
                                      accept="image/*"
                                      onChange={handleFileUpload}
                                      className="hidden"
                                    />
                                  </div>

                                  {uploadedImages.length > 0 && (
                                    <div className="space-y-2 mt-4">
                                      <Label>Uploaded Images</Label>
                                      <div className="grid grid-cols-3 gap-2">
                                        {uploadedImages.map((url, index) => (
                                          <div key={index} className="relative group">
                                            <img
                                              src={url}
                                              alt={`Uploaded ${index + 1}`}
                                              className="w-full h-24 object-cover rounded-lg cursor-pointer hover:opacity-80 transition-opacity"
                                              onClick={() => handleImageSelect(url)}
                                            />
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                </CardContent>
                              </Card>
                            </TabsContent>

                            {/* Search Tab */}
                            <TabsContent value="search" className="mt-4">
                              <Card>
                                <CardContent className="pt-6">
                                  <div className="flex gap-2 mb-4">
                                    <Input
                                      placeholder="Search for images..."
                                      value={searchQuery}
                                      onChange={(e) => setSearchQuery(e.target.value)}
                                      onKeyPress={(e) => e.key === 'Enter' && searchImages()}
                                      className="flex-1"
                                    />
                                    <Select value={selectedSource} onValueChange={setSelectedSource}>
                                      <SelectTrigger className="w-32">
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        {imageSources.map((source) => (
                                          <SelectItem key={source.value} value={source.value}>
                                            {source.label}
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                    <Button onClick={searchImages} disabled={isLoading || !searchQuery.trim()}>
                                      {isLoading ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                      ) : (
                                        <Search className="w-4 h-4" />
                                      )}
                                    </Button>
                                  </div>

                                  {searchResults.length > 0 && (
                                    <div className="space-y-2">
                                      <Label>Search Results</Label>
                                      <div className="grid grid-cols-3 gap-2 max-h-64 overflow-y-auto">
                                        {searchResults.map((result) => (
                                          <div key={result.id} className="relative group">
                                            <img
                                              src={result.thumbnail}
                                              alt={result.title || 'Search result'}
                                              className="w-full h-24 object-cover rounded-lg cursor-pointer hover:opacity-80 transition-opacity"
                                              onClick={() => handleImageSelect(result.url, result)}
                                            />
                                            <Badge className="absolute top-1 left-1 text-xs">
                                              {result.source}
                                            </Badge>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                </CardContent>
                              </Card>
                            </TabsContent>

                            {/* AI Generate Tab */}
                            <TabsContent value="ai-generate" className="mt-4">
                              <Card>
                                <CardContent className="pt-6">
                                  <div className="space-y-2">
                                    <Label>Describe the image you want to generate</Label>
                                    <Textarea
                                      placeholder="A professional business meeting with modern office background..."
                                      value={aiPrompt}
                                      onChange={(e) => setAiPrompt(e.target.value)}
                                      rows={3}
                                    />
                                    <Button 
                                      onClick={generateAIImage} 
                                      disabled={isLoading || !aiPrompt.trim()}
                                      className="w-full"
                                    >
                                      {isLoading ? (
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                      ) : (
                                        <Sparkles className="w-4 h-4 mr-2" />
                                      )}
                                      Generate Image
                                    </Button>
                                  </div>

                                  {aiResults.length > 0 && (
                                    <div className="space-y-2 mt-4">
                                      <Label>Generated Images</Label>
                                      <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto">
                                        {aiResults.map((result) => (
                                          <div key={result.id} className="relative group">
                                            <img
                                              src={result.url}
                                              alt={result.prompt}
                                              className="w-full h-32 object-cover rounded-lg cursor-pointer hover:opacity-80 transition-opacity"
                                              onClick={() => handleImageSelect(result.url, result)}
                                            />
                                            <div className="absolute bottom-1 left-1 right-1 bg-black/50 text-white text-xs p-1 rounded">
                                              {result.prompt.substring(0, 50)}...
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                </CardContent>
                              </Card>
                            </TabsContent>
                          </Tabs>
                        </div>
                      </TabsContent>

                      <TabsContent value="templates" className="mt-4">
                        <div className="space-y-3">
                          <div className="grid grid-cols-2 gap-2">
                            {templates.map((template) => (
                              <button
                                key={template.name}
                                onClick={() => updateSlide({ 
                                  backgroundColor: template.backgroundColor, 
                                  textColor: template.textColor,
                                  backgroundType: "color" 
                                })}
                                className={`p-3 rounded-lg border-2 text-left transition-colors ${
                                  currentSlide?.backgroundColor === template.backgroundColor ? "border-primary" : "border-muted hover:border-muted-foreground"
                                }`}
                              >
                                <div className="flex items-center gap-2 mb-2">
                                  <div 
                                    className="w-4 h-4 rounded border"
                                    style={{ backgroundColor: template.backgroundColor }}
                                  />
                                  <span className="text-sm font-medium">{template.name}</span>
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  {template.backgroundColor} / {template.textColor}
                                </div>
                              </button>
                            ))}
                          </div>
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
                          backgroundColor: convertToHex(slide.backgroundColor),
                          backgroundImage: slide.backgroundType === "image" && slide.backgroundImage 
                            ? `url(${slide.backgroundImage})` 
                            : undefined,
                          backgroundSize: slide.backgroundType === "image" ? "cover" : undefined,
                          backgroundPosition: slide.backgroundType === "image" ? "center" : undefined,
                          backgroundRepeat: slide.backgroundType === "image" ? "no-repeat" : undefined,
                        }}
                     >
                       <div
                         className="whitespace-pre-wrap font-bold leading-tight"
                                                   style={{
                            fontSize: `${Math.max(8, slide.fontSize / 4)}px`,
                            fontFamily: slide.fontFamily,
                            color: convertToHex(slide.textColor),
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
                   Export All as PDF
                 </Button>
                 <Button 
                   onClick={openLinkedInModal} 
                   className="flex-1"
                   disabled={isPosting}
                 >
                   <Send className="w-4 h-4 mr-2" />
                   {isPosting ? "Posting..." : "Post to LinkedIn"}
                 </Button>
               </div>
               <div className="text-xs text-muted-foreground text-center mt-2">
                 💡 Tip: Use "Export All as PDF" to save your carousel as a multi-page PDF file perfect for LinkedIn posting
               </div>
             </div>
           )}
         </DialogContent>
       </Dialog>

       {/* LinkedIn Post Modal */}
       <Dialog open={showLinkedInModal} onOpenChange={setShowLinkedInModal}>
         <DialogContent className="max-w-2xl">
           <DialogHeader>
             <DialogTitle className="flex items-center gap-2">
               <Send className="w-5 h-5 text-primary" />
               Post to LinkedIn
             </DialogTitle>
             <DialogDescription>
               Add a caption for your carousel post and publish it to LinkedIn.
             </DialogDescription>
           </DialogHeader>

           {currentProject && (
             <div className="space-y-4">
               {/* Caption Input */}
               <div className="space-y-2">
                 <Label htmlFor="linkedin-caption">Post Caption (Optional)</Label>
                 <Textarea
                   id="linkedin-caption"
                   placeholder="Write your LinkedIn post caption here..."
                   value={linkedInCaption}
                   onChange={(e) => setLinkedInCaption(e.target.value)}
                   rows={4}
                   className="resize-none"
                 />
                 <div className="text-xs text-muted-foreground">
                   {linkedInCaption.length} characters • Leave empty to use auto-generated caption
                 </div>
               </div>

               {/* Preview of what will be posted */}
               <div className="space-y-2">
                 <Label>Preview</Label>
                 <div className="p-3 bg-muted rounded-lg text-sm">
                   <div className="font-medium mb-2">Caption:</div>
                   <div className="whitespace-pre-wrap text-muted-foreground">
                     {linkedInCaption || `🎨 ${currentProject.title}\n\n${currentProject.slides.map((slide, index) => `${index + 1}. ${slide.text}`).join('\n')}`}
                   </div>
                   <div className="mt-2 text-xs text-muted-foreground">
                     + {currentProject.slides.length} carousel images
                   </div>
                 </div>
               </div>

               {/* Action Buttons */}
               <div className="flex gap-3">
                 <Button 
                   onClick={() => setShowLinkedInModal(false)} 
                   variant="outline" 
                   className="flex-1"
                 >
                   Cancel
                 </Button>
                 <ScheduleButton
                   content={linkedInCaption || `🎨 ${currentProject.title}\n\n${currentProject.slides.map((slide, index) => `${index + 1}. ${slide.text}`).join('\n')}`}
                   defaultPlatform="linkedin"
                   defaultType="carousel"
                   className="flex-1"
                 />
                 <Button 
                   onClick={handlePostToLinkedIn} 
                   className="flex-1"
                   disabled={isPosting}
                 >
                   {isPosting ? (
                     <>
                       <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                       Posting...
                     </>
                   ) : (
                     <>
                       <Send className="w-4 h-4 mr-2" />
                       Post to LinkedIn
                     </>
                   )}
                 </Button>
               </div>

               <div className="text-xs text-muted-foreground text-center">
                 💡 Your carousel will be converted to high-quality images and posted as a LinkedIn carousel
               </div>
             </div>
           )}
         </DialogContent>
       </Dialog>


    </div>
  )
}
