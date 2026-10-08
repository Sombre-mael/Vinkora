'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Activity,
  AlertTriangle,
  Archive,
  Check,
  Clock3,
  Copy,
  ExternalLink,
  Globe2,
  KeyRound,
  Languages,
  Laptop,
  LoaderCircle,
  MapPin,
  MonitorSmartphone,
  MousePointerClick,
  Pause,
  Play,
  RefreshCw,
  Save,
  Users,
} from 'lucide-react'
import { FormEvent, useCallback, useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import {
  getDynamicQr,
  getDynamicQrAnalytics,
  queueDynamicQrForStudio,
  updateDynamicQr,
} from '@/services/dynamicQr'
import type { DynamicQrAnalytics, DynamicQrResource, DynamicQrStatus } from '@/types/dynamicQr'
import {
  DYNAMIC_QR_CHANNELS,
  getDynamicQrChannelLabel,
  type DynamicQrCampaignChannel,
} from '@/config/dynamicQrCampaigns'

const tokenStorageKey = (id: string) => `vinkora-dynamic-qr-key:${id}`

export function DynamicQrManager({ id, embedded = false }: { id: string; embedded?: boolean }) {
  const router = useRouter()
  const [editToken] = useState(() => readBrowserEditToken(id))
  const [qrCode, setQrCode] = useState<DynamicQrResource | null>(null)
  const [analytics, setAnalytics] = useState<DynamicQrAnalytics | null>(null)
  const [destinationUrl, setDestinationUrl] = useState('')
  const [name, setName] = useState('')
  const [campaignChannel, setCampaignChannel] = useState<DynamicQrCampaignChannel>('UNSPECIFIED')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState<'public' | 'manage' | null>(null)
  const [feedback, setFeedback] = useState('')

  const load = useCallback(async (token?: string) => {
    setLoading(true)
    setError('')
    try {
      const [resource, stats] = await Promise.all([
        getDynamicQr(id, token),
        getDynamicQrAnalytics(id, token),
      ])
      setQrCode(resource)
      setAnalytics(stats)
      setDestinationUrl(resource.destinationUrl)
      setName(resource.name)
      setCampaignChannel(resource.campaignChannel)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Impossible de charger ce QR dynamique.')
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    const hashToken = new URLSearchParams(window.location.hash.replace(/^#/, '')).get('key') ?? ''

    if (hashToken) {
      window.localStorage.setItem(tokenStorageKey(id), hashToken)
      window.history.replaceState(null, '', window.location.pathname)
    }

    queueMicrotask(() => void load(editToken || undefined))
  }, [editToken, id, load])

  const manageUrl = useMemo(() => {
    if (typeof window === 'undefined') return ''
    return editToken
      ? `${window.location.origin}/manage/qr/${id}#key=${editToken}`
      : `${window.location.origin}/manage/qr/${id}`
  }, [editToken, id])

  async function saveDestination(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSaving(true)
    try {
      const updated = await updateDynamicQr(id, editToken || undefined, {
        destinationUrl,
        name,
        campaignChannel,
      })
      setQrCode(updated)
      setDestinationUrl(updated.destinationUrl)
      setName(updated.name)
      setCampaignChannel(updated.campaignChannel)
      setFeedback('Destination enregistrée. Votre QR imprimé reste identique.')
      toast.success('Destination mise à jour. Le QR imprimé reste identique.')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'La mise à jour a échoué.')
    } finally {
      setSaving(false)
    }
  }

  async function setStatus(status: DynamicQrStatus) {
    setSaving(true)
    try {
      const updated = await updateDynamicQr(id, editToken || undefined, { status })
      setQrCode(updated)
      const message = status === 'ACTIVE' ? 'QR réactivé.' : status === 'SUSPENDED' ? 'QR suspendu.' : 'QR archivé.'
      setFeedback(message)
      toast.success(message)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Le changement d’état a échoué.')
    } finally {
      setSaving(false)
    }
  }

  async function copy(value: string, type: 'public' | 'manage') {
    try {
      await navigator.clipboard.writeText(value)
      setCopied(type)
      setFeedback(type === 'manage' ? 'Lien de gestion copié.' : 'Lien public copié.')
      window.setTimeout(() => setCopied(null), 1500)
      toast.success(type === 'manage' ? 'Lien de gestion copié.' : 'Lien public copié.')
    } catch {
      toast.error('Impossible de copier automatiquement.')
    }
  }

  function openInStudio() {
    if (!qrCode) return
    queueDynamicQrForStudio(qrCode, editToken || undefined)
    router.push('/studio?resume=dynamic')
  }

  if (loading) {
    return (
      <div className={`dynamic-manage-page dynamic-manage-state${embedded ? ' is-embedded' : ''}`}>
        <LoaderCircle className="spin" aria-hidden="true" />
        <h1>Chargement de votre QR dynamique</h1>
        <p>Ouverture de votre espace de gestion.</p>
      </div>
    )
  }

  if (error || !qrCode || !analytics) {
    return (
      <div className={`dynamic-manage-page dynamic-manage-state${embedded ? ' is-embedded' : ''}`}>
        <AlertTriangle aria-hidden="true" />
        <h1>Accès au QR impossible</h1>
        <p>{error || 'Ce QR dynamique est introuvable.'}</p>
        <Link className="button button--primary" href="/studio">Retour au Studio</Link>
      </div>
    )
  }

  return (
    <div className={`dynamic-manage-page${embedded ? ' is-embedded' : ''}`}>
      <header className="dynamic-manage-header">
        {!embedded ? (
          <Link href="/" className="dynamic-manage-brand">
            <Image
              src="/brand/vinkora-symbol.png"
              alt=""
              width={512}
              height={512}
              aria-hidden="true"
            />
            <span>Vinkora</span>
          </Link>
        ) : null}
        <div>
          <span className="dynamic-beta-label">QR dynamique du compte</span>
          <h1>{qrCode.name}</h1>
          <p>{getDynamicQrChannelLabel(qrCode.campaignChannel)} · Modifiez la destination sans réimprimer votre QR.</p>
        </div>
        <button className="button button--primary" type="button" onClick={openInStudio}>
          Personnaliser dans le Studio
        </button>
      </header>

      {feedback ? (
        <p className="dynamic-inline-feedback" role="status" aria-live="polite">
          <Check size={17} aria-hidden="true" /> {feedback}
        </p>
      ) : null}

      <section className="dynamic-link-bar" aria-label="Liens du QR dynamique">
        <div>
          <small>Lien public</small>
          <strong>{qrCode.publicUrl}</strong>
        </div>
        <button type="button" onClick={() => copy(qrCode.publicUrl, 'public')}>
          {copied === 'public' ? <Check /> : <Copy />} Copier
        </button>
        <a href={qrCode.publicUrl} target="_blank" rel="noreferrer">
          <ExternalLink /> Tester
        </a>
      </section>

      <div className="dynamic-manage-grid">
        <form className="dynamic-manage-panel" onSubmit={saveDestination}>
          <div className="dynamic-panel-heading">
            <div><span>Destination</span><h2>Contenu du QR</h2></div>
            <StatusBadge status={qrCode.status} />
          </div>
          <label htmlFor="manage-name">Campagne</label>
          <input id="manage-name" value={name} maxLength={180} onChange={(event) => setName(event.target.value)} />
          <label htmlFor="manage-channel">Support de diffusion</label>
          <select
            id="manage-channel"
            value={campaignChannel}
            onChange={(event) => setCampaignChannel(event.target.value as DynamicQrCampaignChannel)}
          >
            {DYNAMIC_QR_CHANNELS.map((channel) => (
              <option key={channel.id} value={channel.id}>{channel.label}</option>
            ))}
          </select>
          <label htmlFor="manage-destination">URL de destination</label>
          <input
            id="manage-destination"
            type="url"
            inputMode="url"
            value={destinationUrl}
            onChange={(event) => setDestinationUrl(event.target.value)}
            required
          />
          <button className="button button--primary" type="submit" disabled={saving}>
            <Save /> {saving ? 'Enregistrement…' : 'Enregistrer la destination'}
          </button>
          <p className="dynamic-form-note">Le motif du QR et son lien public ne changent pas.</p>
        </form>

        <section className="dynamic-manage-panel">
          <div className="dynamic-panel-heading">
            <div><span>Contrôle</span><h2>État et accès</h2></div>
            <KeyRound aria-hidden="true" />
          </div>
          <div className="dynamic-status-actions">
            <button type="button" onClick={() => setStatus('ACTIVE')} disabled={saving || qrCode.status === 'ACTIVE'}>
              <Play /> Activer
            </button>
            <button type="button" onClick={() => setStatus('SUSPENDED')} disabled={saving || qrCode.status === 'SUSPENDED'}>
              <Pause /> Suspendre
            </button>
            <button type="button" onClick={() => setStatus('ARCHIVED')} disabled={saving || qrCode.status === 'ARCHIVED'}>
              <Archive /> Archiver
            </button>
          </div>
          <button className="dynamic-secret-link" type="button" onClick={() => copy(manageUrl, 'manage')}>
            {copied === 'manage' ? <Check /> : <Copy />}
            Copier le lien de gestion
          </button>
          {editToken ? (
            <p className="dynamic-warning">Cet ancien QR utilise encore une clé privée. Gardez ce lien confidentiel.</p>
          ) : (
            <p className="dynamic-warning">La gestion reste accessible depuis votre compte Vinkora.</p>
          )}
        </section>
      </div>

      <section className="dynamic-stats-grid" aria-label="Statistiques principales">
        <Metric icon={MousePointerClick} label="Scans valides totaux" value={analytics.totalScans.toLocaleString('fr-FR')} />
        <Metric icon={Activity} label="Scans sur 30 jours" value={analytics.analyzedScans.toLocaleString('fr-FR')} />
        <Metric icon={Users} label="Visiteurs estimés" value={analytics.estimatedUniqueVisitors.toLocaleString('fr-FR')} />
        <Metric icon={RefreshCw} label="Scans récurrents" value={analytics.returningScans.toLocaleString('fr-FR')} />
        <Metric icon={Globe2} label="Données identifiées" value={`${analytics.dataCompleteness}%`} />
        <Metric icon={MonitorSmartphone} label="Robots détectés" value={analytics.botScans.toLocaleString('fr-FR')} />
      </section>

      <section className="dynamic-manage-panel dynamic-chart-panel">
        <div className="dynamic-panel-heading">
          <div><span>30 derniers jours</span><h2>Évolution des scans</h2></div>
          <span>{analytics.lastScanAt ? `Dernier scan ${formatDateTime(analytics.lastScanAt)}` : 'Aucun scan'}</span>
        </div>
        <DailyChart analytics={analytics} />
      </section>

      <section className="dynamic-breakdown-grid">
        <Breakdown title="Pays" icon={MapPin} items={analytics.countries} />
        <Breakdown title="Régions" icon={MapPin} items={analytics.regions} />
        <Breakdown title="Villes" icon={MapPin} items={analytics.cities} />
        <Breakdown title="Appareils" icon={MonitorSmartphone} items={analytics.devices} />
        <Breakdown title="Systèmes" icon={Laptop} items={analytics.operatingSystems} />
        <Breakdown title="Navigateurs" icon={Activity} items={analytics.browsers} />
        <Breakdown title="Langues" icon={Languages} items={analytics.languages} />
        <Breakdown title="Heures locales" icon={Clock3} items={analytics.localHours} />
        <Breakdown title="Jours actifs" icon={Clock3} items={analytics.localWeekdays} />
        <Breakdown title="Référents" icon={ExternalLink} items={analytics.referrers} />
      </section>

      <footer className="dynamic-manage-footer">
        <p>Données détaillées conservées 30 jours. Aucune adresse IP brute ni User-Agent complet n’est stocké.</p>
        <Link href="/privacy">Confidentialité</Link>
      </footer>
    </div>
  )
}

function StatusBadge({ status }: { status: DynamicQrStatus }) {
  const labels = { ACTIVE: 'Actif', SUSPENDED: 'Suspendu', ARCHIVED: 'Archivé' }
  return <span className={`dynamic-status dynamic-status--${status.toLowerCase()}`}>{labels[status]}</span>
}

function Metric({ icon: Icon, label, value }: { icon: typeof Activity; label: string; value: string }) {
  return <article><Icon aria-hidden="true" /><div><span>{label}</span><strong>{value}</strong></div></article>
}

function DailyChart({ analytics }: { analytics: DynamicQrAnalytics }) {
  const maximum = Math.max(1, ...analytics.daily.map((item) => item.scans))
  if (!analytics.daily.length) return <div className="dynamic-empty-chart">Les premiers scans apparaîtront ici.</div>
  return (
    <div className="dynamic-chart" aria-label="Scans quotidiens">
      {analytics.daily.map((item) => (
        <div key={item.date} title={`${item.scans} scans le ${item.date}`}>
          <i style={{ height: `${Math.max(8, (item.scans / maximum) * 100)}%` }} />
          <span>{new Date(`${item.date}T00:00:00`).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })}</span>
        </div>
      ))}
    </div>
  )
}

function Breakdown({ title, icon: Icon, items }: {
  title: string
  icon: typeof Activity
  items: DynamicQrAnalytics['countries']
}) {
  const total = Math.max(1, items.reduce((sum, item) => sum + item.value, 0))
  return (
    <article className="dynamic-manage-panel dynamic-breakdown">
      <div className="dynamic-panel-heading"><h2>{title}</h2><Icon aria-hidden="true" /></div>
      {items.length ? items.map((item) => (
        <div key={item.label}>
          <span>{item.label}</span><strong>{item.value}</strong>
          <i><b style={{ width: `${(item.value / total) * 100}%` }} /></i>
        </div>
      )) : <p>Aucune donnée disponible.</p>}
    </article>
  )
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat('fr-FR', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value))
}

function readBrowserEditToken(id: string) {
  if (typeof window === 'undefined') return ''
  const hashToken = new URLSearchParams(window.location.hash.replace(/^#/, '')).get('key') ?? ''
  return hashToken || window.localStorage.getItem(tokenStorageKey(id)) || ''
}
