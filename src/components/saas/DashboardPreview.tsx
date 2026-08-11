import Image from 'next/image'
import { BarChart3, Link2, MousePointerClick, MoreHorizontal, TrendingUp } from 'lucide-react'

const bars = [36, 52, 43, 68, 58, 82, 74]

export function DashboardPreview() {
  return (
    <div className="dashboard-preview" aria-label="Aperçu du futur tableau de bord Vinkora">
      <aside className="dashboard-preview__rail" aria-hidden="true">
        <Image src="/brand/vinkora-symbol.png" alt="" width={35} height={35} />
        <span className="is-active">
          <BarChart3 size={17} />
        </span>
        <span>
          <Link2 size={17} />
        </span>
        <span>
          <MousePointerClick size={17} />
        </span>
      </aside>
      <div className="dashboard-preview__body">
        <div className="dashboard-preview__header">
          <div>
            <span>Vue d’ensemble</span>
            <strong>Bonjour, bienvenue sur Vinkora</strong>
          </div>
          <span className="dashboard-preview__avatar">SM</span>
        </div>
        <div className="dashboard-preview__stats">
          <div>
            <span>Liens actifs</span>
            <strong>24</strong>
            <small>
              <TrendingUp size={12} /> +12 %
            </small>
          </div>
          <div>
            <span>Clics ce mois</span>
            <strong>2 819</strong>
            <small>
              <TrendingUp size={12} /> +18 %
            </small>
          </div>
          <div>
            <span>Taux mobile</span>
            <strong>72 %</strong>
            <small>Sur tous les clics</small>
          </div>
        </div>
        <div className="dashboard-preview__content">
          <div className="dashboard-preview__chart">
            <span>Évolution des clics</span>
            <div>
              {bars.map((height, index) => (
                <i key={index} style={{ height: `${height}%` }} />
              ))}
            </div>
          </div>
          <div className="dashboard-preview__list">
            <span>Liens performants</span>
            {['Menu été 2026', 'Instagram juillet', 'Catalogue'].map((label, index) => (
              <div key={label}>
                <i>{index + 1}</i>
                <b>{label}</b>
                <small>{[1248, 863, 291][index]} clics</small>
                <MoreHorizontal size={14} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
