import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { connectDB } from "@/lib/mongodb"
import { PersonalStoryService } from "@/lib/personal-story-service"
import { AIService } from "@/lib/ai-service"

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions) as any
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { action, storyId } = await request.json()
    const userEmail = session.user.email

    if (action === "generate") {
      return await generateTopicsFromStory(userEmail, storyId)
    } else if (action === "regenerate") {
      return await regenerateTopicsFromStory(userEmail, storyId)
    } else {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 })
    }
  } catch (error) {
    console.error("Error in story-topics API:", error)
    return NextResponse.json(
      { error: "Failed to process request" },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions) as any
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userEmail = session.user.email
    const { searchParams } = new URL(request.url)
    const storyId = searchParams.get("storyId")

    return await getTopicsForStory(userEmail, storyId || undefined)
  } catch (error) {
    console.error("Error fetching story topics:", error)
    return NextResponse.json(
      { error: "Failed to fetch topics" },
      { status: 500 }
    )
  }
}

async function generateTopicsFromStory(userEmail: string, storyId?: string) {
  try {
    // Get personal story data
    const storyData = await PersonalStoryService.getUserStoryData(userEmail)
    if (!storyData) {
      return NextResponse.json(
        { error: "No personal story data found. Please complete your personal story first." },
        { status: 400 }
      )
    }

    // Build story context
    const storyContext = PersonalStoryService.buildStoryContext(storyData)
    
    // Create ChatGPT prompt for topic generation
    const topicPrompt = `You are a professional editor and human-like storyteller.

Below is a personal story written by a real person. Your task is to carefully analyze it — identify real-life experiences, emotions, decisions, and turning points — and then generate a list of original, human-sounding blog topic ideas that could naturally come out of this story.

### Focus Guidelines:
1. Every topic must come directly from something that actually happened or was mentioned in the story — not from imagination.
2. Use the tone, emotion, and context of the story itself to inspire the topic.
3. Avoid overused AI-like words such as "Empowerment", "Authenticity", "Journey", "Resilience", "Evolution", "Transformation".
4. Think like a human editor naming real blog posts or personal essays — natural and believable.
5. No generic motivational titles — every topic must feel personal and specific to the person's story.
6. Maximum 5 unique topics.
7. No repetition of previously generated topics for this user or story.
8. Output should be plain text, not numbered, not JSON — just list each topic on a new line.

### Story:
${storyContext}

### Example of good topic generation:
If story says: "I worked at a tea stall before becoming a software engineer."
→ Topics like:
- From Serving Tea to Writing Code
- What a Tea Stall Taught Me About Customer Experience

If story says: "My mother taught me discipline by making me wake up early."
→ Topics like:
- Early Mornings and Life Lessons from My Mother
- How My Mother's Routine Built My Discipline

Now, generate the most natural, story-based, and specific blog topics for the story below:`

    // Generate topics using AI service
    const aiService = new AIService()
    const response = await aiService.generateContent(
      "topics",
      topicPrompt,
      "openai",
      {
        tone: "professional",
        targetAudience: "LinkedIn professionals",
        mainGoal: "engagement",
        includeHashtags: false,
        includeEmojis: false,
        callToAction: false,
        wordCount: 50,
        temperature: 0.9,
        personalTouch: true,
        storytelling: true
      },
      undefined,
      userEmail
    )

    // Parse the generated topics
    let topics: string[] = []
    if (Array.isArray(response.content)) {
      topics = response.content
    } else if (typeof response.content === 'string') {
      topics = response.content.split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0)
        .slice(0, 5)
    }

    console.log("AI generated topics:", topics)

    // Ensure we have exactly 5 topics
    if (topics.length < 5) {
      const fallbackTopics = generateFallbackTopics(storyData)
      console.log("Fallback topics:", fallbackTopics)
      topics = [...topics, ...fallbackTopics].slice(0, 5)
    }

    console.log("Topics before uniqueness check:", topics)

    // Check for duplicates and ensure uniqueness
    topics = await ensureTopicUniqueness(topics, userEmail)
    
    console.log("Final topics after uniqueness check:", topics)

    // Store topics in database
    const db = await connectDB()
    const topicDocuments = topics.map((topic, index) => ({
      id: `topic-${Date.now()}-${index}`,
      userEmail,
      storyId: storyId || `story-${Date.now()}`,
      topicText: topic,
      status: "Pending Review",
      createdAt: new Date(),
      updatedAt: new Date()
    }))

    // Only insert if we have topics to insert
    if (topicDocuments.length > 0) {
      await db.collection("storyTopics").insertMany(topicDocuments)
    } else {
      console.error("No topics generated to store in database, creating emergency fallback topics")
      
      // Emergency fallback - create basic topics from story data
      const emergencyTopics = [
        "What My Story Taught Me About Success",
        "The Experience That Changed My Perspective",
        "Lessons Learned from My Journey"
      ]
      
      const emergencyDocuments = emergencyTopics.map((topic, index) => ({
        id: `emergency-topic-${Date.now()}-${index}`,
        userEmail,
        storyId: storyId || `story-${Date.now()}`,
        topicText: topic,
        status: "Pending Review",
        createdAt: new Date(),
        updatedAt: new Date()
      }))
      
      await db.collection("storyTopics").insertMany(emergencyDocuments)
      
      return NextResponse.json({
        success: true,
        topics: emergencyDocuments,
        message: "Basic topics generated from your personal story"
      })
    }

    return NextResponse.json({
      success: true,
      topics: topicDocuments,
      message: "Topics generated successfully from your personal story"
    })

  } catch (error) {
    console.error("Error generating topics from story:", error)
    return NextResponse.json(
      { error: "Failed to generate topics" },
      { status: 500 }
    )
  }
}

