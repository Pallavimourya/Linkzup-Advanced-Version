import { NextRequest, NextResponse } from "next/server"

interface SearchResult {
  id: string
  url: string
  thumbnail: string
  title?: string
  author?: string
  source: 'unsplash' | 'pexels' | 'pixabay' | 'serp'
}

export async function POST(request: NextRequest) {
  let query = ""
  let source = ""
  
  try {
    const body = await request.json()
    query = body.query || ""
    source = body.source || ""

    // Debug logging
    console.log("Search API called with:", { query, source, body })

    if (!query || !source) {
      console.log("Validation failed: missing query or source")
      return NextResponse.json(
        { error: "Query and source are required" },
        { status: 400 }
      )
    }

    // Validate source parameter
    const validSources = ["unsplash", "pexels", "pixabay", "google"]
    if (!validSources.includes(source)) {
      console.log("Validation failed: invalid source:", source)
      return NextResponse.json(
        { error: `Invalid source. Must be one of: ${validSources.join(", ")}` },
        { status: 400 }
      )
    }

    let results: SearchResult[] = []

    switch (source) {
      case "unsplash":
        results = await searchUnsplash(query)
        break
      case "pexels":
        results = await searchPexels(query)
        break
      case "pixabay":
        results = await searchPixabay(query)
        break
      case "google":
        results = await searchGoogleImages(query)
        break
      default:
        return NextResponse.json(
          { error: "Invalid source" },
          { status: 400 }
        )
    }

    // Return in the format expected by the frontend
    return NextResponse.json({
      success: true,
      images: results, // Changed from 'results' to 'images' to match frontend
      source,
      query
    })

  } catch (error) {
    console.error("Search error:", error)
    
    // Return fallback images when API fails
    const fallbackImages = generateFallbackImages(query || "images")
    
    return NextResponse.json({
      success: true,
      images: fallbackImages,
      source: "fallback",
      query: query || "images",
      message: "API search failed, showing fallback images"
    })
  }
}

// Generate fallback images when APIs fail
function generateFallbackImages(query: string): SearchResult[] {
  const fallbackUrls = [
    `https://via.placeholder.com/400x400/4F46E5/FFFFFF?text=${encodeURIComponent(query)}`,
    `https://via.placeholder.com/400x400/7C3AED/FFFFFF?text=${encodeURIComponent(query)}`,
    `https://via.placeholder.com/400x400/059669/FFFFFF?text=${encodeURIComponent(query)}`,
    `https://via.placeholder.com/400x400/DC2626/FFFFFF?text=${encodeURIComponent(query)}`,
    `https://via.placeholder.com/400x400/EA580C/FFFFFF?text=${encodeURIComponent(query)}`,
    `https://via.placeholder.com/400x400/DB2777/FFFFFF?text=${encodeURIComponent(query)}`,
    `https://via.placeholder.com/400x400/0891B2/FFFFFF?text=${encodeURIComponent(query)}`,
    `https://via.placeholder.com/400x400/65A30D/FFFFFF?text=${encodeURIComponent(query)}`,
    `https://via.placeholder.com/400x400/CA8A04/FFFFFF?text=${encodeURIComponent(query)}`,
    `https://via.placeholder.com/400x400/9333EA/FFFFFF?text=${encodeURIComponent(query)}`,
    `https://via.placeholder.com/400x400/16A34A/FFFFFF?text=${encodeURIComponent(query)}`,
    `https://via.placeholder.com/400x400/E11D48/FFFFFF?text=${encodeURIComponent(query)}`,
    `https://via.placeholder.com/400x400/0EA5E9/FFFFFF?text=${encodeURIComponent(query)}`,
    `https://via.placeholder.com/400x400/84CC16/FFFFFF?text=${encodeURIComponent(query)}`,
    `https://via.placeholder.com/400x400/F59E0B/FFFFFF?text=${encodeURIComponent(query)}`,
    `https://via.placeholder.com/400x400/EC4899/FFFFFF?text=${encodeURIComponent(query)}`,
    `https://via.placeholder.com/400x400/06B6D4/FFFFFF?text=${encodeURIComponent(query)}`,
    `https://via.placeholder.com/400x400/22C55E/FFFFFF?text=${encodeURIComponent(query)}`,
    `https://via.placeholder.com/400x400/F97316/FFFFFF?text=${encodeURIComponent(query)}`,
    `https://via.placeholder.com/400x400/A855F7/FFFFFF?text=${encodeURIComponent(query)}`
  ]

  return fallbackUrls.map((url, index) => ({
    id: `fallback-${index}`,
    url,
    thumbnail: url,
    title: `${query} image ${index + 1}`,
    author: "Fallback",
    source: 'unsplash' as const
  }))
}

