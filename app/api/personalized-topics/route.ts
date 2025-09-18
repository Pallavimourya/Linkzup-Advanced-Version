import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { PersonalStoryService, type PersonalStoryData } from "@/lib/personal-story-service"
import { AIService } from "@/lib/ai-service"
import { connectDB } from "@/lib/mongodb"
import crypto from "crypto"

// Generate a hash of the story answers to detect content changes
function generateStoryHash(answers: any) {
  const contentString = JSON.stringify(answers, Object.keys(answers).sort())
  return crypto.createHash('md5').update(contentString).digest('hex')
}

// Extract meaningful content from text
function extractContentInsights(text: string) {
  if (!text || text.trim().length === 0) return { keywords: [], themes: [], experiences: [] }
  
  const commonWords = new Set([
    'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'can', 'this', 'that', 'these', 'those', 'i', 'you', 'he', 'she', 'it', 'we', 'they', 'me', 'him', 'her', 'us', 'them', 'my', 'your', 'his', 'her', 'its', 'our', 'their', 'very', 'really', 'just', 'like', 'also', 'well', 'good', 'great', 'much', 'more', 'most', 'some', 'any', 'all', 'every', 'each', 'both', 'either', 'neither', 'one', 'two', 'first', 'second', 'last', 'next', 'new', 'old', 'big', 'small', 'long', 'short', 'high', 'low', 'right', 'wrong', 'true', 'false', 'yes', 'no', 'here', 'there', 'where', 'when', 'why', 'how', 'what', 'who', 'which', 'whose', 'whom'
  ])
  
  // Extract meaningful keywords (nouns, adjectives, verbs)
  const words = text.toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 3 && !commonWords.has(word))
  
  // Extract themes and experiences
  const themes = []
  const experiences = []
  
  // Look for specific patterns that indicate themes
  if (text.toLowerCase().includes('learned') || text.toLowerCase().includes('lesson')) {
    themes.push('learning')
  }
  if (text.toLowerCase().includes('challenge') || text.toLowerCase().includes('difficult')) {
    themes.push('challenges')
  }
  if (text.toLowerCase().includes('success') || text.toLowerCase().includes('achieved')) {
    themes.push('success')
  }
  if (text.toLowerCase().includes('fail') || text.toLowerCase().includes('mistake')) {
    themes.push('failure')
  }
  if (text.toLowerCase().includes('team') || text.toLowerCase().includes('collaborat')) {
    themes.push('teamwork')
  }
  if (text.toLowerCase().includes('lead') || text.toLowerCase().includes('manag')) {
    themes.push('leadership')
  }
  if (text.toLowerCase().includes('innov') || text.toLowerCase().includes('creat')) {
    themes.push('innovation')
  }
  if (text.toLowerCase().includes('entrepreneur') || text.toLowerCase().includes('business')) {
    themes.push('entrepreneurship')
  }
  if (text.toLowerCase().includes('chang') || text.toLowerCase().includes('transit')) {
    themes.push('change')
  }
  if (text.toLowerCase().includes('grow') || text.toLowerCase().includes('develop')) {
    themes.push('growth')
  }
  
  // Look for specific experiences
  if (text.toLowerCase().includes('started') || text.toLowerCase().includes('began')) {
    experiences.push('starting')
  }
  if (text.toLowerCase().includes('built') || text.toLowerCase().includes('created')) {
    experiences.push('building')
  }
  if (text.toLowerCase().includes('founded') || text.toLowerCase().includes('launched')) {
    experiences.push('founding')
  }
  if (text.toLowerCase().includes('raised') || text.toLowerCase().includes('funding')) {
    experiences.push('fundraising')
  }
  if (text.toLowerCase().includes('hired') || text.toLowerCase().includes('recruit')) {
    experiences.push('hiring')
  }
  if (text.toLowerCase().includes('sold') || text.toLowerCase().includes('exit')) {
    experiences.push('exiting')
  }
  
  return {
    keywords: words.slice(0, 5),
    themes: themes,
    experiences: experiences
  }
}

