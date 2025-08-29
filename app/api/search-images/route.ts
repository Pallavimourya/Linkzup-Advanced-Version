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
  try {
    const { query, source } = await request.json()

    if (!query || !source) {
      return NextResponse.json(
        { error: "Query and source are required" },
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
      case "serp":
        results = await searchGoogleImages(query)
        break
      default:
        return NextResponse.json(
          { error: "Invalid source" },
          { status: 400 }
        )
    }

    return NextResponse.json({
      success: true,
      results,
      source,
      query
    })

  } catch (error) {
    console.error("Search error:", error)
    return NextResponse.json(
      { error: "Failed to search images" },
      { status: 500 }
    )
  }
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