async function regenerateTopicsFromStory(userEmail: string, storyId?: string) {
  try {
    // Get personal story data
    const storyData = await PersonalStoryService.getUserStoryData(userEmail)
    if (!storyData) {
      return NextResponse.json(
        { error: "No personal story data found. Please complete your personal story first." },
        { status: 400 }
      )
    }

    // Get existing topics to avoid duplicates
    const db = await connectDB()
    const existingTopics = await db.collection("storyTopics")
      .find({ userEmail })
      .toArray()

    const existingTopicTexts = existingTopics.map(t => t.topicText.toLowerCase())
    
    // Also get approved topics to avoid similar themes
    const approvedTopics = await db.collection("approvedTopics")
      .find({ userEmail })
      .toArray()
    
    const approvedTopicTexts = approvedTopics.map(t => t.topicText.toLowerCase())
    
    // Combine all existing topics
    const allExistingTopics = [...existingTopicTexts, ...approvedTopicTexts]

    // Build story context
    const storyContext = PersonalStoryService.buildStoryContext(storyData)
    
    // Create ChatGPT prompt for topic regeneration
    const topicPrompt = `You are a professional editor and human-like storyteller.

Below is a personal story written by a real person. Your task is to carefully analyze it — identify real-life experiences, emotions, decisions, and turning points — and then generate a list of original, human-sounding blog topic ideas that could naturally come out of this story.

### Focus Guidelines:
1. Every topic must come directly from something that actually happened or was mentioned in the story — not from imagination.
2. Use the tone, emotion, and context of the story itself to inspire the topic.
3. Avoid overused AI-like words such as "Empowerment", "Authenticity", "Journey", "Resilience", "Evolution", "Transformation".
4. Think like a human editor naming real blog posts or personal essays — natural and believable.
5. No generic motivational titles — every topic must feel personal and specific to the person's story.
6. Maximum 5 unique topics.
7. No repetition of previously generated topics for this user or story.
8. Output should be plain text, not numbered, not JSON — just list each topic on a new line.

### Story:
${storyContext}

### Existing topics to avoid (do not repeat these or create similar ones):
${allExistingTopics.map(topic => `- ${topic}`).join('\n')}

IMPORTANT: Do not create topics with similar themes, keywords, or concepts to the existing ones above. Be completely different and explore different aspects of the story.

### Example of good topic generation:
If story says: "I worked at a tea stall before becoming a software engineer."
→ Topics like:
- From Serving Tea to Writing Code
- What a Tea Stall Taught Me About Customer Experience

If story says: "My mother taught me discipline by making me wake up early."
→ Topics like:
- Early Mornings and Life Lessons from My Mother
- How My Mother's Routine Built My Discipline

Now, generate 5 NEW, natural, story-based, and specific blog topics that are different from the existing ones above:

Focus on different aspects of the story this time. If previous topics focused on education/career, focus on personal life. If they focused on achievements, focus on challenges. If they focused on skills, focus on relationships. Be creative and explore different angles of the same story.

Generation timestamp: ${new Date().toISOString()}`

    // Generate topics using AI service
    const aiService = new AIService()
    const response = await aiService.generateContent(
      "topics",
      topicPrompt,
      "openai",
      {
        tone: "professional",
        targetAudience: "LinkedIn professionals",
        mainGoal: "engagement",
        includeHashtags: false,
        includeEmojis: false,
        callToAction: false,
        wordCount: 50,
        temperature: 0.95, // Higher temperature for more variety
        personalTouch: true,
        storytelling: true
      },
      undefined,
      userEmail
    )

    // Parse the generated topics
    let topics: string[] = []
    if (Array.isArray(response.content)) {
      topics = response.content
    } else if (typeof response.content === 'string') {
      topics = response.content.split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0)
        .slice(0, 5)
    }

    console.log("AI generated topics for regeneration:", topics)

    // Filter out duplicates and similar topics
    topics = topics.filter(topic => {
      const topicLower = topic.toLowerCase()
      
      // Check for exact duplicates
      if (allExistingTopics.includes(topicLower)) {
        return false
      }
      
      // Check for similar topics (same keywords or themes)
      const topicWords = topicLower.split(/\s+/)
      for (const existingTopic of allExistingTopics) {
        const existingWords = existingTopic.split(/\s+/)
        const commonWords = topicWords.filter(word => 
          existingWords.includes(word) && word.length > 3
        )
        
        // If more than 2 significant words match, consider it similar
        if (commonWords.length > 2) {
          return false
        }
      }
      
      return true
    })

    console.log("Topics after filtering duplicates:", topics)

    // Ensure we have exactly 5 topics
    if (topics.length < 5) {
      const fallbackTopics = generateFallbackTopics(storyData)
      const newFallbackTopics = fallbackTopics.filter(topic => {
        const topicLower = topic.toLowerCase()
        
        // Check for exact duplicates
        if (allExistingTopics.includes(topicLower)) {
          return false
        }
        
        // Check for similar topics
        const topicWords = topicLower.split(/\s+/)
        for (const existingTopic of allExistingTopics) {
          const existingWords = existingTopic.split(/\s+/)
          const commonWords = topicWords.filter(word => 
            existingWords.includes(word) && word.length > 3
          )
          
          if (commonWords.length > 2) {
            return false
          }
        }
        
        return true
      })
      topics = [...topics, ...newFallbackTopics].slice(0, 5)
    }

    // Store new topics in database
    const topicDocuments = topics.map((topic, index) => ({
      id: `topic-${Date.now()}-${index}`,
      userEmail,
      storyId: storyId || `story-${Date.now()}`,
      topicText: topic,
      status: "Pending Review",
      createdAt: new Date(),
      updatedAt: new Date()
    }))

    // Only insert if we have topics to insert
    if (topicDocuments.length > 0) {
      await db.collection("storyTopics").insertMany(topicDocuments)
    } else {
      console.error("No topics generated to store in database during regeneration, creating emergency fallback topics")
      
      // Emergency fallback - create basic topics from story data
      const emergencyTopics = [
        "What My Story Taught Me About Success",
        "The Experience That Changed My Perspective",
        "Lessons Learned from My Journey"
      ]
      
      const emergencyDocuments = emergencyTopics.map((topic, index) => ({
        id: `emergency-topic-${Date.now()}-${index}`,
        userEmail,
        storyId: storyId || `story-${Date.now()}`,
        topicText: topic,
        status: "Pending Review",
        createdAt: new Date(),
        updatedAt: new Date()
      }))
      
      await db.collection("storyTopics").insertMany(emergencyDocuments)
      
      return NextResponse.json({
        success: true,
        topics: emergencyDocuments,
        message: "Basic topics generated from your personal story"
      })
    }

    return NextResponse.json({
      success: true,
      topics: topicDocuments,
      message: "New topics generated successfully from your personal story"
    })

  } catch (error) {
    console.error("Error regenerating topics from story:", error)
    return NextResponse.json(
      { error: "Failed to regenerate topics" },
      { status: 500 }
    )
  }
}

