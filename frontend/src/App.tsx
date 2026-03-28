import { useState, useEffect, useCallback, useRef } from 'react'
import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom'
import { Leaf, Calculator, BarChart2 } from 'lucide-react'

import { searchSpecies } from './api'
import type { Species, SearchFilters, SearchResponse } from './types'

import SearchBar from './components/SearchBar'
import FilterPanel from './components/FilterPanel'
import SpeciesCard from './components/SpeciesCard'
import SpeciesModal from './components/SpeciesModal'
import CarbonCalculator from './components/CarbonCalculator'
import StatsPage from './components/StatsPage'

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

const LIMIT = 20

// ── 홈 페이지 ──────────────────────────────────────────────────────────

function HomePage() {
  const [filters, setFilters] = useState<SearchFilters>(DEFAULT_FILTERS)
  const [result, setResult] = useState<SearchResponse | null>(null)
  const [page, setPage] = useState(0)
  const [loading, setLoading] = useState(false)
  const [initLoading, setInitLoading] = useState(true)
  const [selected, setSelected] = useState<Species | null>(null)

  // 쿼리 입력 디바운스를 위한 ref
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [debouncedFilters, setDebouncedFilters] = useState(filters)

  const fetch = useCallback(async (f: SearchFilters, pageNum: number) => {
    setLoading(true)
    try {
      const res = await searchSpecies(f, LIMIT, pageNum * LIMIT)
      setResult(res)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
      setInitLoading(false)
    }
  }, [])

  // 필터 변경 시 디바운스
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      setPage(0)
      setDebouncedFilters(filters)
    }, 300)
  }, [filters])

  // 디바운스된 필터 또는 페이지가 바뀌면 API 호출
  useEffect(() => {
    fetch(debouncedFilters, page)
  }, [debouncedFilters, page, fetch])

  const totalPages = result ? Math.ceil(result.total / LIMIT) : 0

  function handleFilterChange(f: SearchFilters) {
    setFilters(f)
  }

  function handleQueryChange(q: string) {
    setFilters(prev => ({ ...prev, q }))
  }

  return (
    <>
      {/* 히어로 */}
      <div className="hero">
        <div className="hero-bg-icon">🌿</div>
        <h2>PlantOntology</h2>
        <p>10,000+ 수종 지식 그래프 — 올바른 장소에 올바른 식물을</p>
        <div className="hero-stats">
          <div className="hero-stat">
            <div className="num">{result ? result.total.toLocaleString() : '—'}</div>
            <div className="label">검색 결과</div>
          </div>
          <div className="hero-stat">
            <div className="num">45</div>
            <div className="label">데이터셋</div>
          </div>
          <div className="hero-stat">
            <div className="num">10</div>
            <div className="label">기후존</div>
          </div>
        </div>
      </div>

      {/* 레이아웃 */}
      <div className="main-layout">
        <FilterPanel filters={filters} onChange={handleFilterChange} />

        <div className="results-area">
          <SearchBar
            value={filters.q}
            onChange={handleQueryChange}
            total={result?.total ?? 0}
            loading={loading}
          />

          {initLoading ? (
            <div className="spinner-wrap">
              <div className="spinner" />
              <span>데이터 로딩 중... 최초 요청 시 잠시 걸릴 수 있습니다.</span>
            </div>
          ) : result && result.results.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">🔍</div>
              <h3>검색 결과 없음</h3>
              <p>다른 검색어나 필터를 시도해보세요.</p>
            </div>
          ) : (
            <>
              <div className="species-grid">
                {(result?.results ?? []).map((sp, i) => (
                  <SpeciesCard
                    key={sp.id}
                    species={sp}
                    onClick={setSelected}
                    style={{ animationDelay: `${Math.min(i, 10) * 30}ms` }}
                  />
                ))}
              </div>

              {/* 페이지네이션 */}
              {totalPages > 1 && (
                <div className="pagination">
                  <button
                    className="page-btn"
                    onClick={() => setPage(p => Math.max(0, p - 1))}
                    disabled={page === 0}
                  >
                    ‹
                  </button>

                  {/* 페이지 번호 */}
                  {Array.from({ length: Math.min(7, totalPages) }, (_, i) => {
                    let pageNum: number
                    if (totalPages <= 7) {
                      pageNum = i
                    } else if (page < 4) {
                      pageNum = i
                    } else if (page > totalPages - 5) {
                      pageNum = totalPages - 7 + i
                    } else {
                      pageNum = page - 3 + i
                    }
                    return (
                      <button
                        key={pageNum}
                        className={`page-btn ${pageNum === page ? 'active' : ''}`}
                        onClick={() => setPage(pageNum)}
                      >
                        {pageNum + 1}
                      </button>
                    )
                  })}

                  <button
                    className="page-btn"
                    onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                    disabled={page >= totalPages - 1}
                  >
                    ›
                  </button>

                  <span className="page-info">
                    {page + 1} / {totalPages}
                  </span>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* 상세 모달 */}
      <SpeciesModal species={selected} onClose={() => setSelected(null)} />
    </>
  )
}

// ── 앱 루트 ──────────────────────────────────────────────────────────

export default function App() {
  return (
    <BrowserRouter>
      {/* 네브바 */}
      <nav className="navbar">
        <NavLink to="/" className="navbar-brand">
          <div className="logo-icon">P</div>
          <h1>PlantOntology</h1>
        </NavLink>
        <div className="navbar-links">
          <NavLink to="/" end>
            <Leaf size={15} />
            수종 탐색
          </NavLink>
          <NavLink to="/calculator">
            <Calculator size={15} />
            탄소 계산기
          </NavLink>
          <NavLink to="/stats">
            <BarChart2 size={15} />
            통계
          </NavLink>
        </div>
      </nav>

      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/calculator" element={<CarbonCalculator />} />
        <Route path="/stats" element={<StatsPage />} />
      </Routes>

      <footer className="footer">
        PlantOntology — Open-source plant knowledge graph · CC BY 4.0
      </footer>
    </BrowserRouter>
  )
}
