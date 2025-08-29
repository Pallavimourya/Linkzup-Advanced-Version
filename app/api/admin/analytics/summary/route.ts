import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"

export async function GET() {
  const { db } = await connectToDatabase()

  const usersTotal = await db.collection("users").countDocuments({})
  const usersTrial = await db.collection("users").countDocuments({ isTrialActive: true })
  const usersActive = await db.collection("users").countDocuments({ accountStatus: { $in: [null, "active"] } })

  const now = new Date()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
  const last30 = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)

  const payments = db.collection("payments")
  const revenueMonthAgg = await payments
    .aggregate([{ $match: { createdAt: { $gte: monthStart } } }, { $group: { _id: null, sum: { $sum: "$amount" } } }])
    .toArray()
  const revenue30Agg = await payments
    .aggregate([{ $match: { createdAt: { $gte: last30 } } }, { $group: { _id: null, sum: { $sum: "$amount" } } }])
    .toArray()

  const subs = db.collection("subscriptions")
  const subActive = await subs.countDocuments({ status: "active" })
  const subCancelled = await subs.countDocuments({ status: "cancelled" })

  const couponsActive = await db.collection("coupons").countDocuments({ active: true })

  return NextResponse.json({
    users: { total: usersTotal, trial: usersTrial, active: usersActive },
    subscriptions: { active: subActive, cancelled: subCancelled },
    revenue: { currentMonth: revenueMonthAgg[0]?.sum || 0, last30Days: revenue30Agg[0]?.sum || 0 },
    coupons: { active: couponsActive },
  })
}
