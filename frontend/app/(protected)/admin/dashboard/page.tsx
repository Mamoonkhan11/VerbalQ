"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { Users, FileText, TrendingUp, ActivitySquare, Loader2, Ban, CheckCircle } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { AdminRoute } from "@/components/RouteProtection"
import api from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import { format } from "date-fns"

interface Stats {
  totalUsers: number
  activeUsers: number
  totalRequests: number
  requestsByType: {
    grammar?: number
    translate?: number
    humanize?: number
    plagiarism?: number
  }
}

interface User {
  _id: string
  name: string
  email: string
  role: string
  isBlocked: boolean
  createdAt: string
}

export default function AdminDashboardPage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [stats, setStats] = useState<Stats | null>(null)
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isUsersLoading, setIsUsersLoading] = useState(false)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get("/api/admin/stats")
        const data = response.data
        setStats(data.data)
      } catch (err: any) {
        const errorMessage = err.response?.data?.message || "Failed to load statistics"
        toast({
          title: "Error loading statistics",
          description: errorMessage,
          className: "bg-white text-black border-gray-200",
        })
        console.error("Stats fetch error:", err)
      } finally {
        setIsLoading(false)
      }
    }

    const fetchUsers = async () => {
      setIsUsersLoading(true)
      try {
        const response = await api.get("/api/admin/users")
        const data = response.data
        setUsers(data.data.users)
      } catch (err: any) {
        toast({
          title: "Error loading users",
          description: err.response?.data?.message || "Failed to load users",
          className: "bg-white text-black border-gray-200",
        })
        console.error("Users fetch error:", err)
      } finally {
        setIsUsersLoading(false)
      }
    }

    fetchStats()
    fetchUsers()
  }, [toast])

  const handleBlockUser = async (userId: string, currentBlockedStatus: boolean) => {
    const action = currentBlockedStatus ? 'unblock' : 'block'
    if (!confirm(`Are you sure you want to ${action} this user?`)) return

    try {
      await api.patch(`/api/admin/block/${userId}`)
      setUsers(users.map(u =>
        u._id === userId ? { ...u, isBlocked: !currentBlockedStatus } : u
      ))
      toast({
        title: "User updated",
        description: `User has been ${currentBlockedStatus ? 'unblocked' : 'blocked'} successfully.`,
        className: "bg-white text-black border-gray-200",
      })
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || "Failed to update user"
      toast({
        title: "Error",
        description: errorMessage,
        className: "bg-white text-black border-gray-200",
      })
    }
  }

  const chartData = [
    { name: "Grammar", value: stats?.requestsByType.grammar || 0 },
    { name: "Translate", value: stats?.requestsByType.translate || 0 },
    { name: "Humanize", value: stats?.requestsByType.humanize || 0 },
    { name: "Plagiarism", value: stats?.requestsByType.plagiarism || 0 },
  ]
  // Safely compute most used feature, guarding against undefined requestsByType
  const mostUsed = (() => {
    const req = stats?.requestsByType
    if (!req) return "None"
    const keys = Object.keys(req)
    if (keys.length === 0) return "None"
    return keys.reduce((a, b) => {
      const va = req[a as keyof typeof req] || 0
      const vb = req[b as keyof typeof req] || 0
      return va > vb ? a : b
    }, keys[0])
  })()

  return (
    <AdminRoute>
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Welcome Section */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-2">Admin Dashboard</h1>
          <p className="text-lg text-muted-foreground">
            {user ? `Logged in as ${user.email}` : "Loading..."}
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-12">
          <Card className="border border-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : (
                <>
                  <div className="text-2xl font-bold">{stats?.totalUsers || 0}</div>
                  <p className="text-xs text-muted-foreground">Registered users</p>
                </>
              )}
            </CardContent>
          </Card>

          <Card className="border border-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Users</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : (
                <>
                  <div className="text-2xl font-bold">{stats?.activeUsers || 0}</div>
                  <p className="text-xs text-muted-foreground">Last 30 days</p>
                </>
              )}
            </CardContent>
          </Card>

          <Card className="border border-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : (
                <>
                  <div className="text-2xl font-bold">{stats?.totalRequests || 0}</div>
                  <p className="text-xs text-muted-foreground">All time</p>
                </>
              )}
            </CardContent>
          </Card>

          <Card className="border border-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Most Used</CardTitle>
              <ActivitySquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : (
                <>
                  <div className="text-2xl font-bold">
                    {mostUsed}
                  </div>
                  <p className="text-xs text-muted-foreground">Popular feature</p>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Chart */}
        <Card className="border border-border">
          <CardHeader>
            <CardTitle>Requests by Type</CardTitle>
            <CardDescription>Breakdown of AI tool usage</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center h-[300px]">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                  <XAxis dataKey="name" stroke="var(--color-muted-foreground)" />
                  <YAxis stroke="var(--color-muted-foreground)" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "var(--color-card)",
                      border: "1px solid var(--color-border)",
                    }}
                  />
                  <Bar dataKey="value" fill="var(--color-primary)" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* User Management */}
        <Card className="border border-border mt-8">
          <CardHeader>
            <CardTitle>User Management</CardTitle>
            <CardDescription>Manage registered users and their access</CardDescription>
          </CardHeader>
          <CardContent>
            {isUsersLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : users.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No users found</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Joined</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                {users.map((u) => (
                      <TableRow key={u._id}>
                        <TableCell className="font-medium">{u.name || "N/A"}</TableCell>
                        <TableCell>{u.email}</TableCell>
                        <TableCell>
                          <Badge variant={u.role === "admin" ? "default" : "secondary"}>
                            {u.role}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={u.isBlocked ? "destructive" : "outline"}>
                            {u.isBlocked ? "Blocked" : "Active"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {format(new Date(u.createdAt), "MMM dd, yyyy")}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleBlockUser(u._id, u.isBlocked)}
                            disabled={u.role === "admin"} // Prevent blocking admins
                          >
                            {u.isBlocked ? (
                              <>
                                <CheckCircle className="mr-1 h-3 w-3" />
                                Unblock
                              </>
                            ) : (
                              <>
                                <Ban className="mr-1 h-3 w-3" />
                                Block
                              </>
                            )}
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
    </AdminRoute>
  )
}
