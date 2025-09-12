"use client"

import { motion, AnimatePresence } from "framer-motion"
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
  ArrowRight,
  CheckCircle,
  Star,
  Globe,
  Target,
  Heart,
  Share2,
  Eye,
  Monitor,
  Smartphone,
  Tablet,
  Lightbulb,
  Shield,
  Award,
  Rocket,
  MessageSquare,
  BarChart3,
  RefreshCw,
  Copy,
  Archive,
  Settings,
  Info,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Plus,
  Minus,
  ChevronDown,
  ChevronUp,
} from "lucide-react"

const faqData = [
  {
    question: "How do I generate my first LinkedIn post?",
    answer:
      "Navigate to the Dashboard, enter your topic in the prompt field, select your preferred tone and audience, then click 'Generate LinkedIn Posts'. Our AI will create 2 unique posts for you to choose from.",
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
      "Answer 2 questions about your professional experiences, and our AI creates compelling narrative stories. You can then select suggested topics to develop into individual LinkedIn posts.",
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
    color: "from-blue-500 to-purple-500",
    bgColor: "from-blue-50 to-purple-50",
  },
  {
    icon: Users,
    title: "Personal Story",
    description: "Transform your experiences into compelling professional narratives.",
    link: "/dashboard/personal-story",
    color: "from-green-500 to-blue-500",
    bgColor: "from-green-50 to-blue-50",
  },
  {
    icon: Sparkles,
    title: "AI Carousel",
    description: "Create multi-slide visual content with custom backgrounds and text.",
    link: "/dashboard/ai-carousel",
    color: "from-purple-500 to-pink-500",
    bgColor: "from-purple-50 to-pink-50",
  },
  {
    icon: TrendingUp,
    title: "Viral Posts & News",
    description: "Discover trending content and industry news for inspiration.",
    link: "/dashboard/viral-posts",
    color: "from-orange-500 to-red-500",
    bgColor: "from-orange-50 to-red-50",
  },
  {
    icon: Calendar,
    title: "Scheduled Posts",
    description: "Plan and automate your LinkedIn content calendar.",
    link: "/dashboard/scheduled-posts",
    color: "from-indigo-500 to-blue-500",
    bgColor: "from-indigo-50 to-blue-50",
  },
  {
    icon: FileText,
    title: "Drafts",
    description: "Save, edit, and manage your content before publishing.",
    link: "/dashboard/drafts",
    color: "from-teal-500 to-green-500",
    bgColor: "from-teal-50 to-green-50",
  },
]

