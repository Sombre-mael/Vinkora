import { Check, Copy, ExternalLink, KeyRound, Save } from 'lucide-react'
import type { ShortenResult } from '@/hooks/useUrlShortener'

type ResultPanelProps = {
  result: ShortenResult | null
  copied: boolean
  activityMessage?: string
  onCopy: () => void
  onSaveStyle?: () => void
  savingStyle?: boolean
}

export function ResultPanel({ result, copied, activityMessage, onCopy, onSaveStyle, savingStyle }: ResultPanelProps) {
  if (!result) {
    return (
      <section className="tool-panel muted-panel">
        <p className="eyebrow">Résultat</p>
        <h2>Votre lien apparaîtra ici</h2>
        <p>
          Après génération, vous pourrez copier le lien et personnaliser immédiatement le QR code.
        </p>
      </section>
    )
  }

  const isDynamic = result.mode === 'dynamic'
  const label = isDynamic ? 'Adresse dynamique' : 'Lien original'

  return (
    <section className="tool-panel result-panel is-revealed">
      <div className="section-heading">
        <div>
          <p className="eyebrow">{label}</p>
          <h2>{isDynamic ? 'QR modifiable prêt' : 'QR statique prêt'}</h2>
        </div>
        <Check className="panel-icon success" aria-hidden="true" />
      </div>

      <a className="result-link" href={result.outputUrl} target="_blank" rel="noreferrer">
        {result.outputUrl}
        <ExternalLink aria-hidden="true" />
      </a>

      <button className="secondary-action" type="button" onClick={onCopy}>
        {copied ? <Check aria-hidden="true" /> : <Copy aria-hidden="true" />}
        {copied ? 'Copié' : 'Copier'}
      </button>

      {activityMessage ? (
        <p className="studio-activity-feedback" role="status" aria-live="polite">
          <Check size={16} aria-hidden="true" />
          {activityMessage}
        </p>
      ) : null}

      {isDynamic && result.manageUrl ? (
        <div className="dynamic-result-actions">
          <a className="secondary-action" href={result.manageUrl}>
            <KeyRound aria-hidden="true" /> Gérer et voir les statistiques
          </a>
          {onSaveStyle ? (
            <button className="secondary-action" type="button" onClick={onSaveStyle} disabled={savingStyle}>
              <Save aria-hidden="true" /> {savingStyle ? 'Enregistrement…' : 'Enregistrer le style'}
            </button>
          ) : null}
          {result.editToken ? (
            <details className="dynamic-edit-key">
              <summary>Afficher la clé secrète d’édition</summary>
              <code>{result.editToken}</code>
            </details>
          ) : null}
          {result.editToken ? (
            <p>Conservez le lien de gestion : Vinkora ne peut pas récupérer votre clé secrète.</p>
          ) : null}
        </div>
      ) : null}
    </section>
  )
}
