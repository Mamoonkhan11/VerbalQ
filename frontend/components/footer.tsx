"use client"

import Link from "next/link"

export default function Footer() {
  return (
    <footer className="relative w-full border-t border-border bg-secondary/50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mb-8">
          {/* Left Section */}
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-2">VerbalQ</h3>
            <p className="text-muted-foreground text-sm">
              Transform your text with AI-powered tools. Grammar correction, translation, humanization, and more.
            </p>
          </div>

          {/* Right Section - Links */}
          <div className="sm:col-span-2 flex flex-col sm:flex-row gap-8 sm:justify-end">
            <div className="flex flex-col gap-3">
              <Link href="/login" className="text-foreground hover:text-primary transition-colors">
                Sign In
              </Link>
              <Link href="/admin/login" className="text-foreground hover:text-primary transition-colors">
                Admin Login
              </Link>
              <a
                href="#"
                target="_blank"
                rel="noopener noreferrer"
                className="text-foreground hover:text-primary transition-colors"
              >
                GitHub Repository
              </a>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-border pt-8 text-center">
          <p className="text-muted-foreground text-sm">© 2026 VerbalQ. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