const quickStartSteps = [
  {
    step: 1,
    title: "Go to Dashboard",
    description: "Navigate to the main dashboard and find the AI Content Generator section.",
    icon: Target,
    color: "from-blue-500 to-blue-600",
  },
  {
    step: 2,
    title: "Enter Your Topic",
    description: "Describe what you want to post about in the prompt field.",
    icon: MessageSquare,
    color: "from-green-500 to-green-600",
  },
  {
    step: 3,
    title: "Customize Settings",
    description: "Select your preferred tone, target audience, and content goals.",
    icon: Settings,
    color: "from-purple-500 to-purple-600",
  },
  {
    step: 4,
    title: "Generate & Post",
    description: "Click generate to create multiple post options, then preview and publish your favorite.",
    icon: Rocket,
    color: "from-orange-500 to-orange-600",
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
    <div className="flex-1 min-h-screen bg-gradient-to-br from-white via-teal-50/20 to-black/5 dark:from-black dark:via-teal-950/20 dark:to-white/5 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-teal-500/10 to-secondary/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-secondary/10 to-teal-500/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-teal-400/5 to-secondary/5 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 flex flex-col gap-4 sm:gap-6 lg:gap-8">
        {/* Enhanced Header */}
        <motion.header 
          className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
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
        </motion.header>

        {/* Enhanced Welcome Section */}
        <motion.div 
          className="px-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="rounded-2xl bg-gradient-to-r from-teal-500/10 to-secondary/10 dark:from-teal-950/20 dark:to-secondary/10 p-8 border border-teal-200/50 dark:border-teal-800/50 backdrop-blur-sm">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-teal-500 to-secondary rounded-xl flex items-center justify-center">
                <HelpCircle className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-black via-teal-600 to-secondary dark:from-white dark:via-teal-400 dark:to-secondary bg-clip-text text-transparent">
                  Help & Support
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  Get help with LinkzUp features, find answers to common questions, and contact our support team.
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Enhanced Help Content */}
        <motion.div 
          className="px-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <Tabs defaultValue="getting-started" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4 h-12 bg-white/95 dark:bg-black/95 backdrop-blur-sm border border-teal-200/50 dark:border-teal-800/50 shadow-lg">
              <TabsTrigger value="getting-started" className="flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-400 data-[state=active]:bg-gradient-to-r data-[state=active]:from-teal-500 data-[state=active]:to-secondary data-[state=active]:text-white">
                <BookOpen className="w-4 h-4" />
                Getting Started
              </TabsTrigger>
              <TabsTrigger value="features" className="flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-400 data-[state=active]:bg-gradient-to-r data-[state=active]:from-teal-500 data-[state=active]:to-secondary data-[state=active]:text-white">
                <Sparkles className="w-4 h-4" />
                Features
              </TabsTrigger>
              <TabsTrigger value="faq" className="flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-400 data-[state=active]:bg-gradient-to-r data-[state=active]:from-teal-500 data-[state=active]:to-secondary data-[state=active]:text-white">
                <HelpCircle className="w-4 h-4" />
                FAQ
              </TabsTrigger>
              <TabsTrigger value="contact" className="flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-400 data-[state=active]:bg-gradient-to-r data-[state=active]:from-teal-500 data-[state=active]:to-secondary data-[state=active]:text-white">
                <MessageCircle className="w-4 h-4" />
                Contact
              </TabsTrigger>
            </TabsList>

            {/* Enhanced Getting Started Tab */}
            <TabsContent value="getting-started">
              <div className="space-y-6">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.6 }}
                >
                  <Card className="bg-white/95 dark:bg-black/95 backdrop-blur-sm border border-teal-200/50 dark:border-teal-800/50 shadow-lg hover:shadow-xl transition-all duration-300">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-3 text-lg text-black dark:text-white">
                        <div className="w-8 h-8 bg-gradient-to-r from-teal-100 to-secondary/20 dark:from-teal-900/50 dark:to-secondary/30 rounded-lg flex items-center justify-center">
                          <Video className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                        </div>
                        How to Use LinkzUp
                      </CardTitle>
                      <CardDescription>Watch our comprehensive tutorial to get started quickly</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl flex items-center justify-center mb-4 border border-gray-200">
                        <div className="text-center">
                          <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Play className="w-8 h-8 text-white" />
                          </div>
                          <p className="text-gray-600 font-medium">Tutorial video coming soon!</p>
                          <p className="text-sm text-gray-500 mt-2">
                            We're preparing a comprehensive video guide to help you master LinkzUp.
                          </p>
                        </div>
                      </div>
                      <Badge className="mb-4 bg-gradient-to-r from-blue-100 to-purple-100 text-blue-800 border-blue-200">
                        Coming Soon
                      </Badge>
                    </CardContent>
                  </Card>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.8 }}
                >
                  <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-3 text-lg">
                        <div className="w-8 h-8 bg-gradient-to-r from-green-100 to-blue-100 rounded-lg flex items-center justify-center">
                          <Rocket className="w-4 h-4 text-green-600" />
                        </div>
                        Quick Start Guide
                      </CardTitle>
                      <CardDescription>Follow these steps to create your first LinkedIn post</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-6">
                        {quickStartSteps.map((step, index) => (
                          <motion.div
                            key={step.step}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.4, delay: 1.0 + index * 0.1 }}
                            className="flex gap-4"
                          >
                            <div className={`flex-shrink-0 w-10 h-10 bg-gradient-to-r ${step.color} text-white rounded-full flex items-center justify-center text-sm font-semibold shadow-lg`}>
                              {step.step}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <step.icon className="w-4 h-4 text-gray-600" />
                                <h4 className="font-semibold text-gray-900">{step.title}</h4>
                              </div>
                              <p className="text-sm text-gray-600 leading-relaxed">
                                {step.description}
                              </p>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </div>
            </TabsContent>

            {/* Enhanced Features Tab */}
            <TabsContent value="features">
              <motion.div 
                className="grid gap-6 md:grid-cols-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.6 }}
              >
                {features.map((feature, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.8 + index * 0.1 }}
                    whileHover={{ y: -5 }}
                  >
                    <Card className="h-full bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-2xl transition-all duration-300">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-3">
                          <div className={`w-10 h-10 bg-gradient-to-r ${feature.bgColor} rounded-lg flex items-center justify-center`}>
                            <feature.icon className={`w-5 h-5 bg-gradient-to-r ${feature.color} bg-clip-text text-transparent`} />
                          </div>
                          {feature.title}
                        </CardTitle>
                        <CardDescription>{feature.description}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                          <Button 
                            variant="outline" 
                            asChild 
                            className="w-full bg-transparent border-gray-200 hover:bg-gray-50"
                          >
                            <a href={feature.link} className="flex items-center gap-2">
                              Learn More
                              <ArrowRight className="w-4 h-4" />
                            </a>
                          </Button>
                        </motion.div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </motion.div>
            </TabsContent>

            {/* Enhanced FAQ Tab */}
            <TabsContent value="faq">
              <motion.div 
                className="space-y-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.6 }}
              >
                {faqData.map((faq, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.8 + index * 0.1 }}
                    whileHover={{ y: -2 }}
                  >
                    <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-3 text-lg">
                          <div className="w-8 h-8 bg-gradient-to-r from-blue-100 to-purple-100 rounded-lg flex items-center justify-center">
                            <HelpCircle className="w-4 h-4 text-blue-600" />
                          </div>
                          {faq.question}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </motion.div>
            </TabsContent>

            {/* Enhanced Contact Tab */}
            <TabsContent value="contact">
              <div className="space-y-6">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.6 }}
                >
                  <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-3 text-lg">
                        <div className="w-8 h-8 bg-gradient-to-r from-green-100 to-blue-100 rounded-lg flex items-center justify-center">
                          <Clock className="w-4 h-4 text-green-600" />
                        </div>
                        24/7 Support Available
                      </CardTitle>
                      <CardDescription>We're here to help you succeed with LinkzUp</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid gap-6 md:grid-cols-3">
                        <motion.div
                          whileHover={{ y: -5 }}
                          transition={{ duration: 0.2 }}
                        >
                          <Card className="h-full border-2 hover:border-green-500/50 transition-all duration-300 cursor-pointer bg-white/50 backdrop-blur-sm">
                            <CardContent className="p-6 text-center" onClick={handleEmailSupport}>
                              <div className="w-12 h-12 bg-gradient-to-r from-blue-100 to-blue-200 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Mail className="w-6 h-6 text-blue-600" />
                              </div>
                              <h4 className="font-semibold mb-2 text-gray-900">Email Support</h4>
                              <p className="text-sm text-gray-600 mb-3">Get detailed help via email</p>
                              <p className="text-sm font-medium text-blue-600 mb-4">techzuperstudio@gmail.com</p>
                              <Button variant="outline" className="w-full bg-transparent border-gray-200 hover:bg-gray-50">
                                Send Email
                              </Button>
                            </CardContent>
                          </Card>
                        </motion.div>

                        <motion.div
                          whileHover={{ y: -5 }}
                          transition={{ duration: 0.2 }}
                        >
                          <Card className="h-full border-2 hover:border-green-500/50 transition-all duration-300 cursor-pointer bg-white/50 backdrop-blur-sm">
                            <CardContent className="p-6 text-center" onClick={handlePhoneSupport}>
                              <div className="w-12 h-12 bg-gradient-to-r from-green-100 to-green-200 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Phone className="w-6 h-6 text-green-600" />
                              </div>
                              <h4 className="font-semibold mb-2 text-gray-900">Phone Support</h4>
                              <p className="text-sm text-gray-600 mb-3">Speak directly with our team</p>
                              <p className="text-sm font-medium text-green-600 mb-4">+91 7697624256</p>
                              <Button variant="outline" className="w-full bg-transparent border-gray-200 hover:bg-gray-50">
                                Call Now
                              </Button>
                            </CardContent>
                          </Card>
                        </motion.div>

                        <motion.div
                          whileHover={{ y: -5 }}
                          transition={{ duration: 0.2 }}
                        >
                          <Card className="h-full border-2 hover:border-green-500/50 transition-all duration-300 cursor-pointer bg-white/50 backdrop-blur-sm">
                            <CardContent className="p-6 text-center" onClick={handleWhatsAppSupport}>
                              <div className="w-12 h-12 bg-gradient-to-r from-green-100 to-green-200 rounded-full flex items-center justify-center mx-auto mb-4">
                                <MessageCircle className="w-6 h-6 text-green-600" />
                              </div>
                              <h4 className="font-semibold mb-2 text-gray-900">WhatsApp Chat</h4>
                              <p className="text-sm text-gray-600 mb-3">Quick chat support</p>
                              <p className="text-sm font-medium text-green-600 mb-4">+91 7697624256</p>
                              <Button className="w-full bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white shadow-lg hover:shadow-xl transition-all duration-300">
                                <MessageCircle className="w-4 h-4 mr-2" />
                                Chat on WhatsApp
                              </Button>
                            </CardContent>
                          </Card>
                        </motion.div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.8 }}
                >
                  <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-3 text-lg">
                        <div className="w-8 h-8 bg-gradient-to-r from-purple-100 to-pink-100 rounded-lg flex items-center justify-center">
                          <Clock className="w-4 h-4 text-purple-600" />
                        </div>
                        Support Hours
                      </CardTitle>
                      <CardDescription>Our team is available to help you</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg border border-blue-200">
                          <span className="font-medium text-gray-900">Email Support:</span>
                          <span className="text-blue-600 font-medium">24/7 (Response within 24 hours)</span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg border border-green-200">
                          <span className="font-medium text-gray-900">Phone Support:</span>
                          <span className="text-green-600 font-medium">24/7 Available</span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg border border-purple-200">
                          <span className="font-medium text-gray-900">WhatsApp Chat:</span>
                          <span className="text-purple-600 font-medium">24/7 Instant Response</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </div>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  )
}