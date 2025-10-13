import OpenAI from "openai"
import { PersonalStoryService, type PersonalStoryData } from "./personal-story-service"

// AI Provider Types
  export type AIProvider = "openai" | "perplexity" // OpenAI + Perplexity with smart routing

// OpenAI Model Types
export type OpenAIModel = "gpt-4" | "gpt-3.5-turbo" | "gpt-4o-mini"

// Content Generation Types
export type ContentType = "linkedin-post" | "article" | "topics" | "carousel" | "story" | "list" | "quote" | "before-after" | "tips" | "insights" | "question"

// Customization Options Interface
export interface CustomizationOptions {
  tone?: "professional" | "casual" | "friendly" | "authoritative" | "conversational" | "inspirational"
  language?: string
  wordCount?: number
  targetAudience?: string
  mainGoal?: "engagement" | "awareness" | "conversion" | "education" | "entertainment"
  format?: ContentType
  niche?: string
  includeHashtags?: boolean
  includeEmojis?: boolean
  callToAction?: boolean
  temperature?: number
  maxTokens?: number
  humanLike?: boolean
  ambiguity?: number
  randomness?: number
  personalTouch?: boolean
  storytelling?: boolean
  emotionalDepth?: number
  conversationalStyle?: boolean
  model?: OpenAIModel // Allow model selection
}

// Request Interface
export interface AIRequest {
  id: string
  type: ContentType
  prompt: string
  provider: AIProvider
  customization: CustomizationOptions
  userId?: string
  userEmail?: string
  priority?: "low" | "normal" | "high"
  createdAt: Date
}

// Response Interface
export interface AIResponse {
  id: string
  requestId: string
  content: string | string[]
  metadata: {
    provider: AIProvider
    model: string
    tokensUsed: number
    processingTime: number
    cost: number
  }
  status: "success" | "error"
  error?: string
  createdAt: Date
}

// Queue Item Interface
export interface QueueItem {
  request: AIRequest
  resolve: (response: AIResponse) => void
  reject: (error: Error) => void
}

class AIService {
  private queue: QueueItem[] = []
  private isProcessing = false
  private maxConcurrentRequests = 3
  private activeRequests = 0
  private openai: OpenAI | null = null

  constructor() {
    // Lazy initialization to avoid build-time errors
  }

