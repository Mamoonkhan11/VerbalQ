import { useState, useEffect } from 'react'
import api from '@/lib/api'

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
        const response = await api.get('/api/ai/languages')
        setLanguages(response.data.languages || [])
      } catch (err: any) {
        console.error('Error fetching languages:', err)
        // Fallback to common languages if backend fails
        setLanguages([
          { code: 'en', name: 'English' },
          { code: 'es', name: 'Spanish' },
          { code: 'fr', name: 'French' },
          { code: 'de', name: 'German' },
          { code: 'hi', name: 'Hindi' },
          { code: 'ar', name: 'Arabic' },
          { code: 'zh', name: 'Chinese' },
          { code: 'ko', name: 'Korean' },
        ])
        setError('Using fallback languages')
        
        // Show toast notification for the error
        if (typeof window !== 'undefined') {
          const { toast } = await import('@/hooks/use-toast')
          toast({
            title: "Language service unavailable",
            description: "Using default languages. Some features may be limited.",
            className: "bg-white text-black border-gray-200",
          })
        }
      } finally {
        setLoading(false)
      }
    }

    fetchLanguages()
  }, [])

  return { languages, loading, error }
}

export function useTranslationLanguages() {
  const [supportedPairs, setSupportedPairs] = useState<{from: string, to: string}[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchPairs = async () => {
      try {
        const response = await api.get('/api/ai/languages/translation')
        setSupportedPairs(response.data.supportedPairs || [])
      } catch (err: any) {
        console.error('Error fetching translation pairs:', err)
        // Fallback to common pairs
        setSupportedPairs([
          { from: 'en', to: 'es' },
          { from: 'en', to: 'fr' },
          { from: 'en', to: 'de' },
          { from: 'en', to: 'hi' },
          { from: 'en', to: 'ar' },
          { from: 'en', to: 'zh' },
          { from: 'en', to: 'ko' },
          { from: 'es', to: 'en' },
          { from: 'fr', to: 'en' },
          { from: 'de', to: 'en' },
          { from: 'hi', to: 'en' },
          { from: 'ar', to: 'en' },
          { from: 'zh', to: 'en' },
          { from: 'ko', to: 'en' },
        ])
        
        // Show toast notification for the error
        if (typeof window !== 'undefined') {
          const { toast } = await import('@/hooks/use-toast')
          toast({
            title: "Translation service unavailable",
            description: "Using default language pairs. Some translation features may be limited.",
            className: "bg-white text-black border-gray-200",
          })
        }
      } finally {
        setLoading(false)
      }
    }
    fetchPairs()
  }, [])

  return { supportedPairs, loading }
}