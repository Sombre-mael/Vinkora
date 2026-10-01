import type { QrOptions } from '@/types/link'
import type {
  DynamicQrAnalytics,
  DynamicQrCreationResponse,
  DynamicQrResource,
  DynamicQrStatus,
  SavedQrStyle,
} from '@/types/dynamicQr'

const DEVICE_TOKEN_KEY = 'vinkora-anonymous-device-v1'
const STUDIO_TRANSFER_KEY = 'vinkora-dynamic-studio-transfer-v1'

function randomBrowserToken() {
  const bytes = new Uint8Array(32)
  crypto.getRandomValues(bytes)
  return btoa(String.fromCharCode(...bytes))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '')
}

export function getAnonymousDeviceToken() {
  const current = window.localStorage.getItem(DEVICE_TOKEN_KEY)
  if (current) return current

  const token = randomBrowserToken()
  window.localStorage.setItem(DEVICE_TOKEN_KEY, token)
  return token
}

export async function createDynamicQr(input: {
  destinationUrl: string
  name?: string
  slug?: string
  styleOptions: QrOptions
}) {
  const response = await fetch('/api/qr-codes', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Vinkora-Device-Token': getAnonymousDeviceToken(),
    },
    body: JSON.stringify({
      ...input,
      styleOptions: toCloudSafeQrStyle(input.styleOptions),
    }),
  })

  return readJson<DynamicQrCreationResponse>(response)
}

export async function getDynamicQr(id: string, editToken: string) {
  const response = await fetch(`/api/qr-codes/${encodeURIComponent(id)}`, {
    headers: { Authorization: `Bearer ${editToken}` },
    cache: 'no-store',
  })
  const data = await readJson<{ qrCode: DynamicQrResource }>(response)
  return data.qrCode
}

export async function updateDynamicQr(
  id: string,
  editToken: string,
  updates: {
    destinationUrl?: string
    name?: string
    styleOptions?: QrOptions
    status?: DynamicQrStatus
  },
) {
  const response = await fetch(`/api/qr-codes/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${editToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      ...updates,
      styleOptions: updates.styleOptions
        ? toCloudSafeQrStyle(updates.styleOptions)
        : undefined,
    }),
  })
  const data = await readJson<{ qrCode: DynamicQrResource }>(response)
  return data.qrCode
}

export function toCloudSafeQrStyle(options: QrOptions): SavedQrStyle {
  const cloudStyle = { ...options } as Partial<QrOptions>
  delete cloudStyle.logoSrc
  return { ...cloudStyle, showLogo: false } as SavedQrStyle
}

export async function getDynamicQrAnalytics(id: string, editToken: string) {
  const response = await fetch(`/api/qr-codes/${encodeURIComponent(id)}/analytics`, {
    headers: { Authorization: `Bearer ${editToken}` },
    cache: 'no-store',
  })
  const data = await readJson<{ analytics: DynamicQrAnalytics }>(response)
  return data.analytics
}

export function queueDynamicQrForStudio(qrCode: DynamicQrResource, editToken: string) {
  window.localStorage.setItem(STUDIO_TRANSFER_KEY, JSON.stringify({ qrCode, editToken }))
}

export function readDynamicQrStudioTransfer() {
  const raw = window.localStorage.getItem(STUDIO_TRANSFER_KEY)
  if (!raw) return null

  window.localStorage.removeItem(STUDIO_TRANSFER_KEY)
  try {
    return JSON.parse(raw) as { qrCode: DynamicQrResource; editToken: string }
  } catch {
    return null
  }
}

async function readJson<T>(response: Response): Promise<T> {
  const data = (await response.json().catch(() => null)) as (T & { error?: string }) | null
  if (!response.ok) {
    throw new Error(data?.error || 'Le service QR dynamique est indisponible.')
  }
  if (!data) {
    throw new Error('La réponse du service QR dynamique est invalide.')
  }
  return data
}
