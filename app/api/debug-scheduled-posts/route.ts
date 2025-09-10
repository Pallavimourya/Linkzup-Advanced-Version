import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { connectToDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions) as any
    if (!session?.user?.email || !session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { db } = await connectToDatabase()
    
    // Debug: Check if user exists
    const user = await db.collection("users").findOne({ _id: new ObjectId(session.user.id) })
    
    // Debug: Check all scheduled posts for this user
    const allPosts = await db.collection("scheduled_posts")
      .find({ userId: new ObjectId(session.user.id) })
      .toArray()
    
    // Debug: Check posts with different userId formats
    const postsWithStringId = await db.collection("scheduled_posts")
      .find({ userId: session.user.id })
      .toArray()
    
    const postsWithEmail = await db.collection("scheduled_posts")
      .find({ userEmail: session.user.email })
      .toArray()
    
    // Debug: Check collection stats
    const totalPosts = await db.collection("scheduled_posts").countDocuments({})
    const userPostsCount = await db.collection("scheduled_posts").countDocuments({ 
      userId: new ObjectId(session.user.id) 
    })
    
    // Debug: Check if collection exists and has data
    const collections = await db.listCollections().toArray()
    const scheduledPostsCollection = collections.find(col => col.name === "scheduled_posts")
    
    return NextResponse.json({
      success: true,
      debug: {
        session: {
          userId: session.user.id,
          userEmail: session.user.email,
          userIdType: typeof session.user.id
        },
        user: user ? { id: user._id, email: user.email } : null,
        collections: collections.map(col => col.name),
        scheduledPostsCollection: scheduledPostsCollection ? "exists" : "missing",
        totalPostsInCollection: totalPosts,
        userPostsCount,
        allPosts: allPosts.map(post => ({
          _id: post._id,
          userId: post.userId,
          userIdType: typeof post.userId,
          userEmail: post.userEmail,
          content: post.content?.substring(0, 50) + "...",
          status: post.status,
          scheduledFor: post.scheduledFor
        })),
        postsWithStringId: postsWithStringId.length,
        postsWithEmail: postsWithEmail.length
      }
    })
  } catch (error) {
    console.error("Error debugging scheduled posts:", error)
    return NextResponse.json({ 
      error: "Failed to debug scheduled posts",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 })
  }
}
