import type { ShortenerProvider } from '@/types/link'

const normalizeUrl = (url: string) => {
  const trimmed = url.trim()
  if (!trimmed) {
    return trimmed
  }

  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return trimmed
  }

  return `https://${trimmed}`
}

export const isValidUrl = (url: string) => {
  try {
    const candidate = new URL(normalizeUrl(url))
    return candidate.protocol === 'http:' || candidate.protocol === 'https:'
  } catch {
    return false
  }
}

export const prepareUrl = (url: string) => {
  const normalized = normalizeUrl(url)

  if (!normalized) {
    throw new Error('Veuillez entrer une URL.')
  }

  if (!isValidUrl(normalized)) {
    throw new Error('URL invalide. Verifiez votre saisie.')
  }

  return normalized
}

const shortenWithVinkora = async (url: string) => {
  const response = await fetch('/api/links', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ originalUrl: url }),
  })

  const data = (await response.json().catch(() => null)) as {
    shortPath?: string
    error?: string
  } | null

  if (!response.ok) {
    throw new Error(data?.error || 'Le service de raccourcissement est indisponible.')
  }

  if (!data?.shortPath) {
    throw new Error('La réponse du service de raccourcissement est invalide.')
  }

  return new URL(data.shortPath, window.location.origin).toString()
}

export const shortenerProviders: ShortenerProvider[] = [
  {
    id: 'vinkora',
    name: 'Vinkora',
    shorten: shortenWithVinkora,
  },
]

export const getShortenerProvider = (id = 'vinkora') => {
  return shortenerProviders.find((provider) => provider.id === id) ?? shortenerProviders[0]
}
