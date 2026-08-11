import type { QrOptions } from '@/types/link'

const SVG_NS = 'http://www.w3.org/2000/svg'

const getMainPaths = (svg: SVGSVGElement) => {
  const paths = Array.from(svg.querySelectorAll('path'))

  return {
    backgroundPath: paths[0],
    foregroundPath: paths[1],
  }
}

const removeGenerated = (svg: SVGSVGElement) => {
  svg.querySelectorAll('[data-vinkora-generated="true"]').forEach((node) => node.remove())
}

const ensureDefs = (svg: SVGSVGElement) => {
  let defs = svg.querySelector('defs')

  if (!defs) {
    defs = document.createElementNS(SVG_NS, 'defs')
    svg.insertBefore(defs, svg.firstChild)
  }

  return defs
}

const addGradient = (svg: SVGSVGElement, options: QrOptions) => {
  const defs = ensureDefs(svg)
  const gradient = document.createElementNS(SVG_NS, 'linearGradient')
  gradient.setAttribute('id', 'vinkora-qr-gradient')
  gradient.setAttribute('x1', '0%')
  gradient.setAttribute('y1', '0%')
  gradient.setAttribute('x2', '100%')
  gradient.setAttribute('y2', '100%')
  gradient.setAttribute('data-vinkora-generated', 'true')

  const start = document.createElementNS(SVG_NS, 'stop')
  start.setAttribute('offset', '0%')
  start.setAttribute('stop-color', options.gradientFrom)

  const end = document.createElementNS(SVG_NS, 'stop')
  end.setAttribute('offset', '100%')
  end.setAttribute('stop-color', options.gradientTo)

  gradient.append(start, end)
  defs.appendChild(gradient)
}

const addStyleFilter = (svg: SVGSVGElement, options: QrOptions) => {
  if (options.styleMode === 'classic') {
    return ''
  }

  const defs = ensureDefs(svg)
  const filter = document.createElementNS(SVG_NS, 'filter')
  filter.setAttribute('id', 'vinkora-qr-soften')
  filter.setAttribute('x', '-3%')
  filter.setAttribute('y', '-3%')
  filter.setAttribute('width', '106%')
  filter.setAttribute('height', '106%')
  filter.setAttribute('color-interpolation-filters', 'sRGB')
  filter.setAttribute('data-vinkora-generated', 'true')

  const blur = document.createElementNS(SVG_NS, 'feGaussianBlur')
  blur.setAttribute('in', 'SourceGraphic')
  blur.setAttribute('stdDeviation', options.styleMode === 'soft' ? '0.08' : '0.04')
  blur.setAttribute('result', 'blurred')

  const contrast = document.createElementNS(SVG_NS, 'feComponentTransfer')
  contrast.setAttribute('in', 'blurred')
  const alpha = document.createElementNS(SVG_NS, 'feFuncA')
  alpha.setAttribute('type', 'discrete')
  alpha.setAttribute('tableValues', options.styleMode === 'dots' ? '0 0 1 1' : '0 1')
  contrast.appendChild(alpha)

  filter.append(blur, contrast)
  defs.appendChild(filter)

  return 'url(#vinkora-qr-soften)'
}

const addCornerAccents = (svg: SVGSVGElement, options: QrOptions) => {
  if (options.cornerStyle === 'classic') {
    return
  }

  const viewBox = svg.getAttribute('viewBox')
  const size = Number(viewBox?.split(' ')[3] ?? 0)

  if (!size) {
    return
  }

  const margin = options.marginSize
  const finderSize = 7
  const positions = [
    [margin, margin],
    [size - margin - finderSize, margin],
    [margin, size - margin - finderSize],
  ]

  positions.forEach(([x, y]) => {
    const rect = document.createElementNS(SVG_NS, 'rect')
    rect.setAttribute('x', String(x - 0.35))
    rect.setAttribute('y', String(y - 0.35))
    rect.setAttribute('width', String(finderSize + 0.7))
    rect.setAttribute('height', String(finderSize + 0.7))
    rect.setAttribute('fill', 'none')
    rect.setAttribute('stroke', options.cornerColor)
    rect.setAttribute('stroke-width', options.cornerStyle === 'accent' ? '0.7' : '0.45')
    rect.setAttribute('rx', options.cornerStyle === 'classic' ? '0' : '1.25')
    rect.setAttribute('data-vinkora-generated', 'true')
    svg.appendChild(rect)
  })
}

const getFrameRadius = (shape: QrOptions['logoFrameShape'], width: number, height: number) => {
  if (shape === 'circle' || shape === 'pill') {
    return Math.min(width, height) / 2
  }

  return Math.min(width, height) * 0.18
}

const addLogoFrameShadow = (svg: SVGSVGElement) => {
  const defs = ensureDefs(svg)
  const filter = document.createElementNS(SVG_NS, 'filter')
  filter.setAttribute('id', 'vinkora-logo-shadow')
  filter.setAttribute('x', '-30%')
  filter.setAttribute('y', '-30%')
  filter.setAttribute('width', '160%')
  filter.setAttribute('height', '160%')
  filter.setAttribute('data-vinkora-generated', 'true')

  const shadow = document.createElementNS(SVG_NS, 'feDropShadow')
  shadow.setAttribute('dx', '0')
  shadow.setAttribute('dy', '0.35')
  shadow.setAttribute('stdDeviation', '0.5')
  shadow.setAttribute('flood-color', '#0f172a')
  shadow.setAttribute('flood-opacity', '0.22')

  filter.appendChild(shadow)
  defs.appendChild(filter)
}

