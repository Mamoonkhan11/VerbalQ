"use client"

import type React from "react"
import Link from "next/link"
import { Shield } from "lucide-react"

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen w-full bg-background">
      {/* Header with VerbalQ branding and admin login */}
      <header className="border-b border-border bg-background/95 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <div className="flex items-center">
              <Link href="/" className="flex items-center space-x-2 group">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform duration-200">
                  <span className="text-white font-bold text-sm">VQ</span>
                </div>
                <span className="font-bold text-xl bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                  VerbalQ
                </span>
              </Link>
            </div>

            {/* Admin Login Button */}
            <div className="flex items-center">
              <Link
                href="/admin/login"
                className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-medium rounded-lg shadow-md hover:shadow-lg transition-all duration-200"
              >
                <Shield className="w-4 h-4" />
                <span className="hidden sm:inline">Admin Login</span>
            </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex min-h-[calc(100vh-64px)] items-center justify-center px-4 py-12">{children}</main>
    </div>
  )
}
