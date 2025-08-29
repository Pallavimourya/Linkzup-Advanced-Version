import OpenAI from "openai"

// AI Provider Types
export type AIProvider = "openai" | "perplexity" // OpenAI as primary, Perplexity as fallback

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
}

// Request Interface
export interface AIRequest {
  id: string
  type: ContentType
  prompt: string
  provider: AIProvider
  customization: CustomizationOptions
  userId?: string
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
  private openai: OpenAI

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    })
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

      // Try OpenAI first, fallback to Perplexity if needed
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
    const prompt = this.buildPrompt(request)
    const { temperature = 0.7, maxTokens = 2000 } = request.customization

    // Always use OpenAI with fixed settings for consistency
    const completion = await this.openai.chat.completions.create({
      model: "gpt-4",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7, // Fixed temperature for consistent quality
      max_tokens: maxTokens,
    })

    const content = completion.choices[0]?.message?.content
    if (!content) throw new Error("No content generated by OpenAI")

    // Parse content based on type - all types now return 6 variations
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
        parsedContent = this.parseMultipleContent(content, "story")
        break
      case "carousel":
        parsedContent = this.parseMultipleContent(content, "carousel")
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
        parsedContent = this.parseMultipleContent(content, "content")
    }

    const usage = completion.usage
    return {
      content: parsedContent,
      model: "gpt-4",
      tokensUsed: usage?.total_tokens || 0,
      cost: this.calculateOpenAICost(usage?.total_tokens || 0, usage?.prompt_tokens || 0, usage?.completion_tokens || 0),
    }
  }

  // Generate content with Perplexity (fallback)
  private async generateWithPerplexity(request: AIRequest) {
    const { perplexity } = await import("@ai-sdk/perplexity")
    const { generateText } = await import("ai")
    
    const prompt = this.buildPrompt(request)

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
      default:
        parsedContent = content
    }

    return {
      content: parsedContent,
      model: "llama-3.1-sonar-small-128k",
      tokensUsed: response.usage?.totalTokens || 0,
      cost: this.calculatePerplexityCost(response.usage?.totalTokens || 0),
    }
  }

  // Build prompt based on request type and customization
  private buildPrompt(request: AIRequest): string {
    const { type, prompt, customization } = request
    const {
      tone = "professional",
      language = "english",
      wordCount = 150,
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
        basePrompt = `Generate 6 unique, professional LinkedIn posts that align with these parameters:

Topic/Subject: ${prompt}
Tone: ${tone}
Language: ${language}
Word count: approximately ${wordCount} words
Target audience: ${targetAudience}
Main goal: ${mainGoal}

Requirements:
- Make each post original, engaging, human-like and appropriate for LinkedIn
- Avoid repetition and generic templates
- Use the specified tone consistently
- Write in ${language} language
- Target the specified audience
- Align with the main goal
${includeHashtags ? "- Include relevant hashtags" : ""}
${includeEmojis ? "- Use emojis appropriately for LinkedIn" : ""}
${callToAction ? "- Include clear calls-to-action where appropriate" : ""}
- Make posts shareable and conversation-starting

${humanLikeInstructions}

Format the response as 6 distinct posts, each separated by "---POST_SEPARATOR---". Each post should be complete and ready to publish.`
        break

      case "topics":
        basePrompt = `Generate 6 engaging and viral-worthy topic titles for the "${niche || prompt}" niche. 

Requirements:
- Tone: ${tone}
- Language: ${language}
- Target audience: ${targetAudience}
- Main goal: ${mainGoal}
- Create compelling, shareable topic titles
- Focus on trending and relevant subjects within the niche
- Make titles engaging and click-worthy
- Avoid generic or overused topics
- Each title should be 5-10 words maximum
- Write titles in ${language} language
- Align with the ${tone} tone
- Target the specified audience: ${targetAudience}
- Focus on the main goal: ${mainGoal}

${humanLikeInstructions}

Return ONLY a JSON array of strings containing the topic titles.
Example format: ["Title 1", "Title 2", "Title 3", "Title 4", "Title 5", "Title 6"]`
        break

      case "article":
        basePrompt = `Generate 6 unique, comprehensive articles about "${prompt}" in the ${niche || "general"} niche.

Requirements:
- Tone: ${tone}
- Language: ${language}
- Word count: approximately ${wordCount} words per article
- Target audience: ${targetAudience}
- Main goal: ${mainGoal}
${includeHashtags ? "- Include relevant hashtags" : ""}
${includeEmojis ? "- Use emojis appropriately" : ""}
${callToAction ? "- Include a call-to-action" : ""}
- Make each article unique and different from the others
- Vary the approach, angle, and style for each article

${humanLikeInstructions}

Format the response as 6 distinct articles, each separated by "---POST_SEPARATOR---". Each article should be complete and ready to publish.`
        break

      case "story":
        basePrompt = `Generate 6 unique, compelling personal stories about "${prompt}" in the ${niche || "general"} niche.

Requirements:
- Tone: ${tone}
- Language: ${language}
- Word count: approximately ${wordCount} words per story
- Target audience: ${targetAudience}
- Main goal: ${mainGoal}
${includeHashtags ? "- Include relevant hashtags" : ""}
${includeEmojis ? "- Use emojis appropriately" : ""}
${callToAction ? "- Include a call-to-action" : ""}
- Make each story unique with different perspectives and experiences
- Vary the narrative structure and emotional approach
- Each story should have a different focus or angle
- Use different storytelling techniques for each variation

${humanLikeInstructions}

IMPORTANT: Generate exactly 6 distinct stories. Each story must be completely different from the others in terms of:
- Opening approach
- Narrative structure
- Emotional tone
- Key message focus
- Conclusion style

Format the response as 6 distinct stories, each separated by "---POST_SEPARATOR---". Each story should be complete and ready to publish.`
        break

      case "carousel":
        basePrompt = `Generate 6 unique LinkedIn carousels about "${prompt}" with ${wordCount / 50} slides each.

Requirements:
- Tone: ${tone}
- Language: ${language}
- Target audience: ${targetAudience}
- Main goal: ${mainGoal}
- Each slide should be concise and impactful
${includeHashtags ? "- Include relevant hashtags" : ""}
${includeEmojis ? "- Use emojis appropriately" : ""}
${callToAction ? "- Include a call-to-action on the last slide" : ""}
- Make each carousel unique with different approaches and content structure
- Vary the slide layouts and information organization

${humanLikeInstructions}

Format each carousel with clear headings and bullet points where appropriate. Format the response as 6 distinct carousels, each separated by "---POST_SEPARATOR---".`
        break

      case "list":
        basePrompt = `Generate 6 unique list-based content pieces about "${prompt}" in the ${niche || "general"} niche.

Requirements:
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

${humanLikeInstructions}

Format the response as 6 distinct lists, each separated by "---POST_SEPARATOR---". Each list should be complete and ready to publish.`
        break

      case "quote":
        basePrompt = `Generate 6 unique inspirational quote posts about "${prompt}" in the ${niche || "general"} niche.

Requirements:
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

${humanLikeInstructions}

Format the response as 6 distinct quote posts, each separated by "---POST_SEPARATOR---". Each post should be complete and ready to publish.`
        break

      case "before-after":
        basePrompt = `Generate 6 unique before/after transformation content pieces about "${prompt}" in the ${niche || "general"} niche.

Requirements:
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

${humanLikeInstructions}

Format the response as 6 distinct transformation stories, each separated by "---POST_SEPARATOR---". Each story should be complete and ready to publish.`
        break

      case "tips":
        basePrompt = `Generate 6 unique tips and advice content pieces about "${prompt}" in the ${niche || "general"} niche.

Requirements:
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

${humanLikeInstructions}

Format the response as 6 distinct tips pieces, each separated by "---POST_SEPARATOR---". Each piece should be complete and ready to publish.`
        break

      case "insights":
        basePrompt = `Generate 6 unique insights and analysis content pieces about "${prompt}" in the ${niche || "general"} niche.

Requirements:
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

${humanLikeInstructions}

Format the response as 6 distinct insights pieces, each separated by "---POST_SEPARATOR---". Each piece should be complete and ready to publish.`
        break

      case "question":
        basePrompt = `Generate 6 unique question-based content pieces about "${prompt}" in the ${niche || "general"} niche.

Requirements:
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

${humanLikeInstructions}

Format the response as 6 distinct question posts, each separated by "---POST_SEPARATOR---". Each post should be complete and ready to publish.`
        break

      default:
        basePrompt = `Generate 6 unique, engaging content pieces about "${prompt}" in the ${niche || "general"} niche.

Requirements:
- Tone: ${tone}
- Language: ${language}
- Word count: approximately ${wordCount} words per piece
- Target audience: ${targetAudience}
- Main goal: ${mainGoal}
${includeHashtags ? "- Include relevant hashtags" : ""}
${includeEmojis ? "- Use emojis appropriately" : ""}
${callToAction ? "- Include a call-to-action" : ""}
- Make each content piece unique and different from the others
- Vary the approach, style, and presentation

${humanLikeInstructions}

Format the response as 6 distinct content pieces, each separated by "---POST_SEPARATOR---". Each piece should be complete and ready to publish.`
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
    
    let instructions = "\nHUMAN-LIKE WRITING INSTRUCTIONS:\n"
    
    // Ambiguity level
    if (ambiguity > 70) {
      instructions += "- Use open-ended statements and questions that invite interpretation\n"
      instructions += "- Include multiple perspectives without forcing a single conclusion\n"
      instructions += "- Leave some room for reader interpretation and discussion\n"
    } else if (ambiguity > 40) {
      instructions += "- Balance clarity with some open-ended elements\n"
      instructions += "- Include both direct statements and thought-provoking questions\n"
    } else {
      instructions += "- Be clear and direct in your messaging\n"
      instructions += "- Provide concrete, actionable insights\n"
    }

    // Randomness level
    if (randomness > 70) {
      instructions += "- Vary sentence structure unpredictably (mix short and long sentences)\n"
      instructions += "- Include unexpected analogies or metaphors\n"
      instructions += "- Use creative transitions between ideas\n"
    } else if (randomness > 40) {
      instructions += "- Use natural variations in sentence length and structure\n"
      instructions += "- Include occasional creative elements\n"
    } else {
      instructions += "- Maintain consistent, predictable structure\n"
      instructions += "- Use clear, logical flow between ideas\n"
    }

    // Personal touch
    if (personalTouch) {
      instructions += "- Include personal pronouns (I, we, you) to create connection\n"
      instructions += "- Share relatable experiences or observations\n"
      instructions += "- Use inclusive language that makes readers feel seen\n"
    }

    // Storytelling
    if (storytelling) {
      instructions += "- Include narrative elements (conflict, resolution, lesson)\n"
      instructions += "- Use descriptive language to paint a picture\n"
      instructions += "- Create emotional arcs that engage the reader\n"
    }

    // Emotional depth
    if (emotionalDepth > 80) {
      instructions += "- Express genuine emotions and vulnerability\n"
      instructions += "- Use emotionally charged language appropriately\n"
      instructions += "- Create deep emotional connections with readers\n"
    } else if (emotionalDepth > 60) {
      instructions += "- Include moderate emotional expression\n"
      instructions += "- Balance facts with feelings\n"
    } else {
      instructions += "- Focus on factual, objective information\n"
      instructions += "- Maintain professional distance\n"
    }

    // Conversational style
    if (conversationalStyle) {
      instructions += "- Write as if speaking to a friend or colleague\n"
      instructions += "- Use contractions (don't, can't, won't)\n"
      instructions += "- Include rhetorical questions and direct address\n"
      instructions += "- Use casual transitions and natural flow\n"
    }

    instructions += "- Avoid overly perfect or robotic language\n"
    instructions += "- Include natural imperfections and variations\n"
    instructions += "- Make the content feel authentic and human-written\n"

    return instructions
  }

  // Parse LinkedIn posts from response
  private parseLinkedInPosts(content: string): string[] {
    return content
      .split("---POST_SEPARATOR---")
      .map((post) => post.trim())
      .filter((post) => post.length > 0)
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
      .map(line => line.replace(/^\d+\.\s*/, '').replace(/^[-*]\s*/, '').trim())
      .filter(title => title.length > 0 && title.length < 100)

    return titles
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
          .map(part => part.trim())
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
        .map(part => part.trim())
        .filter(part => part.length > 0)
      
      if (parts.length >= 2) {
        return parts
      }
    }

    // Fallback: split by double newlines and take first 6 parts
    const parts = content.split(/\n\s*\n/)
      .map(part => part.trim())
      .filter(part => part.length > 0)
      .slice(0, 6)

    // If we have less than 6 parts, duplicate the content to create 6 variations
    if (parts.length < 6) {
      const variations = []
      for (let i = 0; i < 6; i++) {
        if (parts[i % parts.length]) {
          variations.push(parts[i % parts.length])
        }
      }
      return variations
    }

    return parts
  }

  // Calculate OpenAI cost
  private calculateOpenAICost(totalTokens: number, promptTokens: number, completionTokens: number): number {
    // GPT-4 pricing (as of 2024): $0.03 per 1K prompt tokens, $0.06 per 1K completion tokens
    const promptCost = (promptTokens / 1000) * 0.03
    const completionCost = (completionTokens / 1000) * 0.06
    return promptCost + completionCost
  }

  // Calculate Perplexity cost
  private calculatePerplexityCost(tokens: number): number {
    // Perplexity pricing varies by model, using approximate rate
    return (tokens / 1000) * 0.02
  }

  // Public method to generate content
  async generateContent(
    type: ContentType,
    prompt: string,
    provider: AIProvider = "openai", // Changed default to OpenAI
    customization: CustomizationOptions = {},
    userId?: string
  ): Promise<AIResponse> {
    const request: AIRequest = {
      id: this.generateRequestId(),
      type,
      prompt,
      provider,
      customization,
      userId,
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

// Export singleton instance
export const aiService = new AIService()
