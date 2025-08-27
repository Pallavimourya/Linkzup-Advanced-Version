declare module "next-auth" {
  interface Session {
    user: {
      id: string
      name?: string | null
      email?: string | null
      image?: string | null
      linkedinId?: string
      accessToken?: string
      credits?: number
      isTrialActive?: boolean
      trialStartDate?: string
      darkMode?: boolean
    }
  }

  interface User {
    id: string
    name?: string | null
    email?: string | null
    image?: string | null
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    linkedinId?: string
    accessToken?: string
    credits?: number
    isTrialActive?: boolean
    trialStartDate?: string
    darkMode?: boolean
  }
}
