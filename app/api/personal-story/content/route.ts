import { type NextRequest, NextResponse } from "next/server"
import { PersonalStoryService } from "@/lib/personal-story-service"
import { PersonalStoryContentService } from "@/lib/personal-story-content-service"
import { aiService } from "@/lib/ai-service"
// @ts-ignore
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
    const enhancedPrompt = `<personal_story_content_creation>
You are a personal branding expert creating authentic, engaging content that showcases unique life experiences.

${storyContext}

<content_brief>
Topic: "${topic}"
Content Type: ${contentType}
Count: ${count} unique pieces
</content_brief>

<personal_story_integration_strategy>
- Analyze ALL 6 life sections for relevant connections to "${topic}"
- Prioritize sections with strongest thematic alignment
- Create natural bridges between personal experiences and professional insights
- Use specific details to build authenticity and emotional connection
- Weave multiple life phases into cohesive narratives
- Transform user answers into creative, unique stories - NEVER copy directly
- Add storytelling elements like dialogue, emotions, scenes, and narrative flow
- Create original content inspired by user experiences, not copied from them
- Make each story fresh and engaging with creative interpretation
</personal_story_integration_strategy>

<content_optimization_framework>
1. Authenticity: Use real experiences, not generic advice
2. Relevance: Connect personal story to topic meaningfully
3. Value: Provide actionable insights and takeaways
4. Engagement: Create content that sparks discussion
5. Uniqueness: Showcase perspectives only this person could share
6. Professionalism: Maintain credibility while being personal
</content_optimization_framework>

<content_creation_requirements>
- Generate ${count} distinct content pieces
- Each piece must incorporate elements from multiple life sections
- Create natural connections between topic and personal experiences
- Use specific details to make content memorable and relatable
- Vary approach, angle, and style for each piece
- Ensure content reflects complete personal journey
- Make each piece complete and ready to publish
- Avoid generic content that could apply to anyone
- NO generic titles or headings like "My Journey from..." or "Building a Life of..."
- Start directly with the content, clean and natural
- NEVER copy user answers word-for-word
- Transform user experiences into unique, creative narratives
- Add storytelling elements like dialogue, emotions, and scenes
- Create original content inspired by user experiences, not copied from them
- Make each story unique and engaging with creative interpretation
</content_creation_requirements>

<quality_standards>
- Professional tone with authentic personal touch
- Clear value proposition for target audience
- Engaging narrative structure
- Specific, actionable insights
- Emotional resonance and relatability
- Unique perspective based on personal journey
- Clean, natural formatting without generic titles
- Original, creative storytelling that transforms user experiences
- No direct copying of user answers
- Fresh, unique content with creative interpretation
</quality_standards>
</personal_story_content_creation>`

    // Generate content using the centralized AI service
    const response = await aiService.generateContent(
      contentType,
      enhancedPrompt,
      "openai", // Will automatically use optimal model based on content type
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
