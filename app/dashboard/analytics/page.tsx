import { BarChart3, Globe2, MonitorSmartphone, MousePointerClick, Users } from 'lucide-react'
import { BreakdownList } from '@/components/saas/BreakdownList'
import { DemoNotice, StatCard } from '@/components/saas/SaasUi'
import { TrendChart } from '@/components/saas/TrendChart'
import {
  demoCountries,
  demoDevices,
  demoLinks,
  demoSources,
  demoTrend,
} from '@/data/saasDemo'

export default function AnalyticsPage() {
  return (
    <div className="dashboard-page">
      <DemoNotice />
      <div className="analytics-header">
        <div>
          <span>Du 22 au 28 juillet 2026</span>
          <h2>Performances globales</h2>
        </div>
        <label>
          <span className="sr-only">Période</span>
          <select defaultValue="7d">
            <option value="7d">7 derniers jours</option>
            <option value="30d">30 derniers jours</option>
            <option value="90d">90 derniers jours</option>
          </select>
        </label>
      </div>

      <section className="stats-grid stats-grid--three">
        <StatCard label="Clics" value="2 819" detail="tous les liens" icon={MousePointerClick} trend="+18 %" />
        <StatCard label="Visiteurs uniques" value="2 104" detail="estimation pseudonymisée" icon={Users} trend="+12 %" />
        <StatCard label="Liens suivis" value="4" detail="dans cet aperçu" icon={BarChart3} />
      </section>

      <section className="dashboard-panel dashboard-panel--chart">
        <div className="dashboard-panel__head">
          <div>
            <span>Volume quotidien</span>
            <h2>Clics sur la période</h2>
          </div>
          <span className="panel-kpi">Moyenne 187 / jour</span>
        </div>
        <TrendChart data={demoTrend} />
      </section>

      <section className="analytics-breakdowns">
        <article className="dashboard-panel">
          <div className="dashboard-panel__head">
            <div><span>Origine</span><h2>Sources</h2></div>
            <MousePointerClick size={19} />
          </div>
          <BreakdownList items={demoSources} />
        </article>
        <article className="dashboard-panel">
          <div className="dashboard-panel__head">
            <div><span>Technologie</span><h2>Appareils</h2></div>
            <MonitorSmartphone size={19} />
          </div>
          <BreakdownList items={demoDevices} />
        </article>
        <article className="dashboard-panel">
          <div className="dashboard-panel__head">
            <div><span>Localisation</span><h2>Pays</h2></div>
            <Globe2 size={19} />
          </div>
          <BreakdownList items={demoCountries} />
        </article>
      </section>

      <section className="dashboard-panel">
        <div className="dashboard-panel__head">
          <div><span>Comparaison</span><h2>Liens les plus cliqués</h2></div>
        </div>
        <div className="analytics-ranking">
          {demoLinks.map((link, index) => (
            <div key={link.id}>
              <span>{index + 1}</span>
              <div><strong>{link.title}</strong><small>{link.shortUrl}</small></div>
              <strong>{link.clicks.toLocaleString('fr-FR')}</strong>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
