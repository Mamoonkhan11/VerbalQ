import { useState, useEffect } from 'react'

interface Language {
  code: string
  name: string
}

export function useLanguages() {
  const [languages, setLanguages] = useState<Language[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchLanguages = async () => {
      try {
        const response = await fetch('/api/ai/languages')
        if (!response.ok) {
          throw new Error('Failed to fetch languages')
        }
        const data = await response.json()
        setLanguages(data.languages || [])
      } catch (err) {
        // Silently fall back to static languages - this is expected when backend isn't running
        // No console errors logged as this is graceful degradation
        setLanguages([
          { code: 'en', name: 'English' },
          { code: 'hi', name: 'Hindi' },
          { code: 'es', name: 'Spanish' },
          { code: 'fr', name: 'French' },
          { code: 'de', name: 'German' },
          { code: 'ko', name: 'Korean' },
          { code: 'ar', name: 'Arabic' },
          { code: 'zh', name: 'Chinese' }
        ])
        setError('Using fallback languages')
      } finally {
        setLoading(false)
      }
    }

    fetchLanguages()
  }, [])

  return { languages, loading, error }
}