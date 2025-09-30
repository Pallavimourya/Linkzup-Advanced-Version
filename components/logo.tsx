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
    sm: "h-8 w-8",
    md: "h-10 w-10", 
    lg: "h-12 w-12"
  }

  const textSizes = {
    sm: "text-sm",
    md: "text-lg",
    lg: "text-2xl"
  }

  return (
    <div className={`flex items-center justify-center ${className}`}>
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