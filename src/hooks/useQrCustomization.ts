import { useMemo, useState } from 'react'
import { defaultQrOptions } from '@/data/qrPresets'
import type { QrOptions, QrPreset } from '@/types/link'

const hexToRgb = (hex: string) => {
  const normalized = hex.replace('#', '')
  const value = normalized.length === 3
    ? normalized.split('').map((part) => `${part}${part}`).join('')
    : normalized

  const parsed = Number.parseInt(value, 16)

  return {
    r: (parsed >> 16) & 255,
    g: (parsed >> 8) & 255,
    b: parsed & 255,
  }
}

const relativeLuminance = (hex: string) => {
  const { r, g, b } = hexToRgb(hex)
  const values = [r, g, b].map((channel) => {
    const value = channel / 255
    return value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4
  })

  return 0.2126 * values[0] + 0.7152 * values[1] + 0.0722 * values[2]
}

export const getContrastRatio = (foreground: string, background: string) => {
  const fg = relativeLuminance(foreground)
  const bg = relativeLuminance(background)
  const light = Math.max(fg, bg)
  const dark = Math.min(fg, bg)

  return (light + 0.05) / (dark + 0.05)
}

export const useQrCustomization = () => {
  const [qrOptions, setQrOptions] = useState<QrOptions>(defaultQrOptions)

  const updateQrOptions = (updates: Partial<QrOptions>) => {
    setQrOptions((current) => {
      const next = { ...current, ...updates }

      if ((updates.logoSrc || updates.showLogo || updates.logoSize) && next.logoSrc && next.showLogo) {
        next.level = 'H'
        next.logoSize = Math.min(next.logoSize, 24)
        next.marginSize = Math.max(next.marginSize, 4)
      }

      if (next.transparentBackground) {
        next.background = '#ffffff'
      }

      return next
    })
  }

  const applyPreset = (preset: QrPreset) => {
    updateQrOptions(preset.options)
  }

  const resetQrOptions = () => {
    setQrOptions(defaultQrOptions)
  }

  const warnings = useMemo(() => {
    const items: string[] = []
    const background = qrOptions.transparentBackground ? '#ffffff' : qrOptions.background
    const contrast = qrOptions.useGradient
      ? Math.min(
          getContrastRatio(qrOptions.gradientFrom, background),
          getContrastRatio(qrOptions.gradientTo, background),
        )
      : getContrastRatio(qrOptions.foreground, background)

    if (contrast < 4.5) {
      items.push('Contraste faible: le QR peut etre difficile a scanner.')
    }

    if (qrOptions.showLogo && qrOptions.logoSrc && qrOptions.logoSize > 24) {
      items.push('Logo assez grand: restez proche de 18-22% et testez le scan.')
    }

    if (qrOptions.showLogo && qrOptions.logoSrc && qrOptions.level !== 'H') {
      items.push('Logo actif : le niveau de correction H est recommandé.')
    }

    if (qrOptions.marginSize < 4) {
      items.push('Marge reduite: prevoyez une zone calme autour du QR.')
    }

    return items
  }, [qrOptions])

  return {
    qrOptions,
    updateQrOptions,
    applyPreset,
    resetQrOptions,
    warnings,
  }
}
