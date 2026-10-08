import { BarChart3, Bot, ScanLine, Users } from 'lucide-react'
import { BreakdownList } from '@/components/saas/BreakdownList'
import { EmptyState, SectionHeading, StatCard } from '@/components/saas/SaasUi'
import { TrendChart } from '@/components/saas/TrendChart'
import { requireCurrentVinkoraUser } from '../../../lib/auth/vinkora-user'
import { getDynamicQrAnalytics } from '../../../lib/dynamic-qr'
import { getPrisma } from '../../../lib/prisma'

const dateFormatter = new Intl.DateTimeFormat('fr-FR', {
  day: '2-digit',
  month: 'short',
})

export default async function AnalyticsPage() {
  const user = await requireCurrentVinkoraUser()
  const prisma = getPrisma()
  const qrCode = await prisma.qrCode.findFirst({
    where: { ownerId: user.id },
    orderBy: { createdAt: 'desc' },
    select: { id: true, name: true },
  })

  if (!qrCode) {
    return (
      <div className="dashboard-page">
        <SectionHeading
          title="Analytics"
          description="Les performances de vos QR dynamiques apparaîtront ici."
        />
        <section className="dashboard-panel dashboard-panel--empty-page">
          <EmptyState
            icon={BarChart3}
            title="Aucune donnée analytique"
            description="Créez un QR dynamique et recevez son premier scan pour commencer à mesurer votre activité."
            actionLabel="Ouvrir le Studio"
            actionHref="/studio"
          />
        </section>
      </div>
    )
  }

  const analytics = await getDynamicQrAnalytics(prisma, qrCode.id, { userId: user.id })
  const trendData = analytics.daily.slice(-14).map((point) => ({
    label: dateFormatter.format(new Date(`${point.date}T12:00:00Z`)),
    value: point.scans,
  }))

  return (
    <div className="dashboard-page">
      <SectionHeading
        title="Analytics"
        description={`Données réelles des 30 derniers jours pour ${qrCode.name}.`}
      />

      <section className="stats-grid">
        <StatCard
          label="Scans totaux"
          value={analytics.totalScans.toLocaleString('fr-FR')}
          detail="depuis la création"
          icon={ScanLine}
        />
        <StatCard
          label="Visiteurs estimés"
          value={analytics.estimatedUniqueVisitors.toLocaleString('fr-FR')}
          detail={`sur ${analytics.periodDays} jours`}
          icon={Users}
        />
        <StatCard
          label="Scans automatisés"
          value={analytics.botScans.toLocaleString('fr-FR')}
          detail="exclus des indicateurs principaux"
          icon={Bot}
        />
      </section>

      <section className="dashboard-panel">
        <div className="dashboard-panel__head">
          <div>
            <span>Évolution</span>
            <h2>Scans récents</h2>
          </div>
          <BarChart3 size={20} aria-hidden="true" />
        </div>
        {trendData.length > 0 ? (
          <TrendChart data={trendData} />
        ) : (
          <p className="analytics-empty-copy">Les premiers scans apparaîtront ici.</p>
        )}
      </section>

      <section className="dashboard-grid dashboard-grid--main">
        <article className="dashboard-panel">
          <div className="dashboard-panel__head">
            <div><span>Localisation</span><h2>Pays</h2></div>
          </div>
          <BreakdownList items={analytics.countries} emptyLabel="Aucun pays identifié pour le moment." />
        </article>
        <article className="dashboard-panel">
          <div className="dashboard-panel__head">
            <div><span>Technologie</span><h2>Appareils</h2></div>
          </div>
          <BreakdownList items={analytics.devices} emptyLabel="Aucun appareil identifié pour le moment." />
        </article>
      </section>
    </div>
  )
}