const addLogoBadge = (svg: SVGSVGElement, options: QrOptions) => {
  const image = svg.querySelector('image')

  if (!image) {
    return
  }

  const x = Number(image.getAttribute('x') ?? 0)
  const y = Number(image.getAttribute('y') ?? 0)
  const width = Number(image.getAttribute('width') ?? 0)
  const height = Number(image.getAttribute('height') ?? 0)
  const padding = Math.max(0.35, Math.min(2.4, options.logoPadding / 10))
  const frameX = x - padding
  const frameY = y - padding
  const frameWidth = width + padding * 2
  const frameHeight = height + padding * 2
  const radius = getFrameRadius(options.logoFrameShape, frameWidth, frameHeight)
  const clipId = 'vinkora-logo-clip'

  const defs = ensureDefs(svg)
  const clipPath = document.createElementNS(SVG_NS, 'clipPath')
  clipPath.setAttribute('id', clipId)
  clipPath.setAttribute('data-vinkora-generated', 'true')

  const clipShape = document.createElementNS(SVG_NS, 'rect')
  clipShape.setAttribute('x', String(x))
  clipShape.setAttribute('y', String(y))
  clipShape.setAttribute('width', String(width))
  clipShape.setAttribute('height', String(height))
  clipShape.setAttribute('rx', String(getFrameRadius(options.logoFrameShape, width, height) * 0.72))
  clipPath.appendChild(clipShape)
  defs.appendChild(clipPath)

  if (options.logoShadow) {
    addLogoFrameShadow(svg)
  }

  const group = document.createElementNS(SVG_NS, 'g')
  group.setAttribute('data-vinkora-generated', 'true')
  if (options.logoShadow) {
    group.setAttribute('filter', 'url(#vinkora-logo-shadow)')
  }

  const frame = document.createElementNS(SVG_NS, 'rect')
  frame.setAttribute('x', String(frameX))
  frame.setAttribute('y', String(frameY))
  frame.setAttribute('width', String(frameWidth))
  frame.setAttribute('height', String(frameHeight))
  frame.setAttribute('rx', String(radius))
  frame.setAttribute('fill', options.logoBackground)
  frame.setAttribute('stroke', options.logoBorderColor)
  frame.setAttribute('stroke-width', '0.18')

  const innerGlow = document.createElementNS(SVG_NS, 'rect')
  innerGlow.setAttribute('x', String(frameX + 0.18))
  innerGlow.setAttribute('y', String(frameY + 0.18))
  innerGlow.setAttribute('width', String(frameWidth - 0.36))
  innerGlow.setAttribute('height', String(frameHeight - 0.36))
  innerGlow.setAttribute('rx', String(Math.max(0, radius - 0.18)))
  innerGlow.setAttribute('fill', 'none')
  innerGlow.setAttribute('stroke', '#ffffff')
  innerGlow.setAttribute('stroke-width', '0.16')
  innerGlow.setAttribute('opacity', '0.7')

  group.append(frame, innerGlow)
  svg.insertBefore(group, image)

  image.setAttribute('clip-path', `url(#${clipId})`)
  image.setAttribute('preserveAspectRatio', options.logoFit === 'cover' ? 'xMidYMid slice' : 'xMidYMid meet')
}

export const applyQrSvgEnhancements = (svg: SVGSVGElement | null, options: QrOptions) => {
  if (!svg) {
    return
  }

  removeGenerated(svg)

  const { backgroundPath, foregroundPath } = getMainPaths(svg)

  if (backgroundPath) {
    backgroundPath.setAttribute('fill', options.transparentBackground ? 'none' : options.background)
  }

  if (foregroundPath) {
    if (options.useGradient) {
      addGradient(svg, options)
      foregroundPath.setAttribute('fill', 'url(#vinkora-qr-gradient)')
    } else {
      foregroundPath.setAttribute('fill', options.foreground)
    }

    foregroundPath.setAttribute(
      'shape-rendering',
      options.styleMode === 'classic' ? 'crispEdges' : 'geometricPrecision',
    )

    const filter = addStyleFilter(svg, options)
    if (filter) {
      foregroundPath.setAttribute('filter', filter)
    } else {
      foregroundPath.removeAttribute('filter')
    }
  }

  addCornerAccents(svg, options)
  addLogoBadge(svg, options)
}

export const serializeEnhancedSvg = (sourceSvg: SVGSVGElement, options: QrOptions) => {
  const clone = sourceSvg.cloneNode(true) as SVGSVGElement
  applyQrSvgEnhancements(clone, options)
  clone.setAttribute('xmlns', SVG_NS)

  return new XMLSerializer().serializeToString(clone)
}

export const downloadSvg = (sourceSvg: SVGSVGElement, options: QrOptions) => {
  const svgData = serializeEnhancedSvg(sourceSvg, options)
  const blob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = `vinkora-qr-${Date.now()}.svg`
  link.click()
  URL.revokeObjectURL(link.href)
}

export const downloadPng = (sourceSvg: SVGSVGElement, options: QrOptions) => {
  const svgData = serializeEnhancedSvg(sourceSvg, options)
  const image = new Image()
  const canvas = document.createElement('canvas')
  const context = canvas.getContext('2d')
  const svgUrl = URL.createObjectURL(new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' }))

  image.onload = () => {
    canvas.width = options.exportSize
    canvas.height = options.exportSize

    if (!options.transparentBackground) {
      context!.fillStyle = options.background
      context!.fillRect(0, 0, canvas.width, canvas.height)
    }

    context?.drawImage(image, 0, 0, options.exportSize, options.exportSize)

    const link = document.createElement('a')
    link.download = `vinkora-qr-${options.exportSize}-${Date.now()}.png`
    link.href = canvas.toDataURL('image/png')
    link.click()
    URL.revokeObjectURL(svgUrl)
  }

  image.src = svgUrl
}
