export type ShortenerProviderId = 'vinkora'

export type ShortenerProvider = {
  id: ShortenerProviderId
  name: string
  shorten: (url: string) => Promise<string>
}

export type QrLevel = 'L' | 'M' | 'Q' | 'H'

export type QrStyleMode = 'classic' | 'rounded' | 'dots' | 'soft'

export type QrCornerStyle = 'classic' | 'rounded' | 'accent'

export type QrPresetId = 'classic' | 'business' | 'social' | 'event' | 'minimal'

export type QrExportSize = 512 | 1024 | 2048

export type LogoFrameShape = 'rounded' | 'circle' | 'pill'

export type LogoFit = 'contain' | 'cover'

export type QrOptions = {
  foreground: string
  background: string
  transparentBackground: boolean
  useGradient: boolean
  gradientFrom: string
  gradientTo: string
  styleMode: QrStyleMode
  cornerStyle: QrCornerStyle
  cornerColor: string
  size: number
  exportSize: QrExportSize
  marginSize: number
  level: QrLevel
  logoSrc: string
  logoSize: number
  showLogo: boolean
  logoFrameShape: LogoFrameShape
  logoPadding: number
  logoBackground: string
  logoBorderColor: string
  logoShadow: boolean
  logoFit: LogoFit
}

export type QrPreset = {
  id: QrPresetId
  name: string
  description: string
  options: Partial<QrOptions>
}

export type ShortenedLink = {
  id: string
  originalUrl: string
  shortUrl: string
  createdAt: string
  favorite: boolean
  qrOptions: QrOptions
}
