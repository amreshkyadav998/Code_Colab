"use client"
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useParams } from "next/navigation";

// Update interfaces to match your MongoDB/API structure
interface Author {
  _id: string;
  name: string;
  image?: string;
}

interface Snippet {
  _id: string;
  title: string;
  description: string;
  code: string;
  language: string;
  visibility: "public" | "private" | "unlisted";
  tags: string[];
  author: Author;
  views: number;
  version: number;
  createdAt: string;
  updatedAt: string;
}

interface CommentType {
  _id: string;
  text: string;
  author: Author;
  snippet: string;
  createdAt: string;
}

const SnippetPage = () => {
  const { id } = useParams();
  const { data: session } = useSession();
  const router = useRouter();

  const [snippet, setSnippet] = useState<Snippet | null>(null);
  const [comments, setComments] = useState<CommentType[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [debugInfo, setDebugInfo] = useState<string>("");
  const [newComment, setNewComment] = useState<string>("");
  const [isSubmittingComment, setIsSubmittingComment] = useState<boolean>(false);

  const fetchSnippet = useCallback(async () => {
    if (!id) return;
    setIsLoading(true);
    setError("");
    setDebugInfo("");

    try {
      // Make sure we're using the correct API URL
      const apiUrl = `/api/snippets/${id}/route.ts`;
      console.log(`Fetching from: ${apiUrl}`);
      
      const response = await fetch(apiUrl);
      console.log(`Response status: ${response.status}`);
      
      // Check if the response is JSON
      const contentType = response.headers.get("content-type");
      console.log(`Content type: ${contentType}`);
      
      if (!contentType || !contentType.includes("application/json")) {
        // If not JSON, get the text and show it for debugging
        const text = await response.text();
        console.error("Non-JSON response:", text.substring(0, 100) + "...");
        setDebugInfo(`API returned non-JSON response. Status: ${response.status}, Content-Type: ${contentType}, Response preview: ${text.substring(0, 100)}...`);
        throw new Error("API returned non-JSON response");
      }
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to fetch snippet. Status: ${response.status}`);
      }

      const data = await response.json();
      console.log("Received data:", data);
      setSnippet(data.snippet);
      setComments(data.comments || []);
    } catch (error: any) {
      console.error("Error fetching snippet:", error);
      setError(error.message || "An error occurred");
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchSnippet();
  }, [fetchSnippet]);

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !session?.user) return;
    
    setIsSubmittingComment(true);
    try {
      const response = await fetch(`/api/snippets/${id}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: newComment,
          snippetId: id,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to post comment");
      }

      // Refresh comments
      fetchSnippet();
      setNewComment("");
    } catch (error: any) {
      setError(error.message || "Failed to post comment");
    } finally {
      setIsSubmittingComment(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container max-w-4xl py-8">
        <div className="flex justify-center items-center h-64">
          <p className="text-lg">Loading snippet...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container max-w-4xl py-10">
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-red-600 font-medium">Error: {error}</p>
          {debugInfo && (
            <div className="mt-4 p-3 bg-gray-50 rounded text-sm font-mono overflow-auto">
              <p className="text-gray-700">Debug Info:</p>
              <p className="text-gray-600">{debugInfo}</p>
            </div>
          )}
          <div className="mt-4">
            <button 
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              onClick={fetchSnippet}
            >
              Try Again
            </button>
            <button 
              className="ml-4 text-blue-600 hover:underline"
              onClick={() => router.push('/snippets')}
            >
              Back to snippets
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!snippet) {
    return (
      <div className="container max-w-4xl py-8">
        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
          <p className="text-yellow-600">Snippet not found</p>
          <button 
            className="mt-4 text-blue-600 hover:underline"
            onClick={() => router.push('/snippets')}
          >
            Back to snippets
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl py-8">
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {/* Snippet Header */}
        <div className="p-6 border-b">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold">{snippet.title}</h1>
              <p className="text-gray-500 text-sm mt-1">
                Posted by {snippet.author.name} • {new Date(snippet.createdAt).toLocaleDateString()}
              </p>
            </div>
            <div className="text-sm text-gray-500">
              <span className="mr-4">{snippet.views} views</span>
              <span>Version {snippet.version}</span>
            </div>
          </div>
          {snippet.description && (
            <p className="mt-4 text-gray-700">{snippet.description}</p>
          )}
          {snippet.tags.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {snippet.tags.map((tag) => (
                <span key={tag} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Code Section */}
        <div className="p-6 bg-gray-50 border-b">
          <div className="flex justify-between items-center mb-2">
            <span className="font-medium text-sm text-gray-700">
              {snippet.language.charAt(0).toUpperCase() + snippet.language.slice(1)}
            </span>
            <button 
              className="text-sm text-blue-600 hover:underline"
              onClick={() => {
                navigator.clipboard.writeText(snippet.code);
                alert("Code copied to clipboard!");
              }}
            >
              Copy Code
            </button>
          </div>
          <pre className="bg-gray-900 text-gray-100 p-4 rounded-md overflow-x-auto">
            <code>{snippet.code}</code>
          </pre>
        </div>

        {/* Comments Section */}
        <div className="p-6">
          <h2 className="text-xl font-semibold mb-4">Comments ({comments.length})</h2>
          
          {session?.user ? (
            <form onSubmit={handleSubmitComment} className="mb-6">
              <textarea
                className="w-full border border-gray-300 rounded-md p-2 mb-2"
                rows={3}
                placeholder="Leave a comment..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                required
              />
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-300"
                disabled={isSubmittingComment || !newComment.trim()}
              >
                {isSubmittingComment ? "Posting..." : "Post Comment"}
              </button>
            </form>
          ) : (
            <div className="mb-6 p-4 bg-gray-50 rounded-md">
              <p>
                <a href="/api/auth/signin" className="text-blue-600 hover:underline">
                  Sign in
                </a>{" "}
                to leave a comment.
              </p>
            </div>
          )}

          {comments.length > 0 ? (
            <div className="space-y-4">
              {comments.map((comment) => (
                <div key={comment._id} className="border-b border-gray-100 pb-4">
                  <div className="flex items-start gap-3">
                    {comment.author.image ? (
                      <img
                        src={comment.author.image}
                        alt={comment.author.name}
                        className="w-8 h-8 rounded-full"
                      />
                    ) : (
                      <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                        {comment.author.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{comment.author.name}</span>
                        <span className="text-gray-500 text-xs">
                          {new Date(comment.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="mt-1">{comment.text}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 italic">No comments yet. Be the first to comment!</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default SnippetPage;