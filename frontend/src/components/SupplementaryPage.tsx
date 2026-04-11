import { useState, useEffect } from 'react'
import {
  getNurseries,
  getDrawings,
  getClimateIndicators,
  getMaterialPrices
} from '../api'
import type { Nursery, Drawing, ClimateIndicator, MaterialPrice, SupplementaryListResponse } from '../types'
import { useLang } from '../LangContext'

type TabType = 'nurseries' | 'drawings' | 'climates' | 'prices'

export default function SupplementaryPage() {
  const { t } = useLang()
  const [activeTab, setActiveTab] = useState<TabType>('nurseries')

  const [loading, setLoading] = useState(false)
  const [query, setQuery] = useState('')

  // States
  const [nurseries, setNurseries] = useState<SupplementaryListResponse<Nursery> | null>(null)
  const [drawings, setDrawings] = useState<SupplementaryListResponse<Drawing> | null>(null)
  const [climates, setClimates] = useState<SupplementaryListResponse<ClimateIndicator> | null>(null)
  const [prices, setPrices] = useState<SupplementaryListResponse<MaterialPrice> | null>(null)

  const fetchData = async () => {
    setLoading(true)
    try {
      if (activeTab === 'nurseries') {
        const res = await getNurseries(query)
        setNurseries(res)
      } else if (activeTab === 'drawings') {
        const res = await getDrawings(query)
        setDrawings(res)
      } else if (activeTab === 'climates') {
        const res = await getClimateIndicators(query)
        setClimates(res)
      } else if (activeTab === 'prices') {
        const res = await getMaterialPrices(query)
        setPrices(res)
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, query])

  return (
    <div className="stats-page" style={{ padding: '2rem' }}>
      <h1>{t.nav_supplementary || '부가 데이터'}</h1>
      <p style={{ color: 'var(--text-light)', marginBottom: '1.5rem' }}>
        농장, 도면, 기후지표종, 자재단가 데이터를 확인합니다.
      </p>

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <button
          className={`lang-btn ${activeTab === 'nurseries' ? 'active' : ''}`}
          onClick={() => { setActiveTab('nurseries'); setQuery(''); }}
        >
          농가 (Nurseries)
        </button>
        <button
          className={`lang-btn ${activeTab === 'drawings' ? 'active' : ''}`}
          onClick={() => { setActiveTab('drawings'); setQuery(''); }}
        >
          표준상세도 (Drawings)
        </button>
        <button
          className={`lang-btn ${activeTab === 'climates' ? 'active' : ''}`}
          onClick={() => { setActiveTab('climates'); setQuery(''); }}
        >
          기후지표 (Climates)
        </button>
        <button
          className={`lang-btn ${activeTab === 'prices' ? 'active' : ''}`}
          onClick={() => { setActiveTab('prices'); setQuery(''); }}
        >
          자재단가 (Prices)
        </button>
      </div>

      <div style={{ marginBottom: '1.5rem' }}>
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="검색어 입력 후 엔터 (또는 다른 탭 이동 시 자동 검색)..."
          onKeyDown={e => {
            if (e.key === 'Enter') {
              fetchData()
            }
          }}
          style={{
            padding: '0.75rem',
            borderRadius: '6px',
            border: '1px solid var(--border-color)',
            background: 'var(--bg-mid)',
            color: 'var(--text-color)',
            width: '100%',
            maxWidth: '300px'
          }}
        />
        <button onClick={fetchData} className="page-btn" style={{ marginLeft: '1rem' }}>
          검색
        </button>
      </div>

      <div style={{ background: 'var(--bg-mid)', padding: '1rem', borderRadius: '8px', minHeight: '300px' }}>
        {loading ? (
          <div>Loading...</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            {activeTab === 'nurseries' && nurseries && (
              <>
                <p>총 {nurseries.total}건</p>
                <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                      <th style={{ padding: '0.5rem' }}>농장명</th>
                      <th style={{ padding: '0.5rem' }}>주요수종</th>
                      <th style={{ padding: '0.5rem' }}>주소</th>
                    </tr>
                  </thead>
                  <tbody>
                    {nurseries.results.map((r, i) => (
                      <tr key={i} style={{ borderBottom: '1px solid var(--border-color)' }}>
                        <td style={{ padding: '0.5rem' }}>{r.farm_name}</td>
                        <td style={{ padding: '0.5rem' }}>{r.main_species}</td>
                        <td style={{ padding: '0.5rem' }}>{r.address}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </>
            )}

            {activeTab === 'drawings' && drawings && (
              <>
                <p>총 {drawings.total}건</p>
                <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                      <th style={{ padding: '0.5rem' }}>코드</th>
                      <th style={{ padding: '0.5rem' }}>파일명</th>
                      <th style={{ padding: '0.5rem' }}>카테고리</th>
                      <th style={{ padding: '0.5rem' }}>포맷</th>
                    </tr>
                  </thead>
                  <tbody>
                    {drawings.results.map((r, i) => (
                      <tr key={i} style={{ borderBottom: '1px solid var(--border-color)' }}>
                        <td style={{ padding: '0.5rem' }}>{r.code}</td>
                        <td style={{ padding: '0.5rem' }}>{r.filename}</td>
                        <td style={{ padding: '0.5rem' }}>{r.category}</td>
                        <td style={{ padding: '0.5rem' }}>{r.format}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </>
            )}

            {activeTab === 'climates' && climates && (
              <>
                <p>총 {climates.total}건</p>
                <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                      <th style={{ padding: '0.5rem' }}>한국명</th>
                      <th style={{ padding: '0.5rem' }}>학명</th>
                    </tr>
                  </thead>
                  <tbody>
                    {climates.results.map((r, i) => (
                      <tr key={i} style={{ borderBottom: '1px solid var(--border-color)' }}>
                        <td style={{ padding: '0.5rem' }}>{r.korean_name}</td>
                        <td style={{ padding: '0.5rem' }}>{r.scientific_name}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </>
            )}

            {activeTab === 'prices' && prices && (
              <>
                <p>총 {prices.total}건 (기준 2026-02-02)</p>
                <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                      <th style={{ padding: '0.5rem' }}>품명</th>
                      <th style={{ padding: '0.5rem' }}>규격</th>
                      <th style={{ padding: '0.5rem' }}>단위</th>
                      <th style={{ padding: '0.5rem' }}>단가</th>
                    </tr>
                  </thead>
                  <tbody>
                    {prices.results.map((r, i) => (
                      <tr key={i} style={{ borderBottom: '1px solid var(--border-color)' }}>
                        <td style={{ padding: '0.5rem' }}>{r.name}</td>
                        <td style={{ padding: '0.5rem' }}>{r.spec}</td>
                        <td style={{ padding: '0.5rem' }}>{r.unit}</td>
                        <td style={{ padding: '0.5rem', textAlign: 'right' }}>
                          {typeof r.price === 'number' ? r.price.toLocaleString() : r.price}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
