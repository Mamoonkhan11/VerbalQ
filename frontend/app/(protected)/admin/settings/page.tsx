"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Save } from "lucide-react"
import { AdminRoute } from "@/components/RouteProtection"
import api from "@/lib/api"
import { useToast } from "@/hooks/use-toast"

interface AppSettings {
  grammarEnabled: boolean
  translationEnabled: boolean
  humanizeEnabled: boolean
  plagiarismEnabled: boolean
}

export default function AdminSettingsPage() {
  const { toast } = useToast()
  const [settings, setSettings] = useState<AppSettings>({
    grammarEnabled: true,
    translationEnabled: true,
    humanizeEnabled: true,
    plagiarismEnabled: true,
  })
  const [originalSettings, setOriginalSettings] = useState<AppSettings>(settings)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await api.get("/api/admin/settings")
        const data = response.data
        const fetchedSettings = data.data.settings
        setSettings(fetchedSettings)
        setOriginalSettings(fetchedSettings)
      } catch (err: any) {
        const errorMessage = err.response?.data?.message || "Failed to load settings"
        setError(errorMessage)
        console.error("Settings fetch error:", err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchSettings()
  }, [])

  const handleSettingChange = (key: keyof AppSettings, value: boolean) => {
    setSettings(prev => ({ ...prev, [key]: value }))
  }

  const hasChanges = JSON.stringify(settings) !== JSON.stringify(originalSettings)

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const response = await api.put("/api/admin/settings", settings)
      const data = response.data
      setOriginalSettings(settings)
      toast({
        title: "✅ Settings saved",
        description: "Application settings have been updated successfully.",
        className: "border-green-200 bg-transparent text-green-800",
      })
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || "Failed to save settings"
      toast({
        title: "❌ Error",
        description: errorMessage,
        className: "border-red-200 bg-transparent text-red-800",
      })
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <AdminRoute>
        <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        </div>
      </AdminRoute>
    )
  }

  return (
    <AdminRoute>
      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Application Settings</h1>
          <p className="text-muted-foreground">Configure feature availability and system settings</p>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Card className="border border-border">
          <CardHeader>
            <CardTitle>Feature Toggles</CardTitle>
            <CardDescription>Enable or disable AI processing features</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="grammar" className="text-base">Grammar Check</Label>
                <p className="text-sm text-muted-foreground">
                  Allow users to check and correct grammar in their text
                </p>
              </div>
              <Switch
                id="grammar"
                checked={settings.grammarEnabled}
                onCheckedChange={(checked) => handleSettingChange('grammarEnabled', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="translation" className="text-base">Text Translation</Label>
                <p className="text-sm text-muted-foreground">
                  Allow users to translate text between languages
                </p>
              </div>
              <Switch
                id="translation"
                checked={settings.translationEnabled}
                onCheckedChange={(checked) => handleSettingChange('translationEnabled', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="humanize" className="text-base">Text Humanization</Label>
                <p className="text-sm text-muted-foreground">
                  Allow users to convert AI-generated text to natural writing
                </p>
              </div>
              <Switch
                id="humanize"
                checked={settings.humanizeEnabled}
                onCheckedChange={(checked) => handleSettingChange('humanizeEnabled', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="plagiarism" className="text-base">Plagiarism Check</Label>
                <p className="text-sm text-muted-foreground">
                  Allow users to check text for potential plagiarism
                </p>
              </div>
              <Switch
                id="plagiarism"
                checked={settings.plagiarismEnabled}
                onCheckedChange={(checked) => handleSettingChange('plagiarismEnabled', checked)}
              />
            </div>
          </CardContent>
        </Card>

        {hasChanges && (
          <div className="mt-6 flex justify-end">
            <Button onClick={handleSave} disabled={isSaving}>
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
        )}
      </div>
    </AdminRoute>
  )
}