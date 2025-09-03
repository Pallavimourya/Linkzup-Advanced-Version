import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, CheckCircle, Award, Calendar, BarChart3, MessageSquare, Star, Rocket } from "lucide-react"
import Link from "next/link"
import { Logo } from "@/components/logo"
import { MainNavbar } from "@/components/main-navbar"

async function getActivePlans() {
  // No caching so admin changes reflect immediately
  const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || ""}/api/plans`, { cache: "no-store" })
  if (!res.ok) return { subscriptionPlans: [], creditPlans: [] }
  return res.json()
}

export default async function PlansPage() {
  const { subscriptionPlans, creditPlans } = await getActivePlans()
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-card to-muted">
      {/* Navigation */}
      <MainNavbar />

      {/* Hero Section */}
      <section className="px-2 sm:px-2 lg:px-4">
        <div className="max-w-7xl mx-auto text-center">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6 leading-tight">
              Choose Your <span className="text-primary">LinkedIn Growth</span> Plan
            </h1>
            <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
              From basic profile optimization to complete LinkedIn domination, we have the perfect plan for your
              business goals.
            </p>
          </div>
        </div>
      </section>

      {/* Dynamic Software Plans (auto-sync with Admin) */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-card/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-2">App Subscription Plans</h2>
            <p className="text-muted-foreground">These plans power your credits and in-app features</p>
          </div>
          <div className="grid lg:grid-cols-3 gap-8">
            {subscriptionPlans.length === 0 && (
              <div className="col-span-3 text-center text-muted-foreground">No subscription plans available.</div>
            )}
            {subscriptionPlans.map((plan: any) => (
              <Card
                key={plan._id}
                className={`relative ${plan.popular ? "border-blue-200 bg-blue-50/50" : ""} ${plan.recommended ? "border-purple-200 bg-purple-50/50" : ""}`}
              >
                {plan.popular && (
                  <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-blue-600 text-white">
                      <Star className="h-3 w-3 mr-1" />
                      Popular
                    </Badge>
                  </div>
                )}
                {plan.recommended && (
                  <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-purple-600 text-white">
                      <Rocket className="h-3 w-3 mr-1" />
                      Recommended
                    </Badge>
                  </div>
                )}
                <CardHeader className="text-center">
                  <CardTitle className="text-2xl">{plan.name}</CardTitle>
                  <CardDescription className="text-lg">Perfect for getting more credits and features</CardDescription>
                  <div className="mt-6">
                    <span className="text-4xl font-bold text-foreground">₹{plan.price}</span>
                    <span className="text-muted-foreground">/{plan.interval || "monthly"}</span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ul className="space-y-3">
                    <li className="flex items-start space-x-3">
                      <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                      <span className="text-muted-foreground">{plan.credits} monthly credits</span>
                    </li>
                    {(plan.features || []).map((f: string, idx: number) => (
                      <li key={idx} className="flex items-start space-x-3">
                        <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                        <span className="text-muted-foreground">{f}</span>
                      </li>
                    ))}
                  </ul>
                  <Link href="/dashboard/billing" className="block">
                    <Button className="w-full">Subscribe</Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Credit Packs */}
          <div className="text-center mt-20 mb-10">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-2">Credit Packs</h2>
            <p className="text-muted-foreground">One-time packs to top-up your credits</p>
          </div>
          <div className="grid lg:grid-cols-3 gap-8">
            {creditPlans.length === 0 && (
              <div className="col-span-3 text-center text-muted-foreground">No credit packs available.</div>
            )}
            {creditPlans.map((plan: any) => (
              <Card key={plan._id} className={`relative ${plan.popular ? "border-blue-200 bg-blue-50/50" : ""}`}>
                {plan.popular && (
                  <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-blue-600 text-white">Popular</Badge>
                  </div>
                )}
                <CardHeader className="text-center">
                  <CardTitle className="text-2xl">{plan.name}</CardTitle>
                  <CardDescription className="text-lg">One-time purchase</CardDescription>
                  <div className="mt-6">
                    <span className="text-4xl font-bold text-foreground">₹{plan.price}</span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ul className="space-y-3">
                    <li className="flex items-start space-x-3">
                      <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                      <span className="text-muted-foreground">{plan.credits} credits</span>
                    </li>
                    {(plan.features || []).map((f: string, idx: number) => (
                      <li key={idx} className="flex items-start space-x-3">
                        <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                        <span className="text-muted-foreground">{f}</span>
                      </li>
                    ))}
                  </ul>
                  <Link href="/dashboard/billing" className="block">
                    <Button className="w-full bg-transparent" variant="outline">
                      Buy Credits
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

       {/* Features Comparison Section */}
       <section className="py-20 px-4 sm:px-6 lg:px-8 bg-card/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">What's Included in Each Plan</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Detailed breakdown of features and services included in each package
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="border-border hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <Award className="w-6 h-6 text-primary" />
                </div>
                <CardTitle>Profile Optimization</CardTitle>
                <CardDescription>Complete profile makeover with professional design</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Professional Headshot</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Banner Design</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Compelling Headline</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>About Section</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Featured Section</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-border hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <Calendar className="w-6 h-6 text-primary" />
                </div>
                <CardTitle>Content Creation</CardTitle>
                <CardDescription>Engaging posts that drive engagement and leads</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>AI-Powered Content</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Industry Research</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Trending Topics</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Optimal Posting Times</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Engagement Captions</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-border hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <MessageSquare className="w-6 h-6 text-primary" />
                </div>
                <CardTitle>Engagement & DMs</CardTitle>
                <CardDescription>Active networking and lead generation</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Daily Comments</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Strategic Connections</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Personalized DMs</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Lead Nurturing</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Response Management</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-border hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <BarChart3 className="w-6 h-6 text-primary" />
                </div>
                <CardTitle>Analytics & Support</CardTitle>
                <CardDescription>Data-driven insights and expert support</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Performance Reports</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Growth Tracking</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Strategy Calls</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Account Manager</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Priority Support</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Results Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-8">Expected Results</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="space-y-4">
              <div className="text-3xl font-bold text-primary">3-5x</div>
              <div className="text-lg font-semibold text-foreground">Engagement Increase</div>
              <div className="text-muted-foreground">Within 30 days of starting</div>
            </div>
            <div className="space-y-4">
              <div className="text-3xl font-bold text-primary">5-10x</div>
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

      {/* FAQ Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-card/30">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Frequently Asked Questions</h2>
            <p className="text-xl text-muted-foreground">Everything you need to know about our plans</p>
          </div>

          <div className="space-y-8">
            <Card className="border-border">
              <CardHeader>
                <CardTitle>Can I upgrade or downgrade my plan anytime?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Yes, you can modify your plan at any time. Changes will be reflected in your next billing cycle. We
                  recommend discussing changes with your account manager to ensure smooth transition.
                </p>
              </CardContent>
            </Card>

            <Card className="border-border">
              <CardHeader>
                <CardTitle>What's included in the onboarding process?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Our onboarding includes initial strategy consultation, account setup, content planning, and training
                  on our processes. You'll have a dedicated account manager throughout the process.
                </p>
              </CardContent>
            </Card>

            <Card className="border-border">
              <CardHeader>
                <CardTitle>Do you offer custom packages for larger teams?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Absolutely! For teams and larger organizations, we offer custom enterprise packages with multiple
                  profiles, team training, and dedicated account management. Contact us for a custom quote.
                </p>
              </CardContent>
            </Card>

            <Card className="border-border">
              <CardHeader>
                <CardTitle>How quickly will I see results?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Most clients see increased engagement within 2-3 weeks and significant profile growth within 30-60
                  days. Results vary based on your industry, current profile status, and chosen plan.
                </p>
              </CardContent>
            </Card>
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
