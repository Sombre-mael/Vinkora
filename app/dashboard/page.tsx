import Link from 'next/link'
import {
  ArrowRight,
  BarChart3,
  Link2,
  QrCode,
  TrendingUp,
} from 'lucide-react'
import { EmptyState } from '@/components/saas/SaasUi'
import { requireCurrentVinkoraUser } from '../../lib/auth/vinkora-user'
import { getPrisma } from '../../lib/prisma'

export default async function DashboardPage() {
  const user = await requireCurrentVinkoraUser()
  const firstName = (user.profile?.name || user.email.split('@')[0]).split(/\s+/)[0]
  const qrCode = await getPrisma().qrCode.findFirst({
    where: { ownerId: user.id },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      name: true,
      slug: true,
      destinationUrl: true,
      clickCount: true,
      status: true,
      lastClickedAt: true,
    },
  })

  return (
    <div className="dashboard-page">
      <section className="dashboard-welcome">
        <div>
          <span>Bonjour {firstName}</span>
          <h2>Votre espace Vinkora est prêt.</h2>
          <p>Créez votre première ressource pour commencer à suivre votre activité.</p>
        </div>
        <Link className="button button--primary" href="/studio">
          <QrCode size={18} />
          Ouvrir le Studio
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
          {qrCode ? (
            <div className="account-qr-summary">
              <div>
                <span className="account-qr-summary__icon"><QrCode aria-hidden="true" /></span>
                <div>
                  <strong>{qrCode.name}</strong>
                  <span>/q/{qrCode.slug}</span>
                  <small>{qrCode.destinationUrl}</small>
                </div>
              </div>
              <dl>
                <div><dt>État</dt><dd>{qrCode.status === 'ACTIVE' ? 'Actif' : qrCode.status === 'SUSPENDED' ? 'En pause' : 'Archivé'}</dd></div>
                <div><dt>Scans</dt><dd>{qrCode.clickCount.toLocaleString('fr-FR')}</dd></div>
              </dl>
              <Link className="button button--secondary" href={`/manage/qr/${qrCode.id}`}>Gérer le QR</Link>
            </div>
          ) : (
            <EmptyState
              icon={QrCode}
              title="Aucune ressource créée"
              description="Votre QR dynamique apparaîtra ici après sa création."
              actionLabel="Ouvrir le Studio"
              actionHref="/studio"
            />
          )}
        </article>

        <article className="dashboard-panel">
          <div className="dashboard-panel__head">
            <div>
              <span>Activité</span>
              <h2>Vos performances</h2>
            </div>
            <BarChart3 size={20} aria-hidden="true" />
          </div>
          {qrCode ? (
            <div className="account-activity-summary">
              <strong>{qrCode.clickCount.toLocaleString('fr-FR')}</strong>
              <span>scans enregistrés</span>
              <small>{qrCode.lastClickedAt ? `Dernier scan ${new Intl.DateTimeFormat('fr-FR', { dateStyle: 'medium', timeStyle: 'short' }).format(qrCode.lastClickedAt)}` : 'Aucun scan pour le moment'}</small>
              <Link className="text-link" href={`/manage/qr/${qrCode.id}`}>Voir les statistiques <ArrowRight size={16} /></Link>
            </div>
          ) : (
            <EmptyState
              icon={TrendingUp}
              title="Les premiers résultats apparaîtront ici"
              description="Aucune statistique n’est encore disponible pour votre compte."
            />
          )}
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
        {qrCode ? (
          <div className="account-resource-line">
            <div><strong>{qrCode.name}</strong><span>/q/{qrCode.slug}</span></div>
            <strong>{qrCode.clickCount.toLocaleString('fr-FR')} scans</strong>
            <Link href={`/manage/qr/${qrCode.id}`} aria-label={`Gérer ${qrCode.name}`}><ArrowRight /></Link>
          </div>
        ) : (
          <EmptyState
            icon={Link2}
            title="Aucun lien à afficher"
            description="Votre QR dynamique apparaîtra ici après sa création."
            actionLabel="Voir mes liens"
            actionHref="/dashboard/links"
          />
        )}
      </section>
    </div>
  )
}
