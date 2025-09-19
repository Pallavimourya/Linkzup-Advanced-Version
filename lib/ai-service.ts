import OpenAI from "openai"
import { PersonalStoryService, type PersonalStoryData } from "./personal-story-service"

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
    const prompt = await this.buildPrompt(request)
    const { temperature = 0.7, maxTokens = 2000 } = request.customization

    // Always use OpenAI with fixed settings for consistency
    const completion = await this.getOpenAI().chat.completions.create({
      model: "gpt-4",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7, // Fixed temperature for consistent quality
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
        parsedContent = [content]
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
  private async buildPrompt(request: AIRequest): Promise<string> {
    const { type, prompt, customization, userEmail } = request
    
    // Get personal story context if user email is provided
    let personalStoryContext = ""
    if (userEmail) {
      try {
        const storyData = await PersonalStoryService.getUserStoryData(userEmail)
        const isStoryComplete = await PersonalStoryService.hasUserCompletedStory(userEmail)
        
        if (storyData && isStoryComplete) {
          personalStoryContext = PersonalStoryService.buildStoryContext(storyData)
        } else {
          personalStoryContext = PersonalStoryService.buildFallbackContext()
        }
      } catch (error) {
        console.error("Error fetching personal story data:", error)
        personalStoryContext = PersonalStoryService.buildFallbackContext()
      }
    } else {
      personalStoryContext = PersonalStoryService.buildFallbackContext()
    }
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
        basePrompt = `${personalStoryContext}Generate 2 unique, professional LinkedIn posts that align with these parameters:

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
- Include at least 3 bullet points (•) to make content more engaging and scannable
${includeHashtags ? "- Include relevant hashtags" : ""}
${includeEmojis ? "- Use emojis appropriately for LinkedIn" : ""}
${callToAction ? "- Include clear calls-to-action where appropriate" : ""}
- Make posts shareable and conversation-starting
- Do NOT include "Post 1:", "Post 2:", or any numbering prefixes

${humanLikeInstructions}

Format the response as 2 distinct posts, each separated by "---POST_SEPARATOR---". Each post should be complete and ready to publish.`
        break

      case "topics":
        basePrompt = `${personalStoryContext}Generate 2 engaging and viral-worthy topic titles for the "${niche || prompt}" niche. 

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
Example format: ["Title 1", "Title 2"]`
        break

      case "article":
        basePrompt = `${personalStoryContext}Generate 2 unique, comprehensive articles about "${prompt}" in the ${niche || "general"} niche.

Requirements:
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

${humanLikeInstructions}

Format the response as 2 distinct articles, each separated by "---POST_SEPARATOR---". Each article should be complete and ready to publish.`
        break

      case "story":
        basePrompt = `${personalStoryContext}Generate 1 compelling personal story about "${prompt}" in the ${niche || "general"} niche.

Requirements:
- Tone: ${tone}
- Language: ${language}
- Word count: approximately ${wordCount} words
- Target audience: ${targetAudience}
- Main goal: ${mainGoal}
- Include at least 3 bullet points (•) to make content more engaging and scannable
${includeHashtags ? "- Include relevant hashtags" : ""}
${includeEmojis ? "- Use emojis appropriately" : ""}
${callToAction ? "- Include a call-to-action" : ""}
- Create a cohesive, well-structured narrative
- Use authentic personal experiences and insights
- Make the story engaging and relatable
- Include specific details and emotions
- Connect all story elements naturally
- Do NOT include "Story:", or any numbering prefixes

${humanLikeInstructions}

IMPORTANT: Generate exactly 1 comprehensive story that weaves together all the personal elements into a cohesive narrative. The story should:
- Have a clear beginning, middle, and end
- Include specific personal details and experiences
- Show growth and learning throughout the journey
- Be authentic and relatable to the target audience
- Maintain the specified tone and style

Return only the single story content, ready to publish.`
        break

      case "carousel":
        basePrompt = `${personalStoryContext}OpenAI Request Prompt
Generate carousel content for a website based on these inputs:

Topic: "${prompt}"

Tone: "${tone}"

Number of slides: ${wordCount / 50}

The content must be concise, clear, and suitable for display on visual cards.

Return ONLY a valid JSON object with this exact structure:

{
  "slides": [
    {
      "top_line": "string - short punchy text for slide 1",
      "main_heading": "string - main heading for slide 1", 
      "bullet": "string - one short bullet point"
    },
    {
      "heading": "string - heading for slide 2 and onwards",
      "bullets": [
        "string - bullet 1",
        "string - bullet 2", 
        "string - bullet 3"
      ]
    },
    // Repeat the above slide structure (heading + bullets) for all middle slides
    {
      "tagline": "string - final tagline for last slide",
      "final_heading": "string - final big heading",
      "last_bullet": "string - last bullet point"
    }
  ]
}

Additional Instructions:

The first slide must have keys: "top_line", "main_heading", "bullet".

Each middle slide must have keys: "heading" and "bullets" (array of 3 strings).

The last slide must have keys: "tagline", "final_heading", "last_bullet".

All text should be short enough to fit visually on a card (keep sentences brief).

Do not include any explanations, only output the JSON.

Ensure the JSON is valid and parsable.

Generate exactly ${wordCount / 50} slides. Format the response as 2 distinct carousels, each separated by "---POST_SEPARATOR---".`
        break

      case "list":
        basePrompt = `${personalStoryContext}Generate 2 unique list-based content pieces about "${prompt}" in the ${niche || "general"} niche.

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

Format the response as 2 distinct lists, each separated by "---POST_SEPARATOR---". Each list should be complete and ready to publish.`
        break

      case "quote":
        basePrompt = `${personalStoryContext}Generate 2 unique inspirational quote posts about "${prompt}" in the ${niche || "general"} niche.

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

Format the response as 2 distinct quote posts, each separated by "---POST_SEPARATOR---". Each post should be complete and ready to publish.`
        break

      case "before-after":
        basePrompt = `${personalStoryContext}Generate 2 unique before/after transformation content pieces about "${prompt}" in the ${niche || "general"} niche.

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

Format the response as 2 distinct transformation stories, each separated by "---POST_SEPARATOR---". Each story should be complete and ready to publish.`
        break

      case "tips":
        basePrompt = `${personalStoryContext}Generate 2 unique tips and advice content pieces about "${prompt}" in the ${niche || "general"} niche.

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

Format the response as 2 distinct tips pieces, each separated by "---POST_SEPARATOR---". Each piece should be complete and ready to publish.`
        break

      case "insights":
        basePrompt = `${personalStoryContext}Generate 2 unique insights and analysis content pieces about "${prompt}" in the ${niche || "general"} niche.

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

Format the response as 2 distinct insights pieces, each separated by "---POST_SEPARATOR---". Each piece should be complete and ready to publish.`
        break

      case "question":
        basePrompt = `${personalStoryContext}Generate 2 unique question-based content pieces about "${prompt}" in the ${niche || "general"} niche.

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

Format the response as 2 distinct question posts, each separated by "---POST_SEPARATOR---". Each post should be complete and ready to publish.`
        break

      default:
        basePrompt = `Generate 2 unique, engaging content pieces about "${prompt}" in the ${niche || "general"} niche.

Requirements:
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
      .map(line => line.replace(/^\d+\.\s*/, '').replace(/^[-*]\s*/, '').trim())
      .filter(title => title.length > 0 && title.length < 100)

    return titles
  }

  // Clean post content by removing prefixes and improving formatting
  private cleanPostContent(content: string): string {
    // Remove common prefixes like "Post 1:", "1.", "Post:", etc.
    let cleaned = content
      .replace(/^(Post\s*\d*:?\s*)/i, '')
      .replace(/^\d+\.\s*/, '')
      .replace(/^(Content\s*\d*:?\s*)/i, '')
      .replace(/^(Article\s*\d*:?\s*)/i, '')
      .replace(/^(Story\s*\d*:?\s*)/i, '')
      .replace(/^(List\s*\d*:?\s*)/i, '')
      .replace(/^(Quote\s*\d*:?\s*)/i, '')
      .replace(/^(Tips\s*\d*:?\s*)/i, '')
      .replace(/^(Insights\s*\d*:?\s*)/i, '')
      .replace(/^(Question\s*\d*:?\s*)/i, '')
      // Remove separator patterns that might leak through
      .replace(/^_SEPARATOR---\s*/g, '')
      .replace(/^---POST_SEPARATOR---\s*/g, '')
      .replace(/^---VARIATION_SEPARATOR---\s*/g, '')
      .replace(/^---CONTENT_SEPARATOR---\s*/g, '')
      .replace(/^---\s*/g, '')
      .replace(/^###\s*/g, '')
      .trim()

    // Add bullet points to make content more engaging
    cleaned = this.addBulletPoints(cleaned)
    
    return cleaned
  }

  // Add bullet points to content to make it more engaging
  private addBulletPoints(content: string): string {
    // Check if content already has bullet points
    if (content.includes('•') || content.includes('-') || content.includes('*')) {
      return content
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
      
      // Add remaining sentences as regular text
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
    userId?: string,
    userEmail?: string
  ): Promise<AIResponse> {
    const request: AIRequest = {
      id: this.generateRequestId(),
      type,
      prompt,
      provider,
      customization,
      userId,
      userEmail,
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

// Export class and singleton instance
export { AIService }
export const aiService = new AIService()