async function getTopicsForStory(userEmail: string, storyId?: string) {
  try {
    const db = await connectDB()
    
    const query: any = { userEmail }
    if (storyId) {
      query.storyId = storyId
    }

    const topics = await db.collection("storyTopics")
      .find(query)
      .sort({ createdAt: -1 })
      .toArray()

    return NextResponse.json({
      success: true,
      topics
    })

  } catch (error) {
    console.error("Error fetching topics for story:", error)
    return NextResponse.json(
      { error: "Failed to fetch topics" },
      { status: 500 }
    )
  }
}

function generateFallbackTopics(storyData: any): string[] {
  const { answers } = storyData
  const fallbackTopics = []

  // Extract specific details from each answer to create more personalized topics
  if (answers.early_life && answers.early_life.trim().length > 20) {
    const earlyLifeText = answers.early_life.toLowerCase()
    if (earlyLifeText.includes('family') || earlyLifeText.includes('parents')) {
      fallbackTopics.push("What My Family Taught Me About Success")
    } else if (earlyLifeText.includes('school') || earlyLifeText.includes('education')) {
      fallbackTopics.push("The School Experience That Changed Everything")
    } else if (earlyLifeText.includes('challenge') || earlyLifeText.includes('difficult')) {
      fallbackTopics.push("The Early Challenge That Made Me Stronger")
    } else {
      fallbackTopics.push("How My Childhood Shaped Who I Am Today")
    }
  }

  if (answers.education && answers.education.trim().length > 20) {
    const educationText = answers.education.toLowerCase()
    if (educationText.includes('teacher') || educationText.includes('mentor')) {
      fallbackTopics.push("The Teacher Who Changed My Life")
    } else if (educationText.includes('subject') || educationText.includes('course')) {
      fallbackTopics.push("The Subject That Opened My Eyes")
    } else if (educationText.includes('college') || educationText.includes('university')) {
      fallbackTopics.push("What College Really Taught Me")
    } else {
      fallbackTopics.push("The Education That Shaped My Career")
    }
  }

  if (answers.career_journey && answers.career_journey.trim().length > 20) {
    const careerText = answers.career_journey.toLowerCase()
    if (careerText.includes('first job') || careerText.includes('started')) {
      fallbackTopics.push("My First Job and What It Taught Me")
    } else if (careerText.includes('promotion') || careerText.includes('success')) {
      fallbackTopics.push("The Moment I Knew I Was on the Right Path")
    } else if (careerText.includes('change') || careerText.includes('switch')) {
      fallbackTopics.push("Why I Made the Career Change That Changed Everything")
    } else {
      fallbackTopics.push("The Career Decision That Changed My Life")
    }
  }

  if (answers.personal_side && answers.personal_side.trim().length > 20) {
    const personalText = answers.personal_side.toLowerCase()
    if (personalText.includes('hobby') || personalText.includes('passion')) {
      fallbackTopics.push("How My Hobby Became My Secret Weapon")
    } else if (personalText.includes('family') || personalText.includes('kids')) {
      fallbackTopics.push("What My Personal Life Taught Me About Work")
    } else if (personalText.includes('sport') || personalText.includes('fitness')) {
      fallbackTopics.push("The Sport That Taught Me About Discipline")
    } else {
      fallbackTopics.push("The Personal Side That Drives My Success")
    }
  }

  if (answers.current_identity && answers.current_identity.trim().length > 20) {
    const identityText = answers.current_identity.toLowerCase()
    if (identityText.includes('expert') || identityText.includes('specialist')) {
      fallbackTopics.push("How I Became Known for What I Do")
    } else if (identityText.includes('leader') || identityText.includes('manager')) {
      fallbackTopics.push("The Leadership Style That Works for Me")
    } else if (identityText.includes('brand') || identityText.includes('reputation')) {
      fallbackTopics.push("Building My Professional Reputation One Step at a Time")
    } else {
      fallbackTopics.push("What I Want People to Remember About Me")
    }
  }

  if (answers.future_aspirations && answers.future_aspirations.trim().length > 20) {
    const futureText = answers.future_aspirations.toLowerCase()
    if (futureText.includes('goal') || futureText.includes('dream')) {
      fallbackTopics.push("The Goal That Keeps Me Moving Forward")
    } else if (futureText.includes('impact') || futureText.includes('help')) {
      fallbackTopics.push("How I Want to Make a Difference")
    } else if (futureText.includes('learn') || futureText.includes('grow')) {
      fallbackTopics.push("What I Still Want to Learn and Achieve")
    } else {
      fallbackTopics.push("My Vision for the Next Chapter")
    }
  }

  // If we still need more topics, create more specific ones based on content
  const additionalTopics = []
  const allText = Object.values(answers).join(' ').toLowerCase()
  
  // Create a variety of topic options based on different aspects
  const topicOptions = []
  
  if (allText.includes('mistake') || allText.includes('failure')) {
    topicOptions.push("The Mistake That Taught Me the Most")
  }
  if (allText.includes('mentor') || allText.includes('guide')) {
    topicOptions.push("The Person Who Believed in Me When I Didn't")
  }
  if (allText.includes('risk') || allText.includes('chance')) {
    topicOptions.push("The Risk That Paid Off")
  }
  if (allText.includes('team') || allText.includes('colleague')) {
    topicOptions.push("What I Learned from Working with Others")
  }
  if (allText.includes('money') || allText.includes('financial')) {
    topicOptions.push("The Money Lesson That Changed Everything")
  }
  if (allText.includes('time') || allText.includes('schedule')) {
    topicOptions.push("How I Learned to Manage My Time Better")
  }
  if (allText.includes('skill') || allText.includes('learn')) {
    topicOptions.push("The Skill That Opened New Doors")
  }
  if (allText.includes('network') || allText.includes('connection')) {
    topicOptions.push("The Connection That Changed My Path")
  }
  if (allText.includes('decision') || allText.includes('choice')) {
    topicOptions.push("The Decision That Changed Everything")
  }
  if (allText.includes('opportunity') || allText.includes('chance')) {
    topicOptions.push("The Opportunity I Almost Missed")
  }
  if (allText.includes('fear') || allText.includes('scared')) {
    topicOptions.push("How I Overcame My Biggest Fear")
  }
  if (allText.includes('success') || allText.includes('achievement')) {
    topicOptions.push("The Success That Surprised Me Most")
  }
  
  // Add generic but varied topics
  topicOptions.push(
    "The Experience That Changed My Perspective",
    "What I Wish I Knew Earlier",
    "The Moment Everything Clicked",
    "The Lesson I Keep Learning",
    "The Habit That Changed My Life",
    "The Book That Changed My Mind",
    "The Conversation That Mattered Most",
    "The Failure That Led to Success",
    "The Small Change That Made a Big Difference",
    "The Advice I'm Glad I Ignored"
  )
  
  // Shuffle and select unique topics
  const shuffledOptions = topicOptions.sort(() => Math.random() - 0.5)
  for (const option of shuffledOptions) {
    if (!fallbackTopics.includes(option) && fallbackTopics.length < 5) {
      fallbackTopics.push(option)
    }
  }

  return fallbackTopics.slice(0, 5)
}

