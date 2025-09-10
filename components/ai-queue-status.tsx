"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { 
  Clock, 
  Users, 
  Activity, 
  CheckCircle, 
  AlertCircle, 
  Loader2,
  RefreshCw,
  List
} from "lucide-react"

interface QueueStatus {
  queueLength: number
  activeRequests: number
  maxConcurrentRequests: number
  isProcessing: boolean
}

interface AIQueueStatusProps {
  queueStatus: QueueStatus | null
  isGenerating: boolean
  progress: number
  estimatedWaitTime: number
  onRefresh?: () => void
  className?: string
}

export function AIQueueStatus({
  queueStatus,
  isGenerating,
  progress,
  estimatedWaitTime,
  onRefresh,
  className
}: AIQueueStatusProps) {
  if (!queueStatus && !isGenerating) {
    return null
  }

  const getStatusColor = () => {
    if (isGenerating) return "text-blue-600"
    if (queueStatus?.queueLength === 0) return "text-green-600"
    if (queueStatus?.queueLength && queueStatus.queueLength > 5) return "text-orange-600"
    return "text-yellow-600"
  }

  const getStatusIcon = () => {
    if (isGenerating) return <Loader2 className="w-4 h-4 animate-spin" />
    if (queueStatus?.queueLength === 0) return <CheckCircle className="w-4 h-4" />
    if (queueStatus?.queueLength && queueStatus.queueLength > 5) return <AlertCircle className="w-4 h-4" />
         return <List className="w-4 h-4" />
  }

  const getStatusText = () => {
    if (isGenerating) return "Generating content..."
    if (queueStatus?.queueLength === 0) return "Queue is empty"
    if (queueStatus?.queueLength === 1) return "1 request in queue"
    return `${queueStatus?.queueLength} requests in queue`
  }

  const formatWaitTime = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`
    const minutes = Math.ceil(seconds / 60)
    return `${minutes}m`
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Activity className="w-4 h-4" />
            AI Generation Status
          </CardTitle>
          {onRefresh && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onRefresh}
              className="h-6 w-6 p-0"
            >
              <RefreshCw className="w-3 h-3" />
            </Button>
          )}
        </div>
        <CardDescription className="text-xs">
          Real-time queue and generation status
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current Status */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className={getStatusColor()}>
              {getStatusIcon()}
            </span>
            <span className="text-sm font-medium">{getStatusText()}</span>
          </div>
          <Badge variant={isGenerating ? "default" : "secondary"} className="text-xs">
            {isGenerating ? "Active" : "Idle"}
          </Badge>
        </div>

        {/* Progress Bar (when generating) */}
        {isGenerating && (
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Progress</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        )}

        {/* Queue Information */}
        {queueStatus && (
          <div className="space-y-3">
            {/* Queue Length */}
            <div className="flex items-center justify-between text-sm">
                             <div className="flex items-center gap-2">
                 <List className="w-4 h-4 text-muted-foreground" />
                 <span>Queue Length</span>
               </div>
              <span className="font-medium">{queueStatus.queueLength}</span>
            </div>

            {/* Active Requests */}
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-muted-foreground" />
                <span>Active Requests</span>
              </div>
              <span className="font-medium">
                {queueStatus.activeRequests} / {queueStatus.maxConcurrentRequests}
              </span>
            </div>

            {/* Processing Status */}
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-muted-foreground" />
                <span>Processing</span>
              </div>
              <Badge variant={queueStatus.isProcessing ? "default" : "secondary"} className="text-xs">
                {queueStatus.isProcessing ? "Yes" : "No"}
              </Badge>
            </div>

            {/* Estimated Wait Time */}
            {estimatedWaitTime > 0 && (
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <span>Est. Wait Time</span>
                </div>
                <span className="font-medium">{formatWaitTime(estimatedWaitTime)}</span>
              </div>
            )}
          </div>
        )}

        {/* Queue Health Indicator */}
        {queueStatus && (
          <div className="pt-2 border-t">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Queue Health</span>
              <div className="flex gap-1">
                {Array.from({ length: 5 }, (_, i) => (
                  <div
                    key={i}
                    className={`w-2 h-2 rounded-full ${
                      i < Math.min(queueStatus.activeRequests, 5)
                        ? "bg-green-500"
                        : "bg-gray-200"
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tips */}
                 {queueStatus && queueStatus.queueLength > 3 && (
           <div className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
             <p className="text-xs text-blue-700 dark:text-blue-300">
               💡 <strong>Tip:</strong> Queue is busy. Perplexity AI is processing requests. Please wait or try again later.
             </p>
           </div>
         )}

        {queueStatus && queueStatus.queueLength === 0 && !isGenerating && (
          <div className="p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
            <p className="text-xs text-green-700 dark:text-green-300">
              ✅ <strong>Ready:</strong> Queue is empty. Your request will be processed immediately.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
