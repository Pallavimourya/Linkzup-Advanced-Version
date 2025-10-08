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

    const { topicId, topicText, contentType = "linkedin-post" } = await request.json()
    const userEmail = session.user.email

    if (!topicId && !topicText) {
      return NextResponse.json({ error: "Topic ID or Topic Text is required" }, { status: 400 })
    }

    let topic: any = null
    const db = await connectDB() // Move database connection to proper scope

    if (topicId) {
      // Get the approved topic from database
      topic = await db.collection("storyTopics").findOne({
        _id: new Object(topicId),
        userEmail,
        status: "Approved"
      })

      if (!topic) {
        return NextResponse.json({ error: "Approved topic not found" }, { status: 404 })
      }
    } else if (topicText) {
      // Create a temporary topic object for direct topic text
      topic = {
        topicText: topicText,
        userEmail: userEmail,
        status: "temp"
      }
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
    
    // Create unique ChatGPT prompt for content generation with enhanced randomization
    const timestamp = Date.now()
    const randomSeed = Math.floor(Math.random() * 1000)
    const topicHash = topic.topicText.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0)
      return a & a
    }, 0)
    
    const promptVariations = [
      "Focus on the most impactful lessons learned from this experience",
      "Emphasize the challenges overcome and growth achieved", 
      "Highlight the unexpected insights gained from this journey",
      "Explore the turning points that changed everything",
      "Focus on the skills developed and how they apply today",
      "Emphasize the relationships and connections that mattered most",
      "Highlight the moments of doubt and how they were resolved",
      "Explore the values that were tested and strengthened",
      "Dive deep into the personal transformation that occurred",
      "Share the specific moments that shaped your perspective",
      "Reflect on the decisions that led to breakthrough moments",
      "Explore the emotions and thoughts during key experiences",
      "Focus on the people who influenced your journey most",
      "Highlight the failures that became stepping stones to success",
      "Emphasize the creative solutions you discovered along the way",
      "Share the wisdom gained from unexpected challenges",
      "Structure the content with a compelling hook, clear bullet points, and strong conclusion",
      "Create an engaging narrative that flows from personal experience to professional insight",
      "Build a story arc that takes readers from challenge to solution to growth",
      "Craft content that balances vulnerability with professional wisdom"
    ]
    
    // Use topic hash to ensure consistent but unique variation per topic
    const variationIndex = Math.abs(topicHash + timestamp) % promptVariations.length
    const randomVariation = promptVariations[variationIndex]
    
    const contentPrompt = `${storyContext}

Write a well-structured LinkedIn post about the topic: "${topic.topicText}", using only the relevant information and experiences described in the story below. Avoid adding details that are not present in the story.

SPECIAL INSTRUCTION: ${randomVariation}

Content Structure Requirements:
1. **Opening Line**: Start with a compelling, attention-grabbing opening that relates to the topic
2. **Main Content**: Use bullet points (•) to organize key insights and experiences from the story
3. **Closing**: End with a thoughtful conclusion and call-to-action
4. **Hashtags**: Include 3-5 relevant hashtags at the end

Format Requirements:
- Write in a professional, engaging tone
- Use specific details and experiences from the personal story
- Make the content authentic and relatable
- Structure with clear opening, bullet points, and closing
- Include actionable insights where relevant
- Keep the content focused on the topic while drawing from the story
- Write approximately 200-300 words
- Make it suitable for LinkedIn posting
- Use the personal story as the foundation, not as additional context
- Be creative and explore DIFFERENT angles than typical career content
- Use different vocabulary and phrasing to ensure uniqueness
- This is generation #${Math.floor(timestamp / 1000) % 1000} for topic "${topic.topicText}" at ${new Date().toISOString()}
- Topic hash: ${topicHash} - ensure this content is UNIQUE and DIFFERENT from any previous generations
- Use a ${randomVariation.toLowerCase()} approach to make this content stand out
- Include personal anecdotes and specific examples from the story
- Make it conversational yet professional
- Include a call-to-action that encourages engagement

Example Format:
[Compelling opening line that hooks the reader]

• [First key insight or experience from your story]
• [Second key insight or experience from your story]
• [Third key insight or experience from your story]

[Thoughtful conclusion that ties everything together and includes a call-to-action]

#RelevantHashtag1 #RelevantHashtag2 #RelevantHashtag3

Generate the content now following this exact structure:`

    // Generate content using AI service with enhanced randomization
    const aiService = new AIService()
    
    // Use different AI providers and settings for more variety
    const providers = ["openai", "perplexity"]
    const providerIndex = Math.abs(topicHash + timestamp) % providers.length
    const randomProvider = providers[providerIndex]
    
    console.log("Generating content for topic:", topic.topicText)
    console.log("Using provider:", randomProvider)
    
    let response: any
    try {
      response = await aiService.generateContent(
        contentType,
        contentPrompt,
        randomProvider as "openai" | "perplexity",
        {
          tone: "professional",
          targetAudience: "LinkedIn professionals",
          mainGoal: "engagement",
          includeHashtags: true,
          includeEmojis: true,
          callToAction: true,
          wordCount: 400,
          temperature: 0.85 + (Math.abs(topicHash) % 15) / 100, // 0.85-0.99 based on topic hash
          maxTokens: 800, // Allow more tokens for variety
          personalTouch: true,
          storytelling: true,
          humanLike: true,
          randomness: 75 + (Math.abs(topicHash) % 20), // 75-95 based on topic hash
          ambiguity: 65 + (Math.abs(topicHash) % 25), // 65-90 based on topic hash
          emotionalDepth: 70 + (Math.abs(topicHash) % 25), // 70-95 based on topic hash
          conversationalStyle: true
        },
        undefined,
        userEmail
      )
      
      console.log("AI service response:", JSON.stringify(response, null, 2))
    } catch (aiError) {
      console.error("AI service error:", aiError)
      // Try with OpenAI as fallback
      console.log("Trying fallback with OpenAI...")
      response = await aiService.generateContent(
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
          temperature: 0.8,
          maxTokens: 600,
          personalTouch: true,
          storytelling: true
        },
        undefined,
        userEmail
      )
      console.log("Fallback AI service response:", JSON.stringify(response, null, 2))
    }

    // Parse the generated content
    let content = ""
    if (Array.isArray(response.content)) {
      content = response.content[0] || ""
    } else if (typeof response.content === 'string') {
      content = response.content
    } else {
      console.error("Unexpected content format:", response.content)
      throw new Error("Invalid content format received from AI service")
    }
    
    if (!content || content.trim().length === 0) {
      console.error("Empty content generated, using fallback content")
      // Generate fallback content based on the topic with proper structure
      content = `Reflecting on my journey, I've learned that "${topic.topicText}" isn't just a concept—it's a lived experience that shapes who we become.

• Every challenge I've faced has been an opportunity for growth and self-discovery
• Authenticity in my approach has built stronger professional connections than any strategy
• Continuous learning has been the cornerstone of my success and personal development
• Building meaningful relationships has mattered more than any achievement or milestone

These experiences have taught me that the most valuable lessons come from embracing the journey, not just reaching the destination.

What aspects of this topic resonate with your own experiences? I'd love to hear your thoughts and stories in the comments below.

#PersonalStory #ProfessionalGrowth #Authenticity #LinkedIn #CareerJourney`
    }
    
    // Post-process content to ensure proper formatting
    content = formatContentForLinkedIn(content, topic.topicText)
    
    console.log("Generated content length:", content.length)

    // Store generated content in database
    const contentDocument = {
      userEmail,
      storyId: topic.storyId || `temp-story-${Date.now()}`,
      topicId: topic._id || `temp-topic-${Date.now()}`,
      topicText: topic.topicText,
      generatedContent: content,
      contentType,
      createdAt: new Date(),
      updatedAt: new Date(),
      isTemporary: !topic._id // Mark as temporary if no topic ID
    }

    try {
      await db.collection("storyGeneratedContent").insertOne(contentDocument)
      console.log("Content stored in database successfully")
    } catch (dbError) {
      console.error("Database storage error:", dbError)
      // Continue even if database storage fails
    }

    return NextResponse.json({
      success: true,
      content: {
        id: contentDocument._id || `temp-${Date.now()}`,
        topicText: topic.topicText,
        content,
        contentType,
        createdAt: contentDocument.createdAt
      },
      message: "Content generated successfully from your personal story"
    })

  } catch (error) {
    console.error("Error generating content from topic:", error)
    return NextResponse.json(
      { 
        error: "Failed to generate content",
        details: error instanceof Error ? error.message : "Unknown error",
        topic: topic?.topicText || "Unknown topic"
      },
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

// Helper function to format content for LinkedIn with proper structure
function formatContentForLinkedIn(content: string, topicText: string): string {
  if (!content || content.trim().length === 0) {
    return content
  }

  // Clean up the content
  let formattedContent = content.trim()
  
  // Remove any existing parentheses at the start and end
  formattedContent = formattedContent.replace(/^\(/, '').replace(/\)$/, '')
  
  // Split content into lines
  const lines = formattedContent.split('\n').map(line => line.trim()).filter(line => line.length > 0)
  
  // Check if content already has proper structure
  const hasOpeningLine = lines.length > 0 && !lines[0].startsWith('•')
  const hasBulletPoints = lines.some(line => line.startsWith('•'))
  const hasHashtags = lines.some(line => line.startsWith('#'))
  
  // If content is already well-formatted, return as is
  if (hasOpeningLine && hasBulletPoints && hasHashtags) {
    return formattedContent
  }
  
  // Reformat content if needed
  const result: string[] = []
  
  // Add opening line if missing
  if (!hasOpeningLine) {
    result.push(`Reflecting on my journey, I've learned that "${topicText}" isn't just a concept—it's a lived experience that shapes who we become.`)
    result.push('')
  }
  
  // Process bullet points
  const bulletPoints: string[] = []
  const otherLines: string[] = []
  const hashtags: string[] = []
  
  lines.forEach(line => {
    if (line.startsWith('•')) {
      bulletPoints.push(line)
    } else if (line.startsWith('#')) {
      hashtags.push(line)
    } else if (line.length > 0) {
      otherLines.push(line)
    }
  })
  
  // Add opening line if we have other content but no proper opening
  if (otherLines.length > 0 && !hasOpeningLine) {
    result.push(otherLines[0])
    result.push('')
    otherLines.shift() // Remove the first line as it's now the opening
  }
  
  // Add bullet points
  if (bulletPoints.length > 0) {
    result.push(...bulletPoints)
    result.push('')
  } else if (otherLines.length > 0) {
    // Convert other lines to bullet points if no bullets exist
    otherLines.slice(0, 3).forEach(line => {
      if (!line.startsWith('•')) {
        result.push(`• ${line}`)
      }
    })
    result.push('')
  }
  
  // Add conclusion
  if (otherLines.length > 1) {
    result.push(otherLines.slice(1).join(' '))
  } else {
    result.push('These experiences have taught me valuable lessons that I continue to apply in my professional journey.')
  }
  
  result.push('')
  result.push('What aspects of this topic resonate with your own experiences? I\'d love to hear your thoughts in the comments below.')
  result.push('')
  
  // Add hashtags
  if (hashtags.length > 0) {
    result.push(hashtags.join(' '))
  } else {
    result.push('#PersonalStory #ProfessionalGrowth #LinkedIn #CareerJourney')
  }
  
  return result.join('\n')
}

