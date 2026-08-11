import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react'
import {
  CheckCircle2,
  Download,
  ImagePlus,
  Link2,
  RotateCcw,
  ScanLine,
  Sparkles,
} from 'lucide-react'
import { QRCodeSVG } from 'qrcode.react'
import { toast } from 'sonner'
import { backgroundColors, foregroundColors, qrPresets } from '@/data/qrPresets'
import type { LogoFrameShape, QrExportSize, QrLevel, QrOptions, QrStyleMode } from '@/types/link'
import { applyQrSvgEnhancements, downloadPng, downloadSvg } from '@/utils/qrSvg'

export type QrEditorTool = 'templates' | 'colors' | 'shape' | 'logo' | 'export'

export type QrStudioHandle = {
  downloadPng: () => void
  downloadSvg: () => void
}

type QrStudioProps = {
  value: string
  options: QrOptions
  warnings: string[]
}

type QrControlsProps = {
  tool: QrEditorTool
  options: QrOptions
  onChange: (options: Partial<QrOptions>) => void
  onReset: () => void
  onDownloadPng?: () => void
  onDownloadSvg?: () => void
}

const qrLevels: QrLevel[] = ['L', 'M', 'Q', 'H']
const exportSizes: QrExportSize[] = [512, 1024, 2048]
const styleModes: Array<{ id: QrStyleMode; label: string }> = [
  { id: 'classic', label: 'Carrés' },
  { id: 'rounded', label: 'Arrondi' },
  { id: 'dots', label: 'Points' },
  { id: 'soft', label: 'Doux' },
]
const logoFrameShapes: Array<{ id: LogoFrameShape; label: string }> = [
  { id: 'rounded', label: 'Arrondi' },
  { id: 'circle', label: 'Cercle' },
  { id: 'pill', label: 'Pilule' },
]

const readLogoFile = (file: File, onChange: (src: string) => void) => {
  if (!file.type.startsWith('image/')) {
    toast.error('Choisissez une image pour le logo.')
    return
  }

  const reader = new FileReader()
  reader.onload = () => {
    if (typeof reader.result === 'string') {
      onChange(reader.result)
      toast.success('Logo ajouté au QR code.')
    }
  }
  reader.onerror = () => toast.error('Impossible de lire cette image.')
  reader.readAsDataURL(file)
}

