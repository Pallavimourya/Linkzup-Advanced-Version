import { NextResponse, type NextRequest } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { connectToDatabase } from "@/lib/mongodb"

export async function GET() {
  const { db } = await connectToDatabase()
  const plans = await db.collection("plans").find({}).sort({ createdAt: -1 }).toArray()
  return NextResponse.json({ plans })
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user || !(session.user as any).isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
  }
  const payload = await req.json()
  const plan = {
    name: payload.name,
    type: payload.type, // "subscription" | "credit_pack"
    interval: payload.interval || "monthly",
    price: Number(payload.price) || 0,
    credits: Number(payload.credits) || 0,
    features: Array.isArray(payload.features) ? payload.features : [],
    popular: !!payload.popular,
    recommended: !!payload.recommended,
    isActive: payload.isActive !== false,
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  const { db } = await connectToDatabase()
  const res = await db.collection("plans").insertOne(plan)
  return NextResponse.json({ ok: true, id: res.insertedId })
}
