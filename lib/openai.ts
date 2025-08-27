import OpenAI from "openai"

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

interface LinkedInPostParams {
  prompt: string
  tone: string
  language: string
  wordCount: string
  targetAudience: string
  mainGoal: string
}

export async function generateLinkedInPosts(params: LinkedInPostParams) {
  try {
    const {
      prompt,
      tone,
      language,
      wordCount,
      targetAudience,
      mainGoal,
    } = params

    // Build dynamic prompt incorporating all user parameters
    const dynamicPrompt = `Generate 6 unique, professional LinkedIn posts that align with these parameters:

Topic/Subject: ${prompt}
Tone: ${tone || "professional"}
Language: ${language || "english"}
Word count: approximately ${wordCount || "150"} words
Target audience: ${targetAudience || "LinkedIn professionals"}
Main goal: ${mainGoal || "engagement"}

Requirements:
- Make each post original, engaging, human-like and appropriate for LinkedIn
- Avoid repetition and generic templates
- Use the specified tone consistently
- Write in ${language} language
- Target the specified audience
- Align with the main goal
- Include relevant hashtags
- Make posts shareable and conversation-starting
- Use emojis appropriately for LinkedIn
- Include clear calls-to-action where appropriate

Format the response as 6 distinct posts, each separated by "---POST_SEPARATOR---". Each post should be complete and ready to publish.`

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [{ role: "user", content: dynamicPrompt }],
      temperature: 0.8,
      max_tokens: 2000,
    })

    const content = completion.choices[0]?.message?.content
    if (!content) throw new Error("No content generated")

    // Parse the response into individual posts
    const posts = content
      .split("---POST_SEPARATOR---")
      .map((post, index) => post.trim())
      .filter((post) => post.length > 0)
      .map((post, index) => ({
        id: `post-${Date.now()}-${index}`,
        content: post,
        tone: tone || "professional",
        wordCount: parseInt(wordCount) || 150,
        createdAt: new Date(),
      }))

    return posts
  } catch (error) {
    console.error("Error generating LinkedIn posts:", error)
    throw error
  }
}

export async function generateTopics(niche: string, count = 5) {
  try {
    const prompt = `Generate ${count} engaging and viral-worthy topic titles for the "${niche}" niche. 
    
    Requirements:
    - Create compelling, shareable topic titles
    - Focus on trending and relevant subjects within the niche
    - Make titles engaging and click-worthy
    - Avoid generic or overused topics
    - Each title should be 5-10 words maximum
    
    Return ONLY a JSON array of strings containing the topic titles.
    Example format: ["Title 1", "Title 2", "Title 3"]`

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.8,
      max_tokens: 1000,
    })

    const content = completion.choices[0]?.message?.content
    if (!content) throw new Error("No content generated")

    // Try to parse JSON, if it fails, try to extract titles from text
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
      .slice(0, count)

    return titles
  } catch (error) {
    console.error("Error generating topics:", error)
    throw error
  }
}

export async function generateContent(topic: string, format: string, niche: string) {
  try {
    let prompt = ""

    switch (format) {
      case "Story":
        prompt = `Write an engaging LinkedIn story about "${topic}" in the ${niche} niche. 
        
        Requirements:
        - Make it personal, relatable, and shareable
        - Include emotional hooks and a clear message
        - Use storytelling techniques (conflict, resolution, lesson)
        - Add relevant hashtags
        - Include a call-to-action
        - Length: 200-300 words
        - Format for LinkedIn with proper line breaks and emojis`
        break
      case "List":
        prompt = `Create a compelling LinkedIn list post about "${topic}" in the ${niche} niche.
        
        Requirements:
        - Use numbered points (1️⃣, 2️⃣, 3️⃣, etc.)
        - Make each point valuable and actionable
        - Include an engaging intro and conclusion
        - Add relevant hashtags
        - Include a call-to-action
        - Length: 250-350 words
        - Format for LinkedIn with proper line breaks and emojis`
        break
      case "Quote":
        prompt = `Create an inspirational LinkedIn quote post about "${topic}" in the ${niche} niche.
        
        Requirements:
        - Include the main quote (use quotation marks)
        - Provide context/explanation
        - Add a call-to-action
        - Make it shareable and motivational
        - Add relevant hashtags
        - Length: 150-200 words
        - Format for LinkedIn with proper line breaks and emojis`
        break
      case "Before/After":
        prompt = `Create a compelling before/after LinkedIn post about "${topic}" in the ${niche} niche.
        
        Requirements:
        - Show transformation or improvement
        - Use "Before" and "After" sections clearly
        - Include specific results or outcomes
        - Add relevant hashtags
        - Include a call-to-action
        - Length: 200-300 words
        - Format for LinkedIn with proper line breaks and emojis`
        break
      case "Tips":
        prompt = `Share valuable LinkedIn tips about "${topic}" in the ${niche} niche.
        
        Requirements:
        - Provide 3-5 actionable tips
        - Make each tip specific and immediately useful
        - Include why each tip works
        - Add relevant hashtags
        - Include a call-to-action
        - Length: 200-300 words
        - Format for LinkedIn with proper line breaks and emojis`
        break
      case "Insights":
        prompt = `Share deep insights about "${topic}" in the ${niche} niche.
        
        Requirements:
        - Provide unique perspective or analysis
        - Include data or examples if relevant
        - Make it thought-provoking
        - Add relevant hashtags
        - Include a call-to-action
        - Length: 250-350 words
        - Format for LinkedIn with proper line breaks and emojis`
        break
      case "Question":
        prompt = `Create an engaging LinkedIn question post about "${topic}" in the ${niche} niche.
        
        Requirements:
        - Start with a thought-provoking question
        - Provide context and background
        - Encourage discussion and comments
        - Add relevant hashtags
        - Include a call-to-action
        - Length: 150-250 words
        - Format for LinkedIn with proper line breaks and emojis`
        break
      default:
        prompt = `Create engaging LinkedIn content about "${topic}" in the ${niche} niche.
        
        Requirements:
        - Make it valuable, shareable, and relevant
        - Add relevant hashtags
        - Include a call-to-action
        - Length: 250-350 words
        - Format for LinkedIn with proper line breaks and emojis`
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      max_tokens: 1000,
    })

    return completion.choices[0]?.message?.content || ""
  } catch (error) {
    console.error("Error generating content:", error)
    throw error
  }
}
