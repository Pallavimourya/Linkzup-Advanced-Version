"use client"

import { useEffect, useState } from "react"
import { getBrowserInfo, isRazorpaySupported } from "@/lib/browser-utils"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CheckCircle, XCircle, AlertTriangle } from "lucide-react"

export default function TestBrowserPage() {
  const [browserInfo, setBrowserInfo] = useState<any>(null)
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
    setBrowserInfo(getBrowserInfo())
  }, [])

  if (!isClient) {
    return <div>Loading...</div>
  }

  const isSupported = isRazorpaySupported()

  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <h1 className="text-3xl font-bold mb-6">Browser Compatibility Test</h1>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {isSupported ? (
              <CheckCircle className="h-6 w-6 text-green-600" />
            ) : (
              <XCircle className="h-6 w-6 text-red-600" />
            )}
            Browser Information
          </CardTitle>
          <CardDescription>
            Check if your browser supports Razorpay payments
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Browser</label>
              <p className="text-lg font-semibold">{browserInfo?.name}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Version</label>
              <p className="text-lg font-semibold">{browserInfo?.version}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Device Type</label>
              <p className="text-lg font-semibold">
                {browserInfo?.isMobile ? "Mobile" : "Desktop"}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Payment Support</label>
              <Badge variant={isSupported ? "default" : "destructive"}>
                {isSupported ? "Supported" : "Not Supported"}
              </Badge>
            </div>
          </div>

          {!isSupported && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-center gap-2 text-yellow-800 mb-2">
                <AlertTriangle className="h-5 w-5" />
                <span className="font-medium">Browser Not Supported</span>
              </div>
              <p className="text-yellow-700 text-sm">
                Your browser ({browserInfo?.name} {browserInfo?.version}) may not support secure payments.
                Please try using one of these browsers:
              </p>
              <ul className="text-yellow-700 text-sm mt-2 list-disc list-inside">
                <li>Google Chrome (version 60 or higher)</li>
                <li>Mozilla Firefox (version 60 or higher)</li>
                <li>Safari (version 12 or higher)</li>
                <li>Microsoft Edge (version 79 or higher)</li>
              </ul>
            </div>
          )}

          {isSupported && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center gap-2 text-green-800">
                <CheckCircle className="h-5 w-5" />
                <span className="font-medium">Browser Supported</span>
              </div>
              <p className="text-green-700 text-sm mt-1">
                Your browser should work fine with Razorpay payments.
              </p>
            </div>
          )}

          <div className="pt-4">
            <Button 
              onClick={() => window.history.back()} 
              variant="outline"
              className="w-full"
            >
              Go Back
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
