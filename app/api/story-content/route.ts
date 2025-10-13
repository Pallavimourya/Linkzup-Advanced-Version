import { NextRequest, NextResponse } from "next/server"
// @ts-ignore
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
    const topicHash = topic.topicText.split('').reduce((a: number, b: string) => {
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

<enhanced_content_creation_instructions>
You are an expert personal branding content creator specializing in transforming personal life experiences into compelling, professional LinkedIn content. Your task is to create authentic, engaging content that showcases unique life experiences based on the user's personal story data.

TOPIC TO ADDRESS: "${topic.topicText}"
SPECIAL FOCUS: ${randomVariation}

<content_creation_strategy>
- DEEP DIVE into personal story elements that directly relate to "${topic.topicText}"
- Create SPECIFIC, DETAILED examples from the user's life experiences
- Weave together MULTIPLE life phases into a cohesive narrative
- Use CONCRETE DETAILS and SPECIFIC SITUATIONS from the personal story
- Transform raw personal story data into ENGAGING, STORYTELLING content
- NEVER copy user answers word-for-word - instead, create original narratives inspired by them
- Add EMOTIONAL DEPTH and PERSONAL INSIGHTS that only this person could share
- Make the content feel AUTHENTIC and UNIQUE to this individual's journey
- Ensure the content is SUBSTANTIAL and MEANINGFUL, not superficial
</content_creation_strategy>

<content_quality_requirements>
- MINIMUM 250 words total content
- Opening paragraph: 3-4 sentences (60-80 words) with compelling hook
- Exactly 4 bullet points: Each 40-50 words with specific, actionable insights
- Closing paragraph: 2-3 sentences (50-60 words) with strong conclusion
- Include 4-5 relevant hashtags ONLY at the end
- Professional yet personal tone
- Specific examples and details from personal story
- Actionable insights that provide real value
- Emotional resonance that connects with readers
- Unique perspective that only this person could offer
</content_quality_requirements>

<mandatory_formatting_structure>
You MUST follow this EXACT structure. No deviations allowed:

STRUCTURE:
1. OPENING PARAGRAPH (3-4 sentences, 60-80 words)
   - Start with a compelling hook related to the topic
   - Reference specific personal story elements
   - Set up the main theme/lesson

2. BLANK LINE

3. BULLET POINTS (exactly 4, each 40-50 words)
   • First bullet: Specific insight from early life/education
   • Second bullet: Career journey lesson or experience
   • Third bullet: Personal side or current identity insight
   • Fourth bullet: Future aspirations or broader lesson
   - NO hashtags within bullet points
   - NO hashtags anywhere except at the very end

4. BLANK LINE

5. CLOSING PARAGRAPH (2-3 sentences, 50-60 words)
   - Strong conclusion that ties everything together
   - Call to action or inspirational message
   - Reference to personal growth or future vision

6. BLANK LINE

7. HASHTAGS (4-5 relevant hashtags ONLY at the end)

EXAMPLE STRUCTURE:
[Opening paragraph with personal story hook and topic introduction]

• [Specific insight from early life/education with concrete details]
• [Career journey lesson with specific example or situation]
• [Personal side insight with authentic personal touch]
• [Future aspirations or broader life lesson]

[Strong closing paragraph that ties everything together with inspiration or call to action]

#RelevantHashtag1 #RelevantHashtag2 #RelevantHashtag3 #RelevantHashtag4 #RelevantHashtag5

CRITICAL: NO hashtags should appear anywhere except at the very end of the content. NO hashtags within bullet points or paragraphs.
</mandatory_formatting_structure>

<content_depth_requirements>
- Use SPECIFIC DETAILS from the personal story, not generic advice
- Include CONCRETE EXAMPLES and SITUATIONS from the user's life
- Reference SPECIFIC EXPERIENCES, CHALLENGES, or ACHIEVEMENTS
- Create RICH, DETAILED narratives that feel authentic
- Avoid superficial or generic content that could apply to anyone
- Make each bullet point SUBSTANTIAL and MEANINGFUL
- Ensure the content provides REAL VALUE and ACTIONABLE INSIGHTS
- Connect personal experiences to PROFESSIONAL LESSONS and GROWTH
</content_depth_requirements>

<output_requirements>
Generate exactly 1 comprehensive, detailed content piece focused on "${topic.topicText}"
- Transform personal story elements into original, engaging narratives
- Create content that is SUBSTANTIAL, DETAILED, and MEANINGFUL
- Ensure content is ready to publish and provides real value
- Follow the mandatory formatting structure exactly
- Make content feel authentic and unique to this person's journey
- Include specific details and examples from their personal story
- Create content that sparks engagement and provides actionable insights

CRITICAL: The content must be SUBSTANTIAL and DETAILED, not short or superficial. Each section should provide meaningful value and specific insights based on the personal story data.

GENERATION METADATA:
- Generation #${Math.floor(timestamp / 1000) % 1000} for topic "${topic.topicText}"
- Topic hash: ${topicHash} - ensure this content is UNIQUE and DIFFERENT
- Special focus: ${randomVariation.toLowerCase()}
- Timestamp: ${new Date().toISOString()}
</output_requirements>
</enhanced_content_creation_instructions>`

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
        "openai", // Use OpenAI for better content quality
        {
          model: "gpt-4", // Use GPT-4 for better content quality
          tone: "professional",
          targetAudience: "LinkedIn professionals",
          mainGoal: "engagement",
          includeHashtags: true,
          includeEmojis: false, // Disable emojis for cleaner content
          callToAction: true,
          wordCount: 300, // Increased word count for more detailed content
          temperature: 0.8, // Balanced creativity and consistency
          maxTokens: 1500, // Increased token limit for longer content
          personalTouch: true,
          storytelling: true,
          humanLike: true,
          randomness: 75,
          ambiguity: 60,
          emotionalDepth: 85, // Higher emotional depth for better engagement
          conversationalStyle: true,
          // detailedContent: true, // Flag for detailed content generation
          // specificExamples: true, // Ensure specific examples are included
          // actionableInsights: true // Ensure actionable insights are provided
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
          model: "gpt-4", // Use GPT-4 for better content quality
          tone: "professional",
          targetAudience: "LinkedIn professionals",
          mainGoal: "engagement",
          includeHashtags: true,
          includeEmojis: false, // Disable emojis for cleaner content
          callToAction: true,
          wordCount: 300, // Increased word count for more detailed content
          temperature: 0.8, // Balanced creativity and consistency
          maxTokens: 1500, // Increased token limit for longer content
          personalTouch: true,
          storytelling: true,
          humanLike: true,
          randomness: 75,
          ambiguity: 60,
          emotionalDepth: 85, // Higher emotional depth for better engagement
          conversationalStyle: true,
          // detailedContent: true, // Flag for detailed content generation
          // specificExamples: true, // Ensure specific examples are included
          // actionableInsights: true // Ensure actionable insights are provided
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
    
    // Check if content already has proper structure before applying formatting
    const lines = content.split('\n').map(line => line.trim()).filter(line => line.length > 0)
    const hasBulletPoints = lines.some(line => line.startsWith('•'))
    const hasHashtags = lines.some(line => line.startsWith('#'))
    const bulletCount = lines.filter(line => line.startsWith('•')).length
    const hasOpeningParagraph = lines.length > 0 && !lines[0].startsWith('•') && !lines[0].startsWith('#')
    
    // Check for double bullet points - if found, always reformat
    const hasDoubleBullets = content.includes('• •') || content.includes('•\n•')
    
    // Check if content already has proper structure before applying formatting
    const isContentComplete = hasOpeningParagraph && hasBulletPoints && hasHashtags && bulletCount >= 4 && content.length > 200 && !hasDoubleBullets
    
    if (!isContentComplete) {
      console.log("Content needs formatting - applying LinkedIn formatting")
      console.log("Content analysis:", { hasOpeningParagraph, hasBulletPoints, hasHashtags, bulletCount, hasDoubleBullets, contentLength: content.length })
      content = formatContentForLinkedIn(content, topic.topicText)
    } else {
      console.log("Content already has proper structure - skipping formatting completely")
      console.log("Content analysis:", { hasOpeningParagraph, hasBulletPoints, hasHashtags, bulletCount, hasDoubleBullets, contentLength: content.length })
      // Just clean up any extra whitespace and return as-is
      content = content.replace(/\n\s*\n/g, '\n\n').trim()
    }
    
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
        id: (contentDocument as any)._id || `temp-${Date.now()}`,
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
        topic: "Unknown topic"
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
    return ""
  }

  // First, extract and remove all hashtags from the content
  const hashtagRegex = /#\w+/g
  const hashtags = content.match(hashtagRegex) || []
  let contentWithoutHashtags = content.replace(hashtagRegex, '').trim()

  // Clean up content and normalize spacing
  contentWithoutHashtags = contentWithoutHashtags.replace(/\s+/g, " ").trim()

  // Remove any existing bullet points to prevent double bullets
  contentWithoutHashtags = contentWithoutHashtags.replace(/•\s*/g, "").trim()

  // Extract sentences for better structuring
  const sentences = contentWithoutHashtags.split(/(?<=[.?!])\s+/).filter(s => s.length > 0)

  // Use first 3–4 sentences as opening paragraph
  const opening = sentences.slice(0, 3).join(" ")
  
  // Extract potential key ideas for bullet points
  const remaining = sentences.slice(3)

  // Generate 4 bullet points (auto-fill if fewer sentences exist)
  const bulletPoints = []
  for (let i = 0; i < 4; i++) {
    const sentence = remaining[i] || remaining[i % remaining.length] || `Insight ${i + 1} about "${topicText}".`
    // Clean any remaining hashtags from bullet points
    const cleanSentence = sentence.replace(/#\w+/g, '').trim()
    bulletPoints.push(`• ${cleanSentence}`)
  }

  // Closing paragraph with inspirational wrap-up
  const closing = `Ultimately, my experiences around "${topicText}" have shaped who I am today — reminding me that growth often begins where comfort ends. Embrace your own journey, and you'll uncover new paths to success.`

  // Use extracted hashtags or default ones
  const finalHashtags = hashtags.length > 0 ? hashtags.join(' ') : "#PersonalGrowth #CareerJourney #Inspiration #ProfessionalDevelopment #Motivation"

  // Combine all formatted parts
  return `${opening}\n\n${bulletPoints.join("\n\n")}\n\n${closing}\n\n${finalHashtags}`
}

