import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    // Get token from cookie
    const token = request.cookies.get("auth_token")?.value

    if (!token) {
      return NextResponse.json(
        { success: false, message: "Authentication required" },
        { status: 401 }
      )
    }

    const body = await request.json()

    // Validate input
    if (!body.text || !body.targetLanguage) {
      return NextResponse.json(
        { success: false, message: "Text and target language are required" },
        { status: 400 }
      )
    }

    // Forward request to backend API
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'
    const backendResponse = await fetch(`${backendUrl}/api/ai/translate`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })

    const backendData = await backendResponse.json()

    if (!backendResponse.ok) {
      return NextResponse.json(
        {
          success: false,
          message: backendData.message || "Translation failed",
        },
        { status: backendResponse.status }
      )
    }

    return NextResponse.json(backendData, { status: 200 })
  } catch (error) {
    console.error("Translation API error:", error)
    return NextResponse.json(
      { success: false, message: "Server error", error: String(error) },
      { status: 500 },
    )
  }
}