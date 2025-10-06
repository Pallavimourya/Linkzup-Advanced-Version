export function getRelevantTopicPrompt(themes: string[]): { prompt: string; category: string } {
  const basePrompt = `Generate compelling LinkedIn post topics based on the personal story themes: ${themes.join(', ')}.`
  
  return {
    prompt: basePrompt,
    category: 'personal-story'
  }
}

export function getAllTopicPrompts(): Array<{ prompt: string; category: string }> {
  return [
    {
      prompt: "Generate professional LinkedIn topics",
      category: 'professional'
    },
    {
      prompt: "Generate personal story topics",
      category: 'personal-story'
    }
  ]
}