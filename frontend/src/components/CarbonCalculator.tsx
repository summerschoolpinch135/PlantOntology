import { useState, useEffect, useRef } from 'react'
import { Search, Plus, Minus, X, Leaf } from 'lucide-react'
import { searchByQuery } from '../api'
import type { CalcEntry, Species } from '../types'

export default function CarbonCalculator() {
  const [query, setQuery] = useState('')
  const [suggestions, setSuggestions] = useState<Species[]>([])
  const [loadingSug, setLoadingSug] = useState(false)
  const [entries, setEntries] = useState<CalcEntry[]>([])
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!query.trim()) {
      setSuggestions([])
      return
    }
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(async () => {
      setLoadingSug(true)
      try {
        const res = await searchByQuery(query, 8)
        setSuggestions(res)
      } catch {
        setSuggestions([])
      } finally {
        setLoadingSug(false)
      }
    }, 280)
  }, [query])

  function addSpecies(sp: Species) {
    setEntries(prev => {
      const exists = prev.find(e => e.species.id === sp.id)
      if (exists) {
        return prev.map(e => e.species.id === sp.id ? { ...e, count: e.count + 1 } : e)
      }
      return [...prev, { species: sp, count: 1 }]
    })
    setQuery('')
    setSuggestions([])
    inputRef.current?.focus()
  }

  function removeEntry(id: string) {
    setEntries(prev => prev.filter(e => e.species.id !== id))
  }

  function updateCount(id: string, delta: number) {
    setEntries(prev =>
      prev
        .map(e => e.species.id === id ? { ...e, count: Math.max(1, e.count + delta) } : e)
    )
  }

  function setCount(id: string, v: number) {
    setEntries(prev =>
      prev.map(e => e.species.id === id ? { ...e, count: Math.max(1, v || 1) } : e)
    )
  }

  const totalCarbon = entries.reduce((sum, e) => {
    return sum + (e.species.carbon_sequestration_kg_yr ?? 0) * e.count
  }, 0)

  const carCo2Equiv = (totalCarbon / 2400).toFixed(1)  // 승용차 연간 CO2 ~2.4톤
  const treesEquiv = Math.round(totalCarbon / 22)       // 일반 나무 ~22kg/년

  return (
    <div className="page-container">
      <h1 className="page-title">탄소 흡수 계산기</h1>
      <p className="page-subtitle">
        식재할 수종과 개체 수를 입력하면 연간 탄소 흡수량을 계산합니다.
      </p>

      {/* 검색 */}
      <div className="calc-search-box">
        <Search size={18} />
        <input
          ref={inputRef}
          className="calc-search-input"
          type="search"
          placeholder="수종 이름 검색 후 추가..."
          value={query}
          onChange={e => setQuery(e.target.value)}
          autoComplete="off"
        />
        {(suggestions.length > 0 || loadingSug) && (
          <div className="calc-dropdown">
            {loadingSug && (
              <div style={{ padding: '16px', textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
                검색 중...
              </div>
            )}
            {suggestions.map(sp => (
              <div
                key={sp.id}
                className="calc-dropdown-item"
                onClick={() => addSpecies(sp)}
              >
                <div>
                  <div className="korean">{sp.korean_name || sp.scientific_name}</div>
                  <div className="sci">{sp.scientific_name}</div>
                </div>
                {sp.carbon_sequestration_kg_yr != null && (
                  <div className="carbon-info">
                    {sp.carbon_sequestration_kg_yr.toFixed(1)} kg CO₂/년
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 선택 목록 */}
      {entries.length === 0 ? (
        <div className="empty-state" style={{ minHeight: 200 }}>
          <div className="empty-state-icon"><Leaf size={40} opacity={0.3} /></div>
          <h3>수종을 추가해주세요</h3>
          <p>위 검색창에서 식재할 수종을 검색해 추가하세요.</p>
        </div>
      ) : (
        <div className="calc-list">
          {entries.map(({ species: sp, count }) => (
            <div key={sp.id} className="calc-entry">
              <div className="calc-entry-info">
                <div className="korean">{sp.korean_name || sp.scientific_name}</div>
                <div className="sci">{sp.scientific_name}</div>
              </div>
              <div className="calc-count-wrap">
                <button className="calc-count-btn" onClick={() => updateCount(sp.id, -1)}>
                  <Minus size={12} />
                </button>
                <input
                  className="calc-count-input"
                  type="number"
                  min={1}
                  value={count}
                  onChange={e => setCount(sp.id, Number(e.target.value))}
                />
                <button className="calc-count-btn" onClick={() => updateCount(sp.id, 1)}>
                  <Plus size={12} />
                </button>
              </div>
              <div className="calc-entry-carbon">
                {sp.carbon_sequestration_kg_yr != null
                  ? `${(sp.carbon_sequestration_kg_yr * count).toFixed(1)} kg`
                  : '-'}
              </div>
              <button className="calc-remove-btn" onClick={() => removeEntry(sp.id)}>
                <X size={15} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* 결과 카드 */}
      {entries.length > 0 && (
        <div className="calc-result-card">
          <h3>연간 탄소 흡수량 합계</h3>
          <div className="calc-result-num">{totalCarbon.toLocaleString(undefined, { maximumFractionDigits: 1 })}</div>
          <div className="calc-result-unit">kg CO₂ / 년</div>
          <div className="calc-result-equiv">
            {totalCarbon >= 1000 && (
              <>
                약 <strong>{(totalCarbon / 1000).toFixed(2)} 톤 CO₂/년</strong> 상당<br />
              </>
            )}
            승용차 <strong>{carCo2Equiv}대</strong> 연간 배출량 상쇄 /
            도시 나무 <strong>{treesEquiv.toLocaleString()}그루</strong> 효과
          </div>
        </div>
      )}
    </div>
  )
}
