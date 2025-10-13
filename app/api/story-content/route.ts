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
      "Craft content that balances vulnerability with professional wisdom",
      "Explore the intersection of personal values and professional success",
      "Highlight the mentors and role models who shaped your approach",
      "Focus on the moments of breakthrough and personal revelation",
      "Emphasize the importance of authenticity in professional relationships",
      "Share insights about overcoming imposter syndrome and self-doubt",
      "Explore how personal hobbies and interests influenced your career path",
      "Highlight the importance of continuous learning and adaptation",
      "Focus on the role of failure in building resilience and character",
      "Emphasize the value of diverse experiences and perspectives",
      "Share wisdom about balancing ambition with personal well-being",
      "Explore the power of networking and building genuine connections",
      "Highlight the importance of giving back and mentoring others",
      "Focus on the role of technology and innovation in your journey",
      "Emphasize the value of taking calculated risks and stepping outside comfort zones",
      "Share insights about building and maintaining professional relationships",
      "Explore the importance of work-life integration and personal fulfillment"
    ]
    
    // Use multiple randomization factors for more variety
    const variationIndex = Math.abs(topicHash + timestamp + randomSeed + Math.floor(Math.random() * 1000)) % promptVariations.length
    const randomVariation = promptVariations[variationIndex]
    
    // Add additional randomization for content style
    const contentStyles = [
      "storytelling approach with vivid details and emotional depth",
      "analytical approach with concrete examples and actionable insights", 
      "reflective approach with philosophical insights and life lessons",
      "practical approach with specific strategies and real-world applications",
      "inspirational approach with motivational elements and future vision",
      "conversational approach with relatable anecdotes and personal touch"
    ]
    const styleIndex = Math.abs(topicHash + timestamp + randomSeed) % contentStyles.length
    const selectedStyle = contentStyles[styleIndex]
    
    const contentPrompt = `${storyContext}

<enhanced_content_creation_instructions>
You are an expert personal branding content creator specializing in transforming personal life experiences into compelling, professional LinkedIn content. Your task is to create authentic, engaging content that showcases unique life experiences based on the user's personal story data.

TOPIC TO ADDRESS: "${topic.topicText}"
SPECIAL FOCUS: ${randomVariation}
CONTENT STYLE: Use a ${selectedStyle}

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
- Content style: ${selectedStyle}
- Random seed: ${randomSeed} - use this to create unique variations
- Timestamp: ${new Date().toISOString()}

CRITICAL: This content must be COMPLETELY UNIQUE and DIFFERENT from any previous generation. Use the random seed and timestamp to ensure maximum variety. Do NOT use generic templates or repetitive phrases.
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
          temperature: 0.9, // Higher temperature for more variety and creativity
          maxTokens: 2000, // Increased token limit for longer content
          personalTouch: true,
          storytelling: true,
          humanLike: true,
          randomness: 85, // Higher randomness for more variety
          ambiguity: 70, // Higher ambiguity for more creative content
          emotionalDepth: 90, // Higher emotional depth for better engagement
          conversationalStyle: true,
          // Enhanced settings for better content generation
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
          temperature: 0.9, // Higher temperature for more variety and creativity
          maxTokens: 2000, // Increased token limit for longer content
          personalTouch: true,
          storytelling: true,
          humanLike: true,
          randomness: 85, // Higher randomness for more variety
          ambiguity: 70, // Higher ambiguity for more creative content
          emotionalDepth: 90, // Higher emotional depth for better engagement
          conversationalStyle: true,
          // Enhanced settings for better content generation
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
    const hasClosingParagraph = lines.length > 0 && !lines[lines.length - 1].startsWith('#')
    
    // Check if content already has proper structure
    const isContentWellStructured = hasOpeningParagraph && hasBulletPoints && hasHashtags && bulletCount >= 3 && content.length > 200
    
    if (!isContentWellStructured) {
      console.log("Content needs formatting - applying enhanced LinkedIn formatting with personal story integration")
      console.log("Content analysis:", { hasOpeningParagraph, hasBulletPoints, hasHashtags, bulletCount, contentLength: content.length })
      content = formatContentForLinkedInWithPersonalStory(content, topic.topicText, storyData)
    } else {
      console.log("Content already has proper structure - preserving AI-generated content with minimal cleanup")
      console.log("Content analysis:", { hasOpeningParagraph, hasBulletPoints, hasHashtags, bulletCount, contentLength: content.length })
      // Just clean up any extra whitespace and ensure proper spacing
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

// Enhanced helper function to format content for LinkedIn with proper structure and personal story integration
function formatContentForLinkedInWithPersonalStory(content: string, topicText: string, storyData: any): string {
  if (!content || content.trim().length === 0) {
    return ""
  }

  // First, extract and remove all hashtags from the content
  const hashtagRegex = /#\w+/g
  const hashtags = content.match(hashtagRegex) || []
  let contentWithoutHashtags = content.replace(hashtagRegex, '').trim()

  // Clean up content and normalize spacing
  contentWithoutHashtags = contentWithoutHashtags.replace(/\s+/g, " ").trim()

  // Try to preserve existing structure first
  const lines = contentWithoutHashtags.split('\n').map(line => line.trim()).filter(line => line.length > 0)
  const existingBullets = lines.filter(line => line.startsWith('•'))
  const existingParagraphs = lines.filter(line => !line.startsWith('•'))

  // If we have good existing content, try to preserve it
  if (existingBullets.length >= 3 && existingParagraphs.length >= 2) {
    console.log("Preserving existing content structure with minimal enhancement")
    
    // Use existing opening paragraph or enhance it slightly
    let opening = existingParagraphs[0] || ""
    if (opening.length < 50) {
      const storyElements = extractStoryElementsForTopic(storyData, topicText)
      opening = `Reflecting on my journey, I've learned that "${topicText}" isn't just a concept—it's a lived experience that has shaped who I am today. ${storyElements.openingInsight || "This realization has transformed how I approach both personal and professional challenges."}`
    }

    // Use existing bullet points or enhance them
    const bulletPoints = []
    for (let i = 0; i < Math.max(4, existingBullets.length); i++) {
      if (existingBullets[i]) {
        bulletPoints.push(existingBullets[i])
      } else {
        // Add story-based bullet if needed
        const storyElements = extractStoryElementsForTopic(storyData, topicText)
        const bulletVariations = [
          storyElements.earlyLifeInsight,
          storyElements.careerInsight,
          storyElements.personalInsight,
          storyElements.futureInsight
        ].filter(Boolean)
        
        if (bulletVariations[i]) {
          bulletPoints.push(`• ${bulletVariations[i]}`)
        }
      }
    }

    // Use existing closing or create one
    let closing = existingParagraphs[existingParagraphs.length - 1] || ""
    if (closing.length < 50) {
      const closingVariations = [
        `These experiences have taught me that success isn't just about achieving goals—it's about the journey, the lessons learned, and the person you become along the way. What aspects of your own journey resonate with these insights?`,
        `Looking back on my path, I realize that the most valuable lessons often come from unexpected places. Every challenge has been a stepping stone to something greater. What has your experience taught you about growth and resilience?`,
        `My journey continues to evolve, and I'm grateful for every lesson learned along the way. These experiences have shaped not just my professional path, but my entire worldview. I'd love to learn from your perspective—what insights can you share?`
      ]
      closing = closingVariations[Math.floor(Math.random() * closingVariations.length)]
    }

    // Use extracted hashtags or create relevant ones
    const finalHashtags = hashtags.length > 0 ? hashtags.join(' ') : generateRelevantHashtags(topicText, storyData)

    return `${opening}\n\n${bulletPoints.join("\n\n")}\n\n${closing}\n\n${finalHashtags}`
  }

  // If content is poorly structured, apply full formatting
  console.log("Applying full formatting due to poor structure")
  
  // Remove any existing bullet points to prevent double bullets
  contentWithoutHashtags = contentWithoutHashtags.replace(/•\s*/g, "").trim()

  // Extract sentences for better structuring
  const sentences = contentWithoutHashtags.split(/(?<=[.?!])\s+/).filter(s => s.length > 0)

  // Create enhanced opening paragraph that connects to personal story
  let opening = sentences.slice(0, 3).join(" ")
  if (opening.length < 60) {
    // Enhance opening with personal story context using varied approaches
    const storyElements = extractStoryElementsForTopic(storyData, topicText)
    const openingVariations = [
      `Reflecting on my journey, I've learned that "${topicText}" isn't just a concept—it's a lived experience that has shaped who I am today. ${storyElements.openingInsight || "This realization has transformed how I approach both personal and professional challenges."}`,
      `Throughout my life, "${topicText}" has been more than just a topic—it's been a guiding principle that has influenced every major decision I've made. ${storyElements.openingInsight || "These experiences have taught me invaluable lessons about growth, resilience, and authenticity."}`,
      `When I think about "${topicText}", I'm reminded of the countless moments that have shaped my perspective and approach to life. ${storyElements.openingInsight || "Each experience has contributed to the person I am today and the professional I've become."}`,
      `My journey with "${topicText}" has been anything but linear—it's been filled with twists, turns, and unexpected discoveries. ${storyElements.openingInsight || "These experiences have fundamentally changed how I view success, relationships, and personal fulfillment."}`
    ]
    const randomIndex = Math.floor(Math.random() * openingVariations.length)
    opening = openingVariations[randomIndex]
  }
  
  // Extract potential key ideas for bullet points
  const remaining = sentences.slice(3)

  // Generate 4 bullet points with personal story integration
  const bulletPoints = []
  const storyElements = extractStoryElementsForTopic(storyData, topicText)
  
  for (let i = 0; i < 4; i++) {
    let bulletContent = ""
    
    if (remaining[i] && remaining[i].length > 20) {
      bulletContent = remaining[i].replace(/#\w+/g, '').trim()
    } else {
      // Create bullet points based on personal story elements
      const bulletVariations = [
        storyElements.earlyLifeInsight,
        storyElements.careerInsight,
        storyElements.personalInsight,
        storyElements.futureInsight
      ]
      
      bulletContent = bulletVariations[i] || `Insight ${i + 1} about ${topicText.toLowerCase()} based on my personal journey and experiences.`
    }
    
    bulletPoints.push(`• ${bulletContent}`)
  }

  // Create unique closing paragraphs without topic references
  const closingVariations = [
    `These experiences have taught me that success isn't just about achieving goals—it's about the journey, the lessons learned, and the person you become along the way. What aspects of your own journey resonate with these insights? I'd love to hear your thoughts and stories in the comments below.`,
    `Looking back on my path, I realize that the most valuable lessons often come from unexpected places. Every challenge has been a stepping stone to something greater, and every setback has taught me something new. What has your experience taught you about growth and resilience?`,
    `My journey continues to evolve, and I'm grateful for every lesson learned along the way. These experiences have shaped not just my professional path, but my entire worldview. I'd love to learn from your perspective—what insights can you share about your own journey?`,
    `As I continue to grow and evolve, I remain excited about what the future holds. The journey is far from over, and I believe the best is yet to come. What does growth and development mean to you, and how has it influenced your path?`,
    `These experiences have shown me that true success is about more than just achievements—it's about growth, connection, and making a meaningful impact. Every challenge has been a teacher, and every victory has been a stepping stone. What's your take on building a meaningful career and life?`,
    `Reflecting on these moments, I'm reminded that the most profound growth happens when we step outside our comfort zones. Each experience has contributed to who I am today and who I'm becoming tomorrow. What moments in your journey have shaped you the most?`,
    `The beauty of life's journey is that it's never linear—it's filled with twists, turns, and unexpected discoveries. These experiences have fundamentally changed how I view success, relationships, and personal fulfillment. What unexpected turns have shaped your perspective?`,
    `Every experience has been a teacher, every challenge a lesson, and every success a stepping stone to something greater. I'm constantly amazed by how much we can learn when we remain open to growth. What's the most valuable lesson you've learned recently?`,
    `As I look forward to the next chapter, I'm excited about the possibilities that lie ahead. These experiences have given me the confidence to embrace new challenges and opportunities. What are you most excited about in your own journey?`,
    `The journey of growth and development is ongoing, and I'm grateful for every step along the way. These experiences have taught me that the best stories are still being written. What chapter are you most excited to write in your own story?`
  ]
  const randomClosingIndex = Math.floor(Math.random() * closingVariations.length)
  const closing = closingVariations[randomClosingIndex]

  // Use extracted hashtags or create relevant ones based on topic and story
  const finalHashtags = hashtags.length > 0 ? hashtags.join(' ') : generateRelevantHashtags(topicText, storyData)

  // Combine all formatted parts
  return `${opening}\n\n${bulletPoints.join("\n\n")}\n\n${closing}\n\n${finalHashtags}`
}

