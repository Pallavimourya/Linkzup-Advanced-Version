"use client"

import { ThemeToggle } from "@/components/theme-toggle"
import { useTheme } from "next-themes"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function ThemeTestPage() {
  const { theme, resolvedTheme } = useTheme()

  return (
    <div className="container mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Theme Toggle Test</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <div className="text-sm">
              <p>Current theme: {theme}</p>
              <p>Resolved theme: {resolvedTheme}</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="bg-card">
              <CardHeader>
                <CardTitle>Card Example</CardTitle>
              </CardHeader>
              <CardContent>
                <p>This card should change appearance based on the theme.</p>
                <p className="text-muted-foreground">This text should be muted.</p>
              </CardContent>
            </Card>
            
            <Card className="bg-card">
              <CardHeader>
                <CardTitle>Another Card</CardTitle>
              </CardHeader>
              <CardContent>
                <p>Testing theme colors and contrast.</p>
                <button className="bg-primary text-primary-foreground px-4 py-2 rounded">
                  Primary Button
                </button>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
