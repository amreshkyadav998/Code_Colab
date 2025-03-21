"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Loader2, Eye, MessageCircle, Tag, Lock, Globe, ThumbsUp } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
// import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface Snippet {
  _id: string;
  title: string;
  description?: string;
  code: string;
  language: string;
  visibility: "public" | "private";
  author: {
    _id: string;
    name?: string;
    image?: string;
  };
  createdAt: string;
  updatedAt: string;
  tags?: string[];
  comments?: Comment[];
  likes?: number;
}

interface Comment {
  _id: string;
  content: string;
  author: {
    _id: string;
    name?: string;
    image?: string;
  };
  createdAt: string;
}

// Update the component to use proper typing
function SnippetCard({ snippet }: { snippet: Snippet }) {
  const router = useRouter();
  const { data: session } = useSession();
  const [isCommenting, setIsCommenting] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [comments, setComments] = useState(snippet.comments || []);
  const [showComments, setShowComments] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [likes, setLikes] = useState(snippet.likes || 0);
  const [hasLiked, setHasLiked] = useState(false);
  

  const handleView = () => {
    router.push(`/snippets/${snippet._id}`);
  };

  const handleCommentToggle = () => {
    setShowComments(!showComments);
  };

  const handleLike = async () => {
    if (!session) {
      router.push('/auth/signin?callbackUrl=/');
      return;
    }

    if (hasLiked) return;

    try {
      const response = await fetch(`/api/snippets/${snippet._id}/like`, {
        method: "POST",
      });
      
      if (response.ok) {
        setLikes(likes + 1);
        setHasLiked(true);
      }
    } catch (error) {
      console.error("Error liking snippet:", error);
    }
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    console.log("Snippet ID:", snippet._id);
    
    setIsSubmitting(true);
    
    try {
      const response = await fetch(`/api/snippets/${snippet._id}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content: commentText }),
      });
      
      if (response.ok) {
        const newComment = await response.json();
        setComments([...comments, newComment]);
        setCommentText("");
        setIsCommenting(false);
      }
    } catch (error) {
      console.error("Error posting comment:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Function to get language color
  const getLanguageColor = (lang: string) => {
    const colors: Record<string, string> = {
      javascript: "bg-yellow-500",
      typescript: "bg-blue-500",
      python: "bg-green-500",
      java: "bg-red-500",
      csharp: "bg-purple-500",
      html: "bg-orange-500",
      css: "bg-pink-500",
      ruby: "bg-red-600",
      php: "bg-indigo-500",
      go: "bg-blue-400",
      rust: "bg-orange-600",
    };
    return colors[lang.toLowerCase()] || "bg-gray-500";
  };

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 dark:bg-gray-800 bg-white border-gray-200 dark:border-gray-700">
      <div className="relative">
        {/* Language Badge */}
        <div className="absolute top-2 left-2">
          <Badge className={`${getLanguageColor(snippet.language)} text-white`}>
            {snippet.language}
          </Badge>
        </div>
        
        {/* Visibility Icon */}
        <div className="absolute top-2 right-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="p-1 rounded-full bg-gray-100 dark:bg-gray-700">
                  {snippet.visibility === "public" ? (
                    <Globe className="h-4 w-4 text-green-500" />
                  ) : (
                    <Lock className="h-4 w-4 text-amber-500" />
                  )}
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>{snippet.visibility === "public" ? "Public" : "Private"} snippet</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      <CardHeader className="pt-10">
        <CardTitle className="line-clamp-1 text-lg font-bold dark:text-white">
          {snippet.title}
        </CardTitle>
        <CardDescription className="line-clamp-2 dark:text-gray-300">
          {snippet.description || "No description provided"}
        </CardDescription>
      </CardHeader>

      <CardContent>
        <div className="space-y-4">
          {/* Author info */}
          <div className="flex items-center space-x-2">
            <Avatar className="h-6 w-6">
              <AvatarImage src={snippet.author.image || ""} alt={snippet.author.name || "User"} />
              <AvatarFallback className="text-xs bg-blue-500 text-white">
                {snippet.author.name?.charAt(0) || "U"}
              </AvatarFallback>
            </Avatar>
            <span className="text-sm text-gray-600 dark:text-gray-400">{snippet.author.name || "Anonymous"}</span>
          </div>
          
          {/* Tags */}
          {snippet.tags && snippet.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {snippet.tags.slice(0, 3).map((tag, index) => (
                <Badge key={index} variant="outline" className="text-xs bg-transparent">
                  <Tag className="h-3 w-3 mr-1" /> {tag}
                </Badge>
              ))}
              {snippet.tags.length > 3 && (
                <Badge variant="outline" className="text-xs bg-transparent">
                  +{snippet.tags.length - 3}
                </Badge>
              )}
            </div>
          )}

          {/* Date */}
          <div className="text-xs text-gray-500 dark:text-gray-400">
            Created: {formatDate(snippet.createdAt)}
          </div>
        </div>
      </CardContent>

      <CardFooter className="border-t border-gray-200 dark:border-gray-700 pt-4">
  <div className="flex items-center justify-between w-full">
    <Button
      variant="ghost"
      size="sm"
      className="flex items-center gap-1 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20"
      onClick={handleView}
    >
      <Eye className="h-4 w-4" /> View
    </Button>
    
    <Button
      variant="ghost"
      size="sm"
      className="flex items-center gap-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
      onClick={handleLike}
      disabled={hasLiked}
    >
      <ThumbsUp className={`h-4 w-4 ${hasLiked ? "fill-current" : ""}`} /> {likes > 0 ? likes : ""}
    </Button>
  </div>
</CardFooter>

      {/* Comments Section */}
      {showComments && (
        <div className="border-t border-gray-200 dark:border-gray-700 px-6 py-4 bg-gray-50 dark:bg-gray-800/50">
          {/* Existing Comments */}
          <div className="space-y-4 mb-4">
            {comments.length > 0 ? (
              comments.map((comment) => (
                <div key={comment._id} className="flex space-x-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={comment.author?.image || ""} alt={comment.author?.name || "User"} />
                    <AvatarFallback className="text-xs bg-blue-500 text-white">
                      {comment.author?.name?.charAt(0) || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-3">
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-medium text-sm dark:text-gray-200">{comment.author?.name || "Anonymous"}</span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">{formatDate(comment.createdAt)}</span>
                      </div>
                      <p className="text-sm text-gray-800 dark:text-gray-300">{comment.content}</p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-sm text-gray-500 dark:text-gray-400 italic">No comments yet</p>
            )}
          </div>

          {/* Add Comment */}
          {session ? (
            <form onSubmit={handleCommentSubmit} className="mt-4">
              <div className="flex gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={session.user?.image || ""} alt={session.user?.name || "User"} />
                  <AvatarFallback className="text-xs bg-blue-500 text-white">
                    {session.user?.name?.charAt(0) || "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <Textarea
                    placeholder="Add a comment..."
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    className="min-h-12 resize-none bg-gray-100 dark:bg-gray-700 border-gray-200 dark:border-gray-600"
                  />
                  <div className="flex justify-end mt-2">
                    <Button 
                      type="submit" 
                      disabled={isSubmitting || !commentText.trim()} 
                      size="sm"
                      className="bg-blue-500 hover:bg-blue-600 text-white"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Posting...
                        </>
                      ) : (
                        "Post"
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </form>
          ) : (
            <Alert className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-200 mt-4">
              <AlertDescription>
                <div className="flex items-center justify-between">
                  <span>Sign in to leave a comment</span>
                  <Button 
                    size="sm" 
                    onClick={() => router.push('/auth/signin?callbackUrl=/')}
                    className="bg-blue-500 hover:bg-blue-600 text-white"
                  >
                    Sign in
                  </Button>
                </div>
              </AlertDescription>
            </Alert>
          )}
        </div>
      )}
    </Card>
  );
}

export default function SnippetFeedPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [snippets, setSnippets] = useState<Snippet[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState("latest")

  useEffect(() => {
    fetchSnippets()
  }, [filter, session])

  const fetchSnippets = async () => {
    setIsLoading(true);
    try {
      // Choose endpoint based on whether user is logged in
      const endpoint = `/api/snippets?sort=${filter}`;
      const response = await fetch(endpoint);
      console.log("response",response)
      const data = await response.json();
      
      if (response.ok) {
        setSnippets(data.snippets || []);
        console.log("Snippets loaded:", data.snippets);
      } else {
        console.error("Failed to fetch snippets::", data.message);
        setSnippets([]);
      }
    } catch (error) {
      console.error("Error fetching snippets:", error);
      setSnippets([]);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    )
  }

  return (
    <div className="relative container mx-auto px-4 py-12 min-h-screen bg-white text-gray-900 dark:bg-gray-900 dark:text-white overflow-hidden transition-colors">
      
      {/* Enhanced Torchlight Effect */}
      <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-[800px] h-[500px] bg-gradient-radial from-blue-500/20 via-transparent to-transparent blur-3xl opacity-70 dark:from-blue-500/40 dark:opacity-80" />

      {/* Hero Header */}
      <section className="relative py-12 text-center z-10 mb-8">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-600">
            Discover Code Snippets
          </h1>
          <p className="text-lg mb-8 text-gray-700 dark:text-gray-300">
            Browse, learn from, and engage with code snippets shared by developers around the world
          </p>
          {!session ? (
            <div className="flex flex-wrap gap-4 justify-center">
              <Button
                onClick={() => router.push("/auth/signin")}
                variant="outline"
                size="lg"
                className="border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white dark:border-blue-400 dark:text-blue-400 dark:hover:bg-blue-500 dark:hover:text-white"
              >
                Sign In
              </Button>
              <Button
                onClick={() => router.push("/auth/signup")}
                size="lg"
                className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-md"
              >
                Create Account
              </Button>
            </div>
          ) : (
            <Button
              onClick={() => router.push("/snippets/new")}
              size="lg"
              className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-md"
            >
              Create New Snippet
            </Button>
          )}
        </div>
      </section>

      {/* Snippets Feed */}
      <section className="relative z-10">
        <Card className="bg-white/80 dark:bg-gray-800/50 backdrop-blur-sm p-2 rounded-xl shadow-lg shadow-gray-300/50 dark:shadow-gray-700/30 border border-gray-200/50 dark:border-gray-700/50">
          <CardHeader>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <CardTitle className="text-2xl font-bold text-gray-800 dark:text-white">Public Snippets</CardTitle>
                <CardDescription className="text-gray-600 dark:text-gray-300">
                  Explore the latest code snippets shared by the community
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500 dark:text-gray-400">Sort by:</span>
                <select 
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md px-3 py-1 text-sm"
                >
                  <option value="latest">Latest</option>
                  <option value="popular">Most Popular</option>
                  <option value="commented">Most Commented</option>
                </select>
              </div>
            </div>
          </CardHeader>
          
          <CardContent>
            {snippets.length > 0 ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {snippets.map((snippet) => (
                  <SnippetCard key={snippet._id} snippet={snippet} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-gray-50 dark:bg-gray-800/30 rounded-xl p-8">
                <div className="flex flex-col items-center gap-4">
                  <div className="p-4 rounded-full bg-blue-100 dark:bg-blue-900/30">
                    <Loader2 className="h-10 w-10 text-blue-500" />
                  </div>
                  <p className="text-gray-600 dark:text-gray-300 text-lg">No snippets found.</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  )
}