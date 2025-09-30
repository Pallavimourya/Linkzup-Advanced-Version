"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowRight, Mail, Linkedin, MessageCircle, Clock, MapPin, Phone, CheckCircle } from "lucide-react"
import Link from "next/link"
import { Logo } from "@/components/logo"
import { MainNavbar } from "@/components/main-navbar"
import { useState } from "react"
import { useToast } from "@/hooks/use-toast"

export default function ContactPage() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    service: '',
    message: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleServiceChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      service: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const result = await response.json()

      if (response.ok) {
        toast({
          title: "Message sent successfully!",
          description: "We'll get back to you within 24 hours.",
        })
        // Reset form
        setFormData({
          firstName: '',
          lastName: '',
          email: '',
          phone: '',
          service: '',
          message: ''
        })
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to send message. Please try again.",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-card to-muted">
      {/* Navigation */}
      <MainNavbar />

      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6 leading-tight">
              Transform Your <span className="text-primary">Digital Presence</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
              Ready to experience the magic of your online impact? We're here to help you succeed. Get in touch and let's discuss how we can transform your digital strategy.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="#contact-form">
                <Button size="lg" className="text-lg px-8 py-6">
                  Get Started <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Methods Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-card/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Choose Your Preferred Contact Method
            </h2>
            <p className="text-xl text-muted-foreground">
              We're here to help you succeed
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Email */}
            <Card className="border-border hover:shadow-lg transition-shadow">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Mail className="w-8 h-8 text-primary" />
                </div>
                <CardTitle>Email</CardTitle>
                <CardDescription>
                  Send us an email and we'll get back to you within 24 hours.
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <Link href="mailto:techzuperstudio@gmail.com">
                  <Button variant="outline" className="w-full">
                    Send Email
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* LinkedIn */}
            <Card className="border-border hover:shadow-lg transition-shadow">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Linkedin className="w-8 h-8 text-primary" />
                </div>
                <CardTitle>LinkedIn</CardTitle>
                <CardDescription>
                  Connect with us on LinkedIn for professional networking.
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <Link href="https://www.linkedin.com/in/zuperprashant/" target="_blank">
                  <Button variant="outline" className="w-full">
                    Connect on LinkedIn
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* WhatsApp */}
            <Card className="border-border hover:shadow-lg transition-shadow">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MessageCircle className="w-8 h-8 text-primary" />
                </div>
                <CardTitle>WhatsApp</CardTitle>
                <CardDescription>
                  Chat with us on WhatsApp for quick responses and support.
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <Link href="https://wa.me/917697624256" target="_blank">
                  <Button variant="outline" className="w-full">
                    Chat on WhatsApp
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Contact Form Section */}
      <section id="contact-form" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Send us a Message
            </h2>
            <p className="text-xl text-muted-foreground">
              Fill out the form below and we'll get back to you within 24 hours
            </p>
          </div>

          <Card className="border-border">
            <CardContent className="p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label htmlFor="firstName" className="text-sm font-medium text-foreground">
                      First Name *
                    </label>
                    <Input 
                      id="firstName" 
                      name="firstName"
                      placeholder="John" 
                      value={formData.firstName}
                      onChange={handleInputChange}
                      className="border-2 border-border focus:border-primary focus:ring-2 focus:ring-primary/20"
                      required 
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="lastName" className="text-sm font-medium text-foreground">
                      Last Name *
                    </label>
                    <Input 
                      id="lastName" 
                      name="lastName"
                      placeholder="Doe" 
                      value={formData.lastName}
                      onChange={handleInputChange}
                      className="border-2 border-border focus:border-primary focus:ring-2 focus:ring-primary/20"
                      required 
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium text-foreground">
                    Email Address *
                  </label>
                  <Input 
                    id="email" 
                    name="email"
                    type="email" 
                    placeholder="john@example.com" 
                    value={formData.email}
                    onChange={handleInputChange}
                    className="border-2 border-border focus:border-primary focus:ring-2 focus:ring-primary/20"
                    required 
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="phone" className="text-sm font-medium text-foreground">
                    Phone Number
                  </label>
                  <Input 
                    id="phone" 
                    name="phone"
                    placeholder="+91 9876543210" 
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="border-2 border-border focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="service" className="text-sm font-medium text-foreground">
                    Service Interest
                  </label>
                  <Select value={formData.service} onValueChange={handleServiceChange}>
                    <SelectTrigger className="border-2 border-border focus:border-primary focus:ring-2 focus:ring-primary/20">
                      <SelectValue placeholder="Select a service" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ai-content-generation">AI Content Generation</SelectItem>
                      <SelectItem value="linkedin-posting">LinkedIn Posting & Scheduling</SelectItem>
                      <SelectItem value="carousel-creation">AI Carousel Creation</SelectItem>
                      <SelectItem value="personal-story">Personal Story Integration</SelectItem>
                      <SelectItem value="content-optimization">Content Optimization</SelectItem>
                      <SelectItem value="analytics-insights">Analytics & Insights</SelectItem>
                      <SelectItem value="custom-features">Custom Features</SelectItem>
                      <SelectItem value="general-inquiry">General Inquiry</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label htmlFor="message" className="text-sm font-medium text-foreground">
                    Message *
                  </label>
                  <Textarea 
                    id="message" 
                    name="message"
                    placeholder="Tell us about your goals and how we can help you..." 
                    rows={6}
                    value={formData.message}
                    onChange={handleInputChange}
                    required 
                    className="border-2 border-border focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                </div>

                <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? "Sending..." : "Send Message"}
                </Button>
              </form>

              <p className="text-sm text-muted-foreground text-center mt-4">
                We'll respond to your inquiry within 24 hours during business days.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-card/30">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-xl text-muted-foreground">
              Quick answers to common questions
            </p>
          </div>

          <div className="space-y-8">
            <Card className="border-border">
              <CardHeader>
                <CardTitle>How quickly can you start working on my project?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  We typically begin new projects within 3-5 business days after onboarding. For urgent requests, we offer expedited setup within 24-48 hours.
                </p>
              </CardContent>
            </Card>

            <Card className="border-border">
              <CardHeader>
                <CardTitle>Do you offer custom packages?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Yes! While we have standard packages, we're happy to create custom solutions based on your specific needs and budget.
                </p>
              </CardContent>
            </Card>

            <Card className="border-border">
              <CardHeader>
                <CardTitle>What's included in the onboarding process?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Our onboarding includes strategy consultation, account setup, content planning, and training on our processes. You'll have a dedicated account manager throughout.
                </p>
              </CardContent>
            </Card>

            <Card className="border-border">
              <CardHeader>
                <CardTitle>Can I cancel or modify my service anytime?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Yes, our services are flexible. You can modify your package or cancel with 30 days notice. We believe in earning your business every month.
                </p>
              </CardContent>
            </Card>
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
