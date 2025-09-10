// Multi-source image search utility
export interface ImageResult {
  id: string
  url: string
  thumbnail: string
  alt: string
  source: "unsplash" | "pexels" | "pixabay"
}

export async function searchImages(query: string, count = 12): Promise<ImageResult[]> {
  const results: ImageResult[] = []

  try {
    // Unsplash API
    if (process.env.UNSPLASH_ACCESS_KEY) {
      const unsplashResponse = await fetch(
        `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=${Math.ceil(count / 3)}`,
        {
          headers: {
            Authorization: `Client-ID ${process.env.UNSPLASH_ACCESS_KEY}`,
          },
        },
      )

      if (unsplashResponse.ok) {
        const data = await unsplashResponse.json()
        results.push(
          ...data.results.map((img: any) => ({
            id: img.id,
            url: img.urls.regular,
            thumbnail: img.urls.thumb,
            alt: img.alt_description || query,
            source: "unsplash" as const,
          })),
        )
      }
    }

    // Pexels API
    if (process.env.PEXELS_API_KEY) {
      const pexelsResponse = await fetch(
        `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=${Math.ceil(count / 3)}`,
        {
          headers: {
            Authorization: process.env.PEXELS_API_KEY,
          },
        },
      )

      if (pexelsResponse.ok) {
        const data = await pexelsResponse.json()
        results.push(
          ...data.photos.map((img: any) => ({
            id: img.id.toString(),
            url: img.src.large,
            thumbnail: img.src.medium,
            alt: img.alt || query,
            source: "pexels" as const,
          })),
        )
      }
    }

    // Pixabay API
    if (process.env.PIXABAY_API_KEY) {
      const pixabayResponse = await fetch(
        `https://pixabay.com/api/?key=${process.env.PIXABAY_API_KEY}&q=${encodeURIComponent(query)}&image_type=photo&per_page=${Math.ceil(count / 3)}`,
      )

      if (pixabayResponse.ok) {
        const data = await pixabayResponse.json()
        results.push(
          ...data.hits.map((img: any) => ({
            id: img.id.toString(),
            url: img.largeImageURL,
            thumbnail: img.previewURL,
            alt: img.tags || query,
            source: "pixabay" as const,
          })),
        )
      }
    }

    return results.slice(0, count)
  } catch (error) {
    console.error("Error searching images:", error)
    return []
  }
}
