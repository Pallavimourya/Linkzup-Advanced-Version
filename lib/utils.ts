import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Utility function to refresh credit display from anywhere in the app
export function refreshCredits() {
  if (typeof window !== 'undefined' && (window as any).refreshCredits) {
    (window as any).refreshCredits()
  }
}

// Utility function to format credits display
export function formatCredits(credits: number): string {
  // Limit decimal places to 2 to prevent excessive precision
  const formattedCredits = Number.isInteger(credits) ? credits : parseFloat(credits.toFixed(2))
  return `${formattedCredits} credit${formattedCredits !== 1 ? 's' : ''}`
}

// Utility function to check if user has sufficient credits
export function hasSufficientCredits(currentCredits: number, requiredCredits: number): boolean {
  return currentCredits >= requiredCredits
}
