import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowRight, Users, Target, Award, Zap, CheckCircle, Calendar, BarChart3, MessageSquare, TrendingUp, Star, Shield, Sparkles } from "lucide-react"
import Link from "next/link"
import { Logo } from "@/components/logo"
import { MainNavbar } from "@/components/main-navbar"

export default function FeaturesPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-card to-muted">
      {/* Navigation */}
      <MainNavbar />

      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6 leading-tight">
              Complete <span className="text-primary">LinkedIn Management</span><br />
              Done For You
            </h1>
            <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
              From profile optimization to content creation and engagement management, we handle everything so you can focus on growing your business.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/contact">
                <Button size="lg" className="text-lg px-8 py-6">
                  Get Started Today <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Core Services Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-card/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-primary mb-4">
              Our Core Services
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Comprehensive LinkedIn management that transforms your profile into a lead generation machine.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {/* AI Content Generation */}
            <div className="group bg-white border border-gray-200 rounded-2xl p-6 sm:p-8 shadow-lg hover:shadow-2xl hover:scale-105 transition-all duration-300 cursor-pointer">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-primary/20 to-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6 group-hover:scale-110 transition-transform duration-300">
                <Sparkles className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 sm:mb-4 group-hover:text-primary transition-colors duration-300">AI Content Generation</h3>
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">Automatically create engaging LinkedIn posts, carousels, and articles tailored to your industry and audience.</p>
                  </div>
            
            {/* Smart Post Scheduling */}
            <div className="group bg-white border border-gray-200 rounded-2xl p-6 sm:p-8 shadow-lg hover:shadow-2xl hover:scale-105 transition-all duration-300 cursor-pointer">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-primary/20 to-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6 group-hover:scale-110 transition-transform duration-300">
                <Calendar className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
                  </div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 sm:mb-4 group-hover:text-primary transition-colors duration-300">Smart Post Scheduling</h3>
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">Automatically schedule posts at optimal times for maximum engagement without manual intervention.</p>
                </div>
            
            {/* AI Carousel */}
            <div className="group bg-white border border-gray-200 rounded-2xl p-6 sm:p-8 shadow-lg hover:shadow-2xl hover:scale-105 transition-all duration-300 cursor-pointer">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-primary/20 to-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6 group-hover:scale-110 transition-transform duration-300">
                <Sparkles className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 sm:mb-4 group-hover:text-primary transition-colors duration-300">AI Carousel</h3>
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">Create engaging carousel posts with AI-generated content and visuals that drive maximum engagement.</p>
                  </div>
            
            {/* Your Personal Story */}
            <div className="group bg-white border border-gray-200 rounded-2xl p-6 sm:p-8 shadow-lg hover:shadow-2xl hover:scale-105 transition-all duration-300 cursor-pointer">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-primary/20 to-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6 group-hover:scale-110 transition-transform duration-300">
                <Users className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
                  </div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 sm:mb-4 group-hover:text-primary transition-colors duration-300">Your Personal Story</h3>
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">Craft compelling personal narratives that connect with your audience and build authentic relationships.</p>
                </div>
            
            {/* AI Topics Generator */}
            <div className="group bg-white border border-gray-200 rounded-2xl p-6 sm:p-8 shadow-lg hover:shadow-2xl hover:scale-105 transition-all duration-300 cursor-pointer">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-primary/20 to-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6 group-hover:scale-110 transition-transform duration-300">
                <Target className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
                  </div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 sm:mb-4 group-hover:text-primary transition-colors duration-300">AI Topics Generator</h3>
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">Generate trending and relevant topics tailored to your industry and audience interests automatically.</p>
                </div>
            
            {/* Create Your Next LinkedIn Post with One Click */}
            <div className="group bg-white border border-gray-200 rounded-2xl p-6 sm:p-8 shadow-lg hover:shadow-2xl hover:scale-105 transition-all duration-300 cursor-pointer">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-primary/20 to-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6 group-hover:scale-110 transition-transform duration-300">
                <Zap className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
                  </div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 sm:mb-4 group-hover:text-primary transition-colors duration-300">Create Your Next LinkedIn Post with One Click</h3>
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">Generate professional LinkedIn posts instantly with AI-powered content creation that matches your brand voice and industry expertise.</p>
                </div>
          </div>
        </div>
      </section>

      {/* Additional Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-primary mb-4">
              Additional Features
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Everything you need to dominate LinkedIn and build a powerful personal brand.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="border-border hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <Zap className="w-6 h-6 text-primary" />
                </div>
                <CardTitle>AI Content Generation</CardTitle>
                <CardDescription>
                  Advanced AI that creates engaging, personalized content for your industry and audience.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-border hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <Target className="w-6 h-6 text-primary" />
                </div>
                <CardTitle>Audience Targeting</CardTitle>
                <CardDescription>
                  Strategic targeting to connect with your ideal clients and industry leaders.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-border hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <TrendingUp className="w-6 h-6 text-primary" />
                </div>
                <CardTitle>Viral Content Strategy</CardTitle>
                <CardDescription>
                  Leverage trending topics and viral content to maximize your reach and engagement.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-border hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <Star className="w-6 h-6 text-primary" />
                </div>
                <CardTitle>Thought Leadership</CardTitle>
                <CardDescription>
                  Position yourself as an industry expert with strategic content and positioning.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-border hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <Shield className="w-6 h-6 text-primary" />
                </div>
                <CardTitle>Brand Safety</CardTitle>
                <CardDescription>
                  Ensure your personal brand remains professional and aligned with your business goals.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-border hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <Users className="w-6 h-6 text-primary" />
                </div>
                <CardTitle>Network Building</CardTitle>
                <CardDescription>
                  Strategic networking to expand your professional connections and opportunities.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Results Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-card/30">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-primary mb-8">
            What You Can Expect
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="space-y-4">
              <div className="text-3xl font-bold text-primary">3x</div>
              <div className="text-lg font-semibold text-foreground">Engagement Increase</div>
              <div className="text-muted-foreground">Within 30 days of starting</div>
            </div>
            <div className="space-y-4">
              <div className="text-3xl font-bold text-primary">5x</div>
              <div className="text-lg font-semibold text-foreground">Profile Views</div>
              <div className="text-muted-foreground">More visibility in your industry</div>
            </div>
            <div className="space-y-4">
              <div className="text-3xl font-bold text-primary">500+</div>
              <div className="text-lg font-semibold text-foreground">Content Templates</div>
              <div className="text-muted-foreground">Pre-built posts, carousels, and articles ready to use</div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card/30 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="space-y-3">
              <Link href="/" className="flex items-center space-x-2">
                <Logo size="4xl" />
              </Link>
              <p className="text-muted-foreground">
                Transform your professional identity with AI-powered personal branding.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-foreground mb-4">Company</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li>
                  <Link href="/about" className="hover:text-foreground transition-colors">
                    About Us
                  </Link>
                </li>
                <li>
                  <Link href="/features" className="hover:text-foreground transition-colors">
                    Services
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="hover:text-foreground transition-colors">
                    Contact
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-foreground mb-4">Services</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li>
                  <Link href="/features" className="hover:text-foreground transition-colors">
                    LinkedIn Branding
                  </Link>
                </li>
                <li>
                  <Link href="/features" className="hover:text-foreground transition-colors">
                    Content Creation
                  </Link>
                </li>
                <li>
                  <Link href="/features" className="hover:text-foreground transition-colors">
                    Profile Optimization
                  </Link>
                </li>
                <li>
                  <Link href="/features" className="hover:text-foreground transition-colors">
                    Engagement Management
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-foreground mb-4">Resources</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li>
                  <Link href="/features" className="hover:text-foreground transition-colors">
                    Case Studies
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="hover:text-foreground transition-colors">
                    FAQs
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-border mt-8 pt-8 text-center text-muted-foreground">
            <p>&copy; 2025 LinkZup. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}