import type { NextAuthOptions } from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import LinkedInProvider from "next-auth/providers/linkedin"
import CredentialsProvider from "next-auth/providers/credentials"
import { MongoDBAdapter } from "@auth/mongodb-adapter"
import { MongoClient } from "mongodb"
import bcrypt from "bcryptjs"

const client = new MongoClient(process.env.MONGODB_URI!)
const clientPromise = client.connect()

export const authOptions: NextAuthOptions = {
  adapter: MongoDBAdapter(clientPromise),
  providers: [
    LinkedInProvider({
      clientId: process.env.LINKEDIN_CLIENT_ID!,
      clientSecret: process.env.LINKEDIN_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: "openid profile email w_member_social",
        },
      },
      issuer: "https://www.linkedin.com",
      jwks_endpoint: "https://www.linkedin.com/oauth/openid_jwks",
      profile(profile) {
        return {
          id: profile.sub,
          name: profile.name,
          email: profile.email,
          image: profile.picture,
        }
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const client = await clientPromise
        const users = client.db().collection("users")

        const user = await users.findOne({ email: credentials.email })

        if (!user || !user.password) {
          return null
        }

        const isPasswordValid = await bcrypt.compare(credentials.password, user.password)

        if (!isPasswordValid) {
          return null
        }

        return {
          id: user._id.toString(),
          email: user.email,
          name: user.name,
          image: user.image,
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/auth/signin",
    signUp: "/auth/signup",
  },
  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id
        const client = await clientPromise
        const users = client.db().collection("users")
        const userData = await users.findOne({ _id: user.id })

        if (userData) {
          token.credits = userData.credits || 0
          token.isTrialActive = userData.isTrialActive || false
          token.trialStartDate = userData.trialStartDate
          token.darkMode = userData.darkMode || false
        }
      }
      if (account?.provider === "linkedin") {
        token.linkedinId = account.providerAccountId
        token.accessToken = account.access_token
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string
        session.user.linkedinId = token.linkedinId as string
        session.user.accessToken = token.accessToken as string
        session.user.credits = token.credits as number
        session.user.isTrialActive = token.isTrialActive as boolean
        session.user.trialStartDate = token.trialStartDate as string
        session.user.darkMode = token.darkMode as boolean
      }
      return session
    },
  },
  events: {
    async signIn({ user, account, isNewUser }) {
      if (isNewUser) {
        const client = await clientPromise
        const users = client.db().collection("users")

        await users.updateOne(
          { _id: user.id },
          {
            $set: {
              credits: 0,
              trialStartDate: new Date(),
              trialPeriodDays: 2,
              isTrialActive: true,
              totalCreditsEver: 0,
              bio: null,
              profilePicture: null,
              darkMode: false,
              updatedAt: new Date(),
            },
          },
        )
      }
    },
  },
}
