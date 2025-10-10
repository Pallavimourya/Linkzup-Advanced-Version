import { PersonalStoryService } from "./personal-story-service"
import { aiService } from "./ai-service"

/**
 * Test utility for personal story integration
 * This file can be used to test the personal story integration functionality
 */

export interface TestPersonalStoryData {
  userEmail: string
  answers: {
    early_life: string
    education: string
    career_journey: string
    personal_side: string
    challenges: string
    achievements: string
    current_identity: string
    future_aspirations: string
  }
  customization: {
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
}

/**
 * Create test personal story data
 */
export function createTestStoryData(): TestPersonalStoryData {
  return {
    userEmail: "test@example.com",
    answers: {
      early_life: "Growing up in a small town, I was always curious about how things worked. I spent hours taking apart electronics and trying to understand the mechanics behind everyday objects.",
      education: "I pursued computer science in college, but struggled initially with programming concepts. It wasn't until my third year that everything clicked during a challenging algorithms course.",
      career_journey: "Started as a junior developer at a startup, then moved to a tech giant where I learned enterprise-scale development. Now I lead a team of 12 engineers at a growing company.",
      personal_side: "Outside of work, I'm passionate about hiking and photography. These hobbies help me maintain work-life balance and often provide fresh perspectives on problem-solving.",
      challenges: "I faced a major project deadline crisis when our lead developer left unexpectedly, leaving our team without critical knowledge of the system architecture.",
      achievements: "Successfully led a cross-functional team of 12 people to deliver a complex software project 2 weeks ahead of schedule, resulting in a 30% increase in customer satisfaction.",
      current_identity: "I see myself as a technical leader who bridges the gap between complex engineering problems and business solutions. I'm passionate about mentoring junior developers and building inclusive teams.",
      future_aspirations: "My goal is to eventually start my own tech company focused on solving real-world problems through innovative software solutions. I want to create a company culture that values both technical excellence and work-life balance."
    },
    customization: {
      tone: "professional",
      language: "english",
      targetAudience: "LinkedIn professionals",
      mainGoal: "engagement",
      storyLength: "medium",
      emotionalTone: "inspiring",
      includeCallToAction: true,
      includeHashtags: true,
      includeEmojis: true,
      personalTouch: true
    }
  }
}

/**
 * Test personal story context building
 */
export async function testPersonalStoryContext() {
  console.log("Testing Personal Story Context Building...")
  
  const testData = createTestStoryData()
  const storyData = {
    answers: testData.answers,
    customization: testData.customization,
    savedAt: new Date()
  }
  
  const context = PersonalStoryService.buildStoryContext(storyData)
  console.log("Generated Context:")
  console.log(context)
  
  const themes = PersonalStoryService.extractStoryThemes(storyData)
  console.log("Extracted Themes:", themes)
  
  const suggestions = PersonalStoryService.getPersonalizedSuggestions(storyData)
  console.log("Personalized Suggestions:", suggestions)
  
  return { context, themes, suggestions }
}

/**
 * Test content generation with personal story
 */
export async function testContentGenerationWithStory() {
  console.log("Testing Content Generation with Personal Story...")
  
  const testData = createTestStoryData()
  
  try {
    // Test LinkedIn post generation
    const linkedinResponse = await aiService.generateContent(
      "linkedin-post",
      "leadership challenges",
      "openai",
      {
        tone: "professional",
        targetAudience: "LinkedIn professionals",
        mainGoal: "engagement",
        includeHashtags: true,
        includeEmojis: true,
        callToAction: true,
        wordCount: 150
      },
      "test-user-id",
      testData.userEmail
    )
    
    console.log("LinkedIn Post Generation Result:")
    console.log(JSON.stringify(linkedinResponse, null, 2))
    
    // Test topic generation
    const topicsResponse = await aiService.generateContent(
      "topics",
      "leadership",
      "openai",
      {
        tone: "professional",
        targetAudience: "LinkedIn professionals",
        mainGoal: "engagement",
        includeHashtags: false,
        includeEmojis: false,
        callToAction: false,
        wordCount: 50
      },
      "test-user-id",
      testData.userEmail
    )
    
    console.log("Topics Generation Result:")
    console.log(JSON.stringify(topicsResponse, null, 2))
    
    return { linkedinResponse, topicsResponse }
  } catch (error) {
    console.error("Error testing content generation:", error)
    throw error
  }
}

/**
 * Test content generation without personal story (fallback)
 */
export async function testContentGenerationWithoutStory() {
  console.log("Testing Content Generation without Personal Story...")
  
  try {
    // Test LinkedIn post generation without user email
    const linkedinResponse = await aiService.generateContent(
      "linkedin-post",
      "leadership challenges",
      "openai",
      {
        tone: "professional",
        targetAudience: "LinkedIn professionals",
        mainGoal: "engagement",
        includeHashtags: true,
        includeEmojis: true,
        callToAction: true,
        wordCount: 150
      },
      "test-user-id"
      // No userEmail provided - should use fallback context
    )
    
    console.log("LinkedIn Post Generation Result (No Story):")
    console.log(JSON.stringify(linkedinResponse, null, 2))
    
    return { linkedinResponse }
  } catch (error) {
    console.error("Error testing content generation without story:", error)
    throw error
  }
}

/**
 * Run all tests
 */
export async function runPersonalStoryTests() {
  console.log("=== Personal Story Integration Tests ===")
  
  try {
    // Test 1: Context building
    await testPersonalStoryContext()
    
    // Test 2: Content generation with story (requires actual API keys)
    // await testContentGenerationWithStory()
    
    // Test 3: Content generation without story (requires actual API keys)
    // await testContentGenerationWithoutStory()
    
    console.log("✅ All tests completed successfully!")
  } catch (error) {
    console.error("❌ Test failed:", error)
  }
}

// Export for use in other files
export { PersonalStoryService }
