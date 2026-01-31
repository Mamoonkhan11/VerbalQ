"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useToast } from "@/hooks/use-toast"
import api from "@/lib/api"
import { format } from "date-fns"
import { Loader2, Trash2 } from "lucide-react"

interface HistoryEntry {
  _id: string
  actionType: string
  inputText: string
  outputText: string
  createdAt: string
  metaData?: any
}

export default function HistoryPage() {
  const { toast } = useToast()
  const [history, setHistory] = useState<HistoryEntry[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await api.get("/api/history/my")
        const data = response.data

        setHistory(data.data.history || [])
      } catch (err: any) {
        const errorMessage = err.response?.data?.message || "Failed to load history"
        toast({
          title: "Error loading history",
          description: errorMessage,
          className: "bg-white text-black border-gray-200",
        })
        console.error("History fetch error:", err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchHistory()
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case "success":
        return "bg-green-50 text-green-700 border-green-200"
      case "failed":
        return "bg-red-50 text-red-700 border-red-200"
      case "pending":
        return "bg-yellow-50 text-yellow-700 border-yellow-200"
      default:
        return "bg-gray-50 text-gray-700 border-gray-200"
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return format(date, "MMM dd, yyyy HH:mm")
  }

  const getActionTypeLabel = (actionType: string) => {
    switch (actionType) {
      case "grammar":
        return "Grammar Check"
      case "translate":
        return "Translation"
      case "humanize":
        return "Humanize Text"
      case "plagiarism":
        return "Plagiarism Check"
      default:
        return actionType
    }
  }

  const handleDeleteEntry = async (id: string) => {
    if (!confirm("Are you sure you want to delete this entry?")) return

    try {
      await api.delete(`/api/history/${id}`)
      setHistory(history.filter((entry) => entry._id !== id))
      toast({
        title: "Entry deleted",
        description: "The history entry has been removed.",
      })
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Delete failed",
        description: err.response?.data?.message || "Failed to delete entry",
      })
    }
  }

  const handleClearHistory = async () => {
    if (!confirm("Are you sure you want to clear ALL history? This cannot be undone.")) return

    try {
      await api.delete("/api/history/clear")
      setHistory([])
      toast({
        title: "History cleared",
        description: "Your entire activity history has been deleted.",
      })
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Clear failed",
        description: err.response?.data?.message || "Failed to clear history",
      })
    }
  }

  const truncateText = (text: string, maxLength: number = 50) => {
    if (text.length <= maxLength) return text
    return text.substring(0, maxLength) + "..."
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-border border-t-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading history...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl">
      <div className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Activity History</h1>
          <p className="text-muted-foreground">View your text processing history</p>
        </div>
        {history.length > 0 && (
          <Button variant="destructive" size="sm" onClick={handleClearHistory}>
            Clear All History
          </Button>
        )}
      </div>

      <Card className="border border-border">
        <CardHeader>
          <CardTitle className="text-lg">Recent Activities</CardTitle>
          <CardDescription>Your recent text processing requests</CardDescription>
        </CardHeader>
        <CardContent>
          {history.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">No activity history yet</p>
              <p className="text-sm text-muted-foreground">
                Start using the text processing tools to see your history here
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tool Used</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Time</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {history.map((entry) => (
                    <TableRow key={entry._id}>
                      <TableCell className="font-medium">{getActionTypeLabel(entry.actionType)}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {format(new Date(entry.createdAt), "MMM dd, yyyy")}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {format(new Date(entry.createdAt), "HH:mm:ss")}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={() => handleDeleteEntry(entry._id)}
                        >
                          Delete
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
