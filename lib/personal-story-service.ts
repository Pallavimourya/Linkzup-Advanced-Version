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
    
    let context = "<personal_story_context>\n"
    context += "You are creating authentic, personalized content using this person's unique life journey:\n\n"
    
    if (answers.early_life) {
      context += `<early_life>${answers.early_life}</early_life>\n\n`
    }
    
    if (answers.education) {
      context += `<education>${answers.education}</education>\n\n`
    }
    
    if (answers.career_journey) {
      context += `<career_journey>${answers.career_journey}</career_journey>\n\n`
    }
    
    if (answers.personal_side) {
      context += `<personal_side>${answers.personal_side}</personal_side>\n\n`
    }
    
    if (answers.current_identity) {
      context += `<current_identity>${answers.current_identity}</current_identity>\n\n`
    }
    
    if (answers.future_aspirations) {
      context += `<future_aspirations>${answers.future_aspirations}</future_aspirations>\n\n`
    }

    context += "</personal_story_context>\n\n"
    
    context += "<content_guidelines>\n"
    context += `Tone: ${customization.tone}\n`
    context += `Audience: ${customization.targetAudience}\n`
    context += `Goal: ${customization.mainGoal}\n`
    context += `Emotional Style: ${customization.emotionalTone}\n`
    context += `Personal Touch: ${customization.personalTouch ? 'Yes' : 'No'}\n`
    context += "</content_guidelines>\n\n"

    context += "<integration_rules>\n"
    context += "1. Select the most relevant story elements for the topic\n"
    context += "2. Weave personal details naturally - don't force connections\n"
    context += "3. Use specific emotions and experiences to create authenticity\n"
    context += "4. Maintain professional tone while being personal\n"
    context += "5. Create content that only this person could write\n"
    context += "</integration_rules>"

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
    
    let context = "<contextual_story_analysis>\n"
    context += `Topic Focus: "${topic}"\n`
    context += "Create authentic content by connecting this topic to the person's unique life experiences.\n"
    context += "</contextual_story_analysis>\n\n"
    
    context += "<life_journey_sections>\n"
    
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
          context += `<priority_section name="${section.label}">${section.content}</priority_section>\n\n`
        } else {
          context += `<section name="${section.label}">${section.content}</section>\n\n`
        }
      }
    })

    context += "</life_journey_sections>\n\n"
    
    context += "<content_parameters>\n"
    context += `Tone: ${customization.tone}\n`
    context += `Audience: ${customization.targetAudience}\n`
    context += `Goal: ${customization.mainGoal}\n`
    context += `Emotional Style: ${customization.emotionalTone}\n`
    context += `Personal Touch: ${customization.personalTouch ? 'Yes' : 'No'}\n`
    context += "</content_parameters>\n\n"

    context += "<content_creation_strategy>\n"
    context += "1. Analyze topic relevance to each life section\n"
    context += "2. Prioritize high-relevance sections while maintaining narrative flow\n"
    context += "3. Create natural connections between topic and personal experiences\n"
    context += "4. Weave multiple life phases into a cohesive story\n"
    context += "5. Use specific details to create authenticity\n"
    context += "6. Ensure content reflects the complete personal journey\n"
    context += "</content_creation_strategy>"

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