export const QrStudioCanvas = forwardRef<QrStudioHandle, QrStudioProps>(
  function QrStudioCanvas({ value, options, warnings }, ref) {
    const svgRef = useRef<SVGSVGElement | null>(null)
    const hasLogo = Boolean(options.logoSrc && options.showLogo)

    useEffect(() => {
      applyQrSvgEnhancements(svgRef.current, options)
    }, [options, value])

    const handleDownloadPng = () => {
      if (!svgRef.current || !value) {
        toast.error('Générez un QR code avant de télécharger.')
        return
      }

      downloadPng(svgRef.current, options)
      toast.success(`PNG ${options.exportSize}px préparé.`)
    }

    const handleDownloadSvg = () => {
      if (!svgRef.current || !value) {
        toast.error('Générez un QR code avant de télécharger.')
        return
      }

      downloadSvg(svgRef.current, options)
      toast.success('SVG préparé.')
    }

    useImperativeHandle(ref, () => ({
      downloadPng: handleDownloadPng,
      downloadSvg: handleDownloadSvg,
    }))

    return (
      <section className="editor-canvas" aria-label="Aperçu du QR code">
        <div className="canvas-context">
          <span className="context-label">
            <Link2 aria-hidden="true" />
            Destination
          </span>
          <span className="context-url">{value || 'Ajoutez un lien pour commencer'}</span>
        </div>

        <div className="canvas-stage">
          <div className="qr-paper">
            <div
              className="qr-frame"
              style={{ backgroundColor: options.transparentBackground ? '#f8fafc' : options.background }}
            >
              {value ? (
                <QRCodeSVG
                  ref={svgRef}
                  value={value}
                  size={options.size}
                  bgColor={options.transparentBackground ? 'transparent' : options.background}
                  fgColor={options.useGradient ? options.gradientFrom : options.foreground}
                  level={options.level}
                  marginSize={options.marginSize}
                  title="QR code Vinkora"
                  imageSettings={hasLogo ? {
                    src: options.logoSrc,
                    height: options.size * (options.logoSize / 100),
                    width: options.size * (options.logoSize / 100),
                    excavate: true,
                  } : undefined}
                />
              ) : (
                <div className="qr-placeholder">
                  <Sparkles aria-hidden="true" />
                  <strong>Votre QR apparaîtra ici</strong>
                  <span>Ouvrez l’outil Lien pour générer votre premier QR code.</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className={warnings.length ? 'scan-status has-warning' : 'scan-status'}>
          <div>
            {warnings.length ? <ScanLine aria-hidden="true" /> : <CheckCircle2 aria-hidden="true" />}
            <span>{warnings.length ? warnings[0] : 'Scan fiable'}</span>
          </div>
          <span className="status-separator" aria-hidden="true" />
          <span>{warnings.length ? 'Vérifiez les réglages' : 'Contraste adapté'}</span>
        </div>

      </section>
    )
  },
)

export function QrStudioControls({
  tool,
  options,
  onChange,
  onReset,
  onDownloadPng,
  onDownloadSvg,
}: QrControlsProps) {
  const handleAutoFitLogo = () => {
    onChange({
      level: 'H',
      marginSize: Math.max(options.marginSize, 4),
      logoSize: 20,
      logoPadding: 9,
      logoFrameShape: 'rounded',
      logoBackground: '#ffffff',
      logoBorderColor: '#e2e8f0',
      logoShadow: true,
      logoFit: 'contain',
      showLogo: Boolean(options.logoSrc),
    })
    toast.success('Logo adapté pour un rendu plus propre.')
  }

  if (tool === 'templates') {
    return (
      <div className="inspector-content">
        <div className="inspector-heading">
          <div>
            <p className="eyebrow">Départ rapide</p>
            <h2>Modèles</h2>
          </div>
          <button className="icon-text-button" type="button" onClick={onReset}>
            <RotateCcw aria-hidden="true" />
            Réinitialiser
          </button>
        </div>
        <p className="inspector-copy">Appliquez un style complet, puis ajustez chaque détail.</p>
        <div className="preset-list">
          {qrPresets.map((preset) => (
            <button
              key={preset.id}
              type="button"
              onClick={() => onChange(preset.options)}
            >
              <span
                className="preset-preview"
                style={{
                  background: preset.options.useGradient
                    ? `linear-gradient(135deg, ${preset.options.gradientFrom}, ${preset.options.gradientTo})`
                    : preset.options.foreground,
                }}
              />
              <span>
                <strong>{preset.name}</strong>
                <small>{preset.description}</small>
              </span>
            </button>
          ))}
        </div>
      </div>
    )
  }

  if (tool === 'colors') {
    return (
      <div className="inspector-content">
        <div className="inspector-heading">
          <div>
            <p className="eyebrow">Personnalisation</p>
            <h2>Couleurs</h2>
          </div>
          <button className="icon-button" type="button" onClick={onReset} aria-label="Réinitialiser les couleurs">
            <RotateCcw aria-hidden="true" />
          </button>
        </div>

        <div className="control-group">
          <label>Couleur du QR</label>
          <div className="swatch-grid">
            {foregroundColors.map((color) => (
              <button
                key={color}
                type="button"
                className={options.foreground === color && !options.useGradient ? 'is-selected' : ''}
                style={{ backgroundColor: color }}
                onClick={() => onChange({ foreground: color, useGradient: false })}
                aria-label={`Utiliser la couleur ${color}`}
              />
            ))}
            <label className="custom-color" title="Couleur personnalisée">
              <span>+</span>
              <input
                type="color"
                value={options.foreground}
                onChange={(event) => onChange({ foreground: event.target.value, useGradient: false })}
              />
            </label>
          </div>
        </div>

        <div className="control-group">
          <label>Arrière-plan</label>
          <div className="swatch-grid">
            {backgroundColors.map((color) => (
              <button
                key={color}
                type="button"
                className={options.background === color && !options.transparentBackground ? 'is-selected' : ''}
                style={{ backgroundColor: color }}
                onClick={() => onChange({ background: color, transparentBackground: false })}
                aria-label={`Utiliser le fond ${color}`}
              />
            ))}
            <label className="custom-color" title="Fond personnalisé">
              <span>+</span>
              <input
                type="color"
                value={options.background}
                onChange={(event) => onChange({ background: event.target.value, transparentBackground: false })}
              />
            </label>
          </div>
          <label className="toggle-row">
            <span>
              <strong>Fond transparent</strong>
              <small>Utile pour les exports web.</small>
            </span>
            <input
              type="checkbox"
              checked={options.transparentBackground}
              onChange={(event) => onChange({ transparentBackground: event.target.checked })}
            />
          </label>
        </div>

        <div className="control-group">
          <label className="toggle-row">
            <span>
              <strong>Dégradé</strong>
              <small>Appliquer deux couleurs au QR.</small>
            </span>
            <input
              type="checkbox"
              checked={options.useGradient}
              onChange={(event) => onChange({ useGradient: event.target.checked })}
            />
          </label>
          <div className="gradient-controls">
            <label>
              <input
                type="color"
                value={options.gradientFrom}
                onChange={(event) => onChange({ gradientFrom: event.target.value, useGradient: true })}
              />
              Début
            </label>
            <span aria-hidden="true">→</span>
            <label>
              <input
                type="color"
                value={options.gradientTo}
                onChange={(event) => onChange({ gradientTo: event.target.value, useGradient: true })}
              />
              Fin
            </label>
          </div>
        </div>
      </div>
    )
  }

  if (tool === 'shape') {
    return (
      <div className="inspector-content">
        <div className="inspector-heading">
          <div>
            <p className="eyebrow">Modules et coins</p>
            <h2>Forme</h2>
          </div>
          <button className="icon-button" type="button" onClick={onReset} aria-label="Réinitialiser la forme">
            <RotateCcw aria-hidden="true" />
          </button>
        </div>

        <div className="control-group">
          <label>Style des modules</label>
          <div className="option-grid">
            {styleModes.map((mode) => (
              <button
                key={mode.id}
                type="button"
                className={options.styleMode === mode.id ? 'is-active' : ''}
                onClick={() => onChange({ styleMode: mode.id })}
              >
                <span className={`module-sample sample-${mode.id}`} />
                {mode.label}
              </button>
            ))}
          </div>
        </div>

        <div className="control-group">
          <label>Style des coins</label>
          <div className="segmented">
            {(['classic', 'rounded', 'accent'] as const).map((style) => (
              <button
                key={style}
                type="button"
                className={options.cornerStyle === style ? 'is-active' : ''}
                onClick={() => onChange({ cornerStyle: style })}
              >
                {style === 'classic' ? 'Simple' : style === 'rounded' ? 'Arrondi' : 'Accent'}
              </button>
            ))}
          </div>
          <label className="color-field">
            <span>Couleur des coins</span>
            <input
              type="color"
              value={options.cornerColor}
              onChange={(event) => onChange({ cornerColor: event.target.value })}
            />
          </label>
        </div>

        <div className="control-group range-stack">
          <label>
            <span>Taille d’aperçu</span>
            <output>{options.size}px</output>
          </label>
          <input
            type="range"
            min="180"
            max="360"
            step="10"
            value={options.size}
            onChange={(event) => onChange({ size: Number(event.target.value) })}
          />
          <label>
            <span>Marge</span>
            <output>{options.marginSize} modules</output>
          </label>
          <input
            type="range"
            min="0"
            max="8"
            step="1"
            value={options.marginSize}
            onChange={(event) => onChange({ marginSize: Number(event.target.value) })}
          />
        </div>

        <div className="control-group">
          <label>Correction d’erreur</label>
          <div className="segmented">
            {qrLevels.map((level) => (
              <button
                key={level}
                type="button"
                className={options.level === level ? 'is-active' : ''}
                onClick={() => onChange({ level })}
              >
                {level}
              </button>
            ))}
          </div>
        </div>

      </div>
    )
  }

  if (tool === 'export') {
    return (
      <div className="inspector-content export-controls">
        <div className="inspector-heading">
          <div>
            <p className="eyebrow">Téléchargement</p>
            <h2>Exporter</h2>
          </div>
        </div>
        <p className="inspector-copy">Choisissez la définition et le format de votre QR code.</p>

        <div className="control-group">
          <label>Taille d’export</label>
          <div className="segmented export-sizes">
            {exportSizes.map((size) => (
              <button
                key={size}
                type="button"
                className={options.exportSize === size ? 'is-active' : ''}
                onClick={() => onChange({ exportSize: size })}
              >
                {size}px
              </button>
            ))}
          </div>
        </div>

        <div className="export-format-grid">
          <button type="button" onClick={onDownloadPng}>
            <Download aria-hidden="true" />
            <span>
              <strong>PNG</strong>
              <small>Image prête à partager</small>
            </span>
          </button>
          <button type="button" onClick={onDownloadSvg}>
            <Download aria-hidden="true" />
            <span>
              <strong>SVG</strong>
              <small>Format vectoriel</small>
            </span>
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="inspector-content">
      <div className="inspector-heading">
        <div>
          <p className="eyebrow">Identité visuelle</p>
          <h2>Logo</h2>
        </div>
      </div>

      <div className="logo-upload">
        <div className="logo-preview">
          {options.logoSrc ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={options.logoSrc} alt="Aperçu du logo" />
          ) : (
            <ImagePlus aria-hidden="true" />
          )}
        </div>
        <div>
          <strong>{options.logoSrc ? 'Logo importé' : 'Ajoutez votre logo'}</strong>
          <p>Une taille de 18 à 22 % offre généralement le meilleur résultat.</p>
          <label className="file-button">
            <ImagePlus aria-hidden="true" />
            Importer
            <input
              type="file"
              accept="image/*"
              onChange={(event) => {
                const file = event.target.files?.[0]
                if (file) {
                  readLogoFile(file, (src) => onChange({
                    logoSrc: src,
                    showLogo: true,
                    level: 'H',
                    logoSize: 20,
                    marginSize: 4,
                  }))
                }
                event.target.value = ''
              }}
            />
          </label>
        </div>
      </div>

      <button className="secondary-action full-width" type="button" onClick={handleAutoFitLogo} disabled={!options.logoSrc}>
        Adapter automatiquement
      </button>

      <div className="control-group">
        <label>Forme du badge</label>
        <div className="segmented">
          {logoFrameShapes.map((shape) => (
            <button
              key={shape.id}
              type="button"
              className={options.logoFrameShape === shape.id ? 'is-active' : ''}
              onClick={() => onChange({ logoFrameShape: shape.id })}
              disabled={!options.logoSrc}
            >
              {shape.label}
            </button>
          ))}
        </div>
      </div>

      <div className="control-group range-stack">
        <label>
          <span>Taille du logo</span>
          <output>{options.logoSize}%</output>
        </label>
        <input
          type="range"
          min="12"
          max="28"
          step="1"
          value={options.logoSize}
          disabled={!options.logoSrc}
          onChange={(event) => onChange({ logoSize: Number(event.target.value), level: 'H' })}
        />
        <label>
          <span>Remplissage</span>
          <output>{options.logoPadding}</output>
        </label>
        <input
          type="range"
          min="4"
          max="16"
          step="1"
          value={options.logoPadding}
          disabled={!options.logoSrc}
          onChange={(event) => onChange({ logoPadding: Number(event.target.value) })}
        />
      </div>

      <div className="control-group color-pair">
        <label>
          <span>Fond du badge</span>
          <input
            type="color"
            value={options.logoBackground}
            disabled={!options.logoSrc}
            onChange={(event) => onChange({ logoBackground: event.target.value })}
          />
        </label>
        <label>
          <span>Bordure</span>
          <input
            type="color"
            value={options.logoBorderColor}
            disabled={!options.logoSrc}
            onChange={(event) => onChange({ logoBorderColor: event.target.value })}
          />
        </label>
      </div>

      <div className="control-group">
        <label className="toggle-row">
          <span><strong>Afficher le logo</strong></span>
          <input
            type="checkbox"
            checked={options.showLogo}
            disabled={!options.logoSrc}
            onChange={(event) => onChange({
              showLogo: event.target.checked,
              level: event.target.checked ? 'H' : options.level,
            })}
          />
        </label>
        <label className="toggle-row">
          <span><strong>Ombre douce</strong></span>
          <input
            type="checkbox"
            checked={options.logoShadow}
            disabled={!options.logoSrc}
            onChange={(event) => onChange({ logoShadow: event.target.checked })}
          />
        </label>
      </div>

      <div className="segmented">
        {(['contain', 'cover'] as const).map((fit) => (
          <button
            key={fit}
            type="button"
            className={options.logoFit === fit ? 'is-active' : ''}
            disabled={!options.logoSrc}
            onClick={() => onChange({ logoFit: fit })}
          >
            {fit === 'contain' ? 'Logo entier' : 'Remplir le badge'}
          </button>
        ))}
      </div>

      <button
        className="danger-link"
        type="button"
        onClick={() => onChange({ logoSrc: '', showLogo: false })}
        disabled={!options.logoSrc}
      >
        Retirer le logo
      </button>
    </div>
  )
}
