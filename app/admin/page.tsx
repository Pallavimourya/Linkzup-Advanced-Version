"use client"

import useSWR from "swr"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export default function AdminHomePage() {
  const { data } = useSWR("/api/admin/analytics/summary", fetcher)

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Admin Overview</h1>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle>Total Users</CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-bold">{data?.users?.total ?? "-"}</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Active Subscriptions</CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-bold">{data?.subscriptions?.active ?? "-"}</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Monthly Revenue (₹)</CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-bold">{data?.revenue?.currentMonth ?? "-"}</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Coupons Active</CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-bold">{data?.coupons?.active ?? "-"}</CardContent>
        </Card>
      </div>
    </div>
  )
}
