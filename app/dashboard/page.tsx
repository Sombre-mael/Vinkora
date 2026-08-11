import Link from 'next/link'
import {
  ArrowRight,
  BarChart3,
  Link2,
  MousePointerClick,
  Plus,
  QrCode,
  TrendingUp,
} from 'lucide-react'
import { DemoNotice, StatCard } from '@/components/saas/SaasUi'
import { TrendChart } from '@/components/saas/TrendChart'
import { demoActivities, demoLinks, demoTrend } from '@/data/saasDemo'

export default function DashboardPage() {
  return (
    <div className="dashboard-page">
      <DemoNotice />

      <section className="dashboard-welcome">
        <div>
          <span>Bonjour Sombre</span>
          <h2>Vos liens ont généré 2 819 clics ce mois-ci.</h2>
          <p>Une progression de 18 % par rapport à la période précédente.</p>
        </div>
        <Link className="button button--primary" href="/dashboard/links/new">
          <Plus size={18} />
          Créer un lien
        </Link>
      </section>

      <section className="stats-grid" aria-label="Indicateurs principaux">
        <StatCard
          label="Liens actifs"
          value="3"
          detail="sur 4 liens"
          icon={Link2}
          trend="+1 ce mois"
        />
        <StatCard
          label="Clics totaux"
          value="2 819"
          detail="sur la période"
          icon={MousePointerClick}
          trend="+18 %"
        />
        <StatCard
          label="QR dynamiques"
          value="2"
          detail="dans cet aperçu"
          icon={QrCode}
          trend="+1 récent"
        />
        <StatCard
          label="Taux mobile"
          value="72 %"
          detail="de vos visiteurs"
          icon={TrendingUp}
        />
      </section>

      <section className="dashboard-grid dashboard-grid--main">
        <article className="dashboard-panel dashboard-panel--chart">
          <div className="dashboard-panel__head">
            <div>
              <span>7 derniers jours</span>
              <h2>Évolution des clics</h2>
            </div>
            <span className="panel-kpi"><TrendingUp size={15} /> +18 %</span>
          </div>
          <TrendChart data={demoTrend} />
        </article>

        <article className="dashboard-panel">
          <div className="dashboard-panel__head">
            <div>
              <span>Temps réel</span>
              <h2>Activité récente</h2>
            </div>
            <BarChart3 size={20} aria-hidden="true" />
          </div>
          <div className="activity-list">
            {demoActivities.map((activity) => (
              <div key={activity.id}>
                <i className={`activity-dot activity-dot--${activity.tone}`} />
                <div>
                  <strong>{activity.label}</strong>
                  <span>{activity.detail}</span>
                  <small>{activity.time}</small>
                </div>
              </div>
            ))}
          </div>
        </article>
      </section>

      <section className="dashboard-panel">
        <div className="dashboard-panel__head">
          <div>
            <span>Classement</span>
            <h2>Liens les plus performants</h2>
          </div>
          <Link className="text-link" href="/dashboard/links">
            Voir tous les liens <ArrowRight size={16} />
          </Link>
        </div>
        <div className="top-links">
          {demoLinks.slice(0, 3).map((link, index) => (
            <div key={link.id}>
              <span className="top-links__rank">0{index + 1}</span>
              <div>
                <strong>{link.title}</strong>
                <span>{link.shortUrl}</span>
              </div>
              <strong>{link.clicks.toLocaleString('fr-FR')}</strong>
              <small>clics</small>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
