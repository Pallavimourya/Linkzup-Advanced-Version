// @ts-ignore
import type { NextAuthOptions } from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import LinkedInProvider from "next-auth/providers/linkedin"
import CredentialsProvider from "next-auth/providers/credentials"
import { MongoDBAdapter } from "@auth/mongodb-adapter"
import { MongoClient } from "mongodb"
import bcrypt from "bcryptjs"
import { sendWelcomeEmail } from "@/lib/email-utils"

const client = new MongoClient(process.env.MONGODB_URI || "mongodb://localhost:27017/Linkzup-Advanced", {
  retryWrites: true,
  w: 'majority' as const,
  maxPoolSize: 10,
  serverSelectionTimeoutMS: 10000,
  socketTimeoutMS: 45000,
  // Enable SSL for MongoDB Atlas connections
  ssl: (process.env.MONGODB_URI || "").includes('mongodb+srv://') ? true : false,
})

const clientPromise = client.connect()

export const authOptions: NextAuthOptions = {
  debug: process.env.NODE_ENV === 'development',
  adapter: MongoDBAdapter(clientPromise),
  providers: [
    LinkedInProvider({
      clientId: process.env.LINKEDIN_CLIENT_ID!,
      clientSecret: process.env.LINKEDIN_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: "openid profile email w_member_social r_events",
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
          linkedinId: profile.sub,
        }
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      profile(profile) {
        return {
          id: profile.sub,
          name: profile.name,
          email: profile.email,
          image: profile.picture,
          googleId: profile.sub,
        }
      },
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          if (!credentials?.email) {
            return null
          }

          // Support fixed admin credentials (works even without database)
          const FIXED_ADMIN_EMAIL = "admin@linkzup.com"
          const FIXED_ADMIN_PASSWORD = "admin4321"

          // Admin login - always allow, even if database fails
          if (credentials.email.toLowerCase() === FIXED_ADMIN_EMAIL && credentials.password === FIXED_ADMIN_PASSWORD) {
            console.log("Admin login successful - using fixed credentials")
            return {
              id: "admin-fixed",
              email: FIXED_ADMIN_EMAIL,
              name: "Administrator",
              image: null as any,
            }
          }

          // For non-admin users, try database connection
          try {
            const client = await clientPromise
            const users = client.db("Linkzup-Advanced").collection("users")

            // Normal user sign-in flow
            const user = await users.findOne({ email: credentials.email })
            if (!user) {
              console.log("User not found in database:", credentials.email)
              return null
            }

            // If user has a LinkedIn connection and no password is provided, allow sign-in
            if (user.linkedinConnected && (!credentials.password || credentials.password === "")) {
              console.log("LinkedIn user login successful:", credentials.email)
              return {
                id: user._id.toString(),
                email: user.email,
                name: user.name,
                image: user.image,
              }
            }

            // If user has a password, verify it
            if (user.password && credentials.password) {
              const isPasswordValid = await bcrypt.compare(credentials.password, user.password)
              if (isPasswordValid) {
                console.log("User login successful:", credentials.email)
                return {
                  id: user._id.toString(),
                  email: user.email,
                  name: user.name,
                  image: user.image,
                }
              } else {
                console.log("Invalid password for user:", credentials.email)
              }
            }

            console.log("Login failed for user:", credentials.email)
            return null
          } catch (error) {
            console.error("Database connection error:", error)
            // Only allow admin login when database is down
            if (credentials.email.toLowerCase() === FIXED_ADMIN_EMAIL && credentials.password === FIXED_ADMIN_PASSWORD) {
              console.log("Admin login successful - database down, using fixed credentials")
              return {
                id: "admin-fixed",
                email: FIXED_ADMIN_EMAIL,
                name: "Administrator",
                image: null as any,
              }
            }
            console.log("Login failed - database down and not admin user")
            return null
          }
        } catch (error) {
          console.error("Authentication error:", error)
          return null
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
    async jwt({ token, user, account }: any) {
      if (user) {
        token.id = user.id
        
        // Handle admin fallback case
        if (user.id === "admin-fixed") {
          token.credits = 1000
          token.isTrialActive = false
          token.darkMode = false
          token.profilePicture = null
          token.role = "admin"
          token.isAdmin = true
          token.linkedinConnected = false
          token.googleConnected = false
          return token
        }
        
        // Handle normal user case
        try {
          const client = await clientPromise
          const users = client.db("Linkzup-Advanced").collection("users")
          const { ObjectId } = await import("mongodb")
          
          // Check if user.id is a valid ObjectId
          if (ObjectId.isValid(user.id)) {
            const userData = await users.findOne({ _id: new ObjectId(user.id) })

            if (userData) {
              token.credits = userData.credits || 0
              token.isTrialActive = userData.isTrialActive || false
              token.trialStartDate = userData.trialStartDate
              token.darkMode = userData.darkMode || false
              token.profilePicture = userData.profilePicture || userData.image || null
              // Include roles
              token.role = (userData as any).role || "user"
              token.isAdmin = !!(userData as any).isAdmin || (userData as any).role === "admin"

              // LinkedIn data
              if (userData.linkedinId && userData.linkedinAccessToken) {
                token.linkedinId = userData.linkedinId
                token.accessToken = userData.linkedinAccessToken
                token.linkedinConnected = true
              } else {
                token.linkedinId = undefined
                token.accessToken = undefined
                token.linkedinConnected = false
              }
            }
          }
        } catch (error) {
          console.error("JWT callback database error:", error)
          // Set default values if database fails
          token.credits = 0
          token.isTrialActive = false
          token.darkMode = false
          token.profilePicture = null
          token.role = "user"
          token.isAdmin = false
          token.linkedinConnected = false
          token.googleConnected = false
        }
      }
      if (account?.provider === "linkedin") {
        token.linkedinId = account.providerAccountId
        token.accessToken = account.access_token
        token.linkedinConnected = true

        // Update user's LinkedIn connection in database (only if valid ObjectId)
        try {
          const client = await clientPromise
          const users = client.db("Linkzup-Advanced").collection("users")
          const { ObjectId } = await import("mongodb")
          
          if (ObjectId.isValid(token.id)) {
            await users.updateOne(
              { _id: new ObjectId(token.id) },
              {
                $set: {
                  linkedinId: account.providerAccountId,
                  linkedinConnected: true,
                  linkedinConnectedAt: new Date(),
                  linkedinAccessToken: account.access_token,
                  updatedAt: new Date(),
                },
              },
            )
          }
        } catch (error) {
          console.error("LinkedIn OAuth database update error:", error)
        }
      }

      // Handle Google OAuth callback
      if (account?.provider === "google") {
        token.googleId = account.providerAccountId
        token.googleConnected = true

        // Update user's Google connection in database (only if valid ObjectId)
        try {
          const client = await clientPromise
          const users = client.db("Linkzup-Advanced").collection("users")
          const { ObjectId } = await import("mongodb")
          
          if (ObjectId.isValid(token.id)) {
            await users.updateOne(
              { _id: new ObjectId(token.id) },
              {
                $set: {
                  googleId: account.providerAccountId,
                  googleConnected: true,
                  googleConnectedAt: new Date(),
                  updatedAt: new Date(),
                },
              },
            )
          }
        } catch (error) {
          console.error("Google OAuth database update error:", error)
        }
      }
      return token
    },
    async session({ session, token }: any) {
      if (token) {
        session.user.id = token.id as string
        session.user.linkedinId = token.linkedinId as string
        session.user.accessToken = token.accessToken as string
        session.user.credits = token.credits as number
        session.user.isTrialActive = token.isTrialActive as boolean
        session.user.trialStartDate = token.trialStartDate as string
        session.user.darkMode = token.darkMode as boolean
        session.user.profilePicture = token.profilePicture as string
        // Expose roles
        ;(session.user as any).role = token.role as string
        ;(session.user as any).isAdmin = token.isAdmin as boolean

        session.user.linkedinConnected = !!(token.linkedinId && token.accessToken)
        session.user.googleConnected = !!(token.googleId)
      }
      return session
    },
  },
  events: {
    async signIn({ user, account, isNewUser }: any) {
      if (isNewUser && user.id !== "admin-fixed") {
        try {
          const client = await clientPromise
          const users = client.db("Linkzup-Advanced").collection("users")
          const { ObjectId } = await import("mongodb")
          
          if (ObjectId.isValid(user.id)) {
            await users.updateOne(
              { _id: new ObjectId(user.id) },
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

          // Send welcome email to new OAuth users
          if (user.email && user.name) {
            try {
              await sendWelcomeEmail({
                name: user.name,
                email: user.email,
              })
              console.log(`Welcome email sent to OAuth user: ${user.email}`)
            } catch (emailError) {
              console.error("Failed to send welcome email to OAuth user:", emailError)
              // Don't fail the sign-in if email fails
            }
          }
        } catch (error) {
          console.error("SignIn event database error:", error)
        }
      }
    },
  },
}
