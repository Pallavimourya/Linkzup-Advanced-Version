/**
 * Personal Story Content Service
 * Handles content generation based on personal story data with uniqueness checks
 */

import { PersonalStoryService, type PersonalStoryData } from "./personal-story-service"
import { connectDB } from "./mongodb"
import { PERSONAL_STORY_TOPIC_PROMPTS, getRelevantTopicPrompt, getAllTopicPrompts } from "./prompts/personal-story-topics"

export interface GeneratedContent {
  id: string
  content: string
  type: 'topic' | 'post' | 'article' | 'story'
  category: string
  personalStoryElements: string[]
  generatedAt: Date
  uniquenessScore: number
}

export interface ContentGenerationOptions {
  type: 'topics' | 'linkedin-post' | 'article' | 'story'
  category?: string
  count?: number
  ensureUniqueness?: boolean
  includePersonalStoryElements?: boolean
}

export class PersonalStoryContentService {
  /**
   * Generate topics based on personal story data
   */
  static async generatePersonalStoryTopics(
    userEmail: string,
    options: ContentGenerationOptions = {}
  ): Promise<GeneratedContent[]> {
    try {
      // Get personal story data
      const storyData = await PersonalStoryService.getUserStoryData(userEmail)
      if (!storyData) {
        throw new Error("No personal story data found. Please complete your personal story first.")
      }

      // Check if user has completed their personal story
      const isCompleted = await PersonalStoryService.hasUserCompletedStory(userEmail)
      if (!isCompleted) {
        throw new Error("Personal story is incomplete. Please complete all sections first.")
      }

      // Extract themes from personal story
      const storyThemes = PersonalStoryService.extractStoryThemes(storyData)
      
      // Get relevant topic prompt based on themes
      const topicPrompt = getRelevantTopicPrompt(storyThemes)
      
      // Build personal story context
      const storyContext = PersonalStoryService.buildStoryContext(storyData)
      
      // Generate topics using AI
      const topics = await this.generateTopicsWithAI(storyContext, topicPrompt, userEmail)
      
      // Ensure uniqueness if requested
      if (options.ensureUniqueness) {
        const uniqueTopics = await this.ensureContentUniqueness(topics, userEmail, 'topic')
        return uniqueTopics
      }
      
      return topics
    } catch (error) {
      console.error("Error generating personal story topics:", error)
      throw error
    }
  }

  /**
   * Generate content based on a specific topic and personal story
   */
  static async generatePersonalStoryContent(
    userEmail: string,
    topic: string,
    contentType: 'linkedin-post' | 'article' | 'story',
    options: ContentGenerationOptions = {}
  ): Promise<GeneratedContent[]> {
    try {
      // Get personal story data
      const storyData = await PersonalStoryService.getUserStoryData(userEmail)
      if (!storyData) {
        throw new Error("No personal story data found. Please complete your personal story first.")
      }

      // Build contextual personal story context based on topic
      const storyContext = PersonalStoryService.buildContextualStoryContext(storyData, topic)
      
      // Generate content using AI
      const content = await this.generateContentWithAI(storyContext, topic, contentType, userEmail)
      
      // Ensure uniqueness if requested
      if (options.ensureUniqueness) {
        const uniqueContent = await this.ensureContentUniqueness(content, userEmail, contentType)
        return uniqueContent
      }
      
      return content
    } catch (error) {
      console.error("Error generating personal story content:", error)
      throw error
    }
  }

  /**
   * Generate topics using AI with personal story context
   */
  private static async generateTopicsWithAI(
    storyContext: string,
    topicPrompt: PersonalStoryTopicPrompt,
    userEmail: string
  ): Promise<GeneratedContent[]> {
    // This would integrate with your existing AI service
    // For now, returning a placeholder structure
    const topics: GeneratedContent[] = []
    
    // TODO: Integrate with AI service to generate actual topics
    // const aiService = new AIService()
    // const response = await aiService.generateContent(
    //   "topics",
    //   `${storyContext}\n\n${topicPrompt.prompt}`,
    //   "openai",
    //   {
    //     tone: "professional",
    //     targetAudience: "LinkedIn professionals",
    //     mainGoal: "engagement",
    //     includeHashtags: false,
    //     includeEmojis: false,
    //     callToAction: false,
    //     wordCount: 50
    //   },
    //   undefined,
    //   userEmail
    // )
    
    return topics
  }

  /**
   * Generate content using AI with personal story context
   */
  private static async generateContentWithAI(
    storyContext: string,
    topic: string,
    contentType: 'linkedin-post' | 'article' | 'story',
    userEmail: string
  ): Promise<GeneratedContent[]> {
    const content: GeneratedContent[] = []
    
    // TODO: Integrate with AI service to generate actual content
    // const aiService = new AIService()
    // const response = await aiService.generateContent(
    //   contentType,
    //   `${storyContext}\n\nTopic: ${topic}`,
    //   "openai",
    //   {
    //     tone: "professional",
    //     targetAudience: "LinkedIn professionals",
    //     mainGoal: "engagement",
    //     includeHashtags: true,
    //     includeEmojis: true,
    //     callToAction: true,
    //     wordCount: 200
    //   },
    //   undefined,
    //   userEmail
    // )
    
    return content
  }

