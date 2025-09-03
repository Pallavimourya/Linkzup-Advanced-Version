import { useState } from "react"
import { toast } from "sonner"
import { canPerformAction, CREDIT_ACTIONS } from "@/lib/credit-utils"

interface UseCreditsReturn {
  deductCredits: (actionType: string, description?: string) => Promise<boolean>
  checkCredits: (actionType: string) => { canPerform: boolean; requiredCredits: number; remainingCredits: number }
  refreshCredits: () => void
  loading: boolean
}

export function useCredits(currentCredits: number = 0): UseCreditsReturn {
  const [loading, setLoading] = useState(false)

  const checkCredits = (actionType: string) => {
    return canPerformAction(currentCredits, actionType)
  }

  const refreshCredits = () => {
    // Trigger refresh of credit display
    if (typeof window !== 'undefined' && (window as any).refreshCredits) {
      (window as any).refreshCredits()
    }
  }

  const deductCredits = async (actionType: string, description?: string): Promise<boolean> => {
    // Check if action type is valid
    if (!CREDIT_ACTIONS[actionType]) {
      toast.error("Invalid action type")
      return false
    }

    // Check if user has enough credits
    const { canPerform, requiredCredits } = checkCredits(actionType)
    
    if (!canPerform) {
      toast.error(`Insufficient credits. You need ${requiredCredits} credits for this action.`)
      return false
    }

    setLoading(true)

    try {
      const response = await fetch("/api/credits/deduct", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          actionType,
          description,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        
        // Handle trial-specific error messages
        if (errorData.isTrialActive && errorData.trialExpired === false) {
          toast.error("Trial credits exhausted. Please purchase credits to continue.", {
            action: {
              label: "Get Credits",
              onClick: () => window.location.href = "/dashboard/billing"
            }
          })
        } else if (errorData.trialExpired) {
          toast.error("Trial period expired. Please purchase credits to continue using the service.", {
            action: {
              label: "Get Credits",
              onClick: () => window.location.href = "/dashboard/billing"
            }
          })
        } else {
          toast.error(errorData.error || "Failed to deduct credits")
        }
        
        throw new Error(errorData.error || "Failed to deduct credits")
      }

      const result = await response.json()
      toast.success(result.message)
      
      // Refresh credit display in the top panel
      refreshCredits()
      
      return true
    } catch (error) {
      console.error("Credit deduction error:", error)
      // Don't show duplicate error messages since we already handled them above
      if (!(error instanceof Error && error.message.includes("Failed to deduct credits"))) {
        toast.error(error instanceof Error ? error.message : "Failed to deduct credits")
      }
      return false
    } finally {
      setLoading(false)
    }
  }

  return {
    deductCredits,
    checkCredits,
    refreshCredits,
    loading,
  }
}
