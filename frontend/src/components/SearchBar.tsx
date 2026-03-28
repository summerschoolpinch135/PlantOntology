import { Search } from 'lucide-react'

interface Props {
  value: string
  onChange: (v: string) => void
  total: number
  loading: boolean
}

export default function SearchBar({ value, onChange, total, loading }: Props) {
  return (
    <div className="search-header">
      <div className="search-input-wrap">
        <Search size={16} />
        <input
          className="search-input"
          type="search"
          placeholder="한국명, 학명, 영명으로 검색..."
          value={value}
          onChange={e => onChange(e.target.value)}
          autoComplete="off"
        />
      </div>
      <div className="results-count">
        {loading ? (
          <span>검색 중...</span>
        ) : (
          <span><strong>{total.toLocaleString()}</strong>종 검색됨</span>
        )}
      </div>
    </div>
  )
}
