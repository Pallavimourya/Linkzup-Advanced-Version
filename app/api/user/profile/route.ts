import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { MongoClient, ObjectId } from "mongodb"

export const dynamic = 'force-dynamic'

const client = new MongoClient(process.env.MONGODB_URI || "mongodb://localhost:27017/Linkzup-Advanced")

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions) as any
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await client.connect()
    const users = client.db("Linkzup-Advanced").collection("users")

    const user = await users.findOne(
      { _id: new ObjectId(session.user.id) },
      { projection: { name: 1, email: 1, bio: 1, image: 1, profilePicture: 1 } }
    )

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    return NextResponse.json({
      name: user.name,
      email: user.email,
      bio: user.bio || "",
      profilePicture: user.profilePicture || user.image || "",
    })
  } catch (error) {
    console.error("Profile fetch error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  } finally {
    await client.close()
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions) as any
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { name, email, bio } = await request.json()

    if (!name || !email) {
      return NextResponse.json({ error: "Name and email are required" }, { status: 400 })
    }

    await client.connect()
    const users = client.db("Linkzup-Advanced").collection("users")

    const result = await users.updateOne(
      { _id: new ObjectId(session.user.id) },
      {
        $set: {
          name,
          email,
          bio: bio || null,
          updatedAt: new Date(),
        },
      },
    )

    if (result.modifiedCount === 0) {
      return NextResponse.json({ error: "Failed to update profile" }, { status: 400 })
    }

    return NextResponse.json({ message: "Profile updated successfully" })
  } catch (error) {
    console.error("Profile update error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  } finally {
    await client.close()
  }
}
