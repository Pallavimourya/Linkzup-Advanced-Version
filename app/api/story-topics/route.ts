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

  const { action, storyId } = await request.json()
  const userEmail = session.user.email

  if (action === "generate") {
    return await generateTopicsFromStory(userEmail, storyId)
  } else if (action === "regenerate") {
    return await regenerateTopicsFromStory(userEmail, storyId)
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

async function generateTopicsFromStory(userEmail: string, storyId?: string) {
  try {
    const db = await connectDB()

    // Get personal story data
    const storyData = await PersonalStoryService.getUserStoryData(userEmail)
    if (!storyData) {
      return NextResponse.json(
        { error: "No personal story data found. Please complete your personal story first." },
        { status: 400 },
      )
    }

    // Build story context
    const storyContext = PersonalStoryService.buildStoryContext(storyData)

    const topicPrompt = `Analyze this personal story and generate 3 unique, specific blog topics based on real events mentioned:

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

Examples of good format:
- "How My Early Life Shaped My Professional Success"
- "Building Resilience Through Taekwondo Training"
- "From Classroom Debates to Leadership Development"

Generate 3 topics now:`

    const aiService = new AIService()
    const response = await aiService.generateContent(
      "topics",
      topicPrompt,
      "openai",
      {
        tone: "professional",
        wordCount: 50,
        temperature: 0.7,
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
        .map((line) => line.trim().replace(/^\d+[.)]\s*/, "")) // Remove numbering if present
        .filter((line) => line.length > 0)
        .slice(0, 3)
    }

    if (topics.length < 3) {
      const fallbackTopics = generateFallbackTopics(storyData)
      topics = [...topics, ...fallbackTopics].slice(0, 3)
    }

    const existingTopics = await db
      .collection("storyTopics")
      .find({ userEmail }, { projection: { topicText: 1 } })
      .toArray()

    const existingTexts = new Set(existingTopics.map((t) => t.topicText.toLowerCase()))
    topics = topics.filter((topic) => !existingTexts.has(topic.toLowerCase()))

    // If all topics are duplicates, use fallback
    if (topics.length === 0) {
      topics = generateFallbackTopics(storyData).slice(0, 3)
    }

    // Store topics in database
    const topicDocuments = topics.map((topic, index) => ({
      id: `topic-${Date.now()}-${index}`,
      userEmail,
      storyId: storyId || `story-${Date.now()}`,
      topicText: topic,
      status: "pending",
      createdAt: new Date(),
      updatedAt: new Date(),
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

async function regenerateTopicsFromStory(userEmail: string, storyId?: string) {
  try {
    const db = await connectDB()

    const storyData = await PersonalStoryService.getUserStoryData(userEmail)
    if (!storyData) {
      return NextResponse.json(
        { error: "No personal story data found. Please complete your personal story first." },
        { status: 400 },
      )
    }

    const [existingTopics, approvedTopics] = await Promise.all([
      db
        .collection("storyTopics")
        .find({ userEmail }, { projection: { topicText: 1 } })
        .toArray(),
      db
        .collection("approvedTopics")
        .find({ userEmail }, { projection: { topicText: 1 } })
        .toArray(),
    ])

    const allExistingTexts = [...existingTopics.map((t) => t.topicText), ...approvedTopics.map((t) => t.topicText)]

    const storyContext = PersonalStoryService.buildStoryContext(storyData)

    const topicPrompt = `Analyze this personal story and generate 3 NEW unique topics. Avoid these existing topics:

${allExistingTexts.map((t) => `- ${t}`).join("\n")}

Story:
${storyContext}

Requirements:
- Create completely different topics from the existing ones
- Focus on different aspects of the story
- Keep topics short and professional (maximum 8-10 words)
- Use natural, human language
- Do NOT use colons (:) in topic titles
- Be specific and personal
- Make topics sound like professional blog post titles
- Output only the topic titles, one per line

Generate 3 NEW topics now:`

    const aiService = new AIService()
    const response = await aiService.generateContent(
      "topics",
      topicPrompt,
      "openai",
      {
        tone: "professional",
        wordCount: 50,
        temperature: 0.8,
      },
      undefined,
      userEmail,
    )

    let topics: string[] = []
    if (Array.isArray(response.content)) {
      topics = response.content
    } else if (typeof response.content === "string") {
      topics = response.content
        .split("\n")
        .map((line) => line.trim().replace(/^\d+[.)]\s*/, ""))
        .filter((line) => line.length > 0)
        .slice(0, 3)
    }

    // Filter duplicates
    const existingSet = new Set(allExistingTexts.map((t) => t.toLowerCase()))
    topics = topics.filter((topic) => !existingSet.has(topic.toLowerCase()))

    if (topics.length < 3) {
      const fallbackTopics = generateFallbackTopics(storyData)
      topics = [...topics, ...fallbackTopics.filter((t) => !existingSet.has(t.toLowerCase()))].slice(0, 3)
    }

    const topicDocuments = topics.map((topic, index) => ({
      id: `topic-${Date.now()}-${index}`,
      userEmail,
      storyId: storyId || `story-${Date.now()}`,
      topicText: topic,
      status: "pending",
      createdAt: new Date(),
      updatedAt: new Date(),
    }))

    if (topicDocuments.length > 0) {
      await db.collection("storyTopics").insertMany(topicDocuments)
    }

    return NextResponse.json({
      success: true,
      topics: topicDocuments,
      message: "New topics generated successfully",
    })
  } catch (error) {
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

  if (answers.early_life && answers.early_life.trim().length > 20) {
    fallbackTopics.push("How My Early Life Shaped My Success")
  }

  if (answers.education && answers.education.trim().length > 20) {
    fallbackTopics.push("What My Education Taught Me")
  }

  if (answers.career_journey && answers.career_journey.trim().length > 20) {
    fallbackTopics.push("The Career Decision That Changed Everything")
  }

  return fallbackTopics.slice(0, 3)
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
