import { useState } from 'react'
import { createDynamicQr } from '@/services/dynamicQr'
import { prepareUrl } from '@/services/shorteners'
import type { QrOptions } from '@/types/link'

export type QrCreationMode = 'static' | 'dynamic'

export type ShortenResult = {
  originalUrl: string
  outputUrl: string
  mode: QrCreationMode
  dynamicQrId?: string
  dynamicSlug?: string
  editToken?: string
  manageUrl?: string
  name?: string
}

export const useUrlShortener = () => {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState<ShortenResult | null>(null)

  const submitUrl = async (
    rawUrl: string,
    mode: QrCreationMode,
    options: { name?: string; slug?: string; qrOptions: QrOptions },
  ) => {
    setIsLoading(true)
    setError('')
    setResult(null)

    let preparedUrl = ''

    try {
      preparedUrl = prepareUrl(rawUrl)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'URL invalide.'
      setError(message)
      setIsLoading(false)
      throw new Error(message)
    }

    if (mode === 'static') {
      const nextResult: ShortenResult = {
        originalUrl: preparedUrl,
        outputUrl: preparedUrl,
        mode,
      }

      setResult(nextResult)
      setIsLoading(false)
      return nextResult
    }

    try {
      const created = await createDynamicQr({
        destinationUrl: preparedUrl,
        name: options.name,
        slug: options.slug,
        styleOptions: options.qrOptions,
      })
      const nextResult: ShortenResult = {
        originalUrl: preparedUrl,
        outputUrl: created.qrCode.publicUrl,
        mode,
        dynamicQrId: created.qrCode.id,
        dynamicSlug: created.qrCode.slug,
        editToken: created.editToken,
        manageUrl: created.manageUrl,
        name: created.qrCode.name,
      }
      setResult(nextResult)
      return nextResult
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Le QR dynamique n’a pas pu être créé.'
      setError(message)
      throw new Error(message)
    } finally {
      setIsLoading(false)
    }
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