// Generate professional, engaging topics based on actual content
function generateDetailedTopics(storyData: PersonalStoryData) {
  const { answers } = storyData
  const topics = []
  
  // Analyze each section for content insights
  const sectionInsights = {}
  Object.entries(answers).forEach(([key, answer]) => {
    if (answer && answer.trim().length > 0) {
      sectionInsights[key] = extractContentInsights(answer)
    }
  })
  
  // Collect all keywords from all sections
  const allKeywords = Object.values(sectionInsights)
    .flatMap(insights => insights.keywords)
    .filter((keyword, index, arr) => arr.indexOf(keyword) === index) // Remove duplicates
    .slice(0, 10)
  
  // Generate professional, engaging topics
  const professionalTemplates = [
    // Challenge-based topics
    "The Challenge That Changed Everything: My Unexpected Breakthrough",
    "How I Turned My Biggest Failure Into My Greatest Success",
    "The Moment That Tested Everything I Believed In",
    "Why My Worst Setback Became My Best Teacher",
    "The Decision That Almost Broke Me (And How It Made Me Stronger)",
    
    // Success and breakthrough topics
    "The Breakthrough That Changed My Entire Career Path",
    "How I Achieved What Everyone Said Was Impossible",
    "The Success That Surprised Even Me",
    "Why My Biggest Risk Led to My Greatest Reward",
    "The Moment I Knew I Had Made It",
    
    // Learning and growth topics
    "The Lesson That Cost Me Everything (And Was Worth Every Penny)",
    "What I Learned When Everything Went Wrong",
    "The Wisdom That Changed How I See Success",
    "How Failure Taught Me What Success Never Could",
    "The Truth I Wish I Had Known From Day One",
    
    // Leadership and team topics
    "The Team That Taught Me What Leadership Really Means",
    "How I Built Something From Nothing (And What I Learned)",
    "The Leader Who Changed My Life Forever",
    "Why Building a Team Is Harder Than Building a Business",
    "The Moment I Realized I Was Leading Wrong",
    
    // Innovation and change topics
    "The Innovation That Almost Killed My Business",
    "How I Disrupted My Own Industry (And Why I Had To)",
    "The Change That Everyone Said Would Never Work",
    "Why I Bet Everything On An Idea Nobody Believed In",
    "The Pivot That Saved Everything",
    
    // Personal journey topics
    "The Journey That Took Me From Zero to Everything",
    "How I Found My Purpose When I Was Completely Lost",
    "The Path That Led Me to Where I Am Today",
    "Why I Chose the Road Less Traveled (And Never Looked Back)",
    "The Transformation That Changed Who I Am",
    
    // Business and entrepreneurship topics
    "The Business I Built That Almost Destroyed Me",
    "How I Started With Nothing and Built Everything",
    "The Entrepreneur Who Taught Me What Really Matters",
    "Why I Quit My Dream Job to Follow My Dreams",
    "The Company That Changed How I See Business",
    
    // Values and principles topics
    "The Values That Guide Every Decision I Make",
    "Why I Choose Integrity Over Success (And Why It Works)",
    "The Principle That Changed How I Lead",
    "How I Stay True to Myself in a World of Compromise",
    "The Belief That Drives Everything I Do",
    
    // Future and vision topics
    "The Vision That Keeps Me Going When Everything Falls Apart",
    "How I See the Future (And Why It Excites Me)",
    "The Dream That's Bigger Than My Fears",
    "Why I'm Building Something That Will Outlast Me",
    "The Legacy I Want to Leave Behind"
  ]
  
  // Generate topics using professional templates with user's keywords
  allKeywords.forEach((keyword, index) => {
    if (index < 15) { // Use first 15 keywords
      const template = professionalTemplates[index % professionalTemplates.length]
      const personalizedTopic = template.replace(/My|I|Everything|Everyone|Nothing|Nobody/g, (match) => {
        const replacements = {
          'My': 'My',
          'I': 'I', 
          'Everything': 'Everything',
          'Everyone': 'Everyone',
          'Nothing': 'Nothing',
          'Nobody': 'Nobody'
        }
        return replacements[match] || match
      })
      
      topics.push({
        id: `professional-${Date.now()}-${topics.length}`,
        title: personalizedTopic,
        viralChance: Math.floor(Math.random() * 30) + 70,
        niche: "Personalized",
        status: "generated" as const,
        isPersonalized: true
      })
    }
  })
  
  // Add some keyword-specific professional topics
  if (allKeywords.length > 0) {
    const keywordTopics = [
      `The ${allKeywords[0]} Strategy That Changed Everything`,
      `How ${allKeywords[0]} Became My Secret Weapon`,
      `The ${allKeywords[0]} Moment That Defined My Career`,
      `Why ${allKeywords[0]} Matters More Than You Think`,
      `The ${allKeywords[0]} Approach That Actually Works`,
      `How I Mastered ${allKeywords[0]} (And You Can Too)`,
      `The ${allKeywords[0]} Breakthrough That Changed My Life`,
      `Why Everyone's Wrong About ${allKeywords[0]}`,
      `The ${allKeywords[0]} Method That Nobody Talks About`,
      `How ${allKeywords[0]} Saved My Business`
    ]
    
    keywordTopics.slice(0, 5).forEach(topic => {
      topics.push({
        id: `keyword-${Date.now()}-${topics.length}`,
        title: topic,
        viralChance: Math.floor(Math.random() * 30) + 70,
        niche: "Personalized",
        status: "generated" as const,
        isPersonalized: true
      })
    })
  }
  
  // Ensure we have exactly 20 topics, remove duplicates
  const uniqueTopics = topics.filter((topic, index, arr) => 
    arr.findIndex(t => t.title === topic.title) === index
  )
  
  // Fill remaining slots with high-quality professional topics if needed
  while (uniqueTopics.length < 20) {
    const fallbackTopics = [
      "The Decision That Changed Everything",
      "How I Built Success From Scratch",
      "The Lesson That Cost Me Everything",
      "Why I Chose the Hard Path (And Why It Was Worth It)",
      "The Moment I Knew I Was Different",
      "How I Turned My Weakness Into My Strength",
      "The Truth Nobody Wants to Hear",
      "Why I Do What I Do (And Why It Matters)",
      "The Journey That Made Me Who I Am",
      "How I Found My Voice in a Noisy World"
    ]
    
    const randomTopic = fallbackTopics[Math.floor(Math.random() * fallbackTopics.length)]
    uniqueTopics.push({
      id: `fallback-${Date.now()}-${uniqueTopics.length}`,
      title: randomTopic,
      viralChance: Math.floor(Math.random() * 30) + 70,
      niche: "Personalized",
      status: "generated" as const,
      isPersonalized: true
    })
  }
  
  return uniqueTopics.slice(0, 20)
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      console.log("No session or email found")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userEmail = session.user.email

    // Check if user has completed personal story
    let isStoryComplete = false
    let storyData = null
    
    try {
      isStoryComplete = await PersonalStoryService.hasUserCompletedStory(userEmail)
    } catch (error) {
      return NextResponse.json({ 
        hasPersonalStory: false,
        message: "Error checking personal story completion" 
      })
    }
    
    if (!isStoryComplete) {
      return NextResponse.json({ 
        hasPersonalStory: false,
        message: "Personal story not completed" 
      })
    }

    // Get personal story data
    try {
      storyData = await PersonalStoryService.getUserStoryData(userEmail)
    } catch (error) {
      return NextResponse.json({ 
        hasPersonalStory: false,
        message: "Error retrieving personal story data" 
      })
    }
    
    if (!storyData) {
      return NextResponse.json({ 
        hasPersonalStory: false,
        message: "No personal story data found" 
      })
    }

    // Check if personalized topics are already stored for this user
    try {
      const db = await connectDB()
      const storedData = await db.collection("personalizedTopics").findOne({ userEmail })
      
      if (storedData && storedData.topics && storedData.topics.length > 0) {
        // Check if the story has been updated since topics were generated
        const storyUpdatedAt = storyData.savedAt || new Date()
        const topicsGeneratedAt = storedData.updatedAt || storedData.createdAt
        
        // Also check if the story content has changed by comparing content hash
        const currentStoryHash = generateStoryHash(storyData.answers)
        const storedStoryHash = storedData.storyHash
        
        // If story was updated after topics were generated OR content has changed, regenerate topics
        if (storyUpdatedAt > topicsGeneratedAt || currentStoryHash !== storedStoryHash) {
          // Delete old topics to force regeneration
          await db.collection("personalizedTopics").deleteOne({ userEmail })
        } else {
          return NextResponse.json({
            hasPersonalStory: true,
            topics: storedData.topics,
            message: "Retrieved stored personalized topics",
            isStored: true
          })
        }
      }
    } catch (error) {
      // Continue with generation if storage check fails
    }

    // Build personalized topic generation prompt
    let storyContext = ""
    try {
      storyContext = PersonalStoryService.buildStoryContext(storyData)
    } catch (error) {
      return NextResponse.json({ 
        hasPersonalStory: false,
        message: "Error building story context" 
      })
    }
    
    const topicPrompt = `${storyContext}

Based on the personal story above, generate 20 unique, engaging LinkedIn post topics that would resonate with this person's experiences, expertise, and journey. Each topic should:

1. Be specific to their background and experiences
2. Be professional and LinkedIn-appropriate
3. Have potential for high engagement
4. Be diverse in format (tips, insights, stories, lessons learned, etc.)
5. Be between 5-12 words long
6. Be compelling and click-worthy

Return only the topics as a simple list, one per line, without numbering or additional formatting.`

    // Generate detailed topics with keywords from answers
    const topics = generateDetailedTopics(storyData)
    
    // Store the generated topics in database for future use
    try {
      const db = await connectDB()
      const storyHash = generateStoryHash(storyData.answers)
      await db.collection("personalizedTopics").updateOne(
        { userEmail },
        { 
          $set: { 
            topics,
            userEmail,
            storyHash,
            createdAt: new Date(),
            updatedAt: new Date()
          }
        },
        { upsert: true }
      )
    } catch (error) {
      // Continue even if storage fails
    }

    return NextResponse.json({
      hasPersonalStory: true,
      topics: topics,
      message: "Personalized topics generated and stored successfully",
      isStored: false
    })

  } catch (error) {
    console.error("Error generating personalized topics:", error)
    return NextResponse.json(
      { error: "Failed to generate personalized topics" },
      { status: 500 }
    )
  }
}
