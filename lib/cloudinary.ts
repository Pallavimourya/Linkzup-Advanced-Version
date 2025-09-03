import { v2 as cloudinary } from "cloudinary"

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export interface CloudinaryUploadResult {
  public_id: string
  secure_url: string
  width: number
  height: number
  format: string
  resource_type: string
}

export async function uploadToCloudinary(
  file: Buffer,
  options: {
    folder?: string
    public_id?: string
    transformation?: any
    resource_type?: "image" | "video" | "raw" | "auto"
  } = {},
): Promise<CloudinaryUploadResult> {
  return new Promise((resolve, reject) => {
    const uploadOptions = {
      folder: options.folder || "linkzup",
      public_id: options.public_id,
      transformation: options.transformation,
      resource_type: options.resource_type || "auto",
      quality: "auto:good",
      fetch_format: "auto",
    }

    cloudinary.uploader
      .upload_stream(uploadOptions, (error, result) => {
        if (error) {
          reject(error)
        } else if (result) {
          resolve({
            public_id: result.public_id,
            secure_url: result.secure_url,
            width: result.width,
            height: result.height,
            format: result.format,
            resource_type: result.resource_type,
          })
        } else {
          reject(new Error("Upload failed"))
        }
      })
      .end(file)
  })
}

export async function deleteFromCloudinary(publicId: string): Promise<void> {
  try {
    await cloudinary.uploader.destroy(publicId)
  } catch (error) {
    console.error("Error deleting from Cloudinary:", error)
    throw error
  }
}

export function getOptimizedImageUrl(
  publicId: string,
  options: {
    width?: number
    height?: number
    crop?: string
    quality?: string | number
    format?: string
  } = {},
): string {
  const transformation = []

  if (options.width || options.height) {
    const cropMode = options.crop || "fill"
    transformation.push(`c_${cropMode}`)
    if (options.width) transformation.push(`w_${options.width}`)
    if (options.height) transformation.push(`h_${options.height}`)
  }

  if (options.quality) {
    transformation.push(`q_${options.quality}`)
  } else {
    transformation.push("q_auto:good")
  }

  if (options.format) {
    transformation.push(`f_${options.format}`)
  } else {
    transformation.push("f_auto")
  }

  const transformationString = transformation.join(",")
  return cloudinary.url(publicId, {
    transformation: transformationString,
    secure: true,
  })
}

export function extractPublicIdFromUrl(cloudinaryUrl: string): string | null {
  try {
    const regex = /\/v\d+\/(.+)\.[a-zA-Z]+$/
    const match = cloudinaryUrl.match(regex)
    return match ? match[1] : null
  } catch (error) {
    console.error("Error extracting public ID:", error)
    return null
  }
}

export default cloudinary
