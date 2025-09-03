export interface Draft {
  id: string
  title: string
  content: string
  type: "text" | "carousel" | "story" | "viral-inspired"
  category: string
  createdAt: Date
  lastModified: Date
  wordCount: number
  tags: string[]
  source?: string
  carouselData?: {
    slides: Array<{
      id: string
      background: string
      text: string
      fontSize: number
      fontFamily: string
      textPosition: { x: number; y: number }
    }>
  }
}

export async function saveDraftToDB(draft: Omit<Draft, "id" | "createdAt" | "lastModified">) {
  try {
    const response = await fetch("/api/drafts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: draft.title,
        content: draft.content,
        format: draft.type,
        niche: draft.category
      })
    })

    if (response.ok) {
      const data = await response.json()
      const newDraft: Draft = {
        ...draft,
        id: data.draftId || Date.now().toString(),
        createdAt: new Date(),
        lastModified: new Date(),
      }
      return newDraft
    } else {
      throw new Error("Failed to save draft to API")
    }
  } catch (error) {
    console.error("Error saving draft to API:", error)
    // Fallback to localStorage
    const newDraft: Draft = {
      ...draft,
      id: Date.now().toString(),
      createdAt: new Date(),
      lastModified: new Date(),
    }

    const existingDrafts = JSON.parse(localStorage.getItem("linkzup_drafts") || "[]")
    const updatedDrafts = [newDraft, ...existingDrafts]
    localStorage.setItem("linkzup_drafts", JSON.stringify(updatedDrafts))

    return newDraft
  }
}

export async function getDraftsFromDB(): Promise<Draft[]> {
  try {
    const response = await fetch("/api/drafts", {
      method: "GET",
      headers: { "Content-Type": "application/json" }
    })

    if (response.ok) {
      const data = await response.json()
      return data.drafts.map((draft: any) => ({
        id: draft._id || draft.id,
        title: draft.title,
        content: draft.content,
        type: draft.format || "text",
        category: draft.niche || "General",
        createdAt: new Date(draft.createdAt),
        lastModified: new Date(draft.updatedAt || draft.createdAt),
        wordCount: draft.content?.split(' ').length || 0,
        tags: [],
        source: draft.format
      }))
    } else {
      console.error("Failed to fetch drafts from API")
      // Fallback to localStorage
      const drafts = JSON.parse(localStorage.getItem("linkzup_drafts") || "[]")
      return drafts.map((draft: any) => ({
        ...draft,
        createdAt: new Date(draft.createdAt),
        lastModified: new Date(draft.lastModified),
      }))
    }
  } catch (error) {
    console.error("Error fetching drafts:", error)
    // Fallback to localStorage
    const drafts = JSON.parse(localStorage.getItem("linkzup_drafts") || "[]")
    return drafts.map((draft: any) => ({
      ...draft,
      createdAt: new Date(draft.createdAt),
      lastModified: new Date(draft.lastModified),
    }))
  }
}

export async function updateDraftInDB(draftId: string, updates: Partial<Draft>) {
  // TODO: Implement actual API call to update draft in MongoDB
  const existingDrafts = JSON.parse(localStorage.getItem("linkzup_drafts") || "[]")
  const updatedDrafts = existingDrafts.map((draft: Draft) =>
    draft.id === draftId ? { ...draft, ...updates, lastModified: new Date() } : draft,
  )
  localStorage.setItem("linkzup_drafts", JSON.stringify(updatedDrafts))
}

export async function deleteDraftFromDB(draftId: string) {
  try {
    const response = await fetch(`/api/drafts/${draftId}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" }
    })

    if (response.ok) {
      // Also remove from localStorage as backup
      const existingDrafts = JSON.parse(localStorage.getItem("linkzup_drafts") || "[]")
      const updatedDrafts = existingDrafts.filter((draft: Draft) => draft.id !== draftId)
      localStorage.setItem("linkzup_drafts", JSON.stringify(updatedDrafts))
      return true
    } else {
      throw new Error("Failed to delete draft from API")
    }
  } catch (error) {
    console.error("Error deleting draft from API:", error)
    // Fallback to localStorage only
    const existingDrafts = JSON.parse(localStorage.getItem("linkzup_drafts") || "[]")
    const updatedDrafts = existingDrafts.filter((draft: Draft) => draft.id !== draftId)
    localStorage.setItem("linkzup_drafts", JSON.stringify(updatedDrafts))
    return true
  }
}
