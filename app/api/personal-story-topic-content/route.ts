import { type NextRequest, NextResponse } from "next/server"
// @ts-ignore
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { PersonalStoryService } from "@/lib/personal-story-service"
import { aiService } from "@/lib/ai-service"

// Enhanced formatting function for better content structure
function enhanceContentFormatting(content: string, topicText: string = "this topic"): string {
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
    const cleanSentence = sentence.replace(hashtagRegex, '').trim()
    bulletPoints.push(`• ${cleanSentence}`)
  }

  // Closing paragraph with inspirational wrap-up
  const closing = `Ultimately, my experiences around "${topicText}" have shaped who I am today — reminding me that growth often begins where comfort ends. Embrace your own journey, and you'll uncover new paths to success.`

  // Use extracted hashtags or default ones
  const finalHashtags = hashtags.length > 0 ? hashtags.join(' ') : "#PersonalGrowth #CareerJourney #Inspiration #ProfessionalDevelopment #Motivation"

  // Combine all formatted parts
  return `${opening}\n\n${bulletPoints.join("\n\n")}\n\n${closing}\n\n${finalHashtags}`
}

// Ensure proper structure with post-processing and validation
function ensureProperStructure(content: string): string {
  const lines = content.split('\n').map(line => line.trim()).filter(line => line.length > 0)
  
  if (lines.length === 0) return content
  
  // Check if content already has proper structure
  const hasBulletPoints = lines.some(line => line.startsWith('•'))
  const hasHashtags = lines.some(line => line.startsWith('#'))
  const bulletCount = lines.filter(line => line.startsWith('•')).length
  
  // If content already has proper structure with 4 bullet points, return as is
  if (hasBulletPoints && hasHashtags && bulletCount >= 4) {
    return content
  }
  
  // If content is missing structure, restructure it
  if (!hasBulletPoints || bulletCount < 4) {
    const text = lines.join(' ')
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 10)
    
    if (sentences.length >= 3) {
      // Create opening paragraph from first 2-3 sentences
      const opening = sentences.slice(0, Math.min(3, sentences.length)).join('. ') + '.'
      
      // Create bullet points from remaining sentences or use defaults
      const bulletPoints = []
      if (sentences.length > 3) {
        for (let i = 3; i < Math.min(7, sentences.length); i++) {
          bulletPoints.push(sentences[i].trim() + '.')
        }
      }
      
      // Ensure we have exactly 4 bullet points
      const defaultBullets = [
        'Focus on continuous learning and growth in your professional journey',
        'Embrace challenges as opportunities for development and improvement',
        'Build meaningful connections and relationships that support your goals',
        'Share your knowledge and experiences to help others succeed'
      ]
      
      while (bulletPoints.length < 4) {
        bulletPoints.push(defaultBullets[bulletPoints.length])
      }
      
      // Create closing paragraph
      const remainingSentences = sentences.slice(7)
      const closing = remainingSentences.length > 0 
        ? remainingSentences.join('. ') + '.'
        : 'Remember, every experience is a stepping stone to growth and success. The key is to learn, adapt, and continue moving forward with purpose and determination.'
      
      // Add hashtags if missing
      const hashtags = hasHashtags 
        ? lines.filter(line => line.startsWith('#')).join(' ')
        : '#PersonalGrowth #ProfessionalDevelopment #Learning #Success #Leadership'
      
      return `${opening}

• ${bulletPoints[0]}
• ${bulletPoints[1]}
• ${bulletPoints[2]}
• ${bulletPoints[3]}

${closing}

${hashtags}`
    }
  }
  
  return content
}

