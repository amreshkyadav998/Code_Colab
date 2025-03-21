"use client"

import { use, useState, useEffect } from "react"
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
// Import rehype-pretty-code components
import { CodeBlock } from '@/components/ui/code-block'

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
  const [isDarkMode, setIsDarkMode] = useState(false)

  // Detect system color scheme
  useEffect(() => {
    const darkModeQuery = window.matchMedia('(prefers-color-scheme: dark)')
    setIsDarkMode(darkModeQuery.matches)
    
    const handleChange = (e: MediaQueryListEvent) => setIsDarkMode(e.matches)
    darkModeQuery.addEventListener('change', handleChange)
    
    return () => darkModeQuery.removeEventListener('change', handleChange)
  }, [])

  useEffect(() => {
    fetchSnippet()
  }, [id])

  // SECTION: Data Fetching
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

  // SECTION: User Actions
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

  // SECTION: Helper Functions
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

  // SECTION: Conditional Rendering
  if (isLoading) {
    return (
      <div className="container flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
          <p className="text-lg text-blue-600 font-medium animate-pulse">Loading snippet...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container max-w-4xl mx-auto py-16">
        <Alert variant="destructive" className="mb-6 border-2 border-red-300 shadow-lg animate-in fade-in">
          <AlertDescription className="text-base font-medium">{error}</AlertDescription>
        </Alert>
        <Button className="mt-4 bg-blue-600 hover:bg-blue-700 shadow-md" onClick={() => router.push("/explore")}>
          Back to Explore
        </Button>
      </div>
    )
  }

  if (!snippet) {
    return (
      <div className="container max-w-4xl mx-auto py-16">
        <Alert className="mb-6 border border-blue-200 shadow-lg bg-blue-50 dark:bg-blue-900/20 animate-in fade-in">
          <AlertDescription className="text-base font-medium">Snippet not found</AlertDescription>
        </Alert>
        <Button className="mt-4 bg-blue-600 hover:bg-blue-700 shadow-md" onClick={() => router.push("/explore")}>
          Back to Explore
        </Button>
      </div>
    )
  }

  const isOwner = session?.user?.id === snippet.author?._id

  // SECTION: Main Component Render
  return (
    <div className="relative min-h-screen pb-20 pt-[100px] overflow-hidden bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-950 text-gray-900 dark:text-white transition-colors">
      {/* Stylish background effects */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-radial from-blue-500/10 via-transparent to-transparent blur-3xl opacity-70 dark:opacity-30" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-gradient-radial from-purple-500/10 via-transparent to-transparent blur-3xl opacity-70 dark:opacity-30" />
      
      <div className="container max-w-4xl mx-auto px-4 relative z-10">
        {/* SECTION: Snippet Header */}
        <div className="flex flex-col md:flex-row justify-between gap-6 bg-white dark:bg-gray-800/90 p-8 rounded-2xl shadow-xl backdrop-blur-sm border border-gray-100 dark:border-gray-700/50 mb-8 animate-in slide-in-from-top-4">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent leading-tight">{snippet.title}</h1>
            <div className="flex flex-wrap items-center gap-3 mt-4">
              <div className="flex items-center gap-2">
                <Avatar className="h-9 w-9 ring-2 ring-blue-500/20 shadow-sm">
                  <AvatarImage src={snippet.author?.image || ""} alt={snippet.author?.name || "User"} />
                  <AvatarFallback className="bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium">{snippet.author?.name?.charAt(0) || "U"}</AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium">{snippet.author?.name}</span>
              </div>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {snippet.createdAt && formatDistanceToNow(new Date(snippet.createdAt), { addSuffix: true })}
              </span>
              <Badge variant="outline" className="flex items-center gap-1 bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30 px-3 py-1">
                {getVisibilityIcon()}
                {snippet.visibility.charAt(0).toUpperCase() + snippet.visibility.slice(1)}
              </Badge>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mt-4 md:mt-0">
            {isOwner && (
              <>
                <Button variant="outline" size="sm" onClick={() => router.push(`/snippets/edit/${id}`)} className="border-blue-500/30 text-blue-600 hover:bg-blue-500/10 dark:text-blue-400 transition-all hover:shadow-md">
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </Button>
                <Button variant="outline" size="sm" className="border-red-500/30 text-red-600 hover:bg-red-500/10 dark:text-red-400 transition-all hover:shadow-md" onClick={handleDelete}>
                  <Trash className="mr-2 h-4 w-4" />
                  Delete
                </Button>
              </>
            )}
            <Button 
              variant="outline" 
              size="sm" 
              className={`border-blue-500/30 ${copied ? 'text-green-600 border-green-500/30' : 'text-blue-600 dark:text-blue-400'} hover:bg-blue-500/10 transition-all hover:shadow-md`} 
              onClick={copyToClipboard}
            >
              {copied ? (
                <span className="flex items-center gap-1 text-green-600">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Copied!
                </span>
              ) : (
                <>
                  <Copy className="mr-2 h-4 w-4" />
                  Copy Code
                </>
              )}
            </Button>
            <Button variant="outline" size="sm" className="border-blue-500/30 text-blue-600 hover:bg-blue-500/10 dark:text-blue-400 transition-all hover:shadow-md">
              <Share2 className="mr-2 h-4 w-4" />
              Share
            </Button>
          </div>
        </div>

        {/* SECTION: Description */}
        {snippet.description && (
          <div className="text-gray-800 font-bold dark:text-pink-500 bg-white dark:bg-gray-800/50 p-6 rounded-xl shadow-md border border-gray-100 dark:border-gray-700/50 mb-8 backdrop-blur-sm animate-in fade-in-50">
            {snippet.description}
          </div>
        )}

        {/* SECTION: Tags */}
        {snippet.tags && snippet.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-8 animate-in fade-in-75">
            <h2 className="sr-only">Tags</h2>
            {snippet.tags.map((tag: string) => (
              <Badge key={tag} variant="secondary" className="bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-800/60 transition-colors cursor-pointer px-3 py-1 text-sm">
                {tag}
              </Badge>
            ))}
          </div>
        )}

        {/* SECTION: Code Display with rehype-pretty-code */}
        <Card className="overflow-hidden border-0 shadow-2xl bg-white dark:bg-gray-800/90 transition-all hover:shadow-blue-500/5 mb-12 animate-in fade-in-100">
          <CardHeader className="pb-2 flex flex-row items-center justify-between bg-gray-50 dark:bg-gray-800 border-b dark:border-gray-700">
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 text-white text-xs font-semibold shadow-md">
                {snippet.language.charAt(0).toUpperCase() + snippet.language.slice(1)}
              </span>
              
              {/* File name display - optional */}
              <span className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                {snippet.fileName || `snippet.${snippet.language}`}
              </span>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={copyToClipboard} 
              className="text-blue-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20"
              aria-label="Copy code"
            >
              <Copy className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto text-sm font-mono">
              <CodeBlock 
                code={snippet.code}
                language={snippet.language}
                theme={isDarkMode ? "github-dark" : "github-light"}
                showLineNumbers={true}
                enableCopy={false}
                className="m-0 p-0 border-0 mr-2 bg-transparent"
              />
            </div>
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
              className={isLiked 
                ? "bg-pink-500/10 hover:bg-pink-500/20 text-pink-500 border border-pink-500/30" 
                : "text-gray-500 hover:text-pink-500 transition-colors"}
            >
              <Heart className={`mr-2 h-4 w-4 ${isLiked ? "fill-pink-500" : ""} transition-colors`} />
              {likeCount}
            </Button>
          </CardFooter>
        </Card>

        {/* SECTION: Comments and Version History */}
        <div className="mt-8">
          <h2 className="text-2xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Feedback & History</h2>
          <Tabs defaultValue="comments" className="w-full animate-in fade-in-75">
            <TabsList className="bg-white dark:bg-gray-800 p-1 rounded-full w-full max-w-md mx-auto mb-8 shadow-md">
              <TabsTrigger value="comments" className="rounded-full data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white transition-all">
                Comments ({comments.length})
              </TabsTrigger>
              <TabsTrigger value="history" className="rounded-full data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white transition-all">
                Version History ({snippet.previousVersions?.length || 0})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="comments">
              {/* SECTION: Add Comment */}
              {session ? (
                <div className="mb-8 bg-white dark:bg-gray-800/90 p-8 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700/50 backdrop-blur-sm">
                  <h3 className="text-lg font-semibold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Add Your Comment</h3>
                  <Textarea
                    placeholder="Share your thoughts on this snippet..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    className="mb-4 border-blue-200 dark:border-blue-900/30 focus:ring-blue-500 transition-all min-h-32"
                  />
                  <Button 
                    onClick={handleCommentSubmit} 
                    disabled={isSubmittingComment || !newComment.trim()}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg shadow-blue-400/20 dark:shadow-blue-900/20 transition-all"
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
                <div className="mb-8 p-8 bg-white dark:bg-gray-800/90 rounded-xl text-center shadow-xl border border-blue-200 dark:border-blue-900/30 backdrop-blur-sm">
                  <p className="mb-4 text-gray-600 dark:text-gray-300">Sign in to join the conversation and leave your thoughts!</p>
                  <Button 
                    onClick={() => router.push("/auth/signin")} 
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg shadow-blue-400/20 transition-all"
                  >
                    Sign In
                  </Button>
                </div>
              )}

              {/* SECTION: Comments List */}
              <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">Discussion</h3>
              {comments.length > 0 ? (
                <div className="space-y-6">
                  {comments.map((comment) => (
                    <Card key={comment._id} className="border-0 shadow-lg hover:shadow-xl transition-shadow bg-white dark:bg-gray-800/80 overflow-hidden">
                      <CardHeader className="pb-2 border-b border-gray-100 dark:border-gray-700/50">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-9 w-9 ring-2 ring-blue-500/20 shadow-sm">
                            <AvatarImage src={comment.author?.image || ""} alt={comment.author?.name || "User"} />
                            <AvatarFallback className="bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium">{comment.author?.name?.charAt(0) || "U"}</AvatarFallback>
                          </Avatar>
                          <div>
                            <span className="text-sm font-medium text-gray-900 dark:text-white">{comment.author?.name}</span>
                            <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                              {comment.createdAt && formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                            </span>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-4">
                        <p className="text-gray-700 dark:text-gray-300">{comment.content}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16 text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800/50 rounded-xl shadow-md border border-gray-100 dark:border-gray-700/50">
                  <MessageSquare className="mx-auto h-12 w-12 mb-4 text-blue-500 opacity-50" />
                  <p className="text-lg">No comments yet. Be the first to share your thoughts!</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="history">
              {/* SECTION: Version History */}
              <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">Previous Versions</h3>
              {snippet.previousVersions && snippet.previousVersions.length > 0 ? (
                <div className="space-y-6">
                  {snippet.previousVersions.map((version: any, index: number) => (
                    <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-shadow bg-white dark:bg-gray-800/80 overflow-hidden">
                      <CardHeader className="pb-2 bg-gray-50 dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700/50">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-sm font-medium">
                            <span className="px-3 py-1 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 text-white text-xs font-semibold">
                              Version {version.version}
                            </span>
                          </CardTitle>
                          <CardDescription className="text-gray-500 dark:text-gray-400">
                            {version.updatedAt && format(new Date(version.updatedAt), "PPpp")}
                          </CardDescription>
                        </div>
                      </CardHeader>
                      <CardContent className="p-0">
                        <CodeBlock 
                          code={version.code}
                          language={snippet.language}
                          theme={isDarkMode ? "github-dark" : "github-light"}
                          showLineNumbers={true}
                          enableCopy={false}
                          className="m-0 p-0 border-0 bg-transparent max-h-64"
                        />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16 text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800/50 rounded-xl shadow-md border border-gray-100 dark:border-gray-700/50">
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

