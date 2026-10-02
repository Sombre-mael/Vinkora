'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import {
  Clock3,
  Download,
  ImageIcon,
  LayoutGrid,
  Link2,
  Palette,
  QrCode,
  RefreshCw,
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
import {
  DYNAMIC_QR_CHANNELS,
  type DynamicQrCampaignChannel,
} from '@/config/dynamicQrCampaigns'
import { useLinkHistory } from '@/hooks/useLinkHistory'
import { useQrCustomization } from '@/hooks/useQrCustomization'
import { type QrCreationMode, useUrlShortener } from '@/hooks/useUrlShortener'
import { readDynamicQrStudioTransfer, updateDynamicQr } from '@/services/dynamicQr'
import type { ShortenedLink } from '@/types/link'

type EditorTool = 'link' | QrEditorTool | 'history'

const desktopTools: Array<{
  id: 'link' | 'templates' | 'history'
  label: string
  icon: typeof Link2
}> = [
  { id: 'link', label: 'QR Code', icon: QrCode },
  { id: 'templates', label: 'Modèles', icon: LayoutGrid },
  { id: 'history', label: 'Historique', icon: Clock3 },
]

const appearanceTools: Array<{
  id: QrEditorTool
  label: string
  icon: typeof Link2
}> = [
  { id: 'colors', label: 'Couleurs', icon: Palette },
  { id: 'logo', label: 'Logo', icon: ImageIcon },
  { id: 'shape', label: 'Style', icon: Shapes },
]

const copyToClipboard = async (text: string) => {
  if (!navigator.clipboard) {
    throw new Error('Le presse-papiers n’est pas disponible dans ce navigateur.')
  }

  await navigator.clipboard.writeText(text)
}

