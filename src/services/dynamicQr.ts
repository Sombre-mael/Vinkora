import type { QrOptions } from '@/types/link'
import type { DynamicQrCampaignChannel } from '@/config/dynamicQrCampaigns'
import type {
  DynamicQrAnalytics,
  DynamicQrCreationResponse,
  DynamicQrResource,
  DynamicQrStatus,
  SavedQrStyle,
} from '@/types/dynamicQr'

const STUDIO_TRANSFER_KEY = 'vinkora-dynamic-studio-transfer-v1'

export async function createDynamicQr(input: {
  destinationUrl: string
  name?: string
  slug?: string
  campaignChannel?: DynamicQrCampaignChannel
  styleOptions: QrOptions
}) {
  const response = await fetch('/api/qr-codes', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      ...input,
      styleOptions: toCloudSafeQrStyle(input.styleOptions),
    }),
  })

  return readJson<DynamicQrCreationResponse>(response)
}

export async function getDynamicQr(id: string, editToken?: string) {
  const response = await fetch(`/api/qr-codes/${encodeURIComponent(id)}`, {
    headers: managementHeaders(editToken),
    cache: 'no-store',
  })
  const data = await readJson<{ qrCode: DynamicQrResource }>(response)
  return data.qrCode
}

export async function updateDynamicQr(
  id: string,
  editToken: string | undefined,
  updates: {
    destinationUrl?: string
    name?: string
    campaignChannel?: DynamicQrCampaignChannel
    styleOptions?: QrOptions
    status?: DynamicQrStatus
  },
) {
  const response = await fetch(`/api/qr-codes/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    headers: {
      ...managementHeaders(editToken),
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

export async function getDynamicQrAnalytics(id: string, editToken?: string) {
  const response = await fetch(`/api/qr-codes/${encodeURIComponent(id)}/analytics`, {
    headers: managementHeaders(editToken),
    cache: 'no-store',
  })
  const data = await readJson<{ analytics: DynamicQrAnalytics }>(response)
  return data.analytics
}

export function queueDynamicQrForStudio(qrCode: DynamicQrResource, editToken?: string) {
  window.localStorage.setItem(STUDIO_TRANSFER_KEY, JSON.stringify({ qrCode, editToken }))
}

export function readDynamicQrStudioTransfer() {
  const raw = window.localStorage.getItem(STUDIO_TRANSFER_KEY)
  if (!raw) return null

  window.localStorage.removeItem(STUDIO_TRANSFER_KEY)
  try {
    return JSON.parse(raw) as { qrCode: DynamicQrResource; editToken?: string }
  } catch {
    return null
  }
}

function managementHeaders(editToken?: string): HeadersInit {
  return editToken ? { Authorization: `Bearer ${editToken}` } : {}
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
