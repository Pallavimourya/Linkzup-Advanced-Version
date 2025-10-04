import { connectDB } from "./mongodb"

export interface PersonalStoryAnswers {
  early_life: string
  education: string
  career_journey: string
  personal_side: string
  current_identity: string
  future_aspirations: string
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
        answers.early_life?.trim() &&
        answers.education?.trim() &&
        answers.career_journey?.trim() &&
        answers.personal_side?.trim() &&
        answers.current_identity?.trim() &&
        answers.future_aspirations?.trim()
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
    
    if (answers.early_life) {
      context += `Early Life & Roots: ${answers.early_life}\n\n`
    }
    
    if (answers.education) {
      context += `Education & Learning Phase: ${answers.education}\n\n`
    }
    
    if (answers.career_journey) {
      context += `Career Journey: ${answers.career_journey}\n\n`
    }
    
    if (answers.personal_side) {
      context += `Personal Side: ${answers.personal_side}\n\n`
    }
    
    if (answers.current_identity) {
      context += `Current Identity & Positioning: ${answers.current_identity}\n\n`
    }
    
    if (answers.future_aspirations) {
      context += `Future Aspirations: ${answers.future_aspirations}\n\n`
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
   * Build contextual personal story context based on topic
   * Includes ALL personal story sections with emphasis on relevant ones
   */
  static buildContextualStoryContext(storyData: PersonalStoryData, topic: string): string {
    const { answers, customization } = storyData
    
    // Extract relevant story elements based on topic keywords
    const relevantElements = this.extractRelevantStoryElements(answers, topic)
    
    let context = "PERSONAL STORY CONTEXT (COMPREHENSIVE):\n"
    context += `Topic: "${topic}"\n`
    context += "Use the following personal experiences to create authentic, personalized content. ALL sections should be considered for potential connections:\n\n"
    
    // Include ALL personal story sections with emphasis on relevant ones
    const allSections = [
      { key: 'early_life', label: 'Early Life & Roots', content: answers.early_life },
      { key: 'education', label: 'Education & Learning Phase', content: answers.education },
      { key: 'career_journey', label: 'Career Journey', content: answers.career_journey },
      { key: 'personal_side', label: 'Personal Side', content: answers.personal_side },
      { key: 'current_identity', label: 'Current Identity & Positioning', content: answers.current_identity },
      { key: 'future_aspirations', label: 'Future Aspirations', content: answers.future_aspirations }
    ]
    
    allSections.forEach(section => {
      if (section.content && section.content.trim().length > 0) {
        // Check if this section is highly relevant to the topic
        const isHighlyRelevant = relevantElements.some(element => 
          element.category === section.label
        )
        
        if (isHighlyRelevant) {
          context += `🎯 ${section.label} (HIGHLY RELEVANT): ${section.content}\n\n`
        } else {
          context += `${section.label}: ${section.content}\n\n`
        }
      }
    })

    // Add customization preferences
    context += "STORY PREFERENCES:\n"
    context += `- Preferred tone: ${customization.tone}\n`
    context += `- Target audience: ${customization.targetAudience}\n`
    context += `- Main goal: ${customization.mainGoal}\n`
    context += `- Emotional tone: ${customization.emotionalTone}\n`
    context += `- Include personal touch: ${customization.personalTouch ? 'Yes' : 'No'}\n\n`

    context += "CRITICAL INSTRUCTIONS:\n"
    context += "- Use ALL personal story sections provided above to create comprehensive, authentic content\n"
    context += "- Prioritize sections marked as 'HIGHLY RELEVANT' but don't ignore other sections\n"
    context += "- Find creative ways to connect the topic to different aspects of the personal story\n"
    context += "- Weave together elements from multiple sections to create a rich, personal narrative\n"
    context += "- Make the content feel authentic and relatable by using specific details from the story\n"
    context += "- Maintain the user's preferred tone and style\n"
    context += "- Ensure the content reflects the complete personal journey, not just one aspect\n\n"

    return context
  }

  /**
   * Extract story elements that are relevant to the given topic
   */
  static extractRelevantStoryElements(answers: PersonalStoryAnswers, topic: string): Array<{category: string, content: string}> {
    const relevantElements: Array<{category: string, content: string, score: number}> = []
    const topicLower = topic.toLowerCase()
    
    // Define topic categories and their keywords with weights
    const topicCategories = {
      'career': ['career', 'job', 'work', 'professional', 'business', 'leadership', 'management', 'team', 'company', 'industry', 'success', 'achievement', 'promotion', 'skills', 'experience', 'ceo', 'startup', 'entrepreneur'],
      'education': ['education', 'learning', 'study', 'university', 'college', 'school', 'course', 'training', 'knowledge', 'degree', 'certification', 'skill', 'development', 'programming', 'computer science'],
      'personal_growth': ['growth', 'development', 'improvement', 'challenge', 'overcome', 'resilience', 'motivation', 'inspiration', 'change', 'transformation', 'journey'],
      'early_life': ['childhood', 'early', 'beginning', 'start', 'foundation', 'roots', 'background', 'family', 'upbringing', 'origin', 'small town'],
      'future': ['future', 'goal', 'aspiration', 'dream', 'vision', 'plan', 'ambition', 'target', 'objective', 'next', 'ahead', 'build', 'create'],
      'personal': ['personal', 'life', 'experience', 'story', 'journey', 'relationship', 'hobby', 'interest', 'passion', 'value', 'belief', 'cricket', 'sports', 'married', 'kids'],
      'technology': ['technology', 'tech', 'ai', 'artificial intelligence', 'machine learning', 'software', 'programming', 'computer', 'digital', 'innovation']
    }
    
    // Check each answer against topic relevance
    Object.entries(answers).forEach(([key, content]) => {
      if (!content || content.trim().length === 0) return
      
      const contentLower = content.toLowerCase()
      let maxRelevanceScore = 0
      
      // Calculate relevance score based on keyword matches
      Object.entries(topicCategories).forEach(([category, keywords]) => {
        const topicMatches = keywords.filter(keyword => topicLower.includes(keyword)).length
        const contentMatches = keywords.filter(keyword => contentLower.includes(keyword)).length
        
        // Weight topic matches higher than content matches
        const relevanceScore = (topicMatches * 3) + contentMatches
        
        if (relevanceScore > maxRelevanceScore) {
          maxRelevanceScore = relevanceScore
        }
      })
      
      // Only add elements with significant relevance (score >= 2)
      if (maxRelevanceScore >= 2) {
        const categoryMap = {
          'early_life': 'Early Life & Roots',
          'education': 'Education & Learning',
          'career_journey': 'Career Journey',
          'personal_side': 'Personal Side',
          'current_identity': 'Current Identity',
          'future_aspirations': 'Future Aspirations'
        }
        
        relevantElements.push({
          category: categoryMap[key as keyof typeof categoryMap] || key,
          content: content,
          score: maxRelevanceScore
        })
      }
    })
    
    // Sort by relevance score (highest first) and take only top 2-3 most relevant elements
    relevantElements.sort((a, b) => b.score - a.score)
    const topElements = relevantElements.slice(0, 3)
    
    // If no specific matches found, try broader relevance with lower threshold
    if (topElements.length === 0) {
      // Check for general professional relevance
      const professionalKeywords = ['work', 'career', 'business', 'professional', 'leadership', 'success', 'achievement']
      const hasProfessionalRelevance = professionalKeywords.some(keyword => topicLower.includes(keyword))
      
      if (hasProfessionalRelevance && answers.career_journey) {
        topElements.push({
          category: 'Career Journey',
          content: answers.career_journey,
          score: 1
        })
      }
      
      // Check for learning/education relevance
      const educationKeywords = ['learn', 'education', 'skill', 'development', 'growth', 'improvement']
      const hasEducationRelevance = educationKeywords.some(keyword => topicLower.includes(keyword))
      
      if (hasEducationRelevance && answers.education) {
        topElements.push({
          category: 'Education & Learning',
          content: answers.education,
          score: 1
        })
      }
    }
    
    // Return only the category and content (remove score)
    return topElements.map(element => ({
      category: element.category,
      content: element.content
    }))
  }

  /**
   * Build a fallback context when no personal story is available
   */
  static buildFallbackContext(): string {
    return "PERSONAL STORY CONTEXT:\n" +
           "No personal story data available. Generate content based entirely on the user's prompt and topic.\n" +
           "Focus on creating valuable, engaging content that resonates with the target audience.\n" +
           "Use general best practices and industry insights without personal references.\n\n"
  }

  /**
   * Extract key themes from personal story for content generation
   */
  static extractStoryThemes(storyData: PersonalStoryData): string[] {
    const themes: string[] = []
    const { answers } = storyData

    // Extract themes based on content
    const allText = Object.values(answers).join(' ').toLowerCase()
    
    if (allText.includes('leadership') || allText.includes('team') || allText.includes('manage') || allText.includes('career')) {
      themes.push('leadership')
    }
    
    if (allText.includes('innovation') || allText.includes('creative') || allText.includes('new') || allText.includes('education')) {
      themes.push('innovation')
    }
    
    if (allText.includes('growth') || allText.includes('learn') || allText.includes('develop') || allText.includes('future')) {
      themes.push('growth')
    }
    
    if (allText.includes('challenge') || allText.includes('difficult') || allText.includes('overcome') || allText.includes('early')) {
      themes.push('resilience')
    }
    
    if (allText.includes('success') || allText.includes('achieve') || allText.includes('win') || allText.includes('identity')) {
      themes.push('success')
    }
    
    if (allText.includes('mentor') || allText.includes('help') || allText.includes('support') || allText.includes('personal')) {
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
