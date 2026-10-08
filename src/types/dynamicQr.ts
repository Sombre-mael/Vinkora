import type { QrOptions } from './link'
import type { DynamicQrCampaignChannel } from '@/config/dynamicQrCampaigns'

export type DynamicQrStatus = 'ACTIVE' | 'SUSPENDED' | 'ARCHIVED'

export type SavedQrStyle = Omit<QrOptions, 'logoSrc' | 'showLogo'> & {
  showLogo: false
}

export type DynamicQrResource = {
  id: string
  slug: string
  name: string
  campaignChannel: DynamicQrCampaignChannel
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
  editToken?: string
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
  returningScans: number
  dataCompleteness: number
  botScans: number
  daily: Array<{
    date: string
    scans: number
    uniqueVisitors: number
  }>
  countries: DynamicQrBreakdown[]
  regions: DynamicQrBreakdown[]
  cities: DynamicQrBreakdown[]
  devices: DynamicQrBreakdown[]
  operatingSystems: DynamicQrBreakdown[]
  browsers: DynamicQrBreakdown[]
  languages: DynamicQrBreakdown[]
  localHours: DynamicQrBreakdown[]
  localWeekdays: DynamicQrBreakdown[]
  referrers: DynamicQrBreakdown[]
}
