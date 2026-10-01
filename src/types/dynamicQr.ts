import type { QrOptions } from './link'

export type DynamicQrStatus = 'ACTIVE' | 'SUSPENDED' | 'ARCHIVED'

export type SavedQrStyle = Omit<QrOptions, 'logoSrc' | 'showLogo'> & {
  showLogo: false
}

export type DynamicQrResource = {
  id: string
  slug: string
  name: string
  destinationUrl: string
  publicUrl: string
  status: DynamicQrStatus
  styleOptions: SavedQrStyle
  clickCount: number
  lastClickedAt: string | null
  createdAt: string
  updatedAt: string
}

export type DynamicQrCreationResponse = {
  qrCode: DynamicQrResource
  editToken: string
  manageUrl: string
}

export type DynamicQrBreakdown = {
  label: string
  value: number
}

export type DynamicQrAnalytics = {
  totalScans: number
  lastScanAt: string | null
  periodDays: 30
  analyzedScans: number
  estimatedUniqueVisitors: number
  botScans: number
  daily: Array<{
    date: string
    scans: number
    uniqueVisitors: number
  }>
  countries: DynamicQrBreakdown[]
  cities: DynamicQrBreakdown[]
  devices: DynamicQrBreakdown[]
  browsers: DynamicQrBreakdown[]
  referrers: DynamicQrBreakdown[]
}
