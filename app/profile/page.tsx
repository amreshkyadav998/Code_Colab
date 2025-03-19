"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Loader2 } from "lucide-react"
import SnippetCard from "@/components/snippet-card"

export default function ProfilePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [snippets, setSnippets] = useState([])
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

      if (response.ok) {
        setSnippets(data.snippets)
      }
    } catch (error) {
      console.error("Error fetching snippets:", error)
    } finally {
      setIsLoading(false)
    }
  }

  if (status === "loading" || isLoading) {
    return (
      <div className="container flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="container py-8 mr-12 my-9 w-[80vw]">
      <div className="grid gap-8">
        {/* Profile Header */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-6 items-center md:items-start">
              <Avatar className="h-24 w-24">
                <AvatarImage src={session?.user?.image || ""} alt={session?.user?.name || "User"} />
                <AvatarFallback className="text-2xl">{session?.user?.name?.charAt(0) || "U"}</AvatarFallback>
              </Avatar>
              <div className="space-y-2 text-center md:text-left">
                <h1 className="text-2xl font-bold">{session?.user?.name}</h1>
                <p className="text-muted-foreground">{session?.user?.email}</p>
                <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                  <Button variant="outline" size="sm" onClick={() => router.push("/settings")}>
                    Edit Profile
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => router.push("/snippets/new")}>
                    Create Snippet
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Snippets */}
        <Card>
          <CardHeader>
            <CardTitle>Your Snippets</CardTitle>
            <CardDescription>Manage your code snippets</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="all" className="w-full">
              <TabsList className="grid grid-cols-3 w-full max-w-md mb-6">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="public">Public</TabsTrigger>
                <TabsTrigger value="private">Private</TabsTrigger>
              </TabsList>

              <TabsContent value="all">
                {snippets.length > 0 ? (
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {snippets.map((snippet) => (
                      <SnippetCard key={snippet._id} snippet={snippet} onDelete={fetchUserSnippets} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground">You haven't created any snippets yet.</p>
                    <Button className="mt-4" onClick={() => router.push("/snippets/new")}>
                      Create Your First Snippet
                    </Button>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="public">
                {snippets.filter((s) => s.visibility === "public").length > 0 ? (
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {snippets
                      .filter((s) => s.visibility === "public")
                      .map((snippet) => (
                        <SnippetCard key={snippet._id} snippet={snippet} onDelete={fetchUserSnippets} />
                      ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground">You don't have any public snippets.</p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="private">
                {snippets.filter((s) => s.visibility === "private").length > 0 ? (
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {snippets
                      .filter((s) => s.visibility === "private")
                      .map((snippet) => (
                        <SnippetCard key={snippet._id} snippet={snippet} onDelete={fetchUserSnippets} />
                      ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground">You don't have any private snippets.</p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

