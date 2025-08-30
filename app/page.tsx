import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowRight, Sparkles, Target, Zap, Users, BarChart3, Calendar, CheckCircle, TrendingUp, Award, Clock, X } from "lucide-react"
import Link from "next/link"
import { MainNavbar } from "@/components/main-navbar"
import { Logo } from "@/components/logo"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-card to-muted">
      {/* Navigation */}
      <MainNavbar />

      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="text-center lg:text-left">
              <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6 leading-tight">
                Grow on LinkedIn.<br />
                <span className="text-primary">Without the hassle.</span>
              </h1>
              <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
                Your profile, content, engagement — managed end-to-end so you can focus on business.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link href="/auth/signup">
                  <Button size="lg" className="text-lg px-8 py-6">
                    👉 Get Started Now <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </Link>
              </div>
            </div>
            
            <div className="relative">
              <div className="rounded-2xl overflow-hidden shadow-2xl">
                <video 
                  autoPlay 
                  loop 
                  muted 
                  playsInline
                  className="w-full h-auto"
                  poster="/placeholder.jpg"
                >
                  <source src="/video.mp4" type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Problem Statement */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-card/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
              Most professionals are invisible on LinkedIn.
            </h2>
            <p className="text-xl text-muted-foreground mb-8">
              1 Billion users, but less than 3% post content.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-foreground">Founders & CXOs don't have the time to:</h3>
              <ul className="space-y-3">
                <li className="flex items-start space-x-3">
                  <Clock className="w-5 h-5 text-muted-foreground mt-0.5" />
                  <span className="text-muted-foreground">Write content consistently</span>
                </li>
                <li className="flex items-start space-x-3">
                  <Users className="w-5 h-5 text-muted-foreground mt-0.5" />
                  <span className="text-muted-foreground">Engage with prospects daily</span>
                </li>
                <li className="flex items-start space-x-3">
                  <Target className="w-5 h-5 text-muted-foreground mt-0.5" />
                  <span className="text-muted-foreground">Optimize their profile for visibility</span>
                </li>
              </ul>
            </div>
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-destructive">Result:</h3>
              <ul className="space-y-3">
                <li className="flex items-start space-x-3">
                  <X className="w-5 h-5 text-destructive mt-0.5" />
                  <span className="text-muted-foreground">Missed leads</span>
                </li>
                <li className="flex items-start space-x-3">
                  <X className="w-5 h-5 text-destructive mt-0.5" />
                  <span className="text-muted-foreground">Poor visibility</span>
                </li>
                <li className="flex items-start space-x-3">
                  <X className="w-5 h-5 text-destructive mt-0.5" />
                  <span className="text-muted-foreground">Weak personal brand</span>
                </li>
              </ul>
            </div>
          </div>
          
          <div className="text-center">
            <h3 className="text-2xl font-bold text-foreground mb-4">
              We make you a thought leader, while you focus on business.
            </h3>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="border-border hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <Award className="w-6 h-6 text-primary" />
                </div>
                <CardTitle>Profile Revamp</CardTitle>
                <CardDescription>
                  Authority-driven design & copy.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-border hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <Calendar className="w-6 h-6 text-primary" />
                </div>
                <CardTitle>Content Calendar</CardTitle>
                <CardDescription>
                  Weekly posts crafted for visibility.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-border hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <Users className="w-6 h-6 text-primary" />
                </div>
                <CardTitle>Engagement & DMs</CardTitle>
                <CardDescription>
                  Daily interactions that build trust.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-border hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <BarChart3 className="w-6 h-6 text-primary" />
                </div>
                <CardTitle>Growth Insights</CardTitle>
                <CardDescription>
                  Monthly analytics & strategy tweaks.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Why LinkedIn Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-card/30">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-8">
            Try LinkZup Today
          </h2>
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-foreground">LinkedIn is the #1 platform for professionals.</h3>
              <ul className="space-y-3 text-left">
                <li className="flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                  <span className="text-muted-foreground">Organic reach on LinkedIn is 10x higher than other platforms</span>
                </li>
                <li className="flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                  <span className="text-muted-foreground">CXOs & founders are shifting to personal brand-led growth</span>
                </li>
                <li className="flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                  <span className="text-muted-foreground">Early movers in LinkedIn management will dominate</span>
                </li>
              </ul>
            </div>
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-foreground">From invisible to industry leader.</h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">120+</div>
                  <div className="text-sm text-muted-foreground">entrepreneurs on our waitlist</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">3x</div>
                  <div className="text-sm text-muted-foreground">engagement in 30 days for early clients</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">₹3.5L</div>
                  <div className="text-sm text-muted-foreground">client closed via LinkedIn in 2 months</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About Founder Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
            Built by entrepreneurs, for entrepreneurs.
          </h2>
          <p className="text-xl text-muted-foreground mb-8">
            Founded by Prashant Kulkarni, LinkZup was born out of a simple belief:
          </p>
          <blockquote className="text-2xl font-semibold text-primary mb-8 italic">
            "Every entrepreneur deserves a powerful LinkedIn presence."
          </blockquote>
          <p className="text-lg text-muted-foreground">
            Backed by LinkedIn growth strategists, content experts, and a scalable ops team, we help professionals turn profiles into profit.
          </p>
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