// Helper function to extract story elements relevant to the topic with more variety
function extractStoryElementsForTopic(storyData: any, topicText: string): any {
  const elements = {
    openingInsight: "",
    earlyLifeInsight: "",
    careerInsight: "",
    personalInsight: "",
    futureInsight: ""
  }

  if (!storyData) return elements

  // Add randomization for variety
  const randomSeed = Date.now() + Math.random() * 1000

  // Extract insights from different story sections with multiple variations
  if (storyData.early_life) {
    const earlyLifeText = storyData.early_life.toLowerCase()
    const earlyLifeVariations = []
    
    if (earlyLifeText.includes("challenge") || earlyLifeText.includes("difficult")) {
      earlyLifeVariations.push(
        "My early challenges taught me that resilience isn't about avoiding failure—it's about learning to rise stronger each time.",
        "Facing difficulties early in life showed me that every obstacle is actually an opportunity to discover inner strength.",
        "The challenges I encountered as a child became the foundation for my ability to navigate complex situations with confidence.",
        "Early struggles taught me that persistence and determination can overcome any obstacle life throws your way."
      )
    }
    
    if (earlyLifeText.includes("family") || earlyLifeText.includes("parents")) {
      earlyLifeVariations.push(
        "Growing up, my family instilled values that continue to guide my decisions and shape my approach to every challenge.",
        "The lessons learned from my family have become the moral compass that guides my professional and personal decisions.",
        "My family's influence taught me that success is measured not just by achievements, but by the positive impact you have on others.",
        "The values my parents modeled have shaped how I approach relationships, challenges, and opportunities throughout my life."
      )
    }
    
    if (earlyLifeText.includes("school") || earlyLifeText.includes("education")) {
      earlyLifeVariations.push(
        "My early educational experiences taught me that curiosity and a love of learning are the keys to continuous growth.",
        "School showed me that knowledge is power, but applying that knowledge with wisdom is what creates real impact.",
        "The classroom became my first laboratory for understanding how to work with others and solve complex problems.",
        "Education taught me that the best learning happens when you're willing to ask questions and challenge conventional thinking."
      )
    }
    
    // Add generic variations
    earlyLifeVariations.push(
      "My early experiences laid the foundation for understanding that every setback is actually a setup for something greater.",
      "Childhood taught me that the most valuable lessons often come from unexpected places and experiences.",
      "My formative years showed me that authenticity and genuine connection are more valuable than trying to fit in.",
      "Early life experiences taught me that taking risks and stepping outside comfort zones leads to the most meaningful growth."
    )
    
    elements.earlyLifeInsight = earlyLifeVariations[Math.floor(randomSeed) % earlyLifeVariations.length]
  }

  if (storyData.career_journey) {
    const careerText = storyData.career_journey.toLowerCase()
    const careerVariations = []
    
    if (careerText.includes("success") || careerText.includes("achievement")) {
      careerVariations.push(
        "My career journey has shown me that true success comes from adding value to others while staying authentic to your core values.",
        "Achieving professional milestones taught me that sustainable success is built on relationships, integrity, and continuous learning.",
        "Career achievements have reinforced my belief that the best leaders are those who lift others up while pursuing their own goals.",
        "Success in my career has taught me that the most rewarding victories are those that benefit not just me, but my entire team."
      )
    }
    
    if (careerText.includes("change") || careerText.includes("transition")) {
      careerVariations.push(
        "Career transitions taught me that the best opportunities often come disguised as challenges that push you beyond your comfort zone.",
        "Navigating career changes showed me that adaptability and a growth mindset are essential for long-term professional success.",
        "Each career transition taught me something new about myself and helped me discover strengths I didn't know I possessed.",
        "Career pivots have taught me that sometimes the most rewarding paths are the ones you never planned to take."
      )
    }
    
    if (careerText.includes("leadership") || careerText.includes("team")) {
      careerVariations.push(
        "Leading teams has taught me that the best leaders are those who serve their people and create environments where everyone can thrive.",
        "My leadership experience showed me that true influence comes from empowering others to reach their full potential.",
        "Managing teams taught me that diversity of thought and perspective leads to the most innovative solutions.",
        "Leadership roles have reinforced my belief that the most successful organizations are built on trust, communication, and shared vision."
      )
    }
    
    // Add generic variations
    careerVariations.push(
      "Through my professional journey, I've learned that building meaningful relationships is just as important as building skills and expertise.",
      "My career has taught me that the most valuable currency in business is trust, and it's earned through consistent actions over time.",
      "Professional experience has shown me that the best opportunities come to those who are prepared, persistent, and genuinely helpful to others.",
      "My career journey has reinforced that success is not a destination, but a continuous process of growth, learning, and contribution."
    )
    
    elements.careerInsight = careerVariations[Math.floor(randomSeed * 1.5) % careerVariations.length]
  }

  if (storyData.personal_side) {
    const personalText = storyData.personal_side.toLowerCase()
    const personalVariations = []
    
    if (personalText.includes("passion") || personalText.includes("interest")) {
      personalVariations.push(
        "My personal interests have taught me that passion is the fuel that transforms ordinary efforts into extraordinary results.",
        "Pursuing my passions outside of work has shown me that creativity and personal fulfillment enhance professional performance.",
        "My hobbies and interests have taught me that the best ideas often come from unexpected sources and diverse experiences.",
        "Personal passions have taught me that when you love what you do, work becomes play and challenges become opportunities."
      )
    }
    
    if (personalText.includes("hobby") || personalText.includes("activity")) {
      personalVariations.push(
        "My personal activities remind me that balance isn't about perfect equilibrium—it's about finding harmony between different aspects of life.",
        "Engaging in hobbies has taught me that taking time for personal interests actually makes me more effective in my professional life.",
        "My personal activities have shown me that the best solutions often come when you step away from a problem and approach it from a different angle.",
        "Hobbies and personal interests have taught me that life is about more than work—it's about creating a rich, fulfilling experience."
      )
    }
    
    if (personalText.includes("volunteer") || personalText.includes("community")) {
      personalVariations.push(
        "Volunteering has taught me that the most meaningful experiences come from giving back and making a positive impact in your community.",
        "Community involvement has shown me that leadership and service go hand in hand, and both are essential for a fulfilling life.",
        "Giving back has taught me that the best way to find purpose is to help others discover their own potential and possibilities.",
        "Community service has reinforced my belief that we all have a responsibility to use our skills and resources to make the world better."
      )
    }
    
    // Add generic variations
    personalVariations.push(
      "On a personal level, I've discovered that the most fulfilling moments come from pursuing what genuinely excites and challenges you.",
      "My personal life has taught me that the best relationships are built on mutual respect, shared values, and genuine care for each other.",
      "Personal experiences have shown me that the most valuable lessons often come from stepping outside your comfort zone and trying new things.",
      "My personal journey has taught me that authenticity and vulnerability are not weaknesses, but strengths that create deeper connections."
    )
    
    elements.personalInsight = personalVariations[Math.floor(randomSeed * 2) % personalVariations.length]
  }

  if (storyData.future_aspirations) {
    const futureText = storyData.future_aspirations.toLowerCase()
    const futureVariations = []
    
    if (futureText.includes("growth") || futureText.includes("learn")) {
      futureVariations.push(
        "Looking ahead, I'm excited about the continuous learning and growth opportunities that will shape the next chapter of my journey.",
        "My future goals center around never stopping learning and always being open to new experiences and perspectives.",
        "I'm committed to lifelong learning because I believe that the moment you stop growing is the moment you start declining.",
        "Future aspirations include expanding my knowledge and skills while helping others on their own learning and growth journeys."
      )
    }
    
    if (futureText.includes("impact") || futureText.includes("help")) {
      futureVariations.push(
        "My future aspirations center around creating meaningful impact and helping others discover their own potential and possibilities.",
        "I'm driven by the desire to make a positive difference in the lives of others and contribute to something larger than myself.",
        "Future goals include using my experience and knowledge to mentor others and create opportunities for those who need them most.",
        "I aspire to build something that will outlast me and continue to create value for others long after I'm gone."
      )
    }
    
    if (futureText.includes("entrepreneur") || futureText.includes("business")) {
      futureVariations.push(
        "My entrepreneurial aspirations are driven by the desire to solve real problems and create solutions that make people's lives better.",
        "Future business goals include building something from the ground up and creating opportunities for others to grow and succeed.",
        "I'm excited about the possibility of turning my ideas into reality and creating something that has a lasting positive impact.",
        "Entrepreneurial aspirations include taking calculated risks and building something that reflects my values and vision for the future."
      )
    }
    
    // Add generic variations
    futureVariations.push(
      "The future holds endless possibilities, and I'm committed to approaching each new opportunity with curiosity, courage, and authenticity.",
      "My future vision includes continuing to grow, learn, and contribute while staying true to my core values and principles.",
      "Looking ahead, I'm excited about the unknown possibilities and the opportunity to create something meaningful and lasting.",
      "Future aspirations include making the most of every opportunity while helping others achieve their own dreams and goals."
    )
    
    elements.futureInsight = futureVariations[Math.floor(randomSeed * 2.5) % futureVariations.length]
  }

  return elements
}

