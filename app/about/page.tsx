import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowRight, Users, Target, Award, Zap, CheckCircle, Quote } from "lucide-react"
import Link from "next/link"
import { Logo } from "@/components/logo"
import { MainNavbar } from "@/components/main-navbar"

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-card to-muted">
      {/* Navigation */}
      <MainNavbar />

      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6 leading-tight">
              About <span className="text-primary">LinkZup</span>
            </h1>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-primary mb-8 leading-relaxed">
              Our Mission
            </h2>
            <p className="text-2xl font-semibold text-foreground mb-8">
              At LinkZup, we believe every entrepreneur deserves a powerful LinkedIn presence.
            </p>
            <p className="text-lg text-muted-foreground mb-8">
              LinkedIn is no longer just a job board — it's the world's biggest stage for professionals. It's where business leaders build authority, attract clients, and shape industries. Yet, most founders and CXOs are invisible because they don't have the time to write posts, engage daily, or optimize their profile.
            </p>
            <p className="text-xl font-semibold text-primary mb-8">
              That's where we come in. 🚀
            </p>
            <p className="text-lg text-muted-foreground">
              We make you visible, credible, and profitable on LinkedIn — while you focus on growing your business.
            </p>
          </div>
        </div>
      </section>

      {/* Who We Are Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-card/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-primary mb-4">
              Who We Are
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              LinkZup is a done-for-you LinkedIn management system built by entrepreneurs, for entrepreneurs.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            <div className="group bg-white border border-gray-200 rounded-2xl p-6 sm:p-8 shadow-lg hover:shadow-2xl hover:scale-105 transition-all duration-300 cursor-pointer">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-primary/20 to-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6 group-hover:scale-110 transition-transform duration-300">
                <Target className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 sm:mb-4 group-hover:text-primary transition-colors duration-300 text-center">LinkedIn Growth Strategists</h3>
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed text-center">Who know the algorithm inside out</p>
            </div>

            <div className="group bg-white border border-gray-200 rounded-2xl p-6 sm:p-8 shadow-lg hover:shadow-2xl hover:scale-105 transition-all duration-300 cursor-pointer">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-primary/20 to-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6 group-hover:scale-110 transition-transform duration-300">
                <Zap className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 sm:mb-4 group-hover:text-primary transition-colors duration-300 text-center">Content Creators</h3>
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed text-center">Who craft posts that drive engagement and leads</p>
            </div>

            <div className="group bg-white border border-gray-200 rounded-2xl p-6 sm:p-8 shadow-lg hover:shadow-2xl hover:scale-105 transition-all duration-300 cursor-pointer">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-primary/20 to-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6 group-hover:scale-110 transition-transform duration-300">
                <Award className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 sm:mb-4 group-hover:text-primary transition-colors duration-300 text-center">Personal Branding Experts</h3>
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed text-center">Who position you as a thought leader</p>
            </div>

            <div className="group bg-white border border-gray-200 rounded-2xl p-6 sm:p-8 shadow-lg hover:shadow-2xl hover:scale-105 transition-all duration-300 cursor-pointer">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-primary/20 to-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6 group-hover:scale-110 transition-transform duration-300">
                <Users className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 sm:mb-4 group-hover:text-primary transition-colors duration-300 text-center">Tech & Analytics Specialists</h3>
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed text-center">Who ensure your growth is measurable</p>
            </div>
          </div>

          <div className="text-center mt-12">
            <p className="text-lg text-muted-foreground">
              Together, we bring the perfect blend of AI + human creativity to scale your LinkedIn presence.
            </p>
          </div>
        </div>
      </section>

      {/* Founder's Story Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-primary mb-4">
              The Founder's Story
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                  <Users className="w-8 h-8 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-foreground">👤 Prashant Kulkarni</h3>
                  <p className="text-muted-foreground">Founder & CEO</p>
                </div>
              </div>
              
              <p className="text-lg text-muted-foreground">
                As a startup ecosystem builder and branding strategist, I worked closely with founders who had amazing businesses but no visibility. They were too busy running companies to focus on LinkedIn, and they kept missing out on deals, partnerships, and recognition.
              </p>
              
              <p className="text-lg text-muted-foreground">
                That frustration gave birth to LinkZup — a solution designed to turn every LinkedIn profile into a growth engine.
              </p>
            </div>

            <div className="bg-card/50 p-8 rounded-lg border border-border">
              <div className="flex items-start space-x-4">
                <Quote className="w-8 h-8 text-primary mt-1" />
                <div>
                  <blockquote className="text-xl font-semibold text-foreground mb-4">
                    "Every entrepreneur deserves a powerful LinkedIn presence."
                  </blockquote>
                  <p className="text-muted-foreground">
                    This simple belief drives everything we do at LinkZup.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Vision Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-card/30">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-primary mb-8">
            Our Vision
          </h2>
          <p className="text-xl text-muted-foreground mb-12">
            To become the #1 LinkedIn management system globally, empowering professionals to:
          </p>
          
          <div className="grid md:grid-cols-3 gap-6 lg:gap-8 mb-12">
            <div className="group bg-white border border-gray-200 rounded-2xl p-6 sm:p-8 shadow-lg hover:shadow-2xl hover:scale-105 transition-all duration-300 cursor-pointer">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-primary/20 to-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6 group-hover:scale-110 transition-transform duration-300">
                <Award className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 sm:mb-4 group-hover:text-primary transition-colors duration-300 text-center">Build Authority</h3>
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed text-center">Establish yourself as a thought leader in your industry through strategic content and positioning</p>
            </div>
            
            <div className="group bg-white border border-gray-200 rounded-2xl p-6 sm:p-8 shadow-lg hover:shadow-2xl hover:scale-105 transition-all duration-300 cursor-pointer">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-primary/20 to-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6 group-hover:scale-110 transition-transform duration-300">
                <Target className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 sm:mb-4 group-hover:text-primary transition-colors duration-300 text-center">Attract Clients</h3>
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed text-center">Generate high-quality leads and convert prospects into paying customers through LinkedIn</p>
            </div>
            
            <div className="group bg-white border border-gray-200 rounded-2xl p-6 sm:p-8 shadow-lg hover:shadow-2xl hover:scale-105 transition-all duration-300 cursor-pointer">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-primary/20 to-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6 group-hover:scale-110 transition-transform duration-300">
                <Zap className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 sm:mb-4 group-hover:text-primary transition-colors duration-300 text-center">Unlock New Opportunities</h3>
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed text-center">Discover partnerships, collaborations, and business opportunities through strategic networking</p>
            </div>
          </div>
          
          <p className="text-lg text-muted-foreground">
            Because in today's world — your LinkedIn is your first impression.
          </p>
        </div>
      </section>

      {/* Why Choose LinkZup Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-primary mb-4">
              Why Choose LinkZup?
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <CheckCircle className="w-6 h-6 text-green-500 mt-1" />
                <div>
                  <h3 className="text-xl font-semibold text-foreground mb-2">100% LinkedIn-focused</h3>
                  <p className="text-muted-foreground">We specialize exclusively in LinkedIn growth and optimization.</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <CheckCircle className="w-6 h-6 text-green-500 mt-1" />
                <div>
                  <h3 className="text-xl font-semibold text-foreground mb-2">Done-for-you, end-to-end management</h3>
                  <p className="text-muted-foreground">Complete service from profile optimization to content creation and engagement.</p>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <CheckCircle className="w-6 h-6 text-green-500 mt-1" />
                <div>
                  <h3 className="text-xl font-semibold text-foreground mb-2">Human creativity + AI efficiency</h3>
                  <p className="text-muted-foreground">The perfect blend of human expertise and AI-powered optimization.</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <CheckCircle className="w-6 h-6 text-green-500 mt-1" />
                <div>
                  <h3 className="text-xl font-semibold text-foreground mb-2">Proven results in weeks, not months</h3>
                  <p className="text-muted-foreground">Quick, measurable results that help you achieve your goals faster.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="text-center mt-12">
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-primary">
              We're not just managing LinkedIn — we're building personal brands that last.
            </h2>
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