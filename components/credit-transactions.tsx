"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { CreditCard, Calendar, TrendingUp, TrendingDown, ChevronLeft, ChevronRight } from "lucide-react"

interface CreditTransaction {
  _id: string
  actionType: string
  credits: number
  description: string
  timestamp: string
  remainingCredits: number
}

interface PaginationInfo {
  page: number
  limit: number
  total: number
  pages: number
}

export default function CreditTransactions() {
  const [transactions, setTransactions] = useState<CreditTransaction[]>([])
  const [pagination, setPagination] = useState<PaginationInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)

  useEffect(() => {
    fetchTransactions(currentPage)
  }, [currentPage])

  const fetchTransactions = async (page: number) => {
    try {
      setLoading(true)
      const response = await fetch(`/api/credits/transactions?page=${page}&limit=20`)
      if (response.ok) {
        const data = await response.json()
        setTransactions(data.transactions || [])
        setPagination(data.pagination)
      }
    } catch (error) {
      console.error("Failed to fetch credit transactions:", error)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getActionIcon = (actionType: string) => {
    switch (actionType) {
      case 'text_only':
        return <CreditCard className="h-4 w-4 text-blue-600" />
      case 'text_with_post':
        return <CreditCard className="h-4 w-4 text-green-600" />
      case 'text_with_image':
        return <CreditCard className="h-4 w-4 text-purple-600" />
      case 'text_image_post':
        return <CreditCard className="h-4 w-4 text-orange-600" />
      case 'image_only':
        return <CreditCard className="h-4 w-4 text-pink-600" />
      case 'auto_post':
        return <CreditCard className="h-4 w-4 text-indigo-600" />
      default:
        return <CreditCard className="h-4 w-4 text-gray-600" />
    }
  }

  const getActionBadge = (actionType: string) => {
    const actionNames: Record<string, string> = {
      text_only: 'Text Only',
      text_with_post: 'Text + Post',
      text_with_image: 'Text + Image',
      text_image_post: 'Text + Image + Post',
      image_only: 'Image Only',
      auto_post: 'Auto Post'
    }
    
    return actionNames[actionType] || actionType
  }

  const getCreditChange = (credits: number) => {
    const isDeduction = credits < 0
    return (
      <div className="flex items-center gap-1">
        {isDeduction ? (
          <TrendingDown className="h-4 w-4 text-red-600" />
        ) : (
          <TrendingUp className="h-4 w-4 text-green-600" />
        )}
        <span className={isDeduction ? "text-red-600" : "text-green-600"}>
          {isDeduction ? "-" : "+"}{Math.abs(credits)} credits
        </span>
      </div>
    )
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Credit Transactions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          Credit Transactions
        </CardTitle>
        <CardDescription>Your credit usage history</CardDescription>
      </CardHeader>
      <CardContent>
        {transactions.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <CreditCard className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No credit transactions found</p>
            <p className="text-sm">Your credit usage will appear here</p>
          </div>
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Credits</TableHead>
                  <TableHead>Remaining</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.map((transaction) => (
                  <TableRow key={transaction._id}>
                    <TableCell className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      {formatDate(transaction.timestamp)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getActionIcon(transaction.actionType)}
                        <Badge variant="outline">
                          {getActionBadge(transaction.actionType)}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell className="max-w-xs truncate">
                      {transaction.description}
                    </TableCell>
                    <TableCell>
                      {getCreditChange(transaction.credits)}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        {transaction.remainingCredits} credits
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {/* Pagination */}
            {pagination && pagination.pages > 1 && (
              <div className="flex items-center justify-between mt-4">
                <div className="text-sm text-muted-foreground">
                  Showing page {pagination.page} of {pagination.pages}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(currentPage - 1)}
                    disabled={currentPage <= 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(currentPage + 1)}
                    disabled={currentPage >= pagination.pages}
                  >
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
}
