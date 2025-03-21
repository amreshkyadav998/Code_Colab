import { connectToDatabase } from "@/lib/mongodb";
import { Snippet } from "@/models/snippet";
import { Comment } from "@/models/comment";
import { getServerSession } from "next-auth/next";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "@/lib/auth-options";
import mongoose from "mongoose";

interface RouteHandlerContext {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, context: RouteHandlerContext) {
  try {
    const { id: snippetId } = await context.params;

    if (!mongoose.Types.ObjectId.isValid(snippetId)) {
      return NextResponse.json({ message: "Invalid snippet ID" }, { status: 400 });
    }

    await connectToDatabase();

    const snippet = await Snippet.findById(snippetId)
      .populate("author", "name image _id")
      .lean() as { likedBy?: string[] };

    if (!snippet) {
      return NextResponse.json({ message: "Snippet not found" }, { status: 404 });
    }

    await Snippet.findByIdAndUpdate(snippetId, { $inc: { views: 1 } });

    const comments = await Comment.find({ snippet: snippetId })
      .populate("author", "name image _id")
      .sort({ createdAt: -1 })
      .lean();

    const likeCount = snippet.likedBy?.length || 0;

    return NextResponse.json({ snippet, comments, likeCount });
  } catch (error) {
    console.error("Error fetching snippet:", error);
    return NextResponse.json({ message: "An error occurred" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, context: RouteHandlerContext) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ message: "Invalid snippet ID" }, { status: 400 });
    }

    await connectToDatabase();

    const snippet = await Snippet.findById(id);
    if (!snippet) {
      return NextResponse.json({ message: "Snippet not found" }, { status: 404 });
    }

    if (snippet.author.toString() !== session.user.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 403 });
    }

    const body = await request.json();
    const { title, description, code, language, visibility, tags } = body;

    if (!title || !description || !code || !language || !visibility) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
    }

    if (code !== snippet.code) {
      snippet.previousVersions.push({
        code: snippet.code,
        updatedAt: snippet.updatedAt,
        version: snippet.version,
      });
      snippet.version += 1;
    }

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
    return NextResponse.json({ message: "An error occurred" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, context: RouteHandlerContext) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { id} = await context.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ message: "Invalid snippet ID" }, { status: 400 });
    }

    await connectToDatabase();

    const snippet = await Snippet.findById(id);
    if (!snippet) {
      return NextResponse.json({ message: "Snippet not found" }, { status: 404 });
    }

    if (snippet.author.toString() !== session.user.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 403 });
    }

    await Snippet.findByIdAndDelete(id);
    await Comment.deleteMany({ snippet: id });

    return NextResponse.json({ message: "Snippet deleted successfully" });
  } catch (error) {
    console.error("Snippet deletion error:", error);
    return NextResponse.json({ message: "An error occurred" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
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
    return NextResponse.json({ message: "Snippet created successfully", snippet: newSnippet }, { status: 201 });
  } catch (error) {
    console.error("Snippet creation error:", error);
    return NextResponse.json({ message: "An error occurred" }, { status: 500 });
  }
}








// File: app/api/snippets/[id]/route.ts (for single snippet)
// import { connectToDatabase } from "@/lib/mongodb";
// import { Snippet } from "@/models/snippet";
// import { Comment } from "@/models/comment";
// import { getServerSession } from "next-auth/next";
// import { NextResponse } from "next/server";
// import { authOptions } from "@/lib/auth-options";
// import { NextRequest } from "next/server";
// import mongoose from "mongoose";

// export async function GET(request: NextRequest, context: { params: { id: string } }) {
//   try {
//     await connectToDatabase();
//     const snippetId = params.id;
    
//     // Fetch the snippet
//     const snippet = await Snippet.findById(snippetId)
//       .populate("author", "name image _id")
//       .lean();
    
//     if (!snippet) {
//       return NextResponse.json(
//         { message: "Snippet not found" },
//         { status: 404 }
//       );
//     }
    
//     // Increment view count
//     await Snippet.findByIdAndUpdate(snippetId, { $inc: { views: 1 } });
    
//     // Fetch comments for this snippet
//     const comments = await Comment.find({ snippet: snippetId })
//       .populate("author", "name image _id")
//       .sort({ createdAt: -1 })
//       .lean();
    
//     // Check if the snippet has been liked by the current user
//     const session = await getServerSession(authOptions);
//     let likedBy = [];
    
//     if (snippet.likedBy) {
//       likedBy = snippet.likedBy;
//     }
    
//     return NextResponse.json({
//       snippet,
//       comments,
//       likeCount: likedBy.length
//     });
//   } catch (error) {
//     console.error("Error fetching snippet:", error);
//     return NextResponse.json(
//       { message: "An error occurred while fetching the snippet" },
//       { status: 500 }
//     );
//   }
// }

// export async function PUT(
//   request: Request,
//   { params }: { params: { id: string } }
// ) {
//   try {
//     const session = await getServerSession(authOptions);

//     if (!session || !session.user || !session.user.id) {
//       return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
//     }

//     const id = params.id;

//     const { title, description, code, language, visibility, tags } =
//       await request.json();

//     if (!mongoose.Types.ObjectId.isValid(id)) {
//       return NextResponse.json({ message: "Invalid snippet ID" }, { status: 400 });
//     }

//     await connectToDatabase();

//     // Find snippet
//     const snippet = await Snippet.findById(id);

//     if (!snippet) {
//       return NextResponse.json({ message: "Snippet not found" }, { status: 404 });
//     }

//     // Check ownership
//     if (snippet.author.toString() !== session.user.id) {
//       return NextResponse.json(
//         { message: "Unauthorized to edit this snippet" },
//         { status: 403 }
//       );
//     }

//     // Save previous version if code changed
//     if (code !== snippet.code) {
//       const previousVersion = {
//         code: snippet.code,
//         updatedAt: snippet.updatedAt,
//         version: snippet.version,
//       };

//       snippet.previousVersions.push(previousVersion);
//       snippet.version += 1;
//     }

//     // Update snippet
//     snippet.title = title;
//     snippet.description = description;
//     snippet.code = code;
//     snippet.language = language;
//     snippet.visibility = visibility;
//     snippet.tags = tags;
//     snippet.updatedAt = new Date();

//     await snippet.save();

//     return NextResponse.json({ message: "Snippet updated successfully", snippet });
//   } catch (error) {
//     console.error("Snippet update error:", error);
//     return NextResponse.json(
//       { message: "An error occurred while updating the snippet" },
//       { status: 500 }
//     );
//   }
// }

// export async function DELETE(
//   request: Request,
//   { params }: { params: { id: string } }
// ) {
//   try {
//     const session = await getServerSession(authOptions);

//     if (!session || !session.user || !session.user.id) {
//       return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
//     }

//     const id = params.id;

//     if (!mongoose.Types.ObjectId.isValid(id)) {
//       return NextResponse.json({ message: "Invalid snippet ID" }, { status: 400 });
//     }

//     await connectToDatabase();

//     // Find snippet
//     const snippet = await Snippet.findById(id);

//     if (!snippet) {
//       return NextResponse.json({ message: "Snippet not found" }, { status: 404 });
//     }

//     // Check ownership
//     if (snippet.author.toString() !== session.user.id) {
//       return NextResponse.json(
//         { message: "Unauthorized to delete this snippet" },
//         { status: 403 }
//       );
//     }

//     // Delete snippet
//     await Snippet.findByIdAndDelete(id);
    
//     // Optionally, delete associated comments
//     await Comment.deleteMany({ snippet: id });

//     return NextResponse.json({ message: "Snippet deleted successfully" });
//   } catch (error) {
//     console.error("Snippet deletion error:", error);
//     return NextResponse.json(
//       { message: "An error occurred while deleting the snippet" },
//       { status: 500 }
//     );
//   }
// }


// export async function POST(request: Request) {
//   try {
//       const session = await getServerSession(authOptions);
//       if (!session || !session.user || !session.user.id) {
//           return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
//       }

//       const { title, description, code, language, visibility, tags } = await request.json();

//       await connectToDatabase();

//       const newSnippet = new Snippet({
//           title,
//           description,
//           code,
//           language,
//           visibility,
//           tags,
//           author: session.user.id,
//       });

//       await newSnippet.save();

//       return NextResponse.json(
//           { message: "Snippet created successfully", snippet: newSnippet },
//           { status: 201 }
//       );
//   } catch (error) {
//       console.error("Snippet creation error:", error);
//       return NextResponse.json(
//           { message: "An error occurred while creating the snippet" },
//           { status: 500 }
//       );
//   }
// }