  private getOpenAI(): OpenAI {
    if (!this.openai) {
      if (!process.env.OPENAI_API_KEY) {
        throw new Error("OPENAI_API_KEY environment variable is required")
      }
      this.openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
      })
    }
    return this.openai
  }

  // Generate unique request ID
  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  // Add request to queue
  private async addToQueue(request: AIRequest): Promise<AIResponse> {
    return new Promise((resolve, reject) => {
      this.queue.push({ request, resolve, reject })
      this.processQueue()
    })
  }

  // Process queue
  private async processQueue() {
    if (this.isProcessing || this.activeRequests >= this.maxConcurrentRequests) {
      return
    }

    this.isProcessing = true

    while (this.queue.length > 0 && this.activeRequests < this.maxConcurrentRequests) {
      const item = this.queue.shift()
      if (item) {
        this.activeRequests++
        this.processRequest(item.request, item.resolve, item.reject)
      }
    }

    this.isProcessing = false
  }

  // Process individual request
  private async processRequest(
    request: AIRequest,
    resolve: (response: AIResponse) => void,
    reject: (error: Error) => void
  ) {
    const startTime = Date.now()

    try {
      let content: string | string[]
      let model: string
      let tokensUsed: number
      let cost: number

       // Smart provider selection with fallback system
       if (request.provider === "perplexity") {
         try {
           const perplexityResult = await this.generateWithPerplexity(request)
           content = perplexityResult.content
           model = perplexityResult.model
           tokensUsed = perplexityResult.tokensUsed
           cost = perplexityResult.cost
         } catch (perplexityError) {
           console.warn("Perplexity generation failed, trying OpenAI:", perplexityError)
           const openaiResult = await this.generateWithOpenAI(request)
           content = openaiResult.content
           model = openaiResult.model
           tokensUsed = openaiResult.tokensUsed
           cost = openaiResult.cost
         }
       } else {
         // Default to OpenAI with Perplexity fallback
      try {
        const openaiResult = await this.generateWithOpenAI(request)
        content = openaiResult.content
        model = openaiResult.model
        tokensUsed = openaiResult.tokensUsed
        cost = openaiResult.cost
      } catch (openaiError) {
        console.warn("OpenAI generation failed, trying Perplexity:", openaiError)
        const perplexityResult = await this.generateWithPerplexity(request)
        content = perplexityResult.content
        model = perplexityResult.model
        tokensUsed = perplexityResult.tokensUsed
        cost = perplexityResult.cost
         }
      }

      const response: AIResponse = {
        id: `resp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        requestId: request.id,
        content,
        metadata: {
          provider: request.provider,
          model,
          tokensUsed,
          processingTime: Date.now() - startTime,
          cost,
        },
        status: "success",
        createdAt: new Date(),
      }

      resolve(response)
    } catch (error) {
      const response: AIResponse = {
        id: `resp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        requestId: request.id,
        content: "",
        metadata: {
          provider: request.provider,
          model: "",
          tokensUsed: 0,
          processingTime: Date.now() - startTime,
          cost: 0,
        },
        status: "error",
        error: error instanceof Error ? error.message : "Unknown error",
        createdAt: new Date(),
      }

      reject(new Error(response.error || "Unknown error"))
    } finally {
      this.activeRequests--
      this.processQueue() // Process next item in queue
    }
  }

  // Generate content with OpenAI
  private async generateWithOpenAI(request: AIRequest) {
    const prompt = await this.buildPrompt(request)
    const { temperature = 0.7, maxTokens = 2000, model = "gpt-3.5-turbo" } = request.customization

    // Smart model selection based on content type
    const optimalModel = this.getOptimalModel(request.type, request.customization)
    const finalModel = model === "gpt-3.5-turbo" ? optimalModel : model

    // Use dynamic temperature for variety
    const completion = await this.getOpenAI().chat.completions.create({
      model: finalModel, // Use optimized model selection
      messages: [{ role: "user", content: prompt }],
      temperature: temperature, // Use the temperature from customization
      max_tokens: maxTokens,
    })

    const content = completion.choices[0]?.message?.content
    if (!content) throw new Error("No content generated by OpenAI")

    // Parse content based on type - all types now return 2 variations
    let parsedContent: string | string[]
    switch (request.type) {
      case "linkedin-post":
        parsedContent = this.parseLinkedInPosts(content)
        break
      case "topics":
        parsedContent = this.parseTopics(content)
        break
      case "article":
        parsedContent = this.parseMultipleContent(content, "article")
        break
      case "story":
        // For story, we want a single story, not multiple variations
        parsedContent = [cleanAndFormatContent(content)]
        break
      case "carousel":
        // For carousel, we want the raw content to parse as JSON, not split into variations
        parsedContent = [content]
        break
      case "list":
        parsedContent = this.parseMultipleContent(content, "list")
        break
      case "quote":
        parsedContent = this.parseMultipleContent(content, "quote")
        break
      case "before-after":
        parsedContent = this.parseMultipleContent(content, "before-after")
        break
      case "tips":
        parsedContent = this.parseMultipleContent(content, "tips")
        break
      case "insights":
        parsedContent = this.parseMultipleContent(content, "insights")
        break
      case "question":
        parsedContent = this.parseMultipleContent(content, "question")
        break
      default:
        // Apply formatting to default content as well
        parsedContent = [cleanAndFormatContent(content)]
    }

    const usage = completion.usage
    return {
      content: parsedContent,
      model: model,
      tokensUsed: usage?.total_tokens || 0,
      cost: this.calculateOpenAICost(usage?.total_tokens || 0, usage?.prompt_tokens || 0, usage?.completion_tokens || 0, model),
    }
  }


  // Generate content with Perplexity (fallback)
  private async generateWithPerplexity(request: AIRequest) {
    const { perplexity } = await import("@ai-sdk/perplexity")
    const { generateText } = await import("ai")
    
    const prompt = await this.buildPrompt(request)

    const response = await generateText({
      model: perplexity("llama-3.1-sonar-small-128k"),
      prompt,
    })

    const content = response.text
    if (!content) throw new Error("No content generated by Perplexity")

    // Parse content based on type
    let parsedContent: string | string[]
    switch (request.type) {
      case "linkedin-post":
        parsedContent = this.parseLinkedInPosts(content)
        break
      case "topics":
        parsedContent = this.parseTopics(content)
        break
      case "story":
        // For story, apply formatting
        parsedContent = [cleanAndFormatContent(content)]
        break
      default:
        // Apply formatting to default content as well
        parsedContent = [cleanAndFormatContent(content)]
    }

    return {
      content: parsedContent,
      model: "llama-3.1-sonar-small-128k",
      tokensUsed: response.usage?.totalTokens || 0,
      cost: this.calculatePerplexityCost(response.usage?.totalTokens || 0),
    }
  }

  // Build prompt based on request type and customization
  private async buildPrompt(request: AIRequest): Promise<string> {
    const { type, prompt, customization, userEmail } = request
    
    // Determine the approach based on whether userEmail is provided
    const isTopicBasedApproach = !!userEmail
    const isUniqueContentApproach = !userEmail
    
    // Get personal story context for both approaches when userEmail is provided
    let personalStoryContext = ""
    if (userEmail) {
      try {
        const storyData = await PersonalStoryService.getUserStoryData(userEmail)
        if (storyData) {
          if (isTopicBasedApproach) {
            // For topic-based approach, use full story context
            personalStoryContext = PersonalStoryService.buildStoryContext(storyData)
          } else {
            // For custom posts, use contextual story selection
            personalStoryContext = PersonalStoryService.buildContextualStoryContext(storyData, prompt)
          }
        }
      } catch (error) {
        console.log("Could not fetch personal story data:", error)
      }
    }
    const {
      tone = "professional",
      language = "english",
      wordCount = 200,
      targetAudience = "LinkedIn professionals",
      mainGoal = "engagement",
      format,
      niche,
      includeHashtags = true,
      includeEmojis = true,
      callToAction = true,
      humanLike = false,
      ambiguity = 50,
      randomness = 30,
      personalTouch = false,
      storytelling = false,
      emotionalDepth = 60,
      conversationalStyle = false,
    } = customization

    // Build human-like writing instructions
    const humanLikeInstructions = humanLike ? this.buildHumanLikeInstructions({
      ambiguity,
      randomness,
      personalTouch,
      storytelling,
      emotionalDepth,
      conversationalStyle,
    }) : ""

    let basePrompt = ""

    switch (type) {
      case "linkedin-post":
        if (isTopicBasedApproach) {
          // Topic-based approach: Use personal story + topic
          basePrompt = `<linkedin_content_creation>
You are a viral LinkedIn content creator with expertise in professional storytelling and engagement optimization.

<content_brief>
Topic: "${prompt}"
Tone: ${tone}
Language: ${language}
Word Count: ~${wordCount} words
Audience: ${targetAudience}
Goal: ${mainGoal}
</content_brief>

${personalStoryContext ? `<personal_story_integration>
${personalStoryContext}

<story_connection_strategy>
- Identify the most relevant personal experiences for this topic
- Create natural bridges between personal story and professional insights
- Use specific details to build authenticity and relatability
- Maintain professional credibility while being personal
</story_connection_strategy>
</personal_story_integration>` : ''}

<viral_optimization_framework>
1. Hook Creation: Start with unexpected insights or contrarian takes
2. Value Delivery: Provide actionable, specific advice
3. Personal Connection: Weave in authentic experiences naturally
4. Engagement Triggers: Create content that sparks discussion
5. Professional Authority: Maintain credibility and expertise
</viral_optimization_framework>

<content_structure>
Opening: Compelling hook (1-2 sentences)
Body: 3-4 key insights with bullet points
• Each bullet on new line with proper spacing
• Specific, actionable advice
• Personal examples when relevant
Closing: Strong takeaway or call-to-action
</content_structure>

<formatting_requirements>
- Clean, scannable layout with proper structure
- Opening paragraph: 2-3 sentences introducing the topic
- Bullet points: Each on separate line with • symbol, 1-2 sentences each
- Closing paragraph: 1-2 sentences with encouragement or call-to-action
- Hashtags: 3-5 relevant hashtags at end on separate line
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

<output_specification>
Generate 2 distinct posts, each separated by "---POST_SEPARATOR---"
Each post should be complete and ready to publish
Focus on "${prompt}"${personalStoryContext ? ' with authentic personal elements' : ''}

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
</output_specification>
</linkedin_content_creation>`
        } else {
          // Custom content approach: Use contextual personal story if available
          basePrompt = `<custom_linkedin_content>
You are a creative LinkedIn content strategist specializing in unique, engaging professional content.

<content_request>
User Input: "${prompt}"
Tone: ${tone}
Language: ${language}
Word Count: ~${wordCount} words
Audience: ${targetAudience}
Goal: ${mainGoal}
</content_request>

${personalStoryContext ? `<personal_story_context>
${personalStoryContext}

<integration_approach>
- Analyze user input for connection opportunities with personal story
- Select most relevant personal experiences for authentic integration
- Create natural bridges between user's idea and personal insights
- Maintain professional credibility while adding personal touch
</integration_approach>
</personal_story_context>` : ''}

<creative_content_strategy>
1. Unique Angle: Find fresh perspective on the user's input
2. Value Addition: Provide actionable insights and takeaways
3. Authenticity: ${personalStoryContext ? 'Weave in relevant personal experiences naturally' : 'Create genuine, relatable content'}
4. Engagement: Design content that encourages interaction
5. Professionalism: Maintain industry credibility and authority
</creative_content_strategy>

<content_architecture>
Hook: Attention-grabbing opening (1-2 sentences)
Development: 3-4 key points with bullet structure
• Each bullet on separate line
• Specific, actionable advice
• ${personalStoryContext ? 'Personal examples when relevant' : 'Concrete examples and insights'}
Resolution: Strong conclusion with clear takeaway
</content_architecture>

<optimization_requirements>
- Clean, scannable layout with proper structure
- Opening paragraph: 2-3 sentences introducing the topic
- Bullet points: Each on separate line with • symbol, 1-2 sentences each
- Closing paragraph: 1-2 sentences with encouragement or call-to-action
- Hashtags: 3-5 relevant hashtags at end on separate line
- Professional yet engaging tone
- No generic phrases or clichés
- No forced engagement prompts
- Ready-to-publish format
- NO generic titles or headings like "My Journey from..." or "Building a Life of..."
- Start directly with engaging content
- NO bold formatting (**text**) or markdown formatting
- Use plain text only, no special formatting
- Create completely unique content based on the user's specific topic
- Avoid repetitive or generic content patterns
- Structure: Opening → Bullet Points → Closing → Hashtags
</optimization_requirements>

<output_deliverable>
Generate 2 distinct posts separated by "---POST_SEPARATOR---"
Each post should be complete and optimized for LinkedIn
Focus on user input: "${prompt}"${personalStoryContext ? ' with authentic personal elements' : ''}

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
</output_deliverable>
</custom_linkedin_content>`
        }
        break

      case "topics":
        basePrompt = `<viral_topic_generation>
You are a viral content strategist creating LinkedIn topics that maximize engagement and shares.

<topic_specifications>
Niche: "${niche || prompt}"
Tone: ${tone}
Language: ${language}
Audience: ${targetAudience}
Goal: ${mainGoal}
</topic_specifications>

<viral_topic_framework>
1. Curiosity Gap: Create topics that make people want to know more
2. Contrarian Angle: Challenge conventional wisdom respectfully
3. Personal Transformation: Focus on growth and change stories
4. Behind-the-Scenes: Reveal insider insights and experiences
5. Future-Focused: Predict trends and share forward-thinking perspectives
6. Problem-Solution: Address common professional challenges
</viral_topic_framework>

<engagement_optimization>
- Topics that spark debate and discussion
- Universal professional themes with unique angles
- Emotional hooks (struggle, triumph, learning, failure)
- Actionable insights and clear value propositions
- Trending relevance within the professional sphere
</engagement_optimization>

<output_requirements>
- 5-10 words maximum per topic
- LinkedIn-optimized for professional audience
- Avoid generic or overused topics
- Create titles that are click-worthy and shareable
- Focus on "${prompt}" within the ${niche || "general"} niche
</output_requirements>

Return ONLY a JSON array of strings containing the topic titles.
Example format: ["Title 1", "Title 2"]
</viral_topic_generation>`
        break

      case "article":
        basePrompt = `Generate 2 unique, comprehensive articles about "${prompt}" in the ${niche || "general"} niche.

${personalStoryContext ? `PERSONAL STORY CONTEXT:
${personalStoryContext}

IMPORTANT: Use the personal story context above to create authentic, personalized content that connects the topic "${prompt}" to relevant personal experiences and insights. Weave in specific details from the personal story naturally and make the content feel authentic and relatable.` : ''}

Requirements:
- Create content focused on "${prompt}"${personalStoryContext ? ' while incorporating relevant personal story elements' : ''}
- Tone: ${tone}
- Language: ${language}
- Word count: approximately ${wordCount} words per article
- Target audience: ${targetAudience}
- Main goal: ${mainGoal}
- Include at least 3 bullet points (•) to make content more engaging and scannable
${includeHashtags ? "- Include relevant hashtags" : ""}
${includeEmojis ? "- Use emojis appropriately" : ""}
${callToAction ? "- Include a call-to-action" : ""}
- Make each article unique and different from the others
- Vary the approach, angle, and style for each article
- Do NOT include "Article 1:", "Article 2:", or any numbering prefixes
- Generate content based on the topic and customization settings provided${personalStoryContext ? ', incorporating relevant personal story elements naturally' : ''}

${humanLikeInstructions}

Format the response as 2 distinct articles, each separated by "---POST_SEPARATOR---". Each article should be complete and ready to publish.`
        break

      case "story":
        basePrompt = `<natural_story_creation>
You are a skilled storyteller creating authentic, engaging narratives without generic titles or headings.

<story_specifications>
Topic: "${prompt}"
Tone: ${tone}
Language: ${language}
Word Count: ~${wordCount} words
Audience: ${targetAudience}
Goal: ${mainGoal}
</story_specifications>

${personalStoryContext ? `<personal_story_integration>
${personalStoryContext}

<story_weaving_strategy>
- Select the most relevant personal experiences for this topic
- Create natural narrative flow from personal story to universal insights
- Use specific details to build authenticity and emotional connection
- Maintain professional credibility while being vulnerable and relatable
- Transform user answers into creative, unique narratives
- Add storytelling elements like dialogue, emotions, and scenes
- Create original content inspired by user experiences, not copied from them
- Make each story fresh and engaging with creative interpretation
</story_weaving_strategy>
</personal_story_integration>` : ''}

<story_creation_rules>
- Write a natural, flowing story without titles or headings
- Start directly with the story content
- Use specific details and emotions
- Create authentic vulnerability and relatability
- Show growth and learning through the narrative
- Connect personal experience to universal themes
- End naturally without forced conclusions
- NEVER copy user answers word-for-word
- Transform user experiences into unique, creative narratives
- Use user answers as inspiration, not direct content
- Create original storytelling that reflects the essence of user experiences
- Add creative elements, dialogue, and narrative flow
- Make each story unique and engaging
</story_creation_rules>

<content_structure>
- Begin directly with the story (no title/heading)
- Use natural paragraph breaks
- Include specific details and emotions
- Show clear progression through the narrative
- End with natural conclusion
</content_structure>

<formatting_requirements>
- Clean, natural formatting
- Professional yet personal tone
${includeHashtags ? "- Strategic hashtag placement" : ""}
${includeEmojis ? "- Minimal, purposeful emoji usage" : ""}
- No generic titles like "My Journey from..." or "Building a Life of..."
- No forced engagement prompts
- Natural story ending
- NO bold formatting (**text**) or markdown formatting
- Use plain text only, no special formatting
- Create completely unique content based on the user's specific topic
- Avoid repetitive or generic content patterns
</formatting_requirements>

<output_deliverable>
Generate exactly 1 unique, creative story focused on "${prompt}"
${personalStoryContext ? 'Transform personal story elements into original, engaging narratives - do NOT copy user answers directly' : 'Create authentic, relatable content'}
Story should be clean, natural, creative, and ready to publish without generic titles
Make it a unique story that reflects the essence of experiences, not a copy of them
</output_deliverable>
</natural_story_creation>`
        break

      case "carousel":
        basePrompt = `<carousel_content_creation>
You are a visual content strategist creating engaging carousel content for professional audiences.

<carousel_specifications>
Topic: "${prompt}"
Tone: ${tone}
Slide Count: ${wordCount / 50}
Audience: ${targetAudience}
Goal: ${mainGoal}
</carousel_specifications>

<visual_content_strategy>
1. Hook Slide: Create compelling opening that grabs attention
2. Value Slides: Deliver key insights and actionable content
3. Story Slides: Use narrative elements to maintain engagement
4. Impact Slide: End with strong takeaway or call-to-action
</visual_content_strategy>

<slide_optimization>
- Each slide should be scannable in 3-5 seconds
- Use punchy, memorable headlines
- Include specific, actionable bullet points
- Create visual hierarchy with clear information flow
- Maintain consistent tone throughout all slides
</slide_optimization>

<content_requirements>
- Focus entirely on "${prompt}"
- Make content concise and visually appealing
- Ensure each slide adds unique value
- Create logical progression from slide to slide
- Optimize for mobile viewing and engagement
</content_requirements>

<json_structure>
Return ONLY a valid JSON object with this exact structure:

{
  "slides": [
    {
      "top_line": "string - attention-grabbing opener for slide 1",
      "main_heading": "string - compelling main heading for slide 1", 
      "bullet": "string - one impactful bullet point"
    },
    {
      "heading": "string - clear heading for slide 2 and onwards",
      "bullets": [
        "string - bullet 1",
        "string - bullet 2", 
        "string - bullet 3"
      ]
    },
    {
      "tagline": "string - memorable final tagline for last slide",
      "final_heading": "string - strong final heading",
      "last_bullet": "string - powerful closing bullet point"
    }
  ]
}

<formatting_rules>
- First slide: "top_line", "main_heading", "bullet"
- Middle slides: "heading", "bullets" (array of 3 strings)
- Last slide: "tagline", "final_heading", "last_bullet"
- Keep all text brief and visually scannable
- Ensure JSON is valid and parsable
- NO bold formatting (**text**) or markdown formatting
- Use plain text only, no special formatting
- Create completely unique content based on the user's specific topic
- Avoid repetitive or generic content patterns
</formatting_rules>

Generate exactly ${wordCount / 50} slides. Format as 2 distinct carousels separated by "---POST_SEPARATOR---".
</carousel_content_creation>`
        break

      case "list":
        basePrompt = `Generate 2 unique list-based content pieces about "${prompt}" in the ${niche || "general"} niche.

${personalStoryContext ? `PERSONAL STORY CONTEXT:
${personalStoryContext}

IMPORTANT: Use the personal story context above to create authentic, personalized content that connects the topic "${prompt}" to relevant personal experiences and insights. Weave in specific details from the personal story naturally and make the content feel authentic and relatable.` : ''}

Requirements:
- Create content focused on "${prompt}"${personalStoryContext ? ' while incorporating relevant personal story elements' : ''}
- Tone: ${tone}
- Language: ${language}
- Word count: approximately ${wordCount} words per list
- Target audience: ${targetAudience}
- Main goal: ${mainGoal}
${includeHashtags ? "- Include relevant hashtags" : ""}
${includeEmojis ? "- Use emojis appropriately" : ""}
${callToAction ? "- Include a call-to-action" : ""}
- Make each list unique with different items and approaches
- Vary the number of items and list structure
- Generate content based on the topic and customization settings provided${personalStoryContext ? ', incorporating relevant personal story elements naturally' : ''}

${humanLikeInstructions}

Format the response as 2 distinct lists, each separated by "---POST_SEPARATOR---". Each list should be complete and ready to publish.`
        break

      case "quote":
        basePrompt = `Generate 2 unique inspirational quote posts about "${prompt}" in the ${niche || "general"} niche.

${personalStoryContext ? `PERSONAL STORY CONTEXT:
${personalStoryContext}

IMPORTANT: Use the personal story context above to create authentic, personalized content that connects the topic "${prompt}" to relevant personal experiences and insights. Weave in specific details from the personal story naturally and make the content feel authentic and relatable.` : ''}

Requirements:
- Create content focused on "${prompt}"${personalStoryContext ? ' while incorporating relevant personal story elements' : ''}
- Tone: ${tone}
- Language: ${language}
- Word count: approximately ${wordCount} words per post
- Target audience: ${targetAudience}
- Main goal: ${mainGoal}
${includeHashtags ? "- Include relevant hashtags" : ""}
${includeEmojis ? "- Use emojis appropriately" : ""}
${callToAction ? "- Include a call-to-action" : ""}
- Make each quote post unique with different quotes and interpretations
- Vary the quote style and accompanying commentary
- Generate content based on the topic and customization settings provided${personalStoryContext ? ', incorporating relevant personal story elements naturally' : ''}

${humanLikeInstructions}

Format the response as 2 distinct quote posts, each separated by "---POST_SEPARATOR---". Each post should be complete and ready to publish.`
        break

      case "before-after":
        basePrompt = `Generate 2 unique before/after transformation content pieces about "${prompt}" in the ${niche || "general"} niche.

${personalStoryContext ? `PERSONAL STORY CONTEXT:
${personalStoryContext}

IMPORTANT: Use the personal story context above to create authentic, personalized content that connects the topic "${prompt}" to relevant personal experiences and insights. Weave in specific details from the personal story naturally and make the content feel authentic and relatable.` : ''}

Requirements:
- Create content focused on "${prompt}"${personalStoryContext ? ' while incorporating relevant personal story elements' : ''}
- Tone: ${tone}
- Language: ${language}
- Word count: approximately ${wordCount} words per piece
- Target audience: ${targetAudience}
- Main goal: ${mainGoal}
${includeHashtags ? "- Include relevant hashtags" : ""}
${includeEmojis ? "- Use emojis appropriately" : ""}
${callToAction ? "- Include a call-to-action" : ""}
- Make each transformation story unique with different scenarios
- Vary the before/after approach and outcomes
- Generate content based on the topic and customization settings provided${personalStoryContext ? ', incorporating relevant personal story elements naturally' : ''}

${humanLikeInstructions}

Format the response as 2 distinct transformation stories, each separated by "---POST_SEPARATOR---". Each story should be complete and ready to publish.`
        break

      case "tips":
        basePrompt = `Generate 2 unique tips and advice content pieces about "${prompt}" in the ${niche || "general"} niche.

${personalStoryContext ? `PERSONAL STORY CONTEXT:
${personalStoryContext}

IMPORTANT: Use the personal story context above to create authentic, personalized content that connects the topic "${prompt}" to relevant personal experiences and insights. Weave in specific details from the personal story naturally and make the content feel authentic and relatable.` : ''}

Requirements:
- Create content focused on "${prompt}"${personalStoryContext ? ' while incorporating relevant personal story elements' : ''}
- Tone: ${tone}
- Language: ${language}
- Word count: approximately ${wordCount} words per piece
- Target audience: ${targetAudience}
- Main goal: ${mainGoal}
${includeHashtags ? "- Include relevant hashtags" : ""}
${includeEmojis ? "- Use emojis appropriately" : ""}
${callToAction ? "- Include a call-to-action" : ""}
- Make each tips piece unique with different advice and approaches
- Vary the number of tips and presentation style
- Generate content based on the topic and customization settings provided${personalStoryContext ? ', incorporating relevant personal story elements naturally' : ''}

${humanLikeInstructions}

Format the response as 2 distinct tips pieces, each separated by "---POST_SEPARATOR---". Each piece should be complete and ready to publish.`
        break

      case "insights":
        basePrompt = `Generate 2 unique insights and analysis content pieces about "${prompt}" in the ${niche || "general"} niche.

${personalStoryContext ? `PERSONAL STORY CONTEXT:
${personalStoryContext}

IMPORTANT: Use the personal story context above to create authentic, personalized content that connects the topic "${prompt}" to relevant personal experiences and insights. Weave in specific details from the personal story naturally and make the content feel authentic and relatable.` : ''}

Requirements:
- Create content focused on "${prompt}"${personalStoryContext ? ' while incorporating relevant personal story elements' : ''}
- Tone: ${tone}
- Language: ${language}
- Word count: approximately ${wordCount} words per piece
- Target audience: ${targetAudience}
- Main goal: ${mainGoal}
${includeHashtags ? "- Include relevant hashtags" : ""}
${includeEmojis ? "- Use emojis appropriately" : ""}
${callToAction ? "- Include a call-to-action" : ""}
- Make each insights piece unique with different perspectives and analysis
- Vary the analytical approach and depth
- Generate content based on the topic and customization settings provided${personalStoryContext ? ', incorporating relevant personal story elements naturally' : ''}

${humanLikeInstructions}

Format the response as 2 distinct insights pieces, each separated by "---POST_SEPARATOR---". Each piece should be complete and ready to publish.`
        break

      case "question":
        basePrompt = `Generate 2 unique question-based content pieces about "${prompt}" in the ${niche || "general"} niche.

${personalStoryContext ? `PERSONAL STORY CONTEXT:
${personalStoryContext}

IMPORTANT: Use the personal story context above to create authentic, personalized content that connects the topic "${prompt}" to relevant personal experiences and insights. Weave in specific details from the personal story naturally and make the content feel authentic and relatable.` : ''}

Requirements:
- Create content focused on "${prompt}"${personalStoryContext ? ' while incorporating relevant personal story elements' : ''}
- Tone: ${tone}
- Language: ${language}
- Word count: approximately ${wordCount} words per piece
- Target audience: ${targetAudience}
- Main goal: ${mainGoal}
${includeHashtags ? "- Include relevant hashtags" : ""}
${includeEmojis ? "- Use emojis appropriately" : ""}
${callToAction ? "- Include a call-to-action" : ""}
- Make each question piece unique with different questions and approaches
- Vary the question style and discussion points
- Generate content based on the topic and customization settings provided${personalStoryContext ? ', incorporating relevant personal story elements naturally' : ''}

${humanLikeInstructions}

Format the response as 2 distinct question posts, each separated by "---POST_SEPARATOR---". Each post should be complete and ready to publish.`
        break

      default:
        basePrompt = `Generate 2 unique, engaging content pieces about "${prompt}" in the ${niche || "general"} niche.

${personalStoryContext ? `PERSONAL STORY CONTEXT:
${personalStoryContext}

IMPORTANT: Use the personal story context above to create authentic, personalized content that connects the topic "${prompt}" to relevant personal experiences and insights. Weave in specific details from the personal story naturally and make the content feel authentic and relatable.` : ''}

Requirements:
- Create content focused on "${prompt}"${personalStoryContext ? ' while incorporating relevant personal story elements' : ''}
- Tone: ${tone}
- Language: ${language}
- Word count: approximately ${wordCount} words per piece
- Target audience: ${targetAudience}
- Main goal: ${mainGoal}
- Include at least 3 bullet points (•) to make content more engaging and scannable
${includeHashtags ? "- Include relevant hashtags" : ""}
${includeEmojis ? "- Use emojis appropriately" : ""}
${callToAction ? "- Include a call-to-action" : ""}
- Make each content piece unique and different from the others
- Vary the approach, style, and presentation
- Do NOT include "Content 1:", "Content 2:", or any numbering prefixes
- Generate content based on the topic and customization settings provided${personalStoryContext ? ', incorporating relevant personal story elements naturally' : ''}

${humanLikeInstructions}

Format the response as 2 distinct content pieces, each separated by "---POST_SEPARATOR---". Each piece should be complete and ready to publish.`
    }

    return basePrompt
  }

  // Build human-like writing instructions
  private buildHumanLikeInstructions(options: {
    ambiguity: number
    randomness: number
    personalTouch: boolean
    storytelling: boolean
    emotionalDepth: number
    conversationalStyle: boolean
  }): string {
    const { ambiguity, randomness, personalTouch, storytelling, emotionalDepth, conversationalStyle } = options
    
    let instructions = "\n<human_writing_optimization>\n"
    
    // Ambiguity level
    if (ambiguity > 70) {
      instructions += "<ambiguity_high>\n"
      instructions += "- Create thought-provoking content that invites multiple interpretations\n"
      instructions += "- Use open-ended statements that encourage reader engagement\n"
      instructions += "- Present different perspectives without forcing conclusions\n"
      instructions += "- Leave space for reader reflection and discussion\n"
      instructions += "</ambiguity_high>\n"
    } else if (ambiguity > 40) {
      instructions += "<ambiguity_balanced>\n"
      instructions += "- Mix clear statements with thought-provoking elements\n"
      instructions += "- Balance direct messaging with open-ended questions\n"
      instructions += "- Provide guidance while allowing interpretation\n"
      instructions += "</ambiguity_balanced>\n"
    } else {
      instructions += "<ambiguity_low>\n"
      instructions += "- Deliver clear, actionable insights\n"
      instructions += "- Use direct, unambiguous language\n"
      instructions += "- Provide concrete takeaways and next steps\n"
      instructions += "</ambiguity_low>\n"
    }

    // Randomness level
    if (randomness > 70) {
      instructions += "<randomness_high>\n"
      instructions += "- Vary sentence structure dynamically (short punchy + longer explanatory)\n"
      instructions += "- Include unexpected metaphors and creative analogies\n"
      instructions += "- Use surprising transitions and unique connections\n"
      instructions += "- Add creative flair while maintaining professionalism\n"
      instructions += "</randomness_high>\n"
    } else if (randomness > 40) {
      instructions += "<randomness_balanced>\n"
      instructions += "- Use natural sentence rhythm variations\n"
      instructions += "- Include occasional creative elements\n"
      instructions += "- Balance structure with spontaneity\n"
      instructions += "</randomness_balanced>\n"
    } else {
      instructions += "<randomness_low>\n"
      instructions += "- Maintain consistent, logical structure\n"
      instructions += "- Use predictable, clear flow patterns\n"
      instructions += "- Focus on clarity and organization\n"
      instructions += "</randomness_low>\n"
    }

    // Personal touch
    if (personalTouch) {
      instructions += "<personal_connection>\n"
      instructions += "- Use inclusive pronouns (I, we, you) strategically\n"
      instructions += "- Share relatable experiences and observations\n"
      instructions += "- Create connection through shared human experiences\n"
      instructions += "- Make readers feel understood and seen\n"
      instructions += "</personal_connection>\n"
    }

    // Storytelling
    if (storytelling) {
      instructions += "<narrative_elements>\n"
      instructions += "- Structure content with clear narrative arc (setup, conflict, resolution)\n"
      instructions += "- Use vivid, descriptive language to create mental images\n"
      instructions += "- Build emotional engagement through story progression\n"
      instructions += "- Include specific details that make stories memorable\n"
      instructions += "</narrative_elements>\n"
    }

    // Emotional depth
    if (emotionalDepth > 80) {
      instructions += "<emotional_depth_high>\n"
      instructions += "- Express genuine vulnerability and authentic emotions\n"
      instructions += "- Use emotionally resonant language appropriately\n"
      instructions += "- Create deep, meaningful connections with readers\n"
      instructions += "- Share both struggles and triumphs authentically\n"
      instructions += "</emotional_depth_high>\n"
    } else if (emotionalDepth > 60) {
      instructions += "<emotional_depth_balanced>\n"
      instructions += "- Balance factual content with emotional elements\n"
      instructions += "- Include moderate emotional expression\n"
      instructions += "- Connect with readers on both logical and emotional levels\n"
      instructions += "</emotional_depth_balanced>\n"
    } else {
      instructions += "<emotional_depth_low>\n"
      instructions += "- Focus on objective, factual information\n"
      instructions += "- Maintain professional, analytical tone\n"
      instructions += "- Prioritize clarity and logic over emotional appeal\n"
      instructions += "</emotional_depth_low>\n"
    }

    // Conversational style
    if (conversationalStyle) {
      instructions += "<conversational_tone>\n"
      instructions += "- Write as if speaking to a trusted colleague\n"
      instructions += "- Use natural contractions (don't, can't, won't)\n"
      instructions += "- Include rhetorical questions and direct address\n"
      instructions += "- Use casual, natural transitions\n"
      instructions += "</conversational_tone>\n"
    }

    instructions += "<authenticity_requirements>\n"
    instructions += "- Avoid overly polished or robotic language\n"
    instructions += "- Include natural variations and human imperfections\n"
    instructions += "- Create content that feels genuinely human-written\n"
    instructions += "- Maintain professional credibility while being relatable\n"
    instructions += "</authenticity_requirements>\n"
    instructions += "</human_writing_optimization>"

    return instructions
  }

  // Parse LinkedIn posts from response
  private parseLinkedInPosts(content: string): string[] {
    // Try multiple separators in order of preference
    const separators = [
      "---POST_SEPARATOR---",
      "---VARIATION_SEPARATOR---", 
      "---CONTENT_SEPARATOR---",
      "\n\n---\n\n",
      "###",
      "---",
      "\n\n\n"
    ]
    
    let posts: string[] = []
    
    // Try each separator
    for (const separator of separators) {
      if (content.includes(separator)) {
        posts = content
          .split(separator)
          .map((post) => this.cleanPostContent(post.trim()))
          .filter((post) => post.length > 0)
        break
      }
    }
    
    // If no separator found, try to split by common patterns
    if (posts.length <= 1) {
      // Look for numbered patterns like "1.", "2.", etc.
      const numberedPattern = /^\d+\.\s+/gm
      if (numberedPattern.test(content)) {
        posts = content
          .split(numberedPattern)
          .map((post) => this.cleanPostContent(post.trim()))
          .filter((post) => post.length > 0)
      } else {
        // Try splitting by double line breaks and look for distinct content blocks
        const paragraphs = content.split('\n\n').filter(p => p.trim().length > 50)
        if (paragraphs.length >= 2) {
          // Take the first two substantial paragraphs as separate posts
          posts = paragraphs.slice(0, 2).map(post => this.cleanPostContent(post.trim()))
        } else {
          // If all else fails, return the content as a single post
          posts = [this.cleanPostContent(content.trim())]
        }
      }
    }
    
    // Ensure we have exactly 2 posts
    if (posts.length === 1) {
      // Split the single post into two parts if it's long enough
      const content = posts[0]
      if (content.length > 200) {
        const midPoint = Math.floor(content.length / 2)
        const sentences = content.split(/[.!?]+/)
        let firstPart = ""
        let secondPart = ""
        
        // Try to split at a sentence boundary
        let currentLength = 0
        let splitIndex = 0
        
        for (let i = 0; i < sentences.length; i++) {
          currentLength += sentences[i].length
          if (currentLength >= midPoint && i > 0) {
            splitIndex = i
            break
          }
        }
        
        if (splitIndex > 0) {
          firstPart = sentences.slice(0, splitIndex).join('.') + '.'
          secondPart = sentences.slice(splitIndex).join('.')
          posts = [firstPart.trim(), secondPart.trim()]
        } else {
          // Fallback: just split in the middle
          posts = [content.substring(0, midPoint), content.substring(midPoint)]
        }
      } else {
        // If content is too short, duplicate it with slight variation
        posts = [content, content + " What are your thoughts on this?"]
      }
    } else if (posts.length > 2) {
      // Take only the first 2 posts
      posts = posts.slice(0, 2)
    }
    
    return posts
  }

  // Parse topics from response
  private parseTopics(content: string): string[] {
    try {
      const parsed = JSON.parse(content)
      if (Array.isArray(parsed)) {
        return parsed
      }
    } catch (parseError) {
      console.log("Failed to parse JSON, attempting text extraction")
    }

    // Fallback: extract titles from text response
    const lines = content.split('\n').filter(line => line.trim().length > 0)
    const titles = lines
      .map(line => {
        // Remove various prefixes and formatting
        return line
          .replace(/^\d+\.\s*/, '') // Remove "1. " prefix
          .replace(/^[-*]\s*/, '') // Remove "- " or "* " prefix
          .replace(/^•\s*/, '') // Remove "• " prefix
          .replace(/^"([^"]*)"$/, '$1') // Remove surrounding quotes
          .replace(/^'([^']*)'$/, '$1') // Remove surrounding single quotes
          .trim()
      })
      .filter(title => {
        // Filter out empty titles and titles that are too long or too short
        return title.length > 0 && 
               title.length >= 5 && 
               title.length <= 100 &&
               !title.toLowerCase().includes('topic') &&
               !title.toLowerCase().includes('title') &&
               !title.toLowerCase().includes('here are') &&
               !title.toLowerCase().includes('generated topics')
      })

    // Remove duplicates
    const uniqueTitles = [...new Set(titles)]
    
    return uniqueTitles
  }

  // Clean post content by removing prefixes and improving formatting
  private cleanPostContent(content: string): string {
    // Use the new comprehensive formatting function
    return cleanAndFormatContent(content)
  }

  // Enhanced formatting for better content structure
  private enhanceContentFormatting(content: string): string {
    // First, ensure bullet points are properly formatted
    let formatted = content
      // Convert any bullet variations to consistent • symbol
      .replace(/^[-*]\s+/gm, '• ')
      .replace(/^\*\s+/gm, '• ')
      // Ensure bullet points are on separate lines
      .replace(/([^\n])(•\s*[^\n]+)/g, '$1\n\n$2')
      // Clean up multiple line breaks
      .replace(/\n{3,}/g, '\n\n')
    
    // Split content into lines
    let lines = formatted.split('\n').map(line => line.trim()).filter(line => line.length > 0)
    
    if (lines.length === 0) return content
    
    let formattedLines: string[] = []
    let i = 0
    
    while (i < lines.length) {
      const line = lines[i]
      
      // Handle bullet points - ensure they start on new lines with proper spacing
      if (line.startsWith('•') || line.startsWith('*')) {
        const bulletLine = line.replace(/^\*/, '•')
        
        // Add empty line before bullet points if previous line is not empty and not a bullet
        if (formattedLines.length > 0 && 
            !formattedLines[formattedLines.length - 1].startsWith('•') &&
            !formattedLines[formattedLines.length - 1].startsWith('#') &&
            formattedLines[formattedLines.length - 1].length > 0) {
          formattedLines.push('')
        }
        
        formattedLines.push(bulletLine)
        i++
        continue
      }
      
      // Handle hashtags (should be at the end)
      if (line.startsWith('#')) {
        // Add empty line before hashtags if not already present
        if (formattedLines.length > 0 && !formattedLines[formattedLines.length - 1].startsWith('#')) {
          formattedLines.push('')
        }
        formattedLines.push(line)
        i++
        continue
      }
      
      // Handle regular text
      if (line.length > 0) {
        // Add empty line before new paragraph if needed
        if (formattedLines.length > 0 && 
            !formattedLines[formattedLines.length - 1].startsWith('•') && 
            !formattedLines[formattedLines.length - 1].startsWith('#') &&
            formattedLines[formattedLines.length - 1].length > 0) {
          formattedLines.push('')
        }
        formattedLines.push(line)
      }
      
      i++
    }
    
    // Join lines with proper spacing
    let result = formattedLines.join('\n')
    
    // Clean up any excessive line breaks
    result = result.replace(/\n{3,}/g, '\n\n')
    
    return result.trim()
  }

  // Ensure proper structure with post-processing
  private ensureProperStructure(content: string): string {
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

  // Remove bold formatting and markdown from content
  private removeBoldFormatting(content: string): string {
    return content
      // Remove bold markdown formatting
      .replace(/\*\*(.*?)\*\*/g, '$1')
      .replace(/\*(.*?)\*/g, '$1')
      // Remove italic markdown formatting
      .replace(/_(.*?)_/g, '$1')
      // Remove any remaining markdown formatting
      .replace(/`(.*?)`/g, '$1')
      .replace(/~~(.*?)~~/g, '$1')
      // Clean up any extra spaces that might be left
      .replace(/\s+/g, ' ')
      .trim()
  }

  // Format hashtags to be on a new line
  private formatHashtags(content: string): string {
    // Find hashtags in the content
    const hashtagRegex = /#\w+/g
    const hashtags = content.match(hashtagRegex)
    
    if (hashtags && hashtags.length > 0) {
      // Remove hashtags from the original content
      let contentWithoutHashtags = content.replace(hashtagRegex, '').trim()
      
      // Clean up any extra spaces or punctuation
      contentWithoutHashtags = contentWithoutHashtags.replace(/\s+/g, ' ').trim()
      
      // Add hashtags on a new line
      const hashtagString = hashtags.join(' ')
      return `${contentWithoutHashtags}\n\n${hashtagString}`
    }
    
    return content
  }

  // Add bullet points to content to make it more engaging
  private addBulletPoints(content: string): string {
    // Check if content already has bullet points (excluding dashes)
    if (content.includes('•') || content.includes('*')) {
      // Ensure proper spacing for existing bullet points - each on new line
      let formatted = content
        // Convert only asterisk bullet types to • for consistency, but keep dashes as dashes
        .replace(/^\*\s*/gm, '• ')
        // Ensure bullet points start on new lines with proper spacing
        .replace(/([^\n])(•\s*[^\n]+)/g, '$1\n\n$2')
        .replace(/([^\n])(\*\s*[^\n]+)/g, '$1\n\n• $2'.replace(/^\*\s*/, ''))
        // Clean up multiple line breaks
        .replace(/\n{3,}/g, '\n\n')
        .trim()
      
      // Ensure bullet points are properly formatted
      formatted = formatted.replace(/(•\s*[^\n]+)/g, (match) => {
        return match.trim()
      })
      
      return formatted
    }

    // Split content into sentences
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 10)
    
    if (sentences.length >= 3) {
      // Take the first 3-4 sentences and format them as bullet points
      const bulletSentences = sentences.slice(0, 3)
      const remainingSentences = sentences.slice(3)
      
      let formattedContent = bulletSentences
        .map(sentence => `• ${sentence.trim()}`)
        .join('\n')
      
      // Add remaining sentences as regular text with proper spacing
      if (remainingSentences.length > 0) {
        formattedContent += '\n\n' + remainingSentences.join('. ').trim()
        if (!formattedContent.endsWith('.')) {
          formattedContent += '.'
        }
      }
      
      return formattedContent
    }
    
    return content
  }

  // Apply comprehensive formatting to ensure proper structure
  private applyComprehensiveFormatting(content: string): string {
    // Split content into lines
    let lines = content.split('\n').map(line => line.trim()).filter(line => line.length > 0)
    
    if (lines.length === 0) return content
    
    let formattedLines: string[] = []
    let i = 0
    
    while (i < lines.length) {
      const line = lines[i]
      
      // Handle bullet points - ensure they start on new lines
      if (line.startsWith('•') || line.startsWith('*')) {
        // Convert only asterisk bullet types to • for consistency, but keep dashes as dashes
        const bulletLine = line.replace(/^\*/, '•')
        
        // Add empty line before bullet points if previous line is not empty and not a bullet
        if (formattedLines.length > 0 && 
            !formattedLines[formattedLines.length - 1].startsWith('•') &&
            !formattedLines[formattedLines.length - 1].startsWith('#') &&
            formattedLines[formattedLines.length - 1].length > 0) {
          formattedLines.push('')
        }
        
        formattedLines.push(bulletLine)
        i++
        continue
      }
      
      // Handle hashtags (should be at the end)
      if (line.startsWith('#')) {
        // Add empty line before hashtags if not already present
        if (formattedLines.length > 0 && !formattedLines[formattedLines.length - 1].startsWith('#')) {
          formattedLines.push('')
        }
        formattedLines.push(line)
        i++
        continue
      }
      
      // Handle regular text
      if (line.length > 0) {
        // Add empty line before new paragraph if needed
        if (formattedLines.length > 0 && 
            !formattedLines[formattedLines.length - 1].startsWith('•') && 
            !formattedLines[formattedLines.length - 1].startsWith('#') &&
            formattedLines[formattedLines.length - 1].length > 0) {
          formattedLines.push('')
        }
        formattedLines.push(line)
      }
      
      i++
    }
    
    // Join lines with proper spacing
    let result = formattedLines.join('\n')
    
    // Clean up multiple empty lines
    result = result.replace(/\n{3,}/g, '\n\n')
    
    // Ensure proper spacing around bullet points - match exact example format
    result = result.replace(/([^\n])\n(•)/g, '$1\n\n$2')
    result = result.replace(/(•[^\n]+)\n([^•\n#])/g, '$1\n\n$2')
    
    // Ensure bullet points always start on new lines with proper spacing
    result = result.replace(/([^\n])(•)/g, '$1\n\n$2')
    
    // Ensure bullet points are properly formatted
    result = result.replace(/(•\s*[^\n]+)/g, (match) => {
      return match.trim()
    })
    
    // Clean up any excessive line breaks but maintain proper spacing
    result = result.replace(/\n{4,}/g, '\n\n\n')
    result = result.replace(/\n{3,}/g, '\n\n')
    
    return result.trim()
  }

  // Parse multiple content variations from response
  private parseMultipleContent(content: string, contentType: string): string[] {
    // Try to split by common separators
    const separators = [
      "---POST_SEPARATOR---",
      "---VARIATION_SEPARATOR---",
      "---CONTENT_SEPARATOR---",
      "###",
      "---",
      "\n\n---\n\n"
    ]

    for (const separator of separators) {
      if (content.includes(separator)) {
        const parts = content.split(separator)
          .map(part => this.cleanPostContent(part.trim()))
          .filter(part => part.length > 0)
        
        if (parts.length >= 2) {
          return parts
        }
      }
    }

    // If no separators found, try to split by numbered sections
    const numberedPattern = /^\d+\.\s+/gm
    if (numberedPattern.test(content)) {
      const parts = content.split(/\d+\.\s+/)
        .map(part => this.cleanPostContent(part.trim()))
        .filter(part => part.length > 0)
      
      if (parts.length >= 2) {
        return parts
      }
    }

    // Fallback: split by double newlines and take first 2 parts
    const parts = content.split(/\n\s*\n/)
      .map(part => this.cleanPostContent(part.trim()))
      .filter(part => part.length > 0)
      .slice(0, 2)

    // If we have less than 2 parts, duplicate the content to create 2 variations
    if (parts.length < 2) {
      const variations = []
      for (let i = 0; i < 2; i++) {
        if (parts[i % parts.length]) {
          variations.push(parts[i % parts.length])
        }
      }
      return variations
    }

    return parts
  }

  // Calculate OpenAI cost based on model
  private calculateOpenAICost(totalTokens: number, promptTokens: number, completionTokens: number, model: OpenAIModel = "gpt-3.5-turbo"): number {
    let promptCostPer1K: number
    let completionCostPer1K: number

    switch (model) {
      case "gpt-4":
        // GPT-4 pricing (as of 2024): $0.03 per 1K prompt tokens, $0.06 per 1K completion tokens
        promptCostPer1K = 0.03
        completionCostPer1K = 0.06
        break
      case "gpt-4o-mini":
        // GPT-4o-mini pricing: $0.00015 per 1K prompt tokens, $0.0006 per 1K completion tokens
        promptCostPer1K = 0.00015
        completionCostPer1K = 0.0006
        break
      case "gpt-3.5-turbo":
      default:
        // GPT-3.5-turbo pricing: $0.001 per 1K prompt tokens, $0.002 per 1K completion tokens
        promptCostPer1K = 0.001
        completionCostPer1K = 0.002
        break
    }

    const promptCost = (promptTokens / 1000) * promptCostPer1K
    const completionCost = (completionTokens / 1000) * completionCostPer1K
    return promptCost + completionCost
  }


  // Calculate Perplexity cost
  private calculatePerplexityCost(tokens: number): number {
    // Perplexity pricing varies by model, using approximate rate
    return (tokens / 1000) * 0.02
  }

  // Smart provider selection based on content type and requirements
  private getOptimalProvider(type: ContentType, customization: CustomizationOptions): AIProvider {
    // For topic generation - use Perplexity (best for topic generation)
    if (type === "topics") {
      return "perplexity"
    }
    
    // For all content generation - use OpenAI GPT-4o-mini (low-cost version)
    return "openai"
  }

  // Get optimal model based on content type and cost efficiency (LOW-COST FOCUS)
  private getOptimalModel(type: ContentType, customization: CustomizationOptions): OpenAIModel {
    // For all content types - use GPT-4o-mini (low-cost version with good quality)
    return "gpt-4o-mini"
  }

  // Public method to generate content (general purpose)
  async generateContent(
    type: ContentType,
    prompt: string,
    provider: AIProvider = "openai", // Changed default to OpenAI
    customization: CustomizationOptions = {},
    userId?: string,
    userEmail?: string
  ): Promise<AIResponse> {
    // Smart provider selection based on content type
    const optimizedProvider = this.getOptimalProvider(type, customization)
    const finalProvider = provider === "openai" ? optimizedProvider : provider
    
    // Smart model selection for OpenAI
    const optimalModel = this.getOptimalModel(type, customization)
    const finalCustomization = {
      ...customization,
      model: optimalModel
    }
    
    const request: AIRequest = {
      id: this.generateRequestId(),
      type,
      prompt,
      provider: finalProvider,
      customization: finalCustomization,
      userId,
      userEmail,
      priority: "normal",
      createdAt: new Date(),
    }

    return this.addToQueue(request)
  }

  // Home tab: Generate unique content based on user input (NO personal story integration)
  async generateUniqueContent(
    type: ContentType,
    prompt: string,
    provider: AIProvider = "openai",
    customization: CustomizationOptions = {},
    userId?: string
    // userEmail parameter removed to disable personal story integration for home page
  ): Promise<AIResponse> {
    const request: AIRequest = {
      id: this.generateRequestId(),
      type,
      prompt,
      provider,
      customization,
      userId,
      // userEmail removed to disable personal story integration for home page
      priority: "normal",
      createdAt: new Date(),
    }

    return this.addToQueue(request)
  }

  // Topic generator: Generate content for approved topics WITH personal story
  async generateTopicContent(
    type: ContentType,
    topicTitle: string,
    provider: AIProvider = "openai",
    customization: CustomizationOptions = {},
    userId?: string,
    userEmail?: string
  ): Promise<AIResponse> {
    const request: AIRequest = {
      id: this.generateRequestId(),
      type,
      prompt: topicTitle,
      provider,
      customization,
      userId,
      userEmail, // Include userEmail for personal story integration
      priority: "normal",
      createdAt: new Date(),
    }

    return this.addToQueue(request)
  }

  // Get queue status
  getQueueStatus() {
    return {
      queueLength: this.queue.length,
      activeRequests: this.activeRequests,
      maxConcurrentRequests: this.maxConcurrentRequests,
      isProcessing: this.isProcessing,
    }
  }

  // Clear queue
  clearQueue() {
    this.queue.forEach(item => {
      item.reject(new Error("Queue cleared"))
    })
    this.queue = []
  }
}

// Enhanced formatting function for better content structure
function enhanceContentFormatting(content: string): string {
  // First, extract all hashtags from the content
  const hashtagRegex = /#\w+/g
  const hashtags = content.match(hashtagRegex) || []
  
  // Clean up the content by removing extra spaces, fixing bullet points, and removing hashtags
  let cleaned = content
    .replace(/\s+/g, ' ') // Replace multiple spaces with single space
    .replace(/•\s*•/g, '•') // Fix double bullet points
    .replace(hashtagRegex, '') // Remove all hashtags from content body
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
      // Remove any remaining hashtags from bullet points
      const finalBullet = cleanBullet.replace(hashtagRegex, '').trim()
      return finalBullet.length > 0 ? finalBullet : null
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
  
  // Add hashtags only at the end if they exist
  if (hashtags.length > 0) {
    const uniqueHashtags = [...new Set(hashtags)]
    const hashtagString = uniqueHashtags.slice(0, 5).join(' ') // Limit to 5 hashtags
    formattedLines.push(hashtagString)
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

// Clean and format content for LinkedIn posts
function cleanAndFormatContent(content: string): string {
  // First, extract all hashtags from the content
  const hashtagRegex = /#\w+/g
  const hashtags = content.match(hashtagRegex) || []
  
  // Remove unwanted formatting and clean up
  let cleanedContent = content
    .replace(/^(Post\s*\d*:?\s*)/i, '')
    .replace(/^\d+\.\s*/, '')
    .replace(/^---POST_SEPARATOR---\s*/g, '')
    .replace(/^---\s*/g, '')
    .replace(/^###\s*/g, '')
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/\*(.*?)\*/g, '$1')
    .replace(/_(.*?)_/g, '$1')
    .replace(/`(.*?)`/g, '$1')
    .replace(/~~(.*?)~~/g, '$1')
    .replace(/\s+/g, ' ')
    .trim()

  // Clean unwanted content endings
  cleanedContent = cleanedContent
    .replace(/\n*Join the conversation\.?\s*/gi, "")
    .replace(/\n*\[End of story\]\s*/gi, "")
    .replace(/\n*P\.S\.\s*.*$/gi, "")
    .replace(/\n*Join the discussion\.?\s*/gi, "")
    .replace(/\n*What do you think\?.*$/gi, "")
    .replace(/\n*Let me know your thoughts.*$/gi, "")
    .replace(/\n*Share your experience.*$/gi, "")
    .replace(/\n*Thank you for reading!.*$/gi, "")
    .replace(/\n*If you've experienced something similar.*$/gi, "")
    .replace(/\n*I'd love to hear it in the comments.*$/gi, "")
    .replace(/\n*I'd love to hear your thoughts.*$/gi, "")
    .replace(/\n*Feel free to share your experience.*$/gi, "")
    .replace(/\n*What's your take on this\?.*$/gi, "")
    .replace(/\n*Drop your thoughts below.*$/gi, "")
    .replace(/\n*Let's discuss in the comments.*$/gi, "")
    .replace(/\n*Share your story below.*$/gi, "")
    .replace(/\n*I'd love to hear from you.*$/gi, "")
    .replace(/\n*Your thoughts\?.*$/gi, "")
    .trim()

  // Remove all hashtags from the content body
  cleanedContent = cleanedContent.replace(hashtagRegex, '').trim()

  // Apply enhanced formatting for better structure
  cleanedContent = enhanceContentFormatting(cleanedContent)
  
  // Ensure proper structure with post-processing
  cleanedContent = ensureProperStructure(cleanedContent)

  // Add hashtags only at the end if they exist
  if (hashtags.length > 0) {
    const uniqueHashtags = [...new Set(hashtags)]
    cleanedContent = cleanedContent + '\n\n' + uniqueHashtags.join(' ')
  }

  return cleanedContent
}

// Export class and singleton instance
export { AIService }
export const aiService = new AIService()
