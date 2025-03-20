"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Loader2, Search } from "lucide-react"
import SnippetCard from "@/components/snippet-card"

// Programming languages options
const languageOptions = [
  { value: "all", label: "All Languages" },
  { value: "javascript", label: "JavaScript" },
  { value: "typescript", label: "TypeScript" },
  { value: "python", label: "Python" },
  { value: "java", label: "Java" },
  { value: "csharp", label: "C#" },
  { value: "cpp", label: "C++" },
  { value: "php", label: "PHP" },
  { value: "ruby", label: "Ruby" },
  { value: "go", label: "Go" },
  { value: "html", label: "HTML" },
  { value: "css", label: "CSS" },
  { value: "sql", label: "SQL" },
]

// Popular tags
const popularTags = ["react", "nextjs", "api", "database", "algorithm", "frontend", "backend", "tutorial", "utility"]

export default function ExplorePage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [snippets, setSnippets] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState(searchParams.get("query") || "")
  const [selectedLanguage, setSelectedLanguage] = useState(searchParams.get("language") || "")
  const [selectedTag, setSelectedTag] = useState(searchParams.get("tag") || "")
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 12,
    pages: 1,
  })
  
  // This keeps track of when to trigger searches
  const [searchTrigger, setSearchTrigger] = useState(0)

  useEffect(() => {
    fetchSnippets()
  }, [selectedLanguage, selectedTag, pagination.page, searchTrigger])

  const fetchSnippets = async () => {
    setIsLoading(true)

    try {
      const queryParams = new URLSearchParams()

      if (searchQuery) {
        queryParams.append("query", searchQuery)
      }

      if (selectedLanguage) {
        queryParams.append("language", selectedLanguage)
      }

      if (selectedTag) {
        queryParams.append("tag", selectedTag)
      }

      queryParams.append("page", pagination.page.toString())
      queryParams.append("limit", pagination.limit.toString())

      const response = await fetch(`/api/snippets?${queryParams.toString()}`)
      const data = await response.json()

      if (response.ok) {
        setSnippets(data.snippets)
        setPagination(data.pagination)
      }
    } catch (error) {
      console.error("Error fetching snippets:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setPagination({ ...pagination, page: 1 })
    
    // This will trigger the useEffect
    setSearchTrigger(prev => prev + 1)

    // Update URL with search params
    const params = new URLSearchParams()
    if (searchQuery) params.set("query", searchQuery)
    if (selectedLanguage) params.set("language", selectedLanguage)
    if (selectedTag) params.set("tag", selectedTag)

    router.push(`/explore?${params.toString()}`)
  }

  const handleTagClick = (tag: string) => {
    setSelectedTag(tag === selectedTag ? "" : tag)
    setPagination({ ...pagination, page: 1 })
  }

  const handleLanguageChange = (value: string) => {
    setSelectedLanguage(value === "all" ? "" : value) 
    setPagination({ ...pagination, page: 1 })
  }

  const handlePageChange = (newPage: number) => {
    setPagination({ ...pagination, page: newPage })
  }

  return (
    <div className="container py-[120px] px-6">
      <div className="grid gap-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Explore Snippets</h1>
          <p className="text-muted-foreground">Discover code snippets shared by the community</p>
        </div>

        {/* Search and Filters */}
        <Card>
          <CardContent className="pt-6">
            <form onSubmit={handleSearch} className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Search snippets..."
                    className="pl-8"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Select value={selectedLanguage} onValueChange={handleLanguageChange}>
                  <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue placeholder="All Languages" />
                  </SelectTrigger>
                  <SelectContent>
                    {languageOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button type="submit">Search</Button>
              </div>
            </form>

            {/* Popular Tags */}
            <div className="mt-4">
              <p className="text-sm font-medium mb-2">Popular Tags:</p>
              <div className="flex flex-wrap gap-2">
                {popularTags.map((tag) => (
                  <Badge
                    key={tag}
                    variant={selectedTag === tag ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => handleTagClick(tag)}
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : snippets.length > 0 ? (
          <>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {snippets.map((snippet) => (
                <SnippetCard key={snippet._id} snippet={snippet} />
              ))}
            </div>

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="flex justify-center mt-6">
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    disabled={pagination.page === 1}
                    onClick={() => handlePageChange(pagination.page - 1)}
                  >
                    Previous
                  </Button>

                  {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((page) => (
                    <Button
                      key={page}
                      variant={pagination.page === page ? "default" : "outline"}
                      onClick={() => handlePageChange(page)}
                    >
                      {page}
                    </Button>
                  ))}

                  <Button
                    variant="outline"
                    disabled={pagination.page === pagination.pages}
                    onClick={() => handlePageChange(pagination.page + 1)}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">No snippets found matching your criteria.</p>
            <Button
              onClick={() => {
                setSearchQuery("")
                setSelectedLanguage("")
                setSelectedTag("")
                setPagination({ ...pagination, page: 1 })
                setSearchTrigger(prev => prev + 1) // Add this to trigger a search after clearing filters
              }}
            >
              Clear Filters
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}