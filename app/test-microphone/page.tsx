"use client"

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { MicrophoneButton } from '@/components/ui/microphone-button'
import { useMicrophone } from '@/hooks/use-microphone'
import { Mic, MicOff, Square, AlertCircle, Pause, Play } from 'lucide-react'

export default function TestMicrophonePage() {
  const [transcript, setTranscript] = useState('')
  const { 
    isRecording, 
    isPaused,
    isSupported, 
    error, 
    startRecording, 
    pauseRecording,
    resumeRecording,
    stopRecording, 
    clearTranscript 
  } = useMicrophone()

  const handleTranscript = (newTranscript: string) => {
    setTranscript(prev => prev + (prev ? ' ' : '') + newTranscript.trim())
  }

  const handleClear = () => {
    setTranscript('')
    clearTranscript()
  }

  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mic className="h-5 w-5" />
            Microphone Test
          </CardTitle>
          <CardDescription>
            Test the microphone functionality for speech-to-text conversion
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Browser Support Check */}
          <div className="p-4 border rounded-lg">
            <h3 className="font-medium mb-2">Browser Support</h3>
            <div className="flex items-center gap-2">
              {isSupported ? (
                <>
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-green-700">Speech recognition is supported</span>
                </>
              ) : (
                <>
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <span className="text-sm text-red-700">Speech recognition is not supported</span>
                </>
              )}
            </div>
          </div>

          {/* Recording Status */}
          <div className="p-4 border rounded-lg">
            <h3 className="font-medium mb-2">Recording Status</h3>
            <div className="flex items-center gap-2">
              {isRecording ? (
                <>
                  <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                  <span className="text-sm text-red-700">Recording in progress...</span>
                </>
              ) : isPaused ? (
                <>
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <span className="text-sm text-yellow-700">Recording paused</span>
                </>
              ) : (
                <>
                  <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                  <span className="text-sm text-gray-600">Not recording</span>
                </>
              )}
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="p-4 border border-red-200 bg-red-50 rounded-lg">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-red-500" />
                <span className="text-sm text-red-700">{error}</span>
              </div>
            </div>
          )}

          {/* Manual Controls */}
          <div className="p-4 border rounded-lg">
            <h3 className="font-medium mb-3">Manual Controls</h3>
            <div className="flex gap-2 flex-wrap">
              <Button
                onClick={startRecording}
                disabled={!isSupported || isRecording}
                variant="outline"
                size="sm"
              >
                <Mic className="h-4 w-4 mr-2" />
                Start Recording
              </Button>
              <Button
                onClick={pauseRecording}
                disabled={!isRecording}
                variant="outline"
                size="sm"
              >
                <Pause className="h-4 w-4 mr-2" />
                Pause
              </Button>
              <Button
                onClick={resumeRecording}
                disabled={!isPaused}
                variant="outline"
                size="sm"
              >
                <Play className="h-4 w-4 mr-2" />
                Resume
              </Button>
              <Button
                onClick={stopRecording}
                disabled={!isRecording && !isPaused}
                variant="outline"
                size="sm"
              >
                <Square className="h-4 w-4 mr-2" />
                Stop Recording
              </Button>
              <Button
                onClick={handleClear}
                variant="outline"
                size="sm"
              >
                Clear
              </Button>
            </div>
          </div>

          {/* Text Area with Microphone Button */}
          <div className="space-y-3">
            <h3 className="font-medium">Text Area with Microphone</h3>
            <div className="relative">
              <Textarea
                placeholder="Type your text here or use the microphone to record..."
                value={transcript}
                onChange={(e) => setTranscript(e.target.value)}
                className="min-h-[120px] pr-12"
              />
              <div className="absolute bottom-3 right-3">
                <MicrophoneButton
                  onTranscript={handleTranscript}
                  size="sm"
                  variant="ghost"
                  className="h-8 w-8 p-0 hover:bg-muted"
                />
              </div>
            </div>
          </div>

          {/* Instructions */}
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="font-medium text-blue-900 mb-2">Instructions</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Click the microphone button to start recording</li>
              <li>• When recording, you'll see pause and stop buttons</li>
              <li>• Use pause to temporarily stop recording (can resume later)</li>
              <li>• Use stop to end recording completely</li>
              <li>• Speak clearly into your microphone</li>
              <li>• Your speech will be converted to text automatically</li>
              <li>• Make sure your browser has microphone permissions</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
