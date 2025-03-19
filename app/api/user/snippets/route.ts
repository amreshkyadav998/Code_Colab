import { connectToDatabase } from "@/lib/mongodb"
import { Snippet } from "@/models/snippet"
import { getServerSession } from "next-auth/next"
import { NextResponse } from "next/server"
import { authOptions } from "@/lib/auth-options"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    await connectToDatabase()

    // Explicitly assert session.user type to include 'id'
    const userId = (session.user as { id: string }).id

    // Get user's snippets
    const snippets = await Snippet.find({ author: userId }).sort({ createdAt: -1 }).lean()

    return NextResponse.json({ snippets })
  } catch (error) {
    console.error("User snippets fetch error:", error)
    return NextResponse.json({ message: "An error occurred while fetching snippets" }, { status: 500 })
  }
}
