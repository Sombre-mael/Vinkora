import { Copy, Heart, RotateCcw, Trash2 } from 'lucide-react'
import type { ShortenedLink } from '@/types/link'

type HistoryPanelProps = {
  history: ShortenedLink[]
  onSelect: (item: ShortenedLink) => void
  onCopy: (url: string) => void
  onFavorite: (id: string) => void
  onRemove: (id: string) => void
  onClear: () => void
}

const formatDate = (value: string) => {
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value))
}

export function HistoryPanel({
  history,
  onSelect,
  onCopy,
  onFavorite,
  onRemove,
  onClear,
}: HistoryPanelProps) {
  return (
    <section className="history-panel">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Historique local</p>
          <h2>Vos derniers liens restent dans ce navigateur.</h2>
        </div>
        {history.length ? (
          <button className="ghost-action" type="button" onClick={onClear}>
            Tout vider
          </button>
        ) : null}
      </div>

      {history.length === 0 ? (
        <p className="empty-state">Aucun lien pour le moment. Créez un lien ou un QR code pour remplir l&apos;historique.</p>
      ) : (
        <div className="history-list">
          {history.map((item) => (
            <article className="history-item" key={item.id}>
              <button className="history-main" type="button" onClick={() => onSelect(item)}>
                <span>{item.shortUrl}</span>
                <small>{formatDate(item.createdAt)}</small>
              </button>
              <div className="history-actions">
                <button type="button" onClick={() => onSelect(item)} aria-label="Reprendre ce QR">
                  <RotateCcw aria-hidden="true" />
                </button>
                <button type="button" onClick={() => onCopy(item.shortUrl)} aria-label="Copier ce lien">
                  <Copy aria-hidden="true" />
                </button>
                <button
                  type="button"
                  className={item.favorite ? 'is-favorite' : ''}
                  onClick={() => onFavorite(item.id)}
                  aria-label="Marquer comme favori"
                >
                  <Heart aria-hidden="true" />
                </button>
                <button type="button" onClick={() => onRemove(item.id)} aria-label="Supprimer ce lien">
                  <Trash2 aria-hidden="true" />
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  )
}
