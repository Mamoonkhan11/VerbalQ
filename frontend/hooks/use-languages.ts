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
        console.error('Error fetching languages:', err)
        setLanguages([])
        setError('Failed to load languages')
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
        const response = await fetch('/api/ai/languages/translation')
        if (!response.ok) throw new Error()
        const data = await response.json()
        setSupportedPairs(data.supportedPairs || [])
      } catch (err) {
        console.error('Error fetching translation pairs:', err)
        setSupportedPairs([])
      } finally {
        setLoading(false)
      }
    }
    fetchPairs()
  }, [])

  return { supportedPairs, loading }
}