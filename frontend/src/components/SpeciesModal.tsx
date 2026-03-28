import { useEffect } from 'react'
import { X, Leaf, Ruler, Droplets, MapPin, Calendar } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import type { Species } from '../types'
import ToleranceBar from './ToleranceBar'

interface Props {
  species: Species | null
  onClose: () => void
}

const PLANT_ICONS: Record<string, string> = {
  교목: '🌳',
  관목: '🌿',
  지피: '🌱',
  초화: '🌸',
}

const MONTH_KO = ['1월','2월','3월','4월','5월','6월','7월','8월','9월','10월','11월','12월']

export default function SpeciesModal({ species: s, onClose }: Props) {
  // ESC 키로 닫기
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  // 배경 스크롤 잠금
  useEffect(() => {
    if (s) document.body.style.overflow = 'hidden'
    else document.body.style.overflow = ''
    return () => { document.body.style.overflow = '' }
  }, [s])

  return (
    <AnimatePresence>
      {s && (
        <motion.div
          className="modal-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
        >
          <motion.div
            className="modal-panel"
            initial={{ opacity: 0, y: 40, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.97 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
          >
            {/* 닫기 버튼 */}
            <button className="modal-close-btn" onClick={onClose} aria-label="닫기">
              <X size={16} />
            </button>

            {/* 히어로 */}
            <div className="modal-hero">
              <div className="modal-hero-top">
                <span className="modal-plant-icon">
                  {PLANT_ICONS[s.plant_type ?? ''] ?? '🌿'}
                </span>
                <div className="modal-title-group">
                  <div className="modal-korean-name">{s.korean_name || s.scientific_name}</div>
                  <div className="modal-sci-name">{s.scientific_name}</div>
                  {s.english_name && (
                    <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>
                      {s.english_name}
                    </div>
                  )}
                  <div className="modal-badges">
                    {s.plant_type && <span className="badge badge-type">{s.plant_type}</span>}
                    {s.evergreen != null && (
                      <span className={`badge ${s.evergreen ? 'badge-evergreen' : 'badge-deciduous'}`}>
                        {s.evergreen ? '🌿 상록' : '🍂 낙엽'}
                      </span>
                    )}
                    {s.climate_zones.slice(0, 3).map(z => (
                      <span key={z} className="badge badge-zone">{z}</span>
                    ))}
                    {s.climate_zones.length > 3 && (
                      <span className="badge badge-zone">+{s.climate_zones.length - 3}</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* 바디 */}
            <div className="modal-body">

              {/* 기본 정보 */}
              <div>
                <div className="modal-section-title">기본 정보</div>
                <div className="info-grid">
                  <div>
                    {s.family && (
                      <div className="info-row">
                        <span className="lbl"><Leaf size={12} style={{display:'inline',marginRight:4}}/>과</span>
                        <span className="val">{s.family}</span>
                      </div>
                    )}
                    {s.genus && (
                      <div className="info-row">
                        <span className="lbl">속</span>
                        <span className="val" style={{fontStyle:'italic'}}>{s.genus}</span>
                      </div>
                    )}
                    {s.origin && (
                      <div className="info-row">
                        <span className="lbl"><MapPin size={12} style={{display:'inline',marginRight:4}}/>원산지</span>
                        <span className="val">{s.origin}</span>
                      </div>
                    )}
                    {s.growth_rate && (
                      <div className="info-row">
                        <span className="lbl">생장속도</span>
                        <span className="val">{s.growth_rate}</span>
                      </div>
                    )}
                  </div>
                  <div>
                    {(s.height_min_m != null || s.height_max_m != null) && (
                      <div className="info-row">
                        <span className="lbl"><Ruler size={12} style={{display:'inline',marginRight:4}}/>수고</span>
                        <span className="val">
                          {s.height_min_m != null && s.height_max_m != null
                            ? `${s.height_min_m}–${s.height_max_m}m`
                            : `${s.height_max_m ?? s.height_min_m}m`}
                        </span>
                      </div>
                    )}
                    {(s.spread_min_m != null || s.spread_max_m != null) && (
                      <div className="info-row">
                        <span className="lbl">수관폭</span>
                        <span className="val">
                          {s.spread_min_m != null && s.spread_max_m != null
                            ? `${s.spread_min_m}–${s.spread_max_m}m`
                            : `${s.spread_max_m ?? s.spread_min_m}m`}
                        </span>
                      </div>
                    )}
                    {s.soil_preference && (
                      <div className="info-row">
                        <span className="lbl">토양</span>
                        <span className="val">{s.soil_preference}</span>
                      </div>
                    )}
                    {s.flower_color && (
                      <div className="info-row">
                        <span className="lbl">꽃색</span>
                        <span className="val">{s.flower_color}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* 개화·결실 시기 */}
              {(s.flowering_months.length > 0 || s.fruit_months.length > 0) && (
                <div>
                  <div className="modal-section-title">
                    <Calendar size={13} style={{display:'inline',marginRight:6}}/>개화·결실 시기
                  </div>
                  {s.flowering_months.length > 0 && (
                    <div className="info-row">
                      <span className="lbl">개화</span>
                      <span className="val">
                        {s.flowering_months.map(m => MONTH_KO[m - 1]).join(', ')}
                      </span>
                    </div>
                  )}
                  {s.fruit_months.length > 0 && (
                    <div className="info-row">
                      <span className="lbl">결실</span>
                      <span className="val">
                        {s.fruit_months.map(m => MONTH_KO[m - 1]).join(', ')}
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* 내성 지표 */}
              <div>
                <div className="modal-section-title">환경 내성</div>
                <div className="tolerance-grid">
                  <ToleranceBar label="내건성" value={s.drought_tolerance} type="drought" />
                  <ToleranceBar label="내한성" value={s.cold_tolerance} type="cold" />
                  <ToleranceBar label="내음성" value={s.shade_tolerance} type="shade" />
                  <ToleranceBar label="내공해성" value={s.pollution_tolerance} type="pollution" />
                  <ToleranceBar label="관리난이도" value={s.maintenance_level} type="maintenance" />
                </div>
              </div>

              {/* 탄소 흡수량 */}
              {s.carbon_sequestration_kg_yr != null && (
                <div>
                  <div className="modal-section-title">
                    <Droplets size={13} style={{display:'inline',marginRight:6}}/>탄소 흡수
                  </div>
                  <div className="carbon-highlight">
                    <div>
                      <div className="carbon-num">
                        {s.carbon_sequestration_kg_yr.toFixed(1)}
                      </div>
                      <div className="carbon-unit">kg CO₂ / 년</div>
                    </div>
                    <div style={{ fontSize: 13, color: 'var(--primary-lighter)', lineHeight: 1.5 }}>
                      연간 탄소 흡수량<br />
                      <span style={{ fontWeight: 700 }}>
                        {(s.carbon_sequestration_kg_yr / 1000).toFixed(3)} 톤 CO₂/년
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* 조경 활용처 */}
              {s.landscape_uses.length > 0 && (
                <div>
                  <div className="modal-section-title">조경 활용처</div>
                  <div className="tag-cloud">
                    {s.landscape_uses.map((u, i) => (
                      <span key={i} className="tag-pill landscape">{u}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* 생태 태그 */}
              {s.ecological_tags && s.ecological_tags.length > 0 && (
                <div>
                  <div className="modal-section-title">생태 특성</div>
                  <div className="tag-cloud">
                    {s.ecological_tags.map((t, i) => (
                      <span key={i} className="tag-pill ecological">{t}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* 한국 재배 범위 */}
              {s.korean_cultivation_scope && (
                <div className="info-row">
                  <span className="lbl" style={{ fontSize: 13 }}>재배 범위</span>
                  <span className="val" style={{ fontSize: 13 }}>{s.korean_cultivation_scope}</span>
                </div>
              )}

              {/* 설명 */}
              {s.description_ko && (
                <div>
                  <div className="modal-section-title">설명</div>
                  <p className="description-text">{s.description_ko}</p>
                </div>
              )}

            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
