import { type NextRequest, NextResponse } from "next/server"
import { PersonalStoryService } from "@/lib/personal-story-service"
import { PersonalStoryContentService } from "@/lib/personal-story-content-service"
import { aiService } from "@/lib/ai-service"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    const { 
      topic, 
      contentType = 'linkedin-post',
      ensureUniqueness = true,
      count = 2
    } = await request.json()

    if (!topic) {
      return NextResponse.json({ error: "Topic is required" }, { status: 400 })
    }

    // Get user session for authentication
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    // Check if user has completed their personal story
    const storyValidation = await PersonalStoryContentService.validatePersonalStoryCompleteness(session.user.email)
    
    if (!storyValidation.isComplete) {
      return NextResponse.json({ 
        error: "Personal story incomplete",
        message: "Please complete your personal story first to generate personalized content",
        missingFields: storyValidation.missingFields,
        completionPercentage: storyValidation.completionPercentage,
        requiredFields: ['early_life', 'education', 'career_journey', 'personal_side', 'current_identity', 'future_aspirations']
      }, { status: 400 })
    }

    // Get personal story data
    const storyData = await PersonalStoryService.getUserStoryData(session.user.email)
    if (!storyData) {
      return NextResponse.json({ 
        error: "Personal story not found",
        message: "Please complete your personal story first"
      }, { status: 400 })
    }

    // Build contextual personal story context based on topic
    const storyContext = PersonalStoryService.buildContextualStoryContext(storyData, topic)
    
    // Create enhanced prompt with personal story context
    const enhancedPrompt = `${storyContext}

Topic: "${topic}"
Content Type: ${contentType}

CRITICAL REQUIREMENTS:
- Generate ${count} unique pieces of content
- Each content piece MUST be directly inspired by elements from ALL 6 personal story sections:
  * Early Life & Roots
  * Education & Learning Phase
  * Career Journey
  * Personal Side
  * Current Identity & Positioning
  * Future Aspirations
- Ensure the content connects the topic "${topic}" to relevant personal experiences and insights from multiple sections
- Make the content feel authentic and relatable by incorporating specific details from the personal story
- Use the personal story elements naturally - don't force connections that don't exist
- Focus on creating unique, personalized content that showcases the complete user's unique journey and insights
- Weave together elements from different life phases to create a rich, comprehensive narrative
- Maintain professional tone while being authentic and personal
- Avoid generic content that could apply to anyone
- Each content piece should be complete and ready to publish
- Vary the approach, angle, and style for each content piece
- Show the complete personal journey from early life to future aspirations`

    // Generate content using the centralized AI service
    const response = await aiService.generateContent(
      contentType,
      enhancedPrompt,
      "openai",
      {
        tone: "professional",
        targetAudience: "LinkedIn professionals",
        mainGoal: "engagement",
        includeHashtags: true,
        includeEmojis: true,
        callToAction: true,
        wordCount: 200,
        temperature: 0.8, // Higher temperature for more variety
        personalTouch: true,
        storytelling: true
      },
      session.user.id,
      session.user.email
    )

    // Ensure uniqueness if requested
    let finalContent = response.content
    if (ensureUniqueness && response.content) {
      const uniqueContent = await ensureContentUniqueness(
        response.content, 
        session.user.email, 
        contentType
      )
      finalContent = uniqueContent
    }

    // Store generated content for future reference
    await storeGeneratedContent(
      session.user.email, 
      topic, 
      contentType, 
      finalContent, 
      storyContext
    )

    return NextResponse.json({ 
      success: true,
      content: finalContent,
      model: response.metadata.model,
      tokensUsed: response.metadata.tokensUsed,
      cost: response.metadata.cost,
      isPersonalized: true,
      uniquenessEnsured: ensureUniqueness,
      personalStoryElements: extractPersonalStoryElements(storyContext),
      topic: topic,
      contentType: contentType
    })
  } catch (error) {
    console.error("Error in personal-story content API:", error)
    return NextResponse.json({ 
      error: "Failed to generate personalized content",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 })
  }
}

/**
 * Ensure content uniqueness by checking against previously generated content
 */
async function ensureContentUniqueness(
  content: string | string[], 
  userEmail: string, 
  contentType: string
): Promise<string | string[]> {
  try {
    const { connectDB } = await import("@/lib/mongodb")
    const db = await connectDB()
    
    // Get previously generated content for this user (last 30 days)
    const previousContent = await db.collection("generatedContent").find({
      userEmail,
      type: contentType,
      generatedAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
    }).toArray()
    
    if (Array.isArray(content)) {
      const uniqueContent: string[] = []
      
      for (const item of content) {
        const isUnique = !previousContent.some(prev => 
          calculateSimilarity(item.toLowerCase(), prev.content.toLowerCase()) > 0.7
        )
        
        if (isUnique) {
          uniqueContent.push(item)
        }
      }
      
      return uniqueContent
    } else {
      // Single content item
      const isUnique = !previousContent.some(prev => 
        calculateSimilarity(content.toLowerCase(), prev.content.toLowerCase()) > 0.7
      )
      
      return isUnique ? content : content // Return original if not unique (could implement regeneration logic here)
    }
  } catch (error) {
    console.error("Error ensuring content uniqueness:", error)
    return content // Return original content if uniqueness check fails
  }
}

/**
 * Store generated content for future reference
 */
async function storeGeneratedContent(
  userEmail: string, 
  topic: string, 
  contentType: string, 
  content: string | string[], 
  storyContext: string
): Promise<void> {
  try {
    const { connectDB } = await import("@/lib/mongodb")
    const db = await connectDB()
    
    const contentArray = Array.isArray(content) ? content : [content]
    
    const contentRecords = contentArray.map(item => ({
      userEmail,
      topic,
      type: contentType,
      content: item,
      storyContext,
      generatedAt: new Date(),
      isPersonalized: true,
      source: 'personal-story-content-api'
    }))
    
    await db.collection("generatedContent").insertMany(contentRecords)
  } catch (error) {
    console.error("Error storing generated content:", error)
  }
}

/**
 * Extract personal story elements from context for tracking
 */
function extractPersonalStoryElements(storyContext: string): string[] {
  const elements: string[] = []
  
  // Extract categories from the context
  const categories = [
    'Early Life & Roots',
    'Education & Learning',
    'Career Journey',
    'Personal Side',
    'Current Identity',
    'Future Aspirations'
  ]
  
  categories.forEach(category => {
    if (storyContext.includes(category)) {
      elements.push(category)
    }
  })
  
  return elements
}

/**
 * Calculate similarity between two strings
 */
function calculateSimilarity(str1: string, str2: string): number {
  const words1 = str1.split(/\s+/)
  const words2 = str2.split(/\s+/)
  
  const set1 = new Set(words1)
  const set2 = new Set(words2)
  
  const intersection = new Set([...set1].filter(x => set2.has(x)))
  const union = new Set([...set1, ...set2])
  
  return intersection.size / union.size
}

/**
 * GET endpoint to retrieve user's content generation history
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '50')
    const contentType = searchParams.get('type')

    // Get user's content generation history
    const history = await PersonalStoryContentService.getUserContentHistory(session.user.email, limit)
    
    // Filter by content type if specified
    const filteredHistory = contentType 
      ? history.filter(item => item.type === contentType)
      : history

    return NextResponse.json({
      success: true,
      history: filteredHistory,
      total: filteredHistory.length
    })
  } catch (error) {
    console.error("Error getting content history:", error)
    return NextResponse.json({ 
      error: "Failed to retrieve content history",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 })
  }
}
