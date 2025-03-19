"use client"

import { useState, useEffect } from "react"
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

export default function SnippetPage({ params }: { params: { id: string } }) {
  const router = useRouter()
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
  }, [params.id])

  const fetchSnippet = async () => {
    setIsLoading(true)
    setError("")

    try {
      const response = await fetch(`/api/snippets/${params.id}`)
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
        const response = await fetch(`/api/snippets/${params.id}`, {
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
      const response = await fetch(`/api/snippets/${params.id}/comments`, {
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
      const response = await fetch(`/api/snippets/${params.id}/like`, {
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
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="container py-8">
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <Button className="mt-4" onClick={() => router.push("/explore")}>
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
        <Button className="mt-4" onClick={() => router.push("/explore")}>
          Back to Explore
        </Button>
      </div>
    )
  }

  const isOwner = session?.user?.id === snippet.author?._id

  return (
    <div className="container py-8">
      <div className="grid gap-6">
        {/* Snippet Header */}
        <div className="flex flex-col md:flex-row justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">{snippet.title}</h1>
            <div className="flex items-center gap-3 mt-2">
              <div className="flex items-center gap-2">
                <Avatar className="h-6 w-6">
                  <AvatarImage src={snippet.author?.image || ""} alt={snippet.author?.name || "User"} />
                  <AvatarFallback>{snippet.author?.name?.charAt(0) || "U"}</AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium">{snippet.author?.name}</span>
              </div>
              <span className="text-sm text-muted-foreground">
                {snippet.createdAt && formatDistanceToNow(new Date(snippet.createdAt), { addSuffix: true })}
              </span>
              <Badge variant="outline" className="flex items-center gap-1">
                {getVisibilityIcon()}
                {snippet.visibility.charAt(0).toUpperCase() + snippet.visibility.slice(1)}
              </Badge>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {isOwner && (
              <>
                <Button variant="outline" size="sm" onClick={() => router.push(`/snippets/edit/${params.id}`)}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </Button>
                <Button variant="outline" size="sm" onClick={handleDelete}>
                  <Trash className="mr-2 h-4 w-4" />
                  Delete
                </Button>
              </>
            )}
            <Button variant="outline" size="sm" onClick={copyToClipboard}>
              {copied ? (
                <span className="text-green-500">Copied!</span>
              ) : (
                <>
                  <Copy className="mr-2 h-4 w-4" />
                  Copy Code
                </>
              )}
            </Button>
            <Button variant="outline" size="sm">
              <Share2 className="mr-2 h-4 w-4" />
              Share
            </Button>
          </div>
        </div>

        {/* Description */}
        {snippet.description && <div className="text-muted-foreground">{snippet.description}</div>}

        {/* Tags */}
        {snippet.tags && snippet.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {snippet.tags.map((tag: string) => (
              <Badge key={tag} variant="secondary">
                {tag}
              </Badge>
            ))}
          </div>
        )}

        {/* Code */}
        <Card>
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-sm font-medium">
                {snippet.language.charAt(0).toUpperCase() + snippet.language.slice(1)}
              </CardTitle>
            </div>
            <Button variant="ghost" size="sm" onClick={copyToClipboard}>
              <Copy className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent>
            <pre className="bg-muted p-4 rounded-md overflow-x-auto text-sm font-mono">{snippet.code}</pre>
          </CardContent>
          <CardFooter className="flex justify-between">
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center">
                <Eye className="mr-1 h-4 w-4" />
                {snippet.views || 0}
              </div>
              <div className="flex items-center">
                <MessageSquare className="mr-1 h-4 w-4" />
                {comments.length}
              </div>
            </div>
            <Button
              variant={isLiked ? "default" : "ghost"}
              size="sm"
              onClick={toggleLike}
              className={isLiked ? "bg-primary/10 hover:bg-primary/20 text-primary" : ""}
            >
              <Heart className={`mr-1 h-4 w-4 ${isLiked ? "fill-primary" : ""}`} />
              {likeCount}
            </Button>
          </CardFooter>
        </Card>

        {/* Comments and Version History */}
        <Tabs defaultValue="comments">
          <TabsList>
            <TabsTrigger value="comments">Comments ({comments.length})</TabsTrigger>
            <TabsTrigger value="history">Version History ({snippet.previousVersions?.length || 0})</TabsTrigger>
          </TabsList>

          <TabsContent value="comments">
            {/* Add Comment */}
            {session ? (
              <div className="mb-6">
                <Textarea
                  placeholder="Add a comment..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="mb-2"
                />
                <Button onClick={handleCommentSubmit} disabled={isSubmittingComment || !newComment.trim()}>
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
              <div className="mb-6 p-4 bg-muted rounded-md text-center">
                <p className="mb-2">Sign in to leave a comment</p>
                <Button onClick={() => router.push("/auth/signin")}>Sign In</Button>
              </div>
            )}

            {/* Comments List */}
            {comments.length > 0 ? (
              <div className="space-y-4">
                {comments.map((comment) => (
                  <Card key={comment._id}>
                    <CardHeader className="pb-2">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={comment.author?.image || ""} alt={comment.author?.name || "User"} />
                          <AvatarFallback>{comment.author?.name?.charAt(0) || "U"}</AvatarFallback>
                        </Avatar>
                        <div>
                          <span className="text-sm font-medium">{comment.author?.name}</span>
                          <span className="text-xs text-muted-foreground ml-2">
                            {comment.createdAt && formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                          </span>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm">{comment.content}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">No comments yet. Be the first to comment!</div>
            )}
          </TabsContent>

          <TabsContent value="history">
            {snippet.previousVersions && snippet.previousVersions.length > 0 ? (
              <div className="space-y-4">
                {snippet.previousVersions.map((version: any, index: number) => (
                  <Card key={index}>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Version {version.version}</CardTitle>
                      <CardDescription>
                        {version.updatedAt && format(new Date(version.updatedAt), "PPpp")}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <pre className="bg-muted p-4 rounded-md overflow-x-auto text-sm font-mono max-h-60">
                        {version.code}
                      </pre>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">No previous versions available.</div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

