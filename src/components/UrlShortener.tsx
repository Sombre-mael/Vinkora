import { Link2, QrCode, RefreshCw, X } from 'lucide-react'
import type { QrCreationMode } from '@/hooks/useUrlShortener'

type UrlShortenerProps = {
  url: string
  mode: QrCreationMode
  dynamicName: string
  dynamicSlug: string
  dynamicCreationEnabled: boolean
  error: string
  isLoading: boolean
  onUrlChange: (url: string) => void
  onModeChange: (mode: QrCreationMode) => void
  onDynamicNameChange: (name: string) => void
  onDynamicSlugChange: (slug: string) => void
  onSubmit: () => void
  onReset: () => void
}

export function UrlShortener({
  url,
  mode,
  dynamicName,
  dynamicSlug,
  dynamicCreationEnabled,
  error,
  isLoading,
  onUrlChange,
  onModeChange,
  onDynamicNameChange,
  onDynamicSlugChange,
  onSubmit,
  onReset,
}: UrlShortenerProps) {
  return (
    <section className="tool-panel">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Destination</p>
          <h2>Ajoutez votre lien</h2>
        </div>
        <Link2 className="panel-icon" aria-hidden="true" />
      </div>

      <p className="helper-text">
        Créez un QR statique local ou un QR dynamique modifiable pendant la bêta gratuite.
      </p>

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
          disabled={!dynamicCreationEnabled && mode !== 'dynamic'}
        >
          <RefreshCw aria-hidden="true" />
          Dynamique · Bêta
        </button>
      </div>

      {mode === 'dynamic' ? (
        <div className="dynamic-fields">
          <label className="field-label" htmlFor="dynamic-name">Nom <span>Facultatif</span></label>
          <input
            id="dynamic-name"
            className="standalone-input"
            value={dynamicName}
            maxLength={180}
            onChange={(event) => onDynamicNameChange(event.target.value)}
            placeholder="Menu, affiche, campagne…"
          />
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
              ? 'Bêta hors forfait : trois QR dynamiques non archivés par appareil.'
              : 'Les nouvelles créations sont temporairement fermées. Les QR existants restent gérables.'}
          </p>
        </div>
      ) : null}

      <label className="field-label" htmlFor="url-input">
        URL
      </label>
      <div className="input-shell">
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
          placeholder="https://exemple.com/page-importante"
        />
        {url ? (
          <button type="button" onClick={onReset} aria-label="Effacer l'URL">
            <X aria-hidden="true" />
          </button>
        ) : null}
      </div>

      {error ? <p className="inline-error">{error}</p> : null}

      <button
        className="primary-action"
        type="button"
        onClick={onSubmit}
        disabled={isLoading || (mode === 'dynamic' && !dynamicCreationEnabled)}
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
              ? dynamicCreationEnabled ? 'Créer le QR dynamique' : 'Créations temporairement fermées'
              : 'Générer le QR statique'}
          </>
        )}
      </button>
    </section>
  )
}
