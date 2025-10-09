"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { 
  FileText, 
  Plus, 
  Edit, 
  Trash2, 
  Copy,
  Mail,
  MessageSquare,
  Calendar,
  CheckCircle,
  Clock
} from "lucide-react"
import { toast } from "sonner"

interface MessageTemplate {
  _id: string
  name: string
  subject: string
  content: string
  type: 'email'
  userType: 'trial' | 'active' | 'pending' | 'all'
  category: string
  isDefault: boolean
  createdAt: string
}

interface MessageTemplatesProps {
  onSelectTemplate: (template: MessageTemplate) => void
}

const defaultTemplates: MessageTemplate[] = [
  {
    _id: 'trial-welcome',
    name: 'Trial Welcome Message',
    subject: 'Welcome to Linkzup - Your 2-Day Free Trial Started!',
    content: `Hi {{name}},

Welcome to Linkzup! 🎉

Your 2-day free trial has started and you now have 10 credits to explore all our features:

✨ AI-powered content generation
📱 Direct LinkedIn posting
🖼️ Image generation
📊 Advanced analytics
⏰ Post scheduling

Make the most of your trial period and experience the power of AI-driven content creation.

Need help? Our support team is here for you!

Best regards,
The Linkzup Team`,
    type: 'email',
    userType: 'trial',
    category: 'Welcome',
    isDefault: true,
    createdAt: new Date().toISOString()
  },
  {
    _id: 'trial-ending',
    name: 'Trial Ending Reminder',
    subject: 'Your Linkzup Trial Ends Soon - Don\'t Miss Out!',
    content: `Hi {{name}},

Your 2-day free trial is ending soon! ⏰

You've experienced the power of AI-driven content creation. Don't let your momentum stop here!

Choose from our affordable plans:
• Basic Plan: ₹299/month - 10 credits
• Professional Plan: ₹599/month - 25 credits  
• Enterprise Plan: ₹999/month - 50 credits

Continue creating amazing content and grow your LinkedIn presence.

Upgrade now and keep the momentum going!

Best regards,
The Linkzup Team`,
    type: 'email',
    userType: 'trial',
    category: 'Retention',
    isDefault: true,
    createdAt: new Date().toISOString()
  },
  {
    _id: 'subscription-activation',
    name: 'Subscription Activation',
    subject: 'Welcome to Linkzup Premium - Your Subscription is Active!',
    content: `Hi {{name}},

Congratulations! 🎉 Your Linkzup subscription is now active.

You now have access to:
✅ Monthly credit allocation
✅ Priority support
✅ Advanced analytics
✅ Unlimited post scheduling
✅ Custom templates

Your credits will reset monthly, so you can keep creating amazing content all year round.

Need help getting started? Check out our help center or contact support.

Happy creating!

Best regards,
The Linkzup Team`,
    type: 'email',
    userType: 'active',
    category: 'Welcome',
    isDefault: true,
    createdAt: new Date().toISOString()
  },
  {
    _id: 'subscription-renewal',
    name: 'Subscription Renewal Reminder',
    subject: 'Your Linkzup Subscription is Renewing Soon',
    content: `Hi {{name}},

Your Linkzup subscription will renew automatically in a few days.

Current plan: {{plan}}
Next billing date: {{nextBillingDate}}
Amount: ₹{{amount}}

Your subscription will continue seamlessly, and your credits will reset for another month of amazing content creation.

No action needed - we'll handle everything for you!

Best regards,
The Linkzup Team`,
    type: 'email',
    userType: 'active',
    category: 'Billing',
    isDefault: true,
    createdAt: new Date().toISOString()
  },
  {
    _id: 'pending-activation',
    name: 'Pending Subscription Activation',
    subject: 'Complete Your Linkzup Setup - Subscription Pending',
    content: `Hi {{name}},

We noticed your Linkzup subscription is still pending activation.

To continue using all features and avoid any interruption in your content creation workflow, please complete your subscription setup.

Choose from our plans:
• Basic Plan: ₹299/month
• Professional Plan: ₹599/month
• Enterprise Plan: ₹999/month

Need help? Our support team is ready to assist you.

Best regards,
The Linkzup Team`,
    type: 'email',
    userType: 'pending',
    category: 'Activation',
    isDefault: true,
    createdAt: new Date().toISOString()
  },
]