function App({ dynamicBetaEnabled = false }: { dynamicBetaEnabled?: boolean }) {
  const [url, setUrl] = useState('')
  const [mode, setMode] = useState<QrCreationMode>('static')
  const [dynamicName, setDynamicName] = useState('')
  const [dynamicSlug, setDynamicSlug] = useState('')
  const [dynamicCampaignChannel, setDynamicCampaignChannel] = useState<DynamicQrCampaignChannel>('UNSPECIFIED')
  const [savingStyle, setSavingStyle] = useState(false)
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
    updateHistoryItem,
    removeHistoryItem,
    toggleFavorite,
    clearHistory,
  } = useLinkHistory()

  const qrValue = useMemo(() => result?.outputUrl ?? '', [result])
  const appearanceTool: QrEditorTool =
    activeTool === 'templates' ||
    activeTool === 'colors' ||
    activeTool === 'shape' ||
    activeTool === 'logo' ||
    activeTool === 'export'
      ? activeTool
      : 'colors'

  useEffect(() => {
    const transfer = readDynamicQrStudioTransfer()
    if (!transfer) return

    queueMicrotask(() => {
      const { qrCode, editToken } = transfer
      setUrl(qrCode.destinationUrl)
      setMode('dynamic')
      setDynamicName(qrCode.name)
      setDynamicSlug(qrCode.slug)
      setDynamicCampaignChannel(qrCode.campaignChannel)
      updateQrOptions({ ...qrCode.styleOptions, logoSrc: '', showLogo: false })
      setManualResult({
        originalUrl: qrCode.destinationUrl,
        outputUrl: qrCode.publicUrl,
        mode: 'dynamic',
        name: qrCode.name,
        campaignChannel: qrCode.campaignChannel,
        dynamicQrId: qrCode.id,
        dynamicSlug: qrCode.slug,
        editToken,
        manageUrl: `${window.location.origin}/manage/qr/${qrCode.id}#key=${editToken}`,
      })
    })
  }, [setManualResult, updateQrOptions])

  const selectDesktopTool = (tool: EditorTool) => {
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
      const nextResult = await submitUrl(url, mode, {
        name: dynamicName,
        slug: dynamicSlug,
        campaignChannel: dynamicCampaignChannel,
        qrOptions,
      })
      addHistoryItem({
        originalUrl: nextResult.originalUrl,
        shortUrl: nextResult.outputUrl,
        qrOptions,
        kind: nextResult.mode,
        name: nextResult.name,
        campaignChannel: nextResult.campaignChannel,
        dynamicQrId: nextResult.dynamicQrId,
        dynamicSlug: nextResult.dynamicSlug,
        editToken: nextResult.editToken,
        manageUrl: nextResult.manageUrl,
      })
      setActiveTool('link')
      setMobilePanelOpen(false)
      toast.success(mode === 'dynamic' ? 'QR dynamique créé.' : 'QR statique généré.')
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Une erreur est survenue.'
      toast.error(message)
    }
  }

  const handleResetInput = () => {
    setUrl('')
    setDynamicName('')
    setDynamicSlug('')
    setDynamicCampaignChannel('UNSPECIFIED')
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
    setMode(item.kind === 'dynamic' ? 'dynamic' : 'static')
    setDynamicName(item.name ?? '')
    setDynamicSlug(item.dynamicSlug ?? '')
    setDynamicCampaignChannel(item.campaignChannel ?? 'UNSPECIFIED')
    updateQrOptions(item.qrOptions)
    setManualResult({
      originalUrl: item.originalUrl,
      outputUrl: item.shortUrl,
      mode: item.kind === 'dynamic' ? 'dynamic' : 'static',
      name: item.name,
      campaignChannel: item.campaignChannel,
      dynamicQrId: item.dynamicQrId,
      dynamicSlug: item.dynamicSlug,
      editToken: item.editToken,
      manageUrl: item.manageUrl,
    })
    setActiveTool('link')
    setMobilePanelOpen(false)
    toast.success('Lien repris depuis l’historique.')
  }

  const downloadPng = () => qrStudioRef.current?.downloadPng()
  const downloadSvg = () => qrStudioRef.current?.downloadSvg()

  const saveDynamicStyle = async () => {
    if (!result?.dynamicQrId || !result.editToken) return
    setSavingStyle(true)
    try {
      await updateDynamicQr(result.dynamicQrId, result.editToken, { styleOptions: qrOptions })
      const item = history.find((entry) => entry.dynamicQrId === result.dynamicQrId)
      if (item) updateHistoryItem(item.id, { qrOptions })
      toast.success('Style dynamique enregistré sans le logo local.')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Impossible d’enregistrer le style.')
    } finally {
      setSavingStyle(false)
    }
  }

  return (
    <div className={`editor-shell vinkora-studio mode-${mode}`}>
      <header className="editor-header">
        <Link className="header-brand" href="/" aria-label="Retour à l’accueil Vinkora">
          <Image
            className="brand-logo"
            src="/brand/vinkora-logo-dark.png"
            alt="Vinkora"
            width={1580}
            height={600}
            priority
          />
        </Link>

        <div className="studio-header-title">
          <span>Studio QR</span>
          <small>{mode === 'dynamic' ? 'Campagne dynamique' : 'Création statique'}</small>
        </div>

        <button
          className="mobile-history-button"
          type="button"
          onClick={() => {
            setActiveTool(activeTool === 'history' ? 'link' : 'history')
            setMobilePanelOpen(false)
            workspaceRef.current?.scrollTo({ top: 0 })
          }}
          aria-label={activeTool === 'history' ? 'Revenir à la création' : 'Ouvrir l’historique'}
        >
          {activeTool === 'history' ? <QrCode aria-hidden="true" /> : <Clock3 aria-hidden="true" />}
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
            const isActive = tool.id === 'link'
              ? activeTool !== 'templates' && activeTool !== 'history'
              : activeTool === tool.id
            return (
              <button
                key={tool.id}
                type="button"
                className={isActive ? 'is-active' : ''}
                onClick={() => selectDesktopTool(tool.id)}
              >
                <Icon aria-hidden="true" />
                <span>{tool.label}</span>
              </button>
            )
          })}
        </nav>
      </aside>

      {activeTool !== 'history' ? (
        <section className="mobile-link-panel" aria-label="Créer un QR code">
          <div className="mobile-link-heading">
            <div>
              <small>Nouveau QR</small>
              <strong>Destination</strong>
            </div>
            <span>{mode === 'dynamic' ? 'Dynamique · Bêta' : 'Statique · Local'}</span>
          </div>
          <div className="mobile-mode-switch" aria-label="Mode de génération">
            <button
              type="button"
              className={mode === 'static' ? 'is-active' : ''}
              onClick={() => setMode('static')}
            >
              <QrCode aria-hidden="true" />
              <span>QR statique</span>
            </button>
            <button
              type="button"
              className={mode === 'dynamic' ? 'is-active' : ''}
              onClick={() => setMode('dynamic')}
            >
              <RefreshCw aria-hidden="true" />
              <span>QR dynamique</span>
            </button>
          </div>
          <div className="mobile-link-form">
            <div className="mobile-url-input">
              <Link2 aria-hidden="true" />
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
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isLoading || (mode === 'dynamic' && !dynamicBetaEnabled)}
            >
              {isLoading ? 'Patientez…' : mode === 'dynamic' && !dynamicBetaEnabled ? 'Fermée' : 'Générer'}
            </button>
          </div>
          {mode === 'dynamic' ? (
            <div className="mobile-dynamic-fields">
              <label>
                <span>Campagne</span>
                <input
                  value={dynamicName}
                  maxLength={180}
                  onChange={(event) => setDynamicName(event.target.value)}
                  placeholder="Menu été, affiche…"
                />
              </label>
              <label>
                <span>Support</span>
                <select
                  value={dynamicCampaignChannel}
                  onChange={(event) => setDynamicCampaignChannel(event.target.value as DynamicQrCampaignChannel)}
                >
                  {DYNAMIC_QR_CHANNELS.map((channel) => (
                    <option key={channel.id} value={channel.id}>{channel.label}</option>
                  ))}
                </select>
              </label>
              <label className="mobile-dynamic-slug">
                <span>Adresse personnalisée</span>
                <input
                  value={dynamicSlug}
                  maxLength={40}
                  onChange={(event) => setDynamicSlug(event.target.value)}
                  placeholder="/q/menu-ete"
                />
              </label>
            </div>
          ) : null}
          <p className="mobile-feature-note">
            {mode === 'dynamic'
              ? dynamicBetaEnabled
                ? 'Bêta gratuite hors forfait · 3 QR par appareil.'
                : 'Les nouvelles créations sont temporairement fermées.'
              : 'QR statique gratuit et local.'}
          </p>
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

      <div
        className={activeTool === 'history' ? 'editor-workspace is-history' : 'editor-workspace'}
        ref={workspaceRef}
      >
        {activeTool !== 'history' ? (
          <>
            <aside className="desktop-destination-panel" aria-label="Destination du QR code">
              <div className="link-inspector">
                <UrlShortener
                  url={url}
                  mode={mode}
                  dynamicName={dynamicName}
                  dynamicSlug={dynamicSlug}
                  dynamicCampaignChannel={dynamicCampaignChannel}
                  dynamicCreationEnabled={dynamicBetaEnabled}
                  error={error}
                  isLoading={isLoading}
                  onUrlChange={setUrl}
                  onModeChange={setMode}
                  onDynamicNameChange={setDynamicName}
                  onDynamicSlugChange={setDynamicSlug}
                  onDynamicCampaignChannelChange={setDynamicCampaignChannel}
                  onSubmit={handleSubmit}
                  onReset={handleResetInput}
                />
                <ResultPanel
                  result={result}
                  copied={copied}
                  onCopy={() => handleCopy()}
                  onSaveStyle={result?.mode === 'dynamic' ? saveDynamicStyle : undefined}
                  savingStyle={savingStyle}
                />
              </div>
            </aside>

            <main className="workspace-main">
              <QrStudioCanvas
                ref={qrStudioRef}
                value={qrValue}
                mode={mode}
                options={qrOptions}
                warnings={warnings}
              />
            </main>

            <aside className="desktop-appearance-panel" aria-label="Apparence du QR code">
              <div className="appearance-panel-header">
                <span>Apparence</span>
                <div className="appearance-tabs" role="tablist" aria-label="Réglages d’apparence">
                  {appearanceTools.map((tool) => (
                    <button
                      key={tool.id}
                      type="button"
                      role="tab"
                      aria-selected={appearanceTool === tool.id}
                      className={appearanceTool === tool.id ? 'is-active' : ''}
                      onClick={() => selectDesktopTool(tool.id)}
                    >
                      {tool.label}
                    </button>
                  ))}
                </div>
              </div>
              <QrStudioControls
                tool={appearanceTool}
                options={qrOptions}
                onChange={updateQrOptions}
                onReset={resetQrOptions}
                onDownloadPng={downloadPng}
                onDownloadSvg={downloadSvg}
              />
            </aside>

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
              <QrStudioControls
                tool={appearanceTool}
                options={qrOptions}
                onChange={updateQrOptions}
                onReset={resetQrOptions}
                onDownloadPng={downloadPng}
                onDownloadSvg={downloadSvg}
              />
            </aside>
          </>
        ) : (
          <main className="workspace-main history-view">
            <HistoryPanel
              history={history}
              onSelect={handleSelectHistory}
              onCopy={handleCopy}
              onFavorite={toggleFavorite}
              onRemove={removeHistoryItem}
              onClear={clearHistory}
            />
          </main>
        )}
      </div>

      {activeTool !== 'history' ? (
        <section className="mobile-studio-actions" aria-label="Personnalisation et export">
          <div className="mobile-appearance-actions">
            <button
              type="button"
              className={activeTool === 'templates' && mobilePanelOpen ? 'is-active' : ''}
              onClick={() => openMobileTool('templates')}
            >
              <LayoutGrid aria-hidden="true" />
              <span>Modèles</span>
            </button>
            {appearanceTools.map((tool) => {
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
          </div>
          <button
            className="mobile-export-action"
            type="button"
            disabled={!qrValue}
            onClick={() => openMobileTool('export')}
          >
            <Download aria-hidden="true" />
            Exporter
          </button>
        </section>
      ) : null}
    </div>
  )
}

export default App
