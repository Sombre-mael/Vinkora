import Link from 'next/link'
import {
  ArrowRight,
  BarChart3,
  Link2,
  Plus,
  QrCode,
  TrendingUp,
} from 'lucide-react'
import { EmptyState } from '@/components/saas/SaasUi'
import { requireCurrentVinkoraUser } from '../../lib/auth/vinkora-user'

export default async function DashboardPage() {
  const user = await requireCurrentVinkoraUser()
  const firstName = (user.profile?.name || user.email.split('@')[0]).split(/\s+/)[0]

  return (
    <div className="dashboard-page">
      <section className="dashboard-welcome">
        <div>
          <span>Bonjour {firstName}</span>
          <h2>Votre espace Vinkora est prêt.</h2>
          <p>Créez votre première ressource pour commencer à suivre votre activité.</p>
        </div>
        <Link className="button button--primary" href="/dashboard/links/new">
          <Plus size={18} />
          Créer un lien
        </Link>
      </section>

      <section className="dashboard-grid dashboard-grid--main">
        <article className="dashboard-panel">
          <div className="dashboard-panel__head">
            <div>
              <span>Ressources</span>
              <h2>Vos liens et QR</h2>
            </div>
            <Link2 size={20} aria-hidden="true" />
          </div>
          <EmptyState
            icon={QrCode}
            title="Aucune ressource créée"
            description="Vos liens courts et QR dynamiques seront regroupés dans cet espace."
            actionLabel="Créer un lien"
            actionHref="/dashboard/links/new"
          />
        </article>

        <article className="dashboard-panel">
          <div className="dashboard-panel__head">
            <div>
              <span>Activité</span>
              <h2>Vos performances</h2>
            </div>
            <BarChart3 size={20} aria-hidden="true" />
          </div>
          <EmptyState
            icon={TrendingUp}
            title="Les premiers résultats apparaîtront ici"
            description="Aucune statistique n’est encore disponible pour votre compte."
          />
        </article>
      </section>

      <section className="dashboard-panel">
        <div className="dashboard-panel__head">
          <div>
            <span>Suivi</span>
            <h2>Un espace prêt à grandir</h2>
          </div>
          <Link className="text-link" href="/dashboard/links">
            Voir tous les liens <ArrowRight size={16} />
          </Link>
        </div>
        <EmptyState
          icon={Link2}
          title="Aucun lien à afficher"
          description="Votre classement se remplira automatiquement lorsque vos ressources seront connectées."
          actionLabel="Voir mes liens"
          actionHref="/dashboard/links"
        />
      </section>
    </div>
  )
}
