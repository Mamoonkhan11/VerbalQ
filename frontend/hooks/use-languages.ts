import { useState, useEffect } from 'react'
import api from '@/lib/api'

interface Language {
  code: string
  name: string
}

// Cache key and expiration time (24 hours)
const LANGUAGE_CACHE_KEY = 'verbalq_languages_cache'
const CACHE_DURATION = 24 * 60 * 60 * 1000 // 24 hours in milliseconds

// Check if cached data is still valid
const isCacheValid = (timestamp: number) => {
  return Date.now() - timestamp < CACHE_DURATION
}

// Get cached languages
const getCachedLanguages = (): Language[] | null => {
  if (typeof window === 'undefined') return null
  
  try {
    const cached = localStorage.getItem(LANGUAGE_CACHE_KEY)
    if (!cached) return null
    
    const { data, timestamp } = JSON.parse(cached)
    if (isCacheValid(timestamp)) {
      return data
    } else {
      localStorage.removeItem(LANGUAGE_CACHE_KEY)
      return null
    }
  } catch (e) {
    return null
  }
}

// Save languages to cache
const setCachedLanguages = (languages: Language[]) => {
  if (typeof window === 'undefined') return
  
  try {
    const cacheData = {
      data: languages,
      timestamp: Date.now()
    }
    localStorage.setItem(LANGUAGE_CACHE_KEY, JSON.stringify(cacheData))
  } catch (e) {
    // Ignore cache errors
  }
}

// Prevent multiple simultaneous requests and add rate limiting
let isFetchingLanguages = false
let isFetchingTranslationPairs = false
let lastLanguageFetch = 0
let lastTranslationFetch = 0
const MIN_REQUEST_INTERVAL = 1000 // 1 second minimum between requests

export function useLanguages() {
  const [languages, setLanguages] = useState<Language[]>(() => {
    // Initialize with cached data if available
    return getCachedLanguages() || []
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // If we already have cached data, don't show loading
    const cached = getCachedLanguages()
    if (cached && cached.length > 0) {
      setLanguages(cached)
      setLoading(false)
      return
    }

    // Prevent duplicate requests and rate limiting
    const now = Date.now()
    if (isFetchingLanguages || (now - lastLanguageFetch) < MIN_REQUEST_INTERVAL) {
      setLoading(false)
      return
    }

    const fetchLanguages = async () => {
      isFetchingLanguages = true
      lastLanguageFetch = Date.now()
      try {
        const response = await api.get('/api/ai/languages')
        const fetchedLanguages = response.data.languages || []
        setLanguages(fetchedLanguages)
        setCachedLanguages(fetchedLanguages) // Cache the results
        setError(null)
      } catch (err: any) {
        console.error('Error fetching languages:', err)
        // Fallback to common languages if backend fails
        const fallbackLanguages = [
          { code: 'en', name: 'English' },
          { code: 'es', name: 'Spanish' },
          { code: 'fr', name: 'French' },
          { code: 'de', name: 'German' },
          { code: 'hi', name: 'Hindi' },
          { code: 'ar', name: 'Arabic' },
          { code: 'zh', name: 'Chinese' },
          { code: 'ko', name: 'Korean' },
        ]
        setLanguages(fallbackLanguages)
        setCachedLanguages(fallbackLanguages) // Cache fallback too
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
        isFetchingLanguages = false
        setLoading(false)
      }
    }

    fetchLanguages()
  }, [])

  return { languages, loading, error }
}

// Cache key and expiration time for translation pairs (24 hours)
const TRANSLATION_CACHE_KEY = 'verbalq_translation_pairs_cache'

// Get cached translation pairs
const getCachedTranslationPairs = (): {from: string, to: string}[] | null => {
  if (typeof window === 'undefined') return null
  
  try {
    const cached = localStorage.getItem(TRANSLATION_CACHE_KEY)
    if (!cached) return null
    
    const { data, timestamp } = JSON.parse(cached)
    if (isCacheValid(timestamp)) {
      return data
    } else {
      localStorage.removeItem(TRANSLATION_CACHE_KEY)
      return null
    }
  } catch (e) {
    return null
  }
}

// Save translation pairs to cache
const setCachedTranslationPairs = (pairs: {from: string, to: string}[]) => {
  if (typeof window === 'undefined') return
  
  try {
    const cacheData = {
      data: pairs,
      timestamp: Date.now()
    }
    localStorage.setItem(TRANSLATION_CACHE_KEY, JSON.stringify(cacheData))
  } catch (e) {
    // Ignore cache errors
  }
}

export function useTranslationLanguages() {
  const [supportedPairs, setSupportedPairs] = useState<{from: string, to: string}[]>(() => {
    // Initialize with cached data if available
    return getCachedTranslationPairs() || []
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // If we already have cached data, don't show loading
    const cached = getCachedTranslationPairs()
    if (cached && cached.length > 0) {
      setSupportedPairs(cached)
      setLoading(false)
      return
    }

    // Prevent duplicate requests and rate limiting
    const now = Date.now()
    if (isFetchingTranslationPairs || (now - lastTranslationFetch) < MIN_REQUEST_INTERVAL) {
      setLoading(false)
      return
    }

    const fetchPairs = async () => {
      isFetchingTranslationPairs = true
      lastTranslationFetch = Date.now()
      try {
        const response = await api.get('/api/ai/languages/translation')
        const fetchedPairs = response.data.supportedPairs || []
        setSupportedPairs(fetchedPairs)
        setCachedTranslationPairs(fetchedPairs) // Cache the results
      } catch (err: any) {
        console.error('Error fetching translation pairs:', err)
        // Fallback to common pairs
        const fallbackPairs = [
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
        ]
        setSupportedPairs(fallbackPairs)
        setCachedTranslationPairs(fallbackPairs) // Cache fallback too
        
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
        isFetchingTranslationPairs = false
        setLoading(false)
      }
    }
    fetchPairs()
  }, [])

  return { supportedPairs, loading }
}