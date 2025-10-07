"use client"

import { motion } from "framer-motion"
import { Loader2, Sparkles, Zap, Brain } from "lucide-react"

interface ProcessingOverlayProps {
  isVisible: boolean
  title?: string
  description?: string
  type?: "topics" | "content" | "story" | "general"
}

const processingConfig = {
  topics: {
    icon: Sparkles,
    title: "Generating Topics...",
    description: "Creating personalized topics from your story",
    color: "text-blue-500",
    bgColor: "from-blue-500/10 to-blue-600/10",
  },
  content: {
    icon: Zap,
    title: "Creating Content...",
    description: "Crafting engaging content for your topic",
    color: "text-green-500",
    bgColor: "from-green-500/10 to-green-600/10",
  },
  story: {
    icon: Brain,
    title: "Generating Story...",
    description: "Building your personal story with AI",
    color: "text-purple-500",
    bgColor: "from-purple-500/10 to-purple-600/10",
  },
  general: {
    icon: Loader2,
    title: "Processing...",
    description: "Please wait while we work our magic",
    color: "text-blue-500",
    bgColor: "from-blue-500/10 to-blue-600/10",
  },
}

export function ProcessingOverlay({ 
  isVisible, 
  title, 
  description, 
  type = "general" 
}: ProcessingOverlayProps) {
  if (!isVisible) return null

  const config = processingConfig[type]
  const IconComponent = config.icon

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white dark:bg-black rounded-2xl p-8 shadow-2xl border border-gray-200 dark:border-gray-800 max-w-md mx-4"
      >
        <div className="text-center space-y-6">
          {/* Animated Icon */}
          <div className="relative mx-auto w-20 h-20">
            <div className={`absolute inset-0 bg-gradient-to-br ${config.bgColor} rounded-full`}></div>
            <div className="relative flex items-center justify-center h-full">
              <IconComponent 
                className={`w-10 h-10 ${config.color} ${type === "general" ? "animate-spin" : "animate-pulse"}`} 
              />
            </div>
            {/* Pulsing ring */}
            <motion.div
              className={`absolute inset-0 border-2 border-transparent border-t-current ${config.color} rounded-full`}
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            />
          </div>

          {/* Text Content */}
          <div className="space-y-2">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
              {title || config.title}
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              {description || config.description}
            </p>
          </div>

          {/* Animated Dots */}
          <div className="flex justify-center space-x-1">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="w-2 h-2 bg-blue-500 rounded-full"
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.5, 1, 0.5],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  delay: i * 0.2,
                }}
              />
            ))}
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}
