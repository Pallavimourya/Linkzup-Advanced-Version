"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  HelpCircle,
  Play,
  Mail,
  Phone,
  MessageCircle,
  Clock,
  BookOpen,
  Video,
  FileText,
  Zap,
  Users,
  Sparkles,
  TrendingUp,
  Calendar,
} from "lucide-react"

const faqData = [
  {
    question: "How do I generate my first LinkedIn post?",
    answer:
      "Navigate to the Dashboard, enter your topic in the prompt field, select your preferred tone and audience, then click 'Generate LinkedIn Posts'. Our AI will create 6-7 unique posts for you to choose from.",
  },
  {
    question: "What are credits and how do they work?",
    answer:
      "Credits are used for AI-powered features. Text generation costs 0.5 credits, posting costs an additional 0.5 credits, and image generation costs 1 credit. You get a 2-day free trial, then can purchase credit packs.",
  },
  {
    question: "How do I schedule posts for later?",
    answer:
      "After generating content, click 'Preview' on any post, then select 'Schedule Post'. Choose your preferred date and time, and we'll automatically post it to your LinkedIn account.",
  },
  {
    question: "Can I edit generated content before posting?",
    answer:
      "Yes! All generated content can be saved to Drafts where you can edit, modify, and customize it before posting. You can also add images and adjust the formatting.",
  },
  {
    question: "How does the Personal Story feature work?",
    answer:
      "Answer 6 questions about your professional experiences, and our AI creates compelling narrative stories. You can then select suggested topics to develop into individual LinkedIn posts.",
  },
  {
    question: "What's the difference between carousel and regular posts?",
    answer:
      "Carousels are multi-slide visual posts perfect for tutorials, tips, or storytelling. Regular posts are single text-based updates. Both can include images and are optimized for LinkedIn engagement.",
  },
]

const features = [
  {
    icon: Zap,
    title: "AI Content Generator",
    description: "Generate engaging LinkedIn posts with customizable tone, audience, and goals.",
    link: "/dashboard",
  },
  {
    icon: Users,
    title: "Personal Story",
    description: "Transform your experiences into compelling professional narratives.",
    link: "/dashboard/personal-story",
  },
  {
    icon: Sparkles,
    title: "AI Carousel",
    description: "Create multi-slide visual content with custom backgrounds and text.",
    link: "/dashboard/ai-carousel",
  },
  {
    icon: TrendingUp,
    title: "Viral Posts & News",
    description: "Discover trending content and industry news for inspiration.",
    link: "/dashboard/viral-posts",
  },
  {
    icon: Calendar,
    title: "Scheduled Posts",
    description: "Plan and automate your LinkedIn content calendar.",
    link: "/dashboard/scheduled-posts",
  },
  {
    icon: FileText,
    title: "Drafts",
    description: "Save, edit, and manage your content before publishing.",
    link: "/dashboard/drafts",
  },
]

