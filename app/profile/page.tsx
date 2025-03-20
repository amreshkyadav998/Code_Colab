"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useState, useEffect, JSXElementConstructor, Key, ReactElement, ReactNode, ReactPortal } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Loader2, Eye, Edit, Trash2, Tag, Lock, Globe } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

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
}

interface EnhancedSnippetCardProps {
  snippet: Snippet;
  onDelete: () => void;
}

// Enhanced SnippetCard component with visible action buttons
function EnhancedSnippetCard({ snippet, onDelete }: EnhancedSnippetCardProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  
  const handleDelete = async (e: { stopPropagation: () => void }) => {
    e.stopPropagation();
    if (window.confirm("Are you sure you want to delete this snippet?")) {
      setIsDeleting(true);
      try {
        const response = await fetch(`/api/snippets/${snippet._id}`, {
          method: "DELETE",
        });
        if (response.ok) {
          onDelete();
        }
      } catch (error) {
        console.error("Error deleting snippet:", error);
      } finally {
        setIsDeleting(false);
      }
    }
  };

  const handleEdit = (e: { stopPropagation: () => void }) => {
    e.stopPropagation();
    router.push(`/snippets/edit/${snippet._id}`);
  };

  const handleView = (e: { stopPropagation: () => void }) => {
    e.stopPropagation();
    router.push(`/snippets/${snippet._id}`);
  };

  const formatDate = (dateString: string | number | Date) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Function to get language color
  const getLanguageColor = (lang: string) => {
    const colors = {
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
          {/* Tags */}
          {/* Tags */}
{snippet.tags && snippet.tags.length > 0 && (
  <div className="flex flex-wrap gap-1">
    {snippet.tags.slice(0, 3).map((tag: string, index: number) => (
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

          {/* Action Buttons */}
          <div className="flex items-center justify-between gap-2 mt-4">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                    onClick={handleView}
                  >
                    <Eye className="h-5 w-5 text-blue-500" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>View snippet</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                    onClick={handleEdit}
                  >
                    <Edit className="h-5 w-5 text-amber-500" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Edit snippet</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-full hover:bg-red-100 dark:hover:bg-red-950/30"
                    onClick={handleDelete}
                    disabled={isDeleting}
                  >
                    {isDeleting ? (
                      <Loader2 className="h-5 w-5 animate-spin text-red-500" />
                    ) : (
                      <Trash2 className="h-5 w-5 text-red-500" />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Delete snippet</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function ProfilePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [snippets, setSnippets] = useState<Snippet[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin")
    }
    if (status === "authenticated") {
      fetchUserSnippets()
    }
  }, [status, router])

  const fetchUserSnippets = async () => {
    try {
      const response = await fetch("/api/user/snippets")
      const data = await response.json()
      if (response.ok) setSnippets(data.snippets)
    } catch (error) {
      console.error("Error fetching snippets:", error)
    } finally {
      setIsLoading(false)
    }
  }

  if (status === "loading" || isLoading) {
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

      {/* Profile Header with Glass Morphism */}
      <section className="relative py-12 flex flex-col items-center text-center z-10">
        <div className="bg-white/80 dark:bg-gray-800/50 backdrop-blur-sm p-8 rounded-xl shadow-lg shadow-gray-300/50 dark:shadow-gray-700/30 hover:scale-105 transition-transform duration-300 border border-gray-200/50 dark:border-gray-700/50">
          <Avatar className="h-24 w-24 mx-auto border-4 border-white dark:border-gray-700 shadow-md">
            <AvatarImage src={session?.user?.image || ""} alt={session?.user?.name || "User"} />
            <AvatarFallback className="text-2xl bg-gradient-to-r from-blue-500 to-blue-600 text-white">
              {session?.user?.name?.charAt(0) || "U"}
            </AvatarFallback>
          </Avatar>
          <h1 className="text-3xl font-bold mt-4">{session?.user?.name}</h1>
          <p className="text-gray-600 dark:text-gray-300 mb-6">{session?.user?.email}</p>
          <div className="flex flex-wrap gap-3 justify-center mt-4">
            <Button variant="outline" onClick={() => router.push("/settings")} size="lg" className="border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white dark:border-blue-400 dark:text-blue-400 dark:hover:bg-blue-500 dark:hover:text-white transition-all duration-300">
              Edit Profile
            </Button>
            <Button size="lg" onClick={() => router.push("/snippets/new")} className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-md shadow-blue-500/30 dark:shadow-blue-500/20 transition-all duration-300">
              Create Snippet
            </Button>
          </div>
        </div>
      </section>

      {/* Snippets Section */}
      <section className="relative py-12 z-10">
        <Card className="bg-white/80 dark:bg-gray-800/50 backdrop-blur-sm p-6 rounded-xl shadow-lg shadow-gray-300/50 dark:shadow-gray-700/30 border border-gray-200/50 dark:border-gray-700/50">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-gray-800 dark:text-white">Your Snippets</CardTitle>
            <CardDescription className="text-gray-600 dark:text-gray-300">Manage your code snippets</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="all" className="w-full">
              <TabsList className="grid grid-cols-3 w-full max-w-md mb-6 bg-gray-100 dark:bg-gray-700/50">
                <TabsTrigger value="all" className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800">All</TabsTrigger>
                <TabsTrigger value="public" className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800">Public</TabsTrigger>
                <TabsTrigger value="private" className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800">Private</TabsTrigger>
              </TabsList>

              <TabsContent value="all">
                {snippets.length > 0 ? (
                  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {snippets.map((snippet) => (
                      <EnhancedSnippetCard key={snippet._id} snippet={snippet} onDelete={fetchUserSnippets} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 bg-gray-50 dark:bg-gray-800/30 rounded-xl p-8">
                    <div className="flex flex-col items-center gap-4">
                      <div className="p-4 rounded-full bg-blue-100 dark:bg-blue-900/30">
                        <Loader2 className="h-10 w-10 text-blue-500" />
                      </div>
                      <p className="text-gray-600 dark:text-gray-300 text-lg">You haven't created any snippets yet.</p>
                      <Button 
                        onClick={() => router.push("/snippets/new")}
                        className="mt-4 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-md">
                        Create Your First Snippet
                      </Button>
                    </div>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="public">
                {snippets.filter((s) => s.visibility === "public").length > 0 ? (
                  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {snippets
                      .filter((s) => s.visibility === "public")
                      .map((snippet) => (
                        <EnhancedSnippetCard key={snippet._id} snippet={snippet} onDelete={fetchUserSnippets} />
                      ))}
                  </div>
                ) : (
                  <div className="text-center py-12 bg-gray-50 dark:bg-gray-800/30 rounded-xl p-8">
                    <div className="flex flex-col items-center gap-4">
                      <div className="p-4 rounded-full bg-amber-100 dark:bg-amber-900/30">
                        <Globe className="h-10 w-10 text-amber-500" />
                      </div>
                      <p className="text-gray-600 dark:text-gray-300 text-lg">You don't have any public snippets.</p>
                      <Button 
                        onClick={() => router.push("/snippets/new")}
                        className="mt-4 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-md">
                        Create Public Snippet
                      </Button>
                    </div>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="private">
                {snippets.filter((s) => s.visibility === "private").length > 0 ? (
                  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {snippets
                      .filter((s) => s.visibility === "private")
                      .map((snippet) => (
                        <EnhancedSnippetCard key={snippet._id} snippet={snippet} onDelete={fetchUserSnippets} />
                      ))}
                  </div>
                ) : (
                  <div className="text-center py-12 bg-gray-50 dark:bg-gray-800/30 rounded-xl p-8">
                    <div className="flex flex-col items-center gap-4">
                      <div className="p-4 rounded-full bg-purple-100 dark:bg-purple-900/30">
                        <Lock className="h-10 w-10 text-purple-500" />
                      </div>
                      <p className="text-gray-600 dark:text-gray-300 text-lg">You don't have any private snippets.</p>
                      <Button 
                        onClick={() => router.push("/snippets/new")}
                        className="mt-4 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-md">
                        Create Private Snippet
                      </Button>
                    </div>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </section>
    </div>
  )
}