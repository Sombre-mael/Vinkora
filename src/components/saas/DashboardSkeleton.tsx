export function DashboardSkeleton({ compact = false }: { compact?: boolean }) {
  return (
    <div className={`dashboard-skeleton${compact ? ' is-compact' : ''}`} aria-label="Chargement du contenu" aria-busy="true">
      <span className="dashboard-skeleton__line is-short" />
      <span className="dashboard-skeleton__line is-title" />
      <div className="dashboard-skeleton__grid">
        <span />
        <span />
      </div>
      <span className="dashboard-skeleton__panel" />
    </div>
  )
}
