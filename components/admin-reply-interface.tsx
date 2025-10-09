"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog'
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select'
import { 
  Mail, 
  MessageSquare, 
  Send, 
  Clock, 
  CheckCircle, 
  XCircle,
  History,
  User
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface ReplyInterfaceProps {
  submission: {
    _id: string
    firstName: string
    lastName: string
    email: string
    phone?: string
    message: string
    service?: string
    replies?: Array<{
      id: string
      message: string
      type: 'email'
      replyTo: string
      sentAt: string
      sentBy: string
      status: 'sent' | 'failed' | 'pending'
    }>
    replyCount?: number
    lastRepliedAt?: string
  }
  onReplySent?: () => void
}

export function AdminReplyInterface({ submission, onReplySent }: ReplyInterfaceProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [replyMessage, setReplyMessage] = useState('')
  const [replyType, setReplyType] = useState<'email'>('email')
  const [isSending, setIsSending] = useState(false)
  const [showReplies, setShowReplies] = useState(false)
  const { toast } = useToast()

  const handleSendReply = async () => {
    if (!replyMessage.trim()) {
      toast({
        title: "Error",
        description: "Please enter a reply message",
        variant: "destructive",
      })
      return
    }


    setIsSending(true)

    try {
      const response = await fetch(`/api/admin/contact-submissions/${submission._id}/reply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: replyMessage.trim(),
          type: replyType,
          replyTo: replyType === 'email' ? submission.email : submission.phone
        }),
      })

      const result = await response.json()

      if (response.ok && result.success) {
        toast({
          title: "Reply sent successfully!",
          description: `Reply sent via ${replyType} to ${replyType === 'email' ? submission.email : submission.phone}`,
        })
        
        setReplyMessage('')
        setIsOpen(false)
        onReplySent?.()
      } else {
        toast({
          title: "Failed to send reply",
          description: result.error || "An error occurred while sending the reply",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error('Error sending reply:', error)
      toast({
        title: "Error",
        description: "Failed to send reply. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSending(false)
    }
  }

  const getReplyStatusIcon = (status: string) => {
    switch (status) {
      case 'sent':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-600" />
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-600" />
      default:
        return <Clock className="h-4 w-4 text-gray-600" />
    }
  }

  const getReplyStatusColor = (status: string) => {
    switch (status) {
      case 'sent':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      case 'failed':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
    }
  }

  return (
    <div className="space-y-4">
      {/* Reply Button */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button className="w-full">
            <MessageSquare className="h-4 w-4 mr-2" />
            Reply to {submission.firstName}
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto w-[95vw] sm:w-full">
          <DialogHeader>
            <DialogTitle>Reply to {submission.firstName} {submission.lastName}</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Contact Info */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-2 text-sm">
                  <div className="flex items-center space-x-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">Email:</span>
                  </div>
                  <span className="text-muted-foreground break-all">{submission.email}</span>
                </div>
                {submission.phone && (
                  <div className="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-2 text-sm">
                    <div className="flex items-center space-x-2">
                      <MessageSquare className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">Phone:</span>
                    </div>
                    <span className="text-muted-foreground">{submission.phone}</span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Original Message */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Original Enquiry</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {submission.message}
                </p>
              </CardContent>
            </Card>

            {/* Reply Type Selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Reply Method</label>
              <div className="flex items-center gap-2 p-3 border rounded-md bg-gray-50 dark:bg-gray-800">
                <Mail className="h-4 w-4 text-teal-600" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Email ({submission.email})</span>
              </div>
            </div>

            {/* Reply Message */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Reply Message</label>
              <Textarea
                placeholder="Type your reply message here..."
                value={replyMessage}
                onChange={(e) => setReplyMessage(e.target.value)}
                rows={6}
                className="resize-none"
              />
              <p className="text-xs text-muted-foreground">
                {replyMessage.length} characters
              </p>
            </div>

            {/* Send Button */}
            <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-2">
              <Button 
                variant="outline" 
                onClick={() => setIsOpen(false)}
                className="w-full sm:w-auto"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleSendReply} 
                disabled={isSending || !replyMessage.trim()}
                className="w-full sm:w-auto min-w-[120px]"
              >
                {isSending ? (
                  <>
                    <Clock className="h-4 w-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Send Reply
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Reply History */}
      {submission.replies && submission.replies.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm flex items-center space-x-2">
                <History className="h-4 w-4" />
                <span>Reply History ({submission.replyCount || 0})</span>
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowReplies(!showReplies)}
              >
                {showReplies ? 'Hide' : 'Show'} History
              </Button>
            </div>
          </CardHeader>
          
          {showReplies && (
            <CardContent className="space-y-3">
              {submission.replies.map((reply, index) => (
                <div key={reply.id || index} className="border rounded-lg p-4 space-y-2">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <div className="flex items-center space-x-2">
                      <Mail className="h-4 w-4 text-blue-600" />
                      <span className="text-sm font-medium">
                        Email to {reply.replyTo}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className={`${getReplyStatusColor(reply.status)} flex items-center space-x-1 w-fit`}>
                        {getReplyStatusIcon(reply.status)}
                        <span className="capitalize">{reply.status}</span>
                      </Badge>
                    </div>
                  </div>
                  
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {reply.message}
                  </p>
                  
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between text-xs text-muted-foreground gap-1">
                    <span>Sent by: {reply.sentBy}</span>
                    <span>{new Date(reply.sentAt).toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </CardContent>
          )}
        </Card>
      )}
    </div>
  )
}
