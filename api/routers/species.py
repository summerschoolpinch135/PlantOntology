"""Species router — JSON 파일 기반 검색/상세/통계 엔드포인트."""

from __future__ import annotations

import json
import os
from pathlib import Path
from typing import Any, Optional

from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel

router = APIRouter()

# ──────────────────────────────────────────────
# 데이터 로드 (앱 시작 시 1회)
# ──────────────────────────────────────────────

_SPECIES_CACHE: list[dict[str, Any]] = []
_LOADED = False


def _get_data_dir() -> Path:
    """data/species 디렉토리 경로를 반환한다."""
    this_file = Path(__file__).resolve()
    # api/routers/species.py → project_root/data/species
    project_root = this_file.parent.parent.parent
    return project_root / "data" / "species"


def _load_all_species() -> list[dict[str, Any]]:
    """모든 JSON 파일을 읽어 단일 리스트로 반환한다."""
    data_dir = _get_data_dir()
    all_species: list[dict[str, Any]] = []

    if not data_dir.exists():
        return all_species

    for json_file in sorted(data_dir.glob("*.json")):
        try:
            with open(json_file, encoding="utf-8") as f:
                raw = json.load(f)
        except Exception:
            continue

        # GBIF 파일: {"metadata": {...}, "species": [...]}
        if isinstance(raw, dict) and "species" in raw:
            records = raw["species"]
        # 일반 파일: [{...}, ...]
        elif isinstance(raw, list):
            records = raw
        else:
            continue

        for rec in records:
            if isinstance(rec, dict) and rec.get("id"):
                all_species.append(rec)

    return all_species


def get_cache() -> list[dict[str, Any]]:
    """캐시를 반환하며, 아직 로드되지 않았으면 로드한다."""
    global _SPECIES_CACHE, _LOADED
    if not _LOADED:
        _SPECIES_CACHE = _load_all_species()
        _LOADED = True
    return _SPECIES_CACHE


# ──────────────────────────────────────────────
# 응답 모델
# ──────────────────────────────────────────────


class PageInfo(BaseModel):
    total: int
    limit: int
    offset: int
    has_next: bool
    has_prev: bool


class SearchResponse(BaseModel):
    total: int
    results: list[dict[str, Any]]
    page_info: PageInfo


class StatsResponse(BaseModel):
    total: int
    by_plant_type: dict[str, int]
    by_climate_zone: dict[str, int]
    by_evergreen: dict[str, int]
    top_carbon_sequestration: list[dict[str, Any]]


# ──────────────────────────────────────────────
# 필터 헬퍼
# ──────────────────────────────────────────────


def _matches(
    sp: dict[str, Any],
    q: Optional[str],
    plant_type: Optional[str],
    climate_zone: Optional[str],
    drought_tolerance_min: Optional[int],
    cold_tolerance_min: Optional[int],
    shade_tolerance_min: Optional[int],
    evergreen: Optional[bool],
    landscape_use: Optional[str],
    height_max: Optional[float],
) -> bool:
    # 텍스트 검색
    if q:
        q_lower = q.lower()
        haystack = " ".join(
            filter(
                None,
                [
                    sp.get("korean_name", ""),
                    sp.get("scientific_name", ""),
                    sp.get("english_name", ""),
                ],
            )
        ).lower()
        if q_lower not in haystack:
            return False

    # 식물 유형
    if plant_type and sp.get("plant_type") != plant_type:
        return False

    # 기후존
    if climate_zone:
        zones = sp.get("climate_zones") or []
        if climate_zone not in zones:
            return False

    # 내성 최소값
    if drought_tolerance_min is not None:
        if (sp.get("drought_tolerance") or 0) < drought_tolerance_min:
            return False
    if cold_tolerance_min is not None:
        if (sp.get("cold_tolerance") or 0) < cold_tolerance_min:
            return False
    if shade_tolerance_min is not None:
        if (sp.get("shade_tolerance") or 0) < shade_tolerance_min:
            return False

    # 상록 여부
    if evergreen is not None:
        if sp.get("evergreen") != evergreen:
            return False

    # 조경 활용처
    if landscape_use:
        uses = sp.get("landscape_uses") or []
        # 리스트 항목이 문자열인 경우와 영문 slug 비교 모두 처리
        if not any(landscape_use.lower() in str(u).lower() for u in uses):
            return False

    # 최대 수고
    if height_max is not None:
        h_min = sp.get("height_min_m")
        if h_min is not None and h_min > height_max:
            return False

    return True


