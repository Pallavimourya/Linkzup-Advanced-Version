"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  TrendingUp,
  Search,
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  Clock,
  Eye,
  Sparkles,
  Filter,
  RefreshCw,
} from "lucide-react"
import { LinkedInPostButton } from "@/components/linkedin-post-button"

interface ViralPost {
  id: string
  author: {
    name: string
    title: string
    avatar: string
    verified: boolean
  }
  content: string
  engagement: {
    likes: number
    comments: number
    shares: number
    views: number
  }
  timeAgo: string
  category: string
  trending: boolean
  saved: boolean
}

interface NewsItem {
  id: string
  title: string
  summary: string
  source: string
  publishedAt: string
  category: string
  trending: boolean
  relevanceScore: number
}

const mockViralPosts: ViralPost[] = [
  {
    id: "1",
    author: {
      name: "Sarah Chen",
      title: "VP of Marketing at TechCorp",
      avatar: "/professional-woman-diverse.png",
      verified: true,
    },
    content:
      "Just launched our biggest campaign yet and learned something crucial: Your audience doesn't care about your product features. They care about how you make them FEEL. Here's what 10,000 customer interviews taught me about emotional marketing... 🧵",
    engagement: {
      likes: 2847,
      comments: 312,
      shares: 891,
      views: 45230,
    },
    timeAgo: "2h",
    category: "Marketing",
    trending: true,
    saved: false,
  },
  {
    id: "2",
    author: {
      name: "Marcus Johnson",
      title: "Senior Software Engineer",
      avatar: "/professional-man.png",
      verified: false,
    },
    content:
      "I was rejected by Google 3 times. Today I got promoted to Staff Engineer at Meta. Here's exactly what changed between rejection #3 and my dream offer... (Save this if you're job hunting)",
    engagement: {
      likes: 5234,
      comments: 678,
      shares: 1456,
      views: 78900,
    },
    timeAgo: "4h",
    category: "Career",
    trending: true,
    saved: true,
  },
  {
    id: "3",
    author: {
      name: "Dr. Emily Rodriguez",
      title: "Leadership Coach & Author",
      avatar: "/professional-woman-coach.png",
      verified: true,
    },
    content:
      "The #1 mistake I see leaders make: They think vulnerability is weakness. Last week, I watched a CEO admit he didn't know something in front of 200 employees. What happened next will surprise you...",
    engagement: {
      likes: 1923,
      comments: 234,
      shares: 567,
      views: 32100,
    },
    timeAgo: "6h",
    category: "Leadership",
    trending: false,
    saved: false,
  },
]

const mockNews: NewsItem[] = [
  {
    id: "1",
    title: "AI Adoption in Enterprise Reaches 73% as Companies Prioritize Automation",
    summary:
      "New research shows enterprise AI adoption has accelerated dramatically, with 73% of companies now using AI tools for business operations, marking a 45% increase from last year.",
    source: "TechCrunch",
    publishedAt: "1h ago",
    category: "Technology",
    trending: true,
    relevanceScore: 95,
  },
  {
    id: "2",
    title: "Remote Work Policies Shift as Companies Embrace Hybrid Models",
    summary:
      "Major corporations are redefining remote work policies, with 68% adopting permanent hybrid models that balance flexibility with in-person collaboration.",
    source: "Harvard Business Review",
    publishedAt: "3h ago",
    category: "Workplace",
    trending: true,
    relevanceScore: 88,
  },
  {
    id: "3",
    title: "LinkedIn Introduces New Creator Tools for Professional Content",
    summary:
      "LinkedIn announces enhanced creator tools including advanced analytics, content scheduling, and AI-powered writing assistance to help professionals build their personal brand.",
    source: "LinkedIn News",
    publishedAt: "5h ago",
    category: "Social Media",
    trending: false,
    relevanceScore: 92,
  },
]

