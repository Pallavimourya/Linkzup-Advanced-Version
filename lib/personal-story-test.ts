import { PersonalStoryService } from "./personal-story-service"
import { aiService } from "./ai-service"

/**
 * Test utility for personal story integration
 * This file can be used to test the personal story integration functionality
 */

export interface TestPersonalStoryData {
  userEmail: string
  answers: {
    challenge: string
    achievement: string
    failure: string
    mentor: string
    turning_point: string
    lesson: string
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
      challenge: "I faced a major project deadline crisis when our lead developer left unexpectedly, leaving our team without critical knowledge of the system architecture.",
      achievement: "Successfully led a cross-functional team of 12 people to deliver a complex software project 2 weeks ahead of schedule, resulting in a 30% increase in customer satisfaction.",
      failure: "Early in my career, I made a poor hiring decision that cost the company $50,000 and delayed our product launch by 3 months. This taught me the importance of thorough vetting and cultural fit.",
      mentor: "My former manager Sarah taught me that leadership isn't about being the smartest person in the room, but about empowering others to be their best selves and creating an environment where everyone can thrive.",
      turning_point: "Switching from a technical role to management was scary, but it opened up opportunities to impact more people and drive organizational change. It completely changed how I view my career and purpose.",
      lesson: "The most important lesson I've learned is that vulnerability and authenticity in leadership create stronger teams. When I started sharing my own struggles and mistakes, my team became more open and collaborative."
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
