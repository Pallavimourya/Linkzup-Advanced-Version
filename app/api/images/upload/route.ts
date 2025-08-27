import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { uploadToCloudinary } from "@/lib/cloudinary"

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const formData = await request.formData()
    const image = formData.get("image") as File
    const type = formData.get("type") as string // "post", "carousel", "ai-generated"

    if (!image) {
      return NextResponse.json({ error: "No image provided" }, { status: 400 })
    }

    // Check file size (10MB limit for content images)
    if (image.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: "File size too large. Maximum 10MB allowed." }, { status: 400 })
    }

    // Check file type
    if (!image.type.startsWith("image/")) {
      return NextResponse.json({ error: "Invalid file type. Only images are allowed." }, { status: 400 })
    }

    // Convert file to buffer
    const bytes = await image.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Determine folder based on type
    const folderMap: Record<string, string> = {
      post: "linkzup/post-images",
      carousel: "linkzup/carousel-images",
      "ai-generated": "linkzup/ai-images",
    }

    const folder = folderMap[type] || "linkzup/uploads"

    // Upload to Cloudinary with optimizations
    const uploadResult = await uploadToCloudinary(buffer, {
      folder,
      public_id: `${type}-${session.user.id}-${Date.now()}`,
      transformation: {
        quality: "auto:good",
        format: "auto",
        // Add responsive breakpoints for different screen sizes
        responsive_breakpoints: {
          create_derived: true,
          bytes_step: 20000,
          min_width: 200,
          max_width: 1200,
          transformation: {
            crop: "scale",
          },
        },
      },
    })

    return NextResponse.json({
      message: "Image uploaded successfully",
      imageUrl: uploadResult.secure_url,
      publicId: uploadResult.public_id,
      width: uploadResult.width,
      height: uploadResult.height,
    })
  } catch (error) {
    console.error("Image upload error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