export default function ViralPostsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [viralPosts, setViralPosts] = useState(mockViralPosts)
  const [news, setNews] = useState(mockNews)
  const [isLoading, setIsLoading] = useState(false)

  const handleSavePost = (postId: string) => {
    setViralPosts((posts) => posts.map((post) => (post.id === postId ? { ...post, saved: !post.saved } : post)))
  }

  const handleRefresh = async () => {
    setIsLoading(true)
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false)
    }, 2000)
  }

  const filteredPosts = viralPosts.filter((post) => {
    const matchesSearch =
      post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.author.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === "all" || post.category.toLowerCase() === selectedCategory
    return matchesSearch && matchesCategory
  })

  const filteredNews = news.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.summary.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === "all" || item.category.toLowerCase() === selectedCategory
    return matchesSearch && matchesCategory
  })

  return (
    <div className="flex-1 space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Viral Posts & News</h1>
          <p className="text-muted-foreground">Discover trending content and stay updated with industry news</p>
        </div>
        <Button onClick={handleRefresh} disabled={isLoading} variant="outline">
          <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search posts and news..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <Filter className="mr-2 h-4 w-4" />
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="marketing">Marketing</SelectItem>
            <SelectItem value="career">Career</SelectItem>
            <SelectItem value="leadership">Leadership</SelectItem>
            <SelectItem value="technology">Technology</SelectItem>
            <SelectItem value="workplace">Workplace</SelectItem>
            <SelectItem value="social media">Social Media</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Tabs defaultValue="viral-posts" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="viral-posts" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Viral Posts
          </TabsTrigger>
          <TabsTrigger value="news-feed" className="flex items-center gap-2">
            <Eye className="h-4 w-4" />
            News Feed
          </TabsTrigger>
        </TabsList>

        <TabsContent value="viral-posts" className="space-y-6">
          <div className="grid gap-6">
            {filteredPosts.map((post) => (
              <Card key={post.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={post.author.avatar || "/placeholder.svg"} alt={post.author.name} />
                        <AvatarFallback>{post.author.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">{post.author.name}</h3>
                          {post.author.verified && (
                            <Badge variant="secondary" className="text-xs">
                              Verified
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">{post.author.title}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Clock className="h-3 w-3 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">{post.timeAgo}</span>
                          <Badge variant="outline" className="text-xs">
                            {post.category}
                          </Badge>
                          {post.trending && (
                            <Badge className="text-xs bg-red-100 text-red-700 hover:bg-red-200">
                              <TrendingUp className="h-3 w-3 mr-1" />
                              Trending
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSavePost(post.id)}
                      className={post.saved ? "text-blue-600" : ""}
                    >
                      <Bookmark className={`h-4 w-4 ${post.saved ? "fill-current" : ""}`} />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm leading-relaxed">{post.content}</p>

                  <div className="flex items-center justify-between pt-3 border-t">
                    <div className="flex items-center gap-6 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Heart className="h-4 w-4" />
                        <span>{post.engagement.likes.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MessageCircle className="h-4 w-4" />
                        <span>{post.engagement.comments.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Share2 className="h-4 w-4" />
                        <span>{post.engagement.shares.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Eye className="h-4 w-4" />
                        <span>{post.engagement.views.toLocaleString()}</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" className="gap-2">
                        <Sparkles className="h-4 w-4" />
                        Create Similar
                      </Button>
                      <LinkedInPostButton 
                        content={post.content}
                        className="text-xs h-8"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="news-feed" className="space-y-6">
          <div className="grid gap-4">
            {filteredNews.map((item) => (
              <Card key={item.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline" className="text-xs">
                          {item.category}
                        </Badge>
                        {item.trending && (
                          <Badge className="text-xs bg-red-100 text-red-700 hover:bg-red-200">
                            <TrendingUp className="h-3 w-3 mr-1" />
                            Trending
                          </Badge>
                        )}
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <span>Relevance: {item.relevanceScore}%</span>
                        </div>
                      </div>
                      <CardTitle className="text-lg leading-tight">{item.title}</CardTitle>
                      <CardDescription className="mt-2">{item.summary}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span>{item.source}</span>
                      <span>•</span>
                      <span>{item.publishedAt}</span>
                    </div>
                    <Button size="sm" variant="outline" className="gap-2 bg-transparent">
                      <Sparkles className="h-4 w-4" />
                      Create Post
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
