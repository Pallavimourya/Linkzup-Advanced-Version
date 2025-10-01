import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowRight, Sparkles, Target, Zap, Users, BarChart3, Calendar, CheckCircle, TrendingUp, Award, Clock, X } from "lucide-react"
import Link from "next/link"
import { MainNavbar } from "@/components/main-navbar"
import { Logo } from "@/components/logo"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section with Video Background */}
      <section className="relative min-h-screen px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Video Background - covers entire viewport including navbar area */}
        <video 
          autoPlay 
          loop 
          muted 
          playsInline
          className="absolute inset-0 w-full h-full object-cover z-0"
        >
          <source src="/111.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
        
        {/* Overlay for better text readability */}
        <div className="absolute inset-0 bg-black/80 z-10"></div>
        
        {/* Floating decorative elements */}
        <div className="absolute inset-0 z-5 overflow-hidden">
          {/* Floating blue circle 1 - Hidden on mobile */}
          <div className="hidden sm:block absolute top-20 left-10 w-8 sm:w-12 h-8 sm:h-12 bg-primary rounded-full animate-bounce opacity-80" style={{ animationDuration: '3s', animationDelay: '0s' }}></div>
          
          {/* Floating blue circle 2 - Smaller on mobile */}
          <div className="absolute top-40 right-4 sm:right-20 w-8 sm:w-12 md:w-16 h-8 sm:h-12 md:h-16 bg-primary rounded-full animate-bounce opacity-70" style={{ animationDuration: '4s', animationDelay: '1s' }}></div>
          
          {/* Floating blue square 1 - Hidden on mobile */}
          <div className="hidden sm:block absolute top-60 left-1/4 w-10 sm:w-14 h-10 sm:h-14 bg-primary animate-bounce opacity-75" style={{ animationDuration: '3.5s', animationDelay: '0.5s' }}></div>
          
          {/* Floating blue square 2 - Smaller on mobile */}
          <div className="absolute bottom-40 right-1/3 w-6 sm:w-8 md:w-10 h-6 sm:h-8 md:h-10 bg-primary animate-bounce opacity-80" style={{ animationDuration: '2.5s', animationDelay: '1.5s' }}></div>
          
          {/* Rotating hollow square - Smaller on mobile */}
          <div className="absolute top-1/3 right-4 sm:right-10 w-12 sm:w-16 md:w-20 h-12 sm:h-16 md:h-20 border-2 sm:border-4 border-primary animate-spin opacity-90" style={{ animationDuration: '8s' }}></div>
          
          {/* Additional floating elements - Hidden on mobile */}
          <div className="hidden sm:block absolute bottom-20 left-1/3 w-6 sm:w-8 h-6 sm:h-8 bg-primary rounded-full animate-bounce opacity-70" style={{ animationDuration: '2s', animationDelay: '2s' }}></div>
          
          <div className="hidden md:block absolute top-1/2 left-20 w-8 sm:w-12 h-8 sm:h-12 bg-primary animate-bounce opacity-75" style={{ animationDuration: '3.2s', animationDelay: '0.8s' }}></div>
          
          <div className="absolute bottom-1/3 right-1/4 w-6 sm:w-8 md:w-10 h-6 sm:h-8 md:h-10 bg-primary rounded-full animate-bounce opacity-80" style={{ animationDuration: '2.8s', animationDelay: '1.2s' }}></div>
          
          {/* Extra large elements - Hidden on mobile */}
          <div className="hidden lg:block absolute top-10 right-1/2 w-16 lg:w-18 h-16 lg:h-18 bg-primary rounded-full animate-bounce opacity-60" style={{ animationDuration: '5s', animationDelay: '0.3s' }}></div>
          
          <div className="hidden lg:block absolute bottom-10 left-1/2 w-12 lg:w-16 h-12 lg:h-16 bg-primary animate-bounce opacity-65" style={{ animationDuration: '4.5s', animationDelay: '1.8s' }}></div>
        </div>
        
        {/* Navigation */}
        <div className="relative z-20">
          <MainNavbar />
        </div>
        
        {/* Content */}
        <div className="relative z-20 max-w-7xl mx-auto pt-16 sm:pt-20">
          <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] sm:min-h-[calc(100vh-5rem)]">
            <div className="text-center max-w-4xl px-4">
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-white mb-6 sm:mb-8 leading-tight" style={{ fontFamily: 'Roboto, sans-serif' }}>
                Grow on LinkedIn.<br />
                <span className="text-primary">Without the hassle.</span>
              </h1>
              <p className="text-lg sm:text-xl md:text-2xl text-white/90 mb-8 sm:mb-12 leading-relaxed">
                Your profile, content, engagement — managed end-to-end so you can focus on business.
              </p>
              <div className="flex justify-center">
                <Link href="/auth/signup">
                  <Button size="lg" className="text-base sm:text-lg px-6 sm:px-8 md:px-12 py-4 sm:py-6 md:py-8">
                    👉 Get Started Now <ArrowRight className="ml-2 w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" />
                  </Button>
                </Link>
              </div>
            </div>
            
          </div>
        </div>
      </section>

      {/* Who We Are */}
      <section className="relative py-16 sm:py-20 lg:py-24 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Floating shapes for Who We Are section */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          <div className="absolute top-10 right-10 w-6 h-6 bg-primary rounded-full animate-bounce opacity-60" style={{ animationDuration: '3s', animationDelay: '0s' }}></div>
          <div className="absolute bottom-20 left-8 w-8 h-8 bg-primary animate-bounce opacity-70" style={{ animationDuration: '4s', animationDelay: '1s' }}></div>
          <div className="absolute top-1/2 right-1/4 w-4 h-4 bg-primary rounded-full animate-bounce opacity-50" style={{ animationDuration: '2.5s', animationDelay: '0.5s' }}></div>
        </div>
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            {/* Left side - Video */}
            <div className="order-2 lg:order-1">
              <div className="rounded-2xl overflow-hidden shadow-2xl">
                <video 
                  autoPlay 
                  loop 
                  muted 
                  playsInline
                  className="w-full h-64 sm:h-80 lg:h-96 object-cover"
                >
                  <source src="/video.mp4" type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              </div>
            </div>
            
            {/* Right side - Content */}
            <div className="order-1 lg:order-2">
              <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-primary mb-4">
                Who We Are
            </h2>
              <p className="text-lg sm:text-xl text-muted-foreground mb-6">
                LinkZup is a done-for-you LinkedIn management system built by entrepreneurs, for entrepreneurs.
              </p>
              
              <div className="space-y-4 mb-6">
                <div className="space-y-1">
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-900">LinkedIn Growth Strategists</h3>
                  <p className="text-sm sm:text-base text-muted-foreground">Who know the algorithm inside out</p>
                </div>
                <div className="space-y-1">
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-900">Content Creators</h3>
                  <p className="text-sm sm:text-base text-muted-foreground">Who craft posts that drive engagement and leads</p>
                </div>
                <div className="space-y-1">
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-900">Personal Branding Experts</h3>
                  <p className="text-sm sm:text-base text-muted-foreground">Who position you as a thought leader</p>
                </div>
                <div className="space-y-1">
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-900">Tech & Analytics Specialists</h3>
                  <p className="text-sm sm:text-base text-muted-foreground">Who ensure your growth is measurable</p>
                </div>
          </div>
          
              <p className="text-base sm:text-lg text-muted-foreground">
                Together, we bring the perfect blend of AI + human creativity to scale your LinkedIn presence.
              </p>
            </div>
          </div>
        </div>
      </section>


      {/* LinkedIn & LinkZup Collaboration Section */}
      <section className="relative py-16 sm:py-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Floating shapes for Why LinkZup section */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          <div className="absolute top-16 left-12 w-10 h-10 bg-primary rounded-full animate-bounce opacity-65" style={{ animationDuration: '3.5s', animationDelay: '0.2s' }}></div>
          <div className="absolute bottom-32 right-16 w-6 h-6 bg-primary animate-bounce opacity-75" style={{ animationDuration: '2.8s', animationDelay: '1.3s' }}></div>
          <div className="absolute top-1/3 left-1/3 w-8 h-8 bg-primary rounded-full animate-bounce opacity-60" style={{ animationDuration: '4.2s', animationDelay: '0.8s' }}></div>
          <div className="absolute bottom-1/4 right-1/3 w-5 h-5 bg-primary animate-bounce opacity-70" style={{ animationDuration: '3.1s', animationDelay: '1.7s' }}></div>
        </div>
        <div className="max-w-6xl mx-auto relative z-10">
          <div className="text-center">
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-primary mb-6">
                Why LinkZup is Important for LinkedIn
              </h2>
            <p className="text-xl text-muted-foreground mb-12">
                Our AI-powered automation platform transforms LinkedIn from a time-consuming task into a profit-generating machine.
              </p>
              
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
              <div className="group bg-white border border-gray-200 rounded-2xl p-6 sm:p-8 shadow-lg hover:shadow-2xl hover:scale-105 transition-all duration-300 cursor-pointer">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-primary/20 to-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Sparkles className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 sm:mb-4 group-hover:text-primary transition-colors duration-300">AI Content Generation</h3>
                <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">Automatically create engaging LinkedIn posts, carousels, and articles tailored to your industry and audience.</p>
                </div>
                
              <div className="group bg-white border border-gray-200 rounded-2xl p-6 sm:p-8 shadow-lg hover:shadow-2xl hover:scale-105 transition-all duration-300 cursor-pointer">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-primary/20 to-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Calendar className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 sm:mb-4 group-hover:text-primary transition-colors duration-300">Smart Post Scheduling</h3>
                <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">Automatically schedule posts at optimal times for maximum engagement without manual intervention.</p>
                </div>
                
              <div className="group bg-white border border-gray-200 rounded-2xl p-6 sm:p-8 shadow-lg hover:shadow-2xl hover:scale-105 transition-all duration-300 cursor-pointer">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-primary/20 to-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Sparkles className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 sm:mb-4 group-hover:text-primary transition-colors duration-300">AI Carousel</h3>
                <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">Create engaging carousel posts with AI-generated content and visuals that drive maximum engagement.</p>
                </div>
                
              <div className="group bg-white border border-gray-200 rounded-2xl p-6 sm:p-8 shadow-lg hover:shadow-2xl hover:scale-105 transition-all duration-300 cursor-pointer">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-primary/20 to-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Users className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 sm:mb-4 group-hover:text-primary transition-colors duration-300">Your Personal Story</h3>
                <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">Craft compelling personal narratives that connect with your audience and build authentic relationships.</p>
                </div>
                
              <div className="group bg-white border border-gray-200 rounded-2xl p-6 sm:p-8 shadow-lg hover:shadow-2xl hover:scale-105 transition-all duration-300 cursor-pointer">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-primary/20 to-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Target className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 sm:mb-4 group-hover:text-primary transition-colors duration-300">AI Topics Generator</h3>
                <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">Generate trending and relevant topics tailored to your industry and audience interests automatically.</p>
              </div>
                
              <div className="group bg-white border border-gray-200 rounded-2xl p-6 sm:p-8 shadow-lg hover:shadow-2xl hover:scale-105 transition-all duration-300 cursor-pointer">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-primary/20 to-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Zap className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 sm:mb-4 group-hover:text-primary transition-colors duration-300">Create Your Next LinkedIn Post with One Click</h3>
                <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">Generate professional LinkedIn posts instantly with AI-powered content creation that matches your brand voice and industry expertise.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why LinkedIn Section */}
      <section className="relative py-16 sm:py-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Floating shapes for Why LinkedIn section */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          <div className="absolute top-20 right-8 w-7 h-7 bg-primary rounded-full animate-bounce opacity-70" style={{ animationDuration: '3.2s', animationDelay: '0.4s' }}></div>
          <div className="absolute bottom-24 left-20 w-9 h-9 bg-primary animate-bounce opacity-65" style={{ animationDuration: '4.1s', animationDelay: '1.1s' }}></div>
          <div className="absolute top-1/2 left-1/4 w-5 h-5 bg-primary rounded-full animate-bounce opacity-60" style={{ animationDuration: '2.7s', animationDelay: '0.9s' }}></div>
          <div className="absolute bottom-1/3 right-1/4 w-6 h-6 bg-primary animate-bounce opacity-75" style={{ animationDuration: '3.8s', animationDelay: '1.5s' }}></div>
        </div>
        <div className="max-w-6xl mx-auto text-center relative z-10">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-primary mb-12">
            Try LinkZup Today
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 mb-12">
            <div className="bg-gradient-to-br from-primary/5 to-primary/10 rounded-3xl p-6 sm:p-8 border border-primary/20">
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">LinkedIn is the #1 platform for professionals.</h3>
              <ul className="space-y-3 sm:space-y-4 text-left">
                <li className="flex items-start space-x-3 sm:space-x-4">
                  <div className="w-5 h-5 sm:w-6 sm:h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                  </div>
                  <span className="text-muted-foreground text-base sm:text-lg">Organic reach on LinkedIn is 10x higher than other platforms</span>
                </li>
                <li className="flex items-start space-x-3 sm:space-x-4">
                  <div className="w-5 h-5 sm:w-6 sm:h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                  </div>
                  <span className="text-muted-foreground text-base sm:text-lg">CXOs & founders are shifting to personal brand-led growth</span>
                </li>
                <li className="flex items-start space-x-3 sm:space-x-4">
                  <div className="w-5 h-5 sm:w-6 sm:h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                  </div>
                  <span className="text-muted-foreground text-base sm:text-lg">Early movers in LinkedIn management will dominate</span>
                </li>
              </ul>
            </div>
            <div className="bg-gradient-to-br from-primary/5 to-primary/10 rounded-3xl p-6 sm:p-8 border border-primary/20">
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">What Our Portal Provides</h3>
              <div className="grid grid-cols-1 gap-4 sm:gap-6">
                <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-lg">
                  <div className="text-3xl sm:text-4xl font-bold text-primary mb-2">24/7</div>
                  <div className="text-sm sm:text-base text-muted-foreground">AI-powered content creation and scheduling</div>
                </div>
                <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-lg">
                  <div className="text-3xl sm:text-4xl font-bold text-primary mb-2">500+</div>
                  <div className="text-sm sm:text-base text-muted-foreground">pre-built templates and carousel designs</div>
                </div>
                <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-lg">
                  <div className="text-3xl sm:text-4xl font-bold text-primary mb-2">10x</div>
                  <div className="text-sm sm:text-base text-muted-foreground">faster content creation with AI assistance</div>
                </div>
              </div>
            </div>
          </div>
          
        </div>
      </section>

      {/* About Founder Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Floating shapes for About Founder section */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          <div className="absolute top-12 left-16 w-8 h-8 bg-primary rounded-full animate-bounce opacity-60" style={{ animationDuration: '3.7s', animationDelay: '0.3s' }}></div>
          <div className="absolute bottom-16 right-12 w-6 h-6 bg-primary animate-bounce opacity-70" style={{ animationDuration: '2.9s', animationDelay: '1.2s' }}></div>
          <div className="absolute top-1/3 right-1/3 w-7 h-7 bg-primary rounded-full animate-bounce opacity-65" style={{ animationDuration: '4.3s', animationDelay: '0.7s' }}></div>
        </div>
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-primary mb-6">
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

      {/* LinkedIn Software Features Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Floating shapes for LinkedIn Software Features section */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          <div className="absolute top-24 left-8 w-9 h-9 bg-primary rounded-full animate-bounce opacity-65" style={{ animationDuration: '3.4s', animationDelay: '0.6s' }}></div>
          <div className="absolute bottom-20 right-20 w-5 h-5 bg-primary animate-bounce opacity-70" style={{ animationDuration: '2.6s', animationDelay: '1.4s' }}></div>
          <div className="absolute top-1/2 left-1/4 w-7 h-7 bg-primary rounded-full animate-bounce opacity-60" style={{ animationDuration: '4.0s', animationDelay: '0.2s' }}></div>
          <div className="absolute bottom-1/3 right-1/3 w-6 h-6 bg-primary animate-bounce opacity-75" style={{ animationDuration: '3.3s', animationDelay: '1.0s' }}></div>
        </div>
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-primary mb-6">
              LinkZup Software: Your Complete LinkedIn Solution
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Our AI-powered platform automates every aspect of your LinkedIn presence, from profile optimization to content creation and engagement.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-center mb-16">
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-6">LinkedIn Growth Portal</h3>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-6 h-6 text-green-500 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-gray-900">AI Content Engine</h4>
                    <p className="text-muted-foreground">Generate viral LinkedIn posts, carousels, and articles that drive engagement and leads</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-6 h-6 text-green-500 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-gray-900">Smart Posting Schedule</h4>
                    <p className="text-muted-foreground">Automatically schedule content at optimal times for maximum reach and engagement</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-6 h-6 text-green-500 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-gray-900">Lead Generation Hub</h4>
                    <p className="text-muted-foreground">Connect with prospects, send personalized messages, and track conversion metrics</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="rounded-2xl overflow-hidden shadow-2xl border-4 border-white">
                <img 
                  src="/linkedin_image.webp" 
                  alt="LinkedIn Profile Optimization" 
                  className="w-full h-auto"
                />
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-center mb-16">
            <div className="order-2 lg:order-1">
              <div className="relative">
                <div className="rounded-2xl overflow-hidden shadow-2xl border-4 border-white">
                  <img 
                    src="/ailinkedin.png" 
                    alt="LinkedIn Content Creation" 
                    className="w-full h-auto"
                  />
                </div>
              </div>
            </div>
            <div className="order-1 lg:order-2">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Automated Content Creation</h3>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-6 h-6 text-green-500 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-gray-900">AI Content Generator</h4>
                    <p className="text-muted-foreground">Creates engaging posts based on your industry and expertise</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-6 h-6 text-green-500 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-gray-900">Smart Scheduling</h4>
                    <p className="text-muted-foreground">Posts at optimal times for maximum engagement</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-6 h-6 text-green-500 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-gray-900">Content Calendar</h4>
                    <p className="text-muted-foreground">Plans your content strategy weeks in advance</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative border-t border-border py-8 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Floating shapes for Footer section */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          <div className="absolute top-8 left-12 w-6 h-6 bg-primary rounded-full animate-bounce opacity-60" style={{ animationDuration: '3.1s', animationDelay: '0.5s' }}></div>
          <div className="absolute bottom-8 right-16 w-8 h-8 bg-primary animate-bounce opacity-70" style={{ animationDuration: '2.8s', animationDelay: '1.3s' }}></div>
          <div className="absolute top-1/2 right-1/4 w-5 h-5 bg-primary rounded-full animate-bounce opacity-65" style={{ animationDuration: '3.9s', animationDelay: '0.8s' }}></div>
        </div>
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
            <div className="space-y-3">
              <Link href="/" className="flex items-center space-x-2">
                <Logo size="4xl" />
              </Link>
              <p className="text-gray-600">
                Transform your professional identity with AI-powered personal branding.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-primary mb-4">Company</h3>
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
              <h3 className="font-semibold text-primary mb-4">Services</h3>
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
              <h3 className="font-semibold text-primary mb-4">Resources</h3>
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