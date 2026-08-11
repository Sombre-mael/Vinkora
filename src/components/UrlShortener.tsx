import { Link2, QrCode, Scissors, X } from 'lucide-react'
import type { ShortenMode } from '@/hooks/useUrlShortener'

type UrlShortenerProps = {
  url: string
  mode: ShortenMode
  error: string
  isLoading: boolean
  onUrlChange: (url: string) => void
  onModeChange: (mode: ShortenMode) => void
  onSubmit: () => void
  onReset: () => void
}

export function UrlShortener({
  url,
  mode,
  error,
  isLoading,
  onUrlChange,
  onModeChange,
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
        Créez gratuitement un QR statique. Les liens courts Vinkora arriveront avec Pass Événement et Starter.
      </p>

      <div className="mode-switch" aria-label="Mode de génération">
        <button
          type="button"
          className={mode === 'shorten' ? 'is-active' : ''}
          disabled
          title="Disponible prochainement avec une offre payante"
        >
          <Scissors aria-hidden="true" />
          Lien court · bientôt
        </button>
        <button
          type="button"
          className={mode === 'qr-only' ? 'is-active' : ''}
          onClick={() => onModeChange('qr-only')}
        >
          <QrCode aria-hidden="true" />
          QR seulement
        </button>
      </div>

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
        disabled={isLoading || mode === 'shorten'}
      >
        {isLoading ? (
          <>
            <span className="spinner" aria-hidden="true" />
            Raccourcissement...
          </>
        ) : mode === 'shorten' ? (
          <>
            <Scissors aria-hidden="true" />
            Bientôt disponible
          </>
        ) : (
          <>
            <QrCode aria-hidden="true" />
            Générer le QR code
          </>
        )}
      </button>
    </section>
  )
}
