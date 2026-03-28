import { useEffect, useState } from 'react'
import { getStats } from '../api'
import type { StatsResponse } from '../types'

const PIE_COLORS = ['#1b4332', '#2d6a4f', '#40916c', '#52b788', '#95d5b2', '#d8f3dc']

interface PieSlice {
  label: string
  count: number
  pct: number
  color: string
  startAngle: number
  endAngle: number
}

function buildPie(data: Record<string, number>): PieSlice[] {
  const total = Object.values(data).reduce((s, v) => s + v, 0)
  if (total === 0) return []
  const sorted = Object.entries(data)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)

  let angle = -90 // 12시 방향 시작
  return sorted.map(([label, count], i) => {
    const pct = count / total
    const sweep = pct * 360
    const start = angle
    angle += sweep
    return { label, count, pct, color: PIE_COLORS[i], startAngle: start, endAngle: angle }
  })
}

function polarToXY(angle: number, r: number, cx: number, cy: number) {
  const rad = (angle * Math.PI) / 180
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) }
}

function PieChart({ data, size = 160 }: { data: Record<string, number>; size?: number }) {
  const slices = buildPie(data)
  const cx = size / 2
  const cy = size / 2
  const r = size / 2 - 10
  const inner = r * 0.5

  if (slices.length === 0) return <div style={{ color: 'var(--text-muted)', fontSize: 13 }}>데이터 없음</div>

  return (
    <div className="pie-chart-wrap">
      <svg width={size} height={size} className="pie-chart-svg">
        {slices.map((s, i) => {
          const start = polarToXY(s.startAngle, r, cx, cy)
          const end = polarToXY(s.endAngle, r, cx, cy)
          const iStart = polarToXY(s.startAngle, inner, cx, cy)
          const iEnd = polarToXY(s.endAngle, inner, cx, cy)
          const large = s.endAngle - s.startAngle > 180 ? 1 : 0
          const d = [
            `M ${start.x} ${start.y}`,
            `A ${r} ${r} 0 ${large} 1 ${end.x} ${end.y}`,
            `L ${iEnd.x} ${iEnd.y}`,
            `A ${inner} ${inner} 0 ${large} 0 ${iStart.x} ${iStart.y}`,
            'Z',
          ].join(' ')
          return <path key={i} d={d} fill={s.color} stroke="white" strokeWidth={1.5} />
        })}
      </svg>
      <div className="pie-legend">
        {slices.map((s, i) => (
          <div key={i} className="pie-legend-item">
            <div className="pie-legend-dot" style={{ background: s.color }} />
            <span className="pie-legend-label">{s.label}</span>
            <span className="pie-legend-count">
              {s.count.toLocaleString()} ({(s.pct * 100).toFixed(1)}%)
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

function BarChart({ data, maxItems = 15 }: { data: Record<string, number>; maxItems?: number }) {
  const sorted = Object.entries(data)
    .sort((a, b) => b[1] - a[1])
    .slice(0, maxItems)
  if (sorted.length === 0) return <div style={{ color: 'var(--text-muted)', fontSize: 13 }}>데이터 없음</div>
  const max = sorted[0][1]

  return (
    <div className="bar-chart">
      {sorted.map(([label, count]) => (
        <div key={label} className="bar-row">
          <div className="bar-label">{label}</div>
          <div className="bar-track">
            <div className="bar-fill" style={{ width: `${(count / max) * 100}%` }} />
          </div>
          <div className="bar-value">{count.toLocaleString()}</div>
        </div>
      ))}
    </div>
  )
}

export default function StatsPage() {
  const [stats, setStats] = useState<StatsResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    getStats()
      .then(setStats)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="page-container">
        <div className="spinner-wrap">
          <div className="spinner" />
          <span>통계 데이터 로딩 중... (최초 요청 시 시간이 걸릴 수 있습니다)</span>
        </div>
      </div>
    )
  }

  if (error || !stats) {
    return (
      <div className="page-container">
        <div className="empty-state">
          <div className="empty-state-icon">⚠️</div>
          <h3>데이터 로드 실패</h3>
          <p>{error || '서버에 연결할 수 없습니다.'}</p>
        </div>
      </div>
    )
  }

  const totalTypes = Object.keys(stats.by_plant_type).length
  const totalZones = Object.keys(stats.by_climate_zone).length

  return (
    <div className="page-container">
      <h1 className="page-title">데이터 통계</h1>
      <p className="page-subtitle">PlantOntology 식물 지식 그래프의 데이터 현황입니다.</p>

      {/* KPI 카드 */}
      <div className="stats-kpi-grid">
        <div className="stats-kpi-card">
          <div className="kpi-num">{stats.total.toLocaleString()}</div>
          <div className="kpi-label">총 수종</div>
        </div>
        <div className="stats-kpi-card">
          <div className="kpi-num">{totalTypes}</div>
          <div className="kpi-label">식물 유형</div>
        </div>
        <div className="stats-kpi-card">
          <div className="kpi-num">{totalZones}</div>
          <div className="kpi-label">기후존</div>
        </div>
        <div className="stats-kpi-card">
          <div className="kpi-num">{(stats.by_evergreen['상록'] || 0).toLocaleString()}</div>
          <div className="kpi-label">상록수</div>
        </div>
        <div className="stats-kpi-card">
          <div className="kpi-num">{(stats.by_evergreen['낙엽'] || 0).toLocaleString()}</div>
          <div className="kpi-label">낙엽수</div>
        </div>
      </div>

      {/* 식물 유형별 파이 차트 */}
      <div className="stats-section">
        <div className="stats-section-title">식물 유형별 분포</div>
        <PieChart data={stats.by_plant_type} />
      </div>

      {/* 기후존별 막대 그래프 */}
      <div className="stats-section">
        <div className="stats-section-title">기후존별 수종 수 (상위 15)</div>
        <BarChart data={stats.by_climate_zone} maxItems={15} />
      </div>

      {/* 탄소 흡수 Top 10 */}
      {stats.top_carbon_sequestration.length > 0 && (
        <div className="stats-section">
          <div className="stats-section-title">탄소 흡수량 Top 10</div>
          <div className="top-carbon-list">
            {stats.top_carbon_sequestration.map((item, i) => (
              <div key={item.id} className="top-carbon-item">
                <div className="top-carbon-rank">
                  {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}`}
                </div>
                <div className="top-carbon-info">
                  <div className="top-carbon-korean">{item.korean_name || item.scientific_name}</div>
                  <div className="top-carbon-sci">{item.scientific_name}</div>
                </div>
                <div className="top-carbon-value">
                  {item.carbon_sequestration_kg_yr.toFixed(1)} kg CO₂/년
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
