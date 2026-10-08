import { Link2, QrCode, RefreshCw, X } from 'lucide-react'
import type { QrCreationMode } from '@/hooks/useUrlShortener'
import {
  DYNAMIC_QR_CHANNELS,
  type DynamicQrCampaignChannel,
} from '@/config/dynamicQrCampaigns'

type UrlShortenerProps = {
  url: string
  mode: QrCreationMode
  dynamicName: string
  dynamicSlug: string
  dynamicCampaignChannel: DynamicQrCampaignChannel
  dynamicCreationEnabled: boolean
  dynamicAccessPending: boolean
  error: string
  isLoading: boolean
  onUrlChange: (url: string) => void
  onModeChange: (mode: QrCreationMode) => void
  onDynamicNameChange: (name: string) => void
  onDynamicSlugChange: (slug: string) => void
  onDynamicCampaignChannelChange: (channel: DynamicQrCampaignChannel) => void
  onSubmit: () => void
  onReset: () => void
}

export function UrlShortener({
  url,
  mode,
  dynamicName,
  dynamicSlug,
  dynamicCampaignChannel,
  dynamicCreationEnabled,
  dynamicAccessPending,
  error,
  isLoading,
  onUrlChange,
  onModeChange,
  onDynamicNameChange,
  onDynamicSlugChange,
  onDynamicCampaignChannelChange,
  onSubmit,
  onReset,
}: UrlShortenerProps) {
  return (
    <section className="tool-panel">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Nouveau QR</p>
          <h2>Destination</h2>
        </div>
        <Link2 className="panel-icon" aria-hidden="true" />
      </div>

      <p className="helper-text">Indiquez l’adresse vers laquelle votre QR doit mener.</p>

      <label className="field-label" htmlFor="url-input">URL de destination</label>
      <div className="input-shell">
        <Link2 aria-hidden="true" />
        <input
          id="url-input"
          type="url"
          value={url}
          onChange={(event) => onUrlChange(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              onSubmit()
            }
          }}
          placeholder="https://exemple.com"
        />
        {url ? (
          <button type="button" onClick={onReset} aria-label="Effacer l'URL">
            <X aria-hidden="true" />
          </button>
        ) : null}
      </div>

      {error ? <p className="inline-error">{error}</p> : null}

      {mode === 'dynamic' ? (
        <div className="dynamic-fields">
          <label className="field-label" htmlFor="dynamic-name">Nom de la campagne <span>Facultatif</span></label>
          <input
            id="dynamic-name"
            className="standalone-input"
            value={dynamicName}
            maxLength={180}
            onChange={(event) => onDynamicNameChange(event.target.value)}
            placeholder="Menu été, lancement, événement…"
          />
          <label className="field-label" htmlFor="dynamic-channel">Support <span>Facultatif</span></label>
          <select
            id="dynamic-channel"
            className="standalone-input"
            value={dynamicCampaignChannel}
            onChange={(event) => onDynamicCampaignChannelChange(event.target.value as DynamicQrCampaignChannel)}
          >
            {DYNAMIC_QR_CHANNELS.map((channel) => (
              <option key={channel.id} value={channel.id}>{channel.label}</option>
            ))}
          </select>
          <label className="field-label" htmlFor="dynamic-slug">Slug personnalisé <span>Facultatif</span></label>
          <div className="slug-input-shell">
            <span>/q/</span>
            <input
              id="dynamic-slug"
              value={dynamicSlug}
              maxLength={40}
              onChange={(event) => onDynamicSlugChange(event.target.value)}
              placeholder="menu-ete"
            />
          </div>
          <p className="beta-note">
            {dynamicCreationEnabled
              ? 'Un QR dynamique est inclus avec votre compte.'
              : dynamicAccessPending
                ? 'Vérification de votre compte…'
                : 'Connectez-vous pour créer votre QR dynamique inclus.'}
          </p>
        </div>
      ) : null}

      <div className="mode-switch" aria-label="Mode de génération">
        <button
          type="button"
          className={mode === 'static' ? 'is-active' : ''}
          onClick={() => onModeChange('static')}
        >
          <QrCode aria-hidden="true" />
          QR statique
        </button>
        <button
          type="button"
          className={mode === 'dynamic' ? 'is-active' : ''}
          onClick={() => onModeChange('dynamic')}
        >
          <RefreshCw aria-hidden="true" />
          QR dynamique
          <span className="beta-chip">Compte</span>
        </button>
      </div>

      <button
        className="primary-action"
        type="button"
        onClick={onSubmit}
        disabled={isLoading || (mode === 'dynamic' && dynamicAccessPending)}
      >
        {isLoading ? (
          <>
            <span className="spinner" aria-hidden="true" />
            Création...
          </>
        ) : (
          <>
            {mode === 'dynamic' ? <RefreshCw aria-hidden="true" /> : <QrCode aria-hidden="true" />}
            {mode === 'dynamic'
              ? dynamicAccessPending
                ? 'Vérification du compte'
                : dynamicCreationEnabled
                  ? 'Créer le QR dynamique'
                  : 'Se connecter pour continuer'
              : 'Générer le QR statique'}
          </>
        )}
      </button>
    </section>
  )
}
