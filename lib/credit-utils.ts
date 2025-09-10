export interface CreditAction {
  type: 'text_only' | 'text_with_post' | 'text_with_image' | 'text_image_post' | 'image_only' | 'auto_post' | 'ai_linkedin-post' | 'ai_article' | 'ai_topics' | 'ai_carousel' | 'ai_story' | 'ai_list' | 'ai_quote' | 'ai_before-after' | 'ai_tips' | 'ai_insights' | 'ai_question'
  credits: number
  description: string
}

export const CREDIT_ACTIONS: Record<string, CreditAction> = {
  text_only: {
    type: 'text_only',
    credits: 0.5,
    description: 'Text generation only'
  },
  text_with_post: {
    type: 'text_with_post',
    credits: 1,
    description: 'Text + Post to LinkedIn'
  },
  text_with_image: {
    type: 'text_with_image',
    credits: 1.5,
    description: 'Text + Image generation'
  },
  text_image_post: {
    type: 'text_image_post',
    credits: 2,
    description: 'Text + Image + Post'
  },
  image_only: {
    type: 'image_only',
    credits: 1,
    description: 'Image generation only'
  },
  auto_post: {
    type: 'auto_post',
    credits: 0.5,
    description: 'Auto-posting scheduled content'
  },
  // AI Generation Actions
  'ai_linkedin-post': {
    type: 'ai_linkedin-post',
    credits: 0.5,
    description: 'AI LinkedIn post generation'
  },
  'ai_article': {
    type: 'ai_article',
    credits: 0.3,
    description: 'AI article generation'
  },
  'ai_topics': {
    type: 'ai_topics',
    credits: 0.1,
    description: 'AI topic generation'
  },
  'ai_carousel': {
    type: 'ai_carousel',
    credits: 0.4,
    description: 'AI carousel generation'
  },
  'ai_story': {
    type: 'ai_story',
    credits: 0.2,
    description: 'AI story generation'
  },
  'ai_list': {
    type: 'ai_list',
    credits: 0.2,
    description: 'AI list generation'
  },
  'ai_quote': {
    type: 'ai_quote',
    credits: 0.1,
    description: 'AI quote generation'
  },
  'ai_before-after': {
    type: 'ai_before-after',
    credits: 0.2,
    description: 'AI before/after content generation'
  },
  'ai_tips': {
    type: 'ai_tips',
    credits: 0.2,
    description: 'AI tips generation'
  },
  'ai_insights': {
    type: 'ai_insights',
    credits: 0.2,
    description: 'AI insights generation'
  },
  'ai_question': {
    type: 'ai_question',
    credits: 0.1,
    description: 'AI question generation'
  }
}

export interface PlanLimits {
  textOnly: number
  textWithPost: number
  textWithImage: number
  textImagePost: number
  imageOnly: number
  autoPost: number
}

export const PLAN_LIMITS: Record<string, PlanLimits> = {
  basic: {
    textOnly: 100,
    textWithPost: 50,
    textWithImage: 50,
    textImagePost: 50,
    imageOnly: 50,
    autoPost: 50
  },
  popular: {
    textOnly: 200,
    textWithPost: 100,
    textWithImage: 100,
    textImagePost: 100,
    imageOnly: 100,
    autoPost: 100
  },
  professional: {
    textOnly: 2000,
    textWithPost: 1000,
    textWithImage: 1000,
    textImagePost: 1000,
    imageOnly: 1000,
    autoPost: 1000
  }
}

export function canPerformAction(
  userCredits: number,
  actionType: string,
  userPlan?: string
): { canPerform: boolean; requiredCredits: number; remainingCredits: number } {
  const action = CREDIT_ACTIONS[actionType]
  if (!action) {
    return { canPerform: false, requiredCredits: 0, remainingCredits: userCredits }
  }

  const canPerform = userCredits >= action.credits
  const remainingCredits = canPerform ? userCredits - action.credits : userCredits

  return {
    canPerform,
    requiredCredits: action.credits,
    remainingCredits
  }
}

export function getPlanAccessibility(userPlan?: string): {
  hasAccess: boolean
  planName: string
  limits: PlanLimits
} {
  const plan = userPlan || 'free'
  const limits = PLAN_LIMITS[plan] || {
    textOnly: 0,
    textWithPost: 0,
    textWithImage: 0,
    textImagePost: 0,
    imageOnly: 0,
    autoPost: 0
  }

  return {
    hasAccess: plan !== 'free',
    planName: plan === 'free' ? 'Free Plan' : `${plan.charAt(0).toUpperCase() + plan.slice(1)} Plan`,
    limits
  }
}

export function getActionDescription(actionType: string): string {
  return CREDIT_ACTIONS[actionType]?.description || 'Unknown action'
}

export function getActionCredits(actionType: string): number {
  return CREDIT_ACTIONS[actionType]?.credits || 0
}

export async function deductCredits(
  actionType: string, 
  description?: string
): Promise<boolean> {
  try {
    const response = await fetch('/api/credits/deduct', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        actionType,
        description
      }),
    })

    if (!response.ok) {
      console.error('Failed to deduct credits:', await response.text())
      return false
    }

    return true
  } catch (error) {
    console.error('Error deducting credits:', error)
    return false
  }
}
