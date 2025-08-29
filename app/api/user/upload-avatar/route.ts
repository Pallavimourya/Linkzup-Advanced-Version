import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { MongoClient, ObjectId } from "mongodb"
import { uploadToCloudinary, deleteFromCloudinary, extractPublicIdFromUrl } from "@/lib/cloudinary"

export const dynamic = 'force-dynamic'

const client = new MongoClient(process.env.MONGODB_URI || "mongodb://localhost:27017/Linkzup-Advanced")

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions) as any
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const formData = await request.formData()
    const image = formData.get("image") as File

    if (!image) {
      return NextResponse.json({ error: "No image provided" }, { status: 400 })
    }

    // Check file size (5MB limit)
    if (image.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: "File size too large. Maximum 5MB allowed." }, { status: 400 })
    }

    // Check file type
    if (!image.type.startsWith("image/")) {
      return NextResponse.json({ error: "Invalid file type. Only images are allowed." }, { status: 400 })
    }

    // Convert file to buffer
    const bytes = await image.arrayBuffer()
    const buffer = Buffer.from(bytes)

    await client.connect()
    const users = client.db("Linkzup-Advanced").collection("users")

    // Get current user to check for existing profile picture
    const currentUser = await users.findOne({ _id: new ObjectId(session.user.id) })

    // Delete old profile picture from Cloudinary if it exists
    if (currentUser?.profilePicture) {
      const oldPublicId = extractPublicIdFromUrl(currentUser.profilePicture)
      if (oldPublicId) {
        try {
          await deleteFromCloudinary(oldPublicId)
        } catch (error) {
          console.error("Error deleting old profile picture:", error)
          // Continue with upload even if deletion fails
        }
      }
    }

    // Upload to Cloudinary
    const uploadResult = await uploadToCloudinary(buffer, {
      folder: "linkzup/profile-pictures",
      public_id: `user-${session.user.id}-${Date.now()}`,
      transformation: {
        width: 400,
        height: 400,
        crop: "fill",
        gravity: "face",
        quality: "auto:good",
        format: "auto",
      },
    })

    // Update user profile with new image URL
    const result = await users.updateOne(
      { _id: new ObjectId(session.user.id) },
      {
        $set: {
          image: uploadResult.secure_url,
          profilePicture: uploadResult.secure_url,
          updatedAt: new Date(),
        },
      },
    )

    if (result.modifiedCount === 0) {
      return NextResponse.json({ error: "Failed to update profile picture" }, { status: 400 })
    }

    return NextResponse.json({
      message: "Profile picture updated successfully",
      imageUrl: uploadResult.secure_url,
    })
  } catch (error) {
    console.error("Avatar upload error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  } finally {
    await client.close()
  }
}
