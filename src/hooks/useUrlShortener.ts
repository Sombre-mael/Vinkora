import { useState } from 'react'
import { prepareUrl } from '@/services/shorteners'

export type ShortenMode = 'shorten' | 'qr-only'

export type ShortenResult = {
  originalUrl: string
  outputUrl: string
  mode: ShortenMode
}

export const useUrlShortener = () => {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState<ShortenResult | null>(null)

  const submitUrl = async (rawUrl: string, mode: ShortenMode) => {
    setError('')
    setResult(null)

    let preparedUrl = ''

    try {
      preparedUrl = prepareUrl(rawUrl)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'URL invalide.'
      setError(message)
      throw new Error(message)
    }

    if (mode === 'qr-only') {
      const nextResult = {
        originalUrl: preparedUrl,
        outputUrl: preparedUrl,
        mode,
      }

      setResult(nextResult)
      return nextResult
    }

    const message = 'Les liens courts Vinkora nécessiteront une authentification et une offre active.'
    setError(message)
    throw new Error(message)
  }

  const resetResult = () => {
    setError('')
    setResult(null)
  }

  const setManualResult = (nextResult: ShortenResult) => {
    setError('')
    setResult(nextResult)
  }

  return {
    isLoading,
    error,
    result,
    submitUrl,
    resetResult,
    setManualResult,
  }
}
