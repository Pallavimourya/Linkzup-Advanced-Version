export interface PasswordStrength {
  isValid: boolean
  score: number // 0-4
  feedback: string[]
  requirements: {
    length: boolean
    uppercase: boolean
    lowercase: boolean
    number: boolean
    special: boolean
  }
}

export function validatePasswordStrength(password: string): PasswordStrength {
  const requirements = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /\d/.test(password),
    special: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
  }

  const feedback: string[] = []
  let score = 0

  // Check each requirement
  if (requirements.length) {
    score++
  } else {
    feedback.push("Password must be at least 8 characters long")
  }

  if (requirements.uppercase) {
    score++
  } else {
    feedback.push("Include at least one uppercase letter")
  }

  if (requirements.lowercase) {
    score++
  } else {
    feedback.push("Include at least one lowercase letter")
  }

  if (requirements.number) {
    score++
  } else {
    feedback.push("Include at least one number")
  }

  if (requirements.special) {
    score++
  } else {
    feedback.push("Include at least one special character")
  }

  // Additional strength checks
  if (password.length >= 12) score++
  if (/(?=.*[A-Z].*[A-Z])/.test(password)) score++ // Multiple uppercase
  if (/(?=.*[!@#$%^&*].*[!@#$%^&*])/.test(password)) score++ // Multiple special chars

  const isValid = score >= 4 && Object.values(requirements).every(Boolean)

  return {
    isValid,
    score: Math.min(score, 4),
    feedback,
    requirements,
  }
}

export function getPasswordStrengthColor(score: number): string {
  if (score <= 1) return "text-red-500"
  if (score === 2) return "text-orange-500"
  if (score === 3) return "text-yellow-500"
  return "text-green-500"
}

export function getPasswordStrengthText(score: number): string {
  if (score <= 1) return "Very Weak"
  if (score === 2) return "Weak"
  if (score === 3) return "Fair"
  return "Strong"
}

import bcrypt from 'bcryptjs'
import crypto from 'crypto'

export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 12
  return bcrypt.hash(password, saltRounds)
}

export async function comparePassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
}

export function generateResetToken(): string {
  return crypto.randomBytes(32).toString('hex')
}
