"use client"

import useSWR from "swr"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export default function AdminAnalyticsPage() {
  const { data } = useSWR("/api/admin/analytics/summary", fetcher)

  const metrics = [
    { label: "Total Users", value: data?.users?.total ?? "-" },
    { label: "Active", value: data?.users?.active ?? "-" },
    { label: "Trial", value: data?.users?.trial ?? "-" },
    { label: "Cancelled", value: data?.subscriptions?.cancelled ?? "-" },
    { label: "MRR (₹)", value: data?.revenue?.currentMonth ?? "-" },
    { label: "Revenue (30d)", value: data?.revenue?.last30Days ?? "-" },
  ]

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Analytics</h1>
      <div className="grid gap-4 md:grid-cols-3">
        {metrics.map((m) => (
          <Card key={m.label}>
            <CardHeader>
              <CardTitle>{m.label}</CardTitle>
            </CardHeader>
            <CardContent className="text-3xl font-bold">{m.value}</CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
