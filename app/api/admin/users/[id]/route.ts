import { NextResponse, type NextRequest } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { connectToDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions) as any
    if (!session?.user || !(session.user as any).isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    if (!ObjectId.isValid(params.id)) {
      return NextResponse.json({ error: "Invalid user ID" }, { status: 400 })
    }

    const { db } = await connectToDatabase()
    const users = db.collection("users")
    const posts = db.collection("posts")
    const drafts = db.collection("drafts")
    const orders = db.collection("orders")
    const subscriptions = db.collection("subscriptions")
    const creditTransactions = db.collection("creditTransactions")

    // First, check if user exists and is not an admin
    const user = await users.findOne({ _id: new ObjectId(params.id) })
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    if (user.isAdmin) {
      return NextResponse.json({ error: "Cannot delete admin users" }, { status: 400 })
    }

    // Delete all related data
    const userId = new ObjectId(params.id)
    
    // Delete user's posts
    const postsResult = await posts.deleteMany({ userId })
    console.log(`Deleted ${postsResult.deletedCount} posts for user ${params.id}`)

    // Delete user's drafts
    const draftsResult = await drafts.deleteMany({ userId })
    console.log(`Deleted ${draftsResult.deletedCount} drafts for user ${params.id}`)

    // Delete user's orders
    const ordersResult = await orders.deleteMany({ userId })
    console.log(`Deleted ${ordersResult.deletedCount} orders for user ${params.id}`)

    // Delete user's subscriptions
    const subscriptionsResult = await subscriptions.deleteMany({ userId })
    console.log(`Deleted ${subscriptionsResult.deletedCount} subscriptions for user ${params.id}`)

    // Delete user's credit transactions
    const creditTransactionsResult = await creditTransactions.deleteMany({ userId })
    console.log(`Deleted ${creditTransactionsResult.deletedCount} credit transactions for user ${params.id}`)

    // Finally, delete the user
    const userResult = await users.deleteOne({ _id: userId })
    
    if (userResult.deletedCount === 0) {
      return NextResponse.json({ error: "Failed to delete user" }, { status: 500 })
    }

    console.log(`Successfully deleted user ${params.id} and all related data`)

    return NextResponse.json({ 
      success: true, 
      message: "User and all related data deleted successfully",
      deletedData: {
        user: userResult.deletedCount,
        posts: postsResult.deletedCount,
        drafts: draftsResult.deletedCount,
        orders: ordersResult.deletedCount,
        subscriptions: subscriptionsResult.deletedCount,
        creditTransactions: creditTransactionsResult.deletedCount
      }
    })

  } catch (error) {
    console.error("Error deleting user:", error)
    return NextResponse.json({ error: "Failed to delete user" }, { status: 500 })
  }
}
