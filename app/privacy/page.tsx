import type React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Shield, Eye, Lock, Database, Globe } from "lucide-react"
import Link from "next/link"

export default function PrivacyPolicyPage() {
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
              <Shield className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Privacy Policy</h1>
              <p className="text-muted-foreground">Last updated: {new Date().toLocaleDateString()}</p>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto space-y-8">
          {/* Introduction */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="w-5 h-5" />
                Introduction
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                At LinkzUp, we are committed to protecting your privacy and ensuring the security of your personal information. 
                This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our 
                AI-powered LinkedIn content management platform.
              </p>
              <p>
                By using LinkzUp, you agree to the collection and use of information in accordance with this policy. 
                If you do not agree with our policies and practices, please do not use our service.
              </p>
            </CardContent>
          </Card>

          {/* Information We Collect */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="w-5 h-5" />
                Information We Collect
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Personal Information</h3>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  <li>Name and email address</li>
                  <li>Profile picture and bio information</li>
                  <li>LinkedIn account credentials (when connected)</li>
                  <li>Payment information (processed securely through our payment providers)</li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-semibold mb-2">Usage Information</h3>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  <li>Content you create and post through our platform</li>
                  <li>Usage patterns and preferences</li>
                  <li>Device information and IP addresses</li>
                  <li>Analytics data to improve our services</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* How We Use Your Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="w-5 h-5" />
                How We Use Your Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>Provide and maintain our AI content generation services</li>
                <li>Process and schedule your LinkedIn posts</li>
                <li>Send you important updates and notifications</li>
                <li>Improve our AI algorithms and platform features</li>
                <li>Provide customer support and respond to inquiries</li>
                <li>Ensure platform security and prevent fraud</li>
                <li>Comply with legal obligations</li>
              </ul>
            </CardContent>
          </Card>

          {/* Data Security */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="w-5 h-5" />
                Data Security
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                We implement industry-standard security measures to protect your personal information:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>End-to-end encryption for data transmission</li>
                <li>Secure cloud storage with access controls</li>
                <li>Regular security audits and updates</li>
                <li>Limited access to personal data by authorized personnel only</li>
                <li>Secure authentication and session management</li>
              </ul>
            </CardContent>
          </Card>

          {/* Data Sharing */}
          <Card>
            <CardHeader>
              <CardTitle>Data Sharing and Disclosure</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                We do not sell, trade, or rent your personal information to third parties. We may share your information only in the following circumstances:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>With your explicit consent</li>
                <li>To comply with legal requirements or court orders</li>
                <li>To protect our rights, property, or safety</li>
                <li>With trusted service providers who assist in operating our platform</li>
                <li>In connection with a business transfer or merger</li>
              </ul>
            </CardContent>
          </Card>

          {/* Your Rights */}
          <Card>
            <CardHeader>
              <CardTitle>Your Privacy Rights</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>You have the following rights regarding your personal information:</p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li><strong>Access:</strong> Request a copy of your personal data</li>
                <li><strong>Correction:</strong> Update or correct inaccurate information</li>
                <li><strong>Deletion:</strong> Request deletion of your personal data</li>
                <li><strong>Portability:</strong> Export your data in a machine-readable format</li>
                <li><strong>Objection:</strong> Object to certain processing activities</li>
                <li><strong>Withdrawal:</strong> Withdraw consent at any time</li>
              </ul>
            </CardContent>
          </Card>

          {/* Cookies */}
          <Card>
            <CardHeader>
              <CardTitle>Cookies and Tracking</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                We use cookies and similar tracking technologies to enhance your experience on our platform:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li><strong>Essential cookies:</strong> Required for basic platform functionality</li>
                <li><strong>Analytics cookies:</strong> Help us understand how you use our platform</li>
                <li><strong>Preference cookies:</strong> Remember your settings and preferences</li>
                <li><strong>Security cookies:</strong> Help protect against fraud and abuse</li>
              </ul>
              <p>
                You can control cookie settings through your browser preferences, though disabling certain cookies may affect platform functionality.
              </p>
            </CardContent>
          </Card>

          {/* Third-Party Services */}
          <Card>
            <CardHeader>
              <CardTitle>Third-Party Services</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                Our platform integrates with third-party services, including:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>LinkedIn API for posting and content management</li>
                <li>Payment processors for billing and subscriptions</li>
                <li>Cloud storage providers for data hosting</li>
                <li>Analytics services for platform improvement</li>
              </ul>
              <p>
                These services have their own privacy policies, and we encourage you to review them.
              </p>
            </CardContent>
          </Card>

          {/* Children's Privacy */}
          <Card>
            <CardHeader>
              <CardTitle>Children's Privacy</CardTitle>
            </CardHeader>
            <CardContent>
              <p>
                Our platform is not intended for children under 13 years of age. We do not knowingly collect personal information from children under 13. 
                If you are a parent or guardian and believe your child has provided us with personal information, please contact us immediately.
              </p>
            </CardContent>
          </Card>

          {/* Changes to Policy */}
          <Card>
            <CardHeader>
              <CardTitle>Changes to This Privacy Policy</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                We may update this Privacy Policy from time to time. We will notify you of any changes by:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>Posting the new Privacy Policy on this page</li>
                <li>Sending you an email notification</li>
                <li>Displaying a notice on our platform</li>
              </ul>
              <p>
                Your continued use of our platform after any changes constitutes acceptance of the updated policy.
              </p>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle>Contact Us</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                If you have any questions about this Privacy Policy or our data practices, please contact us:
              </p>
              <div className="space-y-2 text-muted-foreground">
                <p><strong>Email:</strong> privacy@linkzup.in</p>
                <p><strong>Address:</strong> [Your Business Address]</p>
                <p><strong>Support:</strong> support@linkzup.in</p>
              </div>
            </CardContent>
          </Card>

          {/* Footer */}
          <div className="text-center py-8">
            <Link href="/terms">
              <Button variant="outline" className="mr-4">
                Terms of Service
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
