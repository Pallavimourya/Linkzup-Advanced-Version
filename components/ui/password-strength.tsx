"use client"

import { useState, useEffect } from "react"
import { Progress } from "@/components/ui/progress"
import { Check, X } from "lucide-react"
import { validatePasswordStrength, getPasswordStrengthColor, getPasswordStrengthText } from "@/lib/password-utils"

interface PasswordStrengthProps {
  password: string
  showRequirements?: boolean
}

export function PasswordStrength({ password, showRequirements = true }: PasswordStrengthProps) {
  const [strength, setStrength] = useState(validatePasswordStrength(password))

  useEffect(() => {
    setStrength(validatePasswordStrength(password))
  }, [password])

  if (!password) return null

  const progressValue = (strength.score / 4) * 100

  return (
    <div className="space-y-3">
      {/* Strength Bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span>Password Strength:</span>
          <span className={`font-medium ${getPasswordStrengthColor(strength.score)}`}>
            {getPasswordStrengthText(strength.score)}
          </span>
        </div>
        <Progress 
          value={progressValue} 
          className="h-2"
          style={{
            '--progress-background': getPasswordStrengthColor(strength.score).replace('text-', 'bg-')
          } as React.CSSProperties}
        />
      </div>

      {/* Requirements */}
      {showRequirements && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">Requirements:</p>
          <div className="grid grid-cols-1 gap-2 text-sm">
            <RequirementItem 
              met={strength.requirements.length}
              text="At least 8 characters long"
            />
            <RequirementItem 
              met={strength.requirements.uppercase}
              text="At least one uppercase letter (A-Z)"
            />
            <RequirementItem 
              met={strength.requirements.lowercase}
              text="At least one lowercase letter (a-z)"
            />
            <RequirementItem 
              met={strength.requirements.number}
              text="At least one number (0-9)"
            />
            <RequirementItem 
              met={strength.requirements.special}
              text="At least one special character (!@#$%^&*)"
            />
          </div>
        </div>
      )}

      {/* Feedback */}
      {strength.feedback.length > 0 && (
        <div className="space-y-1">
          {strength.feedback.map((message, index) => (
            <p key={index} className="text-sm text-red-500 flex items-center gap-1">
              <X className="h-3 w-3" />
              {message}
            </p>
          ))}
        </div>
      )}
    </div>
  )
}

interface RequirementItemProps {
  met: boolean
  text: string
}

function RequirementItem({ met, text }: RequirementItemProps) {
  return (
    <div className={`flex items-center gap-2 ${met ? 'text-green-600' : 'text-muted-foreground'}`}>
      {met ? (
        <Check className="h-3 w-3" />
      ) : (
        <X className="h-3 w-3" />
      )}
      <span className={met ? 'line-through' : ''}>{text}</span>
    </div>
  )
}
