import { Leaf, Ruler, Droplets } from 'lucide-react'
import type { Species } from '../types'

interface Props {
  species: Species
  onClick: (s: Species) => void
  style?: React.CSSProperties
}

const PLANT_ICONS: Record<string, string> = {
  교목: '🌳',
  관목: '🌿',
  지피: '🌱',
  초화: '🌸',
}

const TYPE_CLASS: Record<string, string> = {
  교목: '',
  관목: 'shrub',
  지피: 'ground',
  초화: 'flower',
}

function TolDots({ value }: { value: number | null }) {
  const v = value ?? 0
  return (
    <div className="card-tolerances">
      {Array.from({ length: 5 }, (_, i) => (
        <div key={i} className={`tol-dot ${i < v ? 'filled' : 'empty'}`} />
      ))}
    </div>
  )
}

export default function SpeciesCard({ species: s, onClick, style }: Props) {
  const icon = PLANT_ICONS[s.plant_type ?? ''] ?? '🌿'
  const typeClass = TYPE_CLASS[s.plant_type ?? ''] ?? ''

  const heightStr =
    s.height_min_m != null && s.height_max_m != null
      ? `${s.height_min_m}–${s.height_max_m}m`
      : s.height_max_m != null
        ? `~${s.height_max_m}m`
        : null

  return (
    <div className="species-card fade-in-up" onClick={() => onClick(s)} style={style}>
      <div className="card-header">
        <span className="card-plant-icon">{icon}</span>
        {s.plant_type && (
          <span className={`card-type-badge ${typeClass}`}>{s.plant_type}</span>
        )}
      </div>

      <div className="card-body">
        <div className="card-korean-name">{s.korean_name || s.scientific_name}</div>
        <div className="card-sci-name">{s.scientific_name}</div>
        {s.family && <div className="card-family">{s.family}</div>}

        <div className="card-meta">
          {heightStr && (
            <div className="card-meta-item">
              <Ruler size={11} />
              <span>{heightStr}</span>
            </div>
          )}
          {s.climate_zones.length > 0 && (
            <div className="card-meta-item">
              <Leaf size={11} />
              <span>{s.climate_zones[0]}{s.climate_zones.length > 1 ? ` +${s.climate_zones.length - 1}` : ''}</span>
            </div>
          )}
        </div>

        {/* 내건성 도트 */}
        {s.drought_tolerance != null && (
          <div>
            <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 8, marginBottom: 3 }}>내건성</div>
            <TolDots value={s.drought_tolerance} />
          </div>
        )}

        {/* 탄소 흡수량 */}
        {s.carbon_sequestration_kg_yr != null && (
          <div className="card-carbon">
            <Droplets size={12} />
            {s.carbon_sequestration_kg_yr.toFixed(1)} kg CO₂/년
          </div>
        )}

        {/* 상록/낙엽 */}
        {s.evergreen != null && (
          <div className={`card-evergreen-badge ${s.evergreen ? 'evergreen' : 'deciduous'}`}>
            {s.evergreen ? '🌿 상록' : '🍂 낙엽'}
          </div>
        )}
      </div>
    </div>
  )
}
