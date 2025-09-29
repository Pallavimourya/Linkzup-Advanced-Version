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
      provider = "openai",
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

    // Validate AI provider
    const validProviders: AIProvider[] = ["openai", "perplexity"]
    if (!validProviders.includes(provider)) {
      return NextResponse.json({ 
        error: "Invalid AI provider",
        supportedProviders: validProviders,
        received: provider
      }, { status: 400 })
    }

    // Check credits before processing
    const actionType = `ai_${type}` // Use standard action type format
    
    try {
      const creditResponse = await fetch(`${request.nextUrl.origin}/api/credits/deduct`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Cookie": request.headers.get("cookie") || ""
        },
        body: JSON.stringify({ 
          actionType,
          description: `AI ${type} generation using ${provider}`
        })
      })

      if (!creditResponse.ok) {
        const errorData = await creditResponse.json()
        return NextResponse.json({ 
          error: errorData.error || "Insufficient credits",
          available: errorData.currentCredits || 0,
          suggestion: "Please purchase more credits to continue"
        }, { status: 402 })
      }
    } catch (creditError) {
      console.warn("Could not verify credits:", creditError)
      return NextResponse.json({ 
        error: "Credit verification failed",
        suggestion: "Please try again or contact support"
      }, { status: 500 })
    }

    // Get queue status for client information
    const queueStatus = aiService.getQueueStatus()

    // Generate unique content using the home tab method (NO personal story)
    const response = await aiService.generateUniqueContent(
      type,
      prompt,
      provider,
      customization,
      session.user.id
      // NO userEmail - this ensures no personal story integration
    )

    // Return success response with metadata
    return NextResponse.json({
      success: true,
      data: response,
      queue: queueStatus,
      message: `Successfully generated unique ${type} content using ${provider}`,
      approach: "unique_content" // Indicate this is unique content approach
    })

  } catch (error) {
    console.error("Error in unique content generation API:", error)
    
    return NextResponse.json({ 
      error: "Failed to generate unique content",
      details: error instanceof Error ? error.message : "Unknown error",
      timestamp: new Date().toISOString()
    }, { status: 500 })
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
