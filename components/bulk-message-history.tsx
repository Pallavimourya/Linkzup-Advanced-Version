"use client"

import { useState } from "react"
import useSWR from "swr"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { 
  History, 
  Mail, 
  MessageSquare, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Users,
  Eye,
  Calendar,
  User,
  Trash2
} from "lucide-react"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

interface BulkMessage {
  _id: string
  subject: string
  content: string
  type: 'email'
  userType: 'trial' | 'active' | 'pending'
  totalRecipients: number
  sentCount: number
  failedCount: number
  status: 'sending' | 'completed' | 'partial' | 'failed'
  createdAt: string
  results?: Array<{
    userId: string
    email: string
    mobile?: string
    status: 'success' | 'failed'
    error?: string
  }>
}

export default function BulkMessageHistory() {
  const [selectedMessage, setSelectedMessage] = useState<BulkMessage | null>(null)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  const [deletingMessage, setDeletingMessage] = useState<BulkMessage | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedMessages, setSelectedMessages] = useState<string[]>([])
  const [isBulkDeleting, setIsBulkDeleting] = useState(false)
  
  const { data, mutate, isLoading } = useSWR("/api/admin/bulk-communication/history", fetcher)

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-700"><CheckCircle className="h-3 w-3 mr-1" />Completed</Badge>
      case 'partial':
        return <Badge className="bg-yellow-100 text-yellow-700"><Clock className="h-3 w-3 mr-1" />Partial</Badge>
      case 'failed':
        return <Badge className="bg-red-100 text-red-700"><XCircle className="h-3 w-3 mr-1" />Failed</Badge>
      case 'sending':
        return <Badge className="bg-blue-100 text-blue-700"><Clock className="h-3 w-3 mr-1" />Sending</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const getTypeIcon = (type: string) => {
    return type === 'email' ? <Mail className="h-4 w-4" /> : <MessageSquare className="h-4 w-4" />
  }

  const getTypeColor = (type: string) => {
    return type === 'email' ? "text-blue-600" : "text-green-600"
  }

  const handleViewDetails = (message: BulkMessage) => {
    setSelectedMessage(message)
    setIsDetailsOpen(true)
  }

  const handleDeleteMessage = (message: BulkMessage) => {
    setDeletingMessage(message)
    setIsDeleteDialogOpen(true)
  }

  const confirmDeleteMessage = async () => {
    if (!deletingMessage) return

    try {
      const response = await fetch(`/api/admin/bulk-communication/history/${deletingMessage._id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        mutate() // Refresh the message list
        setIsDeleteDialogOpen(false)
        setDeletingMessage(null)
      } else {
        const error = await response.json()
        console.error("Failed to delete message:", error)
        alert(`Failed to delete message: ${error.error}`)
      }
    } catch (error) {
      console.error("Error deleting message:", error)
      alert("Failed to delete message. Please try again.")
    }
  }

  const handleSelectMessage = (messageId: string) => {
    setSelectedMessages(prev => 
      prev.includes(messageId) 
        ? prev.filter(id => id !== messageId)
        : [...prev, messageId]
    )
  }

  const handleSelectAllMessages = () => {
    if (!data?.messages) return
    
    if (selectedMessages.length === data.messages.length) {
      setSelectedMessages([])
    } else {
      setSelectedMessages(data.messages.map((msg: BulkMessage) => msg._id))
    }
  }

  const handleBulkDelete = async () => {
    if (selectedMessages.length === 0) return

    setIsBulkDeleting(true)
    try {
      const deletePromises = selectedMessages.map(messageId => 
        fetch(`/api/admin/bulk-communication/history/${messageId}`, {
          method: "DELETE",
        })
      )

      const results = await Promise.all(deletePromises)
      const failedDeletes = results.filter(result => !result.ok)

      if (failedDeletes.length === 0) {
        mutate() // Refresh the message list
        setSelectedMessages([])
        alert(`Successfully deleted ${selectedMessages.length} messages`)
      } else {
        alert(`Failed to delete ${failedDeletes.length} out of ${selectedMessages.length} messages`)
      }
    } catch (error) {
      console.error("Error bulk deleting messages:", error)
      alert("Failed to delete messages. Please try again.")
    } finally {
      setIsBulkDeleting(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <History className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
            <span className="truncate">Bulk Message History</span>
          </CardTitle>
          {data?.messages && data.messages.length > 0 && (
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleSelectAllMessages}
                className="w-full sm:w-auto text-xs sm:text-sm"
              >
                {selectedMessages.length === data.messages.length ? "Deselect All" : "Select All"}
              </Button>
              {selectedMessages.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleBulkDelete}
                  disabled={isBulkDeleting}
                  className="border-red-300 text-red-600 hover:bg-red-50 hover:border-red-500 w-full sm:w-auto text-xs sm:text-sm"
                >
                  {isBulkDeleting ? (
                    <>
                      <div className="animate-spin rounded-full h-3 w-3 sm:h-4 sm:w-4 border-2 border-red-600 border-t-transparent mr-1 sm:mr-2"></div>
                      <span className="hidden sm:inline">Deleting...</span>
                      <span className="sm:hidden">Deleting</span>
                    </>
                  ) : (
                    <>
                      <Trash2 className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                      <span className="hidden sm:inline">Delete Selected ({selectedMessages.length})</span>
                      <span className="sm:hidden">Delete ({selectedMessages.length})</span>
                    </>
                  )}
                </Button>
              )}
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-4 border-teal-600 border-t-transparent"></div>
          </div>
        ) : !data?.messages || data.messages.length === 0 ? (
          <div className="text-center py-8">
            <History className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">No messages sent yet</h3>
            <p className="text-gray-500">Your bulk communication history will appear here</p>
          </div>
        ) : (
          <div className="space-y-3 sm:space-y-4">
            {data.messages.map((message: BulkMessage) => (
              <div
                key={message._id}
                className={`border-2 rounded-lg p-3 sm:p-4 hover:shadow-md transition-shadow ${
                  selectedMessages.includes(message._id) 
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/20' 
                    : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <Checkbox
                      checked={selectedMessages.includes(message._id)}
                      onCheckedChange={() => handleSelectMessage(message._id)}
                      className="mt-1 border-2 border-gray-300 dark:border-gray-600 data-[state=checked]:border-teal-500 dark:data-[state=checked]:border-teal-400 flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                        <div className="flex items-start sm:items-center gap-3 mb-2">
                          <div className={`p-2 rounded-lg flex-shrink-0 ${message.type === 'email' ? 'bg-blue-100' : 'bg-green-100'}`}>
                            {getTypeIcon(message.type)}
                          </div>
                          <div className="min-w-0 flex-1">
                            <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-sm sm:text-base truncate">{message.subject}</h3>
                            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                              <span className="capitalize">{message.userType} users</span>
                              <span className="hidden sm:inline">•</span>
                              <span>{new Date(message.createdAt).toLocaleDateString()}</span>
                            </div>
                          </div>
                        </div>
                        
                        <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm mb-3 line-clamp-2">
                          {message.content}
                        </p>
                        
                        <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm">
                          <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                            <Users className="h-3 w-3 sm:h-4 sm:w-4 text-gray-400 dark:text-gray-500 flex-shrink-0" />
                            <span>{message.totalRecipients} recipients</span>
                          </div>
                          <div className="flex items-center gap-1 text-green-600 dark:text-green-400">
                            <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                            <span>{message.sentCount} sent</span>
                          </div>
                          {message.failedCount > 0 && (
                            <div className="flex items-center gap-1 text-red-600 dark:text-red-400">
                              <XCircle className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                              <span>{message.failedCount} failed</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-2">
                    <div className="flex justify-center sm:justify-end">
                      {getStatusBadge(message.status)}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewDetails(message)}
                        className="flex-1 sm:flex-none text-xs sm:text-sm"
                      >
                        <Eye className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                        <span className="hidden sm:inline">Details</span>
                        <span className="sm:hidden">View</span>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteMessage(message)}
                        className="border-red-300 text-red-600 hover:bg-red-50 hover:border-red-500 flex-1 sm:flex-none text-xs sm:text-sm"
                      >
                        <Trash2 className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                        <span className="hidden sm:inline">Delete</span>
                        <span className="sm:hidden">Del</span>
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>

      {/* Message Details Dialog */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedMessage && getTypeIcon(selectedMessage.type)}
              Message Details
            </DialogTitle>
          </DialogHeader>
          
          {selectedMessage && (
            <div className="space-y-6">
              {/* Message Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium mb-2 text-gray-700 dark:text-gray-300">Subject</h4>
                  <p className="text-gray-600 dark:text-gray-400">{selectedMessage.subject}</p>
                </div>
                <div>
                  <h4 className="font-medium mb-2 text-gray-700 dark:text-gray-300">Type</h4>
                  <div className="flex items-center gap-2">
                    {getTypeIcon(selectedMessage.type)}
                    <span className="capitalize text-gray-600 dark:text-gray-400">{selectedMessage.type}</span>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium mb-2 text-gray-700 dark:text-gray-300">Target Users</h4>
                  <span className="capitalize text-gray-600 dark:text-gray-400">{selectedMessage.userType} users</span>
                </div>
                <div>
                  <h4 className="font-medium mb-2 text-gray-700 dark:text-gray-300">Status</h4>
                  {getStatusBadge(selectedMessage.status)}
                </div>
                <div>
                  <h4 className="font-medium mb-2 text-gray-700 dark:text-gray-300">Sent Date</h4>
                  <p className="text-gray-600 dark:text-gray-400">
                    {new Date(selectedMessage.createdAt).toLocaleString()}
                  </p>
                </div>
                <div>
                  <h4 className="font-medium mb-2 text-gray-700 dark:text-gray-300">Recipients</h4>
                  <p className="text-gray-600 dark:text-gray-400">
                    {selectedMessage.sentCount} sent, {selectedMessage.failedCount} failed
                  </p>
                </div>
              </div>

              {/* Message Content */}
              <div>
                <h4 className="font-medium mb-2 text-gray-700 dark:text-gray-300">Message Content</h4>
                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                  <p className="whitespace-pre-wrap text-gray-700 dark:text-gray-300">{selectedMessage.content}</p>
                </div>
              </div>

              {/* Results */}
              {selectedMessage.results && selectedMessage.results.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2 text-gray-700 dark:text-gray-300">Delivery Results</h4>
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {selectedMessage.results.map((result, index) => (
                      <div
                        key={index}
                        className={`p-3 rounded-lg border-2 ${
                          result.status === 'success' 
                            ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700' 
                            : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-700'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-gray-700 dark:text-gray-300">{result.email}</p>
                            {result.mobile && (
                              <p className="text-sm text-gray-600 dark:text-gray-400">{result.mobile}</p>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            {result.status === 'success' ? (
                              <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                            ) : (
                              <XCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
                            )}
                            <span className={`text-sm font-medium ${
                              result.status === 'success' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                            }`}>
                              {result.status}
                            </span>
                          </div>
                        </div>
                        {result.error && (
                          <p className="text-sm text-red-600 dark:text-red-400 mt-1">{result.error}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-red-700">Delete Bulk Message</AlertDialogTitle>
            <AlertDialogDescription className="text-sm">
              Are you sure you want to delete this bulk message? This action will permanently remove:
              <ul className="list-disc list-inside mt-2 space-y-1 text-xs">
                <li>Message details and content</li>
                <li>Delivery results and statistics</li>
                <li>All related data</li>
              </ul>
              <p className="mt-3 font-semibold text-red-600">This action cannot be undone!</p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col sm:flex-row gap-2">
            <AlertDialogCancel className="border-gray-300 text-gray-700 hover:bg-gray-50 w-full sm:w-auto">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDeleteMessage}
              className="bg-red-600 hover:bg-red-700 text-white w-full sm:w-auto"
            >
              Delete Message
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  )
}
