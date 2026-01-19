import { type NextRequest, NextResponse } from "next/server"
import type { AuthResponse } from "@/lib/types"

export async function GET(request: NextRequest) {
  try {
    // Get token from cookie
    const token = request.cookies.get("auth_token")?.value

    if (!token) {
      return NextResponse.json<AuthResponse>(
        { success: false, message: "No authentication token", error: "Unauthorized" },
        { status: 401 }
      )
    }

    // Forward request to backend API with authorization header
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'
    const backendResponse = await fetch(`${backendUrl}/api/auth/me`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    })

    const backendData = await backendResponse.json()

    if (!backendResponse.ok) {
      return NextResponse.json<AuthResponse>(
        {
          success: false,
          message: backendData.message || "Failed to get user profile",
          error: backendData.message || "Authentication failed"
        },
        { status: backendResponse.status }
      )
    }

    // Extract user from backend response
    const { user } = backendData.data || backendData

    if (!user) {
      return NextResponse.json<AuthResponse>(
        { success: false, message: "Invalid response from server", error: "Server error" },
        { status: 500 }
      )
    }

    return NextResponse.json<AuthResponse>(
      {
        success: true,
        message: "Profile retrieved successfully",
        user: {
          id: user.id || user._id,
          email: user.email,
          name: user.name,
          role: user.role,
          createdAt: user.createdAt,
        },
      },
      { status: 200 }
    )
  } catch (error) {
    console.error("Profile API error:", error)
    return NextResponse.json<AuthResponse>(
      { success: false, message: "Server error", error: String(error) },
      { status: 500 },
    )
  }
}