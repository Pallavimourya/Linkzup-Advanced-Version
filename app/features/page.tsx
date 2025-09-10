import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowRight, Users, Target, Award, Zap, CheckCircle, Calendar, BarChart3, MessageSquare, TrendingUp, Star, Shield } from "lucide-react"
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
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Our Core Services
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Comprehensive LinkedIn management that transforms your profile into a lead generation machine.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12">
            {/* Profile Revamp */}
            <Card className="border-border hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center space-x-4 mb-4">
                  <div className="w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Award className="w-8 h-8 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl">Profile Revamp</CardTitle>
                    <CardDescription className="text-lg">Authority-driven design & copy</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  Transform your LinkedIn profile into a compelling personal brand that attracts your ideal clients and establishes you as an industry authority.
                </p>
                <ul className="space-y-2">
                  <li className="flex items-start space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                    <span className="text-muted-foreground">Professional headshot and banner design</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                    <span className="text-muted-foreground">Compelling headline and summary</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                    <span className="text-muted-foreground">Keyword optimization for visibility</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                    <span className="text-muted-foreground">Featured section optimization</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Content Calendar */}
            <Card className="border-border hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center space-x-4 mb-4">
                  <div className="w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Calendar className="w-8 h-8 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl">Content Calendar</CardTitle>
                    <CardDescription className="text-lg">Weekly posts crafted for visibility</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  Consistent, engaging content that positions you as a thought leader and drives meaningful engagement with your target audience.
                </p>
                <ul className="space-y-2">
                  <li className="flex items-start space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                    <span className="text-muted-foreground">3-5 posts per week</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                    <span className="text-muted-foreground">Industry-relevant content</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                    <span className="text-muted-foreground">Optimal posting times</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                    <span className="text-muted-foreground">Engagement-driving captions</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Engagement & DMs */}
            <Card className="border-border hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center space-x-4 mb-4">
                  <div className="w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center">
                    <MessageSquare className="w-8 h-8 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl">Engagement & DMs</CardTitle>
                    <CardDescription className="text-lg">Daily interactions that build trust</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  Active engagement with your network and strategic outreach to prospects that converts connections into clients.
                </p>
                <ul className="space-y-2">
                  <li className="flex items-start space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                    <span className="text-muted-foreground">Daily comment engagement</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                    <span className="text-muted-foreground">Strategic connection requests</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                    <span className="text-muted-foreground">Personalized DM sequences</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                    <span className="text-muted-foreground">Lead nurturing campaigns</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Growth Insights */}
            <Card className="border-border hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center space-x-4 mb-4">
                  <div className="w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center">
                    <BarChart3 className="w-8 h-8 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl">Growth Insights</CardTitle>
                    <CardDescription className="text-lg">Monthly analytics & strategy tweaks</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  Data-driven insights and strategic recommendations to continuously optimize your LinkedIn performance and maximize ROI.
                </p>
                <ul className="space-y-2">
                  <li className="flex items-start space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                    <span className="text-muted-foreground">Monthly performance reports</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                    <span className="text-muted-foreground">Content performance analysis</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                    <span className="text-muted-foreground">Audience growth tracking</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                    <span className="text-muted-foreground">Strategy optimization recommendations</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Additional Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
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
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-8">
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
              <div className="text-3xl font-bold text-primary">₹3.5L+</div>
              <div className="text-lg font-semibold text-foreground">Revenue Generated</div>
              <div className="text-muted-foreground">Average client closed via LinkedIn</div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card/30 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <Link href="/" className="flex items-center space-x-2">
                <Logo size="md" />
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
            <p>&copy; 2024 LinkZup. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
