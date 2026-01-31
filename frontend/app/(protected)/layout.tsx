"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { LogOut, BarChart3, BookOpenCheck, Languages, Zap, AlertCircle, History, Settings, Menu, ChevronLeft, User } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { cn } from "@/lib/utils"

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()
  const { user, isLoading, logout } = useAuth()
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)

  const toggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev)
  }

  const handleLogout = async () => {
    await logout()
    router.push("/")
  }

  useEffect(() => {
    if (!isLoading && !user) {
      // Redirect to admin login if not authenticated
      router.push("/admin/login")
      return
    }

    // Check if user is trying to access admin routes without admin role
    if (user && user.role !== "admin" && pathname.startsWith("/admin")) {
      router.push("/dashboard")
      return
    }
  }, [user, isLoading, pathname, router])

  const [isMobile, setIsMobile] = useState(false)

  // Initialize sidebar state from localStorage and screen size
  useEffect(() => {
    if (typeof window === "undefined") return

    const savedOpen = localStorage.getItem("verbalq_sidebar_open")
    const mobile = window.innerWidth < 1024
    setIsMobile(mobile)

    if (mobile) {
      // On mobile devices, sidebar is fully invisible by default
      setIsSidebarOpen(false)
    } else {
      // On desktop, use saved preference or default to visible
      setIsSidebarOpen(savedOpen === "true" || savedOpen === null)
    }

    const handleResize = () => {
      const m = window.innerWidth < 1024
      setIsMobile(m)
      if (m) {
        // auto close on mobile resize to small
        setIsSidebarOpen(false)
      }
    }

    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  // Persist open/closed preference
  useEffect(() => {
    try {
      localStorage.setItem("verbalq_sidebar_open", isSidebarOpen ? "true" : "false")
    } catch (e) {
      /* ignore */
    }
  }, [isSidebarOpen]) // Fixed: consistent dependency array

  // Close sidebar with Escape when on mobile overlay
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isSidebarOpen && isMobile) {
        setIsSidebarOpen(false)
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [isSidebarOpen, isMobile])

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-border border-t-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  const navItems = [
    { href: "/dashboard", label: "Dashboard", icon: BarChart3 },
    { href: "/dashboard/grammar", label: "Grammar Check", icon: BookOpenCheck },
    { href: "/dashboard/translation", label: "Translation", icon: Languages },
    { href: "/dashboard/humanize", label: "Humanize Text", icon: Zap },
    { href: "/dashboard/plagiarism", label: "Plagiarism Check", icon: AlertCircle },
    { href: "/dashboard/history", label: "History", icon: History },
  ]

  const adminItems =
    user.role === "admin"
      ? [
          { href: "/admin/dashboard", label: "Admin Dashboard", icon: BarChart3 },
          { href: "/admin/settings", label: "Settings", icon: Settings },
        ]
      : []

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-950">
      {/* Fixed hamburger button - desktop only (top left corner) */}
      <Button
        variant="ghost"
        size="icon"
        onClick={toggleSidebar}
        className={cn(
          "fixed top-4 left-4 z-50 h-10 w-10 rounded-full bg-white dark:bg-gray-800 shadow-lg border border-gray-200 dark:border-gray-700 hidden lg:flex",
          isSidebarOpen && "left-64 opacity-0 pointer-events-none" // Hide when sidebar is open
        )}
      >
        <Menu className="h-5 w-5 text-gray-700 dark:text-gray-300" />
      </Button>

      {/* Sidebar - toggleable on all devices */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex flex-col bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 transition-transform duration-300 ease-in-out",
          // Toggle on all devices using translate-x
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
        style={{ width: '16rem' }}
      >
        {/* Sidebar Header */}
        <div className="flex h-16 items-center justify-between px-4 border-b border-gray-200 dark:border-gray-800">
          <Link 
            href="/" 
            className={cn(
              "flex items-center gap-3 transition-opacity duration-200",
              !isSidebarOpen && "lg:opacity-0 lg:hidden"
            )}
          >
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 shadow-lg">
              <span className="text-white font-bold text-lg">VQ</span>
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-lg text-gray-900 dark:text-white">VerbalQ</span>
              <span className="text-xs text-gray-500 dark:text-gray-400">AI Text Tools</span>
            </div>
          </Link>
          
          {/* Hamburger button inside sidebar */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            className="h-8 w-8 rounded-lg"
          >
            <Menu className="h-4 w-4" />
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-1">
          <div className="mb-4">
            <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider px-3 mb-2">
              AI Tools
            </h3>
          </div>

          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
            const Icon = item.icon
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => {
                  if (isMobile) setIsSidebarOpen(false)
                }}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 shadow-sm"
                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                )}
              >
                <Icon className={cn("h-5 w-5 shrink-0", isActive && "text-blue-600 dark:text-blue-400")} />
                <span>{item.label}</span>
              </Link>
            )
          })}

          {adminItems.length > 0 && (
            <>
              <div className="my-6 border-t border-gray-200 dark:border-gray-800"></div>
              <div className="mb-4">
                <h3 className="text-xs font-semibold text-amber-600 dark:text-amber-400 uppercase tracking-wider px-3 mb-2">
                  Admin
                </h3>
              </div>
              {adminItems.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
                const Icon = item.icon
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => {
                      if (isMobile) setIsSidebarOpen(false)
                    }}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                      isActive
                        ? "bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400 shadow-sm"
                        : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                    )}
                  >
                    <Icon className={cn("h-5 w-5 shrink-0", isActive && "text-amber-600 dark:text-amber-400")} />
                    <span>{item.label}</span>
                  </Link>
                )
              })}
            </>
          )}
        </nav>
      </aside>

      {/* Mobile overlay */}
      {isMobile && isSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top bar */}
        <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-4 lg:px-6">
          {/* Mobile menu button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            className="lg:hidden h-9 w-9"
          >
            <Menu className="h-5 w-5" />
          </Button>

          <div className="flex-1" />

          {/* User info and actions */}
          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-800">
              <User className="h-4 w-4 text-gray-600 dark:text-gray-400" />
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                {user.name || user.email.split("@")[0]}
              </span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="gap-2 hover:bg-red-50 hover:text-red-600 hover:border-red-200 dark:hover:bg-red-950 dark:hover:text-red-400"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Logout</span>
            </Button>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto">
          <div className="container mx-auto p-4 lg:p-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
