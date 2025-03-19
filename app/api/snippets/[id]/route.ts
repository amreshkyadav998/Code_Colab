import { connectToDatabase } from "@/lib/mongodb";
import { Snippet } from "@/models/snippet";
import { Comment } from "@/models/comment";
import { getServerSession } from "next-auth/next";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth-options";
import mongoose from "mongoose";

// Define interfaces for your data structures
interface Author {
  _id: mongoose.Types.ObjectId;
  name: string;
  image?: string;
}

interface SnippetDocument {
  _id: mongoose.Types.ObjectId;
  title: string;
  description: string;
  code: string;
  language: string;
  visibility: "public" | "private" | "unlisted";
  tags: string[];
  author: Author | mongoose.Types.ObjectId;
  views: number;
  version: number;
  previousVersions: {
    code: string;
    updatedAt: Date;
    version: number;
  }[];
  createdAt: Date;
  updatedAt: Date;
  __v: number;
}

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ message: "Invalid snippet ID" }, { status: 400 });
    }

    await connectToDatabase();
    console.log("connected to mongodb")

    // Get snippet with proper typing
    const snippet = await Snippet.findById(id)
      .populate("author", "name image _id")
      .lean() as unknown as SnippetDocument;

    const testSnippet = await Snippet.findById(id);
    console.log(testSnippet);
      
    if (!snippet) {
      return NextResponse.json({ message: "Snippet not found" }, { status: 404 });
    }

    // Check if private and not owner
    const session = await getServerSession(authOptions);

    // Use type guard to ensure author is the populated object type
    const author = snippet.author as Author;
    
    if (
      snippet.visibility === "private" &&
      (!session?.user || author._id.toString() !== session.user.id)
    ) {
      return NextResponse.json(
        { message: "Unauthorized to view this snippet" },
        { status: 403 }
      );
    }

    // Increment view count if not the author
    if (!session?.user || author._id.toString() !== session.user.id) {
      await Snippet.findByIdAndUpdate(id, { $inc: { views: 1 } });
    }

    // Get comments
    const comments = await Comment.find({ snippet: id })
      .populate("author", "name image _id")
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ snippet, comments });
  } catch (error) {
    console.error("Snippet fetch error:", error);
    return NextResponse.json(
      { message: "An error occurred while fetching the snippet" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user || !session.user.id) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const { title, description, code, language, visibility, tags } = await request.json();

        await connectToDatabase();

        const newSnippet = new Snippet({
            title,
            description,
            code,
            language,
            visibility,
            tags,
            author: session.user.id,
        });

        await newSnippet.save();

        return NextResponse.json(
            { message: "Snippet created successfully", snippet: newSnippet },
            { status: 201 }
        );
    } catch (error) {
        console.error("Snippet creation error:", error);
        return NextResponse.json(
            { message: "An error occurred while creating the snippet" },
            { status: 500 }
        );
    }
}


export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const id = params.id;
    const { title, description, code, language, visibility, tags } =
      await request.json();

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ message: "Invalid snippet ID" }, { status: 400 });
    }

    await connectToDatabase();

    // Find snippet
    const snippet = await Snippet.findById(id);

    if (!snippet) {
      return NextResponse.json({ message: "Snippet not found" }, { status: 404 });
    }

    // Check ownership
    if (snippet.author.toString() !== session.user.id) {
      return NextResponse.json(
        { message: "Unauthorized to edit this snippet" },
        { status: 403 }
      );
    }

    // Save previous version if code changed
    if (code !== snippet.code) {
      const previousVersion = {
        code: snippet.code,
        updatedAt: snippet.updatedAt,
        version: snippet.version,
      };

      snippet.previousVersions.push(previousVersion);
      snippet.version += 1;
    }

    // Update snippet
    snippet.title = title;
    snippet.description = description;
    snippet.code = code;
    snippet.language = language;
    snippet.visibility = visibility;
    snippet.tags = tags;
    snippet.updatedAt = new Date();

    await snippet.save();

    return NextResponse.json({ message: "Snippet updated successfully", snippet });
  } catch (error) {
    console.error("Snippet update error:", error);
    return NextResponse.json(
      { message: "An error occurred while updating the snippet" },
      { status: 500 }
    );
  }
}