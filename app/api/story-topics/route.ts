import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { connectDB } from "@/lib/mongodb"
import { PersonalStoryService } from "@/lib/personal-story-service"
import { AIService } from "@/lib/ai-service"

const REQUEST_TIMEOUT = 60000 // 60 seconds
export async function POST(request: NextRequest) {
  try {
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error("Request timeout")), REQUEST_TIMEOUT)
    })

    const requestPromise = handlePostRequest(request)

    const result = await Promise.race([requestPromise, timeoutPromise])
    return result as NextResponse
  } catch (error: any) {
    console.error("Error in story-topics API:", error)
    if (error.message === "Request timeout") {
      return NextResponse.json({ error: "Request took too long. Please try again." }, { status: 504 })
    }
    return NextResponse.json({ error: "Failed to process request" }, { status: 500 })
  }
}

async function handlePostRequest(request: NextRequest) {
  const session = (await getServerSession(authOptions)) as any
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { action, storyId, count = 3, context = "default" } = await request.json()
  const userEmail = session.user.email

  if (action === "generate") {
    return await generateTopicsFromStory(userEmail, storyId, count, context)
  } else if (action === "regenerate") {
    return await regenerateTopicsFromStory(userEmail, storyId, count, context)
  } else {
    return NextResponse.json({ error: "Invalid action" }, { status: 400 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = (await getServerSession(authOptions)) as any
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userEmail = session.user.email
    const { searchParams } = new URL(request.url)
    const storyId = searchParams.get("storyId")

    return await getTopicsForStory(userEmail, storyId || undefined)
  } catch (error) {
    console.error("Error fetching story topics:", error)
    return NextResponse.json({ error: "Failed to fetch topics" }, { status: 500 })
  }
}

async function generateTopicsFromStory(userEmail: string, storyId?: string, count = 3, context = "default") {
  try {
    const db = await connectDB()

    const storyData = await PersonalStoryService.getUserStoryData(userEmail)

    if (!storyData || !storyData.answers) {
      return NextResponse.json({ error: "No personal story found" }, { status: 404 })
    }

    const storyContext = PersonalStoryService.buildStoryContext(storyData)

    // Enhanced prompt for better personal story-based topics
    const topicPrompt = `Analyze this personal story and generate ${count} unique, specific blog topics based on real events mentioned:

Story:
${storyContext}

Requirements:
- Each topic must be based on actual events from the story
- Keep topics short and professional (maximum 8-10 words)
- Use natural, human language (avoid words like "journey", "transformation", "empowerment")
- Do NOT use colons (:) in topic titles
- Be specific and personal, not generic
- Make topics sound like professional blog post titles
- Output only the topic titles, one per line
- No numbering, no JSON format
- Focus on specific experiences, challenges, and achievements mentioned in the story
- Make topics relatable and actionable for LinkedIn audience

${context === "dashboard" ? "- Focus on broader career and life themes from the story" : "- Focus on specific actionable insights from the story"}

Examples of good format:
- "How My Early Life Shaped My Professional Success"
- "Building Resilience Through Taekwondo Training"
- "From Classroom Debates to Leadership Development"
- "The Career Decision That Changed Everything"
- "What My Education Taught Me About Success"

Generate ${count} topics now:`

    const aiService = new AIService()
    const response = await aiService.generateContent(
      "topics",
      topicPrompt,
      "openai",
      {
        tone: "professional",
        wordCount: 50,
        temperature: 0.8, // Increased for more creativity
      },
      undefined,
      userEmail,
    )

    // Parse the generated topics
    let topics: string[] = []
    if (Array.isArray(response.content)) {
      topics = response.content
    } else if (typeof response.content === "string") {
      topics = response.content
        .split("\n")
        .map((line) => line.trim().replace(/^\d+[.)]\s*/, ""))
        .filter((line) => line.length > 0)
        .slice(0, count) // Use dynamic count
    }

    // Ensure we have enough topics
    if (topics.length < count) {
      const fallbackTopics = generateFallbackTopics(storyData)
      topics = [...topics, ...fallbackTopics].slice(0, count)
    }

    // Check for existing topics across all contexts to ensure uniqueness
    const existingTopics = await db
      .collection("storyTopics")
      .find({ userEmail }, { projection: { topicText: 1 } })
      .toArray()

    const existingTexts = new Set(existingTopics.map((t: any) => t.topicText.toLowerCase()))
    
    // Filter out duplicates and ensure uniqueness
    const uniqueTopics = await ensureTopicUniqueness(topics, userEmail)
    
    // If we don't have enough unique topics, generate more
    if (uniqueTopics.length < count) {
      const additionalTopics = generateFallbackTopics(storyData)
      const additionalUnique = await ensureTopicUniqueness(additionalTopics, userEmail)
      topics = [...uniqueTopics, ...additionalUnique].slice(0, count)
    } else {
      topics = uniqueTopics.slice(0, count)
    }

    const topicDocuments = topics.map((topic, index) => ({
      id: `topic-${Date.now()}-${index}`,
      userEmail,
      topicText: topic,
      status: "pending",
      context, // Added context field
      createdAt: new Date(),
      storyId: storyId || `story-${userEmail}-${Date.now()}`,
    }))

    if (topicDocuments.length > 0) {
      await db.collection("storyTopics").insertMany(topicDocuments)
    }

    return NextResponse.json({
      success: true,
      topics: topicDocuments,
      message: "Topics generated successfully from your personal story",
    })
  } catch (error) {
    console.error("Error generating topics from story:", error)
    return NextResponse.json({ error: "Failed to generate topics" }, { status: 500 })
  }
}

async function regenerateTopicsFromStory(userEmail: string, storyId?: string, count = 3, context = "default") {
  try {
    const db = await connectDB()

    // Delete only topics for the specific context to maintain uniqueness across different sections
    await db.collection("storyTopics").deleteMany({ userEmail, context })

    return await generateTopicsFromStory(userEmail, storyId, count, context)
  } catch (error: any) {
    console.error("Error regenerating topics from story:", error)
    return NextResponse.json({ error: "Failed to regenerate topics" }, { status: 500 })
  }
}

async function getTopicsForStory(userEmail: string, storyId?: string) {
  try {
    const db = await connectDB()

    const query: any = { userEmail }
    if (storyId) {
      query.storyId = storyId
    }

    const topics = await db.collection("storyTopics").find(query).sort({ createdAt: -1 }).toArray()

    return NextResponse.json({
      success: true,
      topics,
    })
  } catch (error) {
    console.error("Error fetching topics for story:", error)
    return NextResponse.json({ error: "Failed to fetch topics" }, { status: 500 })
  }
}

function generateFallbackTopics(storyData: any): string[] {
  const { answers } = storyData
  const fallbackTopics = []

  // Generate more specific and personal topics based on story content
  if (answers.early_life && answers.early_life.trim().length > 20) {
    fallbackTopics.push("How My Early Life Shaped My Professional Success")
  }

  if (answers.education && answers.education.trim().length > 20) {
    fallbackTopics.push("What My Education Taught Me About Success")
  }

  if (answers.career_journey && answers.career_journey.trim().length > 20) {
    fallbackTopics.push("The Career Decision That Changed Everything")
  }

  if (answers.challenges && answers.challenges.trim().length > 20) {
    fallbackTopics.push("How I Overcame My Biggest Challenge")
  }

  if (answers.achievements && answers.achievements.trim().length > 20) {
    fallbackTopics.push("The Achievement That Defined My Career")
  }

  if (answers.mentors && answers.mentors.trim().length > 20) {
    fallbackTopics.push("The Mentor Who Changed My Perspective")
  }

  if (answers.future_goals && answers.future_goals.trim().length > 20) {
    fallbackTopics.push("My Vision for the Future")
  }

  if (answers.personal_values && answers.personal_values.trim().length > 20) {
    fallbackTopics.push("The Values That Guide My Decisions")
  }

  return fallbackTopics.slice(0, 6) // Return up to 6 fallback topics
}

async function ensureTopicUniqueness(topics: string[], userEmail: string): Promise<string[]> {
  try {
    const db = await connectDB()
    const existingTopics = await db.collection("storyTopics").find({ userEmail }).toArray()

    const approvedTopics = await db.collection("approvedTopics").find({ userEmail }).toArray()

    const existingTopicTexts = existingTopics.map((t) => t.topicText.toLowerCase())
    const approvedTopicTexts = approvedTopics.map((t) => t.topicText.toLowerCase())
    const allExistingTopics = [...existingTopicTexts, ...approvedTopicTexts]

    // Filter out duplicates and similar topics
    const uniqueTopics = topics.filter((topic) => {
      const topicLower = topic.toLowerCase()

      // Check for exact duplicates
      if (allExistingTopics.includes(topicLower)) {
        return false
      }

      // Check for similar topics (same keywords or themes)
      const topicWords = topicLower.split(/\s+/)
      for (const existingTopic of allExistingTopics) {
        const existingWords = existingTopic.split(/\s+/)
        const commonWords = topicWords.filter((word) => existingWords.includes(word) && word.length > 3)

        // If more than 2 significant words match, consider it similar
        if (commonWords.length > 2) {
          return false
        }
      }

      return true
    })

    return uniqueTopics
  } catch (error) {
    console.error("Error ensuring topic uniqueness:", error)
    return topics // Return original topics if check fails
  }
}
