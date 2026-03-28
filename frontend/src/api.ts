import type { SearchFilters, SearchResponse, Species, StatsResponse } from './types'

const API_BASE = import.meta.env.VITE_API_URL || ''

async function fetchJSON<T>(url: string): Promise<T> {
  const res = await fetch(url)
  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText)
    throw new Error(`API ${res.status}: ${text}`)
  }
  return res.json() as Promise<T>
}

function buildQuery(params: Record<string, string | number | boolean | undefined | null>): string {
  const sp = new URLSearchParams()
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== null && v !== '') {
      sp.append(k, String(v))
    }
  }
  const s = sp.toString()
  return s ? `?${s}` : ''
}

export async function searchSpecies(
  filters: SearchFilters,
  limit = 20,
  offset = 0,
): Promise<SearchResponse> {
  const params: Record<string, string | number | boolean | undefined | null> = {
    limit,
    offset,
  }

  if (filters.q) params.q = filters.q
  if (filters.plant_types.length === 1) params.plant_type = filters.plant_types[0]
  if (filters.climate_zone) params.climate_zone = filters.climate_zone
  if (filters.drought_tolerance_min > 1) params.drought_tolerance_min = filters.drought_tolerance_min
  if (filters.cold_tolerance_min > 1) params.cold_tolerance_min = filters.cold_tolerance_min
  if (filters.shade_tolerance_min > 1) params.shade_tolerance_min = filters.shade_tolerance_min
  if (filters.evergreen === 'true') params.evergreen = true
  if (filters.evergreen === 'false') params.evergreen = false
  if (filters.landscape_use) params.landscape_use = filters.landscape_use
  if (filters.height_max) params.height_max = Number(filters.height_max)

  return fetchJSON<SearchResponse>(`${API_BASE}/species/search${buildQuery(params)}`)
}

export async function getSpecies(id: string): Promise<Species> {
  return fetchJSON<Species>(`${API_BASE}/species/${encodeURIComponent(id)}`)
}

export async function getStats(): Promise<StatsResponse> {
  return fetchJSON<StatsResponse>(`${API_BASE}/species/stats`)
}

export async function searchByQuery(q: string, limit = 10): Promise<Species[]> {
  const res = await fetchJSON<SearchResponse>(
    `${API_BASE}/species/search${buildQuery({ q, limit })}`,
  )
  return res.results
}
