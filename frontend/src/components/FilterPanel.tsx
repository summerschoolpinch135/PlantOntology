import { RotateCcw } from 'lucide-react'
import type { SearchFilters } from '../types'

interface Props {
  filters: SearchFilters
  onChange: (f: SearchFilters) => void
}

const PLANT_TYPES = ['교목', '관목', '지피', '초화']

const CLIMATE_ZONES = [
  '', 'KR-4a', 'KR-4b', 'KR-5a', 'KR-5b',
  'KR-6a', 'KR-6b', 'KR-7a', 'KR-7b', 'KR-8',
]

const LANDSCAPE_USES = [
  { label: '가로수', value: 'street-tree' },
  { label: '공원 포컬', value: 'park-focal' },
  { label: '울타리', value: 'hedge' },
  { label: '지피식재', value: 'ground-cover' },
  { label: '도시숲', value: 'urban-forest' },
  { label: '절화정원', value: '절화' },
  { label: '약용', value: '약용' },
  { label: '암석정원', value: '암석정원' },
]

const DEFAULT_FILTERS: SearchFilters = {
  q: '',
  plant_types: [],
  climate_zone: '',
  drought_tolerance_min: 1,
  cold_tolerance_min: 1,
  shade_tolerance_min: 1,
  evergreen: '',
  landscape_use: '',
  height_max: '',
}

export default function FilterPanel({ filters, onChange }: Props) {
  function update(patch: Partial<SearchFilters>) {
    onChange({ ...filters, ...patch })
  }

  function togglePlantType(pt: string) {
    const cur = filters.plant_types
    const next = cur.includes(pt) ? cur.filter(x => x !== pt) : [...cur, pt]
    update({ plant_types: next })
  }

  const isDefault =
    filters.q === '' &&
    filters.plant_types.length === 0 &&
    filters.climate_zone === '' &&
    filters.drought_tolerance_min === 1 &&
    filters.cold_tolerance_min === 1 &&
    filters.shade_tolerance_min === 1 &&
    filters.evergreen === '' &&
    filters.landscape_use === '' &&
    filters.height_max === ''

  return (
    <div className="sidebar">
      {/* 리셋 버튼 */}
      <button
        className="filter-reset-btn"
        onClick={() => onChange(DEFAULT_FILTERS)}
        disabled={isDefault}
        style={{ opacity: isDefault ? 0.4 : 1 }}
      >
        <RotateCcw size={13} />
        필터 초기화
      </button>

      {/* 식물 유형 */}
      <div className="filter-section">
        <div className="filter-section-title">식물 유형</div>
        <div className="checkbox-group">
          {PLANT_TYPES.map(pt => (
            <label key={pt} className="checkbox-item">
              <input
                type="checkbox"
                checked={filters.plant_types.includes(pt)}
                onChange={() => togglePlantType(pt)}
              />
              {pt}
            </label>
          ))}
        </div>
      </div>

      {/* 기후존 */}
      <div className="filter-section">
        <div className="filter-section-title">기후존</div>
        <select
          className="filter-select"
          value={filters.climate_zone}
          onChange={e => update({ climate_zone: e.target.value })}
        >
          <option value="">전체</option>
          {CLIMATE_ZONES.filter(Boolean).map(z => (
            <option key={z} value={z}>{z}</option>
          ))}
        </select>
      </div>

      {/* 최대 수고 */}
      <div className="filter-section">
        <div className="filter-section-title">최대 수고 (m)</div>
        <input
          type="number"
          className="height-input"
          placeholder="예: 10"
          min={0}
          step={0.5}
          value={filters.height_max}
          onChange={e => update({ height_max: e.target.value })}
        />
      </div>

      {/* 내건성 */}
      <div className="filter-section">
        <div className="filter-section-title">내건성 최소</div>
        <div className="slider-row">
          <input
            type="range"
            min={1}
            max={5}
            step={1}
            value={filters.drought_tolerance_min}
            onChange={e => update({ drought_tolerance_min: Number(e.target.value) })}
          />
          <span className="slider-value">{filters.drought_tolerance_min}</span>
        </div>
      </div>

      {/* 내한성 */}
      <div className="filter-section">
        <div className="filter-section-title">내한성 최소</div>
        <div className="slider-row">
          <input
            type="range"
            min={1}
            max={5}
            step={1}
            value={filters.cold_tolerance_min}
            onChange={e => update({ cold_tolerance_min: Number(e.target.value) })}
          />
          <span className="slider-value">{filters.cold_tolerance_min}</span>
        </div>
      </div>

      {/* 내음성 */}
      <div className="filter-section">
        <div className="filter-section-title">내음성 최소</div>
        <div className="slider-row">
          <input
            type="range"
            min={1}
            max={5}
            step={1}
            value={filters.shade_tolerance_min}
            onChange={e => update({ shade_tolerance_min: Number(e.target.value) })}
          />
          <span className="slider-value">{filters.shade_tolerance_min}</span>
        </div>
      </div>

      {/* 상록/낙엽 */}
      <div className="filter-section">
        <div className="filter-section-title">상록 / 낙엽</div>
        <div className="toggle-group">
          <button
            className={`toggle-btn ${filters.evergreen === '' ? 'active' : ''}`}
            onClick={() => update({ evergreen: '' })}
          >전체</button>
          <button
            className={`toggle-btn ${filters.evergreen === 'true' ? 'active' : ''}`}
            onClick={() => update({ evergreen: 'true' })}
          >상록</button>
          <button
            className={`toggle-btn ${filters.evergreen === 'false' ? 'active' : ''}`}
            onClick={() => update({ evergreen: 'false' })}
          >낙엽</button>
        </div>
      </div>

      {/* 조경 활용처 */}
      <div className="filter-section">
        <div className="filter-section-title">조경 활용처</div>
        <div className="tag-select-grid">
          {LANDSCAPE_USES.map(({ label, value }) => (
            <button
              key={value}
              className={`tag-select-item ${filters.landscape_use === value ? 'active' : ''}`}
              onClick={() => update({ landscape_use: filters.landscape_use === value ? '' : value })}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