export default function MessageTemplates({ onSelectTemplate }: MessageTemplatesProps) {
  const [templates, setTemplates] = useState<MessageTemplate[]>(defaultTemplates)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')

  const categories = ['all', 'Welcome', 'Retention', 'Billing', 'Activation']

  const filteredTemplates = templates.filter(template => 
    selectedCategory === 'all' || template.category === selectedCategory
  )

  const handleSelectTemplate = (template: MessageTemplate) => {
    onSelectTemplate(template)
    toast.success(`Template "${template.name}" selected`)
  }

  const handleCopyTemplate = (template: MessageTemplate) => {
    navigator.clipboard.writeText(template.content)
    toast.success("Template content copied to clipboard")
  }

  const getTypeIcon = (type: string) => {
    return type === 'email' ? <Mail className="h-4 w-4" /> : <MessageSquare className="h-4 w-4" />
  }

  const getTypeColor = (type: string) => {
    return type === 'email' ? "text-blue-600" : "text-green-600"
  }

  const getUserTypeBadge = (userType: string) => {
    const colors = {
      trial: "bg-blue-100 text-blue-700",
      active: "bg-green-100 text-green-700", 
      pending: "bg-orange-100 text-orange-700",
      all: "bg-gray-100 text-gray-700"
    }
    
    const icons = {
      trial: <Calendar className="h-3 w-3 mr-1" />,
      active: <CheckCircle className="h-3 w-3 mr-1" />,
      pending: <Clock className="h-3 w-3 mr-1" />,
      all: <FileText className="h-3 w-3 mr-1" />
    }

    return (
      <Badge className={colors[userType as keyof typeof colors]}>
        {icons[userType as keyof typeof icons]}
        {userType}
      </Badge>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Message Templates
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Category Filter */}
        <div className="flex flex-wrap gap-2 mb-6">
          {categories.map(category => (
            <Button
              key={category}
              variant={selectedCategory === category ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(category)}
              className="capitalize"
            >
              {category}
            </Button>
          ))}
        </div>

        {/* Templates Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredTemplates.map(template => (
            <div
              key={template._id}
              className="border-2 border-gray-300 dark:border-gray-600 rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">
                    {template.name}
                  </h3>
                  <div className="flex items-center gap-2 mb-2">
                    <div className={`p-1 rounded ${template.type === 'email' ? 'bg-blue-100 dark:bg-blue-900' : 'bg-green-100 dark:bg-green-900'}`}>
                      {getTypeIcon(template.type)}
                    </div>
                    {getUserTypeBadge(template.userType)}
                    <Badge variant="secondary" className="text-xs">
                      {template.category}
                    </Badge>
                  </div>
                </div>
                {template.isDefault && (
                  <Badge variant="outline" className="text-xs">
                    Default
                  </Badge>
                )}
              </div>

              {template.subject && (
                <div className="mb-2">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Subject:</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-1">{template.subject}</p>
                </div>
              )}

              <div className="mb-4">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Content:</p>
                <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3">
                  {template.content}
                </p>
              </div>

              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={() => handleSelectTemplate(template)}
                  className="flex-1"
                >
                  <Copy className="h-3 w-3 mr-1" />
                  Use Template
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleCopyTemplate(template)}
                >
                  <Copy className="h-3 w-3" />
                </Button>
              </div>
            </div>
          ))}
        </div>

        {filteredTemplates.length === 0 && (
          <div className="text-center py-8">
            <FileText className="h-12 w-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-400 mb-2">No templates found</h3>
            <p className="text-gray-500 dark:text-gray-400">Try selecting a different category</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
