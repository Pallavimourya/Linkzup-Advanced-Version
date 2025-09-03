"use client"

import Link from "next/link"
import Image from "next/image"

interface LogoProps {
  size?: "sm" | "md" | "lg"
  showText?: boolean
  className?: string
}

export function Logo({ size = "md", showText = true, className = "" }: LogoProps) {
  const sizeClasses = {
    sm: "h-28 w-28",
    md: "h-30 w-30", 
    lg: "h-32 w-32"
  }

  const textSizes = {
    sm: "text-sm",
    md: "text-lg",
    lg: "text-2xl"
  }

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      {/* Logo Image */}
      <div className={`relative ${sizeClasses[size]}`}>
        <Image
          src="/zuper-logo.png"
          alt="LinkZup Logo"
          width={32}
          height={32}
          className={`w-full h-full object-contain`}
        />
      </div>
    </div>
  )
}
