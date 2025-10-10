import { type NextRequest, NextResponse } from "next/server"
import { aiService } from "@/lib/ai-service"
import { PersonalStoryService } from "@/lib/personal-story-service"
import { PersonalStoryContentService } from "@/lib/personal-story-content-service"
import { getRelevantTopicPrompt, getAllTopicPrompts } from "@/lib/prompts/personal-story-topics"
// @ts-ignore
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    const { niche, count = 20, ensureUniqueness = true } = await request.json()

    if (!niche) {
      return NextResponse.json({ error: "Niche is required" }, { status: 400 })
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
        message: "Please complete your personal story first to generate personalized topics",
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

    // Extract themes from personal story
    const storyThemes = PersonalStoryService.extractStoryThemes(storyData)
    
    // Get relevant topic prompt based on themes
    const topicPrompt = getRelevantTopicPrompt(storyThemes)
    
    // Build personal story context
    const storyContext = PersonalStoryService.buildStoryContext(storyData)
    
    // Create enhanced prompt with personal story context
    const enhancedPrompt = `${storyContext}

${topicPrompt.prompt}

CRITICAL REQUIREMENTS:
- Generate exactly ${count} unique topics
- Each topic MUST be directly inspired by elements from ALL 6 personal story sections:
  * Early Life & Roots
  * Education & Learning Phase  
  * Career Journey
  * Personal Side
  * Current Identity & Positioning
  * Future Aspirations
- Ensure each topic connects to specific experiences, challenges, achievements, or lessons from the personal story
- Make topics compelling and LinkedIn-appropriate
- Avoid generic topics that could apply to anyone
- Focus on topics that showcase the complete unique journey and insights from the personal story
- Each topic should be 5-12 words long
- Show the full spectrum of the personal journey from early life to future aspirations
- Connect different life phases to create compelling narratives
- Return only the topics as a simple list, one per line, without numbering or additional formatting`

    // Generate topics using the centralized AI service with personal story integration
    const response = await aiService.generateContent(
      "topics",
      enhancedPrompt,
      "openai", // Will automatically use GPT-3.5-turbo for topics (cost-efficient)
      {
        tone: "professional",
        targetAudience: "LinkedIn professionals",
        mainGoal: "engagement",
        niche: niche,
        includeHashtags: false,
        includeEmojis: false,
        callToAction: false,
        wordCount: 50,
        temperature: 0.8, // Higher temperature for more variety
        personalTouch: true,
        storytelling: true
      },
      session.user.id,
      session.user.email
    )

    // Parse the generated topics
    let topics: string[] = []
    if (Array.isArray(response.content)) {
      topics = response.content
    } else if (typeof response.content === 'string') {
      // Parse string response into array
      topics = response.content.split('\n')
        .map(topic => topic.trim())
        .filter(topic => topic.length > 0)
        .slice(0, count)
    }

    // Ensure uniqueness if requested
    if (ensureUniqueness && topics.length > 0) {
      const uniqueTopics = await ensureTopicUniqueness(topics, session.user.email)
      topics = uniqueTopics
    }

    // Store generated topics for future reference
    await storeGeneratedTopics(session.user.email, topics, storyThemes, topicPrompt.category)

    return NextResponse.json({ 
      success: true,
      topics: topics,
      model: response.metadata.model,
      tokensUsed: response.metadata.tokensUsed,
      cost: response.metadata.cost,
      personalStoryThemes: storyThemes,
      topicCategory: topicPrompt.category,
      isPersonalized: true,
      uniquenessEnsured: ensureUniqueness
    })
  } catch (error) {
    console.error("Error in generate-topics API:", error)
    return NextResponse.json({ 
      error: "Failed to generate topics",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 })
  }
}

/**
 * Ensure topic uniqueness by checking against previously generated topics
 */
async function ensureTopicUniqueness(topics: string[], userEmail: string): Promise<string[]> {
  try {
    const { connectDB } = await import("@/lib/mongodb")
    const db = await connectDB()
    
    // Get previously generated topics for this user (last 30 days)
    const previousTopics = await db.collection("generatedTopics").find({
      userEmail,
      generatedAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
    }).toArray()
    
    const uniqueTopics: string[] = []
    
    for (const topic of topics) {
      const isUnique = !previousTopics.some(prev => 
        calculateSimilarity(topic.toLowerCase(), prev.topic.toLowerCase()) > 0.7
      )
      
      if (isUnique) {
        uniqueTopics.push(topic)
      }
    }
    
    return uniqueTopics
  } catch (error) {
    console.error("Error ensuring topic uniqueness:", error)
    return topics // Return original topics if uniqueness check fails
  }
}

/**
 * Store generated topics for future reference
 */
async function storeGeneratedTopics(
  userEmail: string, 
  topics: string[], 
  themes: string[], 
  category: string
): Promise<void> {
  try {
    const { connectDB } = await import("@/lib/mongodb")
    const db = await connectDB()
    
    const topicRecords = topics.map(topic => ({
      userEmail,
      topic,
      themes,
      category,
      generatedAt: new Date(),
      isPersonalized: true
    }))
    
    await db.collection("generatedTopics").insertMany(topicRecords)
  } catch (error) {
    console.error("Error storing generated topics:", error)
  }
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
