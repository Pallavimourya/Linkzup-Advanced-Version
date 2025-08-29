import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import "./globals.css"
import { AuthProvider } from "@/components/auth-provider"
import { ThemeProvider } from "@/components/theme-provider"

export const metadata: Metadata = {
  title: "LinkzUp - AI-Powered LinkedIn Content Management",
  description: "Transform your LinkedIn presence with AI-powered content creation and scheduling",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning className="dark">
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Clear any stored theme preferences
              localStorage.removeItem('theme');
              sessionStorage.removeItem('theme');
              // Force dark theme
              document.documentElement.classList.add('dark');
              document.documentElement.classList.remove('light');
            `,
          }}
        />
      </head>
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false} disableTransitionOnChange forcedTheme="dark">
          <AuthProvider>{children}</AuthProvider>
        </ThemeProvider>
        <script
          src="https://checkout.razorpay.com/v1/checkout.js"
          async
        />
      </body>
    </html>
  )
}
