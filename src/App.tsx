'use client'

import { useMemo, useRef, useState } from 'react'
import Image from 'next/image'
import {
  Clock3,
  Download,
  ExternalLink,
  ImageIcon,
  LayoutGrid,
  Link2,
  Palette,
  QrCode,
  Scissors,
  Shapes,
  X,
} from 'lucide-react'
import { toast } from 'sonner'
import { HistoryPanel } from '@/components/HistoryPanel'
import {
  QrStudioCanvas,
  QrStudioControls,
  type QrEditorTool,
  type QrStudioHandle,
} from '@/components/QrStudio'
import { ResultPanel } from '@/components/ResultPanel'
import { UrlShortener } from '@/components/UrlShortener'
import { useLinkHistory } from '@/hooks/useLinkHistory'
import { useQrCustomization } from '@/hooks/useQrCustomization'
import { type ShortenMode, useUrlShortener } from '@/hooks/useUrlShortener'
import type { ShortenedLink } from '@/types/link'

type EditorTool = 'link' | QrEditorTool | 'history'

const desktopTools: Array<{
  id: Exclude<EditorTool, 'export'>
  label: string
  icon: typeof Link2
}> = [
  { id: 'link', label: 'Lien', icon: Link2 },
  { id: 'templates', label: 'Modèles', icon: LayoutGrid },
  { id: 'colors', label: 'Couleurs', icon: Palette },
  { id: 'shape', label: 'Forme', icon: Shapes },
  { id: 'logo', label: 'Logo', icon: ImageIcon },
  { id: 'history', label: 'Historique', icon: Clock3 },
]

const mobileTools: Array<{
  id: QrEditorTool
  label: string
  icon: typeof Link2
}> = [
  { id: 'templates', label: 'Modèles', icon: LayoutGrid },
  { id: 'colors', label: 'Couleurs', icon: Palette },
  { id: 'shape', label: 'Style', icon: Shapes },
  { id: 'logo', label: 'Logo', icon: ImageIcon },
  { id: 'export', label: 'Exporter', icon: Download },
]

const copyToClipboard = async (text: string) => {
  if (!navigator.clipboard) {
    throw new Error('Le presse-papiers n’est pas disponible dans ce navigateur.')
  }

  await navigator.clipboard.writeText(text)
}

