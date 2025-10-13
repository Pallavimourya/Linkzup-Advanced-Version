import { type NextRequest, NextResponse } from "next/server"
// @ts-ignore
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { PersonalStoryService } from "@/lib/personal-story-service"
import { aiService } from "@/lib/ai-service"

// Enhanced formatting function for better content structure
function enhanceContentFormatting(content: string): string {
  // First, clean up the content by removing extra spaces and fixing bullet points
  let cleaned = content
    .replace(/\s+/g, ' ') // Replace multiple spaces with single space
    .replace(/•\s*•/g, '•') // Fix double bullet points
    .trim()
  
  // Remove duplicate sentences by splitting into sentences and deduplicating
  const sentences = cleaned.split(/[.!?]+/).filter(s => s.trim().length > 10)
  const uniqueSentences = [...new Set(sentences.map(s => s.trim()))]
  
  if (uniqueSentences.length === 0) return content
  
  let formattedLines: string[] = []
  
  // Find the opening paragraph (first 1-2 sentences)
  const openingSentences = uniqueSentences.slice(0, 2)
  if (openingSentences.length > 0) {
    const opening = openingSentences.join('. ') + '.'
    formattedLines.push(opening)
    formattedLines.push('') // Add blank line
  }
  
  // Extract and clean bullet points from the content
  const bulletMatches = cleaned.match(/•\s*([^•#]+)/g)
  if (bulletMatches && bulletMatches.length > 0) {
    const uniqueBullets = [...new Set(bulletMatches.map(bullet => {
      const cleanBullet = bullet.replace(/^•\s*/, '').trim()
      return cleanBullet.length > 0 ? cleanBullet : null
    }).filter(Boolean))]
    
    // Take up to 4 unique bullet points
    uniqueBullets.slice(0, 4).forEach(bullet => {
      formattedLines.push(`• ${bullet}`)
    })
    formattedLines.push('') // Add blank line after bullets
  }
  
  // Find the closing paragraph (remaining sentences that aren't bullets and aren't hashtags)
  const remainingSentences = uniqueSentences.slice(2).filter(s => {
    const text = s.trim()
    return text.length > 20 && 
           !text.includes('•') && 
           !text.includes('#') &&
           !text.toLowerCase().includes('hashtag') &&
           !text.toLowerCase().includes('innovation thrives') && // Remove common ending phrases
           !text.toLowerCase().includes('my family instilled') && // Remove personal story elements
           !text.toLowerCase().includes('finally, i aim') && // Remove future aspirations
           !text.toLowerCase().includes('remember, every experience') // Remove common closing phrases
  })
  
  if (remainingSentences.length > 0) {
    // Take the first 1-2 sentences for closing, avoiding duplicates
    const closingSentences = remainingSentences.slice(0, 2)
    const closing = closingSentences.join('. ') + '.'
    formattedLines.push(closing)
    formattedLines.push('') // Add blank line
  }
  
  // Extract and clean hashtags
  const hashtagMatches = cleaned.match(/#\w+/g)
  if (hashtagMatches && hashtagMatches.length > 0) {
    const uniqueHashtags = [...new Set(hashtagMatches)]
    const hashtags = uniqueHashtags.slice(0, 5).join(' ') // Limit to 5 hashtags
    formattedLines.push(hashtags)
  }
  
  return formattedLines.join('\n')
}

// Ensure proper structure with post-processing
function ensureProperStructure(content: string): string {
  const lines = content.split('\n').map(line => line.trim()).filter(line => line.length > 0)
  
  if (lines.length === 0) return content
  
  // Check if content already has proper structure
  const hasBulletPoints = lines.some(line => line.startsWith('•'))
  const hasHashtags = lines.some(line => line.startsWith('#'))
  
  if (hasBulletPoints && hasHashtags) {
    return content // Already properly structured
  }
  
  // If content is just a single paragraph, restructure it
  if (lines.length <= 3 && !hasBulletPoints) {
    const text = lines.join(' ')
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 10)
    
    if (sentences.length >= 3) {
      const opening = sentences.slice(0, 2).join('. ') + '.'
      const bullet1 = sentences[2] ? sentences[2].trim() + '.' : 'Focus on continuous learning and growth.'
      const bullet2 = sentences[3] ? sentences[3].trim() + '.' : 'Embrace challenges as opportunities for development.'
      const bullet3 = sentences[4] ? sentences[4].trim() + '.' : 'Build meaningful connections and relationships.'
      const bullet4 = sentences[5] ? sentences[5].trim() + '.' : 'Share your knowledge and experiences with others.'
      const closing = sentences.length > 6 ? sentences.slice(6).join('. ') + '.' : 'Remember, every experience is a stepping stone to success.'
      
      return `${opening}

• ${bullet1}
• ${bullet2}
• ${bullet3}
• ${bullet4}

${closing}

#PersonalGrowth #ProfessionalDevelopment #Learning #Success`
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
    
    // Create enhanced prompt specifically for personal story topics with no bold formatting
    const enhancedPrompt = `<personal_story_topic_content_creation>
You are a personal branding expert creating authentic, engaging content that showcases unique life experiences based on personal story topics.

${storyContext}

<content_brief>
Topic: "${topicText}"
Content Type: ${contentType}
</content_brief>

<personal_story_integration_strategy>
- Analyze ALL 6 life sections for relevant connections to "${topicText}"
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
- Generate 1 distinct content piece
- Must incorporate elements from multiple life sections
- Create natural connections between topic and personal experiences
- Use specific details to make content memorable and relatable
- Ensure content reflects complete personal journey
- Make content complete and ready to publish
- Avoid generic content that could apply to anyone
- NO generic titles or headings like "My Journey from..." or "Building a Life of..."
- Start directly with the content, clean and natural
- NEVER copy user answers word-for-word
- Transform user experiences into unique, creative narratives
- Add storytelling elements like dialogue, emotions, and scenes
- Create original content inspired by user experiences, not copied from them
- Make the story unique and engaging with creative interpretation
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
- NO bold formatting (**text**) or markdown formatting
- Use plain text only, no special formatting
- Create completely unique content based on the user's specific topic
- Avoid repetitive or generic content patterns
- Structure with compelling hook, clear bullet points, and strong conclusion
- Include 3-5 relevant hashtags at the end
- Make it suitable for LinkedIn posting
</quality_standards>

<formatting_requirements>
- Clean, scannable layout with proper structure
- Opening paragraph: 2-3 sentences introducing the topic
- Bullet points: Each on separate line with • symbol, 1-2 sentences each
- Closing paragraph: 1-2 sentences with encouragement or call-to-action
- Hashtags: 3-5 relevant hashtags at the end on separate line
- Professional yet engaging tone
- No generic phrases or fluff
- No forced engagement prompts
- NO generic titles or headings like "My Journey from..." or "Building a Life of..."
- Start directly with engaging content
- NO bold formatting (**text**) or markdown formatting
- Use plain text only, no special formatting
- Create completely unique content based on the user's specific topic
- Avoid repetitive or generic content patterns
- Structure: Opening → Bullet Points → Closing → Hashtags
</formatting_requirements>

<output_deliverable>
Generate exactly 1 unique, creative content piece focused on "${topicText}"
Transform personal story elements into original, engaging narratives - do NOT copy user answers directly
Content should be clean, natural, creative, and ready to publish without generic titles

CRITICAL FORMATTING REQUIREMENTS - MANDATORY:
You MUST generate content in this EXACT format. Do not deviate:

1. Start with 2-3 sentence opening paragraph (40-60 words)
2. Add a blank line
3. Add exactly 4 bullet points using • symbol (each on separate line, 30-40 words each)
4. Add a blank line  
5. Add 1-2 sentence closing paragraph (30-40 words)
6. Add a blank line
7. Add 3-5 hashtags on final line
8. TOTAL WORD COUNT: Minimum 200 words

EXAMPLE FORMAT (copy this structure exactly):

Growing up in a close-knit family, I learned early on that diverse perspectives enrich our understanding and foster growth. This became even clearer during my educational journey and professional career, where collaboration with individuals from various backgrounds ignited my passion for learning and mentorship.

• Embrace different viewpoints to expand your understanding and challenge your assumptions
• Seek out diverse teams and environments that push you beyond your comfort zone
• Practice active listening to truly understand perspectives different from your own
• Share your own experiences while remaining open to learning from others

Remember, growth happens when we step outside our echo chambers and engage with ideas that challenge us. The most meaningful connections and learning opportunities often come from those who see the world differently than we do.

#DiversityAndInclusion #PersonalGrowth #Collaboration #Learning #Mentorship

MANDATORY: Follow this exact structure. Do not deviate from this format.
</output_deliverable>
</personal_story_topic_content_creation>`

    // Generate content using the centralized AI service with personal story integration
    const response = await aiService.generateContent(
      contentType,
      enhancedPrompt,
      "openai",
      {
        model: "gpt-3.5-turbo", // Use free model
        tone: "professional",
        targetAudience: "LinkedIn professionals",
        mainGoal: "engagement",
        includeHashtags: true,
        includeEmojis: true,
        callToAction: true,
        wordCount: 250,
        temperature: 0.85, // Higher temperature for more creativity
        maxTokens: 1000,
        personalTouch: true,
        storytelling: true,
        humanLike: true,
        randomness: 80,
        ambiguity: 70,
        emotionalDepth: 75,
        conversationalStyle: true
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

    // Apply enhanced formatting for better structure
    content = enhanceContentFormatting(content)
    
    // Ensure proper structure with post-processing
    content = ensureProperStructure(content)

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
