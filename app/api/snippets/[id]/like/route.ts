import { connectToDatabase } from "@/lib/mongodb"
import { Snippet } from "@/models/snippet"
import { getServerSession } from "next-auth/next"
import { NextResponse } from "next/server"
import { authOptions } from "@/lib/auth-options"
import mongoose from "mongoose"

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const snippetId = params.id
    const userId = (session.user as { id: string }).id  // ✅ Fix: Explicitly assert session.user has an id

    if (!mongoose.Types.ObjectId.isValid(snippetId)) {
      return NextResponse.json({ message: "Invalid snippet ID" }, { status: 400 })
    }

    await connectToDatabase()

    // Find snippet
    const snippet = await Snippet.findById(snippetId)
    if (!snippet) {
      return NextResponse.json({ message: "Snippet not found" }, { status: 404 })
    }

    // Check if user already liked the snippet
    const alreadyLiked = snippet.likedBy.includes(userId)

    if (alreadyLiked) {
      // Unlike
      await Snippet.findByIdAndUpdate(snippetId, {
        $pull: { likedBy: userId },
        $inc: { likes: -1 },
      })

      return NextResponse.json({
        message: "Snippet unliked successfully",
        liked: false,
        likeCount: snippet.likes - 1,
      })
    } else {
      // Like
      await Snippet.findByIdAndUpdate(snippetId, {
        $addToSet: { likedBy: userId },
        $inc: { likes: 1 },
      })

      return NextResponse.json({
        message: "Snippet liked successfully",
        liked: true,
        likeCount: snippet.likes + 1,
      })
    }
  } catch (error) {
    console.error("Like toggle error:", error)
    return NextResponse.json({ message: "An error occurred while processing your request" }, { status: 500 })
  }
}
