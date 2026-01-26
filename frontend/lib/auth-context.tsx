"use client"

import type React from "react"
import { useRouter } from "next/navigation"

import { createContext, useContext, useEffect, useState } from "react"
import api from "@/lib/api"
import type { User } from "@/lib/types"

export interface AuthUser {
  userId: string
  email: string
  name?: string
  role: "user" | "admin"
}

interface AuthContextType {
  user: AuthUser | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (
    email: string,
    password: string,
    role?: "user" | "admin"
  ) => Promise<
    | { success: true; role: "user" | "admin" }
    | { success: false; error: string }
  >
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Only run auth check on client side
    if (typeof window === 'undefined') {
      setIsLoading(false)
      return
    }

    const checkAuth = async () => {
      const token = localStorage.getItem('auth_token')
      if (!token) {
        setIsLoading(false)
        return
      }

      try {
        // Add timeout to prevent hanging
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Auth check timeout')), 5000)
        )
        
        const response = await Promise.race([
          api.get('/api/auth/me'),
          timeoutPromise
        ]) as any
        
        // Handle both response formats (backend wraps in data, Next.js API route doesn't)
        const responseData = response.data?.data || response.data
        const userData: User = responseData?.user
        
        if (userData) {
        setUser({
          userId: userData.id,
          email: userData.email,
          name: userData.name,
          role: userData.role
        })
        }
      } catch (error) {
        console.error("Auth check failed:", error)
        localStorage.removeItem('auth_token')
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [])

  const login = async (email: string, password: string, role?: "user" | "admin") => {
    try {
      // IMPORTANT:
      // Use Next.js route `/api/auth/login` (relative URL) so it can set the httpOnly cookie `auth_token`.
      // If we call the backend via Axios baseURL, the cookie never gets set for the Next.js app,
      // and middleware will block `/dashboard`.
      
      const loginData = { email: email.trim(), password: password.trim(), requiredRole: role }
      console.log("Sending login request:", { email: loginData.email, requiredRole: role })
      
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(loginData),
        credentials: "include",
      })

      let data
      try {
        data = await response.json()
      } catch (jsonError) {
        return {
          success: false as const,
          error: `Server error: ${response.status} ${response.statusText}`,
        }
      }

      // Check if request was successful AND response indicates success
      if (!response.ok) {
        // HTTP error status (401, 400, 500, etc.)
        const errorMsg = data?.error || data?.message || `Login failed: ${response.status} ${response.statusText}`
        return {
          success: false as const,
          error: errorMsg,
        }
      }

      // Check if response data indicates success
      if (!data?.success) {
        const errorMsg = data?.error || data?.message || "Login failed. Please try again."
        return {
          success: false as const,
          error: errorMsg,
        }
      }

      const token = data?.token
      const userData = data?.user

      if (!token || !userData) {
        return { success: false as const, error: "Invalid response from server. Please try again." }
      }

      // Store token (client-side convenience). Cookie is set server-side by the Next route.
      localStorage.setItem("auth_token", token)

      setUser({
        userId: userData.id,
        email: userData.email,
        name: userData.name,
        role: userData.role,
      })

      return { success: true as const, role: userData.role as "user" | "admin" }
    } catch (error: any) {
      // Handle fetch errors (network errors, etc.)
      let errorMessage = 'Login failed. Please try again.'

      if (error instanceof TypeError && error.message.includes('fetch')) {
        errorMessage = 'Network error. Please check your connection and try again.'
      } else if (error.message) {
        errorMessage = error.message
      }

      return {
        success: false as const,
        error: errorMessage
      }
    }
  }

  const logout = async () => {
    try {
      // Clear local state first
      setUser(null)
      localStorage.removeItem("auth_token")

      // Redirect to login
      router.push('/login')
    } catch (error) {
      console.error("Logout failed:", error)
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    // Return a safe fallback while AuthProvider initializes
    return {
      user: null,
      isLoading: true,
      isAuthenticated: false,
      login: async (email: string, password: string) => {
        console.warn("AuthProvider not ready yet")
        return { success: false, error: "Authentication service initializing..." }
      },
      logout: async () => {
        console.warn("AuthProvider not ready yet")
      },
    }
  }
  return context
}
