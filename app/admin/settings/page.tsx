"use client"

import useSWR from "swr"
import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export default function AdminSettingsPage() {
  const { data, mutate } = useSWR("/api/admin/settings", fetcher)
  const [form, setForm] = useState<any>({
    siteName: "",
    logoUrl: "",
    theme: "light",
    payment: { keyId: "", keySecret: "" },
    smtp: { host: "", port: 587, user: "", pass: "" },
    legal: { terms: "", privacy: "" },
  })

  useEffect(() => {
    if (data?.settings) setForm(data.settings)
  }, [data])

  const save = async () => {
    await fetch("/api/admin/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    })
    mutate()
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Settings</h1>
      <Card>
        <CardHeader>
          <CardTitle>Branding</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-2">
          <Input
            placeholder="Site Name"
            value={form.siteName || ""}
            onChange={(e) => setForm({ ...form, siteName: e.target.value })}
          />
          <Input
            placeholder="Logo URL"
            value={form.logoUrl || ""}
            onChange={(e) => setForm({ ...form, logoUrl: e.target.value })}
          />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Payment (Razorpay)</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-2">
          <Input
            placeholder="Key ID"
            value={form.payment?.keyId || ""}
            onChange={(e) => setForm({ ...form, payment: { ...form.payment, keyId: e.target.value } })}
          />
          <Input
            placeholder="Key Secret"
            value={form.payment?.keySecret || ""}
            onChange={(e) => setForm({ ...form, payment: { ...form.payment, keySecret: e.target.value } })}
          />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>SMTP</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-2">
          <Input
            placeholder="Host"
            value={form.smtp?.host || ""}
            onChange={(e) => setForm({ ...form, smtp: { ...form.smtp, host: e.target.value } })}
          />
          <Input
            type="number"
            placeholder="Port"
            value={form.smtp?.port || 587}
            onChange={(e) => setForm({ ...form, smtp: { ...form.smtp, port: Number(e.target.value) } })}
          />
          <Input
            placeholder="User"
            value={form.smtp?.user || ""}
            onChange={(e) => setForm({ ...form, smtp: { ...form.smtp, user: e.target.value } })}
          />
          <Input
            placeholder="Pass"
            value={form.smtp?.pass || ""}
            onChange={(e) => setForm({ ...form, smtp: { ...form.smtp, pass: e.target.value } })}
          />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Legal</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3">
          <textarea
            placeholder="Terms & Conditions (Markdown allowed)"
            className="border rounded p-2 min-h-[160px]"
            value={form.legal?.terms || ""}
            onChange={(e) => setForm({ ...form, legal: { ...form.legal, terms: e.target.value } })}
          />
          <textarea
            placeholder="Privacy Policy (Markdown allowed)"
            className="border rounded p-2 min-h-[160px]"
            value={form.legal?.privacy || ""}
            onChange={(e) => setForm({ ...form, legal: { ...form.legal, privacy: e.target.value } })}
          />
        </CardContent>
      </Card>
      <Button onClick={save}>Save Settings</Button>
    </div>
  )
}
