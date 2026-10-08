import { BarChart3 } from 'lucide-react'
import { EmptyState, SectionHeading } from '@/components/saas/SaasUi'

export default function AnalyticsPage() {
  return (
    <div className="dashboard-page">
      <SectionHeading
        title="Analytics"
        description="Les performances de vos liens et QR dynamiques apparaîtront ici."
      />
      <section className="dashboard-panel dashboard-panel--empty-page">
        <EmptyState
          icon={BarChart3}
          title="Aucune donnée analytique"
          description="Créez une ressource dynamique et recevez ses premiers clics ou scans pour commencer à mesurer votre activité."
          actionLabel="Créer un lien"
          actionHref="/dashboard/links/new"
        />
      </section>
    </div>
  )
}
