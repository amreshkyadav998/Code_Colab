import { connectToDatabase } from "@/lib/mongodb"
import { Comment } from "@/models/comment"
import { Snippet } from "@/models/snippet"
import { getServerSession } from "next-auth/next"
import { NextResponse } from "next/server"
import { authOptions } from "@/lib/auth-options"
import mongoose from "mongoose"
import { NextRequest } from "next/server"

// Fix: Use correct parameter typing for App Router
export async function POST(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const snippetId = context.params.id;
    const { content } = await request.json();

    if (!content || !content.trim()) {
      return NextResponse.json({ message: "Comment content is required" }, { status: 400 })
    }

    if (!mongoose.Types.ObjectId.isValid(snippetId)) {
      return NextResponse.json({ message: "Invalid snippet ID" }, { status: 400 })
    }

    await connectToDatabase()

    // Check if snippet exists
    const snippet = await Snippet.findById(snippetId)
    if (!snippet) {
      return NextResponse.json({ message: "Snippet not found" }, { status: 404 })
    }

    // Explicitly assert session.user to include id
    const userId = (session.user as { id: string }).id

    // Create comment
    const comment = await Comment.create({
      content,
      author: userId,
      snippet: snippetId,
    })

    // Populate author details
    const populatedComment = await Comment.findById(comment._id).populate("author", "name image").lean()

    return NextResponse.json({ message: "Comment added successfully", comment: populatedComment }, { status: 201 })
  } catch (error) {
    console.error("Comment creation error:", error)
    return NextResponse.json({ message: "An error occurred while adding the comment" }, { status: 500 })
  }
}