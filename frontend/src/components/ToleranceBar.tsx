interface ToleranceBarProps {
  label: string
  value: number | null
  type: 'drought' | 'cold' | 'shade' | 'pollution' | 'maintenance'
}

export default function ToleranceBar({ label, value, type }: ToleranceBarProps) {
  const v = value ?? 0
  const pct = (v / 5) * 100

  return (
    <div className="tolerance-row">
      <span className="tolerance-label">{label}</span>
      <div className="tolerance-bar-track">
        <div
          className={`tolerance-bar-fill ${type}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="tolerance-value">{value != null ? `${value}/5` : '-'}</span>
    </div>
  )
}