  /**
   * Ensure content uniqueness by checking against previously generated content
   */
  private static async ensureContentUniqueness(
    content: GeneratedContent[],
    userEmail: string,
    contentType: string
  ): Promise<GeneratedContent[]> {
    try {
      const db = await connectDB()
      
      // Get previously generated content for this user
      const previousContent = await db.collection("generatedContent").find({
        userEmail,
        type: contentType,
        generatedAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } // Last 30 days
      }).toArray()
      
      const uniqueContent: GeneratedContent[] = []
      
      for (const item of content) {
        // Check similarity with previous content
        const isUnique = await this.checkContentUniqueness(item, previousContent)
        
        if (isUnique) {
          // Store the generated content
          await db.collection("generatedContent").insertOne({
            ...item,
            userEmail,
            generatedAt: new Date()
          })
          
          uniqueContent.push(item)
        }
      }
      
      return uniqueContent
    } catch (error) {
      console.error("Error ensuring content uniqueness:", error)
      return content // Return original content if uniqueness check fails
    }
  }

  /**
   * Check if content is unique compared to previous content
   */
  private static async checkContentUniqueness(
    newContent: GeneratedContent,
    previousContent: any[]
  ): Promise<boolean> {
    // Simple similarity check based on content length and key phrases
    const newContentLower = newContent.content.toLowerCase()
    
    for (const prev of previousContent) {
      const prevContentLower = prev.content.toLowerCase()
      
      // Check for exact matches
      if (newContentLower === prevContentLower) {
        return false
      }
      
      // Check for high similarity (80%+ similar words)
      const similarity = this.calculateSimilarity(newContentLower, prevContentLower)
      if (similarity > 0.8) {
        return false
      }
    }
    
    return true
  }

  /**
   * Calculate similarity between two text strings
   */
  private static calculateSimilarity(text1: string, text2: string): number {
    const words1 = text1.split(/\s+/)
    const words2 = text2.split(/\s+/)
    
    const set1 = new Set(words1)
    const set2 = new Set(words2)
    
    const intersection = new Set([...set1].filter(x => set2.has(x)))
    const union = new Set([...set1, ...set2])
    
    return intersection.size / union.size
  }

  /**
   * Get user's content generation history
   */
  static async getUserContentHistory(userEmail: string, limit: number = 50): Promise<GeneratedContent[]> {
    try {
      const db = await connectDB()
      
      const history = await db.collection("generatedContent").find({
        userEmail
      }).sort({ generatedAt: -1 }).limit(limit).toArray()
      
      return history.map(item => ({
        id: item._id.toString(),
        content: item.content,
        type: item.type,
        category: item.category,
        personalStoryElements: item.personalStoryElements || [],
        generatedAt: item.generatedAt,
        uniquenessScore: item.uniquenessScore || 1.0
      }))
    } catch (error) {
      console.error("Error getting user content history:", error)
      return []
    }
  }

  /**
   * Get personalized content suggestions based on personal story
   */
  static async getPersonalizedSuggestions(userEmail: string): Promise<string[]> {
    try {
      const storyData = await PersonalStoryService.getUserStoryData(userEmail)
      if (!storyData) {
        return []
      }
      
      return PersonalStoryService.getPersonalizedSuggestions(storyData)
    } catch (error) {
      console.error("Error getting personalized suggestions:", error)
      return []
    }
  }

  /**
   * Check if user has sufficient personal story data for content generation
   */
  static async validatePersonalStoryCompleteness(userEmail: string): Promise<{
    isComplete: boolean
    missingFields: string[]
    completionPercentage: number
  }> {
    try {
      const storyData = await PersonalStoryService.getUserStoryData(userEmail)
      if (!storyData) {
        return {
          isComplete: false,
          missingFields: ['early_life', 'education', 'career_journey', 'personal_side', 'current_identity', 'future_aspirations'],
          completionPercentage: 0
        }
      }
      
      const { answers } = storyData
      const requiredFields = ['early_life', 'education', 'career_journey', 'personal_side', 'current_identity', 'future_aspirations']
      const missingFields: string[] = []
      
      requiredFields.forEach(field => {
        if (!answers[field as keyof typeof answers] || answers[field as keyof typeof answers].trim().length === 0) {
          missingFields.push(field)
        }
      })
      
      const completionPercentage = ((requiredFields.length - missingFields.length) / requiredFields.length) * 100
      
      return {
        isComplete: missingFields.length === 0,
        missingFields,
        completionPercentage
      }
    } catch (error) {
      console.error("Error validating personal story completeness:", error)
      return {
        isComplete: false,
        missingFields: ['early_life', 'education', 'career_journey', 'personal_side', 'current_identity', 'future_aspirations'],
        completionPercentage: 0
      }
    }
  }
}
