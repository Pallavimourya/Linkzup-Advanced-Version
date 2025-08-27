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
  // TODO: Implement actual API call to save draft to MongoDB
  const newDraft: Draft = {
    ...draft,
    id: Date.now().toString(),
    createdAt: new Date(),
    lastModified: new Date(),
  }

  // For now, save to localStorage as fallback
  const existingDrafts = JSON.parse(localStorage.getItem("linkzup_drafts") || "[]")
  const updatedDrafts = [newDraft, ...existingDrafts]
  localStorage.setItem("linkzup_drafts", JSON.stringify(updatedDrafts))

  return newDraft
}

export async function getDraftsFromDB(): Promise<Draft[]> {
  // TODO: Implement actual API call to fetch drafts from MongoDB
  // For now, get from localStorage as fallback
  const drafts = JSON.parse(localStorage.getItem("linkzup_drafts") || "[]")
  return drafts.map((draft: any) => ({
    ...draft,
    createdAt: new Date(draft.createdAt),
    lastModified: new Date(draft.lastModified),
  }))
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
  // TODO: Implement actual API call to delete draft from MongoDB
  const existingDrafts = JSON.parse(localStorage.getItem("linkzup_drafts") || "[]")
  const updatedDrafts = existingDrafts.filter((draft: Draft) => draft.id !== draftId)
  localStorage.setItem("linkzup_drafts", JSON.stringify(updatedDrafts))
}
