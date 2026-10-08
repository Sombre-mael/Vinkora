export function BreakdownList({
  items,
  emptyLabel = 'Aucune donnée disponible',
}: {
  items: readonly { label: string; value: number }[]
  emptyLabel?: string
}) {
  const total = items.reduce((sum, item) => sum + item.value, 0)

  if (items.length === 0 || total === 0) {
    return <p className="breakdown-list__empty">{emptyLabel}</p>
  }

  return (
    <div className="breakdown-list">
      {items.map((item) => {
        const percentage = Math.round((item.value / total) * 100)

        return (
        <div key={item.label}>
          <div>
            <span>{item.label}</span>
            <strong>{item.value.toLocaleString('fr-FR')}</strong>
          </div>
          <span className="breakdown-list__bar" aria-hidden="true">
            <i style={{ width: `${percentage}%` }} />
          </span>
        </div>
        )
      })}
    </div>
  )
}