export default function HelpPage() {
  const handleWhatsAppSupport = () => {
    const phoneNumber = "917697624256" // Remove + and spaces for WhatsApp URL
    const message = encodeURIComponent("Hi! I need help with LinkzUp. Can you assist me?")
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${message}`
    window.open(whatsappUrl, "_blank")
  }

  const handleEmailSupport = () => {
    const email = "techzuperstudio@gmail.com"
    const subject = encodeURIComponent("LinkzUp Support Request")
    const body = encodeURIComponent("Hi,\n\nI need help with LinkzUp. Please describe your issue below:\n\n")
    const mailtoUrl = `mailto:${email}?subject=${subject}&body=${body}`
    window.open(mailtoUrl)
  }

  const handlePhoneSupport = () => {
    window.open("tel:+917697624256")
  }

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
                <BreadcrumbPage>Help & Support</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>

      {/* Welcome Section */}
      <div className="px-4">
        <div className="rounded-lg bg-gradient-to-r from-primary/10 to-secondary/10 p-6">
          <h1 className="text-2xl font-bold text-foreground mb-2 flex items-center gap-2">
            <HelpCircle className="w-6 h-6 text-primary" />
            Help & Support
          </h1>
          <p className="text-muted-foreground">
            Get help with LinkzUp features, find answers to common questions, and contact our support team.
          </p>
        </div>
      </div>

      {/* Help Content */}
      <div className="px-4">
        <Tabs defaultValue="getting-started" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="getting-started" className="flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              Getting Started
            </TabsTrigger>
            <TabsTrigger value="features" className="flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              Features
            </TabsTrigger>
            <TabsTrigger value="faq" className="flex items-center gap-2">
              <HelpCircle className="w-4 h-4" />
              FAQ
            </TabsTrigger>
            <TabsTrigger value="contact" className="flex items-center gap-2">
              <MessageCircle className="w-4 h-4" />
              Contact
            </TabsTrigger>
          </TabsList>

          {/* Getting Started Tab */}
          <TabsContent value="getting-started">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Video className="w-5 h-5 text-primary" />
                    How to Use LinkzUp
                  </CardTitle>
                  <CardDescription>Watch our comprehensive tutorial to get started quickly</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="aspect-video bg-muted rounded-lg flex items-center justify-center mb-4">
                    <div className="text-center">
                      <Play className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">Tutorial video coming soon!</p>
                      <p className="text-sm text-muted-foreground mt-2">
                        We're preparing a comprehensive video guide to help you master LinkzUp.
                      </p>
                    </div>
                  </div>
                  <Badge variant="secondary" className="mb-4">
                    Coming Soon
                  </Badge>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Quick Start Guide</CardTitle>
                  <CardDescription>Follow these steps to create your first LinkedIn post</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex gap-4">
                      <div className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-semibold">
                        1
                      </div>
                      <div>
                        <h4 className="font-semibold">Go to Dashboard</h4>
                        <p className="text-sm text-muted-foreground">
                          Navigate to the main dashboard and find the AI Content Generator section.
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-4">
                      <div className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-semibold">
                        2
                      </div>
                      <div>
                        <h4 className="font-semibold">Enter Your Topic</h4>
                        <p className="text-sm text-muted-foreground">
                          Describe what you want to post about in the prompt field.
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-4">
                      <div className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-semibold">
                        3
                      </div>
                      <div>
                        <h4 className="font-semibold">Customize Settings</h4>
                        <p className="text-sm text-muted-foreground">
                          Select your preferred tone, target audience, and content goals.
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-4">
                      <div className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-semibold">
                        4
                      </div>
                      <div>
                        <h4 className="font-semibold">Generate & Post</h4>
                        <p className="text-sm text-muted-foreground">
                          Click generate to create multiple post options, then preview and publish your favorite.
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Features Tab */}
          <TabsContent value="features">
            <div className="grid gap-6 md:grid-cols-2">
              {features.map((feature, index) => (
                <Card key={index} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <feature.icon className="w-5 h-5 text-primary" />
                      {feature.title}
                    </CardTitle>
                    <CardDescription>{feature.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button variant="outline" asChild className="w-full bg-transparent">
                      <a href={feature.link}>Learn More</a>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* FAQ Tab */}
          <TabsContent value="faq">
            <div className="space-y-4">
              {faqData.map((faq, index) => (
                <Card key={index}>
                  <CardHeader>
                    <CardTitle className="text-lg">{faq.question}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{faq.answer}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Contact Tab */}
          <TabsContent value="contact">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-primary" />
                    24/7 Support Available
                  </CardTitle>
                  <CardDescription>We're here to help you succeed with LinkzUp</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-3">
                    <Card className="border-2 hover:border-primary/50 transition-colors cursor-pointer">
                      <CardContent className="p-4 text-center" onClick={handleEmailSupport}>
                        <Mail className="w-8 h-8 text-primary mx-auto mb-3" />
                        <h4 className="font-semibold mb-2">Email Support</h4>
                        <p className="text-sm text-muted-foreground mb-3">Get detailed help via email</p>
                        <p className="text-sm font-medium">techzuperstudio@gmail.com</p>
                        <Button variant="outline" className="w-full mt-3 bg-transparent">
                          Send Email
                        </Button>
                      </CardContent>
                    </Card>

                    <Card className="border-2 hover:border-primary/50 transition-colors cursor-pointer">
                      <CardContent className="p-4 text-center" onClick={handlePhoneSupport}>
                        <Phone className="w-8 h-8 text-primary mx-auto mb-3" />
                        <h4 className="font-semibold mb-2">Phone Support</h4>
                        <p className="text-sm text-muted-foreground mb-3">Speak directly with our team</p>
                        <p className="text-sm font-medium">+91 7697624256</p>
                        <Button variant="outline" className="w-full mt-3 bg-transparent">
                          Call Now
                        </Button>
                      </CardContent>
                    </Card>

                    <Card className="border-2 hover:border-primary/50 transition-colors cursor-pointer">
                      <CardContent className="p-4 text-center" onClick={handleWhatsAppSupport}>
                        <MessageCircle className="w-8 h-8 text-primary mx-auto mb-3" />
                        <h4 className="font-semibold mb-2">WhatsApp Chat</h4>
                        <p className="text-sm text-muted-foreground mb-3">Quick chat support</p>
                        <p className="text-sm font-medium">+91 7697624256</p>
                        <Button className="w-full mt-3">
                          <MessageCircle className="w-4 h-4 mr-2" />
                          Chat on WhatsApp
                        </Button>
                      </CardContent>
                    </Card>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Support Hours</CardTitle>
                  <CardDescription>Our team is available to help you</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="font-medium">Email Support:</span>
                      <span className="text-muted-foreground">24/7 (Response within 24 hours)</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Phone Support:</span>
                      <span className="text-muted-foreground">24/7 Available</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">WhatsApp Chat:</span>
                      <span className="text-muted-foreground">24/7 Instant Response</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
