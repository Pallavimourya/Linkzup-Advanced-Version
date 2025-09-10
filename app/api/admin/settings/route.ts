import { NextResponse, type NextRequest } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { connectToDatabase } from "@/lib/mongodb"

export async function GET() {
  const { db } = await connectToDatabase()
  const settings = await db.collection("settings").findOne({}, { projection: { _id: 0 } })
  return NextResponse.json({ settings: settings || {} })
}

export async function PUT(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user || !(session.user as any).isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
  }
  const payload = await req.json()
  const { db } = await connectToDatabase()
  await db
    .collection("settings")
    .updateOne({}, { $set: payload, $setOnInsert: { createdAt: new Date() } }, { upsert: true })
  return NextResponse.json({ ok: true })
}
