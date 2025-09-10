declare module "next-auth" {
  interface Session {
    user: {
      id: string
      name?: string | null
      email?: string | null
      image?: string | null
      linkedinId?: string
      accessToken?: string
      linkedinConnected?: boolean
      googleId?: string
      googleConnected?: boolean
      credits?: number
      isTrialActive?: boolean
      trialStartDate?: string
      darkMode?: boolean
      role?: string
      isAdmin?: boolean
      profilePicture?: string | null
    }
  }

  interface User {
    id: string
    name?: string | null
    email?: string | null
    image?: string | null
    role?: string
    isAdmin?: boolean
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    linkedinId?: string
    accessToken?: string
    linkedinConnected?: boolean
    googleId?: string
    googleConnected?: boolean
    credits?: number
    isTrialActive?: boolean
    trialStartDate?: string
    darkMode?: boolean
    role?: string
    isAdmin?: boolean
    profilePicture?: string | null
  }
}
