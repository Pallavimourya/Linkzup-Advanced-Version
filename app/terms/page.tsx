import type React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, FileText, Scale, Users, Shield, AlertTriangle, CheckCircle } from "lucide-react"
import Link from "next/link"

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-card to-muted">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center text-muted-foreground hover:text-foreground mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Link>
          
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
              <FileText className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Terms of Service</h1>
              <p className="text-muted-foreground">Last updated: {new Date().toLocaleDateString()}</p>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto space-y-8">
          {/* Introduction */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Scale className="w-5 h-5" />
                Agreement to Terms
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                These Terms of Service ("Terms") govern your use of LinkzUp, an AI-powered LinkedIn content management platform 
                operated by LinkzUp ("we," "us," or "our"). By accessing or using our service, you agree to be bound by these Terms.
              </p>
              <p>
                If you disagree with any part of these terms, then you may not access our service. These Terms apply to all visitors, 
                users, and others who access or use the service.
              </p>
            </CardContent>
          </Card>

          {/* Service Description */}
          <Card>
            <CardHeader>
              <CardTitle>Service Description</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                LinkzUp provides an AI-powered platform that helps users create, manage, and schedule LinkedIn content. Our services include:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>AI-powered content generation for LinkedIn posts</li>
                <li>Content scheduling and automation</li>
                <li>LinkedIn account integration and management</li>
                <li>Analytics and performance tracking</li>
                <li>Content templates and customization tools</li>
                <li>Team collaboration features</li>
              </ul>
            </CardContent>
          </Card>

          {/* User Accounts */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                User Accounts
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                When you create an account with us, you must provide accurate, complete, and current information. You are responsible for:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>Maintaining the security of your account and password</li>
                <li>All activities that occur under your account</li>
                <li>Notifying us immediately of any unauthorized use</li>
                <li>Ensuring your account information is up to date</li>
              </ul>
              <p>
                You must be at least 18 years old to create an account. If you are under 18, you may only use our service with parental consent.
              </p>
            </CardContent>
          </Card>

          {/* Acceptable Use */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                Acceptable Use Policy
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>You agree to use our service only for lawful purposes and in accordance with these Terms. You agree not to:</p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>Use the service for any illegal or unauthorized purpose</li>
                <li>Violate any applicable laws or regulations</li>
                <li>Infringe upon the rights of others</li>
                <li>Upload or transmit harmful, offensive, or inappropriate content</li>
                <li>Attempt to gain unauthorized access to our systems</li>
                <li>Interfere with or disrupt the service</li>
                <li>Use automated systems to access the service</li>
                <li>Share your account credentials with others</li>
              </ul>
            </CardContent>
          </Card>

          {/* Content and Intellectual Property */}
          <Card>
            <CardHeader>
              <CardTitle>Content and Intellectual Property</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Your Content</h3>
                <p className="text-muted-foreground mb-2">
                  You retain ownership of content you create and upload to our platform. By using our service, you grant us a limited license to:
                </p>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  <li>Process and store your content to provide our services</li>
                  <li>Use your content to improve our AI algorithms</li>
                  <li>Display your content as part of the service</li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-semibold mb-2">Our Intellectual Property</h3>
                <p className="text-muted-foreground mb-2">
                  Our platform, including its original content, features, and functionality, is owned by LinkzUp and protected by copyright, 
                  trademark, and other intellectual property laws.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Payment Terms */}
          <Card>
            <CardHeader>
              <CardTitle>Payment and Subscription Terms</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Pricing and Billing</h3>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                  <li>We offer various subscription plans with different features and pricing</li>
                  <li>Prices are subject to change with 30 days notice</li>
                  <li>Billing occurs on a recurring basis (monthly or annually)</li>
                  <li>All payments are processed securely through our payment providers</li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-semibold mb-2">Refunds and Cancellations</h3>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                  <li>You may cancel your subscription at any time</li>
                  <li>Refunds are provided according to our refund policy</li>
                  <li>No refunds for partial months of service</li>
                  <li>Unused credits may be forfeited upon cancellation</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Privacy and Data */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Privacy and Data Protection
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                Your privacy is important to us. Our collection and use of personal information is governed by our Privacy Policy, 
                which is incorporated into these Terms by reference.
              </p>
              <p>
                By using our service, you consent to the collection and use of your information as described in our Privacy Policy.
              </p>
            </CardContent>
          </Card>

          {/* Service Availability */}
          <Card>
            <CardHeader>
              <CardTitle>Service Availability and Support</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Service Uptime</h3>
                <p className="text-muted-foreground">
                  We strive to maintain high service availability but cannot guarantee uninterrupted access. We may perform maintenance 
                  that temporarily affects service availability.
                </p>
              </div>
              
              <div>
                <h3 className="font-semibold mb-2">Support</h3>
                <p className="text-muted-foreground">
                  We provide customer support through email and our help center. Response times may vary based on support tier and issue complexity.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Limitations of Liability */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                Limitations of Liability
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                To the maximum extent permitted by law, LinkzUp shall not be liable for any indirect, incidental, special, 
                consequential, or punitive damages, including but not limited to:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>Loss of profits, data, or business opportunities</li>
                <li>Service interruptions or downtime</li>
                <li>Content accuracy or completeness</li>
                <li>Third-party actions or content</li>
                <li>Security breaches or data loss</li>
              </ul>
              <p>
                Our total liability to you for any claims arising from these Terms shall not exceed the amount you paid us in the 12 months preceding the claim.
              </p>
            </CardContent>
          </Card>

          {/* Indemnification */}
          <Card>
            <CardHeader>
              <CardTitle>Indemnification</CardTitle>
            </CardHeader>
            <CardContent>
              <p>
                You agree to indemnify and hold harmless LinkzUp and its officers, directors, employees, and agents from any claims, 
                damages, losses, or expenses arising from your use of the service or violation of these Terms.
              </p>
            </CardContent>
          </Card>

          {/* Termination */}
          <Card>
            <CardHeader>
              <CardTitle>Termination</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>We may terminate or suspend your account and access to our service immediately, without prior notice, for conduct that we believe violates these Terms or is harmful to other users, us, or third parties.</p>
              <p>Upon termination, your right to use the service will cease immediately, and we may delete your account and data.</p>
            </CardContent>
          </Card>

          {/* Governing Law */}
          <Card>
            <CardHeader>
              <CardTitle>Governing Law and Dispute Resolution</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                These Terms shall be governed by and construed in accordance with the laws of [Your Jurisdiction], without regard to its conflict of law provisions.
              </p>
              <p>
                Any disputes arising from these Terms or your use of our service shall be resolved through binding arbitration in accordance with the rules of [Arbitration Organization].
              </p>
            </CardContent>
          </Card>

          {/* Changes to Terms */}
          <Card>
            <CardHeader>
              <CardTitle>Changes to Terms</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                We reserve the right to modify these Terms at any time. We will notify you of any changes by:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>Posting the new Terms on this page</li>
                <li>Sending you an email notification</li>
                <li>Displaying a notice on our platform</li>
              </ul>
              <p>
                Your continued use of our service after any changes constitutes acceptance of the updated Terms.
              </p>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                If you have any questions about these Terms of Service, please contact us:
              </p>
              <div className="space-y-2 text-muted-foreground">
                <p><strong>Email:</strong> legal@linkzup.in</p>
                <p><strong>Address:</strong> [Your Business Address]</p>
                <p><strong>Support:</strong> support@linkzup.in</p>
              </div>
            </CardContent>
          </Card>

          {/* Footer */}
          <div className="text-center py-8">
            <Link href="/privacy">
              <Button variant="outline" className="mr-4">
                Privacy Policy
              </Button>
            </Link>
            <Link href="/">
              <Button>
                Back to LinkzUp
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
