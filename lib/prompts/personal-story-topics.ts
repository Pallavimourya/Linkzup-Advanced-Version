export function getRelevantTopicPrompt(themes: string[]): { prompt: string; category: string } {
  const basePrompt = `<topic_generation_task>
You are a viral content strategist creating LinkedIn topics that will generate maximum engagement.

<personal_themes>
${themes.join(', ')}
</personal_themes>

<viral_topic_criteria>
1. Hook-driven: Start with curiosity gaps or contrarian takes
2. Personal angle: Connect to authentic life experiences
3. Universal appeal: Relatable to broad professional audience
4. Actionable insight: Provide clear value or learning
5. Emotional resonance: Trigger emotions (inspiration, empathy, motivation)
6. Trending relevance: Align with current professional conversations
</viral_topic_criteria>

<output_format>
Generate topics that are:
- 5-12 words maximum
- LinkedIn-optimized for professional audience
- Based on personal story themes provided
- Designed for maximum shares and comments
</output_format>
</topic_generation_task>`
  
  return {
    prompt: basePrompt,
    category: 'personal-story'
  }
}

export function getAllTopicPrompts(): Array<{ prompt: string; category: string }> {
  return [
    {
      prompt: `<professional_topic_generation>
You are a LinkedIn content strategist creating viral professional topics.

<viral_characteristics>
- Controversial but respectful takes on industry trends
- Behind-the-scenes insights from professional experiences
- Lessons learned from failures and successes
- Industry predictions and future outlooks
- Personal transformation stories in professional context
</viral_characteristics>

<engagement_optimization>
- Create topics that spark debate and discussion
- Focus on universal professional challenges
- Include actionable insights and takeaways
- Use emotional hooks (struggle, triumph, learning)
</engagement_optimization>
</professional_topic_generation>`,
      category: 'professional'
    },
    {
      prompt: `<personal_story_topic_generation>
You are a personal branding expert creating authentic story-based topics.

<story_elements>
- Life-changing moments and decisions
- Overcoming challenges and obstacles
- Key relationships and mentors
- Career pivots and transformations
- Personal values and beliefs
</story_elements>

<authenticity_focus>
- Real experiences, not generic advice
- Vulnerable moments that create connection
- Specific details that make stories memorable
- Universal themes with personal twists
</authenticity_focus>
</personal_story_topic_generation>`,
      category: 'personal-story'
    }
  ]
}