function App() {
  const [url, setUrl] = useState('')
  const [mode, setMode] = useState<ShortenMode>('qr-only')
  const [copied, setCopied] = useState(false)
  const [activeTool, setActiveTool] = useState<EditorTool>('link')
  const [mobilePanelOpen, setMobilePanelOpen] = useState(false)
  const [exportMenuOpen, setExportMenuOpen] = useState(false)
  const qrStudioRef = useRef<QrStudioHandle | null>(null)
  const workspaceRef = useRef<HTMLDivElement | null>(null)

  const {
    qrOptions,
    updateQrOptions,
    resetQrOptions,
    warnings,
  } = useQrCustomization()
  const {
    result,
    error,
    isLoading,
    submitUrl,
    resetResult,
    setManualResult,
  } = useUrlShortener()
  const {
    history,
    addHistoryItem,
    removeHistoryItem,
    toggleFavorite,
    clearHistory,
  } = useLinkHistory()

  const qrValue = useMemo(() => result?.outputUrl ?? '', [result])

  const selectDesktopTool = (tool: Exclude<EditorTool, 'export'>) => {
    setActiveTool(tool)
    setMobilePanelOpen(false)
    workspaceRef.current?.scrollTo({ top: 0 })
  }

  const openMobileTool = (tool: QrEditorTool) => {
    setActiveTool(tool)
    setMobilePanelOpen(true)
    workspaceRef.current?.scrollTo({ top: 0 })
  }

  const handleSubmit = async () => {
    try {
      const nextResult = await submitUrl(url, mode)
      addHistoryItem(nextResult.originalUrl, nextResult.outputUrl, qrOptions)
      setActiveTool('link')
      setMobilePanelOpen(false)
      toast.success(mode === 'shorten' ? 'Lien raccourci avec succès.' : 'QR code généré.')
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Une erreur est survenue.'
      toast.error(message)
    }
  }

  const handleResetInput = () => {
    setUrl('')
    setCopied(false)
    resetResult()
  }

  const handleCopy = async (text?: string) => {
    const value = text ?? result?.outputUrl

    if (!value) {
      return
    }

    try {
      await copyToClipboard(value)
      setCopied(true)
      toast.success('Lien copié.')
      window.setTimeout(() => setCopied(false), 1800)
    } catch {
      toast.error('Impossible de copier ce lien.')
    }
  }

  const handleSelectHistory = (item: ShortenedLink) => {
    setUrl(item.originalUrl)
    setMode(item.originalUrl === item.shortUrl ? 'qr-only' : 'shorten')
    updateQrOptions(item.qrOptions)
    setManualResult({
      originalUrl: item.originalUrl,
      outputUrl: item.shortUrl,
      mode: item.originalUrl === item.shortUrl ? 'qr-only' : 'shorten',
    })
    setActiveTool('link')
    setMobilePanelOpen(false)
    toast.success('Lien repris depuis l’historique.')
  }

  const downloadPng = () => qrStudioRef.current?.downloadPng()
  const downloadSvg = () => qrStudioRef.current?.downloadSvg()

  return (
    <div className="editor-shell">
      <header className="editor-header">
        <div className="header-brand">
          <Image
            className="desktop-brand-logo"
            src="/brand/vinkora-logo.png"
            alt="Vinkora"
            width={1580}
            height={600}
            priority
          />
          <Image
            className="mobile-brand-logo"
            src="/brand/vinkora-logo-dark.png"
            alt="Vinkora"
            width={1580}
            height={600}
            priority
          />
        </div>

        <div className="document-title">
          <span>Nouveau QR code</span>
          <small>Créez. Partagez. Mesurez.</small>
        </div>

        <button
          className="mobile-history-button"
          type="button"
          onClick={() => {
            setActiveTool('history')
            setMobilePanelOpen(false)
            workspaceRef.current?.scrollTo({ top: 0 })
          }}
          aria-label="Ouvrir l’historique"
        >
          <Clock3 aria-hidden="true" />
        </button>

        <div className="header-export">
          <button
            className="export-button"
            type="button"
            onClick={() => setExportMenuOpen((current) => !current)}
            disabled={!qrValue}
            aria-expanded={exportMenuOpen}
          >
            <Download aria-hidden="true" />
            <span>Exporter</span>
          </button>
          {exportMenuOpen && qrValue ? (
            <div className="export-menu">
              <button type="button" onClick={() => {
                downloadPng()
                setExportMenuOpen(false)
              }}>
                <Download aria-hidden="true" />
                Télécharger en PNG
              </button>
              <button type="button" onClick={() => {
                downloadSvg()
                setExportMenuOpen(false)
              }}>
                <Download aria-hidden="true" />
                Télécharger en SVG
              </button>
            </div>
          ) : null}
        </div>
      </header>

      <aside className="editor-sidebar">
        <nav aria-label="Outils de l’éditeur">
          {desktopTools.map((tool) => {
            const Icon = tool.icon
            return (
              <button
                key={tool.id}
                type="button"
                className={activeTool === tool.id ? 'is-active' : ''}
                onClick={() => selectDesktopTool(tool.id)}
              >
                <Icon aria-hidden="true" />
                <span>{tool.label}</span>
              </button>
            )
          })}
        </nav>

        <a
          className="sidebar-profile"
          href="https://github.com/Sombre-mael"
          target="_blank"
          rel="noreferrer"
        >
          <ExternalLink aria-hidden="true" />
          <span>Créateur</span>
        </a>
      </aside>

      {activeTool !== 'history' ? (
        <section className="mobile-link-panel" aria-label="Créer un QR code">
          <div className="mobile-link-heading">
            <span>Votre lien</span>
            <div className="mobile-mode-switch" aria-label="Mode de génération">
              <button
                type="button"
                className={mode === 'shorten' ? 'is-active' : ''}
                disabled
                aria-label="Lien court payant, bientôt disponible"
                title="Lien court payant, bientôt disponible"
              >
                <Scissors aria-hidden="true" />
              </button>
              <button
                type="button"
                className={mode === 'qr-only' ? 'is-active' : ''}
                onClick={() => setMode('qr-only')}
                aria-label="Générer le QR sans raccourcir"
              >
                <QrCode aria-hidden="true" />
              </button>
            </div>
          </div>
          <div className="mobile-link-form">
            <div className="mobile-url-input">
              <input
                type="url"
                value={url}
                onChange={(event) => setUrl(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    handleSubmit()
                  }
                }}
                placeholder="https://exemple.com"
                aria-label="URL à raccourcir"
              />
              {url ? (
                <button type="button" onClick={handleResetInput} aria-label="Effacer l’URL">
                  <X aria-hidden="true" />
                </button>
              ) : null}
            </div>
            <button type="button" onClick={handleSubmit} disabled={isLoading || mode === 'shorten'}>
              {isLoading ? 'Patientez…' : mode === 'shorten' ? 'Bientôt' : 'Créer'}
            </button>
          </div>
          <p className="mobile-feature-note">QR statique gratuit. Lien court payant bientôt disponible.</p>
          {error ? <p className="mobile-inline-error">{error}</p> : null}
        </section>
      ) : null}

      {mobilePanelOpen ? (
        <button
          className="mobile-backdrop"
          type="button"
          onClick={() => setMobilePanelOpen(false)}
          aria-label="Fermer le panneau"
        />
      ) : null}

      <div className="editor-workspace" ref={workspaceRef}>
        {activeTool !== 'history' ? (
          <aside className={mobilePanelOpen ? 'editor-inspector is-open' : 'editor-inspector'}>
            <div className="mobile-sheet-handle" aria-hidden="true" />
            <button
              className="mobile-panel-close"
              type="button"
              onClick={() => setMobilePanelOpen(false)}
              aria-label="Fermer les réglages"
            >
              <X aria-hidden="true" />
            </button>

            {activeTool === 'link' ? (
              <div className="link-inspector">
                <UrlShortener
                  url={url}
                  mode={mode}
                  error={error}
                  isLoading={isLoading}
                  onUrlChange={setUrl}
                  onModeChange={setMode}
                  onSubmit={handleSubmit}
                  onReset={handleResetInput}
                />
                <ResultPanel result={result} copied={copied} onCopy={() => handleCopy()} />
              </div>
            ) : (
              <QrStudioControls
                tool={activeTool}
                options={qrOptions}
                onChange={updateQrOptions}
                onReset={resetQrOptions}
                onDownloadPng={downloadPng}
                onDownloadSvg={downloadSvg}
              />
            )}
          </aside>
        ) : null}

        <main className={activeTool === 'history' ? 'workspace-main history-view' : 'workspace-main'}>
          {activeTool === 'history' ? (
            <HistoryPanel
              history={history}
              onSelect={handleSelectHistory}
              onCopy={handleCopy}
              onFavorite={toggleFavorite}
              onRemove={removeHistoryItem}
              onClear={clearHistory}
            />
          ) : (
            <QrStudioCanvas
              ref={qrStudioRef}
              value={qrValue}
              options={qrOptions}
              warnings={warnings}
            />
          )}
        </main>
      </div>

      <nav className="mobile-tool-bar" aria-label="Outils QR">
        {mobileTools.map((tool) => {
          const Icon = tool.icon
          return (
            <button
              key={tool.id}
              type="button"
              className={activeTool === tool.id && mobilePanelOpen ? 'is-active' : ''}
              onClick={() => openMobileTool(tool.id)}
            >
              <Icon aria-hidden="true" />
              <span>{tool.label}</span>
            </button>
          )
        })}
      </nav>
    </div>
  )
}

export default App
