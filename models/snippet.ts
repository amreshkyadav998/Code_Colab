import mongoose from "mongoose"

const SnippetSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, "Please provide a title"],
    maxlength: [100, "Title cannot be more than 100 characters"],
  },
  description: {
    type: String,
    maxlength: [500, "Description cannot be more than 500 characters"],
  },
  code: {
    type: String,
    required: [true, "Please provide code content"],
  },
  language: {
    type: String,
    required: [true, "Please specify a language"],
  },
  visibility: {
    type: String,
    enum: ["public", "private", "unlisted"],
    default: "public",
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  tags: [String],
  views: {
    type: Number,
    default: 0,
  },
  likes: {
    type: Number,
    default: 0,
  },
  likedBy: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
  version: {
    type: Number,
    default: 1,
  },
  previousVersions: [
    {
      code: String,
      updatedAt: Date,
      version: Number,
    },
  ],
})

export const Snippet = mongoose.models.Snippet || mongoose.model("Snippet", SnippetSchema)

