import mongoose from "mongoose"

const CommentSchema = new mongoose.Schema({
  content: {
    type: String,
    required: [true, "Please provide comment content"],
    maxlength: [1000, "Comment cannot be more than 1000 characters"],
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  snippet: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Snippet",
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
})

export const Comment = mongoose.models.Comment || mongoose.model("Comment", CommentSchema)

