import { connectDB } from "./mongodb"

export interface PersonalStoryAnswers {
  challenge: string
  achievement: string
  failure: string
  mentor: string
  turning_point: string
  lesson: string
}

export interface PersonalStoryCustomization {
  tone: string
  language: string
  targetAudience: string
  mainGoal: string
  storyLength: string
  emotionalTone: string
  includeCallToAction: boolean
  includeHashtags: boolean
  includeEmojis: boolean
  personalTouch: boolean
}

export interface PersonalStoryData {
  answers: PersonalStoryAnswers
  customization: PersonalStoryCustomization
  savedAt: Date
}

export class PersonalStoryService {
  /**
   * Fetch personal story data for a user
   */
  static async getUserStoryData(userEmail: string): Promise<PersonalStoryData | null> {
    try {
      const db = await connectDB()
      const storyData = await db.collection("personalStoryAnswers").findOne({
        userEmail: userEmail
      })

      if (!storyData) {
        return null
      }

      return {
        answers: storyData.answers,
        customization: storyData.customization,
        savedAt: storyData.updatedAt || storyData.createdAt
      }
    } catch (error) {
      console.error("Error fetching personal story data:", error)
      return null
    }
  }

  /**
   * Check if user has completed their personal story
   */
  static async hasUserCompletedStory(userEmail: string): Promise<boolean> {
    try {
      const storyData = await this.getUserStoryData(userEmail)
      if (!storyData) return false

      const { answers } = storyData
      // Check if all required fields are filled
      return !!(
        answers.challenge?.trim() &&
        answers.achievement?.trim() &&
        answers.failure?.trim() &&
        answers.mentor?.trim() &&
        answers.turning_point?.trim() &&
        answers.lesson?.trim()
      )
    } catch (error) {
      console.error("Error checking story completion:", error)
      return false
    }
  }

  /**
   * Build personal story context for AI prompts
   */
  static buildStoryContext(storyData: PersonalStoryData): string {
    const { answers, customization } = storyData
    
    let context = "PERSONAL STORY CONTEXT:\n"
    context += "Use the following personal experiences and insights to create authentic, personalized content:\n\n"
    
    if (answers.challenge) {
      context += `Professional Challenge: ${answers.challenge}\n\n`
    }
    
    if (answers.achievement) {
      context += `Proudest Achievement: ${answers.achievement}\n\n`
    }
    
    if (answers.failure) {
      context += `Learning from Failure: ${answers.failure}\n\n`
    }
    
    if (answers.mentor) {
      context += `Influential Mentor/Role Model: ${answers.mentor}\n\n`
    }
    
    if (answers.turning_point) {
      context += `Career Turning Point: ${answers.turning_point}\n\n`
    }
    
    if (answers.lesson) {
      context += `Key Life/Career Lesson: ${answers.lesson}\n\n`
    }

    // Add customization preferences
    context += "STORY PREFERENCES:\n"
    context += `- Preferred tone: ${customization.tone}\n`
    context += `- Target audience: ${customization.targetAudience}\n`
    context += `- Main goal: ${customization.mainGoal}\n`
    context += `- Emotional tone: ${customization.emotionalTone}\n`
    context += `- Include personal touch: ${customization.personalTouch ? 'Yes' : 'No'}\n\n`

    context += "INSTRUCTIONS:\n"
    context += "- Weave these personal experiences naturally into the content\n"
    context += "- Use specific details and emotions from the story\n"
    context += "- Make the content feel authentic and relatable\n"
    context += "- Connect the topic to relevant personal experiences\n"
    context += "- Maintain the user's preferred tone and style\n"
    context += "- Don't force connections - only use relevant story elements\n\n"

    return context
  }

  /**
   * Build a fallback context when no personal story is available
   */
  static buildFallbackContext(): string {
    return "PERSONAL STORY CONTEXT:\n" +
           "No personal story data available. Generate content using general best practices and industry insights.\n" +
           "Focus on creating valuable, engaging content that resonates with the target audience.\n\n"
  }

  /**
   * Extract key themes from personal story for content generation
   */
  static extractStoryThemes(storyData: PersonalStoryData): string[] {
    const themes: string[] = []
    const { answers } = storyData

    // Extract themes based on content
    const allText = Object.values(answers).join(' ').toLowerCase()
    
    if (allText.includes('leadership') || allText.includes('team') || allText.includes('manage')) {
      themes.push('leadership')
    }
    
    if (allText.includes('innovation') || allText.includes('creative') || allText.includes('new')) {
      themes.push('innovation')
    }
    
    if (allText.includes('growth') || allText.includes('learn') || allText.includes('develop')) {
      themes.push('growth')
    }
    
    if (allText.includes('challenge') || allText.includes('difficult') || allText.includes('overcome')) {
      themes.push('resilience')
    }
    
    if (allText.includes('success') || allText.includes('achieve') || allText.includes('win')) {
      themes.push('success')
    }
    
    if (allText.includes('mentor') || allText.includes('help') || allText.includes('support')) {
      themes.push('mentorship')
    }

    return themes.length > 0 ? themes : ['professional development', 'career growth']
  }

  /**
   * Get personalized content suggestions based on story
   */
  static getPersonalizedSuggestions(storyData: PersonalStoryData): string[] {
    const themes = this.extractStoryThemes(storyData)
    const suggestions: string[] = []

    themes.forEach(theme => {
      switch (theme) {
        case 'leadership':
          suggestions.push('Share leadership lessons learned', 'Discuss team management challenges', 'Talk about inspiring others')
          break
        case 'innovation':
          suggestions.push('Share creative problem-solving approaches', 'Discuss innovative solutions', 'Talk about thinking outside the box')
          break
        case 'growth':
          suggestions.push('Share learning experiences', 'Discuss skill development', 'Talk about personal growth journey')
          break
        case 'resilience':
          suggestions.push('Share how you overcame challenges', 'Discuss bouncing back from setbacks', 'Talk about building resilience')
          break
        case 'success':
          suggestions.push('Share success strategies', 'Discuss what led to achievements', 'Talk about celebrating wins')
          break
        case 'mentorship':
          suggestions.push('Share mentor impact stories', 'Discuss helping others grow', 'Talk about giving back')
          break
      }
    })

    return suggestions.slice(0, 3) // Return top 3 suggestions
  }
}
