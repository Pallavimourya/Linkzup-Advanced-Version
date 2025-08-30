import { NextResponse, type NextRequest } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { connectToDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user || !(session.user as any).isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
  }

  const { searchParams } = new URL(req.url)
  const q = (searchParams.get("q") || "").trim()

  const { db } = await connectToDatabase()
  const users = db.collection("users")

  const filter: any = {}
  if (q) {
    filter.$or = [{ email: { $regex: q, $options: "i" } }, { name: { $regex: q, $options: "i" } }]
  }

  const list = await users
    .find(filter, {
      projection: {
        email: 1,
        name: 1,
        role: 1,
        isAdmin: 1,
        credits: 1,
        isTrialActive: 1,
        plan: 1,
        accountStatus: 1,
        subscriptionStatus: 1,
      },
    })
    .sort({ createdAt: -1 })
    .limit(200)
    .toArray()

  return NextResponse.json({ users: list })
}

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user || !(session.user as any).isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
  }

  const body = await req.json()
  const { id, updates } = body as { id: string; updates: Record<string, any> }
  if (!id || !updates) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 })
  }

  const allowed = ["accountStatus", "subscriptionStatus", "plan", "credits", "isTrialActive", "role", "isAdmin"]
  const $set: any = { updatedAt: new Date() }
  for (const k of allowed) {
    if (k in updates) $set[k] = updates[k]
  }

  const { db } = await connectToDatabase()
  const users = db.collection("users")

  await users.updateOne({ _id: new ObjectId(id) }, { $set })
  const updated = await users.findOne({ _id: new ObjectId(id) }, { projection: { email: 1 } })
  return NextResponse.json({ ok: true, user: updated })
}