export async function POST(request: NextRequest) {
  try {
    // Get user session for authentication
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    const body = await request.json()
    const { topicText, contentType = "linkedin-post" } = body

    // Validate required fields
    if (!topicText) {
      return NextResponse.json({ 
        error: "Topic text is required",
        required: ["topicText"],
        optional: ["contentType"]
      }, { status: 400 })
    }

    // Check credits before processing
    try {
      const creditResponse = await fetch(`${request.nextUrl.origin}/api/credits/deduct`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Cookie": request.headers.get("cookie") || ""
        },
        body: JSON.stringify({ 
          actionType: "ai_linkedin-post",
          description: `Personal story topic content generation for: ${topicText}`
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

    // Get user's personal story data
    const storyData = await PersonalStoryService.getUserStoryData(session.user.email!)
    if (!storyData) {
      return NextResponse.json({ 
        error: "Personal story not found",
        suggestion: "Please create your personal story first"
      }, { status: 404 })
    }

    // Build contextual story context for the specific topic
    const storyContext = PersonalStoryService.buildContextualStoryContext(storyData, topicText)
    
    // Create enhanced prompt specifically for personal story topics with detailed integration
    const enhancedPrompt = `<personal_story_topic_content_creation>
You are an expert personal branding content creator specializing in transforming personal life experiences into compelling, professional LinkedIn content. Your task is to create authentic, engaging content that showcases unique life experiences based on the user's personal story data.

PERSONAL STORY CONTEXT:
${storyContext}

TOPIC TO ADDRESS: "${topicText}"
CONTENT TYPE: ${contentType}

<detailed_personal_story_analysis>
Based on the personal story data provided above, analyze and extract the most relevant elements for the topic "${topicText}":

1. EARLY LIFE CONNECTIONS: How do the early life experiences relate to this topic?
2. EDUCATION INSIGHTS: What educational experiences provide relevant context?
3. CAREER JOURNEY LESSONS: Which career experiences offer valuable insights for this topic?
4. PERSONAL SIDE RELEVANCE: How do personal interests/hobbies connect to this topic?
5. CURRENT IDENTITY ALIGNMENT: What current professional identity elements are relevant?
6. FUTURE ASPIRATIONS LINK: How do future goals connect to this topic?

Use these connections to create a rich, detailed narrative that feels authentic and personal.
</detailed_personal_story_analysis>

<content_creation_strategy>
- DEEP DIVE into personal story elements that directly relate to "${topicText}"
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
Generate exactly 1 comprehensive, detailed content piece focused on "${topicText}"
- Transform personal story elements into original, engaging narratives
- Create content that is SUBSTANTIAL, DETAILED, and MEANINGFUL
- Ensure content is ready to publish and provides real value
- Follow the mandatory formatting structure exactly
- Make content feel authentic and unique to this person's journey
- Include specific details and examples from their personal story
- Create content that sparks engagement and provides actionable insights

CRITICAL: The content must be SUBSTANTIAL and DETAILED, not short or superficial. Each section should provide meaningful value and specific insights based on the personal story data.
</output_requirements>
</personal_story_topic_content_creation>`

    // Generate content using the centralized AI service with enhanced parameters for better content
    const response = await aiService.generateContent(
      contentType,
      enhancedPrompt,
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
        detailedContent: true, // Flag for detailed content generation
        specificExamples: true, // Ensure specific examples are included
        actionableInsights: true // Ensure actionable insights are provided
      },
      session.user.id,
      session.user.email
    )

    // Parse the generated content
    let content = ""
    if (Array.isArray(response.content)) {
      content = response.content[0] || ""
    } else if (typeof response.content === 'string') {
      content = response.content
    } else if (response.content && typeof response.content === 'object') {
      content = response.content.content || response.content.text || JSON.stringify(response.content)
    }

    // Ensure content is not empty
    if (!content || content.trim().length === 0) {
      throw new Error("Generated content is empty")
    }

    // Clean the content to remove any formatting issues
    content = content
      .replace(/^(Post\s*\d*:?\s*)/i, '')
      .replace(/^\d+\.\s*/, '')
      .replace(/^---POST_SEPARATOR---\s*/g, '')
      .replace(/^---\s*/g, '')
      .replace(/^###\s*/g, '')
      .trim()

    // Remove any bold formatting that might have slipped through
    content = content
      .replace(/\*\*(.*?)\*\*/g, '$1')
      .replace(/\*(.*?)\*/g, '$1')
      .replace(/_(.*?)_/g, '$1')
      .replace(/`(.*?)`/g, '$1')
      .replace(/~~(.*?)~~/g, '$1')
      .replace(/\s+/g, ' ')
      .trim()

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
      console.log("Content needs formatting - applying enhanced formatting")
      console.log("Content analysis:", { hasOpeningParagraph, hasBulletPoints, hasHashtags, bulletCount, hasDoubleBullets, contentLength: content.length })
      content = enhanceContentFormatting(content, topicText)
    } else {
      console.log("Content already has proper structure - skipping formatting completely")
      console.log("Content analysis:", { hasOpeningParagraph, hasBulletPoints, hasHashtags, bulletCount, hasDoubleBullets, contentLength: content.length })
      // Just clean up any extra whitespace and return as-is
      content = content.replace(/\n\s*\n/g, '\n\n').trim()
    }

    return NextResponse.json({ 
      success: true,
      content: {
        content: content,
        topic: topicText,
        contentType: contentType,
        wordCount: content.split(' ').length,
        generatedAt: new Date().toISOString()
      },
      metadata: {
        model: response.metadata.model,
        tokensUsed: response.metadata.tokensUsed,
        cost: response.metadata.cost,
        isPersonalized: true,
        personalStoryIntegration: true
      }
    })
  } catch (error) {
    console.error("Error in personal story topic content generation API:", error)
    return NextResponse.json({ 
      error: "Failed to generate personal story topic content",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 })
  }
}
