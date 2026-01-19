import { type NextRequest, NextResponse } from "next/server"
import type { AuthResponse, RegisterRequest } from "@/lib/types"

export async function POST(request: NextRequest) {
  try {
    const body: RegisterRequest = await request.json()
    const { email, password, name } = body

    // Validate input
    if (!email || !password || !name) {
      return NextResponse.json<AuthResponse>(
        { success: false, message: "Name, email, and password are required", error: "Invalid input" },
        { status: 400 },
      )
    }

    // Forward request to backend API
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'
    const backendResponse = await fetch(`${backendUrl}/api/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name, email, password }),
    })

    const backendData = await backendResponse.json()

    if (!backendResponse.ok) {
      return NextResponse.json<AuthResponse>(
        {
          success: false,
          message: backendData.message || "Registration failed",
          error: backendData.message || "Registration failed"
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

    // Return success response (user can login after registration)
    const response = NextResponse.json<AuthResponse>(
      {
        success: true,
        message: "Registration successful. Please log in.",
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          createdAt: new Date(),
        },
      },
      { status: 201 },
    )

    console.log("Registration successful for user:", user.email)
    return response
  } catch (error) {
    console.error("Registration API error:", error)
    return NextResponse.json<AuthResponse>(
      { success: false, message: "Server error", error: String(error) },
      { status: 500 },
    )
  }
}