# ──────────────────────────────────────────────
# 엔드포인트
# ──────────────────────────────────────────────


@router.get("/stats", response_model=StatsResponse)
async def get_stats():
    """전체 통계: 총 종 수, 식물 유형별, 기후존별, 탄소 흡수 Top 10."""
    cache = get_cache()

    by_type: dict[str, int] = {}
    by_zone: dict[str, int] = {}
    by_eg: dict[str, int] = {"상록": 0, "낙엽": 0, "미확인": 0}

    for sp in cache:
        pt = sp.get("plant_type") or "기타"
        by_type[pt] = by_type.get(pt, 0) + 1

        for zone in sp.get("climate_zones") or []:
            by_zone[zone] = by_zone.get(zone, 0) + 1

        eg = sp.get("evergreen")
        if eg is True:
            by_eg["상록"] += 1
        elif eg is False:
            by_eg["낙엽"] += 1
        else:
            by_eg["미확인"] += 1

    top_carbon = sorted(
        [
            {
                "id": sp.get("id"),
                "korean_name": sp.get("korean_name"),
                "scientific_name": sp.get("scientific_name"),
                "carbon_sequestration_kg_yr": sp.get("carbon_sequestration_kg_yr"),
            }
            for sp in cache
            if sp.get("carbon_sequestration_kg_yr")
        ],
        key=lambda x: x["carbon_sequestration_kg_yr"] or 0,
        reverse=True,
    )[:10]

    return StatsResponse(
        total=len(cache),
        by_plant_type=by_type,
        by_climate_zone=by_zone,
        by_evergreen=by_eg,
        top_carbon_sequestration=top_carbon,
    )


@router.get("/search", response_model=SearchResponse)
async def search_species(
    q: Optional[str] = Query(None, description="한국명/학명/영명 검색"),
    plant_type: Optional[str] = Query(None, description="교목|관목|지피|초화"),
    climate_zone: Optional[str] = Query(None, description="기후존 코드 (예: KR-6a)"),
    drought_tolerance_min: Optional[int] = Query(None, ge=1, le=5, description="내건성 최소값 1-5"),
    cold_tolerance_min: Optional[int] = Query(None, ge=1, le=5, description="내한성 최소값 1-5"),
    shade_tolerance_min: Optional[int] = Query(None, ge=1, le=5, description="내음성 최소값 1-5"),
    evergreen: Optional[bool] = Query(None, description="상록 여부 true|false"),
    landscape_use: Optional[str] = Query(None, description="조경활용처 (예: street-tree)"),
    height_max: Optional[float] = Query(None, description="최대 수고(m)"),
    limit: int = Query(20, ge=1, le=200),
    offset: int = Query(0, ge=0),
):
    """종 검색 — 다중 필터 조합 지원."""
    cache = get_cache()

    filtered = [
        sp
        for sp in cache
        if _matches(
            sp,
            q,
            plant_type,
            climate_zone,
            drought_tolerance_min,
            cold_tolerance_min,
            shade_tolerance_min,
            evergreen,
            landscape_use,
            height_max,
        )
    ]

    total = len(filtered)
    page = filtered[offset : offset + limit]

    return SearchResponse(
        total=total,
        results=page,
        page_info=PageInfo(
            total=total,
            limit=limit,
            offset=offset,
            has_next=(offset + limit) < total,
            has_prev=offset > 0,
        ),
    )


@router.get("/{species_id}")
async def get_species(species_id: str):
    """단일 종 상세 정보."""
    cache = get_cache()
    for sp in cache:
        if sp.get("id") == species_id:
            return sp
    raise HTTPException(status_code=404, detail=f"Species '{species_id}' not found")
