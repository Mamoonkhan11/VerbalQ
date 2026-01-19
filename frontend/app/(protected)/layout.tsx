"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { LogOut, BarChart3, BookOpenCheck, Languages, Zap, AlertCircle, History, Settings, User } from "lucide-react"
import { useAuth } from "@/lib/auth-context"

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()
  const { user, isLoading, logout } = useAuth()
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)

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
    <div className="flex min-h-screen flex-col lg:flex-row bg-gray-50 dark:bg-gray-900">
      {/* Sidebar */}
      <aside
        className={`border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 w-full lg:w-72 flex-shrink-0 transition-all duration-300 shadow-lg ${
          isSidebarOpen ? "block" : "hidden"
        } lg:block`}
      >
        {/* Header */}
        <div className="flex h-20 items-center border-b border-gray-200 dark:border-gray-700 px-6 bg-gradient-to-r from-blue-600 to-purple-600">
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform duration-200 shadow-lg">
              <span className="text-blue-600 font-bold text-lg">VQ</span>
            </div>
            <div>
              <span className="font-bold text-xl text-white">
                VerbalQ
              </span>
              <p className="text-blue-100 text-xs">AI Text Intelligence</p>
            </div>
          </Link>
        </div>

        <nav className="space-y-2 px-6 py-8">
          <div className="mb-6">
            <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">
              AI Tools
            </h3>
          </div>

          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-4 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 dark:hover:from-blue-900/30 dark:hover:to-purple-900/30 hover:text-blue-600 dark:hover:text-blue-400 text-gray-700 dark:text-gray-300 group"
            >
              <div className="w-8 h-8 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center group-hover:bg-blue-100 dark:group-hover:bg-blue-900/50 transition-colors">
                <item.icon className="h-4 w-4 text-gray-600 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400" />
              </div>
              <span className="font-medium">{item.label}</span>
            </Link>
          ))}

          {adminItems.length > 0 && (
            <>
              <div className="my-6 border-t border-gray-200 dark:border-gray-700"></div>
              <div className="mb-4">
                <h3 className="text-xs font-semibold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
                  Administration
                </h3>
              </div>
              {adminItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-4 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 hover:bg-gradient-to-r hover:from-amber-50 hover:to-orange-50 dark:hover:from-amber-900/30 dark:hover:to-orange-900/30 hover:text-amber-600 dark:hover:text-amber-400 text-gray-700 dark:text-gray-300 group"
                >
                  <div className="w-8 h-8 bg-amber-100 dark:bg-amber-900/50 rounded-lg flex items-center justify-center group-hover:bg-amber-100 dark:group-hover:bg-amber-900/50 transition-colors">
                    <item.icon className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                  </div>
                  <span className="font-medium">{item.label}</span>
                </Link>
              ))}
            </>
          )}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6">
          <div className="mb-4 p-4 rounded-xl bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border border-blue-100 dark:border-blue-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                <span className="text-white font-semibold text-sm">
                  {user.name ? user.name.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Logged in as</p>
                <p className="truncate text-sm font-semibold text-gray-900 dark:text-white">
                  {user.name || user.email.split('@')[0]}
                </p>
              </div>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleLogout}
            className="w-full justify-center text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-red-50 dark:hover:bg-red-900/20 hover:border-red-200 dark:hover:border-red-800 hover:text-red-600 dark:hover:text-red-400 transition-all duration-200 font-medium"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex flex-1 flex-col bg-gray-50 dark:bg-gray-900">
        {/* Top bar */}
        <header className="border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm">
          <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
            {/* Mobile sidebar toggle */}
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="lg:hidden text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Toggle sidebar"
            >
              <div className="w-6 h-6 flex flex-col justify-center items-center">
                <span className={`block h-0.5 w-5 bg-current transform transition duration-300 ease-in-out ${isSidebarOpen ? 'rotate-45 translate-y-1' : '-translate-y-1'}`}></span>
                <span className={`block h-0.5 w-5 bg-current transform transition duration-300 ease-in-out ${isSidebarOpen ? 'opacity-0' : 'opacity-100'}`}></span>
                <span className={`block h-0.5 w-5 bg-current transform transition duration-300 ease-in-out ${isSidebarOpen ? '-rotate-45 -translate-y-1' : 'translate-y-1'}`}></span>
              </div>
            </button>

            <div className="flex items-center gap-4">
              {/* Welcome message */}
              <div className="hidden lg:flex items-center gap-3">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Welcome back, <span className="font-semibold text-gray-900 dark:text-white">
                    {(user.name || user.email).split("@")[0]}
                  </span>
                </p>
              </div>

              {/* User menu and logout */}
              <div className="flex items-center gap-3">
                <div className="hidden md:flex items-center gap-2 px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
                  <User className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {(user.name || user.email).split("@")[0]}
                  </span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLogout}
                  className="text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-red-50 dark:hover:bg-red-900/20 hover:border-red-200 dark:hover:border-red-800 hover:text-red-600 dark:hover:text-red-400 transition-all duration-200 font-medium"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  <span className="hidden sm:inline">Logout</span>
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto">
          <div className="flex items-center justify-center min-h-full">
            <div className="w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
