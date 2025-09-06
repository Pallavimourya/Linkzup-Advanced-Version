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
import domtoimage from 'dom-to-image'

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
  titleAccentColor: string
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
  "/Backgrounds/bg18.jpg",
  "/Backgrounds/bg19.jpg",
  "/Backgrounds/bg20.jpg",
  "/Backgrounds/bg21.jpg",
  "/Backgrounds/bg22.jpg",
  "/Backgrounds/bg23.jpg",
  "/Backgrounds/bg24.jpg",
]

// Title accent colors
const titleAccentColors = [
  "#FF0000", // Red
  "#00FFFF", // Cyan
  "#808080", // Grey
  "#FF7F50", // Coral
]

// Function to get a random background image
const getRandomBackgroundImage = () => {
  const randomIndex = Math.floor(Math.random() * backgroundImages.length)
  return backgroundImages[randomIndex]
}

// Function to get a random title accent color
const getRandomTitleColor = () => {
  const randomIndex = Math.floor(Math.random() * titleAccentColors.length)
  return titleAccentColors[randomIndex]
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
  const [generationAttempts, setGenerationAttempts] = useState(0)
  const [savedProjects, setSavedProjects] = useState<CarouselProject[]>([])
  const [editingText, setEditingText] = useState<string | null>(null)
  const [overlayOpacity, setOverlayOpacity] = useState(0.4)
  const [showRawContent, setShowRawContent] = useState(false)
  const [lastGeneratedContent, setLastGeneratedContent] = useState<string>("")
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

  // Helper function to clean content from JSON artifacts
  const cleanContent = (content: string) => {
    if (typeof content !== 'string') return content
    
    // Remove common JSON artifacts
    let cleaned = content
      .replace(/^["']|["']$/g, '') // Remove leading/trailing quotes
      .replace(/\\"/g, '"') // Unescape quotes
      .replace(/\\n/g, ' ') // Replace newlines with spaces
      .replace(/\\t/g, ' ') // Replace tabs with spaces
      .trim()
    
    // If content still looks like JSON, try to extract the actual value
    if (cleaned.includes('":') && cleaned.includes('"')) {
      const valueMatch = cleaned.match(/"([^"]+)"/)
      if (valueMatch) {
        cleaned = valueMatch[1]
      }
    }
    
    return cleaned
  }

  // Helper function to validate slide structure
  const validateSlideStructure = (slides: any[], expectedCount: number) => {
    const errors: string[] = []
    
    if (!Array.isArray(slides)) {
      errors.push('Slides is not an array')
      return { isValid: false, errors }
    }
    
    if (slides.length !== expectedCount) {
      errors.push(`Expected ${expectedCount} slides, got ${slides.length}`)
    }
    
    // Validate first slide
    if (slides[0]) {
      const firstSlide = slides[0]
      if (!firstSlide.top_line) errors.push('First slide missing top_line')
      if (!firstSlide.main_heading) errors.push('First slide missing main_heading')
      if (!firstSlide.bullet) errors.push('First slide missing bullet')
    }
    
    // Validate middle slides
    for (let i = 1; i < slides.length - 1; i++) {
      const slide = slides[i]
      if (!slide.heading) errors.push(`Slide ${i + 1} missing heading`)
      if (!Array.isArray(slide.bullets)) errors.push(`Slide ${i + 1} missing bullets array`)
      if (slide.bullets && slide.bullets.length < 3) errors.push(`Slide ${i + 1} has less than 3 bullets`)
    }
    
    // Validate last slide
    if (slides[slides.length - 1]) {
      const lastSlide = slides[slides.length - 1]
      if (!lastSlide.tagline) errors.push('Last slide missing tagline')
      if (!lastSlide.final_heading) errors.push('Last slide missing final_heading')
      if (!lastSlide.last_bullet) errors.push('Last slide missing last_bullet')
    }
    
    return { isValid: errors.length === 0, errors }
  }



    // Helper function to extract content from text using pattern matching
  const extractContentFromText = (text: string, slideCount: number) => {
    const slides = []
    
    // Look for common patterns in AI responses based on the new JSON structure
    const patterns = {
      topLine: /"top_line":\s*"([^"]+)"/,
      mainHeading: /"main_heading":\s*"([^"]+)"/,
      bullet: /"bullet":\s*"([^"]+)"/,
      heading: /"heading":\s*"([^"]+)"/,
      bullets: /"bullets":\s*\[([^\]]+)\]/,
      tagline: /"tagline":\s*"([^"]+)"/,
      finalHeading: /"final_heading":\s*"([^"]+)"/,
      lastBullet: /"last_bullet":\s*"([^"]+)"/,
    }
    
    console.log('Pattern matching for content extraction...')
    
    // Extract first slide content (must have top_line, main_heading, bullet)
    const topLine = text.match(patterns.topLine)?.[1]
    const mainHeading = text.match(patterns.mainHeading)?.[1]
    const bullet = text.match(patterns.bullet)?.[1]
    
    console.log('First slide patterns found:', { topLine, mainHeading, bullet })
    
    // Also try to extract from alternative patterns that might be used
    const alternativeHeading = text.match(/"heading":\s*"([^"]+)"/)?.[1]
    const alternativeTitle = text.match(/"title":\s*"([^"]+)"/)?.[1]
    const alternativeSubtitle = text.match(/"subtitle":\s*"([^"]+)"/)?.[1]
    
    console.log('Alternative patterns found:', { alternativeHeading, alternativeTitle, alternativeSubtitle })
    
    if (topLine || mainHeading || bullet || alternativeHeading || alternativeTitle || alternativeSubtitle) {
      const firstSlide = {
        top_line: cleanContent(topLine || '') || cleanContent(alternativeHeading || '') || `Master ${aiForm.topic}`,
        main_heading: cleanContent(mainHeading || '') || cleanContent(alternativeTitle || '') || "Complete Guide",
        bullet: cleanContent(bullet || '') || cleanContent(alternativeSubtitle || '') || "Everything you need to know",
      }
      slides.push(firstSlide)
      console.log('Added first slide:', firstSlide)
    }
    
    // Extract middle slides content (must have heading and bullets array)
    const headingMatches = text.match(/"heading":\s*"([^"]+)"/g)
    const bulletsMatches = text.match(/"bullets":\s*\[([^\]]+)\]/g)
    
    console.log('Middle slides patterns found:', { headingMatches, bulletsMatches })
    
    if (headingMatches && bulletsMatches) {
      const middleSlideCount = Math.min(headingMatches.length, bulletsMatches.length, slideCount - 2)
      
      for (let i = 0; i < middleSlideCount; i++) {
        const heading = headingMatches[i]?.match(/"heading":\s*"([^"]+)"/)?.[1]
        const bulletsText = bulletsMatches[i]?.match(/"bullets":\s*\[([^\]]+)\]/)?.[1]
        
        if (heading && bulletsText) {
          // Parse bullets array - extract text between quotes
          const bullets = bulletsText.match(/"([^"]+)"/g)?.map(b => cleanContent(b.replace(/"/g, ''))) || []
          
          slides.push({
            heading: cleanContent(heading || ''),
            bullets: bullets.length > 0 ? bullets : ["Important insight", "Key takeaway", "Valuable information"]
          })
          console.log(`Added middle slide ${i + 1}:`, { heading: cleanContent(heading || ''), bullets })
        }
      }
    }
    
    // Extract last slide content (must have tagline, final_heading, last_bullet)
    const tagline = text.match(patterns.tagline)?.[1]
    const finalHeading = text.match(patterns.finalHeading)?.[1]
    const lastBullet = text.match(patterns.lastBullet)?.[1]
    
    console.log('Last slide patterns found:', { tagline, finalHeading, lastBullet })
    
    if (tagline || finalHeading || lastBullet) {
      slides.push({
        tagline: cleanContent(tagline || '') || "Ready to Excel?",
        final_heading: cleanContent(finalHeading || '') || "Take Action Today",
        last_bullet: cleanContent(lastBullet || '') || "Start your journey now",
      })
      console.log('Added last slide:', slides[slides.length - 1])
    }
    
    console.log('Total slides extracted:', slides.length)
    
    // Ensure we have the right number of slides
    while (slides.length < slideCount) {
      const middleIndex = Math.floor(slides.length / 2)
      slides.splice(middleIndex, 0, {
        heading: `Additional Point ${slides.length}`,
        bullets: ["Important insight", "Key takeaway", "Valuable information"]
      })
    }
    
    return slides.slice(0, slideCount)
  }

  // Helper function to parse AI-generated content into slide structure
  const parseAIContentToSlides = (aiContent: string, slideCount: number) => {
    console.log('=== Starting content parsing ===')
    console.log('Input content:', aiContent)
    console.log('Requested slide count:', slideCount)
    try {
      // First, try to parse as JSON
      const jsonMatch = aiContent.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        const jsonContent = jsonMatch[0]
        console.log('Found JSON content:', jsonContent)
        
        try {
          const parsed = JSON.parse(jsonContent)
          console.log('Parsed JSON:', parsed)
          console.log('JSON structure validation:', {
            hasSlides: 'slides' in parsed,
            slidesIsArray: Array.isArray(parsed.slides),
            slidesLength: parsed.slides?.length,
            firstSlide: parsed.slides?.[0],
            firstSlideKeys: parsed.slides?.[0] ? Object.keys(parsed.slides[0]) : []
          })
        
                  if (parsed.slides && Array.isArray(parsed.slides)) {
            console.log('Processing slides from JSON:', parsed.slides)
            
            // Validate JSON structure
            const validation = validateSlideStructure(parsed.slides, slideCount)
            if (!validation.isValid) {
              console.warn('JSON structure validation failed:', validation.errors)
              // Continue with fallback parsing
            } else {
              console.log('JSON structure validation passed')
            }
            
            const slides = []
            
            // Process each slide based on its structure (no type field in this format)
            for (let i = 0; i < Math.min(parsed.slides.length, slideCount); i++) {
              const slide = parsed.slides[i]
              console.log(`Processing slide ${i}:`, slide)
              console.log(`Slide ${i} keys:`, Object.keys(slide))
              console.log(`Slide ${i} raw values:`, {
                top_line: slide.top_line,
                main_heading: slide.main_heading,
                bullet: slide.bullet,
                heading: slide.heading,
                title: slide.title,
                subtitle: slide.subtitle
              })
              
              if (i === 0) {
                // First slide (title slide) - must have top_line, main_heading, bullet
                const firstSlide = {
                  top_line: cleanContent(slide.top_line) || cleanContent(slide.heading) || `Master ${aiForm.topic}`,
                  main_heading: cleanContent(slide.main_heading) || cleanContent(slide.title) || "Complete Guide",
                  bullet: cleanContent(slide.bullet) || cleanContent(slide.subtitle) || "Everything you need to know",
                }
                console.log('Created first slide:', firstSlide)
                slides.push(firstSlide)
              } else if (i === slideCount - 1) {
                // Last slide (call to action) - must have tagline, final_heading, last_bullet
                const lastSlide = {
                  tagline: cleanContent(slide.tagline) || "Ready to Excel?",
                  final_heading: cleanContent(slide.final_heading) || "Take Action Today",
                  last_bullet: cleanContent(slide.last_bullet) || "Start your journey now",
                }
                console.log('Created last slide:', lastSlide)
                slides.push(lastSlide)
              } else {
                // Middle slides - must have heading and bullets array
                const middleSlide = {
                  heading: cleanContent(slide.heading) || `Key Point ${i}`,
                  bullets: Array.isArray(slide.bullets) ? slide.bullets.map(cleanContent) : ["Important insight", "Key takeaway", "Valuable information"]
                }
                console.log('Created middle slide:', middleSlide)
                slides.push(middleSlide)
              }
            }
            
            console.log('Generated slides from JSON:', slides)
            
            // Ensure we have exactly the requested number of slides
            while (slides.length < slideCount) {
              const middleIndex = Math.floor(slides.length / 2)
              slides.splice(middleIndex, 0, {
                heading: `Additional Point ${slides.length}`,
                bullets: ["Important insight", "Key takeaway", "Valuable information"]
              })
            }
            
            return slides.slice(0, slideCount)
          } else {
            console.warn('JSON parsed but no slides array found:', parsed)
          }
        } catch (jsonError) {
          console.error('Error parsing JSON content:', jsonError)
        }
      }
      
      // Fallback: parse as text if JSON parsing fails
      console.warn('JSON parsing failed, falling back to text parsing')
      
      // Try to extract content from the AI response even if it's not perfect JSON
      const contentLines = aiContent.split('\n').filter(line => line.trim().length > 0)
      console.log('Content lines for fallback parsing:', contentLines)
      
      // Try to extract content using pattern matching
      const extractedContent = extractContentFromText(aiContent, slideCount)
      if (extractedContent.length > 0) {
        console.log('Successfully extracted content using pattern matching:', extractedContent)
        return extractedContent
      }
      
      const lines = aiContent.split('\n').filter(line => line.trim().length > 0)
      const slides = []
      
      // Clean and structure the content
      const cleanLines = lines.map(line => line.trim()).filter(line => line.length > 0)
      
      // Validate that we have enough content
      if (cleanLines.length < 3) {
        throw new Error('AI generated content is too short. Please try again with a different topic.')
      }
      
      // First slide (title slide) - look for title-like content
      const titleSlide = {
        top_line: cleanLines.find(line => line.length < 15) || `Master ${aiForm.topic}`,
        main_heading: cleanLines.find(line => line.length > 10 && line.length < 25) || "Complete Guide",
        bullet: cleanLines.find(line => line.length > 15 && line.length < 35) || "Everything you need to know",
      }
      slides.push(titleSlide)
      
      // Middle slides - look for heading + bullet patterns
      const middleSlideCount = slideCount - 2
      let currentIndex = 3
      
      for (let i = 0; i < middleSlideCount; i++) {
        // Find a good heading (short, clear)
        const heading = cleanLines.find((line, idx) => 
          idx >= currentIndex && line.length < 20 && 
          !line.toLowerCase().includes('bullet') && 
          !line.toLowerCase().includes('point')
        ) || `Key Point ${i + 1}`
        
        // Update current index to after the heading
        const headingIndex = cleanLines.findIndex((line, idx) => 
          idx >= currentIndex && line === heading
        )
        currentIndex = headingIndex >= 0 ? headingIndex + 1 : currentIndex + 1
        
        const bullets = []
        
        // Extract up to 3 bullet points (look for longer lines that could be bullets)
        for (let j = 0; j < 3; j++) {
          const bulletLine = cleanLines.find((line, idx) => 
            idx >= currentIndex && line.length > 15 && line.length < 50
          )
          
          if (bulletLine) {
            bullets.push(bulletLine)
            currentIndex = cleanLines.findIndex((line, idx) => 
              idx >= currentIndex && line === bulletLine
            ) + 1
          } else {
            break
          }
        }
        
        // Fill with default bullets if not enough content
        while (bullets.length < 3) {
          bullets.push(`Important point ${bullets.length + 1}`)
          }
        
        slides.push({
          heading,
          bullets
        })
      }
      
      // Last slide (call to action) - look for action-oriented content
      const actionLines = cleanLines.filter(line => 
        line.toLowerCase().includes('action') || 
        line.toLowerCase().includes('start') || 
        line.toLowerCase().includes('ready') ||
        line.toLowerCase().includes('today')
      )
      
      const lastSlide = {
        tagline: actionLines[0] || "Ready to Excel?",
        final_heading: actionLines[1] || "Take Action Today",
        last_bullet: actionLines[2] || "Start your journey now",
      }
      
      slides.push(lastSlide)
      
      // Validate final structure
      if (slides.length !== slideCount) {
        console.warn(`Expected ${slideCount} slides, but got ${slides.length}. Adjusting...`)
        // Adjust the number of slides if needed
        while (slides.length < slideCount) {
          const middleIndex = Math.floor(slides.length / 2)
          slides.splice(middleIndex, 0, {
            heading: `Additional Point ${slides.length}`,
            bullets: ["Important insight", "Key takeaway", "Valuable information"]
          })
        }
        while (slides.length > slideCount) {
          slides.pop()
        }
      }
      
      return slides
      
    } catch (error) {
      console.error('Error parsing AI content:', error)
      // Return default slides if all parsing fails
      const defaultSlides = []
      
      // First slide
      defaultSlides.push({
        top_line: `Master ${aiForm.topic}`,
        main_heading: "Complete Guide",
        bullet: "Everything you need to know",
      })
      
      // Middle slides
      for (let i = 0; i < slideCount - 2; i++) {
        defaultSlides.push({
          heading: `Key Point ${i + 1}`,
          bullets: ["Important insight", "Key takeaway", "Valuable information"]
        })
      }
      
      // Last slide
      defaultSlides.push({
        tagline: "Ready to Excel?",
        final_heading: "Take Action Today",
        last_bullet: "Start your journey now",
      })
      
      return defaultSlides
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
    setGenerationAttempts(prev => prev + 1)

    try {
      // Call the AI API to generate carousel content
      const response = await fetch('/api/ai/generate-carousel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          topic: aiForm.topic, 
          tone: aiForm.tone, 
          slideCount: aiForm.slideCount,
          style: aiForm.style
        })
      })

      if (!response.ok) {
        throw new Error('Failed to generate carousel content')
      }

      const data = await response.json()
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to generate carousel content')
      }
      
      if (!data.content || !Array.isArray(data.content) || data.content.length === 0) {
        throw new Error('AI service returned empty or invalid content')
      }

      // Parse the AI-generated content and structure it for slides
      const aiContent = data.content[0] // Use the first generated variation
      
      // Store the raw content for debugging
      setLastGeneratedContent(aiContent)
      
            // Debug: Log the AI response
      console.log('AI Generated Content:', aiContent)
      console.log('Content type:', typeof aiContent)
      console.log('Content length:', aiContent?.length)
      
      // Extract slide content from AI response
      const parsedSlides = parseAIContentToSlides(aiContent, aiForm.slideCount)
      
      // Debug: Log the parsed slides
      console.log('Parsed Slides:', parsedSlides)
      
      // Debug: Check the structure of each slide
      parsedSlides.forEach((slide, index) => {
        console.log(`Slide ${index} structure:`, {
          hasTopLine: 'top_line' in slide,
          hasMainHeading: 'main_heading' in slide,
          hasBullet: 'bullet' in slide,
          hasHeading: 'heading' in slide,
          hasBullets: 'bullets' in slide,
          hasTagline: 'tagline' in slide,
          hasFinalHeading: 'final_heading' in slide,
          hasLastBullet: 'last_bullet' in slide,
          slideData: slide
        })
      })
      
      // Validate that we have slides to work with
      if (!parsedSlides || parsedSlides.length === 0) {
        throw new Error('Failed to parse AI content into slides. Please try again.')
      }
      
      // Generate a single background image and title color for all slides
      const singleBackgroundImage = getRandomBackgroundImage()
      const titleAccentColor = getRandomTitleColor()
      const template = designTemplates[0] // Default template (Open Sans)
      
      const slides: CarouselSlide[] = parsedSlides.map((slideData, index) => {
        const isFirst = index === 0
        const isLast = index === parsedSlides.length - 1

        return {
          id: (index + 1).toString(),
          type: isFirst ? "first" : isLast ? "last" : "middle",
          content: slideData,
          design: {
            fontSize: isFirst ? 41 : 29,
            fontFamily: template.fontFamily,
            textColor: "#FFFFFF", // White text for better contrast on backgrounds
            backgroundColor: "#ffffff",
            backgroundType: "image",
            backgroundImage: singleBackgroundImage, // Use the same background for all slides
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
        titleAccentColor,
      }

      setCurrentProject(newProject)
      setCurrentSlideIndex(0)

      toast({
        title: "Carousel Generated!",
        description: `Created a ${parsedSlides.length}-slide carousel about ${aiForm.topic} using AI.`,
      })
    } catch (error) {
      console.error('Carousel generation error:', error)
      
      let errorMessage = "Failed to generate carousel. Please try again."
      if (error instanceof Error) {
        if (error.message.includes('Failed to parse AI content')) {
          errorMessage = "AI generated content couldn't be parsed. Try a different topic or regenerate."
        } else if (error.message.includes('AI service returned empty')) {
          errorMessage = "AI service returned empty content. Please try again."
        } else {
          errorMessage = error.message
        }
      }
      
      toast({
        title: "Generation Failed",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const createNewProject = () => {
    const template = designTemplates[0] // Default template (Open Sans)
    const singleBackground = getRandomBackgroundImage()
    const titleAccentColor = getRandomTitleColor()
    const newProject: CarouselProject = {
      id: Date.now().toString(),
      title: "Untitled Carousel",
      topic: "",
      tone: "professional",
      createdAt: new Date(),
      aspectRatio: "1:1",
      branding: "both",
      elements: [],
      titleAccentColor,
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
            fontSize: 35,
            fontFamily: template.fontFamily,
            textColor: "#FFFFFF", // White text for better contrast on backgrounds
            backgroundColor: "#ffffff",
            backgroundType: "image",
            backgroundImage: singleBackground, // Use single background for consistency
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
    // Use the same background as existing slides for consistency
    const existingBackground = currentSlide?.design.backgroundImage || getRandomBackgroundImage()
    
    const newSlide: CarouselSlide = {
      id: Date.now().toString(),
      type: "middle",
      content: {
        heading: "New Slide",
        bullets: ["Point 1", "Point 2", "Point 3"],
      },
      design: {
        fontSize: 27,
        fontFamily: template.fontFamily,
        textColor: "#FFFFFF", // White text for better contrast on backgrounds
        backgroundColor: "#ffffff",
        backgroundType: currentSlide?.design.backgroundType || "color",
        backgroundImage: existingBackground, // Use existing background for consistency
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
      await new Promise((resolve) => setTimeout(resolve, 200)) // Allow render

      if (slideCanvasRef.current) {
        const imageDataUrl = await captureSlideAsImage(slideCanvasRef.current)
        images.push(imageDataUrl)
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
      await new Promise((resolve) => setTimeout(resolve, 200))

      if (slideCanvasRef.current) {
        const imageDataUrl = await captureSlideAsImage(slideCanvasRef.current)
        
        if (i > 0) pdf.addPage()

        // Convert data URL to image dimensions
        const img = new Image()
        img.src = imageDataUrl
        
        // Wait for image to load to get dimensions
        await new Promise((resolve) => {
          img.onload = () => {
            const imgWidth = 190
            const imgHeight = (img.height * imgWidth) / img.width
            pdf.addImage(imageDataUrl, "PNG", 10, 10, imgWidth, imgHeight)
            resolve(void 0)
          }
        })
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


  // Alternative function to capture slide as image using dom-to-image
  const captureSlideAsImage = async (element: HTMLElement): Promise<string> => {
    try {
      // Use dom-to-image which handles modern CSS colors better
      // Capture at higher resolution for better LinkedIn quality
      const dataUrl = await domtoimage.toPng(element, {
        quality: 0.95,
        bgcolor: '#ffffff',
        width: element.offsetWidth * 2, // 2x resolution for better quality
        height: element.offsetHeight * 2,
        style: {
          transform: 'scale(2)',
          transformOrigin: 'top left',
          width: element.offsetWidth + 'px',
          height: element.offsetHeight + 'px'
        }
      })
      return dataUrl
    } catch (error) {
      console.warn('dom-to-image failed, falling back to html2canvas:', error)
      // Fallback to html2canvas with proper scaling
      try {
        const canvas = await html2canvas(element, {
          backgroundColor: '#ffffff',
          scale: 2, // 2x scale for better quality
          useCORS: true,
          allowTaint: true,
          logging: false
        })
        return canvas.toDataURL("image/jpeg", 0.95)
      } catch (fallbackError) {
        console.error('Both dom-to-image and html2canvas failed:', fallbackError)
        throw new Error('Failed to capture slide image')
      }
    }
  }

  const postToLinkedInWithImages = async () => {
    if (!currentProject) return

    try {
      // Convert all slides to images
      const images: string[] = []

      for (let i = 0; i < currentProject.slides.length; i++) {
        setCurrentSlideIndex(i)
        await new Promise((resolve) => setTimeout(resolve, 200)) // Give more time for render

        if (slideCanvasRef.current) {
          const imageDataUrl = await captureSlideAsImage(slideCanvasRef.current)
          images.push(imageDataUrl)
        }
      }

      // Call the actual LinkedIn posting API
      const result = await postToLinkedIn({
        content: linkedInCaption,
        images: images
      })

      if (result.success) {
        toast({
          title: "Posted to LinkedIn!",
          description: `Successfully posted carousel with ${images.length} slides.`,
        })
        setShowLinkedInModal(false)
      } else {
        throw new Error("Failed to post to LinkedIn")
      }
    } catch (error) {
      console.error("LinkedIn posting error:", error)
      toast({
        title: "Posting Failed",
        description: error instanceof Error ? error.message : "Failed to post to LinkedIn. Please try again.",
        variant: "destructive",
      })
    }
  }

  // Helper function to render title with first word colored
  const renderColoredTitle = (title: string, accentColor: string) => {
    if (!title) return null
    
    const words = title.split(' ')
    if (words.length === 0) return null
    
    const firstWord = words[0]
    const remainingWords = words.slice(1).join(' ')
    
    return (
      <>
        <span style={{ color: accentColor }}>{firstWord}</span>
        {remainingWords && <span> {remainingWords}</span>}
      </>
    )
  }

  const renderSlideContent = (slide: CarouselSlide) => {
    const { content, design } = slide

    return (
      <div
        className="w-full h-full flex flex-col justify-center items-center p-4 sm:p-6 md:p-8 relative"
        style={{
          fontFamily: design.fontFamily,
          color: design.textColor,
          paddingTop: "0px",
          textShadow: design.backgroundType === "image" && overlayOpacity > 0 ? "0 2px 4px rgba(0,0,0,0.8)" : "none"
        }}
        data-font-family={design.fontFamily}
      >
        {slide.type === "first" && (
          <>
            {content.top_line && (
              <div
                className="text-sm opacity-80 mb-2 self-center text-left w-full"
                onClick={() => setEditingText("top_line")}
                style={{ 
                  fontSize: "clamp(18px, 4vw, 25px)",
                  marginTop: "-10px",
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
                    style={{ minHeight: "23px", lineHeight: "1.2", fontFamily: design.fontFamily }}
                    autoFocus
                  />
                ) : (
                  <div className="whitespace-pre-wrap break-words">{content.top_line}</div>
                )}
              </div>
            )}
            {content.main_heading && (
              <h1
                className="font-bold mb-4 leading-tight self-center text-left w-full"
                onClick={() => setEditingText("main_heading")}
                style={{ 
                  fontSize: "clamp(28px, 6vw, 40px)",
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
                    style={{ minHeight: "38px", lineHeight: "1.2", fontFamily: design.fontFamily }}
                    autoFocus
                  />
                ) : (
                  <span className="whitespace-pre-wrap break-words">
                    {renderColoredTitle(content.main_heading, currentProject?.titleAccentColor || "#FFFFFF")}
                  </span>
                )}
              </h1>
            )}
            {content.bullet && (
              <div className="text-lg self-center text-left w-full break-words" onClick={() => setEditingText("bullet")} style={{ fontSize: "clamp(18px, 4vw, 23px)", fontFamily: design.fontFamily }}>
                {editingText === "bullet" ? (
                  <textarea
                    value={content.bullet}
                    onChange={(e) => handleTextEdit("bullet", e.target.value)}
                    onBlur={() => setEditingText(null)}
                    onKeyDown={(e) => e.key === "Enter" && setEditingText(null)}
                    className="bg-transparent border-b border-current outline-none text-left w-full resize-none overflow-hidden"
                    style={{ minHeight: "21px", lineHeight: "1.2", fontFamily: design.fontFamily }}
                    autoFocus
                  />
                ) : (
                  <div className="whitespace-pre-wrap break-words">{content.bullet}</div>
                )}
              </div>
            )}
          </>
        )}

        {slide.type === "middle" && (
          <>
            {content.heading && (
              <h2
                className="font-bold mb-6 leading-tight self-center text-left w-full break-words"
                onClick={() => setEditingText("heading")}
                style={{ fontSize: `clamp(20px, 5vw, ${design.fontSize + 5}px)`, fontFamily: design.fontFamily }}
              >
                {editingText === "heading" ? (
                  <textarea
                    value={content.heading}
                    onChange={(e) => handleTextEdit("heading", e.target.value)}
                    onBlur={() => setEditingText(null)}
                    onKeyDown={(e) => e.key === "Enter" && setEditingText(null)}
                    className="bg-transparent border-b border-current outline-none text-left w-full resize-none overflow-hidden"
                    style={{ minHeight: "27px", lineHeight: "1.2", fontFamily: design.fontFamily }}
                    autoFocus
                  />
                ) : (
                  <span className="whitespace-pre-wrap break-words">
                    {renderColoredTitle(content.heading, currentProject?.titleAccentColor || "#FFFFFF")}
                  </span>
                )}
              </h2>
            )}
            {content.bullets && (
              <ul className="space-y-3 text-left w-full px-5">
                {content.bullets.map((bullet, index) => (
                  <li
                    key={index}
                    className="flex items-center justify-start gap-2"
                    onClick={() => setEditingText(`bullet_${index}`)}
                    style={{ fontSize: "clamp(16px, 3.5vw, 21px)", fontFamily: design.fontFamily }}
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
                        className="bg-transparent border-b border-current outline-none flex-1 resize-none overflow-hidden text-left"
                        style={{ minHeight: "19px", lineHeight: "1.2", fontFamily: design.fontFamily }}
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
                className="text-sm opacity-80 mb-2 self-center text-left w-full break-words"
                onClick={() => setEditingText("tagline")}
                style={{ fontSize: "clamp(16px, 3vw, 19px)", fontFamily: design.fontFamily }}
              >
                {editingText === "tagline" ? (
                  <textarea
                    value={content.tagline}
                    onChange={(e) => handleTextEdit("tagline", e.target.value)}
                    onBlur={() => setEditingText(null)}
                    onKeyDown={(e) => e.key === "Enter" && setEditingText(null)}
                    className="bg-transparent border-b border-current outline-none text-left w-full resize-none overflow-hidden"
                    style={{ minHeight: "17px", lineHeight: "1.2", fontFamily: design.fontFamily }}
                    autoFocus
                  />
                ) : (
                  <div className="whitespace-pre-wrap break-words">{content.tagline}</div>
                )}
              </div>
            )}
            {content.final_heading && (
              <h1
                className="font-bold mb-4 leading-tight self-center text-left w-full break-words"
                onClick={() => setEditingText("final_heading")}
                style={{ fontSize: `clamp(20px, 5vw, ${design.fontSize + 5}px)`, fontFamily: design.fontFamily }}
              >
                {editingText === "final_heading" ? (
                  <textarea
                    value={content.final_heading}
                    onChange={(e) => handleTextEdit("final_heading", e.target.value)}
                    onBlur={() => setEditingText(null)}
                    onKeyDown={(e) => e.key === "Enter" && setEditingText(null)}
                    className="bg-transparent border-b border-current outline-none text-left w-full resize-none overflow-hidden"
                    style={{ minHeight: "27px", lineHeight: "1.2", fontFamily: design.fontFamily }}
                    autoFocus
                  />
                ) : (
                  <span className="whitespace-pre-wrap break-words">
                    {renderColoredTitle(content.final_heading, currentProject?.titleAccentColor || "#FFFFFF")}
                  </span>
                )}
              </h1>
            )}
            {content.last_bullet && (
              <div className="text-lg self-center text-left w-full break-words" onClick={() => setEditingText("last_bullet")} style={{ fontSize: "clamp(18px, 4vw, 23px)", fontFamily: design.fontFamily }}>
                {editingText === "last_bullet" ? (
                  <textarea
                    value={content.last_bullet}
                    onChange={(e) => handleTextEdit("last_bullet", e.target.value)}
                    onBlur={() => setEditingText(null)}
                    onKeyDown={(e) => e.key === "Enter" && setEditingText(null)}
                    className="bg-transparent border-b border-current outline-none text-left w-full resize-none overflow-hidden"
                    style={{ minHeight: "21px", lineHeight: "1.2", fontFamily: design.fontFamily }}
                    autoFocus
                  />
                ) : (
                  <div className="whitespace-pre-wrap break-words">{content.last_bullet}</div>
                )}
              </div>
            )}
          </>
        )}

        {/* Interactive Elements - Display on all slides except last */}
        {currentProject?.elements && currentProject.elements.length > 0 && slide.type !== "last" && (
          <div className="absolute bottom-12 sm:bottom-16 right-4 sm:right-8">
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
          <div className="absolute bottom-2 sm:bottom-4 left-4 sm:left-8 right-4 sm:right-8">
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
      <div className={`flex-1 space-y-4 p-2 sm:p-4 pt-4 sm:pt-6 ${openSans.variable} ${montserrat.variable} ${lato.variable} ${poppins.variable} ${roboto.variable} ${inter.variable} ${dancingScript.variable} ${bebasNeue.variable} ${righteous.variable}`}>
        {/* Header */}
        <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
          <div className="space-y-2">
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
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">AI Carousel Generator</h2>
            <p className="text-sm sm:text-base text-muted-foreground">Create engaging LinkedIn carousels with AI or design from scratch</p>
          </div>
        </div>

      {!currentProject ? (
        <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
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
                  maxLength={100}
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Keep it concise for better AI generation</span>
                  <span>{aiForm.topic.length}/100</span>
                </div>
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

              {/* Preview of what will be generated */}
            

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
              
              {generationAttempts > 0 && !isGenerating && (
                <Button 
                  onClick={generateAICarousel} 
                  variant="outline" 
                  className="w-full" 
                  size="sm"
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  Try Again
                </Button>
              )}
              
            
              
              {/* Show Raw Content Toggle */}
              {lastGeneratedContent && (
                <div className="space-y-2">
                  <Button 
                    onClick={() => setShowRawContent(!showRawContent)} 
                    variant="outline" 
                    className="w-full" 
                    size="sm"
                  >
                    {showRawContent ? 'Hide' : 'Show'} Raw AI Content
                  </Button>
                  
                  {showRawContent && (
                    <div className="p-3 bg-muted/50 rounded-lg">
                      <div className="text-xs text-muted-foreground mb-2">Raw AI Response:</div>
                      <pre className="text-xs overflow-auto max-h-32 bg-background p-2 rounded border">
                        {lastGeneratedContent}
                      </pre>
                    </div>
                  )}
                </div>
              )}
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
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Slide Preview */}
          <div className="xl:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
                  <CardTitle className="flex items-center gap-2">
                    <Eye className="w-5 h-5 text-primary" />
                    <span className="truncate">{currentProject.title}</span>
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Button onClick={() => setCurrentProject(null)} variant="outline" size="sm" className="flex-shrink-0">
                      <ChevronLeft className="w-4 h-4 mr-2" />
                      <span className="hidden sm:inline">Back</span>
                    </Button>
                    <Button onClick={() => setShowPreviewModal(true)} variant="outline" size="sm" className="flex-shrink-0">
                      <Eye className="w-4 h-4 mr-2" />
                      <span className="hidden sm:inline">Preview All</span>
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
                    className="flex-shrink-0"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>

                  <div className="flex items-center gap-1 sm:gap-2 overflow-x-auto px-2">
                    {currentProject.slides.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentSlideIndex(index)}
                        className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full text-xs font-medium transition-colors flex-shrink-0 ${
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
                    className="flex-shrink-0"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>

                {currentSlide && (
                  <div className="relative flex justify-center">
                    <div
                      ref={slideCanvasRef}
                      className="rounded-lg relative overflow-hidden cursor-pointer carousel-slide w-full max-w-sm sm:max-w-md md:max-w-lg"
                      style={{
                        width: currentProject.aspectRatio === "1:1" ? "min(500px, 100%)" : "min(400px, 100%)",
                        height: currentProject.aspectRatio === "1:1" ? "min(500px, 100vw)" : "min(711px, 100vw * 1.78)",
                        aspectRatio: currentProject.aspectRatio === "1:1" ? "1/1" : "9/16",
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
                <div className="flex flex-col space-y-4 mt-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
                  <div className="flex gap-2 flex-wrap">
                    <Button onClick={addSlide} variant="outline" size="sm" className="flex-shrink-0">
                      <Plus className="w-4 h-4 mr-2" />
                      <span className="hidden sm:inline">Add Slide</span>
                      <span className="sm:hidden">Add</span>
                    </Button>
                    <Button
                      onClick={() => removeSlide(currentSlideIndex)}
                      disabled={currentProject.slides.length <= 1}
                      variant="outline"
                      size="sm"
                      className="flex-shrink-0"
                    >
                      <Minus className="w-4 h-4 mr-2" />
                      <span className="hidden sm:inline">Remove</span>
                    </Button>
                  </div>

                  <div className="flex gap-2 flex-wrap">
                    <Button onClick={exportAllAsJPEG} variant="outline" size="sm" className="flex-shrink-0">
                      <FileImage className="w-4 h-4 mr-2" />
                      <span className="hidden sm:inline">Export JPEG</span>
                      <span className="sm:hidden">JPEG</span>
                    </Button>
                    <Button onClick={exportAsPDF} variant="outline" size="sm" className="flex-shrink-0">
                      <FileText className="w-4 h-4 mr-2" />
                      <span className="hidden sm:inline">Export PDF</span>
                      <span className="sm:hidden">PDF</span>
                    </Button>
                    <Button onClick={openLinkedInModal} size="sm" className="flex-shrink-0">
                      <Linkedin className="w-4 h-4 mr-2" />
                      <span className="hidden sm:inline">Post to LinkedIn</span>
                      <span className="sm:hidden">LinkedIn</span>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Editing Panel */}
          <div className="space-y-4 order-first xl:order-last">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="w-5 h-5 text-primary" />
                  Design & Layout
                </CardTitle>
              </CardHeader>
              <CardContent>
                        <Tabs defaultValue="background" className="w-full">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4">
            <TabsTrigger value="background" className="text-xs sm:text-sm">Background</TabsTrigger>
            <TabsTrigger value="layout" className="text-xs sm:text-sm">Layout</TabsTrigger>
            <TabsTrigger value="fonts" className="text-xs sm:text-sm">Fonts</TabsTrigger>
            <TabsTrigger value="elements" className="text-xs sm:text-sm">Elements</TabsTrigger>
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
                      <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
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
                      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
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
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
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
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
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

        {/* LinkedIn Posting Modal */}
        <Dialog open={showLinkedInModal} onOpenChange={setShowLinkedInModal}>
          <DialogContent className="max-w-2xl mx-4 sm:mx-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Linkedin className="w-5 h-5 text-blue-600" />
                Post Carousel to LinkedIn
              </DialogTitle>
              <DialogDescription>
                Review your carousel content and add a caption before posting to LinkedIn.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              {/* Carousel Preview */}
              <div className="space-y-2">
                <Label>Carousel Preview</Label>
                <div className="flex gap-2 overflow-x-auto p-2 bg-muted/50 rounded-lg">
                  {currentProject?.slides.map((slide, index) => (
                    <div
                      key={slide.id}
                      className="flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded border overflow-hidden"
                      style={{
                        backgroundColor: slide.design.backgroundType === "color" ? slide.design.backgroundColor : "transparent",
                        backgroundImage:
                          slide.design.backgroundType === "image" && slide.design.backgroundImage
                            ? `url(${slide.design.backgroundImage})`
                            : undefined,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                      }}
                    >
                      <div className="w-full h-full flex items-center justify-center text-xs font-bold text-white bg-black/50">
                        {index + 1}
                      </div>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">
                  {currentProject?.slides.length} slide{currentProject?.slides.length !== 1 ? 's' : ''} will be posted as images
                </p>
              </div>

              {/* Caption Input */}
              <div className="space-y-2">
                <Label htmlFor="linkedin-caption">Caption</Label>
                <Textarea
                  id="linkedin-caption"
                  value={linkedInCaption}
                  onChange={(e) => setLinkedInCaption(e.target.value)}
                  placeholder="Write your LinkedIn post caption..."
                  className="min-h-32"
                  maxLength={3000}
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>LinkedIn character limit: 3000</span>
                  <span>{linkedInCaption.length}/3000</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row justify-end gap-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setShowLinkedInModal(false)}
                  disabled={isPosting}
                  className="w-full sm:w-auto"
                >
                  Cancel
                </Button>
                <Button
                  onClick={postToLinkedInWithImages}
                  disabled={isPosting || !linkedInCaption.trim()}
                  className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto"
                >
                  {isPosting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Posting...
                    </>
                  ) : (
                    <>
                      <Linkedin className="w-4 h-4 mr-2" />
                      Post to LinkedIn
                    </>
                  )}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </>
  )
}