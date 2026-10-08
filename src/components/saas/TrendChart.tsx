import type { CSSProperties } from 'react'

type ChartPoint = {
  label: string
  value: number
}

export function TrendChart({ data }: { data: readonly ChartPoint[] }) {
  const max = Math.max(...data.map((point) => point.value), 1)
  const chartStyle = { '--chart-columns': data.length } as CSSProperties

  return (
    <div className="trend-chart" style={chartStyle} role="img" aria-label="Graphique d’évolution des scans">
      <div className="trend-chart__plot">
        {data.map((point) => {
          const height = Math.max(10, Math.round((point.value / max) * 100))
          return (
            <div className="trend-chart__column" key={point.label}>
              <span>{point.value}</span>
              <i style={{ '--bar-height': `${height}%` } as CSSProperties} />
            </div>
          )
        })}
      </div>
      <div className="trend-chart__labels">
        {data.map((point) => <span key={point.label}>{point.label}</span>)}
      </div>
    </div>
  )
}
