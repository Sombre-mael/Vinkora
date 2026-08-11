import { useEffect, useMemo, useState } from 'react'
import type { QrOptions, ShortenedLink } from '@/types/link'

const STORAGE_KEY = 'vinkora-history-v1'
const LEGACY_STORAGE_KEY = ['link', 'short-history-v1'].join('')

const createId = () => {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID()
  }

  return `${Date.now()}-${Math.random().toString(36).slice(2)}`
}

const readHistory = () => {
  if (typeof window === 'undefined') {
    return []
  }

  try {
    const currentHistory = window.localStorage.getItem(STORAGE_KEY)
    const legacyHistory = window.localStorage.getItem(LEGACY_STORAGE_KEY)
    const raw = currentHistory ?? legacyHistory

    if (!currentHistory && legacyHistory) {
      window.localStorage.setItem(STORAGE_KEY, legacyHistory)
      window.localStorage.removeItem(LEGACY_STORAGE_KEY)
    }

    return raw ? (JSON.parse(raw) as ShortenedLink[]) : []
  } catch {
    return []
  }
}

export const useLinkHistory = () => {
  const [history, setHistory] = useState<ShortenedLink[]>(() => readHistory())

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(history.slice(0, 30)))
  }, [history])

  const addHistoryItem = (originalUrl: string, shortUrl: string, qrOptions: QrOptions) => {
    setHistory((current) => {
      const nextItem: ShortenedLink = {
        id: createId(),
        originalUrl,
        shortUrl,
        createdAt: new Date().toISOString(),
        favorite: false,
        qrOptions,
      }

      const deduped = current.filter((item) => item.shortUrl !== shortUrl)
      return [nextItem, ...deduped].slice(0, 30)
    })
  }

  const removeHistoryItem = (id: string) => {
    setHistory((current) => current.filter((item) => item.id !== id))
  }

  const toggleFavorite = (id: string) => {
    setHistory((current) => current.map((item) => (
      item.id === id ? { ...item, favorite: !item.favorite } : item
    )))
  }

  const clearHistory = () => {
    setHistory([])
  }

  const sortedHistory = useMemo(() => {
    return [...history].sort((a, b) => Number(b.favorite) - Number(a.favorite))
  }, [history])

  return {
    history: sortedHistory,
    addHistoryItem,
    removeHistoryItem,
    toggleFavorite,
    clearHistory,
  }
}
