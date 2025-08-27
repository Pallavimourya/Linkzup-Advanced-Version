import OpenAI from "openai"

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function generateTopics(niche: string, count = 5) {
  try {
    const prompt = `Generate ${count} engaging and viral-worthy topic ideas for the "${niche}" niche. 
    For each topic, provide:
    1. A compelling title
    2. A brief description (1-2 sentences)
    3. A viral potential percentage (realistic estimate)
    
    Format as JSON array with objects containing: title, description, viralChance`

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.8,
    })

    const content = completion.choices[0]?.message?.content
    if (!content) throw new Error("No content generated")

    return JSON.parse(content)
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
        prompt = `Write an engaging story about "${topic}" in the ${niche} niche. Make it personal, relatable, and shareable. Include emotional hooks and a clear message. Length: 200-300 words.`
        break
      case "List":
        prompt = `Create a compelling list post about "${topic}" in the ${niche} niche. Use numbered points, make each point valuable and actionable. Include an engaging intro and conclusion. Length: 250-350 words.`
        break
      case "Quote":
        prompt = `Create an inspirational quote post about "${topic}" in the ${niche} niche. Include the main quote, context/explanation, and a call-to-action. Make it shareable and motivational. Length: 150-200 words.`
        break
      case "How-to":
        prompt = `Write a step-by-step how-to guide about "${topic}" in the ${niche} niche. Make it practical, easy to follow, and valuable. Include clear steps and tips. Length: 300-400 words.`
        break
      case "Question":
        prompt = `Create an engaging question post about "${topic}" in the ${niche} niche. Start with a thought-provoking question, provide context, and encourage discussion. Length: 150-250 words.`
        break
      case "Tip":
        prompt = `Share a valuable tip about "${topic}" in the ${niche} niche. Make it actionable, specific, and immediately useful. Include why it works and how to implement it. Length: 200-300 words.`
        break
      default:
        prompt = `Create engaging content about "${topic}" in the ${niche} niche. Make it valuable, shareable, and relevant to the audience. Length: 250-350 words.`
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
    })

    return completion.choices[0]?.message?.content || ""
  } catch (error) {
    console.error("Error generating content:", error)
    throw error
  }
}
