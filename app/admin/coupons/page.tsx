"use client"

import useSWR from "swr"
import { useState } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { Plus, Tag, Percent, DollarSign, Users, Calendar, CheckCircle, XCircle, Trash2, Edit, Eye, Save, X } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export default function AdminCouponsPage() {
  const { data, mutate } = useSWR("/api/admin/coupons", fetcher)
  const [draft, setDraft] = useState<any>({
    code: "",
    type: "percent",
    value: 10,
    maxRedemptions: 100,
    expiresAt: "",
    active: true,
    visible: true,
  })
  const [editingCoupon, setEditingCoupon] = useState<any>(null)
  const [editDraft, setEditDraft] = useState<any>(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)

  // Predefined coupons
  const predefinedCoupons = [
    {
      code: "WELCOME20",
      type: "percent",
      value: 20,
      maxRedemptions: 50,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16), // 30 days from now
      active: true,
      description: "Welcome discount for new users"
    },
    {
      code: "SAVE50",
      type: "fixed",
      value: 50,
      maxRedemptions: 100,
      expiresAt: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16), // 60 days from now
      active: true,
      description: "Fixed amount discount for all users"
    },
    {
      code: "PRO25",
      type: "percent",
      value: 25,
      maxRedemptions: 25,
      expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16), // 90 days from now
      active: true,
      description: "Special discount for Pro plan users"
    }
  ]

  const save = async () => {
    if (!draft.code.trim()) {
      alert("Please enter a coupon code")
      return
    }
    
    try {
      const response = await fetch("/api/admin/coupons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(draft),
      })
      
      if (!response.ok) {
        const error = await response.json()
        alert(error.error || "Failed to create coupon")
        return
      }
      
      setDraft({ code: "", type: "percent", value: 10, maxRedemptions: 100, expiresAt: "", active: true, visible: true })
      mutate()
    } catch (error) {
      alert("Failed to create coupon")
    }
  }

  const createPredefinedCoupon = async (coupon: any) => {
    try {
      const response = await fetch("/api/admin/coupons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(coupon),
      })
      
      if (!response.ok) {
        const error = await response.json()
        alert(error.error || "Failed to create coupon")
        return
      }
      
      mutate()
    } catch (error) {
      alert("Failed to create coupon")
    }
  }

  const toggle = async (code: string, active: boolean) => {
    try {
      console.log("=== TOGGLE DEBUG START ===")
      console.log("Original code:", code)
      console.log("Code type:", typeof code)
      console.log("Code length:", code.length)
      console.log("Code trimmed:", code.trim())
      console.log("Code uppercase:", code.toUpperCase())
      console.log("Active value:", active)
      console.log("Active type:", typeof active)
      
      const url = `/api/admin/coupons/${encodeURIComponent(code)}`
      console.log("Request URL:", url)
      console.log("Request payload:", { active })
      
      const response = await fetch(url, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active }),
      })
      
      console.log("Response status:", response.status)
      console.log("Response ok:", response.ok)
      console.log("Response headers:", Object.fromEntries(response.headers.entries()))
      
      if (!response.ok) {
        const error = await response.json()
        console.error("Error response:", error)
        alert(error.error || "Failed to update coupon status")
        return
      }
      
      console.log("Toggle successful")
      console.log("=== TOGGLE DEBUG END ===")
      mutate()
    } catch (error) {
      console.error("Toggle error:", error)
      alert("Failed to update coupon status")
    }
  }

  const remove = async (code: string) => {
    if (!confirm(`Are you sure you want to delete coupon "${code}"? This action cannot be undone.`)) {
      return
    }
    
    try {
      const response = await fetch(`/api/admin/coupons/${encodeURIComponent(code)}`, { 
        method: "DELETE" 
      })
      
      if (!response.ok) {
        const error = await response.json()
        alert(error.error || "Failed to delete coupon")
        return
      }
      
      mutate()
    } catch (error) {
      alert("Failed to delete coupon")
    }
  }

  const startEdit = (coupon: any) => {
    setEditingCoupon(coupon)
    setEditDraft({
      code: coupon.code,
      type: coupon.type,
      value: coupon.value,
      maxRedemptions: coupon.maxRedemptions,
      expiresAt: coupon.expiresAt ? new Date(coupon.expiresAt).toISOString().slice(0, 16) : "",
      active: coupon.active,
      visible: coupon.visible !== false,
    })
    setIsEditModalOpen(true)
  }

  const saveEdit = async () => {
    if (!editingCoupon || !editDraft) return
    
    if (!editDraft.code || editDraft.code.trim() === '') {
      alert("Coupon code cannot be empty")
      return
    }
    
    try {
      const response = await fetch(`/api/admin/coupons/${encodeURIComponent(editingCoupon.code)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editDraft),
      })
      
      if (!response.ok) {
        const error = await response.json()
        alert(error.error || "Failed to update coupon")
        return
      }
      
      setEditingCoupon(null)
      setEditDraft(null)
      setIsEditModalOpen(false)
      mutate()
    } catch (error) {
      alert("Failed to update coupon")
    }
  }

  const cancelEdit = () => {
    setEditingCoupon(null)
    setEditDraft(null)
    setIsEditModalOpen(false)
  }

  // Test function to check if API is working
  const testApi = async () => {
    try {
      console.log("Testing API connection...")
      const response = await fetch("/api/admin/coupons")
      console.log("API test response:", response.status)
      const data = await response.json()
      console.log("API test data:", data)
      
      // Test specific coupon if any exist
      if (data.coupons && data.coupons.length > 0) {
        const firstCoupon = data.coupons[0]
        console.log("Testing toggle on first coupon:", firstCoupon.code)
        await toggle(firstCoupon.code, !firstCoupon.active)
      } else {
        console.log("No coupons found, creating a test coupon...")
        // Create a test coupon
        const testCoupon = {
          code: "TEST123",
          type: "percent",
          value: 10,
          maxRedemptions: 100,
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
          active: true,
          visible: true
        }
        await createPredefinedCoupon(testCoupon)
      }
    } catch (error) {
      console.error("API test error:", error)
    }
  }


  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Discount Coupons</h1>
          <p className="text-sm sm:text-base text-muted-foreground">Create and manage discount coupons for your customers</p>
        </div>
        <Button onClick={testApi} variant="outline" size="sm">
          Test API
        </Button>
      </div>

      {/* Predefined Coupons Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <Tag className="h-4 w-4 sm:h-5 sm:w-5" />
            Quick Setup - Predefined Coupons
          </CardTitle>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Click on any coupon below to quickly create it. These coupons are designed for common use cases.
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {predefinedCoupons.map((coupon, index) => (
              <div key={index} className="border border-blue-200 rounded-lg p-3 sm:p-4 hover:shadow-md transition-shadow bg-white/50">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-base sm:text-lg font-mono text-blue-900 break-words">{coupon.code}</h3>
                  <Badge variant={coupon.type === 'percent' ? 'default' : 'secondary'} className="text-xs">
                    {coupon.type === 'percent' ? `${coupon.value}% OFF` : `₹${coupon.value} OFF`}
                  </Badge>
                </div>
                
                <div className="space-y-2 mb-4">
                  <p className="text-xs sm:text-sm text-gray-600">{coupon.description}</p>
                  
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Users className="h-3 w-3 flex-shrink-0" />
                    <span>Max: {coupon.maxRedemptions} uses</span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Calendar className="h-3 w-3 flex-shrink-0" />
                    <span>Expires: {new Date(coupon.expiresAt).toLocaleDateString()}</span>
                  </div>
                </div>

                <Button 
                  onClick={() => createPredefinedCoupon(coupon)}
                  className="w-full bg-blue-700 hover:bg-blue-800 text-white text-sm sm:text-base"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create {coupon.code}
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <Plus className="h-4 w-4 sm:h-5 sm:w-5" />
            Create New Coupon
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 sm:space-y-6">
          {/* Basic Information */}
          <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="coupon-code" className="text-sm">Coupon Code</Label>
              <Input
                id="coupon-code"
                placeholder="e.g., WELCOME20, SAVE50"
                value={draft.code}
                onChange={(e) => setDraft({ ...draft, code: e.target.value.toUpperCase() })}
                className="text-sm sm:text-base"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="coupon-type" className="text-sm">Discount Type</Label>
              <Select value={draft.type} onValueChange={(v) => setDraft({ ...draft, type: v })}>
                <SelectTrigger className="text-sm sm:text-base">
                  <SelectValue placeholder="Select discount type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="percent">
                    <div className="flex items-center gap-2">
                      <Percent className="h-4 w-4" />
                      Percentage Discount
                    </div>
                  </SelectItem>
                  <SelectItem value="fixed">
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4" />
                      Fixed Amount Discount
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Discount Details */}
          <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="coupon-value" className="text-sm">
                {draft.type === 'percent' ? 'Discount Percentage' : 'Discount Amount (₹)'}
              </Label>
              <Input
                id="coupon-value"
                type="number"
                placeholder={draft.type === 'percent' ? '20' : '100'}
                value={draft.value}
                onChange={(e) => setDraft({ ...draft, value: Number(e.target.value) })}
                className="text-sm sm:text-base"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="coupon-redemptions" className="text-sm">Max Redemptions</Label>
              <Input
                id="coupon-redemptions"
                type="number"
                placeholder="100"
                value={draft.maxRedemptions}
                onChange={(e) => setDraft({ ...draft, maxRedemptions: Number(e.target.value) })}
                className="text-sm sm:text-base"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="coupon-expiry" className="text-sm">Expiry Date & Time</Label>
              <Input
                id="coupon-expiry"
                type="datetime-local"
                value={draft.expiresAt}
                onChange={(e) => setDraft({ ...draft, expiresAt: e.target.value })}
                className="text-sm sm:text-base"
              />
            </div>
          </div>

          {/* Visibility Control */}
          <div className="space-y-2">
            <Label htmlFor="coupon-visibility" className="text-sm">Visibility</Label>
            <div className="flex items-center space-x-2">
              <Switch
                id="coupon-visibility"
                checked={draft.visible}
                onCheckedChange={(checked) => setDraft({ ...draft, visible: checked })}
              />
              <Label htmlFor="coupon-visibility" className="text-sm">
                {draft.visible ? "Visible to users" : "Hidden from users"}
              </Label>
            </div>
            <p className="text-xs text-muted-foreground">
              {draft.visible 
                ? "This coupon will be visible in the user dashboard billing section" 
                : "This coupon will be hidden from users but can still be applied manually"
              }
            </p>
          </div>

          <Separator />

          <Button onClick={save} className="w-full sm:w-auto text-sm sm:text-base">
            <Plus className="h-4 w-4 mr-2" />
            Create Coupon
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <Tag className="h-4 w-4 sm:h-5 sm:w-5" />
            Existing Coupons ({data?.coupons?.length || 0})
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 sm:space-y-4">
          {data?.coupons?.length === 0 ? (
            <div className="text-center py-6 sm:py-8 text-muted-foreground">
              <Tag className="h-10 w-10 sm:h-12 sm:w-12 mx-auto mb-4 opacity-50" />
              <p className="text-sm sm:text-base">No coupons created yet</p>
              <p className="text-xs sm:text-sm">Create your first coupon above</p>
            </div>
          ) : (
            data?.coupons?.map((c: any) => (
              <div key={c.code} className="border rounded-lg p-3 sm:p-4 hover:shadow-md transition-shadow">
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-3 sm:gap-4">
                  <div className="flex-1">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2">
                      <h3 className="font-semibold text-base sm:text-lg font-mono break-words">{c.code}</h3>
                      <div className="flex flex-wrap gap-2">
                        <Badge variant={c.type === 'percent' ? 'default' : 'secondary'} className="text-xs">
                          {c.type === 'percent' ? `${c.value}% OFF` : `₹${c.value} OFF`}
                        </Badge>
                        {c.active ? (
                          <Badge variant="outline" className="text-green-600 border-green-600 text-xs">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Active
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-red-600 border-red-600 text-xs">
                            <XCircle className="h-3 w-3 mr-1" />
                            Inactive
                          </Badge>
                        )}
                        {c.visible !== false ? (
                          <Badge variant="outline" className="text-blue-600 border-blue-600 text-xs">
                            <Eye className="h-3 w-3 mr-1" />
                            Visible
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-gray-600 border-gray-600 text-xs">
                            <Eye className="h-3 w-3 mr-1" />
                            Hidden
                          </Badge>
                        )}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-3">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        <span className="text-xs sm:text-sm">
                          <span className="font-medium">{c.uses}</span> / {c.maxRedemptions} used
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        <span className="text-xs sm:text-sm">
                          {c.expiresAt ? (
                            <>
                              Expires: <span className="font-medium">{new Date(c.expiresAt).toLocaleDateString()}</span>
                            </>
                          ) : (
                            <span className="font-medium">Never expires</span>
                          )}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Tag className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        <span className="text-xs sm:text-sm">
                          Type: <span className="font-medium capitalize">{c.type}</span>
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 lg:ml-4 lg:flex-col lg:items-end">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => startEdit(c)}
                      className="text-blue-600 hover:text-blue-700 text-xs sm:text-sm"
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => toggle(c.code, !c.active)}
                      className={c.active ? "text-red-600 hover:text-red-700 text-xs sm:text-sm" : "text-green-600 hover:text-green-700 text-xs sm:text-sm"}
                    >
                      {c.active ? "Deactivate" : "Activate"}
                    </Button>
                    <Button 
                      size="sm" 
                      variant="destructive" 
                      onClick={() => remove(c.code)}
                      className="text-xs sm:text-sm"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Edit Coupon Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit className="h-5 w-5" />
              Edit Coupon: {editingCoupon?.code}
            </DialogTitle>
          </DialogHeader>
          
          {editDraft && (
            <div className="space-y-6">
              {/* Basic Information */}
              <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="edit-coupon-code" className="text-sm">Coupon Code</Label>
                  <Input
                    id="edit-coupon-code"
                    placeholder="e.g., WELCOME20, SAVE50"
                    value={editDraft.code}
                    onChange={(e) => setEditDraft({ ...editDraft, code: e.target.value.toUpperCase() })}
                    className="text-sm sm:text-base"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-coupon-type" className="text-sm">Discount Type</Label>
                  <Select value={editDraft.type} onValueChange={(v) => setEditDraft({ ...editDraft, type: v })}>
                    <SelectTrigger className="text-sm sm:text-base">
                      <SelectValue placeholder="Select discount type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="percent">
                        <div className="flex items-center gap-2">
                          <Percent className="h-4 w-4" />
                          Percentage Discount
                        </div>
                      </SelectItem>
                      <SelectItem value="fixed">
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-4 w-4" />
                          Fixed Amount Discount
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Discount Details */}
              <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="edit-coupon-value" className="text-sm">
                    {editDraft.type === 'percent' ? 'Discount Percentage' : 'Discount Amount (₹)'}
                  </Label>
                  <Input
                    id="edit-coupon-value"
                    type="number"
                    placeholder={editDraft.type === 'percent' ? '20' : '100'}
                    value={editDraft.value}
                    onChange={(e) => setEditDraft({ ...editDraft, value: Number(e.target.value) })}
                    className="text-sm sm:text-base"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-coupon-redemptions" className="text-sm">Max Redemptions</Label>
                  <Input
                    id="edit-coupon-redemptions"
                    type="number"
                    placeholder="100"
                    value={editDraft.maxRedemptions}
                    onChange={(e) => setEditDraft({ ...editDraft, maxRedemptions: Number(e.target.value) })}
                    className="text-sm sm:text-base"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-coupon-expiry" className="text-sm">Expiry Date & Time</Label>
                  <Input
                    id="edit-coupon-expiry"
                    type="datetime-local"
                    value={editDraft.expiresAt}
                    onChange={(e) => setEditDraft({ ...editDraft, expiresAt: e.target.value })}
                    className="text-sm sm:text-base"
                  />
                </div>
              </div>

              {/* Status Controls */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-coupon-active" className="text-sm">Status</Label>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="edit-coupon-active"
                      checked={editDraft.active}
                      onCheckedChange={(checked) => setEditDraft({ ...editDraft, active: checked })}
                    />
                    <Label htmlFor="edit-coupon-active" className="text-sm">
                      {editDraft.active ? "Active" : "Inactive"}
                    </Label>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="edit-coupon-visibility" className="text-sm">Visibility</Label>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="edit-coupon-visibility"
                      checked={editDraft.visible}
                      onCheckedChange={(checked) => setEditDraft({ ...editDraft, visible: checked })}
                    />
                    <Label htmlFor="edit-coupon-visibility" className="text-sm">
                      {editDraft.visible ? "Visible to users" : "Hidden from users"}
                    </Label>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 sm:justify-end">
                <Button 
                  variant="outline" 
                  onClick={cancelEdit}
                  className="text-sm sm:text-base"
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
                <Button 
                  onClick={saveEdit}
                  className="text-sm sm:text-base"
                >
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
