export const CREDIT_COSTS = {
  TEXT_GENERATION: 0.5,
  TEXT_WITH_POST: 1,
  TEXT_WITH_IMAGE: 1.5,
  TEXT_IMAGE_WITH_POST: 2,
  IMAGE_GENERATION: 1,
  SCHEDULED_AUTO_POST: 0.5,
  DRAFT_TO_POST: 1,
} as const

export async function checkAndDeductCredits(userId: string, action: keyof typeof CREDIT_COSTS) {
  const cost = CREDIT_COSTS[action]

  try {
    const response = await fetch("/api/billing/credits", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "deduct", amount: cost }),
    })

    if (!response.ok) {
      throw new Error("Insufficient credits")
    }

    return await response.json()
  } catch (error) {
    throw new Error("Failed to process credits")
  }
}

export async function checkCreditsAvailable(requiredCredits: number) {
  try {
    const response = await fetch("/api/billing/credits")
    if (response.ok) {
      const data = await response.json()
      return data.isTrialActive || data.credits >= requiredCredits
    }
    return false
  } catch (error) {
    return false
  }
}

export async function deductCredits(userId: string, action: keyof typeof CREDIT_COSTS, refund = false) {
  const cost = CREDIT_COSTS[action]
  const amount = refund ? -cost : cost

  try {
    const response = await fetch("/api/billing/credits", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: refund ? "refund" : "deduct",
        amount: Math.abs(amount),
        userId,
      }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      return { success: false, error: errorData.error || "Insufficient credits" }
    }

    const result = await response.json()
    return { success: true, ...result }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to process credits",
    }
  }
}
