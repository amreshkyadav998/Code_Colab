"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Loader2, Plus, X } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

// Programming languages options
const languageOptions = [
    { value: "javascript", label: "JavaScript" },
    { value: "typescript", label: "TypeScript" },
    { value: "python", label: "Python" },
    { value: "java", label: "Java" },
    { value: "csharp", label: "C#" },
    { value: "cpp", label: "C++" },
    { value: "php", label: "PHP" },
    { value: "ruby", label: "Ruby" },
    { value: "go", label: "Go" },
    { value: "rust", label: "Rust" },
    { value: "swift", label: "Swift" },
    { value: "kotlin", label: "Kotlin" },
    { value: "html", label: "HTML" },
    { value: "css", label: "CSS" },
    { value: "sql", label: "SQL" },
    { value: "bash", label: "Bash" },
    { value: "json", label: "JSON" },
    { value: "yaml", label: "YAML" },
    { value: "markdown", label: "Markdown" },
]

export default function NewSnippet() {
    const router = useRouter()
    const { data: session, status } = useSession()
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState("")

    // Form state
    const [title, setTitle] = useState("")
    const [description, setDescription] = useState("")
    const [code, setCode] = useState("")
    const [language, setLanguage] = useState("")
    const [visibility, setVisibility] = useState("public")
    const [tagInput, setTagInput] = useState("")
    const [tags, setTags] = useState<string[]>([])

    // Redirect if not authenticated
    if (status === "unauthenticated") {
        router.push("/auth/signin")
        return null
    }

    const addTag = () => {
        if (tagInput.trim() && !tags.includes(tagInput.trim()) && tags.length < 5) {
            setTags([...tags, tagInput.trim()])
            setTagInput("")
        }
    }

    const removeTag = (tagToRemove: string) => {
        setTags(tags.filter((tag) => tag !== tagToRemove))
    }

    const handleTagKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") {
            e.preventDefault()
            addTag()
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        setError("")

        if (!title || !code || !language) {
            setError("Please fill in all required fields")
            setIsLoading(false)
            return
        }

        try {
            const response = await fetch("/api/snippets", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    title,
                    description,
                    code,
                    language,
                    visibility,
                    tags,
                }),
            })

            const text = await response.text();
            const data = text ? JSON.parse(text) : {}; // Avoid JSON parse error
            console.log(data);

            if (!response.ok) {
                throw new Error(data.message || "Failed to create snippet");
            }


            if (!response.ok) {
                throw new Error(data.message || "Failed to create snippet")
            }

            router.push(`/snippets/${data.snippet._id}`)
        } catch (error: any) {
            setError(error.message || "An error occurred. Please try again.")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="container max-w-4xl py-8">
            <Card>
                <CardHeader>
                    <CardTitle>Create New Snippet</CardTitle>
                    <CardDescription>Share your code with the community or keep it private</CardDescription>
                </CardHeader>
                <CardContent>
                    {error && (
                        <Alert variant="destructive" className="mb-6">
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="title">Title *</Label>
                            <Input
                                id="title"
                                placeholder="Enter a descriptive title"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                                id="description"
                                placeholder="Briefly describe what this code does"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                rows={3}
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="language">Language *</Label>
                                <Select value={language} onValueChange={setLanguage} required>
                                    <SelectTrigger id="language">
                                        <SelectValue placeholder="Select language" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {languageOptions.map((option) => (
                                            <SelectItem key={option.value} value={option.value}>
                                                {option.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="visibility">Visibility</Label>
                                <Select value={visibility} onValueChange={setVisibility}>
                                    <SelectTrigger id="visibility">
                                        <SelectValue placeholder="Select visibility" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="public">Public</SelectItem>
                                        <SelectItem value="unlisted">Unlisted</SelectItem>
                                        <SelectItem value="private">Private</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="code">Code *</Label>
                            <Textarea
                                id="code"
                                placeholder="Paste your code here"
                                value={code}
                                onChange={(e) => setCode(e.target.value)}
                                className="font-mono"
                                rows={10}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="tags">Tags (up to 5)</Label>
                            <div className="flex gap-2">
                                <Input
                                    id="tags"
                                    placeholder="Add tags (press Enter)"
                                    value={tagInput}
                                    onChange={(e) => setTagInput(e.target.value)}
                                    onKeyDown={handleTagKeyDown}
                                    disabled={tags.length >= 5}
                                />
                                <Button
                                    type="button"
                                    onClick={addTag}
                                    disabled={tags.length >= 5 || !tagInput.trim()}
                                    variant="outline"
                                >
                                    <Plus className="h-4 w-4" />
                                </Button>
                            </div>

                            {tags.length > 0 && (
                                <div className="flex flex-wrap gap-2 mt-2">
                                    {tags.map((tag) => (
                                        <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                                            {tag}
                                            <button
                                                type="button"
                                                onClick={() => removeTag(tag)}
                                                className="rounded-full hover:bg-muted p-0.5"
                                            >
                                                <X className="h-3 w-3" />
                                                <span className="sr-only">Remove {tag} tag</span>
                                            </button>
                                        </Badge>
                                    ))}
                                </div>
                            )}
                        </div>
                    </form>
                </CardContent>
                <CardFooter className="flex justify-between">
                    <Button variant="outline" onClick={() => router.back()}>
                        Cancel
                    </Button>
                    <Button onClick={handleSubmit} disabled={isLoading}>
                        {isLoading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Creating...
                            </>
                        ) : (
                            "Create Snippet"
                        )}
                    </Button>
                </CardFooter>
            </Card>
        </div>
    )
}

