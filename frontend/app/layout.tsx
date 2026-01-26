import type React from "react"
import type { Metadata } from "next"
import { Inter, JetBrains_Mono } from "next/font/google"
import { AuthProvider } from "@/lib/auth-context"
import { Toaster } from "@/components/ui/toaster"
import "./globals.css"

const inter = Inter({
  subsets: ["latin"]
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"]
})

export const metadata: Metadata = {
  title: "VerbalQ | AI-Powered Text Intelligence Platform",
  description:
    "Advanced AI-powered text analysis, grammar correction, translation, and humanization. Transform your writing with VerbalQ's intelligent NLP tools.",
  generator: "v0.app",
  icons: {
    icon: [
      {
        url: "/icon-light-32x32.png",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/icon-dark-32x32.png",
        media: "(prefers-color-scheme: dark)",
      },
      {
        url: "/icon.svg",
        type: "image/svg+xml",
      },
    ],
    apple: "/apple-icon.png",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased`}>
        <AuthProvider>
        {children}
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  )
}
