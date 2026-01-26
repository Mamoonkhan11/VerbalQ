"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Shield } from "lucide-react"

export default function Navbar() {
  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-sm">
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
              <span className="hidden lg:block text-[10px] font-bold text-slate-400 uppercase tracking-tighter mt-1">
                by vionys
              </span>
            </Link>
          </div>

          {/* Auth Buttons */}
          <div className="flex items-center gap-3">
            <Button variant="ghost" asChild className="text-foreground hover:bg-accent hover:text-accent-foreground transition-colors">
              <Link href="/login" className="font-medium">
                Sign In
              </Link>
            </Button>
            <Button
              variant="outline"
              size="sm"
              asChild
              className="border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100 hover:border-amber-300 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-300 dark:hover:bg-amber-900"
            >
              <Link href="/admin/login" className="flex items-center gap-2">
                <Shield className="w-4 h-4" />
                <span className="hidden sm:inline">Admin</span>
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </nav>
  )
}