async function searchUnsplash(query: string): Promise<SearchResult[]> {
  const apiKey = process.env.UNSPLASH_API_KEY
  if (!apiKey) {
    throw new Error("Unsplash API key not configured")
  }

  const response = await fetch(
    `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=20&orientation=landscape`,
    {
      headers: {
        Authorization: `Client-ID ${apiKey}`
      }
    }
  )

  if (!response.ok) {
    throw new Error(`Unsplash API error: ${response.status}`)
  }

  const data = await response.json()
  
  return data.results.map((photo: any) => ({
    id: photo.id,
    url: photo.urls.regular,
    thumbnail: photo.urls.small,
    title: photo.description || photo.alt_description,
    author: photo.user?.name,
    source: 'unsplash' as const
  }))
}

async function searchPexels(query: string): Promise<SearchResult[]> {
  const apiKey = process.env.PEXELS_API_KEY
  if (!apiKey) {
    throw new Error("Pexels API key not configured")
  }

  const response = await fetch(
    `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=20&orientation=landscape`,
    {
      headers: {
        Authorization: apiKey
      }
    }
  )

  if (!response.ok) {
    throw new Error(`Pexels API error: ${response.status}`)
  }

  const data = await response.json()
  
  return data.photos.map((photo: any) => ({
    id: photo.id.toString(),
    url: photo.src.large,
    thumbnail: photo.src.medium,
    title: photo.alt,
    author: photo.photographer,
    source: 'pexels' as const
  }))
}

async function searchPixabay(query: string): Promise<SearchResult[]> {
  const apiKey = process.env.PIXABAY_API_KEY
  if (!apiKey) {
    throw new Error("Pixabay API key not configured")
  }

  const response = await fetch(
    `https://pixabay.com/api/?key=${apiKey}&q=${encodeURIComponent(query)}&image_type=photo&orientation=horizontal&per_page=20`
  )

  if (!response.ok) {
    throw new Error(`Pixabay API error: ${response.status}`)
  }

  const data = await response.json()
  
  return data.hits.map((image: any) => ({
    id: image.id.toString(),
    url: image.largeImageURL,
    thumbnail: image.webformatURL,
    title: image.tags,
    author: image.user,
    source: 'pixabay' as const
  }))
}

async function searchGoogleImages(query: string): Promise<SearchResult[]> {
  const apiKey = process.env.SERP_API
  if (!apiKey) {
    throw new Error("SerpAPI key not configured")
  }

  const response = await fetch(
    `https://serpapi.com/search.json?engine=google_images&q=${encodeURIComponent(query)}&api_key=${apiKey}&num=20&safe=active`
  )

  if (!response.ok) {
    throw new Error(`SerpAPI error: ${response.status}`)
  }

  const data = await response.json()
  
  if (!data.images_results) {
    return []
  }

  return data.images_results.map((image: any, index: number) => ({
    id: `serp-${index}`,
    url: image.original,
    thumbnail: image.thumbnail,
    title: image.title,
    author: image.source,
    source: 'serp' as const
  }))
}