// Helper function to generate relevant hashtags based on topic and story
function generateRelevantHashtags(topicText: string, storyData: any): string {
  const baseHashtags = ["#PersonalGrowth", "#CareerJourney", "#ProfessionalDevelopment"]
  
  // Add topic-specific hashtags
  const topicLower = topicText.toLowerCase()
  if (topicLower.includes("leadership")) {
    baseHashtags.push("#Leadership", "#TeamBuilding")
  } else if (topicLower.includes("success")) {
    baseHashtags.push("#Success", "#Motivation")
  } else if (topicLower.includes("challenge")) {
    baseHashtags.push("#Resilience", "#OvercomingChallenges")
  } else if (topicLower.includes("learning")) {
    baseHashtags.push("#ContinuousLearning", "#Education")
  } else if (topicLower.includes("career")) {
    baseHashtags.push("#CareerGrowth", "#ProfessionalLife")
  } else {
    baseHashtags.push("#Inspiration", "#LinkedIn")
  }

  // Add story-specific hashtags if available
  if (storyData) {
    if (storyData.career_journey && storyData.career_journey.toLowerCase().includes("entrepreneur")) {
      baseHashtags.push("#Entrepreneurship")
    }
    if (storyData.personal_side && storyData.personal_side.toLowerCase().includes("mentor")) {
      baseHashtags.push("#Mentorship")
    }
  }

  return baseHashtags.slice(0, 5).join(" ")
}

