"use client"

import {use, useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Copy, Edit, Eye, Globe, Heart, Loader2, Lock, MessageSquare, Share2, Trash } from "lucide-react"
import { formatDistanceToNow, format } from "date-fns"

export default function SnippetPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const { id } = use(params);
  const { data: session, status } = useSession()
  const [snippet, setSnippet] = useState<any>(null)
  const [comments, setComments] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [copied, setCopied] = useState(false)
  const [newComment, setNewComment] = useState("")
  const [isSubmittingComment, setIsSubmittingComment] = useState(false)
  const [isLiked, setIsLiked] = useState(false)
  const [likeCount, setLikeCount] = useState(0)

  useEffect(() => {
    fetchSnippet()
  }, [id])

  const fetchSnippet = async () => {
    setIsLoading(true)
    setError("")

    try {
      const response = await fetch(`/api/snippets/${id}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch snippet")
      }

      setSnippet(data.snippet)
      setComments(data.comments || [])
      setLikeCount(data.snippet.likes || 0)

      // Check if user has liked this snippet
      if (session?.user?.id && data.snippet.likedBy) {
        setIsLiked(data.snippet.likedBy.includes(session.user.id))
      }
    } catch (error: any) {
      setError(error.message || "An error occurred")
      console.error("Error fetching snippet:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const copyToClipboard = () => {
    if (snippet?.code) {
      navigator.clipboard.writeText(snippet.code)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleDelete = async () => {
    if (confirm("Are you sure you want to delete this snippet? This action cannot be undone.")) {
      try {
        const response = await fetch(`/api/snippets/${id}`, {
          method: "DELETE",
        })

        if (response.ok) {
          router.push("/profile")
        } else {
          const data = await response.json()
          throw new Error(data.message || "Failed to delete snippet")
        }
      } catch (error: any) {
        console.error("Error deleting snippet:", error)
        alert(error.message || "An error occurred while deleting the snippet")
      }
    }
  }

  const handleCommentSubmit = async () => {
    if (!newComment.trim()) return

    setIsSubmittingComment(true)

    try {
      const response = await fetch(`/api/snippets/${id}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content: newComment }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Failed to add comment")
      }

      setComments([data.comment, ...comments])
      setNewComment("")
    } catch (error: any) {
      console.error("Error adding comment:", error)
      alert(error.message || "An error occurred while adding your comment")
    } finally {
      setIsSubmittingComment(false)
    }
  }

  const toggleLike = async () => {
    if (!session) {
      router.push("/auth/signin")
      return
    }

    try {
      const response = await fetch(`/api/snippets/${id}/like`, {
        method: "POST",
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Failed to like snippet")
      }

      setIsLiked(data.liked)
      setLikeCount(data.likeCount)
    } catch (error: any) {
      console.error("Error liking snippet:", error)
    }
  }

  const getVisibilityIcon = () => {
    switch (snippet?.visibility) {
      case "public":
        return <Globe className="h-4 w-4" />
      case "private":
        return <Lock className="h-4 w-4" />
      default:
        return <Share2 className="h-4 w-4" />
    }
  }

  if (isLoading) {
    return (
      <div className="container flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="container py-8">
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <Button className="mt-4 bg-blue-500 hover:bg-blue-600" onClick={() => router.push("/explore")}>
          Back to Explore
        </Button>
      </div>
    )
  }

  if (!snippet) {
    return (
      <div className="container py-8">
        <Alert>
          <AlertDescription>Snippet not found</AlertDescription>
        </Alert>
        <Button className="mt-4 bg-blue-500 hover:bg-blue-600" onClick={() => router.push("/explore")}>
          Back to Explore
        </Button>
      </div>
    )
  }

  const isOwner = session?.user?.id === snippet.author?._id

  return (
    <div className="relative mt-5 container mx-auto px-8 py-12 min-h-screen bg-white text-gray-900 dark:bg-gray-900 dark:text-white overflow-hidden transition-colors">
      {/* Torchlight Effect (Dark Mode) */}
      <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-[800px] h-[500px] bg-gradient-radial from-blue-500/30 via-transparent to-transparent blur-3xl opacity-70 dark:block hidden" />
      
      <div className="relative z-10 grid gap-8">
        {/* Snippet Header */}
        <div className="flex flex-col md:flex-row justify-between gap-6 bg-gray-50 dark:bg-gray-800/50 p-6 rounded-xl shadow-lg">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-500 to-purple-500 text-transparent bg-clip-text">{snippet.title}</h1>
            <div className="flex flex-wrap items-center gap-3 mt-3">
              <div className="flex items-center gap-2">
                <Avatar className="h-8 w-8 ring-2 ring-blue-500/20">
                  <AvatarImage src={snippet.author?.image || ""} alt={snippet.author?.name || "User"} />
                  <AvatarFallback className="bg-blue-500 text-white">{snippet.author?.name?.charAt(0) || "U"}</AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium">{snippet.author?.name}</span>
              </div>
              <span className="text-sm text-muted-foreground">
                {snippet.createdAt && formatDistanceToNow(new Date(snippet.createdAt), { addSuffix: true })}
              </span>
              <Badge variant="outline" className="flex items-center gap-1 bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30">
                {getVisibilityIcon()}
                {snippet.visibility.charAt(0).toUpperCase() + snippet.visibility.slice(1)}
              </Badge>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {isOwner && (
              <>
                <Button variant="outline" size="sm" className="border-blue-500/30 text-blue-600 hover:bg-blue-500/10 dark:text-blue-400" onClick={() => router.push(`/snippets/edit/${id}`)}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </Button>
                <Button variant="outline" size="sm" className="border-red-500/30 text-red-600 hover:bg-red-500/10 dark:text-red-400" onClick={handleDelete}>
                  <Trash className="mr-2 h-4 w-4" />
                  Delete
                </Button>
              </>
            )}
            <Button variant="outline" size="sm" className="border-blue-500/30 text-blue-600 hover:bg-blue-500/10 dark:text-blue-400" onClick={copyToClipboard}>
              {copied ? (
                <span className="text-green-500">Copied!</span>
              ) : (
                <>
                  <Copy className="mr-2 h-4 w-4" />
                  Copy Code
                </>
              )}
            </Button>
            <Button variant="outline" size="sm" className="border-blue-500/30 text-blue-600 hover:bg-blue-500/10 dark:text-blue-400">
              <Share2 className="mr-2 h-4 w-4" />
              Share
            </Button>
          </div>
        </div>

        {/* Description */}
        {snippet.description && (
          <div className="text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/30 p-4 rounded-lg shadow-sm">
            {snippet.description}
          </div>
        )}

        {/* Tags */}
        {snippet.tags && snippet.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {snippet.tags.map((tag: string) => (
              <Badge key={tag} variant="secondary" className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-800/40 transition-colors">
                {tag}
              </Badge>
            ))}
          </div>
        )}

        {/* Code */}
        <Card className="overflow-hidden border-0 shadow-xl dark:bg-gray-800/60 transition-all hover:shadow-blue-500/5">
          <CardHeader className="pb-2 flex flex-row items-center justify-between bg-gray-50 dark:bg-gray-800 border-b dark:border-gray-700">
            <div>
              <CardTitle className="text-sm font-medium">
                <span className="px-3 py-1 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 text-white text-xs font-semibold shadow-md">
                  {snippet.language.charAt(0).toUpperCase() + snippet.language.slice(1)}
                </span>
              </CardTitle>
            </div>
            <Button variant="ghost" size="sm" onClick={copyToClipboard} className="text-blue-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20">
              <Copy className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            <pre className="bg-gray-50 dark:bg-gray-800/80 p-6 overflow-x-auto text-sm font-mono">{snippet.code}</pre>
          </CardContent>
          <CardFooter className="flex justify-between py-4 bg-gray-50 dark:bg-gray-800 border-t dark:border-gray-700">
            <div className="flex items-center gap-6 text-sm text-gray-500 dark:text-gray-400">
              <div className="flex items-center">
                <Eye className="mr-2 h-4 w-4" />
                {snippet.views || 0} views
              </div>
              <div className="flex items-center">
                <MessageSquare className="mr-2 h-4 w-4" />
                {comments.length} comments
              </div>
            </div>
            <Button
              variant={isLiked ? "default" : "ghost"}
              size="sm"
              onClick={toggleLike}
              className={isLiked ? "bg-pink-500/10 hover:bg-pink-500/20 text-pink-500 border border-pink-500/30" : "text-gray-500 hover:text-pink-500"}
            >
              <Heart className={`mr-2 h-4 w-4 ${isLiked ? "fill-pink-500" : ""}`} />
              {likeCount}
            </Button>
          </CardFooter>
        </Card>

        {/* Comments and Version History */}
        <div className="mt-8">
          <Tabs defaultValue="comments" className="w-full">
            <TabsList className="bg-gray-100 dark:bg-gray-800 p-1 rounded-full w-full max-w-md mx-auto mb-6">
              <TabsTrigger value="comments" className="rounded-full data-[state=active]:bg-blue-500 data-[state=active]:text-white">
                Comments ({comments.length})
              </TabsTrigger>
              <TabsTrigger value="history" className="rounded-full data-[state=active]:bg-blue-500 data-[state=active]:text-white">
                Version History ({snippet.previousVersions?.length || 0})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="comments">
              {/* Add Comment */}
              {session ? (
                <div className="mb-8 bg-gray-50 dark:bg-gray-800/50 p-6 rounded-xl shadow-lg">
                  <h3 className="text-lg font-semibold mb-4 bg-gradient-to-r from-blue-500 to-purple-500 text-transparent bg-clip-text">Add Your Comment</h3>
                  <Textarea
                    placeholder="Share your thoughts on this snippet..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    className="mb-4 border-blue-200 dark:border-blue-900/30 focus:ring-blue-500 transition-all"
                  />
                  <Button 
                    onClick={handleCommentSubmit} 
                    disabled={isSubmittingComment || !newComment.trim()}
                    className="bg-blue-500 hover:bg-blue-600 text-white shadow-lg shadow-blue-400/20 dark:shadow-blue-900/20"
                  >
                    {isSubmittingComment ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Posting...
                      </>
                    ) : (
                      "Post Comment"
                    )}
                  </Button>
                </div>
              ) : (
                <div className="mb-8 p-8 bg-gray-50 dark:bg-gray-800/50 rounded-xl text-center shadow-lg border border-blue-200 dark:border-blue-900/30">
                  <p className="mb-4 text-gray-600 dark:text-gray-300">Sign in to join the conversation and leave your thoughts!</p>
                  <Button onClick={() => router.push("/auth/signin")} className="bg-blue-500 hover:bg-blue-600 text-white shadow-lg shadow-blue-400/20">Sign In</Button>
                </div>
              )}

              {/* Comments List */}
              {comments.length > 0 ? (
                <div className="space-y-6">
                  {comments.map((comment) => (
                    <Card key={comment._id} className="border-0 shadow-lg hover:shadow-xl transition-shadow dark:bg-gray-800/60">
                      <CardHeader className="pb-2">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8 ring-2 ring-blue-500/20">
                            <AvatarImage src={comment.author?.image || ""} alt={comment.author?.name || "User"} />
                            <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">{comment.author?.name?.charAt(0) || "U"}</AvatarFallback>
                          </Avatar>
                          <div>
                            <span className="text-sm font-medium text-gray-900 dark:text-white">{comment.author?.name}</span>
                            <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                              {comment.createdAt && formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                            </span>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-gray-700 dark:text-gray-300">{comment.content}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/30 rounded-xl">
                  <MessageSquare className="mx-auto h-12 w-12 mb-4 text-blue-500 opacity-50" />
                  <p className="text-lg">No comments yet. Be the first to share your thoughts!</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="history">
              {snippet.previousVersions && snippet.previousVersions.length > 0 ? (
                <div className="space-y-6">
                  {snippet.previousVersions.map((version: any, index: number) => (
                    <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-shadow dark:bg-gray-800/60">
                      <CardHeader className="pb-2 bg-gray-50 dark:bg-gray-800">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-sm font-medium">
                            <span className="px-3 py-1 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 text-white text-xs font-semibold">
                              Version {version.version}
                            </span>
                          </CardTitle>
                          <CardDescription className="text-gray-500 dark:text-gray-400">
                            {version.updatedAt && format(new Date(version.updatedAt), "PPpp")}
                          </CardDescription>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <pre className="bg-gray-50 dark:bg-gray-800/80 p-4 rounded-md overflow-x-auto text-sm font-mono max-h-60 border border-gray-200 dark:border-gray-700">
                          {version.code}
                        </pre>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/30 rounded-xl">
                  <Edit className="mx-auto h-12 w-12 mb-4 text-blue-500 opacity-50" />
                  <p className="text-lg">No previous versions available.</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}