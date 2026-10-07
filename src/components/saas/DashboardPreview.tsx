import Image from 'next/image'
import { BarChart3, Link2, MousePointerClick, QrCode } from 'lucide-react'

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
            <strong>Votre espace Vinkora</strong>
          </div>
          <span className="dashboard-preview__avatar">VK</span>
        </div>
        <div className="dashboard-preview__stats">
          <div>
            <span>Liens actifs</span>
            <strong>—</strong>
            <small>En attente de données</small>
          </div>
          <div>
            <span>Clics ce mois</span>
            <strong>—</strong>
            <small>Aucun clic enregistré</small>
          </div>
          <div>
            <span>QR dynamiques</span>
            <strong>—</strong>
            <small>Prêts à être créés</small>
          </div>
        </div>
        <div className="dashboard-preview__content">
          <div className="dashboard-preview__chart">
            <span>Évolution des clics</span>
            <div className="dashboard-preview__empty">
              <BarChart3 size={24} aria-hidden="true" />
              <strong>Votre activité apparaîtra ici</strong>
              <small>Les premières données seront affichées après vos premiers clics.</small>
            </div>
          </div>
          <div className="dashboard-preview__list">
            <span>Vos ressources</span>
            <div className="dashboard-preview__empty">
              <QrCode size={24} aria-hidden="true" />
              <strong>Aucun QR créé</strong>
              <small>Créez votre première ressource depuis le Studio.</small>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
