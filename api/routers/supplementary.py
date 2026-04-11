"""Supplementary data endpoints — nurseries, drawings, climate indicators, prices."""

from __future__ import annotations

import json
from functools import lru_cache
from pathlib import Path
from typing import Any, Optional

from fastapi import APIRouter, Query

router = APIRouter()

_ROOT = Path(__file__).resolve().parent.parent.parent


@lru_cache(maxsize=1)
def _load_nurseries() -> list[dict[str, Any]]:
    p = _ROOT / "data" / "nurseries" / "nursery_farms.json"
    return json.loads(p.read_text(encoding="utf-8")) if p.exists() else []


@lru_cache(maxsize=1)
def _load_drawings() -> list[dict[str, Any]]:
    p = _ROOT / "data" / "standard_drawings_index.json"
    return json.loads(p.read_text(encoding="utf-8")) if p.exists() else []


@lru_cache(maxsize=1)
def _load_climate_indicators() -> list[dict[str, Any]]:
    p = _ROOT / "data" / "species" / "climate_indicators_2024.json"
    return json.loads(p.read_text(encoding="utf-8")) if p.exists() else []


@lru_cache(maxsize=1)
def _load_material_prices() -> list[dict[str, Any]]:
    p = _ROOT / "data" / "regulations" / "material_prices_2026.json"
    return json.loads(p.read_text(encoding="utf-8")) if p.exists() else []


# ── Nurseries ─────────────────────────────────────────────────────────────────

@router.get("/nurseries")
async def list_nurseries(
    q: Optional[str] = Query(None, description="농장명/주소/수종 검색"),
    species_id: Optional[str] = Query(None, description="PlantOntology 종 ID 필터"),
    limit: int = Query(50, ge=1, le=500),
    offset: int = Query(0, ge=0),
):
    """전국 조경수 농가 목록 — 수종 매칭 포함."""
    data = _load_nurseries()
    if q:
        q_lower = q.lower()
        data = [
            f for f in data
            if q_lower in (f.get("farm_name") or "").lower()
            or q_lower in (f.get("address") or "").lower()
            or q_lower in (f.get("main_species") or "").lower()
        ]
    if species_id:
        data = [f for f in data if species_id in (f.get("matched_species_ids") or [])]
    total = len(data)
    return {
        "total": total,
        "results": data[offset: offset + limit],
        "page_info": {"total": total, "limit": limit, "offset": offset},
    }


@router.get("/nurseries/{idx}")
async def get_nursery(idx: int):
    """특정 농가 상세 정보 (0-based index)."""
    from fastapi import HTTPException
    data = _load_nurseries()
    if idx < 0 or idx >= len(data):
        raise HTTPException(status_code=404, detail="Nursery not found")
    return data[idx]


# ── Standard Drawings ─────────────────────────────────────────────────────────

@router.get("/drawings")
async def list_drawings(
    q: Optional[str] = Query(None, description="도면 코드/파일명/카테고리 검색"),
    category: Optional[str] = Query(None, description="카테고리 필터"),
    format: Optional[str] = Query(None, description="DWG|PDF"),
    limit: int = Query(50, ge=1, le=500),
    offset: int = Query(0, ge=0),
):
    """표준상세도(조경) 2023.1 도면 목록."""
    data = _load_drawings()
    if q:
        q_lower = q.lower()
        data = [
            d for d in data
            if q_lower in (d.get("code") or "").lower()
            or q_lower in (d.get("filename") or "").lower()
            or q_lower in (d.get("category") or "").lower()
        ]
    if category:
        data = [d for d in data if d.get("category") == category]
    if format:
        data = [d for d in data if d.get("format", "").upper() == format.upper()]
    total = len(data)
    return {
        "total": total,
        "results": data[offset: offset + limit],
        "page_info": {"total": total, "limit": limit, "offset": offset},
    }


# ── Climate Indicators ────────────────────────────────────────────────────────

@router.get("/climate-indicators")
async def list_climate_indicators(
    q: Optional[str] = Query(None, description="한국명/학명 검색"),
    limit: int = Query(100, ge=1, le=200),
    offset: int = Query(0, ge=0),
):
    """국가 기후변화 생물지표종 100종 (2024)."""
    data = _load_climate_indicators()
    if q:
        q_lower = q.lower()
        data = [
            d for d in data
            if q_lower in (d.get("korean_name") or "").lower()
            or q_lower in (d.get("scientific_name") or "").lower()
        ]
    total = len(data)
    return {
        "total": total,
        "results": data[offset: offset + limit],
        "source": "국가 기후변화 생물지표종 100종 (2024)",
    }


# ── Material Prices ───────────────────────────────────────────────────────────

@router.get("/prices")
async def list_material_prices(
    q: Optional[str] = Query(None, description="자재명 검색"),
    limit: int = Query(50, ge=1, le=500),
    offset: int = Query(0, ge=0),
):
    """조경 자재 단가 목록 (2026.02.02 기준)."""
    data = _load_material_prices()
    if q:
        q_lower = q.lower()
        data = [
            d for d in data
            if q_lower in (d.get("name") or "").lower()
            or q_lower in (d.get("spec") or "").lower()
        ]
    total = len(data)
    return {
        "total": total,
        "results": data[offset: offset + limit],
        "date": "2026-02-02",
        "source": "나라장터 표준시장단가",
    }
