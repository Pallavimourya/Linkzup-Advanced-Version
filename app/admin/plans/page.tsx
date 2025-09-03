"use client"

import useSWR from "swr"
import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Plus, Edit, Trash2, CheckCircle, XCircle, Package, CreditCard, Calendar, Zap } from "lucide-react"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export default function AdminPlansPage() {
  const { data, mutate } = useSWR("/api/admin/plans", fetcher)
  const [draft, setDraft] = useState<any>({
    name: "",
    type: "subscription",
    interval: "monthly",
    price: 0,
    credits: 0,
    features: "",
    popular: false,
    recommended: false,
    isActive: true,
  })

  // Predefined plans based on requirements
  const predefinedPlans = [
    // Credit Packs
    {
      name: "Starter Pack",
      type: "credit_pack",
      interval: "one_time",
      price: 500,
      credits: 50,
      features: "Text generation: 100 posts\nWith posting: 50 posts\nImage generation: 50 images\nValid for 6 months",
      popular: false,
      recommended: false,
      isActive: true,
    },
    {
      name: "Pro Pack",
      type: "credit_pack",
      interval: "one_time",
      price: 1000,
      credits: 120,
      features: "Text generation: 240 posts\nWith posting: 120 posts\nImage generation: 120 images\nValid for 12 months\n20% bonus credits!",
      popular: true,
      recommended: false,
      isActive: true,
    },
    // Subscription Plans
    {
      name: "Basic Plan",
      type: "subscription",
      interval: "monthly",
      price: 299,
      credits: 10,
      features: "Monthly credit allocation\nText generation: 20 posts\nWith posting: 10 posts\nImage generation: 10 images\nPriority support",
      popular: false,
      recommended: false,
      isActive: true,
    },
    {
      name: "Professional Plan",
      type: "subscription",
      interval: "monthly",
      price: 599,
      credits: 25,
      features: "Monthly credit allocation\nText generation: 50 posts\nWith posting: 25 posts\nImage generation: 25 images\nPriority support\nAdvanced analytics",
      popular: false,
      recommended: true,
      isActive: true,
    },
    {
      name: "Enterprise Plan",
      type: "subscription",
      interval: "monthly",
      price: 999,
      credits: 50,
      features: "Monthly credit allocation\nText generation: 100 posts\nWith posting: 50 posts\nImage generation: 50 images\nPriority support\nAdvanced analytics\nCustom integrations",
      popular: false,
      recommended: false,
      isActive: true,
    }
  ]

  const currentPlansCount = data?.plans?.length || 0
  const canAddPlan = currentPlansCount < 3
  const canDeletePlan = currentPlansCount > 1

  const savePlan = async () => {
    if (!canAddPlan) {
      alert("Maximum 3 plans allowed. Please delete an existing plan first.")
      return
    }
    
    if (!draft.name.trim()) {
      alert("Plan name is required")
      return
    }

    await fetch("/api/admin/plans", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...draft,
        features: (draft.features || "")
          .split("\n")
          .map((s: string) => s.trim())
          .filter(Boolean),
      }),
    })
    setDraft({ ...draft, name: "", price: 0, credits: 0, features: "" })
    mutate()
  }

  const createPredefinedPlan = async (plan: any) => {
    if (!canAddPlan) {
      alert("Maximum 3 plans allowed. Please delete an existing plan first.")
      return
    }

    await fetch("/api/admin/plans", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...plan,
        features: plan.features.split("\n").filter(Boolean),
      }),
    })
    mutate()
  }

  const toggleActive = async (id: string, isActive: boolean) => {
    await fetch(`/api/admin/plans/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive }),
    })
    mutate()
  }

  const removePlan = async (id: string) => {
    if (!canDeletePlan) {
      alert("At least 1 plan must remain. Cannot delete the last plan.")
      return
    }
    
    if (confirm("Are you sure you want to delete this plan? This action cannot be undone.")) {
      await fetch(`/api/admin/plans/${id}`, { method: "DELETE" })
      mutate()
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Subscription Plans</h1>
          <p className="text-muted-foreground">Manage your subscription plans and credit packages</p>
        </div>
        <div className="flex gap-3">
          <Button 
            variant="outline" 
            onClick={async () => {
              try {
                const response = await fetch('/api/init-plans', { method: 'POST' })
                if (response.ok) {
                  alert('Plans initialized successfully!')
                  mutate()
                } else {
                  alert('Failed to initialize plans')
                }
              } catch (error) {
                alert('Error initializing plans')
              }
            }}
          >
            Initialize Default Plans
          </Button>
        </div>
      </div>

      {/* Predefined Plans Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Quick Setup - Predefined Plans
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Click on any plan below to quickly create it. These plans are designed based on your credit usage requirements.
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {predefinedPlans.map((plan, index) => (
              <div key={index} className="border border-teal-200 rounded-lg p-4 hover:shadow-md transition-shadow bg-white/50">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-lg text-teal-900">{plan.name}</h3>
                  <Badge variant={plan.type === 'subscription' ? 'default' : 'secondary'} className="text-xs">
                    {plan.type === 'subscription' ? 'Subscription' : 'Credit Pack'}
                  </Badge>
                </div>
                
                <div className="space-y-2 mb-4">
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-teal-700">₹{plan.price}</span>
                    <span className="text-sm text-teal-600">{plan.credits} Credits</span>
                  </div>
                  
                  {plan.popular && (
                    <Badge className="bg-orange-500 text-white text-xs">Popular</Badge>
                  )}
                  {plan.recommended && (
                    <Badge className="bg-blue-500 text-white text-xs">Recommended</Badge>
                  )}
                </div>

                <div className="space-y-1 mb-4">
                  {plan.features.split('\n').map((feature, idx) => (
                    <p key={idx} className="text-xs text-gray-600">• {feature}</p>
                  ))}
                </div>

                <Button 
                  onClick={() => createPredefinedPlan(plan)}
                  className="w-full bg-teal-700 hover:bg-teal-800 text-white"
                  disabled={!canAddPlan}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create {plan.name}
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Create New Plan
            <Badge variant="outline" className="ml-2 text-xs">
              {currentPlansCount}/3 Plans
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Basic Information */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="plan-name">Plan Name</Label>
              <Input 
                id="plan-name"
                placeholder="e.g., Pro Plan, Basic Plan" 
                value={draft.name} 
                onChange={(e) => setDraft({ ...draft, name: e.target.value })} 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="plan-type">Plan Type</Label>
              <Select value={draft.type} onValueChange={(v) => setDraft({ ...draft, type: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select plan type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="subscription">
                    <div className="flex items-center gap-2">
                      <CreditCard className="h-4 w-4" />
                      Subscription
                    </div>
                  </SelectItem>
                  <SelectItem value="credit_pack">
                    <div className="flex items-center gap-2">
                      <Package className="h-4 w-4" />
                      Credit Pack
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Pricing & Credits */}
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="plan-price">Price (₹)</Label>
              <Input
                id="plan-price"
                type="number"
                placeholder="0"
                value={draft.price}
                onChange={(e) => setDraft({ ...draft, price: Number(e.target.value) })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="plan-credits">Credits</Label>
              <Input
                id="plan-credits"
                type="number"
                placeholder="0"
                value={draft.credits}
                onChange={(e) => setDraft({ ...draft, credits: Number(e.target.value) })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="plan-interval">Billing Interval</Label>
              <Select value={draft.interval} onValueChange={(v) => setDraft({ ...draft, interval: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select interval" />
                </SelectTrigger>
                              <SelectContent>
                <SelectItem value="monthly">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Monthly
                  </div>
                </SelectItem>
                <SelectItem value="yearly">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Yearly
                  </div>
                </SelectItem>
                <SelectItem value="one_time">
                  <div className="flex items-center gap-2">
                    <Package className="h-4 w-4" />
                    One Time
                  </div>
                </SelectItem>
              </SelectContent>
              </Select>
            </div>
          </div>

          {/* Features */}
          <div className="space-y-2">
            <Label htmlFor="plan-features">Features (one per line)</Label>
            <Textarea
              id="plan-features"
              placeholder="AI Content Generation&#10;LinkedIn Posting&#10;Priority Support&#10;Advanced Analytics"
              className="min-h-[100px]"
              value={draft.features}
              onChange={(e) => setDraft({ ...draft, features: e.target.value })}
            />
          </div>

          {/* Plan Options */}
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2">
              <Switch
                id="popular"
                checked={draft.popular}
                onCheckedChange={(checked) => setDraft({ ...draft, popular: checked })}
              />
              <Label htmlFor="popular">Mark as Popular</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="recommended"
                checked={draft.recommended}
                onCheckedChange={(checked) => setDraft({ ...draft, recommended: checked })}
              />
              <Label htmlFor="recommended">Mark as Recommended</Label>
            </div>
          </div>

          <Separator />

          <Button 
            onClick={savePlan} 
            className="w-full md:w-auto"
            disabled={!canAddPlan}
          >
            <Plus className="h-4 w-4 mr-2" />
            {canAddPlan ? "Create Plan" : "Maximum Plans Reached"}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Existing Plans ({data?.plans?.length || 0})
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {data?.plans?.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No plans created yet</p>
              <p className="text-sm">Create your first plan above (at least 1 plan required)</p>
            </div>
          ) : (
            data?.plans?.map((p: any) => (
              <div key={p._id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-lg">{p.name}</h3>
                      <div className="flex gap-2">
                        <Badge variant={p.type === 'subscription' ? 'default' : 'secondary'}>
                          {p.type === 'subscription' ? 'Subscription' : 'Credit Pack'}
                        </Badge>
                        {p.popular && <Badge variant="outline" className="text-orange-600 border-orange-600">Popular</Badge>}
                        {p.recommended && <Badge variant="outline" className="text-blue-600 border-blue-600">Recommended</Badge>}
                        {p.isActive ? (
                          <Badge variant="outline" className="text-green-600 border-green-600">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Active
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-red-600 border-red-600">
                            <XCircle className="h-3 w-3 mr-1" />
                            Inactive
                          </Badge>
                        )}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                      <div className="flex items-center gap-2">
                        <CreditCard className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">₹{p.price}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Zap className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">{p.credits} Credits</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium capitalize">{p.interval}</span>
                      </div>
                    </div>
                    
                    {p.features && p.features.length > 0 && (
                      <div className="mb-3">
                        <p className="text-xs font-medium text-muted-foreground mb-1">Features:</p>
                        <div className="flex flex-wrap gap-1">
                          {p.features.map((feature: string, index: number) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {feature}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex gap-2 ml-4">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => toggleActive(p._id, !p.isActive)}
                      className={p.isActive ? "text-red-600 hover:text-red-700" : "text-green-600 hover:text-green-700"}
                    >
                      {p.isActive ? "Deactivate" : "Activate"}
                    </Button>
                    <Button 
                      size="sm" 
                      variant="destructive" 
                      onClick={() => removePlan(p._id)}
                      disabled={!canDeletePlan}
                      title={!canDeletePlan ? "At least 1 plan must remain" : "Delete plan"}
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
    </div>
  )
}
