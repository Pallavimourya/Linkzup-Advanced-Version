import { NextRequest, NextResponse } from "next/server"
import { v2 as cloudinary } from "cloudinary"
import OpenAI from "openai"

// Lazy initialization to avoid build-time errors
let openai: OpenAI | null = null

function getOpenAI() {
  if (!openai) {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error("OPENAI_API_KEY environment variable is required")
    }
    openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    })
  }
  return openai
}

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export async function POST(request: NextRequest) {
  try {
    const { prompt } = await request.json()

    if (!prompt) {
      return NextResponse.json(
        { error: "Prompt is required" },
        { status: 400 }
      )
    }

    // Generate image using OpenAI DALL-E
    const response = await getOpenAI().images.generate({
      model: "dall-e-3",
      prompt: `${prompt}. High quality, professional, suitable for business presentations and LinkedIn carousels.`,
      n: 1,
      size: "1024x1024",
      quality: "standard",
      style: "natural",
    })

    if (!response.data || response.data.length === 0) {
      throw new Error("No image generated")
    }

    const imageUrl = response.data[0].url
    if (!imageUrl) {
      throw new Error("Generated image URL is missing")
    }

    // Download the generated image
    const imageResponse = await fetch(imageUrl)
    if (!imageResponse.ok) {
      throw new Error("Failed to download generated image")
    }

    const imageBuffer = Buffer.from(await imageResponse.arrayBuffer())

    // Upload to Cloudinary
    const uploadResult = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          folder: "linkzup-ai-generated",
          resource_type: "image",
          transformation: [
            { width: 1200, height: 1200, crop: "limit" },
            { quality: "auto" }
          ]
        },
        (error, result) => {
          if (error) reject(error)
          else resolve(result)
        }
      ).end(imageBuffer)
    })

    return NextResponse.json({
      success: true,
      url: (uploadResult as any).secure_url,
      publicId: (uploadResult as any).public_id,
      prompt,
      originalUrl: imageUrl,
    })

  } catch (error) {
    console.error("AI generation error:", error)
    
    // Provide more specific error messages
    if (error instanceof Error) {
      if (error.message.includes("billing")) {
        return NextResponse.json(
          { error: "OpenAI billing issue. Please check your OpenAI account." },
          { status: 402 }
        )
      }
      if (error.message.includes("content_policy")) {
        return NextResponse.json(
          { error: "The prompt violates OpenAI's content policy. Please try a different prompt." },
          { status: 400 }
        )
      }
    }

    return NextResponse.json(
      { error: "Failed to generate image. Please try again." },
      { status: 500 }
    )
  }
}
