import { type NextRequest, NextResponse } from "next/server"
// @ts-ignore
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { aiService, type ContentType, type AIProvider, type CustomizationOptions } from "@/lib/ai-service"

export async function POST(request: NextRequest) {
  try {
    // Get user session for authentication and credit management
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    const body = await request.json()
    const {
      type,
      prompt,
      provider = "openai", // Changed default to OpenAI
      customization = {},
      priority = "normal"
    } = body

    // Validate required fields
    if (!type || !prompt) {
      return NextResponse.json({ 
        error: "Type and prompt are required",
        required: ["type", "prompt"],
        optional: ["provider", "customization", "priority"]
      }, { status: 400 })
    }

    // Validate content type
    const validTypes: ContentType[] = [
      "linkedin-post", "article", "topics", "carousel", 
      "story", "list", "quote", "before-after", "tips", "insights", "question"
    ]
    
    if (!validTypes.includes(type)) {
      return NextResponse.json({ 
        error: "Invalid content type",
        validTypes,
        received: type
      }, { status: 400 })
    }

    // Validate AI provider (OpenAI and Perplexity supported)
    const validProviders: AIProvider[] = ["openai", "perplexity"]
    if (!validProviders.includes(provider)) {
      return NextResponse.json({ 
        error: "Invalid AI provider",
        supportedProviders: validProviders,
        received: provider
      }, { status: 400 })
    }

    // Check credits before processing (if not in trial)
    try {
      const creditResponse = await fetch(`${request.nextUrl.origin}/api/billing/credits`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Cookie": request.headers.get("cookie") || ""
        }
      })

      if (creditResponse.ok) {
        const creditData = await creditResponse.json()
        const requiredCredits = getRequiredCredits(type, provider)
        
        if (!creditData.isTrialActive && creditData.credits < requiredCredits) {
          return NextResponse.json({ 
            error: "Insufficient credits",
            required: requiredCredits,
            available: creditData.credits,
            suggestion: "Please purchase more credits to continue"
          }, { status: 402 })
        }
      }
    } catch (creditError) {
      console.warn("Could not verify credits:", creditError)
      // Continue without credit check if it fails
    }

    // Get queue status for client information
    const queueStatus = aiService.getQueueStatus()

    // Generate content using the centralized AI service
    const response = await aiService.generateContent(
      type,
      prompt,
      provider,
      customization,
      session.user.email
    )

    // Deduct credits after successful generation
    try {
      const requiredCredits = getRequiredCredits(type, provider)
      await fetch(`${request.nextUrl.origin}/api/billing/credits`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Cookie": request.headers.get("cookie") || ""
        },
        body: JSON.stringify({ 
          action: "deduct", 
          amount: requiredCredits 
        })
      })
    } catch (creditError) {
      console.warn("Could not deduct credits:", creditError)
      // Don't fail the request if credit deduction fails
    }

    // Return success response with metadata
    return NextResponse.json({
      success: true,
      data: response,
      queue: queueStatus,
      message: `Successfully generated ${type} content using ${provider}`
    })

  } catch (error) {
    console.error("Error in unified AI generation API:", error)
    
    return NextResponse.json({ 
      error: "Failed to generate content",
      details: error instanceof Error ? error.message : "Unknown error",
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}

// Helper function to determine required credits based on content type and provider
function getRequiredCredits(type: ContentType, provider: AIProvider = "openai"): number {
  const baseCreditMap: Record<ContentType, number> = {
    "linkedin-post": 0.5,    // 6 posts
    "article": 0.3,          // Single article
    "topics": 0.1,           // Topic generation
    "carousel": 0.4,         // Multiple slides
    "story": 0.2,            // Single story
    "list": 0.2,             // List content
    "quote": 0.1,            // Quote content
    "before-after": 0.2,     // Before/after content
    "tips": 0.2,             // Tips content
    "insights": 0.2,         // Insights content
    "question": 0.1           // Question content
  }
  
  const baseCredits = baseCreditMap[type] || 0.2
  
  // Adjust credits based on provider (OpenAI is more expensive)
  if (provider === "openai") {
    return baseCredits * 1.5 // 50% more expensive than Perplexity
  } else {
    return baseCredits * 0.7 // Perplexity is cheaper
  }
}

// GET endpoint to check queue status
export async function GET(request: NextRequest) {
  try {
    const queueStatus = aiService.getQueueStatus()
    
    return NextResponse.json({
      success: true,
      queue: queueStatus,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error("Error getting queue status:", error)
    
    return NextResponse.json({ 
      error: "Failed to get queue status",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 })
  }
}
