"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Copy, Eye, Globe, Lock, MoreVertical, Pencil, Share2, Trash } from "lucide-react"
import { formatDistanceToNow } from "date-fns"

interface SnippetCardProps {
  snippet: any
  onDelete?: () => void
}

export default function SnippetCard({ snippet, onDelete }: SnippetCardProps) {
  const router = useRouter()
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [copied, setCopied] = useState(false)

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      const response = await fetch(`/api/snippets/${snippet._id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        if (onDelete) {
          onDelete()
        }
      }
    } catch (error) {
      console.error("Error deleting snippet:", error)
    } finally {
      setIsDeleting(false)
      setShowDeleteDialog(false)
    }
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(snippet.code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const getVisibilityIcon = () => {
    switch (snippet.visibility) {
      case "public":
        return <Globe className="h-4 w-4" />
      case "private":
        return <Lock className="h-4 w-4" />
      default:
        return <Share2 className="h-4 w-4" />
    }
  }

  return (
    <>
      <Card className="h-full flex flex-col">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <CardTitle className="text-lg font-bold line-clamp-1">{snippet.title}</CardTitle>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreVertical className="h-4 w-4" />
                  <span className="sr-only">Menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => router.push(`/snippets/${snippet._id}`)}>
                  <Eye className="mr-2 h-4 w-4" />
                  View
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push(`/snippets/edit/${snippet._id}`)}>
                  <Pencil className="mr-2 h-4 w-4" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem onClick={copyToClipboard}>
                  <Copy className="mr-2 h-4 w-4" />
                  Copy Code
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => setShowDeleteDialog(true)}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant="outline" className="flex items-center gap-1">
              {getVisibilityIcon()}
              {snippet.visibility.charAt(0).toUpperCase() + snippet.visibility.slice(1)}
            </Badge>
            <Badge variant="secondary">{snippet.language}</Badge>
          </div>
        </CardHeader>
        <CardContent className="pb-2 flex-grow">
          {snippet.description ? (
            <p className="text-sm text-muted-foreground line-clamp-2">{snippet.description}</p>
          ) : (
            <p className="text-sm text-muted-foreground italic">No description</p>
          )}

          <div className="mt-3">
            {snippet.tags && snippet.tags.length > 0 ? (
              <div className="flex flex-wrap gap-1">
                {snippet.tags.map((tag: string) => (
                  <Badge key={tag} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            ) : null}
          </div>
        </CardContent>
        <CardFooter className="pt-2 text-xs text-muted-foreground">
          {snippet.createdAt && <span>Created {formatDistanceToNow(new Date(snippet.createdAt))} ago</span>}
        </CardFooter>
      </Card>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your snippet.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