async function ensureTopicUniqueness(topics: string[], userEmail: string): Promise<string[]> {
  try {
    const db = await connectDB()
    const existingTopics = await db.collection("storyTopics")
      .find({ userEmail })
      .toArray()

    const approvedTopics = await db.collection("approvedTopics")
      .find({ userEmail })
      .toArray()

    const existingTopicTexts = existingTopics.map(t => t.topicText.toLowerCase())
    const approvedTopicTexts = approvedTopics.map(t => t.topicText.toLowerCase())
    const allExistingTopics = [...existingTopicTexts, ...approvedTopicTexts]
    
    // Filter out duplicates and similar topics
    const uniqueTopics = topics.filter(topic => {
      const topicLower = topic.toLowerCase()
      
      // Check for exact duplicates
      if (allExistingTopics.includes(topicLower)) {
        return false
      }
      
      // Check for similar topics (same keywords or themes)
      const topicWords = topicLower.split(/\s+/)
      for (const existingTopic of allExistingTopics) {
        const existingWords = existingTopic.split(/\s+/)
        const commonWords = topicWords.filter(word => 
          existingWords.includes(word) && word.length > 3
        )
        
        // If more than 2 significant words match, consider it similar
        if (commonWords.length > 2) {
          return false
        }
      }
      
      return true
    })

    return uniqueTopics
  } catch (error) {
    console.error("Error ensuring topic uniqueness:", error)
    return topics // Return original topics if check fails
  }
}

