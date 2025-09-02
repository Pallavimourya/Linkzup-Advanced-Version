"use client"

import type React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Sparkles, Clock, Star, Zap, Palette, Image as ImageIcon } from "lucide-react"

export default function AICarouselPage() {
  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
        <div className="flex items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbPage>AI Carousel Creator</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>

      <div className="grid gap-6 px-4">
        {/* Coming Soon Message */}
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
          {/* Main Illustration */}
          <div className="relative mb-8">
            <div className="w-32 h-32 bg-gradient-to-br from-primary/20 to-primary/10 rounded-full flex items-center justify-center mb-4">
              <Sparkles className="w-16 h-16 text-primary" />
            </div>
            <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center">
              <Clock className="w-5 h-5 text-yellow-800" />
            </div>
          </div>

          {/* Coming Soon Text */}
          <Card className="max-w-2xl mx-auto text-center border-2 border-dashed border-primary/30 bg-gradient-to-br from-primary/5 to-primary/10">
            <CardHeader className="pb-4">
              <CardTitle className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                Coming Soon!
              </CardTitle>
              <CardDescription className="text-xl text-muted-foreground">
                Your wait will be worth it
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <p className="text-lg text-muted-foreground leading-relaxed">
                We're working hard to bring you the most advanced AI-powered carousel creator. 
                Get ready to transform your content with intelligent design suggestions, 
                automated layouts, and stunning visual templates.
              </p>

              {/* Feature Preview */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
                <div className="flex flex-col items-center gap-2 p-4 rounded-lg bg-background/50">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Palette className="w-6 h-6 text-blue-600" />
                  </div>
                  <span className="text-sm font-medium text-muted-foreground">Smart Design</span>
                </div>
                
                <div className="flex flex-col items-center gap-2 p-4 rounded-lg bg-background/50">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <Zap className="w-6 h-6 text-green-600" />
                  </div>
                  <span className="text-sm font-medium text-muted-foreground">AI Generation</span>
                </div>
                
                <div className="flex flex-col items-center gap-2 p-4 rounded-lg bg-background/50">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <ImageIcon className="w-6 h-6 text-purple-600" />
                  </div>
                  <span className="text-sm font-medium text-muted-foreground">Visual Magic</span>
                </div>
              </div>

              {/* Encouraging Message */}
              <div className="mt-8 p-6 bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg border border-primary/20">
                <div className="flex items-center justify-center gap-2 mb-3">
                  <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                  <span className="font-semibold text-primary">What to Expect</span>
                  <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                </div>
                <p className="text-muted-foreground">
                  • AI-powered content suggestions and layouts<br/>
                  • Professional templates for every industry<br/>
                  • One-click LinkedIn optimization<br/>
                  • Advanced customization tools<br/>
                  • Export to multiple formats
                </p>
              </div>

              {/* Stay Tuned */}
              <div className="mt-6">
                <p className="text-sm text-muted-foreground">
                  Stay tuned for updates! This feature will revolutionize how you create 
                  engaging carousel content for your audience.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
