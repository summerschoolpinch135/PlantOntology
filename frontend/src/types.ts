// ── 종 데이터 타입 ──────────────────────────────────────────────────────

export interface Species {
  id: string
  scientific_name: string
  korean_name: string
  english_name: string | null
  family: string | null
  genus: string | null
  plant_type: string | null
  origin: string | null
  height_min_m: number | null
  height_max_m: number | null
  spread_min_m: number | null
  spread_max_m: number | null
  growth_rate: string | null
  evergreen: boolean | null
  flower_color: string | null
  flowering_months: number[]
  fruit_months: number[]
  fall_color: string | null
  drought_tolerance: number | null
  cold_tolerance: number | null
  shade_tolerance: number | null
  pollution_tolerance: number | null
  maintenance_level: number | null
  carbon_sequestration_kg_yr: number | null
  landscape_uses: string[]
  soil_preference: string | null
  climate_zones: string[]
  description_ko: string | null
  ecological_tags: string[]
  korean_cultivation_scope: string | null
  gbif_taxon_key: number | null
  taxonomic_status: string | null
  source: string | null
  data_quality_tier: string | null
}

// ── API 응답 타입 ──────────────────────────────────────────────────────

export interface PageInfo {
  total: number
  limit: number
  offset: number
  has_next: boolean
  has_prev: boolean
}

export interface SearchResponse {
  total: number
  results: Species[]
  page_info: PageInfo
}

export interface StatsResponse {
  total: number
  by_plant_type: Record<string, number>
  by_climate_zone: Record<string, number>
  by_evergreen: Record<string, number>
  top_carbon_sequestration: Array<{
    id: string
    korean_name: string
    scientific_name: string
    carbon_sequestration_kg_yr: number
  }>
}

// ── 검색 필터 상태 ──────────────────────────────────────────────────────

export interface SearchFilters {
  q: string
  plant_types: string[]
  climate_zone: string
  drought_tolerance_min: number
  cold_tolerance_min: number
  shade_tolerance_min: number
  evergreen: '' | 'true' | 'false'
  landscape_use: string
  height_max: string
}

// ── 탄소 계산기 ──────────────────────────────────────────────────────

export interface CalcEntry {
  species: Species
  count: number
}

// ── 보조 데이터 (Supplementary Data) ──────────────────────────────────

export interface Nursery {
  farm_name: string
  address: string
  main_species: string
  matched_species_ids?: string[]
  [key: string]: any
}

export interface Drawing {
  code: string
  filename: string
  category: string
  format: string
  [key: string]: any
}

export interface ClimateIndicator {
  korean_name: string
  scientific_name: string
  [key: string]: any
}

export interface MaterialPrice {
  name: string
  spec: string
  price: number | string
  unit: string
  [key: string]: any
}

export interface SupplementaryListResponse<T> {
  total: number
  results: T[]
  page_info?: PageInfo
  source?: string
  date?: string
}

