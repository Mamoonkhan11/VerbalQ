import { type NextRequest, NextResponse } from "next/server"
import type { AuthResponse, LoginRequest } from "@/lib/types"

export async function POST(request: NextRequest) {
  try {
    const body: LoginRequest = await request.json()
    const { email, password } = body

    // Validate input
    if (!email || !password) {
      return NextResponse.json<AuthResponse>(
        { success: false, message: "Email and password are required", error: "Invalid input" },
        { status: 400 },
      )
    }

    // Forward request to backend API
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'
    const backendResponse = await fetch(`${backendUrl}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    })

    const backendData = await backendResponse.json()

    if (!backendResponse.ok) {
      return NextResponse.json<AuthResponse>(
        {
          success: false,
          message: backendData.message || "Login failed",
          error: backendData.message || "Authentication failed"
        },
        { status: backendResponse.status }
      )
    }

    // Extract token and user from backend response
    const { token, user } = backendData.data || backendData

    if (!token || !user) {
      return NextResponse.json<AuthResponse>(
        { success: false, message: "Invalid response from server", error: "Server error" },
        { status: 500 }
      )
    }

    // Set token in httpOnly cookie
    const response = NextResponse.json<AuthResponse>(
      {
        success: true,
        message: "Login successful",
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          createdAt: new Date(),
        },
      },
      { status: 200 },
    )

    response.cookies.set("auth_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 86400 * 7, // 7 days (matches backend JWT_EXPIRE)
      path: "/",
    })

    console.log("Login successful for user:", user.email, "with role:", user.role)
    return response
  } catch (error) {
    console.error("Login API error:", error)
    return NextResponse.json<AuthResponse>(
      { success: false, message: "Server error", error: String(error) },
      { status: 500 },
    )
  }
}
