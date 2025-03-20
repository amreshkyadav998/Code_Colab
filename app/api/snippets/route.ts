import { connectToDatabase } from "@/lib/mongodb";
import { Snippet } from "@/models/snippet";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";

export async function GET(request: Request) {
  try {
    await connectToDatabase();
    
    // Get URL parameters for sorting and pagination
    const url = new URL(request.url);
    const sortBy = url.searchParams.get("sort") || "latest";
    const page = parseInt(url.searchParams.get("page") || "1");
    const limit = parseInt(url.searchParams.get("limit") || "12");
    const skip = (page - 1) * limit;
    
    // Set up sorting options
    let sortOptions = {};
    switch (sortBy) {
      case "popular":
        sortOptions = { likes: -1, createdAt: -1 };
        break;
      case "commented":
        sortOptions = { commentCount: -1, createdAt: -1 };
        break;
      default: // latest
        sortOptions = { createdAt: -1 };
    }
    
    // Query only public snippets
    const snippets = await Snippet.find({ visibility: "public" })
      .populate("author", "name image _id")
      .sort(sortOptions)
      .skip(skip)
      .limit(limit)
      .lean();
    
    const total = await Snippet.countDocuments({ visibility: "public" });
    
    return NextResponse.json({
      snippets,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error("Error fetching public snippets:", error);
    return NextResponse.json(
      { message: "An error occurred while fetching public snippets" },
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