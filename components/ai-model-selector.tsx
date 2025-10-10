"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Badge } from "@/components/ui/badge"
import { Info } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface AIModelSelectorProps {
  selectedModel: string
  onModelChange: (model: string) => void
  className?: string
}

const modelInfo = {
  "gpt-3.5-turbo": {
    name: "GPT-3.5 Turbo",
    description: "Fast and cost-effective",
    cost: "Low",
    quality: "Good",
    speed: "Fast",
    color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
  },
  "gpt-4o-mini": {
    name: "GPT-4o Mini",
    description: "Balanced performance and cost",
    cost: "Very Low",
    quality: "Good",
    speed: "Fast",
    color: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
  },
  "gpt-4": {
    name: "GPT-4",
    description: "Highest quality output",
    cost: "High",
    quality: "Excellent",
    speed: "Slower",
    color: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
  }
}

export function AIModelSelector({ selectedModel, onModelChange, className }: AIModelSelectorProps) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          AI Model Selection
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <Info className="h-4 w-4 text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent>
                <p>Choose the AI model based on your needs. Free models are cost-effective for most content generation tasks.</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </CardTitle>
        <CardDescription>
          Select the AI model for content generation. Free models provide good quality at lower cost.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <RadioGroup value={selectedModel} onValueChange={onModelChange} className="space-y-4">
          {Object.entries(modelInfo).map(([modelKey, info]) => (
            <div key={modelKey} className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors">
              <RadioGroupItem value={modelKey} id={modelKey} />
              <div className="flex-1">
                <Label htmlFor={modelKey} className="flex items-center gap-2 cursor-pointer">
                  <span className="font-medium">{info.name}</span>
                  <Badge variant="secondary" className={info.color}>
                    {info.cost}
                  </Badge>
                  {modelKey === "gpt-3.5-turbo" && (
                    <Badge variant="outline" className="text-green-600 border-green-600">
                      Recommended
                    </Badge>
                  )}
                </Label>
                <p className="text-sm text-muted-foreground mt-1">{info.description}</p>
                <div className="flex gap-2 mt-2">
                  <Badge variant="outline" className="text-xs">
                    Quality: {info.quality}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    Speed: {info.speed}
                  </Badge>
                </div>
              </div>
            </div>
          ))}
        </RadioGroup>
        
        <div className="mt-4 p-3 bg-muted/50 rounded-lg">
          <h4 className="font-medium text-sm mb-2">Cost Comparison (per 1000 tokens):</h4>
          <div className="text-xs space-y-1 text-muted-foreground">
            <div>• GPT-3.5 Turbo: $0.001 input / $0.002 output</div>
            <div>• GPT-4o Mini: $0.00015 input / $0.0006 output</div>
            <div>• GPT-4: $0.03 input / $0.06 output</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
