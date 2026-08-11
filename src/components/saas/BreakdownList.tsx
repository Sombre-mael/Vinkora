export function BreakdownList({
  items,
}: {
  items: readonly { label: string; value: number }[]
}) {
  return (
    <div className="breakdown-list">
      {items.map((item) => (
        <div key={item.label}>
          <div>
            <span>{item.label}</span>
            <strong>{item.value} %</strong>
          </div>
          <span className="breakdown-list__bar" aria-hidden="true">
            <i style={{ width: `${item.value}%` }} />
          </span>
        </div>
      ))}
    </div>
  )
}
