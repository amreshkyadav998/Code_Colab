"use client"
import type React from "react"
import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, Search } from "lucide-react"
import SnippetCard from "@/components/snippet-card"

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

interface Snippet {
  _id: string;
  title: string;
  description: string;
  code: string;
  language: string;
  visibility: string;
  tags: string[];
  author: {
    _id: string;
    name: string;
    image?: string;
  };
}

const popularTags = ["react", "nextjs", "api", "database", "algorithm", "frontend", "backend", "tutorial", "utility"]

export default function ExplorePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [snippets, setSnippets] = useState<Snippet[]>([]);
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
    <div className="relative min-h-screen pb-20 pt-[100px] overflow-hidden bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-950 text-gray-900 dark:text-white transition-colors">
      {/* Stylish background effects */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-radial from-blue-500/10 via-transparent to-transparent blur-3xl opacity-70 dark:opacity-30" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-gradient-radial from-purple-500/10 via-transparent to-transparent blur-3xl opacity-70 dark:opacity-30" />
      
      <div className="container max-w-6xl mx-auto px-6 relative z-10">
        <div className="flex flex-col md:flex-row justify-between gap-6 bg-white dark:bg-gray-800/90 p-8 rounded-2xl shadow-xl backdrop-blur-sm border border-gray-100 dark:border-gray-700/50 mb-8 animate-in slide-in-from-top-4">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent leading-tight">Explore Snippets</h1>
            <p className="text-gray-600 dark:text-gray-300 mt-2">Discover code snippets shared by the community</p>
          </div>
        </div>

        {/* Search and Filters */}
        <Card className="overflow-hidden border-0 shadow-2xl bg-white dark:bg-gray-800/90 backdrop-blur-sm transition-all hover:shadow-blue-500/5 mb-8 animate-in fade-in-50">
          <CardHeader className="border-b border-gray-100 dark:border-gray-700/50 pb-4">
            <CardTitle className="text-lg text-gray-800 dark:text-gray-200">Search and Filters</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <form onSubmit={handleSearch} className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Search snippets..."
                    className="pl-8 border-blue-200 dark:border-blue-900/30 focus:ring-blue-500 transition-all"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Select value={selectedLanguage} onValueChange={handleLanguageChange}>
                  <SelectTrigger className="w-full sm:w-[180px] border-blue-200 dark:border-blue-900/30 focus:ring-blue-500">
                    <SelectValue placeholder="All Languages" />
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-gray-800 border-blue-200 dark:border-blue-900/30">
                    {languageOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button 
                  type="submit"
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg shadow-blue-400/20 dark:shadow-blue-900/20 transition-all"
                >
                  Search
                </Button>
              </div>
            </form>

            {/* Popular Tags */}
            <div className="mt-6">
              <p className="text-sm font-medium mb-3 text-gray-600 dark:text-gray-300">Popular Tags:</p>
              <div className="flex flex-wrap gap-2">
                {popularTags.map((tag) => (
                  <Badge
                    key={tag}
                    variant={selectedTag === tag ? "default" : "outline"}
                    className={selectedTag === tag 
                      ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white cursor-pointer hover:from-blue-700 hover:to-purple-700 transition-all px-3 py-1"
                      : "bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-800/60 transition-colors cursor-pointer px-3 py-1 border-blue-200 dark:border-blue-900/30"
                    }
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
          <div className="flex flex-col items-center justify-center py-16 bg-white dark:bg-gray-800/50 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700/50 backdrop-blur-sm animate-in fade-in-75">
            <Loader2 className="h-12 w-12 animate-spin text-blue-600 mb-4" />
            <p className="text-lg text-blue-600 font-medium animate-pulse">Loading snippets...</p>
          </div>
        ) : snippets.length > 0 ? (
          <>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 animate-in fade-in-100">
              {snippets.map((snippet) => (
                <SnippetCard key={snippet._id} snippet={snippet} />
              ))}
            </div>

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="flex justify-center mt-8">
                <div className="flex gap-2 bg-white dark:bg-gray-800/80 p-4 rounded-full shadow-lg backdrop-blur-sm border border-gray-100 dark:border-gray-700/50 animate-in fade-in-75">
                  <Button
                    variant="outline"
                    disabled={pagination.page === 1}
                    onClick={() => handlePageChange(pagination.page - 1)}
                    className="border-blue-200 dark:border-blue-900/30 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all"
                  >
                    Previous
                  </Button>

                  {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((page) => (
                    <Button
                      key={page}
                      variant={pagination.page === page ? "default" : "outline"}
                      onClick={() => handlePageChange(page)}
                      className={pagination.page === page 
                        ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md" 
                        : "border-blue-200 dark:border-blue-900/30 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                      }
                    >
                      {page}
                    </Button>
                  ))}

                  <Button
                    variant="outline"
                    disabled={pagination.page === pagination.pages}
                    onClick={() => handlePageChange(pagination.page + 1)}
                    className="border-blue-200 dark:border-blue-900/30 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all"
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-16 bg-white dark:bg-gray-800/50 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700/50 backdrop-blur-sm animate-in fade-in-75">
            <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-16 w-16 mb-4 text-blue-500 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-gray-600 dark:text-gray-300 text-lg mb-6">No snippets found matching your criteria.</p>
            <Button
              onClick={() => {
                setSearchQuery("")
                setSelectedLanguage("")
                setSelectedTag("")
                setPagination({ ...pagination, page: 1 })
                setSearchTrigger(prev => prev + 1)
              }}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg shadow-blue-400/20 dark:shadow-blue-900/20 transition-all"
            >
              Clear Filters
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}