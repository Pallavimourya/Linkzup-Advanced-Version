import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { connectDB } from "@/lib/mongodb"
import { PersonalStoryService } from "@/lib/personal-story-service"
import { AIService } from "@/lib/ai-service"

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { topicId, contentType = "linkedin-post" } = await request.json()
    const userEmail = session.user.email

    if (!topicId) {
      return NextResponse.json({ error: "Topic ID is required" }, { status: 400 })
    }

    // Get the approved topic
    const db = await connectDB()
    const topic = await db.collection("storyTopics").findOne({
      _id: new Object(topicId),
      userEmail,
      status: "Approved"
    })

    if (!topic) {
      return NextResponse.json({ error: "Approved topic not found" }, { status: 404 })
    }

    // Get personal story data
    const storyData = await PersonalStoryService.getUserStoryData(userEmail)
    if (!storyData) {
      return NextResponse.json(
        { error: "No personal story data found. Please complete your personal story first." },
        { status: 400 }
      )
    }

    // Build contextual story context for content generation
    const storyContext = PersonalStoryService.buildContextualStoryContext(storyData, topic.topicText)
    
    // Create ChatGPT prompt for content generation
    const contentPrompt = `${storyContext}

Write a detailed article about the topic: "${topic.topicText}", using only the relevant information and experiences described in the story below. Avoid adding details that are not present in the story.

Content Requirements:
- Write in a professional, engaging tone
- Use specific details and experiences from the personal story
- Make the content authentic and relatable
- Structure the content with clear sections
- Include actionable insights where relevant
- Keep the content focused on the topic while drawing from the story
- Write approximately 300-500 words
- Make it suitable for LinkedIn posting
- Use the personal story as the foundation, not as additional context

Generate the content now:`

    // Generate content using AI service
    const aiService = new AIService()
    const response = await aiService.generateContent(
      contentType,
      contentPrompt,
      "openai",
      {
        tone: "professional",
        targetAudience: "LinkedIn professionals",
        mainGoal: "engagement",
        includeHashtags: true,
        includeEmojis: true,
        callToAction: true,
        wordCount: 400,
        temperature: 0.7,
        personalTouch: true,
        storytelling: true
      },
      undefined,
      userEmail
    )

    // Parse the generated content
    let content = ""
    if (Array.isArray(response.content)) {
      content = response.content[0] || ""
    } else if (typeof response.content === 'string') {
      content = response.content
    }

    // Store generated content in database
    const contentDocument = {
      userEmail,
      storyId: topic.storyId,
      topicId: topic._id,
      topicText: topic.topicText,
      generatedContent: content,
      contentType,
      createdAt: new Date(),
      updatedAt: new Date()
    }

    await db.collection("storyGeneratedContent").insertOne(contentDocument)

    return NextResponse.json({
      success: true,
      content: {
        id: contentDocument._id,
        topicText: topic.topicText,
        content,
        contentType,
        createdAt: contentDocument.createdAt
      },
      message: "Content generated successfully from your approved topic"
    })

  } catch (error) {
    console.error("Error generating content from topic:", error)
    return NextResponse.json(
      { error: "Failed to generate content" },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userEmail = session.user.email
    const { searchParams } = new URL(request.url)
    const topicId = searchParams.get("topicId")

    const db = await connectDB()
    
    const query: any = { userEmail }
    if (topicId) {
      query.topicId = new Object(topicId)
    }

    const content = await db.collection("storyGeneratedContent")
      .find(query)
      .sort({ createdAt: -1 })
      .toArray()

    return NextResponse.json({
      success: true,
      content
    })

  } catch (error) {
    console.error("Error fetching generated content:", error)
    return NextResponse.json(
      { error: "Failed to fetch content" },
      { status: 500 }
    )
  }
}

