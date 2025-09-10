import { NextResponse, type NextRequest } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { connectToDatabase } from "@/lib/mongodb"

export async function PUT(req: NextRequest, { params }: { params: { code: string } }) {
  const session = await getServerSession(authOptions)
  if (!session?.user || !(session.user as any).isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
  }
  const payload = await req.json()
  const { db } = await connectToDatabase()
  const $set: any = { updatedAt: new Date() }
  for (const k of ["type", "value", "maxRedemptions", "expiresAt", "active"]) {
    if (k in payload) $set[k] = k === "expiresAt" && payload[k] ? new Date(payload[k]) : payload[k]
  }
  await db.collection("coupons").updateOne({ code: params.code.toUpperCase() }, { $set })
  return NextResponse.json({ ok: true })
}

export async function DELETE(_req: NextRequest, { params }: { params: { code: string } }) {
  const session = await getServerSession(authOptions)
  if (!session?.user || !(session.user as any).isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
  }
  const { db } = await connectToDatabase()
  await db.collection("coupons").deleteOne({ code: params.code.toUpperCase() })
  return NextResponse.json({ ok: true })
}
