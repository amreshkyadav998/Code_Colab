"use client"

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Bookmark, Copy, Eye, MessageSquare, Share2 } from "lucide-react"
import Link from "next/link"
import { useState } from "react"

const featuredSnippets = [
  {
    id: "1",
    title: "React useEffect Cleanup",
    description: "How to properly clean up effects in React functional components",
    language: "javascript",
    code: `useEffect(() => {
  const subscription = subscribeToData();
  
  return () => {
    subscription.unsubscribe();
  };
}, []);`,
    author: {
      name: "Sarah Chen",
      image: "/placeholder.svg?height=40&width=40",
    },
    tags: ["react", "hooks", "javascript"],
    views: 1243,
    comments: 8,
  },
  {
    id: "2",
    title: "Tailwind CSS Grid Layout",
    description: "Responsive grid layout using Tailwind CSS",
    language: "html",
    code: `<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  <div class="bg-blue-100 p-4 rounded">Item 1</div>
  <div class="bg-blue-100 p-4 rounded">Item 2</div>
  <div class="bg-blue-100 p-4 rounded">Item 3</div>
</div>`,
    author: {
      name: "Mike Johnson",
      image: "/placeholder.svg?height=40&width=40",
    },
    tags: ["tailwind", "css", "responsive"],
    views: 856,
    comments: 4,
  },
  {
    id: "3",
    title: "MongoDB Aggregation Pipeline",
    description: "Example of a MongoDB aggregation pipeline for data analysis",
    language: "javascript",
    code: `db.collection.aggregate([
  { $match: { status: "active" } },
  { $group: { _id: "$category", count: { $sum: 1 } } },
  { $sort: { count: -1 } }
])`,
    author: {
      name: "Priya Patel",
      image: "/placeholder.svg?height=40&width=40",
    },
    tags: ["mongodb", "database", "aggregation"],
    views: 723,
    comments: 6,
  },
]

export default function FeaturedSnippets() {
  const [copied, setCopied] = useState<string | null>(null)

  const copyToClipboard = (code: string, id: string) => {
    navigator.clipboard.writeText(code)
    setCopied(id)
    setTimeout(() => setCopied(null), 2000)
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {featuredSnippets.map((snippet) => (
        <Card key={snippet.id} className="overflow-hidden border-none shadow-xl bg-gradient-to-br from-gray-400 to-indigo-600 dark:from-slate-900 dark:to-gray-800 rounded-2xl">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-start">
              <CardTitle className="text-lg font-bold text-white">
                <Link href={`/snippets/${snippet.id}`} className="hover:text-yellow-300 transition-colors">
                  {snippet.title}
                </Link>
              </CardTitle>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-white hover:bg-indigo-500">
                <Bookmark className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex items-center gap-2 mt-2">
              <Avatar className="h-6 w-6">
                <AvatarImage src={snippet.author.image} alt={snippet.author.name} />
                <AvatarFallback>{snippet.author.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <span className="text-sm text-gray-300">{snippet.author.name}</span>
            </div>
          </CardHeader>
          <CardContent className="pb-2">
            <div className="relative bg-gray-900 text-gray-100 rounded-md p-3 overflow-x-auto text-sm font-mono shadow-inner">
              <pre className="max-h-32 overflow-y-auto">{snippet.code}</pre>
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2 h-6 w-6 bg-gray-800/80 hover:bg-gray-700 text-white"
                onClick={() => copyToClipboard(snippet.code, snippet.id)}
              >
                {copied === snippet.id ? (
                  <span className="text-xs text-green-400">Copied!</span>
                ) : (
                  <Copy className="h-3 w-3" />
                )}
              </Button>
            </div>
            <div className="flex flex-wrap gap-2 mt-3">
              {snippet.tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs bg-indigo-700 text-white px-2 py-1 rounded-md">
                  {tag}
                </Badge>
              ))}
            </div>
          </CardContent>
          <CardFooter className="flex justify-between pt-2 text-gray-300">
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center">
                <Eye className="mr-1 h-4 w-4" />
                {snippet.views}
              </div>
              <div className="flex items-center">
                <MessageSquare className="mr-1 h-4 w-4" />
                {snippet.comments}
              </div>
            </div>
            <Button variant="ghost" size="sm" className="gap-1 text-white hover:bg-indigo-500">
              <Share2 className="h-4 w-4" />
              Share
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}
