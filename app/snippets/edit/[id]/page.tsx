"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  Code, 
  Globe, 
  Lock, 
  Users, 
  X, 
  Plus, 
  Save, 
  ArrowLeft, 
  Loader2 
} from "lucide-react"

export default function EditSnippetPage() {
  const router = useRouter();
  const params = useParams();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [snippet, setSnippet] = useState<any>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [language, setLanguage] = useState("");
  const [code, setCode] = useState("");
  const [visibility, setVisibility] = useState("public");
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  
  const languageOptions = [
    "javascript", "typescript", "python", "java", "c", "cpp", "csharp", "go", 
    "ruby", "rust", "php", "swift", "kotlin", "html", "css", "sql", "bash", "json"
  ];

  useEffect(() => {
    const fetchSnippet = async () => {
      setIsLoading(true);
      setError("");

      try {
        const response = await fetch(`/api/snippets/${params.id}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to fetch snippet");
        }

        setSnippet(data.snippet);
        setTitle(data.snippet.title);
        setDescription(data.snippet.description || "");
        setLanguage(data.snippet.language);
        setCode(data.snippet.code);
        setVisibility(data.snippet.visibility);
        setTags(data.snippet.tags || []);
      } catch (error: any) {
        setError(error.message || "An error occurred while fetching the snippet");
        console.error("Error fetching snippet:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSnippet();
  }, [params.id]);

 
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError("");

    try {
      const response = await fetch(`/api/snippets/${params.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          description,
          language,
          code,
          visibility,
          tags,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to update snippet");
      }

      router.push(`/snippets/${params.id}`);
    } catch (error: any) {
      setError(error.message || "An error occurred while updating the snippet");
      console.error("Error updating snippet:", error);
    } finally {
      setIsSaving(false);
    }
  };


  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput("");
    }
  };


  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  //  (add tag on Enter)
  const handleTagInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddTag();
    }
  };

  if (isLoading) {
    return (
      <div className="container flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container px-6 py-[120px]">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <Button 
            variant="ghost" 
            onClick={() => router.back()}
            className="group mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" />
            Back
          </Button>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-500 to-purple-500 text-transparent bg-clip-text">Edit Snippet</h1>
          <p className="text-muted-foreground mt-2">Update your code snippet details</p>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Card className="border shadow-lg dark:shadow-blue-900/10 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 h-1"></div>
          <CardHeader className="border-b">
            <CardTitle className="flex items-center">
              <Code className="mr-2 h-5 w-5 text-blue-500" />
              Edit Snippet
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Title field */}
                <div className="space-y-2">
                  <label htmlFor="title" className="text-sm font-medium">
                    Title
                  </label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="My awesome code snippet"
                    required
                    className="shadow-sm"
                  />
                </div>

                {/* Language field */}
                <div className="space-y-2">
                  <label htmlFor="language" className="text-sm font-medium">
                    Language
                  </label>
                  <Select
                    value={language}
                    onValueChange={setLanguage}
                  >
                    <SelectTrigger className="shadow-sm">
                      <SelectValue placeholder="Select language" />
                    </SelectTrigger>
                    <SelectContent className="max-h-[200px]">
                      {languageOptions.map((lang) => (
                        <SelectItem key={lang} value={lang}>
                          {lang.charAt(0).toUpperCase() + lang.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Description field */}
              <div className="space-y-2">
                <label htmlFor="description" className="text-sm font-medium">
                  Description
                </label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Brief description of what this code does"
                  className="resize-none min-h-[80px] shadow-sm"
                />
                <p className="text-xs text-muted-foreground">
                  Optional: Provide context about your snippet
                </p>
              </div>

              {/* Code field */}
              <div className="space-y-2">
                <label htmlFor="code" className="text-sm font-medium">
                  Code
                </label>
                <div className="rounded-md border overflow-hidden shadow-sm focus-within:ring-1 focus-within:ring-blue-500">
                  <div className="bg-muted p-2 flex items-center justify-between border-b">
                    <div className="flex items-center gap-1">
                      <div className="h-3 w-3 rounded-full bg-red-500"></div>
                      <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
                      <div className="h-3 w-3 rounded-full bg-green-500"></div>
                    </div>
                    <span className="text-xs text-muted-foreground">{language || "code"}</span>
                  </div>
                  <Textarea
                    id="code"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="Paste your code here"
                    className="font-mono resize-none min-h-[300px] border-0 focus-visible:ring-0 rounded-none"
                  />
                </div>
              </div>

              {/* Tags input */}
              <div className="space-y-2">
                <label htmlFor="tags" className="text-sm font-medium">
                  Tags
                </label>
                <div className="flex flex-wrap gap-2 mb-2 min-h-8">
                  {tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="px-2 py-1 text-sm bg-blue-500/10 hover:bg-blue-500/20 transition-colors">
                      {tag}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        className="ml-2 text-muted-foreground hover:text-foreground"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
                <div className="flex items-center space-x-2">
                  <Input
                    id="tagInput"
                    placeholder="Add tags (e.g., algorithm, react)"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={handleTagInputKeyDown}
                    className="shadow-sm"
                  />
                  <Button 
                    type="button" 
                    size="sm" 
                    onClick={handleAddTag} 
                    disabled={!tagInput.trim()}
                    className="shrink-0"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Press Enter to add a tag
                </p>
              </div>

              {/* Visibility options */}
              <div className="space-y-3">
                <label className="text-sm font-medium">
                  Visibility
                </label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className={`border rounded-lg p-4 cursor-pointer transition-all ${
                    visibility === "public" 
                      ? "ring-2 ring-blue-500 bg-blue-500/5" 
                      : "hover:bg-muted/50"
                  }`}
                  onClick={() => setVisibility("public")}>
                    <div className="flex items-center mb-2">
                      <Globe className="h-4 w-4 mr-2 text-blue-500" />
                      <span className="font-medium">Public</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Visible to everyone and appears in search results
                    </p>
                  </div>
                  <div className={`border rounded-lg p-4 cursor-pointer transition-all ${
                    visibility === "unlisted" 
                      ? "ring-2 ring-blue-500 bg-blue-500/5" 
                      : "hover:bg-muted/50"
                  }`}
                  onClick={() => setVisibility("unlisted")}>
                    <div className="flex items-center mb-2">
                      <Users className="h-4 w-4 mr-2 text-purple-500" />
                      <span className="font-medium">Unlisted</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Anyone with the link can view, but not searchable
                    </p>
                  </div>
                  <div className={`border rounded-lg p-4 cursor-pointer transition-all ${
                    visibility === "private" 
                      ? "ring-2 ring-blue-500 bg-blue-500/5" 
                      : "hover:bg-muted/50"
                  }`}
                  onClick={() => setVisibility("private")}>
                    <div className="flex items-center mb-2">
                      <Lock className="h-4 w-4 mr-2 text-amber-500" />
                      <span className="font-medium">Private</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Only visible to you
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-6 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={isSaving}
                  className="bg-blue-500 hover:bg-blue-600 text-white shadow-md shadow-blue-500/20"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Save Changes
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}












