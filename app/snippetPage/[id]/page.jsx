"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Globe, Heart, Lock, MessageSquare, Share, Share2 } from "lucide-react"
import { formatDistanceToNow } from "date-fns"

interface Snippet {
  _id: string;
  title: string;
  description?: string;
  code: string;
  language: string;
  visibility: string;
  tags?: string[];
  author?: {
    name?: string;
    image?: string;
  };
  createdAt?: string;
  views?: number;
  likes?: number;
  comments?: any[];
}

export default function SnippetPage() {
  const params = useParams();
  const snippetId = params.id;
  const [snippet, setSnippet] = useState<Snippet | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (snippetId) {
      fetchSnippet(snippetId.toString());
    }
  }, [snippetId]);

  const fetchSnippet = async (id: string) => {
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch(`/api/snippets/${id}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch snippet");
      }

      setSnippet(data.snippet || null);
    } catch (error: any) {
      setError(error.message || "An error occurred");
      console.error("Error fetching snippet:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getVisibilityIcon = (visibility: string) => {
    switch (visibility) {
      case "public":
        return <Globe className="h-4 w-4" />;
      case "private":
        return <Lock className="h-4 w-4" />;
      default:
        return <Share2 className="h-4 w-4" />;
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-12 flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin h-8 w-8 border-4 border-blue-500 rounded-full border-t-transparent"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <h2 className="text-2xl font-bold mb-4">Error</h2>
        <p className="text-red-500 mb-6">{error}</p>
        <Button onClick={() => snippetId && fetchSnippet(snippetId.toString())}>Try Again</Button>
      </div>
    );
  }

  if (!snippet) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <h2 className="text-2xl font-bold mb-4">Snippet Not Found</h2>
        <p className="mb-6">The snippet you're looking for might have been removed or is private.</p>
        <Button href="/snippets">Back to Snippets</Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <Card className="max-w-4xl mx-auto">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <CardTitle className="text-2xl font-bold">{snippet.title}</CardTitle>
            <Badge variant="outline" className="flex items-center gap-1">
              {getVisibilityIcon(snippet.visibility)}
              {snippet.visibility.charAt(0).toUpperCase() + snippet.visibility.slice(1)}
            </Badge>
          </div>
          <div className="flex items-center gap-2 mt-2">
            <Avatar className="h-6 w-6">
              <AvatarImage src={snippet.author?.image || ""} alt={snippet.author?.name || "User"} />
              <AvatarFallback>{snippet.author?.name?.charAt(0) || "U"}</AvatarFallback>
            </Avatar>
            <span className="text-sm text-muted-foreground">{snippet.author?.name}</span>
            <span className="text-sm text-muted-foreground">
              {snippet.createdAt && formatDistanceToNow(new Date(snippet.createdAt), { addSuffix: true })}
            </span>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {snippet.description && <p className="text-muted-foreground">{snippet.description}</p>}

          <div className="flex flex-wrap gap-2 mb-2">
            <Badge variant="secondary">{snippet.language.charAt(0).toUpperCase() + snippet.language.slice(1)}</Badge>
            {snippet.tags?.map((tag) => (
              <Badge key={tag} variant="outline">
                {tag}
              </Badge>
            ))}
          </div>

          <div className="border rounded-md overflow-hidden">
            <div className="bg-muted p-2 border-b flex justify-between items-center">
              <span className="text-sm font-medium">{snippet.language.charAt(0).toUpperCase() + snippet.language.slice(1)}</span>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <Share className="h-4 w-4" />
                <span className="sr-only">Copy code</span>
              </Button>
            </div>
            <pre className="p-4 overflow-x-auto font-mono text-sm">
              <code>{snippet.code}</code>
            </pre>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between border-t pt-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center">
              <Heart className={`mr-1 h-4 w-4 ${snippet.likes && snippet.likes > 0 ? "fill-red-500 text-red-500" : ""}`} />
              <span className="text-sm">{snippet.likes || 0}</span>
            </div>
            <div className="flex items-center">
              <MessageSquare className="mr-1 h-4 w-4" />
              <span className="text-sm">{snippet.comments?.length || 0}</span>
            </div>
          </div>
          <Button variant="outline" size="sm">
            <Share2 className="mr-2 h-4 w-4" />
            Share
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}